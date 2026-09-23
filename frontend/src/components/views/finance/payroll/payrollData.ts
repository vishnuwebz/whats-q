import {
  PayrollRunItem,
  EmployeeSalaryDetail,
  SalaryStructure,
  EmployeeSalaryAssignment,
  ReimbursementItem,
  EmployeeTaxCompliance,
  OffCyclePaymentItem,
  PayrollReportItem,
  PayrollSettingsState,
} from '@/types';

// ==========================================
// 1. RECENT PAYROLL RUNS (Image 4 & Image 3)
// ==========================================
export const INITIAL_PAYROLL_RUNS: PayrollRunItem[] = [
  {
    id: 1,
    month: 'May 2024',
    employees_count: 32,
    gross_amount: 1245000,
    deductions: 182500,
    net_amount: 1062500,
    payment_status: 'Processing',
    processed_on: '30 May 2024',
    notes: 'May 2024 monthly salary cycle under processing.',
  },
  {
    id: 2,
    month: 'Apr 2024',
    employees_count: 32,
    gross_amount: 1180000,
    deductions: 175200,
    net_amount: 1004800,
    payment_status: 'Paid',
    processed_on: '30 Apr 2024',
    notes: 'Disbursed via HDFC NEFT/RTGS batch.',
  },
  {
    id: 3,
    month: 'Mar 2024',
    employees_count: 31,
    gross_amount: 1120500,
    deductions: 168300,
    net_amount: 952200,
    payment_status: 'Paid',
    processed_on: '28 Mar 2024',
    notes: 'Early salary credit due to holiday.',
  },
  {
    id: 4,
    month: 'Feb 2024',
    employees_count: 31,
    gross_amount: 1095000,
    deductions: 162400,
    net_amount: 932600,
    payment_status: 'Paid',
    processed_on: '28 Feb 2024',
    notes: 'February 28-day cycle with full incentives.',
  },
  {
    id: 5,
    month: 'Jan 2024',
    employees_count: 30,
    gross_amount: 1040000,
    deductions: 156000,
    net_amount: 884000,
    payment_status: 'Paid',
    processed_on: '31 Jan 2024',
    notes: 'New Year cycle processed.',
  },
];

// ==========================================
// 2. SALARY STRUCTURES (Image 2)
// ==========================================
export const INITIAL_SALARY_STRUCTURES: SalaryStructure[] = [
  {
    id: 1,
    name: 'Operations Standard',
    department: 'Operations',
    employees_count: 8,
    ctc_range: '₹25,000 – ₹45,000',
    pay_frequency: 'Monthly',
    status: 'Active',
    components: [
      { name: 'Basic Salary', type: 'Fixed %', value: '40%' },
      { name: 'HRA', type: 'Fixed %', value: '20%' },
      { name: 'Conveyance', type: 'Fixed Amount', value: 3000 },
      { name: 'Special Allowance', type: 'Fixed %', value: '15%' },
      { name: 'Performance Allowance', type: 'Fixed %', value: '10%' },
      { name: 'Others', type: 'Fixed %', value: '15%' },
    ],
  },
  {
    id: 2,
    name: 'Sales Incentive Based',
    department: 'Sales',
    employees_count: 6,
    ctc_range: '₹30,000 – ₹60,000',
    pay_frequency: 'Monthly',
    status: 'Active',
    components: [
      { name: 'Basic Salary', type: 'Fixed %', value: '35%' },
      { name: 'HRA', type: 'Fixed %', value: '15%' },
      { name: 'Target Incentive', type: 'Fixed %', value: '25%' },
      { name: 'Travel & Food', type: 'Fixed Amount', value: 4000 },
      { name: 'Special Allowance', type: 'Fixed %', value: '15%' },
      { name: 'Others', type: 'Fixed %', value: '10%' },
    ],
  },
  {
    id: 3,
    name: 'Marketing Standard',
    department: 'Marketing',
    employees_count: 5,
    ctc_range: '₹28,000 – ₹50,000',
    pay_frequency: 'Monthly',
    status: 'Active',
    components: [
      { name: 'Basic Salary', type: 'Fixed %', value: '40%' },
      { name: 'HRA', type: 'Fixed %', value: '20%' },
      { name: 'Internet & Mobile', type: 'Fixed Amount', value: 2500 },
      { name: 'Campaign Bonus', type: 'Fixed %', value: '15%' },
      { name: 'Special Allowance', type: 'Fixed %', value: '15%' },
      { name: 'Others', type: 'Fixed %', value: '10%' },
    ],
  },
  {
    id: 4,
    name: 'Technology Premium',
    department: 'Technology',
    employees_count: 7,
    ctc_range: '₹40,000 – ₹80,000',
    pay_frequency: 'Monthly',
    status: 'Active',
    components: [
      { name: 'Basic Salary', type: 'Fixed %', value: '45%' },
      { name: 'HRA', type: 'Fixed %', value: '25%' },
      { name: 'Tech Allowance', type: 'Fixed Amount', value: 5000 },
      { name: 'Special Allowance', type: 'Fixed %', value: '15%' },
      { name: 'Performance Bonus', type: 'Fixed %', value: '10%' },
      { name: 'Others', type: 'Fixed %', value: '5%' },
    ],
  },
  {
    id: 5,
    name: 'HR & Admin',
    department: 'HR',
    employees_count: 4,
    ctc_range: '₹28,000 – ₹45,000',
    pay_frequency: 'Monthly',
    status: 'Active',
    components: [
      { name: 'Basic Salary', type: 'Fixed %', value: '40%' },
      { name: 'HRA', type: 'Fixed %', value: '20%' },
      { name: 'Conveyance', type: 'Fixed Amount', value: 2000 },
      { name: 'Special Allowance', type: 'Fixed %', value: '20%' },
      { name: 'Others', type: 'Fixed %', value: '20%' },
    ],
  },
  {
    id: 6,
    name: 'Management',
    department: 'Management',
    employees_count: 2,
    ctc_range: '₹60,000 – ₹1,20,000',
    pay_frequency: 'Monthly',
    status: 'Active',
    components: [
      { name: 'Basic Salary', type: 'Fixed %', value: '50%' },
      { name: 'HRA', type: 'Fixed %', value: '25%' },
      { name: 'Executive Allowance', type: 'Fixed Amount', value: 10000 },
      { name: 'Profit Share', type: 'Fixed %', value: '15%' },
      { name: 'Others', type: 'Fixed %', value: '10%' },
    ],
  },
];

