import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface MessageInputProps {
  roomId: Id<"rooms">;
}

export function MessageInput({ roomId }: MessageInputProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setBody("");
    try {
      await sendMessage({ roomId, body: trimmed });
    } catch {
      setBody(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-surface-light">
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajinizi yazin..."
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
        >
          Gonder
        </button>
      </div>
    </div>
  );
}
