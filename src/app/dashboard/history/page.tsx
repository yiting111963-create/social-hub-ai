import { PostHistoryTable } from '@/components/history/PostHistoryTable';

export default function HistoryPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post History</h1>
        <p className="text-gray-500 mt-1 text-sm">View all your published and scheduled posts.</p>
      </div>
      <PostHistoryTable />
    </div>
  );
}