// ==========================================
// 3. EMPLOYEE SALARY ASSIGNMENTS (Image 2)
// ==========================================
export const INITIAL_EMPLOYEE_ASSIGNMENTS: EmployeeSalaryAssignment[] = [
  { id: 1, employee_name: 'Amit Sharma', employee_id: 'EMP001', department: 'Operations', salary_structure: 'Operations Standard', current_ctc: 42000, effective_from: '01 Jan 2024', status: 'Active' },
  { id: 2, employee_name: 'Rahul Singh', employee_id: 'EMP002', department: 'Sales', salary_structure: 'Sales Incentive Based', current_ctc: 48000, effective_from: '01 Feb 2024', status: 'Active' },
  { id: 3, employee_name: 'Priya Mehta', employee_id: 'EMP003', department: 'Marketing', salary_structure: 'Marketing Standard', current_ctc: 36000, effective_from: '01 Jan 2024', status: 'Active' },
  { id: 4, employee_name: 'Vikram Kumar', employee_id: 'EMP004', department: 'Technology', salary_structure: 'Technology Premium', current_ctc: 55000, effective_from: '01 Mar 2024', status: 'Active' },
  { id: 5, employee_name: 'Nazia A', employee_id: 'EMP005', department: 'HR', salary_structure: 'HR & Admin', current_ctc: 32000, effective_from: '01 Jan 2024', status: 'Active' },
  { id: 6, employee_name: 'Sameer K', employee_id: 'EMP006', department: 'Finance', salary_structure: 'Management', current_ctc: 55000, effective_from: '01 Jan 2024', status: 'Active' },
  { id: 7, employee_name: 'Devika L', employee_id: 'EMP007', department: 'Operations', salary_structure: 'Operations Standard', current_ctc: 38000, effective_from: '15 Jan 2024', status: 'Active' },
  { id: 8, employee_name: 'Irshad Rahman', employee_id: 'EMP008', department: 'Sales', salary_structure: 'Sales Incentive Based', current_ctc: 45000, effective_from: '01 Feb 2024', status: 'Active' },
  { id: 9, employee_name: 'Sana N', employee_id: 'EMP009', department: 'Marketing', salary_structure: 'Marketing Standard', current_ctc: 41000, effective_from: '01 Feb 2024', status: 'Active' },
  { id: 10, employee_name: 'Arjun R', employee_id: 'EMP010', department: 'Technology', salary_structure: 'Technology Premium', current_ctc: 49000, effective_from: '01 Feb 2024', status: 'Active' },
  { id: 11, employee_name: 'Kavita Pillai', employee_id: 'EMP011', department: 'Operations', salary_structure: 'Operations Standard', current_ctc: 34000, effective_from: '01 Mar 2024', status: 'Active' },
  { id: 12, employee_name: 'Rohan Nambiar', employee_id: 'EMP012', department: 'Sales', salary_structure: 'Sales Incentive Based', current_ctc: 42000, effective_from: '01 Feb 2024', status: 'Active' },
];

