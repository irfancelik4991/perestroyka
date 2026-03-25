import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface MessageListProps {
  roomId: Id<"rooms">;
  currentUserId?: Id<"users">;
}

export function MessageList({ roomId, currentUserId }: MessageListProps) {
  const messages = useQuery(api.messages.listMessages, { roomId });
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<Id<"messages"> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (messages === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-muted">Henuz mesaj yok. Ilk mesaji siz gonderin!</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (messageId: Id<"messages">) => {
    if (deletingId) return;
    setDeletingId(messageId);
    try {
      await deleteMessage({ messageId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isOwn = msg.userId === currentUserId;
        const time = new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg._id}
            className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}
          >
            {msg.userImage ? (
              <img
                src={msg.userImage}
                alt={msg.userName}
                className="w-8 h-8 rounded-full shrink-0 mt-1"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-xs text-white shrink-0 mt-1">
                {msg.userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-xs font-medium ${isOwn ? "text-primary-light" : "text-muted"}`}
                >
                  {msg.userName}
                </span>
                <span className="text-[10px] text-muted/60">{time}</span>
              </div>
              <div
                className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  isOwn
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-surface-lighter text-white rounded-tl-sm"
                }`}
              >
                {msg.body}
              </div>
              {isOwn && (
                <button
                  onClick={() => handleDelete(msg._id)}
                  disabled={deletingId === msg._id}
                  className="text-[10px] text-muted/40 hover:text-red-400 mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  {deletingId === msg._id ? "Siliniyor..." : "Sil"}
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
