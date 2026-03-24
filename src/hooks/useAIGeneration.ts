'use client';
import { useComposerStore } from '@/stores/composer.store';
import type { Platform, PostVariant } from '@/types';

export function useAIGeneration() {
  const store = useComposerStore();

  const generate = async () => {
    const { topic, selectedPlatforms, uploadedMedia, imageCount } = store;

    if (!topic.trim() || selectedPlatforms.length === 0) return;

    store.setGenerationStatus('analyzing-style', 10);

    try {
      // Step 1: Generate text content
      store.setGenerationStatus('generating-text', 30);
      const contentRes = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platforms: selectedPlatforms,
          hasMedia: uploadedMedia.length > 0,
        }),
      });

      if (!contentRes.ok) throw new Error('內容生成失敗');
      const { postId, variants } = await contentRes.json();
      store.setPostId(postId);

      // Step 2: Generate images only if no media uploaded
      let imageUrls: string[] = [];
      if (uploadedMedia.length === 0) {
        store.setGenerationStatus('generating-image', 60);
        try {
          // Single API call requesting all images at once
          const imageRes = await fetch('/api/ai/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, aspectRatio: '1:1', count: imageCount }),
          });
          if (imageRes.ok) {
            const data = await imageRes.json();
            // Prefer imageUrls array (multiple), fall back to single imageUrl
            imageUrls = data.imageUrls ?? (data.imageUrl ? [data.imageUrl] : []);
            store.setAiImageUrls(imageUrls);
          }
        } catch {
          // Non-fatal
        }
      }

      const firstImageUrl = uploadedMedia[0]?.blobUrl || imageUrls[0];

      // Map API response to PostVariant objects
      const mappedVariants: Partial<Record<Platform, PostVariant>> = {};
      for (const platform of selectedPlatforms) {
        const v = variants[platform];
        if (v) {
          mappedVariants[platform] = {
            id: `variant_${platform}_${Date.now()}`,
            postId,
            platform,
            caption: v.caption || v.description || '',
            hashtags: v.hashtags || [],
            title: v.title,
            description: v.description,
            thumbnailUrl: firstImageUrl,
            isEnabled: true,
            charCount: (v.caption || '').length,
            publishStatus: 'pending',
          };
        }
      }

      store.setVariants(mappedVariants);
      store.setGenerationStatus('complete', 100);
    } catch (err) {
      store.setGenerationError(err instanceof Error ? err.message : '生成失敗，請再試一次');
    }
  };

  return { generate };
}