// ==========================================
// 4. EMPLOYEE SALARY DETAILS (Image 3)
// ==========================================
export const INITIAL_EMPLOYEE_SALARY_DETAILS: EmployeeSalaryDetail[] = [
  { id: 1, employee_id: 'EMP001', name: 'Amit Sharma', email: 'amit@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', gross_salary: 42000, deductions: 6500, net_pay: 35500, status: 'Ready', bank_account: 'HDFC ••••4589', pan_number: 'ABEPS1234D', uan_number: '100234567890' },
  { id: 2, employee_id: 'EMP002', name: 'Rahul Singh', email: 'rahul@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', gross_salary: 36000, deductions: 5500, net_pay: 30500, status: 'Ready', bank_account: 'SBI ••••8912', pan_number: 'BGLPS5678E', uan_number: '100234567891' },
  { id: 3, employee_id: 'EMP003', name: 'Priya Mehta', email: 'priya@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', gross_salary: 48000, deductions: 8000, net_pay: 40000, status: 'Warning', warning_reason: 'Missing bank account details', pan_number: 'CHMPS9012F', uan_number: '100234567892' },
  { id: 4, employee_id: 'EMP004', name: 'Vikram Kumar', email: 'vikram@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', gross_salary: 52000, deductions: 6000, net_pay: 46000, status: 'Ready', bank_account: 'ICICI ••••2341', pan_number: 'DFGPS3456G', uan_number: '100234567893' },
  { id: 5, employee_id: 'EMP005', name: 'Nazia A', email: 'nazia@qiyam.com', department: 'HR', payroll_group: 'HR & Admin', gross_salary: 40500, deductions: 5000, net_pay: 35500, status: 'Ready', bank_account: 'Axis ••••7721', pan_number: 'EHJPS7890H', uan_number: '100234567894' },
  { id: 6, employee_id: 'EMP006', name: 'Sameer K', email: 'sameer@qiyam.com', department: 'Finance', payroll_group: 'Management', gross_salary: 55000, deductions: 7000, net_pay: 48000, status: 'Ready', bank_account: 'HDFC ••••9912', pan_number: 'FIKPS1234I', uan_number: '100234567895' },
  { id: 7, employee_id: 'EMP007', name: 'Devika L', email: 'devika@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', gross_salary: 38000, deductions: 6500, net_pay: 31500, status: 'Warning', warning_reason: 'Salary structure not updated', bank_account: 'Kotak ••••3321', pan_number: 'GJLPS5678J', uan_number: '100234567896' },
  { id: 8, employee_id: 'EMP008', name: 'Irshad Rahman', email: 'irshad@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', gross_salary: 45000, deductions: 8000, net_pay: 37000, status: 'Ready', bank_account: 'Canara ••••4412', pan_number: 'HKMPS9012K', uan_number: '100234567897' },
  { id: 9, employee_id: 'EMP009', name: 'Sana N', email: 'sana@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', gross_salary: 41000, deductions: 7500, net_pay: 33500, status: 'Ready', bank_account: 'HDFC ••••1189', pan_number: 'ILNPS3456L', uan_number: '100234567898' },
  { id: 10, employee_id: 'EMP010', name: 'Arjun R', email: 'arjun@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', gross_salary: 49000, deductions: 7000, net_pay: 42000, status: 'Ready', bank_account: 'Federal ••••6651', pan_number: 'JMOPS7890M', uan_number: '100234567899' },
  { id: 11, employee_id: 'EMP011', name: 'Kavita Pillai', email: 'kavita@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', gross_salary: 34000, deductions: 5200, net_pay: 28800, status: 'Ready', bank_account: 'SBI ••••5521', pan_number: 'KNQPS1234N', uan_number: '100234567900' },
  { id: 12, employee_id: 'EMP012', name: 'Rohan Nambiar', email: 'rohan@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', gross_salary: 42000, deductions: 6800, net_pay: 35200, status: 'Ready', bank_account: 'ICICI ••••9981', pan_number: 'LORPS5678O', uan_number: '100234567901' },
];

