import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

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

  @Get('health')
  @ApiOperation({ summary: 'Health Check', description: 'Detailed system health status' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  getHealth() {
    return {
      status: 'up',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    };
  }
}
