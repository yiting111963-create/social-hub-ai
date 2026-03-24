'use client';
import { useComposerStore } from '@/stores/composer.store';
import { PLATFORM_LIMITS } from '@/types';
import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  platform: Platform;
}

export function EditableVariant({ platform }: Props) {
  const { variants, updateVariant } = useComposerStore();
  const variant = variants[platform];
  if (!variant) return null;

  const limits = PLATFORM_LIMITS[platform];
  const captionLength = variant.caption?.length || 0;
  const isOverLimit = captionLength > limits.caption;

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      {platform === 'youtube' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Title{' '}
            <span className="text-gray-400">
              ({variant.title?.length || 0}/{limits.title})
            </span>
          </label>
          <input
            value={variant.title || ''}
            onChange={(e) => updateVariant(platform, { title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={limits.title}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Caption{' '}
          <span className={cn('text-gray-400', isOverLimit && 'text-red-500 font-semibold')}>
            ({captionLength}/{limits.caption})
          </span>
        </label>
        <textarea
          value={variant.caption || ''}
          onChange={(e) =>
            updateVariant(platform, {
              caption: e.target.value,
              charCount: e.target.value.length,
            })
          }
          rows={5}
          className={cn(
            'w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2',
            isOverLimit
              ? 'border-red-300 focus:ring-red-400'
              : 'border-gray-200 focus:ring-blue-500'
          )}
        />
      </div>

      {platform !== 'threads' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Hashtags</label>
          <div className="flex flex-wrap gap-1.5">
            {(variant.hashtags || []).map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {tag}
                <button
                  onClick={() =>
                    updateVariant(platform, {
                      hashtags: variant.hashtags?.filter((_, idx) => idx !== i),
                    })
                  }
                  className="text-blue-400 hover:text-blue-700 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const tag = prompt('Add hashtag:');
                if (tag?.trim()) {
                  updateVariant(platform, {
                    hashtags: [
                      ...(variant.hashtags || []),
                      tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`,
                    ],
                  });
                }
              }}
              className="px-2 py-0.5 border border-dashed border-gray-300 text-gray-400 text-xs rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
