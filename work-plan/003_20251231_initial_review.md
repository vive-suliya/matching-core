# 프로젝트 구현 검토 및 수정보완 가이드
**작성일**: 2025-12-31
**작성자**: Claude Code
**목적**: 현재 생성된 프로젝트 구조 분석 및 구체적인 수정보완 방안 제시

---

## 1. 현재 프로젝트 구조 분석

### 1.1 생성된 구조
```
matching-core/
├── frontend/          # Next.js 16.1.1 (App Router)
│   ├── src/app/
│   ├── package.json
│   └── tsconfig.json
├── backend/           # NestJS 11.0.1
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
└── work-plan/         # 프로젝트 문서
```

### 1.2 확인된 기술 스택
✅ **정상 설치됨**:
- Frontend: Next.js 16.1.1 + React 19.2.3 + Tailwind CSS 4
- Backend: NestJS 11.0.1 + TypeScript 5.7.3
- Testing: Jest 30.0.0 (Backend)

❌ **누락됨** (프로젝트 정의서 기준):
- Database: Supabase 설정 없음
- Caching: Redis 설정 없음
- Queue: BullMQ 설정 없음
- State Management: Zustand/Jotai 설치 없음
- Form Handling: React Hook Form + Zod 설치 없음
- Data Fetching: TanStack Query 설치 없음
- Docker 설정 없음
- Monorepo 설정 없음 (루트 package.json 없음)

---

## 2. 필수 수정사항 (우선순위 순)

### 2.1 프로젝트 구조 재구성 [HIGH]

#### 문제점
현재 frontend/backend가 독립된 프로젝트로 분리되어 있어 코드 공유가 어렵습니다.

#### 수정방안
**옵션 1: Monorepo 구조로 전환 (권장)**
```
matching-core/
├── apps/
│   ├── frontend/      # Next.js 앱
│   └── backend/       # NestJS 앱
├── packages/
│   ├── shared/        # 공통 타입, 유틸리티
│   ├── ui/            # 공통 UI 컴포넌트
│   └── config/        # 공통 설정
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── package.json       # 루트 workspace 설정
└── pnpm-workspace.yaml
```

**구현 단계**:
1. 루트에 `package.json` 생성 (pnpm workspace 설정)
2. `pnpm-workspace.yaml` 생성
3. frontend → apps/frontend 이동
4. backend → apps/backend 이동
5. packages/shared 생성 (공통 타입 정의용)

**파일 생성 예시**:
```json
// 루트 package.json
{
  "name": "matching-core",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "pnpm": "^9.0.0",
    "turbo": "^2.0.0"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**옵션 2: 현재 구조 유지 (단순화)**
- 공통 타입을 npm package로 분리하여 각 프로젝트에 설치
- 단, 타입 동기화 문제 발생 가능

---

### 2.2 Backend: 핵심 의존성 추가 [HIGH]

#### 2.2.1 Supabase 통합
**위치**: `backend/package.json`

**설치 명령**:
```bash
cd backend
npm install @supabase/supabase-js
npm install -D @types/node
```

**필요 파일**:
```typescript
// backend/src/config/supabase.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
}));
```

```typescript
// backend/src/database/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('supabase.url');
    const key = this.configService.get<string>('supabase.key');
    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
```

**환경변수 파일 생성**:
```bash
# backend/.env
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 2.2.2 추가 필수 패키지
```bash
cd backend

# 설정 관리
npm install @nestjs/config

# Validation
npm install class-validator class-transformer

# Swagger (API 문서화)
npm install @nestjs/swagger swagger-ui-express

# Redis (캐싱)
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-yet redis

# BullMQ (큐 시스템)
npm install @nestjs/bull bullmq

# CORS
npm install @nestjs/platform-express
```

---

### 2.3 Backend: 모듈 구조 설계 [HIGH]

#### 현재 문제점
`app.module.ts`에 모든 로직이 집중될 위험

#### 수정방안: 도메인 기반 모듈 구조
```
backend/src/
├── main.ts
├── app.module.ts
├── config/                    # 설정 모듈
│   ├── app.config.ts
│   ├── database.config.ts
│   └── swagger.config.ts
├── database/                  # DB 연결 모듈
│   ├── database.module.ts
│   └── supabase.service.ts
├── common/                    # 공통 모듈
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── modules/
│   ├── auth/                  # 인증/인가
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── user/                  # 사용자 관리
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── entities/user.entity.ts
│   │   └── dto/
│   ├── team/                  # 팀 관리
│   │   ├── team.module.ts
│   │   ├── team.controller.ts
│   │   ├── team.service.ts
│   │   ├── entities/team.entity.ts
│   │   └── dto/
│   └── matching/              # 매칭 코어 로직
│       ├── matching.module.ts
│       ├── matching.controller.ts
│       ├── matching.service.ts
│       ├── strategies/        # 매칭 전략
│       │   ├── base.strategy.ts
│       │   ├── distance.strategy.ts
│       │   └── preference.strategy.ts
│       ├── entities/
│       │   ├── matchable-entity.interface.ts
│       │   ├── matching-request.entity.ts
│       │   └── match.entity.ts
│       └── dto/
└── shared/                    # 공유 타입/유틸
    ├── interfaces/
    ├── types/
    └── utils/
```

