import React, { useState, useMemo, useRef } from 'react';
import {
  Send,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  Play,
  Save,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  CheckCheck,
  Download,
  Upload,
  File,
  Image as ImageIcon,
  Video,
  Search,
  X,
  Check,
  Eye,
  Filter,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkContact, BulkRecipientList, BulkTemplateItem } from '../../../types';
import { getSampleContactsForList } from '../../../store/bulkData';
import { MetaWalletCard } from './MetaWalletCard';
import { WhatsAppGuidelinesModal } from './WhatsAppGuidelinesModal';
import { SidebarToggle } from '../../layout/SidebarToggle';

export const BulkSendMessageView: React.FC = () => {
  const {
    bulkCampaigns,
    bulkRecipientLists,
    bulkTemplates,
    metaWallet,
    sendBulkMessage,
    createScheduledMessage,
    importContactsToRecipientList,
    addToast,
    setActiveTab,
    requestSendConfirmation,
  } = useQiyamStore();

  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Form states
  const [campaignName, setCampaignName] = useState('Diwali Mega Sale 2024');
  const [category, setCategory] = useState<'marketing' | 'utility' | 'authentication'>('marketing');
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-09-18T10:00');
  const [selectedListId, setSelectedListId] = useState<string>(
    bulkRecipientLists[0]?.id || 'lst-1'
  );
  const [selectedTags, setSelectedTags] = useState<string>('VIP, Loyal');
  const [excludeOptOuts, setExcludeOptOuts] = useState<boolean>(true);

  // Contacts Selection & Exclusion Modal states
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Record<string, Set<string>>>({});
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');
  const [contactsTagFilter, setContactsTagFilter] = useState('all');

  // CSV Import State
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content states
  const [messageType, setMessageType] = useState<'template' | 'freeform'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    bulkTemplates[0]?.id || 'tmpl-1'
  );
  const [variable1, setVariable1] = useState('Valued Customer');
  const [variable2, setVariable2] = useState('FESTIVE30');
  const [variable3, setVariable3] = useState('Sunday Midnight');
  const [freeformText, setFreeformText] = useState(
    'Hello {{name}}, thank you for choosing Qiyam Ventures! Enjoy 30% off today using code FESTIVE30.'
  );

  // Dispatch & safety
  const [dispatchSpeed, setDispatchSpeed] = useState<number>(60); // msgs / min
  const [isSending, setIsSending] = useState(false);

  // Active selected list
  const activeList: BulkRecipientList = useMemo(() => {
    return (
      bulkRecipientLists.find((l) => l.id === selectedListId) ||
      bulkRecipientLists[0] || {
        id: 'list-default',
        name: 'All Active Contacts',
        contactCount: 500,
        validWhatsAppCount: 490,
        createdAt: '2026-09-01',
        tags: ['Active', 'General'],
        contactItems: [],
      }
    );
  }, [bulkRecipientLists, selectedListId]);

  // Contact list items for active list
  const currentListContacts: BulkContact[] = useMemo(() => {
    if (activeList.contactItems && activeList.contactItems.length > 0) {
      return activeList.contactItems;
    }
    return getSampleContactsForList(activeList.id, activeList.name);
  }, [activeList]);

  // Current list's selected contact IDs
  const activeSelectedIds = useMemo(() => {
    if (selectedContactIds[activeList.id]) {
      return selectedContactIds[activeList.id];
    }
    // Default: all valid WhatsApp contacts
    const defaultSelected = new Set<string>();
    currentListContacts.forEach((c) => {
      if (!excludeOptOuts || (c.validWhatsApp && !c.optedOut)) {
        defaultSelected.add(c.id);
      }
    });
    return defaultSelected;
  }, [selectedContactIds, activeList.id, currentListContacts, excludeOptOuts]);

  // Filtered contacts within the View Full Contacts modal
  const filteredContactsList = useMemo(() => {
    return currentListContacts.filter((c) => {
      const q = contactsSearchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.tag?.toLowerCase().includes(q);

      const matchesTag =
        contactsTagFilter === 'all' ||
        (c.tag && c.tag.toLowerCase() === contactsTagFilter.toLowerCase());

      return matchesQuery && matchesTag;
    });
  }, [currentListContacts, contactsSearchQuery, contactsTagFilter]);

  // Active selected template
  const activeTemplate: BulkTemplateItem = useMemo(() => {
    return (
      bulkTemplates.find((t) => t.id === selectedTemplateId) ||
      bulkTemplates[0] || {
        id: 'tmpl-1',
        name: 'festive_promo_v2',
        language: 'en_US',
        category: 'marketing',
        bodyText:
          'Hello {{1}}, our Diwali Super Saver is live! Use code {{2}} to get 30% OFF on all services until {{3}}. Tap below to claim.',
        headerType: 'IMAGE',
        headerContent: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
        footerText: 'Reply STOP to unsubscribe',
        buttons: [{ type: 'URL', text: 'Shop Now' }],
        status: 'APPROVED',
      }
    );
  }, [bulkTemplates, selectedTemplateId]);

  // Cost calculation based strictly on selected contacts
  const audienceCount = activeSelectedIds.size;
  const costPerConv = metaWallet.conversationPricing[category] || 0.78;
  const estimatedCost = audienceCount * costPerConv;
  const hasEnoughFunds = metaWallet.balance >= estimatedCost;

  // Live preview text generator
  const livePreviewBody = useMemo(() => {
    if (messageType === 'freeform') {
      return freeformText.replace('{{name}}', variable1);
    }
    let text = activeTemplate.bodyText || '';
    text = text.replace(/\{\{1\}\}/g, variable1);
    text = text.replace(/\{\{2\}\}/g, variable2);
    text = text.replace(/\{\{3\}\}/g, variable3);
    return text;
  }, [messageType, freeformText, activeTemplate, variable1, variable2, variable3]);

  // CSV File Upload & Parser
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingCsv(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          addToast('CSV file is empty or missing data rows', 'error');
          setIsImportingCsv(false);
          return;
        }

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

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(/[,;\t]/).map((cell) => cell.trim().replace(/['"]/g, ''));
          if (row.length < 1 || !row.some((cell) => cell.length > 0)) continue;

          let name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : row[0] || `Contact ${i}`;
          let phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : row[1] || row[0];
          let tag = tagIdx !== -1 && row[tagIdx] ? row[tagIdx] : 'Imported CSV';
          let email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : undefined;

          // Standardize phone format
          let cleanPhone = phone.replace(/[^0-9+]/g, '');
          if (cleanPhone.length === 10 && !cleanPhone.startsWith('+')) {
            cleanPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
          } else if (!cleanPhone.startsWith('+') && cleanPhone.length > 10) {
            cleanPhone = `+${cleanPhone}`;
          }

          if (cleanPhone.length >= 7) {
            parsedContacts.push({
              id: `imported-${Date.now()}-${i}`,
              name,
              phone: cleanPhone,
              email,
              tag,
              validWhatsApp: true,
              optedOut: false,
              source: 'CSV Import',
              lastActive: 'Just now',
            });
          }
        }

        if (parsedContacts.length === 0) {
          addToast('Could not extract any valid contact numbers from CSV', 'error');
          setIsImportingCsv(false);
          return;
        }

        const baseFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const listName = `Imported: ${baseFileName} (${parsedContacts.length})`;
        const newList = importContactsToRecipientList(listName, parsedContacts);

        // Auto-select this newly created list
        setSelectedListId(newList.id);

        // Pre-select all imported contacts
        const allIds = new Set(parsedContacts.map((c) => c.id));
        setSelectedContactIds((prev) => ({
          ...prev,
          [newList.id]: allIds,
        }));

        addToast(
          `Imported ${parsedContacts.length} contacts from "${file.name}"! Now targeted for dispatch.`,
          'success'
        );
      } catch (err) {
        addToast('Failed to parse CSV file. Please verify CSV format.', 'error');
      } finally {
        setIsImportingCsv(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  // Sample CSV Downloader
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
    link.setAttribute('download', 'whatsq_bulk_recipients_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Sample CSV template downloaded successfully', 'info');
  };

  // Extract available unique tags for filtering in the full contacts modal
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    currentListContacts.forEach((c) => {
      if (c.tag) tags.add(c.tag);
    });
    return Array.from(tags);
  }, [currentListContacts]);

  // Contact Selection Controls
  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds((prev) => {
      const currentSet = new Set(prev[activeList.id] || activeSelectedIds);
      if (currentSet.has(contactId)) {
        currentSet.delete(contactId);
      } else {
        currentSet.add(contactId);
      }
      return {
        ...prev,
        [activeList.id]: currentSet,
      };
    });
  };

  const selectAllContacts = () => {
    const allSet = new Set(currentListContacts.map((c) => c.id));
    setSelectedContactIds((prev) => ({
      ...prev,
      [activeList.id]: allSet,
    }));
    addToast(`Selected all ${allSet.size} contacts in list`, 'info');
  };

  const deselectAllContacts = () => {
    setSelectedContactIds((prev) => ({
      ...prev,
      [activeList.id]: new Set<string>(),
    }));
    addToast('Deselected all contacts', 'info');
  };

  const selectActiveOnly = () => {
    const activeSet = new Set(
      currentListContacts.filter((c) => c.validWhatsApp && !c.optedOut).map((c) => c.id)
    );
    setSelectedContactIds((prev) => ({
      ...prev,
      [activeList.id]: activeSet,
    }));
    addToast(`Selected ${activeSet.size} valid & non-opted out contacts`, 'info');
  };

  // Handle Launch Broadcast
  const handleLaunch = () => {
    if (!campaignName.trim()) {
      addToast('Please enter a campaign name', 'error');
      return;
    }

    if (audienceCount === 0) {
      addToast('No recipients selected. Please select at least 1 contact.', 'error');
      return;
    }

    if (!hasEnoughFunds) {
      addToast(
        `Insufficient Meta Wallet balance (₹${metaWallet.balance.toFixed(
          2
        )}). Requires ₹${estimatedCost.toFixed(2)}. Please top up funds.`,
        'error'
      );
      return;
    }

    const campaignPreviewText = messageType === 'template'
      ? (activeTemplate.bodyText || activeTemplate.body || `Template: ${activeTemplate.name}`)
      : freeformText;

    requestSendConfirmation({
      title: sendType === 'schedule' ? 'Schedule WhatsApp Campaign?' : 'Launch WhatsApp Broadcast Campaign?',
      subtitle: sendType === 'schedule'
        ? `Confirm scheduling campaign "${campaignName}" for ${audienceCount} recipients.`
        : `Confirm broadcasting campaign "${campaignName}" to ${audienceCount} verified customer contacts.`,
      recipientName: `${activeList.name} (${audienceCount} recipients)`,
      recipientPhone: `Estimated Meta API Cost: ₹${estimatedCost.toFixed(2)}`,
      badgeText: category.toUpperCase(),
      badgeColor: 'amber',
      messagePreview: campaignPreviewText,
      metadata: [
        { label: 'Campaign Name', value: campaignName },
        { label: 'Audience Group', value: `${activeList.name} (${audienceCount} contacts)` },
        { label: 'Category', value: category.toUpperCase() },
        { label: 'Wallet Debit', value: `₹${estimatedCost.toFixed(2)}` },
        { label: 'Timing', value: sendType === 'schedule' ? `Scheduled for ${scheduledDateTime}` : 'Immediate Broadcast' },
      ],
      confirmLabel: sendType === 'schedule' ? 'Confirm & Schedule Campaign' : 'Confirm & Launch Broadcast Now',
      onConfirm: () => {
        setIsSending(true);

        if (sendType === 'schedule') {
          createScheduledMessage({
            campaignName,
            recipientGroupId: activeList.id,
            recipientGroupName: `${activeList.name} (${audienceCount} selected)`,
            recipientCount: audienceCount,
            scheduledFor: scheduledDateTime,
            templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Message',
            category,
            estimatedCost,
          });
          setIsSending(false);
          addToast(`Campaign scheduled successfully for ${scheduledDateTime}!`, 'success');
          setActiveTab('bulk-scheduled');
        } else {
          setTimeout(() => {
            sendBulkMessage({
              name: campaignName,
              category,
              audienceListName: `${activeList.name} (${audienceCount} selected)`,
              totalRecipients: audienceCount,
              templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Broadcast',
              cost: estimatedCost,
            });
            setIsSending(false);
            addToast(
              `Campaign "${campaignName}" launched successfully to ${audienceCount} selected contacts!`,
              'success'
            );
            setActiveTab('bulk-campaigns');
          }, 1000);
        }
      },
    });
  };

  const handleTestSend = () => {
    addToast('Test message dispatched to your verified admin WhatsApp number!', 'info');
  };

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
                  WhatsApp Bulk Messaging
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  META CLOUD API
                </span>
              </div>
              <div
                className="relative overflow-hidden w-full max-w-[220px] xs:max-w-[280px] sm:max-w-[360px] md:max-w-[440px] h-4 text-xs text-slate-500 mt-0.5 [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-10px),transparent)] select-none cursor-default"
                title="Broadcast marketing campaigns, transactional alerts, and customer notifications at scale"
              >
                <div className="animate-subtext-scroll inline-flex items-center text-slate-500">
                  <span className="pr-6">Broadcast marketing campaigns, transactional alerts, and customer notifications at scale</span>
                  <span className="pr-6 text-emerald-500 font-bold opacity-60">•</span>
                  <span className="pr-6">Broadcast marketing campaigns, transactional alerts, and customer notifications at scale</span>
                  <span className="pr-6 text-emerald-500 font-bold opacity-60">•</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              View Guidelines
            </button>

            {/* Top Compact Wallet Indicator with Edit Button */}
            <MetaWalletCard compact={true} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: 4-STEP DISPATCH FORM */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: Message Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Message Details</h3>
                  <p className="text-[11px] text-slate-500">
                    Define campaign identity, category, and delivery timing
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Diwali Mega Sale 2024"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Campaign Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="marketing">Marketing (₹0.78 / conv)</option>
                      <option value="utility">Utility (₹0.30 / conv)</option>
                      <option value="authentication">Authentication (₹0.12 / conv)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Delivery Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSendType('now')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                          sendType === 'now'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Send Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendType('schedule')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                          sendType === 'schedule'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>

                {sendType === 'schedule' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <label className="block font-semibold text-blue-900 text-[11px]">
                      Select Broadcast Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Audience Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              {/* Hidden file input for CSV contacts */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Audience Selection</h3>
                    <p className="text-[11px] text-slate-500">
                      Target segmented recipient lists, import CSV files, and filter contacts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-600 transition cursor-pointer"
                    title="Download template CSV format"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    Sample CSV
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800 transition cursor-pointer shadow-2xs"
                  >
                    {isImportingCsv ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                    Import CSV Contacts
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Recipient List
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {bulkRecipientLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name} ({list.validWhatsAppCount} active numbers)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Filter by Tags (Optional)
                    </label>
                    <input
                      type="text"
                      value={selectedTags}
                      onChange={(e) => setSelectedTags(e.target.value)}
                      placeholder="e.g. VIP, High-Value"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* View Full Contacts & Click to Select/Deselect Bar */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <span>{activeList.name}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          {audienceCount} of {currentListContacts.length} Selected
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Click below to view full contacts, check/uncheck recipients who should not receive this broadcast
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsContactsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 font-bold text-xs text-slate-700 shadow-2xs transition cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    View Full Contacts ({currentListContacts.length})
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">Exclude Opt-Out Contacts</span>
                    <p className="text-[10px] text-slate-500">
                      Automatically skip contacts who sent STOP or revoked marketing consent
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeOptOuts}
                      onChange={(e) => setExcludeOptOuts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-semibold text-emerald-950">
                      Target Audience:{' '}
                      <strong className="text-emerald-900">{audienceCount.toLocaleString()} selected contacts</strong>{' '}
                      <span className="text-slate-500 font-normal">
                        (out of {currentListContacts.length.toLocaleString()} total)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsContactsModalOpen(true)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Select / Deselect Contacts
                    </button>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      98.6% Deliverability
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Message Content */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Message Content</h3>
                  <p className="text-[11px] text-slate-500">
                    Choose an approved Meta template or dynamic session message
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Tabs for Template vs Freeform */}
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMessageType('template')}
                    className={`pb-2 px-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      messageType === 'template'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Meta Approved Template (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageType('freeform')}
                    className={`pb-2 px-3 font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      messageType === 'freeform'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Freeform Session Message (24h Window)
                  </button>
                </div>

                {messageType === 'template' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Select Approved Template
                      </label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        {bulkTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category.toUpperCase()} -{' '}
                            {t.headerType === 'DOCUMENT'
                              ? '📄 PDF'
                              : t.headerType === 'IMAGE'
                              ? '🖼️ IMG'
                              : 'TEXT'}
                            ) - {t.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Attached Media Header Information */}
                    {activeTemplate.headerType === 'DOCUMENT' && (
                      <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-red-950 flex items-center gap-2">
                              <span>📄 Attached PDF Document</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-200 text-red-800">
                                {activeTemplate.headerFileSize || '2.4 MB'}
                              </span>
                            </div>
                            <div className="text-[11px] text-red-700 font-mono mt-0.5">
                              {activeTemplate.headerFileName || 'Document.pdf'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Meta Verified
                        </span>
                      </div>
                    )}
                    {activeTemplate.headerType === 'IMAGE' && activeTemplate.headerContent && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center gap-3 text-xs shadow-2xs">
                        <div className="w-12 h-10 rounded-lg bg-indigo-100 border border-indigo-200 overflow-hidden shrink-0">
                          <img
                            src={activeTemplate.headerContent}
                            alt="Header"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-indigo-950">🖼️ Attached Image Header</div>
                          <div className="text-[10px] text-indigo-600 truncate max-w-xs">
                            {activeTemplate.headerContent}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template Variable Mappers */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Dynamic Template Variables
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Variable {'{{1}}'} (Name)
                          </label>
                          <input
                            type="text"
                            value={variable1}
                            onChange={(e) => setVariable1(e.target.value)}
                            placeholder="Customer Name"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Variable {'{{2}}'} (Offer Code)
                          </label>
                          <input
                            type="text"
                            value={variable2}
                            onChange={(e) => setVariable2(e.target.value)}
                            placeholder="e.g. FESTIVE30"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                            Variable {'{{3}}'} (Expiry / Date)
                          </label>
                          <input
                            type="text"
                            value={variable3}
                            onChange={(e) => setVariable3(e.target.value)}
                            placeholder="e.g. Sunday Midnight"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Freeform Message Body
                    </label>
                    <textarea
                      rows={4}
                      value={freeformText}
                      onChange={(e) => setFreeformText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Note: Freeform broadcast is only delivered to contacts who messaged your
                      business within the past 24 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 4: Dispatch & Safety */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dispatch & Safety Controls</h3>
                  <p className="text-[11px] text-slate-500">
                    Anti-ban throttling, cost projection, and execution
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1 font-semibold text-slate-800">
                    <span>Dispatch Speed Limit:</span>
                    <span className="text-emerald-700 font-bold">{dispatchSpeed} msgs / min</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={dispatchSpeed}
                    onChange={(e) => setDispatchSpeed(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Safe Warm-up (10/min)</span>
                    <span>Standard (60/min)</span>
                    <span>High Throughput (120/min)</span>
                  </div>
                </div>

                {/* Cost Estimation Box */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Estimated Audience:</span>
                    <span className="font-bold text-white">
                      {audienceCount.toLocaleString()} recipients
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Category Conversation Rate:</span>
                    <span className="font-bold text-white">₹{costPerConv.toFixed(2)} / conv</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Total Meta Wallet Deduction</div>
                      <div className="text-lg font-black text-emerald-400">
                        ₹{estimatedCost.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Available Wallet Balance</div>
                      <div
                        className={`text-xs font-bold ${
                          hasEnoughFunds ? 'text-emerald-300' : 'text-rose-400'
                        }`}
                      >
                        ₹{metaWallet.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLaunch}
                    disabled={isSending || !hasEnoughFunds}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer ${
                      hasEnoughFunds
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Launching Broadcast...
                      </>
                    ) : sendType === 'schedule' ? (
                      <>
                        <Calendar className="w-4 h-4" />
                        Schedule Campaign
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        🚀 Launch Campaign
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSend}
                    className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition cursor-pointer shadow-xs"
                  >
                    Send Test
                  </button>

                  <button
                    type="button"
                    onClick={() => addToast('Draft saved successfully', 'info')}
                    className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition cursor-pointer shadow-xs"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>

            {/* RECENT CAMPAIGNS SUMMARY TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">Recent Broadcast Campaigns</h4>
                <button
                  onClick={() => setActiveTab('bulk-campaigns')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All History <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="pb-2">Campaign</th>
                      <th className="pb-2">Recipients</th>
                      <th className="pb-2">Delivered</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkCampaigns.slice(0, 3).map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-semibold text-slate-800">{camp.name}</td>
                        <td className="py-2.5 text-slate-500">{camp.totalRecipients.toLocaleString()}</td>
                        <td className="py-2.5 text-emerald-700 font-bold">
                          {((camp.deliveredCount / camp.totalRecipients) * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {camp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: META WALLET CARD + LIVE WHATSAPP PREVIEW */}
          <div className="lg:col-span-5 space-y-5">
            {/* Dedicated Meta Business Wallet Card with Edit button */}
            <MetaWalletCard />

            {/* Realistic WhatsApp Chat Bubble Preview */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800">Live WhatsApp Preview</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Customer Screen View</span>
              </div>

              {/* Phone Mockup Frame */}
              <div className="rounded-2xl border-4 border-slate-800 bg-[#ECE5DD] p-3 shadow-md max-w-sm mx-auto overflow-hidden">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-2.5 -m-3 mb-3 flex items-center justify-between rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                      Q
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-tight">Qiyam Business Solutions</div>
                      <div className="text-[9px] text-emerald-200">Official Business Account</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>

                {/* WhatsApp Message Bubble */}
                <div className="bg-white rounded-xl rounded-tl-xs shadow-xs p-3.5 space-y-2 text-slate-800 text-xs border border-slate-200/80">
                  {/* Header Media: PDF Document */}
                  {activeTemplate.headerType === 'DOCUMENT' && (
                    <div className="bg-[#f0f2f5] border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 mb-2 shadow-2xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden text-left">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {activeTemplate.headerFileName || 'Document.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span>PDF Document</span>
                            <span>•</span>
                            <span>{activeTemplate.headerFileSize || '2.4 MB'}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs hover:bg-slate-100 cursor-pointer shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Header Media: Image */}
                  {activeTemplate.headerType === 'IMAGE' && activeTemplate.headerContent && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 mb-2">
                      <img
                        src={activeTemplate.headerContent}
                        alt="Header"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Header Media: Video */}
                  {activeTemplate.headerType === 'VIDEO' && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 text-white flex flex-col items-center justify-center gap-1 mb-2">
                      <Video className="w-8 h-8 text-white/80" />
                      <span className="text-[10px] text-white/70">Video Preview</span>
                    </div>
                  )}

                  {/* Body text with live replacements */}
                  <div className="whitespace-pre-line leading-relaxed text-slate-900 text-[12px]">
                    {livePreviewBody}
                  </div>

                  {/* Footer */}
                  {activeTemplate.footerText && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      {activeTemplate.footerText}
                    </div>
                  )}

                  {/* Timestamp & double blue ticks */}
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-0.5">
                    <span>10:45 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>

                  {/* Interactive CTA buttons */}
                  {activeTemplate.buttons && activeTemplate.buttons.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {activeTemplate.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full py-1.5 text-center text-xs font-bold text-[#00a884] bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-center text-[10px] text-slate-400">
                Variables like <code className="bg-slate-100 px-1 py-0.5 rounded">{'{{1}}'}</code>{' '}
                are mapped uniquely for each contact.
              </div>
            </div>

            {/* Guidelines & Anti-spam Tips Card */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Meta Broadcast Best Practices
              </div>
              <ul className="text-[11px] text-emerald-900 space-y-1 list-disc list-inside">
                <li>Keep opt-out rate under 2% to preserve High Quality Tier.</li>
                <li>Avoid URL shorteners (bit.ly); use direct branded domains.</li>
                <li>Honor Indian DND (Do Not Disturb) windows between 9 PM and 9 AM.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Guidelines Modal */}
      <WhatsAppGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Full Contacts Selection & Review Modal */}
      {isContactsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Recipient Contacts — {activeList.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {audienceCount} of {currentListContacts.length} Selected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click checkboxes to select or deselect specific contacts who should receive this broadcast
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContactsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Control Bar */}
            <div className="p-4 bg-white border-b border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactsSearchQuery}
                    onChange={(e) => setContactsSearchQuery(e.target.value)}
                    placeholder="Search by name, phone (+91...), email, or tag..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  {contactsSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setContactsSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Tag Filter */}
                {availableTags.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={contactsTagFilter}
                      onChange={(e) => setContactsTagFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                    >
                      <option value="all">All Tags ({availableTags.length})</option>
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag}>
                          Tag: {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Master Actions & Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllContacts}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                  >
                    Select All ({currentListContacts.length})
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllContacts}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={selectActiveOnly}
                    className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition cursor-pointer shadow-2xs"
                  >
                    ✓ Non-Opted Out Only
                  </button>
                </div>

                <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
                  <span>
                    Showing <strong>{filteredContactsList.length}</strong> of{' '}
                    <strong>{currentListContacts.length}</strong> contacts
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">
                    Est. Cost: ₹{estimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contacts Table List */}
            <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-slate-100">
              {filteredContactsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No contacts match your search or filter</p>
                  <p className="text-[11px]">Try clearing your search query or tag filter</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredContactsList.length > 0 &&
                            filteredContactsList.every((c) => activeSelectedIds.has(c.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContactIds((prev) => {
                                const newSet = new Set(prev[activeList.id] || activeSelectedIds);
                                filteredContactsList.forEach((c) => newSet.add(c.id));
                                return { ...prev, [activeList.id]: newSet };
                              });
                            } else {
                              setSelectedContactIds((prev) => {
                                const newSet = new Set(prev[activeList.id] || activeSelectedIds);
                                filteredContactsList.forEach((c) => newSet.delete(c.id));
                                return { ...prev, [activeList.id]: newSet };
                              });
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">Contact Name</th>
                      <th className="py-2.5 px-3">WhatsApp Number</th>
                      <th className="py-2.5 px-3">Tag / Segment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContactsList.map((contact) => {
                      const isSelected = activeSelectedIds.has(contact.id);
                      return (
                        <tr
                          key={contact.id}
                          onClick={() => toggleContactSelection(contact.id)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition ${
                            isSelected ? 'bg-emerald-50/30' : 'opacity-60 bg-white'
                          }`}
                        >
                          <td
                            className="py-3 px-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleContactSelection(contact.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{contact.name}</div>
                            {contact.email && (
                              <div className="text-[10px] text-slate-400">{contact.email}</div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-800 font-semibold">
                              {contact.phone}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {contact.tag ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {contact.tag}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {contact.optedOut ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                Opted-Out
                              </span>
                            ) : contact.validWhatsApp ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Valid WhatsApp
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? 'text-emerald-700 bg-emerald-100'
                                  : 'text-slate-400 bg-slate-100'
                              }`}
                            >
                              {isSelected ? 'Included' : 'Excluded'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">{audienceCount}</span> contacts will receive
                this broadcast. Total Estimated Cost:{' '}
                <strong className="text-emerald-700">₹{estimatedCost.toFixed(2)}</strong>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsContactsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Apply & Confirm ({audienceCount} Selected)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
