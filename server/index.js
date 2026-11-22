import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { encode } from "gpt-tokenizer";
import nodemailer from "nodemailer";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const app = express();
const PORT = Number(process.env.PORT || 5001);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopease";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : randomBytes(32).toString("hex"));
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before starting in production.");
}
if (process.env.NODE_ENV === "production" && JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

// Vercel sits behind a proxy; trust it so rate limiting sees real client IPs.
if (process.env.VERCEL) app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(passport.initialize());

// Connect (and seed) once per process. On Vercel each serverless instance
// reuses this promise across requests instead of reconnecting every time.
let databaseReady;
const connectDatabase = () => {
  databaseReady ||= mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => seedDatabase())
    .catch((error) => {
      databaseReady = undefined;
      throw error;
    });
  return databaseReady;
};
app.use(async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(503).json({ message: "The database is unavailable right now. Please try again shortly." });
  }
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const SMTP_CONFIGURED = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
);
const emailTransport = SMTP_CONFIGURED
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const productSchema = new mongoose.Schema({
  externalId: { type: Number, unique: true },
  title: String,
  description: String,
  category: String,
  price: Number,
  image: String,
  rating: { rate: Number, count: Number },
  stock: Number,
  brand: String,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  name: { firstname: String, lastname: String },
  phone: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  lastLogin: Date,
  disabled: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationTokenHash: String,
  emailVerificationExpires: Date,
  passwordResetTokenHash: String,
  passwordResetExpires: Date,
  passwordResetAttempts: { type: Number, default: 0 },
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

const cartItemSchema = new mongoose.Schema({
  productId: Number,
  title: String,
  description: String,
  category: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
  addedBy: String,
  customerEmail: String,
  customerPhone: String,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerAddress: String,
  items: [{ id: Number, title: String, price: Number, quantity: Number, image: String }],
  total: Number,
  status: { type: String, default: "pending" },
  addedBy: String,
}, { timestamps: true });

const chatUsageSchema = new mongoose.Schema({
  _id: { type: String },
  tokensUsed: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
}, { versionKey: false });

const oauthGrantSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false });

const oauthStateSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false });

const Product = mongoose.model("Product", productSchema);
const User = mongoose.model("User", userSchema);
const CartItem = mongoose.model("CartItem", cartItemSchema);
const Order = mongoose.model("Order", orderSchema);
const ChatUsage = mongoose.model("ChatUsage", chatUsageSchema);
const OAuthGrant = mongoose.model("OAuthGrant", oauthGrantSchema);
const OAuthState = mongoose.model("OAuthState", oauthStateSchema);
const CHAT_TOKEN_LIMIT = 1000;
const CHAT_LIMIT_MESSAGE = "Your tokens have run short. Please recharge or contact admin / try again later.";

const createToken = (user) => jwt.sign(
  {
    id: user._id,
    role: user.role,
    username: user.username,
    tokenVersion: user.tokenVersion || 0,
  },
  JWT_SECRET,
  { expiresIn: "12h" },
);

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
  const user = await User.findById(req.user.id).select("role disabled tokenVersion");
  if (
    !user ||
    user.disabled ||
    Number(req.user.tokenVersion || 0) !== Number(user.tokenVersion || 0)
  ) {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
  req.user.role = user.role;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required." });
  next();
};

const createAuthRateLimit = (limit, message) => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message },
});
const signupRateLimit = createAuthRateLimit(
  5,
  "Too many signup attempts. Please try again later.",
);
const loginRateLimit = createAuthRateLimit(
  8,
  "Unable to sign in with those details. Please try again later.",
);
const passwordRecoveryRateLimit = createAuthRateLimit(
  5,
  "Too many password recovery attempts. Please try again later.",
);
const oauthExchangeRateLimit = createAuthRateLimit(
  8,
  "Too many sign-in attempts. Please try again later.",
);
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 2,
  delayMs: (hits) => Math.min((hits - 2) * 500, 10000),
  maxDelayMs: 10000,
});

const hashSecret = (value) => createHash("sha256").update(value).digest("hex");

