import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    lastSeen: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  rooms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }),

  messages: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId", "createdAt"]),

  memberships: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_user", ["roomId", "userId"]),

  presence: defineTable({
    userId: v.id("users"),
    roomId: v.optional(v.id("rooms")),
    lastSeen: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_room", ["roomId", "lastSeen"]),

  readPositions: defineTable({
    userId: v.id("users"),
    roomId: v.id("rooms"),
    lastReadTime: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_room", ["userId", "roomId"]),
});
