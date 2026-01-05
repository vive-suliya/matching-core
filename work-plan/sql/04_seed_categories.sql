-- 1. 카테고리 초기화
UPDATE users SET categories = '{}' WHERE categories IS NULL;
UPDATE teams SET categories = '{}' WHERE categories IS NULL;

-- 2. 유저별 카테고리 시드 (존재하는 경우만 업데이트)
UPDATE users SET categories = '{sports, soccer}' WHERE username = 'alice';
UPDATE users SET categories = '{gaming, rpg, fps}' WHERE username = 'bob';
UPDATE users SET categories = '{gaming, strategy}' WHERE username = 'charlie';
UPDATE users SET categories = '{travel, hiking}' WHERE username = 'dave';
UPDATE users SET categories = '{sports, fitness, yoga}' WHERE username = 'eve';

-- 3. 팀별 카테고리 시드 (존재하는 경우만 업데이트)
UPDATE teams SET categories = '{sports, soccer, football}' WHERE name = 'FC Seoul';
UPDATE teams SET categories = '{gaming, esports, competitive}' WHERE name = 'Busan Gamers';
UPDATE teams SET categories = '{study, programming, math}' WHERE name = 'Study Group A';
UPDATE teams SET categories = '{travel, hiking, nature}' WHERE name = 'Hiking Club';

-- 4. 결과 출력 및 검증
DO $$
DECLARE
  updated_users INT;
  updated_teams INT;
BEGIN
  SELECT COUNT(*) INTO updated_users FROM users WHERE categories != '{}';
  SELECT COUNT(*) INTO updated_teams FROM teams WHERE categories != '{}';
  RAISE NOTICE 'Categories seeded successfully: % users, % teams updated', updated_users, updated_teams;
END $$;
