// Vercel serverless entry point: every /api/* request is routed here
// (see vercel.json) and handled by the Express app.
//
// The database lives on the developer's machine, so a Vercel deployment
// normally has no MONGODB_URI. In that case answer with a clear 503 instead
// of loading the server (which would crash without its environment).
let appPromise;

export default async function handler(req, res) {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      message: "The ShopEase backend is not available on this deployment. Run the app locally to sign in and shop.",
    }));
    return;
  }
  appPromise ||= import("../server/index.js").then((module) => module.default);
  const app = await appPromise;
  return app(req, res);
}
