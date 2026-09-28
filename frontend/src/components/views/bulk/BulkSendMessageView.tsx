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
  ChevronDown,
  HelpCircle,
  RefreshCw,
  CheckCheck,
  Download,
  Upload,
  File as FileIcon,
  Image as ImageIcon,
  Video,
  Search,
  X,
  Check,
  Eye,
  Filter,
  UserPlus,
  Phone,
  Plus,
  Link2,
  RotateCcw,
  Edit3,
  ImagePlus,
  UploadCloud,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { BulkContact, BulkRecipientList, BulkTemplateItem } from '../../../types';
import { MetaWalletCard } from './MetaWalletCard';
import { WhatsAppGuidelinesModal } from './WhatsAppGuidelinesModal';
import { SidebarToggle } from '../../layout/SidebarToggle';
import { CountryPhoneInput } from '../../common/CountryPhoneInput';

export interface MarketingImagePreset {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
}

export const MARKETING_IMAGE_PRESETS: MarketingImagePreset[] = [
  {
    id: 'festival_sale',
    title: 'Festival & Mega Sale',
    category: 'Sales & Discounts',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    description: 'Vibrant festive shopping banner with promotional gift boxes',
  },
  {
    id: 'special_offer',
    title: 'Super Offers & Flash Deals',
    category: 'Special Offers',
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80',
    description: 'Black Friday & special weekend discount theme with stylish graphics',
  },
  {
    id: 'grand_opening',
    title: 'Grand Launch & Event',
    category: 'Events & Launch',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description: 'Executive celebration & grand opening ceremony visual',
  },
  {
    id: 'corporate_consulting',
    title: 'Corporate & Business Growth',
    category: 'Corporate',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    description: 'Professional modern corporate workspace & financial consulting',
  },
  {
    id: 'retail_shopping',
    title: 'New Season & Retail Boutique',
    category: 'E-commerce',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    description: 'Fashion retail, new collection launch, and luxury shopping',
  },
  {
    id: 'tech_gadgets',
    title: 'Smart Tech & Gadgets Showcase',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    description: 'Premium electronics, gadgets and modern product presentation',
  },
];

interface ExtractedVariable {
  index: number;
  key: string;
  label: string;
  sample: string;
}

const extractTemplateVariables = (bodyText: string, bodyVariables?: Record<string, string>): ExtractedVariable[] => {
  if (!bodyText) return [];
  const matches = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g));
  const seen = new Set<number>();
  const list: ExtractedVariable[] = [];

  for (const m of matches) {
    const num = parseInt(m[1], 10);
    if (seen.has(num)) continue;
    seen.add(num);

    let label = `Variable {{${num}}}`;
    const escaped = `\\{\\{${num}\\}\\}`;

    // Pattern 1: "Label: {{num}}" or "Label - {{num}}"
    const colonMatch = bodyText.match(new RegExp(`([A-Za-z0-9\\s/&_#\\-\\(\\)]{2,35})[:\\-–]\\s*${escaped}`, 'i'));
    if (colonMatch && colonMatch[1]) {
      label = colonMatch[1].trim();
    } else {
      // Pattern 2: "Hello {{num}}" or "Hi {{num}}" or "Dear {{num}}"
      const greetingMatch = bodyText.match(new RegExp(`(?:Hello|Hi|Dear|Welcome)\\s+${escaped}`, 'i'));
      if (greetingMatch || num === 1) {
        label = 'Customer / Recipient Name';
      }
    }

    label = label.charAt(0).toUpperCase() + label.slice(1);

    const sample =
      bodyVariables?.[String(num)] ||
      (num === 1
        ? 'Customer Name'
        : label.toLowerCase().includes('date')
        ? 'Tomorrow'
        : label.toLowerCase().includes('time')
        ? '10:30 AM'
        : label.toLowerCase().includes('service')
        ? 'Comprehensive Service'
        : label.toLowerCase().includes('reason')
        ? 'Customer requested reschedule'
        : label.toLowerCase().includes('amount') || label.toLowerCase().includes('price')
        ? '1,200'
        : label.toLowerCase().includes('id') || label.toLowerCase().includes('booking')
        ? 'BK-2026-001'
        : `Value ${num}`);

    list.push({
      index: num,
      key: String(num),
      label,
      sample,
    });
  }

  // If no {{num}} in bodyText but bodyVariables has keys
  if (list.length === 0 && bodyVariables && typeof bodyVariables === 'object') {
    Object.keys(bodyVariables).forEach((k) => {
      const num = parseInt(k, 10);
      if (!isNaN(num)) {
        list.push({
          index: num,
          key: k,
          label: `Variable {{${k}}}`,
          sample: bodyVariables[k] || `Value ${k}`,
        });
      }
    });
  }

  return list.sort((a, b) => a.index - b.index);
};

/**
 * Automatically optimizes an image file on an in-memory Canvas before uploading to server.
 * Resizes large camera photos down to a crisp ~200-400KB WebP or JPEG image,
 * ensuring fast upload and zero HTTP 413 Payload Too Large errors.
 */
