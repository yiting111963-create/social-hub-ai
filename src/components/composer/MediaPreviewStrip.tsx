'use client';
import { X, Video } from 'lucide-react';
import { useComposerStore } from '@/stores/composer.store';

export function MediaPreviewStrip() {
  const { uploadedMedia, removeMedia } = useComposerStore();

  if (uploadedMedia.length === 0) return null;

  return (
    <div className="mt-3 flex gap-2 flex-wrap">
      {uploadedMedia.map((media) => (
        <div key={media.id} className="relative group">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {media.fileType.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.blobUrl} alt={media.fileName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
                <Video className="w-6 h-6" />
                <span className="text-xs">MP4</span>
              </div>
            )}
          </div>
          <button
            onClick={() => removeMedia(media.id)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
