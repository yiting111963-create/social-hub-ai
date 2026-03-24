import { StyleProfilePanel } from '@/components/style-profile/StyleProfilePanel';

export default function StyleProfilePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Style Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Your AI-analyzed writing style used for content generation.
        </p>
      </div>
      <StyleProfilePanel />
    </div>
  );
}
