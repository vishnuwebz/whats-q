import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BranchItem } from '@/types';
import { INITIAL_MULTI_BRANCH_CUSTOMERS } from '@/store/customerSeedData';
import {
  Building2, Users, UserCheck, MapPin, Search, Filter, ArrowUpDown,
  MoreVertical, Plus, CheckCircle2, Clock, X, Camera, Upload,
  Image as ImageIcon, Trash2, Edit3, Settings, BarChart3, HelpCircle,
  TrendingUp, Check, RefreshCw, ChevronRight, ChevronLeft, SlidersHorizontal,
  ArrowLeft, Phone, Mail, Globe, ExternalLink, ShieldCheck, Zap,
  Activity, Award, UserPlus, MessageSquare, AlertCircle, Eye,
  Sparkles, CheckCircle, Smartphone, BookOpen
} from 'lucide-react';
import { BranchDocumentationView } from './BranchDocumentationView';

export const BRANCH_IMAGE_PRESETS = [
  {
    id: 'p1',
    label: 'Modern Glass Tower (HQ)',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    label: 'Corporate Office Complex',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    label: 'Commercial Business Center',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    label: 'City Retail Storefront',
    url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p5',
    label: 'Urban Regional Hub',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p6',
    label: 'Tech Park Campus',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
  },
];

