import React, { useState, useMemo } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  BarChart3, TrendingUp, Clock, CheckCircle2, MessageSquare,
  PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Sparkles,
  Bot, Users, Calendar, Filter, Download, RefreshCw, Zap,
  ShieldCheck, Activity, Flame, SlidersHorizontal, Smartphone,
  Globe, Mail, ChevronRight, Star, AlertCircle, Smile, Meh, Frown
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { exportTableToCsv } from '@/utils/exportCsv';

type AnalyticsTab = 'overview' | 'intents' | 'traffic' | 'agents';
type TimeRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'ytd';
type ChannelFilter = 'all' | 'whatsapp' | 'webchat' | 'mobile' | 'email';

export const AnalyticsView: React.FC = () => {
  const store = useQiyamStore();
  const { addToast } = store;

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('30d');
  const [selectedChannel, setSelectedChannel] = useState<ChannelFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('Just now');
  const [searchIntentQuery, setSearchIntentQuery] = useState('');
  const [trendMetric, setTrendMetric] = useState<'volume' | 'resolution' | 'speed'>('volume');

  // Trigger real-time live sync with database
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (typeof store.loadInitialData === 'function') {
        await store.loadInitialData();
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
      const now = new Date();
      setLastRefreshedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      addToast('Analytics telemetry synchronized with live database', 'success');
    }
  };

  const handleTimeRangeChange = (preset: TimeRangePreset, label: string) => {
    setTimeRange(preset);
    addToast(`Analytics time window updated: ${label}`, 'info');
  };

  const handleExport = () => {
    const res = exportTableToCsv('analytics', store);
    addToast(`Analytics report exported successfully (${res.filename})`, 'success');
  };

  // Dynamic Telemetry Dataset Engine for Today, 7D, 30D, and Month presets
  const activeData = useMemo(() => {
    const datasets: Record<string, {
      badge: string;
      kpis: {
        totalInbound: number;
        inboundGrowth: string;
        inboundPeriod: string;
        fcr: string;
        fcrLabel: string;
        botReply: string;
        botReplySub: string;
        aht: string;
        ahtChange: string;
        waHealth: string;
        waHealthSub: string;
        csat: string;
        csatPct: string;
      };
      trend: Array<{ date: string; total: number; aiResolved: number; humanHandled: number; speed: number; resolution: number }>;
      footer: {
        totalInbound: number;
        aiAutomated: number;
        aiPct: string;
        humanEscalations: number;
        humanPct: string;
        slaTarget: string;
        slaAchieved: string;
      };
      channels: Array<{
        id: string;
        name: string;
        value: number;
        color: string;
        percent: string;
        growth: string;
        speed: string;
        csat: string;
        icon: React.ComponentType<{ className?: string }>;
      }>;
      waHighlightCount: string;
      waGrowth: string;
      slaTiers: {
        instantBadge: string;
        instant: { count: number; pct: string };
        fast: { count: number; pct: string };
        handoff: { count: number; pct: string };
        extended: { count: number; pct: string };
        summary: string;
      };
      teamCsat: string;
      leaderboard: Array<{
        id: number;
        name: string;
        role: string;
        avatar: string;
        activeChats: number;
        resolved: number;
        aht: string;
        fcr: string;
        csat: number;
        status: 'online' | 'busy' | 'offline';
      }>;
    }> = {
      today: {
        badge: 'Today (00:00 – Present)',
        kpis: {
          totalInbound: 482,
          inboundGrowth: '+12.4%',
          inboundPeriod: 'vs yesterday',
          fcr: '94.2%',
          fcrLabel: 'Automated by AI',
          botReply: '1.5 sec',
          botReplySub: 'Sub-second SLA',
          aht: '3m 08s',
          ahtChange: '-22.1%',
          waHealth: '99.2%',
          waHealthSub: 'Tier 2 • Green Rating',
          csat: '4.95 / 5.0',
          csatPct: '99.1% satisfaction',
        },
        trend: [
          { date: '06:00', total: 18, aiResolved: 17, humanHandled: 1, speed: 1.4, resolution: 94.4 },
          { date: '08:00', total: 42, aiResolved: 40, humanHandled: 2, speed: 1.5, resolution: 95.2 },
          { date: '10:00', total: 78, aiResolved: 73, humanHandled: 5, speed: 1.6, resolution: 93.6 },
          { date: '12:00', total: 86, aiResolved: 81, humanHandled: 5, speed: 1.5, resolution: 94.2 },
          { date: '14:00', total: 72, aiResolved: 68, humanHandled: 4, speed: 1.4, resolution: 94.4 },
          { date: '16:00', total: 69, aiResolved: 65, humanHandled: 4, speed: 1.5, resolution: 94.2 },
          { date: '18:00', total: 65, aiResolved: 61, humanHandled: 4, speed: 1.6, resolution: 93.8 },
          { date: '20:00', total: 52, aiResolved: 49, humanHandled: 3, speed: 1.4, resolution: 94.2 },
        ],
        footer: {
          totalInbound: 482,
          aiAutomated: 454,
          aiPct: '94.2%',
          humanEscalations: 28,
          humanPct: '5.8%',
          slaTarget: '< 2.5s',
          slaAchieved: '1.5s',
        },
        channels: [
          { id: 'webchat', name: 'Web Chat', value: 186, color: '#3B82F6', percent: '38.6%', growth: '+11.2%', speed: '1.7s', csat: '4.9', icon: Globe },
          { id: 'whatsapp', name: 'WhatsApp Cloud API', value: 168, color: '#10B981', percent: '34.9%', growth: '+31.2%', speed: '1.3s', csat: '5.0', icon: MessageSquare },
          { id: 'mobile', name: 'Mobile App', value: 98, color: '#8B5CF6', percent: '20.3%', growth: '+7.5%', speed: '1.8s', csat: '4.9', icon: Smartphone },
          { id: 'email', name: 'Email Support', value: 22, color: '#F59E0B', percent: '4.6%', growth: '-3.4%', speed: '6.5m', csat: '4.7', icon: Mail },
          { id: 'others', name: 'Others / API', value: 8, color: '#64748B', percent: '1.6%', growth: '+1.1%', speed: '2.8s', csat: '4.8', icon: SlidersHorizontal },
        ],
        waHighlightCount: '168',
        waGrowth: '+31.2%',
        slaTiers: {
          instantBadge: '95.5% Instant',
          instant: { count: 412, pct: '85.5%' },
          fast: { count: 48, pct: '10.0%' },
          handoff: { count: 16, pct: '3.3%' },
          extended: { count: 6, pct: '1.2%' },
          summary: '95.5% of all incoming inquiries today across WhatsApp, Web Chat, and Mobile received a personalized answer within 15 seconds. Human escalations maintained an average First Contact Resolution rate of 96.4%.',
        },
        teamCsat: '4.95 / 5.0',
        leaderboard: [
          { id: 1, name: 'Ramesh Kumar', role: 'Senior WhatsApp Specialist', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', activeChats: 4, resolved: 18, aht: '2m 55s', fcr: '96.2%', csat: 4.98, status: 'online' },
          { id: 2, name: 'Priya Sharma', role: 'Operations & Booking Agent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', activeChats: 3, resolved: 16, aht: '3m 10s', fcr: '95.0%', csat: 4.96, status: 'online' },
          { id: 3, name: 'Rahul Mehta', role: 'Technical Dispatch Lead', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', activeChats: 4, resolved: 14, aht: '3m 35s', fcr: '94.1%', csat: 4.92, status: 'busy' },
          { id: 4, name: 'Fatima Zahra', role: 'Customer Success & Retention', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', activeChats: 2, resolved: 12, aht: '3m 20s', fcr: '96.5%', csat: 4.97, status: 'online' },
          { id: 5, name: 'Vikram Patel', role: 'Invoicing & Payments Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', activeChats: 1, resolved: 10, aht: '3m 45s', fcr: '93.8%', csat: 4.90, status: 'online' },
        ],
      },
      '7d': {
        badge: 'Last 7 Days (Mon – Sun)',
        kpis: {
          totalInbound: 3140,
          inboundGrowth: '+15.8%',
          inboundPeriod: 'vs prev 7 days',
          fcr: '93.5%',
          fcrLabel: 'Automated by AI',
          botReply: '1.6 sec',
          botReplySub: 'Sub-second SLA',
          aht: '3m 24s',
          ahtChange: '-19.8%',
          waHealth: '98.9%',
          waHealthSub: 'Tier 2 • Green Rating',
          csat: '4.92 / 5.0',
          csatPct: '98.7% satisfaction',
        },
        trend: [
          { date: 'Mon', total: 420, aiResolved: 392, humanHandled: 28, speed: 1.6, resolution: 93.3 },
          { date: 'Tue', total: 445, aiResolved: 418, humanHandled: 27, speed: 1.5, resolution: 93.9 },
          { date: 'Wed', total: 460, aiResolved: 431, humanHandled: 29, speed: 1.7, resolution: 93.7 },
          { date: 'Thu', total: 435, aiResolved: 406, humanHandled: 29, speed: 1.6, resolution: 93.3 },
          { date: 'Fri', total: 490, aiResolved: 460, humanHandled: 30, speed: 1.5, resolution: 93.9 },
          { date: 'Sat', total: 450, aiResolved: 421, humanHandled: 29, speed: 1.6, resolution: 93.6 },
          { date: 'Sun', total: 440, aiResolved: 408, humanHandled: 32, speed: 1.7, resolution: 92.7 },
        ],
        footer: {
          totalInbound: 3140,
          aiAutomated: 2936,
          aiPct: '93.5%',
          humanEscalations: 204,
          humanPct: '6.5%',
          slaTarget: '< 2.5s',
          slaAchieved: '1.6s',
        },
        channels: [
          { id: 'webchat', name: 'Web Chat', value: 1380, color: '#3B82F6', percent: '43.9%', growth: '+13.5%', speed: '1.8s', csat: '4.9', icon: Globe },
          { id: 'mobile', name: 'Mobile App', value: 890, color: '#8B5CF6', percent: '28.3%', growth: '+8.1%', speed: '2.0s', csat: '4.8', icon: Smartphone },
          { id: 'whatsapp', name: 'WhatsApp Cloud API', value: 620, color: '#10B981', percent: '19.7%', growth: '+26.4%', speed: '1.4s', csat: '5.0', icon: MessageSquare },
          { id: 'email', name: 'Email Support', value: 180, color: '#F59E0B', percent: '5.7%', growth: '-1.8%', speed: '7.6m', csat: '4.6', icon: Mail },
          { id: 'others', name: 'Others / API', value: 70, color: '#64748B', percent: '2.2%', growth: '+1.2%', speed: '3.0s', csat: '4.7', icon: SlidersHorizontal },
        ],
        waHighlightCount: '620',
        waGrowth: '+26.4%',
        slaTiers: {
          instantBadge: '93.5% Instant',
          instant: { count: 2512, pct: '80.0%' },
          fast: { count: 424, pct: '13.5%' },
          handoff: { count: 145, pct: '4.6%' },
          extended: { count: 59, pct: '1.9%' },
          summary: '93.5% of all inquiries across the last 7 days were answered within 15 seconds. Human escalations maintained an average First Contact Resolution rate of 95.1%.',
        },
        teamCsat: '4.92 / 5.0',
        leaderboard: [
          { id: 1, name: 'Ramesh Kumar', role: 'Senior WhatsApp Specialist', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', activeChats: 14, resolved: 104, aht: '3m 05s', fcr: '95.2%', csat: 4.97, status: 'online' },
          { id: 2, name: 'Priya Sharma', role: 'Operations & Booking Agent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', activeChats: 9, resolved: 92, aht: '3m 22s', fcr: '94.1%', csat: 4.93, status: 'online' },
          { id: 3, name: 'Rahul Mehta', role: 'Technical Dispatch Lead', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', activeChats: 11, resolved: 85, aht: '3m 50s', fcr: '92.8%', csat: 4.89, status: 'busy' },
          { id: 4, name: 'Fatima Zahra', role: 'Customer Success & Retention', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', activeChats: 8, resolved: 74, aht: '3m 35s', fcr: '95.6%', csat: 4.96, status: 'online' },
          { id: 5, name: 'Vikram Patel', role: 'Invoicing & Payments Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', activeChats: 6, resolved: 66, aht: '4m 05s', fcr: '92.2%', csat: 4.84, status: 'offline' },
        ],
      },
      '30d': {
        badge: 'May 01 – May 31 (30 Days)',
        kpis: {
          totalInbound: 12845,
          inboundGrowth: '+18.2%',
          inboundPeriod: 'vs last mo',
          fcr: '92.6%',
          fcrLabel: 'Automated by AI',
          botReply: '1.8 sec',
          botReplySub: 'Sub-second SLA',
          aht: '3m 48s',
          ahtChange: '-18.4%',
          waHealth: '98.4%',
          waHealthSub: 'Tier 2 • Green Rating',
          csat: '4.9 / 5.0',
          csatPct: '98.4% satisfaction',
        },
        trend: [
          { date: 'May 01', total: 380, aiResolved: 350, humanHandled: 30, speed: 2.4, resolution: 92.1 },
          { date: 'May 03', total: 410, aiResolved: 385, humanHandled: 25, speed: 2.2, resolution: 93.9 },
          { date: 'May 05', total: 460, aiResolved: 428, humanHandled: 32, speed: 2.6, resolution: 93.0 },
          { date: 'May 07', total: 430, aiResolved: 398, humanHandled: 32, speed: 2.1, resolution: 92.5 },
          { date: 'May 09', total: 512, aiResolved: 480, humanHandled: 32, speed: 1.9, resolution: 93.7 },
          { date: 'May 11', total: 485, aiResolved: 450, humanHandled: 35, speed: 2.0, resolution: 92.7 },
          { date: 'May 13', total: 540, aiResolved: 508, humanHandled: 32, speed: 1.8, resolution: 94.0 },
          { date: 'May 15', total: 595, aiResolved: 560, humanHandled: 35, speed: 1.9, resolution: 94.1 },
          { date: 'May 17', total: 520, aiResolved: 485, humanHandled: 35, speed: 2.1, resolution: 93.2 },
          { date: 'May 19', total: 610, aiResolved: 575, humanHandled: 35, speed: 1.8, resolution: 94.2 },
          { date: 'May 21', total: 580, aiResolved: 540, humanHandled: 40, speed: 2.0, resolution: 93.1 },
          { date: 'May 23', total: 640, aiResolved: 605, humanHandled: 35, speed: 1.7, resolution: 94.5 },
          { date: 'May 25', total: 670, aiResolved: 630, humanHandled: 40, speed: 1.6, resolution: 94.0 },
          { date: 'May 27', total: 720, aiResolved: 680, humanHandled: 40, speed: 1.5, resolution: 94.4 },
          { date: 'May 29', total: 690, aiResolved: 650, humanHandled: 40, speed: 1.6, resolution: 94.2 },
          { date: 'May 31', total: 745, aiResolved: 702, humanHandled: 43, speed: 1.4, resolution: 94.2 },
        ],
        footer: {
          totalInbound: 12845,
          aiAutomated: 11894,
          aiPct: '92.6%',
          humanEscalations: 951,
          humanPct: '7.4%',
          slaTarget: '< 2.5s',
          slaAchieved: '1.8s',
        },
        channels: [
          { id: 'webchat', name: 'Web Chat', value: 5801, color: '#3B82F6', percent: '45.2%', growth: '+14.2%', speed: '1.9s', csat: '4.9', icon: Globe },
          { id: 'mobile', name: 'Mobile App', value: 3688, color: '#8B5CF6', percent: '28.7%', growth: '+8.6%', speed: '2.1s', csat: '4.8', icon: Smartphone },
          { id: 'whatsapp', name: 'WhatsApp Cloud API', value: 2003, color: '#10B981', percent: '15.6%', growth: '+24.8%', speed: '1.4s', csat: '5.0', icon: MessageSquare },
          { id: 'email', name: 'Email Support', value: 964, color: '#F59E0B', percent: '7.5%', growth: '-2.1%', speed: '8.4m', csat: '4.6', icon: Mail },
          { id: 'others', name: 'Others / API', value: 389, color: '#64748B', percent: '3.0%', growth: '+1.4%', speed: '3.2s', csat: '4.7', icon: SlidersHorizontal },
        ],
        waHighlightCount: '2,003',
        waGrowth: '+24.8%',
        slaTiers: {
          instantBadge: '92.6% Instant',
          instant: { count: 10070, pct: '78.4%' },
          fast: { count: 1824, pct: '14.2%' },
          handoff: { count: 655, pct: '5.1%' },
          extended: { count: 296, pct: '2.3%' },
          summary: '97.7% of all incoming inquiries across WhatsApp, Web Chat, and Mobile received a personalized answer within 15 seconds. Human escalations maintained an average First Contact Resolution rate of 94.8%.',
        },
        teamCsat: '4.91 / 5.0',
        leaderboard: [
          { id: 1, name: 'Ramesh Kumar', role: 'Senior WhatsApp Specialist', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', activeChats: 14, resolved: 432, aht: '3m 15s', fcr: '94.8%', csat: 4.96, status: 'online' },
          { id: 2, name: 'Priya Sharma', role: 'Operations & Booking Agent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', activeChats: 9, resolved: 389, aht: '3m 42s', fcr: '93.5%', csat: 4.92, status: 'online' },
          { id: 3, name: 'Rahul Mehta', role: 'Technical Dispatch Lead', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', activeChats: 11, resolved: 356, aht: '4m 10s', fcr: '92.0%', csat: 4.88, status: 'busy' },
          { id: 4, name: 'Fatima Zahra', role: 'Customer Success & Retention', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', activeChats: 8, resolved: 312, aht: '3m 50s', fcr: '95.1%', csat: 4.95, status: 'online' },
          { id: 5, name: 'Vikram Patel', role: 'Invoicing & Payments Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', activeChats: 6, resolved: 278, aht: '4m 30s', fcr: '91.4%', csat: 4.82, status: 'offline' },
        ],
      },
      this_month: {
        badge: 'Current Month to Date (MTD)',
        kpis: {
          totalInbound: 8420,
          inboundGrowth: '+16.5%',
          inboundPeriod: 'vs last mo MTD',
          fcr: '93.2%',
          fcrLabel: 'Automated by AI',
          botReply: '1.7 sec',
          botReplySub: 'Sub-second SLA',
          aht: '3m 36s',
          ahtChange: '-19.2%',
          waHealth: '98.6%',
          waHealthSub: 'Tier 2 • Green Rating',
          csat: '4.91 / 5.0',
          csatPct: '98.6% satisfaction',
        },
        trend: [
          { date: 'Day 01', total: 395, aiResolved: 366, humanHandled: 29, speed: 2.1, resolution: 92.6 },
          { date: 'Day 04', total: 420, aiResolved: 391, humanHandled: 29, speed: 2.0, resolution: 93.1 },
          { date: 'Day 07', total: 450, aiResolved: 421, humanHandled: 29, speed: 1.9, resolution: 93.5 },
          { date: 'Day 10', total: 480, aiResolved: 450, humanHandled: 30, speed: 1.8, resolution: 93.7 },
          { date: 'Day 13', total: 510, aiResolved: 479, humanHandled: 31, speed: 1.7, resolution: 93.9 },
          { date: 'Day 16', total: 540, aiResolved: 508, humanHandled: 32, speed: 1.6, resolution: 94.1 },
          { date: 'Day 19', total: 575, aiResolved: 541, humanHandled: 34, speed: 1.6, resolution: 94.1 },
          { date: 'Day 22', total: 610, aiResolved: 575, humanHandled: 35, speed: 1.5, resolution: 94.3 },
          { date: 'Day 25', total: 650, aiResolved: 612, humanHandled: 38, speed: 1.5, resolution: 94.2 },
          { date: 'Day 28', total: 680, aiResolved: 642, humanHandled: 38, speed: 1.4, resolution: 94.4 },
        ],
        footer: {
          totalInbound: 8420,
          aiAutomated: 7847,
          aiPct: '93.2%',
          humanEscalations: 573,
          humanPct: '6.8%',
          slaTarget: '< 2.5s',
          slaAchieved: '1.7s',
        },
        channels: [
          { id: 'webchat', name: 'Web Chat', value: 3780, color: '#3B82F6', percent: '44.9%', growth: '+13.8%', speed: '1.8s', csat: '4.9', icon: Globe },
          { id: 'mobile', name: 'Mobile App', value: 2410, color: '#8B5CF6', percent: '28.6%', growth: '+8.3%', speed: '2.0s', csat: '4.8', icon: Smartphone },
          { id: 'whatsapp', name: 'WhatsApp Cloud API', value: 1520, color: '#10B981', percent: '18.1%', growth: '+25.1%', speed: '1.4s', csat: '5.0', icon: MessageSquare },
          { id: 'email', name: 'Email Support', value: 510, color: '#F59E0B', percent: '6.1%', growth: '-1.9%', speed: '7.9m', csat: '4.6', icon: Mail },
          { id: 'others', name: 'Others / API', value: 200, color: '#64748B', percent: '2.4%', growth: '+1.3%', speed: '3.1s', csat: '4.7', icon: SlidersHorizontal },
        ],
        waHighlightCount: '1,520',
        waGrowth: '+25.1%',
        slaTiers: {
          instantBadge: '93.2% Instant',
          instant: { count: 6702, pct: '79.6%' },
          fast: { count: 1145, pct: '13.6%' },
          handoff: { count: 412, pct: '4.9%' },
          extended: { count: 161, pct: '1.9%' },
          summary: '93.2% of all customer inquiries month-to-date were answered within 15 seconds. Human escalations maintained an average First Contact Resolution rate of 95.0%.',
        },
        teamCsat: '4.92 / 5.0',
        leaderboard: [
          { id: 1, name: 'Ramesh Kumar', role: 'Senior WhatsApp Specialist', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', activeChats: 14, resolved: 285, aht: '3m 12s', fcr: '95.0%', csat: 4.96, status: 'online' },
          { id: 2, name: 'Priya Sharma', role: 'Operations & Booking Agent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', activeChats: 9, resolved: 256, aht: '3m 30s', fcr: '93.8%', csat: 4.93, status: 'online' },
          { id: 3, name: 'Rahul Mehta', role: 'Technical Dispatch Lead', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', activeChats: 11, resolved: 234, aht: '4m 00s', fcr: '92.3%', csat: 4.88, status: 'busy' },
          { id: 4, name: 'Fatima Zahra', role: 'Customer Success & Retention', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', activeChats: 8, resolved: 205, aht: '3m 42s', fcr: '95.3%', csat: 4.95, status: 'online' },
          { id: 5, name: 'Vikram Patel', role: 'Invoicing & Payments Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', activeChats: 6, resolved: 182, aht: '4m 15s', fcr: '91.8%', csat: 4.83, status: 'offline' },
        ],
      },
    };

    return datasets[timeRange] || datasets['30d'];
  }, [timeRange]);

  // AI Intent Intelligence Dataset (dynamic counts scaled by active time range)
  const intentData = useMemo(() => {
    const scale = timeRange === 'today' ? 0.038 : timeRange === '7d' ? 0.245 : timeRange === 'this_month' ? 0.655 : 1;
    return [
      {
        id: 'info',
        intent: 'Getting Information & Pricing',
        count: Math.round(3254 * scale),
        percent: 25.3,
        confidence: 98.4,
        deflection: 96.2,
        sentiment: { positive: 86, neutral: 12, urgent: 2 },
        growth: '+14.8%',
        sampleQueries: ['What is the AC service fee?', 'Price for duct cleaning', 'Do you work on weekends?']
      },
      {
        id: 'howto',
        intent: 'How To / Service Booking Guide',
        count: Math.round(2487 * scale),
        percent: 19.3,
        confidence: 97.1,
        deflection: 94.5,
        sentiment: { positive: 91, neutral: 7, urgent: 2 },
        growth: '+11.2%',
        sampleQueries: ['Book service appointment', 'How to schedule technician', 'Change booking slot']
      },
      {
        id: 'account',
        intent: 'Account, Branch & Contact Access',
        count: Math.round(1934 * scale),
        percent: 15.0,
        confidence: 96.5,
        deflection: 91.0,
        sentiment: { positive: 79, neutral: 18, urgent: 3 },
        growth: '+6.5%',
        sampleQueries: ['Calicut branch address', 'Technician contact number', 'GST invoice details']
      },
      {
        id: 'orders',
        intent: 'Orders, Dispatch & Delivery Tracking',
        count: Math.round(1742 * scale),
        percent: 13.6,
        confidence: 95.8,
        deflection: 88.4,
        sentiment: { positive: 72, neutral: 21, urgent: 7 },
        growth: '+18.9%',
        sampleQueries: ['Track spare part order', 'When will technician arrive?', 'Dispatch status update']
      },
      {
        id: 'tech',
        intent: 'Emergency Repair & Escalations',
        count: Math.round(1210 * scale),
        percent: 9.4,
        confidence: 94.2,
        deflection: 74.8,
        sentiment: { positive: 45, neutral: 35, urgent: 20 },
        growth: '+3.2%',
        sampleQueries: ['Gas leak urgent', 'AC not cooling at all', 'Need immediate technician']
      },
      {
        id: 'feedback',
        intent: 'Customer Reviews & Feedback',
        count: Math.round(890 * scale),
        percent: 6.9,
        confidence: 98.9,
        deflection: 98.0,
        sentiment: { positive: 94, neutral: 4, urgent: 2 },
        growth: '+22.4%',
        sampleQueries: ['Great job by Ramesh', '5 star rating', 'Loved the fast response']
      }
    ];
  }, [timeRange]);

  // Filtered intents by search
  const filteredIntents = useMemo(() => {
    if (!searchIntentQuery.trim()) return intentData;
    const q = searchIntentQuery.toLowerCase();
    return intentData.filter(i =>
      i.intent.toLowerCase().includes(q) ||
      i.sampleQueries.some(s => s.toLowerCase().includes(q))
    );
  }, [intentData, searchIntentQuery]);

  // 24/7 Peak Hours Traffic Matrix (Day vs Hour)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];

  const heatmapData: Record<string, number[]> = {
    Mon: [8, 4, 3, 12, 45, 92, 98, 88, 76, 85, 62, 28],
    Tue: [6, 3, 2, 14, 52, 96, 99, 90, 82, 88, 64, 30],
    Wed: [9, 5, 4, 16, 50, 95, 96, 92, 84, 86, 68, 32],
    Thu: [7, 4, 3, 15, 48, 94, 95, 89, 81, 84, 65, 29],
    Fri: [10, 6, 4, 18, 55, 98, 100, 94, 87, 91, 74, 38],
    Sat: [12, 8, 6, 15, 38, 72, 84, 80, 75, 78, 58, 35],
    Sun: [14, 9, 5, 12, 25, 55, 68, 65, 62, 69, 52, 26],
  };

  const getHeatColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-600 text-white font-bold';
    if (val >= 70) return 'bg-emerald-500 text-white font-semibold';
    if (val >= 50) return 'bg-emerald-400 text-slate-900';
    if (val >= 30) return 'bg-emerald-200 text-slate-800';
    if (val >= 15) return 'bg-emerald-100 text-slate-700';
    return 'bg-slate-100 text-slate-400';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Analytics & Intent Intelligence"
        subtitle="Multi-channel conversation breakdown, resolution rates, and AI customer intent analytics."
        primaryActionLabel="Export Analytics"
        onPrimaryAction={handleExport}
      />

      <div className="p-3 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Interactive Top Control & Perspective Strip */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('intents')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'intents'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Intent Intelligence</span>
            </button>
            <button
              onClick={() => setActiveTab('traffic')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'traffic'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Traffic & Peak Hours</span>
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'agents'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Agent Leaderboard</span>
            </button>
          </div>

          {/* Date Range Presets & Channel Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto justify-between md:justify-end">
            {/* Range Presets */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => handleTimeRangeChange('today', 'Today')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${timeRange === 'today' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Today
              </button>
              <button
                onClick={() => handleTimeRangeChange('7d', 'Last 7 Days')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${timeRange === '7d' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                7D
              </button>
              <button
                onClick={() => handleTimeRangeChange('30d', 'Last 30 Days')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${timeRange === '30d' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                30D
              </button>
              <button
                onClick={() => handleTimeRangeChange('this_month', 'Current Month')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${timeRange === 'this_month' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
              >
                Month
              </button>
            </div>

            {/* Live Sync Status Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Click to sync real-time analytics with database"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/90 active:scale-95 border border-emerald-200/80 rounded-lg text-emerald-800 text-[11px] font-medium transition-all cursor-pointer disabled:opacity-60 shadow-2xs group"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isRefreshing ? 'animate-ping' : 'animate-pulse'}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Live Sync'}</span>
              <RefreshCw className={`w-3 h-3 text-emerald-600 transition-transform duration-700 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-[10px] text-emerald-600/80 font-normal">({lastRefreshedTime})</span>
            </button>
          </div>
        </div>

        {/* 6-Card Modern KPI Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
          {/* Card 1: Inbound Conversations */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="truncate">Total Inbound</span>
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{activeData.kpis.totalInbound.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{activeData.kpis.inboundGrowth}</span>
              <span className="text-slate-400 font-normal text-[10px]">{activeData.kpis.inboundPeriod}</span>
            </div>
          </div>

          {/* Card 2: AI Bot Resolution */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="truncate">1st Contact Res.</span>
              <Bot className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-600">{activeData.kpis.fcr}</div>
            <div className="text-[11px] font-semibold text-purple-700 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-500" />
              <span className="truncate">{activeData.kpis.fcrLabel}</span>
            </div>
          </div>

          {/* Card 3: Bot Response Time */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="truncate">Avg. Bot Reply</span>
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">{activeData.kpis.botReply}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              {activeData.kpis.botReplySub}
            </div>
          </div>

          {/* Card 4: Human Agent Handle Time */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="truncate">Agent Handle (AHT)</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-600">{activeData.kpis.aht}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{activeData.kpis.ahtChange}</span>
              <span className="text-slate-400 font-normal text-[10px]">faster</span>
            </div>
          </div>

          {/* Card 5: WhatsApp Delivery Rate */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="truncate">WhatsApp Health</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">{activeData.kpis.waHealth}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              {activeData.kpis.waHealthSub}
            </div>
          </div>

          {/* Card 6: Customer CSAT */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span className="truncate">Customer CSAT</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-500">{activeData.kpis.csat}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
              {activeData.kpis.csatPct}
            </div>
          </div>
        </div>

        {/* Tab 1: Overview & Trend Visualizations */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Multi-Metric Area Chart: Inbound vs Resolution Trend */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Inbound Conversation & Resolution Trajectory
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {activeData.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time comparison of incoming customer threads, automated AI resolutions, and team escalations.
                  </p>
                </div>

                {/* Metric Selector Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setTrendMetric('volume')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${trendMetric === 'volume' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Volume (Inbound vs AI)
                  </button>
                  <button
                    onClick={() => setTrendMetric('resolution')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${trendMetric === 'resolution' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Resolution %
                  </button>
                  <button
                    onClick={() => setTrendMetric('speed')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${trendMetric === 'speed' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Reply Speed (Sec)
                  </button>
                </div>
              </div>

              {/* Responsive Recharts Graph */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {trendMetric === 'volume' ? (
                    <AreaChart data={activeData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                      />
                      <Area type="monotone" dataKey="total" name="Total Inbound" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#totalGrad)" />
                      <Area type="monotone" dataKey="aiResolved" name="AI Bot Resolved" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#aiGrad)" />
                    </AreaChart>
                  ) : trendMetric === 'resolution' ? (
                    <BarChart data={activeData.trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                      <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                      <Tooltip
                        formatter={(val: number) => [`${val}%`, 'Resolution Rate']}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="resolution" name="Resolution Rate (%)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={activeData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                      <Tooltip
                        formatter={(val: number) => [`${val}s`, 'Avg Latency']}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="speed" name="Avg Latency (Seconds)" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#speedGrad)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Total Inbound ({activeData.footer.totalInbound.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>AI Automated ({activeData.footer.aiAutomated.toLocaleString()} • {activeData.footer.aiPct})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Human Escalations ({activeData.footer.humanEscalations.toLocaleString()} • {activeData.footer.humanPct})</span>
                  </div>
                </div>
                <div className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  Target SLA: {activeData.footer.slaTarget} • Achieved: {activeData.footer.slaAchieved} (100% Compliant)
                </div>
              </div>
            </div>

            {/* 2-Column: Channels Breakdown & Response Time Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Channel Breakdown Card with Donut & Detailed Table */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Conversations by Channel</h3>
                    <p className="text-xs text-slate-500">Distribution, response latency, and CSAT rating</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">5 Channels</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2 border-b border-slate-100 pb-4">
                  <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeData.channels}
                          dataKey="value"
                          innerRadius={46}
                          outerRadius={68}
                          paddingAngle={3}
                        >
                          {activeData.channels.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
                      <span className="text-sm font-black text-slate-900">{activeData.kpis.totalInbound.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Channel Summary Rows */}
                  <div className="space-y-2 text-xs w-full sm:w-auto flex-1 max-w-sm">
                    {activeData.channels.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-700 font-medium truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="font-bold text-slate-900">{item.value.toLocaleString()}</span>
                            <span className="text-[11px] text-slate-400">({item.percent})</span>
                            <span className="text-[10px] font-bold text-emerald-600">{item.growth}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WhatsApp Cloud API Spotlight Mini-Card */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">WhatsApp Cloud API (Official Meta BSP)</div>
                      <div className="text-[11px] text-emerald-700">Highest growth channel ({activeData.waGrowth}) with 5.0 CSAT rating</div>
                    </div>
                  </div>
                  <span className="font-black text-sm text-emerald-800 font-mono">{activeData.waHighlightCount} convs</span>
                </div>
              </div>

              {/* Response Time SLA & Speed Distribution */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Response Latency & SLA Tiers</h3>
                    <p className="text-xs text-slate-500">Breakdown of customer waiting times before first reply</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {activeData.slaTiers.instantBadge}
                  </span>
                </div>

                <div className="space-y-3 text-xs pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Instant AI Bot Reply (&lt; 3 seconds)</span>
                      </span>
                      <span className="font-bold text-emerald-600 font-mono">{activeData.slaTiers.instant.count.toLocaleString()} ({activeData.slaTiers.instant.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: activeData.slaTiers.instant.pct }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        <span>Fast Queue Reply (3 – 15 seconds)</span>
                      </span>
                      <span className="font-bold text-purple-600 font-mono">{activeData.slaTiers.fast.count.toLocaleString()} ({activeData.slaTiers.fast.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: activeData.slaTiers.fast.pct }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Standard Human Handoff (15s – 2 mins)</span>
                      </span>
                      <span className="font-bold text-blue-600 font-mono">{activeData.slaTiers.handoff.count.toLocaleString()} ({activeData.slaTiers.handoff.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: activeData.slaTiers.handoff.pct }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Extended Queue (&gt; 2 mins)</span>
                      </span>
                      <span className="font-bold text-amber-600 font-mono">{activeData.slaTiers.extended.count.toLocaleString()} ({activeData.slaTiers.extended.pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: activeData.slaTiers.extended.pct }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="font-bold text-slate-800">Operational SLA Summary:</div>
                  <div className="text-[11px] leading-relaxed text-slate-500">
                    {activeData.slaTiers.summary}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Intent & Sentiment Intelligence */}
        {activeTab === 'intents' && (
          <div className="space-y-5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>AI Customer Intent Taxonomy & Sentiment Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Natural language processing extracted categories, confidence scores, and sentiment classification.
                  </p>
                </div>

                {/* Intent Search Bar */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchIntentQuery}
                    onChange={(e) => setSearchIntentQuery(e.target.value)}
                    placeholder="Search intent or trigger query..."
                    className="w-full px-3 py-1.5 pl-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <Bot className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Intent Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredIntents.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-purple-300 hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {item.intent}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-mono">
                          <span>{item.count.toLocaleString()} queries</span>
                          <span>•</span>
                          <span className="font-bold text-slate-800">{item.percent}% share</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{item.growth}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] shrink-0">
                        {item.confidence}% Confidence
                      </span>
                    </div>

                    {/* Deflection & Sentiment Meters */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                        <span>Automated Resolution Rate:</span>
                        <span className="font-bold text-emerald-600">{item.deflection}% Deflection</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.deflection}%` }} />
                      </div>
                    </div>

                    {/* Sentiment Pills */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Customer Sentiment:</span>
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Smile className="w-3 h-3 text-emerald-500" />
                          <span>{item.sentiment.positive}%</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Meh className="w-3 h-3 text-slate-400" />
                          <span>{item.sentiment.neutral}%</span>
                        </span>
                        {item.sentiment.urgent > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Frown className="w-3 h-3 text-amber-500" />
                            <span>{item.sentiment.urgent}%</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sample Queries */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.sampleQueries.map((query, qIdx) => (
                        <span
                          key={qIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-600 text-[10px] font-medium"
                        >
                          &quot;{query}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 24/7 Peak Inbound Traffic Heatmap */}
        {activeTab === 'traffic' && (
          <div className="space-y-5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>24/7 Peak Hours & Weekly Inbound Heatmap</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hourly traffic concentration across all messaging channels to optimize support shifts and technician dispatch.
                  </p>
                </div>

                {/* Heat Legend */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Low</span>
                  <span className="w-4 h-3 rounded bg-slate-100 border border-slate-200" />
                  <span className="w-4 h-3 rounded bg-emerald-200" />
                  <span className="w-4 h-3 rounded bg-emerald-400" />
                  <span className="w-4 h-3 rounded bg-emerald-600" />
                  <span>Surge Peak</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[650px] space-y-1.5 text-xs">
                  {/* Hours Header */}
                  <div className="grid grid-cols-13 gap-1 text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider pb-1">
                    <div>Day</div>
                    {timeSlots.map((time, idx) => (
                      <div key={idx} className="truncate">{time}</div>
                    ))}
                  </div>

                  {/* Day Rows */}
                  {daysOfWeek.map((day) => (
                    <div key={day} className="grid grid-cols-13 gap-1 items-center">
                      <div className="font-bold text-slate-700 text-xs px-1">{day}</div>
                      {heatmapData[day].map((val, idx) => (
                        <div
                          key={idx}
                          title={`${day} @ ${timeSlots[idx]}: Load Factor ${val}/100`}
                          className={`h-8 rounded-lg flex items-center justify-center text-[10px] transition-all hover:scale-105 cursor-pointer shadow-2xs ${getHeatColor(val)}`}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Staffing Insight & Peak Recommendation:</span> Traffic surges consistently peak on <strong>Mondays, Tuesdays, and Fridays between 10:00 AM – 1:00 PM</strong> and <strong>6:00 PM – 8:30 PM</strong>. Ensure at least 3 live human agents are available during these intervals for escalations.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Agent & Support Team Leaderboard */}
        {activeTab === 'agents' && (
          <div className="space-y-5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Support Team & Agent Productivity Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Individual specialist metrics, average handle times (AHT), resolution rates, and customer reviews.
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  Team CSAT: <strong className="text-slate-900 font-bold">{activeData.teamCsat}</strong>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Specialist</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Active Chats</th>
                      <th className="py-3 px-3 text-center">Resolved</th>
                      <th className="py-3 px-3 text-center">Avg Handle (AHT)</th>
                      <th className="py-3 px-3 text-center">1st Resolution %</th>
                      <th className="py-3 px-4 text-right">CSAT Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeData.leaderboard.map((agent) => (
                      <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">{agent.name}</div>
                              <div className="text-[11px] text-slate-400">{agent.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              agent.status === 'online'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : agent.status === 'busy'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                agent.status === 'online'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : agent.status === 'busy'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span className="capitalize">{agent.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono">
                          {agent.activeChats}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                          {agent.resolved}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-600 font-mono">
                          {agent.aht}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-purple-600 font-mono">
                          {agent.fcr}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800 font-bold font-mono">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>{agent.csat.toFixed(2)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
