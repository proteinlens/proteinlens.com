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
  const selectClassName = "block w-full pl-4 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-admin-500 focus:bg-white text-gray-700 transition-all duration-200 appearance-none cursor-pointer";
  
  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-3">
      {/* Plan filter */}
      <SelectWrapper>
        <label htmlFor="plan-filter" className="sr-only">
          Filter by plan
        </label>
        <select
          id="plan-filter"
          value={plan}
          onChange={(e) => onPlanChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">All Plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
      </SelectWrapper>

      {/* Status filter */}
      <SelectWrapper>
        <label htmlFor="status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
      </SelectWrapper>

      {/* Suspended filter */}
      <SelectWrapper>
        <label htmlFor="suspended-filter" className="sr-only">
          Filter by suspended
        </label>
        <select
          id="suspended-filter"
          value={suspended}
          onChange={(e) => onSuspendedChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">All Users</option>
          <option value="false">Active Only</option>
          <option value="true">Suspended Only</option>
        </select>
      </SelectWrapper>
    </div>
  );
}
