import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import supabaseConfig from './config/supabase.config';
import { DatabaseModule } from './database/database.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AuthModule } from './modules/auth/auth.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

import { ScheduleModule } from '@nestjs/schedule';

import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, supabaseConfig],
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    // Rate Limiting: 60초에 최대 10개 요청
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60초
      limit: 10,   // 최대 10개 요청
    }]),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5 minutes
    }),
    MonitoringModule,
    DatabaseModule,
    AuthModule,
    MatchingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


