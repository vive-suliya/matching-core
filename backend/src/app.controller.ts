import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Health Check', description: 'Check if the server is running' })
  @ApiResponse({ status: 200, description: 'Server is operational' })
  getHello(): string {
    return this.appService.getHello();
  }
}
