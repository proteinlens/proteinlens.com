// Export Button component
// Feature: 012-admin-dashboard
// T052, T053: Export button with CSV download

import { logExport, type UserListItem } from '../services/adminApi';

interface ExportButtonProps {
  users: UserListItem[];
  disabled?: boolean;
}

export function ExportButton({ users, disabled }: ExportButtonProps) {
  const handleExport = async () => {
    if (users.length === 0) return;

    // Log export action
    try {
      await logExport(users.length);
    } catch (error) {
      console.error('Failed to log export:', error);
    }

    // Generate CSV
    const headers = ['Email', 'First Name', 'Last Name', 'Plan', 'Status', 'Suspended', 'Created At'];
    const rows = users.map(user => [
      user.email || '',
      user.firstName || '',
      user.lastName || '',
      user.plan,
      user.subscriptionStatus || 'free',
      user.suspended ? 'Yes' : 'No',
      new Date(user.createdAt).toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      Export CSV
    </button>
  );
}
