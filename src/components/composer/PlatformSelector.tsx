'use client';
import { useComposerStore } from '@/stores/composer.store';
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@/types';
import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

const PLATFORMS: Platform[] = ['facebook', 'instagram', 'threads', 'youtube'];

const PLATFORM_ICONS: Record<Platform, string> = {
  facebook: 'f',
  instagram: '📸',
  threads: '@',
  youtube: '▶',
};

export function PlatformSelector() {
  const { selectedPlatforms, togglePlatform } = useComposerStore();

  return (
    <div className="grid grid-cols-2 gap-2">
      {PLATFORMS.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform);
        const color = PLATFORM_COLORS[platform];

        return (
          <button
            key={platform}
            onClick={() => togglePlatform(platform)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
              isSelected ? 'border-current text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
            )}
            style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
          >
            <span className="text-base w-5 text-center">{PLATFORM_ICONS[platform]}</span>
            <span>{PLATFORM_LABELS[platform]}</span>
            {isSelected && <span className="ml-auto">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
