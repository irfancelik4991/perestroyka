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
    <div className="p-2 md:p-4 border-t border-border bg-surface-light">
      <div className="flex gap-2 md:gap-3">
        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajinizi yazin..."
          className="flex-1 bg-surface border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="px-4 md:px-6 py-2.5 md:py-3 bg-primary hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shrink-0"
        >
          <span className="hidden md:inline">Gonder</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:hidden">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
