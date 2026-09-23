import { PayrollSubView } from '@/types';

export const VALID_PAYROLL_SUBVIEWS: PayrollSubView[] = [
  'overview',
  'run-payroll',
  'manage-salary',
  'reimbursements',
  'tax-compliance',
  'off-cycle',
  'reports',
  'settings'
];

export const SUBVIEW_ALIASES: Record<string, PayrollSubView> = {
  'overview': 'overview',
  'dashboard': 'overview',
  'run': 'run-payroll',
  'run-payroll': 'run-payroll',
  'wizard': 'run-payroll',
  'salary': 'manage-salary',
  'manage-salary': 'manage-salary',
  'structures': 'manage-salary',
  'reimbursements': 'reimbursements',
  'claims': 'reimbursements',
  'tax': 'tax-compliance',
  'compliance': 'tax-compliance',
  'tax-compliance': 'tax-compliance',
  'off-cycle': 'off-cycle',
  'offcycle': 'off-cycle',
  'reports': 'reports',
  'settings': 'settings',
};

export const STORAGE_KEY_CURRENT_VIEW = 'whatsq_payroll_current_view';

/**
 * Resolves the initial Payroll sub-view with this precedence:
 * 1. Path segment: e.g. /finance/payroll/settings
 * 2. URL search parameters: ?view=settings or ?subview=settings or ?section=settings
 * 3. URL hash: #settings or #/settings
 * 4. LocalStorage: whatsq_payroll_current_view
 * 5. Default: 'overview'
 */
export function getInitialPayrollView(): PayrollSubView {
  if (typeof window === 'undefined') return 'overview';

  try {
    // 1. Path segment
    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const parts = pathname.split('/');
    if (parts.length >= 4 && parts[1] === 'finance' && parts[2] === 'payroll') {
      const sub = parts[3];
      if (SUBVIEW_ALIASES[sub]) {
        return SUBVIEW_ALIASES[sub];
      }
    }

    // 2. Query params
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('subview') || params.get('section');
    if (viewParam && SUBVIEW_ALIASES[viewParam.toLowerCase()]) {
      return SUBVIEW_ALIASES[viewParam.toLowerCase()];
    }

    // 3. Hash
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (hash && SUBVIEW_ALIASES[hash]) {
      return SUBVIEW_ALIASES[hash];
    }

    // 4. LocalStorage
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_VIEW);
    if (saved && SUBVIEW_ALIASES[saved.toLowerCase()]) {
      return SUBVIEW_ALIASES[saved.toLowerCase()];
    }
  } catch (err) {
    console.warn('[PayrollRouting] Error resolving initial view:', err);
  }

  return 'overview';
}

/**
 * Resolves an initial sub-tab for a given view with this precedence:
 * 1. URL search params: ?tab=... or ?subtab=...
 * 2. LocalStorage: whatsq_payroll_subtab_<view>
 * 3. Default tab fallback
 */
export function getInitialPayrollSubtab(
  view: PayrollSubView,
  defaultTab: string,
  validTabs?: readonly string[] | string[]
): string {
  if (typeof window === 'undefined') return defaultTab;

  try {
    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get('tab') || params.get('subtab');
    if (queryTab) {
      if (validTabs && validTabs.length > 0) {
        const found = validTabs.find(
          (t) => t.toLowerCase() === queryTab.toLowerCase()
        );
        if (found) return found;
      } else {
        return queryTab;
      }
    }

    const saved = localStorage.getItem(`whatsq_payroll_subtab_${view}`);
    if (saved) {
      if (validTabs && validTabs.length > 0) {
        const found = validTabs.find(
          (t) => t.toLowerCase() === saved.toLowerCase()
        );
        if (found) return found;
      } else {
        return saved;
      }
    }
  } catch (err) {
    console.warn(`[PayrollRouting] Error resolving subtab for ${view}:`, err);
  }

  return defaultTab;
}

/**
 * Updates URL search params and localStorage to preserve view & subtab across refreshes.
 */
export function updatePayrollNavigation(
  view: PayrollSubView,
  subtab?: string,
  extraParams?: Record<string, string | number>,
  pushToHistory: boolean = false
) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_VIEW, view);
    if (subtab) {
      localStorage.setItem(`whatsq_payroll_subtab_${view}`, subtab);
    }

    const url = new URL(window.location.href);
    // Keep canonical pathname as /finance/payroll
    url.pathname = '/finance/payroll';

    if (view === 'overview' && !subtab && !extraParams) {
      url.searchParams.delete('view');
      url.searchParams.delete('subview');
      url.searchParams.delete('tab');
      url.searchParams.delete('subtab');
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('view', view);
      if (subtab) {
        url.searchParams.set('tab', subtab);
      } else {
        url.searchParams.delete('tab');
      }
    }

    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        url.searchParams.set(k, String(v));
      });
    }

    const newUrl = url.pathname + (url.search ? url.search : '') + url.hash;
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;

    if (newUrl !== currentUrl) {
      if (pushToHistory) {
        window.history.pushState(null, '', newUrl);
      } else {
        window.history.replaceState(null, '', newUrl);
      }
    }
  } catch (err) {
    console.warn('[PayrollRouting] Error updating navigation:', err);
  }
}
