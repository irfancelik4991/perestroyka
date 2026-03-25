import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Giris yapilmamis");
    }

    const clerkId = identity.subject;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: identity.name ?? "Anonim",
        email: identity.email ?? "",
        imageUrl: identity.pictureUrl,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId,
      name: identity.name ?? "Anonim",
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      lastSeen: Date.now(),
    });

    return userId;
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
