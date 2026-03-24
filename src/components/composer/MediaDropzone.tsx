'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useComposerStore } from '@/stores/composer.store';
import { cn } from '@/lib/utils';
import type { MediaAsset } from '@/types';

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'video/mp4': ['.mp4'],
};

export function MediaDropzone() {
  const { addMedia } = useComposerStore();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      for (const file of acceptedFiles) {
        const maxSize = file.type === 'video/mp4' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          setError(`${file.name} 超過大小限制（圖片 10MB / 影片 50MB）`);
          continue;
        }

        // Use local object URL — shows the user's actual file, no server needed
        const localUrl = URL.createObjectURL(file);

        const asset: MediaAsset = {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          userId: 'local',
          blobUrl: localUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          createdAt: new Date().toISOString(),
        };

        addMedia(asset);
      }
    },
    [addMedia]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024,
    maxFiles: 4,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <Upload className="w-8 h-8" />
          <p className="text-sm font-medium text-gray-600">
            {isDragActive ? '放開以上傳' : '拖曳或點擊上傳素材'}
          </p>
          <p className="text-xs text-gray-400">JPG、PNG、MP4 · 最大 50MB</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