**구체적 구현 예시**:
```typescript
// backend/src/modules/matching/strategies/base.strategy.ts
export interface MatchingStrategy {
  name: string;
  execute(requester: MatchableEntity, candidates: MatchableEntity[]): Match[];
}

export abstract class BaseMatchingStrategy implements MatchingStrategy {
  abstract name: string;

  abstract score(
    requester: MatchableEntity,
    candidate: MatchableEntity,
  ): number;

  execute(
    requester: MatchableEntity,
    candidates: MatchableEntity[],
  ): Match[] {
    return candidates
      .map(candidate => ({
        entities: [requester, candidate],
        score: this.score(requester, candidate),
        status: 'proposed' as const,
        metadata: {},
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10
  }
}
```

---

### 2.4 Frontend: 필수 패키지 추가 [HIGH]

#### 설치 명령
```bash
cd frontend

# State Management
npm install zustand

# Form Handling
npm install react-hook-form zod @hookform/resolvers

# Data Fetching
npm install @tanstack/react-query

# Supabase Client
npm install @supabase/supabase-js @supabase/ssr

# 추가 유틸리티
npm install clsx tailwind-merge
npm install -D @types/node
```

---

### 2.5 Frontend: 폴더 구조 개선 [MEDIUM]

#### 현재 문제점
`src/app/` 디렉토리만 존재, 컴포넌트/로직 분리 부재

#### 수정방안
```
frontend/src/
├── app/                       # Next.js App Router
│   ├── (auth)/               # 인증 그룹
│   │   ├── login/
│   │   └── register/
│   ├── (main)/               # 메인 그룹
│   │   ├── page.tsx          # 홈
│   │   ├── playground/
│   │   └── docs/
│   ├── api/                  # API Routes (필요시)
│   ├── layout.tsx
│   └── globals.css
├── components/               # 재사용 컴포넌트
│   ├── ui/                   # 기본 UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── features/             # 기능별 컴포넌트
│   │   ├── matching/
│   │   ├── profile/
│   │   └── team/
│   └── layout/               # 레이아웃 컴포넌트
│       ├── header.tsx
│       └── footer.tsx
├── lib/                      # 유틸리티/헬퍼
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── api/                  # API 클라이언트
│   │   └── matching.api.ts
│   └── utils/
│       ├── cn.ts             # classname 유틸
│       └── validators.ts
├── hooks/                    # Custom Hooks
│   ├── use-matching.ts
│   └── use-user.ts
├── stores/                   # Zustand Stores
│   ├── user.store.ts
│   └── matching.store.ts
├── types/                    # TypeScript 타입
│   ├── matching.types.ts
│   └── user.types.ts
└── constants/                # 상수
    └── matching.constants.ts
```

**필수 생성 파일**:
```typescript
// frontend/src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

```typescript
// frontend/src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
// frontend/src/stores/matching.store.ts
import { create } from 'zustand';

interface MatchingState {
  selectedType: 'user-user' | 'user-team' | 'team-team';
  setSelectedType: (type: MatchingState['selectedType']) => void;
}

export const useMatchingStore = create<MatchingState>((set) => ({
  selectedType: 'user-user',
  setSelectedType: (type) => set({ selectedType: type }),
}));
```

---

### 2.6 Docker 설정 추가 [HIGH]

#### 파일 위치 및 내용
```dockerfile
# docker/Dockerfile.backend
FROM node:20-alpine AS base

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY backend/package*.json ./

EXPOSE 3001
CMD ["node", "dist/main"]
```

```dockerfile
# docker/Dockerfile.frontend
FROM node:20-alpine AS base

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY frontend/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - redis

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

### 2.7 환경변수 관리 [HIGH]

#### 파일 생성 필요
```bash
# 루트 .env.example (템플릿)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REDIS_URL=redis://localhost:6379
PORT=3001
```

**gitignore 업데이트**:
```gitignore
# 루트 .gitignore
.env
.env.local
.env.*.local
```

---

## 3. 코드 품질 개선사항 [MEDIUM]

### 3.1 Backend: app.module.ts 수정

**현재 파일**: `backend/src/app.module.ts`

**수정 전**:
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**수정 후**:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import supabaseConfig from './config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, supabaseConfig],
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5분
    }),
    // 추후 추가될 도메인 모듈들
    // AuthModule,
    // UserModule,
    // TeamModule,
    // MatchingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

### 3.2 Backend: main.ts Swagger 설정

**현재 파일**: `backend/src/main.ts`

