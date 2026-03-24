'use client';
import { useComposerStore } from '@/stores/composer.store';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shows uploaded media (image/video) OR AI-generated images with selection.
 * Placed above PlatformPreview so the user can see & switch images.
 */
export function MediaViewer() {
  const {
    uploadedMedia,
    aiImageUrls,
    selectedAiImageIndex,
    setSelectedAiImageIndex,
    updateVariant,
    selectedPlatforms,
    variants,
  } = useComposerStore();

  const hasUpload = uploadedMedia.length > 0;
  const hasAiImages = aiImageUrls.length > 0;

  if (!hasUpload && !hasAiImages) return null;

  // ── Uploaded media ──────────────────────────────────────────────
  if (hasUpload) {
    const media = uploadedMedia[0];
    const isVideo = media.fileType === 'video/mp4';

    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
        {isVideo ? (
          <video
            src={media.blobUrl}
            controls
            className="w-full max-h-72 object-contain"
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.blobUrl}
            alt={media.fileName}
            className="w-full max-h-72 object-contain"
          />
        )}
        {uploadedMedia.length > 1 && (
          <div className="bg-white p-2 flex gap-1.5 overflow-x-auto">
            {uploadedMedia.map((m, i) => (
              <div key={m.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-blue-500 shrink-0">
                {m.fileType === 'video/mp4' ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.blobUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="bg-white px-3 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {isVideo ? '🎬' : '🖼️'} <span className="font-medium text-gray-700">{media.fileName}</span>
            {isVideo && <span className="ml-2 text-gray-400">· 使用下方播放器觀看完整影片</span>}
          </p>
        </div>
      </div>
    );
  }

  // ── AI-generated images ─────────────────────────────────────────
  const currentUrl = aiImageUrls[selectedAiImageIndex];
  const canPrev = selectedAiImageIndex > 0;
  const canNext = selectedAiImageIndex < aiImageUrls.length - 1;

  const selectImage = (index: number) => {
    setSelectedAiImageIndex(index);
    // Update all variants' thumbnailUrl to the newly selected image
    for (const platform of selectedPlatforms) {
      if (variants[platform]) {
        updateVariant(platform, { thumbnailUrl: aiImageUrls[index] });
      }
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <div className="relative bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentUrl}
          alt={`AI 生成圖 ${selectedAiImageIndex + 1}`}
          className="w-full max-h-72 object-contain"
        />
        {aiImageUrls.length > 1 && (
          <>
            <button
              onClick={() => selectImage(selectedAiImageIndex - 1)}
              disabled={!canPrev}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all',
                !canPrev && 'opacity-0 pointer-events-none'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => selectImage(selectedAiImageIndex + 1)}
              disabled={!canNext}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all',
                !canNext && 'opacity-0 pointer-events-none'
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {aiImageUrls.length > 1 && (
        <div className="bg-white p-2 flex gap-1.5 justify-center border-t border-gray-100">
          {aiImageUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => selectImage(i)}
              className={cn(
                'w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                i === selectedAiImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`圖 ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="bg-white px-3 py-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          ✨ AI 生成圖 {selectedAiImageIndex + 1} / {aiImageUrls.length}
          {aiImageUrls.length > 1 && (
            <span className="ml-1 text-blue-600">· 點擊縮圖切換，所選圖片會套用到所有平台</span>
          )}
        </p>
      </div>
    </div>
  );
}
