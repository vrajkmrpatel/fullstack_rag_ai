import SourceCard from "./SourceCard";

export default function SourcesPanel({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500 transition-colors">
        Sources
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, index) => (
          <SourceCard
            key={index}
            source={source}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}