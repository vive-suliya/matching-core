# 🎯 Matching Enhancement & Intelligence Plan (2026-01-01)

본 문서는 매칭 엔진의 지능화, 속도 최적화 및 추가 기능 개발을 위한 상세 설계와 개발 워크플로우를 담고 있습니다. 모든 기능은 설정에 따라 활성화/비활성화(Toggleable)가 가능하도록 설계합니다.

---

## 🛠 1. 핵심 기능 상세 설계

### [A] PreferenceStrategy (관심사 기반 매칭)
- **개요**: 거리 외에 유저/팀의 `categories` 필드를 분석하여 일치 정도를 점수화합니다.
- **로직**: 
  - 공통 카테고리 수에 따른 가산점 부여.
  - 점수 계산: `(공통 카테고리 수 / 요청 카테고리 수) * 100`
- **Toggle**: `strategy_config.preference_enabled`

### [B] HybridStrategy (가중치 기반 종합 매칭)
- **개요**: Distance 점수와 Preference 점수를 결합하여 최종 점수 산출.
- **로직**:
  - `FinalScore = (DistanceScore * W1) + (PreferenceScore * W2)` (W1+W2 = 1.0)
- **Toggle**: 가중치 설정을 통해 특정 전략 배제 가능 (예: W1=1.0 이면 거리 전용).

### [C] PostGIS Spatial Query 최적화 (성능 핵심)
- **개요**: 인메모리 필터링을 제거하고 DB 수준에서 `ST_DWithin`을 사용해 효율적으로 후보 검색.
- **워크플로우**:
  1. `getCandidates` 메서드 내 Supabase RPC 또는 raw query 작성.
  2. 반경(Radius) 필터를 SQL 수준으로 이동.

---

## 🚀 2. 개발 로드맵 & 워크플로우

### **Step 1: 데이터 모델 및 서버 인프라 강화**
- [ ] `matching_requests` 테이블에 `strategy_settings` (JSONB) 컬럼 추가 (가중치 및 토글 저장용).
- [ ] Supabase RPC 함수 생성: `get_candidates_within_radius(lat, lng, radius)`

### **Step 2: 전략 고도화 (Today's Main Task)**
- [ ] `PreferenceStrategy` 클래스 구현.
- [ ] `HybridStrategy` 클래스 구현 및 `MatchingService` 등록.
- [ ] `MatchingService.getCandidates`를 PostGIS 최적화 버전으로 리팩토링.

### **Step 3: 지능형 부가 기능 구현 (Toggleable)**
- [ ] **Explainable Match**: 매칭 결과 객체에 `reason` 필드 추가.
- [ ] **Negative Filters**: `matches` 테이블의 `rejected` 기록을 조회하여 후보에서 제외하는 로직 추가.
- [ ] **Expiration Service**: `expires_at` 기준 만료 처리 백그라운드 작업.

---

## 🔧 3. 기능 토글(Toggle) 시스템 구조

모든 기능은 `strategy_settings` 옵션에 따라 동작합니다.

```json
{
  "useDistance": true,
  "usePreference": true,
  "distanceWeight": 0.7,
  "preferenceWeight": 0.3,
  "enableExplanation": true,
  "enableNegativeFilter": true
}
```

---

## 📋 오늘의 실천 워크플로우

1.  **DB 함수 작성**: Supabase에서 `ST_DWithin`을 사용하는 검색 함수 기획 및 실행.
2.  **Backend 리팩토링**: `MatchingService`의 후보 조회 로직을 DB 함수 호출로 교체.
3.  **신규 전략 구현**: `Preference` 및 `Hybrid` 전략 파일 생성 및 테스트.
4.  **Playground 연동**: 프론트엔드 UI에서 각 옵션을 켜고 끌 수 있는 토글 스위치 추가.

---

**이 워크플로우를 따라 차례대로 구현을 시작합니다. 준비되셨나요?**

---
---

## ✏️ Claude가 분석한 수정 필요 사항 (2026-01-01)

### 1. 타입 안전성 강화
- **현재 문제**: `strategy_settings`가 JSONB로 저장되어 타입 안전성이 부족
- **수정 방안**:
  - TypeScript 인터페이스 `StrategySettings` 정의
  - Zod 스키마를 사용한 런타임 검증 추가
  - 기본값(default values) 정의 필요

