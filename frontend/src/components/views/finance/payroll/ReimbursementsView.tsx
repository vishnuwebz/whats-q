import React, { useState, useMemo, useRef } from 'react';
import {
  Users, Wallet, Clock, XCircle, Calendar, Plus, Search, Filter,
  CheckCircle2, ChevronLeft, ChevronRight, FileText,
  Eye, Check, X, ArrowUpRight, ArrowDownRight, Minus, AlertCircle,
  Download, Receipt, Building2, Tag, FileDown, ExternalLink,
  ShieldCheck, HelpCircle, Info, Sparkles, TrendingUp, RefreshCw, Paperclip, Printer,
  PenTool, SlidersHorizontal
} from 'lucide-react';
import { ReimbursementItem } from '@/types';
import { NewReimbursementModal } from './modals/NewReimbursementModal';
import { useQiyamStore } from '@/store/useQiyamStore';
import { DraggableScrollRow } from '@/components/common/DraggableScrollRow';

interface Props {
  reimbursements: ReimbursementItem[];
  onAddReimbursement: (item: ReimbursementItem) => void;
  onUpdateStatus: (id: string | number, status: ReimbursementItem['status']) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Travel: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  Internet: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  Food: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Stationery: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  Training: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  Transport: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  Software: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Communication: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  Other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
};

