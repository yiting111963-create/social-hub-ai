-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Platform connections
CREATE TABLE IF NOT EXISTS public.platform_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK (platform IN ('facebook','instagram','threads','youtube')),
  platform_user_id TEXT,
  display_name     TEXT,
  access_token     TEXT NOT NULL DEFAULT 'mock_token',
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes           TEXT[],
  is_active        BOOLEAN DEFAULT TRUE,
  connected_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Style profiles
CREATE TABLE IF NOT EXISTS public.style_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform            TEXT NOT NULL DEFAULT 'global',
  tone                TEXT DEFAULT 'casual',
  tone_score          JSONB DEFAULT '{"casual": 0.7, "formal": 0.3}',
  avg_caption_length  INTEGER DEFAULT 150,
  common_emojis       TEXT[] DEFAULT ARRAY['✨','🔥','💯'],
  emoji_frequency     FLOAT DEFAULT 2.5,
  hashtag_patterns    TEXT[] DEFAULT ARRAY['#trending','#viral'],
  hashtag_count_avg   FLOAT DEFAULT 5.0,
  sentence_starters   TEXT[] DEFAULT ARRAY['Check out','Just launched'],
  cta_patterns        TEXT[] DEFAULT ARRAY['Link in bio','Follow for more'],
  last_analyzed_at    TIMESTAMPTZ DEFAULT NOW(),
  posts_analyzed      INTEGER DEFAULT 0,
  raw_analysis        JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Media assets
CREATE TABLE IF NOT EXISTS public.media_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blob_url      TEXT NOT NULL,
  blob_key      TEXT NOT NULL DEFAULT '',
  file_name     TEXT NOT NULL,
  file_type     TEXT NOT NULL,
  file_size     INTEGER NOT NULL DEFAULT 0,
  width         INTEGER,
  height        INTEGER,
  duration_sec  FLOAT,
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_input     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','review','scheduled','publishing','published','failed')),
  media_asset_ids UUID[],
  ai_image_url    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Post variants (one per platform per post)
CREATE TABLE IF NOT EXISTS public.post_variants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK (platform IN ('facebook','instagram','threads','youtube')),
  caption          TEXT,
  hashtags         TEXT[],
  title            TEXT,
  description      TEXT,
  thumbnail_url    TEXT,
  is_enabled       BOOLEAN DEFAULT TRUE,
  char_count       INTEGER,
  platform_post_id TEXT,
  publish_status   TEXT DEFAULT 'pending'
                   CHECK (publish_status IN ('pending','published','failed','skipped')),
  publish_error    TEXT,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, platform)
);

-- Schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id       UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','processing','completed','cancelled','failed')),
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_due
  ON public.schedules(scheduled_for, status)
  WHERE status = 'pending';

-- Post history log
CREATE TABLE IF NOT EXISTS public.post_history_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id     UUID NOT NULL REFERENCES public.posts(id),
  variant_id  UUID REFERENCES public.post_variants(id),
  platform    TEXT,
  event       TEXT NOT NULL,
  metadata    JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profiles" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_connections" ON public.platform_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_style_profiles" ON public.style_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_media" ON public.media_assets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_posts" ON public.posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.post_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_variants" ON public.post_variants
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_schedules" ON public.schedules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.post_history_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_history" ON public.post_history_log
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