### 2. PostGIS 함수 파라미터 확장
- **현재 설계**: `get_candidates_within_radius(lat, lng, radius)`
- **개선 필요**:
  - `request_type` 파라미터 추가 (user/team 구분)
  - `excluded_ids` 배열 파라미터 추가 (negative filter용)
  - `categories` 배열 파라미터 추가 (preference matching용)
  - 반환 타입에 거리 정보 포함

### 3. 에러 처리 및 폴백 전략
- **누락된 부분**:
  - PostGIS 쿼리 실패 시 폴백 로직
  - 후보가 0건일 때의 처리 방안
  - 타임아웃 설정 및 처리
  - 로깅 전략

### 4. 테스트 계획 추가 필요
- **필요한 테스트**:
  - Unit Tests: 각 Strategy 클래스별 점수 계산 테스트
  - Integration Tests: PostGIS 함수 호출 및 결과 검증
  - Performance Tests: 대용량 데이터 기준 응답 시간 측정
  - Edge Cases: 경계값, null 처리, 빈 배열 등

### 5. 마이그레이션 전략 명시
- **추가 필요**:
  - `strategy_settings` 컬럼 추가 마이그레이션 SQL
  - 기존 데이터 마이그레이션 계획 (기본값 설정)
  - 롤백 계획

### 6. 모니터링 및 관찰성
- **추가 권장**:
  - 각 전략별 사용 빈도 추적
  - 평균 매칭 시간 메트릭
  - 후보 수 분포 모니터링
  - 전략별 성공률 추적

### 7. API 명세 문서화
- **필요 사항**:
  - `strategy_settings` 각 필드의 유효 범위 명시
  - Request/Response 스키마 예시
  - 에러 코드 정의
  - Rate limiting 정책

### 8. 성능 최적화 고려사항
- **추가 검토 필요**:
  - PostGIS spatial index 존재 여부 확인
  - `categories` 컬럼에 GIN index 추가 검토
  - 쿼리 결과 캐싱 전략 (Redis 등)
  - Connection pooling 설정

### 9. 설정 검증 로직
- **구현 필요**:
  - `distanceWeight + preferenceWeight = 1.0` 검증
  - 각 weight 값의 범위 검증 (0.0 ~ 1.0)
  - 상호 배타적 설정 조합 검증
  - 필수 필드 누락 검증

### 10. 문서화 개선
- **추가 필요**:
  - 각 전략의 점수 계산 공식 예시
  - 실제 사용 시나리오별 설정 예시
  - 성능 벤치마크 결과
  - FAQ 섹션

---

## 🔍 코드 검토 결과 및 개선 사항 (2026-01-01)

### ✅ 잘 구현된 부분

1. **타입 안전성** ✓
   - [strategy-settings.dto.ts](backend/src/modules/matching/dto/strategy-settings.dto.ts): Zod 스키마와 class-validator 모두 구현
   - 가중치 합계 검증 로직 포함 (line 49-58)

2. **PostGIS 최적화** ✓
   - [03_migration_v2.sql](work-plan/sql/03_migration_v2.sql): `get_candidates_v2` 함수 구현
   - ST_DWithin 사용한 공간 쿼리 최적화
   - GIN/GIST 인덱스 생성 (line 16-19)

3. **전략 패턴 구현** ✓
   - PreferenceStrategy, HybridStrategy 모두 구현
   - 설명(explanation) 생성 기능 포함

4. **Negative Filter** ✓
   - SQL 함수에서 거절된 매칭 제외 로직 구현 (line 46-53)

### ⚠️ 발견된 문제점 및 수정 필요 사항

#### 1. SQL - 04_seed_categories.sql

**문제점:**
- 카테고리 시드 데이터가 누락된 사용자/팀이 있을 수 있음
- 에러 핸들링 부재
- 트랜잭션 처리 없음

**수정 필요:**

```sql
-- 파일 시작 부분에 추가
BEGIN;

-- 존재하지 않는 레코드 업데이트 시 에러 방지
DO $$
BEGIN
  -- Add categories to users (존재하는 경우에만 업데이트)
  UPDATE users SET categories = '{sports, soccer}' WHERE username = 'alice' AND EXISTS (SELECT 1 FROM users WHERE username = 'alice');
  -- ... 나머지 업데이트도 동일하게

  -- 카테고리가 NULL인 레코드를 빈 배열로 초기화
  UPDATE users SET categories = '{}' WHERE categories IS NULL;
  UPDATE teams SET categories = '{}' WHERE categories IS NULL;

  RAISE NOTICE 'Categories seeded successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error seeding categories: %', SQLERRM;
END $$;

COMMIT;
```

