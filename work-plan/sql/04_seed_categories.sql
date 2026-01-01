BEGIN;

DO $$
BEGIN
  -- 1. 카테고리 초기화
  UPDATE users SET categories = '{}' WHERE categories IS NULL;
  UPDATE teams SET categories = '{}' WHERE categories IS NULL;

  -- 2. 유저별 카테고리 시드
  UPDATE users SET categories = '{sports, soccer}' WHERE username = 'alice';
  UPDATE users SET categories = '{gaming, rpg, fps}' WHERE username = 'bob';
  UPDATE users SET categories = '{gaming, strategy}' WHERE username = 'charlie';
  UPDATE users SET categories = '{travel, hiking}' WHERE username = 'dave';
  UPDATE users SET categories = '{sports, fitness, yoga}' WHERE username = 'eve';

  -- 3. 팀별 카테고리 시드
  UPDATE teams SET categories = '{sports, soccer, football}' WHERE name = 'FC Seoul';
  UPDATE teams SET categories = '{gaming, esports, competitive}' WHERE name = 'Busan Gamers';
  UPDATE teams SET categories = '{study, programming, math}' WHERE name = 'Study Group A';
  UPDATE teams SET categories = '{travel, hiking, nature}' WHERE name = 'Hiking Club';

  RAISE NOTICE 'Categories seeded successfully within transaction';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error seeding categories: %', SQLERRM;
    ROLLBACK;
    RETURN;
END $$;

COMMIT;
