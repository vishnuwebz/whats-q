import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EmployeeTaxCompliance } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: EmployeeTaxCompliance | null;
  onSave: (updated: EmployeeTaxCompliance) => void;
}

export const TaxUpdateModal: React.FC<Props> = ({ isOpen, onClose, record, onSave }) => {
  if (!isOpen || !record) return null;

  const [tdsRegime, setTdsRegime] = useState(record.tds_regime || 'New Regime');
  const [estimatedAnnualTax, setEstimatedAnnualTax] = useState(record.estimated_annual_tax || 78000);
  const [monthlyTds, setMonthlyTds] = useState(record.monthly_tds || 6500);
  const [pfNumber, setPfNumber] = useState(record.pf_number || '1002 3456 7890');
  const [esiNumber, setEsiNumber] = useState(record.esi_number || '4400 1234 5678');
  const [ptNumber, setPtNumber] = useState(record.pt_number || 'KL/PT/1234567');
  const [tdsActive, setTdsActive] = useState(record.tds);
  const [pfActive, setPfActive] = useState(record.pf);
  const [esiActive, setEsiActive] = useState(record.esi);
  const [ptActive, setPtActive] = useState(record.pt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EmployeeTaxCompliance = {
      ...record,
      tds: tdsActive,
      pf: pfActive,
      esi: esiActive,
      pt: ptActive,
      status: 'Compliant',
      tds_regime: tdsRegime as any,
      estimated_annual_tax: Number(estimatedAnnualTax),
      monthly_tds: Number(monthlyTds),
      pf_number: pfNumber,
      esi_number: esiNumber,
      pt_number: ptNumber,
      last_updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Statutory Toggles */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase">Applicable Deductions</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                <input
                  type="checkbox"
                  checked={tdsActive}
                  onChange={(e) => setTdsActive(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">TDS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                <input
                  type="checkbox"
                  checked={pfActive}
                  onChange={(e) => setPfActive(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">PF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                <input
                  type="checkbox"
                  checked={esiActive}
                  onChange={(e) => setEsiActive(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">ESI</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                <input
                  type="checkbox"
                  checked={ptActive}
                  onChange={(e) => setPtActive(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">PT</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">TDS Tax Regime</label>
              <select
                value={tdsRegime}
                onChange={(e) => setTdsRegime(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="New Regime">New Tax Regime (Sec 115BAC)</option>
                <option value="Old Regime">Old Tax Regime (With Exemptions)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Monthly TDS Amount (₹)</label>
              <input
                type="number"
                value={monthlyTds}
                onChange={(e) => setMonthlyTds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">PF Number (UAN)</label>
              <input
                type="text"
                value={pfNumber}
                onChange={(e) => setPfNumber(e.target.value)}
                placeholder="1002 3456 7890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">ESI Insurance Number</label>
              <input
                type="text"
                value={esiNumber}
                onChange={(e) => setEsiNumber(e.target.value)}
                placeholder="4400 1234 5678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Professional Tax Registration #</label>
            <input
              type="text"
              value={ptNumber}
              onChange={(e) => setPtNumber(e.target.value)}
              placeholder="KL/PT/1234567"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-700/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
