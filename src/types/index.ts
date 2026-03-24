export type Platform = 'facebook' | 'instagram' | 'threads' | 'youtube';

export interface MediaAsset {
  id: string;
  userId: string;
  blobUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSec?: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface StyleProfile {
  id: string;
  userId: string;
  platform: string;
  tone: string;
  toneScore: Record<string, number>;
  avgCaptionLength: number;
  commonEmojis: string[];
  emojiFrequency: number;
  hashtagPatterns: string[];
  hashtagCountAvg: number;
  sentenceStarters: string[];
  ctaPatterns: string[];
  lastAnalyzedAt: string;
  postsAnalyzed: number;
}

export interface PostVariant {
  id: string;
  postId: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  isEnabled: boolean;
  charCount: number;
  publishStatus: 'pending' | 'published' | 'failed' | 'skipped';
  publishError?: string;
  publishedAt?: string;
}

export interface Post {
  id: string;
  userId: string;
  topicInput: string;
  status: 'draft' | 'review' | 'scheduled' | 'publishing' | 'published' | 'failed';
  mediaAssetIds: string[];
  aiImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  variants?: PostVariant[];
}

export interface PlatformConnection {
  id: string;
  platform: Platform;
  platformUserId?: string;
  displayName?: string;
  isActive: boolean;
  connectedAt: string;
}

export interface GeneratedContent {
  facebook?: { caption: string; hashtags: string[] };
  instagram?: { caption: string; hashtags: string[] };
  threads?: { caption: string };
  youtube?: { title: string; description: string; hashtags: string[] };
}

export interface ComposerState {
  topic: string;
  selectedPlatforms: Platform[];
  uploadedMedia: MediaAsset[];
  imageCount: 1 | 2 | 4;
  generationStatus: 'idle' | 'analyzing-style' | 'generating-text' | 'generating-image' | 'complete' | 'error';
  generationProgress: number;
  generationError?: string;
  postId: string | null;
  variants: Partial<Record<Platform, PostVariant>>;
  activePreviewPlatform: Platform;
  scheduleDateTime: Date | null;
  publishStatus: 'idle' | 'publishing' | 'scheduled' | 'done' | 'error';
  aiImageUrls: string[];         // supports multiple generated images
  selectedAiImageIndex: number;  // which generated image is active
}

export const PLATFORM_LIMITS: Record<Platform, { caption: number; title?: number; description?: number }> = {
  facebook: { caption: 63206 },
  instagram: { caption: 2200 },
  threads: { caption: 500 },
  youtube: { caption: 5000, title: 100, description: 5000 },
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  threads: '#000000',
  youtube: '#FF0000',
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  threads: 'Threads',
  youtube: 'YouTube',
};
