import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  GitBranch, List, Plus, Play, Save, RotateCcw, RotateCw,
  ZoomIn, ZoomOut, Maximize2, Trash2, Edit3, X, Check,
  MessageSquare, FileText, Image, Video, Music, MapPin,
  HelpCircle, CreditCard, Layers, Bot, Zap, Smartphone,
  CheckCircle2, Clock, Calendar, Paperclip, ChevronRight,
  ExternalLink, Sparkles, AlertCircle, ArrowRight, CornerDownRight
} from 'lucide-react';

// Types for Flow Canvas
interface GroupChoiceOption {
  label: string;
  targetGroup?: string;
}

interface GroupItem {
  id: string;
  type: 'message' | 'choice' | 'collect' | 'jump';
  content?: string;
  question?: string;
  options?: GroupChoiceOption[];
  varName?: string;
  targetGroup?: string;
}

interface FlowGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  items: GroupItem[];
}

// Types for Keyword Rules
interface KeywordRule {
  id: string;
  title: string;
  triggered_count: number;
  active: boolean;
  keywords: string[];
  reply: string;
  attachment?: string;
}

interface DaySchedule {
  day: string;
  time: string;
  enabled: boolean;
}

export const WorkflowBuilderView: React.FC = () => {
  const { addToast } = useQiyamStore();

  // Top Mode Switcher: 'canvas' | 'keyword_rules'
  const [activeMode, setActiveMode] = useState<'canvas' | 'keyword_rules'>('canvas');

  // Subheader Toggles
  const [staticVariables, setStaticVariables] = useState(true);
  const [globalVariables, setGlobalVariables] = useState(false);
  const [autosave, setAutosave] = useState(true);

  // Zoom Level
  const [zoom, setZoom] = useState(1);

  // Bot Title
  const [botTitle, setBotTitle] = useState('Chatbot 1');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Test Bot Modal State
  const [isTestBotOpen, setIsTestBotOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; options?: string[] }>>([
    {
      sender: 'bot',
      text: 'Hi Rahul! Greetings from ARC LLC. Our smart chatbot will guide you through the process.',
    },
    {
      sender: 'bot',
      text: 'Is Rahul your correct name?',
      options: ['Yes', 'No', 'Default'],
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('group-1');

  // Create New Rule Modal
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    title: '',
    keywords: '',
    reply: '',
    attachment: '',
  });

  // Inline Add Keyword state
  const [activeKeywordInputRuleId, setActiveKeywordInputRuleId] = useState<string | null>(null);
  const [inlineKeywordText, setInlineKeywordText] = useState('');

  // Initial Flow Groups (Exact structure from Screenshot 1)
  const [groups, setGroups] = useState<FlowGroup[]>([
    {
      id: 'group-1',
      title: 'Group #1',
      x: 30,
      y: 40,
      items: [
        {
          id: 'item-1-1',
          type: 'message',
          content: 'Hi {STAT_NAME} Greetings from ARC LLC. Our smart chatbot will guide you through the process.'
        },
        {
          id: 'item-1-2',
          type: 'choice',
          question: 'Is {STAT_NAME} your correct name?',
          options: [
            { label: 'Yes', targetGroup: 'group-3' },
            { label: 'No', targetGroup: 'group-2' },
            { label: 'Default', targetGroup: 'group-4' }
          ]
        }
      ]
    },
    {
      id: 'group-2',
      title: 'Group #2',
      x: 370,
      y: 40,
      items: [
        { id: 'item-2-1', type: 'message', content: 'What is your good name ?' },
        { id: 'item-2-2', type: 'collect', varName: 'name' },
        { id: 'item-2-3', type: 'message', content: 'Okay {name}! What is your age ?' },
        { id: 'item-2-4', type: 'collect', varName: 'Age' },
        { id: 'item-2-5', type: 'message', content: 'Please enter your email address' },
        { id: 'item-2-6', type: 'collect', varName: 'mail' }
      ]
    },
    {
      id: 'group-3',
      title: 'Group #3',
      x: 710,
      y: 40,
      items: [
        {
          id: 'item-3-1',
          type: 'choice',
          question: 'What is the purpose of your travel ?',
          options: [
            { label: 'Study abroad', targetGroup: 'group-5' },
            { label: 'Work abroad', targetGroup: 'group-6' },
            { label: 'Migrate', targetGroup: 'group-7' },
            { label: 'Default' }
          ]
        }
      ]
    },
    {
      id: 'group-4',
      title: 'Group #4',
      x: 710,
      y: 410,
      items: [
        { id: 'item-4-1', type: 'message', content: 'Please select 1 from the buttons' },
        { id: 'item-4-2', type: 'jump', targetGroup: 'Group #3' }
      ]
    },
    {
      id: 'group-5',
      title: 'Group #5',
      x: 1050,
      y: 40,
      items: [
        {
          id: 'item-5-1',
          type: 'choice',
          question: 'Hello To which country ?',
          options: [
            { label: 'Canada' },
            { label: 'UK' },
            { label: 'Australia' },
            { label: 'Germany' },
            { label: 'USA' },
            { label: 'New Zealand' }
          ]
        }
      ]
    },
    {
      id: 'group-6',
      title: 'Group #6',
      x: 1390,
      y: 40,
      items: [
        {
          id: 'item-6-1',
          type: 'choice',
          question: 'What is your current education qualification?',
          options: [
            { label: 'Plus-two' },
            { label: 'UG' },
            { label: 'PG' },
            { label: 'Default' }
          ]
        }
      ]
    },
    {
      id: 'group-7',
      title: 'Group #7',
      x: 1730,
      y: 40,
      items: [
        {
          id: 'item-7-1',
          type: 'choice',
          question: 'Field of study Select preferred field following list.',
          options: [
            { label: 'Computer Science' },
            { label: 'Business Studies' },
            { label: 'Medical Studies' },
            { label: 'Law & Order' },
            { label: 'Humanities' },
            { label: 'Art' }
          ]
        }
      ]
    }
  ]);

  // Initial Keyword Rules (Exact matching Screenshot 2)
  const [keywordRules, setKeywordRules] = useState<KeywordRule[]>([
    {
      id: 'rule-1',
      title: 'Price List Auto-Reply',
      triggered_count: 0,
      active: true,
      keywords: ['price', 'catalog', 'rate'],
      reply: 'Hello! Here is our latest wholesale rate card catalog PDF.',
      attachment: 'Rate-Card-Catalog.pdf'
    },
    {
      id: 'rule-2',
      title: 'Claim ₹500 Discount Auto-Responder',
      triggered_count: 1,
      active: true,
      keywords: ['claim ₹500 discount', 'discount', 'claim 500', 'festival offer'],
      reply: '🎉 *Congratulations!* Your ₹500 discount code is: *FEST500*\n\nApply this code on your next purchase to get flat ₹500 OFF instantly!\n\n🌐 Visit Store: https://qiyam.ventures'
    },
    {
      id: 'rule-3',
      title: 'Emergency AC Service Dispatch',
      triggered_count: 24,
      active: true,
      keywords: ['ac breakdown', 'emergency', 'leakage', 'gas refill'],
      reply: 'We have received your emergency request! 🛠️ A certified technician has been notified and will call you within 5 minutes.'
    },
    {
      id: 'rule-4',
      title: 'Human Support Representative',
      triggered_count: 18,
      active: true,
      keywords: ['talk to human', 'agent', 'support', 'customer executive'],
      reply: 'Connecting you to our senior support desk. Our field coordinator will reply to you within 3 minutes! 📞'
    }
  ]);

  // Working Hours (Exact matching Screenshot 2)
  const [workingHours, setWorkingHours] = useState<DaySchedule[]>([
    { day: 'Monday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Tuesday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Wednesday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Thursday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Friday', time: '9:30 AM – 7:30 PM', enabled: true },
    { day: 'Saturday', time: '10:00 AM – 8:00 PM', enabled: true },
    { day: 'Sunday', time: 'Closed', enabled: false },
  ]);

  // Add Group to Canvas
  const handleAddGroup = () => {
    const nextIdx = groups.length + 1;
    const newGrp: FlowGroup = {
      id: `group-${Date.now()}`,
      title: `Group #${nextIdx}`,
      x: 50 + (groups.length % 5) * 340,
      y: 120 + Math.floor(groups.length / 5) * 380,
      items: [
        {
          id: `item-${Date.now()}`,
          type: 'message',
          content: `New message block in Group #${nextIdx}.`
        }
      ]
    };
    setGroups([...groups, newGrp]);
    addToast(`Added Group #${nextIdx} to canvas`, 'success');
  };

  // Add block to Group from Library
  const handleAddBlockToGroup = (blockTitle: string, category: string) => {
    if (groups.length === 0) {
      handleAddGroup();
      return;
    }
    const targetGroup = groups[groups.length - 1];
    const newItem: GroupItem = {
      id: `item-${Date.now()}`,
      type: category === 'INPUTS' ? 'collect' : category === 'CHOICES' ? 'choice' : 'message',
      content: `${blockTitle} block content`,
      varName: category === 'INPUTS' ? blockTitle.toLowerCase() : undefined,
      options: category === 'CHOICES' ? [{ label: 'Option 1' }, { label: 'Option 2' }] : undefined
    };
    const updated = groups.map((g) =>
      g.id === targetGroup.id ? { ...g, items: [...g.items, newItem] } : g
    );
    setGroups(updated);
    addToast(`Added "${blockTitle}" block to ${targetGroup.title}`, 'success');
  };

  // Toggle Keyword Rule Active
  const handleToggleRule = (id: string) => {
    setKeywordRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // Delete Keyword Rule
  const handleDeleteRule = (id: string) => {
    setKeywordRules((prev) => prev.filter((r) => r.id !== id));
    addToast('Keyword rule removed', 'info');
  };

  // Inline Add Keyword to Rule
  const handleAddKeywordToRule = (ruleId: string) => {
    if (!inlineKeywordText.trim()) return;
    setKeywordRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, keywords: [...r.keywords, inlineKeywordText.trim().toLowerCase()] }
          : r
      )
    );
    setInlineKeywordText('');
    setActiveKeywordInputRuleId(null);
    addToast('Keyword added', 'success');
  };

  // Remove Keyword from Rule
  const handleRemoveKeyword = (ruleId: string, kwToRemove: string) => {
    setKeywordRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, keywords: r.keywords.filter((k) => k !== kwToRemove) }
          : r
      )
    );
  };

  // Create New Rule Submit
  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.keywords.trim()) {
      addToast('Please fill in title and keywords', 'warning');
      return;
    }
    const kwList = newRule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    const created: KeywordRule = {
      id: `rule-${Date.now()}`,
      title: newRule.title.trim(),
      triggered_count: 0,
      active: true,
      keywords: kwList,
      reply: newRule.reply.trim() || 'Automated reply from WhatsQ Assistant.',
      attachment: newRule.attachment.trim() || undefined
    };
    setKeywordRules([created, ...keywordRules]);
    setIsNewRuleModalOpen(false);
    setNewRule({ title: '', keywords: '', reply: '', attachment: '' });
    addToast(`Keyword Rule "${created.title}" created`, 'success');
  };

  // Toggle Working Hour day
  const handleToggleDay = (dayName: string) => {
    setWorkingHours((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, enabled: !d.enabled } : d))
    );
  };

  // Interactive Test Bot Handlers
  const handleOptionClick = (opt: string) => {
    const nextMessages = [
      ...testMessages,
      { sender: 'user' as const, text: opt },
    ];
    if (opt.toLowerCase() === 'yes') {
      nextMessages.push({
        sender: 'bot',
        text: 'What is the purpose of your travel ?',
        options: ['Study abroad', 'Work abroad', 'Migrate', 'Default']
      });
      setCurrentStep('group-3');
    } else if (opt.toLowerCase() === 'no') {
      nextMessages.push({
        sender: 'bot',
        text: 'What is your good name ?'
      });
      setCurrentStep('group-2');
    } else if (['study abroad', 'work abroad', 'migrate'].includes(opt.toLowerCase())) {
      nextMessages.push({
        sender: 'bot',
        text: 'Hello To which country ?',
        options: ['Canada', 'UK', 'Australia', 'Germany', 'USA']
      });
      setCurrentStep('group-5');
    } else {
      nextMessages.push({
        sender: 'bot',
        text: `Thank you! Your selection "${opt}" has been recorded. Our counselor will connect shortly.`,
      });
    }
    setTestMessages(nextMessages);
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;
    const txt = userChatInput.trim();
    setUserChatInput('');
    const next = [...testMessages, { sender: 'user' as const, text: txt }];
    if (currentStep === 'group-2') {
      next.push({ sender: 'bot' as const, text: `Okay ${txt}! What is your age ?` });
    } else {
      next.push({ sender: 'bot' as const, text: `Got it: "${txt}". Checking your requirements...` });
    }
    setTestMessages(next);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-screen overflow-hidden font-sans select-none">
      {/* ========================================================================= */}
      {/* TOP HEADER: CAPSULE SWITCHER (FLOW BUILDER vs KEYWORD RULES)             */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-xs z-20">
        {/* Two-Tab Segmented Capsule */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveMode('canvas')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'canvas'
                ? 'bg-[#0B3B2C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Visual Flow Canvas (Flow Builder)</span>
          </button>

          <button
            onClick={() => setActiveMode('keyword_rules')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'keyword_rules'
                ? 'bg-[#0B3B2C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4 text-emerald-400" />
            <span>Keyword Rules Table</span>
          </button>
        </div>

        {/* Right Header Action */}
        <div>
          {activeMode === 'keyword_rules' ? (
            <button
              onClick={() => setIsNewRuleModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Rule</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                Flow Version: <strong className="text-emerald-700">v2.4 (Live)</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: VISUAL FLOW CANVAS (FLOW BUILDER)                                 */}
      {/* ========================================================================= */}
      {activeMode === 'canvas' && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Subheader Toolbar */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 text-xs z-10">
            {/* Left: Bot Title & Variables Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 cursor-pointer" />
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={botTitle}
                    onChange={(e) => setBotTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    autoFocus
                    className="font-bold text-sm text-slate-900 border-b border-emerald-500 outline-none px-1"
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingTitle(true)}
                    className="font-bold text-sm text-slate-900 cursor-pointer hover:text-emerald-700 transition flex items-center gap-1.5"
                    title="Click to rename chatbot"
                  >
                    <span>{botTitle}</span>
                    <Edit3 className="w-3 h-3 text-slate-400" />
                  </span>
                )}
              </div>

              {/* Static Variables Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Static Variables</span>
                <button
                  onClick={() => setStaticVariables(!staticVariables)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    staticVariables ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      staticVariables ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Global Variables Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Global Variables</span>
                <button
                  onClick={() => setGlobalVariables(!globalVariables)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    globalVariables ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      globalVariables ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Center: Test Bot Button */}
            <button
              onClick={() => setIsTestBotOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>Test Bot</span>
            </button>

            {/* Right: Autosave, Undo/Redo, Save */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Autosave</span>
                <button
                  onClick={() => setAutosave(!autosave)}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    autosave ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                      autosave ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                <button
                  onClick={() => addToast('Action undone', 'info')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Undo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => addToast('Action redone', 'info')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Redo"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => addToast('Workflow saved successfully', 'success')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-bold shadow-sm transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Main Canvas & Block Library Container */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Floating Zoom & Add Group Toolbar (Left) */}
            <div className="absolute top-6 left-6 z-20 bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 flex flex-col gap-1.5 text-slate-600">
              <button
                onClick={handleAddGroup}
                className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold transition cursor-pointer"
                title="Add New Group (Card)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="h-px bg-slate-200 my-0.5" />
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.1, 1.5))}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.1, 0.6))}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center font-mono text-[11px] font-bold text-slate-700 transition cursor-pointer"
                title="Reset Zoom (1:1)"
              >
                1:1
              </button>
            </div>

            {/* Canvas Scrollable Area */}
            <div
              className="flex-1 overflow-auto bg-[#F4F6F5] relative p-12"
              style={{
                backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
                backgroundSize: '24px 24px',
              }}
            >
              <div
                className="relative min-w-[2200px] min-h-[900px] transition-transform origin-top-left"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* SVG Connections between Nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Group 1 -> Group 3 (Yes branch) */}
                  <path
                    d="M 330 205 C 520 205, 520 120, 710 120"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Group 1 -> Group 2 (No branch) */}
                  <path
                    d="M 330 240 C 350 240, 350 140, 370 140"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />

                  {/* Group 1 -> Group 4 (Default branch) */}
                  <path
                    d="M 330 270 C 500 270, 500 450, 710 450"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Group 4 -> Group 3 (Jump) */}
                  <path
                    d="M 1010 450 C 950 450, 750 350, 750 250"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />

                  {/* Group 3 -> Group 5 (Study abroad) */}
                  <path
                    d="M 1010 120 C 1030 120, 1030 120, 1050 120"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />

                  {/* Group 3 -> Group 6 (Work abroad) */}
                  <path
                    d="M 1010 155 C 1200 155, 1200 120, 1390 120"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />

                  {/* Group 3 -> Group 7 (Migrate) */}
                  <path
                    d="M 1010 185 C 1370 185, 1370 120, 1730 120"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                </svg>

                {/* Render Group Cards */}
                {groups.map((grp) => (
                  <div
                    key={grp.id}
                    style={{ left: `${grp.x}px`, top: `${grp.y}px` }}
                    className="absolute w-[300px] bg-white rounded-2xl border-2 border-emerald-400/80 shadow-md hover:shadow-xl transition-all z-10 flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-xs text-slate-800">{grp.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={() => {
                            setGroups(groups.filter((g) => g.id !== grp.id));
                            addToast(`Deleted ${grp.title}`, 'info');
                          }}
                          className="hover:text-red-500 transition p-1"
                          title="Delete Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Items */}
                    <div className="p-3.5 space-y-3 text-xs flex-1">
                      {grp.items.map((item) => (
                        <div key={item.id} className="space-y-1.5">
                          {/* Message Item */}
                          {item.type === 'message' && (
                            <div className="bg-[#EAFBF3] border border-emerald-200/80 p-2.5 rounded-xl text-slate-800 space-y-1">
                              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                                <MessageSquare className="w-3 h-3" />
                                <span>Message</span>
                              </div>
                              <div className="text-[11px] leading-relaxed text-slate-700 font-medium">
                                {item.content}
                              </div>
                            </div>
                          )}

                          {/* Collect Input Item */}
                          {item.type === 'collect' && (
                            <div className="bg-purple-50 border border-purple-200/80 px-3 py-2 rounded-xl flex items-center justify-between text-purple-900">
                              <div className="flex items-center gap-2 font-semibold text-[11px]">
                                <span className="font-mono text-[10px] text-purple-500">T:</span>
                                <span>Collect</span>
                                <span className="bg-purple-200/70 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {item.varName}
                                </span>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                            </div>
                          )}

                          {/* Choice / Question Item */}
                          {item.type === 'choice' && (
                            <div className="space-y-2">
                              {item.question && (
                                <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1 text-amber-700">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  <span>{item.question}</span>
                                </div>
                              )}
                              <div className="space-y-1.5">
                                {item.options?.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 flex items-center justify-between text-slate-800 font-semibold text-[11px] transition shadow-2xs"
                                  >
                                    <span>{opt.label}</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Jump to Group Item */}
                          {item.type === 'jump' && (
                            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between font-semibold text-[11px]">
                              <span>&gt;&gt; Jump to {item.targetGroup}</span>
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar: BLOCK LIBRARY */}
            <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto font-sans text-xs z-10">
              {/* Library Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800 tracking-wider text-[11px] uppercase">BLOCK LIBRARY</span>
                <button
                  onClick={handleAddGroup}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Group</span>
                </button>
              </div>

              {/* Categorized Blocks List */}
              <div className="p-3.5 space-y-4 overflow-y-auto">
                {/* MESSAGES */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MESSAGES</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Text', icon: MessageSquare },
                      { label: 'Image', icon: Image },
                      { label: 'Video', icon: Video },
                      { label: 'YouTube', icon: Video },
                      { label: 'Media', icon: Layers },
                      { label: 'File', icon: FileText },
                      { label: 'Audio', icon: Music },
                      { label: 'Location', icon: MapPin },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'MESSAGES')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHOICES */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CHOICES</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Quick Reply', icon: MessageSquare },
                      { label: 'List', icon: List },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'CHOICES')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* INPUTS */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">INPUTS</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Text', icon: MessageSquare },
                      { label: 'Number', icon: Layers },
                      { label: 'Email', icon: MessageSquare },
                      { label: 'Website', icon: ExternalLink },
                      { label: 'Date', icon: Calendar },
                      { label: 'Time', icon: Clock },
                      { label: 'Phone', icon: Smartphone },
                      { label: 'File', icon: FileText },
                      { label: 'Location', icon: MapPin },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'INPUTS')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PAYMENTS */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PAYMENTS</div>
                  <button
                    onClick={() => handleAddBlockToGroup('Payment Link', 'PAYMENTS')}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 flex items-center gap-2 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link</span>
                  </button>
                </div>

                {/* LOGIC */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LOGIC</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Condition', icon: GitBranch },
                      { label: 'Chatbot', icon: Bot },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'LOGIC')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* INTEGRATIONS */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">INTEGRATIONS</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Sheets', icon: FileText },
                      { label: 'Webhook', icon: Zap },
                      { label: 'Email', icon: MessageSquare },
                      { label: 'Zapier', icon: Zap },
                      { label: 'Make.com', icon: Sparkles },
                      { label: 'Pabbly', icon: Layers },
                    ].map((b, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddBlockToGroup(b.label, 'INTEGRATIONS')}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 flex items-center gap-1.5 transition text-[11px] font-medium text-slate-700 shadow-2xs cursor-pointer"
                      >
                        <b.icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KEYWORD RULES TABLE                                               */}
      {/* ========================================================================= */}
      {activeMode === 'keyword_rules' && (
        <div className="flex-1 p-6 overflow-y-auto font-sans space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Keyword Rules List */}
            <div className="lg:col-span-2 space-y-5">
              {keywordRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Rule Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{rule.title}</h3>
                        <div className="text-xs text-slate-500 font-medium">
                          Triggered {rule.triggered_count} times
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{rule.active ? 'ON' : 'OFF'}</span>
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            rule.active ? 'bg-[#0B3B2C]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform transform ${
                              rule.active ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* When Customer Says... */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      WHEN CUSTOMER SAYS...
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {rule.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="bg-slate-100 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5"
                        >
                          <span>{kw}</span>
                          <button
                            onClick={() => handleRemoveKeyword(rule.id, kw)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {activeKeywordInputRuleId === rule.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Type keyword and press Enter..."
                            value={inlineKeywordText}
                            onChange={(e) => setInlineKeywordText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddKeywordToRule(rule.id);
                              }
                            }}
                            autoFocus
                            className="text-xs px-3 py-1.5 border border-emerald-400 rounded-xl outline-none bg-white w-44"
                          />
                          <button
                            onClick={() => handleAddKeywordToRule(rule.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveKeywordInputRuleId(rule.id);
                            setInlineKeywordText('');
                          }}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-lg border border-dashed border-emerald-300 hover:bg-emerald-50 transition cursor-pointer"
                        >
                          + Add keyword
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reply With... */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      REPLY WITH...
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                      {rule.reply}
                    </div>

                    {rule.attachment && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rule.attachment}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Working Hours Card */}
            <div className="space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>Working Hours</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Your chatbot prioritizes automated replies and away messages outside active hours.
                </p>

                {/* Day Schedule List */}
                <div className="divide-y divide-slate-100">
                  {workingHours.map((wh) => (
                    <div key={wh.day} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{wh.day}</div>
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5">{wh.time}</div>
                      </div>

                      <input
                        type="checkbox"
                        checked={wh.enabled}
                        onChange={() => handleToggleDay(wh.day)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-[#0B3B2C]"
                      />
                    </div>
                  ))}
                </div>

                {/* Away Message Box */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Outside Hours Away Message:
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Hi there! Thanks for reaching out to WhatsQ. Our team is currently away from the desk. We will get back to you promptly when we open tomorrow morning!"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => addToast('Working hours & away message saved', 'success')}
                    className="w-full py-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Save Working Hours
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEST BOT INTERACTIVE MODAL                                                */}
      {/* ========================================================================= */}
      {isTestBotOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsTestBotOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200 flex flex-col h-[600px]">
            {/* Modal Header (WhatsApp style) */}
            <div className="p-4 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">WhatsQ Test Bot</h3>
                  <div className="text-[11px] text-emerald-300">Live Simulator (Testing {botTitle})</div>
                </div>
              </div>
              <button
                onClick={() => setIsTestBotOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EFEAE2]"
              style={{
                backgroundImage: 'radial-gradient(#CBD5E1 0.7px, transparent 0.7px)',
                backgroundSize: '16px 16px',
              }}
            >
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#D9FDD3] text-slate-800 rounded-br-none'
                        : 'bg-white text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <div>{msg.text}</div>
                  </div>

                  {/* Interactive Button Choices */}
                  {msg.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt)}
                          className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendTestMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Type a message to test flow..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-[#0B3B2C] hover:bg-[#072B1F] text-white rounded-xl font-bold shadow-xs transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE NEW KEYWORD RULE MODAL                                             */}
      {/* ========================================================================= */}
      {isNewRuleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsNewRuleModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden font-sans border border-slate-200">
            <div className="p-5 bg-[#0B3B2C] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create Keyword Trigger Rule</h3>
                <p className="text-xs text-emerald-300">Auto-respond when incoming message matches keywords</p>
              </div>
              <button
                onClick={() => setIsNewRuleModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rule Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rate Card PDF Auto-Reply"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Trigger Keywords (separated by comma) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. price, catalog, pricing, cost, rate"
                  value={newRule.keywords}
                  onChange={(e) => setNewRule({ ...newRule, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Automated Reply Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hello! Here is our latest wholesale rate card catalog..."
                  value={newRule.reply}
                  onChange={(e) => setNewRule({ ...newRule, reply: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attachment (Optional File/PDF)</label>
                <input
                  type="text"
                  placeholder="e.g. Rate-Card-Catalog.pdf"
                  value={newRule.attachment}
                  onChange={(e) => setNewRule({ ...newRule, attachment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
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
    </div>
  );
};