const sendEmail = async ({ to, subject, text, html }) => {
  if (!emailTransport) {
    const error = new Error("Email delivery is not configured.");
    error.status = 503;
    throw error;
  }
  await emailTransport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

const createEmailToken = () => randomBytes(32).toString("hex");

const createOAuthUsername = async () => {
  let username;
  do {
    username = `Shop${Array.from(randomBytes(8), (byte) =>
      String.fromCharCode(65 + (byte % 26)),
    ).join("")}`;
  } while (await User.exists({ username }));
  return username;
};

const findOrCreateOAuthUser = async ({ email, firstName, lastName }) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("OAuth provider did not return a valid email address.");
  }
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });
  if (user && !user.emailVerified) {
    throw new Error("Verify this email through the existing ShopEase account first.");
  }
  if (!user) {
    user = await User.create({
      username: await createOAuthUsername(),
      email: normalizedEmail,
      password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
      name: { firstname: firstName || "", lastname: lastName || "" },
      phone: "N/A",
      emailVerified: true,
    });
  }
  if (user.disabled) throw new Error("This account is unavailable.");
  return user;
};

const saveOAuthGrant = async (user) => {
  const code = createEmailToken();
  await OAuthGrant.create({
    tokenHash: hashSecret(code),
    userId: user._id,
    expiresAt: new Date(Date.now() + 60 * 1000),
  });
  return code;
};

