import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Bell,
  Volume2,
  VolumeX,
  Play,
  Moon,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { addToast } = useQiyamStore();

  const [selectedTone, setSelectedTone] = useState('chime');
  const [leadAlerts, setLeadAlerts] = useState(true);
  const [dealWonAlerts, setDealWonAlerts] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');

  // Play audio synthesizer tone preview using Web Audio API
  const playTonePreview = (tone: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const freqMap: Record<string, number[]> = {
        chime: [587.33, 880], // D5 -> A5
        ding: [830.61],       // G#5
        pop: [440, 659.25],   // A4 -> E5
        subtle: [523.25],     // C5
      };

      const notes = freqMap[tone] || [600];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      });

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // AudioContext unavailable or blocked
    }
    addToast(`Playing "${tone}" audio chime preview`, 'info');
  };

  const handleTestDesktopNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('QBS-360 Business Alert', {
            body: 'Incoming message from +91 98765 43210 (Test Notification)',
            icon: '/vite.svg',
          });
          addToast('Desktop push notification delivered!', 'success');
        } else {
          addToast('Browser notifications blocked in browser settings', 'error');
        }
      });
    } else {
      addToast('Desktop notifications not supported on this browser', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Audio Chimes & Alert Tones ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>Inbound Audio Alerts & Sound Effects</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Select the audio chime played when a customer sends an inbound WhatsApp message.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'chime', name: 'QBS-360 Chime', desc: 'Pleasant dual bell' },
            { id: 'ding', name: 'Modern Ding', desc: 'Short crisp chime' },
            { id: 'pop', name: 'Soft Bubble Pop', desc: 'Subtle notification' },
            { id: 'subtle', name: 'Zen Tone', desc: 'Minimalist unobtrusive' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedTone(item.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                selectedTone === item.id
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500/30'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTonePreview(item.id);
                  }}
                  className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-emerald-600" />
                  <span>Preview</span>
                </button>
                {selectedTone === item.id && (
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={leadAlerts}
              onChange={(e) => setLeadAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Lead Assignment Audio Chime</span>
              <span className="text-slate-500 text-[11px]">
                Notify when a new incoming prospect is auto-assigned to your agent queue.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
            <input
              type="checkbox"
              checked={dealWonAlerts}
              onChange={(e) => setDealWonAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Deal Won Fanfare Alert</span>
              <span className="text-slate-500 text-[11px]">
                Celebratory chime when a pipeline deal status transitions to "Won".
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* ── 2. Desktop Push & Quiet Hours ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Desktop Push Notifications & Quiet Hours</span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Deliver browser push alerts even when QBS-360 is minimized or in a background tab.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <div className="text-xs font-bold text-slate-800">Browser System Notifications</div>
            <div className="text-[11px] text-slate-500">
              Show native OS banner alerts for urgent inquiries and scheduled reminders.
            </div>
          </div>
          <button
            type="button"
            onClick={handleTestDesktopNotification}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer self-start sm:self-auto"
          >
            Test Push Alert
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Do Not Disturb / Quiet Hours</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mute From</label>
                <input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Resume At</label>
                <input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
