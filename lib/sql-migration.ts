/**
 * Complete SQL Migration Script for Pakistan School Management SaaS
 * Execute in Supabase SQL Editor to provision all tables, indices, and RLS policies
 */
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- PAKISTAN SCHOOL MANAGEMENT SAAS - COMPREHENSIVE SUPABASE SCHEMA & RLS
-- Multi-Tenant Database Architecture
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SCHOOL APPLICATIONS (For Registration & Super Admin Approval)
CREATE TABLE IF NOT EXISTS public.school_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(50) UNIQUE NOT NULL,
    school_name_en VARCHAR(255) NOT NULL,
    school_name_ur VARCHAR(255) NOT NULL,
    school_type VARCHAR(100) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    principal_name VARCHAR(255) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    complete_address TEXT NOT NULL,
    student_count_estimate INT DEFAULT 100,
    teacher_count_estimate INT DEFAULT 10,
    branches_count INT DEFAULT 1,
    registration_number VARCHAR(100),
    registration_docs_url TEXT,
    selected_plan VARCHAR(50) DEFAULT 'Standard',
    selected_duration VARCHAR(50) DEFAULT 'Monthly',
    status VARCHAR(50) DEFAULT 'Pending',
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCHOOLS (Approved Schools)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_ur VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    school_type VARCHAR(100) NOT NULL,
    registration_no VARCHAR(100),
    owner_name VARCHAR(255) NOT NULL,
    principal_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    logo_url TEXT,
    stamp_url TEXT,
    signature_url TEXT,
    active_session_id UUID,
    school_timings VARCHAR(100) DEFAULT '08:00 AM - 01:30 PM',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHOOL SUBSCRIPTIONS & PAYMENTS
CREATE TABLE IF NOT EXISTS public.school_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price_pkr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_approval',
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    student_limit INT DEFAULT 500,
    staff_limit INT DEFAULT 50,
    branch_limit INT DEFAULT 1,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_date DATE,
    depositor_name VARCHAR(255),
    payment_screenshot_url TEXT,
    payment_status VARCHAR(50) DEFAULT 'Pending Verification',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACADEMIC SESSIONS
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    numeric_order INT DEFAULT 1,
    head_teacher_id UUID,
    capacity INT DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SECTIONS
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    in_charge_teacher_id UUID,
    room_number VARCHAR(50),
    capacity INT DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBJECTS (Manual Subject Creation)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_ur VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) DEFAULT 'Compulsory',
    total_marks INT DEFAULT 100,
    passing_marks INT DEFAULT 33,
    is_optional BOOLEAN DEFAULT false,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    teacher_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STAFF & TEACHERS
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    cnic VARCHAR(50) NOT NULL,
    dob DATE,
    gender VARCHAR(20) DEFAULT 'Male',
    mobile VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience_years INT DEFAULT 0,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(50) DEFAULT 'Teaching',
    joining_date DATE NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    photo_url TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    admission_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255),
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    b_form_no VARCHAR(50) NOT NULL,
    student_phone VARCHAR(50),
    guardian_phone VARCHAR(50) NOT NULL,
    emergency_contact VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100),
    previous_school VARCHAR(255),
    admission_date DATE NOT NULL,
    photo_url TEXT,
    scholarship_discount_percent NUMERIC(5, 2) DEFAULT 0,
    optional_subject_ids JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FEE CATEGORIES
CREATE TABLE IF NOT EXISTS public.fee_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    default_amount NUMERIC(10, 2) DEFAULT 0,
    frequency VARCHAR(50) DEFAULT 'Monthly',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FEE CHALLANS
CREATE TABLE IF NOT EXISTS public.fee_challans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    challan_number VARCHAR(100) NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    month VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    tuition_fee NUMERIC(10, 2) DEFAULT 0,
    admission_fee NUMERIC(10, 2) DEFAULT 0,
    annual_charges NUMERIC(10, 2) DEFAULT 0,
    exam_fee NUMERIC(10, 2) DEFAULT 0,
    transport_fee NUMERIC(10, 2) DEFAULT 0,
    other_charges NUMERIC(10, 2) DEFAULT 0,
    previous_arrears NUMERIC(10, 2) DEFAULT 0,
    late_fine NUMERIC(10, 2) DEFAULT 0,
    concession_discount NUMERIC(10, 2) DEFAULT 0,
    total_payable NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    remaining_balance NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FEE PAYMENTS
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    challan_id UUID REFERENCES public.fee_challans(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_ref VARCHAR(100),
    received_by VARCHAR(255) NOT NULL,
    remarks TEXT,
    is_reversed BOOLEAN DEFAULT false,
    reversal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'Student' or 'Staff'
    entity_id UUID NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'Present', 'Absent', 'Late', 'Leave'
    remarks TEXT,
    class_id UUID,
    section_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, type, entity_id, date)
);

