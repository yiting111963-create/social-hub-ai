'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import type { Post } from '@/types';

const STATUS_STYLES: Record<Post['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  publishing: 'bg-orange-100 text-orange-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'demo',
    topicInput: '今天火鍋店爆滿，客人都愛新的麻辣湯底！',
    status: 'published',
    mediaAssetIds: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    userId: 'demo',
    topicInput: '東京賞櫻心得，美到讓人屏息的景色',
    status: 'scheduled',
    mediaAssetIds: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    userId: 'demo',
    topicInput: 'Launching new sustainable product line — everyday essentials',
    status: 'draft',
    mediaAssetIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function PostHistoryTable() {
  const [posts] = useState<Post[]>(MOCK_POSTS);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {posts.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Create your first post from the dashboard</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Topic</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm text-gray-900 line-clamp-1 max-w-sm">{post.topicInput}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[post.status]}`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs text-gray-500">
                    {format(new Date(post.createdAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
