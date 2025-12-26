/**
 * TermsModal Component
 * Feature 010 - User Signup Process
 * 
 * Modal dialog displaying the full Terms of Service document.
 * Accessible and keyboard-navigable.
 */

import { FC, useEffect, useRef } from 'react';

interface TermsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Terms document version */
  version?: string;
}

/**
 * Modal displaying the Terms of Service.
 */
export const TermsModal: FC<TermsModalProps> = ({
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
      aria-labelledby="terms-modal-title"
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
                id="terms-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                Terms of Service
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
              aria-label="Close terms of service"
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
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing or using ProteinLens ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you do not agree to
                these Terms, please do not use the Service.
              </p>

              <h3>2. Description of Service</h3>
              <p>
                ProteinLens provides AI-powered protein structure analysis and
                visualization tools. The Service is designed to assist researchers
                and scientists in understanding protein structures and their
                interactions.
              </p>

              <h3>3. User Accounts</h3>
              <p>
                To access certain features of the Service, you must create an
                account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>
                  Maintain the security of your password and accept all risks of
                  unauthorized access
                </li>
                <li>
                  Immediately notify us if you discover unauthorized use of your
                  account
                </li>
              </ul>

              <h3>4. Acceptable Use</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any illegal purpose</li>
                <li>
                  Upload any content that infringes intellectual property rights
                </li>
                <li>
                  Attempt to gain unauthorized access to our systems or networks
                </li>
                <li>
                  Interfere with or disrupt the Service or servers or networks
                </li>
                <li>Use automated means to access the Service without permission</li>
              </ul>

              <h3>5. Data and Privacy</h3>
              <p>
                Your use of the Service is also governed by our Privacy Policy.
                You retain ownership of any data you upload to the Service. By
                uploading data, you grant us a license to process and analyze it
                solely for the purpose of providing the Service.
              </p>

              <h3>6. Intellectual Property</h3>
              <p>
                The Service and its original content, features, and functionality
                are owned by ProteinLens and are protected by international
                copyright, trademark, and other intellectual property laws.
              </p>

              <h3>7. Disclaimers</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
                Analysis results are provided for research purposes only and should
                not be used as the sole basis for medical or clinical decisions.
              </p>

              <h3>8. Limitation of Liability</h3>
              <p>
                IN NO EVENT SHALL PROTEINLENS BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING
                FROM YOUR USE OF THE SERVICE.
              </p>

              <h3>9. Changes to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify you of significant changes by email or through the Service.
                Your continued use after changes constitutes acceptance of the
                modified Terms.
              </p>

              <h3>10. Termination</h3>
              <p>
                We may terminate or suspend your account and access to the Service
                immediately, without prior notice, for any breach of these Terms.
              </p>

              <h3>11. Governing Law</h3>
              <p>
                These Terms shall be governed by the laws of the State of Delaware,
                United States, without regard to its conflict of law provisions.
              </p>

              <h3>12. Contact Information</h3>
              <p>
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@proteinlens.com">legal@proteinlens.com</a>.
              </p>
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

export default TermsModal;
