// UserTable component
// Feature: 012-admin-dashboard
// T023, T050, T068: User table with columns, sort indicators, and suspended badge

import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { UserListItem } from '../services/adminApi';

interface UserTableProps {
  users: UserListItem[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const columns = [
  { key: 'email', label: 'Email', sortable: true },
  { key: 'name', label: 'Name', sortable: false },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'createdAt', label: 'Created', sortable: true },
];

export function UserTable({ users, sortBy, sortOrder, onSort }: UserTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (user: UserListItem) => {
    navigate(`/users/${user.id}`);
  };

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-admin-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-admin-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50',
                  col.sortable && 'cursor-pointer hover:text-gray-700 hover:bg-gray-50 transition-colors group'
                )}
                onClick={() => col.sortable && onSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && renderSortIndicator(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user)}
              className="hover:bg-admin-50/30 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-admin-100 to-admin-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-admin-700">
                      {(user.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{user.email || 'N/A'}</span>
                    {/* T068: Suspended badge */}
                    {user.suspended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Suspended
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : <span className="text-gray-400">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
                    user.plan === 'PRO'
                      ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {user.plan === 'PRO' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                  {user.plan}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold',
                    {
                      'bg-emerald-50 text-emerald-700': user.subscriptionStatus === 'active',
                      'bg-amber-50 text-amber-700': user.subscriptionStatus === 'trialing',
                      'bg-red-50 text-red-700': user.subscriptionStatus === 'past_due',
                      'bg-gray-100 text-gray-600':
                        user.subscriptionStatus === 'canceled' || !user.subscriptionStatus,
                    }
                  )}
                >
                  {user.subscriptionStatus || 'free'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No users found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
