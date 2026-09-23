import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, Users, Landmark, Calendar, Check, AlertCircle } from 'lucide-react';
import { EmployeeTaxCompliance } from '@/types';
import { DraggableScrollRow } from '@/components/common/DraggableScrollRow';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeTaxCompliance | null;
  onSave: (updated: EmployeeTaxCompliance) => void;
  initialSection?: 'all' | 'tds' | 'pf' | 'esi' | 'pt';
}

export const TaxUpdateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  onSave,
  initialSection = 'all',
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'tds' | 'pf' | 'esi' | 'pt'>(initialSection);
  const [status, setStatus] = useState<EmployeeTaxCompliance['status']>('Compliant');
  const [tdsActive, setTdsActive] = useState(false);
  const [pfActive, setPfActive] = useState(false);
  const [esiActive, setEsiActive] = useState(false);
  const [ptActive, setPtActive] = useState(false);

  // Parameter specific values
  const [tdsRegime, setTdsRegime] = useState<'New Regime' | 'Old Regime'>('New Regime');
  const [estimatedAnnualTax, setEstimatedAnnualTax] = useState<number>(62000);
  const [monthlyTds, setMonthlyTds] = useState<number>(5166);
  const [pfNumber, setPfNumber] = useState('1002 3456 7891');
  const [pfRate, setPfRate] = useState('12% Employee + 12% Employer');
  const [esiNumber, setEsiNumber] = useState('4400 1234 5678');
  const [esiStatus, setEsiStatus] = useState('Exempt (> ₹21k)');
  const [ptNumber, setPtNumber] = useState('KL/PT/1234501');
  const [ptMonthly, setPtMonthly] = useState<number>(200);
  const [ptState, setPtState] = useState('Kerala');
  const [lastUpdated, setLastUpdated] = useState('');

  // Sync internal form state whenever record or initialSection changes
  useEffect(() => {
    if (record) {
      setTdsActive(record.tds);
      setPfActive(record.pf);
      setEsiActive(record.esi);
      setPtActive(record.pt);
      setStatus(record.status || 'Compliant');
      setTdsRegime(record.tds_regime || 'New Regime');
      setEstimatedAnnualTax(
        record.estimated_annual_tax ?? (record.monthly_tds ? record.monthly_tds * 12 : 62000)
      );
      setMonthlyTds(record.monthly_tds ?? 5166);
      setPfNumber(record.pf_number || '1002 3456 7891');
      setPfRate(record.pf_rate || '12% Employee + 12% Employer');
      setEsiNumber(record.esi_number || '4400 1234 5678');
      setEsiStatus(record.esi_status || (record.esi ? 'Applicable (0.75% + 3.25%)' : 'Exempt (> ₹21k)'));
      setPtNumber(record.pt_number || 'KL/PT/1234501');
      setPtMonthly(record.pt_monthly ?? 200);
      setPtState(record.pt_state || 'Kerala');
      setLastUpdated(
        record.last_updated ||
          new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      );
      setActiveSection(initialSection || 'all');
    }
  }, [record, isOpen, initialSection]);

  if (!isOpen || !record) return null;

  const handleSetToday = () => {
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setLastUpdated(today);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EmployeeTaxCompliance = {
      ...record,
      tds: tdsActive,
      pf: pfActive,
      esi: esiActive,
      pt: ptActive,
      status,
      tds_regime: tdsRegime,
      estimated_annual_tax: Number(estimatedAnnualTax) || 0,
      monthly_tds: Number(monthlyTds) || 0,
      pf_number: pfNumber.trim(),
      pf_rate: pfRate,
      esi_number: esiNumber.trim(),
      esi_status: esiStatus,
      pt_number: ptNumber.trim(),
      pt_monthly: Number(ptMonthly) || 0,
      pt_state: ptState,
      last_updated: lastUpdated || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Update Statutory Compliance</h3>
              <p className="text-[11px] text-slate-500">
                {record.employee_name} ({record.employee_id}) — {record.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="border-b border-slate-100 pb-2">
          <DraggableScrollRow showArrows={true} fadeEdges={true} scrollAmount={180} wheelMultiplier={1.2}>
            <button
              type="button"
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                activeSection === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Parameters
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('tds')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeSection === 'tds'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>TDS Parameters</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('pf')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeSection === 'pf'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PF Parameters</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('esi')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeSection === 'esi'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ESI Parameters</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('pt')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeSection === 'pt'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Professional Tax (PT)</span>
            </button>
          </DraggableScrollRow>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Statutory Deductions Quick Toggles (Visible in 'all' view) */}
          {activeSection === 'all' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 uppercase">Applicable Deductions Toggle</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="checkbox"
                    checked={tdsActive}
                    onChange={(e) => setTdsActive(e.target.checked)}
                    className="rounded text-blue-600 accent-blue-600"
                  />
                  <span className="font-semibold text-slate-800">TDS Applicable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="checkbox"
                    checked={pfActive}
                    onChange={(e) => setPfActive(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">PF Applicable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="checkbox"
                    checked={esiActive}
                    onChange={(e) => setEsiActive(e.target.checked)}
                    className="rounded text-amber-600 accent-amber-600"
                  />
                  <span className="font-semibold text-slate-800">ESI Applicable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                  <input
                    type="checkbox"
                    checked={ptActive}
                    onChange={(e) => setPtActive(e.target.checked)}
                    className="rounded text-purple-600 accent-purple-600"
                  />
                  <span className="font-semibold text-slate-800">PT Applicable</span>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 1: TDS PARAMETERS */}
          {(activeSection === 'all' || activeSection === 'tds') && (
            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Tax Deducted at Source (TDS) Parameters</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-blue-900">
                  <input
                    type="checkbox"
                    checked={tdsActive}
                    onChange={(e) => setTdsActive(e.target.checked)}
                    className="rounded text-blue-600 accent-blue-600"
                  />
                  <span>Enable TDS</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">TDS Tax Regime</label>
                  <select
                    value={tdsRegime}
                    onChange={(e) => setTdsRegime(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="New Regime">New Tax Regime (Sec 115BAC)</option>
                    <option value="Old Regime">Old Tax Regime (With Exemptions)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    {tdsRegime === 'New Regime'
                      ? 'Standard deduction of ₹75,000 auto-applied'
                      : 'Requires proof submission for 80C, 80D & HRA'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Monthly TDS Deduction (₹)</label>
                  <input
                    type="number"
                    value={monthlyTds}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMonthlyTds(val);
                      if (val > 0 && (!estimatedAnnualTax || estimatedAnnualTax === monthlyTds * 12)) {
                        setEstimatedAnnualTax(val * 12);
                      }
                    }}
                    placeholder="5166"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400">Monthly deduction deducted from payroll</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Estimated Annual Tax Liability (₹)</label>
                  <input
                    type="number"
                    value={estimatedAnnualTax}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEstimatedAnnualTax(val);
                      if (val > 0) {
                        setMonthlyTds(Math.round(val / 12));
                      }
                    }}
                    placeholder="62000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400">Annual projected tax payable for FY 2024-25</p>
                </div>

                <div className="p-2.5 bg-blue-100/40 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between">
                  <div>
                    <div className="font-bold">Annual to Monthly Ratio</div>
                    <div className="text-[10px] text-blue-700">₹{(monthlyTds * 12).toLocaleString()} projected yearly</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonthlyTds(Math.round(estimatedAnnualTax / 12))}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[10px] cursor-pointer"
                  >
                    Sync Monthly
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PF PARAMETERS */}
          {(activeSection === 'all' || activeSection === 'pf') && (
            <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Provident Fund (EPFO) Parameters</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={pfActive}
                    onChange={(e) => setPfActive(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>Enable PF</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">PF Number (12-Digit UAN)</label>
                  <input
                    type="text"
                    value={pfNumber}
                    onChange={(e) => setPfNumber(e.target.value)}
                    placeholder="1002 3456 7891"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400">EPFO Universal Account Number linked with Aadhaar</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contribution Rate Structure</label>
                  <select
                    value={pfRate}
                    onChange={(e) => setPfRate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="12% Employee + 12% Employer">12% Employee + 12% Employer (Statutory Standard)</option>
                    <option value="10% Employee + 10% Employer">10% Employee + 10% Employer (Special Category)</option>
                    <option value="Voluntary PF (VPF) Enabled">Voluntary PF (VPF) Custom Rate</option>
                  </select>
                  <p className="text-[10px] text-slate-400">Employer contributes 3.67% to EPF and 8.33% to EPS</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ESI PARAMETERS */}
          {(activeSection === 'all' || activeSection === 'esi') && (
            <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Employee State Insurance (ESIC) Parameters</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
                  <input
                    type="checkbox"
                    checked={esiActive}
                    onChange={(e) => setEsiActive(e.target.checked)}
                    className="rounded text-amber-600 accent-amber-600"
                  />
                  <span>Enable ESI</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ESI Insurance Number (17 Digits)</label>
                  <input
                    type="text"
                    value={esiNumber}
                    onChange={(e) => setEsiNumber(e.target.value)}
                    placeholder="4400 1234 5678"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400">Permanent ESIC Insurance registration IP number</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Coverage & Exemption Rule</label>
                  <select
                    value={esiStatus}
                    onChange={(e) => {
                      setEsiStatus(e.target.value);
                      if (e.target.value.includes('Exempt')) {
                        setEsiActive(false);
                      } else {
                        setEsiActive(true);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Exempt (> ₹21k)">Exempt (Gross Salary &gt; ₹21,000 / month)</option>
                    <option value="Applicable (0.75% + 3.25%)">Applicable (0.75% Employee + 3.25% Employer)</option>
                    <option value="Voluntary Enrolled">Voluntary Enrolled Scheme</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Mandatory only for employees with monthly gross salary up to ₹21,000
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PROFESSIONAL TAX (PT) PARAMETERS */}
          {(activeSection === 'all' || activeSection === 'pt') && (
            <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-purple-100">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                  <Landmark className="w-4 h-4 text-purple-600" />
                  <span>Professional Tax (PT) Parameters</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-900">
                  <input
                    type="checkbox"
                    checked={ptActive}
                    onChange={(e) => setPtActive(e.target.checked)}
                    className="rounded text-purple-600 accent-purple-600"
                  />
                  <span>Enable PT</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold text-slate-700">PT Registration #</label>
                  <input
                    type="text"
                    value={ptNumber}
                    onChange={(e) => setPtNumber(e.target.value)}
                    placeholder="KL/PT/1234501"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold text-slate-700">Monthly PT Amount (₹)</label>
                  <input
                    type="number"
                    value={ptMonthly}
                    onChange={(e) => setPtMonthly(Number(e.target.value))}
                    placeholder="200"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold text-slate-700">State Jurisdiction</label>
                  <select
                    value={ptState}
                    onChange={(e) => setPtState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="Kerala">Kerala (Slab: ₹200/mo)</option>
                    <option value="Karnataka">Karnataka (Slab: ₹200/mo)</option>
                    <option value="Maharashtra">Maharashtra (Slab: ₹200/mo)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Half-Yearly)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Overall Compliance Status & Verification */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="space-y-1 w-full sm:w-auto">
                <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Overall Compliance Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-800"
                >
                  <option value="Compliant">Compliant</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">Last Verified</div>
                <div className="font-semibold text-slate-800 font-mono text-[11px]">{lastUpdated}</div>
              </div>
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-[11px] cursor-pointer flex items-center gap-1 transition-colors"
                title="Mark verified as of today"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify Today</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Statutory Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
