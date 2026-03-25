import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MessageList } from "~/components/MessageList";
import { MessageInput } from "~/components/MessageInput";
import { useState, useEffect } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/chat/$roomId")({
  component: RoomChat,
});

function RoomChat() {
  const { roomId } = Route.useParams();
  const room = useQuery(api.rooms.getRoom, {
    roomId: roomId as Id<"rooms">,
  });
  const isMember = useQuery(api.rooms.isRoomMember, {
    roomId: roomId as Id<"rooms">,
  });
  const currentUser = useQuery(api.users.currentUser);
  const members = useQuery(api.rooms.getRoomMembers, {
    roomId: roomId as Id<"rooms">,
  });
  const messages = useQuery(api.messages.listMessages, {
    roomId: roomId as Id<"rooms">,
  });
  const joinRoom = useMutation(api.rooms.joinRoom);
  const leaveRoom = useMutation(api.rooms.leaveRoom);
  const deleteRoom = useMutation(api.rooms.deleteRoom);
  const updatePresence = useMutation(api.presence.updatePresence);
  const markAsRead = useMutation(api.messages.markAsRead);
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    updatePresence({ roomId: roomId as Id<"rooms"> });
    const interval = setInterval(() => {
      updatePresence({ roomId: roomId as Id<"rooms"> });
    }, 30_000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    if (isMember && messages && messages.length > 0) {
      markAsRead({ roomId: roomId as Id<"rooms"> });
    }
  }, [roomId, isMember, messages?.length]);

  if (room === undefined || isMember === undefined || currentUser === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-muted">Oda bulunamadi.</p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && room.createdBy === currentUser._id;

  const handleJoin = async () => {
    await joinRoom({ roomId: roomId as Id<"rooms"> });
  };

  const handleLeave = async () => {
    await leaveRoom({ roomId: roomId as Id<"rooms"> });
    navigate({ to: "/chat" });
  };

  const handleDelete = async () => {
    await deleteRoom({ roomId: roomId as Id<"rooms"> });
    navigate({ to: "/chat" });
  };

  return (
    <>
      {/* Header */}
      <div className="px-3 md:px-6 py-3 border-b border-border bg-surface-light flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <Link
            to="/chat"
            className="md:hidden p-2 -ml-1 mr-1 text-muted hover:text-white transition-colors"
            aria-label="Geri"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{room.name}</h2>
            {room.description && (
              <p className="text-xs text-muted truncate">{room.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-2 shrink-0">
          <span className="text-xs text-muted">
            {members?.length ?? 0} uye
          </span>
          {isMember ? (
            <div className="flex gap-2">
              {!isOwner && (
                <button
                  onClick={handleLeave}
                  className="px-3 py-1.5 text-xs border border-border text-muted hover:text-white hover:border-red-500 rounded-lg transition-colors"
                >
                  Ayril
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Sil
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleJoin}
              className="px-4 py-1.5 text-xs bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
            >
              Katil
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-surface-light border border-border rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Odayi Sil
            </h3>
            <p className="text-sm text-muted mb-6">
              &quot;{room.name}&quot; odasini silmek istediginizden emin misiniz?
              Bu islem geri alinamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 border border-border text-muted hover:text-white rounded-xl text-sm font-medium transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages or join prompt */}
      {isMember ? (
        <>
          <MessageList
            roomId={roomId as Id<"rooms">}
            currentUserId={currentUser?._id}
          />
          <MessageInput roomId={roomId as Id<"rooms">} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-muted mb-4">
              Mesajlari gormek icin odaya katilmaniz gerekiyor.
            </p>
            <button
              onClick={handleJoin}
              className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-medium transition-colors"
            >
              Odaya Katil
            </button>
          </div>
        </div>
      )}
    </>
  );
}
