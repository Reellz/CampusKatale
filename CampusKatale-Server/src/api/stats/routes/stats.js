module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/stats',
      handler: 'stats.index',
      config: {
        auth: false // set true if using JWT for admin
      }
    }
  ]
};
