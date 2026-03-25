import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { Sidebar } from "~/components/Sidebar";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNotifications } from "~/components/useNotifications";

export const Route = createFileRoute("/chat")({
  beforeLoad: async ({ context }) => {
    const { userId } = context as { userId: string | null };
    if (userId) {
      return { userId };
    }
  },
  component: ChatLayout,
});

function ChatLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const updatePresence = useMutation(api.presence.updatePresence);
  const clearPresence = useMutation(api.presence.clearPresence);
  const location = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  const isOnChatIndex =
    location.pathname === "/chat" || location.pathname === "/chat/";

  useNotifications();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getOrCreateUser();
    }
  }, [isLoaded, isSignedIn]);

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

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <div
        className={`${isOnChatIndex ? "flex" : "hidden"} md:flex w-full md:w-72 shrink-0`}
      >
        <Sidebar />
      </div>

      <main
        className={`${isOnChatIndex ? "hidden" : "flex"} md:flex flex-1 flex-col bg-surface min-w-0`}
      >
        <Outlet />
      </main>
    </div>
  );
}
