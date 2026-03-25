import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link, useParams } from "@tanstack/react-router";
import { UserButton, useClerk } from "@clerk/tanstack-react-start";
import { RoomItem } from "./RoomItem";
import { OnlineUsers } from "./OnlineUsers";

export function Sidebar() {
  const rooms = useQuery(api.rooms.listRooms);
  const currentUser = useQuery(api.users.currentUser);
  const unreadCounts = useQuery(api.messages.getUnreadCounts) ?? {};
  const params = useParams({ strict: false }) as { roomId?: string };
  const clearPresence = useMutation(api.presence.clearPresence);
  const { signOut } = useClerk();

  return (
    <aside className="w-72 bg-surface-light border-r border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Perestroyka</h1>
        <UserButton />
      </div>

      <div className="p-2">
        <Link
          to="/chat/new"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Yeni Oda
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rooms === undefined ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-surface-lighter/50 animate-pulse"
              />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <p className="text-muted text-sm p-4 text-center">
            Henuz oda yok. Ilk odayi olusturun!
          </p>
        ) : (
          rooms.map((room) => (
            <RoomItem
              key={room._id}
              room={room}
              isActive={params.roomId === room._id}
              currentUserId={currentUser?._id}
              unreadCount={unreadCounts[room._id] ?? 0}
            />
          ))
        )}
      </div>

      <OnlineUsers />

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3">
          {currentUser?.imageUrl && (
            <img
              src={currentUser.imageUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentUser?.name ?? "Yukleniyor..."}
            </p>
            <p className="text-xs text-muted truncate">
              {currentUser?.email}
            </p>
          </div>
          <button
            onClick={async () => {
              await clearPresence();
              await signOut();
            }}
            className="text-muted hover:text-white transition-colors p-1.5 rounded hover:bg-surface-lighter"
            title="Cikis Yap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
