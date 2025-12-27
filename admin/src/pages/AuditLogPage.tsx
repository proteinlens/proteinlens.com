// Audit Log Page
// Feature: 012-admin-dashboard
// T075: Audit log page with filters and table

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuditLog } from '../hooks/useAuditLog';
import { Pagination } from '../components/ui/Pagination';

const ACTION_TYPES = [
  'VIEW_USER_LIST',
  'VIEW_USER_DETAIL',
  'PLAN_OVERRIDE',
  'SUSPEND_USER',
  'REACTIVATE_USER',
  'EXPORT_USERS',
  'VIEW_AUDIT_LOG',
];

const ACTION_LABELS: Record<string, string> = {
  VIEW_USER_LIST: '👥 View User List',
  VIEW_USER_DETAIL: '👤 View User Detail',
  PLAN_OVERRIDE: '💳 Plan Override',
  SUSPEND_USER: '🚫 Suspend User',
  REACTIVATE_USER: '✅ Reactivate User',
  EXPORT_USERS: '📤 Export Users',
  VIEW_AUDIT_LOG: '📋 View Audit Log',
};

export function AuditLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const adminEmail = searchParams.get('adminEmail') || '';
  const action = searchParams.get('action') || '';
  const targetUserId = searchParams.get('targetUserId') || '';

  const { data, isLoading, error } = useAuditLog({
    page,
    adminEmail: adminEmail || undefined,
    action: action || undefined,
    targetUserId: targetUserId || undefined,
  });

  const updateParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="admin-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="text"
              id="admin-filter"
              value={adminEmail}
              onChange={(e) => updateParams({ adminEmail: e.target.value })}
              placeholder="Filter by admin..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              id="action-filter"
              value={action}
              onChange={(e) => updateParams({ action: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="target-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Target User ID
            </label>
            <input
              type="text"
              id="target-filter"
              value={targetUserId}
              onChange={(e) => updateParams({ targetUserId: e.target.value })}
              placeholder="Filter by target user..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-admin-600"></div>
            <p className="mt-2 text-gray-500">Loading audit log...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error loading audit log: {error.message}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.adminEmail}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center">
                          {ACTION_LABELS[entry.action] || entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.targetEmail || entry.targetUserId || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {entry.reason || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                        {entry.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.entries.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No audit log entries found.
                </div>
              )}
            </div>
            {data && data.pagination.totalPages > 0 && (
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={(newPage) => updateParams({ page: newPage.toString() })}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
