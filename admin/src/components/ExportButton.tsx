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
      className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
    >
      <svg
        className="h-4 w-4 transition-transform group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export CSV
    </button>
  );
}
