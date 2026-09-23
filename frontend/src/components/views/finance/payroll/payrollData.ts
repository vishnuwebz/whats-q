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
  { id: 1, employee_id: 'EMP001', name: 'Amit Sharma', email: 'amit@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'BDE', full_day: 14, half_day: 1, wfh_days: 0, paid_leave: 0, paid_days: 14.5, unpaid_days: 1.5, daily_wage: 1000, gross_salary: 30000, gross_wages: 30000, earned_wages: 14500, other_earnings: 0, overtime_amount: 300, extras: 450, gross_earnings: 15250, tds: 870, penalties: 0, other_deductions: 1500, deductions: 2370, net_pay: 12880, finalized_amount: 12880, status: 'Ready', bank_account: 'HDFC ••••4589', pan_number: 'ABEPS1234D', uan_number: '100234567890' },
  { id: 2, employee_id: 'EMP002', name: 'Rahul Singh', email: 'rahul@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 0, paid_days: 14, unpaid_days: 2, daily_wage: 1166.67, gross_salary: 35000, gross_wages: 35000, earned_wages: 16333.33, other_earnings: 0, overtime_amount: 0, extras: 550, gross_earnings: 16883.33, tds: 980, penalties: 0, other_deductions: 1070, deductions: 2050, net_pay: 14833.33, finalized_amount: 14833.33, status: 'Ready', bank_account: 'SBI ••••8912', pan_number: 'BGLPS5678E', uan_number: '100234567891' },
  { id: 3, employee_id: 'EMP003', name: 'Priya Mehta', email: 'priya@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 15, unpaid_days: 1, daily_wage: 500, gross_salary: 15000, gross_wages: 15000, earned_wages: 7500, other_earnings: 4000, overtime_amount: 0, extras: 500, gross_earnings: 12000, tds: 540, penalties: 0, other_deductions: 900, deductions: 1440, net_pay: 10560, finalized_amount: 10560, status: 'Ready', bank_account: 'HDFC ••••3312', pan_number: 'CHMPS9012F', uan_number: '100234567892' },
  { id: 4, employee_id: 'EMP004', name: 'Vikram Kumar', email: 'vikram@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 0, paid_days: 14, unpaid_days: 2, daily_wage: 1033.33, gross_salary: 31000, gross_wages: 31000, earned_wages: 14466.67, other_earnings: 0, overtime_amount: 0, extras: 0, gross_earnings: 14466.67, tds: 868, penalties: 0, other_deductions: 1026.67, deductions: 1894.67, net_pay: 12572, finalized_amount: 12572, status: 'Ready', bank_account: 'ICICI ••••2341', pan_number: 'DFGPS3456G', uan_number: '100234567893' },
  { id: 5, employee_id: 'EMP005', name: 'Nazia A', email: 'nazia@qiyam.com', department: 'HR', payroll_group: 'HR & Admin', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 0, paid_days: 14, unpaid_days: 2, daily_wage: 500, gross_salary: 15000, gross_wages: 15000, earned_wages: 7000, other_earnings: 0, overtime_amount: 0, extras: 0, gross_earnings: 7000, tds: 472.5, penalties: 0, other_deductions: 0, deductions: 472.5, net_pay: 6527.5, finalized_amount: 6527.5, status: 'Ready', bank_account: 'Axis ••••7721', pan_number: 'EHJPS7890H', uan_number: '100234567894' },
  { id: 6, employee_id: 'EMP006', name: 'Sameer K', email: 'sameer@qiyam.com', department: 'Finance', payroll_group: 'Management', role: 'BDE', full_day: 12, half_day: 1, wfh_days: 0, paid_leave: 0, paid_days: 13.5, unpaid_days: 2.5, daily_wage: 1200, gross_salary: 36000, gross_wages: 36000, earned_wages: 16200, other_earnings: 0, overtime_amount: 0, extras: 300, gross_earnings: 16500, tds: 990, penalties: 0, other_deductions: 1100, deductions: 2090, net_pay: 14410, finalized_amount: 14410, status: 'Ready', bank_account: 'HDFC ••••9912', pan_number: 'FIKPS1234I', uan_number: '100234567895' },
  { id: 7, employee_id: 'EMP007', name: 'Devika L', email: 'devika@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', role: 'BDE', full_day: 14, half_day: 0, wfh_days: 0, paid_leave: 0, paid_days: 14, unpaid_days: 2, daily_wage: 1000, gross_salary: 30000, gross_wages: 30000, earned_wages: 14000, other_earnings: 0, overtime_amount: 0, extras: 0, gross_earnings: 14000, tds: 840, penalties: 0, other_deductions: 500, deductions: 1340, net_pay: 12660, finalized_amount: 12660, status: 'Ready', bank_account: 'Kotak ••••3321', pan_number: 'GJLPS5678J', uan_number: '100234567896' },
  { id: 8, employee_id: 'EMP008', name: 'Irshad Rahman', email: 'irshad@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 0, paid_days: 14, unpaid_days: 2, daily_wage: 900, gross_salary: 27000, gross_wages: 27000, earned_wages: 12600, other_earnings: 2000, overtime_amount: 0, extras: 0, gross_earnings: 14600, tds: 876, penalties: 0, other_deductions: 800, deductions: 1676, net_pay: 12924, finalized_amount: 12924, status: 'Ready', bank_account: 'Canara ••••4412', pan_number: 'HKMPS9012K', uan_number: '100234567897' },
  { id: 9, employee_id: 'EMP009', name: 'Sana N', email: 'sana@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 0, paid_days: 14, unpaid_days: 2, daily_wage: 700, gross_salary: 21000, gross_wages: 21000, earned_wages: 9800, other_earnings: 1500, overtime_amount: 400, extras: 0, gross_earnings: 11700, tds: 702, penalties: 0, other_deductions: 600, deductions: 1302, net_pay: 10398, finalized_amount: 10398, status: 'Pending', bank_account: 'HDFC ••••1189', pan_number: 'ILNPS3456L', uan_number: '100234567898' },
  { id: 10, employee_id: 'EMP010', name: 'Arjun R', email: 'arjun@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'BDE', full_day: 12, half_day: 0, wfh_days: 2, paid_leave: 1, paid_days: 13, unpaid_days: 3, daily_wage: 1300, gross_salary: 39000, gross_wages: 39000, earned_wages: 16900, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 17400, tds: 1050, penalties: 0, other_deductions: 1200, deductions: 2250, net_pay: 15150, finalized_amount: 15150, status: 'Ready', bank_account: 'Federal ••••6651', pan_number: 'JMOPS7890M', uan_number: '100234567899' },
  { id: 11, employee_id: 'EMP011', name: 'Kavita Pillai', email: 'kavita@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', role: 'Sr. Associate', full_day: 13, half_day: 1, wfh_days: 0, paid_leave: 1, paid_days: 14.5, unpaid_days: 0.5, daily_wage: 1230.77, gross_salary: 32000, gross_wages: 32000, earned_wages: 17846.15, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 18346.15, tds: 920, penalties: 0, other_deductions: 4280, deductions: 5200, net_pay: 26800, finalized_amount: 26800, status: 'Ready', bank_account: 'SBI ••••5521', pan_number: 'KNQPS1234N', uan_number: '100234567900' },
  { id: 12, employee_id: 'EMP012', name: 'Rohan Nambiar', email: 'rohan@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'Account Exec', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 14, unpaid_days: 1, daily_wage: 1538.46, gross_salary: 40000, gross_wages: 40000, earned_wages: 21538.46, other_earnings: 0, overtime_amount: 600, extras: 0, gross_earnings: 22138.46, tds: 1200, penalties: 0, other_deductions: 5600, deductions: 6800, net_pay: 33200, finalized_amount: 33200, status: 'Ready', bank_account: 'ICICI ••••9981', pan_number: 'LORPS5678O', uan_number: '100234567901' },
  { id: 13, employee_id: 'EMP013', name: 'Ananya Roy', email: 'ananya@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'Frontend Dev', full_day: 12, half_day: 1, wfh_days: 1, paid_leave: 1, paid_days: 13.5, unpaid_days: 0.5, daily_wage: 2000, gross_salary: 52000, gross_wages: 52000, earned_wages: 27000, other_earnings: 0, overtime_amount: 600, extras: 0, gross_earnings: 27600, tds: 1650, penalties: 0, other_deductions: 6550, deductions: 8200, net_pay: 43800, finalized_amount: 43800, status: 'Ready', bank_account: 'HDFC ••••2234', pan_number: 'MNSPS9012P', uan_number: '100234567902' },
  { id: 14, employee_id: 'EMP014', name: 'Deepak Nair', email: 'deepak@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', role: 'SEO Specialist', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 14, unpaid_days: 0.5, daily_wage: 1346.15, gross_salary: 35000, gross_wages: 35000, earned_wages: 18846.15, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 19346.15, tds: 1050, penalties: 0, other_deductions: 4550, deductions: 5600, net_pay: 29400, finalized_amount: 29400, status: 'Ready', bank_account: 'Axis ••••8812', pan_number: 'NOTPS3456Q', uan_number: '100234567903' },
  { id: 15, employee_id: 'EMP015', name: 'Sneha George', email: 'sneha@qiyam.com', department: 'HR', payroll_group: 'HR & Admin', role: 'HR Generalist', full_day: 13, half_day: 1, wfh_days: 0, paid_leave: 1, paid_days: 13.5, unpaid_days: 0.5, daily_wage: 1423.08, gross_salary: 37000, gross_wages: 37000, earned_wages: 19211.54, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 19611.54, tds: 1100, penalties: 0, other_deductions: 4900, deductions: 6000, net_pay: 31000, finalized_amount: 31000, status: 'Ready', bank_account: 'Federal ••••4491', pan_number: 'OPUPS7890R', uan_number: '100234567904' },
  { id: 16, employee_id: 'EMP016', name: 'Vivek Menon', email: 'vivek@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', role: 'Field Ops Lead', full_day: 13, half_day: 0, wfh_days: 0, paid_leave: 1, paid_days: 13, unpaid_days: 1, daily_wage: 1692.31, gross_salary: 44000, gross_wages: 44000, earned_wages: 22000, other_earnings: 0, overtime_amount: 600, extras: 0, gross_earnings: 22600, tds: 1350, penalties: 0, other_deductions: 5850, deductions: 7200, net_pay: 36800, finalized_amount: 36800, status: 'Ready', bank_account: 'Canara ••••1123', pan_number: 'PQVPS1234S', uan_number: '100234567905' },
  { id: 17, employee_id: 'EMP017', name: 'Pooja Balan', email: 'pooja@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 14, unpaid_days: 1, daily_wage: 1384.62, gross_salary: 36000, gross_wages: 36000, earned_wages: 19384.62, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 19884.62, tds: 1080, penalties: 0, other_deductions: 4520, deductions: 5600, net_pay: 30400, finalized_amount: 30400, status: 'Ready', bank_account: 'Kotak ••••7732', pan_number: 'QRWPS5678T', uan_number: '100234567906' },
  { id: 18, employee_id: 'EMP018', name: 'Faisal K', email: 'faisal@qiyam.com', department: 'Finance', payroll_group: 'Management', role: 'Financial Analyst', full_day: 13, half_day: 1, wfh_days: 0, paid_leave: 1, paid_days: 13.5, unpaid_days: 0.5, daily_wage: 2153.85, gross_salary: 56000, gross_wages: 56000, earned_wages: 29076.92, other_earnings: 0, overtime_amount: 600, extras: 0, gross_earnings: 29676.92, tds: 1800, penalties: 0, other_deductions: 7000, deductions: 8800, net_pay: 47200, finalized_amount: 47200, status: 'Ready', bank_account: 'HDFC ••••6641', pan_number: 'RSXPS9012U', uan_number: '100234567907' },
  { id: 19, employee_id: 'EMP019', name: 'Meera Nair', email: 'meera@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'Backend Dev', full_day: 12, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 13, unpaid_days: 1, daily_wage: 2076.92, gross_salary: 54000, gross_wages: 54000, earned_wages: 27000, other_earnings: 0, overtime_amount: 600, extras: 0, gross_earnings: 27600, tds: 1750, penalties: 0, other_deductions: 7050, deductions: 8800, net_pay: 45200, finalized_amount: 45200, status: 'Ready', bank_account: 'SBI ••••3319', pan_number: 'STYPS3456V', uan_number: '100234567908' },
  { id: 20, employee_id: 'EMP020', name: 'Harish Kumar', email: 'harish@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', role: 'Logistics Mgr', full_day: 13, half_day: 1, wfh_days: 0, paid_leave: 0, paid_days: 12.5, unpaid_days: 1, daily_wage: 1615.38, gross_salary: 42000, gross_wages: 42000, earned_wages: 20192.31, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 20692.31, tds: 1300, penalties: 0, other_deductions: 5600, deductions: 6900, net_pay: 35100, finalized_amount: 35100, status: 'Ready', bank_account: 'ICICI ••••5582', pan_number: 'TUZPS7890W', uan_number: '100234567909' },
  { id: 21, employee_id: 'EMP021', name: 'Shreya Das', email: 'shreya@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', role: 'Content Lead', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 14, unpaid_days: 0.5, daily_wage: 1500, gross_salary: 39000, gross_wages: 39000, earned_wages: 21000, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 21400, tds: 1200, penalties: 0, other_deductions: 5200, deductions: 6400, net_pay: 32600, finalized_amount: 32600, status: 'Ready', bank_account: 'Axis ••••9941', pan_number: 'UVAPS1234X', uan_number: '100234567910' },
  { id: 22, employee_id: 'EMP022', name: 'Manoj Verma', email: 'manoj@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'BDE', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 14, unpaid_days: 1, daily_wage: 1423.08, gross_salary: 37000, gross_wages: 37000, earned_wages: 19923.08, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 20423.08, tds: 1150, penalties: 0, other_deductions: 4950, deductions: 6100, net_pay: 30900, finalized_amount: 30900, status: 'Ready', bank_account: 'HDFC ••••8823', pan_number: 'VWBPS5678Y', uan_number: '100234567911' },
  { id: 23, employee_id: 'EMP023', name: 'Ayesha Khan', email: 'ayesha@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'QA Engineer', full_day: 13, half_day: 1, wfh_days: 1, paid_leave: 1, paid_days: 14.5, unpaid_days: 0.5, daily_wage: 1769.23, gross_salary: 46000, gross_wages: 46000, earned_wages: 25653.85, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 26153.85, tds: 1400, penalties: 0, other_deductions: 6000, deductions: 7400, net_pay: 38600, finalized_amount: 38600, status: 'Ready', bank_account: 'Federal ••••1172', pan_number: 'WXCPS9012Z', uan_number: '100234567912' },
  { id: 24, employee_id: 'EMP024', name: 'Siddharth P', email: 'siddharth@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', role: 'Ops Associate', full_day: 13, half_day: 0, wfh_days: 0, paid_leave: 1, paid_days: 13, unpaid_days: 1, daily_wage: 1192.31, gross_salary: 31000, gross_wages: 31000, earned_wages: 15500, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 15900, tds: 950, penalties: 0, other_deductions: 4050, deductions: 5000, net_pay: 26000, finalized_amount: 26000, status: 'Ready', bank_account: 'SBI ••••4489', pan_number: 'XYDPS3456A', uan_number: '100234567913' },
  { id: 25, employee_id: 'EMP025', name: 'Divya Shenoy', email: 'divya@qiyam.com', department: 'HR', payroll_group: 'HR & Admin', role: 'Talent Recruiter', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 1, paid_days: 14, unpaid_days: 0.5, daily_wage: 1346.15, gross_salary: 35000, gross_wages: 35000, earned_wages: 18846.15, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 19246.15, tds: 1050, penalties: 0, other_deductions: 4550, deductions: 5600, net_pay: 29400, finalized_amount: 29400, status: 'Ready', bank_account: 'Canara ••••3354', pan_number: 'YZEPS7890B', uan_number: '100234567914' },
  { id: 26, employee_id: 'EMP026', name: 'Nikhil R', email: 'nikhil@qiyam.com', department: 'Sales', payroll_group: 'Sales Team', role: 'BDE', full_day: 13, half_day: 1, wfh_days: 0, paid_leave: 0, paid_days: 12.5, unpaid_days: 1, daily_wage: 1307.69, gross_salary: 34000, gross_wages: 34000, earned_wages: 16346.15, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 16746.15, tds: 1020, penalties: 0, other_deductions: 4380, deductions: 5400, net_pay: 28600, finalized_amount: 28600, status: 'Ready', bank_account: 'Kotak ••••6612', pan_number: 'ZAFPS1234C', uan_number: '100234567915' },
  { id: 27, employee_id: 'EMP027', name: 'Ritu Joshi', email: 'ritu@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'UI/UX Designer', full_day: 12, half_day: 1, wfh_days: 1, paid_leave: 1, paid_days: 13.5, unpaid_days: 0.5, daily_wage: 1923.08, gross_salary: 50000, gross_wages: 50000, earned_wages: 25961.54, other_earnings: 0, overtime_amount: 500, extras: 0, gross_earnings: 26461.54, tds: 1550, penalties: 0, other_deductions: 6450, deductions: 8000, net_pay: 42000, finalized_amount: 42000, status: 'Ready', bank_account: 'HDFC ••••9981', pan_number: 'ABGPS5678D', uan_number: '100234567916' },
  { id: 28, employee_id: 'EMP028', name: 'Bilal Hassan', email: 'bilal@qiyam.com', department: 'Finance', payroll_group: 'Management', role: 'Accountant', full_day: 13, half_day: 0, wfh_days: 0, paid_leave: 1, paid_days: 13, unpaid_days: 1, daily_wage: 1576.92, gross_salary: 41000, gross_wages: 41000, earned_wages: 20500, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 20900, tds: 1250, penalties: 0, other_deductions: 5350, deductions: 6600, net_pay: 34400, finalized_amount: 34400, status: 'Ready', bank_account: 'ICICI ••••7743', pan_number: 'BCHPS9012E', uan_number: '100234567917' },
  { id: 29, employee_id: 'EMP029', name: 'Karthik V', email: 'karthik@qiyam.com', department: 'Operations', payroll_group: 'Operations Team', role: 'Field Exec', full_day: 13, half_day: 1, wfh_days: 0, paid_leave: 0, paid_days: 12.5, unpaid_days: 1, daily_wage: 1153.85, gross_salary: 30000, gross_wages: 30000, earned_wages: 14423.08, other_earnings: 0, overtime_amount: 400, extras: 0, gross_earnings: 14823.08, tds: 900, penalties: 0, other_deductions: 3900, deductions: 4800, net_pay: 25200, finalized_amount: 25200, status: 'Ready', bank_account: 'Axis ••••2291', pan_number: 'CDIPS3456F', uan_number: '100234567918' },
  { id: 30, employee_id: 'EMP030', name: 'Zainab M', email: 'zainab@qiyam.com', department: 'Marketing', payroll_group: 'Marketing Team', role: 'Social Media Exec', full_day: 13, half_day: 0, wfh_days: 1, paid_leave: 0, paid_days: 13, unpaid_days: 0.5, daily_wage: 1230.77, gross_salary: 32000, gross_wages: 32000, earned_wages: 16000, other_earnings: 0, overtime_amount: 300, extras: 0, gross_earnings: 16300, tds: 960, penalties: 0, other_deductions: 4240, deductions: 5200, net_pay: 26800, finalized_amount: 26800, status: 'Ready', bank_account: 'SBI ••••8834', pan_number: 'DEJPS7890G', uan_number: '100234567919' },
  { id: 31, employee_id: 'EMP031', name: 'Vishnu Das', email: 'vishnu@qiyam.com', department: 'Technology', payroll_group: 'Technology Team', role: 'DevOps Eng', full_day: 12, half_day: 1, wfh_days: 1, paid_leave: 0, paid_days: 13, unpaid_days: 0.5, daily_wage: 2307.69, gross_salary: 60000, gross_wages: 60000, earned_wages: 30000, other_earnings: 0, overtime_amount: 600, extras: 0, gross_earnings: 30600, tds: 2000, penalties: 0, other_deductions: 7800, deductions: 9800, net_pay: 50200, finalized_amount: 50200, status: 'Ready', bank_account: 'Federal ••••5512', pan_number: 'EFKPS1234H', uan_number: '100234567920' },
  { id: 32, employee_id: 'EMP032', name: 'Faris Usman', email: 'faris@qiyam.com', department: 'Management', payroll_group: 'Management', role: 'Director / CEO', full_day: 13, half_day: 0, wfh_days: 0, paid_leave: 0, paid_days: 12.5, unpaid_days: 0.5, daily_wage: 3961.54, gross_salary: 103000, gross_wages: 103000, earned_wages: 49519.23, other_earnings: 0, overtime_amount: 800, extras: 0, gross_earnings: 50319.23, tds: 6500, penalties: 0, other_deductions: 19700, deductions: 26200, net_pay: 76800, finalized_amount: 76800, status: 'Ready', bank_account: 'HDFC ••••1001', pan_number: 'FGLPS5678I', uan_number: '100234567921' },
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
