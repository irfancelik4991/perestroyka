import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ONLINE_THRESHOLD_MS = 35_000;

export const updatePresence = mutation({
  args: {
    roomId: v.optional(v.id("rooms")),
  },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        roomId,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        userId: user._id,
        roomId,
        lastSeen: Date.now(),
      });
    }
  },
});

export const clearPresence = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getOnlineUsers = query({
  args: { roomId: v.optional(v.id("rooms")) },
  handler: async (ctx, { roomId }) => {
    const cutoff = Date.now() - ONLINE_THRESHOLD_MS;

    let presenceRecords;
    if (roomId) {
      presenceRecords = await ctx.db
        .query("presence")
        .withIndex("by_room", (q) => q.eq("roomId", roomId))
        .collect();
    } else {
      presenceRecords = await ctx.db.query("presence").collect();
    }

    const onlineRecords = presenceRecords.filter((p) => p.lastSeen > cutoff);

    const users = await Promise.all(
      onlineRecords.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return user ? { ...user, lastSeen: p.lastSeen } : null;
      }),
    );

    return users.filter(Boolean);
  },
});

export const getAllUsersWithStatus = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ONLINE_THRESHOLD_MS;
    const allUsers = await ctx.db.query("users").collect();
    const presenceRecords = await ctx.db.query("presence").collect();

    const presenceByUser = new Map<string, number>();
    for (const p of presenceRecords) {
      presenceByUser.set(p.userId, p.lastSeen);
    }

    return allUsers.map((user) => {
      const lastSeen = presenceByUser.get(user._id);
      const isOnline = lastSeen !== undefined && lastSeen > cutoff;
      return { ...user, isOnline, presenceLastSeen: lastSeen };
    });
  },
});
