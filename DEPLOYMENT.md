# 🚀 배포 가이드 (Deployment Guide)

이 문서는 **Matching Core Engine**을 다양한 환경에 배포하는 방법을 설명합니다.

---

## 📋 사전 요구 사항 (Prerequisites)

- **Docker & Docker Compose**: 컨테이너 기반 배포 시 필요
- **Node.js 20+**: 로컬 실행 시 필요
- **Supabase Account**: 데이터베이스 및 인증 서버
- **Sentry DSN (선택)**: 에러 트래킹용

---

## 🛠️ 환경 설정 (Environment Setup)

배포 전 `.env` 파일을 설정해야 합니다. `backend/.env.example` 및 `frontend/.env.example`을 참고하세요.

### 주요 변수명 설명
| 변수명 | 설명 |
|--------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase 익명 키 (클라이언트용) |
| `SUPABASE_JWT_SECRET` | Auth 전용 JWT 시크릿 (백엔드 검증용) |
| `FRONTEND_URL` | CORS 허용을 위한 프론트엔드 주소 |

---

## 🐳 Docker 배포 (Docker Deployment)

가장 권장되는 방식입니다. 이미지 빌드 시 Multi-stage 빌드를 통해 크기를 60-80% 줄였습니다.

### 1. 전체 스택 실행 (Docker Compose)
운영 환경과 유사한 네트워크 구성을 사용합니다.

```bash
docker-compose up -d --build
```

### 2. 개별 서비스 실행
```bash
# Backend
docker build -t matching-backend ./backend
docker run -p 3001:3001 --env-file ./backend/.env matching-backend

# Frontend
docker build -t matching-frontend ./frontend
docker run -p 3000:3000 --env-file ./frontend/.env matching-frontend
```

---

## ☁️ 클라우드 배포 (Cloud Hosting)

### 1. Render.com (Backend)
1. Render에서 **Web Service** 생성
2. Repository 연결
3. **Runtime**: `Docker` 선택
4. **Environment Variables**: `.env` 내용 입력
5. **Health Check Path**: `/health` 설정

### 2. Cloudflare Pages (Frontend)
1. Cloudflare Dashboard에서 **Pages** 생성
2. Repository 연결
3. **Framework Preset**: `Next.js`
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`

---

## 🏥 모니터링 및 상태 검사 (Monitoring)

### Health Check 엔드포인트
- `/health`: DB 연동을 포함한 전체 상태 확인
- `/health/liveness`: 프로세스 생존 확인
- `/health/readiness`: 트래픽 수신 준비 확인
- `/metrics`: Prometheus 형식 메트릭 출력

### 에러 트래킹
- **Sentry**: 모든 에러는 자동으로 Sentry Dashboard에 기록됩니다.

---

## 🧪 배포 후 검증 (Post-Deployment)

배포 직후 다음 명령어로 API 서버가 정상인지 확인하세요.

```bash
# 시스템 상태 확인
curl https://your-api-url.com/health

# 기본 인사말 확인
curl https://your-api-url.com/
```
