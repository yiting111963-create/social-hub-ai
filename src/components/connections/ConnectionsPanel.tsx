'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@/types';
import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

const PLATFORMS: Platform[] = ['facebook', 'instagram', 'threads', 'youtube'];

const PLATFORM_DESCRIPTIONS: Record<Platform, string> = {
  facebook: 'Publish to your Facebook Page',
  instagram: 'Post to your Instagram Business account',
  threads: 'Share threads and text posts',
  youtube: 'Upload YouTube Shorts & videos',
};

const PLATFORM_SCOPES: Record<Platform, string> = {
  facebook: 'pages_manage_posts, pages_read_engagement',
  instagram: 'instagram_basic, instagram_content_publish',
  threads: 'threads_basic, threads_content_publish',
  youtube: 'youtube.upload, youtube.readonly',
};

export function ConnectionsPanel() {
  const [connected, setConnected] = useState<Partial<Record<Platform, boolean>>>({
    instagram: true,
    facebook: true,
  });
  const [loading, setLoading] = useState<Platform | null>(null);

  const handleConnect = async (platform: Platform) => {
    setLoading(platform);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConnected((prev) => ({ ...prev, [platform]: true }));
    setLoading(null);
  };

  const handleDisconnect = async (platform: Platform) => {
    if (!confirm(`Disconnect ${PLATFORM_LABELS[platform]}?`)) return;
    setLoading(platform);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setConnected((prev) => ({ ...prev, [platform]: false }));
    setLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Demo mode:</strong> Platform connections are simulated. Add real OAuth credentials in{' '}
        <code className="text-xs bg-blue-100 px-1.5 py-0.5 rounded">.env.local</code> to enable live publishing.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const isConnected = connected[platform];
          const isLoading = loading === platform;
          const color = PLATFORM_COLORS[platform];

          return (
            <div
              key={platform}
              className={cn(
                'bg-white rounded-xl border p-5 transition-all shadow-sm',
                isConnected ? 'border-green-200' : 'border-gray-200'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {PLATFORM_LABELS[platform].charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {PLATFORM_LABELS[platform]}
                    </p>
                    <p className="text-xs text-gray-500">{PLATFORM_DESCRIPTIONS[platform]}</p>
                  </div>
                </div>
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
              </div>

              {isConnected && (
                <p className="text-xs text-gray-500 mb-3 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  Connected: <span className="font-medium text-gray-700">Demo Account</span>
                </p>
              )}

              {!isConnected && (
                <p className="text-xs text-gray-400 mb-3">
                  Permissions: {PLATFORM_SCOPES[platform]}
                </p>
              )}

              <button
                onClick={() =>
                  isConnected ? handleDisconnect(platform) : handleConnect(platform)
                }
                disabled={isLoading}
                className={cn(
                  'w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2',
                  isConnected
                    ? 'border border-red-200 text-red-600 hover:bg-red-50'
                    : 'text-white hover:opacity-90'
                )}
                style={!isConnected ? { backgroundColor: color } : {}}
              >
                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {isConnected ? 'Disconnect' : 'Connect Account'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
