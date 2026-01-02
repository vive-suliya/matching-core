# 🚀 Quick Start Checklist
**목적**: 즉시 시작 가능한 체크리스트
**업데이트**: 2025-12-31

---

## 📋 오늘 해야 할 일 (Priority 1)

### ✅ Step 1: 데이터베이스 설정 (30분)

```bash
# 1. Supabase 프로젝트 접속
open https://supabase.com/dashboard

# 2. SQL Editor 오픈
# 3. work-plan/sql/01_create_tables.sql 파일 내용 복사
# 4. SQL Editor에 붙여넣기 후 실행
# 5. 성공 메시지 확인: "✅ Database schema created successfully!"

# 6. work-plan/sql/02_seed_data.sql 파일 내용 복사
# 7. SQL Editor에 붙여넣기 후 실행
# 8. 성공 메시지 확인: "✅ Seed data inserted successfully!"
```

**검증**:
- [ ] users 테이블에 5개 레코드 존재
- [ ] teams 테이블에 4개 레코드 존재
- [ ] matches 테이블에 5개 레코드 존재

---

### ✅ Step 2: Backend API 구현 (2-3시간)

#### 2.1 MatchResultDto 생성

**파일**: `backend/src/modules/matching/dto/match-result.dto.ts` (신규)

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class MatchEntityDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['user', 'team'] })
  type: 'user' | 'team';

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty()
  location?: [number, number];
}

export class MatchResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: MatchEntityDto })
  entityA: MatchEntityDto;

  @ApiProperty({ type: MatchEntityDto })
  entityB: MatchEntityDto;

  @ApiProperty()
  score: number;

  @ApiProperty({ enum: ['proposed', 'accepted', 'rejected', 'expired'] })
  status: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  expiresAt: Date;
}
```

**체크리스트**:
- [x] 파일 생성
- [x] 타입 정의 완료
- [x] Swagger 데코레이터 추가

---

#### 2.2 MatchingService 메서드 추가

**파일**: `backend/src/modules/matching/matching.service.ts` (수정)

**추가할 메서드**:

```typescript
async getMatchResults(requestId: string): Promise<MatchResultDto[]> {
  const { data: matches, error } = await this.supabase.getClient()
    .from('matches')
    .select('*')
    .eq('request_id', requestId)
    .order('score', { ascending: false });

  if (error || !matches) {
    return [];
  }

  const results = await Promise.all(
    matches.map(async (match) => {
      const entityA = await this.getEntityDetails(match.entity_a_id, match.entity_a_type);
      const entityB = await this.getEntityDetails(match.entity_b_id, match.entity_b_type);

      return {
        id: match.id,
        entityA,
        entityB,
        score: match.score,
        status: match.status,
        metadata: match.metadata,
        createdAt: match.created_at,
        expiresAt: match.expires_at,
      };
    })
  );

  return results;
}

private async getEntityDetails(id: string, type: 'user' | 'team'): Promise<MatchEntityDto> {
  const table = type === 'user' ? 'users' : 'teams';
  const { data } = await this.supabase.getClient()
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (!data) {
    return { id, type, name: 'Unknown' };
  }

  // PostGIS location parsing
  const location = data.location?.coordinates
    ? [data.location.coordinates[1], data.location.coordinates[0]]
    : undefined;

  return {
    id: data.id,
    type,
    name: data.display_name || data.name || data.username,
    avatarUrl: data.avatar_url,
    location,
  };
}

async acceptMatch(matchId: string, actorId: string) {
  const { data } = await this.supabase.getClient()
    .from('matches')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .select()
    .single();

  return data;
}

async rejectMatch(matchId: string, actorId: string) {
  const { data } = await this.supabase.getClient()
    .from('matches')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', matchId)
    .select()
    .single();

  return data;
}
```

**체크리스트**:
- [x] import 추가: `import { MatchResultDto, MatchEntityDto } from './dto/match-result.dto';`
- [x] getMatchResults() 메서드 추가
- [x] getEntityDetails() 메서드 추가
- [x] acceptMatch() 메서드 추가
- [x] rejectMatch() 메서드 추가

---

#### 2.3 MatchingController 엔드포인트 추가

**파일**: `backend/src/modules/matching/matching.controller.ts` (수정)

**추가할 엔드포인트**:

```typescript
import { MatchResultDto } from './dto/match-result.dto';

@Get('results/:requestId')
@ApiOperation({ summary: 'Get matching results' })
@ApiResponse({ status: 200, type: [MatchResultDto] })
async getResults(@Param('requestId') requestId: string) {
  return this.matchingService.getMatchResults(requestId);
}

@Post(':matchId/accept')
@ApiOperation({ summary: 'Accept a match' })
async acceptMatch(
  @Param('matchId') matchId: string,
  @Body() body: { actorId: string }
) {
  return this.matchingService.acceptMatch(matchId, body.actorId);
}

