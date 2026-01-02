# 매칭 코어 추가 기능 개발 설계
**작성일**: 2025-12-31
**작성자**: Claude Code
**버전**: 1.0

---

## 📋 목차
1. [현재 상태 분석](#1-현재-상태-분석)
2. [개발 우선순위 및 로드맵](#2-개발-우선순위-및-로드맵)
3. [데이터베이스 스키마 설계](#3-데이터베이스-스키마-설계)
4. [Backend API 상세 설계](#4-backend-api-상세-설계)
5. [Frontend 기능 상세 설계](#5-frontend-기능-상세-설계)
6. [매칭 알고리즘 구현 전략](#6-매칭-알고리즘-구현-전략)
7. [실시간 기능 구현 전략](#7-실시간-기능-구현-전략)
8. [테스트 전략](#8-테스트-전략)
9. [배포 및 인프라](#9-배포-및-인프라)

---

## 1. 현재 상태 분석

### 1.1 구현 완료 항목
#### Frontend (Next.js 16.1.1)
- ✅ 기본 프로젝트 구조 (App Router)
- ✅ Tailwind CSS 설정 및 커스텀 테마 (Deep Space Dark)
- ✅ 메인 홈페이지 UI (`/`)
- ✅ Playground 페이지 레이아웃 (`/playground`)
- ✅ Developer Docs 페이지 레이아웃 (`/docs`)
- ✅ Glassmorphism 스타일 시스템
- ✅ 주요 의존성 설정
  - React 19.2.3
  - @tanstack/react-query (서버 상태 관리)
  - react-hook-form + zod (폼 관리 및 밸리데이션)
  - zustand (클라이언트 상태 관리)
  - @supabase/ssr (인증 및 DB 연동)

#### Backend (NestJS 11.0.1)
- ✅ 기본 프로젝트 구조 (Module, Controller, Service 패턴)
- ✅ Supabase 통합 설정
- ✅ Swagger/OpenAPI 문서화 설정
- ✅ 매칭 모듈 기본 구조
  - `MatchableEntity` 인터페이스
  - `BaseMatchingStrategy` 추상 클래스
  - `MatchingController` (Mock API)
- ✅ Config 모듈 (환경변수 관리)
- ✅ 주요 의존성 설정
  - @nestjs/swagger
  - @nestjs/config
  - @nestjs/cache-manager
  - class-validator, class-transformer

### 1.2 미구현 핵심 기능
#### Backend
- ❌ 실제 매칭 로직 (현재 Mock 데이터만 반환)
- ❌ 데이터베이스 엔티티 및 Repository 패턴
- ❌ 인증/인가 시스템 (Supabase Auth 연동)
- ❌ 매칭 전략 구체화 (거리 기반, 선호도 기반 등)
- ❌ 실시간 알림 시스템
- ❌ 매칭 히스토리 및 분석
- ❌ Rate Limiting 및 보안 레이어
- ❌ 테스트 코드 (Unit, Integration, E2E)

#### Frontend
- ❌ Playground 실제 기능 구현
- ❌ API 연동 및 상태 관리
- ❌ 실시간 매칭 결과 표시
- ❌ 사용자 인증 플로우
- ❌ 프로필 관리 UI
- ❌ 매칭 히스토리 조회
- ❌ 반응형 디자인 최적화

---

## 2. 개발 우선순위 및 로드맵

### Phase 1: 코어 인프라 구축 (우선순위: 최상)
**목표**: 매칭 시스템의 기반이 되는 데이터 구조와 인증 시스템 구축

#### 1.1 데이터베이스 스키마 설계 및 마이그레이션
- [ ] Supabase에서 테이블 생성 (Users, Teams, MatchingRequests, Matches 등)
- [ ] RLS (Row Level Security) 정책 설정
- [ ] 초기 시드 데이터 작성

#### 1.2 인증 시스템 구현
- [ ] Supabase Auth 통합 (Email/Password, OAuth)
- [ ] Backend JWT 검증 미들웨어
- [ ] Frontend 인증 상태 관리 (Zustand)
- [ ] Protected Route 설정

#### 1.3 사용자 및 팀 관리 기본 CRUD
- [ ] User Profile API (Create, Read, Update, Delete)
- [ ] Team Management API (Create, Read, Update, Delete, Members)
- [ ] Frontend 프로필 페이지 구현

**예상 산출물**:
- DB 스키마 문서
- API 엔드포인트 문서 (Swagger)
- 사용자/팀 관리 UI 컴포넌트

---

### Phase 2: 기본 매칭 로직 구현 (우선순위: 상)
**목표**: 단순하지만 실용적인 매칭 알고리즘 구현 및 테스트

#### 2.1 거리 기반 매칭 알고리즘
- [ ] Haversine 공식 기반 거리 계산
- [ ] 필터링 로직 (반경, 카테고리, 가용성)
- [ ] 스코어링 시스템 (거리, 평점, 활동성)

#### 2.2 매칭 요청/응답 플로우
- [ ] 매칭 요청 생성 API
- [ ] 매칭 후보 조회 API
- [ ] 매칭 수락/거절 API
- [ ] 매칭 상태 업데이트 로직

#### 2.3 Playground 실제 구현
- [ ] 매칭 유형 선택 UI
- [ ] 프로필/조건 입력 폼
- [ ] 실시간 매칭 결과 표시
- [ ] 매칭 수락/거절 인터랙션

**예상 산출물**:
- 동작하는 매칭 시스템 (User vs User)
- Playground 데모 페이지
- 매칭 알고리즘 테스트 케이스

---

### Phase 3: 고급 기능 및 확장성 (우선순위: 중)
**목표**: 다양한 매칭 전략 및 사용자 경험 향상

#### 3.1 다양한 매칭 전략 구현
- [ ] 선호도 기반 매칭 (취미, 관심사)
- [ ] 스킬 기반 매칭 (게임 레벨, 전문성)
- [ ] 하이브리드 전략 (가중치 조합)

#### 3.2 실시간 기능
- [ ] Supabase Realtime 구독 설정
- [ ] 매칭 알림 시스템
- [ ] 실시간 상태 업데이트 (온라인/오프라인)

#### 3.3 매칭 히스토리 및 분석
- [ ] 매칭 히스토리 저장
- [ ] 통계 대시보드 (성공률, 평균 응답 시간)
- [ ] 사용자 피드백 수집 (평점, 리뷰)

**예상 산출물**:
- 플러그인 가능한 매칭 전략 시스템
- 실시간 알림 기능
- 분석 대시보드

---

### Phase 4: 프로덕션 준비 (우선순위: 중)
**목표**: 안정성, 보안, 성능 최적화

#### 4.1 보안 강화
- [ ] Rate Limiting (매칭 요청 제한)
- [ ] Input Validation 강화
- [ ] CORS 설정
- [ ] 환경변수 암호화

#### 4.2 성능 최적화
- [ ] 매칭 후보 캐싱 (Cache Manager)
- [ ] DB 쿼리 최적화 (인덱싱)
- [ ] 이미지 최적화 (Next.js Image)

#### 4.3 테스트 및 CI/CD
- [ ] Unit Tests (Jest)
- [ ] Integration Tests (Supertest)
- [ ] E2E Tests (Playwright)
- [ ] GitHub Actions 설정

#### 4.4 배포
- [ ] Docker 컨테이너화
- [ ] Cloudflare Pages/Workers 배포
- [ ] 모니터링 설정 (Sentry, LogRocket)

**예상 산출물**:
- 프로덕션 레디 애플리케이션
- CI/CD 파이프라인
- 배포 문서

---

## 3. 데이터베이스 스키마 설계

### 3.1 Supabase PostgreSQL 테이블 구조

#### 3.1.1 `users` 테이블
```sql
CREATE TABLE users (
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

-- 인덱스
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_users_last_active ON users (last_active_at);
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
```

#### 3.1.2 `teams` 테이블
```sql
CREATE TABLE teams (
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

CREATE INDEX idx_teams_category ON teams (category);
CREATE INDEX idx_teams_location ON teams USING GIST (location);
CREATE INDEX idx_teams_owner ON teams (owner_id);
```

#### 3.1.3 `team_members` 테이블
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members (team_id);
CREATE INDEX idx_team_members_user ON team_members (user_id);
```

#### 3.1.4 `matching_requests` 테이블
```sql
CREATE TABLE matching_requests (
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

CREATE INDEX idx_matching_requests_requester ON matching_requests (requester_id, requester_type);
CREATE INDEX idx_matching_requests_status ON matching_requests (status);
CREATE INDEX idx_matching_requests_expires ON matching_requests (expires_at);
```

#### 3.1.5 `matches` 테이블
```sql
CREATE TABLE matches (
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

CREATE INDEX idx_matches_entity_a ON matches (entity_a_id, entity_a_type);
CREATE INDEX idx_matches_entity_b ON matches (entity_b_id, entity_b_type);
CREATE INDEX idx_matches_status ON matches (status);
CREATE INDEX idx_matches_request ON matches (request_id);
```

#### 3.1.6 `match_interactions` 테이블
```sql
CREATE TABLE match_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'team')),
  action TEXT NOT NULL CHECK (action IN ('view', 'accept', 'reject')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_interactions_match ON match_interactions (match_id);
CREATE INDEX idx_match_interactions_actor ON match_interactions (actor_id, actor_type);
```

#### 3.1.7 `reviews` 테이블
```sql
CREATE TABLE reviews (
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

CREATE INDEX idx_reviews_reviewee ON reviews (reviewee_id, reviewee_type);
CREATE INDEX idx_reviews_match ON reviews (match_id);
```

### 3.2 RLS (Row Level Security) 정책

```sql
-- Users: 본인만 수정 가능, 읽기는 공개
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Teams: 소유자만 수정 가능
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Owner can update team" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete team" ON teams
  FOR DELETE USING (auth.uid() = owner_id);

-- Matches: 관련 엔티티만 조회 가능
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (
    (entity_a_type = 'user' AND entity_a_id = auth.uid()) OR
    (entity_b_type = 'user' AND entity_b_id = auth.uid())
  );
```

---

## 4. Backend API 상세 설계

### 4.1 API 엔드포인트 구조

#### 4.1.1 인증 관련 (`/api/auth`)
```typescript
POST   /api/auth/signup           // 회원가입
POST   /api/auth/login            // 로그인
POST   /api/auth/logout           // 로그아웃
GET    /api/auth/me               // 현재 사용자 정보
POST   /api/auth/refresh          // 토큰 갱신
```

#### 4.1.2 사용자 관리 (`/api/users`)
```typescript
GET    /api/users/:id             // 사용자 프로필 조회
PUT    /api/users/:id             // 사용자 프로필 수정
PATCH  /api/users/:id/location    // 위치 업데이트
GET    /api/users/:id/matches     // 사용자의 매칭 히스토리
GET    /api/users/:id/reviews     // 사용자의 리뷰 목록
```

#### 4.1.3 팀 관리 (`/api/teams`)
```typescript
POST   /api/teams                 // 팀 생성
GET    /api/teams/:id             // 팀 정보 조회
PUT    /api/teams/:id             // 팀 정보 수정
DELETE /api/teams/:id             // 팀 삭제
POST   /api/teams/:id/members     // 팀원 추가
DELETE /api/teams/:id/members/:userId // 팀원 제거
GET    /api/teams/:id/matches     // 팀의 매칭 히스토리
```

#### 4.1.4 매칭 시스템 (`/api/matching`)
```typescript
POST   /api/matching/request      // 매칭 요청 생성
GET    /api/matching/request/:id  // 매칭 요청 상태 조회
POST   /api/matching/search       // 즉시 매칭 후보 검색
GET    /api/matching/candidates   // 추천 매칭 후보 조회
POST   /api/matching/:matchId/accept   // 매칭 수락
POST   /api/matching/:matchId/reject   // 매칭 거절
GET    /api/matching/history      // 매칭 히스토리
```

#### 4.1.5 리뷰 시스템 (`/api/reviews`)
```typescript
POST   /api/reviews               // 리뷰 작성
GET    /api/reviews/:id           // 리뷰 조회
GET    /api/reviews/user/:userId  // 특정 사용자 리뷰 목록
GET    /api/reviews/team/:teamId  // 특정 팀 리뷰 목록
```

### 4.2 DTO (Data Transfer Object) 설계

#### 4.2.1 매칭 요청 DTO
```typescript
// src/modules/matching/dto/create-matching-request.dto.ts
import { IsEnum, IsUUID, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum RequesterType {
  USER = 'user',
  TEAM = 'team',
}

export enum TargetType {
  USER = 'user',
  TEAM = 'team',
}

export enum MatchingStrategy {
  DISTANCE = 'distance',
  PREFERENCE = 'preference',
  SKILL = 'skill',
  HYBRID = 'hybrid',
}

export class MatchingFiltersDto {
  @ApiProperty({ example: [37.5665, 126.9780], description: 'Location [lat, lng]', required: false })
  @IsOptional()
  location?: [number, number];

  @ApiProperty({ example: 5000, description: 'Radius in meters', required: false })
  @IsOptional()
  radius?: number;

  @ApiProperty({ example: ['sports', 'soccer'], required: false })
  @IsOptional()
  categories?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  preferences?: Record<string, any>;
}

export class CreateMatchingRequestDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  requesterId: string;

  @ApiProperty({ enum: RequesterType })
  @IsEnum(RequesterType)
  requesterType: RequesterType;

  @ApiProperty({ enum: TargetType })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty({ enum: MatchingStrategy, default: MatchingStrategy.DISTANCE })
  @IsEnum(MatchingStrategy)
  @IsOptional()
  strategy?: MatchingStrategy = MatchingStrategy.DISTANCE;

  @ApiProperty({ type: MatchingFiltersDto })
  @ValidateNested()
  @Type(() => MatchingFiltersDto)
  filters: MatchingFiltersDto;
}
```

#### 4.2.2 매칭 결과 DTO
```typescript
// src/modules/matching/dto/match-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MatchEntityDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['user', 'team'] })
  type: 'user' | 'team';

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatarUrl: string;

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

  @ApiProperty({ example: 87.5 })
  score: number;

  @ApiProperty({ enum: ['proposed', 'accepted', 'rejected', 'expired'] })
  status: string;

  @ApiProperty({ example: { distance: 2.3, preferenceMatch: 0.8 } })
  metadata: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  expiresAt: Date;
}
```

### 4.3 매칭 서비스 구현 예시

```typescript
// src/modules/matching/matching.service.ts
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/database/supabase.service';
import { CreateMatchingRequestDto, MatchingStrategy } from './dto/create-matching-request.dto';
import { DistanceStrategy } from './strategies/distance.strategy';
import { PreferenceStrategy } from './strategies/preference.strategy';
import { BaseMatchingStrategy } from './strategies/base.strategy';

@Injectable()
export class MatchingService {
  private strategies: Map<string, BaseMatchingStrategy>;

  constructor(private readonly supabase: SupabaseService) {
    // 전략 패턴: 다양한 매칭 알고리즘 등록
    this.strategies = new Map([
      [MatchingStrategy.DISTANCE, new DistanceStrategy()],
      [MatchingStrategy.PREFERENCE, new PreferenceStrategy()],
      // 추가 전략은 여기에 등록
    ]);
  }

  async createMatchingRequest(dto: CreateMatchingRequestDto) {
    // 1. 매칭 요청 DB에 저장
    const { data: request, error } = await this.supabase.client
      .from('matching_requests')
      .insert({
        requester_id: dto.requesterId,
        requester_type: dto.requesterType,
        target_type: dto.targetType,
        strategy: dto.strategy,
        filters: dto.filters,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // 2. 비동기로 매칭 프로세스 시작 (백그라운드 작업)
    this.processMatching(request.id);

    return request;
  }

  private async processMatching(requestId: string) {
    // 1. 매칭 요청 정보 조회
    const { data: request } = await this.supabase.client
      .from('matching_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) return;

    // 2. 요청자 정보 조회
    const requester = await this.getEntity(request.requester_id, request.requester_type);

    // 3. 후보군 조회 (필터링)
    const candidates = await this.getCandidates(request);

    // 4. 선택된 전략으로 매칭 수행
    const strategy = this.strategies.get(request.strategy);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${request.strategy}`);
    }

    const matches = strategy.execute(requester, candidates);

    // 5. 매칭 결과 DB에 저장
    const matchRecords = matches.map(match => ({
      request_id: requestId,
      entity_a_id: match.entities[0].id,
      entity_a_type: match.entities[0].type,
      entity_b_id: match.entities[1].id,
      entity_b_type: match.entities[1].type,
      score: match.score,
      status: match.status,
      metadata: match.metadata,
    }));

    await this.supabase.client.from('matches').insert(matchRecords);

    // 6. 실시간 알림 전송 (Supabase Realtime)
    // TODO: 구현 예정
  }

  private async getEntity(id: string, type: 'user' | 'team') {
    const table = type === 'user' ? 'users' : 'teams';
    const { data } = await this.supabase.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    return {
      id: data.id,
      type,
      profile: data,
    };
  }

  private async getCandidates(request: any) {
    const table = request.target_type === 'user' ? 'users' : 'teams';
    let query = this.supabase.client.from(table).select('*');

    // 필터링 로직
    if (request.filters.location && request.filters.radius) {
      const [lat, lng] = request.filters.location;
      // PostGIS 거리 쿼리
      query = query.filter(
        'location',
        'dwithin',
        `POINT(${lng} ${lat}),${request.filters.radius}`,
      );
    }

    if (request.filters.categories) {
      query = query.in('category', request.filters.categories);
    }

    const { data } = await query;

    return data.map(entity => ({
      id: entity.id,
      type: request.target_type,
      profile: entity,
    }));
  }

  async acceptMatch(matchId: string, actorId: string) {
    // 매칭 수락 로직
    const { data } = await this.supabase.client
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId)
      .select()
      .single();

    // 인터랙션 기록
    await this.supabase.client.from('match_interactions').insert({
      match_id: matchId,
      actor_id: actorId,
      actor_type: 'user', // TODO: 동적 처리
      action: 'accept',
    });

    return data;
  }

  async rejectMatch(matchId: string, actorId: string) {
    // 매칭 거절 로직
    const { data } = await this.supabase.client
      .from('matches')
      .update({ status: 'rejected' })
      .eq('id', matchId)
      .select()
      .single();

    await this.supabase.client.from('match_interactions').insert({
      match_id: matchId,
      actor_id: actorId,
      actor_type: 'user',
      action: 'reject',
    });

    return data;
  }
}
```

### 4.4 거리 기반 매칭 전략 구현

```typescript
// src/modules/matching/strategies/distance.strategy.ts
import { BaseMatchingStrategy } from './base.strategy';
import { MatchableEntity } from '../entities/matchable-entity.interface';

export class DistanceStrategy extends BaseMatchingStrategy {
  name = 'distance';

  score(requester: MatchableEntity, candidate: MatchableEntity): number {
    // 거리 계산 (Haversine formula)
    const distance = this.calculateDistance(
      requester.profile.location,
      candidate.profile.location,
    );

    // 거리 기반 스코어 (가까울수록 높은 점수)
    // 예: 1km 이내 = 100점, 10km 이내 = 50점, 그 이상 = 10점
    let distanceScore = 0;
    if (distance <= 1) distanceScore = 100;
    else if (distance <= 5) distanceScore = 80;
    else if (distance <= 10) distanceScore = 50;
    else if (distance <= 20) distanceScore = 30;
    else distanceScore = 10;

    // 추가 요소: 평점 (있을 경우)
    const ratingScore = candidate.profile.averageRating
      ? candidate.profile.averageRating * 10
      : 50;

    // 최종 점수 (가중 평균)
    const finalScore = distanceScore * 0.7 + ratingScore * 0.3;

    return Math.round(finalScore * 100) / 100; // 소수점 2자리
  }

  private calculateDistance(
    loc1: [number, number],
    loc2: [number, number],
  ): number {
    if (!loc1 || !loc2) return Infinity;

    const [lat1, lon1] = loc1;
    const [lat2, lon2] = loc2;

    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
```

---

## 5. Frontend 기능 상세 설계

### 5.1 페이지 구조 및 라우팅

```
/                       - 메인 홈페이지 (기존 유지)
/auth/login             - 로그인 페이지
/auth/signup            - 회원가입 페이지
/profile                - 사용자 프로필 (본인)
/profile/:id            - 다른 사용자 프로필 조회
/teams                  - 팀 목록
/teams/create           - 팀 생성
/teams/:id              - 팀 상세
/playground             - 매칭 Playground (개선)
/matches                - 내 매칭 히스토리
/matches/:id            - 매칭 상세
/docs                   - Developer Docs (기존 유지)
```

### 5.2 Playground 개선 설계

#### 5.2.1 Step-by-Step 매칭 플로우

```typescript
// src/app/playground/page.tsx
'use client';

import { useState } from 'react';
import { useMatchingStore } from '@/stores/matching.store';
import StepIndicator from '@/components/playground/StepIndicator';
import MatchTypeSelector from '@/components/playground/MatchTypeSelector';
import ProfileInput from '@/components/playground/ProfileInput';
import StrategySelector from '@/components/playground/StrategySelector';
import ResultsDisplay from '@/components/playground/ResultsDisplay';

export default function PlaygroundPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { matchingRequest, setMatchType, setProfile, setStrategy, submitRequest } = useMatchingStore();

  const steps = [
    { number: 1, title: '매칭 유형 선택', component: MatchTypeSelector },
    { number: 2, title: '프로필 입력', component: ProfileInput },
    { number: 3, title: '전략 선택', component: StrategySelector },
    { number: 4, title: '결과 확인', component: ResultsDisplay },
  ];

  const CurrentComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Matching Playground</h1>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="max-w-4xl mx-auto mt-8">
        <CurrentComponent
          onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
          onBack={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
        />
      </div>
    </div>
  );
}
```

#### 5.2.2 상태 관리 (Zustand Store)

```typescript
// src/stores/matching.store.ts
import { create } from 'zustand';

interface MatchingState {
  matchType: 'USER_USER' | 'USER_TEAM' | 'TEAM_TEAM' | null;
  profile: {
    location?: [number, number];
    categories?: string[];
    preferences?: Record<string, any>;
  };
  strategy: 'distance' | 'preference' | 'skill' | 'hybrid';
  results: any[];
  isLoading: boolean;

  // Actions
  setMatchType: (type: MatchingState['matchType']) => void;
  setProfile: (profile: Partial<MatchingState['profile']>) => void;
  setStrategy: (strategy: MatchingState['strategy']) => void;
  submitRequest: () => Promise<void>;
  reset: () => void;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
  matchType: null,
  profile: {},
  strategy: 'distance',
  results: [],
  isLoading: false,

  setMatchType: (matchType) => set({ matchType }),

  setProfile: (profile) =>
    set((state) => ({ profile: { ...state.profile, ...profile } })),

  setStrategy: (strategy) => set({ strategy }),

  submitRequest: async () => {
    set({ isLoading: true });
    try {
      const { matchType, profile, strategy } = get();

      // API 호출
      const response = await fetch('/api/matching/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: 'demo-user-id', // TODO: 실제 사용자 ID
          requesterType: matchType?.split('_')[0].toLowerCase(),
          targetType: matchType?.split('_')[1].toLowerCase(),
          strategy,
          filters: profile,
        }),
      });

      const data = await response.json();

      // 결과 폴링 또는 Realtime 구독
      // TODO: 구현

      set({ results: data.matches || [] });
    } catch (error) {
      console.error('Matching request failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({
    matchType: null,
    profile: {},
    strategy: 'distance',
    results: [],
    isLoading: false,
  }),
}));
```

#### 5.2.3 매칭 유형 선택 컴포넌트

```typescript
// src/components/playground/MatchTypeSelector.tsx
'use client';

import { useMatchingStore } from '@/stores/matching.store';

interface Props {
  onNext: () => void;
}

export default function MatchTypeSelector({ onNext }: Props) {
  const { matchType, setMatchType } = useMatchingStore();

  const types = [
    {
      value: 'USER_USER',
      icon: '👥',
      title: 'User vs User',
      description: '1:1 또는 1:N 사용자 매칭 (중고거래, 동행 찾기 등)',
    },
    {
      value: 'USER_TEAM',
      icon: '👤➡️👥',
      title: 'User vs Team',
      description: '개인이 팀을 찾거나 팀이 개인을 찾는 매칭 (용병, 길드 가입 등)',
    },
    {
      value: 'TEAM_TEAM',
      icon: '👥⚔️👥',
      title: 'Team vs Team',
      description: '팀 간의 매칭 (스터디 그룹, 팀 대항전 등)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => setMatchType(type.value as any)}
            className={`glass-card p-6 rounded-xl text-left transition-all ${
              matchType === type.value
                ? 'border-2 border-purple-500 bg-purple-500/10'
                : 'border border-white/10 hover:border-purple-500/50'
            }`}
          >
            <div className="text-4xl mb-4">{type.icon}</div>
            <h3 className="text-xl font-bold mb-2">{type.title}</h3>
            <p className="text-sm text-gray-400">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!matchType}
          className={`px-8 py-3 rounded-lg font-bold transition-all ${
            matchType
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          다음 단계 →
        </button>
      </div>
    </div>
  );
}
```

#### 5.2.4 프로필 입력 컴포넌트

```typescript
// src/components/playground/ProfileInput.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMatchingStore } from '@/stores/matching.store';

const profileSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(100),
  categories: z.array(z.string()).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function ProfileInput({ onNext, onBack }: Props) {
  const { profile, setProfile } = useMatchingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      latitude: profile.location?.[0] || 37.5665,
      longitude: profile.location?.[1] || 126.9780,
      radius: 5,
    },
  });

  const onSubmit = (data: ProfileForm) => {
    setProfile({
      location: [data.latitude, data.longitude],
      radius: data.radius * 1000, // km to meters
      categories: data.categories,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">위치 정보 입력</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">위도 (Latitude)</label>
            <input
              type="number"
              step="0.0001"
              {...register('latitude', { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
            />
            {errors.latitude && (
              <p className="text-red-400 text-sm mt-1">{errors.latitude.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">경도 (Longitude)</label>
            <input
              type="number"
              step="0.0001"
              {...register('longitude', { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
            />
            {errors.longitude && (
              <p className="text-red-400 text-sm mt-1">{errors.longitude.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">반경 (km)</label>
          <input
            type="number"
            min="1"
            max="100"
            {...register('radius', { valueAsNumber: true })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
          />
          {errors.radius && (
            <p className="text-red-400 text-sm mt-1">{errors.radius.message}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">카테고리 (선택)</label>
          <select
            multiple
            {...register('categories')}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
          >
            <option value="sports">스포츠</option>
            <option value="study">스터디</option>
            <option value="gaming">게임</option>
            <option value="travel">여행</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold"
        >
          ← 이전
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
        >
          다음 단계 →
        </button>
      </div>
    </form>
  );
}
```

#### 5.2.5 결과 표시 컴포넌트

```typescript
// src/components/playground/ResultsDisplay.tsx
'use client';

import { useEffect } from 'react';
import { useMatchingStore } from '@/stores/matching.store';

interface Props {
  onBack: () => void;
}

export default function ResultsDisplay({ onBack }: Props) {
  const { results, isLoading, submitRequest } = useMatchingStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 매칭 요청
    submitRequest();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-card p-12 rounded-xl text-center">
        <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl">매칭 후보를 찾고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          매칭 결과 ({results.length}개 후보)
        </h2>

        {results.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">조건에 맞는 매칭 후보가 없습니다.</p>
            <p className="mt-2">필터 조건을 조정해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((match, index) => (
              <div
                key={match.id}
                className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-purple-400">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{match.entityB.name}</h3>
                      <p className="text-sm text-gray-400">
                        매칭 점수: {match.score}/100
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
                      ✓ 수락
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
                      ✗ 거절
                    </button>
                  </div>
                </div>

                {match.metadata && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-400">
                    <p>거리: {match.metadata.distance?.toFixed(2)} km</p>
                    <p>선호도 일치: {(match.metadata.preferenceMatch * 100).toFixed(0)}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold"
        >
          ← 다시 시도
        </button>
      </div>
    </div>
  );
}
```

### 5.3 인증 시스템 UI

```typescript
// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/playground');
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">로그인</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
          >
            로그인
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="text-purple-400 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## 6. 매칭 알고리즘 구현 전략

### 6.1 알고리즘 평가 지표

매칭 시스템의 품질을 측정하기 위한 주요 지표:

1. **매칭 정확도** (Matching Accuracy): 사용자가 수락한 매칭의 비율
2. **응답 시간** (Response Time): 매칭 요청부터 결과까지 걸리는 시간
3. **커버리지** (Coverage): 매칭 후보를 찾을 수 있는 요청의 비율
4. **다양성** (Diversity): 제시되는 매칭 후보의 다양성

### 6.2 전략별 구현 우선순위

#### 우선순위 1: 거리 기반 매칭 (Distance Strategy)
- **목적**: 지리적으로 가까운 매칭 제공
- **사용 사례**: 중고거래, 오프라인 모임
- **구현 복잡도**: 낮음
- **구현 상태**: 기본 구조 완료 ✅

#### 우선순위 2: 선호도 기반 매칭 (Preference Strategy)
- **목적**: 사용자의 선호도와 프로필 일치도 기반 매칭
- **사용 사례**: 스터디 그룹, 취미 모임
- **구현 복잡도**: 중간
- **알고리즘**: 코사인 유사도 (Cosine Similarity)

```typescript
// src/modules/matching/strategies/preference.strategy.ts
import { BaseMatchingStrategy } from './base.strategy';
import { MatchableEntity } from '../entities/matchable-entity.interface';

export class PreferenceStrategy extends BaseMatchingStrategy {
  name = 'preference';

  score(requester: MatchableEntity, candidate: MatchableEntity): number {
    const requesterPrefs = requester.profile.preferences || {};
    const candidatePrefs = candidate.profile.preferences || {};

    // 코사인 유사도 계산
    const similarity = this.cosineSimilarity(requesterPrefs, candidatePrefs);

    // 0~1 범위를 0~100으로 변환
    return Math.round(similarity * 100 * 100) / 100;
  }

  private cosineSimilarity(
    prefs1: Record<string, any>,
    prefs2: Record<string, any>,
  ): number {
    const keys = new Set([...Object.keys(prefs1), ...Object.keys(prefs2)]);

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    keys.forEach((key) => {
      const val1 = this.normalizeValue(prefs1[key]);
      const val2 = this.normalizeValue(prefs2[key]);

      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    });

    const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private normalizeValue(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (Array.isArray(value)) return value.length;
    return 0;
  }
}
```

#### 우선순위 3: 하이브리드 전략 (Hybrid Strategy)
- **목적**: 여러 요소를 종합한 최적의 매칭
- **구현**: 거리 + 선호도 + 평점을 가중치 기반으로 조합

```typescript
// src/modules/matching/strategies/hybrid.strategy.ts
import { BaseMatchingStrategy } from './base.strategy';
import { DistanceStrategy } from './distance.strategy';
import { PreferenceStrategy } from './preference.strategy';
import { MatchableEntity } from '../entities/matchable-entity.interface';

export class HybridStrategy extends BaseMatchingStrategy {
  name = 'hybrid';

  private distanceStrategy = new DistanceStrategy();
  private preferenceStrategy = new PreferenceStrategy();

  // 가중치 설정 (필요에 따라 동적 조정 가능)
  private weights = {
    distance: 0.4,
    preference: 0.3,
    rating: 0.3,
  };

  score(requester: MatchableEntity, candidate: MatchableEntity): number {
    const distanceScore = this.distanceStrategy.score(requester, candidate);
    const preferenceScore = this.preferenceStrategy.score(requester, candidate);
    const ratingScore = this.getRatingScore(candidate);

    const finalScore =
      distanceScore * this.weights.distance +
      preferenceScore * this.weights.preference +
      ratingScore * this.weights.rating;

    return Math.round(finalScore * 100) / 100;
  }

  private getRatingScore(candidate: MatchableEntity): number {
    const rating = candidate.profile.averageRating || 3;
    return (rating / 5) * 100; // 5점 만점을 100점 만점으로
  }
}
```

### 6.3 성능 최적화 전략

#### 6.3.1 캐싱 전략
```typescript
// src/modules/matching/matching.service.ts (캐싱 추가)
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MatchingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ...
  ) {}

  private async getCandidates(request: any) {
    const cacheKey = `candidates:${request.target_type}:${JSON.stringify(request.filters)}`;

    // 캐시 확인
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as any[];
    }

    // DB 조회
    const candidates = await this.fetchCandidatesFromDB(request);

    // 캐시 저장 (5분)
    await this.cacheManager.set(cacheKey, candidates, 300000);

    return candidates;
  }
}
```

#### 6.3.2 배치 처리 (BullMQ 사용 - 추후 확장)
```typescript
// src/modules/matching/matching.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('matching-queue')
export class MatchingProcessor {
  @Process('process-matching')
  async handleMatching(job: Job) {
    const { requestId } = job.data;

    // 매칭 로직 비동기 처리
    await this.matchingService.processMatching(requestId);

    return { success: true };
  }
}
```

---

## 7. 실시간 기능 구현 전략

### 7.1 Supabase Realtime 활용

#### 7.1.1 Backend: 매칭 결과 Broadcast
```typescript
// src/modules/matching/matching.service.ts
async processMatching(requestId: string) {
  // ... 매칭 로직 수행

  // 실시간 알림 전송
  await this.supabase.client
    .channel('matching-notifications')
    .send({
      type: 'broadcast',
      event: 'new-match',
      payload: {
        userId: request.requester_id,
        matches: matches.slice(0, 5), // Top 5만 전송
      },
    });
}
```

#### 7.1.2 Frontend: Realtime 구독
```typescript
// src/hooks/useMatchingRealtime.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useMatchingRealtime(userId: string) {
  const [newMatches, setNewMatches] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('matching-notifications')
      .on('broadcast', { event: 'new-match' }, (payload) => {
        if (payload.payload.userId === userId) {
          setNewMatches(payload.payload.matches);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { newMatches };
}
```

### 7.2 온라인 상태 관리

```typescript
// src/hooks/usePresence.ts
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePresence(userId: string) {
  const supabase = createClient();

  useEffect(() => {
    // 주기적으로 last_active_at 업데이트
    const interval = setInterval(async () => {
      await supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', userId);
    }, 60000); // 1분마다

    return () => clearInterval(interval);
  }, [userId]);
}
```

---

## 8. 테스트 전략

### 8.1 Backend 테스트

#### 8.1.1 Unit Tests (Jest)
```typescript
// src/modules/matching/strategies/distance.strategy.spec.ts
import { DistanceStrategy } from './distance.strategy';
import { MatchableEntity } from '../entities/matchable-entity.interface';

describe('DistanceStrategy', () => {
  let strategy: DistanceStrategy;

  beforeEach(() => {
    strategy = new DistanceStrategy();
  });

  it('should calculate high score for nearby entities', () => {
    const requester: MatchableEntity = {
      id: '1',
      type: 'user',
      profile: { location: [37.5665, 126.9780] }, // Seoul
    };

    const candidate: MatchableEntity = {
      id: '2',
      type: 'user',
      profile: { location: [37.5665, 126.9780] }, // Same location
    };

    const score = strategy.score(requester, candidate);
    expect(score).toBeGreaterThanOrEqual(90); // Very close
  });

  it('should calculate low score for far entities', () => {
    const requester: MatchableEntity = {
      id: '1',
      type: 'user',
      profile: { location: [37.5665, 126.9780] }, // Seoul
    };

    const candidate: MatchableEntity = {
      id: '2',
      type: 'user',
      profile: { location: [35.1796, 129.0756] }, // Busan
    };

    const score = strategy.score(requester, candidate);
    expect(score).toBeLessThan(30); // Far away
  });
});
```

#### 8.1.2 Integration Tests (Supertest)
```typescript
// test/matching.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('Matching API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/matching/request (POST)', () => {
    it('should create a matching request', () => {
      return request(app.getHttpServer())
        .post('/api/matching/request')
        .send({
          requesterId: 'test-user-id',
          requesterType: 'user',
          targetType: 'user',
          strategy: 'distance',
          filters: {
            location: [37.5665, 126.9780],
            radius: 5000,
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('active');
        });
    });

    it('should reject invalid request', () => {
      return request(app.getHttpServer())
        .post('/api/matching/request')
        .send({
          requesterId: 'test-user-id',
          // Missing required fields
        })
        .expect(400);
    });
  });
});
```

### 8.2 Frontend 테스트

#### 8.2.1 Component Tests (React Testing Library)
```typescript
// src/components/playground/__tests__/MatchTypeSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MatchTypeSelector from '../MatchTypeSelector';

describe('MatchTypeSelector', () => {
  it('should render all match types', () => {
    const onNext = jest.fn();
    render(<MatchTypeSelector onNext={onNext} />);

    expect(screen.getByText('User vs User')).toBeInTheDocument();
    expect(screen.getByText('User vs Team')).toBeInTheDocument();
    expect(screen.getByText('Team vs Team')).toBeInTheDocument();
  });

  it('should enable next button when type is selected', () => {
    const onNext = jest.fn();
    render(<MatchTypeSelector onNext={onNext} />);

    const nextButton = screen.getByText('다음 단계 →');
    expect(nextButton).toBeDisabled();

    fireEvent.click(screen.getByText('User vs User'));
    expect(nextButton).not.toBeDisabled();
  });
});
```

#### 8.2.2 E2E Tests (Playwright)
```typescript
// e2e/playground.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Matching Playground Flow', () => {
  test('should complete full matching process', async ({ page }) => {
    await page.goto('http://localhost:3000/playground');

    // Step 1: Select match type
    await page.click('text=User vs User');
    await page.click('text=다음 단계 →');

    // Step 2: Enter profile
    await page.fill('input[name="latitude"]', '37.5665');
    await page.fill('input[name="longitude"]', '126.9780');
    await page.fill('input[name="radius"]', '5');
    await page.click('text=다음 단계 →');

    // Step 3: Select strategy
    await page.click('text=거리 기반');
    await page.click('text=다음 단계 →');

    // Step 4: Check results
    await expect(page.locator('text=매칭 결과')).toBeVisible();
  });
});
```

---

## 9. 배포 및 인프라

### 9.1 Dockerization

#### 9.1.1 Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### 9.1.2 Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

#### 9.1.3 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - backend
    restart: unless-stopped
```

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      - name: Run tests
        working-directory: ./backend
        run: npm test
      - name: Run E2E tests
        working-directory: ./backend
        run: npm run test:e2e

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      - name: Run build
        working-directory: ./frontend
        run: npm run build

  deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare
        run: |
          # Cloudflare 배포 스크립트
          echo "Deploying to production..."
```

### 9.3 환경변수 관리

```bash
# .env.example (프로젝트 루트)
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend
NODE_ENV=development
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 10. 다음 액션 아이템

### 즉시 시작 가능한 작업

#### Phase 1A: 데이터베이스 설정 (예상 시간: 1-2시간)
1. Supabase 프로젝트에 접속
2. SQL Editor에서 테이블 생성 스크립트 실행
3. RLS 정책 적용
4. 테스트 시드 데이터 삽입

#### Phase 1B: 인증 시스템 구현 (예상 시간: 2-3시간)
1. Backend: Auth Guard 미들웨어 작성
2. Frontend: 로그인/회원가입 페이지 구현
3. Frontend: Protected Routes 설정
4. Zustand Auth Store 작성

#### Phase 2A: 기본 매칭 로직 (예상 시간: 3-4시간)
1. Backend: MatchingService 실제 로직 구현
2. Backend: Distance Strategy 완성
3. Backend: API 엔드포인트 테스트
4. Frontend: Playground 실제 API 연동

### 개발 순서 제안

```
Week 1:
- Day 1-2: DB 스키마 설정 + 인증 시스템
- Day 3-4: 사용자/팀 CRUD API 및 UI
- Day 5: 테스트 및 문서화

Week 2:
- Day 1-2: 거리 기반 매칭 알고리즘
- Day 3-4: Playground UI 완성 및 API 연동
- Day 5: 통합 테스트 및 버그 수정

Week 3:
- Day 1-2: 선호도/스킬 매칭 전략 추가
- Day 3-4: 실시간 알림 시스템
- Day 5: 매칭 히스토리 및 분석

Week 4:
- Day 1-2: 보안 강화 및 성능 최적화
- Day 3-4: Docker 설정 및 배포 준비
- Day 5: 최종 테스트 및 문서 완성
```

---

## 11. 참고 자료

### 공식 문서
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

### 매칭 알고리즘 참고
- Haversine Formula for Distance Calculation
- Cosine Similarity for Preference Matching
- Collaborative Filtering (추후 확장)

### 보안 및 베스트 프랙티스
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

---

**문서 끝**

이 설계 문서는 매칭 코어 프로젝트의 전체 개발 로드맵을 제시합니다. 단계별로 구현하며, 각 단계마다 테스트와 검증을 거쳐 안정적인 시스템을 구축합니다.

**다음 단계**: 이 문서를 바탕으로 Phase 1부터 시작하여 점진적으로 기능을 구현해나가시면 됩니다.
