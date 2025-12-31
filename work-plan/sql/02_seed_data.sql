-- Users
INSERT INTO users (id, email, username, display_name, location) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@test.com', 'alice', 'Alice', 'POINT(126.9780 37.5665)'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.com', 'bob', 'Bob', 'POINT(127.0276 37.4979)'),
  ('33333333-3333-3333-3333-333333333333', 'charlie@test.com', 'charlie', 'Charlie', 'POINT(129.0756 35.1796)'),
  ('44444444-4444-4444-4444-444444444444', 'dave@test.com', 'dave', 'Dave', 'POINT(126.7052 37.4563)'),
  ('55555555-5555-5555-5555-555555555555', 'eve@test.com', 'eve', 'Eve', 'POINT(127.3845 36.3504)');

-- Teams
INSERT INTO teams (id, name, owner_id, category, location) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'FC Seoul', '11111111-1111-1111-1111-111111111111', 'sports', 'POINT(126.9780 37.5665)'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Busan Gamers', '33333333-3333-3333-3333-333333333333', 'gaming', 'POINT(129.0756 35.1796)'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Study Group A', '22222222-2222-2222-2222-222222222222', 'study', 'POINT(127.0276 37.4979)'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hiking Club', '44444444-4444-4444-4444-444444444444', 'travel', 'POINT(126.7052 37.4563)');

-- Check
SELECT count(*) FROM users;
