# 2025-12-31 10:10 (안티그래비티)

# 매칭 코어 (Matching Core) - 상세 기술 설계서

본 문서는 프로젝트 정의서 및 클로드 코드의 피드백을 반영하여 작성된 상세 구현 설계서입니다.

---

## 1. 시스템 아키텍처 (System Architecture)

### 1.1 전체 구조 (Monorepo-style)
```
/matching-core
  ├── /frontend (Next.js 15, App Router, Tailwind CSS)
  │     ├── /src/app          # 페이지 라우팅
  │     ├── /src/components   # 재사용 컴포넌트 (UI Kit)
  │     ├── /src/features     # 비즈니스 기능별 모듈
  │     └── /src/lib          # 유틸리티 및 API 클라이언트
  │
  ├── /backend (NestJS, TypeScript)
  │     ├── /src/modules      # 기능별 모듈 (Auth, User, Team, Match)
  │     ├── /src/common       # 공통 DTO, Filter, Guard
  │     └── /src/core         # 핵심 매칭 엔진 (Strategy Pattern)
  │
  └── /work-plan              # 설계 및 기획 문서
```

### 1.2 인프라 및 데이터 흐름
- **Client**: Web Browser (Desktop/Mobile)
- **API Gateway**: Cloudflare Tunnel (예정) -> Backend API
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime (매칭 알림, 상태 변경)

---

## 2. 데이터베이스 설계 (Database Schema)

### 2.1 Core Entities (Supabase PostgreSQL)

#### `users` (Users Table)
- `id`: UUID (PK)
- `email`: Varchar (Unique)
- `nickname`: Varchar
- `profile_data`: JSONB (유연한 프로필 정보: 스킬, 선호도 등)
- `created_at`: Timestamp

#### `teams` (Teams Table)
- `id`: UUID (PK)
- `name`: Varchar
- `leader_id`: UUID (FK -> users.id)
- `members`: UUID[] (Array of users.id)
- `profile_data`: JSONB (팀 성향, 전적 등)

#### `matches` (Match History & Status)
- `id`: UUID (PK)
- `type`: Enum ('USER_USER', 'USER_TEAM', 'TEAM_TEAM')
- `participants`: JSONB (참여 엔티티 ID 목록)
- `status`: Enum ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')
- `score`: Float (매칭 적합도 점수)
- `result_data`: JSONB (매칭 결과 메타데이터)
- `created_at`: Timestamp

#### `match_requests` (New Matching Queue)
- `id`: UUID (PK)
- `requester_id`: UUID (FK)
- `requester_type`: Enum ('USER', 'TEAM')
- `target_criteria`: JSONB (원하는 상대방 조건)
- `status`: Enum ('QUEUED', 'MATCHED', 'EXPIRED')

---

## 3. 백엔드 설계 (Backend - NestJS)

### 3.1 모듈 구조
1.  **CoreModule**: 전역 설정, DB 연결, 로깅
2.  **AuthModule**: Supabase Auth 연동, JWT Guard
3.  **MatchingModule**: 핵심 매칭 로직 담당
    - `MatchingService`: 매칭 프로세스 오케스트레이션
    - `MatchingEngine`: 실제 알고리즘 수행 (Strategy Pattern 적용)
4.  **GatewayModule**: 실시간 통신 (WebSocket/Socket.io or Supabase Realtime Listener)

### 3.2 매칭 엔진 (Matching Engine) 상세
*클로드 코드의 5.1 제안 반영*

```typescript
// 매칭 전략 인터페이스
interface MatchingStrategy {
  calculateScore(source: MatchableEntity, target: MatchableEntity): number;
}

// 전략 구현체
class LocationBasedStrategy implements MatchingStrategy { ... }
class PreferenceBasedStrategy implements MatchingStrategy { ... }
class HybridStrategy implements MatchingStrategy { ... }
```

---

## 4. 프론트엔드 설계 (Frontend - Next.js)

### 4.1 페이지 구조 (Sitemap)

#### (1) 메인 홈 (`/`)
- **Hero Section**: "모든 연결의 시작, 매칭 코어" (타이포그래피 및 인터랙티브 배경)
- **Feature Grid**: 1:1, 1:N, N:M 매칭 카드형 소개
- **CTA**: "데모 체험하기" 버튼

#### (2) 플레이그라운드 (`/playground`) - *Onboarding Experience*
- **Step 1: Identity**: "나는 누구인가요?" (개인 vs 팀 선택)
- **Step 2: Criteria**: "누구를 찾나요?" (상대방 조건 설정 - UI 컨트롤러 조작)
- **Step 3: Simulation**: "매칭 시작" 버튼 클릭 시, 알고리즘이 동작하는 과정을 시각화 (레이더 차트, 프로그레스 바)
- **Step 4: Result**: 매칭된 결과 카드 및 점수 분석 표시

#### (3) 개발자 문서 (`/docs`) - *Detailed Function Specs*
- **Function Explorer**: 실제 코드의 핵심 함수(`calculateScore`, `findMatch`)를 Interactive하게 탐색
- **Live Tech Spec**: 입력값(JSON)을 넣으면 예상 리턴값과 타입을 실시간으로 보여주는 위젯

### 4.2 디자인 시스템 (Premium Aesthetics)
- **Color Palette**:
  - Primary: Deep Indigo to Violet Gradient (신뢰와 연결)
  - Accent: Neon Cyan (미래지향적 포인트)
  - Background: Dark Mode default (Glassmorphism 적용)
- **Components**:
  - `GlassCard`: 투명도와 블러가 적용된 프리미엄 카드
  - `NeonButton`: 호버 시 발광 효과
  - `InteractiveGraph`: D3.js 또는 Recharts를 활용한 매칭 점수 시각화

---

## 5. 구현 계획 (Implementation Steps)

### Phase 1: Skeleton & Setup (오늘 목표)
1. NestJS 기본 모듈(User, Match) 생성
2. Next.js 기본 레이아웃 및 Tailwind 테마 설정 (Dark mode)
3. Supabase 프로젝트 연동 설정

### Phase 2: Core Logic
1. `MatchableEntity` 인터페이스 구현
2. Mock Data를 이용한 매칭 알고리즘 프로토타이핑
3. Frontend Playground에서 Mock Data 기반 시뮬레이션 구현

### Phase 3: Integration
1. 실제 DB 연동
2. 실시간 매칭 상태 연동 (Realtime)
3. 문서화 페이지 구현

---
*(이후 클로드 코드가 본 내용을 검토하고 하단에 보완 사항을 작성할 공간입니다)*
