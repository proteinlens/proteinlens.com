// User Detail Page
// Feature: 012-admin-dashboard
// T034, T059, T067: User detail page with profile, subscription, usage, and actions

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { useUserDetail } from '../hooks/useUserDetail';
import { useSuspendUser, useReactivateUser } from '../hooks/useSuspendUser';
import { usePlanOverride } from '../hooks/usePlanOverride';

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUserDetail(userId);
  
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newPlan, setNewPlan] = useState<'FREE' | 'PRO'>('FREE');
  const [planReason, setPlanReason] = useState('');

  const suspendMutation = useSuspendUser(userId!);
  const reactivateMutation = useReactivateUser(userId!);
  const planMutation = usePlanOverride(userId!);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return;
    try {
      await suspendMutation.mutateAsync({ reason: suspendReason });
      setShowSuspendDialog(false);
      setSuspendReason('');
    } catch (err) {
      console.error('Suspend failed:', err);
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync();
    } catch (err) {
      console.error('Reactivate failed:', err);
    }
  };

  const handlePlanOverride = async () => {
    if (!planReason.trim()) return;
    try {
      await planMutation.mutateAsync({ plan: newPlan, reason: planReason });
      setShowPlanDialog(false);
      setPlanReason('');
    } catch (err) {
      console.error('Plan override failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error?.message || 'User not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.email || 'Unknown User'}
            </h1>
            {user.email && (
              <p className="text-gray-500">{user.email}</p>
            )}
          </div>
          {user.suspended && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              🚫 Suspended
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNewPlan(user.plan === 'FREE' ? 'PRO' : 'FREE');
              setShowPlanDialog(true);
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Change Plan
          </button>
          {user.suspended ? (
            <button
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {reactivateMutation.isPending ? 'Reactivating...' : 'Reactivate Account'}
            </button>
          ) : (
            <button
              onClick={() => setShowSuspendDialog(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Suspend Account
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">External ID</dt>
              <dd className="text-gray-900 font-mono text-sm">{user.externalId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{user.email || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email Verified</dt>
              <dd className="text-gray-900">{user.emailVerified ? '✅ Yes' : '❌ No'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Organization</dt>
              <dd className="text-gray-900">{user.organizationName || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{user.phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Registered</dt>
              <dd className="text-gray-900">{format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}</dd>
            </div>
          </dl>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Plan</dt>
              <dd>
                <span className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  user.plan === 'PRO' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {user.plan}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  {
                    'bg-green-100 text-green-800': user.subscriptionStatus === 'active',
                    'bg-yellow-100 text-yellow-800': user.subscriptionStatus === 'trialing',
                    'bg-red-100 text-red-800': user.subscriptionStatus === 'past_due',
                    'bg-gray-100 text-gray-800': !user.subscriptionStatus || user.subscriptionStatus === 'canceled',
                  }
                )}>
                  {user.subscriptionStatus || 'free'}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Stripe Customer</dt>
              <dd className="text-gray-900 font-mono text-sm">{user.stripeCustomerId || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Period End</dt>
              <dd className="text-gray-900">
                {user.currentPeriodEnd ? format(new Date(user.currentPeriodEnd), 'MMM d, yyyy') : '—'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Usage Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total Analyses</dt>
              <dd className="text-gray-900 font-semibold">{user.usage.totalAnalyses}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">This Month</dt>
              <dd className="text-gray-900 font-semibold">{user.usage.thisMonth}</dd>
            </div>
          </dl>
        </div>

        {/* Suspension Card (if suspended) */}
        {user.suspended && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">Suspension Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-red-700">Suspended At</dt>
                <dd className="text-red-900">
                  {user.suspendedAt ? format(new Date(user.suspendedAt), 'MMM d, yyyy h:mm a') : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-red-700">Suspended By</dt>
                <dd className="text-red-900">{user.suspendedBy || '—'}</dd>
              </div>
              <div>
                <dt className="text-red-700 mb-1">Reason</dt>
                <dd className="text-red-900 bg-red-100 p-2 rounded">{user.suspendedReason || '—'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Subscription Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Subscription Events</h2>
        {user.subscriptionEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No subscription events</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {user.subscriptionEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{event.eventType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(event.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend Dialog */}
      {showSuspendDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend User Account</h3>
            <p className="text-gray-600 mb-4">
              This will block the user from accessing the platform. Stripe billing will remain active.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Enter reason for suspension..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSuspendDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || suspendMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Override Dialog */}
      {showPlanDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change User Plan</h3>
            <p className="text-gray-600 mb-4">
              This will change the user's plan but will NOT affect their Stripe subscription.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Plan</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as 'FREE' | 'PRO')}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
              <textarea
                value={planReason}
                onChange={(e) => setPlanReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Enter reason for plan change..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPlanDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePlanOverride}
                disabled={!planReason.trim() || planMutation.isPending}
                className="px-4 py-2 bg-admin-600 text-white rounded-md text-sm disabled:opacity-50"
              >
                {planMutation.isPending ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
