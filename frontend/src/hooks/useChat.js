import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { askQuestion } from "../api/api";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  };

  async function sendMessage(question) {
    if (!question.trim()) return;
    if (loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: question.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    scrollToBottom();

    try {
      const response = await askQuestion(question);
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: response.answer,
        sources: response.sources ?? []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to backend. Please try again.");

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          text: "⚠️ Unable to retrieve an answer from the server. Please ensure the backend is running.",
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return {
    messages,
    loading,
    sendMessage,
    clearChat,
    bottomRef
  };
}