// ==========================================
// 5. REIMBURSEMENTS (Image 5)
// ==========================================
export const INITIAL_REIMBURSEMENTS: ReimbursementItem[] = [
  { id: 1, employee_name: 'Amit Sharma', employee_id: 'EMP001', purpose: 'Client Meeting', category: 'Travel', amount: 3250, submitted_on: '12 May 2024', status: 'Pending', notes: 'Fuel and toll charges for Koyilandy commercial HVAC survey.' },
  { id: 2, employee_name: 'Rahul Singh', employee_id: 'EMP002', purpose: 'Work from Home Internet', category: 'Internet', amount: 1200, submitted_on: '10 May 2024', status: 'Approved', notes: 'Monthly broadband invoice attached.' },
  { id: 3, employee_name: 'Priya Mehta', employee_id: 'EMP003', purpose: 'Team Lunch', category: 'Food', amount: 2450, submitted_on: '08 May 2024', status: 'Pending', notes: 'Quarterly review lunch with marketing crew.' },
  { id: 4, employee_name: 'Vikram Kumar', employee_id: 'EMP004', purpose: 'Product Demo Travel', category: 'Travel', amount: 5800, submitted_on: '06 May 2024', status: 'Approved', notes: 'Flight and taxi fares to Cochin tech expo.' },
  { id: 5, employee_name: 'Nazia A', employee_id: 'EMP005', purpose: 'Office Supplies', category: 'Stationery', amount: 1750, submitted_on: '03 May 2024', status: 'Rejected', notes: 'Duplicate receipt found for printing toner.' },
  { id: 6, employee_name: 'Sameer K', employee_id: 'EMP006', purpose: 'Conference Fee', category: 'Training', amount: 12000, submitted_on: '02 May 2024', status: 'Approved', notes: 'GST & Corporate Tax compliance summit pass.' },
  { id: 7, employee_name: 'Devika L', employee_id: 'EMP007', purpose: 'Fuel Reimbursement', category: 'Transport', amount: 4200, submitted_on: '29 Apr 2024', status: 'Pending', notes: 'Inter-branch visits Calicut to Vadakara.' },
  { id: 8, employee_name: 'Irshad Rahman', employee_id: 'EMP008', purpose: 'Software Subscription', category: 'Software', amount: 6500, submitted_on: '28 Apr 2024', status: 'Approved', notes: 'Annual sales outreach tooling license.' },
  { id: 9, employee_name: 'Sana N', employee_id: 'EMP009', purpose: 'Client Entertainment', category: 'Food', amount: 3600, submitted_on: '25 Apr 2024', status: 'Rejected', notes: 'Outside authorized company policy threshold.' },
  { id: 10, employee_name: 'Arjun R', employee_id: 'EMP010', purpose: 'Mobile Bill', category: 'Communication', amount: 950, submitted_on: '22 Apr 2024', status: 'Approved', notes: 'On-call technical support phone bill.' },
];