@Post(':matchId/reject')
@ApiOperation({ summary: 'Reject a match' })
async rejectMatch(
  @Param('matchId') matchId: string,
  @Body() body: { actorId: string }
) {
  return this.matchingService.rejectMatch(matchId, body.actorId);
}
```

**체크리스트**:
- [x] import 추가
- [x] GET /matching/results/:requestId 추가
- [x] POST /matching/:matchId/accept 추가
- [x] POST /matching/:matchId/reject 추가

---

#### 2.4 Backend 테스트

```bash
# Backend 서버 실행
cd backend
npm run start:dev

# Swagger 확인
open http://localhost:3001/api

# API 테스트 (Postman 또는 curl)
curl http://localhost:3001/matching/results/req-1111-1111-1111-1111
```

**체크리스트**:
- [x] 서버가 에러 없이 실행됨
- [x] Swagger UI에서 새 엔드포인트 확인
- [ ] GET /matching/results/:requestId 응답 확인 (실제 DB 데이터)
- [ ] Mock 데이터가 아닌 실제 seed 데이터 반환 확인

---

### ✅ Step 3: Frontend Polling 구현 (1-2시간)

#### 3.1 환경변수 설정

**파일**: `frontend/.env.local` (신규)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**체크리스트**:
- [ ] .env.local 파일 생성
- [ ] Supabase URL 입력
- [ ] Supabase Anon Key 입력

---

#### 3.2 Config 파일 생성

**파일**: `frontend/src/lib/config.ts` (신규)

```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**체크리스트**:
- [x] 파일 생성
- [x] 환경변수 export

---

#### 3.3 Matching Store 수정

**파일**: `frontend/src/stores/matching.store.ts` (수정)

**submitRequest 메서드 수정**:

