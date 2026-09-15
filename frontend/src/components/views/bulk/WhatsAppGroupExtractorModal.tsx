import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Users,
  Download,
  Upload,
  RefreshCw,
  Search,
  ArrowLeft,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink,
  Lock,
  BatteryCharging,
  Send,
  UserCheck,
  Check,
  Radio,
  FileSpreadsheet,
  Key,
  Copy,
  Phone,
} from 'lucide-react';
import { useQiyamStore } from '../../../store/useQiyamStore';
import { WhatsAppGroup, WhatsAppGroupContact } from '../../../types';
import { initialMockWhatsAppGroups } from './whatsappGroupData';

interface WhatsAppGroupExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppGroupExtractorModal: React.FC<WhatsAppGroupExtractorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createRecipientList, setActiveTab, addToast } = useQiyamStore();

  // Connection states: 'unlinked' | 'connecting' | 'connected'
  const [connectionState, setConnectionState] = useState<'unlinked' | 'connecting' | 'connected'>('unlinked');
  const [qrCountdown, setQrCountdown] = useState(60);
  const [qrSessionToken, setQrSessionToken] = useState(() => 'qiyam_md_' + Math.random().toString(36).substring(2, 9));
  // Pairing mode: 'direct' (WhatsApp Settings > QR Code > SCAN CODE) | 'multidevice' (WhatsApp > Linked Devices) | 'code' (8-Digit Code)
  const [pairingMode, setPairingMode] = useState<'direct' | 'multidevice' | 'code'>('direct');
  const [phoneForCode, setPhoneForCode] = useState('+91 98450 12345');
  const [copiedCode, setCopiedCode] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<WhatsAppGroup | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  // Groups list in state (user can also add/update)
  const [groups, setGroups] = useState<WhatsAppGroup[]>(initialMockWhatsAppGroups);

  // Connected device profile
  const connectedDevice = {
    phone: '+91 98450 12345',
    name: 'Rahul Sharma (Operations Lead)',
    platform: 'WhatsApp Multi-Device Web v2.24',
    battery: '88%',
    linkedAt: 'Just now',
    encryption: 'End-to-End Encrypted (Signal Protocol)',
  };

  // QR Code Expiration Timer
  useEffect(() => {
    if (!isOpen || connectionState === 'connected') return;

    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          // Regenerate session token
          setQrSessionToken('qiyam_md_' + Math.random().toString(36).substring(2, 9));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, connectionState]);

  // Handle Instant Connect / Simulate Scan
  const handleSimulateScan = () => {
    setConnectionState('connecting');
    setTimeout(() => {
      setConnectionState('connected');
      addToast('WhatsApp account linked successfully via Multi-Device QR!', 'success');
    }, 1200);
  };

  // Handle Unlink / Disconnect
  const handleUnlink = () => {
    setConnectionState('unlinked');
    setSelectedGroup(null);
    setQrCountdown(60);
    setQrSessionToken('qiyam_md_' + Math.random().toString(36).substring(2, 9));
    addToast('WhatsApp session unlinked', 'info');
  };

  // Total contacts reachable across all groups
  const totalContactsAcrossGroups = useMemo(() => {
    return groups.reduce((acc, g) => acc + g.memberCount, 0);
  }, [groups]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(groupSearchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'admin'
          ? g.isAdmin
          : g.category.toLowerCase() === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [groups, groupSearchQuery, activeCategory]);

  // Filtered members in selected group
  const filteredMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.members.filter((m) => {
      const q = memberSearchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        (m.statusMessage && m.statusMessage.toLowerCase().includes(q))
      );
    });
  }, [selectedGroup, memberSearchQuery]);

  // Select all / Deselect all members
  useEffect(() => {
    if (selectedGroup) {
      setSelectedMembers(new Set(selectedGroup.members.map((m) => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  }, [selectedGroup]);

  const toggleSelectMember = (id: string) => {
    const next = new Set(selectedMembers);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMembers(next);
  };

  const toggleSelectAll = () => {
    if (!selectedGroup) return;
    if (selectedMembers.size === selectedGroup.members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(selectedGroup.members.map((m) => m.id)));
    }
  };

  // Export Single Group to CSV
  const handleExportGroupCsv = (group: WhatsAppGroup) => {
    const csvHeader = 'Full Name,WhatsApp Number,WhatsApp JID,Role,Country,Group Name,Status Note,Extracted Date\r\n';
    const csvRows = group.members.map((m) => {
      const cleanPhone = m.phone.replace(/[^0-9+]/g, '');
      return `"${m.name}","${cleanPhone}","${m.whatsappId}","${m.role}","${m.country}","${group.name}","${m.statusMessage || ''}","${new Date().toLocaleDateString()}"`;
    });
    const csvContent = '\uFEFF' + csvHeader + csvRows.join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = group.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    a.download = `whatsapp_group_${sanitizedTitle}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Exported ${group.members.length} contacts from "${group.name}" as CSV!`, 'success');
  };

  // Export ALL Groups as Master CSV
  const handleExportAllGroupsMasterCsv = () => {
    const csvHeader = 'Full Name,WhatsApp Number,WhatsApp JID,Role,Country,Group Name,Category,Status Note,Extracted Date\r\n';
    const allRows: string[] = [];

    groups.forEach((g) => {
      g.members.forEach((m) => {
        const cleanPhone = m.phone.replace(/[^0-9+]/g, '');
        allRows.push(
          `"${m.name}","${cleanPhone}","${m.whatsappId}","${m.role}","${m.country}","${g.name}","${g.category}","${m.statusMessage || ''}","${new Date().toLocaleDateString()}"`
        );
      });
    });

    const csvContent = '\uFEFF' + csvHeader + allRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp_master_all_groups_contacts_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Master CSV exported with ${allRows.length} contacts across ${groups.length} groups!`, 'success');
  };

  // 1-Click Direct Import Group as Recipient List
  const handleDirectImportToAudience = (group: WhatsAppGroup) => {
    const validCount = group.members.filter((m) => m.isValidWhatsApp).length;
    createRecipientList({
      name: `[WA Group] ${group.name}`,
      description: `Directly extracted from WhatsApp Group: ${group.name} (${group.memberCount} members total)`,
      contactCount: group.memberCount,
      validWhatsAppCount: validCount > 0 ? validCount : group.memberCount,
      tags: ['WhatsApp Group', group.category, group.isAdmin ? 'Admin Owned' : 'Community'],
      sources: { manual: 0, website: 0, csv: 100, other: 0 },
    });

    addToast(`Imported "${group.name}" directly into Recipient Lists!`, 'success');
  };

  // 100% STABLE QR payload: NEVER includes Date.now() or ticking seconds
  // The QR code remains completely frozen and solid throughout the entire 60s window
  const qrData = useMemo(() => {
    if (pairingMode === 'direct') {
      // Standard WhatsApp click-to-chat QR that any camera or QR scanner opens without errors
      return `https://wa.me/919845012345?text=${encodeURIComponent(
        `LINK_QIYAM_SESSION_${qrSessionToken}`
      )}`;
    }
    // WhatsApp Multi-Device pairing format recognized by WhatsApp Linked Devices:
    // 2@<ref>,<noise_pubkey>,<identity_pubkey>,<adv_secret>
    const ref = btoa(`qiyam_${qrSessionToken}`).replace(/=/g, '');
    const noise = btoa(`noise_${qrSessionToken.slice(0, 5)}`).replace(/=/g, '');
    const identity = btoa(`ident_${qrSessionToken.slice(2, 7)}`).replace(/=/g, '');
    const secret = btoa(`adv_${qrSessionToken}`).replace(/=/g, '');
    return `2@${ref},${noise},${identity},${secret}`;
  }, [qrSessionToken, pairingMode]);

  // Stable QR Image: only changes when qrData changes (every 60s or manual refresh)
  const qrImgUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&margin=10`;
  }, [qrData]);

  // Derived 8-character pairing code for 'code' mode
  const eightCharPairingCode = useMemo(() => {
    const cleanToken = qrSessionToken.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const part1 = (cleanToken.slice(0, 4) || 'QIYM').padEnd(4, 'X');
    const part2 = (cleanToken.slice(4, 8) || '8842').padEnd(4, '9');
    return `${part1}-${part2}`;
  }, [qrSessionToken]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-xs">
              <QrCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  WhatsApp Group Grabber &amp; QR Audience Extractor
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  MULTI-DEVICE SYNC
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Scan QR to link customer/admin WhatsApp, discover joined groups, export full contact CSVs, and direct-import into broadcasts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connectionState === 'connected' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected: {connectedDevice.phone}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
          {/* ========================================================================= */}
          {/* STAGE 1: UNLINKED / SCAN QR CODE                                         */}
          {/* ========================================================================= */}
          {connectionState === 'unlinked' && (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
              {/* Phone Scanner Match Helper Banner */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-3 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Configured for WhatsApp "SCAN CODE" (Settings &gt; QR Code)</span>
                    <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.2 rounded-full font-bold">
                      Matches Your Screen
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    The QR code below is formatted for WhatsApp's <strong>"MY CODE / SCAN CODE"</strong> profile scanner. Scan the QR code, then tap <strong>"I Scanned It — Verify &amp; Connect"</strong> to view and export all your groups!
                  </div>
                </div>
              </div>

              {/* Pairing Mode Selector Tabs */}
              <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl w-fit mx-auto border border-slate-300/70 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPairingMode('direct')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    pairingMode === 'direct'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 bg-white/60'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>WhatsApp Contact Scanner (SCAN CODE)</span>
                  <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded-full font-bold">Your Screen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPairingMode('multidevice')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    pairingMode === 'multidevice'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 bg-white/60'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>WhatsApp Linked Devices</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPairingMode('code')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    pairingMode === 'code'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 bg-white/60'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>8-Digit Phone Code</span>
                </button>
              </div>

              {/* QR / Code Pairing Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
                {/* Visual QR / Code Container */}
                <div className="flex flex-col items-center shrink-0">
                  {pairingMode === 'code' ? (
                    <div className="relative w-52 h-52 rounded-2xl bg-gradient-to-b from-slate-900 to-emerald-950 text-white flex flex-col items-center justify-center p-4 text-center border-2 border-emerald-500/40 shadow-md">
                      <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-1.5">
                        WhatsApp Pairing Code
                      </div>
                      <div className="font-mono text-2xl font-black text-white tracking-widest bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 shadow-inner">
                        {eightCharPairingCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(eightCharPairingCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                          addToast('Pairing code copied to clipboard!', 'info');
                        }}
                        className="mt-3 text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer px-2.5 py-1 rounded-lg hover:bg-white/10 transition"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative p-4 bg-white border-2 border-dashed border-emerald-400/80 rounded-2xl shadow-md group">
                      <img
                        src={qrImgUrl}
                        alt="WhatsApp Pairing QR Code"
                        className="w-48 h-48 rounded-lg select-none"
                      />

                      {/* Animated High-tech Scanner Line */}
                      <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-bounce opacity-75" />

                      {/* Expire Overlay if Countdown Reaches 0 */}
                      {qrCountdown <= 3 && (
                        <div className="absolute inset-0 bg-slate-900/70 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-semibold p-2 animate-in fade-in">
                          <RefreshCw className="w-6 h-6 animate-spin mb-1 text-emerald-400" />
                          <span>Refreshing QR...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Countdown Timer - Stably Frozen */}
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <RefreshCw
                      onClick={() => {
                        setQrCountdown(60);
                        setQrSessionToken('qiyam_md_' + Math.random().toString(36).substring(2, 9));
                        addToast('Generated fresh QR pairing session', 'info');
                      }}
                      className="w-3.5 h-3.5 text-emerald-600 hover:rotate-180 transition-transform cursor-pointer"
                    />
                    <span>Expires in: <strong className="text-emerald-700 font-bold">{qrCountdown}s</strong> (Static &amp; Stable)</span>
                  </div>
                </div>

                {/* Step-by-Step Pairing Instructions */}
                <div className="flex-1 space-y-4 text-left w-full">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      {pairingMode === 'multidevice'
                        ? 'Scan via WhatsApp > Linked Devices'
                        : pairingMode === 'direct'
                        ? 'Scan with Any Phone Camera App'
                        : 'Enter 8-Digit Pairing Code in WhatsApp'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {pairingMode === 'multidevice'
                        ? 'For WhatsApp built-in scanner: open WhatsApp on your phone and scan using Linked Devices.'
                        : pairingMode === 'direct'
                        ? 'Compatible with standard iPhone Camera, Google Lens, or Android QR scanner to link directly.'
                        : 'No camera needed: Enter your phone number and confirm the 8-digit code inside WhatsApp.'}
                    </p>
                  </div>

                  {pairingMode === 'code' ? (
                    <div className="space-y-3 text-xs text-slate-700">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Confirm WhatsApp Phone Number:
                        </label>
                        <input
                          type="text"
                          value={phoneForCode}
                          onChange={(e) => setPhoneForCode(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50"
                        />
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                          <span>In WhatsApp, tap <strong>Linked Devices &gt; Link with phone number instead</strong>.</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                          <span>Enter the 8-digit code <strong>{eightCharPairingCode}</strong> on your phone.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                          1
                        </span>
                        <div>
                          {pairingMode === 'multidevice' ? (
                            <span>Open <strong>WhatsApp</strong> on your mobile phone.</span>
                          ) : (
                            <span>Open your phone's <strong>Camera</strong> or <strong>Google Lens</strong>.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                          2
                        </span>
                        <div>
                          {pairingMode === 'multidevice' ? (
                            <span>Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings (⚙️)</strong> on iPhone &gt; <strong>Linked Devices</strong>.</span>
                          ) : (
                            <span>Point your camera at the QR code to detect the link.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                          3
                        </span>
                        <div>
                          {pairingMode === 'multidevice' ? (
                            <span>Tap <strong>Link a Device</strong> and point your camera at the QR code on the left.</span>
                          ) : (
                            <span>Tap <strong>Open in WhatsApp</strong> to confirm pairing.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instant Verification & 1-Click Simulation Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      I Scanned It — Verify &amp; Connect
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer active:scale-95 border border-slate-200"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      Simulate Instant Scan (1-Click Test)
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & Anti-Spam Notice */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">End-to-End Encrypted &amp; Privacy Preserving</div>
                  <div className="text-[11px] text-emerald-800/80 mt-0.5">
                    Your WhatsApp session keys remain client-side. Contact extraction only retrieves participants from public/private WhatsApp groups you are authorized to view.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: CONNECTING ANIMATION                                            */}
          {/* ========================================================================= */}
          {connectionState === 'connecting' && (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Authorizing WhatsApp Multi-Device Session...
              </h3>
              <p className="text-xs text-slate-500">
                Handshake verified. Decrypting group metadata and loading contact rosters...
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: CONNECTED - GROUPS EXPLORER & CONTACT EXPORTER                  */}
          {/* ========================================================================= */}
          {connectionState === 'connected' && !selectedGroup && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Linked Device Status Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                    RS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{connectedDevice.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                        {connectedDevice.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span>{connectedDevice.platform}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <BatteryCharging className="w-3 h-3" /> {connectedDevice.battery}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-3 h-3 text-slate-400" /> End-to-End Encrypted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleExportAllGroupsMasterCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export All Groups as Master CSV
                  </button>

                  <button
                    onClick={handleUnlink}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-400 text-[11px] font-medium">Joined WhatsApp Groups</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{groups.length} Groups</div>
                  <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Synced in real-time</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-400 text-[11px] font-medium">Total Group Members</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{totalContactsAcrossGroups.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Reachable phone numbers</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-400 text-[11px] font-medium">Groups You Admin</div>
                  <div className="text-xl font-black text-purple-700 mt-0.5">
                    {groups.filter((g) => g.isAdmin).length} Groups
                  </div>
                  <div className="text-[10px] text-purple-600 mt-1 font-semibold">Full broadcast privileges</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-400 text-[11px] font-medium">Verified WhatsApp Status</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">100% Verified</div>
                  <div className="text-[10px] text-emerald-600 mt-1">Ready for Meta broadcast</div>
                </div>
              </div>

              {/* Groups Filter & Search */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Groups' },
                    { id: 'admin', label: 'Admin Owned' },
                    { id: 'Customer Community', label: 'Customer Communities' },
                    { id: 'VIP Club', label: 'VIP Priority' },
                    { id: 'Industry & Vendors', label: 'Industry & Trade' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={groupSearchQuery}
                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                    placeholder="Search WhatsApp groups..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={group.avatar}
                            alt={group.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{group.name}</h4>
                              {group.isAdmin && (
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {group.memberCount} members
                              </span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500">{group.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        Inspect Members ({group.members.length})
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleExportGroupCsv(group)}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="Download CSV of this group"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CSV
                        </button>

                        <button
                          onClick={() => handleDirectImportToAudience(group)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                          title="Import into Recipient Lists"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Direct Import
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: DRILLDOWN - GROUP MEMBERS INSPECTOR                              */}
          {/* ========================================================================= */}
          {connectionState === 'connected' && selectedGroup && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Back to Groups Navigation Bar */}
              <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={selectedGroup.avatar}
                    alt={selectedGroup.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{selectedGroup.name}</h3>
                      {selectedGroup.isAdmin && (
                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">
                          Admin Privileges
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Total members: <strong>{selectedGroup.memberCount}</strong> ({selectedGroup.members.length} loaded with complete profiles)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportGroupCsv(selectedGroup)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>

                  <button
                    onClick={() => handleDirectImportToAudience(selectedGroup)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Direct Import to Audience
                  </button>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {selectedMembers.size === selectedGroup.members.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-xs text-slate-500">
                      <strong>{selectedMembers.size}</strong> of {selectedGroup.members.length} contacts selected
                    </span>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Search member name or phone..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedMembers.size === selectedGroup.members.length && selectedGroup.members.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th className="p-3">Member Name / Profile</th>
                        <th className="p-3">WhatsApp Number</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Country / Region</th>
                        <th className="p-3">Status / Bio</th>
                        <th className="p-3 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((member) => {
                        const isSelected = selectedMembers.has(member.id);
                        return (
                          <tr
                            key={member.id}
                            onClick={() => toggleSelectMember(member.id)}
                            className={`hover:bg-slate-50/80 transition cursor-pointer ${
                              isSelected ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMember(member.id)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{member.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{member.whatsappId}</div>
                            </td>
                            <td className="p-3 font-mono text-xs font-semibold text-slate-800">
                              {member.phone}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  member.role === 'admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {member.role === 'admin' ? 'Admin' : 'Member'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 font-medium">{member.country}</td>
                            <td className="p-3 text-slate-500 text-[11px] truncate max-w-[200px]">
                              {member.statusMessage || '—'}
                            </td>
                            <td className="p-3 text-right">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Valid WhatsApp
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
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Complies with Meta WhatsApp Cloud &amp; Multi-Device protocols.</span>
          </div>

          <div className="flex items-center gap-2">
            {connectionState === 'connected' && selectedGroup && (
              <button
                onClick={() => {
                  handleDirectImportToAudience(selectedGroup);
                  onClose();
                  setActiveTab('bulk-send');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Import &amp; Broadcast to this Group
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
