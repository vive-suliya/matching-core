import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { SupabaseService } from '../../../database/supabase.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
    constructor(private readonly supabaseService: SupabaseService) {
        super();
    }

    async validate(req: Request): Promise<any> {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .auth
                .getUser(token);

            if (error || !data.user) {
                throw new UnauthorizedException('Invalid or expired token');
            }

            return {
                userId: data.user.id,
                email: data.user.email,
                role: data.user.role,
                metadata: data.user.user_metadata,
            };
        } catch (error) {
            throw new UnauthorizedException('Token validation failed');
        }
    }
}
