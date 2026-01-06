import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('supabase') {
    // Override handleRequest to allow requests without authentication
    handleRequest(err: any, user: any) {
        // If there's an error or no user, just return null (don't throw)
        // This allows the request to proceed without authentication
        return user || null;
    }
}
