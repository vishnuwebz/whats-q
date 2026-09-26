import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  MessageSquare, Zap, Clock, Plus, Search, X, Check,
  Trash2, Edit3, ExternalLink, RefreshCw, Paperclip, Copy,
  Smartphone, LayoutGrid, List, CheckCircle2, AlertCircle,
  Calendar, ChevronRight, Sparkles, Send, ArrowRight, ShieldCheck,
  Bot, Save
} from 'lucide-react';
import { KeywordRule, DaySchedule } from '@/types';

interface KeywordTriggerRulesViewProps {
  onOpenWorkflowInCanvas?: (workflowName: string) => void;
  onOpenTestSimulator?: (keyword?: string) => void;
}

export const KeywordTriggerRulesView: React.FC<KeywordTriggerRulesViewProps> = ({
  onOpenWorkflowInCanvas,
  onOpenTestSimulator,
}) => {
  const {
    keywordRules,
    workingHours,
    outsideHoursMessage,
    toggleKeywordRule,
    deleteKeywordRule,
    addKeywordRule,
    updateKeywordRule,
    addKeywordToRule,
    removeKeywordFromRule,
    toggleWorkingDay,
    updateWorkingDayTime,
    setOutsideHoursMessage,
    saveWorkingHoursConfig,
    saveAllKeywordRules,
    syncAutomationRules,
    workflows,
    addToast,
  } = useQiyamStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'workflows' | 'reply_only'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<KeywordRule | null>(null);

  // Inline add keyword & inline reply edit state
  const [activeKeywordInputRuleId, setActiveKeywordInputRuleId] = useState<string | number | null>(null);
  const [inlineKeywordText, setInlineKeywordText] = useState('');
  const [inlineEditingReplyRuleId, setInlineEditingReplyRuleId] = useState<string | number | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState('');

  // Working Hours state
  const [editingDayTime, setEditingDayTime] = useState<{ day: string; time: string } | null>(null);
  const [awayMessage, setAwayMessage] = useState(outsideHoursMessage);
  const [isSavingHours, setIsSavingHours] = useState(false);

  useEffect(() => {
    setAwayMessage(outsideHoursMessage);
  }, [outsideHoursMessage]);

  // Form state for creating rule
  const [newRule, setNewRule] = useState({
    title: '',
    keywords: '',
    reply: '',
    attachment: '',
    workflow_name: '',
  });

  // Calculate live business open/closed status
  const getLiveAvailability = () => {
    try {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = days[now.getDay()];
      const daySchedule = (workingHours || []).find((d) => d.day.toLowerCase() === currentDay.toLowerCase());

      if (!daySchedule || !daySchedule.enabled || daySchedule.time.toLowerCase().includes('closed')) {
        return { isOpen: false, text: `Closed today (${currentDay})` };
      }

      // Check current time against schedule (e.g. 9:30 AM - 7:30 PM)
      const timeMatch = daySchedule.time.match(/(\d+):?(\d+)?\s*(AM|PM)\s*[–-]\s*(\d+):?(\d+)?\s*(AM|PM)/i);
      if (timeMatch) {
        let openHour = parseInt(timeMatch[1], 10);
        const openMin = parseInt(timeMatch[2] || '0', 10);
        const openPeriod = timeMatch[3].toUpperCase();
        if (openPeriod === 'PM' && openHour < 12) openHour += 12;
        if (openPeriod === 'AM' && openHour === 12) openHour = 0;

        let closeHour = parseInt(timeMatch[4], 10);
        const closeMin = parseInt(timeMatch[5] || '0', 10);
        const closePeriod = timeMatch[6].toUpperCase();
        if (closePeriod === 'PM' && closeHour < 12) closeHour += 12;
        if (closePeriod === 'AM' && closeHour === 12) closeHour = 0;

        const currentMins = now.getHours() * 60 + now.getMinutes();
        const openMins = openHour * 60 + openMin;
        const closeMins = closeHour * 60 + closeMin;

        if (currentMins >= openMins && currentMins < closeMins) {
          return { isOpen: true, text: `Open now (closes at ${timeMatch[4]}:${timeMatch[5] || '00'} ${timeMatch[6]})` };
        } else if (currentMins < openMins) {
          return { isOpen: false, text: `Closed now (opens at ${timeMatch[1]}:${timeMatch[2] || '00'} ${timeMatch[3]})` };
        } else {
          return { isOpen: false, text: `Closed for today (closed at ${timeMatch[4]}:${timeMatch[5] || '00'} ${timeMatch[6]})` };
        }
      }

      return { isOpen: true, text: `Operating schedule active` };
    } catch {
      return { isOpen: true, text: 'Operating schedule active' };
    }
  };

  const liveAvailability = getLiveAvailability();

  // Metrics
  const totalRules = (keywordRules || []).length;
  const activeRulesCount = (keywordRules || []).filter((r) => r.active).length;
  const totalDispatches = (keywordRules || []).reduce((acc, r) => acc + (Number(r.triggered_count) || 0), 0);
  const workflowRulesCount = (keywordRules || []).filter((r) => Boolean(r.workflow_name)).length;

  // Filtered Rules
  const filteredRules = (keywordRules || []).filter((rule) => {
    // 1. Tab filter
    if (filterTab === 'active' && !rule.active) return false;
    if (filterTab === 'workflows' && !rule.workflow_name) return false;
    if (filterTab === 'reply_only' && rule.workflow_name) return false;

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        rule.title.toLowerCase().includes(q) ||
        (rule.workflow_name && rule.workflow_name.toLowerCase().includes(q)) ||
        rule.reply.toLowerCase().includes(q) ||
        (rule.keywords || []).some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Action Handlers
  const handleToggle = async (id: string | number) => {
    await toggleKeywordRule(id);
  };

  const handleDelete = async (id: string | number, title: string) => {
    if (window.confirm(`Are you sure you want to delete trigger rule "${title}"?`)) {
      await deleteKeywordRule(id);
    }
  };

  const handleDuplicate = async (rule: KeywordRule) => {
    const duplicated: Omit<KeywordRule, 'id'> = {
      title: `${rule.title} (Copy)`,
      triggered_count: 0,
      active: true,
      keywords: [...rule.keywords],
      reply: rule.reply,
      attachment: rule.attachment,
      workflow_name: rule.workflow_name,
      action_type: rule.action_type,
    };
    await addKeywordRule(duplicated);
    addToast(`Duplicated rule "${rule.title}"`, 'success');
  };

  const handleAddKeyword = async (ruleId: string | number) => {
    if (!inlineKeywordText.trim()) return;
    await addKeywordToRule(ruleId, inlineKeywordText.trim());
    setInlineKeywordText('');
    setActiveKeywordInputRuleId(null);
  };

  const handleRemoveKeyword = async (ruleId: string | number, kw: string) => {
    await removeKeywordFromRule(ruleId, kw);
  };

  const handleUpdateWorkflow = async (ruleId: string | number, wfName: string) => {
    await updateKeywordRule(ruleId, {
      workflow_name: wfName || undefined,
      action_type: wfName ? 'workflow' : 'reply',
    });
    addToast(wfName ? `Linked to "${wfName}"` : 'Set to auto-reply only', 'info');
  };

  const handleSaveEditedRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    if (!editingRule.title.trim()) {
      addToast('Please provide a rule title', 'warning');
      return;
    }

    const hasWorkflow = Boolean(editingRule.workflow_name?.trim());
    if (!hasWorkflow && !editingRule.reply?.trim()) {
      addToast('Automated reply message is mandatory when Trigger Workflow is set to None (Auto-Reply Only)', 'warning');
      return;
    }

    const kwList = Array.isArray(editingRule.keywords)
      ? editingRule.keywords
      : String(editingRule.keywords).split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);

    await updateKeywordRule(editingRule.id, {
      title: editingRule.title.trim(),
      reply: editingRule.reply?.trim() || '',
      keywords: kwList,
      workflow_name: editingRule.workflow_name?.trim() || undefined,
      action_type: hasWorkflow ? 'workflow' : 'reply',
      attachment: editingRule.attachment?.trim() || undefined,
    });
    await saveAllKeywordRules();
    setEditingRule(null);
    addToast(`Saved & updated "${editingRule.title}" to server!`, 'success');
  };

  const handleSaveInlineReply = async (ruleId: string | number) => {
    const rule = keywordRules.find((r) => r.id === ruleId);
    const hasWorkflow = Boolean(rule?.workflow_name?.trim());
    if (!hasWorkflow && !inlineReplyText.trim()) {
      addToast('Reply message is mandatory when no workflow is linked', 'warning');
      return;
    }
    await updateKeywordRule(ruleId, { reply: inlineReplyText.trim() });
    await saveAllKeywordRules();
    setInlineEditingReplyRuleId(null);
    addToast(`Updated reply for "${rule?.title || 'Rule'}" and saved to database!`, 'success');
  };

  const handleSaveAllRules = async () => {
    setIsSavingRules(true);
    await saveAllKeywordRules();
    setIsSavingRules(false);
  };

  const handleCreateRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.keywords.trim()) {
      addToast('Please provide a title and trigger keywords', 'warning');
      return;
    }

    const hasWorkflow = Boolean(newRule.workflow_name?.trim());
    if (!hasWorkflow && !newRule.reply.trim()) {
      addToast('Automated reply message is mandatory when Trigger Workflow is set to None (Auto-Reply Only)', 'warning');
      return;
    }

    const kwList = newRule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    const created: Omit<KeywordRule, 'id'> = {
      title: newRule.title.trim(),
      triggered_count: 0,
      active: true,
      keywords: kwList,
      reply: newRule.reply.trim(),
      attachment: newRule.attachment.trim() || undefined,
      workflow_name: newRule.workflow_name.trim() || undefined,
      action_type: hasWorkflow ? 'workflow' : 'reply',
    };

    await addKeywordRule(created);
    await saveAllKeywordRules();
    setIsCreateModalOpen(false);
    setNewRule({ title: '', keywords: '', reply: '', attachment: '', workflow_name: '' });
    addToast('New keyword trigger rule created & saved successfully!', 'success');
  };

  const handleSaveWorkingHours = async () => {
    setIsSavingHours(true);
    try {
      await saveWorkingHoursConfig(workingHours, awayMessage);
    } finally {
      setIsSavingHours(false);
    }
  };

  const applySchedulePreset = (preset: 'standard' | 'corporate' | 'always_open') => {
    if (preset === 'standard') {
      const schedule: DaySchedule[] = [
        { day: 'Monday', time: '9:30 AM – 7:30 PM', enabled: true },
        { day: 'Tuesday', time: '9:30 AM – 7:30 PM', enabled: true },
        { day: 'Wednesday', time: '9:30 AM – 7:30 PM', enabled: true },
        { day: 'Thursday', time: '9:30 AM – 7:30 PM', enabled: true },
        { day: 'Friday', time: '9:30 AM – 7:30 PM', enabled: true },
        { day: 'Saturday', time: '10:00 AM – 8:00 PM', enabled: true },
        { day: 'Sunday', time: 'Closed', enabled: false },
      ];
      saveWorkingHoursConfig(schedule, awayMessage);
      addToast('Applied Standard Retail schedule (Mon-Sat)', 'success');
    } else if (preset === 'corporate') {
      const schedule: DaySchedule[] = [
        { day: 'Monday', time: '9:00 AM – 6:00 PM', enabled: true },
        { day: 'Tuesday', time: '9:00 AM – 6:00 PM', enabled: true },
        { day: 'Wednesday', time: '9:00 AM – 6:00 PM', enabled: true },
        { day: 'Thursday', time: '9:00 AM – 6:00 PM', enabled: true },
        { day: 'Friday', time: '9:00 AM – 6:00 PM', enabled: true },
        { day: 'Saturday', time: 'Closed', enabled: false },
        { day: 'Sunday', time: 'Closed', enabled: false },
      ];
      saveWorkingHoursConfig(schedule, awayMessage);
      addToast('Applied Corporate 5-Day schedule (Mon-Fri)', 'success');
    } else if (preset === 'always_open') {
      const schedule: DaySchedule[] = [
        { day: 'Monday', time: '24 Hours', enabled: true },
        { day: 'Tuesday', time: '24 Hours', enabled: true },
        { day: 'Wednesday', time: '24 Hours', enabled: true },
        { day: 'Thursday', time: '24 Hours', enabled: true },
        { day: 'Friday', time: '24 Hours', enabled: true },
        { day: 'Saturday', time: '24 Hours', enabled: true },
        { day: 'Sunday', time: '24 Hours', enabled: true },
      ];
      saveWorkingHoursConfig(schedule, awayMessage);
      addToast('Applied 24/7 Always Active schedule', 'success');
    }
  };

  // Helper to format reply message highlighting variables
  const renderFormattedReply = (text: string) => {
    const parts = text.split(/(\{COMPANY_NAME\}|\{STAT_NAME\}|\{CUSTOMER_NAME\}|\{SERVICE\}|\{QUOTE_NO\})/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('{') && part.endsWith('}')) {
            return (
              <span
                key={i}
                className="inline-block px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold mx-0.5 border border-emerald-300"
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-sans space-y-6 bg-[#F8FAFC]">
      {/* ========================================================================= */}
      {/* 1. HERO KPI METRICS STRIP (Enterprise Design Pattern)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
        {/* Card 1: Total Rules */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
            <span>Trigger Rules</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalRules}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
            <span className="text-emerald-700 font-bold">{activeRulesCount} active</span>
            <span>•</span>
            <span>{totalRules - activeRulesCount} paused</span>
          </div>
        </div>

        {/* Card 2: Active WhatsApp Listeners */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
            <span>Active Listeners</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeRulesCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live on WhatsApp Cloud</span>
          </div>
        </div>

        {/* Card 3: Total Dispatches */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
            <span>Total Dispatches</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{totalDispatches.toLocaleString()}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-0.5">Automated replies served</div>
        </div>

        {/* Card 4: Linked Workflows */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
            <span>Workflow Integrations</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{workflowRulesCount}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Interactive chatbot flows</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MODERN SEARCH, FILTER & ACTION BAR                                     */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keywords, rule title, or workflow flow name... (Ctrl + /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 font-sans transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Strip: View Toggle, Live Sync & Create Rule */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 justify-end shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Compact Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Table</span>
              </button>
            </div>

            {/* Live Sync Button */}
            <button
              type="button"
              onClick={async () => {
                setIsSyncing(true);
                await syncAutomationRules();
                setIsSyncing(false);
              }}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
              title="Synchronize triggers, workflows and schedule with server"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
            </button>

            {/* Save All Rules Button */}
            <button
              type="button"
              onClick={handleSaveAllRules}
              disabled={isSavingRules}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
              title="Save all keyword rules and responses directly to database"
            >
              <Save className={`w-3.5 h-3.5 ${isSavingRules ? 'animate-spin' : ''}`} />
              <span>{isSavingRules ? 'Saving...' : 'Save Rules'}</span>
            </button>

            {/* Create Rule Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-[#0B3B2C] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            All Rules ({totalRules})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active ({activeRulesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('workflows')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'workflows'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Triggers Workflow ({workflowRulesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('reply_only')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'reply_only'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
            }`}
          >
            Auto-Reply Only ({totalRules - workflowRulesCount})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE GRID (Left 2 Cols: Rules | Right Col: Working Hours)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: KEYWORD RULES CONTAINER */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRules.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="font-bold text-slate-900 text-base">
                {searchQuery ? 'No matching trigger rules found' : 'No keyword trigger rules available'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No rules match your search for "${searchQuery}". Try searching with another keyword or flow name.`
                  : 'Keyword rules listen for inbound WhatsApp messages and automatically send custom auto-replies or launch visual flows.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery) setSearchQuery('');
                    else setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{searchQuery ? 'Clear Search Filter' : 'Create First Trigger Rule'}</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            /* CARD VIEW MODE */
            <div className="space-y-4">
              {filteredRules.map((rule) => {
                const isWorkflowLinked = Boolean(rule.workflow_name);

                return (
                  <div
                    key={rule.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 space-y-4 shadow-2xs hover:shadow-md relative overflow-hidden group ${
                      rule.active ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/40 opacity-80'
                    }`}
                  >
                    {/* Top Color Accent Pill */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        rule.active
                          ? isWorkflowLinked
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-500'
                            : 'bg-emerald-600'
                          : 'bg-slate-300'
                      }`}
                    />

                    {/* Card Header: Icon, Title, Dispatches, Status & Actions */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isWorkflowLinked
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isWorkflowLinked ? <Zap className="w-5 h-5 fill-purple-100" /> : <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-900 transition-colors truncate">
                              {rule.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => setEditingRule(rule)}
                              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Rule Title & Reply"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                              ⚡ {rule.triggered_count} dispatches
                            </span>
                            <span>•</span>
                            <span className="text-[11px] text-slate-500">
                              {isWorkflowLinked ? 'Interactive Chatbot Flow' : 'Instant Auto-Responder'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Right: ON/OFF Switch & Action Menu */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Switch */}
                        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                          <span className={`text-[11px] font-bold ${rule.active ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {rule.active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggle(rule.id)}
                            className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                              rule.active ? 'bg-[#0B3B2C]' : 'bg-slate-300'
                            }`}
                            title={rule.active ? 'Click to Pause Rule' : 'Click to Activate Rule'}
                          >
                            <span
                              className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                                rule.active ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Test in Simulator button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenTestSimulator) {
                              onOpenTestSimulator(rule.keywords[0]);
                            } else {
                              addToast(`Testing "${rule.title}" in simulator`, 'info');
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition cursor-pointer"
                          title="Test trigger in Phone Simulator"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>

                        {/* Duplicate Rule button */}
                        <button
                          type="button"
                          onClick={() => handleDuplicate(rule)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                          title="Duplicate Rule"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Rule button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(rule.id, rule.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Integrated Workflow Trigger Banner (Customer Core Requirement!) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200 rounded-xl transition">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0" />
                          <span>⚡ Triggers Interactive Workflow:</span>
                        </div>
                        <select
                          value={rule.workflow_name || ''}
                          onChange={(e) => handleUpdateWorkflow(rule.id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 shadow-2xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="">None (Auto-Reply Only)</option>
                          <option value="Service Booking Flow">Service Booking Flow</option>
                          <option value="Inbound Welcome & Service Flow">Inbound Welcome & Service Flow</option>
                          <option value="Price Quotation Flow">Price Quotation Flow</option>
                          <option value="Live Specialist Status & ETA">Live Specialist Status & ETA</option>
                          <option value="Emergency Breakdown Service">Emergency Breakdown Service</option>
                          <option value="Human Support Escalation">Human Support Escalation</option>
                          {(workflows || [])
                            .filter(
                              (w) =>
                                ![
                                  'Service Booking Flow',
                                  'Inbound Welcome & Service Flow',
                                  'Price Quotation Flow',
                                  'Live Specialist Status & ETA',
                                  'Emergency Breakdown Service',
                                  'Human Support Escalation',
                                ].includes(w.name)
                            )
                            .map((w) => (
                              <option key={w.id} value={w.name}>
                                {w.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {rule.workflow_name && onOpenWorkflowInCanvas && (
                        <button
                          type="button"
                          onClick={() => onOpenWorkflowInCanvas(rule.workflow_name!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 shrink-0"
                          title="Open and edit this workflow in the visual interactive canvas"
                        >
                          <span>Open in Canvas</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Section: WHEN CUSTOMER SAYS... */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <span>WHEN CUSTOMER SAYS... ({rule.keywords.length})</span>
                        <span className="text-[10px] font-normal text-slate-400">Match: Substring or Exact</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {rule.keywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs transition"
                          >
                            <span>{kw}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(rule.id, kw)}
                              className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
                              title={`Remove keyword "${kw}"`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        {/* Inline Keyword Input */}
                        {activeKeywordInputRuleId === rule.id ? (
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-emerald-400 shadow-2xs">
                            <input
                              type="text"
                              placeholder="Type keyword & press Enter..."
                              value={inlineKeywordText}
                              onChange={(e) => setInlineKeywordText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddKeyword(rule.id);
                                } else if (e.key === 'Escape') {
                                  setActiveKeywordInputRuleId(null);
                                }
                              }}
                              autoFocus
                              className="text-xs px-2.5 py-1 outline-none text-slate-800 w-44 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddKeyword(rule.id)}
                              className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                              title="Add Keyword"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveKeywordInputRuleId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveKeywordInputRuleId(rule.id);
                              setInlineKeywordText('');
                            }}
                            className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold px-2.5 py-1.5 rounded-xl border border-dashed border-emerald-300 hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add keyword</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section: REPLY WITH... (WhatsApp Styled Preview Bubble or Inline Edit) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <span>REPLY WITH...</span>
                        <div className="flex items-center gap-2">
                          {inlineEditingReplyRuleId === rule.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveInlineReply(rule.id)}
                                className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-0.5 rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save Reply</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setInlineEditingReplyRuleId(null)}
                                className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setInlineEditingReplyRuleId(rule.id);
                                setInlineReplyText(rule.reply || '');
                              }}
                              className="text-[11px] text-emerald-700 hover:text-emerald-900 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Reply</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {inlineEditingReplyRuleId === rule.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={inlineReplyText}
                            onChange={(e) => setInlineReplyText(e.target.value)}
                            rows={4}
                            className="w-full text-xs p-3 bg-white border-2 border-emerald-500 rounded-xl focus:outline-none text-slate-800 shadow-inner font-sans leading-relaxed"
                            placeholder={
                              rule.workflow_name
                                ? `✨ Leave empty to dynamically use "${rule.workflow_name}" canvas nodes, or type custom opening text...`
                                : "Enter the automated WhatsApp response message..."
                            }
                          />
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="text-[10px] text-slate-400 font-mono">Variables: &#123;CUSTOMER_NAME&#125;, &#123;COMPANY_NAME&#125;</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setInlineEditingReplyRuleId(null)}
                                className="px-2.5 py-1 text-slate-400 hover:text-slate-600 font-semibold cursor-pointer text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveInlineReply(rule.id)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Reply to Server</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* WhatsApp Message Preview Bubble */
                        <div
                          onClick={() => {
                            setInlineEditingReplyRuleId(rule.id);
                            setInlineReplyText(rule.reply || '');
                          }}
                          className="bg-[#F0F2F5]/90 border-l-4 border-emerald-600 p-4 rounded-r-2xl rounded-l-xs border-y border-r border-slate-200/80 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-2xs hover:bg-[#E9ECF0] transition cursor-pointer group/bubble"
                          title="Click to edit reply directly"
                        >
                          {rule.reply && rule.reply.trim() ? (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">{renderFormattedReply(rule.reply)}</div>
                              <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/bubble:opacity-100 transition shrink-0 mt-0.5" />
                            </div>
                          ) : rule.workflow_name ? (
                            <div className="flex items-start justify-between gap-3 py-0.5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Dynamic Workflow Execution: <strong>{rule.workflow_name}</strong></span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-normal">
                                  Dispatches initial interactive message & service options dynamically from the canvas nodes. (Click here to override with custom text)
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {onOpenWorkflowInCanvas && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenWorkflowInCanvas(rule.workflow_name!);
                                    }}
                                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                                    title="Open workflow canvas"
                                  >
                                    <span>View Canvas</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                )}
                                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/bubble:opacity-100 transition mt-0.5" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-slate-400 italic text-xs">
                              <span>No reply message configured. Click to add automated reply.</span>
                              <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/bubble:opacity-100 transition" />
                            </div>
                          )}
                        </div>
                      )}

                      {rule.attachment && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs">
                            <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{rule.attachment}</span>
                            <span className="text-[10px] text-emerald-600 font-mono font-normal">PDF Attachment</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT TABLE VIEW MODE */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Rule Title</th>
                      <th className="py-3 px-4">Keywords</th>
                      <th className="py-3 px-4">Triggers Workflow</th>
                      <th className="py-3 px-4">Dispatches</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggle(rule.id)}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                              rule.active ? 'bg-[#0B3B2C]' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                                rule.active ? 'translate-x-4.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {rule.title}
                          {rule.attachment && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-emerald-600" />
                              <span>{rule.attachment}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {rule.keywords.slice(0, 3).map((kw, i) => (
                              <span key={i} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                                {kw}
                              </span>
                            ))}
                            {rule.keywords.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                +{rule.keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {rule.workflow_name ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">
                                <Zap className="w-3 h-3" />
                                <span>{rule.workflow_name}</span>
                              </span>
                              {onOpenWorkflowInCanvas && (
                                <button
                                  type="button"
                                  onClick={() => onOpenWorkflowInCanvas(rule.workflow_name!)}
                                  className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                  title="Open in Canvas"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Auto-Reply Only</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                          {rule.triggered_count}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingRule(rule)}
                              className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(rule.id, rule.title)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WORKING HOURS & OFF-HOURS AWAY ENGINE */}
        <div className="space-y-5">
          {/* Card: Working Hours Schedule */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            {/* Header with live status badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Clock className="w-5 h-5 text-emerald-700" />
                <span>Working Hours</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  liveAvailability.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {liveAvailability.isOpen ? '🟢 Currently Open' : '🔴 Currently Closed'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your chatbot prioritizes automated replies and away messages outside operating hours.
            </p>

            {/* Quick Presets Strip */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 overflow-x-auto text-[10px]">
              <span className="text-slate-400 font-semibold uppercase text-[9px] shrink-0">Presets:</span>
              <button
                type="button"
                onClick={() => applySchedulePreset('standard')}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition font-medium cursor-pointer shrink-0"
              >
                Retail (Mon-Sat)
              </button>
              <button
                type="button"
                onClick={() => applySchedulePreset('corporate')}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition font-medium cursor-pointer shrink-0"
              >
                Corporate (Mon-Fri)
              </button>
              <button
                type="button"
                onClick={() => applySchedulePreset('always_open')}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition font-medium cursor-pointer shrink-0"
              >
                24/7 Always
              </button>
            </div>

            {/* Day Schedule List */}
            <div className="divide-y divide-slate-100 text-xs">
              {(workingHours || []).map((wh) => (
                <div key={wh.day} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800">{wh.day}</div>
                    {editingDayTime?.day === wh.day ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={editingDayTime.time}
                          onChange={(e) => setEditingDayTime({ ...editingDayTime, time: e.target.value })}
                          className="text-[11px] font-mono px-2 py-0.5 border border-emerald-400 rounded bg-white outline-none w-36"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateWorkingDayTime(wh.day, editingDayTime.time);
                              setEditingDayTime(null);
                              addToast(`Updated ${wh.day} operating hours`, 'success');
                            } else if (e.key === 'Escape') {
                              setEditingDayTime(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateWorkingDayTime(wh.day, editingDayTime.time);
                            setEditingDayTime(null);
                            addToast(`Updated ${wh.day} operating hours`, 'success');
                          }}
                          className="p-1 text-emerald-700 hover:text-emerald-800 cursor-pointer"
                          title="Save time"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDayTime(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-500 text-[11px] font-mono truncate">{wh.time}</span>
                        <button
                          type="button"
                          onClick={() => setEditingDayTime({ day: wh.day, time: wh.time })}
                          className="p-0.5 text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                          title="Click to edit operating hours"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="checkbox"
                    checked={wh.enabled}
                    onChange={() => toggleWorkingDay(wh.day)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-[#0B3B2C] shrink-0"
                    title={wh.enabled ? 'Operating' : 'Closed'}
                  />
                </div>
              ))}
            </div>

            {/* Away Message Box */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Outside Hours Away Message:
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {awayMessage.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={awayMessage}
                onChange={(e) => {
                  setAwayMessage(e.target.value);
                  setOutsideHoursMessage(e.target.value);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
                placeholder="Enter message to send when customer messages outside working hours..."
              />
              <button
                type="button"
                onClick={handleSaveWorkingHours}
                disabled={isSavingHours}
                className="w-full py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSavingHours ? 'Saving...' : 'Save Working Hours & Message'}</span>
              </button>
            </div>
          </div>

          {/* Card: Engine Status & Real-time Integration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Automation Engine Status</span>
            </div>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400">Webhook Listener:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Meta Cloud & Baileys
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-400">Keyword Evaluation:</span>
                <span className="font-semibold text-slate-800">Exact & Partial Substring</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Avg. Execution Speed:</span>
                <span className="font-bold text-purple-700 font-mono">&lt; 120 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CREATE NEW TRIGGER RULE MODAL                                          */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsCreateModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 max-h-[92dvh] flex flex-col">
            <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Create Keyword Trigger Rule</h3>
                <p className="text-xs text-emerald-300">Auto-respond or launch workflow when customer sends matching words</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Service Booking Flow Trigger"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Trigger Keywords (separated by comma) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. book, booking, reschedule, appointment, service"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">Separate variations with commas. Case-insensitive.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>⚡ Trigger Interactive Workflow</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {newRule.workflow_name ? 'Dynamic Canvas Flow' : 'Auto-Reply Mode'}
                  </span>
                </label>
                <select
                  value={newRule.workflow_name || ''}
                  onChange={(e) => setNewRule({ ...newRule, workflow_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="">None (Auto-Reply Only)</option>
                  <option value="Service Booking Flow">Service Booking Flow</option>
                  <option value="Inbound Welcome & Service Flow">Inbound Welcome & Service Flow</option>
                  <option value="Price Quotation Flow">Price Quotation Flow</option>
                  <option value="Live Specialist Status & ETA">Live Specialist Status & ETA</option>
                  <option value="Emergency Breakdown Service">Emergency Breakdown Service</option>
                  <option value="Human Support Escalation">Human Support Escalation</option>
                  {(workflows || [])
                    .filter(
                      (w) =>
                        ![
                          'Service Booking Flow',
                          'Inbound Welcome & Service Flow',
                          'Price Quotation Flow',
                          'Live Specialist Status & ETA',
                          'Emergency Breakdown Service',
                          'Human Support Escalation',
                        ].includes(w.name)
                    )
                    .map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {newRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Interactive workflow selected. It will execute dynamically from canvas nodes (automated reply below becomes optional).
                    </span>
                  ) : (
                    <span>
                      Selecting <strong>None</strong> requires an Automated Reply Message below.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>
                    {newRule.workflow_name
                      ? 'Initial Reply Override (Optional)'
                      : 'Automated Reply Message *'}
                  </span>
                  {newRule.workflow_name && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      Canvas Dynamic Execution
                    </span>
                  )}
                </label>
                <textarea
                  required={!newRule.workflow_name}
                  rows={4}
                  placeholder={
                    newRule.workflow_name
                      ? `✨ Leave empty to dynamically use initial message and options from "${newRule.workflow_name}" canvas nodes...`
                      : '👋 Welcome to {COMPANY_NAME}! How can we assist you today?'
                  }
                  value={newRule.reply}
                  onChange={(e) => setNewRule({ ...newRule, reply: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed text-xs"
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>Variables:</span>
                    <span className="font-mono bg-slate-100 px-1 rounded text-emerald-800">{"{COMPANY_NAME}"}</span>
                    <span className="font-mono bg-slate-100 px-1 rounded text-emerald-800">{"{STAT_NAME}"}</span>
                  </div>
                  {newRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">Leave blank to use canvas nodes</span>
                  ) : (
                    <span className="text-amber-700 font-medium">* Required for auto-reply</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attachment (Optional File/PDF)</label>
                <input
                  type="text"
                  placeholder="e.g. Service-Rate-Catalog.pdf"
                  value={newRule.attachment}
                  onChange={(e) => setNewRule({ ...newRule, attachment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EDIT TRIGGER RULE MODAL                                                */}
      {/* ========================================================================= */}
      {editingRule && (
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setEditingRule(null)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 max-h-[92dvh] flex flex-col">
            <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Edit Keyword Trigger Rule</h3>
                <p className="text-xs text-emerald-300">Modify triggers, assigned workflow & automated response</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedRule} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  value={editingRule.title}
                  onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>⚡ Trigger Workflow (When Keywords Match)</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {editingRule.workflow_name ? 'Dynamic Canvas Flow' : 'Auto-Reply Mode'}
                  </span>
                </label>
                <select
                  value={editingRule.workflow_name || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, workflow_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="">None (Auto-Reply Only)</option>
                  <option value="Service Booking Flow">Service Booking Flow</option>
                  <option value="Inbound Welcome & Service Flow">Inbound Welcome & Service Flow</option>
                  <option value="Price Quotation Flow">Price Quotation Flow</option>
                  <option value="Live Specialist Status & ETA">Live Specialist Status & ETA</option>
                  <option value="Emergency Breakdown Service">Emergency Breakdown Service</option>
                  <option value="Human Support Escalation">Human Support Escalation</option>
                  {(workflows || [])
                    .filter(
                      (w) =>
                        ![
                          'Service Booking Flow',
                          'Inbound Welcome & Service Flow',
                          'Price Quotation Flow',
                          'Live Specialist Status & ETA',
                          'Emergency Breakdown Service',
                          'Human Support Escalation',
                        ].includes(w.name)
                    )
                    .map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {editingRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Interactive workflow selected. When keywords match, this workflow executes dynamically from canvas nodes.
                    </span>
                  ) : (
                    <span>
                      Selecting <strong>None</strong> requires an Automated Reply Message below.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Trigger Keywords (separated by comma) *
                </label>
                <input
                  type="text"
                  required
                  value={Array.isArray(editingRule.keywords) ? editingRule.keywords.join(', ') : editingRule.keywords}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      keywords: e.target.value.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>
                    {editingRule.workflow_name
                      ? 'Initial Reply Override (Optional)'
                      : 'Automated Reply Message *'}
                  </span>
                  {editingRule.workflow_name && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      Canvas Dynamic Execution
                    </span>
                  )}
                </label>
                <textarea
                  required={!editingRule.workflow_name}
                  rows={4}
                  placeholder={
                    editingRule.workflow_name
                      ? `✨ Leave empty to dynamically use initial message and options from "${editingRule.workflow_name}" canvas nodes...`
                      : 'Enter automated WhatsApp response message...'
                  }
                  value={editingRule.reply || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, reply: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed text-xs"
                />
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>Variables:</span>
                    <span className="font-mono bg-slate-100 px-1 rounded text-emerald-800">{"{COMPANY_NAME}"}</span>
                    <span className="font-mono bg-slate-100 px-1 rounded text-emerald-800">{"{STAT_NAME}"}</span>
                  </div>
                  {editingRule.workflow_name ? (
                    <span className="text-emerald-700 font-medium">Leave blank to use canvas nodes</span>
                  ) : (
                    <span className="text-amber-700 font-medium">* Required for auto-reply</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attachment (Optional File/PDF)</label>
                <input
                  type="text"
                  placeholder="e.g. Rate-Card-Catalog.pdf"
                  value={editingRule.attachment || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, attachment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-semibold shadow-sm transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