const compressImageFile = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> => {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml' || file.size < 200 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + (mimeType === 'image/png' ? '.png' : '.jpg');
            const compressedFile = new File([blob], cleanName, { type: mimeType });
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const BulkSendMessageView: React.FC = () => {
  const {
    bulkCampaigns,
    bulkRecipientLists,
    bulkTemplates,
    metaWallet,
    metaConfig,
    sendBulkMessage,
    uploadCampaignMedia,
    createScheduledMessage,
    importContactsToRecipientList,
    fetchBulkTemplates,
    fetchBulkCampaigns,
    addToast,
    setActiveTab,
    requestSendConfirmation,
    draftCampaign,
    setDraftCampaign,
    selectedBroadcastListId,
    setSelectedBroadcastListId,
    selectedBulkTemplateId,
    setSelectedBulkTemplateId,
    updateRecipientList,
  } = useQiyamStore();

  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [category, setCategory] = useState<'marketing' | 'utility' | 'authentication'>('marketing');
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-09-25T10:00');
  const [selectedListId, setSelectedListId] = useState<string>(
    bulkRecipientLists[0]?.id || ''
  );
  const [selectedTags, setSelectedTags] = useState<string>('');
  const [excludeOptOuts, setExcludeOptOuts] = useState<boolean>(true);

  // Auto-populate when selecting a list from /bulk/recipients
  React.useEffect(() => {
    if (selectedBroadcastListId) {
      setSelectedListId(selectedBroadcastListId);
      setSelectedBroadcastListId(null);
    }
  }, [selectedBroadcastListId, setSelectedBroadcastListId]);

  // Auto-populate when selecting a template from /bulk/templates
  React.useEffect(() => {
    if (selectedBulkTemplateId) {
      setSelectedTemplateId(selectedBulkTemplateId);
      setMessageType('template');
      setSelectedBulkTemplateId(null);
    }
  }, [selectedBulkTemplateId, setSelectedBulkTemplateId]);

  // Auto-populate when repeating/duplicating an existing campaign
  React.useEffect(() => {
    if (draftCampaign) {
      if (draftCampaign.name) setCampaignName(draftCampaign.name);
      if (draftCampaign.category) {
        const cat = draftCampaign.category.toLowerCase();
        if (cat === 'marketing' || cat === 'utility' || cat === 'authentication') {
          setCategory(cat as any);
        }
      }
      if (draftCampaign.templateName) {
        setMessageType('template');
        const foundTmpl = bulkTemplates.find(
          (t) => t.name.toLowerCase() === draftCampaign.templateName?.toLowerCase()
        );
        if (foundTmpl) setSelectedTemplateId(foundTmpl.id);
      } else if (draftCampaign.messageText) {
        setMessageType('freeform');
        setFreeformText(draftCampaign.messageText);
      }
      if (draftCampaign.audienceListName) {
        const foundList = bulkRecipientLists.find(
          (l) => l.name.toLowerCase() === draftCampaign.audienceListName?.toLowerCase()
        );
        if (foundList) setSelectedListId(foundList.id);
      }
      if (draftCampaign.sendType === 'schedule') {
        setSendType('schedule');
        if (draftCampaign.scheduledDateTime) {
          setScheduledDateTime(draftCampaign.scheduledDateTime);
        }
      }
      setDraftCampaign(null);
    }
  }, [draftCampaign, bulkTemplates, bulkRecipientLists, setDraftCampaign]);

  // Contacts Selection & Exclusion Modal states
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Record<string, Set<string>>>({});
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');
  const [contactsTagFilter, setContactsTagFilter] = useState('all');

  // Add New Customer/Number to Broadcast states
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactTag, setNewContactTag] = useState('');
  const [newlyAddedContactId, setNewlyAddedContactId] = useState<string | null>(null);

  // Test Send Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState(
    metaConfig?.business_phone_display || '+91 94963 00233'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  // CSV Import State
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content states
  const [messageType, setMessageType] = useState<'template' | 'freeform'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    bulkTemplates[0]?.id || ''
  );
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({
    '1': '{{name}}',
    '2': 'OFFER2026',
    '3': 'Sunday Midnight',
  });
  const [freeformText, setFreeformText] = useState(
    'Hello {{name}}, thank you for contacting Qiyam Business Solutions! How may we assist you today?'
  );

  // Dynamic Campaign Header Image states (Meta-approved dynamic media)
  const [customHeaderUrl, setCustomHeaderUrl] = useState<string>('');
  const [isEditImageModalOpen, setIsEditImageModalOpen] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Searchable & Filterable Template Selector states
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateFilterType, setTemplateFilterType] = useState<
    'all' | 'document' | 'image' | 'video' | 'text' | 'buttons'
  >('all');
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const templateSearchInputRef = useRef<HTMLInputElement>(null);

  // Dispatch & safety
  const [dispatchSpeed, setDispatchSpeed] = useState<number>(60); // msgs / min
  const [isSending, setIsSending] = useState(false);

  // Load real templates and campaigns on mount
  React.useEffect(() => {
    fetchBulkTemplates();
    fetchBulkCampaigns();
  }, [fetchBulkTemplates, fetchBulkCampaigns]);

  // Sync selectedListId when recipient lists load
  React.useEffect(() => {
    if (bulkRecipientLists.length > 0) {
      const exists = bulkRecipientLists.some((l) => l.id === selectedListId);
      if (!selectedListId || !exists) {
        setSelectedListId(bulkRecipientLists[0].id);
      }
    }
  }, [bulkRecipientLists, selectedListId]);

  // Sync selectedTemplateId when templates load
  React.useEffect(() => {
    if (bulkTemplates.length > 0) {
      const exists = bulkTemplates.some((t) => t.id === selectedTemplateId);
      if (!selectedTemplateId || !exists) {
        setSelectedTemplateId(bulkTemplates[0].id);
      }
    }
  }, [bulkTemplates, selectedTemplateId]);

  // Click outside to close template dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateDropdownOpen(false);
      }
    };

    if (isTemplateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        templateSearchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTemplateDropdownOpen]);

  // Escape key to close template dropdown
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTemplateDropdownOpen) {
        setIsTemplateDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTemplateDropdownOpen]);

  // Compute counts for filter pills (Docs, Image, Video, Text Only, Buttons)
  const templateCounts = useMemo(() => {
    let all = bulkTemplates.length;
    let docs = 0;
    let images = 0;
    let videos = 0;
    let textOnly = 0;
    let withButtons = 0;

    bulkTemplates.forEach((t) => {
      const ht = (t.headerType || '').toUpperCase();
      if (ht === 'DOCUMENT') docs++;
      else if (ht === 'IMAGE') images++;
      else if (ht === 'VIDEO') videos++;
      else textOnly++;

      if (t.buttons && t.buttons.length > 0) withButtons++;
    });

    return { all, docs, images, videos, textOnly, withButtons };
  }, [bulkTemplates]);

  // Filter templates list based on search query and selected filter type
  const filteredTemplates = useMemo(() => {
    const q = templateSearchQuery.trim().toLowerCase();

    return bulkTemplates.filter((t) => {
      // 1. Media & Features filter
      const ht = (t.headerType || '').toUpperCase();
      if (templateFilterType === 'document' && ht !== 'DOCUMENT') return false;
      if (templateFilterType === 'image' && ht !== 'IMAGE') return false;
      if (templateFilterType === 'video' && ht !== 'VIDEO') return false;
      if (templateFilterType === 'text' && ht !== '' && ht !== 'TEXT' && ht !== 'NONE') return false;
      if (templateFilterType === 'buttons' && (!t.buttons || t.buttons.length === 0)) return false;

      // 2. Search query filter
      if (q) {
        const nameMatch = t.name.toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        const bodyMatch = (t.bodyText || t.body || '').toLowerCase().includes(q);
        const btnMatch = t.buttons?.some((b) => b.text.toLowerCase().includes(q));
        if (!nameMatch && !catMatch && !bodyMatch && !btnMatch) return false;
      }

      return true;
    });
  }, [bulkTemplates, templateSearchQuery, templateFilterType]);

  // Active selected list
  const activeList: BulkRecipientList = useMemo(() => {
    return (
      bulkRecipientLists.find((l) => l.id === selectedListId) ||
      bulkRecipientLists[0] || {
        id: '',
        name: 'No Recipient List Selected',
        contactCount: 0,
        validWhatsAppCount: 0,
        createdAt: new Date().toISOString(),
        tags: ['General'],
        contactItems: [],
      }
    );
  }, [bulkRecipientLists, selectedListId]);

  // Contact list items for active list
  const currentListContacts: BulkContact[] = useMemo(() => {
    if (activeList.contactItems && activeList.contactItems.length > 0) {
      return activeList.contactItems;
    }
    return [];
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
        id: '',
        name: 'No Template Selected',
        language: 'en_US',
        category: 'marketing',
        bodyText: '',
        status: 'APPROVED',
      }
    );
  }, [bulkTemplates, selectedTemplateId]);

  const extractedVariables = useMemo(() => {
    return extractTemplateVariables(activeTemplate.bodyText || activeTemplate.body || '', activeTemplate.bodyVariables);
  }, [activeTemplate]);

  // Sync template variables when active template changes
  React.useEffect(() => {
    if (extractedVariables.length > 0) {
      setTemplateVariables((prev) => {
        const next: Record<string, string> = { ...prev };
        extractedVariables.forEach((v) => {
          if (!next[v.key]) {
            next[v.key] = v.index === 1 ? '{{name}}' : (v.sample || `Value ${v.index}`);
          }
        });
        return next;
      });
    }
  }, [extractedVariables]);

  // Sync custom header image when active template changes
  React.useEffect(() => {
    if (activeTemplate.headerType === 'IMAGE') {
      const initialImg = activeTemplate.headerContent || '';
      setCustomHeaderUrl(initialImg);
      setImageUrlInput(initialImg);
    } else {
      setCustomHeaderUrl('');
      setImageUrlInput('');
    }
  }, [activeTemplate.id, activeTemplate.headerType, activeTemplate.headerContent]);

  const effectiveHeaderImage = customHeaderUrl || activeTemplate.headerContent || '';
  const isCustomImageActive = !!customHeaderUrl && customHeaderUrl !== activeTemplate.headerContent;

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Process and upload image with client-side compression and human-friendly diagnostics
  const processAndUploadImage = async (file: File) => {
    if (!file) return;

    setImageUploadError(null);

    // Diagnostic validation 1: File type
    if (!file.type.startsWith('image/')) {
      const msg = `Unsupported file format (${file.type || 'unknown'}). Please choose a valid JPG, PNG, or WebP photo.`;
      setImageUploadError(msg);
      addToast(msg, 'error');
      return;
    }

    // Diagnostic validation 2: File size sanity limit
    if (file.size > 20 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `Selected file is too large (${sizeMb} MB). WhatsApp Cloud API enforces a 5MB maximum limit. Please choose an image under 20MB.`;
      setImageUploadError(msg);
      addToast(msg, 'error');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Step 1: Compress high-res camera photos in-browser (reduces 10MB to ~300KB in milliseconds)
      const compressedFile = await compressImageFile(file);

      // Step 2: Upload to dedicated media hosting endpoint via multipart/form-data
      const res = await uploadCampaignMedia(compressedFile);

      if (res && res.success && res.url) {
        setCustomHeaderUrl(res.url);
        setImageUrlInput(res.url);
        setIsEditImageModalOpen(false);
        addToast(
          `Image uploaded and hosted successfully! (${Math.round((res.size || compressedFile.size) / 1024)} KB)`,
          'success'
        );
      } else {
        const errorMsg =
          res?.error ||
          'Failed to upload image to media server. Please check your internet connection and try again.';
        setImageUploadError(errorMsg);
      }
    } catch (err: any) {
      console.error('[processAndUploadImage] Upload error:', err);
      const is413 = err?.message?.includes('413') || String(err).includes('413');
      const errorMsg = is413
        ? 'Image file is too large for the server (HTTP 413). Please choose an image under 5MB or pick a marketing preset.'
        : err?.message || 'Failed to process and upload image. Please try again.';
      setImageUploadError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Input change trigger
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadImage(file);
    }
    e.target.value = '';
  };

  // Drag and drop handlers for image customizer dropzone
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadImage(file);
    }
  };

  // Cost calculation based strictly on selected contacts
  const audienceCount = activeSelectedIds.size;
  const costPerConv = metaWallet.conversationPricing[category] || 0.78;
  const estimatedCost = audienceCount * costPerConv;
  const hasEnoughFunds = metaWallet.balance >= estimatedCost;

  // Live preview text generator
  const livePreviewBody = useMemo(() => {
    if (messageType === 'freeform') {
      return freeformText.replace(/\{\{name\}\}|\[name\]/gi, templateVariables['1'] === '{{name}}' ? 'Arshil' : (templateVariables['1'] || 'Valued Customer'));
    }
    let text = activeTemplate.bodyText || activeTemplate.body || '';
    if (extractedVariables.length > 0) {
      extractedVariables.forEach((v) => {
        let val = templateVariables[v.key];
        if (val === undefined || val === '') {
          val = v.sample || `{{${v.key}}}`;
        }
        if (val === '{{name}}') {
          val = 'Arshil';
        }
        text = text.split(`{{${v.key}}}`).join(val);
      });
    } else {
      text = text.replace(/\{\{1\}\}/g, templateVariables['1'] === '{{name}}' ? 'Arshil' : (templateVariables['1'] || 'Valued Customer'));
      text = text.replace(/\{\{2\}\}/g, templateVariables['2'] || 'OFFER2026');
      text = text.replace(/\{\{3\}\}/g, templateVariables['3'] || 'Sunday Midnight');
    }
    return text;
  }, [messageType, freeformText, activeTemplate, templateVariables, extractedVariables]);

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
      'Customer 1,+91 94963 00233,VIP,customer1@example.com\n' +
      'Customer 2,+91 98765 43210,Retail,customer2@example.com\n';

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

  // Add new customer number directly into the broadcast audience
  const handleAddNewContact = () => {
    const name = newContactName.trim();
    const rawPhone = newContactPhone.trim();

    if (!rawPhone) {
      addToast('Please enter a WhatsApp phone number', 'error');
      return;
    }

    const cleanDigits = rawPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      addToast('Please enter a valid phone number with at least 10 digits', 'error');
      return;
    }

    // Standardize phone format with country code
    let formattedPhone = rawPhone;
    if (!formattedPhone.startsWith('+')) {
      if (cleanDigits.length === 10) {
        formattedPhone = `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`;
      } else {
        formattedPhone = `+${cleanDigits}`;
      }
    }

    // Check if phone number already exists in this list
    const existingContact = currentListContacts.find((c) => {
      const cDigits = c.phone.replace(/\D/g, '');
      return cDigits === cleanDigits || c.phone.trim() === formattedPhone.trim();
    });

    if (existingContact) {
      // Auto-select existing contact
      setSelectedContactIds((prev) => {
        const currentSet = new Set(prev[activeList.id] || activeSelectedIds);
        currentSet.add(existingContact.id);
        return { ...prev, [activeList.id]: currentSet };
      });
      setNewlyAddedContactId(existingContact.id);
      addToast(
        `Contact "${existingContact.name}" (${existingContact.phone}) already exists — selected for broadcast!`,
        'info'
      );
      setIsAddContactOpen(false);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactTag('');
      return;
    }

    const newContactId = `contact-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newContact: BulkContact = {
      id: newContactId,
      name: name || 'New Customer',
      phone: formattedPhone,
      tag: newContactTag.trim() || 'Direct Added',
      validWhatsApp: true,
      optedOut: false,
      source: 'Manual Addition',
      lastActive: 'Just now',
    };

    const updatedContacts = [newContact, ...currentListContacts];
    const validCount = updatedContacts.filter((c) => c.validWhatsApp && !c.optedOut).length;

    // Update list in store
    updateRecipientList(activeList.id, {
      contactItems: updatedContacts,
      contactCount: updatedContacts.length,
      validWhatsAppCount: validCount,
    });

    // Auto-select newly added contact so it is immediately included for broadcast
    setSelectedContactIds((prev) => {
      const currentSet = new Set(prev[activeList.id] || activeSelectedIds);
      currentSet.add(newContactId);
      return { ...prev, [activeList.id]: currentSet };
    });

    setNewlyAddedContactId(newContactId);
    setIsAddContactOpen(false);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactTag('');
    addToast(`Added "${newContact.name}" (${formattedPhone}) and included for broadcast!`, 'success');
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

    if (messageType === 'template' && activeTemplate.status?.toUpperCase() === 'PENDING') {
      addToast(
        `Template "${activeTemplate.name}" is still PENDING Meta approval. Meta Cloud API rejects broadcasts with unapproved templates. Please select an APPROVED template or wait for Meta review.`,
        'warning'
      );
      return;
    }

    if (messageType === 'template' && activeTemplate.status?.toUpperCase() === 'REJECTED') {
      addToast(
        `Template "${activeTemplate.name}" was REJECTED by Meta. Please select an APPROVED template.`,
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
          // Build real contacts list from the selected IDs
          const selectedContacts = currentListContacts
            .filter((c) => activeSelectedIds.has(c.id))
            .map((c) => ({ name: c.name, phone: c.phone }));

          createScheduledMessage({
            campaignName,
            recipientGroupId: activeList.id,
            recipientGroupName: `${activeList.name} (${audienceCount} selected)`,
            recipientCount: audienceCount,
            contacts: selectedContacts,
            scheduledFor: scheduledDateTime,
            templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Message',
            templateId: messageType === 'template' ? activeTemplate.id : undefined,
            messageText: messageType === 'template'
              ? (activeTemplate.bodyText || activeTemplate.body || '')
              : freeformText,
            category,
            estimatedCost,
            templateVariables: messageType === 'template' ? templateVariables : undefined,
            headerUrl: messageType === 'template' ? (customHeaderUrl || activeTemplate.headerContent) : undefined,
          });
          setIsSending(false);
          setActiveTab('bulk-scheduled');
        } else {
          setIsSending(true);
          // Build real contacts list from the selected IDs
          const selectedContacts = currentListContacts
            .filter((c) => activeSelectedIds.has(c.id))
            .map((c) => ({ name: c.name, phone: c.phone }));

          sendBulkMessage({
            name: campaignName,
            category,
            type: category === 'utility' ? 'Utility' : category === 'authentication' ? 'Authentication' : 'Marketing',
            audienceListName: `${activeList.name} (${audienceCount} selected)`,
            totalRecipients: audienceCount,
            templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Broadcast',
            messageText: messageType === 'template'
              ? (activeTemplate.bodyText || activeTemplate.body || '')
              : freeformText,
            contacts: selectedContacts,
            cost: estimatedCost,
            templateVariables: messageType === 'template' ? templateVariables : undefined,
            headerUrl: messageType === 'template' ? (customHeaderUrl || activeTemplate.headerContent) : undefined,
          }).then((result: any) => {
            setIsSending(false);
            if (result?.success) {
              setActiveTab('bulk-campaigns');
            } else {
              const rawErr = result?.error || 'Failed to launch campaign';
              const friendlyErr = rawErr.includes('413')
                ? 'Attached image or campaign payload is too large (HTTP 413). Please choose an image under 5MB or pick a marketing preset.'
                : rawErr;
              addToast(friendlyErr, 'error');
            }
          }).catch((err: any) => {
            setIsSending(false);
            const rawErr = err?.message || 'Failed to launch campaign';
            const friendlyErr = rawErr.includes('413')
              ? 'Attached image or campaign payload is too large (HTTP 413). Please choose an image under 5MB or pick a marketing preset.'
              : rawErr;
            addToast(friendlyErr, 'error');
          });
        }
      },
    });
  };

  const handleTestSend = () => {
    if (!testPhoneNumber) {
      setTestPhoneNumber(metaConfig?.business_phone_display || '+91 94963 00233');
    }
    setIsTestModalOpen(true);
  };

  const executeTestSend = async () => {
    const phone = testPhoneNumber.trim();
    if (!phone || phone.length < 10) {
      addToast('Please enter a valid phone number with country code (e.g. +91 94963 00233)', 'error');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await sendBulkMessage({
        name: `[TEST] ${campaignName || activeTemplate.name || 'Single Test Message'}`,
        category,
        type: category === 'utility' ? 'Utility' : category === 'authentication' ? 'Authentication' : 'Marketing',
        audienceListName: `Test Send to ${phone}`,
        totalRecipients: 1,
        templateName: messageType === 'template' ? activeTemplate.name : 'Freeform Test',
        messageText: livePreviewBody,
        contacts: [{ name: 'Test Recipient', phone }],
        cost: 0,
        templateVariables: messageType === 'template' ? templateVariables : undefined,
        headerUrl: messageType === 'template' ? (customHeaderUrl || activeTemplate.headerContent) : undefined,
      });

      setIsSendingTest(false);
      if (res?.success) {
        addToast(`Real test message sent to ${phone} via WhatsApp gateway!`, 'success');
        setIsTestModalOpen(false);
      } else {
        const rawErr = res?.error || 'Failed to dispatch test message';
        const friendlyErr = rawErr.includes('413')
          ? 'Attached image is too large (HTTP 413). Please select an image under 5MB or choose from our curated presets.'
          : rawErr;
        addToast(friendlyErr, 'error');
      }
    } catch (err: any) {
      setIsSendingTest(false);
      const rawErr = err?.message || 'Failed to dispatch test message';
      const friendlyErr = rawErr.includes('413')
        ? 'Attached image is too large (HTTP 413). Please select an image under 5MB or choose from our curated presets.'
        : rawErr;
      addToast(friendlyErr, 'error');
    }
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
                    placeholder="e.g. Qiyam Special Broadcast 2026"
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
                    {bulkRecipientLists.length > 0 ? (
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
                    ) : (
                      <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600">
                        No recipient lists found. Import CSV above or extract group contacts.
                      </div>
                    )}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-semibold text-slate-800">
                          Select Approved Template
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTab('bulk-templates')}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Manage Templates <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      {bulkTemplates.length > 0 ? (
                        <>
                          {/* Searchable & Filterable Template Combobox */}
                          <div ref={templateDropdownRef} className="relative">
                            {/* Trigger Button */}
                            <button
                              type="button"
                              onClick={() => setIsTemplateDropdownOpen((prev) => !prev)}
                              className={`w-full p-2.5 sm:p-3 text-left border rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer shadow-2xs ${
                                isTemplateDropdownOpen
                                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white'
                                  : activeTemplate.status?.toUpperCase() === 'PENDING'
                                  ? 'border-amber-300 bg-amber-50/20 hover:bg-amber-50/40'
                                  : activeTemplate.status?.toUpperCase() === 'REJECTED'
                                  ? 'border-rose-300 bg-rose-50/20 hover:bg-rose-50/40'
                                  : 'border-slate-300 hover:border-slate-400 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                    activeTemplate.headerType === 'DOCUMENT'
                                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                                      : activeTemplate.headerType === 'IMAGE'
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                      : activeTemplate.headerType === 'VIDEO'
                                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  }`}
                                >
                                  {activeTemplate.headerType === 'DOCUMENT' ? (
                                    <FileText className="w-5 h-5" />
                                  ) : activeTemplate.headerType === 'IMAGE' ? (
                                    <ImageIcon className="w-5 h-5" />
                                  ) : activeTemplate.headerType === 'VIDEO' ? (
                                    <Video className="w-5 h-5" />
                                  ) : (
                                    <MessageSquare className="w-5 h-5" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 text-xs truncate">
                                      {activeTemplate.name || 'Select a Template'}
                                    </span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                      {activeTemplate.category || 'MARKETING'}
                                    </span>
                                    {activeTemplate.headerType === 'DOCUMENT' && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5">
                                        <FileText className="w-2.5 h-2.5" /> PDF Attached
                                      </span>
                                    )}
                                    {activeTemplate.headerType === 'IMAGE' && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-0.5">
                                        <ImageIcon className="w-2.5 h-2.5" /> Image Attached
                                      </span>
                                    )}
                                    {activeTemplate.headerType === 'VIDEO' && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                        <Video className="w-2.5 h-2.5" /> Video Attached
                                      </span>
                                    )}
                                    {(!activeTemplate.headerType || activeTemplate.headerType === 'TEXT' || activeTemplate.headerType === 'NONE') && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                        Text Only
                                      </span>
                                    )}
                                    {activeTemplate.buttons && activeTemplate.buttons.length > 0 && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                        🔘 {activeTemplate.buttons.length} Button{activeTemplate.buttons.length === 1 ? '' : 's'}
                                      </span>
                                    )}
                                    {activeTemplate.status?.toUpperCase() === 'APPROVED' && (
                                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                                        ✓ Meta Approved
                                      </span>
                                    )}
                                    {activeTemplate.status?.toUpperCase() === 'PENDING' && (
                                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                        ⏳ Pending Meta Review
                                      </span>
                                    )}
                                    {activeTemplate.status?.toUpperCase() === 'REJECTED' && (
                                      <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                        ✕ Rejected
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-xl">
                                    {activeTemplate.bodyText || activeTemplate.body || 'No template preview text'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                                  {isTemplateDropdownOpen ? 'Close' : 'Search & Filter'}
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                                    isTemplateDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                                  }`}
                                />
                              </div>
                            </button>

                            {/* Dropdown Popover */}
                            {isTemplateDropdownOpen && (
                              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                {/* 1. Search Bar */}
                                <div className="p-3 border-b border-slate-100 bg-slate-50/80">
                                  <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      ref={templateSearchInputRef}
                                      type="text"
                                      value={templateSearchQuery}
                                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                                      placeholder="Search templates by name, keyword, category, or content..."
                                      className="w-full pl-9 pr-8 py-2 bg-white text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                                    />
                                    {templateSearchQuery && (
                                      <button
                                        type="button"
                                        onClick={() => setTemplateSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* 2. Filter Pills (Docs, Image, Video, Text Only, With Buttons) */}
                                <div className="px-3 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                                    <Filter className="w-3 h-3 text-slate-400" /> Filter:
                                  </span>

                                  {/* All */}
                                  <button
                                    type="button"
                                    onClick={() => setTemplateFilterType('all')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                      templateFilterType === 'all'
                                        ? 'bg-slate-900 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    <span>All</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        templateFilterType === 'all'
                                          ? 'bg-slate-800 text-slate-200'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {templateCounts.all}
                                    </span>
                                  </button>

                                  {/* Docs / PDF Attached */}
                                  <button
                                    type="button"
                                    onClick={() => setTemplateFilterType('document')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                      templateFilterType === 'document'
                                        ? 'bg-rose-600 text-white shadow-2xs'
                                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                                    }`}
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Docs Attached</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        templateFilterType === 'document'
                                          ? 'bg-rose-700 text-rose-100'
                                          : 'bg-rose-200 text-rose-800'
                                      }`}
                                    >
                                      {templateCounts.docs}
                                    </span>
                                  </button>

                                  {/* Images Attached */}
                                  <button
                                    type="button"
                                    onClick={() => setTemplateFilterType('image')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                      templateFilterType === 'image'
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                                    }`}
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                    <span>Images</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        templateFilterType === 'image'
                                          ? 'bg-indigo-700 text-indigo-100'
                                          : 'bg-indigo-200 text-indigo-800'
                                      }`}
                                    >
                                      {templateCounts.images}
                                    </span>
                                  </button>

                                  {/* Videos Attached */}
                                  <button
                                    type="button"
                                    onClick={() => setTemplateFilterType('video')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                      templateFilterType === 'video'
                                        ? 'bg-purple-600 text-white shadow-2xs'
                                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
                                    }`}
                                  >
                                    <Video className="w-3 h-3" />
                                    <span>Videos</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        templateFilterType === 'video'
                                          ? 'bg-purple-700 text-purple-100'
                                          : 'bg-purple-200 text-purple-800'
                                      }`}
                                    >
                                      {templateCounts.videos}
                                    </span>
                                  </button>

                                  {/* Text Only */}
                                  <button
                                    type="button"
                                    onClick={() => setTemplateFilterType('text')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                      templateFilterType === 'text'
                                        ? 'bg-slate-700 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Text Only</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        templateFilterType === 'text'
                                          ? 'bg-slate-600 text-slate-200'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {templateCounts.textOnly}
                                    </span>
                                  </button>

                                  {/* With Buttons */}
                                  <button
                                    type="button"
                                    onClick={() => setTemplateFilterType('buttons')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                      templateFilterType === 'buttons'
                                        ? 'bg-amber-600 text-white shadow-2xs'
                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                                    }`}
                                  >
                                    <span>🔘 With Buttons</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        templateFilterType === 'buttons'
                                          ? 'bg-amber-700 text-amber-100'
                                          : 'bg-amber-200 text-amber-900'
                                      }`}
                                    >
                                      {templateCounts.withButtons}
                                    </span>
                                  </button>
                                </div>

                                {/* 3. Template Items List */}
                                <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 p-1.5">
                                  {filteredTemplates.length === 0 ? (
                                    <div className="py-8 px-4 text-center">
                                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                                        <Search className="w-5 h-5" />
                                      </div>
                                      <p className="text-xs font-bold text-slate-800">
                                        No matching templates found
                                      </p>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        Try adjusting your search query or reset your filters
                                      </p>
                                      {(templateSearchQuery || templateFilterType !== 'all') && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setTemplateSearchQuery('');
                                            setTemplateFilterType('all');
                                          }}
                                          className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                                        >
                                          Clear Search & Filters
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    filteredTemplates.map((t) => {
                                      const isSelected = t.id === selectedTemplateId;
                                      const st = (t.status || 'APPROVED').toUpperCase();
                                      const isApproved = st === 'APPROVED' || st === 'ACTIVE';
                                      const isPending = st === 'PENDING';
                                      const isRejected = st === 'REJECTED';
                                      const ht = (t.headerType || '').toUpperCase();

                                      return (
                                        <div
                                          key={t.id}
                                          onClick={() => {
                                            setSelectedTemplateId(t.id);
                                            setIsTemplateDropdownOpen(false);
                                          }}
                                          className={`p-2.5 rounded-xl transition cursor-pointer flex items-start gap-3 group ${
                                            isSelected
                                              ? 'bg-emerald-50/80 border border-emerald-300 shadow-2xs'
                                              : 'hover:bg-slate-50 border border-transparent'
                                          }`}
                                        >
                                          {/* Selection Radio / Check Indicator */}
                                          <div
                                            className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition ${
                                              isSelected
                                                ? 'bg-emerald-600 text-white shadow-2xs'
                                                : 'border border-slate-300 group-hover:border-slate-400 bg-white'
                                            }`}
                                          >
                                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                          </div>

                                          {/* Template Content */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                              <span
                                                className={`text-xs font-bold ${
                                                  isSelected
                                                    ? 'text-emerald-950 font-extrabold'
                                                    : 'text-slate-900 group-hover:text-emerald-800'
                                                }`}
                                              >
                                                {t.name}
                                              </span>

                                              {/* Category */}
                                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                                {t.category}
                                              </span>

                                              {/* Media Type Badge */}
                                              {ht === 'DOCUMENT' && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5">
                                                  <FileText className="w-2.5 h-2.5" /> PDF
                                                </span>
                                              )}
                                              {ht === 'IMAGE' && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-0.5">
                                                  <ImageIcon className="w-2.5 h-2.5" /> Image
                                                </span>
                                              )}
                                              {ht === 'VIDEO' && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                                  <Video className="w-2.5 h-2.5" /> Video
                                                </span>
                                              )}
                                              {(!ht || ht === 'TEXT' || ht === 'NONE') && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                                  Text Only
                                                </span>
                                              )}

                                              {/* Buttons Tag */}
                                              {t.buttons && t.buttons.length > 0 && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                                  🔘 {t.buttons.length} Button{t.buttons.length === 1 ? '' : 's'}
                                                </span>
                                              )}

                                              {/* Status Badge */}
                                              {isApproved && (
                                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                                                  ✓ Approved
                                                </span>
                                              )}
                                              {isPending && (
                                                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                                  ⏳ Under Review
                                                </span>
                                              )}
                                              {isRejected && (
                                                <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                                  ✕ Rejected
                                                </span>
                                              )}
                                            </div>

                                            {/* Body snippet */}
                                            <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                              {t.bodyText || t.body || '(No preview content available)'}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* 4. Footer Summary Bar */}
                                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                  <span>
                                    Showing <strong>{filteredTemplates.length}</strong> of{' '}
                                    <strong>{bulkTemplates.length}</strong> templates
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsTemplateDropdownOpen(false);
                                      setActiveTab('bulk-templates');
                                    }}
                                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                                  >
                                    Manage Templates Hub <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {activeTemplate.status?.toUpperCase() === 'PENDING' && (
                            <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs animate-in fade-in duration-200">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Template Pending Meta Review</p>
                                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                                  Meta Cloud API strictly rejects sending broadcast messages with templates in <strong>PENDING</strong> status. To broadcast immediately, please select an <strong>APPROVED</strong> template, or wait until Meta finishes review.
                                </p>
                              </div>
                            </div>
                          )}

                          {activeTemplate.status?.toUpperCase() === 'REJECTED' && (
                            <div className="mt-2.5 p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 shadow-2xs animate-in fade-in duration-200">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Template Rejected by Meta</p>
                                <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                                  This template was rejected by Meta review and cannot be used for broadcasts. Please create a new template or select an approved template.
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                          <span>No approved templates found in database.</span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('bulk-templates')}
                            className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 text-[11px] cursor-pointer"
                          >
                            Create / Sync Templates
                          </button>
                        </div>
                      )}
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
                    {activeTemplate.headerType === 'IMAGE' && (
                      <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-200/90 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>Campaign Header Image</span>
                                {isCustomImageActive ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                    Custom Image Active
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    Meta Approved Default
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Dynamic Meta media parameter: swap images freely for every campaign without re-approval
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isCustomImageActive && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomHeaderUrl(activeTemplate.headerContent || '');
                                  setImageUrlInput(activeTemplate.headerContent || '');
                                  addToast('Reset to Meta approved default image', 'info');
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title="Reset to original template default image"
                              >
                                <RotateCcw className="w-3 h-3 text-slate-500" />
                                <span>Reset Default</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setImageModalTab('upload');
                                setIsEditImageModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Replace Image</span>
                            </button>
                          </div>
                        </div>

                        {/* Image Preview & URL Display */}
                        <div className="flex items-center gap-3 p-2 bg-white/90 rounded-lg border border-slate-200">
                          <div
                            onClick={() => setIsEditImageModalOpen(true)}
                            className="relative w-20 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group cursor-pointer"
                            title="Click to replace campaign header image"
                          >
                            {effectiveHeaderImage ? (
                              <img
                                src={effectiveHeaderImage}
                                alt="Header preview"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] gap-0.5">
                                <ImageIcon className="w-4 h-4" />
                                <span>No Image</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                              <Edit3 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-slate-800 flex items-center justify-between">
                              <span className="truncate">
                                {isCustomImageActive
                                  ? effectiveHeaderImage.includes('/media/campaign_headers/')
                                    ? '📁 Uploaded Photo (Hosted on Secure Server)'
                                    : effectiveHeaderImage.startsWith('data:image/')
                                    ? '📁 Uploaded from Device (Local)'
                                    : '🌐 Custom Marketing Image URL'
                                  : '🖼️ Meta Template Approved Default Image'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                              {effectiveHeaderImage.startsWith('data:image/')
                                ? `Base64 Image (${Math.round(effectiveHeaderImage.length / 1024)} KB)`
                                : effectiveHeaderImage || 'No image attached'}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100 flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                Meta API Dynamic Parameter Ready
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hidden file input for fast triggers */}
                        <input
                          type="file"
                          ref={imageFileInputRef}
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </div>
                    )}

                    {/* Dynamic Template Variable Mappers */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="font-bold text-slate-800 text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dynamic Template Variables</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                            {extractedVariables.length} variable{extractedVariables.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                          Exact Meta Cloud API parameter matching
                        </span>
                      </div>

                      {extractedVariables.length === 0 ? (
                        <div className="text-xs text-slate-500 italic py-1">
                          This template does not require any dynamic body variables.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {extractedVariables.map((v) => (
                            <div key={v.key} className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-700 flex items-center justify-between">
                                <span className="truncate max-w-[130px]">{v.label}</span>
                                <span className="font-mono text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">
                                  {`{{${v.key}}}`}
                                </span>
                              </label>
                              <input
                                type="text"
                                value={templateVariables[v.key] ?? ''}
                                onChange={(e) =>
                                  setTemplateVariables((prev) => ({
                                    ...prev,
                                    [v.key]: e.target.value,
                                  }))
                                }
                                placeholder={v.sample || `Value for {{${v.key}}}`}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              />
                              {v.index === 1 && (
                                <p className="text-[9px] text-slate-400">
                                  Use <code className="text-emerald-700 font-mono font-bold">{`{{name}}`}</code> to auto-personalize per contact
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                    {bulkCampaigns.slice(0, 3).map((camp) => {
                      const total = camp.totalRecipients || camp.recipients || 0;
                      const delivered = camp.deliveredCount || 0;
                      const pct = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0.0';
                      const st = (camp.status || 'QUEUED').toUpperCase();
                      const statusBadge =
                        st === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : st === 'RUNNING' || st === 'SENDING'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                          : st === 'FAILED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200';

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 font-semibold text-slate-800">{camp.name}</td>
                          <td className="py-2.5 text-slate-500">{total.toLocaleString()}</td>
                          <td className={`py-2.5 font-bold ${delivered > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {pct}%
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                              {st}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
                  {activeTemplate.headerType === 'IMAGE' && (customHeaderUrl || activeTemplate.headerContent) && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100 mb-2 relative group">
                      <img
                        src={customHeaderUrl || activeTemplate.headerContent}
                        alt="Header"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white uppercase tracking-wider">
                        {isCustomImageActive ? 'Custom Image' : 'Template Default'}
                      </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(!isAddContactOpen)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Add new customer phone number to broadcast list"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Number</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsContactsModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(!isAddContactOpen)}
                    className="px-2.5 py-1.5 rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer shadow-2xs flex items-center gap-1 active:scale-95"
                    title="Add new customer phone number to broadcast list"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Customer</span>
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

            {/* Collapsible / Expandable Inline Add Customer Form Drawer */}
            {isAddContactOpen && (
              <div className="p-4 bg-emerald-50/80 border-b border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Add New Customer Number to Broadcast</h4>
                      <p className="text-[10px] text-emerald-700">Enter customer details to immediately include them in this campaign</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddContactOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewContact();
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewContact();
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tag / Segment (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newContactTag}
                        onChange={(e) => setNewContactTag(e.target.value)}
                        placeholder="e.g. VIP, Direct, Lead"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewContact();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewContact}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                      >
                        + Add & Include
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                      const isNewlyAdded = contact.id === newlyAddedContactId;
                      return (
                        <tr
                          key={contact.id}
                          onClick={() => toggleContactSelection(contact.id)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition ${
                            isNewlyAdded
                              ? 'bg-emerald-100/70 ring-1 ring-emerald-400'
                              : isSelected
                              ? 'bg-emerald-50/30'
                              : 'opacity-60 bg-white'
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
                            <div className="font-bold text-slate-900 flex items-center">
                              <span>{contact.name}</span>
                              {isNewlyAdded && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
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

      {/* Real Test Send Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Send Real WhatsApp Test</h3>
                  <p className="text-xs text-slate-500">Dispatch live test message via gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Recipient WhatsApp Number
                </label>
                <CountryPhoneInput
                  value={testPhoneNumber}
                  onChange={(val) => setTestPhoneNumber(val)}
                  placeholder="Test recipient phone"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  The message will be immediately dispatched to this number via the WhatsApp gateway.
                </p>
              </div>

              {/* Header Image Preview if image template */}
              {messageType === 'template' && activeTemplate.headerType === 'IMAGE' && (customHeaderUrl || activeTemplate.headerContent) && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-bold text-indigo-900 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      Attached Image Header:
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-800">
                      {isCustomImageActive ? 'Custom Campaign Image' : 'Meta Approved Default'}
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-indigo-200 aspect-video max-h-36 bg-white">
                    <img
                      src={customHeaderUrl || activeTemplate.headerContent}
                      alt="Test Header"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Message Preview:</div>
                <div className="text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                  {livePreviewBody || '(Empty message body)'}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-xs text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeTestSend}
                disabled={isSendingTest}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Dispatching Test...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Live Test Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Header Image Customizer Modal */}
      {isEditImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Customize Campaign Header Image</h3>
                  <p className="text-xs text-slate-500">
                    Template: <span className="font-semibold text-slate-700">{activeTemplate.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditImageModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanatory Meta Callout Banner */}
            <div className="bg-emerald-50/80 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2.5 text-xs text-emerald-900 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Meta Cloud API Rule:</strong> Approved templates with media headers allow dynamic image replacement on every broadcast without requiring new Meta template submission.
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setImageModalTab('upload')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  imageModalTab === 'upload'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('presets')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  imageModalTab === 'presets'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Marketing Presets ({MARKETING_IMAGE_PRESETS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('url')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  imageModalTab === 'url'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Web Image URL</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: Upload from device */}
              {imageModalTab === 'upload' && (
                <div className="space-y-4">
                  {/* Upload Dropzone / Progress Spinner */}
                  {isUploadingImage ? (
                    <div className="border-2 border-dashed border-indigo-300 bg-indigo-50/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center animate-pulse">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                      </div>
                      <div className="font-bold text-sm text-slate-800">
                        Optimizing & Hosting Image...
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        Compressing photo on-the-fly and uploading to WhatsApp media CDN. This guarantees 100% broadcast delivery with zero HTTP 413 payload errors.
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold bg-white/80 border border-indigo-200 px-3 py-1 rounded-full shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        Meta Cloud API Compliance Active
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => (modalFileInputRef.current || imageFileInputRef.current)?.click()}
                      onDragOver={handleImageDragOver}
                      onDragLeave={handleImageDragLeave}
                      onDrop={handleImageDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                        isDragOver
                          ? 'border-indigo-600 bg-indigo-100/70 scale-[1.01] ring-4 ring-indigo-500/20'
                          : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div className="font-bold text-sm text-slate-800">
                        {isDragOver ? 'Drop image here now' : 'Click to choose or drag & drop an image'}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Supports JPG, PNG, and WebP (up to 20MB). Photos are automatically compressed to ensure lightning-fast WhatsApp dispatch.
                      </p>
                      <div className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" />
                        Browse Files from Computer
                      </div>
                    </div>
                  )}

                  {/* Hidden file input dedicated to this modal */}
                  <input
                    type="file"
                    ref={modalFileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleImageFileUpload}
                  />

                  {/* Plain-English Error Callout for Non-Technical Users */}
                  {imageUploadError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-red-900">
                            Why did this upload not succeed?
                          </h4>
                          <p className="text-xs text-red-700 leading-relaxed">
                            {imageUploadError}
                          </p>
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => (modalFileInputRef.current || imageFileInputRef.current)?.click()}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[11px] font-bold rounded-lg cursor-pointer transition shadow-xs flex items-center gap-1"
                            >
                              <UploadCloud className="w-3 h-3" />
                              Choose Another Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageModalTab('presets')}
                              className="px-3 py-1.5 bg-white hover:bg-red-100/70 text-red-800 border border-red-300 text-[11px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Pick a Marketing Preset (Instant)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Active Image Preview Card */}
                  {customHeaderUrl && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Active Custom Header Image</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Ready for WhatsApp Broadcast
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-48 bg-slate-100 relative group">
                        <img
                          src={customHeaderUrl}
                          alt="Active custom header"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => (modalFileInputRef.current || imageFileInputRef.current)?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-bold shadow hover:bg-white transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                            Replace Image
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="truncate max-w-[280px]" title={customHeaderUrl}>
                          Source:{' '}
                          {customHeaderUrl.includes('/media/campaign_headers/')
                            ? 'Hosted on WhatsApp CDN'
                            : customHeaderUrl.startsWith('data:')
                            ? 'Local Compressed Image'
                            : 'Web Image URL'}
                        </span>
                        {isCustomImageActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomHeaderUrl(activeTemplate.headerContent || '');
                              setImageUrlInput(activeTemplate.headerContent || '');
                              addToast('Reverted to template default image', 'info');
                            }}
                            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Revert to Default
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Marketing Gallery Presets */}
              {imageModalTab === 'presets' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600">
                    Select a high-resolution promotional banner curated for high customer conversion rates:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {MARKETING_IMAGE_PRESETS.map((preset) => {
                      const isSelected = (customHeaderUrl || activeTemplate.headerContent) === preset.url;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setCustomHeaderUrl(preset.url);
                            setImageUrlInput(preset.url);
                            addToast(`Selected "${preset.title}" banner!`, 'info');
                          }}
                          className={`rounded-xl border p-2.5 text-left transition cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative mb-2">
                            <img
                              src={preset.url}
                              alt={preset.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                              {preset.category}
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                              <span className="truncate">{preset.title}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Web Image URL */}
              {imageModalTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Direct Public Image URL (HTTPS)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/banner.jpg"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!imageUrlInput.trim().startsWith('http')) {
                            addToast('Please enter a valid HTTP/HTTPS image URL', 'error');
                            return;
                          }
                          setCustomHeaderUrl(imageUrlInput.trim());
                          addToast('URL loaded for campaign preview', 'info');
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                      >
                        Load URL
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Must be a publicly accessible image URL reachable by Meta servers (e.g. AWS S3, Cloudinary, CDN, Imgur).
                    </p>
                  </div>

                  {/* URL Live Preview */}
                  {imageUrlInput && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-700">Live URL Image Preview:</div>
                      <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video max-h-48 bg-slate-100 flex items-center justify-center">
                        <img
                          src={imageUrlInput}
                          alt="URL preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
              <div>
                {isCustomImageActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomHeaderUrl(activeTemplate.headerContent || '');
                      setImageUrlInput(activeTemplate.headerContent || '');
                      setIsEditImageModalOpen(false);
                      addToast('Reset to Meta approved default template image', 'info');
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Default Image
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditImageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-xs text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (imageModalTab === 'url' && imageUrlInput.trim()) {
                      setCustomHeaderUrl(imageUrlInput.trim());
                    }
                    setIsEditImageModalOpen(false);
                    addToast('Header image applied to campaign!', 'success');
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Image to Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
