// Billing API client for subscription and plan management
// Feature: 002-saas-billing
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
/**
 * Fetch available pricing plans
 */
export async function getPlans() {
    const response = await fetch(`${API_BASE}/billing/plans`);
    if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }
    return response.json();
}
/**
 * Get current usage statistics for authenticated user
 */
export async function getUsage() {
    const response = await fetch(`${API_BASE}/billing/usage`, {
        headers: {
            // TODO: Add auth header when auth is implemented
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.statusText}`);
    }
    return response.json();
}
/**
 * Create a checkout session for subscription
 * @param priceId - Stripe price ID (monthly or annual)
 */
export async function createCheckout(priceId) {
    const response = await fetch(`${API_BASE}/billing/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // TODO: Add auth header when auth is implemented
        },
        body: JSON.stringify({ priceId }),
    });
    if (!response.ok) {
        throw new Error(`Failed to create checkout: ${response.statusText}`);
    }
    return response.json();
}
/**
 * Create a billing portal session
 */
export async function createPortalSession() {
    const response = await fetch(`${API_BASE}/billing/portal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // TODO: Add auth header when auth is implemented
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to create portal session: ${response.statusText}`);
    }
    return response.json();
}
/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(priceId) {
    const { url } = await createCheckout(priceId);
    window.location.href = url;
}
/**
 * Redirect to Stripe Customer Portal
 */
export async function redirectToPortal() {
    const { url } = await createPortalSession();
    window.location.href = url;
}
/**
 * T062: Export meal data (Pro-only)
 * @param format - 'json' or 'csv'
 */
export async function exportMeals(format = 'json') {
    const response = await fetch(`${API_BASE}/meals/export?format=${format}`, {
        headers: {
            // TODO: Add auth header when auth is implemented
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('Pro subscription required for export');
        }
        throw new Error(`Failed to export: ${response.statusText}`);
    }
    // Download file
    const blob = await response.blob();
    const filename = response.headers.get('Content-Disposition')
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || `proteinlens-export.${format}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
