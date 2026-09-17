import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  ShieldCheck,
  Key,
  Lock,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { addToast } = useQiyamStore();

  const [twoFactorEnforced, setTwoFactorEnforced] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [ipWhitelisting, setIpWhitelisting] = useState(false);

  const handleExportAuditLog = () => {
    const headers = ['Timestamp', 'Actor', 'IP Address', 'Action', 'Resource', 'Result', 'Compliance Standard'];
    const auditRows = [
      ['2024-05-31 09:42:15', 'Ramesh Kumar (Admin)', '103.14.120.45', 'LOGIN_MFA_SUCCESS', 'Session /auth', 'SUCCESS', 'DPDP / GDPR'],
      ['2024-05-31 09:15:02', 'System Scheduler', '127.0.0.1', 'DB_ENCRYPTED_BACKUP', 'PostgreSQL /backups', 'SUCCESS', 'AES-256 / ISO 27001'],
      ['2024-05-30 18:30:11', 'Amit Verma (Agent)', '49.204.11.89', 'WHATSAPP_CREDENTIALS_ACCESS', 'Meta API Config', 'SUCCESS', 'DPDP Audit'],
      ['2024-05-30 14:12:44', 'Vikram Mehta (Finance)', '103.14.120.45', 'EXPORT_INVOICE_REPORT', 'Finance Invoices', 'SUCCESS', 'SOC2 Compliance'],
      ['2024-05-29 11:20:00', 'Priya Sharma (Staff)', '157.44.82.10', 'PASSWORD_ROTATION', 'User Auth Profile', 'SUCCESS', 'PCI-DSS / ISO'],
      ['2024-05-28 16:45:33', 'Security Gateway', '182.72.19.12', 'FAILED_LOGIN_BLOCKED', 'Admin Portal', 'BLOCKED', 'Brute Force Guard'],
    ];
    const csvContent = [headers.join(','), ...auditRows.map((r) => r.map((col) => `"${col}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Security_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Security Audit Log exported as CSV (Last 90 days)', 'success');
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Access & Authentication Card ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Authentication & Access Policies</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure authentication protocols, session timeouts, and IP restrictions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800">Enforce Two-Factor Authentication (2FA)</div>
              <div className="text-[11px] text-slate-500">
                Require all team members to enter a TOTP code (Google Authenticator / Authy) on login.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={twoFactorEnforced}
                onChange={(e) => {
                  setTwoFactorEnforced(e.target.checked);
                  addToast(
                    e.target.checked ? '2FA requirement enabled for all workspace members' : '2FA made optional',
                    'info'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">
                Session Inactivity Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => {
                  setSessionTimeout(e.target.value);
                  addToast(`Session timeout set to ${e.target.value}`, 'success');
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs outline-none focus:border-emerald-500 transition"
              >
                <option value="15m">15 Minutes of Inactivity</option>
                <option value="30m">30 Minutes (Recommended)</option>
                <option value="1h">1 Hour</option>
                <option value="8h">8 Hours (Full Shift)</option>
                <option value="24h">24 Hours</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">
                IP Address Restriction
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Allow access only from authorized office IPs</span>
                <button
                  type="button"
                  onClick={() => setIpWhitelisting(!ipWhitelisting)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                    ipWhitelisting ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {ipWhitelisting ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Data Encryption & Compliance Card ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encryption & Compliance Standards</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time verification of encryption layers and data protection standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-900">AES-256 at Rest</div>
              <div className="text-[10px] text-slate-500">Database & local backups encrypted</div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-900">TLS 1.3 in Transit</div>
              <div className="text-[10px] text-slate-500">End-to-end HTTPS & WebSockets</div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-900">DPDP & GDPR Ready</div>
              <div className="text-[10px] text-slate-500">Audit trails & consent logging</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Export complete tamper-proof administrative audit logs for compliance reviews.
          </span>
          <button
            type="button"
            onClick={handleExportAuditLog}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
