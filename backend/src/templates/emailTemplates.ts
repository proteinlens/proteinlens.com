/**
 * Email Templates for Authentication
 * 
 * Feature: 013-self-managed-auth
 * 
 * These templates are exported for use in the email service.
 * Each template function returns both HTML and plain text versions.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  plainText: string;
}

// ===========================================
// Verification Email Template
// ===========================================

export function verificationEmailTemplate(
  verifyUrl: string,
  expiresInHours: number
): EmailTemplate {
  const subject = 'Verify your ProteinLens account';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ProteinLens</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Welcome! Please verify your email</h2>
    <p>Thanks for signing up for ProteinLens. To complete your registration, please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link will expire in ${expiresInHours} hours.</p>
    <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
  </div>
</body>
</html>`;

  const plainText = `
Welcome to ProteinLens!

Please verify your email address by visiting the following link:

${verifyUrl}

This link will expire in ${expiresInHours} hours.

If you didn't create an account, you can safely ignore this email.

---
ProteinLens - AI-Powered Meal Analysis
`;

  return { subject, html, plainText };
}

// ===========================================
// Password Reset Email Template
// ===========================================

export function passwordResetEmailTemplate(
  resetUrl: string,
  expiresInHours: number
): EmailTemplate {
  const subject = 'Reset your ProteinLens password';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ProteinLens</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Reset your password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;"><strong>This link will expire in ${expiresInHours} hour${expiresInHours !== 1 ? 's' : ''}.</strong></p>
    <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetUrl}</p>
  </div>
</body>
</html>`;

  const plainText = `
Reset your ProteinLens password

We received a request to reset your password. Click the link below to choose a new password:

${resetUrl}

This link will expire in ${expiresInHours} hour${expiresInHours !== 1 ? 's' : ''}.

If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.

---
ProteinLens - AI-Powered Meal Analysis
`;

  return { subject, html, plainText };
}

// ===========================================
// Password Changed Email Template
// ===========================================

export function passwordChangedEmailTemplate(
  ipAddress: string,
  userAgent?: string
): EmailTemplate {
  const subject = 'Your ProteinLens password was changed';
  const timestamp = new Date().toISOString();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password changed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ProteinLens</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Your password was changed</h2>
    <p>This is a confirmation that your ProteinLens account password was successfully changed.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;"><strong>Details:</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">IP Address: ${ipAddress}</p>
      ${userAgent ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Device: ${userAgent}</p>` : ''}
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Time: ${timestamp}</p>
    </div>
    <p style="color: #666; font-size: 14px;"><strong>If you did not make this change</strong>, please contact support immediately and consider resetting your password.</p>
  </div>
</body>
</html>`;

  const plainText = `
Your ProteinLens password was changed

This is a confirmation that your ProteinLens account password was successfully changed.

Details:
- IP Address: ${ipAddress}
${userAgent ? `- Device: ${userAgent}` : ''}
- Time: ${timestamp}

If you did not make this change, please contact support immediately and consider resetting your password.

---
ProteinLens - AI-Powered Meal Analysis
`;

  return { subject, html, plainText };
}
