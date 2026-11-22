const BASE_URL = "/api";

const getStoredAuth = () => {
  try {
    const stored =
      localStorage.getItem("shopEaseAuth") ||
      sessionStorage.getItem("shopEaseAuth") ||
      "null";
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let message = "Unable to complete the request.";
    if (errorText) {
      try {
        message = JSON.parse(errorText).message || message;
      } catch {
        message = `${response.status} ${errorText}`;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const normalizeProduct = (product) => {
  if (!product || typeof product !== "object") {
    return product;
  }

  const rating =
    typeof product.rating === "number"
      ? {
          rate: Number(product.rating),
          count: Number(product.reviews?.length ?? 0),
        }
      : {
          rate: Number(product.rating?.rate ?? 0),
          count: Number(product.rating?.count ?? product.reviews?.length ?? 0),
        };

  return {
    ...product,
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    price: Number(product.price ?? 0),
    image: product.image ?? product.thumbnail ?? product.images?.[0] ?? "",
    rating,
  };
};

const normalizeUsers = (users) =>
  users.map((user) => ({
    ...user,
    id: user.id,
    username: user.username ?? user.email?.split("@")[0] ?? "unknown",
    email: user.email,
    phone: user.phone ?? "N/A",
    name: {
      firstname:
        user.firstName ?? user.name?.first ?? user.name?.firstname ?? "",
      lastname: user.lastName ?? user.name?.last ?? user.name?.lastname ?? "",
    },
    company: user.company ?? { name: "N/A" },
    address: user.address ?? {
      city: "Unknown",
      street: "Unknown",
      number: 0,
      zipcode: "00000",
      geolocation: { lat: "0", long: "0" },
    },
  }));

const normalizeCategories = (categories) =>
  categories
    .map((category) => {
      if (typeof category === "string") return category.toLowerCase();
      if (category?.slug) return category.slug.toLowerCase();
      if (category?.name) return category.name.toLowerCase();
      return "";
    })
    .filter(Boolean);

export const fetchProducts = async (signal) => {
  const response = await fetch(`${BASE_URL}/products`, { signal });
  const data = await handleResponse(response);
  const products = Array.isArray(data) ? data : (data?.products ?? []);
  return products.map(normalizeProduct);
};

export const fetchProductById = async (id, signal) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, { signal });
  const data = await handleResponse(response);
  return normalizeProduct(data);
};

export const fetchCategories = async (signal) => {
  const response = await fetch(`${BASE_URL}/products/categories`, { signal });
  const data = await handleResponse(response);
  const categories = Array.isArray(data) ? data : (data?.categories ?? []);
  return normalizeCategories(categories);
};

export const fetchProductsByCategory = async (category, signal) => {
  const response = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}`,
    { signal },
  );
  const data = await handleResponse(response);
  const products = Array.isArray(data) ? data : (data?.products ?? []);
  return products.map(normalizeProduct);
};

export const fetchUsers = async (signal) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/users`, {
    signal,
    headers: auth?.token ? { Authorization: String.fromCharCode(66,101,97,114,101,114,32) + auth.token } : {},
  });
  const data = await handleResponse(response);
  const users = Array.isArray(data) ? data : (data?.users ?? []);
  return normalizeUsers(users);
};

export const loginUser = async ({ username, password, rememberMe = false }) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: username, password, rememberMe }),
  });
  return handleResponse(response);
};

export const logoutUser = async (token) => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: ["Bearer", token].join(" ") },
  });
  return handleResponse(response);
};

export const signupUser = async (userData) => {
  const payload = {
    name: userData.name,
    phone: userData.phone,
    username: userData.username,
    email: userData.email,
    password: userData.password,
  };

  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
};

export const resendVerification = async (email) => {
  const response = await fetch(`${BASE_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const resetPassword = async ({ token, password }) => {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return handleResponse(response);
};

export const fetchAuthProviders = async () => {
  const response = await fetch(`${BASE_URL}/auth/providers`);
  return handleResponse(response);
};

export const exchangeOAuthCode = async (code) => {
  const response = await fetch(`${BASE_URL}/auth/oauth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return handleResponse(response);
};

export const getOAuthUrl = (provider) => `${BASE_URL}/auth/${provider}`;

export const createOrder = async (order) => {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return handleResponse(response);
};

export const fetchOrders = async (signal) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/orders`, {
    signal,
    headers: auth?.token ? { Authorization: String.fromCharCode(66,101,97,114,101,114,32) + auth.token } : {},
  });
  return handleResponse(response);
};

export const recordCartItem = async (product) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/cart-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: JSON.stringify(product),
  });
  return handleResponse(response);
};

export const fetchCartItems = async (signal) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/cart-items`, {
    signal,
    headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
  });
  return handleResponse(response);
};

export const deleteCartItem = async (recordId) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/cart-items/${recordId}`, {
    method: "DELETE",
    headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
  });
  return handleResponse(response);
};

export const deleteUser = async (id) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
  });
  return handleResponse(response);
};

export const updateUser = async (id, changes) => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: JSON.stringify(changes),
  });
  return handleResponse(response);
};

export const clearOrders = async () => {
  const auth = getStoredAuth();
  const response = await fetch(`${BASE_URL}/orders`, {
    method: "DELETE",
    headers: auth?.token ? { Authorization: String.fromCharCode(66,101,97,114,101,114,32) + auth.token } : {},
  });
  return handleResponse(response);
};

export const getChatUsage = async (sessionId, signal) => {
  const response = await fetch(
    `${BASE_URL}/chat/usage?sessionId=${encodeURIComponent(sessionId)}`,
    { signal },
  );
  return handleResponse(response);
};

export const sendChatMessage = async ({ sessionId, message }) => {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });
  return handleResponse(response);
};
