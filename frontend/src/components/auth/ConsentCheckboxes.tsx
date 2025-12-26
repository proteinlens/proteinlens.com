/**
 * ConsentCheckboxes Component
 * Feature 010 - User Signup Process
 * 
 * Renders checkboxes for Terms of Service and Privacy Policy consent.
 * Includes links to view the full documents via modals or external links.
 */

import { FC, useId, useState } from 'react';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';

interface ConsentCheckboxesProps {
  /** Whether Terms of Service is accepted */
  acceptedTerms: boolean;
  /** Whether Privacy Policy is accepted */
  acceptedPrivacy: boolean;
  /** Whether marketing emails are accepted (optional) */
  acceptedMarketing?: boolean;
  /** Called when ToS checkbox changes */
  onTermsChange: (checked: boolean) => void;
  /** Called when Privacy checkbox changes */
  onPrivacyChange: (checked: boolean) => void;
  /** Called when Marketing checkbox changes */
  onMarketingChange?: (checked: boolean) => void;
  /** Error message for ToS */
  termsError?: string;
  /** Error message for Privacy */
  privacyError?: string;
  /** Whether to show marketing opt-in */
  showMarketing?: boolean;
  /** Whether the checkboxes are disabled */
  disabled?: boolean;
  /** Whether to use modal dialogs instead of external links */
  useModals?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Consent checkboxes for signup flow.
 * ToS and Privacy are required; Marketing is optional.
 */
export const ConsentCheckboxes: FC<ConsentCheckboxesProps> = ({
  acceptedTerms,
  acceptedPrivacy,
  acceptedMarketing = false,
  onTermsChange,
  onPrivacyChange,
  onMarketingChange,
  termsError,
  privacyError,
  showMarketing = true,
  disabled = false,
  useModals = true,
  className = '',
}) => {
  const termsId = useId();
  const privacyId = useId();
  const marketingId = useId();

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const tosUrl = import.meta.env.VITE_TOS_URL || '/terms';
  const privacyUrl = import.meta.env.VITE_PRIVACY_URL || '/privacy';

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (useModals) {
      setShowTermsModal(true);
    } else {
      window.open(tosUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (useModals) {
      setShowPrivacyModal(true);
    } else {
      window.open(privacyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Terms of Service */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 items-center">
            <input
              id={termsId}
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => onTermsChange(e.target.checked)}
              disabled={disabled}
              aria-invalid={!!termsError}
              aria-describedby={termsError ? `${termsId}-error` : undefined}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="text-sm">
            <label
              htmlFor={termsId}
              className={`font-medium ${termsError ? 'text-red-700' : 'text-gray-700'}`}
            >
              I accept the{' '}
              <button
                type="button"
                onClick={handleTermsClick}
                className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Terms of Service
              </button>
              <span className="text-red-500" aria-hidden="true"> *</span>
            </label>
            {termsError && (
              <p
                id={`${termsId}-error`}
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
                role="alert"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {termsError}
              </p>
            )}
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 items-center">
            <input
              id={privacyId}
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => onPrivacyChange(e.target.checked)}
              disabled={disabled}
              aria-invalid={!!privacyError}
              aria-describedby={privacyError ? `${privacyId}-error` : undefined}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="text-sm">
            <label
              htmlFor={privacyId}
              className={`font-medium ${privacyError ? 'text-red-700' : 'text-gray-700'}`}
            >
              I accept the{' '}
              <button
                type="button"
                onClick={handlePrivacyClick}
                className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Privacy Policy
              </button>
              <span className="text-red-500" aria-hidden="true"> *</span>
            </label>
            {privacyError && (
              <p
                id={`${privacyId}-error`}
                className="mt-1 flex items-center gap-1 text-sm text-red-600"
                role="alert"
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {privacyError}
              </p>
            )}
          </div>
        </div>

        {/* Marketing (optional) */}
        {showMarketing && onMarketingChange && (
          <div className="flex items-start gap-3">
            <div className="flex h-6 items-center">
              <input
                id={marketingId}
                type="checkbox"
                checked={acceptedMarketing}
                onChange={(e) => onMarketingChange(e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="text-sm">
              <label htmlFor={marketingId} className="font-medium text-gray-700">
                I'd like to receive product updates and tips (optional)
              </label>
              <p className="mt-1 text-gray-500">
                You can unsubscribe at any time. We won't spam you.
              </p>
            </div>
          </div>
        )}

        {/* Required fields note */}
        <p className="text-xs text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>

      {/* Modal dialogs */}
      {useModals && (
        <>
          <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
          />
          <PrivacyModal
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
          />
        </>
      )}
    </>
  );
};

export default ConsentCheckboxes;
