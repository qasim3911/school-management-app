export type SchoolType = 'Private' | 'Semi-Government' | 'Cadet College' | 'Foundation / NGO' | 'Higher Secondary';

export type ApplicationStatus = 'Pending' | 'Under Review' | 'Additional Information Required' | 'Approved' | 'Rejected';

export type SubscriptionDuration = 'Monthly' | 'Quarterly' | 'Six Months' | 'Yearly';

export type SubscriptionTier = 'Basic' | 'Standard' | 'Premium';

export type PaymentMethod = 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Cash';

export type PaymentStatus = 'Pending Verification' | 'Approved' | 'Rejected' | 'More Information Required';

export interface SchoolApplication {
  id: string;
  application_id: string; // e.g., APP-PK-2026-8941
  school_name_en: string;
  school_name_ur: string;
  school_type: SchoolType;
  owner_name: string;
  principal_name: string;
  official_email: string;
  mobile_number: string;
  whatsapp_number: string;
  province: string;
  district: string;
  tehsil?: string;
  city: string;
  complete_address: string;
  student_count_estimate: number;
  teacher_count_estimate: number;
  branches_count: number;
  registration_number?: string;
  registration_docs_url?: string;
  logo_url?: string;
  password_hash?: string;
  selected_plan: SubscriptionTier;
  selected_duration: SubscriptionDuration;
  status: ApplicationStatus;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name_en: string;
  name_ur: string;
  slug: string;
  school_type: SchoolType;
  registration_no?: string;
  owner_name: string;
  principal_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  province: string;
  district: string;
  city: string;
  address: string;
  logo_url?: string;
  stamp_url?: string;
  signature_url?: string;
  active_session_id?: string;
  school_timings?: string;
  status: 'active' | 'suspended' | 'pending_payment';
  created_at: string;
}

export interface SchoolSubscription {
  id: string;
  school_id: string;
  tier: SubscriptionTier;
  duration: SubscriptionDuration;
  price_pkr: number;
  status: 'active' | 'expired' | 'pending_approval' | 'cancelled';
  starts_at: string;
  expires_at: string;
  student_limit: number;
  staff_limit: number;
  branch_limit: number;
  payment_method?: PaymentMethod;
  transaction_id?: string;
  payment_date?: string;
  depositor_name?: string;
  payment_screenshot_url?: string;
  payment_status: PaymentStatus;
}

export interface AcademicSession {
  id: string;
  school_id: string;
  name: string; // e.g. "2025-2026", "2026-2027"
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  session_id: string;
  name: string; // e.g. "Nursery", "Grade 5", "Matric Science", "FSc Pre-Medical"
  numeric_order: number;
  head_teacher_id?: string;
  capacity?: number;
  created_at: string;
}

export interface Section {
  id: string;
  school_id: string;
  class_id: string;
  name: string; // e.g. "Rose", "Jasmine", "Section A"
  in_charge_teacher_id?: string;
  room_number?: string;
  capacity: number;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  class_id: string;
  session_id: string;
  name_en: string;
  name_ur: string;
  code: string;
  type: 'Compulsory' | 'Elective';
  total_marks: number;
  passing_marks: number;
  is_optional: boolean;
  description?: string;
  is_active: boolean;
  teacher_id?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  school_id: string;
  employee_id: string; // e.g. EMP-101
  name: string;
  father_name: string;
  cnic: string; // e.g. 35202-1234567-1
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  address: string;
  province: string;
  district: string;
  qualification: string;
  experience_years: number;
  designation: string; // e.g. Senior Subject Teacher, Principal, Admin Clerk, Accountant, Lab Attendant
  department: 'Teaching' | 'Administration' | 'Accounts' | 'Support' | 'Sports';
  joining_date: string;
  basic_salary: number;
  photo_url?: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  session_id: string;
  class_id: string;
  section_id: string;
  admission_number: string; // e.g. ADM-2026-0042
  name: string;
  father_name: string;
  mother_name?: string;
  dob: string;
  gender: 'Male' | 'Female';
  b_form_no: string; // e.g. 35201-1234567-3
  student_phone?: string;
  guardian_phone: string;
  emergency_contact: string;
  address: string;
  province: string;
  district: string;
  tehsil?: string;
  previous_school?: string;
  admission_date: string;
  photo_url?: string;
  scholarship_discount_percent: number; // e.g. 10%
  optional_subject_ids?: string[];
  status: 'Active' | 'Promoted' | 'Transferred' | 'Struck Off' | 'Graduated';
  created_at: string;
  roll_number?: string;
  monthly_tuition_fee?: number;
  admission_fee?: number;
  class_name?: string;
  section_name?: string;
  phone?: string;
  guardian_relation?: string;
}

