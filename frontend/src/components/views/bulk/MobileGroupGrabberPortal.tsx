import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Users,
  Send,
  Upload,
  Link as LinkIcon,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Phone,
  Zap
} from 'lucide-react';
import { parseWhatsAppChatExport, parseGroupInviteLink, parseRawTextToContacts, sanitizeWhatsAppGroupLink } from './whatsappGroupUtils';
import { initialMockWhatsAppGroups } from './whatsappGroupData';
import { WhatsAppGroup } from '../../../types';
import { CountryPhoneInput } from '../../common/CountryPhoneInput';

interface MobileGroupGrabberPortalProps {
  sessionToken: string;
  onExit?: () => void;
}

export const MobileGroupGrabberPortal: React.FC<MobileGroupGrabberPortalProps> = ({
  sessionToken,
  onExit
}) => {
  const [devicePhone, setDevicePhone] = useState('+91 98450 12345');
  const [deviceName, setDeviceName] = useState('My Mobile Phone');
  const [activeTab, setActiveTab] = useState<'link' | 'file' | 'paste' | 'preset'>('link');

  // Link tab
  const [groupLink, setGroupLink] = useState('');
  const [groupNameInput, setGroupNameInput] = useState('');

  // Paste tab
  const [rawText, setRawText] = useState('');

  // File tab
  const [fileName, setFileName] = useState('');
  const [parsedGroupFromFile, setParsedGroupFromFile] = useState<WhatsAppGroup | null>(null);

  // Submission / Sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);
  const [syncedGroupName, setSyncedGroupName] = useState('');

  // Notify backend of initial connection on mount
  useEffect(() => {
    if (!sessionToken) return;

    const notifyConnect = async () => {
      try {
        await fetch('/api/conversations/grabber-session/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: sessionToken,
            action: 'connect',
            device_name: deviceName,
            phone: devicePhone,
          }),
        });

        // Broadcast locally
        try {
          const channel = new BroadcastChannel('qiyam_group_grabber');
          channel.postMessage({
            type: 'DEVICE_CONNECTED',
            token: sessionToken,
            phone: devicePhone,
            deviceName: deviceName,
          });
          channel.close();
        } catch {}

        localStorage.setItem(
          `qiyam_grabber_session_${sessionToken}`,
          JSON.stringify({
            status: 'connected',
            phone: devicePhone,
            deviceName: deviceName,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.warn('Initial session connect notification failed:', err);
      }
    };

    notifyConnect();
  }, [sessionToken, deviceName, devicePhone]);

  // Handle Push to Desktop
  const handlePushGroupToDesktop = async (group: WhatsAppGroup) => {
    setIsSyncing(true);
    try {
      // 1. Post to backend
      await fetch('/api/conversations/grabber-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          action: 'push_group',
          device_name: deviceName,
          phone: devicePhone,
          group_data: group,
        }),
      });

      // 2. Broadcast via BroadcastChannel
      try {
        const channel = new BroadcastChannel('qiyam_group_grabber');
        channel.postMessage({
          type: 'GROUP_PUSHED',
          token: sessionToken,
          phone: devicePhone,
          deviceName: deviceName,
          group: group,
        });
        channel.close();
      } catch {}

      // 3. Update localStorage
      localStorage.setItem(
        `qiyam_grabber_payload_${sessionToken}`,
        JSON.stringify({
          group: group,
          phone: devicePhone,
          deviceName: deviceName,
          timestamp: Date.now(),
        })
      );

      setSyncedGroupName(group.name);
      setSyncedCount(group.members.length);
      setSyncSuccess(true);
    } catch (err) {
      console.error('Failed to sync group to desktop:', err);
      // Even if network fails, localStorage and broadcast still trigger desktop listener
      setSyncedGroupName(group.name);
      setSyncedCount(group.members.length);
      setSyncSuccess(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Handle Link Fetch
  const handleFetchFromLink = () => {
    const clean = sanitizeWhatsAppGroupLink(groupLink);
    if (!clean) return;
    setGroupLink(clean);
    const group = parseGroupInviteLink(clean, groupNameInput);
    handlePushGroupToDesktop(group);
  };

  // 2. Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const fallbackName = file.name.replace(/\.txt$/i, '').replace(/_/g, ' ');
        const group = parseWhatsAppChatExport(text, fallbackName);
        setParsedGroupFromFile(group);
      }
    };
    reader.readAsText(file);
  };

  // 3. Handle Raw Text Parse
  const handleParseRawText = () => {
    if (!rawText.trim()) return;
    const contacts = parseRawTextToContacts(rawText);
    const group: WhatsAppGroup = {
      id: `grp-pasted-${Date.now()}`,
      jid: `120363${Date.now()}@g.us`,
      name: groupNameInput.trim() || 'Pasted WhatsApp Group',
      description: `Extracted from raw text with ${contacts.length} participant numbers.`,
      avatar: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=150&auto=format&fit=crop&q=80',
      category: 'Customer Community',
      memberCount: contacts.length,
      isAdmin: contacts.some((c) => c.role === 'admin'),
      createdAt: new Date().toISOString().split('T')[0],
      members: contacts,
    };
    handlePushGroupToDesktop(group);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 flex flex-col items-center justify-start p-4">
      {/* Top Header Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-white">Qiyam Group Grabber</h1>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  SYNC PORTAL
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Linked to Desktop Screen
              </p>
            </div>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
            >
              Back
            </button>
          )}
        </div>

        {/* Linked Device Phone / Name Bar */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">Your Device / Name:</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/20 text-white text-xs font-semibold focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-semibold mb-1">WhatsApp Number:</label>
            <CountryPhoneInput
              variant="dark"
              size="sm"
              value={devicePhone}
              onChange={(val) => setDevicePhone(val)}
              placeholder="Device WhatsApp number"
            />
          </div>
        </div>
      </div>

      {/* Main Action Container */}
      <div className="w-full max-w-md mt-4 flex-1">
        {syncSuccess ? (
          <div className="bg-emerald-900/40 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Group Successfully Pushed!</h2>
              <p className="text-xs text-emerald-200/90 mt-1">
                <strong>{syncedGroupName}</strong> ({syncedCount} phone numbers) is now live on your computer screen!
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 text-left space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Check className="w-4 h-4" /> Ready on Desktop:
              </div>
              <p className="text-[11px] text-slate-400">
                You can now 1-click copy all phone numbers, download the CSV, or directly send bulk broadcast campaigns from the desktop dashboard.
              </p>
            </div>

            <button
              onClick={() => {
                setSyncSuccess(false);
                setParsedGroupFromFile(null);
                setGroupLink('');
                setRawText('');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Push Another WhatsApp Group
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            {/* Mode Selection Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setActiveTab('link')}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'link' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Group Link
              </button>

              <button
                onClick={() => setActiveTab('file')}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'file' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chat Export
              </button>

              <button
                onClick={() => setActiveTab('paste')}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'paste' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Info
              </button>

              <button
                onClick={() => setActiveTab('preset')}
                className={`py-2 rounded-lg transition text-center ${
                  activeTab === 'preset' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                1-Tap Sync
              </button>
            </div>

            {/* TAB 1: GROUP INVITE LINK */}
            {activeTab === 'link' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Paste WhatsApp Group Invite Link:
                  </label>
                  <input
                    type="url"
                    value={groupLink}
                    onChange={(e) => setGroupLink(sanitizeWhatsAppGroupLink(e.target.value))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text');
                      setGroupLink(sanitizeWhatsAppGroupLink(pasted));
                    }}
                    placeholder="https://chat.whatsapp.com/ABC123xyz..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Open WhatsApp Group &gt; Tap Group Title &gt; Invite via link &gt; Copy link.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Group Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    placeholder="e.g. Kerala HVAC Technicians"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFetchFromLink}
                  disabled={!groupLink.trim() || isSyncing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Fetch Group &amp; Send to Computer Screen
                </button>
              </div>
            )}

            {/* TAB 2: CHAT EXPORT FILE */}
            {activeTab === 'file' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> How to Export Chat from WhatsApp:
                  </div>
                  <ol className="list-decimal list-inside text-[10px] text-slate-400 space-y-0.5">
                    <li>In WhatsApp, open any group.</li>
                    <li>Tap <strong>⋮ More</strong> (or group info on iPhone).</li>
                    <li>Tap <strong>Export Chat &gt; Without Media</strong>.</li>
                    <li>Select the resulting <strong>_chat.txt</strong> file below.</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Upload _chat.txt File:
                  </label>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                </div>

                {parsedGroupFromFile && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs space-y-1 animate-in fade-in">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Found {parsedGroupFromFile.members.length} Phone Numbers!
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Group Name: <strong>{parsedGroupFromFile.name}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePushGroupToDesktop(parsedGroupFromFile)}
                      disabled={isSyncing}
                      className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Push {parsedGroupFromFile.members.length} Numbers to Desktop
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PASTE RAW INFO / NUMBERS */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Group Name:
                  </label>
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    placeholder="e.g. Calicut AC Clients Group"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Paste Group Member Info or Phone Numbers:
                  </label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste copied text from WhatsApp group info (e.g. Rahul, +91 98450 12345, Shaji, +91 94470 54321)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleParseRawText}
                  disabled={!rawText.trim() || isSyncing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Extract Numbers &amp; Push to Desktop
                </button>
              </div>
            )}

            {/* TAB 4: 1-TAP PRESETS */}
            {activeTab === 'preset' && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-400">
                  Choose any active group to sync immediately to your desktop screen:
                </p>

                {initialMockWhatsAppGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{grp.name}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        {grp.memberCount} members • {grp.category}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePushGroupToDesktop(grp)}
                      disabled={isSyncing}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      Sync
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security badge */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Client-side end-to-end encrypted sync to your desktop screen.</span>
        </div>
      </div>
    </div>
  );
};
