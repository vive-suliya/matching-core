import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseService } from './database/supabase.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabase: SupabaseService
  ) { }

  /**
   * ==================================================================================
   * [SECTION] Public Information
   * ==================================================================================
   */

  /**
   * Root Endpoint
   * 
   * Provides basic information about the Matching Core Engine.
   * Useful for initial connectivity verification.
   * 
   * @returns {Object} Server name, version, status, and timestamp
   */
  @Get()
  @ApiOperation({ summary: 'Welcome Endpoint', description: 'Returns basic server information' })
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
   * [SECTION] Health & Monitoring
   * ==================================================================================
   */

  /**
   * Comprehensive Health Check
   * 
   * Performs a deep check of the system's health, including database connectivity.
   * Calculates DB query latency and memory usage stats.
   * 
   * @returns {Object} Detailed health status, metrics, and environment info
   */
  @Get('health')
  @ApiOperation({ summary: 'Health Check (DB 연결 포함)', description: 'Comprehensive system health status with database connectivity check' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  async getHealth() {
    const startTime = Date.now();

    // DB Connection Test
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
   * Liveness Probe (Kubernetes Standard)
   * 
   * A lightweight endpoint used by orchestrators (k8s, docker swarm) to check 
   * if the application process is running. Does not check dependencies.
   * 
   * @returns {Object} { status: 'alive' }
   */
  @Get('health/liveness')
  @ApiOperation({ summary: 'Liveness Probe (Kubernetes)', description: 'Simple check to verify the application is running' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  liveness() {
    return { status: 'alive' };
  }

  /**
   * Readiness Probe (Kubernetes Standard)
   * 
   * Checks if the application is ready to accept traffic.
   * Verifies critical dependencies like Database connections.
   * If this fails, the load balancer should stop sending traffic to this pod.
   * 
   * @returns {Object} { status: 'ready' } or error details
   */
  @Get('health/readiness')
  @ApiOperation({ summary: 'Readiness Probe (Kubernetes)', description: 'Check if the application is ready to serve traffic' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
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

