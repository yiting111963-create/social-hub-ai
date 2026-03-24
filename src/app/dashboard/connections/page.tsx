import { ConnectionsPanel } from '@/components/connections/ConnectionsPanel';

export default function ConnectionsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Connections</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Connect your social media accounts to enable publishing.
        </p>
      </div>
      <ConnectionsPanel />
    </div>
  );
}
