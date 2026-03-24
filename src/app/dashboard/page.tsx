import { ComposerPanel } from '@/components/composer/ComposerPanel';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Upload media or enter a topic — AI will generate platform-optimized content for you.
        </p>
      </div>
      <ComposerPanel />
    </div>
  );
}
