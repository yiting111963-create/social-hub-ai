'use client';
import { useState } from 'react';
import { Send, Clock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useComposerStore } from '@/stores/composer.store';
import { cn } from '@/lib/utils';

export function PublishBar() {
  const {
    postId,
    variants,
    publishStatus,
    setPublishStatus,
    scheduleDateTime,
    setScheduleDateTime,
  } = useComposerStore();
  const [showScheduler, setShowScheduler] = useState(false);

  const handlePublish = async (mode: 'immediate' | 'scheduled') => {
    if (!postId) return;
    setPublishStatus('publishing');

    try {
      const body: Record<string, unknown> = { mode, variants };
      if (mode === 'scheduled' && scheduleDateTime) {
        body.scheduledFor = scheduleDateTime.toISOString();
      }

      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Publish failed');
      setPublishStatus(mode === 'scheduled' ? 'scheduled' : 'done');
    } catch {
      setPublishStatus('error');
    }
  };

  if (publishStatus === 'done') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Published successfully!</p>
          <p className="text-xs text-green-600 mt-0.5">
            Your content is now live on all selected platforms.
          </p>
        </div>
      </div>
    );
  }

  if (publishStatus === 'scheduled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <Clock className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Scheduled!</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Will publish at {scheduleDateTime?.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  const isPublishing = publishStatus === 'publishing';

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      {showScheduler && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Schedule Date &amp; Time
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) =>
              setScheduleDateTime(e.target.value ? new Date(e.target.value) : null)
            }
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handlePublish('immediate')}
          disabled={isPublishing}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
            isPublishing
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          )}
        >
          {isPublishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isPublishing ? 'Publishing...' : 'Publish Now'}
        </button>

        <button
          onClick={() => {
            if (showScheduler && scheduleDateTime) {
              handlePublish('scheduled');
            } else {
              setShowScheduler(!showScheduler);
            }
          }}
          disabled={isPublishing}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          {showScheduler && scheduleDateTime ? 'Confirm' : 'Schedule'}
        </button>
      </div>

      {publishStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">Publishing failed. Please try again.</p>
        </div>
      )}
    </div>
  );
}
