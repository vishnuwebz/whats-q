import { RoleDefinition, RoleModule, RolePermissionAction, RecordScope } from '../types';

export const ALL_ROLE_MODULES: { id: RoleModule; label: string; description: string }[] = [
  { id: 'crm', label: 'Crm', description: 'Customer Directory, Lead Pipeline, Deals & Follow-ups' },
  { id: 'inbox', label: 'Inbox', description: 'WhatsApp Live Chat, Multi-agent Handoff, Chat Simulator' },
  { id: 'operations', label: 'Operations', description: 'Field Service Jobs, Appointments, Shifts, Routes, Inventory' },
  { id: 'finance', label: 'Finance', description: 'Invoices, Quotations, Expenses, Ledger, Bank Accounts' },
  { id: 'workflows', label: 'Workflows', description: 'Visual Automation Builder, Approval Rules, Webhooks' },
  { id: 'campaigns', label: 'Campaigns', description: 'WhatsApp Bulk Broadcasts, Templates, Audience Segments' },
  { id: 'analytics', label: 'Analytics', description: 'BI Performance Reports, Intent Tracking, AI Metrics' },
  { id: 'settings', label: 'Settings', description: 'Meta Cloud API Credentials, Workspace Config, Data Backup' },
];

export const ALL_PERMISSION_ACTIONS: { id: RolePermissionAction; label: string }[] = [
  { id: 'view', label: 'VIEW' },
  { id: 'create', label: 'CREATE' },
  { id: 'edit', label: 'EDIT' },
  { id: 'delete', label: 'DELETE' },
  { id: 'approve', label: 'APPROVE' },
  { id: 'execute', label: 'EXECUTE' },
  { id: 'export', label: 'EXPORT' },
];

export const RECORD_SCOPE_OPTIONS: { id: RecordScope; label: string; description: string }[] = [
  { id: 'all', label: 'All Records', description: 'Global organization-wide visibility and modification access' },
  { id: 'department', label: 'Department Only', description: 'Restricted to records belonging to the user\'s department' },
  { id: 'team', label: 'Team Only', description: 'Restricted to direct team members and subordinate accounts' },
  { id: 'own', label: 'Own Records', description: 'Only records created or directly owned by the logged-in user' },
  { id: 'assigned', label: 'Assigned Only', description: 'Only records specifically assigned to this technician or agent' },
];

const buildModulePermissions = (enabledActions: Partial<Record<RolePermissionAction, boolean>>): Record<RolePermissionAction, boolean> => ({
  view: enabledActions.view ?? false,
  create: enabledActions.create ?? false,
  edit: enabledActions.edit ?? false,
  delete: enabledActions.delete ?? false,
  approve: enabledActions.approve ?? false,
  execute: enabledActions.execute ?? false,
  export: enabledActions.export ?? false,
});

