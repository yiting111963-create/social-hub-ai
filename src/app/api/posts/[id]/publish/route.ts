import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/platforms/registry';
import type { Platform, PostVariant, PlatformConnection } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { mode, variants, scheduledFor } = await req.json();

    if (mode === 'scheduled' && scheduledFor) {
      return NextResponse.json({
        success: true,
        mode: 'scheduled',
        scheduledFor,
        postId,
      });
    }

    // Immediate publish — call all platform adapters
    const results: Record<string, unknown> = {};

    for (const [platform, variant] of Object.entries(variants || {})) {
      const adapter = getAdapter(platform as Platform);
      const mockConnection: PlatformConnection = {
        id: `conn_${platform}`,
        platform: platform as Platform,
        displayName: `Demo ${platform}`,
        isActive: true,
        connectedAt: new Date().toISOString(),
      };

      const result = await adapter.publishPost(
        variant as PostVariant,
        [],
        mockConnection
      );

      results[platform] = result;
    }

    return NextResponse.json({
      success: true,
      mode: 'immediate',
      postId,
      results,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 });
  }
}
