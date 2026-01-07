import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * 서버 인사말 반환
   */
  getHello(): string {
    return 'Hello World!';
  }
}
