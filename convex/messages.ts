import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listMessages = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, { roomId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return {
          ...msg,
          userName: user?.name ?? "Bilinmeyen",
          userImage: user?.imageUrl,
        };
      }),
    );

    return messagesWithUsers;
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    body: v.string(),
  },
  handler: async (ctx, { roomId, body }) => {
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

    if (!membership) throw new Error("Bu odanin uyesi degilsiniz");

    return await ctx.db.insert("messages", {
      roomId,
      userId: user._id,
      body,
      createdAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Giris yapilmamis");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("Kullanici bulunamadi");

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Mesaj bulunamadi");
    if (message.userId !== user._id) throw new Error("Sadece kendi mesajinizi silebilirsiniz");

    await ctx.db.delete(messageId);
  },
});

export const markAsRead = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return;

    const existing = await ctx.db
      .query("readPositions")
      .withIndex("by_user_and_room", (q) =>
        q.eq("userId", user._id).eq("roomId", roomId),
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: now });
    } else {
      await ctx.db.insert("readPositions", {
        userId: user._id,
        roomId,
        lastReadTime: now,
      });
    }
  },
});

export const getUnreadCounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return {};

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const readPositions = await ctx.db
      .query("readPositions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const readTimeByRoom = new Map<string, number>();
    for (const rp of readPositions) {
      readTimeByRoom.set(rp.roomId, rp.lastReadTime);
    }

    const counts: Record<string, number> = {};
    for (const m of memberships) {
      const lastRead = readTimeByRoom.get(m.roomId) ?? 0;
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_room", (q) =>
          q.eq("roomId", m.roomId).gt("createdAt", lastRead),
        )
        .collect();
      if (unreadMessages.length > 0) {
        counts[m.roomId] = unreadMessages.length;
      }
    }

    return counts;
  },
});

export const getLatestUnreadPerRoom = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const readPositions = await ctx.db
      .query("readPositions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const readTimeByRoom = new Map<string, number>();
    for (const rp of readPositions) {
      readTimeByRoom.set(rp.roomId, rp.lastReadTime);
    }

    const results: Array<{
      roomId: Id<"rooms">;
      roomName: string;
      messageId: Id<"messages">;
      senderName: string;
      senderImage: string | undefined;
      body: string;
      createdAt: number;
    }> = [];

    for (const m of memberships) {
      const lastRead = readTimeByRoom.get(m.roomId) ?? 0;
      const latestMsg = await ctx.db
        .query("messages")
        .withIndex("by_room", (q) =>
          q.eq("roomId", m.roomId).gt("createdAt", lastRead),
        )
        .order("desc")
        .take(1);

      if (latestMsg.length === 0) continue;
      const msg = latestMsg[0];
      if (msg.userId === user._id) continue;

      const sender = await ctx.db.get(msg.userId);
      const room = await ctx.db.get(m.roomId);

      results.push({
        roomId: m.roomId,
        roomName: room?.name ?? "Oda",
        messageId: msg._id,
        senderName: sender?.name ?? "Bilinmeyen",
        senderImage: sender?.imageUrl,
        body: msg.body,
        createdAt: msg.createdAt,
      });
    }

    return results;
  },
});