#### 2. Backend - matching.service.ts

**문제점 #1: 에러 핸들링 미흡**
- [matching.service.ts:202-209](backend/src/modules/matching/matching.service.ts#L202-L209): RPC 호출 실패 시 fallback 호출하지만, fallback도 실패할 수 있음

**수정 필요:**
```typescript
private async getCandidates(request: any, settings: any): Promise<MatchableEntity[]> {
  console.log(`[MatchingService] Fetching candidates...`);

  const lat = request.filters?.location?.[0] || 37.5665;
  const lng = request.filters?.location?.[1] || 126.9780;
  const radius = request.filters?.radius || 5000;

  try {
    const { data, error } = await this.client.rpc('get_candidates_v2', {
      p_lat: lat,
      p_lng: lng,
      p_radius: radius,
      p_target_type: request.target_type,
      p_use_negative_filter: settings.enableNegativeFilter,
      p_requester_id: request.requester_id
    });

    if (error) {
      console.error(`[MatchingService] RPC Error: ${error.message}`);
      throw new Error(`PostGIS RPC failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log(`[MatchingService] No candidates found in radius ${radius}m`);
      return [];
    }

    console.log(`[MatchingService] Found ${data.length} candidates`);
    return data.map(entity => ({
      id: entity.id,
      type: request.target_type,
      profile: {
        ...entity,
        location: this.parseLocation(entity.location),
        distance: entity.distance // PostGIS에서 계산된 거리 포함
      },
    }));
  } catch (error) {
    console.error(`[MatchingService] getCandidates failed, attempting fallback:`, error);
    try {
      return await this.fallbackGetCandidates(request);
    } catch (fallbackError) {
      console.error(`[MatchingService] Fallback also failed:`, fallbackError);
      // 최후의 수단으로 빈 배열 반환 (mock 대신)
      return [];
    }
  }
}
```

**문제점 #2: StrategySettings 타입 불일치**
- [matching.service.ts:109](backend/src/modules/matching/matching.service.ts#L109): `any` 타입 사용

**수정 필요:**
```typescript
// Line 109 수정
const settings = StrategySettingsSchema.parse(request.settings || {});