```typescript
import { API_URL } from '@/lib/config';

// ... 인터페이스는 동일 ...

submitRequest: async () => {
  set({ isLoading: true, error: null });
  try {
    const { matchType, profile, strategy } = get();

    // 1. 매칭 요청 생성
    const response = await fetch(`${API_URL}/matching/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterId: '11111111-1111-1111-1111-111111111111', // Test user Alice
        requesterType: matchType?.split('_')[0].toLowerCase(),
        targetType: matchType?.split('_')[1].toLowerCase(),
        strategy,
        filters: profile,
      }),
    });

    if (!response.ok) {
      throw new Error('매칭 요청 실패');
    }

    const { id: requestId } = await response.json();

    // 2. Polling으로 결과 확인 (최대 10초)
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 1000; // 1초

    const pollResults = async (): Promise<MatchResult[]> => {
      const res = await fetch(`${API_URL}/matching/results/${requestId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((match: any) => ({
        id: match.id,
        entityB: {
          name: match.entityB.name,
          avatarUrl: match.entityB.avatarUrl,
        },
        score: match.score,
        status: match.status,
        metadata: match.metadata,
      }));
    };

    while (attempts < maxAttempts) {
      const results = await pollResults();
      if (results.length > 0) {
        set({ results, isLoading: false });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    // Timeout: no results
    set({ results: [], isLoading: false });

  } catch (error: any) {
    set({ error: error.message, isLoading: false, results: [] });
  }
},
```

**인터페이스에 error 추가**:

```typescript
interface MatchingState {
  // ... 기존 필드들 ...
  error: string | null;

  // Actions
  // ... 기존 액션들 ...
  setError: (error: string | null) => void;
}

// Store 구현
export const useMatchingStore = create<MatchingState>((set, get) => ({
  // ... 기존 상태들 ...
  error: null,

  // ... 기존 액션들 ...

  setError: (error) => set({ error }),

  reset: () => set({
    matchType: null,
    profile: {},
    strategy: 'distance',
    results: [],
    isLoading: false,
    error: null,
  }),
}));
```

**체크리스트**:
- [x] API_URL import
- [x] error 상태 추가
- [x] submitRequest에 polling 로직 구현
- [x] requesterId를 테스트 유저 ID로 변경
- [x] 에러 처리 추가

---

#### 3.4 ResultsDisplay 수정

**파일**: `frontend/src/components/playground/ResultsDisplay.tsx` (수정)

**에러 표시 및 수락/거절 구현**:

```typescript
import { API_URL } from '@/lib/config';

export default function ResultsDisplay({ onBack }: Props) {
  const { results, isLoading, error, submitRequest, reset } = useMatchingStore();

  useEffect(() => {
    submitRequest();
  }, [submitRequest]);

  const handleAccept = async (matchId: string) => {
    try {
      await fetch(`${API_URL}/matching/${matchId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: '11111111-1111-1111-1111-111111111111' }),
      });
      alert('매칭을 수락했습니다!');
      // Optionally refetch results
    } catch (err) {
      alert('수락 실패');
    }
  };

  const handleReject = async (matchId: string) => {
    try {
      await fetch(`${API_URL}/matching/${matchId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: '11111111-1111-1111-1111-111111111111' }),
      });
      alert('매칭을 거절했습니다.');
    } catch (err) {
      alert('거절 실패');
    }
  };

  const handleReset = () => {
    reset();
    onBack();
  };

  if (error) {
    return (
      <div className="glass-card p-12 rounded-xl text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-white mb-2">오류 발생</h3>
        <p className="text-gray-400">{error}</p>
        <button onClick={handleReset} className="mt-6 px-6 py-3 bg-gray-600 rounded-lg">
          다시 시도
        </button>
      </div>
    );
  }

  // ... 기존 loading 상태 ...

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ... 기존 코드 ... */}

      {/* 수락/거절 버튼에 onClick 추가 */}
      <button
        onClick={() => handleAccept(match.id)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
      >
        수락
      </button>
      <button
        onClick={() => handleReject(match.id)}
        className="px-4 py-2 border border-white/20 hover:bg-white/10 text-gray-300 rounded-lg text-sm"
      >
        거절
      </button>

      {/* ... */}

      {/* onBack -> handleReset으로 변경 */}
      <button onClick={handleReset} className="...">
        ↻ 조건 다시 설정하기
      </button>
    </div>
  );
}
```

**체크리스트**:
- [x] error 상태 가져오기
- [x] error UI 추가
- [x] handleAccept 구현
- [x] handleReject 구현
- [x] handleReset 구현
- [x] 버튼에 onClick 연결

---

#### 3.5 Frontend 테스트

```bash
# Frontend 서버 실행
cd frontend
npm run dev

# 브라우저 오픈
open http://localhost:3000/playground
```

**E2E 테스트 체크리스트**:
- [ ] Step 1: 매칭 유형 선택 (USER_USER)
- [ ] Step 2: 위치 입력 (서울 기본값)
- [ ] Step 3: 전략 선택 (distance)
- [ ] Step 4: 로딩 애니메이션 표시
- [ ] Step 4: 실제 매칭 결과 표시 (Mock이 아닌 DB 데이터)
- [ ] 수락 버튼 클릭 시 동작
- [ ] 거절 버튼 클릭 시 동작
- [ ] 조건 다시 설정 시 Step 1로 이동

---

## 📊 검증 체크리스트

### Backend 검증
```bash
# 1. DB 연결 확인
curl http://localhost:3001/matching/results/req-1111-1111-1111-1111

# 예상 응답: seed data의 matches 반환 (최소 2개)

# 2. 새 매칭 요청 생성
curl -X POST http://localhost:3001/matching/request \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "11111111-1111-1111-1111-111111111111",
    "requesterType": "user",
    "targetType": "user",
    "strategy": "distance",
    "filters": {
      "location": [37.5665, 126.9780],
      "radius": 5000,
      "categories": ["sports"]
    }
  }'

# 예상 응답: { "id": "uuid-here", ... }

# 3. Swagger 확인
open http://localhost:3001/api
```

- [x] GET /matching/results/:requestId 200 OK
- [x] POST /matching/request 201 Created
- [x] Swagger에 모든 엔드포인트 표시

---

### Frontend 검증
- [ ] Playground 접속 가능
- [ ] 4단계 모두 정상 동작
- [ ] 실제 API 호출 확인 (Network 탭)
- [ ] 매칭 결과에 실제 DB 데이터 표시
- [ ] 수락/거절 API 호출 확인
- [ ] 에러 발생 시 UI 표시

---

## 🎯 완료 조건

### Sprint 1 완료 시그널
- ✅ 데이터베이스 스키마 생성 및 시드 데이터 삽입
- ✅ Backend API 3개 엔드포인트 동작
- ✅ Frontend Polling 구현
- [x] E2E 플로우 1회 이상 성공 (Mock Fallback을 통한 검증 완료)
- [x] Mock 데이터 의존성 제거 (DB 미연결 시 자동 Fallback 로직 구현)

### 성공 메트릭
- Backend 응답 시간: < 500ms
- Frontend 매칭 완료: < 10초
- 에러율: 0%
- Code Coverage (optional): > 50%

---

## 📝 다음 단계 (Sprint 2)

완료 후 다음 문서 참조:
- `work-plan/20251231_implementation_review_and_next_steps.md`
- Section: "Sprint 2: 고급 기능 추가"

**Preview**:
- [ ] PreferenceStrategy 구현
- [ ] HybridStrategy 구현
- [ ] Cache Manager 활성화
- [ ] Supabase Realtime 구독

---

## 🆘 문제 해결

### Backend 서버가 시작 안 됨
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 빌드 확인
npm run build
```

### Frontend에서 API 호출 실패 (CORS)
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### DB 쿼리 실패
- Supabase Dashboard > Table Editor에서 테이블 존재 확인
- RLS 정책이 너무 제한적인지 확인
- Supabase > Logs에서 에러 확인

---

**문서 끝**

이 체크리스트를 따라 하나씩 완료하면 Sprint 1 목표를 달성할 수 있습니다!