const buildUniformPermissions = (enabledActions: Partial<Record<RolePermissionAction, boolean>>): Record<RoleModule, Record<RolePermissionAction, boolean>> => {
  const result = {} as Record<RoleModule, Record<RolePermissionAction, boolean>>;
  ALL_ROLE_MODULES.forEach((mod) => {
    result[mod.id] = buildModulePermissions(enabledActions);
  });
  return result;
};

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'owner',
    name: 'Business Owner',
    code: 'OWNER',
    description: 'Full unrestricted administrative and financial control across the entire platform.',
    scope: 'all',
    isSystemRole: true,
    mfaRequired: true,
    sessionTimeoutMins: 480,
    lastUpdated: 'Sep 20, 2026',
    updatedBy: 'System Security Engine',
    assignedEmployees: ['Rahul Mehta', 'Dr. Tariq Al-Mansoor'],
    permissions: buildUniformPermissions({
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
      execute: true,
      export: true,
    }),
  },
  {
    id: 'admin',
    name: 'System Administrator',
    code: 'ADMIN',
    description: 'Operational admin access across all modules except subscription billing and permanent record deletion.',
    scope: 'all',
    isSystemRole: true,
    mfaRequired: true,
    sessionTimeoutMins: 240,
    lastUpdated: 'Sep 20, 2026',
    updatedBy: 'Rahul Mehta',
    assignedEmployees: ['Amit Sharma', 'Sneha Joshi'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      inbox: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      operations: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      finance: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      workflows: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      campaigns: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      analytics: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      settings: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
    },
  },
  {
    id: 'manager',
    name: 'Operations Manager',
    code: 'MANAGER',
    description: 'Dispatches jobs, manages schedules, teams, and field routes with operational sign-off permissions.',
    scope: 'department',
    isSystemRole: true,
    mfaRequired: false,
    sessionTimeoutMins: 120,
    lastUpdated: 'Sep 18, 2026',
    updatedBy: 'Rahul Mehta',
    assignedEmployees: ['Ramesh Kumar'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      inbox: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      operations: buildModulePermissions({ view: true, create: true, edit: true, delete: true, approve: true, execute: true, export: true }),
      finance: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: true, execute: false, export: true }),
      workflows: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: false }),
      campaigns: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      analytics: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: true }),
      settings: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    },
  },
  {
    id: 'accountant',
    name: 'Finance & Accounts',
    code: 'ACCOUNTANT',
    description: 'Manages ledger, invoices, quotations, expenditures, receipts, and tax compliance audit statements.',
    scope: 'all',
    isSystemRole: true,
    mfaRequired: true,
    sessionTimeoutMins: 120,
    lastUpdated: 'Sep 17, 2026',
    updatedBy: 'Rahul Mehta',
    assignedEmployees: ['Pooja Varma'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: true }),
      inbox: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      operations: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: true, execute: false, export: true }),
      finance: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      workflows: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      campaigns: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      analytics: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: true }),
      settings: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    },
  },
  {
    id: 'sales',
    name: 'Sales Executive',
    code: 'SALES',
    description: 'Customer inquiries, prospect deal pipeline management, lead conversion, and outbound quotations.',
    scope: 'own',
    isSystemRole: true,
    mfaRequired: false,
    sessionTimeoutMins: 180,
    lastUpdated: 'Sep 15, 2026',
    updatedBy: 'Ramesh Kumar',
    assignedEmployees: ['Vikram Mehta', 'Deepak Patel'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: false, execute: true, export: true }),
      inbox: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: false, execute: true, export: false }),
      operations: buildModulePermissions({ view: true, create: true, edit: false, delete: false, approve: false, execute: false, export: false }),
      finance: buildModulePermissions({ view: true, create: true, edit: false, delete: false, approve: false, execute: false, export: false }),
      workflows: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      campaigns: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: false, execute: false, export: false }),
      analytics: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      settings: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    },
  },
  {
    id: 'operations',
    name: 'Field Coordinator',
    code: 'OPERATIONS',
    description: 'Coordinates dispatch assignments, schedule rosters, vehicle route planning, and technician attendance.',
    scope: 'team',
    isSystemRole: true,
    mfaRequired: false,
    sessionTimeoutMins: 180,
    lastUpdated: 'Sep 14, 2026',
    updatedBy: 'Ramesh Kumar',
    assignedEmployees: ['Arjun Nair'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: false, edit: true, delete: false, approve: false, execute: false, export: false }),
      inbox: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: false, execute: true, export: false }),
      operations: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: true, execute: true, export: true }),
      finance: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      workflows: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: true, export: false }),
      campaigns: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      analytics: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      settings: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    },
  },
  {
    id: 'support',
    name: 'Customer Support',
    code: 'SUPPORT',
    description: 'Handles incoming WhatsApp live chats, multi-agent tickets, customer 360 queries, and AI handoffs.',
    scope: 'assigned',
    isSystemRole: true,
    mfaRequired: false,
    sessionTimeoutMins: 180,
    lastUpdated: 'Sep 12, 2026',
    updatedBy: 'Ramesh Kumar',
    assignedEmployees: ['Priya Sharma'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: false, execute: false, export: false }),
      inbox: buildModulePermissions({ view: true, create: true, edit: true, delete: false, approve: false, execute: true, export: false }),
      operations: buildModulePermissions({ view: true, create: true, edit: false, delete: false, approve: false, execute: false, export: false }),
      finance: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      workflows: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: true, export: false }),
      campaigns: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      analytics: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      settings: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    },
  },
  {
    id: 'employee',
    name: 'Field Technician',
    code: 'EMPLOYEE',
    description: 'Assigned field job execution, check-in geo-punch attendance, service checklist and customer sign-off.',
    scope: 'assigned',
    isSystemRole: true,
    mfaRequired: false,
    sessionTimeoutMins: 120,
    lastUpdated: 'Sep 10, 2026',
    updatedBy: 'Ramesh Kumar',
    assignedEmployees: ['Amit Sharma', 'Rahul Singh', 'Neha Patel'],
    permissions: {
      crm: buildModulePermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      inbox: buildModulePermissions({ view: true, create: true, edit: false, delete: false, approve: false, execute: false, export: false }),
      operations: buildModulePermissions({ view: true, create: false, edit: true, delete: false, approve: false, execute: true, export: false }),
      finance: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      workflows: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      campaigns: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      analytics: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
      settings: buildModulePermissions({ view: false, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    },
  },
];

const STORAGE_KEY_ROLES = 'whatsq_rbac_roles_permissions';

export const getStoredRoles = (): RoleDefinition[] => {
  if (typeof window === 'undefined') return INITIAL_ROLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 8) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached roles:', err);
  }
  return INITIAL_ROLES;
};

export const persistRoles = (roles: RoleDefinition[]): void => {
  if (typeof window === 'undefined' || !Array.isArray(roles)) return;
  try {
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
  } catch (err) {
    console.warn('Failed to persist roles:', err);
  }
};

export const getRoleDefaultPreset = (roleId: string): RoleDefinition => {
  const match = INITIAL_ROLES.find((r) => r.id === roleId);
  if (match) return JSON.parse(JSON.stringify(match));
  return {
    id: roleId,
    name: 'Custom Role',
    code: 'CUSTOM',
    description: 'Custom configured operational role.',
    scope: 'team',
    isSystemRole: false,
    permissions: buildUniformPermissions({ view: true, create: false, edit: false, delete: false, approve: false, execute: false, export: false }),
    assignedEmployees: [],
    lastUpdated: 'Just now',
    updatedBy: 'System Administrator',
  };
};
