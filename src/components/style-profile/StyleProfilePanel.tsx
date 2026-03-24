'use client';
import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2, Upload } from 'lucide-react';

const MOCK_STYLE = {
  tone: 'Warm & Casual',
  emojiFrequency: 2.3,
  avgLength: 145,
  commonEmojis: ['✨', '🔥', '💯', '🙏', '❤️'],
  topHashtags: ['#foodie', '#travel', '#lifestyle', '#viral', '#trending', '#inspo'],
  ctaPatterns: ['Link in bio 👆', 'Follow for more!', 'Save this post!', 'Tag a friend 🏷️'],
  postsAnalyzed: 24,
};

export function StyleProfilePanel() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAnalyzing(false);
    setAnalyzed(true);
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <strong>How it works:</strong> Upload 10–20 of your best past posts below, and the AI will
        learn your unique writing style to generate matching content automatically.
      </div>

      {/* Upload training posts */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          Training Posts
        </h3>
        <textarea
          placeholder={`Paste your past captions here (one per line):\n\n✨ Just had the most amazing hotpot experience...\n🌸 Cherry blossom season is officially here...`}
          rows={6}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <button
          onClick={handleReanalyze}
          disabled={analyzing}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {analyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {analyzing ? 'Analyzing...' : 'Analyze My Style'}
        </button>
      </div>

      {/* Style profile display */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Your Style Fingerprint</h3>
          </div>
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            {analyzing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Re-analyze
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          Based on {MOCK_STYLE.postsAnalyzed} analyzed posts
          {analyzed && <span className="text-green-600 ml-2">· Updated just now ✓</span>}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">Tone</p>
            <p className="text-sm font-bold text-blue-900">{MOCK_STYLE.tone}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-xs text-purple-600 font-medium mb-1">Avg Length</p>
            <p className="text-sm font-bold text-purple-900">{MOCK_STYLE.avgLength} chars</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-xs text-orange-600 font-medium mb-1">Emojis/Post</p>
            <p className="text-sm font-bold text-orange-900">{MOCK_STYLE.emojiFrequency}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Common Emojis
            </p>
            <div className="flex gap-2">
              {MOCK_STYLE.commonEmojis.map((emoji, i) => (
                <span key={i} className="text-2xl">
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Top Hashtags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MOCK_STYLE.topHashtags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Call-to-Actions
            </p>
            <div className="space-y-1.5">
              {MOCK_STYLE.ctaPatterns.map((cta, i) => (
                <p
                  key={i}
                  className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                >
                  &ldquo;{cta}&rdquo;
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
