# Quickstart: Self-Managed Authentication

**Feature**: 013-self-managed-auth  
**Time to test**: ~10 minutes

## Prerequisites

- Node.js 20.x
- PostgreSQL running (local or Azure)
- Azure Communication Services email domain (for email features)

## 1. Environment Setup

```bash
# Backend environment
cd backend
cp local.settings.json.example local.settings.json
```

Add these to `local.settings.json`:
```json
{
  "Values": {
    "JWT_SECRET": "your-secret-at-least-32-characters-long-for-production",
    "JWT_SECRET_PREVIOUS": "",
    "ACS_EMAIL_CONNECTION_STRING": "endpoint=https://...;accesskey=...",
    "ACS_EMAIL_SENDER": "noreply@proteinlens.com",
    "DATABASE_URL": "postgresql://..."
  }
}
```

## 2. Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Apply migrations (creates auth tables if not present)
npx prisma migrate deploy

# Verify AuthEvent table exists
npx prisma studio  # Open http://localhost:5555
```

## 3. Run Backend

```bash
cd backend
npm install
npm start
```

Backend runs at `http://localhost:7071`

## 4. Test Auth Flow

### Sign Up
```bash
curl -X POST http://localhost:7071/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "MyP@ssw0rd!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJ...",
  "expiresIn": 900,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "emailVerified": false
  }
}
```

### Sign In (fails until email verified)
```bash
curl -X POST http://localhost:7071/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "MyP@ssw0rd!"
  }'
```

Expected: `403 Email not verified`

### Verify Email (get token from database for testing)
```bash
# Get verification token from Prisma Studio
# Then:
curl -X POST http://localhost:7071/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token-from-email"}'
```

### Sign In (succeeds after verification)
```bash
curl -X POST http://localhost:7071/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "MyP@ssw0rd!"
  }'
```

Note: `-c cookies.txt` saves the refresh token cookie

### Refresh Token
```bash
curl -X POST http://localhost:7071/api/auth/refresh \
  -b cookies.txt
```

### List Sessions
```bash
curl http://localhost:7071/api/auth/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Sign Out
```bash
curl -X POST http://localhost:7071/api/auth/signout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt
```

## 5. Run Tests

```bash
cd backend
npm test
```

Expected: 89+ tests passing (jwt: 31, password: 30, auth: 28+)

## 6. Frontend Integration

### AuthContext Setup
```typescript
// frontend/src/hooks/useAuth.ts
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (token, user) => set({ accessToken: token, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
```

### Token Refresh on App Load
```typescript
// frontend/src/App.tsx
useEffect(() => {
  const refreshOnLoad = async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Send cookies
      });
      if (res.ok) {
        const { accessToken, user } = await res.json();
        useAuthStore.getState().setAuth(accessToken, user);
      }
    } catch (e) {
      // Not logged in
    }
  };
  refreshOnLoad();
}, []);
```

## Common Issues

| Issue | Solution |
|-------|----------|
| JWT_SECRET too short | Must be ≥32 characters |
| Email not sending | Check ACS connection string |
| CORS errors | Add frontend origin to Function app CORS |
| Refresh token not set | Check cookie SameSite settings |

## Next Steps

1. Complete email template HTML/text
2. Add frontend pages (SignIn, SignUp, ForgotPassword)
3. Add session management UI
4. Configure production Key Vault secrets
