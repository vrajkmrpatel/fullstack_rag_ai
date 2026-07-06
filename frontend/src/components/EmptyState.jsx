import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
          <BrainCircuit className="text-zinc-700 dark:text-zinc-300 transition-colors" size={32} />
        </div>
        
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">
          ResearchLM
        </h1>
        
        <p className="mb-6 text-base text-zinc-600 dark:text-zinc-400 transition-colors">
          Your intelligent research assistant. Ask questions about your papers and get answers backed by retrieved sources.
        </p>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-zinc-600 dark:text-zinc-400 transition-colors">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 transition-colors">
            <span className="font-medium text-zinc-800 dark:text-zinc-300">Summarize</span> findings from recent papers
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 transition-colors">
            <span className="font-medium text-zinc-800 dark:text-zinc-300">Extract</span> key methodologies
          </div>
        </div>
      </div>
    </motion.div>
  );
}
