const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = new Clerk({ apiKey: process.env.CLERK_API_KEY });

module.exports = {
  async index(ctx) {
    const users = await clerk.users.getUserList({ limit: 0 }); // limit 0 just gets count metadata
    const listings = await strapi.db.query('api::listing.listing').count();

    return {
      users: users.length,
      listings
    };
  }
};
