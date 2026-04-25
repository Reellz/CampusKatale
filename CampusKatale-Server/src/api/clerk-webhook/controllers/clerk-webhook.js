"use strict";

const { Webhook } = require("svix");
const Clerk = require("@clerk/clerk-sdk-node").default;

module.exports = {
  async handle(ctx) {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret) {
      strapi.log.error("CLERK_WEBHOOK_SECRET is not set");
      ctx.status = 500;
      ctx.body = { error: "Webhook secret not configured" };
      return;
    }

    // 1. Verify the request actually came from Clerk
    const wh = new Webhook(secret);
    let event;

    try {
      // Strapi gives us the raw body via ctx.request.body
      // We need the raw string for svix verification
      const payload =
        typeof ctx.request.body === "string"
          ? ctx.request.body
          : JSON.stringify(ctx.request.body);

      event = wh.verify(payload, {
        "svix-id": ctx.request.headers["svix-id"],
        "svix-timestamp": ctx.request.headers["svix-timestamp"],
        "svix-signature": ctx.request.headers["svix-signature"],
      });
    } catch (err) {
      strapi.log.error("Webhook signature verification failed:", err.message);
      ctx.status = 400;
      ctx.body = { error: "Invalid webhook signature" };
      return;
    }

    // 2. Only handle user.created events
    if (event.type !== "user.created") {
      ctx.status = 200;
      ctx.body = { message: "Event ignored" };
      return;
    }

    const { id: clerkUserId, unsafe_metadata, email_addresses } = event.data;
    const intendedRole = unsafe_metadata?.intendedRole || "user";
    const primaryEmail = email_addresses?.[0]?.email_address || "";

    strapi.log.info(`New user: ${clerkUserId} | Role: ${intendedRole}`);

    try {
      const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

      // 3. Write trusted role to Clerk publicMetadata
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          role: intendedRole,
          vendorStatus: intendedRole === "vendor" ? "pending" : null,
        },
      });

      // 4. If vendor, create a Strapi vendor record
      if (intendedRole === "vendor") {
        const existingVendors = await strapi.entityService.findMany(
          "api::vendor.vendor",
          {
            filters: { clerkUserId },
          }
        );

        // Avoid duplicate vendor records
        if (!existingVendors || existingVendors.length === 0) {
          const vendor = await strapi.entityService.create(
            "api::vendor.vendor",
            {
              data: {
                clerkUserId,
                storeName: primaryEmail.split("@")[0], // temp name until onboarding
                status: "pending",
                publishedAt: new Date(), // required for Strapi v4 content
              },
            }
          );

          strapi.log.info(`Vendor record created: ${vendor.id}`);

          // 5. Store Strapi vendor ID back in Clerk
          await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              role: "vendor",
              vendorStatus: "pending",
              vendorId: vendor.id,
            },
          });
        }
      }

      ctx.status = 200;
      ctx.body = { success: true };
    } catch (err) {
      strapi.log.error("Webhook handler error:", err.message);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  },
};