// ==========================================
// 6. TAX & COMPLIANCE (Image 6)
// ==========================================
export const INITIAL_TAX_COMPLIANCE: EmployeeTaxCompliance[] = [
  { id: 1, employee_name: 'Amit Sharma', employee_id: 'EMP001', department: 'Operations', tds: true, pf: true, esi: false, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 62000, monthly_tds: 5166, pf_number: '1002 3456 7891', pt_number: 'KL/PT/1234501', last_updated: '01 May 2024' },
  { id: 2, employee_name: 'Rahul Singh', employee_id: 'EMP002', department: 'Sales', tds: true, pf: true, esi: true, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 48000, monthly_tds: 4000, pf_number: '1002 3456 7892', esi_number: '4400 1234 5671', pt_number: 'KL/PT/1234502', last_updated: '01 May 2024' },
  { id: 3, employee_name: 'Priya Mehta', employee_id: 'EMP003', department: 'Marketing', tds: true, pf: true, esi: false, pt: true, status: 'Compliant', tds_regime: 'Old Regime', estimated_annual_tax: 72000, monthly_tds: 6000, pf_number: '1002 3456 7893', pt_number: 'KL/PT/1234503', last_updated: '01 May 2024' },
  { id: 4, employee_name: 'Vikram Kumar', employee_id: 'EMP004', department: 'Technology', tds: true, pf: true, esi: true, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 78000, monthly_tds: 6500, pf_number: '1002 3456 7890', esi_number: '4400 1234 5678', pt_number: 'KL/PT/1234567', last_updated: '01 May 2024' },
  { id: 5, employee_name: 'Nazia A', employee_id: 'EMP005', department: 'HR', tds: false, pf: true, esi: false, pt: true, status: 'Pending', tds_regime: 'New Regime', estimated_annual_tax: 0, monthly_tds: 0, pf_number: '1002 3456 7895', pt_number: 'KL/PT/1234505', last_updated: '28 Apr 2024' },
  { id: 6, employee_name: 'Sameer K', employee_id: 'EMP006', department: 'Finance', tds: true, pf: true, esi: false, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 96000, monthly_tds: 8000, pf_number: '1002 3456 7896', pt_number: 'KL/PT/1234506', last_updated: '01 May 2024' },
  { id: 7, employee_name: 'Devika L', employee_id: 'EMP007', department: 'Operations', tds: true, pf: true, esi: true, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 54000, monthly_tds: 4500, pf_number: '1002 3456 7897', esi_number: '4400 1234 5672', pt_number: 'KL/PT/1234507', last_updated: '01 May 2024' },
  { id: 8, employee_name: 'Irshad Rahman', employee_id: 'EMP008', department: 'Sales', tds: true, pf: true, esi: true, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 68000, monthly_tds: 5666, pf_number: '1002 3456 7898', esi_number: '4400 1234 5673', pt_number: 'KL/PT/1234508', last_updated: '01 May 2024' },
  { id: 9, employee_name: 'Sana N', employee_id: 'EMP009', department: 'Marketing', tds: false, pf: true, esi: false, pt: true, status: 'Pending', tds_regime: 'New Regime', estimated_annual_tax: 0, monthly_tds: 0, pf_number: '1002 3456 7899', pt_number: 'KL/PT/1234509', last_updated: '26 Apr 2024' },
  { id: 10, employee_name: 'Arjun R', employee_id: 'EMP010', department: 'Technology', tds: true, pf: true, esi: true, pt: true, status: 'Compliant', tds_regime: 'New Regime', estimated_annual_tax: 74000, monthly_tds: 6166, pf_number: '1002 3456 7900', esi_number: '4400 1234 5674', pt_number: 'KL/PT/1234510', last_updated: '01 May 2024' },
];

// ==========================================
// 7. OFF-CYCLE PAYROLL RUNS (Image 7)
// ==========================================
export const INITIAL_OFF_CYCLE_RUNS: OffCyclePaymentItem[] = [
  { id: 1, run_id: 'OC-2024-012', employee_name: 'Amit Sharma', employee_id: 'EMP001', department: 'Operations', payment_type: 'Bonus', amount: 25000, processed_on: '28 May 2024', status: 'Paid', notes: 'Annual performance festival bonus' },
  { id: 2, run_id: 'OC-2024-011', employee_name: 'Rahul Singh', employee_id: 'EMP002', department: 'Sales', payment_type: 'Incentive', amount: 18500, processed_on: '24 May 2024', status: 'Paid', notes: 'Q1 Top Sales Performer reward' },
  { id: 3, run_id: 'OC-2024-010', employee_name: 'Priya Mehta', employee_id: 'EMP003', department: 'Marketing', payment_type: 'Arrears', amount: 12000, processed_on: '20 May 2024', status: 'Paid', notes: 'Grade revision retroactive adjustment' },
  { id: 4, run_id: 'OC-2024-009', employee_name: 'Vikram Kumar', employee_id: 'EMP004', department: 'Technology', payment_type: 'Project Bonus', amount: 30000, processed_on: '15 May 2024', status: 'Paid', notes: 'Meta WhatsApp Cloud API v21 integration bonus' },
  { id: 5, run_id: 'OC-2024-008', employee_name: 'Nazia A', employee_id: 'EMP005', department: 'HR', payment_type: 'Reimbursement', amount: 8750, processed_on: '10 May 2024', status: 'Paid', notes: 'Campus recruitment drive travel expenses' },
  { id: 6, run_id: 'OC-2024-007', employee_name: 'Sameer K', employee_id: 'EMP006', department: 'Finance', payment_type: 'Retention Bonus', amount: 20000, processed_on: '05 May 2024', status: 'Paid', notes: 'Annual tenure milestone completion' },
  { id: 7, run_id: 'OC-2024-006', employee_name: 'Devika L', employee_id: 'EMP007', department: 'Operations', payment_type: 'Overtime', amount: 7200, processed_on: '28 Apr 2024', status: 'Paid', notes: 'Emergency chiller maintenance shift' },
  { id: 8, run_id: 'OC-2024-005', employee_name: 'Irshad Rahman', employee_id: 'EMP008', department: 'Sales', payment_type: 'Commission', amount: 16500, processed_on: '22 Apr 2024', status: 'Paid', notes: 'Enterprise AMC contract deal bonus' },
  { id: 9, run_id: 'OC-2024-004', employee_name: 'Sana N', employee_id: 'EMP009', department: 'Marketing', payment_type: 'Referral Bonus', amount: 10000, processed_on: '18 Apr 2024', status: 'Paid', notes: 'Successful senior technician hiring referral' },
  { id: 10, run_id: 'OC-2024-003', employee_name: 'Arjun R', employee_id: 'EMP010', department: 'Technology', payment_type: 'Reimbursement', amount: 4500, processed_on: '12 Apr 2024', status: 'Paid', notes: 'Server SSL certifications invoice' },
];

