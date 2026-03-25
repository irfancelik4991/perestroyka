import { Link } from "@tanstack/react-router";
import type { Id } from "../../convex/_generated/dataModel";

interface RoomItemProps {
  room: {
    _id: Id<"rooms">;
    name: string;
    description?: string;
    memberCount: number;
    creatorName: string;
    createdBy: Id<"users">;
  };
  isActive: boolean;
  currentUserId?: Id<"users">;
  unreadCount?: number;
}

export function RoomItem({ room, isActive, currentUserId, unreadCount = 0 }: RoomItemProps) {
  return (
    <Link
      to="/chat/$roomId"
      params={{ roomId: room._id }}
      className={`block rounded-lg p-3 transition-colors ${
        isActive
          ? "bg-surface-lighter text-white"
          : "text-muted hover:bg-surface-lighter/50 hover:text-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-medium text-sm truncate ${unreadCount > 0 && !isActive ? "text-white" : ""}`}>
          {room.name}
        </span>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {unreadCount > 0 && !isActive && (
            <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="text-xs text-muted">
            {room.memberCount} uye
          </span>
        </div>
      </div>
      {room.description && (
        <p className="text-xs text-muted mt-1 truncate">{room.description}</p>
      )}
    </Link>
  );
}
