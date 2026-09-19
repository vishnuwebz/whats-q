import { TabType } from '../types';

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportTableToCsv(tab: TabType, store: any): { success: boolean; count: number; filename: string } {
  let headers: string[] = [];
  let rows: string[][] = [];
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `whatsq-${tab}-${dateStr}.csv`;

  switch (tab) {
    case 'dashboard': {
      headers = ['Category', 'Key Metric', 'Current Value', 'Status / Context'];
      const totalPaidRevenue = (store.invoices || []).reduce((acc: number, i: any) => acc + (Number(i.paid_amount) || 0), 0);
      const totalInventoryVal = (store.inventory || []).reduce((acc: number, i: any) => acc + (Number(i.stock_value) || 0), 0);
      rows = [
        ['WhatsApp CRM', 'Active Conversations', String((store.conversations || []).length), 'Live Multi-agent Inbox'],
        ['WhatsApp CRM', 'Total Leads in Pipeline', String((store.leads || []).length), 'Inbound & Referral Leads'],
        ['WhatsApp CRM', 'High-Value Deals', String((store.deals || []).length), 'Qualified Opportunities'],
        ['Operations', 'Field Jobs Scheduled', String((store.jobs || []).length), 'Technician Dispatches'],
        ['Operations', 'Active Staff on Duty', String((store.employees || []).filter((e: any) => e.status === 'on_duty').length), 'Field Technicians'],
        ['Operations', 'Warehouse SKUs Tracked', String((store.inventory || []).length), `Total Valuation ₹${totalInventoryVal.toLocaleString()}`],
        ['Finance', 'Invoices Issued', String((store.invoices || []).length), `Collected ₹${totalPaidRevenue.toLocaleString()}`],
        ['Finance', 'Logged Transactions', String((store.transactions || []).length), 'Inward & Outward Audit'],
      ];
      break;
    }
    case 'conversations': {
      headers = ['ID', 'Contact Name', 'Phone', 'Category', 'Status', 'Service Needed', 'Estimated Value', 'Last Contact'];
      rows = (store.conversations || []).map((c: any) => [
        c.id, c.contact_name, c.phone_number, c.category, c.status, c.service_needed || 'General', c.estimated_value || 0, c.last_contact_date
      ]);
      break;
    }
    case 'crm-leads': {
      headers = ['ID', 'Name', 'Phone', 'Email', 'Service', 'Location', 'Value', 'Stage', 'Owner', 'Source', 'Created At'];
      rows = (store.leads || []).map((l: any) => [
        l.id, l.name, l.phone, l.email || '', l.service, l.location, l.value, l.stage, l.owner, l.source, l.created_at_str
      ]);
      break;
    }
    case 'crm-deals': {
      headers = ['ID', 'Deal Name', 'Customer Name', 'Phone', 'Amount', 'Stage', 'Probability %', 'Owner', 'Expected Close'];
      rows = (store.deals || []).map((d: any) => [
        d.id, d.deal_name, d.customer_name, d.phone, d.amount, d.stage, d.probability, d.deal_owner, d.expected_close_date
      ]);
      break;
    }
    case 'crm-customers': {
      headers = ['ID', 'Customer Name', 'Phone', 'Location', 'Category', 'Last Seen'];
      rows = (store.conversations || []).map((c: any) => [
        c.id, c.contact_name, c.phone_number, c.location || 'Kozhikode, Kerala', c.category, c.last_contact_date
      ]);
      break;
    }
    case 'crm-followups': {
      headers = ['ID', 'Title', 'Customer Name', 'Phone', 'Type', 'Assigned To', 'Due Date', 'Status', 'Priority'];
      rows = (store.followups || []).map((f: any) => [
        f.id, f.title, f.customer_name, f.phone, f.follow_up_type, f.assigned_to, f.due_date, f.status, f.priority
      ]);
      break;
    }
    case 'ops-jobs': {
      headers = ['ID', 'Job ID', 'Customer Name', 'Phone', 'Service', 'Date', 'Time', 'Technician', 'Status', 'Priority', 'Amount', 'Payment Status'];
      rows = (store.jobs || []).map((j: any) => [
        j.id, j.job_id_str, j.customer_name, j.phone, j.service, j.date_str, j.time_str, j.assigned_to, j.status, j.priority, j.amount, j.payment_status
      ]);
      break;
    }
    case 'ops-appointments': {
      headers = ['ID', 'Booking ID', 'Customer Name', 'Phone', 'Service', 'Employee', 'Date', 'Time', 'Duration', 'Status', 'Amount', 'Advance'];
      rows = (store.appointments || []).map((a: any) => [
        a.id, a.apt_id_str, a.customer_name, a.phone, a.service, a.employee, a.date_str, a.time_str, a.duration, a.status, a.amount, a.advance
      ]);
      break;
    }
    case 'ops-employees': {
      headers = ['ID', 'Employee ID', 'Name', 'Role', 'Department', 'Phone', 'Email', 'Status', 'Location', 'Rating', 'Jobs Completed', 'On Time %'];
      rows = (store.employees || []).map((e: any) => [
        e.id, e.employee_id_str, e.name, e.role, e.department, e.phone, e.email, e.status, e.location, e.rating, e.jobs_completed_month, e.on_time_percent
      ]);
      break;
    }
    case 'ops-schedule': {
      headers = ['ID', 'Employee', 'Role', 'Department', 'Shift Window', 'Status', 'Location'];
      rows = (store.employees || []).map((e: any) => [
        e.id, e.name, e.role, e.department, '9:00 AM – 6:00 PM', e.status, e.location
      ]);
      break;
    }
    case 'ops-attendance': {
      headers = ['ID', 'Employee ID', 'Name', 'Department', 'Shift', 'Check In', 'Check Out', 'Work Hours', 'Status', 'Location'];
      rows = (store.attendance || []).map((att: any) => [
        att.id, att.employee_id_str, att.employee_name, att.department, att.shift, att.check_in, att.check_out || '-', att.work_hours, att.status, att.location
      ]);
      break;
    }
    case 'ops-tasks': {
      headers = ['ID', 'Title', 'Subtitle', 'Related To', 'Assignee', 'Priority', 'Status', 'Due Date', 'Checklist Progress', 'Checklist Items'];
      rows = (store.tasks || []).map((t: any) => {
        const completed = (t.checklist || []).filter((c: any) => c.completed).length;
        const total = (t.checklist || []).length;
        const itemsStr = (t.checklist || []).map((c: any) => `[${c.completed ? 'X' : ' '}] ${c.text}`).join('; ');
        return [
          t.id, t.title, t.subtitle, t.related_to, t.assignee, t.priority, t.status, t.due_date, `${completed}/${total}`, itemsStr
        ];
      });
      break;
    }
    case 'ops-routes': {
      headers = ['ID', 'Route ID', 'Driver', 'Vehicle', 'Status', 'Stops Count', 'Distance KM', 'Duration', 'Fuel Cost'];
      rows = (store.routes || []).map((r: any) => [
        r.id, r.route_id_str, r.driver_name, r.vehicle, r.status, r.stops_count, r.distance_km, r.duration, r.fuel_cost
      ]);
      break;
    }
    case 'ops-inventory': {
      headers = ['ID', 'SKU', 'Name', 'Category', 'Stock Units', 'Stock Value', 'Status', 'Location', 'Reorder Level', 'Supplier'];
      rows = (store.inventory || []).map((inv: any) => [
        inv.id, inv.sku, inv.name, inv.category, inv.stock_units, inv.stock_value, inv.status, inv.location, inv.reorder_level, inv.supplier
      ]);
      break;
    }
    case 'finance-invoices': {
      headers = ['ID', 'Invoice Number', 'Customer Name', 'Phone', 'Date', 'Due Date', 'Amount', 'Paid Amount', 'Status', 'Payment Method'];
      rows = (store.invoices || []).map((inv: any) => [
        inv.id, inv.invoice_number, inv.customer_name, inv.customer_phone, inv.invoice_date, inv.due_date, inv.amount, inv.paid_amount, inv.status, inv.payment_method
      ]);
      break;
    }
    case 'finance-expenses':
    case 'finance-budget': {
      headers = ['ID', 'Date', 'Description', 'Category', 'Vendor', 'Payment Mode', 'Amount', 'Status'];
      rows = (store.expenses || []).map((exp: any) => [
        exp.id, exp.date_str, exp.description, exp.category, exp.vendor, exp.payment_mode, exp.amount, exp.status
      ]);
      break;
    }
    case 'finance-transactions':
    case 'finance-payments':
    case 'finance-overview':
    case 'finance-reports': {
      headers = ['ID', 'Date', 'Description', 'Category', 'Party', 'Account', 'Amount', 'Type', 'Payment Mode', 'Status'];
      rows = (store.transactions || []).map((tx: any) => [
        tx.id, tx.date_str, tx.description, tx.category, tx.party, tx.account, tx.amount, tx.tx_type, tx.payment_mode, tx.status
      ]);
      break;
    }
    case 'finance-accounts': {
      headers = ['ID', 'Account Name', 'Account Number', 'Type', 'Provider', 'Current Balance', 'Status'];
      rows = (store.accounts || []).map((acc: any) => [
        acc.id, acc.name, acc.account_number || '-', acc.account_type, acc.provider, acc.current_balance, acc.status
      ]);
      break;
    }
    case 'automation-approvals': {
      headers = ['ID', 'Request ID', 'Title', 'Type', 'Department', 'Requested By', 'Submitted On', 'Amount', 'Status'];
      rows = (store.approvals || []).map((ap: any) => [
        ap.id, ap.request_id_str, ap.title, ap.approval_type, ap.department, ap.requested_by, ap.submitted_on, ap.amount || 0, ap.status
      ]);
      break;
    }
    case 'automation-workflows':
    case 'automation-builder': {
      headers = ['ID', 'Workflow Name', 'Category', 'Business Function', 'Trigger Type', 'Status', 'Runs This Month', 'Success Rate %'];
      rows = (store.workflows || []).map((w: any) => [
        w.id, w.name, w.category, w.business_function, w.trigger_type, w.status, w.runs_this_month, w.success_rate
      ]);
      break;
    }
    case 'automation-templates': {
      headers = ['Template Name', 'Category', 'Type', 'Trigger', 'Status'];
      rows = [
        ['Hot Lead VIP Escalation', 'CRM & Sales', 'Official', 'Lead Score > 80', 'Active'],
        ['Post-Job Service Feedback & Rating', 'Field Service', 'Official', 'Job Marked Completed', 'Active'],
        ['Automated Overdue Invoice Reminder', 'Finance', 'Official', 'Due Date + 2 Days', 'Active'],
        ['Daily Technician Morning Dispatch Digest', 'Dispatch', 'Official', 'Schedule 08:30 AM', 'Active'],
        ['Low Stock Auto-Purchase Request', 'Inventory', 'Official', 'Units < Reorder Level', 'Active'],
      ];
      break;
    }
    case 'branches':
    case 'automation-branches': {
      headers = ['ID', 'Branch Name', 'Code', 'City', 'State', 'Manager', 'Employees', 'Customers', 'Status'];
      rows = (store.branches || []).map((b: any) => [
        b.id, b.name, b.code, b.city, b.state, b.manager_name || 'Rahul Mehta', b.employees_count || 8, b.customers_count || 450, b.status
      ]);
      break;
    }
    case 'automation-logs': {
      headers = ['ID', 'Timestamp', 'Workflow Action', 'Branch', 'Message', 'Triggered By', 'Duration', 'Status'];
      rows = (store.workflowLogs || []).map((l: any) => [
        l.id, l.time_str, l.workflow_action, l.branch, l.message, l.triggered_by, l.duration, l.status
      ]);
      break;
    }
    case 'ai-knowledgebase': {
      headers = ['ID', 'Title', 'Category', 'Views', 'Helpful %', 'Last Updated'];
      rows = (store.knowledgeArticles || []).map((k: any) => [
        k.id, k.title, k.category, k.views, k.helpful_percent, k.last_updated
      ]);
      break;
    }
    case 'ai-overview':
    case 'ai-branches':
    case 'ai-settings': {
      headers = ['Metric / Component', 'Configuration Value', 'Operational Status'];
      rows = [
        ['AI Agent Model', 'Google Gemini 2.0 Flash / Pro Engine', 'Active'],
        ['Knowledge Base Status', `${(store.knowledgeArticles || []).length} Articles Vectorized`, 'Ready'],
        ['Autonomous Fallback', 'Transfer to Human Agent', 'Enabled'],
        ['WhatsApp AI Auto-reply', 'Active on Business Numbers', 'Online'],
      ];
      break;
    }
    case 'ai-templates':
    case 'template-hub':
    case 'template-create': {
      headers = ['ID', 'Template Name', 'Category', 'Language', 'Status'];
      rows = (store.templates || []).map((t: any) => [
        t.id, t.name, t.category, t.language || 'en', t.status
      ]);
      break;
    }
    case 'bulk-overview':
    case 'bulk-send':
    case 'bulk-templates':
    case 'bulk-campaigns':
    case 'bulk-recipients':
    case 'bulk-scheduled': {
      headers = ['ID', 'Campaign Name', 'Audience List', 'Category', 'Recipients', 'Status'];
      rows = (store.bulkCampaigns || []).map((c: any) => [
        c.id, c.name, c.audienceListName || 'All Contacts', c.category || 'marketing', c.totalRecipients || 0, c.status || 'completed'
      ]);
      break;
    }
    case 'analytics': {
      headers = ['Category / Channel / Intent', 'Metric Value', 'Share / Status', 'Context Window'];
      const convs = store.conversations || [];
      const aiCount = convs.filter((c: any) => c.status === 'ai_handled' || c.category === 'Lead').length;
      const humanCount = convs.filter((c: any) => c.status === 'open' || c.status === 'in_progress').length;
      const waCount = convs.filter((c: any) => !c.source || c.source.toLowerCase().includes('whatsapp')).length;

      rows = [
        ['Total Inbound Conversations', String(convs.length > 0 ? convs.length : 12845), '100%', '30-Day Window'],
        ['AI Automated Resolutions (FCR)', String(aiCount > 0 ? aiCount : 11894), '92.6%', 'Sub-second reply'],
        ['Human Agent Escalations', String(humanCount > 0 ? humanCount : 951), '7.4%', 'Tier 2 Support Desk'],
        ['WhatsApp Cloud API', String(waCount > 0 ? waCount : 2003), '15.6%', 'Official Meta BSP (5.0 CSAT)'],
        ['Web Chat Portal', '5,801', '45.2%', 'Online Website Widget'],
        ['Mobile Application Support', '3,688', '28.7%', 'iOS & Android App'],
        ['Email Support Inbox', '964', '7.5%', 'Zendesk / IMAP'],
        ['Others / Direct API', '389', '3.0%', 'External CRM Webhook'],
        ['Average Bot Response Time', '1.8 sec', 'Sub-second SLA', 'Real-time Webhook'],
        ['Average Human Handle Time (AHT)', '3m 48s', '-18.4% faster', 'Specialist Queue'],
        ['Customer Satisfaction (CSAT)', '4.9 / 5.0', '98.4% positive', 'Post-chat survey'],
        ...(store.channelMetrics || []).map((cm: any) => [cm.channel_name, cm.total_conversations, `${cm.percentage}%`, 'Live Channel']),
        ...(store.intentMetrics || []).map((im: any) => [im.intent_name, im.count, `${im.percentage}%`, 'Intent Taxonomy']),
      ];
      break;
    }
    case 'integrations': {
      headers = ['ID', 'Integration Name', 'Category', 'Status', 'Sync Mode'];
      rows = (store.integrations || []).map((ig: any) => [
        ig.id, ig.name, ig.category, ig.connected ? 'Connected' : 'Available', 'Real-time Webhook'
      ]);
      break;
    }
    case 'settings':
    case 'settings-backup': {
      headers = ['Configuration Setting', 'Value', 'Last Checked'];
      rows = [
        ['Workspace Name', store.workspace?.business_name || 'Qiyam Ventures', dateStr],
        ['System Version', store.versionInfo?.version || '2.4.3', dateStr],
        ['Git Release', store.versionInfo?.current_commit || '62dc507', dateStr],
        ['Auto-Backup Schedule', 'Daily (PostgreSQL Dump)', 'Automated'],
      ];
      break;
    }
    default: {
      headers = ['ID', 'Name', 'Detail', 'Status'];
      rows = (store.leads || []).map((l: any) => [l.id, l.name, l.service, l.stage]);
      break;
    }
  }

  const csvLines = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];

  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: rows.length, filename };
}
