module.exports = {
  routes: [
    // ── Existing: receives user.created events from Clerk ──────────────
    {
      method: "POST",
      path: "/clerk-webhook/handle",
      handler: "clerk-webhook.handle",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },

    // ── New: called by VendorOnboarding to write publicMetadata ────────
    // Protected by x-admin-key header — secret key lives in .env only
    {
      method: "POST",
      path: "/clerk-webhook/update-metadata",
      handler: "clerk-webhook.updateMetadata",
      config: {
        auth: false, // we do our own key check inside the controller
        policies: [],
        middlewares: [],
      },
    },
  ],
};
