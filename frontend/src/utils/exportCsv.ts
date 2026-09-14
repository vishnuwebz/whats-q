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
        c.id, c.contact_name, c.phone_number, c.location, c.category, c.last_contact_date
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
    case 'ops-attendance': {
      headers = ['ID', 'Employee ID', 'Name', 'Department', 'Shift', 'Check In', 'Check Out', 'Work Hours', 'Status', 'Location'];
      rows = (store.attendance || []).map((att: any) => [
        att.id, att.employee_id_str, att.employee_name, att.department, att.shift, att.check_in, att.check_out || '-', att.work_hours, att.status, att.location
      ]);
      break;
    }
    case 'ops-tasks': {
      headers = ['ID', 'Title', 'Subtitle', 'Related To', 'Assignee', 'Priority', 'Status', 'Due Date'];
      rows = (store.tasks || []).map((t: any) => [
        t.id, t.title, t.subtitle, t.related_to, t.assignee, t.priority, t.status, t.due_date
      ]);
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
    case 'finance-expenses': {
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
    case 'automation-branches': {
      headers = ['ID', 'Branch Name', 'Code', 'City', 'State', 'Automations Count', 'Tasks Automated', 'Status'];
      rows = (store.branches || []).map((b: any) => [
        b.id, b.name, b.code, b.city, b.state, b.automations_count, b.tasks_automated, b.status
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
    case 'analytics': {
      headers = ['Channel / Intent', 'Metric Value', 'Percentage'];
      rows = [
        ...(store.channelMetrics || []).map((cm: any) => [cm.channel_name, cm.total_conversations, `${cm.percentage}%`]),
        ...(store.intentMetrics || []).map((im: any) => [im.intent_name, im.count, `${im.percentage}%`]),
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