export interface AdmissionLetterRecord {
  id: string;
  school_id: string;
  student_id: string;
  letter_number: string;
  admission_fee: number;
  annual_fee: number;
  monthly_tuition_fee: number;
  other_charges: number;
  discount_amount: number;
  total_payable: number;
  amount_paid: number;
  pending_balance: number;
  due_date: string;
  remarks?: string;
  created_at: string;
}

export interface FeeCategory {
  id: string;
  school_id: string;
  name: string; // e.g. "Tuition Fee", "Admission Fee", "Exam Fee", "Transport Fee", "Laboratory Charges"
  default_amount: number;
  frequency: 'Monthly' | 'Annual' | 'One-Time' | 'Per-Exam';
  created_at: string;
}

export interface FeeChallan {
  id: string;
  school_id: string;
  challan_number: string; // e.g. CHN-2026-10492
  student_id: string;
  session_id: string;
  class_id: string;
  section_id: string;
  month: string; // e.g. "October 2026"
  issue_date: string;
  due_date: string;
  tuition_fee: number;
  admission_fee: number;
  annual_charges: number;
  exam_fee: number;
  transport_fee: number;
  other_charges: number;
  previous_arrears: number;
  late_fine: number;
  concession_discount: number;
  total_payable: number;
  paid_amount: number;
  remaining_balance: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid';
  created_at: string;
  month_year?: string;
  late_fine_per_day?: number;
  items?: Array<{ category: string; amount: number }>;
}

export interface FeePayment {
  id: string;
  school_id: string;
  challan_id: string;
  receipt_number: string; // e.g. RCPT-2026-8812
  student_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_ref?: string;
  received_by: string;
  remarks?: string;
  is_reversed?: boolean;
  reversal_reason?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  type: 'Student' | 'Staff';
  entity_id: string; // student_id or staff_id
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
  class_id?: string;
  section_id?: string;
  created_at?: string;
}

export interface Exam {
  id: string;
  school_id: string;
  session_id: string;
  name: string; // e.g. "First Term Examination 2026", "Final Annual Exams"
  exam_type: 'Monthly Test' | 'Weekly Test' | 'Midterm' | 'Final Exam' | 'Annual Exam' | 'Custom';
  start_date: string;
  end_date: string;
  is_published: boolean;
  created_at: string;
}

export interface ExamMarks {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  total_marks: number;
  passing_marks: number;
  obtained_marks: number;
  remarks?: string;
  class_id?: string;
  created_at: string;
}

export interface QuestionPaperItem {
  id: string;
  question_type: 'MCQ' | 'Short' | 'Long' | 'FillBlank' | 'TrueFalse' | 'Matching';
  text: string;
  urdu_text?: string;
  marks: number;
  options?: string[]; // for MCQs
  answer_key?: string;
}

export interface QuestionPaper {
  id: string;
  school_id: string;
  exam_id?: string;
  class_id: string;
  subject_id: string;
  title: string;
  instructions: string;
  duration_minutes: number;
  total_marks: number;
  questions: QuestionPaperItem[];
  is_published: boolean;
  created_at: string;
}

export interface DateSheetItem {
  id: string;
  subject_id: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_no?: string;
  instructions?: string;
}