const startOAuth = (provider, options) => async (_req, res, next) => {
  try {
    const state = createEmailToken();
    await OAuthState.create({
      tokenHash: hashSecret(state),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    passport.authenticate(provider, { ...options, state })(_req, res, next);
  } catch (error) {
    next(error);
  }
};

const consumeOAuthState = async (req, res, next) => {
  try {
    const state = req.query.state;
    if (typeof state !== "string" || state.length !== 64) {
      return res.redirect(`${FRONTEND_URL}/login?oauthError=state`);
    }
    const validState = await OAuthState.findOneAndDelete({
      tokenHash: hashSecret(state),
      expiresAt: { $gt: new Date() },
    });
    if (!validState) return res.redirect(`${FRONTEND_URL}/login?oauthError=state`);
    next();
  } catch (error) {
    next(error);
  }
};

const createChatSessionKey = (sessionId) =>
  createHash("sha256").update(sessionId).digest("hex");

async function getShopEaseReply(question) {
  const text = question.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const has = (pattern) => pattern.test(text);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(text)) {
    return "Hi! I can help you find products, check prices and categories, or explain how to use your cart, checkout, or account. What are you looking for?";
  }
  if (has(/\b(thank you|thanks|thx)\b/)) return "You’re welcome! Is there anything else about ShopEase I can help with?";
  if (has(/\b(bye|goodbye|see you)\b/)) return "Thanks for visiting ShopEase. Come back any time you need help!";

  if (has(/\b(category|categories|department|departments|kinds of items|types of items)\b/)) {
    const categories = await Product.distinct("category");
    return categories.length
      ? `ShopEase currently has these product categories: ${categories.filter(Boolean).sort().join(", ")}.`
      : "I couldn’t load the product categories right now. Please try again shortly.";
  }
  if (has(/\b(cart|basket|add to cart|remove from cart|change quantity)\b/)) {
    return "To add an item, open Products, choose a product, and select Add to Cart. Use the cart icon in the navigation to review items, change quantities, or remove them before checkout.";
  }
  if (has(/\b(check ?out|order|buy|purchase|payment|pay|place an order|delivery address)\b/)) {
    return "To place an order, add products to your cart, open the cart, and continue to Checkout. Enter your contact and delivery details to submit it.";
  }
  if (has(/\b(track|tracking|where is my|order status|delivery status|shipping|ship|arrive|delivery time)\b/)) {
    return "ShopEase currently lets you submit an order at Checkout. Order tracking and delivery estimates aren’t available in the website yet. For an order you already placed, please contact the ShopEase store administrator.";
  }
  if (has(/\b(return|refund|exchange|cancel)\b/)) {
    return "Returns, refunds, and order cancellations aren’t currently managed through the ShopEase website. Please contact the ShopEase store administrator for help with an existing order.";
  }
  if (has(/\b(login|log in|sign ?in|account|register|sign ?up|create an account|password)\b/)) {
    return "Use Login to access your account, or Sign up to create one. You can find both options in the navigation. If you have an account-access problem, please contact the ShopEase administrator.";
  }
  if (has(/\b(admin|administrator)\b/)) {
    return "Administrators can sign in at /admin/login. The admin dashboard and user directory require an administrator account.";
  }
  if (has(/\b(help|what can you do|how can you help|support)\b/)) {
    return "I can help you find products by name or category, compare listed prices, find low-priced items, and explain cart, checkout, account, and admin features. Try asking “Do you have coffee?” or “How do I place an order?”";
  }

  const products = await Product.find({}, "title category description price stock").lean();
  const mentionedProduct = products.some((product) =>
    `${product.title} ${product.category}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .some((word) => word.length > 3 && text.includes(word)),
  );
  const productQuestion = /\b(product|products|item|items|price|cost|cheap|cheapest|expensive|recommend|recommendation|catalog|sell|selling|stock|available|looking for|want to buy|do you have|what do you have|what is for sale|show me|find|search|how much)\b/.test(text);

  if (productQuestion || mentionedProduct) {
    if (!products.length) return "I can’t access the product list right now. Please try again shortly or browse the Products page.";

    if (has(/\b(cheap|cheapest|lowest price|affordable|inexpensive)\b/)) {
      return `Here are some of the lowest-priced items in the catalog:\n${products.sort((a, b) => a.price - b.price).slice(0, 5).map((product) => `${product.title} — $${Number(product.price).toFixed(2)}`).join("\n")}`;
    }
    if (has(/\b(expensive|highest price|most expensive)\b/)) {
      return `Here are some of the highest-priced items in the catalog:\n${products.sort((a, b) => b.price - a.price).slice(0, 5).map((product) => `${product.title} — $${Number(product.price).toFixed(2)}`).join("\n")}`;
    }

    const ignoredTerms = new Set([
      "products", "product", "items", "item", "price", "prices", "cost", "cheap",
      "cheapest", "expensive", "recommend", "recommendation", "catalog", "sell",
      "selling", "stock", "available", "looking", "want", "buy", "have", "show",
      "find", "search", "what", "which", "list", "please", "tell", "about", "the",
      "for", "are", "there", "some", "any", "good", "best", "hello", "hi", "need",
      "you", "your", "does", "with", "from", "much", "this",
    ]);
    const terms = text.split(" ").filter((word) => word.length > 2 && !ignoredTerms.has(word));
    const matches = products.filter((product) =>
      terms.some((term) =>
        `${product.title} ${product.category}`.toLowerCase().split(/[^a-z0-9]+/).includes(term),
      ),
    );
    if (matches.length) {
      return matches.slice(0, 4)
        .map((product) => `${product.title} — $${Number(product.price).toFixed(2)}${product.category ? ` (${product.category})` : ""}`)
        .join("\n");
    }
    if (productQuestion) {
      const categories = await Product.distinct("category");
      return `I couldn’t find a close match for “${question.trim()}”. Try another product name or browse the Products page. The catalog has ${products.length} products${categories.length ? ` in ${categories.length} categories` : ""}.`;
    }
  }

  return "I can only help with information about this website.";
}

async function seedDatabase() {
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    try {
      const response = await fetch("https://dummyjson.com/products?limit=100");
      if (response.ok) {
        const data = await response.json();
        await Product.insertMany(data.products.map((product) => ({
          externalId: product.id,
          title: product.title,
          description: product.description,
          category: product.category,
          price: product.price,
          image: product.thumbnail,
          rating: { rate: product.rating, count: product.reviews?.length || 0 },
          stock: product.stock,
          brand: product.brand,
        })));
      }
    } catch (error) {
      console.warn("Product seed was skipped:", error.message);
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@shopease.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin && adminPassword) {
    await User.create({
      username: "admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      name: { firstname: "Admin", lastname: "User" },
      phone: "N/A",
      role: "admin",
      emailVerified: true,
    });
  }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5001/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          if (!profile._json?.email_verified) {
            return done(new Error("Google account email must be verified."));
          }
          const user = await findOrCreateOAuthUser({
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
          process.env.FACEBOOK_CALLBACK_URL ||
          "http://localhost:5001/api/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));

app.get("/api/auth/providers", (_req, res) => {
  res.json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    facebook: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
  });
});

app.get("/api/chat/usage", async (req, res) => {
  const { sessionId } = req.query;
  if (typeof sessionId !== "string" || sessionId.length < 20 || sessionId.length > 100) {
    return res.status(400).json({ message: "A valid chat session is required." });
  }
  const usage = await ChatUsage.findById(createChatSessionKey(sessionId)).lean();
  res.json({ tokensUsed: usage?.tokensUsed ?? 0, tokenLimit: CHAT_TOKEN_LIMIT });
});

app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body;
  if (
    typeof sessionId !== "string" ||
    sessionId.length < 20 ||
    sessionId.length > 100 ||
    typeof message !== "string" ||
    message.trim().length === 0 ||
    message.length > 300
  ) {
    return res.status(400).json({ message: "A valid chat message and session are required." });
  }

  const sessionKey = createChatSessionKey(sessionId);
  await ChatUsage.updateOne(
    { _id: sessionKey },
    { $setOnInsert: { tokensUsed: 0, lastActivity: new Date() } },
    { upsert: true },
  );
  const usage = await ChatUsage.findById(sessionKey).lean();
  if (usage.tokensUsed >= CHAT_TOKEN_LIMIT) {
    return res.json({
      reply: CHAT_LIMIT_MESSAGE,
      tokensUsed: CHAT_TOKEN_LIMIT,
      tokenLimit: CHAT_TOKEN_LIMIT,
      exhausted: true,
    });
  }

  const reply = await getShopEaseReply(message.trim());
  const messageTokens = encode(message.trim()).length + encode(reply).length;
  const newTotal = usage.tokensUsed + messageTokens;

  if (newTotal >= CHAT_TOKEN_LIMIT) {
    const updatedUsage = await ChatUsage.findOneAndUpdate(
      { _id: sessionKey, tokensUsed: { $lt: CHAT_TOKEN_LIMIT } },
      { $set: { tokensUsed: CHAT_TOKEN_LIMIT, lastActivity: new Date() } },
      { new: true },
    ).lean();
    return res.json({
      reply: CHAT_LIMIT_MESSAGE,
      tokensUsed: updatedUsage?.tokensUsed ?? CHAT_TOKEN_LIMIT,
      tokenLimit: CHAT_TOKEN_LIMIT,
      exhausted: true,
    });
  }

  const updatedUsage = await ChatUsage.findOneAndUpdate(
    {
      _id: sessionKey,
      tokensUsed: usage.tokensUsed,
      $expr: { $lte: [{ $add: ["$tokensUsed", messageTokens] }, CHAT_TOKEN_LIMIT - 1] },
    },
    { $inc: { tokensUsed: messageTokens }, $set: { lastActivity: new Date() } },
    { new: true },
  ).lean();

  if (!updatedUsage) {
    const latestUsage = await ChatUsage.findById(sessionKey).lean();
    if (latestUsage.tokensUsed < CHAT_TOKEN_LIMIT) {
      await ChatUsage.findOneAndUpdate(
        { _id: sessionKey, tokensUsed: { $lt: CHAT_TOKEN_LIMIT } },
        { $set: { tokensUsed: CHAT_TOKEN_LIMIT, lastActivity: new Date() } },
      );
    }
    return res.json({
      reply: CHAT_LIMIT_MESSAGE,
      tokensUsed: CHAT_TOKEN_LIMIT,
      tokenLimit: CHAT_TOKEN_LIMIT,
      exhausted: true,
    });
  }

  res.json({
    reply,
    tokensUsed: updatedUsage.tokensUsed,
    tokenLimit: CHAT_TOKEN_LIMIT,
    exhausted: false,
  });
});

app.post("/api/auth/signup", signupRateLimit, async (req, res) => {
  try {
    const { username, email, password, name, phone } = req.body;
    const firstName = String(name?.firstname || "").trim();
    const lastName = String(name?.lastname || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedUsername = String(username || "").trim();
    if (
      !/^[A-Za-z]{4,22}$/.test(normalizedUsername) ||
      !/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(normalizedEmail) ||
      typeof password !== "string" ||
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,128}$/.test(String(password || "")) ||
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(firstName) ||
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(lastName) ||
      normalizedEmail.length > 254 ||
      firstName.length > 50 ||
      lastName.length > 50 ||
      String(phone || "").length > 20 ||
      !/^\+?[0-9()\-\s]{7,20}$/.test(String(phone || "").trim())
    ) {
      return res.status(400).json({ message: "Please check your name, username, Gmail address, phone, and password requirements." });
    }

    const existing = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });
    if (existing) return res.status(409).json({ message: "Username or email already exists." });

    await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      name: { firstname: firstName, lastname: lastName },
      phone: String(phone || "N/A").trim(),
      emailVerified: true,
    });

    res.status(201).json({ message: "Account created. You can now sign in to ShopEase." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Username or email already exists." });
    console.error("Signup failed:", error.message);
    res.status(error.status || 500).json({
      message: error.status ? error.message : "Unable to create the account right now.",
    });
  }
});

app.post("/api/auth/login", loginRateLimit, authSlowDown, async (req, res) => {
  try {
    const { identifier, username, password, rememberMe } = req.body;
    const loginIdentifier = String(identifier || username || "").trim();
    if (
      !loginIdentifier ||
      loginIdentifier.length > 254 ||
      typeof password !== "string" ||
      password.length > 128
    ) {
      return res.status(400).json({ message: "Invalid username/email or password." });
    }

    const user = await User.findOne({
      $or: [
        { username: loginIdentifier },
        { email: loginIdentifier.toLowerCase() },
      ],
    }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username/email or password." });
    }
    if (user.disabled) {
      return res.status(401).json({ message: "Invalid username/email or password." });
    }
    user.emailVerified = true;
    user.lastLogin = new Date();
    await user.save();

    const expiresIn = rememberMe === true ? "7d" : "12h";
    res.json({
      token: jwt.sign(
        {
          id: user._id,
          role: user.role,
          username: user.username,
          tokenVersion: user.tokenVersion || 0,
        },
        JWT_SECRET,
        { expiresIn },
      ),
      expiresIn,
      user: { username: user.username, email: user.email, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).json({ message: "Unable to sign in right now." });
  }
});

app.post("/api/auth/logout", requireAuth, async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
  res.json({ message: "Signed out." });
});

const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const RESET_CODE_MAX_ATTEMPTS = 5;
const hashResetCode = (userId, code) => hashSecret(`${userId}:${code}`);

app.post("/api/auth/forgot-password", passwordRecoveryRateLimit, async (req, res) => {
  const genericMessage =
    "If an account exists for that email, a verification code has been sent to it.";
  const email = String(req.body.email || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  const user = await User.findOne({ email, disabled: { $ne: true } });
  if (user) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    user.passwordResetTokenHash = hashResetCode(user._id, code);
    user.passwordResetExpires = new Date(Date.now() + RESET_CODE_TTL_MS);
    user.passwordResetAttempts = 0;
    await user.save();
    if (!emailTransport) {
      // Demo mode: no SMTP configured, so hand the code back instead of emailing it.
      console.log(`Password reset code for ${user.email}: ${code}`);
      return res.json({ message: "Your verification code is shown below.", demoCode: code });
    }
    try {
      await sendEmail({
        to: user.email,
        subject: "Your ShopEase password reset code",
        text: `Your ShopEase verification code is ${code}. It expires in 10 minutes. If you did not request a password reset, you can ignore this email.`,
        html: `<p>Your ShopEase verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you did not request a password reset, you can ignore this email.</p>`,
      });
    } catch (error) {
      console.error("Password reset email failed:", error.message);
      return res.status(502).json({ message: "Unable to send the verification code right now. Please try again." });
    }
  }
  res.json({ message: genericMessage });
});

app.post("/api/auth/reset-password", passwordRecoveryRateLimit, async (req, res) => {
  const { password } = req.body;
  const email = String(req.body.email || "").trim().toLowerCase();
  const code = String(req.body.code || "").trim();
  const invalidMessage = "The verification code is invalid or expired.";
  if (
    email.length > 254 ||
    !/^\d{6}$/.test(code) ||
    typeof password !== "string" ||
    !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,128}$/.test(password)
  ) {
    return res.status(400).json({ message: "The verification code or new password is invalid." });
  }

  const user = await User.findOne({
    email,
    disabled: { $ne: true },
    passwordResetTokenHash: { $exists: true },
    passwordResetExpires: { $gt: new Date() },
  }).select("_id passwordResetTokenHash passwordResetAttempts");
  if (!user || (user.passwordResetAttempts || 0) >= RESET_CODE_MAX_ATTEMPTS) {
    return res.status(400).json({ message: invalidMessage });
  }

  const expected = Buffer.from(user.passwordResetTokenHash, "hex");
  const actual = Buffer.from(hashResetCode(user._id, code), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    const attempts = (user.passwordResetAttempts || 0) + 1;
    await User.updateOne(
      { _id: user._id },
      attempts >= RESET_CODE_MAX_ATTEMPTS
        ? { $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 }, $set: { passwordResetAttempts: 0 } }
        : { $set: { passwordResetAttempts: attempts } },
    );
    return res.status(400).json({
      message: attempts >= RESET_CODE_MAX_ATTEMPTS
        ? "Too many incorrect codes. Please request a new verification code."
        : invalidMessage,
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      passwordResetTokenHash: user.passwordResetTokenHash,
      passwordResetExpires: { $gt: new Date() },
    },
    {
      $set: { password: passwordHash, emailVerified: true, passwordResetAttempts: 0 },
      $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
      $inc: { tokenVersion: 1 },
    },
  );
  if (!updatedUser) return res.status(400).json({ message: invalidMessage });
  res.json({ message: "Password reset successfully. Please sign in with your new password." });
});

app.post("/api/auth/oauth/exchange", oauthExchangeRateLimit, async (req, res) => {
  const { code } = req.body;
  if (typeof code !== "string" || code.length !== 64) {
    return res.status(400).json({ message: "The sign-in link is invalid or expired." });
  }
  const grant = await OAuthGrant.findOneAndDelete({
    tokenHash: hashSecret(code),
    expiresAt: { $gt: new Date() },
  });
  if (!grant) return res.status(400).json({ message: "The sign-in link is invalid or expired." });

  const user = await User.findById(grant.userId);
  if (!user || user.disabled || !user.emailVerified) {
    return res.status(400).json({ message: "Unable to complete sign-in." });
  }
  user.lastLogin = new Date();
  await user.save();
  res.json({
    token: createToken(user),
    user: {
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
});

const unavailableProvider = (_req, res) =>
  res.status(503).json({ message: "This sign-in provider is not configured." });
app.get(
  "/api/auth/google",
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? startOAuth("google", { scope: ["profile", "email"], session: false })
    : unavailableProvider,
);
app.get(
  "/api/auth/google/callback",
  consumeOAuthState,
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? passport.authenticate("google", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?oauthError=google`,
      })
    : unavailableProvider,
  async (req, res, next) => {
    try {
      const code = await saveOAuthGrant(req.user);
      res.redirect(`${FRONTEND_URL}/oauth/callback?code=${encodeURIComponent(code)}`);
    } catch (error) {
      next(error);
    }
  },
);
app.get(
  "/api/auth/facebook",
  process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
    ? startOAuth("facebook", { scope: ["email"], session: false })
    : unavailableProvider,
);
app.get(
  "/api/auth/facebook/callback",
  consumeOAuthState,
  process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
    ? passport.authenticate("facebook", {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?oauthError=facebook`,
      })
    : unavailableProvider,
  async (req, res, next) => {
    try {
      const code = await saveOAuthGrant(req.user);
      res.redirect(`${FRONTEND_URL}/oauth/callback?code=${encodeURIComponent(code)}`);
    } catch (error) {
      next(error);
    }
  },
);

app.get("/api/products", async (req, res) => {
  const filter = req.query.category ? { category: String(req.query.category).toLowerCase() } : {};
  const products = await Product.find(filter).sort({ externalId: 1 });
  res.json(products.map((product) => ({
    ...product.toObject(),
    id: product.externalId,
    image: product.image,
  })));
});

app.get("/api/products/categories", async (_req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories.filter(Boolean).sort());
});

app.get("/api/products/:id", async (req, res) => {
  const product = await Product.findOne({ externalId: Number(req.params.id) });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ ...product.toObject(), id: product.externalId });
});

app.get("/api/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
  res.json(users.map((user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    name: user.name,
    disabled: user.disabled,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    address: { city: "Unknown", street: "Unknown", number: 0, zipcode: "00000", geolocation: { lat: "0", long: "0" } },
  })));
});

app.delete("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "user" });
  if (!user) return res.status(404).json({ message: "User not found." });
  await User.deleteOne({ _id: user._id });
  res.json({ deleted: true });
});

app.patch("/api/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const allowed = {};
  if (typeof req.body.disabled === "boolean") allowed.disabled = req.body.disabled;
  if (req.body.phone) allowed.phone = String(req.body.phone).slice(0, 20);
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "user" },
    { $set: allowed },
    { new: true },
  );
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ id: user._id, disabled: user.disabled, phone: user.phone });
});

app.post("/api/cart-items", async (req, res) => {
  try {
    const product = req.body;
    const record = await CartItem.findOneAndUpdate(
      { productId: product.id },
      { $set: {
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        image: product.image,
        addedBy: product.addedBy,
        customerEmail: product.customerEmail,
        customerPhone: product.customerPhone,
      }, $inc: { quantity: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/cart-items", requireAuth, requireAdmin, async (_req, res) => {
  const items = await CartItem.find().sort({ updatedAt: -1 });
  res.json(items.map((item) => ({
    id: item.productId,
    recordId: item._id,
    title: item.title,
    category: item.category,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    addedBy: item.addedBy,
    customerEmail: item.customerEmail,
    customerPhone: item.customerPhone,
    phone: item.customerPhone,
    addedAt: item.updatedAt,
  })));
});

app.delete("/api/cart-items/:id", requireAuth, requireAdmin, async (req, res) => {
  await CartItem.deleteOne({ _id: req.params.id });
  res.json({ deleted: true });
});

app.delete("/api/cart-items", requireAuth, requireAdmin, async (_req, res) => {
  await CartItem.deleteMany({});
  res.json({ deleted: true });
});

app.post("/api/orders", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/orders", requireAuth, requireAdmin, async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders.map((order) => ({
    id: order._id,
    quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
    title: order.items.map((item) => item.title).join(", "),
    price: order.total,
    image: order.items[0]?.image || "",
    addedBy: order.addedBy,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    userPhone: order.customerPhone,
    phone: order.customerPhone,
    addedAt: order.createdAt,
  })));
});

app.delete("/api/orders", requireAuth, requireAdmin, async (_req, res) => {
  await Order.deleteMany({});
  res.json({ deleted: true });
});

app.use((error, _req, res, _next) => {
  void _next;
  console.error("API request failed:", error.message);
  const status = Number(error.status || 500);
  res.status(status).json({
    message:
      status >= 500
        ? "The request could not be completed right now."
        : status === 413
          ? "The request is too large."
          : "The request is invalid.",
  });
});

mongoose.set("strictQuery", true);

// Locally, run a normal long-lived server. On Vercel, the exported app is
// wrapped as a serverless function by api/index.js instead.
if (!process.env.VERCEL) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`ShopEase server running at http://localhost:${PORT}`));
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    });
}

export default app;