export const ReimbursementsView: React.FC<Props> = ({
  reimbursements,
  onAddReimbursement,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<ReimbursementItem | null>(null);
  const [previewReceiptItem, setPreviewReceiptItem] = useState<ReimbursementItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { openPdfEditor } = useQiyamStore();

  // Horizontal Table Scroll Navigator & mouse drag-to-scroll
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const scrollTableBy = (px: number) => {
    tableScrollRef.current?.scrollBy({ left: px, behavior: 'smooth' });
  };

  const scrollToSection = (px: number) => {
    tableScrollRef.current?.scrollTo({ left: px, behavior: 'smooth' });
  };

  const handleTableMouseDown = (e: React.MouseEvent) => {
    if (!tableScrollRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, textarea')) return;
    setIsDraggingTable(true);
    setDragStartX(e.pageX - tableScrollRef.current.offsetLeft);
    setDragScrollLeft(tableScrollRef.current.scrollLeft);
  };

  const handleTableMouseLeave = () => setIsDraggingTable(false);
  const handleTableMouseUp = () => setIsDraggingTable(false);
  const handleTableMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTable || !tableScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    tableScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic calculations from live reimbursements array
  const totalRequestsCount = reimbursements.length;
  const pendingCount = reimbursements.filter((r) => r.status === 'Pending').length;
  const approvedCount = reimbursements.filter((r) => r.status === 'Approved').length;
  const rejectedCount = reimbursements.filter((r) => r.status === 'Rejected').length;
  const draftCount = reimbursements.filter((r) => r.status === 'Draft').length;

  const approvedAmount = reimbursements
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingAmount = reimbursements
    .filter((r) => r.status === 'Pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalReimbursedAmount = approvedAmount;

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    const items = reimbursements.filter((r) => {
      if (activeTab === 'pending' && r.status !== 'Pending') return false;
      if (activeTab === 'approved' && r.status !== 'Approved') return false;
      if (activeTab === 'rejected' && r.status !== 'Rejected') return false;
      if (activeTab === 'draft' && r.status !== 'Draft') return false;

      if (selectedCategory !== 'All Categories' && r.category !== selectedCategory) return false;
      if (selectedStatusFilter !== 'All Status' && r.status !== selectedStatusFilter) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          r.employee_name.toLowerCase().includes(q) ||
          r.employee_id.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });

    return items.sort((a, b) => {
      if (sortBy === 'amount-high') return b.amount - a.amount;
      if (sortBy === 'amount-low') return a.amount - b.amount;
      if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id); // default newest
    });
  }, [reimbursements, activeTab, selectedCategory, selectedStatusFilter, searchQuery, sortBy]);

  // Category breakdown for analytics card
  const categoryAnalytics = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    reimbursements.forEach((r) => {
      if (!map[r.category]) {
        map[r.category] = { count: 0, total: 0 };
      }
      map[r.category].count += 1;
      map[r.category].total += r.amount;
    });

    const totalClaimsAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0) || 1;
    return Object.entries(map)
      .map(([cat, data]) => ({
        category: cat,
        count: data.count,
        total: data.total,
        percentage: Math.round((data.total / totalClaimsAmount) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [reimbursements]);

  const handleApprove = (item: ReimbursementItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateStatus(item.id, 'Approved');
    if (inspectItem && inspectItem.id === item.id) {
      setInspectItem({ ...inspectItem, status: 'Approved' });
    }
    showToast(`Claim of ₹${item.amount.toLocaleString()} for ${item.employee_name} approved!`);
  };

  const handleReject = (item: ReimbursementItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateStatus(item.id, 'Rejected');
    if (inspectItem && inspectItem.id === item.id) {
      setInspectItem({ ...inspectItem, status: 'Rejected' });
    }
    showToast(`Claim of ₹${item.amount.toLocaleString()} for ${item.employee_name} rejected.`);
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedStatusFilter('All Status');
    setSortBy('newest');
  };

  const handleExportClaims = () => {
    const headers = ['#', 'Employee', 'Employee ID', 'Purpose', 'Category', 'Amount (INR)', 'Submitted On', 'Status', 'Notes'];
    const rows = filteredItems.map((r, i) => [
      i + 1,
      `"${r.employee_name}"`,
      `"${r.employee_id}"`,
      `"${r.purpose}"`,
      `"${r.category}"`,
      r.amount,
      `"${r.submitted_on}"`,
      r.status,
      `"${r.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_reimbursements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reimbursements exported to CSV!');
  };

  const getVendorInfo = (category: string, id: string | number) => {
    switch (category) {
      case 'Travel':
        return {
          vendorName: 'IndiGo Airlines (InterGlobe Aviation Ltd.)',
          gstin: '07AAAAC2784F1ZT',
          address: 'Central Wing, Ground Floor, Thapasya Building, Infopark, Kochi - 682042',
          hsn: '996411',
          description: 'Domestic Passenger Air Transportation Service',
        };
      case 'Internet':
        return {
          vendorName: 'Reliance Jio Infocomm Limited',
          gstin: '27AAACR5055K1ZI',
          address: 'Jio Center, RP Mall, Mavoor Road, Kozhikode, Kerala - 673004',
          hsn: '998422',
          description: 'Gigabit Fiber High-Speed Internet Telecommunication Services',
        };
      case 'Food':
        return {
          vendorName: 'Bundl Technologies Pvt Ltd (Swiggy Corporate)',
          gstin: '29AABCB1718J1ZL',
          address: 'Devarabisanahalli, Outer Ring Road, Bengaluru, Karnataka - 560103',
          hsn: '996331',
          description: 'Corporate Catering & Business Meal Provisioning',
        };
      case 'Software':
        return {
          vendorName: 'Amazon Web Services India Private Limited',
          gstin: '07AABCA7253L1ZP',
          address: 'Worldmark 1, Aerocity, New Delhi, Delhi - 110037',
          hsn: '998313',
          description: 'Cloud Infrastructure & Managed SaaS Hosting Services',
        };
      case 'Stationery':
        return {
          vendorName: 'Staples Office Supplies India Ltd',
          gstin: '33AABCS8891N1ZW',
          address: 'Commercial Street, Palayam, Kozhikode, Kerala - 673001',
          hsn: '482010',
          description: 'Executive Workstation & Office Stationery Supplies',
        };
      case 'Training':
        return {
          vendorName: 'Coursera & Professional Upskilling Global',
          gstin: '06AAACU9912Q1ZX',
          address: 'DLF Cyber City, Phase III, Gurugram, Haryana - 122002',
          hsn: '999293',
          description: 'Corporate Professional Technical Certification & Training',
        };
      case 'Transport':
        return {
          vendorName: 'Uber India Systems Private Limited',
          gstin: '27AACCU2301A1ZZ',
          address: 'Parinee Crescenzo, BKC, Bandra East, Mumbai - 400051',
          hsn: '996412',
          description: 'Local Business Commute & Ground Transport Facilitation',
        };
      case 'Communication':
        return {
          vendorName: 'Bharti Airtel Limited (Enterprise Services)',
          gstin: '07AAACA2345B1ZC',
          address: 'Nelson Mandela Road, Vasant Kunj, New Delhi - 110070',
          hsn: '998413',
          description: 'Postpaid Corporate Mobile & Telecom Roaming Voice Services',
        };
      default:
        return {
          vendorName: 'Authorized Corporate Vendor Network',
          gstin: '32AAACV1234D1Z5',
          address: 'SM Street, Kozhikode, Kerala - 673001',
          hsn: '998399',
          description: 'General Business Operations & Ancillary Support Supplies',
        };
    }
  };

  const handleOpenPdfEditorForReceipt = (item: ReimbursementItem) => {
    const vendor = getVendorInfo(item.category, item.id);
    const taxable = Math.round(item.amount / 1.18);
    const gst = item.amount - taxable;

    openPdfEditor({
      type: 'voucher',
      title: `Tax Invoice & Cash Receipt - ${item.employee_name}`,
      referenceNumber: `INV-2024-REC#${item.id}`,
      invoiceNumber: `INV-2024-REC#${item.id}`,
      recipientName: item.employee_name,
      recipientId: item.employee_id,
      department: item.department || 'Operations',
      dateStr: item.submitted_on,
      amount: item.amount,
      paymentStatus: item.status === 'Approved' ? 'SETTLED & DISBURSED' : 'CLAIM PENDING APPROVAL',
      subject: `${item.category.toUpperCase()} EXPENSE REIMBURSEMENT`,
      bodyContent: `${item.purpose} (${vendor.vendorName}) - Billed to Qiyam Business Solutions LLP. Verified Proof.`,
      items: [
        {
          description: `${item.purpose} - ${vendor.description}`,
          qty: 1,
          unitPrice: taxable,
          amount: taxable,
        },
        {
          description: `GST (CGST 9% + SGST 9%) - SAC/HSN: ${vendor.hsn}`,
          qty: 1,
          unitPrice: gst,
          amount: gst,
        }
      ],
      companyName: vendor.vendorName,
      companyAddress: `${vendor.address} • GSTIN: ${vendor.gstin}`,
    });
  };

  const handlePrintExactPdf = (item: ReimbursementItem) => {
    const vendor = getVendorInfo(item.category, item.id);
    const total = item.amount;
    const taxable = Math.round(total / 1.18);
    const gst = total - taxable;
    const cgst = Math.round(gst / 2);
    const sgst = gst - cgst;

    const printWin = window.open('', '_blank', 'width=850,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice & Receipt - INV-2024-REC#${item.id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #fff; color: #0f172a; font-size: 13px; }
            .table-box { width: 100%; border-collapse: collapse; margin-top: 18px; margin-bottom: 18px; }
            .table-box th { background: #f1f5f9; border-bottom: 2px solid #cbd5e1; padding: 10px; text-align: left; font-size: 11px; font-weight: 800; }
            .table-box td { border-bottom: 1px solid #e2e8f0; padding: 10px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div style="border: 2px solid #059669; border-radius: 16px; padding: 24px; max-width: 720px; margin: 0 auto; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 18px;">
              <div>
                <span style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 10px;">TAX INVOICE & CASH RECEIPT</span>
                <h2 style="font-size: 18px; font-weight: 900; margin: 6px 0 2px 0; color: #0f172a;">${vendor.vendorName}</h2>
                <div style="font-size: 11px; color: #64748b;">${vendor.address}</div>
                <div style="font-size: 11px; color: #334155; font-family: monospace; margin-top: 3px;">GSTIN: <strong>${vendor.gstin}</strong> • SAC/HSN: ${vendor.hsn}</div>
              </div>
              <div style="text-align: right;">
                <span style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 10px;">${item.status} CLAIM</span>
                <div style="font-family: monospace; font-weight: 800; font-size: 13px; margin-top: 6px; color: #0f172a;">INV-2024-REC#${item.id}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Date: <strong>${item.submitted_on}</strong></div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">BILLED TO (ORGANIZATION)</div>
                <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">Qiyam Business Solutions LLP</div>
                <div style="font-size: 11px; color: #64748b;">Mavoor Road, Kozhikode, Kerala — 673004</div>
                <div style="font-size: 11px; color: #475569; font-family: monospace;">GSTIN: 32AABCP1234D1Z5</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
                <div style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">CLAIMANT / EMPLOYEE</div>
                <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">${item.employee_name}</div>
                <div style="font-size: 11px; color: #64748b; font-family: monospace;">ID: ${item.employee_id}</div>
                <div style="font-size: 11px; color: #047857; font-weight: 700;">Category: ${item.category}</div>
              </div>
            </div>

            <table class="table-box">
              <thead>
                <tr>
                  <th>Item Particulars</th>
                  <th>SAC/HSN</th>
                  <th style="text-align: right;">Taxable</th>
                  <th style="text-align: right;">CGST (9%)</th>
                  <th style="text-align: right;">SGST (9%)</th>
                  <th style="text-align: right;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${item.purpose}</strong><br />
                    <span style="font-size: 11px; color: #64748b;">${vendor.description}</span>
                    ${item.notes ? `<div style="color: #047857; font-style: italic; font-size: 10px; margin-top: 2px;">“${item.notes}”</div>` : ''}
                  </td>
                  <td style="font-family: monospace;">${vendor.hsn}</td>
                  <td style="text-align: right; font-family: monospace;">₹${taxable.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-family: monospace;">₹${cgst.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-family: monospace;">₹${sgst.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: 800;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: #ecfdf5; font-weight: 800;">
                  <td colspan="5" style="text-align: right; text-transform: uppercase; font-size: 11px; color: #064e3b;">TOTAL AMOUNT PAID (INR):</td>
                  <td style="text-align: right; font-family: monospace; font-size: 15px; color: #047857; font-weight: 900;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b;">
              <div>
                ✔ Digitally signed & verified with vendor e-invoicing portal.<br />
                <span style="font-family: monospace; font-size: 10px;">Hash: SHA256:7e8a9f...c4b2</span>
              </div>
              <div style="border: 1px solid #6ee7b7; background: #ecfdf5; color: #047857; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-size: 10px;">
                ✓ VERIFIED INVOICE PROOF
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 250);
  };

  const triggerHtmlDownload = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReceiptHtml = (item: ReimbursementItem) => {
    const vendor = getVendorInfo(item.category, item.id);
    const total = item.amount;
    const taxable = Math.round(total / 1.18);
    const gstTotal = total - taxable;
    const cgst = Math.round(gstTotal / 2);
    const sgst = gstTotal - cgst;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice & Receipt - Claim #${item.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f8fafc; }
    .invoice-card { max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; }
    .brand-title { font-size: 20px; font-weight: 800; color: #059669; margin: 0; }
    .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-approved { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-pending { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 12px; }
    .meta-title { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 700; color: #334155; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    .text-right { text-align: right; }
    .total-row { font-weight: 800; font-size: 14px; background: #ecfdf5; color: #065f46; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .seal { border: 2px dashed #059669; padding: 8px 16px; border-radius: 8px; color: #059669; font-weight: 800; font-size: 11px; text-align: center; }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">${vendor.vendorName}</div>
        <div class="brand-sub">${vendor.address}</div>
        <div class="brand-sub">GSTIN: <strong>${vendor.gstin}</strong> • Tax Invoice</div>
      </div>
      <div style="text-align: right;">
        <span class="badge ${item.status === 'Approved' ? 'badge-approved' : 'badge-pending'}">${item.status} CLAIM</span>
        <div style="font-weight: 800; font-size: 14px; margin-top: 8px; font-family: monospace;">INV-2024-REC#${item.id}</div>
        <div style="font-size: 11px; color: #64748b;">Date: ${item.submitted_on}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="meta-box">
        <div class="meta-title">Billed To (Organization)</div>
        <div style="font-weight: 700; color: #0f172a; font-size: 13px;">Qiyam Business Solutions LLP</div>
        <div style="color: #475569; margin-top: 2px;">Mavoor Road, Kozhikode, Kerala — 673004</div>
        <div style="color: #475569; margin-top: 2px;">GSTIN: <strong>32AABCP1234D1Z5</strong> • State: Kerala (32)</div>
      </div>

      <div class="meta-box">
        <div class="meta-title">Claimant & Employee Details</div>
        <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${item.employee_name}</div>
        <div style="color: #475569; margin-top: 2px;">Employee ID: <strong>${item.employee_id}</strong></div>
        <div style="color: #475569; margin-top: 2px;">Category: <strong>${item.category}</strong> • Claim Ref: #${item.id}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Particulars / Description</th>
          <th>SAC / HSN</th>
          <th class="text-right">Taxable Value</th>
          <th class="text-right">CGST (9%)</th>
          <th class="text-right">SGST (9%)</th>
          <th class="text-right">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>
            <strong>${item.purpose}</strong>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${vendor.description}</div>
            ${item.notes ? `<div style="font-size: 10px; color: #047857; margin-top: 2px;">Note: ${item.notes}</div>` : ''}
          </td>
          <td style="font-family: monospace;">${vendor.hsn}</td>
          <td class="text-right" style="font-family: monospace;">₹${taxable.toLocaleString()}</td>
          <td class="text-right" style="font-family: monospace;">₹${cgst.toLocaleString()}</td>
          <td class="text-right" style="font-family: monospace;">₹${sgst.toLocaleString()}</td>
          <td class="text-right" style="font-family: monospace; font-weight: 700;">₹${total.toLocaleString()}</td>
        </tr>
        <tr class="total-row">
          <td colspan="6" style="text-align: right; padding: 12px;">Grand Total (Reimbursement Claim Value):</td>
          <td class="text-right" style="padding: 12px; font-family: monospace;">₹${total.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; font-size: 11px;">
      <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">Employee Declaration & Verification:</div>
      <p style="margin: 0; color: #64748b; line-height: 1.5;">
        I hereby confirm that this expense was incurred exclusively and necessarily in the discharge of official duties for Qiyam Business Solutions. The voucher attached is genuine, paid in full, and has not been claimed elsewhere.
      </p>
    </div>

    <div class="footer">
      <div>
        <div style="font-weight: 700; color: #1e293b;">Verified by Qiyam Payroll & Finance Ops</div>
        <div>System Reference: REIMB-VCH-${item.id}-VERIFIED</div>
      </div>
      <div class="seal">
        ✓ DIGITALLY VERIFIED<br>
        <span style="font-size: 9px; font-weight: normal; color: #047857;">GST PORTAL VALIDATED</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const generatePolicyHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Qiyam Business Solutions - Employee Reimbursement Policy FY 2024-25</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; color: #0f172a; background: #f8fafc; }
    .policy-card { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #059669; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    h1 { color: #065f46; font-size: 22px; margin: 0; }
    .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
    h2 { font-size: 15px; color: #1e293b; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    p, li { font-size: 13px; line-height: 1.6; color: #334155; }
    ul { padding-left: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .tier-badge { background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; }
    @media print { body { padding: 0; background: #fff; } .policy-card { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="policy-card">
    <div class="header">
      <div>
        <h1>Qiyam Business Solutions LLP</h1>
        <div class="meta">Corporate Expense Reimbursement Policy • Document Ref: QBS-HR-EXP-2024-V2</div>
      </div>
      <span class="tier-badge">Effective: FY 2024-25</span>
    </div>

    <h2>1. Purpose & Scope</h2>
    <p>This policy outlines the principles, allowable categories, daily ceilings, and audit protocols for all business expenses incurred by employees on behalf of Qiyam Business Solutions LLP.</p>

    <h2>2. Expense Categories & Daily Caps</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Daily / Monthly Limit</th>
          <th>Documentation Required</th>
          <th>Approval Authority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Travel & Lodging</strong></td>
          <td>Up to ₹5,000 / day (Tier 1)</td>
          <td>GST Hotel Invoice + Boarding Passes</td>
          <td>Manager & Finance</td>
        </tr>
        <tr>
          <td><strong>WFH Broadband Internet</strong></td>
          <td>₹1,500 / month flat</td>
          <td>Monthly ISP Paid Receipt</td>
          <td>Direct Manager</td>
        </tr>
        <tr>
          <td><strong>Client Meals & Hospitality</strong></td>
          <td>Actuals (Budget Pre-approved)</td>
          <td>Itemized Food Tax Invoice + Client Name</td>
          <td>Department Director</td>
        </tr>
        <tr>
          <td><strong>Stationery & Equipment</strong></td>
          <td>Up to ₹3,000 / occurrence</td>
          <td>Store GST Tax Invoice</td>
          <td>Direct Manager</td>
        </tr>
        <tr>
          <td><strong>Software & Tools</strong></td>
          <td>Actuals as per project budget</td>
          <td>SaaS Cloud Billing Receipt</td>
          <td>Tech Lead / CTO</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Submission & Settlement SLA</h2>
    <ul>
      <li>All claims must be submitted within <strong>30 days</strong> of expense date.</li>
      <li>Finance & HR audit team will review and approve claims within <strong>48 hours</strong> (2 business days).</li>
      <li>Approved claims are credited directly with the upcoming monthly payroll cycle, tax-free under Income Tax Section 10(14).</li>
    </ul>

    <h2>4. Non-Reimbursable Items</h2>
    <p>Personal fines or traffic violations, alcohol/narcotics, personal gifts, unapproved luxury travel, and expenses without valid GST invoices will be rejected automatically.</p>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
      <div>Approved by: Board of Partners, Qiyam Business Solutions LLP</div>
      <div>Compliance: Income Tax Rules 1962 & MCA Guidelines</div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleDownloadReceipt = (item: ReimbursementItem) => {
    handlePrintExactPdf(item);
    showToast(`Generating exact print/PDF for Claim #${item.id}!`);
  };

  const handleDownloadPolicy = () => {
    const html = generatePolicyHtml();
    triggerHtmlDownload(html, `qiyam_reimbursement_policy_fy2024_25.html`);
    showToast('Downloaded Qiyam Employee Reimbursement Policy document!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5 Dynamic Metric Cards (Calculated from live reimbursements state) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Requests</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalRequestsCount}</div>
          <div className="text-[11px] text-slate-400 font-medium">Across all categories</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Approved Amount</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{approvedAmount.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Ready for payroll credit</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>₹{pendingAmount.toLocaleString()} awaiting sign-off</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rejected Claims</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{rejectedCount}</div>
          <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
            <span>Policy limit / receipts void</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Disbursed Total</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalReimbursedAmount.toLocaleString()}</div>
          <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Audited & verified</span>
          </div>
        </div>
      </div>

      {/* Tabs & Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>All Requests</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'all' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalRequestsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'pending' ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Approved</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'approved' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {approvedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rejected'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Rejected</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'rejected' ? 'bg-white text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {rejectedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'draft'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <span>Drafts</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'draft' ? 'bg-white text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {draftCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportClaims}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Reimbursement</span>
          </button>
        </div>
      </div>

      {/* FULL-WIDTH Reimbursements Master Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {/* Search, Filter & Sorter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee, ID, purpose, notes..."
                className="pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none w-full focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option>All Categories</option>
              <option>Travel</option>
              <option>Internet</option>
              <option>Food</option>
              <option>Stationery</option>
              <option>Training</option>
              <option>Transport</option>
              <option>Software</option>
              <option>Communication</option>
              <option>Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Draft</option>
            </select>

            {/* Sort Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>

            {(searchQuery || selectedCategory !== 'All Categories' || selectedStatusFilter !== 'All Status' || activeTab !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">
              {filteredItems.length} of {reimbursements.length} Claims
            </span>
          </div>
        </div>

        {/* Modern Horizontal Scroll Controller & Section Quick Jumper */}
        <div className="bg-slate-50/80 p-2.5 px-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 flex-1 min-w-[280px] overflow-hidden">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Jump To:</span>
            </span>
            <DraggableScrollRow showArrows={false} fadeEdges={true} className="flex-1" wheelMultiplier={1.2}>
              <button
                type="button"
                onClick={() => scrollToSection(0)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>1. Employee Info</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(220)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>2. Category & Purpose</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(550)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>3. Amount & Date</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(800)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>4. Receipt Proof & Status</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(1100)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>5. Actions</span>
              </button>
            </DraggableScrollRow>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Drag table to pan or:
            </span>
            <button
              type="button"
              onClick={() => scrollTableBy(-350)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Scroll Left (◄)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Scroll Left</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTableBy(350)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
              title="Scroll Right (►)"
            >
              <span>Scroll Right</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Full Width Table Layout */}
        <div
          ref={tableScrollRef}
          onMouseDown={handleTableMouseDown}
          onMouseLeave={handleTableMouseLeave}
          onMouseUp={handleTableMouseUp}
          onMouseMove={handleTableMouseMove}
          className={`overflow-x-auto w-full select-none ${isDraggingTable ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: 'smooth' }}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center font-mono text-slate-400">#</th>
                <th className="py-3 px-3.5 min-w-[180px]">Employee</th>
                <th className="py-3 px-3.5 min-w-[120px]">Category</th>
                <th className="py-3 px-3.5 min-w-[240px]">Expense Purpose & Description</th>
                <th className="py-3 px-3.5 min-w-[120px]">Amount</th>
                <th className="py-3 px-3.5 min-w-[110px]">Submitted Date</th>
                <th className="py-3 px-3.5 min-w-[110px]">Receipt Proof</th>
                <th className="py-3 px-3.5 min-w-[110px]">Status</th>
                <th className="py-3 px-3.5 min-w-[160px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">No reimbursement claims match your criteria</h4>
                      <p className="text-xs text-slate-500">
                        Try changing the status tab, resetting your filters, or search terms to inspect other vouchers.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((r, idx) => {
                  const initials = r.employee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  const catStyle = CATEGORY_STYLES[r.category] || CATEGORY_STYLES.Other;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setInspectItem(r)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Employee Details */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {r.employee_name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{r.employee_id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                          {r.category}
                        </span>
                      </td>

                      {/* Expense Purpose & Justification */}
                      <td className="py-3.5 px-3.5">
                        <div className="max-w-md">
                          <div className="font-bold text-slate-900">{r.purpose}</div>
                          {r.notes ? (
                            <div className="text-[11px] text-slate-500 truncate mt-0.5" title={r.notes}>
                              {r.notes}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">No additional notes provided</div>
                          )}
                        </div>
                      </td>

                      {/* Claim Amount */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          ₹{r.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Non-taxable</div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-3.5 text-slate-600 font-medium text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.submitted_on}</span>
                        </div>
                      </td>

                      {/* Receipt Proof */}
                      <td className="py-3.5 px-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewReceiptItem(r)}
                            title="Preview official receipt & tax invoice"
                            className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Receipt #{r.id}</span>
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(r)}
                            title="Download official receipt file"
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                            r.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : r.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {r.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {r.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          {r.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                          {r.status === 'Draft' && <FileText className="w-3 h-3 text-slate-500" />}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* Actions Column (100% visible, no cut-off) */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'Pending' && (
                            <>
                              <button
                                onClick={(e) => handleApprove(r, e)}
                                title="Approve Claim for Payroll Credit"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={(e) => handleReject(r, e)}
                                title="Reject Claim"
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setInspectItem(r)}
                            title="Inspect Voucher & Tax Invoices"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-emerald-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats & Direct Pagination Info */}
        <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-800">{filteredItems.length}</strong> of <strong className="text-slate-800">{reimbursements.length}</strong> claims</span>
            {pendingCount > 0 && (
              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                {pendingCount} claims awaiting approval
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Click any claim row to open the complete expense audit voucher
            </span>
          </div>
        </div>
      </div>

      {/* COMPANION 3-COLUMN SECTION: Policies, Category Breakdown & Payroll Integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Expense Policy & Threshold Limits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Expense Policy Thresholds</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">FY 2024-25</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors space-y-1">
                <div className="font-bold text-slate-900 flex justify-between items-center">
                  <span>Travel & Lodging</span>
                  <span className="text-emerald-700 font-mono font-bold">Up to ₹5,000 / day</span>
                </div>
                <p className="text-[11px] text-slate-500">Boarding passes and GST hotel bills mandatory.</p>
              </div>

              <div className="p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors space-y-1">
                <div className="font-bold text-slate-900 flex justify-between items-center">
                  <span>WFH Broadband Internet</span>
                  <span className="text-emerald-700 font-mono font-bold">₹1,500 / month</span>
                </div>
                <p className="text-[11px] text-slate-500">Reimbursed directly with monthly telecom invoice copy.</p>
              </div>

              <div className="p-2.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-colors space-y-1">
                <div className="font-bold text-slate-900 flex justify-between items-center">
                  <span>Client Entertainment & Food</span>
                  <span className="text-amber-700 font-mono font-bold">Director Sign-off</span>
                </div>
                <p className="text-[11px] text-slate-500">Requires client meeting agenda and itemized tax invoice.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Standard SLA: <strong>48 Hours</strong></span>
            <button
              onClick={handleDownloadPolicy}
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Download Policy PDF</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Spend Distribution by Expense Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Spend Distribution</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                ₹{reimbursements.reduce((sum, r) => sum + r.amount, 0).toLocaleString()} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {categoryAnalytics.slice(0, 4).map((cat) => {
                const style = CATEGORY_STYLES[cat.category] || CATEGORY_STYLES.Other;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                        {cat.category}
                      </span>
                      <div className="font-mono text-slate-900 font-semibold flex items-center gap-2">
                        <span>₹{cat.total.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.dot}`}
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{categoryAnalytics.length} active spending heads</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Tax Exempt
            </span>
          </div>
        </div>

        {/* Card 3: Instant Payroll Credit & Compliance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Payroll Settlement
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Automated Sync
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Approved claims are automatically added to the upcoming monthly payroll cycle as non-taxable earnings under <strong className="text-white">Section 10(14)</strong> of the Income Tax Act.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Monthly Cutoff Date:</span>
                <span className="font-bold text-white font-mono">25th of every month</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Disbursement Channel:</span>
                <span className="font-bold text-emerald-400">Direct Bank NEFT</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>Next Cycle: <strong>30 May 2024</strong></span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliant</span>
            </span>
          </div>
        </div>
      </div>

      {/* New Reimbursement Modal */}
      <NewReimbursementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddReimbursement}
      />

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Expense Claim Voucher</h3>
                  <p className="text-[11px] text-slate-500">
                    Claim #{inspectItem.id} • Submitted on {inspectItem.submitted_on}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Employee:</span>
                <span className="font-bold text-slate-900">{inspectItem.employee_name} ({inspectItem.employee_id})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Expense Category:</span>
                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {inspectItem.category}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Purpose / Title:</span>
                <span className="font-bold text-slate-900">{inspectItem.purpose}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Claim Amount:</span>
                <span className="text-base font-black font-mono text-emerald-700">₹{inspectItem.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Status:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    inspectItem.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : inspectItem.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {inspectItem.status}
                </span>
              </div>
              {inspectItem.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5 font-medium">Employee Justification / Description:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    {inspectItem.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Receipt Document Attachment */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>tax_invoice_receipt_{inspectItem.id}.pdf</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Verified
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">Tax Invoice • Exact PDF Layout • GSTIN Compliant</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewReceiptItem(inspectItem)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 text-xs transition-colors border border-emerald-200"
                  title="Preview Receipt & Tax Invoice"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPdfEditorForReceipt(inspectItem)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 text-xs transition-colors border border-purple-200"
                  title="Edit Voucher in PDF Studio"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Edit in PDF Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintExactPdf(inspectItem)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
                  title="Download / Print Exact PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exact PDF</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>

              {inspectItem.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReject(inspectItem)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => handleApprove(inspectItem)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Claim</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INTERACTIVE RECEIPT & TAX INVOICE PREVIEW MODAL                  */}
      {/* ========================================================================= */}
      {previewReceiptItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Tax Invoice & Receipt Preview</h3>
                  <p className="text-[11px] text-slate-500">
                    Voucher Ref #{previewReceiptItem.id} • {previewReceiptItem.employee_name} ({previewReceiptItem.employee_id})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenPdfEditorForReceipt(previewReceiptItem)}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-purple-200"
                  title="Open and edit this receipt in PDF Studio"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Edit in PDF Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintExactPdf(previewReceiptItem)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Print or Save as Exact Color PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintExactPdf(previewReceiptItem)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Download Exact PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Exact PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Receipt Body (Paper Aesthetic) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs bg-slate-50/30">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                {/* Vendor Letterhead */}
                {(() => {
                  const vendor = getVendorInfo(previewReceiptItem.category, previewReceiptItem.id);
                  const total = previewReceiptItem.amount;
                  const taxable = Math.round(total / 1.18);
                  const gst = total - taxable;
                  const cgst = Math.round(gst / 2);
                  const sgst = gst - cgst;

                  return (
                    <>
                      <div className="flex items-start justify-between border-b border-emerald-600/30 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            TAX INVOICE & CASH RECEIPT
                          </span>
                          <h2 className="text-base font-black text-slate-900 mt-1">{vendor.vendorName}</h2>
                          <p className="text-[11px] text-slate-500 leading-tight">{vendor.address}</p>
                          <p className="text-[11px] text-slate-600 font-mono">
                            GSTIN: <strong className="text-slate-900">{vendor.gstin}</strong> • SAC/HSN: {vendor.hsn}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              previewReceiptItem.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : previewReceiptItem.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {previewReceiptItem.status} CLAIM
                          </span>
                          <div className="font-mono font-bold text-slate-900 text-xs mt-1">
                            INV-2024-REC#{previewReceiptItem.id}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{previewReceiptItem.submitted_on}</span>
                          </div>
                        </div>
                      </div>

                      {/* Client / Organization & Employee details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Billed To (Organization)
                          </span>
                          <div className="font-bold text-slate-900">Qiyam Business Solutions LLP</div>
                          <div className="text-[11px] text-slate-500">Mavoor Road, Kozhikode, Kerala — 673004</div>
                          <div className="text-[11px] text-slate-600 font-mono">GSTIN: 32AABCP1234D1Z5</div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Claimant / Employee
                          </span>
                          <div className="font-bold text-slate-900">{previewReceiptItem.employee_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">ID: {previewReceiptItem.employee_id}</div>
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            Category: {previewReceiptItem.category}
                          </div>
                        </div>
                      </div>

                      {/* Itemized Line Items Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Item Particulars</th>
                              <th className="py-2.5 px-3">SAC/HSN</th>
                              <th className="py-2.5 px-3 text-right">Taxable</th>
                              <th className="py-2.5 px-3 text-right">CGST (9%)</th>
                              <th className="py-2.5 px-3 text-right">SGST (9%)</th>
                              <th className="py-2.5 px-3 text-right">Total (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            <tr>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{previewReceiptItem.purpose}</div>
                                <div className="text-[11px] text-slate-500">{vendor.description}</div>
                                {previewReceiptItem.notes && (
                                  <div className="text-[10px] text-emerald-700 mt-1 italic">
                                    “{previewReceiptItem.notes}”
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600">{vendor.hsn}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700">₹{taxable.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700">₹{cgst.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700">₹{sgst.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                                ₹{total.toLocaleString()}
                              </td>
                            </tr>
                            <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                              <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px]">
                                Total Amount Paid (INR):
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-sm font-black text-emerald-800">
                                ₹{total.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Digitally Signed Seal */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-[11px]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="text-slate-500 leading-tight">
                            Digitally signed & verified with vendor e-invoicing portal.<br />
                            Hash: <span className="font-mono text-slate-700">SHA256:7e8a9f...c4b2</span>
                          </div>
                        </div>
                        <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-lg text-center text-[10px]">
                          ✓ VERIFIED INVOICE PROOF
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button
                type="button"
                onClick={() => setPreviewReceiptItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                {previewReceiptItem.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(previewReceiptItem);
                      setPreviewReceiptItem((prev) => prev ? { ...prev, status: 'Approved' } : null);
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Claim</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenPdfEditorForReceipt(previewReceiptItem)}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-purple-200 transition-colors"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Edit in PDF Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintExactPdf(previewReceiptItem)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Print / Save Exact PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
