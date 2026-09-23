import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Users, Wallet, PieChart, Landmark, AlertTriangle, ArrowRight, Search,
  Filter, Eye, MoreVertical, CheckCircle2, ChevronLeft, ChevronRight,
  Calendar, Check, Send, AlertCircle, ArrowLeft, Download, ShieldCheck,
  Clock, IndianRupee, Settings, FileText, CheckCheck, RefreshCw, X, Info,
  ChevronDown, SlidersHorizontal, Edit3, PauseCircle, Plus, UserPlus
} from 'lucide-react';
import { EmployeeSalaryDetail, PayrollRunItem } from '@/types';
import { PayslipModal } from './modals/PayslipModal';
import { RunPayrollReviewModal } from './modals/RunPayrollReviewModal';
import { useQiyamStore } from '@/store/useQiyamStore';
import { DraggableScrollRow } from '@/components/common/DraggableScrollRow';
import { updatePayrollNavigation } from './payrollRouting';

interface Props {
  employees: EmployeeSalaryDetail[];
  onBackToDashboard: () => void;
  onPayrollCompleted: (newRun: PayrollRunItem) => void;
  onAddEmployee?: (newEmp: EmployeeSalaryDetail) => void;
}

export const RunPayrollView: React.FC<Props> = ({
  employees: initialEmployees,
  onBackToDashboard,
  onPayrollCompleted,
  onAddEmployee,
}) => {
  // Master employee list (editable in wizard)
  const [employeesList, setEmployeesList] = useState<EmployeeSalaryDetail[]>(initialEmployees);

  // Stepper state with URL and LocalStorage persistence
  const [currentStep, setCurrentStepState] = useState<number>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get('step');
      if (stepParam && ['1', '2', '3', '4'].includes(stepParam)) {
        return Number(stepParam);
      }
      const saved = localStorage.getItem('whatsq_payroll_run_step');
      if (saved && ['1', '2', '3', '4'].includes(saved)) {
        return Number(saved);
      }
    } catch {}
    return 1;
  });

  const setCurrentStep = useCallback((stepOrFn: number | ((prev: number) => number)) => {
    setCurrentStepState((prev) => {
      const nextStep = typeof stepOrFn === 'function' ? stepOrFn(prev) : stepOrFn;
      try {
        localStorage.setItem('whatsq_payroll_run_step', String(nextStep));
      } catch {}
      updatePayrollNavigation('run-payroll', undefined, { step: nextStep });
      return nextStep;
    });
  }, []);

  useEffect(() => {
    updatePayrollNavigation('run-payroll', undefined, { step: currentStep }, false);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get('step');
      if (stepParam && ['1', '2', '3', '4'].includes(stepParam)) {
        setCurrentStepState(Number(stepParam));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scope filter bar states
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [selectedGroup, setSelectedGroup] = useState('All Groups');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isLoading, setIsLoading] = useState(false);

  // Table controls states
  const [searchQuery, setSearchQuery] = useState('');
  const [tableDeptFilter, setTableDeptFilter] = useState('All Departments');
  const [tableStatusFilter, setTableStatusFilter] = useState('All Status');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>(() => initialEmployees.map((e) => e.id));
  const [sendPayslips, setSendPayslips] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeActionId, setActiveActionId] = useState<string | number | null>(null);

  // Modals state
  const [inspectEmployee, setInspectEmployee] = useState<EmployeeSalaryDetail | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeSalaryDetail | null>(null);
  const [quickAdjustTab, setQuickAdjustTab] = useState<'all' | 'attendance' | 'wages' | 'additions' | 'deductions' | 'profile'>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // Add Employee Modal state
  const storeEmployees = useQiyamStore((state) => state.employees);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmpSelectedStaffId, setNewEmpSelectedStaffId] = useState<string>('custom');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Sales');
  const [newEmpRole, setNewEmpRole] = useState('BDE');
  const [newEmpGross, setNewEmpGross] = useState<number>(30000);
  const [newEmpFullDays, setNewEmpFullDays] = useState<number>(14);
  const [newEmpHalfDays, setNewEmpHalfDays] = useState<number>(0);
  const [newEmpWfhDays, setNewEmpWfhDays] = useState<number>(0);
  const [newEmpPaidLeave, setNewEmpPaidLeave] = useState<number>(0);
  const [newEmpOt, setNewEmpOt] = useState<number>(0);
  const [newEmpExtras, setNewEmpExtras] = useState<number>(0);
  const [newEmpTds, setNewEmpTds] = useState<number>(0);
  const [newEmpOtherDed, setNewEmpOtherDed] = useState<number>(0);

  // Horizontal Table Scroll Navigator state & mouse drag-to-scroll
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const scrollTableBy = (px: number) => {
    tableScrollRef.current?.scrollBy({ left: px, behavior: 'smooth' });
  };

  const scrollToSection = (px: number) => {
    tableScrollRef.current?.scrollTo({ left: px, behavior: 'smooth' });
  };

  const handleTableMouseDown = (e: React.MouseEvent) => {
    if (!tableScrollRef.current) return;
    // Don't drag if clicking buttons, inputs or links
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, textarea')) return;
    setIsDraggingTable(true);
    setDragStartX(e.pageX - tableScrollRef.current.offsetLeft);
    setDragScrollLeft(tableScrollRef.current.scrollLeft);
  };

  const handleTableMouseLeave = () => setIsDraggingTable(false);
  const handleTableMouseUp = () => setIsDraggingTable(false);
  const handleTableMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTable || !tableScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    tableScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Optional column visibility flags
  const [visibleColumns, setVisibleColumns] = useState({
    role: true,
    wfh: true,
    paidLeave: true,
    dailyWage: true,
    otherEarnings: true,
    overtime: true,
    extras: true,
    penalties: true,
    otherDeductions: true,
  });

  // Filtered employees according to scope and search
  const filteredEmployees = useMemo(() => {
    return employeesList.filter((emp) => {
      // Scope department filter
      if (selectedDept !== 'All Departments' && emp.department !== selectedDept) return false;
      // Table department filter
      if (tableDeptFilter !== 'All Departments' && emp.department !== tableDeptFilter) return false;
      // Table status filter
      if (tableStatusFilter !== 'All Status' && emp.status !== tableStatusFilter) return false;
      // Scope payroll group filter
      if (selectedGroup !== 'All Groups' && emp.payroll_group !== selectedGroup) return false;

      // Text search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.employee_id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          (emp.role && emp.role.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [employeesList, selectedDept, tableDeptFilter, tableStatusFilter, selectedGroup, searchQuery]);

  // Paginated employees for the table
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Active selected employees (for processing & calculation)
  const activeSelectedEmployees = useMemo(() => {
    return employeesList.filter((e) => selectedIds.includes(e.id));
  }, [employeesList, selectedIds]);

  // Dynamically computed metrics reflecting all 32 staff
  const summaryKPIs = useMemo(() => {
    // If all are selected, baseline matches screenshot precisely
    const targetGross = activeSelectedEmployees.reduce((sum, e) => sum + (e.gross_wages || e.gross_salary), 0);
    const targetDeductions = activeSelectedEmployees.reduce((sum, e) => sum + (e.deductions || 0), 0);
    const targetNet = targetGross - targetDeductions;
    const targetUnpaid = activeSelectedEmployees.reduce((sum, e) => sum + (e.unpaid_days || 0), 0);
    const targetOT = activeSelectedEmployees.reduce((sum, e) => sum + (e.overtime_amount || 0), 0);
    const targetPaidDays = activeSelectedEmployees.reduce((sum, e) => sum + (e.paid_days || 0), 0);
    const targetHalfDays = activeSelectedEmployees.reduce((sum, e) => sum + (e.half_day || 0), 0);
    const targetLeaves = activeSelectedEmployees.reduce((sum, e) => sum + (e.paid_leave || 0), 0);

    return {
      totalEmployees: activeSelectedEmployees.length,
      grossWages: targetGross,
      totalDeductions: targetDeductions,
      netPay: targetNet,
      unpaidDays: Math.round(targetUnpaid * 10) / 10,
      overtimeAmount: targetOT,
      workingDays: 26,
      paidDays: Math.round(targetPaidDays * 10) / 10,
      paidLeaveDays: targetLeaves,
      halfDays: targetHalfDays,
      overtimeHours: 86,
    };
  }, [activeSelectedEmployees]);

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle individual select
  const handleToggleSelect = (id: string | number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Reload employees handler
  const handleReloadEmployees = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerToast(`Loaded 32 active employees for ${selectedMonth}`);
    }, 600);
  };

  // Save draft handler
  const handleSaveDraft = () => {
    triggerToast(`Payroll draft saved for ${selectedMonth} (${activeSelectedEmployees.length} staff)`);
  };

  // Final confirmation
  const handleFinalConfirm = () => {
    setIsReviewModalOpen(false);
    const newRun: PayrollRunItem = {
      id: Date.now(),
      month: selectedMonth,
      employees_count: activeSelectedEmployees.length,
      gross_amount: summaryKPIs.grossWages,
      deductions: summaryKPIs.totalDeductions,
      net_amount: summaryKPIs.netPay,
      payment_status: 'Paid',
      processed_on: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: `${selectedMonth} monthly salary cycle disbursed via HDFC Bank Corporate NEFT/RTGS batch.`,
    };
    onPayrollCompleted(newRun);
    setCurrentStep(4);
    triggerToast(`Payroll for ${selectedMonth} authorized and disbursed successfully!`);
  };

  // Export full 22-column CSV
  const handleExportCsv = () => {
    const headers = [
      '#',
      'Employee ID',
      'Employee Name',
      'Role',
      'Department',
      'Full Day',
      'Half Day',
      'WFH Days',
      'Paid Leave',
      'Paid Days',
      'Unpaid Days',
      'Daily Wage',
      'Gross Wages',
      'Earned Wages',
      'Other Earnings',
      'Overtime',
      'Extras',
      'Gross Earnings',
      'TDS',
      'Penalties',
      'Other Deductions',
      'Finalized Amount',
      'Status'
    ];

    const rows = filteredEmployees.map((e, idx) => [
      idx + 1,
      `"${e.employee_id}"`,
      `"${e.name}"`,
      `"${e.role || 'BDE'}"`,
      `"${e.department}"`,
      e.full_day ?? 13,
      e.half_day ?? 0,
      e.wfh_days ?? 0,
      e.paid_leave ?? 0,
      e.paid_days ?? 14,
      e.unpaid_days ?? 2,
      e.daily_wage ?? Math.round((e.gross_salary || 30000) / 26),
      e.gross_wages ?? e.gross_salary,
      e.earned_wages ?? Math.round(((e.gross_salary || 30000) / 26) * (e.paid_days || 14)),
      e.other_earnings ?? 0,
      e.overtime_amount ?? 0,
      e.extras ?? 0,
      e.gross_earnings ?? e.gross_salary,
      e.tds ?? Math.round((e.deductions || 2000) * 0.4),
      e.penalties ?? 0,
      e.other_deductions ?? Math.round((e.deductions || 2000) * 0.6),
      e.finalized_amount ?? e.net_pay,
      `"${e.status || 'Ready'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `qiyam_payroll_overview_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Payroll matrix exported as CSV');
  };

  const handleDownloadAllPayslips = () => {
    const payslipsHtml = employeesList.map((emp) => {
      const basic = Math.round(emp.gross_salary * 0.4);
      const hra = Math.round(emp.gross_salary * 0.2);
      const conveyance = 3000;
      const special = emp.gross_salary - basic - hra - conveyance;
      const pf = Math.round(basic * 0.12);
      const esi = emp.gross_salary <= 21000 ? Math.round(emp.gross_salary * 0.0075) : 0;
      const pt = 200;
      const tds = emp.tds || 1500;
      const totalDed = pf + esi + pt + tds;
      const netPay = emp.gross_salary - totalDed;

      return `
      <div class="payslip-page" style="page-break-after: always; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; margin-bottom: 24px; background: #fff;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a;">QIYAM BUSINESS SOLUTIONS LLP</div>
            <div style="font-size: 11px; color: #64748b;">Mavoor Road, Kozhikode, Kerala — 673004</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #059669;">PAYSLIP — ${selectedMonth}</div>
            <div style="font-size: 10px; color: #64748b;">Ref: SAL-${selectedMonth.toUpperCase().replace(/\s+/g, '-')}-${emp.employee_id}</div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 11px; margin-bottom: 16px;">
          <div><span style="color: #64748b; font-size: 10px; display: block;">NAME</span><strong>${emp.name}</strong></div>
          <div><span style="color: #64748b; font-size: 10px; display: block;">EMP ID</span><strong>${emp.employee_id}</strong></div>
          <div><span style="color: #64748b; font-size: 10px; display: block;">DEPARTMENT</span><strong>${emp.department}</strong></div>
          <div><span style="color: #64748b; font-size: 10px; display: block;">DISBURSEMENT</span><strong style="color: #059669;">Bank Transfer</strong></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 6px 8px; text-align: left;">Earnings</th>
              <th style="padding: 6px 8px; text-align: right;">Amount (₹)</th>
              <th style="padding: 6px 8px; text-align: left;">Deductions</th>
              <th style="padding: 6px 8px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 8px;">Basic Salary</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${basic.toLocaleString()}</td>
              <td style="padding: 6px 8px;">Provident Fund (PF)</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${pf.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">HRA</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${hra.toLocaleString()}</td>
              <td style="padding: 6px 8px;">TDS (Income Tax)</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${tds.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Conveyance</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${conveyance.toLocaleString()}</td>
              <td style="padding: 6px 8px;">Professional Tax (PT)</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${pt.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Special Allowance</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">₹${special.toLocaleString()}</td>
              <td style="padding: 6px 8px;">ESI</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace;">${esi > 0 ? `₹${esi.toLocaleString()}` : '—'}</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 700; border-top: 1px solid #cbd5e1;">
              <td style="padding: 6px 8px;">Gross Earnings</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace; color: #059669;">₹${emp.gross_salary.toLocaleString()}</td>
              <td style="padding: 6px 8px;">Total Deductions</td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace; color: #e11d48;">₹${totalDed.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <div style="background: #ecfdf5; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div><span style="font-size: 10px; color: #047857; text-transform: uppercase; font-weight: 700;">Net Take-Home Pay</span><div style="font-size: 16px; font-weight: 900; font-family: monospace; color: #064e3b;">₹${netPay.toLocaleString()}</div></div>
          <div style="font-size: 10px; color: #047857; font-weight: 600;">✓ Digitally Certified by Qiyam Payroll</div>
        </div>
      </div>
      `;
    }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Qiyam Business Solutions - Batch Payslips - ${selectedMonth}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; color: #0f172a; }
    @media print {
      body { background: #fff; padding: 0; }
      .payslip-page { border: none !important; margin-bottom: 0 !important; page-break-after: always !important; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto;">
    ${payslipsHtml}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qiyam_batch_payslips_${selectedMonth.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Consolidated batch payslips downloaded for all ${employeesList.length} employees!`);
  };

  // Handle picking registered staff from directory
  const handleSelectStaff = (staffId: string) => {
    setNewEmpSelectedStaffId(staffId);
    if (staffId === 'custom') {
      setNewEmpName('');
      setNewEmpId(`EMP0${employeesList.length + 1}`);
      return;
    }
    const staff = storeEmployees.find((e) => String(e.id) === staffId || e.employee_id_str === staffId);
    if (staff) {
      setNewEmpName(staff.name);
      setNewEmpId(staff.employee_id_str || `EMP0${staff.id}`);
      if (staff.department) setNewEmpDept(staff.department);
      if (staff.role) setNewEmpRole(staff.role);
    }
  };

  // Add new employee to active payroll run
  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const daily = Math.round(newEmpGross / 26);
    const paid = Number(newEmpFullDays) + (Number(newEmpHalfDays) * 0.5) + Number(newEmpWfhDays) + Number(newEmpPaidLeave);
    const unpaid = Math.max(0, 16 - paid);
    const earned = Math.round(daily * paid);
    const grossEarn = earned + Number(newEmpOt) + Number(newEmpExtras);
    const totalDed = Number(newEmpTds) + Number(newEmpOtherDed);
    const net = grossEarn - totalDed;

    const newEmpRecord: EmployeeSalaryDetail = {
      id: Date.now(),
      employee_id: newEmpId.trim() || `EMP0${employeesList.length + 1}`,
      name: newEmpName.trim(),
      email: `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@qiyam.com`,
      department: newEmpDept,
      payroll_group: `${newEmpDept} Team`,
      role: newEmpRole,
      gross_salary: newEmpGross,
      gross_wages: newEmpGross,
      daily_wage: daily,
      full_day: Number(newEmpFullDays),
      half_day: Number(newEmpHalfDays),
      wfh_days: Number(newEmpWfhDays),
      paid_leave: Number(newEmpPaidLeave),
      paid_days: paid,
      unpaid_days: unpaid,
      earned_wages: earned,
      overtime_amount: Number(newEmpOt),
      extras: Number(newEmpExtras),
      gross_earnings: grossEarn,
      tds: Number(newEmpTds),
      penalties: 0,
      other_deductions: Number(newEmpOtherDed),
      deductions: totalDed,
      net_pay: net,
      finalized_amount: net,
      status: 'Ready',
    };

    setEmployeesList((prev) => [newEmpRecord, ...prev]);
    setSelectedIds((prev) => [newEmpRecord.id, ...prev]);
    if (onAddEmployee) {
      onAddEmployee(newEmpRecord);
    }
    setIsAddEmployeeOpen(false);
    triggerToast(`Added ${newEmpRecord.name} (${newEmpRecord.employee_id}) to ${selectedMonth} payroll!`);

    // Reset form
    setNewEmpName('');
    setNewEmpId('');
  };

  // Quick adjust save handler
  const handleSaveQuickAdjust = (updated: EmployeeSalaryDetail) => {
    // Recalculate derived fields
    const baseGross = Number(updated.gross_wages) || Number(updated.gross_salary) || 30000;
    const daily = Number(updated.daily_wage) || Math.round(baseGross / 26);
    const paid = (Number(updated.full_day) || 0) + ((Number(updated.half_day) || 0) * 0.5) + (Number(updated.paid_leave) || 0);
    const unpaid = updated.unpaid_days !== undefined && updated.unpaid_days !== null
      ? Number(updated.unpaid_days)
      : Math.max(0, 16 - paid);
    const earned = Number(updated.earned_wages) !== undefined && Number(updated.earned_wages) > 0
      ? Number(updated.earned_wages)
      : Math.round(daily * paid);
    const grossEarn = earned + (Number(updated.other_earnings) || 0) + (Number(updated.overtime_amount) || 0) + (Number(updated.extras) || 0);
    const totalDed = (Number(updated.tds) || 0) + (Number(updated.penalties) || 0) + (Number(updated.other_deductions) || 0);
    const finalized = grossEarn - totalDed;

    const refreshed: EmployeeSalaryDetail = {
      ...updated,
      name: updated.name.trim() || 'Employee',
      employee_id: updated.employee_id.trim() || 'EMP',
      department: updated.department || 'Sales',
      role: updated.role || 'Staff',
      status: updated.status || 'Ready',
      gross_wages: baseGross,
      gross_salary: baseGross,
      daily_wage: daily,
      paid_days: paid,
      unpaid_days: unpaid,
      earned_wages: earned,
      gross_earnings: grossEarn,
      deductions: totalDed,
      net_pay: finalized,
      finalized_amount: finalized,
      bank_account: updated.bank_account || '',
      pan_number: updated.pan_number || '',
      uan_number: updated.uan_number || '',
    };

    setEmployeesList((prev) => prev.map((e) => (e.id === refreshed.id ? refreshed : e)));
    setEditingEmployee(null);
    triggerToast(`Updated complete parameters & calculations for ${refreshed.name}!`);
  };

  // Avatar background colors
  const getAvatarColor = (name: string, index: number) => {
    const palette = [
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-sky-100 text-sky-700 border-sky-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-teal-100 text-teal-700 border-teal-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-rose-100 text-rose-700 border-rose-200',
    ];
    return palette[index % palette.length];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 4-Step Stepper (Connected & Freely Toggleable) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1: Select Period */}
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-hidden group"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep <= 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <span className={`font-bold text-xs ${currentStep <= 2 ? 'text-blue-700' : 'text-slate-600'}`}>
              Select Period
            </span>
          </button>
          <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          {/* Step 2: Review & Edit */}
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-hidden group"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep <= 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <span className={`font-bold text-xs ${currentStep <= 2 ? 'text-blue-700' : 'text-slate-600'}`}>
              Review & Edit
            </span>
          </button>
          <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          {/* Step 3: Confirm & Process */}
          <button
            onClick={() => setCurrentStep(3)}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-hidden group"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep === 3
                  ? 'bg-blue-600 text-white shadow-xs'
                  : currentStep > 3
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {currentStep > 3 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
            </div>
            <span className={`font-bold text-xs ${currentStep === 3 ? 'text-blue-700' : 'text-slate-600'}`}>
              Confirm & Process
            </span>
          </button>
          <div className={`h-0.5 flex-1 mx-3 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />

          {/* Step 4: Complete */}
          <button
            onClick={() => setCurrentStep(4)}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-hidden group"
          >
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                currentStep === 4
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              4
            </div>
            <span className={`font-bold text-xs ${currentStep === 4 ? 'text-blue-700' : 'text-slate-600'}`}>
              Complete
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1 & 2: FULL COMPREHENSIVE OVERVIEW (Matching media_1790147717219.jpg) */}
      {/* ========================================================================= */}
      {currentStep <= 2 && (
        <div className="space-y-4">
          {/* 1. Scope Filter Row */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              {/* Payroll Month */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Payroll Month</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  >
                    <option>September 2026</option>
                    <option>August 2026</option>
                    <option>July 2026</option>
                    <option>May 2024</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Payroll Group */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Payroll Group</label>
                <div className="relative">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  >
                    <option>All Groups</option>
                    <option>Sales Team</option>
                    <option>Technology Team</option>
                    <option>Operations Team</option>
                    <option>Marketing Team</option>
                    <option>HR & Admin</option>
                    <option>Management</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Department</label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  >
                    <option>All Departments</option>
                    <option>Sales</option>
                    <option>Technology</option>
                    <option>Operations</option>
                    <option>Marketing</option>
                    <option>HR</option>
                    <option>Finance</option>
                    <option>Management</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Employment Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Employment Type</label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                  >
                    <option>All Types</option>
                    <option>Full-Time</option>
                    <option>Probation</option>
                    <option>Contractors</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Load Employees Button */}
              <div>
                <button
                  type="button"
                  onClick={handleReloadEmployees}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-[34px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Load Employees</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Employees */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block">Total Employees</span>
                <span className="text-lg font-black text-slate-900 font-mono leading-none">{summaryKPIs.totalEmployees}</span>
              </div>
            </div>

            {/* Gross Wages */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block">Gross Wages</span>
                <span className="text-lg font-black text-slate-900 font-mono leading-none">₹{summaryKPIs.grossWages.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total Deductions */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block">Total Deductions</span>
                <span className="text-lg font-black text-slate-900 font-mono leading-none">₹{summaryKPIs.totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block">Net Pay</span>
                <span className="text-lg font-black text-slate-900 font-mono leading-none">₹{summaryKPIs.netPay.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Unpaid Days */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block">Unpaid Days</span>
                <span className="text-lg font-black text-slate-900 font-mono leading-none">{summaryKPIs.unpaidDays}</span>
              </div>
            </div>

            {/* Overtime Amount */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block">Overtime Amount</span>
                <span className="text-lg font-black text-slate-900 font-mono leading-none">₹{summaryKPIs.overtimeAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* 3. Table Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, employee ID or department..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Right side filter actions */}
            <div className="flex items-center flex-wrap gap-2">
              <select
                value={tableDeptFilter}
                onChange={(e) => {
                  setTableDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option>All Departments</option>
                <option>Sales</option>
                <option>Technology</option>
                <option>Operations</option>
                <option>Marketing</option>
                <option>HR</option>
                <option>Finance</option>
                <option>Management</option>
              </select>

              <select
                value={tableStatusFilter}
                onChange={(e) => {
                  setTableStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option>All Status</option>
                <option>Ready</option>
                <option>Pending</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTableDeptFilter('All Departments');
                  setTableStatusFilter('All Status');
                }}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>

              <button
                type="button"
                onClick={() => setIsColumnSettingsOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Column Settings</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewEmpName('');
                  setNewEmpId(`EMP0${employeesList.length + 1}`);
                  setIsAddEmployeeOpen(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Employee</span>
              </button>
            </div>
          </div>

          {/* Modern Horizontal Scroll Navigator & Column Section Jump Bar */}
          <div className="bg-slate-50/80 p-2.5 px-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-1 min-w-[280px] overflow-hidden">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Jump To:</span>
              </span>
              <DraggableScrollRow showArrows={false} fadeEdges={true} className="flex-1" wheelMultiplier={1.2}>
                <button
                  type="button"
                  onClick={() => scrollToSection(0)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>1. Employee Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(280)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>2. Attendance Days</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(680)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>3. Wages & Earnings</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(1080)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>4. Deductions & TDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection(1500)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>5. Net Payout & Actions</span>
                </button>
              </DraggableScrollRow>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Drag table to pan or:
              </span>
              <button
                type="button"
                onClick={() => scrollTableBy(-350)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                title="Scroll Left (◄)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Scroll Left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTableBy(350)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
                title="Scroll Right (►)"
              >
                <span>Scroll Right</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4. Master 22-Column Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div
              ref={tableScrollRef}
              onMouseDown={handleTableMouseDown}
              onMouseLeave={handleTableMouseLeave}
              onMouseUp={handleTableMouseUp}
              onMouseMove={handleTableMouseMove}
              className={`overflow-x-auto max-w-full ${isDraggingTable ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            >
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse min-w-[1300px]">
                <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center sticky left-0 bg-slate-50 z-10 border-r border-slate-200/70">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onChange={handleSelectAll}
                        className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-2.5 text-center w-8 text-slate-400">#</th>
                    <th className="py-2.5 px-3 min-w-[170px] sticky left-8 bg-slate-50 z-10 border-r border-slate-200/70">
                      Employee
                    </th>
                    {visibleColumns.role && <th className="py-2.5 px-3">Role</th>}
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-2.5 text-center">Full Day</th>
                    <th className="py-2.5 px-2.5 text-center">Half Day</th>
                    {visibleColumns.wfh && <th className="py-2.5 px-2.5 text-center">WFH Days</th>}
                    {visibleColumns.paidLeave && <th className="py-2.5 px-2.5 text-center">Paid Leave</th>}
                    <th className="py-2.5 px-3 text-center bg-emerald-50/80 text-emerald-800 font-bold border-x border-emerald-200/60">
                      Paid Days
                    </th>
                    <th className="py-2.5 px-3 text-center bg-rose-50/80 text-rose-800 font-bold border-r border-rose-200/60">
                      Unpaid Days
                    </th>
                    {visibleColumns.dailyWage && <th className="py-2.5 px-3 text-right min-w-[95px]">Daily Wage</th>}
                    <th className="py-2.5 px-3 text-right min-w-[105px]">Gross Wages</th>
                    <th className="py-2.5 px-3 text-right min-w-[105px]">Earned Wages</th>
                    {visibleColumns.otherEarnings && (
                      <th className="py-2.5 px-3 text-right min-w-[110px]">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Other Earnings <Info className="w-3 h-3 text-slate-400" />
                        </span>
                      </th>
                    )}
                    {visibleColumns.overtime && <th className="py-2.5 px-3 text-right min-w-[95px]">Overtime</th>}
                    {visibleColumns.extras && <th className="py-2.5 px-3 text-right min-w-[90px]">Extras</th>}
                    <th className="py-2.5 px-3 text-right min-w-[115px]">
                      <span className="inline-flex items-center gap-1 justify-end">
                        Gross Earnings <Info className="w-3 h-3 text-slate-400" />
                      </span>
                    </th>
                    <th className="py-2.5 px-3 text-right min-w-[85px]">TDS</th>
                    {visibleColumns.penalties && <th className="py-2.5 px-3 text-right min-w-[90px]">Penalties</th>}
                    {visibleColumns.otherDeductions && (
                      <th className="py-2.5 px-3 text-right min-w-[115px]">
                        <span className="inline-flex items-center gap-1 justify-end">
                          Other Deductions <Info className="w-3 h-3 text-slate-400" />
                        </span>
                      </th>
                    )}
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-100/60 min-w-[130px]">
                      <span className="inline-flex items-center gap-1 justify-end">
                        Finalized Amount <Info className="w-3 h-3 text-slate-400" />
                      </span>
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[80px]">Status</th>
                    <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-50 z-20 border-l border-slate-200/70 min-w-[90px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedEmployees.map((emp, idx) => {
                    const globalIdx = (currentPage - 1) * pageSize + idx;
                    const isSelected = selectedIds.includes(emp.id);
                    const isActionOpen = activeActionId === emp.id;
                    const isLastRows = idx >= paginatedEmployees.length - 2 && paginatedEmployees.length > 3;

                    return (
                      <tr
                        key={emp.id}
                        className={`transition-colors ${
                          isActionOpen
                            ? 'relative z-40 bg-blue-50/25'
                            : isSelected
                            ? 'bg-blue-50/15 hover:bg-blue-50/30'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3 text-center sticky left-0 bg-white z-10 border-r border-slate-100">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(emp.id)}
                            className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                          />
                        </td>

                        {/* # Row Index */}
                        <td className="py-2 px-2.5 text-center text-slate-400 font-mono text-[11px]">
                          {globalIdx + 1}
                        </td>

                        {/* Employee Avatar + Name + ID */}
                        <td className="py-2 px-3 sticky left-8 bg-white z-10 border-r border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] border shrink-0 ${getAvatarColor(
                                emp.name,
                                globalIdx
                              )}`}
                            >
                              {getInitials(emp.name)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">{emp.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                                {emp.employee_id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        {visibleColumns.role && (
                          <td className="py-2 px-3 text-slate-600 font-medium">{emp.role || 'BDE'}</td>
                        )}

                        {/* Department */}
                        <td className="py-2 px-3 font-medium text-slate-700">{emp.department}</td>

                        {/* Full Day */}
                        <td className="py-2 px-2.5 text-center font-mono">{emp.full_day ?? 13}</td>

                        {/* Half Day */}
                        <td className="py-2 px-2.5 text-center font-mono">{emp.half_day ?? 0}</td>

                        {/* WFH Days */}
                        {visibleColumns.wfh && (
                          <td className="py-2 px-2.5 text-center font-mono">{emp.wfh_days ?? 0}</td>
                        )}

                        {/* Paid Leave */}
                        {visibleColumns.paidLeave && (
                          <td className="py-2 px-2.5 text-center font-mono">{emp.paid_leave ?? 0}</td>
                        )}

                        {/* Paid Days (Highlighted Green Column) */}
                        <td className="py-2 px-3 text-center bg-emerald-50/70 border-x border-emerald-100 font-bold text-emerald-800 font-mono">
                          {emp.paid_days ?? 14}
                        </td>

                        {/* Unpaid Days (Highlighted Red Column) */}
                        <td className="py-2 px-3 text-center bg-rose-50/70 border-r border-rose-100 font-bold text-rose-800 font-mono">
                          {emp.unpaid_days ?? 2}
                        </td>

                        {/* Daily Wage */}
                        {visibleColumns.dailyWage && (
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            ₹{(emp.daily_wage || Math.round((emp.gross_salary || 30000) / 26)).toLocaleString('en-IN')}
                          </td>
                        )}

                        {/* Gross Wages */}
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                          ₹{(emp.gross_wages || emp.gross_salary).toLocaleString('en-IN')}
                        </td>

                        {/* Earned Wages */}
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                          ₹{(emp.earned_wages || Math.round(((emp.gross_salary || 30000) / 26) * (emp.paid_days || 14))).toLocaleString('en-IN')}
                        </td>

                        {/* Other Earnings */}
                        {visibleColumns.otherEarnings && (
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            ₹{(emp.other_earnings || 0).toLocaleString('en-IN')}
                          </td>
                        )}

                        {/* Overtime */}
                        {visibleColumns.overtime && (
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            ₹{(emp.overtime_amount || 0).toLocaleString('en-IN')}
                          </td>
                        )}

                        {/* Extras */}
                        {visibleColumns.extras && (
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            ₹{(emp.extras || 0).toLocaleString('en-IN')}
                          </td>
                        )}

                        {/* Gross Earnings */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{(emp.gross_earnings || emp.earned_wages || emp.gross_salary).toLocaleString('en-IN')}
                        </td>

                        {/* TDS */}
                        <td className="py-2 px-3 text-right font-mono text-slate-700">
                          ₹{(emp.tds || Math.round((emp.deductions || 2000) * 0.4)).toLocaleString('en-IN')}
                        </td>

                        {/* Penalties */}
                        {visibleColumns.penalties && (
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            ₹{(emp.penalties || 0).toLocaleString('en-IN')}
                          </td>
                        )}

                        {/* Other Deductions */}
                        {visibleColumns.otherDeductions && (
                          <td className="py-2 px-3 text-right font-mono text-rose-600 font-semibold">
                            ₹{(emp.other_deductions || Math.round((emp.deductions || 2000) * 0.6)).toLocaleString('en-IN')}
                          </td>
                        )}

                        {/* Finalized Amount */}
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900 bg-slate-50/50">
                          ₹{(emp.finalized_amount || emp.net_pay).toLocaleString('en-IN')}
                        </td>

                        {/* Status Badge */}
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              emp.status === 'Ready'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {emp.status || 'Ready'}
                          </span>
                        </td>

                        {/* Actions Column (Sticky Right with Elevated Z-Index When Open) */}
                        <td
                          className={`py-2 px-3 text-center sticky right-0 bg-white border-l border-slate-100 transition-all ${
                            isActionOpen ? 'z-40 shadow-xs' : 'z-10'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {/* 1-Click Quick View Payslip Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectEmployee(emp);
                                setActiveActionId(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer group"
                              title="View Official Payslip"
                            >
                              <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            </button>

                            {/* More Actions Trigger */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionId(isActionOpen ? null : emp.id);
                                }}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                  isActionOpen
                                    ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-2xs'
                                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                                title="Employee Payroll Actions"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {/* Click-away backdrop overlay */}
                              {isActionOpen && (
                                <div
                                  className="fixed inset-0 z-30 bg-transparent cursor-default"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionId(null);
                                  }}
                                />
                              )}

                              {/* Design-Optimized Actions Menu Dropdown */}
                              {isActionOpen && (
                                <div
                                  className={`absolute right-0 ${
                                    isLastRows ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  } w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 text-left space-y-1 animate-in fade-in zoom-in-95 duration-150`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Employee Mini Card Header */}
                                  <div className="px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1.5">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="font-bold text-xs text-slate-900 truncate">{emp.name}</span>
                                      <span className="text-[10px] font-mono font-black text-emerald-700 shrink-0">
                                        ₹{(emp.finalized_amount || emp.net_pay).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
                                      <span>{emp.employee_id} • {emp.department}</span>
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                          emp.status === 'Ready'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}
                                      >
                                        {emp.status || 'Ready'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Action 1: View Official Payslip */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInspectEmployee(emp);
                                      setActiveActionId(null);
                                    }}
                                    className="w-full px-2.5 py-2 text-left hover:bg-blue-50/80 rounded-xl flex items-center gap-2.5 group cursor-pointer transition-colors"
                                  >
                                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                                      <Eye className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-slate-800 group-hover:text-blue-700">
                                        View Official Payslip
                                      </div>
                                      <div className="text-[10px] text-slate-400">Preview & PDF compensation breakdown</div>
                                    </div>
                                  </button>

                                  {/* Action 2: Quick Adjust Values */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingEmployee(emp);
                                      setActiveActionId(null);
                                    }}
                                    className="w-full px-2.5 py-2 text-left hover:bg-amber-50/80 rounded-xl flex items-center gap-2.5 group cursor-pointer transition-colors"
                                  >
                                    <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-slate-800 group-hover:text-amber-700">
                                        Quick Adjust Values
                                      </div>
                                      <div className="text-[10px] text-slate-400">Edit attendance, overtime & deductions</div>
                                    </div>
                                  </button>

                                  <div className="border-t border-slate-100 my-1" />

                                  {/* Action 3: Hold / Include in Batch */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleToggleSelect(emp.id);
                                      setActiveActionId(null);
                                      triggerToast(
                                        `${emp.name} ${isSelected ? 'held / excluded from batch' : 'included in batch'}.`
                                      );
                                    }}
                                    className={`w-full px-2.5 py-2 text-left rounded-xl flex items-center gap-2.5 group cursor-pointer transition-colors ${
                                      isSelected ? 'hover:bg-rose-50/80' : 'hover:bg-emerald-50/80'
                                    }`}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                                        isSelected
                                          ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                                          : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                                      }`}
                                    >
                                      {isSelected ? (
                                        <PauseCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div
                                        className={`font-bold text-xs ${
                                          isSelected
                                            ? 'text-slate-800 group-hover:text-rose-700'
                                            : 'text-slate-800 group-hover:text-emerald-700'
                                        }`}
                                      >
                                        {isSelected ? 'Hold Disbursement' : 'Include in Batch'}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {isSelected
                                          ? 'Exclude from current NEFT transfer run'
                                          : 'Re-enable for payroll credit'}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            <div className="p-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Showing {filteredEmployees.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredEmployees.length)} of {filteredEmployees.length} employees
              </span>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  &gt;
                </button>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={32}>All / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Bottom Payroll Calculation Summary (September 2026) Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left stats pills */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800">
                  Payroll Calculation Summary ({selectedMonth})
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Total Working Days */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight">Total Working Days</span>
                      <span className="text-xs font-black text-slate-900 font-mono">26</span>
                    </div>
                  </div>

                  {/* Total Paid Days */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight">Total Paid Days</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{summaryKPIs.paidDays}</span>
                    </div>
                  </div>

                  {/* Total Unpaid Days */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-rose-50/70 border border-rose-100 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight">Total Unpaid Days</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{summaryKPIs.unpaidDays}</span>
                    </div>
                  </div>

                  {/* Paid Leave Days */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-50/70 border border-purple-100 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight">Paid Leave Days</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{summaryKPIs.paidLeaveDays}</span>
                    </div>
                  </div>

                  {/* Half Days */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight">Half Days</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{summaryKPIs.halfDays}</span>
                    </div>
                  </div>

                  {/* Overtime Hours */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-sky-50/70 border border-sky-100 rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight">Overtime Hours</span>
                      <span className="text-xs font-black text-slate-900 font-mono">{summaryKPIs.overtimeHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Confirmation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Save as Draft</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CONFIRM & PROCESS (Review Deductions, Compliance, Bank Batch)       */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-5 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3 of 4</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Confirm {selectedMonth} Payroll Batch Execution
                </h3>
                <p className="text-xs text-slate-500">
                  Review statutory deductions, bank accounts, and authorization parameters before disbursement.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Net Payout Required</span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  ₹{summaryKPIs.netPay.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Batch Key Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold text-[11px]">Included Employees</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
                  {summaryKPIs.totalEmployees}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">100% attendance verified</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold text-[11px]">Gross Total Earnings</span>
                <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
                  ₹{summaryKPIs.grossWages.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">Fixed + Overtime + Extras</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-semibold text-[11px]">Total Deductions</span>
                <span className="text-xl font-black text-rose-600 font-mono mt-0.5 block">
                  -₹{summaryKPIs.totalDeductions.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">TDS, PF, ESI & PT</span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block font-bold text-[11px]">Net Bank Transfer</span>
                <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">
                  ₹{summaryKPIs.netPay.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Ready for NEFT batch credit</span>
              </div>
            </div>

            {/* Statutory Compliance Audit Checklist */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Statutory Compliance & Bank Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Attendance & Leaves Factored</span>
                    <span className="text-slate-500 text-[11px]">
                      26 working days, {summaryKPIs.unpaidDays} unpaid days deducted, {summaryKPIs.paidLeaveDays} paid leaves factored.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Income Tax TDS Verified</span>
                    <span className="text-slate-500 text-[11px]">
                      TDS computed under New Regime & Old Regime with Form 24Q compliance.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Bank Account Validation</span>
                    <span className="text-slate-500 text-[11px]">
                      31 accounts verified with IFSC checksum; 1 pending verification auto-held.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">HDFC Corporate NEFT Batch Ready</span>
                    <span className="text-slate-500 text-[11px]">
                      Debit Account: HDFC Bank A/C ••••9812 (Available: ₹48,20,000).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payslips Dispatch Option */}
            <label className="flex items-center gap-3 cursor-pointer bg-blue-50/60 border border-blue-200/70 p-3.5 rounded-xl select-none">
              <input
                type="checkbox"
                checked={sendPayslips}
                onChange={(e) => setSendPayslips(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  Email PDF Payslips & Send WhatsApp Notifications
                </span>
                <span className="text-[11px] text-slate-500">
                  Sends encrypted salary slips to employees instantly upon batch authorization.
                </span>
              </div>
            </label>

            {/* Step 3 Action Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                &larr; Back to Employee Overview
              </button>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <span>Authorize & Disburse Payroll (₹{summaryKPIs.netPay.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: COMPLETE (Success Confirmation, Bank CSV, Payslips Distribution)  */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-5 max-w-3xl mx-auto">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
              <CheckCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Batch Successfully Executed
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {selectedMonth} Payroll Disbursed!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All {summaryKPIs.totalEmployees} employees credited via HDFC Bank Corporate NEFT batch. Digital payslips generated.
              </p>
            </div>

            {/* Key Receipt Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Disbursement ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs">DISB-2026-SEP-9812</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Net Disbursed</span>
                <span className="font-mono font-black text-emerald-600 text-xs">
                  ₹{summaryKPIs.netPay.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Employees Credited</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {summaryKPIs.totalEmployees} of {summaryKPIs.totalEmployees} Staff
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Reference</span>
                <span className="font-mono font-bold text-blue-600 text-xs">HDFC-RTGS-98234-K10</span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Download Bank Batch CSV</span>
                    <span className="text-[10px] text-slate-400">HDFC Corporate Banking compatible format</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleDownloadAllPayslips}
                className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Download All Payslips (ZIP)</span>
                    <span className="text-[10px] text-slate-400">Password protected PDF statements</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Back to dashboard */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
              >
                &larr; Back to Overview Matrix
              </button>

              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer text-xs"
              >
                <span>Return to Payroll Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COLUMN SETTINGS                                                    */}
      {/* ========================================================================= */}
      {isColumnSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Customize Payroll Matrix Columns</h3>
              </div>
              <button
                onClick={() => setIsColumnSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Select which metrics to display in the master employee payroll matrix.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'role', label: 'Role' },
                { key: 'wfh', label: 'WFH Days' },
                { key: 'paidLeave', label: 'Paid Leave' },
                { key: 'dailyWage', label: 'Daily Wage' },
                { key: 'otherEarnings', label: 'Other Earnings' },
                { key: 'overtime', label: 'Overtime' },
                { key: 'extras', label: 'Extras' },
                { key: 'penalties', label: 'Penalties' },
                { key: 'otherDeductions', label: 'Other Deductions' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[key as keyof typeof visibleColumns]}
                    onChange={(e) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">{label}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setVisibleColumns({
                    role: true,
                    wfh: true,
                    paidLeave: true,
                    dailyWage: true,
                    otherEarnings: true,
                    overtime: true,
                    extras: true,
                    penalties: true,
                    otherDeductions: true,
                  })
                }
                className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsColumnSettingsOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD EMPLOYEE TO ACTIVE PAYROLL RUN                                 */}
      {/* ========================================================================= */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 sm:p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Add Employee to Payroll Run</h3>
                  <p className="text-[11px] text-slate-500">
                    Include staff member, set monthly wage &amp; attendance days for {selectedMonth}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewEmployee} className="space-y-4">
              {/* Quick Select from Store Directory */}
              {storeEmployees && storeEmployees.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Quick Select from Company Staff Directory
                  </label>
                  <select
                    value={newEmpSelectedStaffId}
                    onChange={(e) => handleSelectStaff(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="custom">-- Enter New Staff / Contractor Manually --</option>
                    {storeEmployees.map((emp) => (
                      <option key={emp.id} value={String(emp.id)}>
                        {emp.name} ({emp.employee_id_str || `EMP0${emp.id}`}) — {emp.department} • {emp.role || 'Staff'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name & ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="e.g. Farhan Ali"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    placeholder="e.g. EMP039"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Department & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option>Sales</option>
                    <option>Technology</option>
                    <option>Operations</option>
                    <option>Marketing</option>
                    <option>HR</option>
                    <option>Finance</option>
                    <option>Management</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Role / Designation</label>
                  <input
                    type="text"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    placeholder="e.g. HVAC Lead Technician"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Monthly Gross Wage */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Monthly Gross Wages (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={newEmpGross}
                    onChange={(e) => setNewEmpGross(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Attendance Inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Cycle Attendance Days
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Full Days</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={newEmpFullDays}
                      onChange={(e) => setNewEmpFullDays(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Half Days</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={newEmpHalfDays}
                      onChange={(e) => setNewEmpHalfDays(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">WFH Days</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={newEmpWfhDays}
                      onChange={(e) => setNewEmpWfhDays(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">Paid Leave</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={newEmpPaidLeave}
                      onChange={(e) => setNewEmpPaidLeave(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Adjustments: Overtime, Extras, TDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Overtime (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newEmpOt}
                    onChange={(e) => setNewEmpOt(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Extras / Incentive (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newEmpExtras}
                    onChange={(e) => setNewEmpExtras(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">TDS &amp; Deductions (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newEmpTds}
                    onChange={(e) => setNewEmpTds(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              {(() => {
                const daily = Math.round(newEmpGross / 26);
                const paid = Number(newEmpFullDays) + (Number(newEmpHalfDays) * 0.5) + Number(newEmpWfhDays) + Number(newEmpPaidLeave);
                const earned = Math.round(daily * paid);
                const grossEarn = earned + Number(newEmpOt) + Number(newEmpExtras);
                const net = grossEarn - (Number(newEmpTds) + Number(newEmpOtherDed));

                return (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Paid Days</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">{paid}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Daily Wage</span>
                      <span className="font-bold text-slate-800 font-mono text-sm">₹{daily.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Earned Wages</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">₹{earned.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-700 font-bold block">Finalized Net Pay</span>
                      <span className="font-black text-blue-800 font-mono text-sm">₹{net.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Payroll Run</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPREHENSIVE QUICK ADJUST ATTENDANCE, WAGES & DEDUCTIONS          */}
      {/* ========================================================================= */}
      {editingEmployee && (() => {
        const livePaidDays = (Number(editingEmployee.full_day) || 0) + ((Number(editingEmployee.half_day) || 0) * 0.5) + (Number(editingEmployee.paid_leave) || 0);
        const liveDailyWage = Number(editingEmployee.daily_wage) || Math.round((Number(editingEmployee.gross_wages) || 30000) / 26);
        const liveEarnedWages = Number(editingEmployee.earned_wages) !== undefined && Number(editingEmployee.earned_wages) > 0
          ? Number(editingEmployee.earned_wages)
          : Math.round(liveDailyWage * livePaidDays);
        const liveAdditions = (Number(editingEmployee.other_earnings) || 0) + (Number(editingEmployee.overtime_amount) || 0) + (Number(editingEmployee.extras) || 0);
        const liveGrossEarnings = liveEarnedWages + liveAdditions;
        const liveTotalDeductions = (Number(editingEmployee.tds) || 0) + (Number(editingEmployee.penalties) || 0) + (Number(editingEmployee.other_deductions) || 0);
        const liveNetPay = liveGrossEarnings - liveTotalDeductions;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        Adjust Payroll Values — {editingEmployee.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₹{liveNetPay.toLocaleString()} Net
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {editingEmployee.employee_id} • {editingEmployee.department} • {editingEmployee.role || 'Staff'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-white shrink-0">
                <DraggableScrollRow showArrows={true} fadeEdges={true} scrollAmount={180} wheelMultiplier={1.2}>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustTab('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                      quickAdjustTab === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    All Parameters
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustTab('attendance')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      quickAdjustTab === 'attendance'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Attendance ({livePaidDays}d)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustTab('wages')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      quickAdjustTab === 'wages'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Base Wages</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustTab('additions')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      quickAdjustTab === 'additions'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Overtime & Extras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustTab('deductions')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      quickAdjustTab === 'deductions'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Deductions & TDS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickAdjustTab('profile')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      quickAdjustTab === 'profile'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Profile & Bank</span>
                  </button>
                </DraggableScrollRow>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
                {/* SECTION 1: ATTENDANCE & DAYS */}
                {(quickAdjustTab === 'all' || quickAdjustTab === 'attendance') && (
                  <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                      <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Attendance & Work Days (Period: {selectedMonth})</span>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md border border-blue-200">
                        Paid Days: {livePaidDays} Days
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Full Days</label>
                        <input
                          type="number"
                          value={editingEmployee.full_day ?? 13}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, full_day: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Half Days (0.5d)</label>
                        <input
                          type="number"
                          value={editingEmployee.half_day ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, half_day: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">WFH Days</label>
                        <input
                          type="number"
                          value={editingEmployee.wfh_days ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, wfh_days: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Paid Leave</label>
                        <input
                          type="number"
                          value={editingEmployee.paid_leave ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, paid_leave: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Unpaid (LOP)</label>
                        <input
                          type="number"
                          value={editingEmployee.unpaid_days ?? Math.max(0, 16 - livePaidDays)}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, unpaid_days: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: BASE WAGES & DAILY RATES */}
                {(quickAdjustTab === 'all' || quickAdjustTab === 'wages') && (
                  <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>Base Wages & Daily Rate Configuration</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200">
                        Earned: ₹{liveEarnedWages.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Base Monthly Gross Wages (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.gross_wages ?? editingEmployee.gross_salary ?? 30000}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const newDaily = Math.round(val / 26);
                            setEditingEmployee({
                              ...editingEmployee,
                              gross_wages: val,
                              gross_salary: val,
                              daily_wage: newDaily,
                              earned_wages: Math.round(newDaily * livePaidDays),
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700">Daily Wage Rate (₹)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const calc = Math.round((Number(editingEmployee.gross_wages) || 30000) / 26);
                              setEditingEmployee({
                                ...editingEmployee,
                                daily_wage: calc,
                                earned_wages: Math.round(calc * livePaidDays),
                              });
                            }}
                            className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                          >
                            Auto (Gross / 26)
                          </button>
                        </div>
                        <input
                          type="number"
                          value={editingEmployee.daily_wage ?? liveDailyWage}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingEmployee({
                              ...editingEmployee,
                              daily_wage: val,
                              earned_wages: Math.round(val * livePaidDays),
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Earned Wages (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.earned_wages ?? liveEarnedWages}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, earned_wages: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 3: OVERTIME & ADDITIONS */}
                {(quickAdjustTab === 'all' || quickAdjustTab === 'additions') && (
                  <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                        <IndianRupee className="w-4 h-4 text-amber-600" />
                        <span>Overtime, Extras & Allowances</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200">
                        Additions: +₹{liveAdditions.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Overtime Earnings (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.overtime_amount ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, overtime_amount: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Extras / Incentive / Bonus (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.extras ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, extras: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Other Earnings / Fixed Allowances (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.other_earnings ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, other_earnings: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 4: DEDUCTIONS & TDS */}
                {(quickAdjustTab === 'all' || quickAdjustTab === 'deductions') && (
                  <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-rose-100">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span>Statutory Deductions, Penalties & TDS</span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-md border border-rose-200">
                        Deductions: -₹{liveTotalDeductions.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">TDS Deduction (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.tds ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, tds: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Penalties / Late Attendance (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.penalties ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, penalties: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Other Deductions / Advance Recovery (₹)</label>
                        <input
                          type="number"
                          value={editingEmployee.other_deductions ?? 0}
                          onChange={(e) =>
                            setEditingEmployee({ ...editingEmployee, other_deductions: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 5: PROFILE & BANKING IDENTIFIERS */}
                {(quickAdjustTab === 'all' || quickAdjustTab === 'profile') && (
                  <div className="p-4 bg-purple-50/30 rounded-2xl border border-purple-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-purple-100">
                      <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Employee Profile & Banking Identification</span>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md border border-purple-200">
                        {editingEmployee.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          value={editingEmployee.name}
                          onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Employee ID</label>
                        <input
                          type="text"
                          value={editingEmployee.employee_id}
                          onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_id: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Department</label>
                        <select
                          value={editingEmployee.department}
                          onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operations">Operations</option>
                          <option value="Engineering">Engineering</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Role / Designation</label>
                        <input
                          type="text"
                          value={editingEmployee.role || ''}
                          onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                          placeholder="BDE, Specialist..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Disbursal Status</label>
                        <select
                          value={editingEmployee.status}
                          onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Ready">Ready</option>
                          <option value="Pending">Pending</option>
                          <option value="Held">Held</option>
                          <option value="Warning">Warning</option>
                          <option value="Processed">Processed</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Bank Account # / IFSC</label>
                        <input
                          type="text"
                          value={editingEmployee.bank_account || ''}
                          onChange={(e) => setEditingEmployee({ ...editingEmployee, bank_account: e.target.value })}
                          placeholder="A/C: 987654321098"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Calculation Matrix & Footer */}
              <div className="p-4 border-t border-slate-200/90 bg-slate-50/90 shrink-0 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Base Gross</div>
                    <div className="font-mono font-bold text-slate-800 text-xs">
                      ₹{(editingEmployee.gross_wages || 30000).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Earned Wages</div>
                    <div className="font-mono font-bold text-emerald-700 text-xs">
                      ₹{liveEarnedWages.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">+ Additions</div>
                    <div className="font-mono font-bold text-blue-700 text-xs">
                      +₹{liveAdditions.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">- Deductions</div>
                    <div className="font-mono font-bold text-rose-600 text-xs">
                      -₹{liveTotalDeductions.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-emerald-50 rounded-lg py-1 border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 font-extrabold uppercase">Finalized Net Pay</div>
                    <div className="font-mono font-black text-emerald-800 text-sm">
                      ₹{liveNetPay.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveQuickAdjust(editingEmployee)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Calculations & Update Wizard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: PAYSLIP INSPECTION                                                 */}
      {/* ========================================================================= */}
      {inspectEmployee && (
        <PayslipModal
          isOpen={true}
          employee={inspectEmployee}
          onClose={() => setInspectEmployee(null)}
          month={selectedMonth}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: FINAL DISBURSEMENT REVIEW                                          */}
      {/* ========================================================================= */}
      {isReviewModalOpen && (
        <RunPayrollReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onConfirm={handleFinalConfirm}
          totalEmployees={summaryKPIs.totalEmployees}
          grossAmount={summaryKPIs.grossWages}
          totalDeductions={summaryKPIs.totalDeductions}
          netPay={summaryKPIs.netPay}
          month={selectedMonth}
          sendPayslips={sendPayslips}
        />
      )}
    </div>
  );
};
