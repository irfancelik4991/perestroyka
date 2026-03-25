import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const { userId } = context as { userId: string | null };
    if (userId) {
      throw redirect({ to: "/chat" });
    }
  },
  component: IndexRedirect,
});

function IndexRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    navigate({ to: isSignedIn ? "/chat" : "/login" });
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
