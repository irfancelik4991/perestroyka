import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const { userId } = context as { userId: string | null };
    if (userId) {
      throw redirect({ to: "/chat" });
    } else {
      throw redirect({ to: "/login" });
    }
  },
  component: () => null,
});
