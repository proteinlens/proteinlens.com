import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';

/**
 * GET /me - Returns the authenticated user's profile
 * 
 * Requires: Bearer token in Authorization header
 * Returns: User profile with id, externalId, email, and plan
 */
export async function me(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  const { user } = auth.ctx;
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      id: user.id,
      externalId: user.externalId,
      email: user.email,
      plan: user.plan,
    },
  };
}

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: me,
});
