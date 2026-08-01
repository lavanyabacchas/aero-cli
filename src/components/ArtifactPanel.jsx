import React from 'react';
import { FileText, Copy, Download, Check } from 'lucide-react';

export const ArtifactPanel = ({ markdownArtifact }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (markdownArtifact) {
      navigator.clipboard.writeText(markdownArtifact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel rounded-lg border border-zinc-800 p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">Generated Task Artifact (.aerocli/artifacts/task.md)</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!markdownArtifact}
            className="btn-monochrome-outline text-xs px-2.5 py-1 flex items-center gap-1.5 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      {markdownArtifact ? (
        <div className="bg-[#050506] p-4 rounded border border-zinc-800 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto max-h-[300px] whitespace-pre-wrap">
          {markdownArtifact}
        </div>
      ) : (
        <div className="bg-[#050506] p-8 rounded border border-zinc-800 text-center font-mono text-xs text-zinc-500">
          Task verification checklist will be logged here automatically upon agent completion.
        </div>
      )}
    </div>
  );
};
