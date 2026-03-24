'use client';
import { useComposerStore } from '@/stores/composer.store';

const EXAMPLES = [
  '今天火鍋店爆滿，客人都愛新的麻辣湯底！',
  '東京賞櫻心得，美到讓人屏息的景色',
  'Launching new product line — sustainable everyday essentials',
];

export function TopicInput() {
  const { topic, setTopic } = useComposerStore();

  return (
    <div>
      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={EXAMPLES[0]}
        rows={4}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
      />
      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-400">Try:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setTopic(ex)}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Example {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
