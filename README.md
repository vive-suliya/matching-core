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
**당신의 서비스가 '매칭' 기능을 필요로 할 때 가져다 쓰는 강력한 엔진(Core)**입니다.

- ❌ "팀 프로젝트 구인 사이트를 만든다" 
- ✅ "**팀 프로젝트 구인 사이트**에 필요한 **매칭 기능**을 API 호출 하나로 해결한다"

### 🎯 목표 (Goal)
- **추상화 (Abstraction)**: 사용자-팀, 멘토-멘티, 게이머-게이머 등 모든 관계를 `Requester(요청자)`와 `Candidate(후보자)`의 관계로 단순화합니다.
- **순수성 (Purity)**: 회원가입, 채팅 등 부가 기능은 배제하고, 오직 **'최적의 연결(Connection)'**이라는 본질에만 집중합니다.
- **제어 용이성 (Controllability)**: 복잡한 로직을 블랙박스 안에 숨기고, 개발자는 단순한 API와 직관적인 대시보드로 엔진을 핸들링합니다.

---

## 🏗️ 아키텍처 (Usage Architecture)

이 프로젝트는 귀하의 서비스(Application)의 **백엔드 모듈** 또는 **마이크로서비스**로 작동합니다.

```mermaid
graph LR
    User[End User] --> YourApp[Your Service (App/Web)]
    YourApp -- 1. 매칭 요청 (REST API) --> MatchingCore[🧩 Matching Core Engine]
    MatchingCore -- 2. 후보자 검색 (PostGIS) --> DB[(Shared / Dedicated DB)]
    MatchingCore -- 3. 알고리즘 계산 (Scoring) --> MatchingCore
    MatchingCore -- 4. 결과 반환 (JSON) --> YourApp
    YourApp --> User
```

---

## ✨ 핵심 기능 (Core Logic)

### 1. 📍 Distance Strategy (거리 기반)
"내 주변 5km 이내의 사람을 찾아줘"
- **PostGIS** 기반의 정밀한 구면 좌표 연산
- 단순 반경 검색이 아닌, 거리별 감쇠 함수(Decay Function)를 통한 **Score** 산출

### 2. 🧠 Preference Strategy (성향 기반)
"나와 관심사가(React, NestJS) 겹치는 사람을 찾아줘"
- 카테고리 벡터 유사도 분석
- 일치하는 관심사가 많을수록 높은 **Relevance Score** 부여

### 3. ⚖️ Hybrid Strategy (복합 지능)
"가까우면서도 성향이 맞는 사람이 최고야"
- 거리 점수(70%) + 성향 점수(30%) 가중치 조합
- 비즈니스 로직에 따라 가중치(Weights) 동적 조절 가능

---

## 🛠️ 제어 및 핸들링 (Control & Handling)

이 프로젝트는 개발자가 엔진을 쉽게 이해하고 테스트할 수 있도록 **최적의 DX(Developer Experience)**를 제공합니다.

### 1. 인터랙티브 플레이그라운드 (Visual Simulator)
- 복잡한 JSON 요청을 날려볼 필요 없이, **웹 UI**에서 버튼 클릭만으로 매칭 알고리즘을 테스트하세요.
- 매칭 과정이 시각적으로 표현되어 **"왜 이 사람이 매칭되었는지"** 직관적으로 이해할 수 있습니다.
- [Frontend Dashboard 바로가기](http://localhost:3000/playground)

### 2. 살아있는 문서 (Live Documentation)
- **Swagger UI**를 통해 API 명세를 확인하고 즉시 테스트할 수 있습니다.
- [API Docs 바로가기](http://localhost:3001/api/docs)

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
