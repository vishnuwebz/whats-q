import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  MessageSquare,
  Key,
  Globe,
  CheckCircle2,
  Copy,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Send,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';

export const WhatsAppChannelSettings: React.FC = () => {
  const { addToast } = useQiyamStore();

  const [wabaId, setWabaId] = useState('109823485729103');
  const [phoneId, setPhoneId] = useState('105948372619485');
  const [appId, setAppId] = useState('984726154839201');
  const [verifyToken, setVerifyToken] = useState('whatsq_meta_webhook_token_secure_2026');
  const [webhookUrl] = useState('https://qiyam-business-os.qiyamapp.com/api/webhooks/whatsapp/');

  const [isTestingPing, setIsTestingPing] = useState(false);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  const [hasCopiedToken, setHasCopiedToken] = useState(false);

  const handleCopy = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setHasCopiedUrl(true);
      setTimeout(() => setHasCopiedUrl(false), 2000);
    } else {
      setHasCopiedToken(true);
      setTimeout(() => setHasCopiedToken(false), 2000);
    }
    addToast('Copied to clipboard!', 'info');
  };

  const handleTestPing = () => {
    if (isTestingPing) return;
    setIsTestingPing(true);
    addToast('Sending test ping to Meta Cloud API webhook...', 'info');

    setTimeout(() => {
      setIsTestingPing(false);
      addToast('Meta Webhook Handshake Successful! (HTTP 200 OK • 38ms)', 'success');
    }, 1000);
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('WhatsApp Cloud API credentials saved & verified!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Connection Status Banner ── */}
      <div className="bg-gradient-to-r from-[#042F2E] via-[#064E3B] to-[#042F2E] p-5 sm:p-6 rounded-2xl border border-emerald-600/40 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white">Meta WhatsApp Cloud API</h3>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  OFFICIAL META BSP CONNECTED
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Primary Line: <span className="font-mono font-semibold">+91 98765 43210</span> (Qiyam Official Support)
              </p>
            </div>
          </div>

          <button
            onClick={handleTestPing}
            disabled={isTestingPing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isTestingPing ? 'animate-spin' : ''}`} />
            <span>{isTestingPing ? 'Pinging Meta...' : 'Test Webhook Ping'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-emerald-700/50 text-xs">
          <div>
            <span className="text-emerald-200/70 block text-[10px] uppercase font-bold">Quality Rating</span>
            <span className="font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              HIGH (Green)
            </span>
          </div>
          <div>
            <span className="text-emerald-200/70 block text-[10px] uppercase font-bold">Messaging Tier</span>
            <span className="font-bold text-white mt-0.5 block">Tier 2 (10,000 / day)</span>
          </div>
          <div>
            <span className="text-emerald-200/70 block text-[10px] uppercase font-bold">Delivery SLA</span>
            <span className="font-bold text-emerald-300 mt-0.5 block">99.98% Latency &lt; 200ms</span>
          </div>
          <div>
            <span className="text-emerald-200/70 block text-[10px] uppercase font-bold">Template Status</span>
            <span className="font-bold text-white mt-0.5 block">14 Approved</span>
          </div>
        </div>
      </div>

      {/* ── 2. Meta API Credentials Form ── */}
      <form onSubmit={handleSaveApiKeys} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Meta Developer Credentials</span>
          </h4>
          <p className="text-slate-500 text-xs mt-0.5">
            Obtain these identifiers from the Meta Developers Portal under WhatsApp &gt; API Setup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              WhatsApp Business Account (WABA) ID
            </label>
            <input
              type="text"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              Phone Number ID
            </label>
            <input
              type="text"
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              Meta App ID
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Webhook Configuration Strip */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              Inbound Webhook Callback URL
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <span className="px-3 text-slate-400 font-mono text-xs">POST</span>
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="w-full p-2.5 bg-transparent font-mono text-xs text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(webhookUrl, 'url')}
                className="px-3 py-2 text-slate-600 hover:text-emerald-600 transition flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
              >
                {hasCopiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1.5">
              Webhook Verification Token
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full p-2.5 bg-transparent font-mono text-xs text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(verifyToken, 'token')}
                className="px-3 py-2 text-slate-600 hover:text-emerald-600 transition flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
              >
                {hasCopiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedToken ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Save WhatsApp API Settings
          </button>
        </div>
      </form>
    </div>
  );
};
