'use client';
import { useComposerStore } from '@/stores/composer.store';
import { MediaDropzone } from './MediaDropzone';
import { TopicInput } from './TopicInput';
import { PlatformSelector } from './PlatformSelector';
import { GenerateButton } from './GenerateButton';
import { MediaPreviewStrip } from './MediaPreviewStrip';
import { ImageCountSelector } from './ImageCountSelector';
import { ReviewPanel } from '../review/ReviewPanel';

export function ComposerPanel() {
  const { generationStatus, uploadedMedia } = useComposerStore();
  const isComplete = generationStatus === 'complete';
  const hasUploadedMedia = uploadedMedia.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            1 · 上傳素材（選填）
          </h2>
          <MediaDropzone />
          <MediaPreviewStrip />

          {/* 只有在沒有上傳媒體時，才顯示 AI 生圖張數選擇 */}
          {!hasUploadedMedia && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 font-medium mb-2">
                ✨ 未上傳素材時，AI 將自動生圖
              </p>
              <ImageCountSelector />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            2 · 描述你的內容
          </h2>
          <TopicInput />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            3 · 選擇發佈平台
          </h2>
          <PlatformSelector />
        </div>

        <GenerateButton />
      </div>

      {/* Right: Review */}
      <div>
        {isComplete ? (
          <ReviewPanel />
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center min-h-80">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-lg font-semibold text-gray-500">預覽將在這裡顯示</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              填入主題、選擇平台，點擊「AI 生成內容」即可看到成果
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
