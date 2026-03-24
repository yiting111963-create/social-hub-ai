'use client';
import { useComposerStore } from '@/stores/composer.store';
import type { Platform, PostVariant } from '@/types';

interface Props {
  platform: Platform;
}

export function PlatformPreview({ platform }: Props) {
  const { variants, uploadedMedia, aiImageUrls, selectedAiImageIndex } = useComposerStore();
  const variant = variants[platform];
  const imageUrl =
    uploadedMedia[0]?.blobUrl ||
    aiImageUrls[selectedAiImageIndex] ||
    `https://picsum.photos/seed/${platform}123/400/300`;

  if (!variant) return null;

  switch (platform) {
    case 'instagram':
      return <InstagramPreview variant={variant} imageUrl={imageUrl} />;
    case 'facebook':
      return <FacebookPreview variant={variant} imageUrl={imageUrl} />;
    case 'threads':
      return <ThreadsPreview variant={variant} />;
    case 'youtube':
      return <YouTubePreview variant={variant} imageUrl={imageUrl} />;
  }
}

function InstagramPreview({ variant, imageUrl }: { variant: PostVariant; imageUrl: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 max-w-xs mx-auto shadow-sm">
        <div className="flex items-center gap-2 p-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
          <div>
            <p className="text-xs font-semibold">my_instagram</p>
            <p className="text-xs text-gray-400">Sponsored</p>
          </div>
          <span className="ml-auto text-gray-400 text-lg">⋯</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Post" className="w-full aspect-square object-cover" />
        <div className="p-3">
          <div className="flex gap-3 mb-2 text-xl">
            <span>🤍</span><span>💬</span><span>✈️</span>
            <span className="ml-auto">🔖</span>
          </div>
          <p className="text-xs leading-relaxed">
            <span className="font-semibold">my_instagram </span>
            <span className="text-gray-700">
              {variant.caption?.substring(0, 100)}
              {(variant.caption?.length || 0) > 100 ? '... more' : ''}
            </span>
          </p>
          {variant.hashtags && variant.hashtags.length > 0 && (
            <p className="text-xs text-blue-500 mt-1">{variant.hashtags.slice(0, 5).join(' ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FacebookPreview({ variant, imageUrl }: { variant: PostVariant; imageUrl: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 max-w-xs mx-auto shadow-sm">
        <div className="flex items-center gap-2 p-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            f
          </div>
          <div>
            <p className="text-xs font-semibold">My Facebook Page</p>
            <p className="text-xs text-gray-400">Just now · 🌐</p>
          </div>
        </div>
        <p className="px-3 pb-2 text-xs text-gray-700 leading-relaxed">
          {variant.caption?.substring(0, 150)}
          {(variant.caption?.length || 0) > 150 ? '... See more' : ''}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Post" className="w-full aspect-video object-cover" />
        <div className="p-2 flex gap-1 border-t border-gray-100">
          <button className="flex-1 text-xs text-gray-500 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50">
            👍 Like
          </button>
          <button className="flex-1 text-xs text-gray-500 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50">
            💬 Comment
          </button>
          <button className="flex-1 text-xs text-gray-500 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50">
            ↗️ Share
          </button>
        </div>
      </div>
    </div>
  );
}

function ThreadsPreview({ variant }: { variant: PostVariant }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="bg-white rounded-xl border border-gray-200 max-w-xs mx-auto p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            @
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold">my_threads</p>
              <p className="text-xs text-gray-400">· now</p>
            </div>
            <p className="text-xs text-gray-800 mt-1 leading-relaxed">
              {variant.caption?.substring(0, 250)}
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-3 ml-12 text-lg">
          <button>🤍</button>
          <button>💬</button>
          <button>🔁</button>
          <button>✈️</button>
        </div>
      </div>
    </div>
  );
}

function YouTubePreview({ variant, imageUrl }: { variant: PostVariant; imageUrl: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 max-w-xs mx-auto shadow-sm">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Thumbnail" className="w-full aspect-video object-cover" />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            0:45
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-red-600 bg-opacity-90 rounded-full flex items-center justify-center">
              <span className="text-white text-sm ml-0.5">▶</span>
            </div>
          </div>
        </div>
        <div className="p-3 flex gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            ▶
          </div>
          <div>
            <p className="text-xs font-semibold line-clamp-2">
              {variant.title || variant.caption?.substring(0, 80)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">My Channel · 0 views · just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}
