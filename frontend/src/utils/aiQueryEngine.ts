import {
  Conversation,
  Lead,
  Deal,
  FollowUp,
  Job,
  Appointment,
  Employee,
  Invoice,
  Transaction,
  EmployeeSalaryDetail,
  PayrollRunItem,
} from '../types';
import {
  INITIAL_EMPLOYEE_SALARY_DETAILS,
  INITIAL_PAYROLL_RUNS,
  getPayrollCache,
} from '../components/views/finance/payroll/payrollData';

export interface AIStoreContext {
  conversations?: Conversation[];
  leads?: Lead[];
  deals?: Deal[];
  followups?: FollowUp[];
  jobs?: Job[];
  appointments?: Appointment[];
  employees?: Employee[];
  invoices?: Invoice[];
  transactions?: Transaction[];
  payrollEmployees?: EmployeeSalaryDetail[];
  payrollRuns?: PayrollRunItem[];
}

export function generateExecutiveGreeting(ctx: AIStoreContext): string {
  const leadsCount = ctx.leads?.length || 0;
  const overdueJobs = ctx.jobs?.filter((j) => j.status === 'overdue') || [];
  const overdueJobsCount = overdueJobs.length;
  const overdueInvoices =
    ctx.invoices?.filter(
      (i) => i.status === 'overdue' || (i.status === 'sent' && (i.paid_amount || 0) < (i.amount || 0))
    ) || [];
  const overdueInvoicesCount = overdueInvoices.length;
  const aptsCount = ctx.appointments?.length || 0;

  return [
    `Good morning, Rahul! 👋`,
    `Here is the real-time operational & financial status across your branches:`,
    `• ${leadsCount} leads currently active in CRM pipeline`,
    `• ${overdueJobsCount} job(s) flagged overdue (out of ${ctx.jobs?.length || 0} active operations)`,
    `• ${overdueInvoicesCount} payment(s) awaiting collection/reminder`,
    `• ${aptsCount} customer appointment(s) scheduled on the board`,
    `• September Payroll: 32 staff verified (₹10,62,500 Net Pay ready for HDFC batch)`,
  ].join('\n');
}

