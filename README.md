# 🧩 Matching Core: Universal Matching Kernel
> **"매칭의 바퀴를 다시 발명하지 마세요."**  
> 실제 서비스를 위한 서비스, 강력하고 단순한 **범용 매칭 엔진**입니다.

[![Backend Status](https://img.shields.io/badge/Backend-NestJS-red)](https://nestjs.com/)
[![Frontend Status](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-PostGIS-blue)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 💡 프로젝트의 본질 (The Philosophy)

**Matching Core**는 그 자체로 완성된 End-User 서비스가 아닙니다.  
서비스 개발의 복잡성을 줄이고, 본질적인 가치에 집중할 수 있게 돕는 **매칭 미들웨어(Matching Middleware)**입니다.

- ❌ "팀 프로젝트 구인 사이트를 바닥부터 만든다" 
- ✅ "**팀 프로젝트 구인 사이트**에 필요한 **매칭 로직**을 엔진에 위임(Delegate)한다"

### 🎯 목표 (Goal)
- **추상화 (Abstraction)**: `Requester`와 `Candidate`라는 보편적 개념으로 모든 매칭 관계(팀 빌딩, 데이팅, 게임 등)를 정의합니다.
- **순수성 (Purity)**: 회원가입, 채팅 등 부가 기능은 배제하고, 오직 **'최적의 연결(Connection)'** 계산에만 집중합니다.
- **제어 용이성 (Logic-less Integration)**: 복잡한 알고리즘은 엔진 내부로 숨기고(캡슐화), 외부에서는 API 파라미터 튜닝만으로 로직을 제어합니다.

---

## 🏗️ 아키텍처 (Usage Architecture)

이 프로젝트는 귀하의 서비스(Application)의 **백엔드 모듈** 또는 **독립형 마이크로서비스**로 작동합니다.
상세한 작동 원리는 [Workflow 페이지](https://7598bec4.matching-core.pages.dev/workflow)에서 확인할 수 있습니다.

```mermaid
graph LR
    User[End User] --> YourApp[Your Service (App/Web)]
    YourApp -- 1. 매칭 요청 (REST API) --> MatchingCore[🧩 Matching Core Engine]
    MatchingCore -- 2. 공간 필터링 (Spatial Filter) --> DB[(PostGIS DB)]
    MatchingCore -- 3. 하이브리드 가중치 계산 (Scoring) --> MatchingCore
    MatchingCore -- 4. 결과 반환 (JSON) --> YourApp
    YourApp --> User
```

---

## ✨ 핵심 기능 (Core Logic)

상세한 기술적 강점은 [Advantages 페이지](https://7598bec4.matching-core.pages.dev//advantages)에서 확인할 수 있습니다.

### 1. 📍 Spatial Intelligence (공간 지능)
"단순 거리가 아닌, 이동 편의성을 고려한 매칭"
- **PostGIS** 기반의 고성능 공간 연산
- `ST_DWithin`, `ST_Distance` 등을 활용한 정교한 반경(Radius) 검색 및 필터링

### 2. ⚖️ Hybrid Scoring (하이브리드 스코어링)
"물리적 거리와 취향의 완벽한 밸런스"
- **거리 점수(Distance Score)**: 가까울수록 높은 점수 (Non-linear decay)
- **성향 점수(Affinity Score)**: 관심사(Categories) 벡터 유사도 분석
- 가중 합산(Weighted Sum): `(거리 × Wd) + (성향 × Wp)` 공식을 통한 최종 랭킹 산출

---

## 🛠️ 제어 및 핸들링 (Control & Handling)

이 프로젝트는 개발자가 엔진을 쉽게 이해하고 테스트할 수 있도록 **최적의 DX(Developer Experience)**를 제공합니다.

### 1. 인터랙티브 플레이그라운드 (Visual Simulator)
- 복잡한 JSON 요청을 날려볼 필요 없이, **웹 UI**에서 버튼 클릭만으로 매칭 알고리즘을 테스트하세요.
- 매칭 과정이 시각적으로 표현되어 **"왜 이 사람이 매칭되었는지"** 직관적으로 이해할 수 있습니다.
- [Frontend Dashboard 바로가기](https://7598bec4.matching-core.pages.dev/playground)

### 2. 살아있는 문서 (Live Documentation)
- **Swagger UI**를 통해 API 명세를 확인하고 즉시 테스트할 수 있습니다.
- [API Docs 바로가기](https://matching-core.onrender.com/api/docs)

### 3. 인증 가이드 (Authentication)
- 서비스 간 통신을 위한 **JWT/Supabase** 인증 시스템이 내장되어 있습니다.
- [AUTHENTICATION.md](./backend/AUTHENTICATION.md) 문서를 통해 인증 구현 방법을 5분 만에 파악하세요.

---

## 🚀 빠른 시작 (Quick Start)

엔진을 로컬에서 5분 만에 구동하세요.

### 1. 데이터베이스 설정 (Supabase)
이 엔진은 PostGIS가 활성화된 PostgreSQL이 필요합니다. (Supabase 권장)
- `work-plan/sql/` 폴더 안의 SQL 스크립트를 순서대로 실행하세요.

### 2. 엔진 가동 (via Docker)
모든 환경이 Docker로 패키징되어 있습니다.

```bash
# 1. 환경 변수 템플릿 복사 & 설정
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. 엔진 시동
docker-compose up -d
```

- **Backend (Engine)**: `http://localhost:3001`
- **Frontend (Dashboard)**: `http://localhost:3000`

---

## 🤝 당신이 구현해야 할 것

이 엔진은 **'매칭'**을 담당합니다. 당신은 다음만 구현하면 됩니다:
1. **사용자 확보**: 서비스를 사용할 유저들을 모으세요.
2. **요청 전송**: 유저가 매칭을 원할 때 이 엔진으로 API(`POST /matching/request`)를 보내세요.
3. **결과 표시**: 엔진이 돌려준 최적의 후보자 리스트를 예쁜 UI로 보여주세요.

---

## 📄 라이선스 (License)
MIT License - 마음껏 수정하고, 확장하고, 상용 서비스에 사용하세요.
