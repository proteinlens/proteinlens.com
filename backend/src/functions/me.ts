import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { requireAuth, isAuthFailure } from '../middleware/authGuard.js';
import { getPrismaClient } from '../utils/prisma.js';

/**
 * GET /me - Returns the authenticated user's profile
 * Feature 017: Extended to include dietStyle selection
 * 
 * Requires: Bearer token in Authorization header
 * Returns: User profile with id, externalId, email, plan, and dietStyle
 */
export async function me(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) {
    return auth.response;
  }

  const { user } = auth.ctx;

  // Feature 017: Fetch user with diet style
  const prisma = getPrismaClient();
  const userWithDietStyle = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      dietStyle: true,
    },
  });

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: {
      id: user.id,
      externalId: user.externalId,
      email: user.email,
      plan: user.plan,
      // Feature 017: Include diet style if set
      dietStyle: userWithDietStyle?.dietStyle 
        ? {
            id: userWithDietStyle.dietStyle.id,
            slug: userWithDietStyle.dietStyle.slug,
            name: userWithDietStyle.dietStyle.name,
            description: userWithDietStyle.dietStyle.description,
            netCarbCapG: userWithDietStyle.dietStyle.netCarbCapG,
            fatTargetPercent: userWithDietStyle.dietStyle.fatTargetPercent,
          }
        : null,
    },
  };
}

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: me,
});
