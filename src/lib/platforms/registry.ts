import type { IPlatformAdapter } from './adapter.interface';
import { MockPlatformAdapter } from './mock.adapter';
import type { Platform } from '@/types';

const adapters: Record<Platform, IPlatformAdapter> = {
  facebook: new MockPlatformAdapter('facebook'),
  instagram: new MockPlatformAdapter('instagram'),
  threads: new MockPlatformAdapter('threads'),
  youtube: new MockPlatformAdapter('youtube'),
};

export function getAdapter(platform: Platform): IPlatformAdapter {
  return adapters[platform];
}

export function getAllAdapters(): IPlatformAdapter[] {
  return Object.values(adapters);
}
