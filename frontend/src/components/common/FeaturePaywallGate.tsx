import React, { useState } from 'react';
import { TenantSidebarModule, PlatformTenant } from '@/types';
import {
  MODULE_PRICING_CATALOG,
  startTenantModuleTrial,
  purchaseTenantModuleAddon,
  isModuleUnlockedForTenant,
} from '@/utils/featureEntitlements';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  Lock, Sparkles, Clock, Check, ArrowRight, ShieldCheck,
  Zap, IndianRupee, MessageCircle, AlertCircle, RefreshCw
} from 'lucide-react';

interface FeaturePaywallGateProps {
  moduleId: TenantSidebarModule;
  activeTenant: PlatformTenant | null;
  onUnlocked?: () => void;
  children?: React.ReactNode;
}

export const FeaturePaywallGate: React.FC<FeaturePaywallGateProps> = ({
  moduleId,
  activeTenant: propActiveTenant,
  onUnlocked,
  children,
}) => {
  const { addToast, setActiveTab, activeTenant: storeActiveTenant } = useQiyamStore();
  const activeTenant = propActiveTenant || storeActiveTenant;
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const modInfo = MODULE_PRICING_CATALOG[moduleId];
  const entitlement = isModuleUnlockedForTenant(activeTenant, moduleId);

  // If already unlocked, render the children directly!
  if (entitlement.isUnlocked && children) {
    return (
      <div className="relative w-full h-full flex flex-col">
        {/* If under trial, render a sleek sticky trial countdown banner on top */}
        {entitlement.reason === 'trial' && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-xs shadow-md z-30 shrink-0 gap-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
              <span>⏳ <strong>Free Trial Active:</strong> You have <strong>{entitlement.trialHoursLeft} hours</strong> ({entitlement.trialDaysLeft} days) remaining on <strong>{modInfo.label}</strong>.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (!activeTenant) return;
                  setIsProcessing(true);
                  try {
                    await purchaseTenantModuleAddon(activeTenant.id, moduleId);
                    addToast(`Unlocked ${modInfo.label} add-on permanently!`, 'success');
                    if (onUnlocked) onUnlocked();
                  } catch (e) {
                    addToast('Failed to purchase add-on', 'error');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="px-3 py-1 bg-white text-amber-900 hover:bg-amber-50 font-bold rounded-lg shadow-xs transition cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span>Keep Permanently (₹{modInfo.addonMonthlyPrice}/mo)</span>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  const trialDays = activeTenant?.trialConfigDays || 7;
  const trialRecord = activeTenant?.activeTrials?.[moduleId];
  const addonRecord = activeTenant?.addonPurchases?.[moduleId];
  const isTrialExpired = trialRecord?.status === 'expired' || (trialRecord?.expiresAt ? new Date(trialRecord.expiresAt).getTime() <= Date.now() : false);
  const isAddonExpired = addonRecord?.status === 'expired' || (addonRecord?.expiresAt ? new Date(addonRecord.expiresAt).getTime() <= Date.now() : false);

  const monthlyPrice = modInfo.addonMonthlyPrice;
  const annualPrice = Math.round(modInfo.addonAnnualPrice / 12);
  const displayPrice = billingCycle === 'monthly' ? monthlyPrice : annualPrice;

  // Handle Starting Free Trial
  const handleStartTrial = async () => {
    if (!activeTenant) return;
    setIsProcessing(true);
    try {
      await startTenantModuleTrial(activeTenant.id, moduleId, trialDays);
      addToast(
        `🎉 ${trialDays}-Day Free Trial started for ${modInfo.label}! WhatsApp notification sent to ${activeTenant.ownerPhone}.`,
        'success'
      );
      if (onUnlocked) onUnlocked();
    } catch (err) {
      addToast('Failed to activate trial', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Standalone Add-on Purchase / Renewal
  const handlePurchaseAddon = async () => {
    if (!activeTenant) return;
    setIsProcessing(true);
    try {
      await purchaseTenantModuleAddon(activeTenant.id, moduleId);
      addToast(
        `✅ ${modInfo.label} unlocked as a standalone add-on for ₹${monthlyPrice}/mo! No full bundle upgrade required.`,
        'success'
      );
      if (onUnlocked) onUnlocked();
    } catch (err) {
      addToast('Failed to purchase add-on', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const ModIcon = modInfo.icon;

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden font-sans bg-slate-900/5">
      {/* ── 1. Blurred Background Feature View (Preview Teaser) ── */}
      {children && (
        <div
          className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none filter blur-[6px] opacity-70 scale-[1.01] transition-all duration-300"
          aria-hidden="true"
          tabIndex={-1}
        >
          {children}
        </div>
      )}

      {/* ── 2. Subtle Frosted Glass Backdrop Tint ── */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-none" />

      {/* ── 3. Paywall Gate Overlay & Modal (Scrollable) ── */}
      <div className="relative z-10 w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        <div className="max-w-4xl mx-auto w-full my-auto space-y-6 py-6">

          {/* ── Top Hero / Gating Header (Frosted Glass Panel) ── */}
          <div className="text-center space-y-3 bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/80 shadow-2xl shadow-slate-950/10 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100/90 text-amber-800 shadow-inner border border-amber-200">
              <Lock className="w-7 h-7 text-amber-700" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs">
                <ModIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>{modInfo.category} • Feature Locked</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Unlock {modInfo.label}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {modInfo.description}. This module is currently turned off for <strong>{activeTenant?.businessName || 'your workspace'}</strong>.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annually')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  billingCycle === 'annually'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>

        {/* Expired Status Banner (for Demo Client or any expired tenant) */}
        {(isAddonExpired || isTrialExpired) && (
          <div className="bg-rose-50/95 backdrop-blur-xl border border-rose-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-xl shadow-rose-950/5 text-left animate-in fade-in">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-950 text-xs">
                  {isAddonExpired && isTrialExpired
                    ? `${trialDays}-Day Free Trial & Add-On Plan Expired`
                    : isAddonExpired
                    ? 'Previous Add-On Subscription Expired'
                    : `${trialDays}-Day Free Trial Expired`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-800">
                  Access Paused
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                {isAddonExpired && isTrialExpired
                  ? `Both your ${trialDays}-day free trial and previous individual add-on plan for ${modInfo.label} have expired. You can instantly restore access by purchasing or renewing this standalone add-on below for ₹${displayPrice}/mo without buying the entire bundle.`
                  : isAddonExpired
                  ? `Your previous individual add-on plan for ${modInfo.label} has expired. You can instantly renew access below for ₹${displayPrice}/mo without purchasing an entire bundle.`
                  : `Your ${trialDays}-day free trial period for ${modInfo.label} has ended. Purchase this standalone feature below to continue with all your configurations and data intact.`}
              </p>
            </div>
          </div>
        )}

        {/* ── 3 Action Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">

          {/* Option 1: Standalone Add-on (User Request: "or if they need that only specific feature that estimated amount need to pay for that feature as an addon feature instead of bundle of features") */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-emerald-500 shadow-2xl shadow-emerald-950/10 p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className={`absolute top-0 right-0 ${isAddonExpired ? 'bg-rose-600' : 'bg-emerald-600'} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs`}>
              {isAddonExpired ? 'Add-On Expired • Renew' : 'Recommended Add-On'}
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  {isAddonExpired ? 'Reactivate Subscription' : 'Individual Add-On'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{modInfo.label}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pay only for this specific feature. No need to buy an entire expensive bundle!
                </p>
              </div>

              {/* Price */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-950">₹{displayPrice.toLocaleString()}</span>
                  <span className="text-xs text-emerald-700 font-medium">/ month</span>
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  {billingCycle === 'annually' ? `₹${modInfo.addonAnnualPrice.toLocaleString()} billed annually` : 'Cancel or pause anytime'}
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">What’s Included:</div>
                {modInfo.highlightFeatures.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={handlePurchaseAddon}
                disabled={isProcessing}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>{isAddonExpired ? `Renew Add-On (₹${displayPrice}/mo)` : `Unlock Add-On (₹${displayPrice}/mo)`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Temporary Access (Trial Version) */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Temporary Access</span>
                <h3 className="text-lg font-bold text-slate-900">{trialDays}-Day Free Trial</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Test-drive this feature with your real WhatsApp and staff workflows before paying anything.
                </p>
              </div>

              {/* Trial Status Box */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{isTrialExpired ? 'Trial Period Ended' : `${trialDays} Days Full Access`}</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  {isTrialExpired
                    ? 'Your trial for this module has expired. Purchase the add-on to restore access.'
                    : 'Admin-configured temporary trial. You’ll be alerted via software & WhatsApp before it ends.'}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Zero upfront payment or credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Instant activation on this workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>WhatsApp reminder 24h before expiry</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Configurable trial duration in Super Admin</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              {isTrialExpired ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-100 text-slate-400 font-semibold rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{trialDays}-Day Free Trial Expired • Purchase Add-on</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTrial}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start {trialDays}-Day Free Trial</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Option 3: Full Plan Bundle (Growth / Enterprise) */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Full Suite Bundle</span>
                <h3 className="text-lg font-bold text-slate-900">Upgrade Plan Tier</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Get all 14 modules unlocked in one unified subscription with unlimited staff licenses.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-950">₹4,999</span>
                  <span className="text-xs text-blue-700 font-medium">/ month</span>
                </div>
                <div className="text-[10px] text-blue-600 mt-0.5">Growth Bundle (All modules included)</div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>All 14 Modules Unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Unlimited Staff &amp; Technician Seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Meta Cloud API Verified WABA Line</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>24/7 Dedicated Account Manager</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('super-admin')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Full Plan Options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ── Footer Help / WhatsApp contact ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5 text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Need custom enterprise licensing or customized pricing? We can tailor an add-on bundle for your team.</span>
          </div>
          <a
            href="https://wa.me/919496300233?text=Hello%20Qiyam%20Support,%20I%20would%20like%20to%20inquire%20about%20feature%20add-ons%20and%20plan%20pricing."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-200 transition cursor-pointer shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chat on WhatsApp Support</span>
          </a>
        </div>

      </div>
    </div>
  </div>
);
};
