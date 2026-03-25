import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function OnlineUsers() {
  const allUsers = useQuery(api.presence.getAllUsersWithStatus, {});
  const currentUser = useQuery(api.users.currentUser);

  if (!allUsers) return null;

  const otherUsers = allUsers.filter((u) => u._id !== currentUser?._id);
  const onlineUsers = otherUsers.filter((u) => u.isOnline);
  const offlineUsers = otherUsers.filter((u) => !u.isOnline);
  const sortedUsers = [...onlineUsers, ...offlineUsers];

  if (sortedUsers.length === 0) return null;

  const onlineCount = onlineUsers.length;

  return (
    <div className="p-3 border-t border-border">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
        Kullanicilar — {onlineCount} cevrimici
      </h3>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {sortedUsers.map((user) => (
          <div key={user._id} className="flex items-center gap-2">
            <div className="relative">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className={`w-6 h-6 rounded-full ${!user.isOnline ? "opacity-50" : ""}`}
                />
              ) : (
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                    user.isOnline ? "bg-surface-lighter" : "bg-surface-lighter/50"
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-light ${
                  user.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
            <span
              className={`text-sm truncate ${
                user.isOnline ? "text-muted" : "text-muted/50"
              }`}
            >
              {user.name}
            </span>
            {!user.isOnline && (
              <span className="text-[10px] text-muted/40 ml-auto shrink-0">
                cevrimdisi
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
