import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate } from "@tanstack/react-router";

export function useNotifications() {
  const latestUnread = useQuery(api.messages.getLatestUnreadPerRoom) ?? [];
  const params = useParams({ strict: false }) as { roomId?: string };
  const navigate = useNavigate();

  const seenMessageIds = useRef<Set<string>>(new Set());
  const permissionGranted = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      permissionGranted.current = true;
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        permissionGranted.current = permission === "granted";
      });
    }
  }, []);

  const handleNotificationClick = useCallback(
    (roomId: string) => {
      window.focus();
      navigate({ to: "/chat/$roomId", params: { roomId } });
    },
    [navigate],
  );

  useEffect(() => {
    if (!initialized.current) {
      for (const item of latestUnread) {
        seenMessageIds.current.add(item.messageId);
      }
      initialized.current = true;
      return;
    }

    if (!permissionGranted.current) return;

    for (const item of latestUnread) {
      if (seenMessageIds.current.has(item.messageId)) continue;
      if (item.roomId === params.roomId) {
        seenMessageIds.current.add(item.messageId);
        continue;
      }

      seenMessageIds.current.add(item.messageId);

      const preview =
        item.body.length > 80 ? item.body.slice(0, 80) + "…" : item.body;

      const notification = new Notification(item.roomName, {
        body: `${item.senderName}: ${preview}`,
        tag: `msg-${item.messageId}`,
        icon: item.senderImage ?? "/favicon.ico",
      });

      const roomId = item.roomId;
      notification.onclick = () => handleNotificationClick(roomId);
    }
  }, [latestUnread, params.roomId, handleNotificationClick]);
}