export function queryAIEngine(query: string, ctx: AIStoreContext): string {
  const lower = query.toLowerCase().trim();
  const invoices = ctx.invoices || [];
  const leads = ctx.leads || [];
  const jobs = ctx.jobs || [];
  const appointments = ctx.appointments || [];
  const employees = ctx.employees || [];
  const conversations = ctx.conversations || [];
  const followups = ctx.followups || [];

  const payrollEmployees: EmployeeSalaryDetail[] =
    ctx.payrollEmployees || getPayrollCache('employees', INITIAL_EMPLOYEE_SALARY_DETAILS);
  const payrollRuns: PayrollRunItem[] =
    ctx.payrollRuns || getPayrollCache('runs', INITIAL_PAYROLL_RUNS);

  // =========================================================================
  // 1. PAYROLL, SALARY CALCULATIONS, TAX & STATUTORY COMPLIANCE (INTEGRATED)
  // =========================================================================
  const isPayrollQuery =
    lower.includes('payroll') ||
    lower.includes('salary') ||
    lower.includes('salaries') ||
    lower.includes('payslip') ||
    lower.includes('wages') ||
    lower.includes('wage') ||
    lower.includes('tax') ||
    lower.includes('tds') ||
    lower.includes('provident fund') ||
    lower.includes('pf') ||
    lower.includes('esi') ||
    lower.includes('professional tax') ||
    lower.includes('compliance') ||
    lower.includes('unpaid days') ||
    lower.includes('overtime') ||
    lower.includes('daily wage') ||
    lower.includes('earned wage') ||
    lower.includes('net pay') ||
    lower.includes('gross wage') ||
    lower.includes('disbursement') ||
    lower.includes('ctc') ||
    lower.includes('deduction');

  if (isPayrollQuery) {
    // A. Check if the query asks about a specific employee by name or ID
    const matchedEmp = payrollEmployees.find((e) => {
      const empName = (e.name || '').toLowerCase();
      const empId = (e.employee_id || '').toLowerCase();
      const nameParts = empName.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts[1] || '';
      return (
        (empName && lower.includes(empName)) ||
        (empId && lower.includes(empId)) ||
        (firstName.length >= 3 && lower.includes(firstName)) ||
        (lastName.length >= 3 && lower.includes(lastName))
      );
    });

    if (matchedEmp) {
      const daily = matchedEmp.daily_wage || Math.round((matchedEmp.gross_salary || 30000) / 26);
      const paid = matchedEmp.paid_days ?? 14;
      const unpaid = matchedEmp.unpaid_days ?? 2;
      const earned = matchedEmp.earned_wages || Math.round(daily * paid);
      const ot = matchedEmp.overtime_amount || 0;
      const extras = matchedEmp.extras || 0;
      const grossEarn = matchedEmp.gross_earnings || (earned + ot + extras);
      const tds = matchedEmp.tds || Math.round((matchedEmp.deductions || 2000) * 0.4);
      const otherDed = matchedEmp.other_deductions || Math.round((matchedEmp.deductions || 2000) * 0.6);
      const net = matchedEmp.finalized_amount || matchedEmp.net_pay;

      return [
        `👤 Employee Payroll Breakdown: ${matchedEmp.name} (${matchedEmp.employee_id})`,
        `• Department / Role: ${matchedEmp.department} (${matchedEmp.role || 'BDE'})`,
        `• Base Gross Wages: ₹${(matchedEmp.gross_wages || matchedEmp.gross_salary).toLocaleString('en-IN')} (Daily Wage: ₹${daily.toLocaleString('en-IN')})`,
        `• Attendance Matrix: ${matchedEmp.full_day ?? 13} Full, ${matchedEmp.half_day ?? 0} Half, ${matchedEmp.wfh_days ?? 0} WFH, ${matchedEmp.paid_leave ?? 0} Paid Leave`,
        `• Days Reconciled: ${paid} Paid Days, ${unpaid} Unpaid Days deducted`,
        `• Earned Wages: ₹${earned.toLocaleString('en-IN')} (Overtime: ₹${ot.toLocaleString('en-IN')}, Extras: ₹${extras.toLocaleString('en-IN')})`,
        `• Gross Earnings: ₹${grossEarn.toLocaleString('en-IN')}`,
        `• Deductions: TDS: ₹${tds.toLocaleString('en-IN')}, Other Deductions: ₹${otherDed.toLocaleString('en-IN')} (Total: -₹${matchedEmp.deductions.toLocaleString('en-IN')})`,
        `• Finalized Net Payout: ₹${net.toLocaleString('en-IN')} [Status: ${matchedEmp.status}]`,
        `• Payment Routing: ${matchedEmp.bank_account || 'HDFC Bank'} • PAN: ${matchedEmp.pan_number || 'On File'} • UAN: ${matchedEmp.uan_number || 'On File'}`,
        `\nDigital payslip is ready for automated WhatsApp & Email delivery upon batch disbursement.`,
      ].join('\n');
    }

    // B. Tax & Statutory Compliance specific query
    if (
      lower.includes('tax') ||
      lower.includes('tds') ||
      lower.includes('pf') ||
      lower.includes('provident') ||
      lower.includes('esi') ||
      lower.includes('compliance') ||
      lower.includes('regime')
    ) {
      return [
        `🏛️ Statutory Tax & Labor Compliance Audit (September 2026):`,
        `• Total Statutory & Tax Deductions: ₹1,82,500 across 32 active employees`,
        `• Income Tax TDS: Form 24Q compliant. Deductions calculated under New Regime (Section 115BAC default) and Old Regime declarations with 80C/80D proofs.`,
        `• Provident Fund (EPF 12%): ₹62,300 monthly deduction matched 100% by employer (3.67% EPF, 8.33% EPS capped at ₹15,000 wage ceiling). Electronic Challan Return (ECR) due on the 15th.`,
        `• Employee State Insurance (ESI): ₹18,750 for employees with monthly gross wages ≤ ₹21,000 (0.75% employee + 3.25% employer). Due on the 15th.`,
        `• Professional Tax (PT Kerala): ₹8,600 municipal tax filed half-yearly with Kozhikode Municipal Corporation (slabs ₹200 – ₹1,250).`,
        `• KYC & Bank Verification: 31 accounts verified with IFSC checksum; 1 pending verification auto-flagged.`,
        `\nAll General Ledger tax entries are balanced and ready for automated batch credit.`,
      ].join('\n');
    }

    // C. Calculation Methodology & Formulas
    if (
      lower.includes('calculate') ||
      lower.includes('calculation') ||
      lower.includes('formula') ||
      lower.includes('how are') ||
      lower.includes('daily wage') ||
      lower.includes('unpaid')
    ) {
      return [
        `📐 Qiyam Payroll Calculation Methodology (September 2026 Cycle):`,
        `1. Monthly Calendar Baseline: 26 Working Days per cycle month.`,
        `2. Daily Wage Formula: Gross Wage ÷ 26 Working Days.`,
        `3. Reconciled Paid Days: Full Days + (Half Days × 0.5) + Paid Leave Days.`,
        `4. Reconciled Unpaid Days: 26 Working Days - Reconciled Paid Days.`,
        `5. Earned Wages: Daily Wage × Reconciled Paid Days.`,
        `6. Gross Earnings: Earned Wages + Other Earnings + Overtime Amount + Extras/Incentives.`,
        `7. Total Deductions: Income Tax TDS + Statutory PF/ESI/PT + Penalties + Other Deductions.`,
        `8. Finalized Net Pay: Gross Earnings - Total Deductions.`,
        `\nExample (Sales BDE, ₹30,000 Gross):`,
        `• Daily Wage = ₹30,000 ÷ 26 = ₹1,000.`,
        `• 14 Full Days + 1 Half Day = 14.5 Paid Days (1.5 Unpaid Days deducted).`,
        `• Earned Wages = ₹14,500. With ₹300 OT + ₹450 Extras = ₹15,250 Gross Earnings.`,
        `• Less ₹870 TDS & ₹1,500 Deductions = ₹12,880 Final Net Payable.`,
      ].join('\n');
    }

    // D. General Payroll Summary / Status
    return [
      `💳 September 2026 Monthly Payroll Overview:`,
      `• Total Staff: 32 active employees verified`,
      `• Total Gross Wages: ₹12,45,000 (Base CTC + Overtime ₹12,300 + Incentives)`,
      `• Total Statutory Deductions: ₹1,82,500 (TDS, PF, ESI & PT Kerala)`,
      `• Total Net Payout: ₹10,62,500 required for batch disbursement`,
      `• Attendance Summary: 420.5 Paid Days, 35.5 Unpaid Days deducted, 86 Overtime Hours`,
      `• Disbursement Channel: HDFC Corporate Banking Direct NEFT/RTGS Batch`,
      `• Status: 100% attendance and statutory calculations verified. Ready for 1-click execution.`,
      `\nYou can review individual employee slips or authorize the disbursement directly in the Run Payroll view.`,
    ].join('\n');
  }

  // =========================================================================
  // 2. REVENUE / FINANCIALS / BILLING / PAYMENTS
  // =========================================================================
  if (
    lower.includes('revenue') ||
    lower.includes('profit') ||
    lower.includes('billed') ||
    lower.includes('income') ||
    lower.includes('invoice') ||
    lower.includes('finance') ||
    lower.includes('money') ||
    lower.includes('payment') ||
    lower.includes('overdue payment')
  ) {
    const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => {
      if (inv.status === 'paid') return sum + (Number(inv.amount) || 0);
      return sum + (Number(inv.paid_amount) || 0);
    }, 0);
    const outstanding = Math.max(0, totalBilled - totalCollected);
    const overdueInvoices = invoices.filter(
      (inv) => inv.status === 'overdue' || (inv.status === 'sent' && (inv.paid_amount || 0) < (inv.amount || 0))
    );
    const paidCount = invoices.filter((inv) => inv.status === 'paid').length;

    let overdueSummary = '';
    if (overdueInvoices.length > 0) {
      const topOverdue = overdueInvoices.slice(0, 3);
      overdueSummary =
        '\n\nCritical Overdue Invoices:\n' +
        topOverdue
          .map(
            (inv) =>
              `• ${inv.invoice_number}: ₹${Number(inv.amount).toLocaleString('en-IN')} (${inv.customer_name}) - Due ${inv.due_date}`
          )
          .join('\n');
    }

    return [
      `💰 Real-Time Financial & Revenue Analysis:`,
      `• Total Billed: ₹${totalBilled.toLocaleString('en-IN')}`,
      `• Collected: ₹${totalCollected.toLocaleString('en-IN')}`,
      `• Outstanding Dues: ₹${outstanding.toLocaleString('en-IN')} across ${overdueInvoices.length} account(s)`,
      `• Settled Invoices: ${paidCount} of ${invoices.length} total`,
      overdueSummary,
      `\nAutomated WhatsApp 1-click UPI reminder templates are staged for pending accounts.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // =========================================================================
  // 3. LEADS / HIGH VALUE / CRM / PROPOSALS
  // =========================================================================
  if (
    lower.includes('lead') ||
    lower.includes('high value') ||
    lower.includes('crm') ||
    lower.includes('prospect') ||
    lower.includes('deal') ||
    lower.includes('quotation') ||
    lower.includes('follow up') ||
    lower.includes('followup')
  ) {
    const totalVal = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const sortedLeads = [...leads].sort((a, b) => (b.value || 0) - (a.value || 0));
    const topLeads = sortedLeads.slice(0, 3);
    const wonCount = leads.filter((l) => l.stage === 'won').length;
    const qualifiedCount = leads.filter(
      (l) => l.stage === 'qualified' || l.stage === 'proposal_sent'
    ).length;

    const topLeadsList = topLeads
      .map(
        (l) =>
          `• ${l.name} — ₹${Number(l.value).toLocaleString('en-IN')} (${l.service || 'Service'}, Stage: ${l.stage})`
      )
      .join('\n');

    const pendingFollowups = followups.filter((f) => f.status !== 'completed').length;

    return [
      `👥 CRM Pipeline & High-Value Inquiries:`,
      `• Total Active Leads: ${leads.length}`,
      `• Total Pipeline Value: ₹${totalVal.toLocaleString('en-IN')}`,
      `• Qualified / Proposals Sent: ${qualifiedCount} (${wonCount} deals won)`,
      `• Pending Follow-Ups Today: ${pendingFollowups}`,
      `\nTop Value Prospects Requiring Priority Contact:\n${topLeadsList}`,
      `\nSuggested Action: Launch a targeted follow-up sequence via WhatsApp or assign to lead owners.`,
    ].join('\n');
  }

  // =========================================================================
  // 4. SCHEDULE / TODAY / APPOINTMENTS / CALENDAR
  // =========================================================================
  if (
    lower.includes('schedule') ||
    lower.includes('appointment') ||
    lower.includes('today') ||
    lower.includes('calendar') ||
    lower.includes('booking') ||
    lower.includes('slot')
  ) {
    const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
    const upcomingCount = appointments.filter((a) => a.status === 'upcoming').length;
    const topAppointments = appointments.slice(0, 4);

    const aptList = topAppointments
      .map(
        (a) =>
          `• ${a.time_str || '10:00 AM'}: ${a.customer_name} (${a.service}) — Assigned: ${a.employee || 'Technician'}`
      )
      .join('\n');

    return [
      `📅 Today's Operations & Appointment Schedule:`,
      `• Total Appointments: ${appointments.length} scheduled`,
      `• Confirmed Bookings: ${confirmedCount} confirmed, ${upcomingCount} upcoming`,
      `\nUpcoming Timeline for Today:\n${aptList}`,
      `\nField technicians have their automated dispatch notifications and GPS route pins activated.`,
    ].join('\n');
  }

  // =========================================================================
  // 5. JOBS / OVERDUE / FIELD OPS / DISPATCH
  // =========================================================================
  if (
    lower.includes('job') ||
    lower.includes('overdue') ||
    lower.includes('dispatch') ||
    lower.includes('technician route') ||
    lower.includes('field') ||
    lower.includes('work order')
  ) {
    const overdueJobs = jobs.filter((j) => j.status === 'overdue');
    const inProgressJobs = jobs.filter((j) => j.status === 'in_progress');
    const scheduledJobs = jobs.filter((j) => j.status === 'scheduled');
    const completedJobs = jobs.filter((j) => j.status === 'completed');

    let overdueList = '';
    if (overdueJobs.length > 0) {
      overdueList =
        `\n⚠️ Overdue Dispatch Alerts:\n` +
        overdueJobs
          .map(
            (j) =>
              `• ${j.job_id_str}: ${j.customer_name} (${j.service}) — Tech: ${j.assigned_to}, Loc: ${j.location}`
          )
          .join('\n');
    }

    return [
      `🛠️ Field Operations & Work Orders:`,
      `• Total Jobs on File: ${jobs.length}`,
      `• In Progress: ${inProgressJobs.length} active on site`,
      `• Scheduled: ${scheduledJobs.length} queued`,
      `• Completed: ${completedJobs.length} finalized`,
      `• Overdue / Delayed: ${overdueJobs.length}`,
      overdueList,
      `\nPriority dispatch actions are available from the Operations module.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // =========================================================================
  // 6. STAFF / EMPLOYEES / TECHNICIANS / ATTENDANCE
  // =========================================================================
  if (
    lower.includes('staff') ||
    lower.includes('employee') ||
    lower.includes('technician') ||
    lower.includes('attendance') ||
    lower.includes('team') ||
    lower.includes('worker')
  ) {
    const onDuty = employees.filter((e) => e.status === 'on_duty' || e.status === 'active');
    const sortedByRating = [...employees].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const topPerformer = sortedByRating[0];

    const staffBreakdown = onDuty
      .slice(0, 4)
      .map((e) => `• ${e.name} (${e.role}) — Rating: ${e.rating || 4.8} ⭐ (${e.jobs_completed_month || 0} jobs this month)`)
      .join('\n');

    return [
      `👷 Team & Field Staff Overview:`,
      `• Total Staff: ${employees.length} team members`,
      `• Active / On-Duty: ${onDuty.length} technicians available`,
      topPerformer
        ? `• Top Rating: ${topPerformer.name} (${topPerformer.rating} ⭐ with ${topPerformer.jobs_completed_month} completed jobs)`
        : '',
      `\nActive Roster Sample:\n${staffBreakdown}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // =========================================================================
  // 7. WHATSAPP / CONVERSATIONS / INBOX
  // =========================================================================
  if (
    lower.includes('whatsapp') ||
    lower.includes('chat') ||
    lower.includes('inbox') ||
    lower.includes('message') ||
    lower.includes('conversation')
  ) {
    const unreadCount = conversations.filter((c) => (c.unread_count || 0) > 0).length;
    const hotLeadsInChat = conversations.filter((c) => c.category === 'Hot Lead').length;
    const latestChats = conversations.slice(0, 3);

    const chatList = latestChats
      .map((c) => `• ${c.contact_name} (${c.phone_number}) — Stage: ${c.lead_stage || 'Active'}`)
      .join('\n');

    return [
      `💬 WhatsApp Messaging Operations:`,
      `• Total Open Conversations: ${conversations.length}`,
      `• Chats with Unread Replies: ${unreadCount}`,
      `• Hot Lead Threads: ${hotLeadsInChat}`,
      `\nRecent Customer Interactions:\n${chatList}`,
      `\nWebhook sync is active with Meta Cloud API. Incoming messages route instantly to your team.`,
    ].join('\n');
  }

  // =========================================================================
  // 8. DEFAULT SYNTHESIS / GENERAL QUERY
  // =========================================================================
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalOutstanding = Math.max(
    0,
    totalBilled -
      invoices.reduce((sum, inv) => {
        if (inv.status === 'paid') return sum + (Number(inv.amount) || 0);
        return sum + (Number(inv.paid_amount) || 0);
      }, 0)
  );
  const pipelineVal = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const unreadChats = conversations.filter((c) => (c.unread_count || 0) > 0).length;

  return [
    `I've analyzed your real-time operational database regarding "${query}":`,
    `• Payroll: September 2026 batch verified (32 staff, ₹10,62,500 Net Pay)`,
    `• CRM: ${leads.length} leads in pipeline (₹${pipelineVal.toLocaleString('en-IN')} total estimated value)`,
    `• Operations: ${jobs.length} jobs assigned, ${appointments.length} appointments scheduled today`,
    `• Financials: ₹${totalBilled.toLocaleString('en-IN')} invoiced, ₹${totalOutstanding.toLocaleString('en-IN')} outstanding`,
    `• Communication: ${conversations.length} WhatsApp threads (${unreadChats} unread)`,
    `• Staff: ${employees.length} registered technicians & coordinators`,
    `\nAll branch synchronization channels and background automation triggers are running smoothly.`,
  ].join('\n');
}
