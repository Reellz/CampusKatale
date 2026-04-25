module.exports = {
  routes: [
    {
      method: "POST",
      path: "/clerk-webhook/handle",
      handler: "clerk-webhook.handle",
      config: {
        auth: false, // Clerk hits this unauthenticated
        policies: [],
        middlewares: [],
      },
    },
  ],
};