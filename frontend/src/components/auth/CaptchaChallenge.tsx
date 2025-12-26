/**
 * CaptchaChallenge Component
 * Feature 010 - User Signup Process
 * 
 * hCaptcha integration for bot protection.
 * Shows captcha after 3 failed signup attempts from same IP.
 */

import { FC, useRef, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface CaptchaChallengeProps {
  /** Whether to show the captcha */
  required: boolean;
  /** Called when captcha is solved */
  onVerify: (token: string) => void;
  /** Called when captcha expires */
  onExpire: () => void;
  /** Called when captcha errors */
  onError: (error: string) => void;
  /** Whether to reset the captcha */
  reset?: boolean;
}

/**
 * hCaptcha challenge component.
 * Only renders when required (after 3 failed attempts).
 */
export const CaptchaChallenge: FC<CaptchaChallengeProps> = ({
  required,
  onVerify,
  onExpire,
  onError,
  reset,
}) => {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  // Reset captcha when requested
  useEffect(() => {
    if (reset && captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
  }, [reset]);

  // Don't render if not required or no site key
  if (!required || !siteKey) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-gray-600">
        Please complete the security check
      </p>
      <div className="captcha-container">
        <HCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={onVerify}
          onExpire={onExpire}
          onError={(err) => onError(err || 'Captcha error')}
          theme="light"
          size="normal"
          languageOverride="en"
        />
      </div>
      <p className="text-xs text-gray-500">
        This helps us prevent automated signups
      </p>
    </div>
  );
};

export default CaptchaChallenge;
