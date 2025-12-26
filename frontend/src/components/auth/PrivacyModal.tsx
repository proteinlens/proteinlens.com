/**
 * PrivacyModal Component
 * Feature 010 - User Signup Process
 * 
 * Modal dialog displaying the full Privacy Policy document.
 * Accessible and keyboard-navigable.
 */

import { FC, useEffect, useRef } from 'react';

interface PrivacyModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Privacy policy document version */
  version?: string;
}

/**
 * Modal displaying the Privacy Policy.
 */
export const PrivacyModal: FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  version = '1.0',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and escape key handling
  useEffect(() => {
    if (isOpen) {
      // Save previous focus
      const previousFocus = document.activeElement as HTMLElement;
      
      // Focus close button
      closeButtonRef.current?.focus();

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      // Handle tab trap
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTab);
        document.body.style.overflow = '';
        previousFocus?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="privacy-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          ref={modalRef}
          className="relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:max-w-3xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <div>
              <h2
                id="privacy-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                Privacy Policy
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Version {version} • Last updated December 2024
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close privacy policy"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              <h3>1. Introduction</h3>
              <p>
                ProteinLens ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our protein
                analysis service.
              </p>

              <h3>2. Information We Collect</h3>
              <h4>2.1 Information You Provide</h4>
              <ul>
                <li>
                  <strong>Account Information:</strong> Name, email address, and
                  password when you create an account
                </li>
                <li>
                  <strong>Profile Information:</strong> Organization name, phone
                  number (optional)
                </li>
                <li>
                  <strong>Research Data:</strong> Protein structures, sequences,
                  and analysis parameters you upload
                </li>
                <li>
                  <strong>Communications:</strong> Messages sent through support
                  channels
                </li>
              </ul>

              <h4>2.2 Information Collected Automatically</h4>
              <ul>
                <li>
                  <strong>Usage Data:</strong> Features used, analysis runs,
                  interaction patterns
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, operating
                  system, device identifiers
                </li>
                <li>
                  <strong>Log Data:</strong> IP address, access times, pages viewed
                </li>
              </ul>

              <h3>3. How We Use Your Information</h3>
              <p>We use collected information to:</p>
              <ul>
                <li>Provide, maintain, and improve the Service</li>
                <li>Process and analyze your protein data</li>
                <li>Communicate with you about the Service</li>
                <li>Respond to your support requests</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h3>4. Data Sharing and Disclosure</h3>
              <p>We do not sell your personal information. We may share data:</p>
              <ul>
                <li>
                  <strong>With Service Providers:</strong> Third parties who help
                  operate our Service (cloud hosting, analytics)
                </li>
                <li>
                  <strong>For Legal Reasons:</strong> When required by law or to
                  protect our rights
                </li>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly agree to
                  sharing
                </li>
              </ul>

              <h3>5. Data Security</h3>
              <p>We implement appropriate security measures including:</p>
              <ul>
                <li>Encryption of data in transit (TLS 1.3) and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data centers with physical access controls</li>
              </ul>

              <h3>6. Data Retention</h3>
              <p>
                We retain your data for as long as your account is active or as
                needed to provide services. You may request deletion of your data
                at any time, subject to legal requirements.
              </p>

              <h3>7. Your Rights</h3>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data</li>
                <li>Export your data in a portable format</li>
                <li>Object to or restrict processing</li>
                <li>Withdraw consent</li>
              </ul>

              <h3>8. Cookies and Tracking</h3>
              <p>
                We use essential cookies for authentication and security.
                Analytics cookies are used only with your consent to improve the
                Service.
              </p>

              <h3>9. International Data Transfers</h3>
              <p>
                Your data may be transferred to and processed in countries other
                than your own. We ensure appropriate safeguards are in place for
                such transfers.
              </p>

              <h3>10. Children's Privacy</h3>
              <p>
                The Service is not intended for users under 16 years of age. We do
                not knowingly collect data from children.
              </p>

              <h3>11. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy periodically. We will notify you
                of significant changes via email or through the Service.
              </p>

              <h3>12. Contact Us</h3>
              <p>
                For questions about this Privacy Policy or to exercise your rights,
                contact us at:
              </p>
              <ul>
                <li>
                  Email:{' '}
                  <a href="mailto:privacy@proteinlens.com">
                    privacy@proteinlens.com
                  </a>
                </li>
                <li>Data Protection Officer: dpo@proteinlens.com</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
