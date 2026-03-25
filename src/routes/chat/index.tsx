import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Hosgeldiniz!
        </h2>
        <p className="text-muted">
          Sol taraftan bir oda secin veya yeni bir oda olusturun.
        </p>
      </div>
    </div>
  );
}
