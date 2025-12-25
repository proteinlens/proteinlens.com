// Auth configuration loader for JWT validation
// Reads settings for issuer, audience, and JWKS endpoint

export interface AuthConfig {
  issuer: string; // Expected token issuer (iss)
  audience: string; // Expected audience (aud)
  jwksUri: string; // JWKS endpoint URL
}

export function loadAuthConfig(): AuthConfig {
  const issuer = process.env.AUTH_ISSUER;
  const audience = process.env.AUTH_AUDIENCE;
  const jwksUri = process.env.AUTH_JWKS_URI;

  const missing: string[] = [];
  if (!issuer) missing.push('AUTH_ISSUER');
  if (!audience) missing.push('AUTH_AUDIENCE');
  if (!jwksUri) missing.push('AUTH_JWKS_URI');

  if (missing.length > 0) {
    throw new Error(`Missing required auth environment variables: ${missing.join(', ')}`);
  }

  return {
    issuer: issuer!,
    audience: audience!,
    jwksUri: jwksUri!,
  };
}
