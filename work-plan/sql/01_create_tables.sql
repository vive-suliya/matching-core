-- 1. Users 테이블 (참고용 - 이미 생성됨)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location GEOGRAPHY(POINT, 4326),
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teams 테이블
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  location GEOGRAPHY(POINT, 4326),
  max_members INT DEFAULT 10,
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Matching Requests 테이블
CREATE TABLE IF NOT EXISTS matching_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  requester_type TEXT NOT NULL CHECK (requester_type IN ('user', 'team')),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'team')),
  strategy TEXT NOT NULL DEFAULT 'distance',
  filters JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- 4. Matches 테이블
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES matching_requests(id) ON DELETE SET NULL,
  entity_a_id UUID NOT NULL,
  entity_a_type TEXT NOT NULL,
  entity_b_id UUID NOT NULL,
  entity_b_type TEXT NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  status TEXT DEFAULT 'proposed',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 days'
);

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_requests ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (개발용)
CREATE POLICY "Enable read/write for all" ON users FOR ALL USING (true);
CREATE POLICY "Enable read/write for all" ON teams FOR ALL USING (true);
CREATE POLICY "Enable read/write for all" ON matches FOR ALL USING (true);
CREATE POLICY "Enable read/write for all" ON matching_requests FOR ALL USING (true);
