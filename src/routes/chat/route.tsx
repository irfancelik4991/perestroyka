import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "~/components/Sidebar";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNotifications } from "~/components/useNotifications";

export const Route = createFileRoute("/chat")({
  beforeLoad: async ({ context }) => {
    const { userId } = context as { userId: string | null };
    if (!userId) {
      throw redirect({ to: "/login" });
    }
  },
  component: ChatLayout,
});

function ChatLayout() {
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const updatePresence = useMutation(api.presence.updatePresence);
  const clearPresence = useMutation(api.presence.clearPresence);

  useNotifications();

  useEffect(() => {
    getOrCreateUser();
  }, []);

  useEffect(() => {
    updatePresence({});
    const interval = setInterval(() => {
      updatePresence({});
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearPresence();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updatePresence({});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearPresence, updatePresence]);

  return (
    <div className="h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-surface">
        <Outlet />
      </main>
    </div>
  );
}
