'use client';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useComposerStore } from '@/stores/composer.store';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  idle: 'Generate with AI',
  'analyzing-style': 'Analyzing your style...',
  'generating-text': 'Writing content...',
  'generating-image': 'Creating image...',
  complete: 'Regenerate',
  error: 'Try Again',
};

export function GenerateButton() {
  const { topic, selectedPlatforms, generationStatus, generationProgress, generationError } = useComposerStore();
  const { generate } = useAIGeneration();

  const isLoading = ['analyzing-style', 'generating-text', 'generating-image'].includes(generationStatus);
  const canGenerate = topic.trim().length > 0 && selectedPlatforms.length > 0 && !isLoading;

  return (
    <div>
      {isLoading && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{STATUS_LABELS[generationStatus]}</span>
            <span>{generationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {generationStatus === 'error' && generationError && (
        <div className="mb-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{generationError}</p>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!canGenerate}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
          canGenerate
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        )}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {STATUS_LABELS[generationStatus]}
      </button>

      {!canGenerate && !isLoading && (
        <p className="text-center text-xs text-gray-400 mt-2">
          {!topic.trim() ? 'Enter a topic above to get started' : 'Select at least one platform'}
        </p>
      )}
    </div>
  );
}
