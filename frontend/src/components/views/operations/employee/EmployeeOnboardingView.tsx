import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { EmployeeSharedHeader } from './EmployeeSharedHeader';
import {
  FileCheck, ShieldCheck, Download, Plus, Check,
  X, Search, User, Printer, FileText, CheckCircle2,
  AlertCircle, UploadCloud, PenTool
} from 'lucide-react';

interface StaffDocuments {
  id: string | number;
  employee_id_str: string;
  name: string;
  role: string;
  joining_date: string;
  aadhaar_status: 'verified' | 'pending';
  aadhaar_num: string;
  pan_status: 'verified' | 'pending';
  pan_num: string;
  license_status: 'verified' | 'pending' | 'not_required';
  bank_status: 'verified' | 'pending';
}

const INITIAL_DOCS: StaffDocuments[] = [
  {
    id: 1,
    employee_id_str: 'EMP-001',
    name: 'Amit Sharma',
    role: 'Field Technician',
    joining_date: '10 Jan 2023',
    aadhaar_status: 'verified',
    aadhaar_num: 'XXXX-XXXX-4821',
    pan_status: 'verified',
    pan_num: 'ABCPS1234D',
    license_status: 'verified',
    bank_status: 'verified',
  },
  {
    id: 2,
    employee_id_str: 'EMP-002',
    name: 'Priya Sharma',
    role: 'Customer Support',
    joining_date: '15 Feb 2023',
    aadhaar_status: 'verified',
    aadhaar_num: 'XXXX-XXXX-7729',
    pan_status: 'verified',
    pan_num: 'BCDPS5678F',
    license_status: 'not_required',
    bank_status: 'verified',
  },
  {
    id: 3,
    employee_id_str: 'EMP-003',
    name: 'Rahul Singh',
    role: 'Plumbing Technician',
    joining_date: '01 May 2023',
    aadhaar_status: 'verified',
    aadhaar_num: 'XXXX-XXXX-9912',
    pan_status: 'pending',
    pan_num: 'Submission awaited',
    license_status: 'verified',
    bank_status: 'verified',
  },
  {
    id: 4,
    employee_id_str: 'EMP-004',
    name: 'Neha Patel',
    role: 'Housekeeper Lead',
    joining_date: '12 Aug 2023',
    aadhaar_status: 'verified',
    aadhaar_num: 'XXXX-XXXX-3345',
    pan_status: 'verified',
    pan_num: 'CDFPS9012G',
    license_status: 'not_required',
    bank_status: 'verified',
  },
  {
    id: 5,
    employee_id_str: 'EMP-005',
    name: 'Arjun Nair',
    role: 'Electrician',
    joining_date: '20 Sep 2023',
    aadhaar_status: 'verified',
    aadhaar_num: 'XXXX-XXXX-6610',
    pan_status: 'verified',
    pan_num: 'EFGPS3456H',
    license_status: 'verified',
    bank_status: 'pending',
  },
  {
    id: 6,
    employee_id_str: 'EMP-006',
    name: 'Sneha Joshi',
    role: 'Team Lead',
    joining_date: '01 Jan 2022',
    aadhaar_status: 'verified',
    aadhaar_num: 'XXXX-XXXX-1120',
    pan_status: 'verified',
    pan_num: 'GHJPS7890J',
    license_status: 'not_required',
    bank_status: 'verified',
  },
];

