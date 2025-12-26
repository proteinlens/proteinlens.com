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
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  col.sortable && 'cursor-pointer hover:text-gray-700'
                )}
                onClick={() => col.sortable && onSort(col.key)}
              >
                {col.label}
                {col.sortable && renderSortIndicator(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => handleRowClick(user)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{user.email || 'N/A'}</span>
                  {/* T068: Suspended badge */}
                  {user.suspended && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Suspended
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.plan === 'PRO'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {user.plan}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    {
                      'bg-green-100 text-green-800': user.subscriptionStatus === 'active',
                      'bg-yellow-100 text-yellow-800': user.subscriptionStatus === 'trialing',
                      'bg-red-100 text-red-800': user.subscriptionStatus === 'past_due',
                      'bg-gray-100 text-gray-800':
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
        <div className="text-center py-12 text-gray-500">
          No users found matching your criteria.
        </div>
      )}
    </div>
  );
}
