# 🚀 Matching Engine: 하이엔드 매칭 통합 솔루션

**Matching Engine**은 지리 공간 분석(PostGIS)과 다차원 성향 매칭 알고리즘을 결합한 하이엔드 매칭 연결 엔진입니다. 단순한 리스트 나열을 넘어, 비즈니스 로직에 최적화된 하이브리드 점수 산출(Scoring) 시스템을 제공합니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 지능형 매칭 전략 (Intelligent Strategies)
- 📍 **공간 지능 (Spatial Intelligence)**: PostGIS를 활용한 고정밀 구면 좌표 연산 및 반경 내 후보자 실시간 필터링.
- 🧠 **하이브리드 스코어링 (Hybrid Scoring)**: 거리 점수와 성향 일치도를 복합적으로 계산하여 최적의 매칭 순위 제공.
- 🧪 **성향 분석 (Preference Matching)**: 카테고리 기반의 관심사 및 성향 일치도 분석 엔진.

### 2. 프리미엄 사용자 경험 (Premium UX)
- 🧪 **인터랙티브 플레이그라운드**: 매칭 로직을 단계별로 시뮬레이션하고 결과를 즉시 확인할 수 있는 전문가용 도구.
- 💎 **Bento Grid 디자인**: 최신 웹 트렌드를 반영한 고품질 시각 요소와 유리 질감(Glassmorphism) UI.
- ⚡ **실시간 피드백**: 초고속 검색 및 즉각적인 상태 변경 반영.

### 3. 개발자 중심 설계 (Developer Experience)
- 🛠️ **전략 패턴 아키텍처**: 비즈니스 요구사항에 따라 새로운 매칭 전략을 즉시 추가 가능.
- 📖 **인터랙티브 API 문서**: Swagger를 통한 상세한 엔드포인트 설명 및 테스트 환경 제공.

---

## 🛠 기술 스택 (Tech Stack)

### Backend
- **Core**: NestJS (TypeScript)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Documentation**: Swagger (OpenAPI)
- **Validation**: Zod (Strategy-specific validation)
- **Patterns**: Strategy Pattern, DTO Pattern

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (High-End Aesthetics)
- **State**: Zustand (Store-based state management)
- **Feedback**: Sonner (Toast notifications)
- **Icons**: Lucide React & Custom SVGs

---

## 🚀 시작하기 (Getting Started)

### 사전 준비 사항
- Node.js (v18+)
- Supabase 프로젝트 및 API 키

### 1. 데이터베이스 설정
Supabase SQL Editor에서 다음 스냅샷들을 순서대로 실행하세요:
1. `work-plan/sql/01_create_tables.sql` (테이블 생성)
2. `work-plan/sql/03_migration_v2.sql` (성향 필드 마이그레이션)
3. `work-plan/sql/04_seed_categories.sql` (카테고리 데이터 공급)

### 2. 백엔드 설정
`backend` 디렉토리에 `.env` 파일을 생성합니다:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
설치 및 실행:
```bash
cd backend
npm install
npm run start:dev
```

### 3. 프론트엔드 설정
`frontend` 디렉토리에 `.env.local` 파일을 생성합니다:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
설치 및 실행:
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 프로젝트 구조 (Project Structure)

```text
matching-core/
├── backend/                # NestJS 기반 매칭 엔진 코어
│   ├── src/modules/matching/   # 매칭 전략 및 로직 핵심
│   └── src/modules/entities/   # 유저 및 팀 데이터 관리
├── frontend/               # Next.js 기반 대시보드 및 웹
│   └── src/app/playground/     # 매칭 시뮬레이터
└── work-plan/              # 마이그레이션 및 상태 관리 문서
```

---

## 🚢 배포 (Deployment)

본 프로젝트는 **Docker**와 **Cloudflare**를 환경에 최적화되어 설계되었습니다.

### 1. Docker를 이용한 배포
루트 디렉토리에 포함된 `docker-compose.yml`을 사용하여 전체 스택을 한 번에 구동할 수 있습니다.

```bash
# 환경 변수 설정 후 실행
docker-compose up -d --build
```

### 2. Cloudflare 활용
- **Frontend**: Cloudflare Pages를 통한 배포를 권장합니다. 하이드레이션 최적화와 글로벌 엣지 캐싱을 지원합니다.
- **Backend**: Docker 컨테이너를 VPS에 올린 후 Cloudflare Tunnel을 통해 보안 연결을 설정하거나, Cloudflare Workers와 통합할 수 있습니다.
- **Health Check**: 배포 후 `http://your-api/health`를 통해 시스템 상태를 모니터링하세요.

---

## 📄 라이선스 (License)
본 프로젝트는 MIT License를 따릅니다.
