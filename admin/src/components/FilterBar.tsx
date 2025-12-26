// FilterBar component
// Feature: 012-admin-dashboard
// T047: FilterBar with plan/status/suspended dropdowns

interface FilterBarProps {
  plan: string;
  status: string;
  suspended: string;
  onPlanChange: (plan: string) => void;
  onStatusChange: (status: string) => void;
  onSuspendedChange: (suspended: string) => void;
}

export function FilterBar({
  plan,
  status,
  suspended,
  onPlanChange,
  onStatusChange,
  onSuspendedChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Plan filter */}
      <div>
        <label htmlFor="plan-filter" className="sr-only">
          Filter by plan
        </label>
        <select
          id="plan-filter"
          value={plan}
          onChange={(e) => onPlanChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-admin-500 focus:border-admin-500 sm:text-sm rounded-md"
        >
          <option value="">All Plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      {/* Status filter */}
      <div>
        <label htmlFor="status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-admin-500 focus:border-admin-500 sm:text-sm rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {/* Suspended filter */}
      <div>
        <label htmlFor="suspended-filter" className="sr-only">
          Filter by suspended
        </label>
        <select
          id="suspended-filter"
          value={suspended}
          onChange={(e) => onSuspendedChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-admin-500 focus:border-admin-500 sm:text-sm rounded-md"
        >
          <option value="">All Users</option>
          <option value="false">Active Only</option>
          <option value="true">Suspended Only</option>
        </select>
      </div>
    </div>
  );
}
