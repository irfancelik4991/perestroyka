import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";

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
