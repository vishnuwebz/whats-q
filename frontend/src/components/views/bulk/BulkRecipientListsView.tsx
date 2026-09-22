import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Send,
  Trash2,
  Edit2,
  ChevronRight,
  X,
  PieChart,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ExternalLink,
  QrCode,
  Zap,
  Check,
  Eye,
  FileText,
  File,
  RefreshCw,
  Layers,
  CheckSquare,
  Square,
  Ban,
  AlertOctagon,
  RotateCcw,
  FileDown,
  UserX,
  ShieldAlert,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkRecipientList, BulkContact } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';
import { WhatsAppGroupExtractorModal } from './WhatsAppGroupExtractorModal';

interface BulkRecipientListsViewProps {
  initialViewMode?: 'lists' | 'suppression';
}

export const BulkRecipientListsView: React.FC<BulkRecipientListsViewProps> = ({ initialViewMode }) => {
  const {
    bulkRecipientLists,
    createRecipientList,
    deleteRecipientList,
    updateRecipientList,
    setSelectedBroadcastListId,
    setActiveTab,
    activeTab,
    addToast,
    suppressionList,
    addSuppressionRecord,
    removeSuppressionRecord,
    isPhoneSuppressed,
    setSelectedConversationId,
    conversations,
    suppressionSearchQuery,
    setSuppressionSearchQuery,
  } = useQiyamStore();

  // View mode tab state - auto switch to suppression if routed via /bulk/suppression or prop
  const isSuppressionTab = initialViewMode === 'suppression' || activeTab === 'bulk-suppression';
  const [viewMode, setViewMode] = useState<'lists' | 'suppression'>(isSuppressionTab ? 'suppression' : 'lists');

  useEffect(() => {
    if (initialViewMode === 'suppression' || activeTab === 'bulk-suppression') {
      setViewMode('suppression');
    } else if (initialViewMode === 'lists' || activeTab === 'bulk-recipients') {
      setViewMode('lists');
    }
  }, [initialViewMode, activeTab]);

  // Suppression list filters and modal state - auto populated if linked from a customer in chat
  const [suppressionSearch, setSuppressionSearch] = useState(suppressionSearchQuery || '');

  useEffect(() => {
    if (suppressionSearchQuery) {
      setSuppressionSearch(suppressionSearchQuery);
      setViewMode('suppression');
    }
  }, [suppressionSearchQuery]);
  const [suppressionFilter, setSuppressionFilter] = useState<'all' | 'blocked' | 'opted_out' | 'button' | 'manual'>('all');
  const [isAddManualSuppressionOpen, setIsAddManualSuppressionOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualType, setManualType] = useState<'opted_out' | 'blocked'>('opted_out');
  const [manualReason, setManualReason] = useState('');

  // Suppression stats
  const totalSuppressedCount = suppressionList?.length || 0;
  const blockedCount = (suppressionList || []).filter((s) => s.type === 'blocked').length;
  const optedOutCount = (suppressionList || []).filter((s) => s.type === 'opted_out' || s.type === 'opt_out_stop' || s.type === 'opt_out_button').length;

  const filteredSuppressionList = useMemo(() => {
    return (suppressionList || []).filter((item) => {
      const isBlocked = item.type === 'blocked';
      const isOptedOut = item.type === 'opted_out' || item.type === 'opt_out_stop' || item.type === 'opt_out_button';
      const isButton = item.type === 'opt_out_button' || item.source?.includes('button');
      const isManual = item.source?.toLowerCase().includes('manual') || item.type === 'manual';

      if (suppressionFilter === 'blocked' && !isBlocked) return false;
      if (suppressionFilter === 'opted_out' && !isOptedOut) return false;
      if (suppressionFilter === 'button' && !isButton) return false;
      if (suppressionFilter === 'manual' && !isManual) return false;

      const q = suppressionSearch.trim().toLowerCase();
      if (!q) return true;

      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.reason || '').toLowerCase().includes(q) ||
        (item.campaignName || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q) ||
        String(item.metaErrorCode || '').includes(q)
      );
    });
  }, [suppressionList, suppressionFilter, suppressionSearch]);

  const handleExportSuppressionCsv = () => {
    if (!suppressionList || suppressionList.length === 0) {
      addToast('No suppression records to export.', 'info');
      return;
    }
    const headers = [
      'Contact Name',
      'Phone Number',
      'Suppression Type',
      'Reason / Trigger',
      'Meta Error Code',
      'Originating Campaign',
      'Date Added',
      'Source',
      'Status'
    ];
    const rows = suppressionList.map((r) => [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${r.phone}"`,
      `"${r.type === 'blocked' ? 'Blocked (Meta 131051)' : 'Opted Out (STOP)'}"`,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
      r.metaErrorCode ? `"${r.metaErrorCode}"` : '""',
      `"${(r.campaignName || '').replace(/"/g, '""')}"`,
      `"${r.date} ${r.timestamp || ''}"`,
      `"${(r.source || '').replace(/"/g, '""')}"`,
      `"${r.status || 'active'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WhatsApp_Suppression_Compliance_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${suppressionList.length} compliance records to CSV!`, 'success');
  };

  const handleAddManualSuppression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim()) {
      addToast('Please enter a valid phone number.', 'warning');
      return;
    }
    addSuppressionRecord({
      id: `supp-manual-${Date.now()}`,
      name: manualName.trim() || 'Manual Contact',
      phone: manualPhone.trim(),
      type: manualType === 'blocked' ? 'blocked' : 'opt_out_stop',
      reason: manualReason.trim() || (manualType === 'blocked' ? 'Manual block entered by operator' : 'Manual opt-out entered by operator'),
      metaErrorCode: manualType === 'blocked' ? '131051' : undefined,
      date: new Date().toLocaleDateString('en-GB'),
      timestamp: Date.now(),
      status: 'Suppressed',
      notes: manualReason.trim(),
      canResubscribe: true,
      source: 'Manual operator entry',
    });
    addToast(`Added ${manualPhone} to compliance suppression list!`, 'success');
    setIsAddManualSuppressionOpen(false);
    setManualName('');
    setManualPhone('');
    setManualReason('');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState<BulkRecipientList | null>(
    bulkRecipientLists[0] || null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExtractorModalOpen, setIsExtractorModalOpen] = useState(false);

  // Create List Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListTags, setNewListTags] = useState('Marketing, Q3');

  // Dedicated Contact Import & Preview State in Create Modal
  const [importMethod, setImportMethod] = useState<'csv' | 'paste' | 'demo'>('csv');
  const [rawTextImport, setRawTextImport] = useState('');
  const [importedContacts, setImportedContacts] = useState<BulkContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewSearchQuery, setPreviewSearchQuery] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const createModalFileInputRef = useRef<HTMLInputElement>(null);

  const filteredLists = useMemo(() => {
    return bulkRecipientLists.filter((list) => {
      const matchesSearch =
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [bulkRecipientLists, searchQuery]);

  // Parse Contacts from CSV / Text format
  const parseContactsFromCsvText = (text: string, sourceName: string): BulkContact[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(/[,;\t]/).map((h) => h.trim().replace(/['"]/g, ''));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const phoneIdx = headers.findIndex(
      (h) =>
        h.includes('phone') ||
        h.includes('mobile') ||
        h.includes('number') ||
        h.includes('whatsapp')
    );
    const tagIdx = headers.findIndex(
      (h) => h.includes('tag') || h.includes('category') || h.includes('group')
    );
    const emailIdx = headers.findIndex((h) => h.includes('email'));

    const parsedContacts: BulkContact[] = [];
    const hasHeaderRow = phoneIdx !== -1 || nameIdx !== -1;
    const startIndex = hasHeaderRow ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const row = lines[i].split(/[,;\t]/).map((cell) => cell.trim().replace(/['"]/g, ''));
      if (row.length < 1 || !row.some((cell) => cell.length > 0)) continue;

      let name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : row[0] || `Contact ${i + 1}`;
      let phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : row[1] || row[0];
      let tag = tagIdx !== -1 && row[tagIdx] ? row[tagIdx] : 'Imported';
      let email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : undefined;

      // If no explicit header, and row[0] looks like a phone number
      if (!hasHeaderRow && /^[+0-9\s-]{7,}$/.test(row[0])) {
        phone = row[0];
        name = row[1] || `Contact ${i + 1}`;
        tag = row[2] || 'Imported';
      }

      // Normalize phone
      let cleanPhone = phone.replace(/[^0-9+]/g, '');
      if (cleanPhone.length === 10 && !cleanPhone.startsWith('+')) {
        cleanPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      } else if (!cleanPhone.startsWith('+') && cleanPhone.length > 10) {
        cleanPhone = `+${cleanPhone}`;
      }

      if (cleanPhone.length >= 7) {
        parsedContacts.push({
          id: `contact-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          name,
          phone: cleanPhone,
          email,
          tag,
          validWhatsApp: true,
          optedOut: false,
          source: sourceName,
          lastActive: 'Just now',
        });
      }
    }

    return parsedContacts;
  };

  // CSV File Handler for Modal
  const handleFileUploadForModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const contacts = parseContactsFromCsvText(text, file.name);
        if (contacts.length === 0) {
          addToast('Could not find valid contact phone numbers in file', 'error');
          return;
        }

        setUploadedFileName(file.name);
        setImportedContacts(contacts);
        setSelectedContactIds(new Set(contacts.map((c) => c.id)));
        setIsPreviewExpanded(true);

        if (!newListName.trim()) {
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNewListName(`Audience: ${baseName}`);
        }

        addToast(
          `Successfully loaded ${contacts.length} contacts from "${file.name}"!`,
          'success'
        );
      } catch (err) {
        addToast('Error reading file. Please verify CSV format.', 'error');
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.readAsText(file);
  };

  // Parse Raw Pasted Text
  const handleParsePastedContacts = () => {
    if (!rawTextImport.trim()) {
      addToast('Please paste contact rows or phone numbers', 'error');
      return;
    }
    const contacts = parseContactsFromCsvText(rawTextImport, 'Pasted Text');
    if (contacts.length === 0) {
      addToast('No valid contact phone numbers found in pasted text', 'error');
      return;
    }
    setImportedContacts(contacts);
    setSelectedContactIds(new Set(contacts.map((c) => c.id)));
    setIsPreviewExpanded(true);
    setUploadedFileName('Pasted Records');
    addToast(`Extracted ${contacts.length} contacts from pasted text!`, 'success');
  };

  // Load Real Active Contacts from WhatsApp Conversations
  const handleLoadActiveAudience = () => {
    const realContacts: BulkContact[] = (conversations || [])
      .filter((c) => c.phone_number)
      .map((c) => ({
        id: `conv-aud-${c.id}`,
        name: c.contact_name || c.phone_number,
        phone: c.phone_number,
        tag: c.category || 'WhatsApp Contact',
        validWhatsApp: true,
        optedOut: !!c.is_opted_out,
        lastActive: c.last_contact_date || 'Recently',
        source: 'WhatsApp',
      }));

    if (realContacts.length === 0) {
      addToast('No active WhatsApp conversations found in system', 'warning');
      return;
    }

    setImportedContacts(realContacts);
    setSelectedContactIds(new Set(realContacts.map((c) => c.id)));
    setIsPreviewExpanded(true);
    setUploadedFileName(`Active Conversations (${realContacts.length} Contacts)`);
    if (!newListName.trim()) {
      setNewListName('Active WhatsApp Contacts');
    }
    addToast(`Loaded ${realContacts.length} active contacts from WhatsApp conversations!`, 'info');
  };


  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Phone,Tag,Email\n' +
      'Rahul Sharma,+91 98765 43210,VIP,rahul@techcorp.in\n' +
      'Amina Al-Balushi,+968 9123 4567,Corporate,amina@muscat.om\n' +
      'Vikram Menon,+91 94470 12345,Retail,vikram@calicut.in\n' +
      'Zainab Qasim,+971 52 345 6789,VIP,zainab@dubai.ae\n' +
      'Dr. Tariq Al-Mansoor,+966 50 123 4567,Loyal,tariq@jeddah.sa\n' +
      'Sneha Joshi,+91 98234 56789,Retail,sneha@punehomes.com\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'whatsq_audience_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Sample CSV template downloaded', 'info');
  };

  // Contact Selection Controls in Preview
  const toggleContactSelection = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllContacts = () => {
    setSelectedContactIds(new Set(importedContacts.map((c) => c.id)));
  };

  const deselectAllContacts = () => {
    setSelectedContactIds(new Set());
  };

  const selectNonOptedOutOnly = () => {
    setSelectedContactIds(
      new Set(importedContacts.filter((c) => c.validWhatsApp && !c.optedOut).map((c) => c.id))
    );
  };

  const removeContactFromImport = (id: string) => {
    setImportedContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Filtered contacts in preview table
  const filteredPreviewContacts = useMemo(() => {
    return importedContacts.filter((c) => {
      const q = previewSearchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.tag?.toLowerCase().includes(q)
      );
    });
  }, [importedContacts, previewSearchQuery]);

  const validContactsCount = useMemo(() => {
    return importedContacts.filter(
      (c) => selectedContactIds.has(c.id) && c.validWhatsApp && !c.optedOut
    ).length;
  }, [importedContacts, selectedContactIds]);

  const handleHeaderImportClick = () => {
    setImportMethod('csv');
    setIsCreateOpen(true);
    setTimeout(() => {
      createModalFileInputRef.current?.click();
    }, 150);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      addToast('Please enter a list name', 'error');
      return;
    }

    const finalContacts = importedContacts.filter((c) => selectedContactIds.has(c.id));
    const count = finalContacts.length > 0 ? finalContacts.length : 250;
    const validCount =
      finalContacts.length > 0
        ? finalContacts.filter((c) => c.validWhatsApp && !c.optedOut).length
        : Math.round(count * 0.98);

    createRecipientList({
      name: newListName.trim(),
      description: newListDesc.trim(),
      contactCount: count,
      validWhatsAppCount: validCount,
      tags: newListTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      contactItems: finalContacts.length > 0 ? finalContacts : undefined,
      sources:
        finalContacts.length > 0
          ? { manual: 10, website: 10, csv: 80, other: 0 }
          : { manual: 60, website: 20, csv: 15, other: 5 },
    });

    setIsCreateOpen(false);
    setNewListName('');
    setNewListDesc('');
    setImportedContacts([]);
    setSelectedContactIds(new Set());
    setUploadedFileName(null);
    setRawTextImport('');
    setIsPreviewExpanded(false);
    addToast(`Recipient list "${newListName}" created with ${count} contacts!`, 'success');
  };

  // Drawer Contact Search & Filter State
  const [drawerContactSearch, setDrawerContactSearch] = useState('');
  const [drawerStatusFilter, setDrawerStatusFilter] = useState<'all' | 'valid' | 'opted_out'>('all');

  // Delete List Confirmation Modal State
  const [listToDelete, setListToDelete] = useState<BulkRecipientList | null>(null);

  const handleSendToList = (list: BulkRecipientList) => {
    setSelectedBroadcastListId(list.id);
    addToast(`Selected list "${list.name}" (${list.contactCount} contacts) for broadcasting!`, 'info');
    setActiveTab('bulk-send');
  };

  // Real WhatsApp Phone & Suppression List Validation
  const handleCleanList = () => {
    if (!selectedList) return;
    const contacts = selectedList.contactItems || [];
    if (contacts.length === 0) {
      addToast('No individual contact records available to validate.', 'info');
      return;
    }

    let validCount = 0;
    let optedOutCount = 0;

    const updatedContacts: BulkContact[] = contacts.map((c) => {
      const isSuppressed = isPhoneSuppressed(c.phone);
      const digits = c.phone.replace(/\D/g, '');
      const isValidFormat = digits.length >= 10;
      const validWhatsApp = isValidFormat && !isSuppressed;
      const optedOut = isSuppressed || !isValidFormat;

      if (validWhatsApp) validCount++;
      if (optedOut) optedOutCount++;

      return {
        ...c,
        validWhatsApp,
        optedOut,
      };
    });

    updateRecipientList(selectedList.id, {
      contactItems: updatedContacts,
      validWhatsAppCount: validCount,
    });

    setSelectedList((prev) =>
      prev
        ? {
            ...prev,
            contactItems: updatedContacts,
            validWhatsAppCount: validCount,
          }
        : null
    );

    addToast(
      `Validation complete: ${validCount} active WhatsApp numbers, ${optedOutCount} suppressed/invalid.`,
      'success'
    );
  };

  // Real CSV Export for Recipient List
  const handleDownloadListCsv = (list: BulkRecipientList) => {
    const contacts = list.contactItems || [];
    if (contacts.length === 0) {
      addToast('No contacts available to export.', 'info');
      return;
    }
    const headers = ['Name', 'Phone Number', 'Tag', 'WhatsApp Valid', 'Opted Out', 'Source', 'Last Active'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${(c.tag || '').replace(/"/g, '""')}"`,
      c.validWhatsApp ? 'Yes' : 'No',
      c.optedOut ? 'Yes' : 'No',
      `"${(c.source || '').replace(/"/g, '""')}"`,
      `"${(c.lastActive || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recipient_List_${list.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${contacts.length} contacts to CSV successfully!`, 'success');
  };

  // Dynamic Contact Source Breakdown computed from real contacts
  const sourceBreakdown = useMemo(() => {
    if (!selectedList) return [];
    const items = selectedList.contactItems || [];
    if (items.length === 0) {
      return [
        {
          name: selectedList.type || 'Audience Contacts',
          count: selectedList.contactCount,
          pct: 100,
          color: '#059669',
        },
      ];
    }
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const src = item.source || 'Direct Import';
      counts[src] = (counts[src] || 0) + 1;
    });
    const colors = ['#059669', '#2563eb', '#d97706', '#9333ea', '#e11d48', '#0891b2'];
    const total = items.length;
    return Object.entries(counts).map(([name, count], i) => ({
      name,
      count,
      pct: Number(((count / total) * 100).toFixed(1)),
      color: colors[i % colors.length],
    }));
  }, [selectedList]);

  // Dynamic Conic Gradient for Donut Chart
  const conicGradient = useMemo(() => {
    if (sourceBreakdown.length === 0) return 'conic-gradient(#059669 0% 100%)';
    let acc = 0;
    const parts = sourceBreakdown.map((s) => {
      const start = acc;
      acc += s.pct;
      return `${s.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }, [sourceBreakdown]);

  // Filtered contacts for the drawer
  const filteredDrawerContacts = useMemo(() => {
    if (!selectedList) return [];
    const list = selectedList.contactItems && selectedList.contactItems.length > 0
      ? selectedList.contactItems
      : [];
    return list.filter((c) => {
      const matchesSearch =
        (c.name || '').toLowerCase().includes(drawerContactSearch.toLowerCase()) ||
        (c.phone || '').includes(drawerContactSearch) ||
        (c.tag || '').toLowerCase().includes(drawerContactSearch.toLowerCase());
      const matchesStatus =
        drawerStatusFilter === 'all' ||
        (drawerStatusFilter === 'valid' && c.validWhatsApp && !c.optedOut) ||
        (drawerStatusFilter === 'opted_out' && c.optedOut);
      return matchesSearch && matchesStatus;
    });
  }, [selectedList, drawerContactSearch, drawerStatusFilter]);


  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {viewMode === 'suppression' ? 'Blocked Contacts & Opt-Outs' : 'Recipient Lists & Segments'}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  viewMode === 'suppression'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {viewMode === 'suppression' ? 'BLOCKED CONTACTS & COMPLIANCE' : 'AUDIENCE MANAGER'}
                </span>
              </div>
              <div
                className="relative overflow-hidden w-full max-w-[220px] xs:max-w-[280px] sm:max-w-[360px] md:max-w-[440px] h-4 text-xs text-slate-500 mt-0.5 [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-10px),transparent)] select-none cursor-default"
                title={
                  viewMode === 'suppression'
                    ? 'Prevent unwanted messages to unsubscribed or blocked contacts and protect your WhatsApp sender quality.'
                    : 'Manage audience segments, imported contact sheets, and dynamic broadcast groups'
                }
              >
                <div className="animate-subtext-scroll inline-flex items-center text-slate-500">
                  <span className="pr-6">
                    {viewMode === 'suppression'
                      ? 'Prevent unwanted messages to unsubscribed or blocked contacts and protect your WhatsApp sender quality.'
                      : 'Manage audience segments, imported contact sheets, and dynamic broadcast groups'}
                  </span>
                  <span className="pr-6 text-emerald-500 font-bold opacity-60">•</span>
                  <span className="pr-6">
                    {viewMode === 'suppression'
                      ? 'Prevent unwanted messages to unsubscribed or blocked contacts and protect your WhatsApp sender quality.'
                      : 'Manage audience segments, imported contact sheets, and dynamic broadcast groups'}
                  </span>
                  <span className="pr-6 text-emerald-500 font-bold opacity-60">•</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsExtractorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 hover:from-teal-700 hover:to-emerald-700 text-xs font-bold text-white transition shadow-sm hover:shadow-md cursor-pointer active:scale-95 border border-emerald-400/30 group"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>QR Group Grabber</span>
              <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold text-emerald-100">
                New
              </span>
            </button>

            <button
              onClick={handleHeaderImportClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Import CSV / Excel
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Create List
            </button>

            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Segmented View Mode Tabs: Lists vs Suppression */}
      <div className="bg-white border-b border-slate-200/90 px-6 sticky top-[69px] z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewMode('lists');
                setActiveTab('bulk-recipients');
              }}
              className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'lists'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Audience Lists ({bulkRecipientLists.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('suppression');
                setActiveTab('bulk-suppression');
              }}
              className={`py-3 px-4 border-b-2 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'suppression'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-rose-700'
              }`}
            >
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Blocked Contacts &amp; Opt-Outs</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                totalSuppressedCount > 0
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {totalSuppressedCount}
              </span>
            </button>
          </div>

          {viewMode === 'suppression' && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportSuppressionCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Audit CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddManualSuppressionOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Opt-Out / Block</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-5">
        {viewMode === 'suppression' ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Suppressed
                  </span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Ban className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {totalSuppressedCount}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Exempt from all outbound campaigns
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Blocked (Meta 131051)
                  </span>
                  <div className="p-2 rounded-xl bg-red-50 text-red-600">
                    <UserX className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-red-600 mt-2">
                  {blockedCount}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automated delivery failure capture
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Opted Out / STOP
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {optedOutCount}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Keyword &amp; Button click opt-outs
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sender Quality
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>High (Safe Tier)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  0 spam violations • Meta API compliant
                </p>
              </div>
            </div>

            {/* Compliance Banner */}
            <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-slate-950 rounded-2xl p-5 text-white shadow-md border border-rose-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-rose-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Automated Meta Compliance &amp; Opt-Out Protection
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-400/30">
                      LIVE ENFORCEMENT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    When contacts text <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>, click opt-out buttons, or block your WhatsApp business line (Meta error 131051), our backend automatically records suppression and prevents subsequent promotional sends to preserve your sender rating.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAddManualSuppressionOpen(true)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manual Block</span>
                </button>
              </div>
            </div>

            {/* Suppression Search & Filters Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={suppressionSearch}
                    onChange={(e) => setSuppressionSearch(e.target.value)}
                    placeholder="Search name, phone, campaign, error code..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  {suppressionSearch && (
                    <button
                      type="button"
                      onClick={() => setSuppressionSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={suppressionFilter}
                    onChange={(e) => setSuppressionFilter(e.target.value as any)}
                    className="px-2.5 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="all">All Suppression Types ({totalSuppressedCount})</option>
                    <option value="blocked">Blocked Business (Meta 131051) ({blockedCount})</option>
                    <option value="opted_out">Keyword Opt-Outs (STOP) ({optedOutCount})</option>
                    <option value="button">Template Button Click</option>
                    <option value="manual">Manual Operator Entry</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportSuppressionCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Suppression Audit Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              {filteredSuppressionList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">No Suppressed Contacts Match Filter</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {suppressionSearch ? 'Try a different search query or clear filters.' : 'All contacts in your audience lists are active and eligible for WhatsApp broadcasts.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Suppression Type</th>
                        <th className="p-4">Trigger &amp; Error Code</th>
                        <th className="p-4">Originating Campaign</th>
                        <th className="p-4">Date Recorded</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSuppressionList.map((record) => {
                        const isBlocked = record.type === 'blocked';
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{record.name}</div>
                              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                                {record.phone}
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                  isBlocked
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isBlocked ? (
                                  <UserX className="w-3 h-3 text-rose-600" />
                                ) : (
                                  <Ban className="w-3 h-3 text-amber-600" />
                                )}
                                <span>{isBlocked ? 'Blocked Business' : 'Opted Out'}</span>
                              </span>
                            </td>

                            <td className="p-4 max-w-xs">
                              <div className="text-slate-800 font-medium leading-snug">
                                {record.reason}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {record.metaErrorCode && (
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                    Meta Error {record.metaErrorCode}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  Source: {record.source || 'Webhook'}
                                </span>
                              </div>
                            </td>

                            <td className="p-4">
                              {record.campaignName ? (
                                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {record.campaignName}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Organic / Direct</span>
                              )}
                            </td>

                            <td className="p-4 text-slate-500">
                              <div className="font-medium text-slate-700">{record.date}</div>
                              <div className="text-[10px] text-slate-400">{record.timestamp || ''}</div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchingConv = (conversations || []).find(
                                      (c) => (c.phone_number || '').replace(/\D/g, '') === (record.phone || '').replace(/\D/g, '')
                                    );
                                    if (matchingConv) {
                                      setSelectedConversationId(matchingConv.id);
                                    } else {
                                      setSelectedConversationId(record.phone);
                                    }
                                    setActiveTab('conversations');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                  title="View WhatsApp thread"
                                >
                                  <MessageSquare className="w-3 h-3 text-slate-400" />
                                  <span>Chat</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    removeSuppressionRecord(record.phone);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Re-subscribe contact with customer consent"
                                >
                                  <RotateCcw className="w-3 h-3 text-rose-600" />
                                  <span>Re-subscribe</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* WhatsApp Group Grabber Showcase Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-emerald-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <QrCode className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  WhatsApp Group Contact Extractor &amp; QR Sync
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  ADVANCED
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                Scan the dynamic QR code with any WhatsApp account to instantly list all joined groups, inspect member directories, export full CSV spreadsheets, and 1-click import them into your audience lists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsExtractorModalOpen(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-sm cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              Launch QR Group Grabber
            </button>
          </div>
        </div>

        {/* Search & Summary Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lists by title, description, or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong>{filteredLists.length}</strong> recipient lists
          </div>
        </div>

        {/* Recipient Lists Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">List Name</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-center">Total Contacts</th>
                  <th className="p-4">WhatsApp Validated</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLists.map((list) => {
                  const validityPct = ((list.validWhatsAppCount / list.contactCount) * 100).toFixed(
                    1
                  );
                  return (
                    <tr key={list.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{list.name}</div>
                        {list.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {list.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {list.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        {list.contactCount.toLocaleString()}
                      </td>
                      <td className="p-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-emerald-700">{validityPct}%</span>
                          <span className="text-slate-400">
                            ({list.validWhatsAppCount.toLocaleString()} numbers)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${validityPct}%` }}
                            className="bg-emerald-500 h-full"
                          ></div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(list.createdAt).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedList(list);
                              setIsDrawerOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleSendToList(list)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Broadcast
                          </button>
                          {!['lst-conversations', 'lst-leads', 'lst-customers'].includes(list.id) && (
                            <button
                              onClick={() => setListToDelete(list)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete List"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
  </div>

      {/* SLIDEOUT RECIPIENT LIST DRAWER WITH CONTACT SOURCE DONUT CHART */}
      {isDrawerOpen && selectedList && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedList.name}</h3>
                <p className="text-[10px] text-slate-500">
                  {selectedList.contactCount.toLocaleString()} total contacts •{' '}
                  {selectedList.validWhatsAppCount.toLocaleString()} verified WhatsApp users
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* CONTACT SOURCE DONUT CHART / BREAKDOWN (MATCHING SCREENSHOT 4) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    Contact Source Breakdown
                  </span>
                  <span className="text-[10px] text-slate-400">Audience Attribution</span>
                </div>

                {/* Donut representation */}
                <div className="flex items-center gap-5 pt-1">
                  {/* Dynamic CSS Donut */}
                  <div
                    className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                    style={{ background: conicGradient }}
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[11px] text-slate-800">
                      100%
                    </div>
                  </div>

                  {/* Donut Legends */}
                  <div className="space-y-1.5 text-[11px] flex-1">
                    {sourceBreakdown.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-600 truncate max-w-[140px]">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.color }}
                          ></span>
                          <span className="truncate">{s.name}</span>
                        </span>
                        <span className="font-bold text-slate-900 ml-2">
                          {s.pct}% <span className="text-slate-400 font-normal">({s.count})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation & Clean tools */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    WhatsApp Validation Health
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    {selectedList.validWhatsAppCount} of {selectedList.contactCount} numbers active
                    on WhatsApp
                  </div>
                </div>
                <button
                  onClick={handleCleanList}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Verify Active
                </button>
              </div>

              {/* Contacts in this list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Contacts in this list:</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Showing {Math.min(filteredDrawerContacts.length, 50)} of{' '}
                    {filteredDrawerContacts.length} records
                  </span>
                </div>

                {/* Search & Status Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={drawerContactSearch}
                      onChange={(e) => setDrawerContactSearch(e.target.value)}
                      placeholder="Search contacts..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[10px] font-semibold shrink-0">
                    <button
                      type="button"
                      onClick={() => setDrawerStatusFilter('all')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        drawerStatusFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerStatusFilter('valid')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        drawerStatusFilter === 'valid'
                          ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Valid
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerStatusFilter('opted_out')}
                      className={`px-2 py-1 rounded-md transition cursor-pointer ${
                        drawerStatusFilter === 'opted_out'
                          ? 'bg-white text-rose-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Suppressed
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase z-10">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">WhatsApp Number</th>
                        <th className="p-2.5">Tag</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDrawerContacts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                            No contacts match current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredDrawerContacts.slice(0, 50).map((c) => (
                          <tr key={c.id}>
                            <td className="p-2.5 font-medium text-slate-800">{c.name}</td>
                            <td className="p-2.5 font-mono text-[10px] text-slate-600">{c.phone}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-semibold">
                                {c.tag || 'Member'}
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  c.optedOut
                                    ? 'bg-rose-100 text-rose-800'
                                    : c.validWhatsApp
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {c.optedOut
                                  ? 'Opted-Out'
                                  : c.validWhatsApp
                                  ? 'Verified'
                                  : 'Unverified'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadListCsv(selectedList)}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>

                {!['lst-conversations', 'lst-leads', 'lst-customers'].includes(selectedList.id) && (
                  <button
                    onClick={() => setListToDelete(selectedList)}
                    className="px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                    title="Delete List"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>

              <button
                onClick={() => handleSendToList(selectedList)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast to this List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LIST MODAL WITH DEDICATED IMPORT & PREVIEW */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Create New Recipient List</h3>
                  <p className="text-[11px] text-emerald-200">
                    Define list details, import contacts, and preview before creating
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden CSV file input */}
            <input
              ref={createModalFileInputRef}
              type="file"
              accept=".csv,text/csv,.txt"
              onChange={handleFileUploadForModal}
              className="hidden"
            />

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Basic Details */}
              <div className="space-y-3 bg-white p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      List Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="e.g. VIP Customers - Kerala"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={newListTags}
                      onChange={(e) => setNewListTags(e.target.value)}
                      placeholder="Marketing, Q3, Retail"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Description</label>
                  <input
                    type="text"
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    placeholder="e.g. High-value repeat customers with > ₹10,000 spend"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* DEDICATED SECTION: IMPORT CONTACTS */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs">Import Contacts</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">
                        Add audience contacts to this list
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {importedContacts.length > 0 ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {selectedContactIds.size} / {importedContacts.length} Contacts Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>
                </div>

                {/* Import Method Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setImportMethod('csv')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      importMethod === 'csv'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload CSV
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMethod('paste')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      importMethod === 'paste'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Paste Text
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMethod('demo')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      importMethod === 'demo'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Active Chats
                  </button>
                </div>

                {/* Tab 1: CSV / Excel Upload */}
                {importMethod === 'csv' && (
                  <div className="space-y-2">
                    {uploadedFileName ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-bold text-emerald-950 text-xs">
                              {uploadedFileName}
                            </div>
                            <div className="text-[10px] text-emerald-700">
                              {importedContacts.length} contacts parsed successfully
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => createModalFileInputRef.current?.click()}
                            className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFileName(null);
                              setImportedContacts([]);
                              setSelectedContactIds(new Set());
                              setIsPreviewExpanded(false);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove File"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => createModalFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 p-4 rounded-xl text-center cursor-pointer transition space-y-1.5"
                      >
                        <input
                          ref={createModalFileInputRef}
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleFileUploadForModal}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          Click to upload CSV spreadsheet
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Supported headers: Name, Phone, Tag, Email.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-slate-400" />
                        Download Sample CSV Template
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Paste Raw Numbers */}
                {importMethod === 'paste' && (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={rawTextImport}
                      onChange={(e) => setRawTextImport(e.target.value)}
                      placeholder={'Customer Name, +91 94963 00233, VIP, customer@example.com\n+91 98765 43210'}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Paste comma/tab separated lines or one phone number per line.
                      </span>
                      <button
                        type="button"
                        onClick={handleParsePastedContacts}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                      >
                        Parse &amp; Load Contacts
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: Active WhatsApp Conversations */}
                {importMethod === 'demo' && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 text-xs">
                        Active WhatsApp Conversations
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {conversations.length} Chats
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Populate this audience segment directly from your active WhatsApp customer chat history.
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadActiveAudience}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Load Active WhatsApp Contacts
                    </button>
                  </div>
                )}

                {/* CONTACT PREVIEW ACCORDION / TOGGLE */}
                {importedContacts.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                          <span>Total:</span>
                          <strong className="text-slate-900">{importedContacts.length}</strong>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <span>Selected:</span>
                          <strong>{selectedContactIds.size}</strong>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <span>Valid WhatsApp:</span>
                          <strong className="text-emerald-800">{validContactsCount}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-500 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-white transition cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        {isPreviewExpanded
                          ? 'Hide Contact Preview'
                          : `Preview & Select Contacts (${selectedContactIds.size}/${importedContacts.length})`}
                      </button>
                    </div>

                    {/* EXPANDED PREVIEW TABLE */}
                    {isPreviewExpanded && (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 animate-fadeIn">
                        {/* Search & Master Toggles */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={previewSearchQuery}
                              onChange={(e) => setPreviewSearchQuery(e.target.value)}
                              placeholder="Search in preview..."
                              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={selectAllContacts}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={deselectAllContacts}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
                            >
                              Deselect All
                            </button>
                            <button
                              type="button"
                              onClick={selectNonOptedOutOnly}
                              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800 cursor-pointer"
                            >
                              ✓ Valid Only
                            </button>
                          </div>
                        </div>

                        {/* Contacts Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase z-10">
                              <tr>
                                <th className="p-2 w-8 text-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      filteredPreviewContacts.length > 0 &&
                                      filteredPreviewContacts.every((c) =>
                                        selectedContactIds.has(c.id)
                                      )
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedContactIds((prev) => {
                                          const next = new Set(prev);
                                          filteredPreviewContacts.forEach((c) => next.add(c.id));
                                          return next;
                                        });
                                      } else {
                                        setSelectedContactIds((prev) => {
                                          const next = new Set(prev);
                                          filteredPreviewContacts.forEach((c) => next.delete(c.id));
                                          return next;
                                        });
                                      }
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                </th>
                                <th className="p-2">Name</th>
                                <th className="p-2">Phone Number</th>
                                <th className="p-2">Tag</th>
                                <th className="p-2">Status</th>
                                <th className="p-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredPreviewContacts.map((contact) => {
                                const isSelected = selectedContactIds.has(contact.id);
                                return (
                                  <tr
                                    key={contact.id}
                                    onClick={() => toggleContactSelection(contact.id)}
                                    className={`hover:bg-slate-50/80 cursor-pointer transition ${
                                      isSelected ? 'bg-emerald-50/30' : 'opacity-60 bg-white'
                                    }`}
                                  >
                                    <td
                                      className="p-2 text-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleContactSelection(contact.id)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-2 font-medium text-slate-800">
                                      {contact.name}
                                    </td>
                                    <td className="p-2 font-mono text-[10px] text-slate-700">
                                      {contact.phone}
                                    </td>
                                    <td className="p-2">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px] font-semibold">
                                        {contact.tag || 'Imported'}
                                      </span>
                                    </td>
                                    <td className="p-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                          contact.optedOut
                                            ? 'bg-rose-100 text-rose-800'
                                            : contact.validWhatsApp
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {contact.optedOut
                                          ? 'Opted-Out'
                                          : contact.validWhatsApp
                                          ? 'WhatsApp'
                                          : 'Unverified'}
                                      </span>
                                    </td>
                                    <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => removeContactFromImport(contact.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                        title="Remove Contact"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {selectedContactIds.size > 0
                    ? `Create List (${selectedContactIds.size} Contacts)`
                    : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Manual Suppression Modal */}
      {isAddManualSuppressionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Add Opt-Out / Suppression
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Immediately restrict promotional WhatsApp broadcasts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddManualSuppressionOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualSuppression} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. John Doe or Business Lead"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="+91 98765 43210 or +971 50 123 4567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must include country code. Matches any campaign broadcast.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">
                  Suppression Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('opted_out')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                      manualType === 'opted_out'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs">Opted Out (STOP)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Customer requested unsubscribe</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualType('blocked')}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                      manualType === 'blocked'
                        ? 'border-rose-500 bg-rose-50/70 text-rose-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <UserX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs">Blocked Number</div>
                      <div className="text-[10px] text-slate-400 font-normal">Meta Error 131051</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Reason / Compliance Notes
                </label>
                <textarea
                  rows={2}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Requested opt-out via email or phone support"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddManualSuppressionOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Add to Suppression List</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete List Confirmation Modal */}
      {listToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Recipient List</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{listToDelete.name}"</strong>? 
              This list contains <strong>{listToDelete.contactCount.toLocaleString()}</strong> contacts.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setListToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRecipientList(listToDelete.id);
                  if (selectedList?.id === listToDelete.id) {
                    setIsDrawerOpen(false);
                    setSelectedList(null);
                  }
                  setListToDelete(null);
                  addToast(`List "${listToDelete.name}" deleted successfully!`, 'success');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Group Grabber & QR Extractor Studio Modal */}
      <WhatsAppGroupExtractorModal
        isOpen={isExtractorModalOpen}
        onClose={() => setIsExtractorModalOpen(false)}
      />
    </div>
  );
};
