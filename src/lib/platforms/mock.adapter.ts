import type { IPlatformAdapter, PublishResult } from './adapter.interface';
import type { Platform, PostVariant, PlatformConnection } from '@/types';

export class MockPlatformAdapter implements IPlatformAdapter {
  readonly platform: Platform;
  private readonly displayNames: Record<Platform, string> = {
    facebook: 'My Facebook Page',
    instagram: '@my_instagram',
    threads: '@my_threads',
    youtube: 'My YouTube Channel',
  };

  constructor(platform: Platform) {
    this.platform = platform;
  }

  async isConnected(_userId: string): Promise<boolean> {
    return true;
  }

  getMockConnectionData(userId: string): PlatformConnection {
    return {
      id: `mock_conn_${this.platform}_${userId}`,
      platform: this.platform,
      platformUserId: `mock_uid_${this.platform}`,
      displayName: this.displayNames[this.platform],
      isActive: true,
      connectedAt: new Date().toISOString(),
    };
  }

  async publishPost(
    variant: PostVariant,
    _mediaUrls: string[],
    _connection: PlatformConnection
  ): Promise<PublishResult> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const mockPostId = `mock_${this.platform}_${Date.now()}`;
    const urlMap: Record<Platform, string> = {
      facebook: `https://facebook.com/posts/${mockPostId}`,
      instagram: `https://instagram.com/p/${mockPostId}`,
      threads: `https://threads.net/t/${mockPostId}`,
      youtube: `https://youtube.com/watch?v=${mockPostId}`,
    };

    console.log(`[MOCK] Published to ${this.platform}: "${variant.caption?.substring(0, 50)}..."`);

    return {
      success: true,
      platformPostId: mockPostId,
      platformPostUrl: urlMap[this.platform],
    };
  }
}
