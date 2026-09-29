import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  Check,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  Filter,
  Eye,
} from 'lucide-react';
import { BulkTemplateItem } from '../../types';

export interface ModernTemplateSelectProps {
  value: string; // template id or template name
  onChange: (templateId: string, template?: BulkTemplateItem) => void;
  onPreview?: (template: BulkTemplateItem) => void;
  templates: BulkTemplateItem[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const ModernTemplateSelect: React.FC<ModernTemplateSelectProps> = ({
  value,
  onChange,
  onPreview,
  templates = [],
  placeholder = 'Select WhatsApp template...',
  className = '',
  disabled = false,
  required = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'marketing' | 'utility' | 'authentication'>('all');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  // Identify currently selected template
  const activeTemplate = useMemo(() => {
    return (
      templates.find((t) => t.id === value || t.name === value) ||
      (value ? templates.find((t) => t.id.toLowerCase() === value.toLowerCase() || t.name.toLowerCase() === value.toLowerCase()) : undefined)
    );
  }, [templates, value]);

  // Counts for category chips
  const categoryCounts = useMemo(() => {
    let all = templates.length;
    let marketing = 0;
    let utility = 0;
    let authentication = 0;

    templates.forEach((t) => {
      const cat = (t.category || '').toLowerCase();
      if (cat.includes('market')) marketing++;
      else if (cat.includes('auth')) authentication++;
      else utility++;
    });

    return { all, marketing, utility, authentication };
  }, [templates]);

  // Filter templates by search and category
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return templates.filter((t) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (t.category || '').toLowerCase();
        if (selectedCategory === 'marketing' && !cat.includes('market')) return false;
        if (selectedCategory === 'utility' && (cat.includes('market') || cat.includes('auth'))) return false;
        if (selectedCategory === 'authentication' && !cat.includes('auth')) return false;
      }

      // Search filter
      if (q) {
        const nameMatch = (t.name || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        const bodyMatch = (t.bodyText || t.body || '').toLowerCase().includes(q);
        const langMatch = (t.language || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !bodyMatch && !langMatch) return false;
      }

      return true;
    });
  }, [templates, searchQuery, selectedCategory]);

  // Viewport calculation to prevent modal/screen overflow
  useEffect(() => {
    if (!isOpen) return;

    const compute = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = Math.max(rect.width, Math.min(360, window.innerWidth - 24));
      const targetHeight = 340;

      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;

      let top = rect.bottom + 4;
      let maxHeight = Math.min(targetHeight, spaceBelow);

      if (spaceBelow < 220 && spaceAbove > spaceBelow) {
        maxHeight = Math.min(targetHeight, spaceAbove);
        top = Math.max(16, rect.top - maxHeight - 4);
      } else {
        top = rect.bottom + 4;
      }

      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      if (left < 12) left = 12;

      setCoords({ top, left, width: popoverWidth, maxHeight });
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [isOpen]);

  // Auto focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Helper for category badge color
  const getCategoryBadgeClass = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('market')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (cat.includes('auth')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  // Helper for header icon
  const getHeaderIcon = (headerType?: string) => {
    const ht = (headerType || '').toUpperCase();
    if (ht === 'DOCUMENT') return <FileText className="w-3.5 h-3.5 text-rose-600" />;
    if (ht === 'IMAGE') return <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />;
    if (ht === 'VIDEO') return <Video className="w-3.5 h-3.5 text-purple-600" />;
    return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full h-[38px] px-3 py-1.5 border rounded-xl bg-white flex items-center justify-between text-xs transition shadow-2xs cursor-pointer text-left ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          {activeTemplate ? (
            <>
              <div className="w-5.5 h-5.5 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                {getHeaderIcon(activeTemplate.headerType)}
              </div>
              <span className="font-bold text-slate-800 text-xs truncate">
                {activeTemplate.name}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase shrink-0 ${getCategoryBadgeClass(
                  activeTemplate.category
                )}`}
              >
                {activeTemplate.category || 'Utility'}
              </span>
            </>
          ) : (
            <span className="text-slate-400 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {activeTemplate && onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(activeTemplate);
              }}
              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
              title="Preview this template"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Hidden input for HTML form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          readOnly
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Floating Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[998] bg-black/10 backdrop-blur-[0.5px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover Panel */}
          <div
            style={
              coords
                ? {
                    position: 'fixed',
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                    width: `${coords.width}px`,
                    maxHeight: `${coords.maxHeight}px`,
                  }
                : {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '360px',
                    maxHeight: '340px',
                  }
            }
            className="z-[999] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
          >
            {/* 1. Search Bar */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search template by name, category, or content..."
                  className="w-full pl-9 pr-8 py-1.5 bg-white text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Category Filter Chips */}
            <div className="px-2.5 py-1.5 border-b border-slate-100 bg-white flex items-center gap-1 overflow-x-auto text-[10px] no-scrollbar shrink-0">
              <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-2.5 h-2.5" /> Filter:
              </span>

              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {categoryCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('utility')}
                className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'utility'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                <span>Utility</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'utility' ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800'
                  }`}
                >
                  {categoryCounts.utility}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('marketing')}
                className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'marketing'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
                }`}
              >
                <span>Marketing</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'marketing' ? 'bg-purple-700 text-purple-100' : 'bg-purple-200 text-purple-800'
                  }`}
                >
                  {categoryCounts.marketing}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('authentication')}
                className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'authentication'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                <span>OTP</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    selectedCategory === 'authentication' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  {categoryCounts.authentication}
                </span>
              </button>
            </div>

            {/* 3. Template Items List */}
            <div className="overflow-y-auto flex-1 p-1.5 space-y-1">
              {filteredTemplates.length === 0 ? (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No templates match{' '}
                    {searchQuery ? (
                      <strong>"{searchQuery}"</strong>
                    ) : (
                      'the selected filter'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Clear search &amp; filters
                  </button>
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected =
                    template.id === value ||
                    template.name === value ||
                    (activeTemplate && activeTemplate.id === template.id);

                  return (
                    <div
                      key={template.id}
                      onClick={() => {
                        onChange(template.id, template);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 border border-emerald-300 ring-1 ring-emerald-500/20'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {getHeaderIcon(template.headerType)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-xs truncate ${
                                isSelected ? 'font-bold text-emerald-950' : 'font-semibold text-slate-800'
                              }`}
                            >
                              {template.name}
                            </span>

                            <span
                              className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase border ${getCategoryBadgeClass(
                                template.category
                              )}`}
                            >
                              {template.category || 'Utility'}
                            </span>

                            {template.status?.toUpperCase() === 'APPROVED' && (
                              <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                Approved
                              </span>
                            )}
                          </div>

                          {(template.bodyText || template.body) && (
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {template.bodyText || template.body}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onPreview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreview(template);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title={`Preview WhatsApp template "${template.name}"`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 4. Footer */}
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
              <span>
                Showing <strong>{filteredTemplates.length}</strong> of{' '}
                <strong>{templates.length}</strong> templates
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
