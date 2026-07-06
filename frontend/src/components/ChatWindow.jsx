import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

export default function ChatWindow({
  messages,
  loading,
  bottomRef,
}) {
  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}