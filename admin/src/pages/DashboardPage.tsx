// Dashboard Page
// Feature: 012-admin-dashboard
// T042: Dashboard page with metrics and quick links

import { Link } from 'react-router-dom';
import { useMetrics } from '../hooks/useMetrics';
import { MetricCard } from '../components/MetricCard';

export function DashboardPage() {
  const { data: metrics, isLoading, error } = useMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading metrics: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome to the ProteinLens Admin Dashboard
        </p>
      </div>

      {/* User Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics?.users.total ?? 0}
            icon="👥"
          />
          <MetricCard
            title="Active Users"
            value={metrics?.users.active ?? 0}
            icon="✅"
            variant="success"
          />
          <MetricCard
            title="Suspended"
            value={metrics?.users.suspended ?? 0}
            icon="🚫"
            variant="danger"
          />
          <MetricCard
            title="New This Month"
            value={metrics?.users.newThisMonth ?? 0}
            icon="🆕"
          />
        </div>
      </section>

      {/* Subscription Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Free Plan"
            value={metrics?.subscriptions.free ?? 0}
            icon="🆓"
          />
          <MetricCard
            title="Pro Plan"
            value={metrics?.subscriptions.pro ?? 0}
            icon="⭐"
            variant="success"
          />
          <MetricCard
            title="Trialing"
            value={metrics?.subscriptions.trialing ?? 0}
            icon="⏳"
          />
          <MetricCard
            title="Past Due"
            value={metrics?.subscriptions.pastDue ?? 0}
            icon="⚠️"
            variant="warning"
          />
          <MetricCard
            title="Canceled"
            value={metrics?.subscriptions.canceled ?? 0}
            icon="❌"
          />
        </div>
      </section>

      {/* Usage Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Analyses"
            value={metrics?.usage.totalAnalyses ?? 0}
            icon="📊"
          />
          <MetricCard
            title="This Month"
            value={metrics?.usage.analysesThisMonth ?? 0}
            icon="📈"
          />
          <MetricCard
            title="Avg per User"
            value={metrics?.usage.averagePerUser ?? 0}
            icon="📉"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/users"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-admin-500 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-gray-900">View All Users</p>
              <p className="text-sm text-gray-500">Browse and search users</p>
            </div>
          </Link>
          <Link
            to="/users?suspended=true"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-admin-500 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">🚫</span>
            <div>
              <p className="font-medium text-gray-900">Suspended Users</p>
              <p className="text-sm text-gray-500">Review suspended accounts</p>
            </div>
          </Link>
          <Link
            to="/audit-log"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-admin-500 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900">Audit Log</p>
              <p className="text-sm text-gray-500">View admin activity</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