export const EmployeeOnboardingView: React.FC = () => {
  const { employees, addToast, openPdfEditor } = useQiyamStore();

  const [docsList, setDocsList] = useState<StaffDocuments[]>(INITIAL_DOCS);
  const [search, setSearch] = useState('');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedStaffForLetter, setSelectedStaffForLetter] = useState(docsList[0]);

  // Form for document verification
  const [verifyForm, setVerifyForm] = useState({
    employee_id_str: employees[0]?.employee_id_str || 'EMP-001',
    doc_type: 'pan' as 'pan' | 'bank' | 'license',
    doc_number: '',
  });

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDocsList((prev) =>
      prev.map((d) => {
        if (d.employee_id_str === verifyForm.employee_id_str) {
          if (verifyForm.doc_type === 'pan') {
            return { ...d, pan_status: 'verified', pan_num: verifyForm.doc_number.toUpperCase() };
          }
          if (verifyForm.doc_type === 'bank') {
            return { ...d, bank_status: 'verified' };
          }
          if (verifyForm.doc_type === 'license') {
            return { ...d, license_status: 'verified' };
          }
        }
        return d;
      })
    );
    setIsVerifyModalOpen(false);
    addToast('Staff document verified successfully!', 'success');
  };

  const handlePrintLetter = () => {
    window.print();
  };

  const filtered = docsList.filter((d) => {
    const q = search.toLowerCase().trim();
    if (q) {
      return (
        d.name.toLowerCase().includes(q) ||
        d.employee_id_str.toLowerCase().includes(q) ||
        d.role.toLowerCase().includes(q) ||
        d.pan_num.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingVerificationCount = docsList.filter(
    (d) => d.pan_status === 'pending' || d.bank_status === 'pending' || d.license_status === 'pending'
  ).length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <EmployeeSharedHeader
        title="Onboarding & Staff Documents"
        subtitle="Verify Aadhaar card, PAN card, driving license, bank account details, and generate official joining letters."
        activeSubTab="ops-emp-onboarding"
        primaryActionLabel="Verify Document"
        primaryActionIcon={ShieldCheck}
        onPrimaryAction={() => setIsVerifyModalOpen(true)}
        badgeCount={`${pendingVerificationCount} Pending Verification`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Aadhaar Card Verified</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">100% Verified</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">All 6 staff registered</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">PAN Card Verified</div>
            <div className="text-2xl font-black text-slate-900 mt-1">5 of 6 Staff</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">1 pending submission</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Driving License Verified</div>
            <div className="text-2xl font-black text-purple-600 mt-1">All Field Techs</div>
            <div className="text-[11px] text-purple-600 mt-0.5">Bike/Van driving license OK</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Salary Bank Account</div>
            <div className="text-2xl font-black text-blue-600 mt-1">5 of 6 Verified</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Direct UPI salary payout ready</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff, ID, PAN number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Documents Checklist Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Staff Document Verification Checklist</h3>
              <p className="text-xs text-slate-400">Official government ID proofs and bank accounts</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Joining Date</th>
                  <th className="p-3.5">Aadhaar Card</th>
                  <th className="p-3.5">PAN Card</th>
                  <th className="p-3.5">Driving License</th>
                  <th className="p-3.5">Bank Passbook</th>
                  <th className="p-3.5 text-right">Joining Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{d.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{d.employee_id_str} • {d.role}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{d.joining_date}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-[11px] text-slate-800 font-semibold">{d.aadhaar_num}</span>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-bold">Verified ✔</span>
                    </td>
                    <td className="p-3.5">
                      {d.pan_status === 'verified' ? (
                        <div>
                          <div className="font-mono text-[11px] text-slate-800 font-semibold">{d.pan_num}</div>
                          <span className="text-[9px] text-emerald-700 font-bold">Verified ✔</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                            Pending
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      {d.license_status === 'verified' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified (Bike/Van) ✔
                        </span>
                      ) : d.license_status === 'not_required' ? (
                        <span className="text-[10px] text-slate-400">Office Desk (N/A)</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {d.bank_status === 'verified' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified ✔
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStaffForLetter(d);
                            setIsLetterModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 border border-slate-200/80"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => {
                            openPdfEditor({
                              type: 'staff_letter',
                              title: `Official Staff Joining Letter - ${d.name}`,
                              recipientName: d.name,
                              recipientRole: d.role,
                              recipientId: d.employee_id_str,
                              dateStr: d.joining_date,
                            });
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 border border-indigo-200 shadow-2xs"
                          title="Open in 2026 Drag & Drop PDF Studio"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Edit PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Verify Document Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Verify Staff Document</h3>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Staff Member *</label>
                <select
                  value={verifyForm.employee_id_str}
                  onChange={(e) => setVerifyForm({ ...verifyForm, employee_id_str: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {docsList.map((d) => (
                    <option key={d.id} value={d.employee_id_str}>
                      {d.name} ({d.employee_id_str}) - {d.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Document to Verify *</label>
                <select
                  value={verifyForm.doc_type}
                  onChange={(e) => setVerifyForm({ ...verifyForm, doc_type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="pan">PAN Card (10 Characters)</option>
                  <option value="license">Driving License (State Transport)</option>
                  <option value="bank">Bank Passbook / Cancelled Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Document Number / Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABCDE1234F"
                  value={verifyForm.doc_number}
                  onChange={(e) => setVerifyForm({ ...verifyForm, doc_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Mark as Verified ✔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Joining Letter Modal */}
      {isLetterModalOpen && selectedStaffForLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Official Staff Joining Letter</h3>
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Letterhead Preview */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-4 font-serif">
              <div className="border-b border-slate-300 pb-3 text-center">
                <div className="font-bold text-base text-slate-900 font-sans tracking-wide">QIYAM BUSINESS SOLUTIONS</div>
                <div className="text-[10px] text-slate-500 font-sans">Cyberpark Calicut, Kozhikode, Kerala • Reg. No: KL-08-99234</div>
              </div>

              <div className="flex justify-between font-sans text-[11px] text-slate-600">
                <span>Ref: QIYAM/APPOINT/{selectedStaffForLetter.employee_id_str}</span>
                <span>Date: {selectedStaffForLetter.joining_date}</span>
              </div>

              <div className="font-sans text-xs">
                <div>To,</div>
                <div className="font-bold text-slate-900">{selectedStaffForLetter.name}</div>
                <div className="text-slate-600">{selectedStaffForLetter.role}</div>
                <div className="text-slate-500">Employee ID: {selectedStaffForLetter.employee_id_str}</div>
              </div>

              <div className="font-bold text-center underline font-sans text-xs">
                SUB: OFFICIAL LETTER OF APPOINTMENT
              </div>

              <p className="leading-relaxed">
                Dear {selectedStaffForLetter.name},
              </p>

              <p className="leading-relaxed">
                We are pleased to confirm your appointment with Qiyam Business Solutions as <strong>{selectedStaffForLetter.role}</strong> effective from <strong>{selectedStaffForLetter.joining_date}</strong>. You will be reporting to the Calicut HQ branch.
              </p>

              <p className="leading-relaxed">
                Your duty hours are 9:00 AM to 6:00 PM, Monday through Saturday. All company policies, safety protocols, and attendance punch rules via WhatsApp Geo-Punch apply.
              </p>

              <div className="pt-6 border-t border-slate-300 flex justify-between items-end font-sans text-[11px]">
                <div>
                  <div className="font-bold">Authorised Signatory</div>
                  <div className="text-slate-500">Operations Director</div>
                </div>
                <div className="text-right text-emerald-700 font-bold">
                  ✔ Verified Digital Seal
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLetterModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLetterModalOpen(false);
                  openPdfEditor({
                    type: 'staff_letter',
                    title: `Official Staff Joining Letter - ${selectedStaffForLetter.name}`,
                    recipientName: selectedStaffForLetter.name,
                    recipientRole: selectedStaffForLetter.role,
                    recipientId: selectedStaffForLetter.employee_id_str,
                    dateStr: selectedStaffForLetter.joining_date,
                  });
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>✏️ Edit in PDF Editor</span>
              </button>
              <button
                type="button"
                onClick={handlePrintLetter}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
