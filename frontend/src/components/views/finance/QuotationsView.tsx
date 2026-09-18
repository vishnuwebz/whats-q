import React, { useState, useMemo, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Quotation, QuotationItem } from '@/types';
import { isDateWithinInterval } from '@/utils/dateFilter';
import {
  FileCheck, Search, Plus, Download, MessageSquare,
  Clock, ArrowRight, Eye, X, Trash2, Calendar,
  Building2, Percent, CheckCircle2, AlertCircle, ExternalLink,
  ChevronRight, RefreshCw, Layers
} from 'lucide-react';

export const QuotationsView: React.FC = () => {
  const {
    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToInvoice,
    addToast,
    setActiveTab,
    setTargetHighlightId,
    openConversationForContact,
    targetHighlightId,
    globalFilter,
    globalDateInterval,
  } = useQiyamStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [isConvertingId, setIsConvertingId] = useState<string | number | null>(null);

  // WhatsApp Share Confirmation state
  const [shareQuotationModal, setShareQuotationModal] = useState<{
    quotation: Quotation;
  } | null>(null);

  // Auto-highlight quotation when navigated via search or link
  useEffect(() => {
    if (targetHighlightId) {
      const match = quotations.find(
        (q) =>
          q.quotation_number === targetHighlightId ||
          String(q.id) === String(targetHighlightId) ||
          q.customer_name.toLowerCase().includes(String(targetHighlightId).toLowerCase())
      );
      if (match) {
        setSelectedQuotation(match);
        setFilterStatus('all');
      }
    }
  }, [targetHighlightId, quotations]);

  // Handle WhatsApp Proposal Dispatch
  const handleConfirmShareQuotation = () => {
    if (!shareQuotationModal) return;
    const { quotation } = shareQuotationModal;

    const itemsSummary = (quotation.items || []).map((it, idx) => 
      `${idx + 1}. *${it.description}* (Qty: ${it.qty}) - ₹${it.amount.toLocaleString()}`
    ).join('\n');

    const taxRate = quotation.tax_rate !== undefined ? quotation.tax_rate : 18;
    const isExempt = quotation.tax_type === 'exempt' || taxRate === 0;
    const taxLabel = isExempt
      ? 'Tax Exempt (0% GST)'
      : quotation.tax_type === 'inter_state'
      ? `IGST (${taxRate}%)`
      : `GST (${taxRate}%)`;

    const message = `📋 *Official Price Quotation: ${quotation.quotation_number}*

Hello *${quotation.customer_name}*,
Thank you for choosing *Qiyam Ventures*. Here is your official commercial proposal:

${itemsSummary || `1. *Service Package* - ₹${quotation.amount.toLocaleString()}`}

💰 *Subtotal (Excl. Tax):* ₹${(quotation.subtotal || quotation.amount).toLocaleString()}
${quotation.discount_amount ? `🏷️ *Discount:* -₹${quotation.discount_amount.toLocaleString()}\n` : ''}📊 *${taxLabel}:* ₹${(quotation.tax_amount || 0).toLocaleString()}
💎 *Total Quoted Amount:* ₹${quotation.amount.toLocaleString()}
📅 *Valid Until:* ${quotation.valid_until}

📝 *Terms:* ${quotation.terms || '50% advance upon confirmation. 50% on completion.'}

Please reply *CONFIRM* to accept this quotation or message us if you need any adjustments. We look forward to working with you!`;

    openConversationForContact({
      name: quotation.customer_name,
      phone: quotation.customer_phone,
      service: `Quotation ${quotation.quotation_number}`,
      initialMessage: message,
      skipConfirmation: true,
    });

    // Automatically mark status as 'sent' if it was in draft
    if (quotation.status === 'draft') {
      updateQuotation(quotation.id, { status: 'sent' });
    }

    setShareQuotationModal(null);
    addToast(`Quotation ${quotation.quotation_number} sent to ${quotation.customer_name} on WhatsApp!`, 'success');
  };

  // 1-Click Convert to Invoice handler
  const handleConvertToInvoice = async (quo: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (quo.status === 'converted') {
      addToast(`Quotation is already converted to invoice ${quo.converted_invoice_id}`, 'info');
      return;
    }

    setIsConvertingId(quo.id);
    try {
      const res = await convertQuotationToInvoice(quo.id);
      if (res && res.invoice) {
        if (selectedQuotation && String(selectedQuotation.id) === String(quo.id)) {
          setSelectedQuotation(res.quotation);
        }
      }
    } catch (err: any) {
      addToast(err?.message || 'Failed to convert quotation to invoice', 'error');
    } finally {
      setIsConvertingId(null);
    }
  };

  // Printable Letterhead PDF Download
  const handleDownloadPdf = (quo: Quotation) => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      addToast('Popup blocked! Please allow popups to download/print the quotation.', 'error');
      return;
    }

    const items = quo.items && quo.items.length > 0 ? quo.items : [
      {
        description: 'Commercial Service Quotation & Implementation Package',
        qty: 1,
        unitPrice: quo.amount,
        taxRate: 18,
        discount: 0,
        amount: quo.amount,
      }
    ];

    const itemsHtml = items.map((item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${item.taxRate || 18}%</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f172a;">₹${item.amount.toLocaleString()}</td>
      </tr>
    `).join('');

    const subtotal = quo.subtotal || quo.amount;
    const taxRate = quo.tax_rate !== undefined ? quo.tax_rate : 18;
    const tax = quo.tax_amount !== undefined ? quo.tax_amount : Math.round(subtotal * (taxRate / 100));
    const total = quo.amount;
    const isExempt = quo.tax_type === 'exempt' || taxRate === 0;
    const isIntra = quo.tax_type !== 'inter_state' && !isExempt;
    const cgst = isIntra ? Math.round((tax / 2) * 100) / 100 : 0;
    const sgst = isIntra ? tax - cgst : 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation - ${quo.quotation_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; font-size: 13px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
            .logo-text { font-size: 24px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            .totals { float: right; width: 300px; font-size: 13px; margin-bottom: 30px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
            .total-row { border-top: 2px solid #0f172a !important; border-bottom: none !important; font-size: 16px; font-weight: 900; color: #059669; padding-top: 10px !important; }
            .terms-box { clear: both; margin-top: 40px; padding: 16px; background: #f8fafc; border-left: 4px solid #059669; border-radius: 0 8px 8px 0; font-size: 12px; color: #475569; }
            .footer { margin-top: 50px; clear: both; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">QIYAM VENTURES</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Smart Engineering & Operations OS • GSTIN: 32AABCU9603R1ZX</div>
              <div style="font-size: 12px; color: #64748b;">Beach Road Commercial Hub, Kozhikode, Kerala 673032</div>
              <div style="font-size: 12px; color: #64748b;">Phone: +91 98765 43210 • Email: billing@qiyamventures.com</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0 0 6px 0; font-size: 22px; color: #0f172a;">COMMERCIAL QUOTATION</h2>
              <div style="font-size: 15px; font-weight: 700; font-family: monospace; color: #059669;">${quo.quotation_number}</div>
              <div style="margin-top: 6px;"><span class="badge">${quo.status.toUpperCase()}</span></div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <strong style="font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">PROPOSAL PREPARED FOR:</strong>
              <div style="font-size: 16px; font-weight: 800; margin-top: 4px; color: #0f172a;">${quo.customer_name}</div>
              <div style="font-size: 13px; color: #475569; margin-top: 2px;">📞 ${quo.customer_phone}</div>
              <div style="font-size: 13px; color: #475569;">✉️ ${quo.customer_email || 'customer@qiyamventures.com'}</div>
              ${quo.customer_gstin ? `<div style="font-size: 12px; color: #059669; font-weight: 700; margin-top: 2px; font-family: monospace;">GSTIN: ${quo.customer_gstin}</div>` : ''}
            </div>
            <div style="text-align: right;">
              <div><strong>Quotation Date:</strong> ${quo.quotation_date}</div>
              <div><strong>Validity Period:</strong> <span style="color: #dc2626; font-weight: 700;">${quo.valid_until}</span></div>
              <div><strong>Tax Type:</strong> ${isExempt ? 'Tax Exempt' : isIntra ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}</div>
              <div><strong>Payment Currency:</strong> INR (₹)</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 40px;">#</th>
                <th>Item & Description</th>
                <th style="text-align: center; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Unit Rate</th>
                <th style="text-align: center; width: 70px;">Tax</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Gross Subtotal:</span><span>₹${subtotal.toLocaleString()}</span></div>
            ${quo.discount_amount ? `<div><span>Discount:</span><span style="color: #059669;">-₹${quo.discount_amount.toLocaleString()}</span></div>` : ''}
            ${isExempt ? `<div><span>GST (0% Exempt):</span><span>₹0</span></div>` : isIntra ? `
              <div><span>CGST (${(taxRate / 2).toFixed(1)}%):</span><span>₹${cgst.toLocaleString()}</span></div>
              <div><span>SGST (${(taxRate / 2).toFixed(1)}%):</span><span>₹${sgst.toLocaleString()}</span></div>
            ` : `
              <div><span>IGST (${taxRate}%):</span><span>₹${tax.toLocaleString()}</span></div>
            `}
            <div class="total-row"><span>Total Quoted Value:</span><span>₹${total.toLocaleString()}</span></div>
          </div>

          <div class="terms-box">
            <strong style="display: block; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Terms & Conditions:</strong>
            ${quo.terms || '1. 50% advance on approval, remaining 50% upon job handover. 2. Quotation is valid for 30 calendar days. 3. All parts supplied are covered by original manufacturer warranty.'}
            ${quo.notes ? `<div style="margin-top: 6px; font-style: italic; color: #64748b;">Special Instructions: ${quo.notes}</div>` : ''}
          </div>

          <div class="footer">
            <p>This is a computer-generated formal quotation from Qiyam Ventures. Authorized electronically.</p>
            <p>To confirm or request edits, WhatsApp our billing team directly at +91 98765 43210.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addToast(`Quotation ${quo.quotation_number} prepared for print / PDF export`, 'success');
  };

  // Filtered Quotations List
  const effectiveSearch = search || globalFilter.query || '';

  const filtered = useMemo(() => {
    return quotations.filter((quo) => {
      if (globalFilter.status && globalFilter.status !== 'all') {
        const s = globalFilter.status.toLowerCase();
        if (s === 'open' && (quo.status === 'draft' || quo.status === 'sent' || quo.status === 'viewed')) return true;
        if (s === 'completed' && (quo.status === 'converted' || quo.status === 'accepted')) return true;
        if (quo.status !== s) return false;
      } else if (filterStatus !== 'all' && quo.status !== filterStatus) {
        return false;
      }

      if (
        !isDateWithinInterval(quo.valid_until, globalDateInterval) &&
        !(quo.quotation_date && isDateWithinInterval(quo.quotation_date, globalDateInterval))
      ) {
        return false;
      }

      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const matchesBasic =
          quo.quotation_number.toLowerCase().includes(q) ||
          quo.customer_name.toLowerCase().includes(q) ||
          quo.customer_phone.includes(q) ||
          (quo.customer_email && quo.customer_email.toLowerCase().includes(q));
        const matchesItems = quo.items?.some((item) =>
          item.description.toLowerCase().includes(q)
        );
        return matchesBasic || matchesItems;
      }

      return true;
    });
  }, [quotations, filterStatus, effectiveSearch, globalFilter, globalDateInterval]);

  // KPI Metrics Calculation
  const kpis = useMemo(() => {
    const totalQuotedValue = quotations.reduce((acc, q) => acc + (Number(q.amount) || 0), 0);
    const convertedQuotes = quotations.filter((q) => q.status === 'converted');
    const acceptedQuotes = quotations.filter((q) => q.status === 'accepted');
    const pendingQuotes = quotations.filter((q) => q.status === 'sent' || q.status === 'viewed');
    const draftQuotes = quotations.filter((q) => q.status === 'draft');
    const expiredQuotes = quotations.filter((q) => q.status === 'expired');

    const totalConvertedValue = convertedQuotes.reduce((acc, q) => acc + (Number(q.amount) || 0), 0);
    const totalPendingValue = pendingQuotes.reduce((acc, q) => acc + (Number(q.amount) || 0), 0);

    const decisiveCount = convertedQuotes.length + acceptedQuotes.length + quotations.filter((q) => q.status === 'rejected').length;
    const acceptanceRate = decisiveCount > 0
      ? (((convertedQuotes.length + acceptedQuotes.length) / decisiveCount) * 100).toFixed(1)
      : '72.5';

    return {
      totalQuotedValue,
      totalCount: quotations.length,
      acceptanceRate,
      pendingCount: pendingQuotes.length,
      totalPendingValue,
      convertedCount: convertedQuotes.length,
      totalConvertedValue,
      draftCount: draftQuotes.length,
      acceptedCount: acceptedQuotes.length,
      expiredCount: expiredQuotes.length,
    };
  }, [quotations]);

  // Create Form State
  const [formNumber, setFormNumber] = useState(`QUO-2024-${String(43 + quotations.length).padStart(4, '0')}`);
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('+91 ');
  const [formCustomerEmail, setFormCustomerEmail] = useState('');
  const [formCustomerGstin, setFormCustomerGstin] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('June 30, 2024');
  const [formTerms, setFormTerms] = useState('Payment: 50% advance upon confirmation, 50% on job completion. Valid for 30 days.');
  const [formNotes, setFormNotes] = useState('');

  // GST & Tax Configuration State
  const [formGstRate, setFormGstRate] = useState<number>(18);
  const [formGstType, setFormGstType] = useState<'intra_state' | 'inter_state' | 'exempt'>('intra_state');
  const [formIsCustomTax, setFormIsCustomTax] = useState(false);
  const [formCustomTaxAmount, setFormCustomTaxAmount] = useState<string>('');
  const [formDiscountType, setFormDiscountType] = useState<'flat' | 'percent'>('flat');
  const [formDiscountValue, setFormDiscountValue] = useState<string>('0');

  const [formItems, setFormItems] = useState<QuotationItem[]>([
    {
      description: 'Daikin Inverter Split AC Complete Servicing & Coil Wash',
      qty: 1,
      unitPrice: 3500,
      taxRate: 18,
      discount: 0,
      amount: 3500,
    }
  ]);

  const setValidityPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const formatted = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
    setFormValidUntil(formatted);
  };

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      {
        description: 'Commercial AC Inspection & Refrigerant Top-up',
        qty: 1,
        unitPrice: 1500,
        taxRate: formGstRate,
        discount: 0,
        amount: 1500,
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length <= 1) {
      addToast('A quotation must contain at least one line item', 'warning');
      return;
    }
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setFormItems(formItems.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'unitPrice') {
        const q = field === 'qty' ? Number(value) || 0 : item.qty;
        const p = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
        updated.amount = q * p;
      }
      return updated;
    }));
  };

  // Auto calculate form totals with dynamic GST and discount
  const formSubtotal = formItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

  const formDiscountAmount = useMemo(() => {
    const val = parseFloat(formDiscountValue) || 0;
    if (val <= 0) return 0;
    if (formDiscountType === 'percent') {
      return Math.round(formSubtotal * (val / 100));
    }
    return Math.min(formSubtotal, val);
  }, [formSubtotal, formDiscountType, formDiscountValue]);

  const formTaxableAmount = Math.max(0, formSubtotal - formDiscountAmount);

  const formTax = useMemo(() => {
    if (formGstType === 'exempt' || formGstRate === 0) return 0;
    if (formIsCustomTax && formCustomTaxAmount !== '') {
      return Math.max(0, parseFloat(formCustomTaxAmount) || 0);
    }
    return Math.round(formTaxableAmount * (formGstRate / 100));
  }, [formTaxableAmount, formGstRate, formGstType, formIsCustomTax, formCustomTaxAmount]);

  const formTotal = formTaxableAmount + formTax;

  const cgstAmount = formGstType === 'intra_state' ? Math.round((formTax / 2) * 100) / 100 : 0;
  const sgstAmount = formGstType === 'intra_state' ? formTax - cgstAmount : 0;
  const igstAmount = formGstType === 'inter_state' ? formTax : 0;

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim()) {
      addToast('Please enter customer name', 'warning');
      return;
    }

    const nowFormatted = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

    if (editingQuotation) {
      await updateQuotation(editingQuotation.id, {
        customer_name: formCustomerName,
        customer_phone: formCustomerPhone,
        customer_email: formCustomerEmail,
        customer_gstin: formCustomerGstin.trim(),
        valid_until: formValidUntil,
        amount: formTotal,
        subtotal: formSubtotal,
        tax_rate: formGstType === 'exempt' ? 0 : formGstRate,
        tax_type: formGstType,
        tax_amount: formTax,
        discount_amount: formDiscountAmount,
        terms: formTerms,
        notes: formNotes,
        items: formItems,
      });
      setEditingQuotation(null);
    } else {
      const created = await addQuotation({
        quotation_number: formNumber,
        customer_name: formCustomerName,
        customer_phone: formCustomerPhone,
        customer_email: formCustomerEmail,
        customer_gstin: formCustomerGstin.trim(),
        quotation_date: nowFormatted,
        valid_until: formValidUntil,
        amount: formTotal,
        subtotal: formSubtotal,
        tax_rate: formGstType === 'exempt' ? 0 : formGstRate,
        tax_type: formGstType,
        tax_amount: formTax,
        discount_amount: formDiscountAmount,
        status: 'draft',
        terms: formTerms,
        notes: formNotes,
        items: formItems,
      });
      setSelectedQuotation(created);
    }

    setIsCreateModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingQuotation(null);
    setFormNumber(`QUO-2024-${String(43 + quotations.length).padStart(4, '0')}`);
    setFormCustomerName('');
    setFormCustomerPhone('+91 ');
    setFormCustomerEmail('');
    setFormCustomerGstin('');
    setFormValidUntil('June 30, 2024');
    setFormTerms('Payment: 50% advance upon confirmation, 50% on job completion. Valid for 30 days.');
    setFormNotes('');
    setFormGstRate(18);
    setFormGstType('intra_state');
    setFormIsCustomTax(false);
    setFormCustomTaxAmount('');
    setFormDiscountType('flat');
    setFormDiscountValue('0');
    setFormItems([
      {
        description: 'Daikin Inverter Split AC Complete Servicing & Coil Wash',
        qty: 1,
        unitPrice: 3500,
        taxRate: 18,
        discount: 0,
        amount: 3500,
      }
    ]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (quo: Quotation) => {
    setEditingQuotation(quo);
    setFormNumber(quo.quotation_number);
    setFormCustomerName(quo.customer_name);
    setFormCustomerPhone(quo.customer_phone);
    setFormCustomerEmail(quo.customer_email || '');
    setFormCustomerGstin(quo.customer_gstin || '');
    setFormValidUntil(quo.valid_until);
    setFormTerms(quo.terms || '');
    setFormNotes(quo.notes || '');
    const initialTaxRate = quo.tax_rate !== undefined ? quo.tax_rate : 18;
    setFormGstRate(initialTaxRate);
    setFormGstType(quo.tax_type || (initialTaxRate === 0 ? 'exempt' : 'intra_state'));
    setFormIsCustomTax(false);
    setFormCustomTaxAmount(quo.tax_amount ? String(quo.tax_amount) : '');
    setFormDiscountType('flat');
    setFormDiscountValue(quo.discount_amount ? String(quo.discount_amount) : '0');
    setFormItems(quo.items && quo.items.length > 0 ? quo.items : [
      {
        description: 'Service Package',
        qty: 1,
        unitPrice: quo.amount,
        taxRate: initialTaxRate,
        discount: 0,
        amount: quo.amount,
      }
    ]);
    setIsCreateModalOpen(true);
  };

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'converted':
        return 'bg-teal-50 text-teal-700 border-teal-200 font-extrabold';
      case 'sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'rejected':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'draft':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Quotations & Estimates"
        subtitle="Create commercial quotations, dispatch pre-filled WhatsApp proposals, and convert accepted quotes to itemized invoices."
        primaryActionLabel="Create Quotation"
        onPrimaryAction={openCreateModal}
      />

      <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Total Quoted Value</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{kpis.totalQuotedValue.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5">
              {kpis.totalCount} active proposals
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Acceptance Rate</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {kpis.acceptanceRate}%
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              {kpis.acceptedCount + kpis.convertedCount} won proposals
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Pending Approval</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
              ₹{kpis.totalPendingValue.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5">
              {kpis.pendingCount} awaiting customer reply
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 font-semibold text-[11px] sm:text-xs">Converted to Invoices</div>
            <div className="text-xl sm:text-2xl font-black text-teal-600 mt-1">
              ₹{kpis.totalConvertedValue.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-teal-700 font-bold mt-0.5">
              {kpis.convertedCount} invoices generated
            </div>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2.5 sm:gap-0 items-stretch sm:items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 whitespace-nowrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({kpis.totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('sent')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'sent' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sent ({quotations.filter((q) => q.status === 'sent').length})
            </button>
            <button
              onClick={() => setFilterStatus('viewed')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'viewed' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Viewed ({quotations.filter((q) => q.status === 'viewed').length})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'accepted' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Accepted ({kpis.acceptedCount})
            </button>
            <button
              onClick={() => setFilterStatus('converted')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'converted' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Converted ({kpis.convertedCount})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'draft' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Drafts ({kpis.draftCount})
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'expired' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Expired ({kpis.expiredCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes, clients, items..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 outline-none w-full sm:w-60 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[850px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Invoice Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <FileCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-sm text-slate-600">No quotations found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Create your first quotation or adjust filter terms</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((quo) => {
                    const isConverted = quo.status === 'converted';
                    const isExpired = quo.status === 'expired';

                    return (
                      <tr
                        key={quo.id}
                        onClick={() => setSelectedQuotation(quo)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {quo.quotation_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{quo.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{quo.customer_phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{quo.quotation_date}</td>
                        <td className="py-3.5 px-4">
                          <div className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>
                            {quo.valid_until}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          ₹{quo.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(quo.status)}`}>
                            {quo.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {quo.converted_invoice_id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetHighlightId(quo.converted_invoice_id);
                                setActiveTab('finance-invoices');
                              }}
                              className="font-mono text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-md border border-teal-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="View generated Invoice in Billing"
                            >
                              <span>{quo.converted_invoice_id}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp Share Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareQuotationModal({ quotation: quo });
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Share quotation via WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="hidden lg:inline">WhatsApp</span>
                            </button>

                            {/* 1-Click Convert to Invoice Button */}
                            {!isConverted && (
                              <button
                                onClick={(e) => handleConvertToInvoice(quo, e)}
                                disabled={isConvertingId === quo.id}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                title="Convert this quotation to an itemized invoice"
                              >
                                {isConvertingId === quo.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FileCheck className="w-3 h-3" />
                                )}
                                <span>Convert to Invoice</span>
                              </button>
                            )}

                            {/* PDF Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPdf(quo);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                              title="Print / PDF Export"
                            >
                              <Download className="w-3.5 h-3.5" />
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
        </div>

        {/* Quotation Detail Drawer / Modal */}
        {selectedQuotation && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-5 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Formal Estimate</div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-mono">
                      {selectedQuotation.quotation_number}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedQuotation.status)}`}>
                    {selectedQuotation.status.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client & Date Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Quoted To</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedQuotation.customer_name}</div>
                  <div className="text-slate-600 font-mono mt-0.5">{selectedQuotation.customer_phone}</div>
                  {selectedQuotation.customer_email && (
                    <div className="text-slate-500">{selectedQuotation.customer_email}</div>
                  )}
                  {selectedQuotation.customer_gstin && (
                    <div className="text-emerald-700 font-mono text-[10.5px] font-bold mt-0.5">
                      GSTIN: {selectedQuotation.customer_gstin}
                    </div>
                  )}
                </div>
                <div className="sm:text-right space-y-1">
                  <div>
                    <span className="text-slate-400 font-medium">Issue Date:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedQuotation.quotation_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Valid Until:</span>{' '}
                    <span className="font-bold text-rose-600">{selectedQuotation.valid_until}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Tax Mode:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {selectedQuotation.tax_type === 'exempt' || selectedQuotation.tax_rate === 0
                        ? 'Tax Exempt'
                        : selectedQuotation.tax_type === 'inter_state'
                        ? 'Inter-State (IGST)'
                        : 'Intra-State (CGST+SGST)'}
                    </span>
                  </div>
                  {selectedQuotation.converted_invoice_id && (
                    <div>
                      <span className="text-slate-400 font-medium">Converted Invoice:</span>{' '}
                      <span className="font-mono font-bold text-teal-700">{selectedQuotation.converted_invoice_id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Itemized Breakdown</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Rate</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(selectedQuotation.items || [
                        { description: 'Commercial Maintenance & Service Package', qty: 1, unitPrice: selectedQuotation.amount, amount: selectedQuotation.amount }
                      ]).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-900">{item.description}</td>
                          <td className="py-2 px-3 text-center font-mono">{item.qty}</td>
                          <td className="py-2 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold font-mono text-slate-900">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Subtotal:</span>
                    <span className="font-mono font-semibold">₹{(selectedQuotation.subtotal || selectedQuotation.amount).toLocaleString()}</span>
                  </div>
                  {selectedQuotation.discount_amount ? (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Applied:</span>
                      <span className="font-mono font-semibold">-₹{selectedQuotation.discount_amount.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {selectedQuotation.tax_type === 'exempt' || selectedQuotation.tax_rate === 0
                        ? 'GST (0% Exempt):'
                        : selectedQuotation.tax_type === 'inter_state'
                        ? `IGST (${selectedQuotation.tax_rate ?? 18}%):`
                        : `GST (${selectedQuotation.tax_rate ?? 18}%):`}
                    </span>
                    <span className="font-mono font-semibold">₹{(selectedQuotation.tax_amount || 0).toLocaleString()}</span>
                  </div>
                  {selectedQuotation.tax_type === 'intra_state' && (selectedQuotation.tax_amount || 0) > 0 && (
                    <div className="pl-2 border-l-2 border-emerald-300 text-[10.5px] text-slate-500 space-y-0.5">
                      <div className="flex justify-between">
                        <span>CGST ({((selectedQuotation.tax_rate ?? 18) / 2).toFixed(1)}%):</span>
                        <span className="font-mono">₹{(Math.round(((selectedQuotation.tax_amount || 0) / 2) * 100) / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({((selectedQuotation.tax_rate ?? 18) / 2).toFixed(1)}%):</span>
                        <span className="font-mono">₹{((selectedQuotation.tax_amount || 0) - (Math.round(((selectedQuotation.tax_amount || 0) / 2) * 100) / 100)).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Quoted Amount:</span>
                    <span className="text-emerald-700 font-mono font-extrabold">₹{selectedQuotation.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Notes */}
              {selectedQuotation.terms && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-[11px]">
                  <strong className="block text-slate-800 mb-1">Commercial Terms:</strong>
                  {selectedQuotation.terms}
                </div>
              )}

              {/* Drawer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(selectedQuotation)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Edit Quotation
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf(selectedQuotation)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setShareQuotationModal({ quotation: selectedQuotation });
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp</span>
                  </button>

                  {selectedQuotation.status !== 'converted' && (
                    <button
                      onClick={(e) => handleConvertToInvoice(selectedQuotation, e)}
                      disabled={isConvertingId === selectedQuotation.id}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isConvertingId === selectedQuotation.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileCheck className="w-3.5 h-3.5" />
                      )}
                      <span>Convert to Invoice</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Quotation Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-5 sm:p-6 space-y-4 text-xs max-h-[92dvh] overflow-y-auto animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      {editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Build an itemized commercial proposal for field services or hardware
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuotation} className="space-y-4">
                {/* Meta Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quotation Number</label>
                    <input
                      type="text"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Full Name</label>
                    <input
                      type="text"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      placeholder="e.g. Malabar Gold HQ or Ramesh Kumar"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={formCustomerPhone}
                      onChange={(e) => setFormCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Email (Optional)</label>
                    <input
                      type="email"
                      value={formCustomerEmail}
                      onChange={(e) => setFormCustomerEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={formCustomerGstin}
                      onChange={(e) => setFormCustomerGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 32AAAAA0000A1Z5"
                      maxLength={15}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Validity Period with Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Valid Until</label>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setValidityPreset(7)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                      >
                        +7d
                      </button>
                      <button
                        type="button"
                        onClick={() => setValidityPreset(15)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                      >
                        +15d
                      </button>
                      <button
                        type="button"
                        onClick={() => setValidityPreset(30)}
                        className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold cursor-pointer"
                      >
                        +30d
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    required
                    placeholder="e.g. June 30, 2024"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Line Items Multi-Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      Quotation Line Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {formItems.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Service description or part name..."
                            required
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <label className="block text-slate-400 text-[10px]">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px]">Unit Rate (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px]">Total (₹)</label>
                            <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-extrabold text-slate-800">
                              ₹{item.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GST, Tax Rates & Financial Adjustments Box */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      <span>GST, Tax Rate &amp; Discounts</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Commercial Tax Engine
                    </span>
                  </div>

                  {/* Subtotal row */}
                  <div className="flex justify-between text-slate-700 text-xs">
                    <span className="font-medium">Gross Subtotal (Excl. Tax):</span>
                    <span className="font-mono font-bold">₹{formSubtotal.toLocaleString()}</span>
                  </div>

                  {/* Discount controls */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-700">Special Discount (Optional)</label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setFormDiscountType('flat')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                            formDiscountType === 'flat'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Flat (₹)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormDiscountType('percent')}
                          className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                            formDiscountType === 'percent'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Percentage (%)
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formDiscountValue}
                        onChange={(e) => setFormDiscountValue(e.target.value)}
                        placeholder="0"
                        className="w-32 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                        {formDiscountAmount > 0 ? `- ₹${formDiscountAmount.toLocaleString()}` : 'No discount applied'}
                      </span>
                    </div>
                  </div>

                  {/* Taxable base if discount applied */}
                  {formDiscountAmount > 0 && (
                    <div className="flex justify-between text-slate-700 text-xs px-1">
                      <span className="font-medium text-slate-600">Taxable Net Subtotal:</span>
                      <span className="font-mono font-bold">₹{formTaxableAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* GST Slabs & Tax Mode */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-700">GST / Tax Slab Rate</label>
                      {/* Quick Presets */}
                      <div className="flex items-center gap-1 text-[10.5px]">
                        {[0, 5, 12, 18, 28].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setFormGstRate(rate);
                              if (rate === 0) setFormGstType('exempt');
                              else if (formGstType === 'exempt') setFormGstType('intra_state');
                              setFormIsCustomTax(false);
                            }}
                            className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                              formGstRate === rate && !formIsCustomTax
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {rate === 0 ? '0% Exempt' : `${rate}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tax Type / Split Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Tax Mode:</span>
                        <select
                          value={formGstType}
                          onChange={(e) => {
                            const val = e.target.value as 'intra_state' | 'inter_state' | 'exempt';
                            setFormGstType(val);
                            if (val === 'exempt') setFormGstRate(0);
                            else if (formGstRate === 0) setFormGstRate(18);
                          }}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none text-xs"
                        >
                          <option value="intra_state">Intra-State (CGST + SGST)</option>
                          <option value="inter_state">Inter-State (IGST)</option>
                          <option value="exempt">Tax Exempt / Zero-Rated</option>
                        </select>
                      </div>

                      {/* Custom % rate input */}
                      {formGstType !== 'exempt' && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <span className="text-slate-500 font-medium">Custom Rate:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formGstRate}
                            onChange={(e) => {
                              setFormGstRate(parseFloat(e.target.value) || 0);
                              setFormIsCustomTax(false);
                            }}
                            className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-slate-400 font-bold">%</span>
                        </div>
                      )}
                    </div>

                    {/* Tax Breakdown Rows */}
                    <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                      {formGstType === 'exempt' || formGstRate === 0 ? (
                        <div className="flex justify-between text-slate-500 italic">
                          <span>Tax Status:</span>
                          <span>Zero-rated / Exempt from GST</span>
                        </div>
                      ) : formGstType === 'intra_state' ? (
                        <>
                          <div className="flex justify-between">
                            <span>CGST ({(formGstRate / 2).toFixed(1)}%):</span>
                            <span className="font-mono font-semibold">₹{cgstAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST ({(formGstRate / 2).toFixed(1)}%):</span>
                            <span className="font-mono font-semibold">₹{sgstAmount.toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span>IGST ({formGstRate}%):</span>
                          <span className="font-mono font-semibold">₹{igstAmount.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Manual Tax Amount Override */}
                      <div className="pt-1 flex items-center justify-between text-[10.5px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (!formIsCustomTax) {
                              setFormCustomTaxAmount(String(formTax));
                            }
                            setFormIsCustomTax(!formIsCustomTax);
                          }}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline flex items-center gap-1"
                        >
                          {formIsCustomTax ? '✓ Revert to Auto-Calculate Tax' : '✏️ Override Exact Tax Amount (₹)'}
                        </button>
                        {formIsCustomTax && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={formCustomTaxAmount}
                              onChange={(e) => setFormCustomTaxAmount(e.target.value)}
                              placeholder="Tax ₹"
                              className="w-24 px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-900 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total Estimate summary card */}
                  <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Total Quoted Estimate:</span>
                      <span className="text-[10px] text-slate-500">
                        Includes {formGstType === 'exempt' || formGstRate === 0 ? '0% GST' : `${formGstRate}% GST (${formGstType === 'intra_state' ? 'CGST+SGST' : 'IGST'})`}
                        {formDiscountAmount > 0 ? ` • Less ₹${formDiscountAmount.toLocaleString()} discount` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-800 font-mono">₹{formTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commercial Payment Terms</label>
                  <textarea
                    rows={2}
                    value={formTerms}
                    onChange={(e) => setFormTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    {editingQuotation ? 'Save Changes' : 'Generate Quotation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WhatsApp Share Confirmation Modal */}
        {shareQuotationModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Send Quotation to WhatsApp</h3>
                  <p className="text-slate-500 text-[11px]">
                    Confirm proposal dispatch to {shareQuotationModal.quotation.customer_name}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Quotation #:</span>
                  <span className="font-mono font-bold text-slate-800">{shareQuotationModal.quotation.quotation_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-bold text-slate-800">{shareQuotationModal.quotation.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-700">{shareQuotationModal.quotation.customer_phone}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-bold">
                  <span className="text-slate-700">Total Value:</span>
                  <span className="font-mono text-emerald-700 text-xs">₹{shareQuotationModal.quotation.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 leading-relaxed">
                💬 This will open the customer's chat thread in Messenger and pre-fill the official estimate card ready for immediate sending.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareQuotationModal(null)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmShareQuotation}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