-- 15. EXAMS & MARKS
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    total_marks INT NOT NULL,
    passing_marks INT NOT NULL,
    obtained_marks NUMERIC(6, 2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, exam_id, student_id, subject_id)
);

-- 16. QUESTION PAPERS
CREATE TABLE IF NOT EXISTS public.question_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    duration_minutes INT DEFAULT 90,
    total_marks INT DEFAULT 50,
    questions JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. DATE SHEETS
CREATE TABLE IF NOT EXISTS public.date_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    general_instructions TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. SYLLABI
CREATE TABLE IF NOT EXISTS public.syllabi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    book_name VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    edition VARCHAR(100),
    chapters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. TIMETABLE
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    period_number INT NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. SALARY & PAYROLL
CREATE TABLE IF NOT EXISTS public.salary_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    month VARCHAR(50) NOT NULL,
    basic_salary NUMERIC(10, 2) NOT NULL,
    allowances NUMERIC(10, 2) DEFAULT 0,
    deductions NUMERIC(10, 2) DEFAULT 0,
    advance_salary NUMERIC(10, 2) DEFAULT 0,
    net_payable NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    payment_date DATE,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    status VARCHAR(50) DEFAULT 'Paid',
    slip_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. ACCOUNTS & FINANCIAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    account_number VARCHAR(100),
    opening_balance NUMERIC(12, 2) DEFAULT 0,
    current_balance NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'Income' or 'Expense'
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL,
    reference_no VARCHAR(100),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. CERTIFICATES & SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL,
    certificate_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    content_text TEXT NOT NULL,
    character_conduct VARCHAR(100),
    reason_for_leaving TEXT,
    signed_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'All',
    class_id UUID,
    sent_via_whatsapp BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. SUPPORT TICKET MESSAGES
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SCHEMA & ROLE PERMISSIONS
-- Grant anon and authenticated access to tables, sequences and functions
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS and create safe non-restrictive policies for multi-tenancy
-- ==============================================================================
ALTER TABLE public.school_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies (Safe to run multiple times without conflict)
DO $$
BEGIN
    -- Applications
    DROP POLICY IF EXISTS "Allow all on school_applications" ON public.school_applications;
    CREATE POLICY "Allow all on school_applications" ON public.school_applications FOR ALL USING (true) WITH CHECK (true);

    -- Schools
    DROP POLICY IF EXISTS "Allow all on schools" ON public.schools;
    CREATE POLICY "Allow all on schools" ON public.schools FOR ALL USING (true) WITH CHECK (true);

    -- School Subscriptions
    DROP POLICY IF EXISTS "Allow all on school_subscriptions" ON public.school_subscriptions;
    CREATE POLICY "Allow all on school_subscriptions" ON public.school_subscriptions FOR ALL USING (true) WITH CHECK (true);

    -- Academic Sessions
    DROP POLICY IF EXISTS "Allow all on academic_sessions" ON public.academic_sessions;
    CREATE POLICY "Allow all on academic_sessions" ON public.academic_sessions FOR ALL USING (true) WITH CHECK (true);

    -- Classes
    DROP POLICY IF EXISTS "Allow all on classes" ON public.classes;
    CREATE POLICY "Allow all on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);

    -- Sections
    DROP POLICY IF EXISTS "Allow all on sections" ON public.sections;
    CREATE POLICY "Allow all on sections" ON public.sections FOR ALL USING (true) WITH CHECK (true);

    -- Subjects
    DROP POLICY IF EXISTS "Allow all on subjects" ON public.subjects;
    CREATE POLICY "Allow all on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

    -- Staff
    DROP POLICY IF EXISTS "Allow all on staff" ON public.staff;
    CREATE POLICY "Allow all on staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

    -- Students
    DROP POLICY IF EXISTS "Allow all on students" ON public.students;
    CREATE POLICY "Allow all on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    -- Fee Categories
    DROP POLICY IF EXISTS "Allow all on fee_categories" ON public.fee_categories;
    CREATE POLICY "Allow all on fee_categories" ON public.fee_categories FOR ALL USING (true) WITH CHECK (true);

    -- Fee Challans
    DROP POLICY IF EXISTS "Allow all on fee_challans" ON public.fee_challans;
    CREATE POLICY "Allow all on fee_challans" ON public.fee_challans FOR ALL USING (true) WITH CHECK (true);

    -- Fee Payments
    DROP POLICY IF EXISTS "Allow all on fee_payments" ON public.fee_payments;
    CREATE POLICY "Allow all on fee_payments" ON public.fee_payments FOR ALL USING (true) WITH CHECK (true);

    -- Attendance
    DROP POLICY IF EXISTS "Allow all on attendance" ON public.attendance;
    CREATE POLICY "Allow all on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

    -- Exams
    DROP POLICY IF EXISTS "Allow all on exams" ON public.exams;
    CREATE POLICY "Allow all on exams" ON public.exams FOR ALL USING (true) WITH CHECK (true);

    -- Exam Marks
    DROP POLICY IF EXISTS "Allow all on exam_marks" ON public.exam_marks;
    CREATE POLICY "Allow all on exam_marks" ON public.exam_marks FOR ALL USING (true) WITH CHECK (true);

    -- Question Papers
    DROP POLICY IF EXISTS "Allow all on question_papers" ON public.question_papers;
    CREATE POLICY "Allow all on question_papers" ON public.question_papers FOR ALL USING (true) WITH CHECK (true);

    -- Date Sheets
    DROP POLICY IF EXISTS "Allow all on date_sheets" ON public.date_sheets;
    CREATE POLICY "Allow all on date_sheets" ON public.date_sheets FOR ALL USING (true) WITH CHECK (true);

    -- Syllabi
    DROP POLICY IF EXISTS "Allow all on syllabi" ON public.syllabi;
    CREATE POLICY "Allow all on syllabi" ON public.syllabi FOR ALL USING (true) WITH CHECK (true);

    -- Timetable Slots
    DROP POLICY IF EXISTS "Allow all on timetable_slots" ON public.timetable_slots;
    CREATE POLICY "Allow all on timetable_slots" ON public.timetable_slots FOR ALL USING (true) WITH CHECK (true);

    -- Salary Records
    DROP POLICY IF EXISTS "Allow all on salary_records" ON public.salary_records;
    CREATE POLICY "Allow all on salary_records" ON public.salary_records FOR ALL USING (true) WITH CHECK (true);

    -- Accounts
    DROP POLICY IF EXISTS "Allow all on accounts" ON public.accounts;
    CREATE POLICY "Allow all on accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);

    -- Financial Transactions
    DROP POLICY IF EXISTS "Allow all on financial_transactions" ON public.financial_transactions;
    CREATE POLICY "Allow all on financial_transactions" ON public.financial_transactions FOR ALL USING (true) WITH CHECK (true);

    -- Certificates
    DROP POLICY IF EXISTS "Allow all on certificates" ON public.certificates;
    CREATE POLICY "Allow all on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

    -- Support Tickets
    DROP POLICY IF EXISTS "Allow all on support_tickets" ON public.support_tickets;
    CREATE POLICY "Allow all on support_tickets" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);

    -- Support Ticket Messages
    DROP POLICY IF EXISTS "Allow all on support_ticket_messages" ON public.support_ticket_messages;
    CREATE POLICY "Allow all on support_ticket_messages" ON public.support_ticket_messages FOR ALL USING (true) WITH CHECK (true);

    -- Notices
    DROP POLICY IF EXISTS "Allow all on notices" ON public.notices;
    CREATE POLICY "Allow all on notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- Create buckets for school logos, student documents, staff credentials, payment proofs
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('school-assets', 'school-assets', true),
  ('student-documents', 'student-documents', true),
  ('staff-documents', 'staff-documents', true),
  ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read School Assets" ON storage.objects;
CREATE POLICY "Public Read School Assets" ON storage.objects FOR SELECT USING (bucket_id IN ('school-assets', 'student-documents', 'staff-documents', 'payment-proofs'));

DROP POLICY IF EXISTS "Public Upload School Assets" ON storage.objects;
CREATE POLICY "Public Upload School Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('school-assets', 'student-documents', 'staff-documents', 'payment-proofs'));

DROP POLICY IF EXISTS "Public Update School Assets" ON storage.objects;
CREATE POLICY "Public Update School Assets" ON storage.objects FOR UPDATE USING (bucket_id IN ('school-assets', 'student-documents', 'staff-documents', 'payment-proofs'));
`;

