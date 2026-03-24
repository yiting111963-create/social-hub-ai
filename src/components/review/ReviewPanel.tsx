'use client';
import { useComposerStore } from '@/stores/composer.store';
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@/types';
import type { Platform } from '@/types';
import { PlatformPreview } from './PlatformPreview';
import { EditableVariant } from './EditableVariant';
import { PublishBar } from './PublishBar';
import { MediaViewer } from './MediaViewer';
import { cn } from '@/lib/utils';

export function ReviewPanel() {
  const { selectedPlatforms, variants, activePreviewPlatform, setActivePreview } = useComposerStore();
  const activePlatforms = selectedPlatforms.filter((p) => variants[p]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">審核與編輯</h2>
        <p className="text-xs text-gray-500 mt-0.5">預覽並調整各平台的內容</p>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50 overflow-x-auto">
        {activePlatforms.map((platform) => {
          const isActive = platform === activePreviewPlatform;
          return (
            <button
              key={platform}
              onClick={() => setActivePreview(platform)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                isActive ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-white'
              )}
              style={isActive ? { backgroundColor: PLATFORM_COLORS[platform] } : {}}
            >
              {PLATFORM_LABELS[platform]}
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
        {/* Media viewer: uploaded image/video player OR AI-generated image switcher */}
        <MediaViewer />

        <PlatformPreview platform={activePreviewPlatform} />

        {variants[activePreviewPlatform] && (
          <EditableVariant platform={activePreviewPlatform} />
        )}

        <PublishBar />
      </div>
    </div>
  );
}
