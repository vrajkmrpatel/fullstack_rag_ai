import { FileText, Target } from "lucide-react";

export default function SourceCard({ source, index }) {
  const metadata = source.metadata || {};

  // Format the score cleanly to 2 decimal places
  const score = source.score !== undefined && source.score !== null
    ? Number(source.score).toFixed(2)
    : "N/A";

  // Determine badge styling based on BGE-reranker confidence thresholds
  const getScoreStyle = (s) => {
    if (s === "N/A") return "bg-zinc-800 text-zinc-400 border-zinc-700";
    const num = Number(s);
    if (num >= 0.5) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; // High match
    if (num >= -1.0) return "bg-amber-500/10 text-amber-400 border-amber-500/20";    // Medium match
    return "bg-red-500/10 text-red-400 border-red-500/20";                             // Low match
  };

  const scoreStyle = getScoreStyle(score);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">

      {/* Header with Title and Score Badge */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="shrink-0 text-zinc-500 dark:text-zinc-400" size={14} />
          <h3 className="text-xs font-medium text-zinc-800 dark:text-zinc-300 line-clamp-1 truncate">
            {metadata.title || `Source ${index + 1}`}
          </h3>
        </div>

        {/* Semantic Score Badge */}
        <div className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${scoreStyle}`}>
          <Target size={10} />
          {score}
        </div>
      </div>

      {/* Metadata Fields */}
      <div className="mb-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-500">
        {Object.entries(metadata).map(([key, value]) => {
          if (key === 'title' || key === 'relevance_score') return null;
          return (
            <div key={key} className="line-clamp-1">
              <span className="font-medium capitalize text-zinc-700 dark:text-zinc-400">
                {key.replaceAll("_", " ")}:
              </span>{" "}
              {String(value)}
            </div>
          );
        })}
      </div>

      {/* Content Chunk */}
      <div className="mt-auto max-h-24 overflow-y-auto rounded-lg bg-zinc-50 dark:bg-zinc-950/50 p-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 scrollbar-thin transition-colors">
        {source.content}
      </div>

    </div>
  );
}