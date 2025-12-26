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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <ExportButton 
          users={data?.users || []} 
          disabled={isLoading || !data?.users.length}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-admin-600"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error loading users: {error.message}
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
