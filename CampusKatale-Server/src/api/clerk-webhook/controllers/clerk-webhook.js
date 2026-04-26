"use strict";

const { Webhook } = require("svix");
const { createClerkClient } = require("@clerk/clerk-sdk-node");

module.exports = {
  // ── Existing: handle user.created webhook from Clerk ───────────────────
  async handle(ctx) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!webhookSecret || !clerkSecretKey) {
      strapi.log.error("Missing CLERK_WEBHOOK_SECRET or CLERK_SECRET_KEY");
      ctx.status = 500;
      ctx.body = { error: "Server misconfiguration" };
      return;
    }

    const wh = new Webhook(webhookSecret);
    let event;

    try {
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
      strapi.log.error("[STEP 1 FAILED] Signature verification:", err.message);
      ctx.status = 400;
      ctx.body = { error: "Invalid webhook signature" };
      return;
    }

    strapi.log.info("[STEP 1 OK] Signature verified");

    if (event.type !== "user.created") {
      ctx.status = 200;
      ctx.body = { message: "Event ignored" };
      return;
    }

    const { id: clerkUserId, unsafe_metadata, email_addresses } = event.data;
    const intendedRole = unsafe_metadata?.intendedRole || "user";
    const primaryEmail = email_addresses?.[0]?.email_address || "";

    strapi.log.info(`[STEP 2] Processing: ${clerkUserId} | role: ${intendedRole}`);

    let clerk;
    try {
      clerk = createClerkClient({ secretKey: clerkSecretKey });
      strapi.log.info("[STEP 3 OK] Clerk client initialized");
    } catch (err) {
      strapi.log.error("[STEP 3 FAILED] Clerk init:", err.message);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
      return;
    }

    try {
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          role: intendedRole,
          vendorStatus: intendedRole === "vendor" ? "pending" : null,
        },
      });
      strapi.log.info("[STEP 4 OK] Clerk publicMetadata updated");
    } catch (err) {
      strapi.log.error("[STEP 4 FAILED] Clerk metadata update:", err.message);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
      return;
    }

    if (intendedRole === "vendor") {
      let existing;
      try {
        existing = await strapi.entityService.findMany("api::vendor.vendor", {
          filters: { clerkUserId },
        });
        strapi.log.info(`[STEP 5a OK] Existing vendor check: ${existing.length} found`);
      } catch (err) {
        strapi.log.error("[STEP 5a FAILED] findMany:", err.message);
        ctx.status = 500;
        ctx.body = { error: "Internal server error" };
        return;
      }

      if (existing.length === 0) {
        let vendor;
        try {
          vendor = await strapi.entityService.create("api::vendor.vendor", {
            data: {
              clerkUserId,
              storeName: primaryEmail.split("@")[0],
              status: "pending",
              publishedAt: new Date(),
            },
          });
          strapi.log.info(`[STEP 5b OK] Vendor created: ID ${vendor.id}`);
        } catch (err) {
          strapi.log.error("[STEP 5b FAILED] entityService.create:", err.message);
          strapi.log.error("Details:", JSON.stringify(err.details, null, 2));
          ctx.status = 500;
          ctx.body = { error: "Internal server error" };
          return;
        }

        try {
          await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              role: "vendor",
              vendorStatus: "pending",
              vendorId: vendor.id,
            },
          });
          strapi.log.info(`[STEP 5c OK] Clerk vendorId set to ${vendor.id}`);
        } catch (err) {
          strapi.log.error("[STEP 5c FAILED]:", err.message);
        }
      }
    }

    strapi.log.info("[DONE] Webhook handled successfully");
    ctx.status = 200;
    ctx.body = { success: true };
  },

  // ── New: called by VendorOnboarding.jsx to mark onboarding complete ───
  // Uses ADMIN_SECRET_KEY so secret Clerk keys stay on the server only
  async updateMetadata(ctx) {
    const adminKey = process.env.ADMIN_SECRET_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    // Verify the request is coming from our own frontend, not a random caller
    const providedKey = ctx.request.headers["x-admin-key"];
    if (!providedKey || providedKey !== adminKey) {
      ctx.status = 403;
      ctx.body = { error: "Forbidden" };
      return;
    }

    const { clerkUserId, metadata } = ctx.request.body;

    if (!clerkUserId || !metadata) {
      ctx.status = 400;
      ctx.body = { error: "clerkUserId and metadata are required" };
      return;
    }

    try {
      const clerk = createClerkClient({ secretKey: clerkSecretKey });
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: metadata,
      });
      strapi.log.info(`[updateMetadata] Updated metadata for ${clerkUserId}`);
      ctx.status = 200;
      ctx.body = { success: true };
    } catch (err) {
      strapi.log.error("[updateMetadata] Failed:", err.message);
      ctx.status = 500;
      ctx.body = { error: "Failed to update metadata" };
    }
  },
};
