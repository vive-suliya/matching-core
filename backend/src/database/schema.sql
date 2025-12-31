-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS 지리 데이터
  preferences JSONB DEFAULT '{}'::jsonb, -- 매칭 선호도
  metadata JSONB DEFAULT '{}'::jsonb, -- 확장 가능한 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users (last_active_at);
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);

-- Teams 테이블
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT, -- 'sports', 'gaming', 'study' 등
  location GEOGRAPHY(POINT, 4326),
  max_members INT DEFAULT 10,
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_category ON teams (category);
CREATE INDEX IF NOT EXISTS idx_teams_location ON teams USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams (owner_id);

-- Team Members 테이블
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members (user_id);

-- Matching Requests 테이블
CREATE TABLE IF NOT EXISTS matching_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL, -- user or team id
  requester_type TEXT NOT NULL CHECK (requester_type IN ('user', 'team')),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'team')),
  strategy TEXT NOT NULL DEFAULT 'distance', -- 'distance', 'preference', 'skill'
  filters JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_matching_requests_requester ON matching_requests (requester_id, requester_type);
CREATE INDEX IF NOT EXISTS idx_matching_requests_status ON matching_requests (status);
CREATE INDEX IF NOT EXISTS idx_matching_requests_expires ON matching_requests (expires_at);

-- Matches 테이블
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES matching_requests(id) ON DELETE SET NULL,
  entity_a_id UUID NOT NULL,
  entity_a_type TEXT NOT NULL CHECK (entity_a_type IN ('user', 'team')),
  entity_b_id UUID NOT NULL,
  entity_b_type TEXT NOT NULL CHECK (entity_b_type IN ('user', 'team')),
  score NUMERIC(5, 2) NOT NULL, -- 0.00 ~ 100.00
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'expired')),
  metadata JSONB DEFAULT '{}'::jsonb, -- 스코어링 상세 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 days'
);

CREATE INDEX IF NOT EXISTS idx_matches_entity_a ON matches (entity_a_id, entity_a_type);
CREATE INDEX IF NOT EXISTS idx_matches_entity_b ON matches (entity_b_id, entity_b_type);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_request ON matches (request_id);

-- Match Interactions 테이블
CREATE TABLE IF NOT EXISTS match_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'team')),
  action TEXT NOT NULL CHECK (action IN ('view', 'accept', 'reject')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_interactions_match ON match_interactions (match_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_actor ON match_interactions (actor_id, actor_type);

-- Reviews 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('user', 'team')),
  reviewee_id UUID NOT NULL,
  reviewee_type TEXT NOT NULL CHECK (reviewee_type IN ('user', 'team')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, reviewer_id, reviewer_type)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews (reviewee_id, reviewee_type);
CREATE INDEX IF NOT EXISTS idx_reviews_match ON reviews (match_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Simple versions for dev)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Users can view own matches" ON matches FOR SELECT USING (
  (entity_a_type = 'user' AND entity_a_id = auth.uid()) OR
  (entity_b_type = 'user' AND entity_b_id = auth.uid()) OR
  auth.role() = 'service_role' -- Allow backend service role to access all
);
