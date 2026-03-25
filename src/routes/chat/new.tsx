import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute("/chat/new")({
  component: NewRoom,
});

function NewRoom() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const createRoom = useMutation(api.rooms.createRoom);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;

    setCreating(true);
    try {
      const roomId = await createRoom({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      navigate({ to: "/chat/$roomId", params: { roomId } });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-3 py-3 border-b border-border bg-surface-light md:hidden flex items-center">
        <Link
          to="/chat"
          className="p-2 -ml-1 mr-1 text-muted hover:text-white transition-colors"
          aria-label="Geri"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h2 className="text-lg font-semibold text-white">Yeni Oda</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 hidden md:block">Yeni Oda Olustur</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="room-name"
              className="block text-sm font-medium text-muted mb-1.5"
            >
              Oda Adi
            </label>
            <input
              id="room-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ornegin: Genel Sohbet"
              className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label
              htmlFor="room-desc"
              className="block text-sm font-medium text-muted mb-1.5"
            >
              Aciklama (opsiyonel)
            </label>
            <input
              id="room-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu oda ne hakkinda?"
              className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/chat" })}
              className="flex-1 px-4 py-3 border border-border text-muted hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
            >
              {creating ? "Olusturuluyor..." : "Olustur"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
