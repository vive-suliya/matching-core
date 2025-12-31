# 2025-12-31 09:47 (안티그래비티)

# 프로젝트: 매칭 코어 (Matching Core)

## 1. 프로젝트 개요
**매칭 코어**는 다양한 플랫폼(중고거래, 여행 동행, 용병 구하기, 팀 구하기 등)에서 활용할 수 있는 **1대다(1:N), 다대다(N:M)** 매칭 시스템의 핵심 로직과 인터페이스를 구축하는 프로젝트입니다.

이 프로젝트의 목적은 단순한 기능 구현을 넘어, '바이브 코딩'에 대한 감각을 익히고, 시스템 설계부터 구현까지의 전체 프로세스를 깊이 있게 이해하는 데 있습니다. 최종적으로는 이 '코어'를 바탕으로 각자 자신만의 독립된 프로젝트로 확장해 나가는 것을 목표로 합니다.

## 2. 핵심 요구사항
### 2.1 매칭 유형
- **User vs User**: 1:1 또는 1:N 매칭 (예: 중고거래, 여행 동행, 데이트 등)
- **User vs Team / Team vs User**: 개인과 단체 간의 매칭 (예: 축구 용병 구하기, 길드 가입 등)
- **Team vs Team**: 단체 간의 매칭 (예: 스터디 그룹 매칭, 팀 스포츠 대항전 등)

### 2.2 필수 화면 구성 (학습 및 데모 목적)
1.  **메인 홈**:
    - 매칭 코어 시스템에 대한 소개 및 비전 제시.
2.  **예시 화면 (Onboarding & Playground)**:
    - 기능별 스텝 가이드.
    - 실제 매칭 기능을 직접 테스트해볼 수 있는 인터랙티브 UI.
3.  **함수 설명 (Developer Docs)**:
    - 개발자가 사용할 핵심 함수 위치, 파라미터 구조, 리턴 타입 등을 시각화하여 설명.
    - Swagger 스타일 혹은 전용 문서화 UI 제공.

## 3. 기술 스택 제안 (추천)
사용자가 요청한 **가장 쉽고 빠르면서 안정된 스택**을 기준으로 제안합니다.

### 3.1 인프라 및 데이터 (확정)
- **Database**: **Supabase** (PostgreSQL 기반, Auth/Realtime 포함) - *빠른 구축 및 강력한 기능*
- **Server Deployment**: **Docker** + **Cloudflare** (Tunneling 또는 Workers) - *유연한 배포 및 보안*

### 3.2 Frontend (제안)
- **Framework**: **Next.js (App Router)**
    - **이유**: React 생태계의 표준이며, Vercel/Cloudflare 배포와 호환성이 좋습니다. SSR/CSR을 적절히 섞어 SEO와 사용자 경험 모두를 챙길 수 있습니다.
    - **Styling**: **CSS Modules** 또는 **Tailwind CSS** (사용자 취향에 따라 선택, 프리미엄 UI 구현 용이). *사용자 규칙에 따라 기본적으로는 Vanilla CSS/CSS Modules를 사용하되, 빠른 "Premium" 디자인을 위해 Tailwind 승인을 요청드릴 예정입니다.*

### 3.3 Backend (제안)
- **Framework**: **NestJS**
    - **이유**: "코어" 시스템 구축에 가장 적합한 구조적 프레임워크입니다. Spring Boot와 유사한 구조(Module, Controller, Service)를 가져 설계를 명확히 하기 좋고, 유지보수와 확장성이 뛰어납니다. TypeScript와의 궁합이 완벽합니다.

## 4. 작업 프로세스
1.  **[안티그래비티]**: 문제 해결 계획 및 아키텍처 설계 (`work-plan` 폴더)
2.  **[클로드 코드]**: 설계 검토 및 보완 (문서 하단 추가)
3.  **[안티그래비티]**: 보완된 내용 바탕으로 코드 구현
4.  **[클로드 코드]**: 구현 결과 검증
5.  **[TestSprite]**: 자동 테스트 수행

---

## 5. 클로드 코드 검토 및 보완 사항 (2025-12-31)

### 5.1 아키텍처 설계 보완
#### 5.1.1 매칭 로직 계층 구조
- **Matching Strategy Layer**: 매칭 알고리�즘을 추상화하여 다양한 매칭 전략(거리 기반, 선호도 기반, 스킬 기반 등)을 플러그인 형태로 구현
- **Entity Abstraction Layer**: User와 Team을 통합하는 `MatchableEntity` 인터페이스 설계로 코드 재사용성 극대화
- **Event-Driven Architecture**: 매칭 요청, 수락, 거절 등의 이벤트를 비동기로 처리하는 이벤트 버스 구현

#### 5.1.2 데이터 모델 설계
```typescript
// 핵심 엔티티 예시
interface MatchableEntity {
  id: string;
  type: 'user' | 'team';
  profile: ProfileData;
  preferences: MatchingPreferences;
}

interface MatchingRequest {
  id: string;
  requester: MatchableEntity;
  targetType: 'user' | 'team';
  filters: MatchingFilters;
  strategy: MatchingStrategy;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

interface Match {
  id: string;
  entities: MatchableEntity[];
  score: number;
  status: 'proposed' | 'accepted' | 'rejected' | 'expired';
  metadata: MatchMetadata;
}
```

