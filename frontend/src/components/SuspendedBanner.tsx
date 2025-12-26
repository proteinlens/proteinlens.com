// Suspended User Banner
// Feature: 012-admin-dashboard
// T069: Display suspension message to suspended users

interface SuspendedBannerProps {
  className?: string;
}

/**
 * Simple warning icon SVG component
 */
function WarningIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

/**
 * Banner displayed to users whose accounts have been suspended.
 * Shows a prominent warning message with instructions to contact support.
 * 
 * This component should be rendered at the top of the page when the API
 * returns a USER_SUSPENDED error (403 status with code: 'USER_SUSPENDED').
 */
export function SuspendedBanner({ className = '' }: SuspendedBannerProps) {
  return (
    <div
      className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <WarningIcon className="h-6 w-6 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800">
            Account Suspended
          </h3>
          <p className="mt-2 text-sm text-red-700">
            Your account has been suspended and you cannot access ProteinLens services at this time.
          </p>
          <p className="mt-2 text-sm text-red-700">
            If you believe this is a mistake or would like more information, please{' '}
            <a
              href="mailto:support@proteinlens.com"
              className="font-medium underline hover:text-red-600"
            >
              contact our support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page suspended state for when the entire app should be blocked.
 * Use this when you want to completely prevent access, not just show a banner.
 */
export function SuspendedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md w-full">
        <div className="text-center mb-8">
          <WarningIcon className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Account Suspended
          </h1>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Your ProteinLens account has been suspended. You are currently unable to access the platform.
            </p>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                If you have questions about this suspension or believe this is an error, please contact our support team.
              </p>
            </div>
            
            <div className="pt-4">
              <a
                href="mailto:support@proteinlens.com"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
        
        <p className="mt-4 text-center text-xs text-gray-500">
          Reference: Please include your account email when contacting support.
        </p>
      </div>
    </div>
  );
}

export default SuspendedBanner;
