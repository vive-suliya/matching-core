-- 1. Add categories column (Safe with IF NOT EXISTS)
ALTER TABLE users ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- 2. Add settings column to matching_requests
ALTER TABLE matching_requests ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "useDistance": true,
  "usePreference": true,
  "distanceWeight": 0.7,
  "preferenceWeight": 0.3,
  "enableExplanation": true,
  "enableNegativeFilter": true
}'::jsonb;

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_teams_location ON teams USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_users_categories ON users USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_teams_categories ON teams USING GIN (categories);

-- 4. Advanced Search Function v3 (Optimized & Feature Rich)
CREATE OR REPLACE FUNCTION get_candidates_v2(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius DOUBLE PRECISION,
  p_target_type TEXT,
  p_excluded_ids UUID[] DEFAULT '{}',
  p_use_negative_filter BOOLEAN DEFAULT TRUE,
  p_requester_id UUID DEFAULT NULL,
  p_required_categories TEXT[] DEFAULT '{}',
  p_max_results INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  display_name TEXT,
  location GEOGRAPHY,
  categories TEXT[],
  distance DOUBLE PRECISION,
  common_categories TEXT[],
  category_match_score NUMERIC
) AS $$
DECLARE
  v_final_excluded_ids UUID[];
BEGIN
  v_final_excluded_ids := COALESCE(p_excluded_ids, '{}'::UUID[]);

  -- 거절된 매칭 상대 제외 로직 (Negative Filter)
  IF p_use_negative_filter AND p_requester_id IS NOT NULL THEN
    SELECT ARRAY_AGG(DISTINCT entity_b_id) INTO v_final_excluded_ids
    FROM (
      SELECT entity_b_id FROM matches WHERE entity_a_id = p_requester_id AND status = 'rejected'
      UNION
      SELECT unnest(v_final_excluded_ids)
    ) s;
  END IF;

  IF p_target_type = 'user' THEN
    RETURN QUERY
    SELECT 
      u.id, 
      'user'::TEXT as type, 
      u.display_name, 
      u.location, 
      u.categories,
      ST_Distance(u.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) as distance,
      ARRAY(SELECT cat FROM unnest(u.categories) cat WHERE cat = ANY(p_required_categories)) as common_categories,
      CASE 
        WHEN array_length(p_required_categories, 1) IS NULL OR array_length(p_required_categories, 1) = 0 THEN 0
        ELSE (cardinality(ARRAY(SELECT cat FROM unnest(u.categories) cat WHERE cat = ANY(p_required_categories)))::NUMERIC / cardinality(p_required_categories)::NUMERIC * 100)
      END as category_match_score
    FROM users u
    WHERE ST_DWithin(u.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius)
      AND (u.id != ALL(v_final_excluded_ids))
      AND (p_requester_id IS NULL OR u.id != p_requester_id) -- 자기 자신 제외
    ORDER BY distance ASC
    LIMIT p_max_results;
  ELSE
    RETURN QUERY
    SELECT 
      t.id, 
      'team'::TEXT as type, 
      t.name as display_name, 
      t.location, 
      t.categories,
      ST_Distance(t.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) as distance,
      ARRAY(SELECT cat FROM unnest(t.categories) cat WHERE cat = ANY(p_required_categories)) as common_categories,
      CASE 
        WHEN array_length(p_required_categories, 1) IS NULL OR array_length(p_required_categories, 1) = 0 THEN 0
        ELSE (cardinality(ARRAY(SELECT cat FROM unnest(t.categories) cat WHERE cat = ANY(p_required_categories)))::NUMERIC / cardinality(p_required_categories)::NUMERIC * 100)
      END as category_match_score
    FROM teams t
    WHERE ST_DWithin(t.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius)
      AND (t.id != ALL(v_final_excluded_ids))
    ORDER BY distance ASC
    LIMIT p_max_results;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
