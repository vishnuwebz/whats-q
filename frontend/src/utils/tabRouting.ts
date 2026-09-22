import { TabType } from '../types';

export const LAST_ACTIVE_TAB_KEY = 'whatsq_last_active_tab';
export const LAST_ACTIVE_PATH_KEY = 'whatsq_last_active_path';

export const TAB_TO_PATH: Record<TabType, string> = {
  'dashboard': '/dashboard',
  'conversations': '/conversations',
  'bulk-overview': '/bulk/overview',
  'bulk-send': '/bulk/send',
  'bulk-templates': '/bulk/templates',
  'bulk-campaigns': '/bulk/campaigns',
  'bulk-recipients': '/bulk/recipients',
  'bulk-suppression': '/bulk/suppression',
  'bulk-scheduled': '/bulk/scheduled',
  'crm-leads': '/crm/leads',
  'crm-deals': '/crm/deals',
  'crm-followups': '/crm/followups',
  'crm-customers': '/crm/customers',
  'ops-jobs': '/operations/jobs',
  'ops-appointments': '/operations/appointments',
  'ops-employees': '/operations/employees',
  'ops-emp-directory': '/operations/employees/directory',
  'ops-emp-profiles': '/operations/employees/profiles',
  'ops-emp-attendance': '/operations/employees/attendance',
  'ops-emp-leaves': '/operations/employees/leaves',
  'ops-emp-monitoring': '/operations/employees/monitoring',
  'ops-emp-breaks': '/operations/employees/breaks',
  'ops-emp-performance': '/operations/employees/performance',
  'ops-emp-productivity': '/operations/employees/productivity',
  'ops-emp-rewards': '/operations/employees/rewards',
  'ops-emp-vouchers': '/operations/employees/vouchers',
  'ops-emp-overtime': '/operations/employees/overtime',
  'ops-emp-onboarding': '/operations/employees/onboarding',
  'ops-schedule': '/operations/schedule',
  'ops-attendance': '/operations/attendance',
  'ops-tasks': '/operations/tasks',
  'ops-routes': '/operations/routes',
  'ops-inventory': '/operations/inventory',
  'finance-overview': '/finance/overview',
  'finance-transactions': '/finance/transactions',
  'finance-invoices': '/finance/invoices',
  'finance-quotations': '/finance/quotations',
  'finance-expenses': '/finance/expenses',
  'finance-budget': '/finance/budget',
  'finance-payments': '/finance/payments',
  'finance-accounts': '/finance/accounts',
  'finance-reports': '/finance/reports',
  'automation-builder': '/automation/builder',
  'automation-workflows': '/automation/workflows',
  'automation-templates': '/automation/templates',
  'branches': '/branches',
  'automation-branches': '/branches',
  'automation-logs': '/automation/logs',
  'automation-approvals': '/automation/approvals',
  'ai-overview': '/ai/overview',
  'ai-branches': '/ai/branches',
  'ai-knowledgebase': '/ai/knowledgebase',
  'ai-templates': '/ai/templates',
  'template-hub': '/template-hub',
  'template-create': '/template-create',
  'ai-settings': '/ai/settings',
  'analytics': '/analytics',
  'integrations': '/integrations',
  'settings': '/settings',
  'settings-backup': '/settings/backup',
  'settings-whatsapp': '/settings/whatsapp',
  'landing': '/landing',
  'roles': '/roles',
};

// Common path aliases for convenience and deep links
const PATH_ALIASES: Record<string, TabType> = {
  '/roles': 'roles',
  '/security': 'roles',
  '/permissions': 'roles',
  '/rbac': 'roles',
  '/messenger': 'conversations',
  '/chat': 'conversations',
  '/chats': 'conversations',
  '/inbox': 'conversations',
  '/whatsapp': 'conversations',
  '/landing': 'landing',
  '/showcase': 'landing',
  '/welcome': 'landing',
  '/home': 'landing',
  '/inventory': 'ops-inventory',
  '/jobs': 'ops-jobs',
  '/tasks': 'ops-tasks',
  '/appointments': 'ops-appointments',
  '/employees': 'ops-employees',
  '/directory': 'ops-emp-directory',
  '/profiles': 'ops-emp-profiles',
  '/leaves': 'ops-emp-leaves',
  '/leave-requests': 'ops-emp-leaves',
  '/monitoring': 'ops-emp-monitoring',
  '/breaks': 'ops-emp-breaks',
  '/performance': 'ops-emp-performance',
  '/productivity': 'ops-emp-productivity',
  '/rewards': 'ops-emp-rewards',
  '/vouchers': 'ops-emp-vouchers',
  '/claims': 'ops-emp-vouchers',
  '/overtime': 'ops-emp-overtime',
  '/ot': 'ops-emp-overtime',
  '/onboarding': 'ops-emp-onboarding',
  '/documents': 'ops-emp-onboarding',
  '/attendance': 'ops-attendance',
  '/routes': 'ops-routes',
  '/leads': 'crm-leads',
  '/deals': 'crm-deals',
  '/customers': 'crm-customers',
  '/followups': 'crm-followups',
  '/transactions': 'finance-transactions',
  '/invoices': 'finance-invoices',
  '/quotations': 'finance-quotations',
  '/expenses': 'finance-expenses',
  '/accounts': 'finance-accounts',
  '/reports': 'finance-reports',
  '/builder': 'automation-builder',
  '/workflows': 'automation-workflows',
  '/knowledgebase': 'ai-knowledgebase',
  '/kb': 'ai-knowledgebase',
};

