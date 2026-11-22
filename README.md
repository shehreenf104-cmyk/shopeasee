# ShopEase

## Website Details

- **Website Topic:** E-Commerce
- **Website Category:** General Retail
- **Website Name:** ShopEase
- **Database Name:** `shopease`
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Frontend:** React.js + Vite

## Backend and Database Setup

1. Install and start a local MongoDB server.
2. Copy `.env.example` to `.env` and update values if needed.
3. Install dependencies and start the full application:

```bash
npm install
npm run dev
```

The React app runs through Vite and the API runs on `http://localhost:5000`.

## Authentication Setup

In local development, when SMTP is not configured, signup and password recovery show one-time verification/reset links in the app so you can test the complete flow. Do not use this development link mode in production. For real deployments, configure SMTP so ShopEase can send verification and password-reset links. Set these in your local `.env`:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM`
- `JWT_SECRET` to a unique random secret of at least 32 characters
- `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD`

New accounts must verify their email before signing in. Verification links expire after 24 hours; password-reset links expire after 30 minutes. Standard sign-in sessions expire after 12 hours; selecting **Remember me** extends the session to 7 days. Set `NODE_ENV=production` in production to disable local development links.

Google and Facebook sign-in are enabled when their provider credentials are configured. Register these callback URLs with the providers:

- `http://localhost:5000/api/auth/google/callback`
- `http://localhost:5000/api/auth/facebook/callback`

Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` in `.env`. For a deployed site, update the callback URLs and `FRONTEND_URL` to the HTTPS deployment URLs.

## Development Changes

- Added a Node.js/Express REST API.
- Added MongoDB models for products, users, and orders.
- Replaced direct DummyJSON product access with the ShopEase backend API.
- Added bcrypt password hashing and JWT authentication.
- Added MongoDB-backed signup, login, checkout, and admin order data.
- Added a separate admin login route at `/admin/login`.
- Admin can view registered users and their last login time, then delete users.
- Product additions are saved to MongoDB and displayed in the protected admin dashboard.
- Added stricter ShopEase username, Gmail, and password validation.
- Added email verification, password reset, remember-me sessions, login throttling, and configured Google/Facebook OAuth flows.
- Added a Help link to the navigation and a ShopEase chatbot page at `/help`; it recognizes greetings and common store questions, searches product names/categories, responds with current catalog prices where available, and saves the conversation in the browser until cleared.
- Added a floating chatbot button on every page with a responsive chat panel. The backend answers from ShopEase catalog and support information, counts prompt and reply tokens with `gpt-tokenizer`, enforces a 1,000-token browser-session limit, and stores usage in MongoDB; clearing the transcript does not reset the limit.

## Build

```bash
npm run build
```