// Line 194 함수 시그니처 수정
private async getCandidates(
  request: any,
  settings: z.infer<typeof StrategySettingsSchema>
): Promise<MatchableEntity[]> {
```

**문제점 #3: Mock 데이터 남용**
- 프로덕션 코드에 mock 데이터가 너무 많음
- 개발/프로덕션 환경 분리 필요

**수정 필요:**
```typescript
// 환경 변수로 mock 사용 여부 제어
private readonly useMockData = process.env.NODE_ENV === 'development' &&
                                 process.env.USE_MOCK_DATA === 'true';

private getMockCandidates(request: any): MatchableEntity[] {
  if (!this.useMockData) {
    throw new Error('No candidates found and mock data is disabled');
  }
  // ... 기존 mock 로직
}
```

#### 3. SQL - get_candidates_v2 함수 개선

**문제점:**
- 카테고리 필터링이 SQL 레벨에서 이루어지지 않음
- 거리 정보만 반환, 추가 메타데이터 부족

**수정 필요:**
```sql
CREATE OR REPLACE FUNCTION get_candidates_v2(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius DOUBLE PRECISION,
  p_target_type TEXT,
  p_excluded_ids UUID[] DEFAULT '{}',
  p_use_negative_filter BOOLEAN DEFAULT TRUE,
  p_requester_id UUID DEFAULT NULL,
  p_required_categories TEXT[] DEFAULT '{}', -- 추가: 필수 카테고리
  p_max_results INT DEFAULT 50 -- 추가: 결과 제한
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  display_name TEXT,
  location GEOGRAPHY,
  categories TEXT[],
  distance DOUBLE PRECISION,
  common_categories TEXT[], -- 추가: 공통 카테고리
  category_match_score NUMERIC -- 추가: 카테고리 매칭 점수
) AS $$
DECLARE
  v_final_excluded_ids UUID[];
BEGIN
  -- ... 기존 제외 로직 ...

  IF p_target_type = 'user' THEN
    RETURN QUERY
    SELECT
      u.id,
      'user'::TEXT as type,
      u.display_name,
      u.location,
      u.categories,
      ST_Distance(u.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) as distance,
      -- 공통 카테고리 계산
      (SELECT ARRAY_AGG(cat) FROM unnest(u.categories) cat WHERE cat = ANY(p_required_categories)) as common_categories,
      -- 카테고리 매칭 점수 (0-100)
      CASE
        WHEN cardinality(p_required_categories) = 0 THEN 0
        ELSE (
          (SELECT COUNT(*) FROM unnest(u.categories) cat WHERE cat = ANY(p_required_categories))::NUMERIC
          / cardinality(p_required_categories)::NUMERIC * 100
        )
      END as category_match_score
    FROM users u
    WHERE ST_DWithin(u.location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius)
      AND (v_final_excluded_ids IS NULL OR NOT (u.id = ANY(v_final_excluded_ids)))
      -- 카테고리 필터링 (선택적)
      AND (cardinality(p_required_categories) = 0 OR u.categories && p_required_categories)
    ORDER BY distance ASC
    LIMIT p_max_results;
  ELSE
    -- teams에 대해서도 동일한 로직 적용
    -- ... (생략, users와 동일)
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
```

#### 4. PreferenceStrategy 엣지 케이스

**문제점:**
- [preference.strategy.ts:8-11](backend/src/modules/matching/strategies/preference.strategy.ts#L8-L11): `candidateCats`가 빈 배열일 때 점수가 0이 되어야 하는데 확인 안됨

**수정 필요:**
```typescript
score(requester: MatchableEntity, candidate: MatchableEntity): number {
  const requesterCats = requester.profile?.categories || [];
  const candidateCats = candidate.profile?.categories || [];

  // 둘 중 하나라도 비어있으면 0점
  if (requesterCats.length === 0 || candidateCats.length === 0) {
    return 0;
  }

  const common = requesterCats.filter((cat: string) => candidateCats.includes(cat));

  // 점수 계산: (공통 카테고리 수 / 요청자 카테고리 수) * 100
  const score = (common.length / requesterCats.length) * 100;

  return Math.min(score, 100);
}
```

#### 5. HybridStrategy 점수 정규화

**문제점:**
- [hybrid.strategy.ts:23-26](backend/src/modules/matching/strategies/hybrid.strategy.ts#L23-L26): Distance와 Preference 점수의 스케일이 다를 수 있음
- DistanceStrategy가 0-100 범위를 보장하는지 확인 필요

**확인 필요:**
DistanceStrategy의 점수 범위를 확인하고, 필요시 정규화 로직 추가

#### 6. 테스트 코드 부재

**문제점:**
- 핵심 비즈니스 로직에 대한 단위 테스트 없음

**추가 필요:**
```typescript
// backend/src/modules/matching/strategies/__tests__/preference.strategy.spec.ts
describe('PreferenceStrategy', () => {
  let strategy: PreferenceStrategy;

  beforeEach(() => {
    strategy = new PreferenceStrategy();
  });

  it('should return 0 when requester has no categories', () => {
    const requester = { id: '1', type: 'user', profile: { categories: [] } };
    const candidate = { id: '2', type: 'user', profile: { categories: ['sports'] } };
    expect(strategy.score(requester, candidate)).toBe(0);
  });

  it('should return 100 when all categories match', () => {
    const requester = { id: '1', type: 'user', profile: { categories: ['sports', 'gaming'] } };
    const candidate = { id: '2', type: 'user', profile: { categories: ['sports', 'gaming', 'travel'] } };
    expect(strategy.score(requester, candidate)).toBe(100);
  });

  it('should return 50 when half categories match', () => {
    const requester = { id: '1', type: 'user', profile: { categories: ['sports', 'gaming'] } };
    const candidate = { id: '2', type: 'user', profile: { categories: ['sports'] } };
    expect(strategy.score(requester, candidate)).toBe(50);
  });
});
```

### 📝 즉시 수정해야 할 우선순위

1. **HIGH**: SQL 04_seed_categories.sql 트랜잭션 처리 추가
2. **HIGH**: PreferenceStrategy 엣지 케이스 수정
3. **MEDIUM**: matching.service.ts 타입 안전성 개선 (any 제거)
4. **MEDIUM**: 에러 핸들링 개선 (try-catch 추가)
5. **LOW**: Mock 데이터 환경 분리
6. **LOW**: 테스트 코드 작성

### 🎯 다음 단계 제안

1. 위 수정사항 반영
2. DistanceStrategy 점수 범위 확인 및 문서화
3. 통합 테스트 작성 (실제 DB 사용)
4. 성능 테스트 (1000+ 후보군 기준)
5. API 문서화 (Swagger 예시 추가)
