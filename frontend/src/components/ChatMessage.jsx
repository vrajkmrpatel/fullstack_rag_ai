import { Copy, Check, User, Bot } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import SourcesPanel from "./SourcesPanel";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-3xl gap-4 rounded-2xl p-4 ${
          isUser
            ? "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex-row-reverse self-end transition-colors"
            : "bg-transparent text-zinc-800 dark:text-zinc-200 transition-colors"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 transition-colors">
          {isUser ? <User size={16} className="text-zinc-600 dark:text-zinc-300" /> : <Bot size={16} className="text-zinc-600 dark:text-zinc-300" />}
        </div>

        <div className={`flex w-full flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div className="prose dark:prose-invert prose-zinc max-w-none text-sm leading-relaxed prose-p:leading-relaxed prose-pre:my-0 transition-colors">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>

          {!isUser && (
            <div className="mt-2 flex w-full items-center justify-between">
              {message.sources && message.sources.length > 0 ? (
                <SourcesPanel sources={message.sources.slice(0, 3)} />
              ) : (
                <div />
              )}
              
              <button
                onClick={copyMessage}
                className="group flex items-center gap-1.5 self-end rounded-md p-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                aria-label="Copy message"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                <span className="opacity-0 transition-opacity group-hover:opacity-100">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
