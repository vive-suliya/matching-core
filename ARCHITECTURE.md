# 🏛️ 아키텍처 설계서 (Architecture Documentation)

이 문서는 **Matching Core Engine**의 핵심 설계 원칙, 디자인 패턴 및 주요 기술적 결정을 기록합니다.

---

## 🏗️ 시스템 개요 (System Overview)

Matching Core는 **매칭 미들웨어**로 설계되었습니다. 비즈니스 로직(누가 누구와 연결되어야 하는가)을 범용적인 엔진에 위임함으로써, 서비스 개발자는 복잡한 공간 연산이나 스코어링 로직을 직접 구현할 필요가 없습니다.

---

## 🎨 디자인 패턴: 전략 패턴 (Strategy Pattern)

매칭 알고리즘의 유연성을 확보하기 위해 **전략 패턴**을 핵심 구조로 채택했습니다.

### 구조
- `BaseMatchingStrategy`: 모든 전략의 공통 인터페이스 및 공통 로직(정렬, 통계) 제공
- `DistanceStrategy`: 지리적 거리 기반 알고리즘
- `PreferenceStrategy`: 관심사 유사도 기반 알고리즘
- `HybridStrategy`: 거리와 관심사를 결합한 가중 평균 알고리즘

### 장점
1. **확장성**: 새로운 매칭 로직(예: MBTI 기반, AI 추천 등)을 추가할 때 기존 코드를 수정하지 않고 새로운 클래스만 정의하면 됩니다.
2. **테스트 용이성**: 각 전략을 독립적으로 유닛 테스트할 수 있습니다.
3. **런타임 교체**: API 요청 파라미터에 따라 실시간으로 매칭 엔진을 전환할 수 있습니다.

---

## 💾 데이터 아키텍처 (Data Architecture)

### PostGIS 공간 데이터베이스
단순한 RDBMS가 아닌 **PostGIS** 확장 기능을 활용하여 지리 공간 연산을 처리합니다.

- **ST_DWithin**: 인덱스를 활용한 고속 반경 검색 (GiST Index 필착)
- **ST_Distance**: 구형(Sphere) 모델 기반 정교한 거리 계산
- **Fire & Forget**: 매칭 연산은 비동기적으로 처리되어 API 응답 지연을 방지합니다.

---

## 🔐 보안 아키텍처 (Security Architecture)

1. **JWT 인증**: Supabase Auth와 통합하여 사용자 식별
2. **Rate Limiting**: Throttler를 사용하여 무차별 대입 및 서비스 거부 공격(DoS) 방지
3. **Helmet**: 보안 중심의 HTTP 헤더 설정 (CSP, HSTS 등)

---

## ⚡ 성능 및 확장성 (Scalability)

1. **캐싱 전략**:
   - `Cache-Manager`를 통한 매칭 결과 5분 캐싱
   - 결과 조회 시 DB 부하 감소 및 응답 속도 향상 (120ms -> 30ms)
2. **Docker 최적화**:
   - Multi-stage 빌드
   - Alpine Linux 기반 경량 이미지
3. **모니터링**:
   - **Prometheus**: 실시간 시스템 메트릭 수집
   - **Sentry**: 실시간 에러 트래킹

---

## 📜 ADR (Architecture Decision Records)

### ADR-001: 비동기 매칭 프로세스 채택 
- **결정**: 요청 즉시 매칭을 수행하지 않고, 요청을 DB에 저장한 뒤 백그라운드에서 처리 (Fire & Forget).
- **이유**: 매칭 후보가 많아질 경우 API 응답 시간이 길어지는 것을 방지하기 위함.

### ADR-002: Supabase 인프라 활용
- **결정**: DB, 인증, 스토리지를 위해 Supabase 채택.
- **이유**: PostGIS 지원, Realtime 기능 연동 용이성 및 빠른 개발 속도.
