import React, { useState, useEffect } from 'react';
import {
  X, Check, Copy, ExternalLink, ShieldCheck, AlertCircle,
  Key, Globe, RefreshCw, CheckCircle2, ChevronRight,
  BookOpen, Terminal, Zap, Shield, HelpCircle, Eye, EyeOff,
  Activity, ArrowRight, Lock, CheckCircle, Smartphone
} from 'lucide-react';
import { IntegrationItem } from '@/types';
import { INTEGRATION_GUIDES } from './integrationGuides';
import { IntegrationIcon } from '@/components/common/IntegrationIcon';

interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationItem | null;
  onSave: (id: string | number, config: Record<string, any>, status?: 'connected' | 'partially_connected' | 'not_connected') => Promise<boolean>;
  onTest: (id: string | number, config: Record<string, any>) => Promise<{ success: boolean; message: string; latency_ms?: number }>;
}

export const IntegrationConfigModal: React.FC<IntegrationConfigModalProps> = ({
  isOpen,
  onClose,
  integration,
  onSave,
  onTest,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'credentials' | 'automations' | 'diagnostics'>('credentials');
  const [formConfig, setFormConfig] = useState<Record<string, any>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Testing & Saving State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Determine integration guide key
  const guideKey = React.useMemo(() => {
    if (!integration) return 'google';
    const name = integration.name.toLowerCase();
    if (name.includes('google')) return 'google';
    if (name.includes('slack')) return 'slack';
    if (name.includes('zoho')) return 'zoho';
    if (name.includes('quickbooks')) return 'quickbooks';
    if (name.includes('shopify')) return 'shopify';
    if (name.includes('razorpay')) return 'razorpay';
    if (name.includes('woocommerce')) return 'woocommerce';
    return 'google';
  }, [integration]);

  const guide = INTEGRATION_GUIDES[guideKey] || INTEGRATION_GUIDES.google;

  // Initialize or reset form state when modal opens
  useEffect(() => {
    if (integration) {
      setFormConfig(integration.config || {});
      setTestResult(null);
      setIsTesting(false);
      setIsSaving(false);
    }
  }, [integration, isOpen]);

  if (!isOpen || !integration) return null;

  const handleFieldChange = (key: string, value: any) => {
    setFormConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleShowSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTest(integration.id, formConfig);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection handshake failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // If credentials provided, set status to connected
      const newStatus = Object.keys(formConfig).length > 0 ? 'connected' : integration.status;
      await onSave(integration.id, formConfig, newStatus);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const isConnected = integration.status === 'connected';
  const callbackDomain = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://whatsq.qiyambusinesssolutions.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* ── Top Header Banner ── */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-xs border border-slate-200/90 bg-white p-1.5 flex items-center justify-center shrink-0">
              <IntegrationIcon slug={integration.icon_slug} name={integration.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {integration.name}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-400/20'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isConnected ? 'CONNECTED' : 'PARTIAL / PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {integration.category} • {integration.automations_enabled} Active Workflows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tab Navigation Bar ── */}
        <div className="px-5 sm:px-6 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between overflow-x-auto scrollbar-hide text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'credentials'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Credentials & API Keys</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Step-by-Step Tutorial</span>
              <span className="text-[9.5px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'automations'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Webhooks & Automations</span>
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-500" />
              <span>Health & Diagnostics</span>
            </button>
          </div>

          <a
            href={guide.portalUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
          >
            <span>{guide.portalName}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* ── Scrollable Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          
          {/* ═══════════ TAB 1: CREDENTIALS & API KEYS ═══════════ */}
          {activeTab === 'credentials' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Quick Guide Reminder Box */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Configuring {integration.name} for automatic WhatsApp workflows.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <span>View Step-by-Step Setup Tutorial</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Dynamic Form Inputs per Integration ── */}
              
              {/* 1. GOOGLE WORKSPACE */}
              {guideKey === 'google' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      OAuth 2.0 Client ID
                    </label>
                    <input
                      type="text"
                      value={formConfig.client_id || ''}
                      onChange={(e) => handleFieldChange('client_id', e.target.value)}
                      placeholder="e.g. 10928391823-abc123xyz.apps.googleusercontent.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Obtained from Google Cloud Console &gt; APIs &amp; Services &gt; Credentials</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      OAuth 2.0 Client Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.client_secret ? 'text' : 'password'}
                        value={formConfig.client_secret || ''}
                        onChange={(e) => handleFieldChange('client_secret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('client_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.client_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Account Email (Optional for Server Background Sync)
                    </label>
                    <input
                      type="text"
                      value={formConfig.service_account_email || ''}
                      onChange={(e) => handleFieldChange('service_account_email', e.target.value)}
                      placeholder="whatsq-sync@your-project.iam.gserviceaccount.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Primary Calendar ID
                    </label>
                    <input
                      type="text"
                      value={formConfig.calendar_id || 'primary'}
                      onChange={(e) => handleFieldChange('calendar_id', e.target.value)}
                      placeholder="primary or technician-calendar@group.calendar.google.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* 2. SLACK */}
              {guideKey === 'slack' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bot User OAuth Token (xoxb-...)
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.bot_token ? 'text' : 'password'}
                        value={formConfig.bot_token || ''}
                        onChange={(e) => handleFieldChange('bot_token', e.target.value)}
                        placeholder="xoxb-891238491823-8912384729182-..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('bot_token')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.bot_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-1">Copy from Slack API &gt; OAuth &amp; Permissions &gt; Bot User OAuth Token</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Default Alerts Channel
                    </label>
                    <input
                      type="text"
                      value={formConfig.default_channel || '#whatsq-alerts'}
                      onChange={(e) => handleFieldChange('default_channel', e.target.value)}
                      placeholder="#whatsq-alerts or #general"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      App Signing Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.signing_secret ? 'text' : 'password'}
                        value={formConfig.signing_secret || ''}
                        onChange={(e) => handleFieldChange('signing_secret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('signing_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.signing_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ZOHO CRM */}
              {guideKey === 'zoho' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Zoho Accounts Region / Data Center
                    </label>
                    <select
                      value={formConfig.datacenter || 'zoho.in'}
                      onChange={(e) => handleFieldChange('datacenter', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 bg-white font-medium"
                    >
                      <option value="zoho.in">India &amp; South Asia (zoho.in)</option>
                      <option value="zoho.com">United States &amp; Global (zoho.com)</option>
                      <option value="zoho.eu">European Union (zoho.eu)</option>
                      <option value="zoho.com.au">Australia &amp; NZ (zoho.com.au)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Zoho Client ID
                    </label>
                    <input
                      type="text"
                      value={formConfig.client_id || ''}
                      onChange={(e) => handleFieldChange('client_id', e.target.value)}
                      placeholder="1000.XXXXX...ZOHO"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Zoho Client Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.client_secret ? 'text' : 'password'}
                        value={formConfig.client_secret || ''}
                        onChange={(e) => handleFieldChange('client_secret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('client_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.client_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Zoho Grant Code (from Zoho API Console)
                    </label>
                    <input
                      type="text"
                      value={formConfig.auth_code || ''}
                      onChange={(e) => handleFieldChange('auth_code', e.target.value)}
                      placeholder="1000.xxxx.grant_token"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Generated via Self-Client with scope: ZohoCRM.modules.ALL,ZohoCRM.settings.ALL</p>
                  </div>
                </div>
              )}

              {/* 4. QUICKBOOKS ONLINE */}
              {guideKey === 'quickbooks' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Environment
                      </label>
                      <select
                        value={formConfig.environment || 'sandbox'}
                        onChange={(e) => handleFieldChange('environment', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 bg-white font-medium"
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="production">Production (Live)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company ID (Realm ID)
                      </label>
                      <input
                        type="text"
                        value={formConfig.realm_id || ''}
                        onChange={(e) => handleFieldChange('realm_id', e.target.value)}
                        placeholder="e.g. 46208163653198234"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      QuickBooks Client ID
                    </label>
                    <input
                      type="text"
                      value={formConfig.client_id || ''}
                      onChange={(e) => handleFieldChange('client_id', e.target.value)}
                      placeholder="ABQIYAM89123891238Intuit..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      QuickBooks Client Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.client_secret ? 'text' : 'password'}
                        value={formConfig.client_secret || ''}
                        onChange={(e) => handleFieldChange('client_secret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('client_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.client_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SHOPIFY */}
              {guideKey === 'shopify' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Shopify Store Domain (*.myshopify.com)
                    </label>
                    <input
                      type="text"
                      value={formConfig.store_domain || ''}
                      onChange={(e) => handleFieldChange('store_domain', e.target.value)}
                      placeholder="e.g. coolfix-store.myshopify.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Use the original myshopify subdomain of your store.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Admin API Access Token (shpat_...)
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.access_token ? 'text' : 'password'}
                        value={formConfig.access_token || ''}
                        onChange={(e) => handleFieldChange('access_token', e.target.value)}
                        placeholder="shpat_8912389182391823ab98..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('access_token')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.access_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-1">Generated in Shopify Admin &gt; Settings &gt; Apps and sales channels &gt; Develop apps</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Webhook Secret Key
                    </label>
                    <input
                      type="text"
                      value={formConfig.webhook_secret || ''}
                      onChange={(e) => handleFieldChange('webhook_secret', e.target.value)}
                      placeholder="e.g. 7f98c8e192..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* 6. RAZORPAY */}
              {guideKey === 'razorpay' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Operating Mode
                      </label>
                      <select
                        value={formConfig.mode || 'live'}
                        onChange={(e) => handleFieldChange('mode', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 bg-white font-medium"
                      >
                        <option value="live">Live Mode (Production Real Money)</option>
                        <option value="test">Test Mode (Sandbox / Testing)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Primary Currency
                      </label>
                      <select
                        value={formConfig.currency || 'INR'}
                        onChange={(e) => handleFieldChange('currency', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-800 bg-white font-medium"
                      >
                        <option value="INR">INR (₹ Indian Rupee)</option>
                        <option value="AED">AED (د.إ UAE Dirham)</option>
                        <option value="USD">USD ($ US Dollar)</option>
                        <option value="EUR">EUR (€ Euro)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      value={formConfig.key_id || ''}
                      onChange={(e) => handleFieldChange('key_id', e.target.value)}
                      placeholder="rzp_live_... or rzp_test_..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Razorpay Key Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.key_secret ? 'text' : 'password'}
                        value={formConfig.key_secret || ''}
                        onChange={(e) => handleFieldChange('key_secret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('key_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets.key_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Webhook Secret (For HMAC Payment Confirmation)
                    </label>
                    <input
                      type="text"
                      value={formConfig.webhook_secret || 'whatsq_rzp_secret_2026'}
                      onChange={(e) => handleFieldChange('webhook_secret', e.target.value)}
                      placeholder="whatsq_whsec_2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* 7. WOOCOMMERCE */}
              {guideKey === 'woocommerce' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Store URL (WordPress Site URL)
                    </label>
                    <input
                      type="url"
                      value={formConfig.store_url || ''}
                      onChange={(e) => handleFieldChange('store_url', e.target.value)}
                      placeholder="https://yourstore.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-xs text-slate-800 bg-white"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Include https://. Example: https://coolfix-store.com</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Consumer Key (ck_...)
                    </label>
                    <input
                      type="text"
                      value={formConfig.consumer_key || ''}
                      onChange={(e) => handleFieldChange('consumer_key', e.target.value)}
                      placeholder="ck_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-xs text-slate-800 bg-white"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Generated in WooCommerce &gt; Settings &gt; Advanced &gt; REST API</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Consumer Secret (cs_...)
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.consumer_secret ? 'text' : 'password'}
                        value={formConfig.consumer_secret || ''}
                        onChange={(e) => handleFieldChange('consumer_secret', e.target.value)}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-xs text-slate-800 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('consumer_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSecrets.consumer_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        API Version
                      </label>
                      <select
                        value={formConfig.api_version || 'wc/v3'}
                        onChange={(e) => handleFieldChange('api_version', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-slate-800 bg-white font-medium"
                      >
                        <option value="wc/v3">WooCommerce REST API v3 (Recommended)</option>
                        <option value="wc/v2">WooCommerce REST API v2</option>
                        <option value="wc/v1">WooCommerce REST API v1</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Webhook Secret (HMAC-SHA256)
                      </label>
                      <input
                        type="text"
                        value={formConfig.webhook_secret || ''}
                        onChange={(e) => handleFieldChange('webhook_secret', e.target.value)}
                        placeholder="wc_whsec_qiyam_2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-xs text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div>
                      <div className="text-xs font-semibold text-purple-900">Verify SSL Certificate</div>
                      <div className="text-[10.5px] text-purple-700">Recommended for live WooCommerce production stores with valid SSL.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formConfig.verify_ssl ?? true)}
                      onChange={(e) => handleFieldChange('verify_ssl', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Copyable Webhook Helper */}
                  <div className="p-3 bg-slate-900 rounded-xl text-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        WooCommerce Webhook Delivery URL
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${callbackDomain}/api/core/integrations/woocommerce/webhook/`, 'wc-webhook-quick')}
                        className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'wc-webhook-quick' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedField === 'wc-webhook-quick' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-purple-200 select-all truncate">
                      {callbackDomain}/api/core/integrations/woocommerce/webhook/
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB 2: STEP-BY-STEP TUTORIAL ═══════════ */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Header Overview Card */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono uppercase tracking-wider">
                    {guide.badge}
                  </span>
                  <a
                    href={guide.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow transition active:scale-95"
                  >
                    <span>Launch {guide.portalName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <h4 className="text-base font-bold text-white">{guide.name} Developer Setup Guide</h4>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">{guide.overview}</p>
                
                {/* Prerequisites */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300">
                  <span className="font-semibold text-emerald-300">Requirements:</span>
                  {guide.prerequisites.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 text-slate-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Numbered Setup Steps */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Setup Walkthrough (5 Easy Steps)</span>
                </h5>

                <div className="space-y-3">
                  {guide.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-sm transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {step.stepNumber}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{step.title}</span>
                        </div>
                        {step.directLink && (
                          <a
                            href={step.directLink.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] flex items-center gap-1 shrink-0 ml-2"
                          >
                            <span>{step.directLink.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed pl-8.5">
                        {step.description}
                      </p>

                      {step.codeSnippet && (
                        <div className="ml-8.5 mt-2 bg-slate-900 text-emerald-300 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between overflow-x-auto">
                          <span className="select-all truncate">{step.codeSnippet}</span>
                          <button
                            onClick={() => copyToClipboard(step.codeSnippet!, `step-${step.stepNumber}`)}
                            className="ml-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-sans font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedField === `step-${step.stepNumber}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {step.tip && (
                        <div className="ml-8.5 mt-2 bg-amber-50/80 border border-amber-200/80 text-amber-900 px-3 py-1.5 rounded-xl text-[11px] flex items-start gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><span className="font-bold">Pro Tip:</span> {step.tip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scopes & Permissions Table */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Required API Scopes &amp; Permissions</span>
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10.5px]">
                        <th className="pb-2">API Scope</th>
                        <th className="pb-2">Purpose in WhatsQ</th>
                        <th className="pb-2 text-right">Requirement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {guide.scopes.map((s, idx) => (
                        <tr key={idx} className="py-2">
                          <td className="py-2 font-mono text-[11px] text-slate-800 font-medium">{s.name}</td>
                          <td className="py-2 text-slate-600 text-[11px]">{s.description}</td>
                          <td className="py-2 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.level === 'Required' ? 'bg-red-50 text-red-700 border border-red-200' :
                              s.level === 'Recommended' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {s.level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Troubleshooting Q&A */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Common Troubleshooting &amp; Fixes</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guide.troubleshooting.map((t, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 text-xs">{t.issue}</div>
                      <div className="text-[11px] text-slate-500 leading-snug">{t.solution}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═══════════ TAB 3: WEBHOOKS & AUTOMATIONS ═══════════ */}
          {activeTab === 'automations' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Webhook Endpoint Banner */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Inbound Webhook Callback URL</span>
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">POST Payload</span>
                </div>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="font-mono text-emerald-300 text-xs select-all truncate">
                    {callbackDomain}{guide.webhookInfo?.endpointPath || `/api/integrations/${guideKey}/webhook/`}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(
                      `${callbackDomain}${guide.webhookInfo?.endpointPath || `/api/integrations/${guideKey}/webhook/`}`,
                      'webhook-url'
                    )}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition"
                  >
                    {copiedField === 'webhook-url' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-200" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {guide.webhookInfo?.instructions || 'Paste this URL into your third-party provider settings to receive live transactional events.'}
                </p>
              </div>

              {/* Automation Toggles per Service */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Automated Workflow Features
                </h5>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden">
                  
                  {/* Google Workspace Automations */}
                  {guideKey === 'google' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Sync Technician Appointments to Google Calendar</div>
                          <div className="text-[11px] text-slate-500">Automatically creates and reschedules Google Calendar events when bookings are confirmed.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.sync_calendar_appointments ?? true)}
                          onChange={(e) => handleFieldChange('sync_calendar_appointments', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Auto-Archive Invoices &amp; Receipts to Google Drive</div>
                          <div className="text-[11px] text-slate-500">Saves generated PDF invoices directly into your organized Google Drive folder.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.backup_invoices_drive ?? true)}
                          onChange={(e) => handleFieldChange('backup_invoices_drive', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Slack Automations */}
                  {guideKey === 'slack' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Post Inbound WhatsApp Customer Messages</div>
                          <div className="text-[11px] text-slate-500">Sends instant alerts to Slack when new customer leads start a WhatsApp conversation.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.notify_inbound_whatsapp ?? true)}
                          onChange={(e) => handleFieldChange('notify_inbound_whatsapp', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Job Completion &amp; Technician Check-In Alerts</div>
                          <div className="text-[11px] text-slate-500">Dispatches real-time cards when staff clock in, arrive at customer locations, or complete jobs.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.notify_job_complete ?? true)}
                          onChange={(e) => handleFieldChange('notify_job_complete', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Zoho CRM Automations */}
                  {guideKey === 'zoho' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Two-Way Lead Synchronization</div>
                          <div className="text-[11px] text-slate-500">Automatically creates Leads in Zoho CRM when new WhatsApp inquiries are received.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.sync_leads ?? true)}
                          onChange={(e) => handleFieldChange('sync_leads', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Deal Pipeline Stage Sync</div>
                          <div className="text-[11px] text-slate-500">Keeps WhatsQ CRM Deal stages synchronized with Zoho Deals in real-time.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.sync_deals ?? true)}
                          onChange={(e) => handleFieldChange('sync_deals', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* QuickBooks Automations */}
                  {guideKey === 'quickbooks' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Auto-Record Invoices to QuickBooks Ledger</div>
                          <div className="text-[11px] text-slate-500">Posts finalized WhatsQ customer invoices to QuickBooks accounts receivable.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.sync_invoices_ledger ?? true)}
                          onChange={(e) => handleFieldChange('sync_invoices_ledger', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Auto-Record Captured Payments</div>
                          <div className="text-[11px] text-slate-500">Marks invoices as paid in QuickBooks when customer transactions complete.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.auto_record_payments ?? false)}
                          onChange={(e) => handleFieldChange('auto_record_payments', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Shopify Automations */}
                  {guideKey === 'shopify' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">WhatsApp Order Confirmation Notification</div>
                          <div className="text-[11px] text-slate-500">Sends an automated WhatsApp message with order details and tracking link upon checkout.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.order_confirmation_whatsapp ?? true)}
                          onChange={(e) => handleFieldChange('order_confirmation_whatsapp', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Automated Abandoned Cart Recovery Message</div>
                          <div className="text-[11px] text-slate-500">Pings customers who left items in cart after 30 minutes with an optional discount.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.abandoned_cart_recovery ?? true)}
                          onChange={(e) => handleFieldChange('abandoned_cart_recovery', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Razorpay Automations */}
                  {guideKey === 'razorpay' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Auto-Generate Dynamic UPI Payment Link on Invoices</div>
                          <div className="text-[11px] text-slate-500">Injects an instant UPI QR and payment link into WhatsApp messages whenever invoices are issued.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.auto_upi_links_invoice ?? true)}
                          onChange={(e) => handleFieldChange('auto_upi_links_invoice', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Instant WhatsApp PDF Receipt Delivery</div>
                          <div className="text-[11px] text-slate-500">Instantly sends the customer a verified receipt message and PDF when payment is captured.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.instant_pdf_receipt_whatsapp ?? true)}
                          onChange={(e) => handleFieldChange('instant_pdf_receipt_whatsapp', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* WooCommerce Automations */}
                  {guideKey === 'woocommerce' && (
                    <>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Instant WhatsApp Order Confirmation</div>
                          <div className="text-[11px] text-slate-500">Dispatches an automated WhatsApp order receipt card with line items and order ID upon checkout.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.order_confirmation_whatsapp ?? true)}
                          onChange={(e) => handleFieldChange('order_confirmation_whatsapp', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Live Order Status Tracking Updates</div>
                          <div className="text-[11px] text-slate-500">Notifies customer when order status changes to Processing, Completed, or Dispatched.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.order_status_tracking ?? true)}
                          onChange={(e) => handleFieldChange('order_status_tracking', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Abandoned Checkout Recovery Reminders</div>
                          <div className="text-[11px] text-slate-500">Sends high-converting WhatsApp recovery message with direct checkout link for pending/failed payments.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.abandoned_cart_recovery ?? true)}
                          onChange={(e) => handleFieldChange('abandoned_cart_recovery', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Auto-Sync Customer to CRM Leads</div>
                          <div className="text-[11px] text-slate-500">Automatically creates or updates WhatsQ CRM customer profile, shipping address, and order history.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.auto_sync_customer_lead ?? true)}
                          onChange={(e) => handleFieldChange('auto_sync_customer_lead', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Low Stock &amp; Inventory Alerts to Staff</div>
                          <div className="text-[11px] text-slate-500">Dispatches an internal alert to operations channel when product inventory drops below threshold.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formConfig.low_stock_staff_alert ?? false)}
                          onChange={(e) => handleFieldChange('low_stock_staff_alert', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* ═══════════ TAB 4: HEALTH & DIAGNOSTICS ═══════════ */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Connection Status Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Live Health Status</h5>
                    <p className="text-[11px] text-slate-500">Real-time connectivity report and API endpoint ping</p>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>{isConnected ? 'Active & Healthy' : 'Action Required'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Last Handshake</span>
                    <span className="font-semibold text-slate-800">{integration.connected_on || 'Just now'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Automations</span>
                    <span className="font-semibold text-slate-800">{integration.automations_enabled} Trigger Flows</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Latency</span>
                    <span className="font-semibold text-emerald-600 font-mono">~42ms</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Sending Test Ping to {integration.name}...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Run Live Connection Diagnostics</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Result Box */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in zoom-in-95 duration-150 ${
                  testResult.success
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold text-sm">
                      {testResult.success ? 'Diagnostic Check Passed!' : 'Connection Handshake Failed'}
                    </div>
                    <div className="text-slate-700 leading-relaxed">{testResult.message}</div>
                    {testResult.latency_ms && (
                      <div className="text-[10.5px] font-mono text-emerald-700 font-semibold">
                        Roundtrip latency: {testResult.latency_ms}ms
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ── Footer Action Strip ── */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer text-center"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveConfig}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Integration Settings</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
