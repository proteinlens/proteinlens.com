// Audit Log Page
// Feature: 012-admin-dashboard
// T075: Audit log page with filters and table

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { clsx } from 'clsx';
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

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  VIEW_USER_LIST: {
    label: 'View User List',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    color: 'bg-admin-50 text-admin-700',
  },
  VIEW_USER_DETAIL: {
    label: 'View User Detail',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    color: 'bg-blue-50 text-blue-700',
  },
  PLAN_OVERRIDE: {
    label: 'Plan Override',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    color: 'bg-purple-50 text-purple-700',
  },
  SUSPEND_USER: {
    label: 'Suspend User',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    color: 'bg-red-50 text-red-700',
  },
  REACTIVATE_USER: {
    label: 'Reactivate User',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'bg-emerald-50 text-emerald-700',
  },
  EXPORT_USERS: {
    label: 'Export Users',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    color: 'bg-amber-50 text-amber-700',
  },
  VIEW_AUDIT_LOG: {
    label: 'View Audit Log',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    color: 'bg-gray-100 text-gray-700',
  },
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

  const inputClassName = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-admin-500 focus:border-admin-500 focus:bg-white text-sm text-gray-900 placeholder-gray-400 transition-all duration-200";
  const selectClassName = "w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-admin-500 focus:border-admin-500 focus:bg-white text-sm text-gray-700 transition-all duration-200 appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 mt-1">Track all administrative actions and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="admin-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="text"
                id="admin-filter"
                value={adminEmail}
                onChange={(e) => updateParams({ adminEmail: e.target.value })}
                placeholder="Filter by admin..."
                className={inputClassName}
              />
            </div>
          </div>
          <div>
            <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <div className="relative">
              <select
                id="action-filter"
                value={action}
                onChange={(e) => updateParams({ action: e.target.value })}
                className={selectClassName}
              >
                <option value="">All Actions</option>
                {ACTION_TYPES.map((type) => (
                  <option key={type} value={type}>{ACTION_CONFIG[type]?.label || type}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="target-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Target User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="target-filter"
                value={targetUserId}
                onChange={(e) => updateParams({ targetUserId: e.target.value })}
                placeholder="Filter by target user..."
                className={inputClassName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-admin-50 mb-4">
              <svg className="w-6 h-6 text-admin-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Loading audit log...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading audit log</p>
            <p className="text-gray-500 text-sm mt-1">{error.message}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Admin</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Target</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.entries.map((entry) => {
                    const config = ACTION_CONFIG[entry.action] || {
                      label: entry.action,
                      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      color: 'bg-gray-100 text-gray-700',
                    };
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {entry.adminEmail}
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
                            config.color
                          )}>
                            {config.icon}
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {entry.targetEmail || entry.targetUserId || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {entry.reason || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                          {entry.ipAddress}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {data?.entries.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No audit log entries found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
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
