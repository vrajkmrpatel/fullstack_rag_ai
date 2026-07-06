import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";

export default function ChatInput({ onSend, loading, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  function send() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 p-4 pb-6 transition-colors">
      <div className="mx-auto max-w-3xl relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-1 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-700 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={disabled ? "Please upload a PDF document first..." : "Ask anything about your research papers..."}
          value={text}
          disabled={loading || disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-[200px] min-h-[56px] w-full resize-none rounded-2xl bg-transparent py-4 pl-4 pr-14 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />

        <button
          disabled={loading || disabled || !text.trim()}
          onClick={send}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500"
          aria-label="Send message"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-500 transition-colors">
        ResearchLM can make mistakes. Verify important information.
      </p>
    </footer>
  );
}