### 5.2 기술 스택 세부 보완
#### 5.2.1 Backend 추가 고려사항
- **Caching**: Redis (매칭 후보 캐싱, 실시간 상태 관리)
- **Queue System**: BullMQ (매칭 알고리즘 비동기 처리, 대용량 트래픽 대비)
- **Validation**: class-validator + class-transformer (NestJS 표준)
- **API Documentation**: Swagger/OpenAPI 자동 생성 (@nestjs/swagger)

#### 5.2.2 Frontend 추가 고려사항
- **State Management**: Zustand 또는 Jotai (가볍고 직관적, 매칭 상태 관리)
- **Real-time Updates**: Supabase Realtime 또는 Socket.io (매칭 알림, 실시간 채팅)
- **Form Handling**: React Hook Form + Zod (타입 안전한 폼 밸리데이션)
- **Data Fetching**: TanStack Query (서버 상태 관리 및 캐싱)

### 5.3 필수 화면 구성 상세화
#### 5.3.1 메인 홈
- Hero Section: 매칭 코어의 핵심 가치 제안
- Feature Showcase: 3가지 매칭 유형 시각화
- Live Demo Preview: 실시간 매칭 시뮬레이션
- Tech Stack 소개: 사용된 기술 스택 및 아키텍처 다이어그램

#### 5.3.2 Playground (Interactive Demo)
- **Step 1**: 매칭 유형 선택 (User-User / User-Team / Team-Team)
- **Step 2**: 프로필/조건 입력 (위치, 선호도, 스킬 등)
- **Step 3**: 매칭 전략 선택 (거리 우선, 선호도 우선, 균형 등)
- **Step 4**: 실시간 매칭 결과 확인 (스코어링, 이유 설명 포함)
- **Step 5**: 매칭 수락/거절 플로우 체험

#### 5.3.3 Developer Documentation
- **API Reference**: REST API 엔드포인트 문서 (Swagger UI)
- **SDK Documentation**: 핵심 함수 및 클래스 사용법
- **Architecture Diagrams**: 시스템 구조, 데이터 플로우, 시퀀스 다이어그램
- **Integration Guide**: 외부 프로젝트에서 매칭 코어를 통합하는 방법
- **Code Examples**: 각 매칭 유형별 구현 예제

### 5.4 핵심 기능 명세
#### 5.4.1 매칭 알고리즘 요구사항
1. **필터링 단계**: 기본 조건(위치, 카테고리, 가용성 등) 필터링
2. **스코어링 단계**: 다차원 점수 계산 (거리, 선호도, 평점, 활동성 등)
3. **랭킹 단계**: 가중치 기반 최종 순위 산정
4. **매칭 제안**: Top-N 후보 제시 및 양방향 동의 메커니즘

#### 5.4.2 확장성 고려사항
- 매칭 알고리즘의 플러그인 아키텍처로 새로운 전략 추가 용이
- 멀티테넌시 지원: 여러 플랫폼이 동일한 코어를 사용할 수 있도록 설계
- Rate Limiting & Quota: 플랫폼별 사용량 제한 및 관리
- Analytics & Monitoring: 매칭 성공률, 응답 시간 등 메트릭 수집

### 5.5 개발 단계별 마일스톤 제안
#### Phase 1: Foundation (Week 1-2)
- [ ] 프로젝트 초기 설정 (NestJS + Next.js + Supabase)
- [ ] 기본 엔티티 모델 및 DB 스키마 설계
- [ ] 인증/인가 시스템 구축 (Supabase Auth)
- [ ] 기본 CRUD API 구현

#### Phase 2: Core Matching Logic (Week 3-4)
- [ ] MatchableEntity 추상화 구현
- [ ] 기본 매칭 알고리즘 구현 (거리 기반)
- [ ] 매칭 요청/응답 플로우 구현
- [ ] 실시간 알림 시스템 구축

#### Phase 3: Advanced Features (Week 5-6)
- [ ] 다양한 매칭 전략 구현 (선호도, 스킬 매칭 등)
- [ ] 매칭 히스토리 및 분석 기능
- [ ] 평점 및 리뷰 시스템
- [ ] 관리자 대시보드

#### Phase 4: UI/UX & Documentation (Week 7-8)
- [ ] 메인 홈 및 Playground 구현
- [ ] Developer Documentation 완성
- [ ] 통합 테스트 및 E2E 테스트
- [ ] 배포 및 모니터링 설정

### 5.6 보안 및 품질 관리
- **Input Validation**: 모든 사용자 입력에 대한 서버 사이드 검증
- **Rate Limiting**: 매칭 요청 남용 방지
- **Data Privacy**: 개인정보 보호 (프로필 공개 범위 설정)
- **Testing Strategy**:
  - Unit Tests: 매칭 알고리즘 로직 (Jest)
  - Integration Tests: API 엔드포인트 (Supertest)
  - E2E Tests: 사용자 플로우 (Playwright)
  - Load Tests: 대용량 매칭 요청 시뮬레이션 (k6)

### 5.7 추가 검토 필요 사항
1. **매칭 알고리즘의 복잡도**: 초기에는 단순한 알고리즘으로 시작하되, 머신러닝 기반 매칭으로 확장 가능성 검토
2. **다국어 지원**: i18n 설정 필요 여부 확인
3. **결제 시스템**: 프리미엄 매칭 기능 제공 시 Stripe/Toss Payments 통합 검토
4. **채팅 시스템**: 매칭 후 커뮤니케이션을 위한 채팅 기능 필요성 검토

---
*검토 완료: 2025-12-31 by Claude Code*
