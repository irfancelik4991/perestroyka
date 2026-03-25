import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams } from "@tanstack/react-router";

export function useNotifications() {
  const unreadCounts = useQuery(api.messages.getUnreadCounts) ?? {};
  const rooms = useQuery(api.rooms.listRooms);
  const params = useParams({ strict: false }) as { roomId?: string };
  const prevCounts = useRef<Record<string, number>>({});
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

  useEffect(() => {
    if (!initialized.current) {
      prevCounts.current = { ...unreadCounts };
      initialized.current = true;
      return;
    }

    if (!permissionGranted.current || !rooms) return;

    const roomNameMap = new Map<string, string>();
    for (const room of rooms) {
      roomNameMap.set(room._id, room.name);
    }

    for (const [roomId, count] of Object.entries(unreadCounts)) {
      const prevCount = prevCounts.current[roomId] ?? 0;
      if (count > prevCount && roomId !== params.roomId) {
        const roomName = roomNameMap.get(roomId) ?? "Bir oda";
        const newMsgCount = count - prevCount;
        const body =
          newMsgCount === 1
            ? "Yeni bir mesaj var"
            : `${newMsgCount} yeni mesaj var`;

        new Notification(roomName, {
          body,
          tag: `room-${roomId}`,
          icon: "/favicon.ico",
        });
      }
    }

    prevCounts.current = { ...unreadCounts };
  }, [unreadCounts, rooms, params.roomId]);
}
