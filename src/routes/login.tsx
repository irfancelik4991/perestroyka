import {
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { SignIn, useAuth } from "@clerk/tanstack-react-start";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const { userId } = context as { userId: string | null };
    if (userId) {
      throw redirect({ to: "/chat" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate({ to: "/chat" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isSignedIn) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Perestroyka</h1>
        <p className="text-muted mb-8">Gercek zamanli sohbet uygulamasi</p>
        <SignIn
          routing="hash"
          forceRedirectUrl="/chat"
          fallbackRedirectUrl="/chat"
        />
      </div>
    </div>
  );
}