// ==========================================
// 8. PAYROLL REPORTS (Image 8)
// ==========================================
export const INITIAL_PAYROLL_REPORTS: PayrollReportItem[] = [
  { id: 1, name: 'Payroll Summary', type: 'Summary', period: 'May 2024', generated_on: '30 May 2024, 10:30 AM', generated_by: 'Faris Usman', status: 'Completed' },
  { id: 2, name: 'Employee Salary Report', type: 'Employee-wise', period: 'May 2024', generated_on: '28 May 2024, 04:15 PM', generated_by: 'HR Team', status: 'Completed' },
  { id: 3, name: 'Deductions Report', type: 'Deductions', period: 'May 2024', generated_on: '25 May 2024, 11:20 AM', generated_by: 'Faris Usman', status: 'Completed' },
  { id: 4, name: 'Compliance Report', type: 'Compliance', period: 'May 2024', generated_on: '22 May 2024, 02:45 PM', generated_by: 'Finance Team', status: 'Completed' },
  { id: 5, name: 'Reimbursement Report', type: 'Reimbursement', period: 'May 2024', generated_on: '20 May 2024, 09:10 AM', generated_by: 'HR Team', status: 'Completed' },
];

// ==========================================
// 9. PAYROLL SETTINGS (Image 1)
// ==========================================
export const INITIAL_PAYROLL_SETTINGS: PayrollSettingsState = {
  frequency: 'Monthly',
  month_start: '1st of the month',
  cutoff_date: '25th of the month',
  credit_date: 'Last working day',
  financial_year: 'April - March (FY 2024-25)',
  include_new_joinees: true,
  calculate_partial_attendance: true,
  round_off_salary: false,
  send_payslip_email: true,
  enable_payroll_approval: true,
  company_name_payslip: 'Qiyam Business Solutions LLP',
  payslip_template: 'Default Template',
  include_company_logo: true,
  include_employee_signature: true,
  include_company_address: true,
  include_statutory_details: true,
  salary_payment_method: 'Bank Transfer (NEFT/RTGS)',
  default_bank: 'HDFC Bank',
  upload_bank_file_format: 'Excel (.xlsx)',
  overtime_calc: 'As per company policy',
  leave_deduction: 'Deduct for unpaid leave',
  arrears_processing: 'Include in next payroll',
  reimbursement_approval: 'Require manager approval',
  bonus_policy: 'Process as per policy',
};

// ==========================================
// CACHE & STORAGE HELPERS
// ==========================================
const STORAGE_PREFIX = 'whatsq_payroll_';

export function getPayrollCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== undefined && parsed !== null) return parsed;
    }
  } catch (e) {
    console.warn(`[PayrollData] Error reading ${key} from cache:`, e);
  }
  return fallback;
}

export function setPayrollCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`[PayrollData] Error writing ${key} to cache:`, e);
  }
}
