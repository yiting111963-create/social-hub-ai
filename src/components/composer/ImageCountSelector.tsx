'use client';
import { useComposerStore } from '@/stores/composer.store';
import { cn } from '@/lib/utils';

const OPTIONS: Array<{ value: 1 | 2 | 4; label: string }> = [
  { value: 1, label: '1 張' },
  { value: 2, label: '2 張' },
  { value: 4, label: '4 張' },
];

export function ImageCountSelector() {
  const { imageCount, setImageCount } = useComposerStore();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">AI 生成幾張圖：</span>
      <div className="flex gap-1.5">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setImageCount(value)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-semibold border transition-all',
              imageCount === value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 text-gray-600 hover:border-blue-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