export const getBranchStaff = (branch: BranchItem) => {
  const targetCount = Math.max(1, Number(branch.employees_count) || 8);
  const isBranchActive = branch.status?.toLowerCase() !== 'inactive';
  const defaultStatus = isBranchActive ? 'On Duty' : 'Off Duty';

  // 1. Manager / Branch Lead
  const manager = {
    name: branch.manager_name || 'Rahul Mehta',
    role: branch.manager_role || 'Branch Manager',
    department: 'Management',
    phone: branch.phone || '+91 495 276 5400',
    email: branch.email || 'manager@qiyamventures.com',
    status: defaultStatus,
    rating: 4.9,
  };

  // 2. Curated Roster Pool of Branch Specialists
  const ROSTER_POOL = [
    {
      name: 'Anjali Nair',
      role: 'Senior WhatsApp Specialist',
      department: 'Customer Support',
      phone: '+91 98470 11223',
      email: 'anjali.n@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
    {
      name: 'Mohammed Rizwan',
      role: 'Key Account Executive',
      department: 'Sales & Growth',
      phone: '+91 97451 99882',
      email: 'rizwan.m@qiyamventures.com',
      status: defaultStatus,
      rating: 4.7,
    },
    {
      name: 'Karthik Varma',
      role: 'Field Service Lead',
      department: 'Operations',
      phone: '+91 94472 44331',
      email: 'karthik.v@qiyamventures.com',
      status: defaultStatus,
      rating: 4.9,
    },
    {
      name: 'Sneha Joshi',
      role: 'WhatsApp Automation Engineer',
      department: 'Technical Operations',
      phone: '+91 96789 66771',
      email: 'sneha.j@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
    {
      name: 'Arjun Das',
      role: 'Customer Success Manager',
      department: 'Client Retention',
      phone: '+91 85471 22330',
      email: 'arjun.d@qiyamventures.com',
      status: defaultStatus,
      rating: 4.9,
    },
    {
      name: 'Divya Menon',
      role: 'Regional Dispatch Coordinator',
      department: 'Logistics',
      phone: '+91 91234 56789',
      email: 'divya.m@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
    {
      name: 'Siddharth Rao',
      role: 'Billing & Invoicing Specialist',
      department: 'Finance & Accounts',
      phone: '+91 98765 12340',
      email: 'siddharth.r@qiyamventures.com',
      status: defaultStatus,
      rating: 4.7,
    },
    {
      name: 'Pooja Varma',
      role: 'Quality Assurance Analyst',
      department: 'Compliance & QA',
      phone: '+91 94471 10045',
      email: 'pooja.v@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
    {
      name: 'Vikram Mehta',
      role: 'Enterprise Solutions Consultant',
      department: 'Enterprise Sales',
      phone: '+91 93345 67890',
      email: 'vikram.m@qiyamventures.com',
      status: defaultStatus,
      rating: 4.9,
    },
    {
      name: 'Meera Nambiar',
      role: 'Live Chat Support Agent',
      department: 'Customer Support',
      phone: '+91 92233 44556',
      email: 'meera.n@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
    {
      name: 'Amit Sharma',
      role: 'Field Support Technician',
      department: 'Operations',
      phone: '+91 90000 11123',
      email: 'amit.s@qiyamventures.com',
      status: defaultStatus,
      rating: 4.7,
    },
    {
      name: 'Aisha Fathima',
      role: 'Digital Engagement Associate',
      department: 'Marketing',
      phone: '+91 95566 77889',
      email: 'aisha.f@qiyamventures.com',
      status: defaultStatus,
      rating: 4.9,
    },
    {
      name: 'Ramesh Kumar',
      role: 'Facility Coordinator',
      department: 'Operations',
      phone: '+91 91222 33445',
      email: 'ramesh.k@qiyamventures.com',
      status: defaultStatus,
      rating: 4.6,
    },
    {
      name: 'Deepak Patel',
      role: 'Support Desk Specialist',
      department: 'Customer Support',
      phone: '+91 96677 88990',
      email: 'deepak.p@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
    {
      name: 'Nandita Roy',
      role: 'Operations Supervisor',
      department: 'Management',
      phone: '+91 97788 99001',
      email: 'nandita.r@qiyamventures.com',
      status: defaultStatus,
      rating: 4.9,
    },
    {
      name: 'Farhan Ali',
      role: 'Client Relationship Officer',
      department: 'Sales & Growth',
      phone: '+91 98899 00112',
      email: 'farhan.a@qiyamventures.com',
      status: defaultStatus,
      rating: 4.8,
    },
  ];

  if (targetCount <= 1) {
    return [manager];
  }

  const staffList = [manager];
  for (let i = 0; i < targetCount - 1; i++) {
    const template = ROSTER_POOL[i % ROSTER_POOL.length];
    if (i >= ROSTER_POOL.length) {
      staffList.push({
        ...template,
        name: `${template.name} ${Math.floor(i / ROSTER_POOL.length) + 1}`,
        email: `${template.email.replace('@', `${Math.floor(i / ROSTER_POOL.length) + 1}@`)}`,
      });
    } else {
      staffList.push(template);
    }
  }

  return staffList;
};

export const getBranchWorkflows = (branch: BranchItem) => {
  const targetCount = Math.max(1, Number(branch.automations_count) || 14);
  const isBranchActive = branch.status?.toLowerCase() !== 'inactive';

  const WORKFLOW_POOL = [
    {
      id: 'wf-1',
      name: 'Regional Inbound Lead Router',
      description: `Auto-routes incoming WhatsApp leads from ${branch.city} to local sales reps`,
      trigger: 'New WhatsApp Message',
      status: isBranchActive,
      runs: 142,
      successRate: '99.4%',
    },
    {
      id: 'wf-2',
      name: 'Multilingual Regional Auto-Responder',
      description: `Instant greeting in English & regional language for ${branch.state} timezone`,
      trigger: 'First Contact',
      status: isBranchActive,
      runs: 98,
      successRate: '100%',
    },
    {
      id: 'wf-3',
      name: 'High-Priority Service SLA Alert',
      description: `Escalates pending customer queries > 2 hours to ${branch.manager_name || 'Manager'}`,
      trigger: 'SLA Breach (> 2 hrs)',
      status: isBranchActive,
      runs: 12,
      successRate: '98.2%',
    },
    {
      id: 'wf-4',
      name: 'UPI Invoice & Payment Reminder Bot',
      description: 'Sends Razorpay link with automated follow-up before job completion',
      trigger: 'Pending Invoice',
      status: isBranchActive,
      runs: 64,
      successRate: '99.1%',
    },
    {
      id: 'wf-5',
      name: 'Appointment & Booking Confirmer',
      description: `Dispatches calendar invites, GPS pin, and technician WhatsApp contacts for ${branch.city}`,
      trigger: 'Booking Confirmed',
      status: isBranchActive,
      runs: 184,
      successRate: '99.8%',
    },
    {
      id: 'wf-6',
      name: 'Post-Service CSAT & Feedback Collector',
      description: 'Automatically sends satisfaction survey with Google Review link for 5★ ratings',
      trigger: 'Ticket Closed',
      status: isBranchActive,
      runs: 110,
      successRate: '97.9%',
    },
    {
      id: 'wf-7',
      name: 'Field Technician GPS Geofence Check-in',
      description: `Alerts ${branch.city} operations desk when technician arrives within 500m of customer site`,
      trigger: 'Geofence Entry',
      status: isBranchActive,
      runs: 215,
      successRate: '99.5%',
    },
    {
      id: 'wf-8',
      name: 'Automated Warranty & AMC Renewal Alert',
      description: 'Proactively reminds clients 14 days before annual contract expiry with instant renewal link',
      trigger: 'Contract Due < 14d',
      status: isBranchActive,
      runs: 58,
      successRate: '98.6%',
    },
    {
      id: 'wf-9',
      name: 'Live Order Dispatch & Delivery Tracker',
      description: 'Sends real-time delivery tracking link and dispatch driver details via WhatsApp',
      trigger: 'Out for Delivery',
      status: isBranchActive,
      runs: 167,
      successRate: '99.9%',
    },
    {
      id: 'wf-10',
      name: 'Off-Hours AI Concierge & Triage',
      description: `Handles after-hours queries in ${branch.city} and schedules priority callbacks for next morning`,
      trigger: 'Message Outside Hours',
      status: isBranchActive,
      runs: 86,
      successRate: '99.2%',
    },
    {
      id: 'wf-11',
      name: 'VIP Customer Priority Queue Router',
      description: `Bypasses standard bot and instantly connects key account clients to ${branch.manager_name || 'Senior Lead'}`,
      trigger: 'VIP Contact Tag',
      status: isBranchActive,
      runs: 24,
      successRate: '100%',
    },
    {
      id: 'wf-12',
      name: 'Bulk Regional Campaign Delivery Engine',
      description: `Delivers targeted WhatsApp broadcasts for ${branch.state} respecting Meta tier rate limits`,
      trigger: 'Broadcast Schedule',
      status: isBranchActive,
      runs: 320,
      successRate: '98.9%',
    },
    {
      id: 'wf-13',
      name: 'Document & KYC Verification Bot',
      description: 'Collects PDF invoices, GST certificates, and identity documents directly in WhatsApp chat',
      trigger: 'KYC Required',
      status: isBranchActive,
      runs: 73,
      successRate: '99.0%',
    },
    {
      id: 'wf-14',
      name: 'Missed Call to WhatsApp Bridge',
      description: `Automatically converts missed landline/mobile calls to ${branch.city} into interactive chat greetings`,
      trigger: 'Missed Call Logged',
      status: isBranchActive,
      runs: 156,
      successRate: '99.7%',
    },
    {
      id: 'wf-15',
      name: 'Emergency Breakdown Escalation Dispatch',
      description: `Broadcasts immediate high-urgency notifications to all on-duty ${branch.city} technicians`,
      trigger: 'Emergency Flag',
      status: isBranchActive,
      runs: 19,
      successRate: '100%',
    },
    {
      id: 'wf-16',
      name: 'Daily Branch Performance & Revenue Digest',
      description: 'Compiles daily revenue, closed jobs, and SLA score into an evening report for branch leadership',
      trigger: 'Daily at 07:00 PM',
      status: isBranchActive,
      runs: 30,
      successRate: '100%',
    },
    {
      id: 'wf-17',
      name: 'Spare Parts Low-Stock Warning Bot',
      description: `Alerts ${branch.city} storekeeper when essential hardware stock drops below safety minimum`,
      trigger: 'Stock < Min Level',
      status: isBranchActive,
      runs: 41,
      successRate: '98.5%',
    },
    {
      id: 'wf-18',
      name: 'Staff Shift Roster & Route Dispatch',
      description: 'Sends daily job itineraries and territory routes to all branch team members at 8:00 AM',
      trigger: 'Daily at 08:00 AM',
      status: isBranchActive,
      runs: 30,
      successRate: '100%',
    },
    {
      id: 'wf-19',
      name: 'Dormant Client Re-engagement Bot',
      description: 'Reaches out to accounts inactive for > 60 days with personalized promotional revival codes',
      trigger: 'Inactivity > 60 Days',
      status: isBranchActive,
      runs: 92,
      successRate: '97.8%',
    },
    {
      id: 'wf-20',
      name: 'Digital Warranty Certificate Generator',
      description: 'Generates and delivers personalized PDF warranty certificates directly to customer chat',
      trigger: 'Job Completed & Paid',
      status: isBranchActive,
      runs: 135,
      successRate: '99.6%',
    },
    {
      id: 'wf-21',
      name: 'Unread Quotation Follow-up Bot',
      description: 'Sends gentle automated follow-up if price quotation PDF remains unopened after 24 hours',
      trigger: 'Quote Unread > 24h',
      status: isBranchActive,
      runs: 47,
      successRate: '98.3%',
    },
    {
      id: 'wf-22',
      name: 'Self-Service Booking Rescheduler',
      description: 'Allows customers to modify or postpone appointment time slots without agent assistance',
      trigger: 'Reschedule Keyword',
      status: isBranchActive,
      runs: 68,
      successRate: '99.4%',
    },
    {
      id: 'wf-23',
      name: 'Regional Festival & Holiday Notifier',
      description: `Dispatches automated greetings and adjusted holiday timings for ${branch.state} holidays`,
      trigger: 'Regional Holiday',
      status: isBranchActive,
      runs: 280,
      successRate: '99.9%',
    },
    {
      id: 'wf-24',
      name: 'Inter-Branch Referral & Transfer Hub',
      description: `Transfers inquiries between ${branch.city} and other branches preserving complete chat history`,
      trigger: 'Branch Transfer Tag',
      status: isBranchActive,
      runs: 36,
      successRate: '100%',
    },
    {
      id: 'wf-25',
      name: 'Technician Expense & Mileage Tracker',
      description: 'Logs travel receipts and daily fuel mileage submitted by field technicians via WhatsApp photo upload',
      trigger: 'Expense Photo Sent',
      status: isBranchActive,
      runs: 145,
      successRate: '99.1%',
    },
    {
      id: 'wf-26',
      name: 'New Customer Welcome Onboarding',
      description: `3-stage sequence introducing new ${branch.city} clients to their dedicated support rep and helpline`,
      trigger: 'New Customer Tag',
      status: isBranchActive,
      runs: 88,
      successRate: '99.5%',
    },
    {
      id: 'wf-27',
      name: 'GST Tax Invoice Delivery Webhook',
      description: 'Delivers compliant digital tax invoice and payment acknowledgement immediately after settlement',
      trigger: 'Payment Webhook',
      status: isBranchActive,
      runs: 176,
      successRate: '100%',
    },
    {
      id: 'wf-28',
      name: 'Negative Sentiment Escalation Interceptor',
      description: `AI scans incoming chats for dissatisfaction keywords and alerts ${branch.manager_name || 'Manager'} instantly`,
      trigger: 'Frustration Detected',
      status: isBranchActive,
      runs: 15,
      successRate: '98.0%',
    },
    {
      id: 'wf-29',
      name: 'Weekly Safety & Compliance Audit Bot',
      description: 'Prompts branch field team to confirm vehicle maintenance and safety gear compliance each Monday',
      trigger: 'Weekly on Monday',
      status: isBranchActive,
      runs: 4,
      successRate: '100%',
    },
    {
      id: 'wf-30',
      name: 'Proactive Annual Maintenance Visit Scheduler',
      description: 'Automatically schedules periodic preventative checkups without customer having to call in',
      trigger: 'Quarterly Maintenance',
      status: isBranchActive,
      runs: 62,
      successRate: '99.2%',
    },
    {
      id: 'wf-31',
      name: 'Google Maps Local Review Booster',
      description: `Invites verified happy clients in ${branch.city} to leave a 5-star rating on Google Business Profile`,
      trigger: 'Positive CSAT Received',
      status: isBranchActive,
      runs: 94,
      successRate: '98.7%',
    },
    {
      id: 'wf-32',
      name: 'End-of-Day Telemetry Cloud Sync',
      description: 'Audits and archives all branch chat transcripts, contact updates, and audit trails to secure backup',
      trigger: 'Daily at 11:30 PM',
      status: isBranchActive,
      runs: 30,
      successRate: '100%',
    },
    {
      id: 'wf-33',
      name: 'Customer Re-order Reminder Bot',
      description: 'Analyzes past consumption patterns and suggests consumable replacements right before depletion',
      trigger: 'Re-order Cycle Due',
      status: isBranchActive,
      runs: 52,
      successRate: '98.4%',
    },
    {
      id: 'wf-34',
      name: 'Service Cancellation Prevention Flow',
      description: 'Intervenes when customer mentions cancellation, offering discount vouchers or alternate scheduling',
      trigger: 'Cancel Intent Detected',
      status: isBranchActive,
      runs: 28,
      successRate: '96.4%',
    },
    {
      id: 'wf-35',
      name: 'Branch Inbound Call Routing Bot',
      description: `Directs customer callers to IVR or instant WhatsApp self-service menu for ${branch.city} queries`,
      trigger: 'Inbound SIP Trigger',
      status: isBranchActive,
      runs: 114,
      successRate: '99.6%',
    },
    {
      id: 'wf-36',
      name: 'Vendor Purchase Order Delivery Webhook',
      description: `Dispatches confirmed purchase orders to local ${branch.city} suppliers with tracking acknowledgment`,
      trigger: 'PO Authorized',
      status: isBranchActive,
      runs: 37,
      successRate: '100%',
    },
  ];

  const workflowList = [];
  for (let i = 0; i < targetCount; i++) {
    const template = WORKFLOW_POOL[i % WORKFLOW_POOL.length];
    if (i >= WORKFLOW_POOL.length) {
      workflowList.push({
        ...template,
        id: `wf-${i + 1}`,
        name: `${template.name} (Flow ${Math.floor(i / WORKFLOW_POOL.length) + 1})`,
        runs: Math.max(10, template.runs - (i * 2)),
      });
    } else {
      workflowList.push({
        ...template,
        id: `wf-${i + 1}`,
      });
    }
  }

  return workflowList;
};

export const getBranchActivity = (branch: BranchItem) => {
  return [
    {
      id: 'act-1',
      title: 'WhatsApp Broadcast Campaign Delivered',
      desc: `Monthly newsletter delivered to ${branch.customers_count || 450} branch contacts with 98.6% read rate.`,
      time: '10m ago',
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      id: 'act-2',
      title: 'Cloud Telemetry Ping Verified',
      desc: `Latency verified at 42ms response time to ${branch.city} regional edge gateway.`,
      time: '25m ago',
      icon: Activity,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'act-3',
      title: 'New Lead Auto-Assigned',
      desc: `Lead #1048 routed to ${branch.name} sales desk from Meta Click-to-Ad.`,
      time: '45m ago',
      icon: Zap,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      id: 'act-4',
      title: 'High-Priority SLA Escalation Resolved',
      desc: `Pending customer inquiry escalated and cleared by ${branch.manager_name || 'Branch Manager'}.`,
      time: '1h ago',
      icon: ShieldCheck,
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      id: 'act-5',
      title: 'Branch Shift Check-in Completed',
      desc: `${branch.employees_count || 8} staff checked in on time via WhatsApp Biometric GPS.`,
      time: '2h ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'act-6',
      title: 'Automated UPI Invoice Settled',
      desc: `Payment of ₹4,850 acknowledged with instant Razorpay webhook sync.`,
      time: '3h ago',
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 'act-7',
      title: 'Field Route Dispatched',
      desc: `Daily routing schedule pushed to ${branch.city} on-duty field technician team.`,
      time: '5h ago',
      icon: MapPin,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      id: 'act-8',
      title: 'Regional Revenue Milestone',
      desc: `Branch achieved 94% of monthly target (₹${((branch.customers_count || 450) * 85).toLocaleString()}).`,
      time: 'Yesterday',
      icon: TrendingUp,
      color: 'text-purple-500 bg-purple-50',
    },
  ];
};

export interface BranchCustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  segment: 'Enterprise VIP' | 'Premium Retainer' | 'Commercial' | 'Retail Client';
  totalSpent: string;
  conversationsCount: number;
  lastActive: string;
  status: 'Active' | 'Follow-up Due' | 'Contract Renewal';
  avatarInitials: string;
}

export const getBranchCustomers = (branch: BranchItem): BranchCustomerItem[] => {
  const branchName = (branch.name || '').trim().toLowerCase();
  const city = (branch.city || '').trim().toLowerCase();
  const prefix = (branch.code || 'BR').replace(/[^a-zA-Z0-9]/g, '');

  const storeCustomers = useQiyamStore.getState().customers || [];
  const source = storeCustomers.length > 0 ? storeCustomers : INITIAL_MULTI_BRANCH_CUSTOMERS;

  const matches = source.filter((c: any) => {
    const cBranch = (c.branch || '').toLowerCase();
    const cTags = Array.isArray(c.tags) ? c.tags.map((t: string) => String(t).toLowerCase()) : [];
    const cLoc = (c.location || c.address || '').toLowerCase();
    return (
      cBranch === branchName ||
      (cBranch && (cBranch.includes(branchName) || branchName.includes(cBranch))) ||
      cTags.some((t: string) => t === branchName || t.includes(branchName) || branchName.includes(t)) ||
      (city.length > 2 && cLoc.includes(city))
    );
  });

  if (matches.length > 0) {
    return matches.map((c: any) => {
      const initials = (c.name || 'CU')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0])
        .join('')
        .toUpperCase() || 'CU';

      return {
        id: String(c.id),
        name: c.name,
        phone: c.phone || c.phone_number || '',
        email: c.email || '',
        company: c.company || `${c.name} Enterprise`,
        segment: c.segment || 'Commercial',
        totalSpent: `₹${(Number(c.total_spent) || 28500).toLocaleString()}`,
        conversationsCount: (Number(c.jobs_count) || 2) * 6,
        lastActive: c.last_contact_date || 'Today',
        status: c.status === 'Customer' ? 'Active' : 'Follow-up Due',
        avatarInitials: initials,
      };
    });
  }

  return [
    {
      id: `${prefix}-CUST-101`,
      name: `Apex Logistics ${city}`,
      phone: '+91 98450 12890',
      email: `operations@apex-${city.toLowerCase().replace(/\s+/g, '')}.in`,
      company: 'Logistics & Supply Chain Hub',
      segment: 'Enterprise VIP',
      totalSpent: '₹1,45,000',
      conversationsCount: 142,
      lastActive: '12 mins ago',
      status: 'Active',
      avatarInitials: 'AL',
    },
    {
      id: `${prefix}-CUST-102`,
      name: `Malabar Retail Group`,
      phone: '+91 97440 88210',
      email: 'purchasing@malabarretail.com',
      company: 'Multi-outlet Retail Chain',
      segment: 'Enterprise VIP',
      totalSpent: '₹98,200',
      conversationsCount: 89,
      lastActive: '45 mins ago',
      status: 'Active',
      avatarInitials: 'MR',
    },
    {
      id: `${prefix}-CUST-103`,
      name: `Horizon Healthcare ${city}`,
      phone: '+91 94460 33410',
      email: `admin@horizon-${city.toLowerCase().replace(/\s+/g, '')}.org`,
      company: 'Healthcare & Diagnostics',
      segment: 'Premium Retainer',
      totalSpent: '₹76,500',
      conversationsCount: 64,
      lastActive: '2 hours ago',
      status: 'Active',
      avatarInitials: 'HH',
    },
    {
      id: `${prefix}-CUST-104`,
      name: `Zenith Realty Solutions`,
      phone: '+91 98950 55112',
      email: 'leads@zenithrealty.co.in',
      company: 'Commercial Real Estate',
      segment: 'Premium Retainer',
      totalSpent: '₹62,000',
      conversationsCount: 51,
      lastActive: '4 hours ago',
      status: 'Follow-up Due',
      avatarInitials: 'ZR',
    },
    {
      id: `${prefix}-CUST-105`,
      name: `TechnoPark Digital Labs`,
      phone: '+91 97470 77334',
      email: `contact@technopark-${city.toLowerCase().replace(/\s+/g, '')}.io`,
      company: 'IT Services & Tech Park',
      segment: 'Commercial',
      totalSpent: '₹48,900',
      conversationsCount: 38,
      lastActive: 'Yesterday 05:20 PM',
      status: 'Active',
      avatarInitials: 'TP',
    },
    {
      id: `${prefix}-CUST-106`,
      name: `Crescent Hospitality & Suites`,
      phone: '+91 98460 99881',
      email: 'reservations@crescenthospitality.com',
      company: 'Hotels & Tourism Group',
      segment: 'Retail Client',
      totalSpent: '₹39,400',
      conversationsCount: 29,
      lastActive: '02 Oct 2026',
      status: 'Contract Renewal',
      avatarInitials: 'CH',
    },
  ];
};

export type BranchSubPageId =
  | 'overview'
  | 'fleet-network'
  | 'workforce-roster'
  | 'customer-analytics'
  | 'operational-health'
  | 'documentation';

export const BRANCHES_SUBPAGE_STORAGE_KEY = 'whatsq_branches_active_subpage';

export const normalizeBranchSubPage = (raw: string | null | undefined): BranchSubPageId | null => {
  if (!raw) return null;
  const clean = String(raw).toLowerCase().trim();
  if (['overview', 'main', 'dashboard', 'branches'].includes(clean)) return 'overview';
  if (['fleet-network', 'fleet', 'network', 'regional-network', 'regional', 'branches-network'].includes(clean)) return 'fleet-network';
  if (['workforce-roster', 'workforce', 'roster', 'staff', 'employees'].includes(clean)) return 'workforce-roster';
  if (['customer-analytics', 'customer-reach', 'customers', 'reach', 'clients'].includes(clean)) return 'customer-analytics';
  if (['operational-health', 'health', 'uptime', 'telemetry', 'active'].includes(clean)) return 'operational-health';
  if (['documentation', 'docs', 'guide', 'manual'].includes(clean)) return 'documentation';
  return null;
};

export const getInitialBranchSubPage = (initialSubPage?: BranchSubPageId): BranchSubPageId => {
  // 1. Explicit prop (e.g. from dedicated route /branches/docs)
  const normalizedProp = normalizeBranchSubPage(initialSubPage);
  if (normalizedProp) return normalizedProp;

  // 2. Check URL pathname & query parameters
  if (typeof window !== 'undefined') {
    try {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('/branches/docs') || pathname.includes('/branches/documentation')) {
        return 'documentation';
      }
      if (pathname.includes('/branches/network') || pathname.includes('/branches/fleet')) {
        return 'fleet-network';
      }
      if (pathname.includes('/branches/roster') || pathname.includes('/branches/workforce')) {
        return 'workforce-roster';
      }
      if (pathname.includes('/branches/customers') || pathname.includes('/branches/reach')) {
        return 'customer-analytics';
      }
      if (pathname.includes('/branches/health') || pathname.includes('/branches/uptime')) {
        return 'operational-health';
      }

      const url = new URL(window.location.href);
      const queryParam =
        url.searchParams.get('sub') ||
        url.searchParams.get('view') ||
        url.searchParams.get('tab') ||
        url.searchParams.get('page');
      const normalizedQuery = normalizeBranchSubPage(queryParam);
      if (normalizedQuery) return normalizedQuery;

      // 3. Fallback to persisted localStorage
      const stored = localStorage.getItem(BRANCHES_SUBPAGE_STORAGE_KEY);
      const normalizedStored = normalizeBranchSubPage(stored);
      if (normalizedStored) return normalizedStored;
    } catch {}
  }

  // 4. Default to overview
  return 'overview';
};

export interface BranchesViewProps {
  initialSubPage?: BranchSubPageId;
}

export const BranchesView: React.FC<BranchesViewProps> = ({ initialSubPage }) => {
  const {
    activeTab,
    branches,
    employees,
    customers,
    addBranch,
    updateBranch,
    deleteBranch,
    requestGeneralConfirmation,
    addToast,
    setActiveTab,
    targetHighlightId,
    globalFilter,
    setCustomerBranchFilter,
  } = useQiyamStore();

  // Sub-pages triggered by Top Shortcuts & Documentation with full persistence
  const [activeSubPage, setActiveSubPage] = useState<BranchSubPageId>(() => getInitialBranchSubPage(initialSubPage));

  const handleSelectSubPage = React.useCallback((subId: BranchSubPageId) => {
    setActiveSubPage(subId);
    try {
      localStorage.setItem(BRANCHES_SUBPAGE_STORAGE_KEY, subId);
      if (subId === 'documentation') {
        if (activeTab !== 'branches-docs') {
          setActiveTab('branches-docs');
        }
        window.history.pushState(null, '', '/branches/docs');
      } else {
        if (activeTab !== 'branches') {
          setActiveTab('branches');
        }
        const targetUrl = subId === 'overview' ? '/branches' : `/branches?sub=${subId}`;
        window.history.pushState(null, '', targetUrl);
      }
    } catch {}
  }, [activeTab, setActiveTab]);

  // Listen for browser popstate (back/forward navigation)
  React.useEffect(() => {
    const handlePopState = () => {
      const resolved = getInitialBranchSubPage();
      if (resolved && resolved !== activeSubPage) {
        setActiveSubPage(resolved);
        try {
          localStorage.setItem(BRANCHES_SUBPAGE_STORAGE_KEY, resolved);
        } catch {}
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeSubPage]);

  // Keep URL address bar in sync on mount if restored from localStorage without search param
  React.useEffect(() => {
    try {
      const isDocs = window.location.pathname.includes('/branches/docs');
      const currentUrl = new URL(window.location.href);
      const currentSub = currentUrl.searchParams.get('sub');
      if (activeSubPage === 'documentation' && !isDocs) {
        window.history.replaceState(null, '', '/branches/docs');
      } else if (activeSubPage !== 'overview' && activeSubPage !== 'documentation' && currentSub !== activeSubPage) {
        window.history.replaceState(null, '', `/branches?sub=${activeSubPage}`);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    if (initialSubPage && initialSubPage !== activeSubPage) {
      setActiveSubPage(initialSubPage);
      try {
        localStorage.setItem(BRANCHES_SUBPAGE_STORAGE_KEY, initialSubPage);
      } catch {}
    }
  }, [initialSubPage]);

  // Branch Depth Details Drawer State
  const [selectedBranchForDepth, setSelectedBranchForDepth] = useState<BranchItem | null>(null);
  const [depthActiveTab, setDepthActiveTab] = useState<'overview' | 'staff' | 'customers' | 'automations' | 'activity'>('overview');
  const [drawerCustomerSearch, setDrawerCustomerSearch] = useState('');
  const [drawerCustomerPage, setDrawerCustomerPage] = useState(1);

  // Real-time synchronization of open depth drawer with store updates
  useEffect(() => {
    if (selectedBranchForDepth) {
      const updated = branches.find(
        (b) => b.id === selectedBranchForDepth.id || String(b.id) === String(selectedBranchForDepth.id)
      );
      if (updated) {
        setSelectedBranchForDepth(updated);
      } else {
        setSelectedBranchForDepth(null);
      }
    }
  }, [branches]);

  // Table Columns Mode: 'automation' (matching screenshot) or 'executive'
  const [tableMode, setTableMode] = useState<'automation' | 'executive'>('automation');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'employees' | 'customers' | 'code'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Floating Action Menu state with portal-style fixed positioning
  const [actionMenuState, setActionMenuState] = useState<{
    branch: BranchItem;
    top?: number;
    bottom?: number;
    right: number;
    openUpwards: boolean;
  } | null>(null);

  const handleOpenActionMenu = (e: React.MouseEvent<HTMLButtonElement>, branch: BranchItem) => {
    e.stopPropagation();
    if (actionMenuState?.branch.id === branch.id) {
      setActionMenuState(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 360; // Full menu height with header & 6 items
    const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    if (openUpwards) {
      setActionMenuState({
        branch,
        bottom: Math.max(12, window.innerHeight - rect.top + 6),
        right: Math.max(12, window.innerWidth - rect.right),
        openUpwards: true,
      });
    } else {
      setActionMenuState({
        branch,
        top: Math.max(12, rect.bottom + 6),
        right: Math.max(12, window.innerWidth - rect.right),
        openUpwards: false,
      });
    }
  };

  // Close floating action menu on window resize or scroll
  React.useEffect(() => {
    if (!actionMenuState) return;
    const handleClose = () => setActionMenuState(null);
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [actionMenuState]);

  // Edit Image Modal State
  const [editingImageBranch, setEditingImageBranch] = useState<BranchItem | null>(null);
  const [imageTab, setImageTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSavingImage, setIsSavingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add / Edit Branch Form Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    branch_type: 'Branch Office',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682016',
    manager_name: 'Rahul Mehta',
    manager_role: 'Branch Manager',
    employees_count: 8,
    customers_count: 450,
    status: 'Active',
    is_main: false,
    image: BRANCH_IMAGE_PRESETS[0].url,
  });

  // Calculate top metric stats
  const totalBranchesCount = branches.length;
  const totalEmployeesCount = branches.reduce((sum, b) => sum + (Number(b.employees_count) || 8), 0);
  const totalCustomersCount = branches.reduce((sum, b) => sum + (Number(b.customers_count) || 450), 0);
  const activeBranchesCount = branches.filter((b) => b.status?.toLowerCase() === 'active').length;

  // Dynamic Regional Breakdown for Fleet Network Subpage
  const dynamicStateBreakdown = useMemo(() => {
    const colorCycle = [
      'border-emerald-200 bg-emerald-50/50 text-emerald-800',
      'border-blue-200 bg-blue-50/50 text-blue-800',
      'border-purple-200 bg-purple-50/50 text-purple-800',
      'border-amber-200 bg-amber-50/50 text-amber-800',
      'border-rose-200 bg-rose-50/50 text-rose-800',
      'border-indigo-200 bg-indigo-50/50 text-indigo-800',
      'border-teal-200 bg-teal-50/50 text-teal-800',
      'border-cyan-200 bg-cyan-50/50 text-cyan-800',
    ];
    const stateColorPreset: Record<string, string> = {
      'kerala': 'border-emerald-200 bg-emerald-50/50 text-emerald-800',
      'karnataka': 'border-blue-200 bg-blue-50/50 text-blue-800',
      'maharashtra': 'border-purple-200 bg-purple-50/50 text-purple-800',
      'delhi': 'border-amber-200 bg-amber-50/50 text-amber-800',
      'delhi ncr': 'border-amber-200 bg-amber-50/50 text-amber-800',
      'tamil nadu': 'border-rose-200 bg-rose-50/50 text-rose-800',
      'telangana': 'border-indigo-200 bg-indigo-50/50 text-indigo-800',
    };

    const map: Record<string, { state: string; count: number; cities: string[]; color: string }> = {};

    branches.forEach((b) => {
      const stateName = (b.state || 'General Territory').trim();
      const key = stateName.toLowerCase();
      if (!map[key]) {
        map[key] = {
          state: stateName,
          count: 0,
          cities: [],
          color: stateColorPreset[key] || colorCycle[Object.keys(map).length % colorCycle.length],
        };
      }
      map[key].count += 1;
      if (b.city && !map[key].cities.includes(b.city)) {
        map[key].cities.push(b.city);
      }
    });

    return Object.values(map);
  }, [branches]);

  // Filter & Sort branches
  const filteredBranches = branches
    .filter((b) => {
      const activeStatus = globalFilter.status && globalFilter.status !== 'all' ? globalFilter.status : statusFilter;
      if (activeStatus !== 'all') {
        const isActive = b.status?.toLowerCase() === 'active';
        if (activeStatus.toLowerCase() === 'active' && !isActive) return false;
        if (activeStatus.toLowerCase() === 'inactive' && isActive) return false;
      }
      const effectiveQ = (searchQuery || globalFilter.query || '').trim().toLowerCase();
      if (!effectiveQ) return true;
      return (
        b.name.toLowerCase().includes(effectiveQ) ||
        b.code.toLowerCase().includes(effectiveQ) ||
        b.city.toLowerCase().includes(effectiveQ) ||
        (b.manager_name && b.manager_name.toLowerCase().includes(effectiveQ))
      );
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.name.localeCompare(b.name);
      else if (sortBy === 'employees') comp = (a.employees_count || 8) - (b.employees_count || 8);
      else if (sortBy === 'customers') comp = (a.customers_count || 450) - (b.customers_count || 450);
      else if (sortBy === 'code') comp = a.code.localeCompare(b.code);
      return sortOrder === 'asc' ? comp : -comp;
    });

  // Open Add Branch Modal
  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      branch_type: 'Branch Office',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682016',
      manager_name: 'Rahul Mehta',
      manager_role: 'Branch Manager',
      employees_count: 8,
      customers_count: 450,
      status: 'Active',
      is_main: false,
      image: BRANCH_IMAGE_PRESETS[Math.floor(Math.random() * BRANCH_IMAGE_PRESETS.length)].url,
    });
    setIsBranchModalOpen(true);
  };

  // Open Edit Branch Modal
  const handleOpenEditModal = (branch: BranchItem) => {
    setActionMenuState(null);
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      code: branch.code,
      branch_type: branch.branch_type || 'Branch Office',
      city: branch.city || 'Kochi',
      state: branch.state || 'Kerala',
      pincode: branch.pincode || '682016',
      manager_name: branch.manager_name || 'Rahul Mehta',
      manager_role: branch.manager_role || 'Branch Manager',
      employees_count: branch.employees_count || 8,
      customers_count: branch.customers_count || 450,
      status: branch.status || 'Active',
      is_main: Boolean(branch.is_main),
      image: branch.image || BRANCH_IMAGE_PRESETS[0].url,
    });
    setIsBranchModalOpen(true);
  };

  // Open Edit Image Modal
  const handleOpenImageModal = (branch: BranchItem) => {
    setActionMenuState(null);
    setEditingImageBranch(branch);
    setPreviewImageUrl(branch.image || BRANCH_IMAGE_PRESETS[0].url);
    setCustomUrlInput(branch.image || '');
    setImageTab('presets');
  };

  // Save Image from Image Modal
  const handleSaveImage = async () => {
    if (!editingImageBranch || !previewImageUrl) return;
    setIsSavingImage(true);
    try {
      await updateBranch(editingImageBranch.id, { image: previewImageUrl });
      setEditingImageBranch(null);
      addToast(`Updated photo for "${editingImageBranch.name}"`, 'success');
    } finally {
      setIsSavingImage(false);
    }
  };

  // Handle local file upload for branch image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit. Please choose a smaller file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewImageUrl(dataUrl);
      addToast('Image uploaded successfully! Click Save to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Save Branch Form (Create / Update)
  const handleSaveBranchForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) {
      addToast('Please enter a branch name', 'error');
      return;
    }

    if (editingBranch) {
      await updateBranch(editingBranch.id, branchForm);
    } else {
      await addBranch(branchForm);
    }
    setIsBranchModalOpen(false);
    setEditingBranch(null);
  };

  // Toggle Main Branch
  const handleToggleMainBranch = async (branch: BranchItem) => {
    setActionMenuState(null);
    const newStatus = !branch.is_main;
    await updateBranch(branch.id, { is_main: newStatus });
    addToast(`${branch.name} ${newStatus ? 'set as Main Branch' : 'unset from Main Branch'}`, 'success');
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (branch: BranchItem) => {
    setActionMenuState(null);
    const newStatus = branch.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
    await updateBranch(branch.id, { status: newStatus });
    addToast(`${branch.name} marked as ${newStatus}`, 'info');
  };

  // Delete Branch with confirmation
  const handleDeleteBranch = (branch: BranchItem) => {
    setActionMenuState(null);
    requestGeneralConfirmation({
      title: 'Remove Branch Location?',
      message: `Are you sure you want to remove the branch "${branch.name}"?`,
      description: 'This branch will be removed from your active operations and regional routing network.',
      variant: 'danger',
      icon: 'trash',
      confirmLabel: 'Remove Branch',
      cancelLabel: 'Cancel',
      itemBadge: {
        label: branch.name,
        sublabel: `${branch.city || ''}, ${branch.state || ''} • Code: ${branch.code || 'N/A'}`,
        badgeText: 'Branch',
      },
      onConfirm: async () => {
        await deleteBranch(branch.id);
        addToast(`Branch "${branch.name}" removed`, 'info');
      },
    });
  };

  return (
    <div
      className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans"
      onClick={() => {
        if (actionMenuState) setActionMenuState(null);
        if (isFilterDropdownOpen) setIsFilterDropdownOpen(false);
      }}
    >
      {/* View Header */}
      <Header
        title="Branches"
        subtitle="Manage all your business branches from one place."
        primaryActionLabel="Add Branch"
        onPrimaryAction={handleOpenAddModal}
      />

      <div className="p-3 sm:p-6 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* ── Sub-Page Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Branches', icon: Building2 },
            { id: 'fleet-network', label: 'Regional Network', icon: Globe, count: totalBranchesCount },
            { id: 'workforce-roster', label: 'Workforce Roster', icon: Users, count: totalEmployeesCount },
            { id: 'customer-analytics', label: 'Customer Reach', icon: UserCheck, count: totalCustomersCount },
            { id: 'operational-health', label: 'Operational Health', icon: Activity, count: `${activeBranchesCount} Active` },
            { id: 'documentation', label: 'Documentation & Guide', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectSubPage(tab.id as BranchSubPageId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeSubPage === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeSubPage === tab.id
                      ? 'bg-slate-800 text-emerald-400'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 1: OVERVIEW & BRANCHES (MAIN DASHBOARD)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'overview' && (
          <>
            {/* ── 1. Top 4 Stat Metric Cards (Clickable Shortcuts) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Branches */}
              <div
                onClick={() => {
                  handleSelectSubPage('fleet-network');
                  addToast('Opening Regional Branch Network...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-blue-400 cursor-pointer group"
                title="Click to view full Regional Network Directory"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Total Branches</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">{totalBranchesCount}</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+1 from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Employees */}
              <div
                onClick={() => {
                  handleSelectSubPage('workforce-roster');
                  addToast('Opening Branch Workforce Roster...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-purple-400 cursor-pointer group"
                title="Click to view Staff Roster across branches"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Total Employees</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">{totalEmployeesCount}</div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Customers */}
              <div
                onClick={() => {
                  handleSelectSubPage('customer-analytics');
                  addToast('Opening Customer Distribution Analytics...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-emerald-400 cursor-pointer group"
                title="Click to view Customer concentration by branch"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Total Customers</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">
                    {totalCustomersCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18% from last month</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Active Branches */}
              <div
                onClick={() => {
                  handleSelectSubPage('operational-health');
                  addToast('Opening Operational Health & Uptime Monitor...', 'info');
                }}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-rose-400 cursor-pointer group"
                title="Click to view Branch Uptime & System Health"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 truncate">Active Branches</div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 leading-tight">{activeBranchesCount}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{totalBranchesCount > 0 ? `${Math.round((activeBranchesCount / totalBranchesCount) * 100)}% operational` : 'Operational'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Branch List Container ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              {/* Table Header Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">Branch List</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Click branch name for depth details
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    View and manage your branches, operational automations, contacts and settings.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* View Mode Toggle: Operations vs Executive */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTableMode('automation')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tableMode === 'automation'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Operations View
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableMode('executive')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        tableMode === 'executive'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Executive View
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1 sm:w-52">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search branches..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFilterDropdownOpen(!isFilterDropdownOpen);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        statusFilter !== 'all'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filter</span>
                      {statusFilter !== 'all' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>

                    {isFilterDropdownOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 animate-in fade-in duration-100"
                      >
                        <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                          Status Filter
                        </div>
                        {(['all', 'active', 'inactive'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setStatusFilter(st);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs capitalize ${
                              statusFilter === st
                                ? 'bg-emerald-50 text-emerald-700 font-bold'
                                : 'hover:bg-slate-100 text-slate-700 font-medium'
                            }`}
                          >
                            <span>{st === 'all' ? 'All Statuses' : st}</span>
                            {statusFilter === st && <Check className="w-3 h-3 text-emerald-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sort Toggle & Direction */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const nextSort: Record<string, typeof sortBy> = {
                          name: 'employees',
                          employees: 'customers',
                          customers: 'code',
                          code: 'name',
                        };
                        setSortBy(nextSort[sortBy]);
                        addToast(`Sorted by ${nextSort[sortBy]}`, 'info');
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={`Click to change sorting field (current: ${sortBy})`}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span className="capitalize">Sort: {sortBy}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                        setSortOrder(nextOrder);
                        addToast(`Order: ${nextOrder === 'asc' ? 'Ascending (A-Z / Low-High)' : 'Descending (Z-A / High-Low)'}`, 'info');
                      }}
                      className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
                    >
                      {sortOrder === 'asc' ? 'ASC ↑' : 'DESC ↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Render */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[760px]">
                  {/* Table Header: Changes depending on tableMode */}
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                    {tableMode === 'automation' ? (
                      /* Columns exactly matching Image 1 */
                      <tr>
                        <th className="py-3 px-4">Branch Name</th>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">City / State</th>
                        <th className="py-3 px-4">Active Automations</th>
                        <th className="py-3 px-4">Tasks Automated</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Last Activity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    ) : (
                      /* Executive View Columns */
                      <tr>
                        <th className="py-3 px-4 w-10 text-center">#</th>
                        <th className="py-3 px-4">Branch Name</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Manager</th>
                        <th className="py-3 px-4">Employees</th>
                        <th className="py-3 px-4">Customers</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    )}
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredBranches.map((b, idx) => {
                      const isMain = Boolean(b.is_main) || b.branch_type === 'Head Office';
                      const branchImage = b.image || BRANCH_IMAGE_PRESETS[idx % BRANCH_IMAGE_PRESETS.length].url;
                      const isTarget = targetHighlightId === b.id || targetHighlightId === b.code || targetHighlightId === b.name;
                      const managerName = b.manager_name || (idx === 0 ? 'Rahul Mehta' : idx === 1 ? 'Suresh S' : 'Aneesh P');
                      const initials = managerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr
                          key={b.id}
                          className={`transition-colors hover:bg-slate-50/90 ${
                            isTarget ? 'bg-amber-50/60 ring-1 ring-amber-400' : ''
                          }`}
                        >
                          {/* ── Table Mode: Automation & Operations (Matching Image 1) ── */}
                          {tableMode === 'automation' ? (
                            <>
                              {/* 1. Branch Name (Clickable -> Depth Details) */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {/* Photo with 1-click edit */}
                                  <div
                                    className="relative group/thumb w-12 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenImageModal(b);
                                    }}
                                    title="Click to edit photo"
                                  >
                                    <img
                                      src={branchImage}
                                      alt={b.name}
                                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = BRANCH_IMAGE_PRESETS[0].url;
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <Camera className="w-3.5 h-3.5" />
                                    </div>
                                  </div>

                                  {/* Clickable Branch Title */}
                                  <div
                                    className="cursor-pointer group/name select-none"
                                    onClick={() => setSelectedBranchForDepth(b)}
                                    title="Click to view depth details"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover/name:text-emerald-600 transition-colors flex items-center gap-1.5">
                                        {b.name}
                                        <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                      </span>
                                      {isMain && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded-md text-[10px]">
                                          Main Branch
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {b.branch_type || 'Regional Hub'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Code */}
                              <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-xs">
                                {b.code}
                              </td>

                              {/* 3. City / State */}
                              <td className="py-3.5 px-4 font-medium text-slate-800 text-xs">
                                {b.city}, {b.state}
                              </td>

                              {/* 4. Active Automations */}
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                                {b.automations_count || 18} workflows
                              </td>

                              {/* 5. Tasks Automated (Bold Emerald) */}
                              <td className="py-3.5 px-4 font-bold text-emerald-600 text-xs">
                                {b.tasks_automated || 120} tasks
                              </td>

                              {/* 6. Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border tracking-wide uppercase ${
                                    b.status?.toLowerCase() === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      b.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{b.status || 'Active'}</span>
                                </span>
                              </td>

                              {/* 7. Last Activity */}
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                                {b.last_activity || '02 Oct 2026 10:30 AM'}
                              </td>
                            </>
                          ) : (
                            /* ── Table Mode: Executive View ── */
                            <>
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="relative group/thumb w-12 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenImageModal(b);
                                    }}
                                  >
                                    <img
                                      src={branchImage}
                                      alt={b.name}
                                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = BRANCH_IMAGE_PRESETS[0].url;
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <Camera className="w-3.5 h-3.5" />
                                    </div>
                                  </div>
                                  <div
                                    className="cursor-pointer group/name"
                                    onClick={() => setSelectedBranchForDepth(b)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover/name:text-emerald-600 transition-colors">
                                        {b.name}
                                      </span>
                                      {isMain && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded-md text-[10px]">
                                          Main
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400">{b.code} • {b.branch_type || 'Branch'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-semibold text-slate-800">{b.city}, {b.state}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{b.pincode || '682016'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 leading-tight">{managerName}</div>
                                    <div className="text-[10px] text-slate-400">{b.manager_role || 'Manager'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 font-bold text-slate-800">
                                {b.employees_count || 8}
                              </td>

                              <td className="py-3 px-4 font-bold text-slate-800">
                                {(b.customers_count || 450).toLocaleString()}
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                    b.status?.toLowerCase() === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      b.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{b.status || 'Active'}</span>
                                </span>
                              </td>
                            </>
                          )}

                          {/* 8. Actions (Common to both modes) */}
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => handleOpenActionMenu(e, b)}
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                actionMenuState?.branch.id === b.id
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              aria-label={`Open actions for ${b.name}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredBranches.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No branches found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  {filteredBranches.length === 0
                    ? 'No branches found matching your search'
                    : `Showing 1 to ${filteredBranches.length} of ${branches.length} branches`}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    disabled
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* ── 3. Bottom Section: Quick Actions & Need Help? ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Quick Actions Grid */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Add Branch</div>
                    <div className="text-[11px] text-slate-500">Create a new branch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToast('Opening Employee Management...', 'info');
                      setActiveTab('ops-employees');
                    }}
                    className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 hover:bg-purple-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Manage Employees</div>
                    <div className="text-[11px] text-slate-500">View and assign staff</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const targetBranch = branches.find((b) => b.is_main) || branches[0];
                      if (targetBranch) handleOpenEditModal(targetBranch);
                      else handleOpenAddModal();
                    }}
                    className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 hover:bg-blue-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Branch Settings</div>
                    <div className="text-[11px] text-slate-500">Configure branch details</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToast('Opening Financial Branch Reports...', 'info');
                      setActiveTab('finance-reports');
                    }}
                    className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/70 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Branch Reports</div>
                    <div className="text-[11px] text-slate-500">View performance reports</div>
                  </button>
                </div>
              </div>

              {/* Need Help? Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm">Need Help?</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Learn more about branch management, multi-tenant employee assignment, and regional office configurations.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectSubPage('documentation')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>View Documentation</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 2: REGIONAL NETWORK (TOTAL BRANCHES SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'fleet-network' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Network & Regional Distribution</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive operational directory of all {totalBranchesCount} business branches across India.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            {/* Regional Territory Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {dynamicStateBreakdown.map((reg) => {
                const isSelected = selectedStateFilter.toLowerCase() === reg.state.toLowerCase();
                const cityList = reg.cities.length > 0 ? reg.cities.join(', ') : 'Regional Network';
                return (
                  <div
                    key={reg.state}
                    onClick={() => {
                      setSelectedStateFilter((prev) => (prev.toLowerCase() === reg.state.toLowerCase() ? 'all' : reg.state));
                    }}
                    className={`p-3.5 rounded-2xl border ${reg.color} space-y-1 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xs ${
                      isSelected ? 'ring-2 ring-emerald-500 shadow-md font-bold' : ''
                    }`}
                    title={`Click to filter branches in ${reg.state}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-wider font-bold opacity-75">{reg.state}</div>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                    </div>
                    <div className="text-xl font-extrabold">{reg.count} <span className="text-xs font-medium">{reg.count === 1 ? 'branch' : 'branches'}</span></div>
                    <div className="text-[10px] opacity-75 truncate" title={cityList}>{cityList}</div>
                  </div>
                );
              })}
            </div>

            {/* Network Table (Image 1 Format) */}
            {(() => {
              const filteredFleetBranches = branches.filter((b) => {
                if (selectedStateFilter === 'all') return true;
                const filterLower = selectedStateFilter.toLowerCase();
                const bState = (b.state || '').toLowerCase();
                if (filterLower === 'delhi' || filterLower === 'delhi ncr') {
                  return bState.includes('delhi');
                }
                return bState.includes(filterLower);
              });

              return (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">All Network Branches ({filteredFleetBranches.length})</div>
                      {selectedStateFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSelectedStateFilter('all')}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Clear territory filter"
                        >
                          <span>Region: {selectedStateFilter}</span>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">Click any branch name to open complete dossiers</div>
                  </div>

                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left min-w-[760px]">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Branch Name</th>
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">City / State</th>
                          <th className="py-3 px-4">Active Automations</th>
                          <th className="py-3 px-4">Tasks Automated</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Last Activity</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredFleetBranches.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-500">
                              No branches found in {selectedStateFilter}.{' '}
                              <button
                                type="button"
                                onClick={() => setSelectedStateFilter('all')}
                                className="text-emerald-600 font-bold hover:underline cursor-pointer ml-1"
                              >
                                View all branches
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredFleetBranches.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBranchForDepth(b)}
                                  className="text-left font-bold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>{b.name}</span>
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                <div className="text-[10px] text-slate-400 font-medium">{b.branch_type || 'Branch Office'}</div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{b.code}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-800">{b.city}, {b.state}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">{b.automations_count || 18} workflows</td>
                              <td className="py-3.5 px-4 font-bold text-emerald-600">{b.tasks_automated || 120} tasks</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase ${
                                  b.status?.toLowerCase() === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${b.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  <span>{b.status || 'Active'}</span>
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{b.last_activity || '02 Oct 2026 10:30 AM'}</td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBranchForDepth(b)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-[11px] text-slate-700 transition-colors cursor-pointer"
                                  >
                                    Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenActionMenu(e, b)}
                                    className={`p-1 rounded-lg transition-all cursor-pointer ${
                                      actionMenuState?.branch.id === b.id
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                    }`}
                                    aria-label={`Open actions for ${b.name}`}
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 3: WORKFORCE ROSTER (TOTAL EMPLOYEES SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'workforce-roster' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Workforce & Human Capital</h3>
                  <p className="text-xs text-slate-500">
                    Distribution of {totalEmployeesCount} active staff members across management, sales, and operations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ops-employees');
                  addToast('Opening Employee Management...', 'info');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Open Full HR Suite</span>
              </button>
            </div>

            {/* Department Split Progress & KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Total Workforce</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{totalEmployeesCount}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">100% active contracts</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">On Duty Today</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{Math.round(totalEmployeesCount * 0.85)}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Checked in via GPS</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Avg Rating</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">4.85 ★</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Based on 1,420 customer reviews</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Attendance SLA</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">98.4%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">On-time rate this month</div>
              </div>
            </div>

            {/* Department Breakdown Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Workforce Department Allocation</span>
                <span className="text-slate-400 font-normal">Sales • Support • Operations</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div style={{ width: '45%' }} className="bg-blue-500" title="Sales: 45%" />
                <div style={{ width: '30%' }} className="bg-purple-500" title="WhatsApp Support: 30%" />
                <div style={{ width: '25%' }} className="bg-emerald-500" title="Field Operations: 25%" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="text-slate-600"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5" />Sales (45%)</div>
                <div className="text-slate-600"><span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5" />Support & Chat (30%)</div>
                <div className="text-slate-600"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />Operations (25%)</div>
              </div>
            </div>

            {/* Branch Roster Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-800">
                Staff Roster by Branch Location
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee / Leader</th>
                      <th className="py-3 px-4">Branch Location</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Shift Status</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">Direct Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {branches.map((b, idx) => {
                      const staffList = getBranchStaff(b);
                      const staff = staffList[0] || {
                        name: b.manager_name || 'Branch Manager',
                        role: b.manager_role || 'Operations Lead',
                        department: 'Management',
                        phone: b.phone || '+91 495 276 5400',
                        status: 'On Duty',
                        rating: 4.8,
                      };
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {staff.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{staff.name}</div>
                                <div className="text-[10px] text-slate-400">{staff.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{b.name} ({b.city})</td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">{staff.department}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{staff.phone}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{staff.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">{staff.rating} ★</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setDepthActiveTab('staff');
                                setSelectedBranchForDepth(b);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 font-bold text-[11px] text-slate-700 transition-colors cursor-pointer"
                            >
                              View Team ({staffList.length})
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 4: CUSTOMER REACH (TOTAL CUSTOMERS SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'customer-analytics' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Customer Distribution & Regional Reach</h3>
                  <p className="text-xs text-slate-500">
                    Territory breakdown of {totalCustomersCount.toLocaleString()} active customer accounts across branches.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomerBranchFilter(null);
                  setActiveTab('crm-customers');
                  addToast(`Opening Full CRM Directory (${totalCustomersCount.toLocaleString()} accounts across all branches)...`, 'info');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Open Full CRM Directory</span>
              </button>
            </div>

            {/* 4 Customer KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Active Accounts</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{totalCustomersCount.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">+18% expansion rate</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">VIP Clients</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{Math.round(totalCustomersCount * 0.12)}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">High lifetime value</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Average Contract</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">₹28,500</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Per service cycle</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">WhatsApp Retention</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">94.2%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Repeat booking score</div>
              </div>
            </div>

            {/* Customer Territory Progress */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Customer Volume Concentration by Branch</span>
                <span className="text-emerald-600 font-semibold">Total: {totalCustomersCount.toLocaleString()} Accounts</span>
              </div>
              <div className="space-y-2.5">
                {branches.map((b) => {
                  const share = Math.round(((b.customers_count || 450) / Math.max(totalCustomersCount, 1)) * 100);
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setDepthActiveTab('customers');
                            setSelectedBranchForDepth(b);
                          }}
                          className="font-bold text-slate-800 hover:text-emerald-600 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{b.name} ({b.city})</span>
                          <Eye className="w-3 h-3 text-slate-400" />
                        </button>
                        <span className="text-slate-500 font-mono">{(b.customers_count || 450).toLocaleString()} clients ({share}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div style={{ width: `${share}%` }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 5: OPERATIONAL HEALTH (ACTIVE BRANCHES SHORTCUT)
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'operational-health' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Back Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectSubPage('overview')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Back to Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch Operational Health & System Uptime</h3>
                  <p className="text-xs text-slate-500">
                    Live telemetry across branch automation nodes, Cloud API connections, and sync latency.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('active');
                  handleSelectSubPage('overview');
                  addToast('Filtered to active branches on dashboard', 'success');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Show Active Branches Only</span>
              </button>
            </div>

            {/* Health KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Fleet Uptime</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">99.98%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Zero downtime this week</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Webhook Latency</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">42 ms</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Cloud API ping response</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Automation Success</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">99.6%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Across 1,226 tasks</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-semibold text-slate-500">Active Nodes</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{activeBranchesCount} of {totalBranchesCount}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Live synchronized</div>
              </div>
            </div>

            {/* Branch Health Telemetry Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-800">
                Live Branch Sync & Automation Telemetry
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Branch Node</th>
                      <th className="py-3 px-4">Operational Status</th>
                      <th className="py-3 px-4">Cloud API Latency</th>
                      <th className="py-3 px-4">Active Workflows</th>
                      <th className="py-3 px-4">Automated Tasks</th>
                      <th className="py-3 px-4">Last Telemetry Ping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {branches.map((b, idx) => {
                      const isActive = b.status?.toLowerCase() === 'active';
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <button
                              type="button"
                              onClick={() => setSelectedBranchForDepth(b)}
                              className="text-left font-bold text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{b.name}</span>
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <div className="text-[10px] font-mono text-slate-400">{b.code} • {b.city}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                              isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span>{isActive ? 'Operational' : 'Offline / Inactive'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {isActive ? `${38 + (idx * 3)} ms` : '—'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{b.automations_count || 18} workflows</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">{b.tasks_automated || 120} tasks</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">Just now</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUB-PAGE 6: DEDICATED BRANCH DOCUMENTATION & GUIDES
            ══════════════════════════════════════════════════════ */}
        {activeSubPage === 'documentation' && (
          <BranchDocumentationView
            onBack={() => handleSelectSubPage('overview')}
            onNavigateSubPage={(sub) => handleSelectSubPage(sub)}
            onOpenAddBranch={handleOpenAddModal}
          />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          BRANCH DEPTH DETAILS DRAWER (CLICKING BRANCH NAME)
          ══════════════════════════════════════════════════════ */}
      {selectedBranchForDepth && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedBranchForDepth(null)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Hero Header with Banner & Building Thumbnail */}
            <div className="relative h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedBranchForDepth.image || BRANCH_IMAGE_PRESETS[0].url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Top Drawer Controls */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 font-bold">
                    {selectedBranchForDepth.code}
                  </span>
                  {selectedBranchForDepth.is_main && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Headquarters
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBranchForDepth(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Quick Status */}
              <div className="relative z-10 flex items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="relative group/thumb w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-slate-800 shrink-0 cursor-pointer"
                    onClick={() => handleOpenImageModal(selectedBranchForDepth)}
                    title="Click to edit branch photo"
                  >
                    <img
                      src={selectedBranchForDepth.image || BRANCH_IMAGE_PRESETS[0].url}
                      alt={selectedBranchForDepth.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedBranchForDepth.name}</h2>
                    <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedBranchForDepth.city}, {selectedBranchForDepth.state}</span>
                      <span>•</span>
                      <span>{selectedBranchForDepth.branch_type || 'Regional Hub'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedBranchForDepth)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedBranchForDepth.status?.toLowerCase() === 'active'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedBranchForDepth.status?.toLowerCase() === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span>{selectedBranchForDepth.status || 'Active'}</span>
                </button>
              </div>
            </div>

            {/* 4 Top KPI Tiles */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/70 p-2 sm:p-2.5 text-center divide-x divide-slate-200/80 gap-1">
              <button
                type="button"
                onClick={() => setDepthActiveTab('staff')}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer text-center group ${
                  depthActiveTab === 'staff'
                    ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500 shadow-xs'
                    : 'hover:bg-white hover:shadow-2xs text-slate-700'
                }`}
                title="Click to view Staff Roster for this branch"
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Employees</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{selectedBranchForDepth.employees_count || 8}</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>On Duty</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDepthActiveTab('customers')}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer text-center group ${
                  depthActiveTab === 'customers'
                    ? 'bg-purple-50 text-purple-800 ring-2 ring-purple-500 shadow-xs'
                    : 'hover:bg-white hover:shadow-2xs text-slate-700'
                }`}
                title="Click to view Customer Accounts & CRM reach for this branch"
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Customers</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{(selectedBranchForDepth.customers_count || 450).toLocaleString()}</div>
                <div className="text-[10px] text-purple-600 font-bold">Active CRM</div>
              </button>

              <button
                type="button"
                onClick={() => setDepthActiveTab('automations')}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer text-center group ${
                  depthActiveTab === 'automations'
                    ? 'bg-blue-50 text-blue-800 ring-2 ring-blue-500 shadow-xs'
                    : 'hover:bg-white hover:shadow-2xs text-slate-700'
                }`}
                title="Click to view Active Workflows for this branch"
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Workflows</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{selectedBranchForDepth.automations_count || 18}</div>
                <div className="text-[10px] text-blue-600 font-bold">Active Flows</div>
              </button>

              <button
                type="button"
                onClick={() => setDepthActiveTab('activity')}
                className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer text-center group ${
                  depthActiveTab === 'activity'
                    ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500 shadow-xs'
                    : 'hover:bg-white hover:shadow-2xs text-slate-700'
                }`}
                title="Click to view Automated Tasks Run & Audit Log for this branch"
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Tasks Run</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5">{selectedBranchForDepth.tasks_automated || 120}</div>
                <div className="text-[10px] text-slate-500 font-medium">Automated</div>
              </button>
            </div>

            {/* Drawer Tabs Header */}
            <div className="flex border-b border-slate-200 bg-white px-5 pt-2 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
              {[
                { id: 'overview', label: 'Overview & Location' },
                { id: 'staff', label: 'Staff Roster', count: getBranchStaff(selectedBranchForDepth).length },
                { id: 'customers', label: 'Customers CRM', count: selectedBranchForDepth.customers_count || 450 },
                { id: 'automations', label: 'Active Workflows', count: getBranchWorkflows(selectedBranchForDepth).length },
                { id: 'activity', label: 'Tasks & Audit', count: selectedBranchForDepth.tasks_automated || 120 },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDepthActiveTab(t.id as any)}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    depthActiveTab === t.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        depthActiveTab === t.id
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {typeof t.count === 'number' && t.count > 999 ? t.count.toLocaleString() : t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Drawer Tabs Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white text-xs">
              {/* TAB 1: OVERVIEW & LOCATION */}
              {depthActiveTab === 'overview' && (
                <div className="space-y-4">
                  {/* Location & Address Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Physical Location & Address</span>
                      </div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedBranchForDepth.name} ${selectedBranchForDepth.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Open Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-slate-700 leading-relaxed font-medium">
                      {selectedBranchForDepth.address || `${selectedBranchForDepth.name}, Central Business District, ${selectedBranchForDepth.city}, ${selectedBranchForDepth.state} - ${selectedBranchForDepth.pincode || '682016'}`}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-500 font-mono">
                      <div>City: <strong className="text-slate-800">{selectedBranchForDepth.city}</strong></div>
                      <div>State: <strong className="text-slate-800">{selectedBranchForDepth.state}</strong></div>
                      <div>PIN: <strong className="text-slate-800">{selectedBranchForDepth.pincode || '682016'}</strong></div>
                      <div>Country: <strong className="text-slate-800">India</strong></div>
                    </div>
                  </div>

                  {/* Branch Leadership Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Branch Leadership & Management</span>
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {(selectedBranchForDepth.manager_name || 'RM').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {selectedBranchForDepth.manager_name || 'Rahul Mehta'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {selectedBranchForDepth.manager_role || 'Branch Manager'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${selectedBranchForDepth.phone || '+914952765400'}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Call Manager"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`mailto:${selectedBranchForDepth.email || 'manager@qiyamventures.com'}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Email Manager"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Communication & Operating Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>Branch Contact</span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div>Phone: <strong className="text-slate-800">{selectedBranchForDepth.phone || '+91 495 276 5400'}</strong></div>
                        <div>Email: <strong className="text-slate-800">{selectedBranchForDepth.email || 'branch@qiyamventures.com'}</strong></div>
                        <div>WhatsApp: <strong className="text-emerald-700">+91 98765 43210 (Active)</strong></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>Working Schedule</span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div>Days: <strong className="text-slate-800">Monday — Saturday</strong></div>
                        <div>Hours: <strong className="text-slate-800">08:30 AM — 07:00 PM</strong></div>
                        <div>Sunday: <strong className="text-slate-500">Emergency Support Only</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STAFF ROSTER */}
              {depthActiveTab === 'staff' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800">
                      Assigned Branch Staff ({getBranchStaff(selectedBranchForDepth).length})
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('ops-employees');
                        setSelectedBranchForDepth(null);
                      }}
                      className="text-emerald-700 hover:underline font-bold text-xs flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Manage in HR</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {getBranchStaff(selectedBranchForDepth).map((st, i) => (
                      <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[11px] text-slate-500">{st.role} • {st.department}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{st.status}</span>
                          </span>
                          <span className="text-amber-600 font-bold text-xs">{st.rating} ★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMERS & CRM REACH */}
              {depthActiveTab === 'customers' && (() => {
                const allBranchCustomers = getBranchCustomers(selectedBranchForDepth);
                const qClean = drawerCustomerSearch.trim().toLowerCase();
                const filteredBranchCustomers = qClean
                  ? allBranchCustomers.filter(
                      (c) =>
                        c.name.toLowerCase().includes(qClean) ||
                        c.company.toLowerCase().includes(qClean) ||
                        c.phone.replace(/\D/g, '').includes(qClean.replace(/\D/g, ''))
                    )
                  : allBranchCustomers;
                const drawerPageSize = 8;
                const totalDrawerPages = Math.max(1, Math.ceil(filteredBranchCustomers.length / drawerPageSize));
                const paginatedBranchCustomers = filteredBranchCustomers.slice(
                  (drawerCustomerPage - 1) * drawerPageSize,
                  drawerCustomerPage * drawerPageSize
                );

                return (
                  <div className="space-y-4">
                    {/* Top Bar with Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          Customer Accounts for {selectedBranchForDepth.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {(selectedBranchForDepth.customers_count || 450).toLocaleString()} customer contacts active across {selectedBranchForDepth.city} territory.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerBranchFilter(selectedBranchForDepth.name);
                          setActiveTab('crm-customers');
                          setSelectedBranchForDepth(null);
                          addToast(`Opening Full CRM for ${selectedBranchForDepth.name} (${(selectedBranchForDepth.customers_count || 450).toLocaleString()} accounts)...`, 'info');
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 self-start sm:self-auto transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Open Full CRM</span>
                      </button>
                    </div>

                    {/* 4 Mini CRM Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Accounts</div>
                        <div className="text-base font-extrabold text-slate-900 mt-0.5">{(selectedBranchForDepth.customers_count || 450).toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">100% Geofenced</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Enterprise VIPs</div>
                        <div className="text-base font-extrabold text-purple-700 mt-0.5">{Math.round((selectedBranchForDepth.customers_count || 450) * 0.12)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Priority SLA</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Reach</div>
                        <div className="text-base font-extrabold text-blue-700 mt-0.5">98.4%</div>
                        <div className="text-[10px] text-slate-500 font-medium">Verified Number</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Avg Monthly LTV</div>
                        <div className="text-base font-extrabold text-emerald-600 mt-0.5">₹28,500</div>
                        <div className="text-[10px] text-slate-500 font-medium">Per Service Cycle</div>
                      </div>
                    </div>

                    {/* Search inside drawer */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={drawerCustomerSearch}
                        onChange={(e) => {
                          setDrawerCustomerSearch(e.target.value);
                          setDrawerCustomerPage(1);
                        }}
                        placeholder={`Search ${allBranchCustomers.length} accounts in ${selectedBranchForDepth.city}...`}
                        className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                      />
                      {drawerCustomerSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerCustomerSearch('');
                            setDrawerCustomerPage(1);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Key Accounts List Header with Pagination Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-700 text-xs">
                        Accounts Directory ({filteredBranchCustomers.length})
                      </div>
                      {filteredBranchCustomers.length > drawerPageSize && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={drawerCustomerPage === 1}
                            onClick={() => setDrawerCustomerPage((p) => Math.max(1, p - 1))}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[11px] font-bold cursor-pointer transition flex items-center gap-0.5"
                          >
                            <ChevronLeft className="w-3 h-3" />
                            <span>Prev</span>
                          </button>
                          <span className="font-bold text-slate-600 text-[11px]">
                            {drawerCustomerPage} / {totalDrawerPages}
                          </span>
                          <button
                            type="button"
                            disabled={drawerCustomerPage >= totalDrawerPages}
                            onClick={() => setDrawerCustomerPage((p) => Math.min(totalDrawerPages, p + 1))}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[11px] font-bold cursor-pointer transition flex items-center gap-0.5"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Customer Cards */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                      {paginatedBranchCustomers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No client accounts matching &quot;{drawerCustomerSearch}&quot;
                        </div>
                      ) : (
                        paginatedBranchCustomers.map((cust) => (
                          <div key={cust.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {cust.avatarInitials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs">{cust.name}</span>
                                  <span className={`px-2 py-0.2 rounded-md font-bold text-[9px] ${
                                    cust.segment === 'Enterprise VIP'
                                      ? 'bg-purple-100 text-purple-800'
                                      : cust.segment === 'Premium Retainer'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {cust.segment}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {cust.company} • <span className="font-mono">{cust.phone}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                              <div className="text-left sm:text-right">
                                <div className="font-bold text-slate-800 text-xs">{cust.totalSpent}</div>
                                <div className="text-[10px] text-slate-400">{cust.conversationsCount} chats • {cust.lastActive}</div>
                              </div>

                              <a
                                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                title="Start WhatsApp chat"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 4: WORKFLOWS & AUTOMATIONS */}
              {depthActiveTab === 'automations' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800">Active Automations for {selectedBranchForDepth.name}</div>
                    <span className="text-emerald-600 font-bold text-xs">{getBranchWorkflows(selectedBranchForDepth).length} Active Workflows</span>
                  </div>

                  <div className="space-y-2.5">
                    {getBranchWorkflows(selectedBranchForDepth).map((wf) => (
                      <div key={wf.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold text-slate-900">{wf.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{wf.description}</p>
                          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                            <span>Trigger: {wf.trigger}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-bold">{wf.runs} runs this month</span>
                            <span>•</span>
                            <span>Success: {wf.successRate}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE ACTIVITY & AUTOMATED TASKS */}
              {depthActiveTab === 'activity' && (
                <div className="space-y-4">
                  {/* Automated Tasks & Telemetry Metrics */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>Automated Task Engine & Telemetry</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Cloud API Active
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Automated Tasks</div>
                        <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                          {selectedBranchForDepth.tasks_automated || 120}
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium">This month</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Success Rate</div>
                        <div className="text-base font-extrabold text-slate-900 mt-0.5">99.8%</div>
                        <div className="text-[9px] text-emerald-600 font-medium">Zero errors</div>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Avg Latency</div>
                        <div className="text-base font-extrabold text-blue-600 mt-0.5">42 ms</div>
                        <div className="text-[9px] text-slate-500 font-medium">Regional Edge</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800">Recent Branch Activity & System Events</div>
                      <span className="text-slate-500 font-semibold text-xs">{getBranchActivity(selectedBranchForDepth).length} Events Logged</span>
                    </div>
                    <div className="space-y-2.5">
                      {getBranchActivity(selectedBranchForDepth).map((act) => (
                        <div key={act.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                            <act.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{act.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">{act.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const b = selectedBranchForDepth;
                  setSelectedBranchForDepth(null);
                  handleDeleteBranch(b);
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Branch</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('finance-reports');
                    setSelectedBranchForDepth(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Branch Financials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const b = selectedBranchForDepth;
                    setSelectedBranchForDepth(null);
                    handleOpenEditModal(b);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Dedicated Edit Branch Photo Modal ── */}
      {editingImageBranch && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Branch Photo</h3>
                  <p className="text-[11px] text-slate-500">
                    Update the building image for <strong className="text-slate-800">{editingImageBranch.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingImageBranch(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-40 shadow-inner group">
              <img
                src={previewImageUrl || BRANCH_IMAGE_PRESETS[0].url}
                alt={editingImageBranch.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BRANCH_IMAGE_PRESETS[0].url;
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{editingImageBranch.name}</div>
                  <div className="text-[10px] text-slate-300">{editingImageBranch.city}, {editingImageBranch.state}</div>
                </div>
                <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold">
                  Photo Preview
                </span>
              </div>
            </div>

            {/* Photo Selection Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setImageTab('presets')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  imageTab === 'presets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Curated Presets
              </button>
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  imageTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  imageTab === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Custom URL
              </button>
            </div>

            {/* Tab 1: Presets Grid */}
            {imageTab === 'presets' && (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                {BRANCH_IMAGE_PRESETS.map((preset) => {
                  const isSelected = previewImageUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPreviewImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 group ${
                        isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                        <span className="text-[9px] font-bold text-white leading-tight truncate">
                          {preset.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Upload File */}
            {imageTab === 'upload' && (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-700">Choose a photo from your computer</div>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP up to 5MB</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Browse Files
                </button>
              </div>
            )}

            {/* Tab 3: Custom URL */}
            {imageTab === 'url' && (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Direct Image Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/building.jpg"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) setPreviewImageUrl(customUrlInput.trim());
                    }}
                    className="px-3 py-2 bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
                  >
                    Preview
                  </button>
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingImageBranch(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingImage || !previewImageUrl}
                onClick={handleSaveImage}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Photo...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Add / Edit Branch Form Modal ── */}
      {isBranchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingBranch ? `Edit ${editingBranch.name}` : 'Add New Branch'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure branch office details, location, manager, and staff capacity.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranchForm} className="space-y-3.5">
              {/* Branch Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    placeholder="e.g. Calicut South Hub"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    placeholder="e.g. BR-008"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Branch Type & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Type</label>
                  <select
                    value={branchForm.branch_type}
                    onChange={(e) => setBranchForm({ ...branchForm, branch_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Head Office">Head Office</option>
                    <option value="Regional Office">Regional Office</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Service Center">Service Center</option>
                    <option value="Satellite Depot">Satellite Depot</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Postal Code (PIN)</label>
                  <input
                    type="text"
                    value={branchForm.pincode}
                    onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })}
                    placeholder="e.g. 682016"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    placeholder="e.g. Kochi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    placeholder="e.g. Kerala"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Manager Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Branch Manager Name</label>
                  <input
                    type="text"
                    value={branchForm.manager_name}
                    onChange={(e) => setBranchForm({ ...branchForm, manager_name: e.target.value })}
                    placeholder="e.g. Suresh S"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Manager Role</label>
                  <input
                    type="text"
                    value={branchForm.manager_role}
                    onChange={(e) => setBranchForm({ ...branchForm, manager_role: e.target.value })}
                    placeholder="e.g. Branch Manager"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Capacity: Employees & Customers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Employees</label>
                  <input
                    type="number"
                    min={1}
                    value={branchForm.employees_count}
                    onChange={(e) => setBranchForm({ ...branchForm, employees_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Active Customers</label>
                  <input
                    type="number"
                    min={0}
                    value={branchForm.customers_count}
                    onChange={(e) => setBranchForm({ ...branchForm, customers_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Photo Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Branch Building Photo</label>
                <div className="flex items-center gap-3">
                  <img
                    src={branchForm.image || BRANCH_IMAGE_PRESETS[0].url}
                    alt="Preview"
                    className="w-14 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {BRANCH_IMAGE_PRESETS.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBranchForm({ ...branchForm, image: p.url })}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          branchForm.image === p.url
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkboxes: Main Branch & Status */}
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={branchForm.is_main}
                    onChange={(e) => setBranchForm({ ...branchForm, is_main: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-700">Mark as Main Branch / Headquarters</span>
                </label>

                <select
                  value={branchForm.status}
                  onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value })}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 cursor-pointer"
                >
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Floating Action Menu Dropdown Portal (Decoupled from table overflow) ── */}
      {actionMenuState && (
        <div className="fixed inset-0 z-50 pointer-events-none select-none">
          {/* Backdrop to dismiss when clicking outside */}
          <div
            className="fixed inset-0 pointer-events-auto bg-black/10 backdrop-blur-[0.5px] transition-opacity animate-in fade-in duration-100"
            onClick={() => setActionMenuState(null)}
          />

          {/* Menu Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              top: actionMenuState.top !== undefined ? `${actionMenuState.top}px` : undefined,
              bottom: actionMenuState.bottom !== undefined ? `${actionMenuState.bottom}px` : undefined,
              right: `${actionMenuState.right}px`,
              maxHeight: 'calc(100vh - 24px)',
            }}
            className="fixed pointer-events-auto z-50 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 ring-1 ring-slate-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left flex flex-col"
          >
            {/* Header: Branch Info Context */}
            <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100/70 border-b border-slate-100 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                  {actionMenuState.branch.image ? (
                    <img
                      src={actionMenuState.branch.image}
                      alt={actionMenuState.branch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                      {actionMenuState.branch.name}
                    </span>
                    {actionMenuState.branch.is_main && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[9px] uppercase tracking-wide shrink-0">
                        HQ
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                    <span className="font-mono text-slate-600 font-semibold">{actionMenuState.branch.code}</span>
                    <span>•</span>
                    <span>{actionMenuState.branch.city || 'Regional Office'}</span>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border shrink-0 ${
                  actionMenuState.branch.status?.toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    actionMenuState.branch.status?.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{actionMenuState.branch.status || 'Active'}</span>
              </span>
            </div>

            {/* Actions List */}
            <div className="p-1.5 space-y-0.5 overflow-y-auto max-h-[360px] scrollbar-thin">
              {/* 1. View Depth Details */}
              <button
                type="button"
                onClick={() => {
                  const b = actionMenuState.branch;
                  setActionMenuState(null);
                  setSelectedBranchForDepth(b);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-emerald-50/70 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-100/70 transition-all">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors">
                    View Depth Details
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-emerald-600/80 transition-colors truncate">
                    Workforce roster, stats & automations
                  </div>
                </div>
              </button>

              {/* 2. Edit Details */}
              <button
                type="button"
                onClick={() => {
                  const b = actionMenuState.branch;
                  handleOpenEditModal(b);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-slate-200/70 transition-all">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-slate-900 transition-colors">
                    Edit Details
                  </div>
                  <div className="text-[10px] text-slate-400 transition-colors truncate">
                    Update location, contacts & role
                  </div>
                </div>
              </button>

              {/* 3. Change Photo */}
              <button
                type="button"
                onClick={() => {
                  const b = actionMenuState.branch;
                  handleOpenImageModal(b);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-blue-50/70 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-100/70 transition-all">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700 transition-colors">
                    Change Photo
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-blue-600/80 transition-colors truncate">
                    Upload image or pick preset
                  </div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* 4. Set/Unset Main Branch */}
              <button
                type="button"
                onClick={() => {
                  const b = actionMenuState.branch;
                  handleToggleMainBranch(b);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-amber-50/70 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-100/70 transition-all">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-amber-800 transition-colors">
                    {actionMenuState.branch.is_main ? 'Unset Main Branch' : 'Set as Main Branch'}
                  </div>
                  <div className="text-[10px] text-slate-400 group-hover:text-amber-700/80 transition-colors truncate">
                    {actionMenuState.branch.is_main ? 'Downgrade to regional hub' : 'Designate company headquarters'}
                  </div>
                </div>
              </button>

              {/* 5. Toggle Status */}
              <button
                type="button"
                onClick={() => {
                  const b = actionMenuState.branch;
                  handleToggleStatus(b);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-100/70 group transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all ${
                  actionMenuState.branch.status?.toLowerCase() === 'active'
                    ? 'bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-slate-200/70'
                    : 'bg-emerald-50 border-emerald-200/80 text-emerald-600 group-hover:bg-emerald-100/70'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 group-hover:text-slate-900 transition-colors">
                    {actionMenuState.branch.status?.toLowerCase() === 'active' ? 'Mark Inactive' : 'Mark Active'}
                  </div>
                  <div className="text-[10px] text-slate-400 transition-colors truncate">
                    {actionMenuState.branch.status?.toLowerCase() === 'active' ? 'Temporarily pause branch' : 'Enable live branch operations'}
                  </div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* 6. Delete Branch */}
              <button
                type="button"
                onClick={() => {
                  const b = actionMenuState.branch;
                  handleDeleteBranch(b);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-rose-50 text-rose-600 group transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-rose-100/80 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-rose-600 group-hover:text-rose-700 transition-colors">
                    Delete Branch
                  </div>
                  <div className="text-[10px] text-rose-400 group-hover:text-rose-500 transition-colors truncate">
                    Permanently remove from network
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