**추가 필요 내용**:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validation Pipe 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Matching Core API')
    .setDescription('매칭 코어 시스템 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
```

---

### 3.3 Frontend: page.tsx 초기 구조 변경

**현재 파일**: `frontend/src/app/page.tsx`

**문제점**: Next.js 기본 템플릿 그대로 사용

**수정 후**:
```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Matching Core
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            범용 매칭 시스템 코어 - User vs User, User vs Team, Team vs Team
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/playground"
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition"
            >
              Playground 체험하기
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              API 문서 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            title="User vs User"
            description="1:1 또는 1:N 매칭 (중고거래, 여행 동행 등)"
            icon="👥"
          />
          <FeatureCard
            title="User vs Team"
            description="개인과 단체 간 매칭 (용병 구하기, 길드 가입 등)"
            icon="👤⚔️"
          />
          <FeatureCard
            title="Team vs Team"
            description="단체 간 매칭 (팀 스포츠, 스터디 그룹 등)"
            icon="⚔️"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
```

---

## 4. 데이터베이스 스키마 설계 [HIGH]

### 4.1 Supabase 테이블 생성 SQL

**실행 위치**: Supabase Dashboard > SQL Editor

```sql
-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams 테이블
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members 테이블
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Matching Requests 테이블
CREATE TABLE matching_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  requester_type VARCHAR(10) NOT NULL CHECK (requester_type IN ('user', 'team')),
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('user', 'team')),
  filters JSONB,
  strategy VARCHAR(50) DEFAULT 'distance',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches 테이블
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES matching_requests(id) ON DELETE CASCADE,
  entity1_id UUID NOT NULL,
  entity1_type VARCHAR(10) NOT NULL,
  entity2_id UUID NOT NULL,
  entity2_type VARCHAR(10) NOT NULL,
  score DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'expired')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_owner ON teams(owner_id);
CREATE INDEX idx_matching_requests_status ON matching_requests(status);
CREATE INDEX idx_matches_status ON matches(status);
```

---

## 5. 테스팅 구조 설정 [MEDIUM]

### 5.1 Backend 테스트 구조
```
backend/test/
├── unit/                      # 단위 테스트
│   ├── matching.service.spec.ts
│   └── strategies/
│       └── distance.strategy.spec.ts
├── integration/               # 통합 테스트
│   └── matching.controller.spec.ts
└── e2e/                       # E2E 테스트
    └── matching.e2e-spec.ts
```

### 5.2 Frontend E2E 테스트 설정 (Playwright)

**설치**:
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**설정 파일**: `frontend/playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 6. 우선순위별 실행 계획

### Phase 1: 기반 구축 (1-2일)
1. ✅ Monorepo 구조 전환 (선택적)
2. ✅ Backend 필수 패키지 설치 (Supabase, Config, Validation)
3. ✅ Frontend 필수 패키지 설치 (Zustand, React Hook Form, TanStack Query)
4. ✅ 환경변수 파일 생성 (.env.example, .env)
5. ✅ Docker 설정 추가

### Phase 2: 코어 구조 구축 (2-3일)
1. ✅ Backend 모듈 구조 생성 (auth, user, team, matching)
2. ✅ Supabase 테이블 생성
3. ✅ Frontend 폴더 구조 개선
4. ✅ Swagger 설정 완료

### Phase 3: 기능 구현 시작 (3-5일)
1. ✅ User CRUD API 구현
2. ✅ Team CRUD API 구현
3. ✅ 기본 매칭 알고리즘 구현
4. ✅ Frontend 기본 UI 구현

---

## 7. 즉시 실행 가능한 명령어 모음

```bash
# 1. Backend 패키지 설치
cd backend
npm install @nestjs/config @supabase/supabase-js class-validator class-transformer @nestjs/swagger swagger-ui-express @nestjs/cache-manager cache-manager

# 2. Frontend 패키지 설치
cd ../frontend
npm install zustand react-hook-form zod @hookform/resolvers @tanstack/react-query @supabase/supabase-js @supabase/ssr clsx tailwind-merge

# 3. 개발 서버 실행
cd ../backend && npm run start:dev &
cd ../frontend && npm run dev &
```

---

## 8. 체크리스트

### 필수 (HIGH)
- [ ] Monorepo 구조 전환 검토 및 실행
- [ ] Backend: Supabase, Config, Validation 패키지 설치
- [ ] Backend: 모듈 구조 생성 (auth, user, team, matching)
- [ ] Backend: Swagger 설정 추가
- [ ] Frontend: Zustand, React Hook Form, TanStack Query 설치
- [ ] Frontend: 폴더 구조 개선
- [ ] Docker 설정 추가
- [ ] 환경변수 파일 생성
- [ ] Supabase 테이블 생성

### 권장 (MEDIUM)
- [ ] Backend: Redis, BullMQ 설치
- [ ] Frontend: Playwright E2E 테스트 설정
- [ ] 테스트 폴더 구조 개선
- [ ] CI/CD 파이프라인 설정 (GitHub Actions)

### 선택 (LOW)
- [ ] Prettier, ESLint 공통 설정
- [ ] Husky + lint-staged 설정
- [ ] 공통 UI 컴포넌트 라이브러리 구축
- [ ] Storybook 설정

---

**다음 단계**: 이 문서의 Phase 1부터 순차적으로 진행하시고, 각 단계 완료 후 코드 리뷰를 요청해주세요.
