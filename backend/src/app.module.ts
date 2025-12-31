import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import supabaseConfig from './config/supabase.config';
import { DatabaseModule } from './database/database.module';
import { MatchingModule } from './modules/matching/matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, supabaseConfig],
      // envFilePath: '.env', // Default
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5 minutes
    }),
    DatabaseModule,
    MatchingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