export const ALL_VALID_TABS = new Set<string>(Object.keys(TAB_TO_PATH));

export function isValidTab(tab: unknown): tab is TabType {
  return typeof tab === 'string' && ALL_VALID_TABS.has(tab);
}

export function persistActiveTab(tab: TabType): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_ACTIVE_TAB_KEY, tab);
    const path = TAB_TO_PATH[tab] || `/${tab}`;
    localStorage.setItem(LAST_ACTIVE_PATH_KEY, path);
  } catch {
    // ignore storage quota errors
  }
}

export function resolveTabFromPath(rawPath: string, search = '', hash = ''): TabType {
  const normalized = (rawPath || '').toLowerCase().replace(/\/$/, '') || '/dashboard';

  // 1. Direct alias check
  if (PATH_ALIASES[normalized]) {
    return PATH_ALIASES[normalized];
  }

  // 2. Direct canonical path match
  for (const [tab, p] of Object.entries(TAB_TO_PATH)) {
    if (p === normalized || `/${tab}` === normalized) {
      return tab as TabType;
    }
  }

  // 3. Check query parameters (?tab=... or ?page=... or ?view=...)
  if (search) {
    try {
      const searchParams = new URLSearchParams(search);
      const queryTab = searchParams.get('tab') || searchParams.get('page') || searchParams.get('view');
      if (queryTab && isValidTab(queryTab)) {
        return queryTab;
      }
    } catch {}
  }

  // 4. Check hash routing (#/operations/inventory or #analytics)
  if (hash) {
    const cleanHash = hash.replace(/^#\/?/, '').toLowerCase();
    if (cleanHash && cleanHash !== 'dashboard') {
      const fromHash = resolveTabFromPath('/' + cleanHash);
      if (fromHash && fromHash !== 'dashboard') {
        return fromHash;
      }
    }
  }

  // 5. Fallback: Check localStorage if path is root or generic
  if (normalized === '/' || normalized === '/dashboard' || normalized === '' || normalized === '/index.html') {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LAST_ACTIVE_TAB_KEY);
        if (saved && isValidTab(saved)) {
          return saved;
        }
      } catch {}
    }
  }

  return 'dashboard';
}

/**
 * Returns the active tab to initialize the application state with.
 * Priority:
 * 1. Specific pathname in browser address bar (e.g. /operations/inventory -> ops-inventory)
 * 2. Specific hash in URL (#/finance/transactions)
 * 3. Specific query param (?tab=...)
 * 4. Last visited tab saved in localStorage before hard refresh (e.g. whatsq_last_active_tab)
 * 5. Default fallback to 'dashboard'
 */
export function getInitialActiveTab(): TabType {
  if (typeof window === 'undefined') return 'dashboard';

  try {
    const rawPath = window.location.pathname || '';
    const cleanPath = rawPath.toLowerCase().replace(/\/$/, '');
    const search = window.location.search || '';
    const hash = window.location.hash || '';

    // If pathname is a specific known route (not root or dashboard), preserve it
    if (cleanPath && cleanPath !== '' && cleanPath !== '/' && cleanPath !== '/dashboard' && cleanPath !== '/index.html') {
      const tabFromPath = resolveTabFromPath(cleanPath, search, hash);
      if (tabFromPath && tabFromPath !== 'dashboard') {
        persistActiveTab(tabFromPath);
        return tabFromPath;
      }
    }

    // Check hash
    if (hash) {
      const cleanHash = hash.replace(/^#\/?/, '').toLowerCase();
      if (cleanHash && cleanHash !== 'dashboard') {
        const tabFromHash = resolveTabFromPath('/' + cleanHash, search, '');
        if (tabFromHash && tabFromHash !== 'dashboard') {
          persistActiveTab(tabFromHash);
          return tabFromHash;
        }
      }
    }

    // Check query params
    if (search) {
      const params = new URLSearchParams(search);
      const queryTab = params.get('tab') || params.get('page') || params.get('view');
      if (queryTab && isValidTab(queryTab)) {
        persistActiveTab(queryTab);
        return queryTab;
      }
    }

    // On hard refresh where URL defaulted or reset to '/' or '/dashboard', restore last page!
    const saved = localStorage.getItem(LAST_ACTIVE_TAB_KEY);
    if (saved && isValidTab(saved)) {
      return saved;
    }

    const savedPath = localStorage.getItem(LAST_ACTIVE_PATH_KEY);
    if (savedPath) {
      const tabFromPath = resolveTabFromPath(savedPath);
      if (tabFromPath && tabFromPath !== 'dashboard') {
        return tabFromPath;
      }
    }
  } catch (err) {
    console.warn('[Routing] Error resolving initial active tab:', err);
  }

  return 'dashboard';
}
