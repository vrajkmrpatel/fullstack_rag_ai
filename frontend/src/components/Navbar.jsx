import { BrainCircuit, Trash2, Upload, FileText, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { uploadDocument } from "../api/api";
import toast from "react-hot-toast";

export default function Navbar({ onClear, activePdf, setActivePdf, theme, toggleTheme }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading and processing PDF...");

    try {
      await uploadDocument(file);
      setActivePdf(file.name);
      toast.success("Document uploaded and processed successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setIsUploading(false);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = null;
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-6 py-4 backdrop-blur-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors">
          <BrainCircuit className="text-zinc-900 dark:text-zinc-100" size={20} />
        </div>

        <div className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight transition-colors">
            ResearchLM
          </h1>
          {activePdf && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 transition-colors">
              <FileText size={12} className="text-blue-500 dark:text-blue-400" /> 
              {activePdf}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload PDF"
        >
          <Upload size={16} />
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>

        <button
          onClick={onClear}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
          aria-label="Clear chat"
        >
          <Trash2 size={16} />
          Clear Chat
        </button>
      </div>
    </motion.header>
  );
}