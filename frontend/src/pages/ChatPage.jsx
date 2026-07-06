import { useState } from "react";
import Navbar from "../components/Navbar";
import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";

import useChat from "../hooks/useChat";

export default function ChatPage({ theme, toggleTheme }) {
  const [activePdf, setActivePdf] = useState(null);
  const {
    messages,
    loading,
    sendMessage,
    clearChat,
    bottomRef,
  } = useChat();

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar onClear={clearChat} activePdf={activePdf} setActivePdf={setActivePdf} theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        <ChatWindow
          messages={messages}
          loading={loading}
          bottomRef={bottomRef}
        />
      </main>

      <ChatInput
        onSend={sendMessage}
        loading={loading}
        disabled={!activePdf}
      />
    </div>
  );
}