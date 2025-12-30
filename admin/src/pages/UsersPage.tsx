// Users Page
// Feature: 012-admin-dashboard
// T025, T049: Users page with table, search, filters, and pagination

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { UserTable } from '../components/UserTable';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterBar } from '../components/FilterBar';
import { ExportButton } from '../components/ExportButton';

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from URL
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const plan = searchParams.get('plan') || '';
  const status = searchParams.get('status') || '';
  const suspended = searchParams.get('suspended') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  // Fetch users
  const { data, isLoading, error } = useAdminUsers({
    page,
    search: search || undefined,
    plan: plan as 'FREE' | 'PRO' | undefined,
    status: status as 'active' | 'canceled' | 'past_due' | 'trialing' | undefined,
    suspended: suspended ? suspended === 'true' : undefined,
    sortBy: sortBy as 'email' | 'plan' | 'createdAt',
    sortOrder,
  });

  // Update URL params
  const updateParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change (except when changing page)
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSort = useCallback((column: string) => {
    const newSortOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    updateParams({ sortBy: column, sortOrder: newSortOrder, page: '1' });
  }, [sortBy, sortOrder, updateParams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all user accounts</p>
        </div>
        <ExportButton 
          users={data?.users || []} 
          disabled={isLoading || !data?.users.length}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(value) => updateParams({ search: value })}
              placeholder="Search by email or name..."
            />
          </div>
          <FilterBar
            plan={plan}
            status={status}
            suspended={suspended}
            onPlanChange={(value) => updateParams({ plan: value })}
            onStatusChange={(value) => updateParams({ status: value })}
            onSuspendedChange={(value) => updateParams({ suspended: value })}
          />
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
            <p className="text-gray-500 font-medium">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading users</p>
            <p className="text-gray-500 text-sm mt-1">{error.message}</p>
          </div>
        ) : (
          <>
            <UserTable
              users={data?.users || []}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
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
