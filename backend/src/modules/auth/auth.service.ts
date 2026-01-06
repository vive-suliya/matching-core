import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class AuthService {
    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Verify Supabase JWT token and return user data
     */
    async verifyToken(token: string) {
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

    /**
     * Get user profile from Supabase
     */
    async getUserProfile(userId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw new UnauthorizedException('User not found');
        }

        return data;
    }

    /**
     * Check if user has specific role
     */
    async hasRole(userId: string, requiredRole: string): Promise<boolean> {
        const user = await this.getUserProfile(userId);
        return user.role === requiredRole;
    }
}
