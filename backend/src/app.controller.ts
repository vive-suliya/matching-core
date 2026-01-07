import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseService } from './database/supabase.service';
import { MetricsService } from './modules/monitoring/metrics.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabase: SupabaseService,
    private readonly metricsService: MetricsService
  ) { }

  /**
   * ==================================================================================
   * [SECTION] 공개 정보 엔드포인트
   * ==================================================================================
   */

  /**
   * Prometheus 메트릭 엔드포인트
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus 메트릭 조회', description: '시스템의 성능 메트릭을 Prometheus 형식으로 반환합니다.' })
  async getMetrics() {
    return this.metricsService.getMetrics();
  }

  /**
   * 루트 엔드포인트
   * 
   * Matching Core Engine에 대한 기본 정보를 제공합니다.
   * 초기 연결 확인용으로 유용합니다.
   * 
   * @returns {Object} 서버 이름, 버전, 상태, 타임스탬프
   */
  @Get()
  @ApiOperation({ summary: '환영 엔드포인트', description: '기본 서버 정보를 반환합니다.' })
  getHello() {
    return {
      name: 'Matching Core Engine',
      version: '2.1.0',
      status: 'operational',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * ==================================================================================
   * [SECTION] 헬스 체크 및 모니터링
   * ==================================================================================
   */

  /**
   * 종합 상태 확인 (Health Check)
   * 
   * 데이터베이스 연결을 포함하여 시스템의 전반적인 상태를 깊이 있게 확인합니다.
   * DB 쿼리 지연 시간 및 메모리 사용 통계를 계산합니다.
   * 
   * @returns {Object} 상세 상태, 메트릭 및 환경 정보
   */
  @Get('health')
  @ApiOperation({ summary: '상태 확인 (DB 연결 포함)', description: '데이터베이스 연결 확인을 포함한 종합적인 시스템 상태' })
  @ApiResponse({ status: 200, description: '시스템 정상' })
  async getHealth() {
    const startTime = Date.now();

    // DB 연결 테스트
    let dbStatus = 'unknown';
    let dbLatency = 0;

    try {
      const dbStart = Date.now();
      const { error } = await this.supabase.getClient().from('users').select('id').limit(1);
      dbLatency = Date.now() - dbStart;

      if (error) {
        dbStatus = 'unhealthy';
      } else {
        dbStatus = 'healthy';
      }
    } catch (e) {
      dbStatus = 'error';
    }

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '2.1.0',
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        memory: {
          usage: process.memoryUsage(),
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        },
      },
      responseTime: `${Date.now() - startTime}ms`,
    };
  }

  /**
   * Liveness Probe (Kubernetes 표준)
   * 
   * 애플리케이션 프로세스가 실행 중인지 확인하기 위해 오케스트레이터가 사용하는 가벼운 엔드포인트입니다.
   * 의존성 상태는 확인하지 않습니다.
   * 
   * @returns {Object} { status: 'alive' }
   */
  @Get('health/liveness')
  @ApiOperation({ summary: 'Liveness Probe (Kubernetes)', description: '애플리케이션 실행 여부 확인' })
  @ApiResponse({ status: 200, description: '애플리케이션 살아있음' })
  liveness() {
    return { status: 'alive' };
  }

  /**
   * Readiness Probe (Kubernetes 표준)
   * 
   * 애플리케이션이 트래픽을 처리할 준비가 되었는지 확인합니다.
   * 데이터베이스 연결과 같은 주요 의존성을 검증합니다.
   * 실패 시 로드밸런서는 해당 포드로의 트래픽 전송을 중단합니다.
   * 
   * @returns {Object} { status: 'ready' } 또는 에러 정보
   */
  @Get('health/readiness')
  @ApiOperation({ summary: 'Readiness Probe (Kubernetes)', description: '애플리케이션 트래픽 수신 준비 여부 확인' })
  @ApiResponse({ status: 200, description: '애플리케이션 준비됨' })
  async readiness() {
    try {
      const { error } = await this.supabase.getClient().from('users').select('id').limit(1);
      if (error) throw error;
      return { status: 'ready' };
    } catch (e) {
      return { status: 'not ready', error: e.message };
    }
  }
}

