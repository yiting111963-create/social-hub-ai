import type { Platform, PostVariant, PlatformConnection } from '@/types';

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
}

export interface IPlatformAdapter {
  readonly platform: Platform;
  isConnected(userId: string): Promise<boolean>;
  getMockConnectionData(userId: string): PlatformConnection;
  publishPost(
    variant: PostVariant,
    mediaUrls: string[],
    connection: PlatformConnection
  ): Promise<PublishResult>;
}
