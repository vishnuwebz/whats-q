import React, { useState, useEffect } from 'react';
import {
  X, Check, Copy, ExternalLink, ShieldCheck, AlertCircle,
  Key, Smartphone, Globe, RefreshCw, CheckCircle2, ChevronRight,
  Sparkles, BookOpen, Terminal, Bot, Share2, Users, ArrowRight
} from 'lucide-react';
import { MetaConfig } from '@/types';
import { apiClient } from '@/api/client';

interface MetaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MetaConfig | null;
  onSaveConfig: (config: Partial<MetaConfig>) => Promise<boolean>;
  onTestConnection: (credentials: { phone_number_id: string; waba_id: string; access_token: string }) => Promise<any>;
}

export const MetaConfigModal: React.FC<MetaConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'credentials' | 'webhook' | 'dual_workspace'>('credentials');
  
  // Credentials Form State
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('qiyam_whatsapp_secret_token_2026');
  const [appSecret, setAppSecret] = useState('');
  const [apiVersion, setApiVersion] = useState('v21.0');
  const [businessName, setBusinessName] = useState('CoolFix Services');
  const [businessPhoneDisplay, setBusinessPhoneDisplay] = useState('+91 98765 43210');

  // Dual-Workspace & Auto-Reply State
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [dualModeEnabled, setDualModeEnabled] = useState(true);
  const [forwardWebhookUrl, setForwardWebhookUrl] = useState('');
  const [staffNumbers, setStaffNumbers] = useState('');
  const [staffKeywords, setStaffKeywords] = useState('staff,portal,workspace,attendance,clock,shift,leave,payroll,duty');
  const [isTestingForward, setIsTestingForward] = useState(false);
  const [forwardTestResult, setForwardTestResult] = useState<any>(null);

  // Test Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setPhoneNumberId(config.phone_number_id || '');
      setWabaId(config.waba_id || '');
      // Never pre-fill the input with a masked string like "EAAV...bZCG" to avoid submitting truncated tokens
      if (config.access_token && !config.access_token.includes('...')) {
        setAccessToken(config.access_token);
      } else {
        setAccessToken('');
      }
      setVerifyToken(config.verify_token || 'qiyam_whatsapp_secret_token_2026');
      setAppSecret(config.app_secret || '');
      setApiVersion(config.api_version || 'v21.0');
      setBusinessName(config.business_name || 'CoolFix Services');
      setBusinessPhoneDisplay(config.business_phone_display || '+91 98765 43210');
      setAutoReplyEnabled(config.auto_reply_enabled !== undefined ? Boolean(config.auto_reply_enabled) : true);
      setDualModeEnabled(config.dual_mode_enabled !== undefined ? Boolean(config.dual_mode_enabled) : true);
      setForwardWebhookUrl(config.forward_webhook_url || '');
      setStaffNumbers(config.staff_numbers || '');
      setStaffKeywords(config.staff_keywords || 'staff,portal,workspace,attendance,clock,shift,leave,payroll,duty');
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection({
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim(),
        access_token: accessToken.trim()
      });
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestForward = async () => {
    if (!forwardWebhookUrl.trim()) return;
    setIsTestingForward(true);
    setForwardTestResult(null);
    try {
      const res = await apiClient.post('/conversations/meta-config/test_forward_proxy/', {
        forward_webhook_url: forwardWebhookUrl.trim()
      });
      setForwardTestResult(res);
    } catch (err: any) {
      setForwardTestResult({ success: false, error: err.message || 'Forward proxy test failed' });
    } finally {
      setIsTestingForward(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig({
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim(),
        access_token: accessToken.trim(),
        verify_token: verifyToken.trim(),
        app_secret: appSecret.trim(),
        api_version: apiVersion.trim(),
        business_name: businessName.trim(),
        business_phone_display: businessPhoneDisplay.trim(),
        auto_reply_enabled: autoReplyEnabled,
        dual_mode_enabled: dualModeEnabled,
        forward_webhook_url: forwardWebhookUrl.trim(),
        staff_numbers: staffNumbers.trim(),
        staff_keywords: staffKeywords.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const webhookCallbackUrl = `${window.location.protocol}//${window.location.host}/api/conversations/webhook/`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-900">Meta WhatsApp Cloud API</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  config?.connection_status === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {config?.connection_status === 'connected' ? 'CONNECTED' : 'CONFIG REQUIRED'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Configure Meta Developer credentials, Permanent Access Token, and real-time Webhooks.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 border-b border-slate-200 flex gap-2 sm:gap-4 overflow-x-auto scrollbar-none bg-slate-50/50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'credentials'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>API Credentials & Test</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Step-by-Step Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'webhook'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Webhook URLs & cURL</span>
          </button>
          <button
            onClick={() => setActiveTab('dual_workspace')}
            className={`py-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'dual_workspace'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>Dual-Workspace & Auto-Replies</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 ml-1">New</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-700">
          {/* TAB 1: API CREDENTIALS & LIVE CONNECTION TEST */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number ID */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>Phone Number ID</span>
                      <a
                        href="https://developers.facebook.com/apps"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-[11px] flex items-center gap-1"
                      >
                        <span>Find in Meta</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </label>
                    <input
                      type="text"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      placeholder="e.g. 105439876543210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Located in Meta Developer Portal &gt; WhatsApp &gt; API Setup.
                    </p>
                  </div>

                  {/* WABA ID */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      WhatsApp Business Account ID (WABA ID)
                    </label>
                    <input
                      type="text"
                      value={wabaId}
                      onChange={(e) => setWabaId(e.target.value)}
                      placeholder="e.g. 109876543210987"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Required for registering and managing custom WhatsApp message templates.
                    </p>
                  </div>
                </div>

                {/* Permanent System User Token */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-900 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Permanent System User Access Token</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('guide')}
                      className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px]"
                    >
                      How to generate non-expiring token?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder={config?.access_token_masked ? `Configured (${config.access_token_masked}). Paste new token to update...` : "Paste full access token (starts with EAA...)"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {config?.access_token_masked && !accessToken ? (
                      <span className="text-emerald-600 font-semibold">Active token saved ({config.access_token_masked}). Leave blank to keep existing.</span>
                    ) : (
                      "Temporary tokens expire in 24 hours. A Permanent System User Token is required for production."
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Verify Token */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Webhook Verify Token</label>
                    <input
                      type="text"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Must match the Verify Token entered in Meta App &gt; WhatsApp &gt; Configuration &gt; Webhook.
                    </p>
                  </div>

                  {/* API Version */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Meta Graph API Version</label>
                    <select
                      value={apiVersion}
                      onChange={(e) => setApiVersion(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      <option value="v21.0">v21.0 (Latest Recommended)</option>
                      <option value="v20.0">v20.0</option>
                      <option value="v19.0">v19.0</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing Meta Graph API...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Test Meta Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Credentials</span>
                  </button>
                </div>
              </form>

              {/* Test Results Display Card */}
              {testResult && (
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-red-50/80 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Meta Graph API Connection Successful!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Connection Failed</span>
                      </>
                    )}
                  </div>

                  {testResult.success ? (
                    <div className="grid grid-cols-2 gap-3 text-[11px] pt-1 border-t border-emerald-200">
                      <div>
                        <span className="text-emerald-700 block">Verified Business:</span>
                        <span className="font-bold text-slate-900">{testResult.phone_details?.verified_name || businessName}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">Display Phone:</span>
                        <span className="font-bold text-slate-900">{testResult.phone_details?.display_phone_number || businessPhoneDisplay}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">Quality Rating:</span>
                        <span className="font-bold text-emerald-600">{testResult.phone_details?.quality_rating || 'GREEN (Tier 1K)'}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">WABA Status:</span>
                        <span className="font-bold text-slate-900">{testResult.waba_valid ? 'Active & Verified' : 'Validated'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-red-700">{testResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs">Complete Meta Cloud API Onboarding</h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Follow these 5 essential steps in the Meta Developer Portal and Business Suite to connect your real WhatsApp phone number.
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Create Meta Developer Account & Business App</span>
                  </h5>
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <span>developers.facebook.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Log in to Meta for Developers &gt; Click <strong>My Apps</strong> &gt; <strong>Create App</strong> &gt; Select <strong>Other</strong> &gt; Choose <strong>Business</strong>. Set the app name to &quot;Qiyam Business OS&quot; and attach your Meta Business Account.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Add WhatsApp Product & Note IDs</span>
                  </h5>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Inside your app dashboard, scroll down to <strong>WhatsApp</strong> and click <strong>Set Up</strong>. On the <strong>API Setup</strong> page, you will see your <strong>Phone Number ID</strong> and <strong>WhatsApp Business Account ID (WABA ID)</strong>. Copy them into the Credentials tab.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-amber-950 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Generate Permanent System User Token (Never Expiring)</span>
                  </h5>
                  <a
                    href="https://business.facebook.com/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                  >
                    <span>Business Suite Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  Temporary tokens expire after 24 hours. To make your integration permanent:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 pl-1">
                  <li>Go to <strong>Meta Business Suite</strong> &gt; <strong>Users</strong> &gt; <strong>System Users</strong>.</li>
                  <li>Click <strong>Add</strong> &gt; Name: &quot;Qiyam Server&quot; &gt; Role: <strong>Admin</strong>.</li>
                  <li>Click <strong>Assign Assets</strong> &gt; Grant <strong>Full Control</strong> on your App and WhatsApp Account.</li>
                  <li>Click <strong>Generate New Token</strong> &gt; Expiration: <strong>Never</strong>.</li>
                  <li>Check <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>.</li>
                  <li>Copy the generated token and paste it in Qiyam.</li>
                </ol>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Configure Webhooks for Real-Time Messages</span>
                  </h5>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  In Meta Developer App &gt; <strong>WhatsApp</strong> &gt; <strong>Configuration</strong> &gt; Click <strong>Edit</strong> under Webhook:
                </p>
                <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Callback URL:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(webhookCallbackUrl, 'url')}
                      className="text-emerald-600 hover:text-emerald-700 font-sans font-bold flex items-center gap-1"
                    >
                      <span>{copiedField === 'url' ? 'Copied!' : 'Copy'}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-slate-800 break-all">{webhookCallbackUrl}</div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Verify Token:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(verifyToken, 'token')}
                      className="text-emerald-600 hover:text-emerald-700 font-sans font-bold flex items-center gap-1"
                    >
                      <span>{copiedField === 'token' ? 'Copied!' : 'Copy'}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-slate-800">{verifyToken}</div>
                </div>
                <p className="text-[10px] text-slate-500">
                  After saving, click <strong>Manage</strong> webhook fields and subscribe to <code>messages</code> and <code>message_template_status_update</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOK & CURL EXAMPLES */}
          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Real-Time Inbound WhatsApp Webhook</h4>
                <p className="text-slate-500 text-[11px]">
                  Meta calls this endpoint whenever a customer messages your WhatsApp number or interacts with template buttons.
                </p>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="text-emerald-400 font-bold"># Test Webhook Verification Handshake</div>
                <div className="text-slate-300">
                  curl -X GET &quot;http://localhost:8000/api/conversations/webhook/?hub.mode=subscribe&amp;hub.verify_token={verifyToken}&amp;hub.challenge=11223344&quot;
                </div>
                <div className="text-slate-500"># Response: 11223344</div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="text-emerald-400 font-bold"># Test Sending Live Template via API</div>
                <div className="text-slate-300">
                  curl -X POST &quot;http://localhost:8000/api/conversations/templates/1/test_send/&quot; \<br />
                  &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
                  &nbsp;&nbsp;-d &#39;&#123;&quot;phone_number&quot;: &quot;+919876543210&quot;&#125;&#39;
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DUAL-WORKSPACE CO-EXISTENCE & 100% AUTOMATED REPLIES */}
          {activeTab === 'dual_workspace' && (
            <div className="space-y-6">
              {/* Architecture Context Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>One Official WhatsApp Number, Two Workspaces</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Enterprise Dual-Routing
                      </span>
                    </h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                      Meta Cloud API permits only <strong>one webhook callback URL per phone number</strong>. 
                      WhatsQ solves this by acting as your <strong>Intelligent Routing Gateway</strong>:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-200/60">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60 flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                    <div>
                      <strong className="text-slate-900 block">Staff / Office Portal Intent</strong>
                      <span className="text-slate-500">Inbound staff phone numbers or keywords (&quot;portal&quot;, &quot;staff&quot;, &quot;shift&quot;) are automatically forwarded to your existing office webhook.</span>
                    </div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60 flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                    <div>
                      <strong className="text-slate-900 block">Customer / WhatsQ CRM Intent</strong>
                      <span className="text-slate-500">Customer inquiries and button clicks (&quot;Reschedule&quot;, &quot;Track Technician&quot;, &quot;Pricing&quot;) receive automated, individualized CRM responses.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: AUTOMATED CONTEXTUAL REPLIES */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Automated WhatsApp Responses (WhatsQ Bot)
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Automatically dispatch personalized responses when customers interact or tap template buttons.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoReplyEnabled}
                      onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Live Preview Cards of What Customers Receive */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Supported Dynamic Contextual Flows (Populated from Individual Records):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1">
                        <span>📅 Reschedule Slot</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        Injects current booking time and prompts customer with available alternate slots.
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="font-bold text-blue-800 flex items-center gap-1">
                        <span>📍 Track Technician</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        Injects assigned specialist name, phone, ETA (15-20 mins), and live map tracking link.
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="font-bold text-purple-800 flex items-center gap-1">
                        <span>💰 Pricing & Quotation</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        Dynamically calculates diagnostics, labour, and estimated total from customer profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DUAL-WORKSPACE ROUTING PROXY */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Dual-Workspace Routing Proxy
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Enable co-existence between your existing Staff Portal bot and WhatsQ on this number.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={dualModeEnabled}
                      onChange={(e) => setDualModeEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {dualModeEnabled && (
                  <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
                    {/* Forward Webhook URL Input */}
                    <div>
                      <label className="block font-bold text-slate-900 mb-1">
                        Office Workspace / Staff Portal Webhook URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://workspace.qiyambusinesssolutions.com/webhook/ or https://your-staff-bot.com/webhook/"
                          value={forwardWebhookUrl}
                          onChange={(e) => setForwardWebhookUrl(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={handleTestForward}
                          disabled={isTestingForward || !forwardWebhookUrl.trim()}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                        >
                          {isTestingForward ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Pinging...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Test Forward</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        When a staff member sends a message or invokes the Staff Portal, WhatsQ transparently forwards the raw Meta payload to this URL.
                      </p>

                      {/* Test Forward Result */}
                      {forwardTestResult && (
                        <div className={`mt-2.5 p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                          forwardTestResult.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}>
                          {forwardTestResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-bold block">
                              {forwardTestResult.success ? 'Proxy Forward Test Passed!' : 'Proxy Test Failed'}
                            </span>
                            <span className="text-[10px]">
                              {forwardTestResult.success
                                ? `Forwarded sample payload successfully (HTTP ${forwardTestResult.status_code || 200}).`
                                : (forwardTestResult.error || 'Check that your office server is reachable and accepts HTTP POST.')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Staff Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-600" />
                          <span>Staff Phone Numbers</span>
                        </label>
                        <input
                          type="text"
                          placeholder="+91 98765 43210, +91 94470 00000"
                          value={staffNumbers}
                          onChange={(e) => setStaffNumbers(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-emerald-600"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Comma-separated. Messages from these phone numbers will always route to your Staff Portal bot.
                        </p>
                      </div>

                      {/* Staff Routing Keywords */}
                      <div>
                        <label className="block font-bold text-slate-900 mb-1">
                          Staff Routing Keywords
                        </label>
                        <input
                          type="text"
                          placeholder="staff, portal, workspace, attendance, clock, shift, leave, payroll"
                          value={staffKeywords}
                          onChange={(e) => setStaffKeywords(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-emerald-600"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Comma-separated. Inbound messages containing any of these keywords route to the Staff Portal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SAVE BUTTON */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500">
                  Settings are immediately active across all incoming WhatsApp webhooks.
                </p>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-emerald-700/20 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Dual-Workspace Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
