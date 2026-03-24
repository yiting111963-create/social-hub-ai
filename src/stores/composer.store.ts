'use client';
import { create } from 'zustand';
import type { ComposerState, Platform, MediaAsset, PostVariant } from '@/types';

interface ComposerStore extends ComposerState {
  setTopic: (topic: string) => void;
  togglePlatform: (platform: Platform) => void;
  addMedia: (asset: MediaAsset) => void;
  removeMedia: (id: string) => void;
  setImageCount: (count: 1 | 2 | 4) => void;
  setGenerationStatus: (status: ComposerState['generationStatus'], progress?: number) => void;
  setGenerationError: (error: string) => void;
  setPostId: (id: string) => void;
  setVariants: (variants: Partial<Record<Platform, PostVariant>>) => void;
  updateVariant: (platform: Platform, updates: Partial<PostVariant>) => void;
  setActivePreview: (platform: Platform) => void;
  setScheduleDateTime: (date: Date | null) => void;
  setPublishStatus: (status: ComposerState['publishStatus']) => void;
  setAiImageUrls: (urls: string[]) => void;
  setSelectedAiImageIndex: (index: number) => void;
  reset: () => void;
}

const initialState: ComposerState = {
  topic: '',
  selectedPlatforms: ['instagram', 'facebook'],
  uploadedMedia: [],
  imageCount: 1,
  generationStatus: 'idle',
  generationProgress: 0,
  postId: null,
  variants: {},
  activePreviewPlatform: 'instagram',
  scheduleDateTime: null,
  publishStatus: 'idle',
  aiImageUrls: [],
  selectedAiImageIndex: 0,
};

export const useComposerStore = create<ComposerStore>((set) => ({
  ...initialState,

  setTopic: (topic) => set({ topic }),

  togglePlatform: (platform) =>
    set((state) => ({
      selectedPlatforms: state.selectedPlatforms.includes(platform)
        ? state.selectedPlatforms.filter((p) => p !== platform)
        : [...state.selectedPlatforms, platform],
    })),

  addMedia: (asset) =>
    set((state) => ({ uploadedMedia: [...state.uploadedMedia, asset] })),

  removeMedia: (id) =>
    set((state) => ({
      uploadedMedia: state.uploadedMedia.filter((m) => m.id !== id),
    })),

  setImageCount: (count) => set({ imageCount: count }),

  setGenerationStatus: (status, progress) =>
    set((state) => ({
      generationStatus: status,
      generationProgress: progress !== undefined ? progress : state.generationProgress,
    })),

  setGenerationError: (error) =>
    set({ generationStatus: 'error', generationError: error }),

  setPostId: (id) => set({ postId: id }),

  setVariants: (variants) =>
    set({
      variants,
      activePreviewPlatform: (Object.keys(variants)[0] as Platform) || 'instagram',
    }),

  updateVariant: (platform, updates) =>
    set((state) => ({
      variants: {
        ...state.variants,
        [platform]: { ...state.variants[platform], ...updates },
      },
    })),

  setActivePreview: (platform) => set({ activePreviewPlatform: platform }),

  setScheduleDateTime: (date) => set({ scheduleDateTime: date }),

  setPublishStatus: (status) => set({ publishStatus: status }),

  setAiImageUrls: (urls) => set({ aiImageUrls: urls, selectedAiImageIndex: 0 }),

  setSelectedAiImageIndex: (index) => set({ selectedAiImageIndex: index }),

  reset: () => set(initialState),
}));
