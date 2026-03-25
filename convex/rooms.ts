import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("rooms").collect();

    const roomsWithCounts = await Promise.all(
      rooms.map(async (room) => {
        const members = await ctx.db
          .query("memberships")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();

        const creator = await ctx.db.get(room.createdBy);

        return {
          ...room,
          memberCount: members.length,
          creatorName: creator?.name ?? "Bilinmeyen",
        };
      }),
    );

    return roomsWithCounts;
  },
});

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    return await ctx.db.get(roomId);
  },
});

export const createRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { name, description }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giris yapilmamis");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Kullanici bulunamadi");

    const roomId = await ctx.db.insert("rooms", {
      name,
      description,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    await ctx.db.insert("memberships", {
      roomId,
      userId: user._id,
      joinedAt: Date.now(),
    });

    return roomId;
  },
});

export const deleteRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giris yapilmamis");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Kullanici bulunamadi");

    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Oda bulunamadi");
    if (room.createdBy !== user._id) throw new Error("Sadece oda sahibi silebilir");

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    for (const m of memberships) {
      await ctx.db.delete(m._id);
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(roomId);
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giris yapilmamis");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Kullanici bulunamadi");

    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", roomId).eq("userId", user._id),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("memberships", {
      roomId,
      userId: user._id,
      joinedAt: Date.now(),
    });
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giris yapilmamis");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Kullanici bulunamadi");

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", roomId).eq("userId", user._id),
      )
      .unique();

    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});

export const getRoomMembers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return user
          ? { ...user, joinedAt: m.joinedAt }
          : null;
      }),
    );

    return members.filter(Boolean);
  },
});

export const isRoomMember = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_room_user", (q) =>
        q.eq("roomId", roomId).eq("userId", user._id),
      )
      .unique();

    return !!membership;
  },
});
