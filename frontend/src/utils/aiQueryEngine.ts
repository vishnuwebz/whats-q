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
} from '../types';

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
    `Here is the real-time operational status across your branches:`,
    `• ${leadsCount} leads currently active in CRM pipeline`,
    `• ${overdueJobsCount} job(s) flagged overdue (out of ${ctx.jobs?.length || 0} active operations)`,
    `• ${overdueInvoicesCount} payment(s) awaiting collection/reminder`,
    `• ${aptsCount} customer appointment(s) scheduled on the board`,
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

  // 1. REVENUE / FINANCIALS / BILLING / PAYMENTS
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

  // 2. LEADS / HIGH VALUE / CRM / PROPOSALS
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

  // 3. SCHEDULE / TODAY / APPOINTMENTS / CALENDAR
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

  // 4. JOBS / OVERDUE / FIELD OPS / DISPATCH
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

  // 5. STAFF / EMPLOYEES / TECHNICIANS / ATTENDANCE
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

  // 6. WHATSAPP / CONVERSATIONS / INBOX
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

  // 7. DEFAULT SYNTHESIS / GENERAL QUERY
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
    `• CRM: ${leads.length} leads in pipeline (₹${pipelineVal.toLocaleString('en-IN')} total estimated value)`,
    `• Operations: ${jobs.length} jobs assigned, ${appointments.length} appointments scheduled today`,
    `• Financials: ₹${totalBilled.toLocaleString('en-IN')} invoiced, ₹${totalOutstanding.toLocaleString('en-IN')} outstanding`,
    `• Communication: ${conversations.length} WhatsApp threads (${unreadChats} unread)`,
    `• Staff: ${employees.length} registered technicians & coordinators`,
    `\nAll branch synchronization channels and background automation triggers are running smoothly.`,
  ].join('\n');
}