export interface DateSheet {
  id: string;
  school_id: string;
  exam_id: string;
  class_id: string;
  items: DateSheetItem[];
  general_instructions: string;
  is_published: boolean;
  created_at: string;
}

export interface SyllabusChapter {
  id: string;
  chapter_number: number;
  title: string;
  urdu_title?: string;
  topics: string[];
  page_range?: string;
  is_completed: boolean;
}

export interface Syllabus {
  id: string;
  school_id: string;
  session_id: string;
  class_id: string;
  subject_id: string;
  book_name: string;
  publisher: string;
  edition: string;
  chapters: SyllabusChapter[];
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  school_id: string;
  class_id: string;
  section_id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period_number: number;
  start_time: string; // e.g. "08:00 AM"
  end_time: string; // e.g. "08:45 AM"
  subject_id: string;
  teacher_id: string;
  room_number?: string;
}

export interface SalaryRecord {
  id: string;
  school_id: string;
  staff_id: string;
  month: string; // e.g. "October 2026"
  basic_salary: number;
  allowances: number;
  deductions: number;
  advance_salary: number;
  net_payable: number;
  paid_amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  status: 'Paid' | 'Unpaid' | 'Partial';
  slip_number: string;
  created_at: string;
}

export interface Account {
  id: string;
  school_id: string;
  name: string; // e.g. "Petty Cash", "Meezan Bank Principal Account", "HBL Fee Account"
  account_type: 'Cash' | 'Bank';
  account_number?: string;
  opening_balance: number;
  current_balance: number;
  created_at: string;
}

export interface FinancialTransaction {
  id: string;
  school_id: string;
  account_id: string;
  transaction_type: 'Income' | 'Expense';
  category: 'Fee Collection' | 'Staff Salary' | 'Utility Bills' | 'Maintenance' | 'Lab Supplies' | 'Stationery' | 'Events' | 'Other';
  amount: number;
  date: string;
  reference_no?: string;
  description: string;
  created_at: string;
}

export interface LibraryBook {
  id: string;
  school_id: string;
  accession_number: string;
  title: string;
  author: string;
  publisher: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  school_id: string;
  item_name: string;
  category: 'Stationery' | 'Lab Equipment' | 'Furniture' | 'Sports' | 'IT / Electronics';
  quantity_in_stock: number;
  minimum_alert_level: number;
  unit: string; // e.g. "Pcs", "Boxes", "Sets"
  created_at: string;
}

export interface TransportRoute {
  id: string;
  school_id: string;
  route_name: string; // e.g. "Route 1 - Gulberg / DHA"
  vehicle_number: string; // e.g. "LEC-2024"
  driver_name: string;
  driver_phone: string;
  monthly_fare: number;
  stops: string[];
  student_count: number;
  created_at: string;
}

export interface CertificateRecord {
  id: string;
  school_id: string;
  student_id: string;
  certificate_type: 'Character' | 'School Leaving' | 'Bonafide' | 'Transfer' | 'Academic Achievement';
  certificate_number: string; // e.g. CERT-2026-9021
  issue_date: string;
  content_text: string;
  character_conduct?: string;
  reason_for_leaving?: string;
  signed_by: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  school_id: string;
  ticket_number: string; // e.g. TKT-9812
  category: 'Login Issue' | 'Registration' | 'Subscription' | 'Payment' | 'Technical Issue' | 'Fee Management' | 'Student Management' | 'Other';
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting for School' | 'Resolved' | 'Closed';
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'School' | 'Super Admin';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface SchoolNotice {
  id: string;
  school_id: string;
  title: string;
  body: string;
  category: 'General Notice' | 'Fee Reminder' | 'Exam Notice' | 'Holiday' | 'Urgent Alert';
  target_audience: 'All' | 'Specific Class' | 'Staff Only';
  class_id?: string;
  sent_via_whatsapp?: boolean;
  published_at: string;
  created_at: string;
}
