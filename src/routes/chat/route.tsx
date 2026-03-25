import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
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
  const location = useLocation();

  const isOnChatIndex =
    location.pathname === "/chat" || location.pathname === "/chat/";

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
      {/* Sidebar: full-screen on mobile index, fixed-width on desktop always */}
      <div
        className={`${isOnChatIndex ? "flex" : "hidden"} md:flex w-full md:w-72 shrink-0`}
      >
        <Sidebar />
      </div>

      {/* Main: hidden on mobile index, full-screen on mobile sub-routes */}
      <main
        className={`${isOnChatIndex ? "hidden" : "flex"} md:flex flex-1 flex-col bg-surface min-w-0`}
      >
        <Outlet />
      </main>
    </div>
  );
}
