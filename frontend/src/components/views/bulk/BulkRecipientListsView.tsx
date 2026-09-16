import React, { useState, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkRecipientList, BulkContact } from '../../../types';
import { getSampleContactsForList } from '../../../store/bulkData';
import { MetaWalletCard } from './MetaWalletCard';
import { SidebarToggle } from '../../layout/SidebarToggle';
import { WhatsAppGroupExtractorModal } from './WhatsAppGroupExtractorModal';

export const BulkRecipientListsView: React.FC = () => {
  const { bulkRecipientLists, createRecipientList, setActiveTab, addToast } = useQiyamStore();

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

  // Load Demo Contacts
  const handleLoadDemoAudience = () => {
    const samplePool = getSampleContactsForList('lst-new', newListName || 'New Segment');
    setImportedContacts(samplePool);
    setSelectedContactIds(new Set(samplePool.map((c) => c.id)));
    setIsPreviewExpanded(true);
    setUploadedFileName('Verified Business Pool (25 Contacts)');
    if (!newListName.trim()) {
      setNewListName('Qiyam VIP & High-Value Clients');
    }
    addToast('Loaded 25 verified business contacts with tags!', 'info');
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

  const handleSendToList = (list: BulkRecipientList) => {
    addToast(`Selected list "${list.name}" for broadcasting!`, 'info');
    setActiveTab('bulk-send');
  };

  const handleCleanList = () => {
    addToast('Contact numbers validated against Meta WhatsApp Phone API!', 'success');
  };

  // Contacts for the drawer
  const currentDrawerContacts = useMemo(() => {
    if (!selectedList) return [];
    if (selectedList.contactItems && selectedList.contactItems.length > 0) {
      return selectedList.contactItems;
    }
    return getSampleContactsForList(selectedList.id, selectedList.name);
  }, [selectedList]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <SidebarToggle />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Recipient Lists & Segments
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AUDIENCE MANAGER
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage audience segments, imported contact sheets, and dynamic broadcast groups
              </p>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-5">
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
                  {/* Visual CSS Donut */}
                  <div className="relative w-20 h-20 rounded-full bg-[conic-gradient(#059669_0%_42%,#2563eb_42%_70%,#d97706_70%_88%,#9333ea_88%_100%)] flex items-center justify-center shrink-0 shadow-xs">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[11px] text-slate-800">
                      100%
                    </div>
                  </div>

                  {/* Donut Legends */}
                  <div className="space-y-1 text-[11px] flex-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        CRM Leads
                      </span>
                      <span className="font-bold text-slate-900">42%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        Website Signups
                      </span>
                      <span className="font-bold text-slate-900">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        Manual Import (CSV)
                      </span>
                      <span className="font-bold text-slate-900">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        POS Billing Sync
                      </span>
                      <span className="font-bold text-slate-900">12%</span>
                    </div>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Contacts in this list:</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Showing {Math.min(currentDrawerContacts.length, 12)} of{' '}
                    {selectedList.contactCount} records
                  </span>
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
                      {currentDrawerContacts.slice(0, 12).map((c) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => addToast('Exporting cleaned recipient sheet (.csv)...', 'info')}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>

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
                    Demo Audience
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
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                          {isParsingFile ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </div>
                        <div className="font-bold text-slate-800 text-xs">
                          Click to browse CSV spreadsheet or drag &amp; drop
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Supports headers: Name, Phone, Tag, Email. Indian numbers automatically formatted.
                        </div>
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
                      placeholder={'Rahul Sharma, +91 98765 43210, VIP, rahul@gmail.com\nAmina Al-Balushi, +968 9123 4567, Corporate\n+91 94470 12345'}
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

                {/* Tab 3: Demo Audience Pool */}
                {importMethod === 'demo' && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 text-xs">
                        Instant Verified Sample Audience
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        25 Records
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Populate this list with verified contacts containing varied tags (VIP, Retail, Corporate) and real Kerala / UAE / Oman phone numbers for instant test broadcasts.
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadDemoAudience}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-lg text-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Load 25 Demo Contacts
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

      {/* WhatsApp Group Grabber & QR Extractor Studio Modal */}
      <WhatsAppGroupExtractorModal
        isOpen={isExtractorModalOpen}
        onClose={() => setIsExtractorModalOpen(false)}
      />
    </div>
  );
};
