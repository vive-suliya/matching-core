# Authentication Guide

## Overview

The Matching Core API uses **Supabase Authentication** for securing endpoints. Most endpoints require a valid JWT token in the Authorization header.

## Authentication Flow

### 1. Get Access Token from Supabase

```typescript
// Frontend example (using @supabase/supabase-js)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get access token
const accessToken = data.session?.access_token;
```

### 2. Use Token in API Requests

```bash
curl -X POST http://localhost:3001/matching/request \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requesterType": "user",
    "targetType": "team",
    "strategy": "hybrid",
    "filters": {
      "location": [37.5665, 126.9780],
      "radius": 5000,
      "categories": ["sports", "gaming"]
    }
  }'
```

## Protected Endpoints

The following endpoints require authentication:

- `POST /matching/request` - Create matching request
- `GET /matching/results/:requestId` - Get matching results
- `POST /matching/:matchId/accept` - Accept a match
- `POST /matching/:matchId/reject` - Reject a match

## Public Endpoints

These endpoints do NOT require authentication:

- `GET /health` - Health check
- `GET /health/liveness` - Kubernetes liveness probe
- `GET /health/readiness` - Kubernetes readiness probe
- `GET /matching/stats` - System statistics
- `GET /` - Welcome endpoint

## Automatic User ID Injection

When authenticated, the user ID is automatically extracted from the token and injected into requests:

```typescript
// You don't need to provide requesterId in the body
// It's automatically set from the authenticated user
@Post('request')
async createRequest(
  @CurrentUser() user: CurrentUserData,
  @Body() dto: CreateMatchingRequestDto
) {
  dto.requesterId = user.userId; // Auto-injected
  return this.service.createMatchingRequest(dto);
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### Missing Token

```json
{
  "statusCode": 401,
  "message": "Missing or invalid authorization header"
}
```

## Testing with Swagger

1. Go to http://localhost:3001/api/docs
2. Click the **Authorize** button (🔒 icon)
3. Enter your token: `Bearer YOUR_ACCESS_TOKEN`
4. Click **Authorize**
5. Now you can test protected endpoints

## Environment Variables

```bash
# .env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Custom Guards

### SupabaseAuthGuardWithPublic

This guard checks for the `@Public()` decorator and skips authentication for marked routes.

```typescript
@Public()
@Get('stats')
async getStats() {
  // No authentication required
}
```

### OptionalAuthGuard

Use this guard when authentication is optional:

```typescript
@UseGuards(OptionalAuthGuard)
@Get('profile')
async getProfile(@CurrentUser() user: CurrentUserData | null) {
  if (user) {
    // User is authenticated
  } else {
    // User is not authenticated, but request is allowed
  }
}
```

## Security Best Practices

1. **Never commit JWT_SECRET** to version control
2. **Use strong secrets** in production (minimum 32 characters)
3. **Rotate tokens regularly** (default: 7 days expiration)
4. **Use HTTPS** in production
5. **Implement rate limiting** (already configured: 5 req/60s for matching)
6. **Validate token expiration** (handled automatically by Supabase)

## Troubleshooting

### Token Expired

Refresh the token using Supabase:

```typescript
const { data, error } = await supabase.auth.refreshSession();
const newToken = data.session?.access_token;
```

### Invalid Token Format

Ensure the token is prefixed with `Bearer `:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### CORS Issues

Make sure `FRONTEND_URL` is set correctly in `.env`:

```bash
FRONTEND_URL=http://localhost:3000
```
