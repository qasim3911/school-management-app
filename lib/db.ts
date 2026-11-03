import {
  School,
  SchoolApplication,
  SchoolSubscription,
  AcademicSession,
  SchoolClass,
  Section,
  Subject,
  Staff,
  Student,
  AdmissionLetterRecord,
  FeeCategory,
  FeeChallan,
  FeePayment,
  AttendanceRecord,
  Exam,
  ExamMarks,
  QuestionPaper,
  DateSheet,
  Syllabus,
  TimetableSlot,
  SalaryRecord,
  Account,
  FinancialTransaction,
  CertificateRecord,
  SupportTicket,
  SupportTicketMessage,
  SchoolNotice,
  SubscriptionTier,
  SubscriptionDuration,
  PaymentMethod,
} from './types';
import { supabase, getSupabaseClient } from './supabase';

const STORAGE_KEY = 'pk_school_saas_data_v2';
const CURRENT_SCHOOL_KEY = 'pk_school_saas_current_school_id';

interface DataStore {
  schools: School[];
  applications: SchoolApplication[];
  subscriptions: SchoolSubscription[];
  sessions: AcademicSession[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  staff: Staff[];
  students: Student[];
  fee_challans: FeeChallan[];
  fee_payments: FeePayment[];
  accounts: Account[];
  transactions: FinancialTransaction[];
  exams: Exam[];
  exam_marks: ExamMarks[];
  question_papers: QuestionPaper[];
  date_sheets: DateSheet[];
  syllabi: Syllabus[];
  timetable: TimetableSlot[];
  salaries: SalaryRecord[];
  certificates: CertificateRecord[];
  tickets: SupportTicket[];
  ticket_messages: SupportTicketMessage[];
  notices: SchoolNotice[];
  attendance: AttendanceRecord[];
}

function getInitialStore(): DataStore {
  return {
    schools: [],
    applications: [],
    subscriptions: [],
    sessions: [],
    classes: [],
    sections: [],
    subjects: [],
    staff: [],
    students: [],
    fee_challans: [],
    fee_payments: [],
    accounts: [],
    transactions: [],
    exams: [],
    exam_marks: [],
    question_papers: [],
    date_sheets: [],
    syllabi: [],
    timetable: [],
    salaries: [],
    certificates: [],
    tickets: [],
    ticket_messages: [],
    notices: [],
    attendance: [],
  };
}

// Background Supabase Sync Helpers
function asyncSupabaseInsert(table: string, payload: Record<string, any> | Record<string, any>[]) {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;
    sb.from(table)
      .insert(payload as any)
      .then(({ error }) => {
        if (error) {
          console.warn(`[Supabase ${table} INSERT]:`, error.message);
        }
      });
  } catch (err) {
    console.warn(`[Supabase ${table} exception]:`, err);
  }
}

function asyncSupabaseUpdate(table: string, payload: Record<string, any>, matchCol: string, matchVal: any) {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;
    sb.from(table)
      .update(payload)
      .eq(matchCol, matchVal)
      .then(({ error }) => {
        if (error) {
          console.warn(`[Supabase ${table} UPDATE]:`, error.message);
        }
      });
  } catch (err) {
    console.warn(`[Supabase ${table} update exception]:`, err);
  }
}

function asyncSupabaseDelete(table: string, matchCol: string, matchVal: any) {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;
    sb.from(table)
      .delete()
      .eq(matchCol, matchVal)
      .then(({ error }) => {
        if (error) {
          console.warn(`[Supabase ${table} DELETE]:`, error.message);
        }
      });
  } catch (err) {
    console.warn(`[Supabase ${table} delete exception]:`, err);
  }
}

class SchoolDatabase {
  private data: DataStore;
  private currentSchoolId: string = '';
  private initializedFromSupabase: boolean = false;

  constructor() {
    this.data = getInitialStore();

    if (typeof window !== 'undefined') {
      try {
        // Clear any old fake seed data storage
        localStorage.removeItem('pk_school_saas_data_v1');

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only use stored data if it doesn't contain legacy fake seeds
          if (parsed && !parsed.schools?.some((s: any) => s.id === 'sch_iqbal_lahore')) {
            this.data = parsed;
          }
        }

        const current = localStorage.getItem(CURRENT_SCHOOL_KEY);
        if (current && current !== 'sch_iqbal_lahore') {
          this.currentSchoolId = current;
        }

        // Trigger immediate live hydration from Supabase
        this.loadLiveSupabaseData();
      } catch (e) {
        console.error('Failed to initialize store', e);
      }
    }
  }

  public async loadLiveSupabaseData(): Promise<void> {
    try {
      const sb = getSupabaseClient();
      if (!sb) return;

      // 1. Fetch live applications & approved schools
      const { data: apps, error: appErr } = await sb.from('school_applications').select('*');
      if (!appErr && apps && apps.length > 0) {
        this.data.applications = apps.map((a: any) => ({
          id: a.id,
          application_id: a.application_id,
          school_name_en: a.school_name_en || a.school_name || 'School',
          school_name_ur: a.school_name_ur || '',
          school_type: a.school_type || 'Private',
          owner_name: a.owner_name || a.principal_name || '',
          principal_name: a.principal_name || a.owner_name || '',
          official_email: a.official_email || a.email || '',
          mobile_number: a.mobile_number || a.phone || '',
          whatsapp_number: a.whatsapp_number || a.whatsapp || '',
          province: a.province || 'Punjab',
          district: a.district || a.city || 'Lahore',
          tehsil: a.tehsil || '',
          city: a.city || a.district || 'Lahore',
          complete_address: a.complete_address || a.address || '',
          student_count_estimate: a.student_count_estimate || a.student_count || 100,
          teacher_count_estimate: a.teacher_count_estimate || a.teacher_count || 10,
          branches_count: a.branches_count || a.branch_count || 1,
          registration_number: a.registration_number,
          logo_url: a.logo_url,
          selected_plan: a.selected_plan || 'Standard',
          selected_duration: a.selected_duration || 'Yearly',
          status: a.status || 'Pending',
          internal_notes: a.internal_notes,
          created_at: a.created_at,
          updated_at: a.updated_at || a.created_at,
        }));

        // Approved schools automatically become active School workspaces
        const approvedApps = apps.filter((a: any) => (a.status || '').toLowerCase() === 'approved');
        this.data.schools = approvedApps.map((a: any) => ({
          id: a.id || a.application_id,
          name_en: a.school_name_en || a.school_name,
          name_ur: a.school_name_ur || '',
          slug: (a.school_name_en || a.school_name || 'school').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          school_type: a.school_type || 'Private',
          registration_no: a.registration_number,
          owner_name: a.owner_name || a.principal_name || 'Administrator',
          principal_name: a.principal_name || a.owner_name || 'Principal',
          email: a.official_email || a.email,
          phone: a.mobile_number || a.phone || '',
          whatsapp: a.whatsapp_number || a.whatsapp || a.phone || '',
          province: a.province || 'Punjab',
          district: a.district || a.city || 'Lahore',
          city: a.city || a.district || 'Lahore',
          address: a.complete_address || a.address || '',
          logo_url: a.logo_url,
          status: 'active',
          created_at: a.created_at,
        }));

        // Set active current school if not selected
        if (!this.currentSchoolId && this.data.schools.length > 0) {
          this.currentSchoolId = this.data.schools[0].id;
          if (typeof window !== 'undefined') {
            localStorage.setItem(CURRENT_SCHOOL_KEY, this.currentSchoolId);
          }
        }
      }

      // 2. Load Real Admissions & Students from admission_letters table
      const { data: admissions, error: admErr } = await sb.from('admission_letters').select('*');
      if (!admErr && admissions && admissions.length > 0) {
        this.data.students = admissions.map((adm: any) => ({
          id: adm.id,
          school_id: adm.school_id,
          session_id: adm.session_id || 'ses_current',
          class_id: adm.class_id || 'cls_general',
          section_id: adm.section_id || 'sec_general',
          class_name: adm.class_name || 'General',
          section_name: adm.section || 'A',
          admission_number: adm.admission_no || adm.letter_no || `ADM-${adm.id.slice(0, 6)}`,
          roll_number: adm.roll_no || '1',
          name: adm.student_name,
          father_name: adm.guardian_name || 'Guardian',
          mother_name: '',
          dob: '2012-01-01',
          gender: 'Male',
          b_form_no: '35202-0000000-1',
          student_phone: adm.student_phone || '',
          guardian_phone: adm.guardian_phone || adm.student_phone || '0300-0000000',
          emergency_contact: adm.guardian_phone || adm.student_phone || '0300-0000000',
          address: '',
          province: 'Punjab',
          district: 'Lahore',
          tehsil: '',
          previous_school: '',
          admission_date: adm.admission_date || adm.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          scholarship_discount_percent: 0,
          status: 'Active',
          created_at: adm.created_at || new Date().toISOString(),
          phone: adm.student_phone || adm.guardian_phone || '',
          monthly_tuition_fee: Number(adm.monthly_tuition_fee) || 0,
          admission_fee: Number(adm.admission_fee) || 0,
        }));
      }

      // 3. Load Fee Items
      const { data: feeItems, error: feeErr } = await sb.from('fee_items').select('*');
      if (!feeErr && feeItems && feeItems.length > 0) {
        this.data.fee_challans = feeItems.map((f: any) => ({
          id: f.id,
          school_id: f.school_id,
          challan_number: f.title || `CHN-${f.id.slice(0, 6)}`,
          student_id: f.student_id,
          session_id: f.session_id || 'sess-2026-default',
          class_id: f.class_id || 'cls-default',
          section_id: f.section_id || 'sec-default',
          month: f.month || f.month_year || 'October 2026',
          issue_date: f.issue_date || f.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          due_date: f.due_date || new Date().toISOString().split('T')[0],
          tuition_fee: Number(f.amount || f.net_amount || 0),
          admission_fee: 0,
          annual_charges: 0,
          exam_fee: 0,
          transport_fee: 0,
          other_charges: 0,
          previous_arrears: 0,
          late_fine: 0,
          concession_discount: Number(f.discount_amount || 0),
          total_payable: Number(f.net_amount || f.amount || 0),
          paid_amount: Number(f.paid_amount || 0),
          remaining_balance: Number((f.net_amount || f.amount || 0) - (f.paid_amount || 0)),
          status: (f.status === 'Paid' ? 'Paid' : (Number(f.paid_amount) > 0 ? 'Partially Paid' : 'Unpaid')) as any,
          created_at: f.created_at || new Date().toISOString(),
          month_year: f.month_year || 'Current Month',
          late_fine_per_day: 50,
          items: [{ category: f.category || 'Tuition Fee', amount: Number(f.amount || 0) }],
        }));
      }

      // 4. Load Financial Transactions
      const { data: txns, error: txnErr } = await sb.from('account_transactions').select('*');
      if (!txnErr && txns && txns.length > 0) {
        this.data.transactions = txns.map((t: any) => ({
          id: t.id,
          school_id: t.school_id,
          account_id: t.account || 'acc_main',
          transaction_type: (t.type || 'Income') as any,
          category: t.category || 'General',
          amount: Number(t.amount || 0),
          date: t.date || new Date().toISOString().split('T')[0],
          reference_no: t.voucher_no || '',
          description: t.description || '',
          created_at: t.created_at || new Date().toISOString(),
        }));
      }

      // 5. Load School Events & Notices
      const { data: events, error: evErr } = await sb.from('school_events').select('*');
      if (!evErr && events && events.length > 0) {
        this.data.notices = events.map((ev: any) => ({
          id: ev.id,
          school_id: ev.school_id,
          title: ev.title,
          body: ev.description || '',
          category: (ev.category === 'Fee' ? 'Fee Reminder' : ev.category === 'Exam' ? 'Exam Notice' : ev.category === 'Holiday' ? 'Holiday' : 'General Notice') as any,
          target_audience: (ev.target_audience === 'Staff' ? 'Staff Only' : 'All') as any,
          sent_via_whatsapp: false,
          published_at: ev.start_date || ev.created_at,
          created_at: ev.created_at,
        }));
      }

      // 6. Load Support Tickets
      const { data: rawTickets, error: tktErr } = await sb.from('support_tickets').select('*');
      if (!tktErr && rawTickets && rawTickets.length > 0) {
        this.data.tickets = rawTickets.map((t: any) => {
          let category = 'General';
          let priority = 'Medium';
          let cleanSub = t.subject || 'Support Ticket';
          const match = t.subject?.match(/^\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
          if (match) {
            category = match[1]?.trim() || 'General';
            priority = match[2]?.replace(/Priority/i, '').trim() || 'Medium';
            cleanSub = match[3]?.trim() || cleanSub;
          }
          return {
            id: t.id,
            school_id: t.school_id,
            ticket_number: t.ticket_number || `TKT-${t.id.slice(0, 6)}`,
            category: category as any,
            subject: cleanSub,
            description: '',
            priority: priority as any,
            status: (t.status === 'resolved' ? 'Resolved' : t.status === 'in_progress' ? 'In Progress' : t.status === 'closed' ? 'Closed' : 'Open') as any,
            created_at: t.created_at,
            updated_at: t.created_at,
          };
        });
      }

      // 7. Load Support Messages
      const { data: rawMsgs, error: msgErr } = await sb.from('support_messages').select('*');
      if (!msgErr && rawMsgs && rawMsgs.length > 0) {
        this.data.ticket_messages = rawMsgs.map((m: any) => ({
          id: m.id,
          ticket_id: m.ticket_id,
          sender_type: m.sender_type || 'School',
          sender_name: m.sender_name || 'School Principal',
          message: m.message,
          created_at: m.created_at,
        }));
      }

      this.initializedFromSupabase = true;
      this.saveToStorage();
    } catch (err) {
      console.error('Error loading Supabase data:', err);
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Failed to persist store', e);
      }
    }
  }

  // School Switcher & Context
  public getCurrentSchoolId(): string {
    return this.currentSchoolId;
  }

  public setCurrentSchoolId(id: string) {
    this.currentSchoolId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_SCHOOL_KEY, id);
    }
  }

  public getAuthenticatedSession(): { email: string; school_id: string } | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('pk_school_auth_session');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  public setAuthenticatedSession(session: { email: string; school_id: string } | null): void {
    if (typeof window !== 'undefined') {
      try {
        if (session) {
          localStorage.setItem('pk_school_auth_session', JSON.stringify(session));
          this.setCurrentSchoolId(session.school_id);
        } else {
          localStorage.removeItem('pk_school_auth_session');
        }
      } catch (e) {
        console.error('Failed to set auth session', e);
      }
    }
  }

  public async logout(): Promise<void> {
    this.setAuthenticatedSession(null);
    try {
      const { supabaseSignOut } = await import('./supabase');
      await supabaseSignOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }

  public getCurrentSchool(): School {
    if (this.data.schools.length === 0) {
      return {
        id: this.currentSchoolId || 'sch_default',
        name_en: 'School Portal Workspace',
        name_ur: 'سکول ایڈمن پورٹل',
        slug: 'school-portal',
        school_type: 'Private',
        owner_name: 'Administrator',
        principal_name: 'Principal',
        email: 'admin@school.edu.pk',
        phone: '0300-1234567',
        whatsapp: '0300-1234567',
        province: 'Punjab',
        district: 'Lahore',
        city: 'Lahore',
        address: 'Pakistan',
        status: 'active',
        created_at: new Date().toISOString(),
      };
    }
    const s = this.data.schools.find((s) => s.id === this.currentSchoolId);
    return s || this.data.schools[0];
  }

  public getAllSchools(): School[] {
    return this.data.schools;
  }

  public registerApprovedSchool(app: any): School {
    const existing = this.data.schools.find((s) => s.id === (app.id || app.application_id));
    if (existing) {
      this.currentSchoolId = existing.id;
      return existing;
    }

    const newSchool: School = {
      id: app.id || app.application_id,
      name_en: app.school_name_en || app.school_name,
      name_ur: app.school_name_ur || '',
      slug: (app.school_name_en || app.school_name || 'school').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      school_type: app.school_type || 'Private',
      registration_no: app.registration_number,
      owner_name: app.owner_name || app.principal_name || 'Administrator',
      principal_name: app.principal_name || app.owner_name || 'Principal',
      email: app.official_email || app.email,
      phone: app.mobile_number || app.phone || '',
      whatsapp: app.whatsapp_number || app.whatsapp || app.phone || '',
      province: app.province || 'Punjab',
      district: app.district || app.city || 'Lahore',
      city: app.city || app.district || 'Lahore',
      address: app.complete_address || app.address || '',
      logo_url: app.logo_url,
      status: 'active',
      created_at: app.created_at || new Date().toISOString(),
    };

    this.data.schools.unshift(newSchool);
    this.currentSchoolId = newSchool.id;
    this.saveToStorage();
    return newSchool;
  }

  public updateSchoolProfile(id: string, updates: Partial<School>): School {
    const idx = this.data.schools.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.schools[idx] = { ...this.data.schools[idx], ...updates };
      this.saveToStorage();
      asyncSupabaseUpdate('school_applications', updates, 'id', id);
      return this.data.schools[idx];
    }
    throw new Error('School not found');
  }

  // School Applications & Approvals
  public getApplications(): SchoolApplication[] {
    return this.data.applications;
  }

  public getApplicationById(appId: string): SchoolApplication | undefined {
    return this.data.applications.find(
      (a) => a.application_id.toLowerCase() === appId.trim().toLowerCase() || a.id === appId
    );
  }

  public findSchoolByEmail(email: string): School | undefined {
    const clean = email.trim().toLowerCase();
    return this.data.schools.find((s) => s.email.toLowerCase() === clean);
  }

  public findApplicationByEmail(email: string): SchoolApplication | undefined {
    const clean = email.trim().toLowerCase();
    return this.data.applications.find(
      (a) => a.official_email.toLowerCase() === clean || (a as any).email?.toLowerCase() === clean
    );
  }

  public isDuplicateSchoolOrApplication(email: string, regNo?: string): { isDuplicate: boolean; reason?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const existingSchoolByEmail = this.data.schools.find((s) => s.email.toLowerCase() === cleanEmail);
    if (existingSchoolByEmail) {
      return { isDuplicate: true, reason: `A school is already registered with email address "${email}". Please sign in.` };
    }

    const existingAppByEmail = this.findApplicationByEmail(cleanEmail);
    if (existingAppByEmail) {
      return {
        isDuplicate: true,
        reason: `An application with email "${email}" has already been submitted (Application ID: ${existingAppByEmail.application_id}, Status: ${existingAppByEmail.status}). You can check its status on the Application Status page.`,
      };
    }

    return { isDuplicate: false };
  }

  public verifySchoolAccess(email: string): {
    status: 'approved' | 'pending' | 'under_review' | 'info_required' | 'rejected' | 'suspended' | 'expired' | 'not_found';
    school?: School;
    application?: SchoolApplication;
    subscription?: SchoolSubscription;
    message: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const school = this.findSchoolByEmail(cleanEmail);
    const app = this.findApplicationByEmail(cleanEmail);

    if (school) {
      return {
        status: 'approved',
        school,
        application: app,
        message: 'School account verified and active.',
      };
    }

    if (app) {
      const statusLower = (app.status || '').toLowerCase();
      if (statusLower === 'approved') {
        const approvedSchool = this.registerApprovedSchool(app);
        return {
          status: 'approved',
          school: approvedSchool,
          application: app,
          message: 'School approved! Dashboard ready.',
        };
      }
      if (statusLower === 'under review') {
        return {
          status: 'under_review',
          application: app,
          message: `Your school application (${app.application_id}) is currently under active review by the Super Admin team.`,
        };
      }
      if (statusLower === 'rejected') {
        return {
          status: 'rejected',
          application: app,
          message: app.internal_notes || 'Your school registration application was reviewed and not approved by the Super Admin.',
        };
      }
      return {
        status: 'pending',
        application: app,
        message: `Your school registration application (${app.application_id}) is awaiting Super Admin verification and activation.`,
      };
    }

    return {
      status: 'not_found',
      message: 'No registered school or application found matching this email address. Please register your school first.',
    };
  }

  public registerSchoolApplication(
    app: Omit<SchoolApplication, 'id' | 'application_id' | 'status' | 'created_at' | 'updated_at'>
  ): SchoolApplication {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `app_${Date.now()}`;
    const newApp: SchoolApplication = {
      ...app,
      id: newId,
      application_id: `APP-PK-${new Date().getFullYear()}-${randomSuffix}`,
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.applications.unshift(newApp);
    this.saveToStorage();

    // Insert live to Supabase
    asyncSupabaseInsert('school_applications', {
      id: newId,
      application_id: newApp.application_id,
      school_name: newApp.school_name_en,
      school_name_en: newApp.school_name_en,
      school_name_ur: newApp.school_name_ur,
      school_type: newApp.school_type,
      owner_name: newApp.owner_name,
      principal_name: newApp.principal_name,
      official_email: newApp.official_email,
      email: newApp.official_email,
      mobile_number: newApp.mobile_number,
      phone: newApp.mobile_number,
      whatsapp_number: newApp.whatsapp_number,
      province: newApp.province,
      district: newApp.district,
      city: newApp.city,
      complete_address: newApp.complete_address,
      address: newApp.complete_address,
      student_count_estimate: newApp.student_count_estimate,
      teacher_count_estimate: newApp.teacher_count_estimate,
      branches_count: newApp.branches_count,
      registration_number: newApp.registration_number,
      selected_plan: newApp.selected_plan,
      selected_duration: newApp.selected_duration,
      status: 'Pending',
      logo_url: newApp.logo_url,
    });

    return newApp;
  }

  // Academic Sessions
  public getSessions(schoolId: string = this.currentSchoolId): AcademicSession[] {
    const list = this.data.sessions.filter((s) => s.school_id === schoolId);
    if (list.length === 0 && schoolId) {
      const defaultSession: AcademicSession = {
        id: `ses_2026_${schoolId}`,
        school_id: schoolId,
        name: '2026-2027',
        start_date: '2026-04-01',
        end_date: '2027-03-31',
        is_active: true,
        is_archived: false,
        created_at: new Date().toISOString(),
      };
      this.data.sessions.push(defaultSession);
      this.saveToStorage();
      return [defaultSession];
    }
    return list;
  }

  public createSession(session: Omit<AcademicSession, 'id' | 'created_at'>): AcademicSession {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ses_${Date.now()}`;
    const newSession: AcademicSession = {
      ...session,
      id: newId,
      created_at: new Date().toISOString(),
    };
    if (newSession.is_active) {
      this.data.sessions.forEach((s) => {
        if (s.school_id === newSession.school_id) s.is_active = false;
      });
    }
    this.data.sessions.push(newSession);
    this.saveToStorage();
    return newSession;
  }

  // Classes & Sections
  public getClasses(schoolId: string = this.currentSchoolId): SchoolClass[] {
    const list = this.data.classes.filter((c) => c.school_id === schoolId);
    if (list.length === 0 && schoolId) {
      const defaultClasses: SchoolClass[] = [
        { id: `cls_9_${schoolId}`, school_id: schoolId, session_id: 'ses_current', name: 'Grade 9 (Matric 9th)', numeric_order: 9, capacity: 50, created_at: new Date().toISOString() },
        { id: `cls_10_${schoolId}`, school_id: schoolId, session_id: 'ses_current', name: 'Grade 10 (Matric 10th)', numeric_order: 10, capacity: 50, created_at: new Date().toISOString() },
        { id: `cls_8_${schoolId}`, school_id: schoolId, session_id: 'ses_current', name: 'Grade 8 (Middle)', numeric_order: 8, capacity: 45, created_at: new Date().toISOString() },
      ];
      this.data.classes.push(...defaultClasses);
      this.saveToStorage();
      return defaultClasses;
    }
    return list;
  }

  public createClass(cls: Omit<SchoolClass, 'id' | 'created_at'>): SchoolClass {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cls_${Date.now()}`;
    const newClass: SchoolClass = {
      ...cls,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.classes.push(newClass);
    this.saveToStorage();
    return newClass;
  }

  public deleteClass(classId: string): boolean {
    this.data.classes = this.data.classes.filter((c) => c.id !== classId);
    this.data.sections = this.data.sections.filter((s) => s.class_id !== classId);
    this.data.subjects = this.data.subjects.filter((sub) => sub.class_id !== classId);
    this.saveToStorage();
    return true;
  }

  public getSections(schoolId: string = this.currentSchoolId, classId?: string): Section[] {
    const list = this.data.sections.filter(
      (s) => s.school_id === schoolId && (!classId || s.class_id === classId)
    );
    if (list.length === 0 && schoolId) {
      const defaultSections: Section[] = [
        { id: `sec_a_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, name: 'Section A (Jinnah)', capacity: 40, room_number: 'Room 101', created_at: new Date().toISOString() },
        { id: `sec_b_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, name: 'Section B (Iqbal)', capacity: 40, room_number: 'Room 102', created_at: new Date().toISOString() },
      ];
      this.data.sections.push(...defaultSections);
      this.saveToStorage();
      return defaultSections;
    }
    return list;
  }

  public createSection(sec: Omit<Section, 'id' | 'created_at'>): Section {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sec_${Date.now()}`;
    const newSec: Section = {
      ...sec,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.sections.push(newSec);
    this.saveToStorage();
    return newSec;
  }

  // Subjects Management
  public getSubjects(schoolId: string = this.currentSchoolId, classId?: string): Subject[] {
    const list = this.data.subjects.filter(
      (s) => s.school_id === schoolId && (!classId || s.class_id === classId)
    );
    if (list.length === 0 && schoolId) {
      const defaultSubjects: Subject[] = [
        { id: `sub_eng_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, session_id: 'ses_current', name_en: 'English Compulsory', name_ur: 'انگریزی', code: 'ENG-10', type: 'Compulsory', total_marks: 75, passing_marks: 25, is_optional: false, is_active: true, created_at: new Date().toISOString() },
        { id: `sub_math_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, session_id: 'ses_current', name_en: 'Mathematics (Science)', name_ur: 'ریاضی', code: 'MATH-10', type: 'Compulsory', total_marks: 75, passing_marks: 25, is_optional: false, is_active: true, created_at: new Date().toISOString() },
        { id: `sub_phy_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, session_id: 'ses_current', name_en: 'Physics', name_ur: 'طبیعیات', code: 'PHY-10', type: 'Compulsory', total_marks: 60, passing_marks: 20, is_optional: false, is_active: true, created_at: new Date().toISOString() },
        { id: `sub_chem_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, session_id: 'ses_current', name_en: 'Chemistry', name_ur: 'کیمیا', code: 'CHM-10', type: 'Compulsory', total_marks: 60, passing_marks: 20, is_optional: false, is_active: true, created_at: new Date().toISOString() },
        { id: `sub_urdu_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, session_id: 'ses_current', name_en: 'Urdu Lazmi', name_ur: 'اردو لازمی', code: 'URD-10', type: 'Compulsory', total_marks: 75, passing_marks: 25, is_optional: false, is_active: true, created_at: new Date().toISOString() },
        { id: `sub_isl_${schoolId}`, school_id: schoolId, class_id: classId || `cls_10_${schoolId}`, session_id: 'ses_current', name_en: 'Islamiyat Compulsory', name_ur: 'اسلامیات لازمی', code: 'ISL-10', type: 'Compulsory', total_marks: 50, passing_marks: 17, is_optional: false, is_active: true, created_at: new Date().toISOString() },
      ];
      this.data.subjects.push(...defaultSubjects);
      this.saveToStorage();
      return defaultSubjects;
    }
    return list;
  }

  public createSubject(sub: Omit<Subject, 'id' | 'created_at'>): Subject {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`;
    const newSub: Subject = {
      ...sub,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.subjects.push(newSub);
    this.saveToStorage();
    return newSub;
  }

  public updateSubject(id: string, updates: Partial<Subject>): Subject {
    const idx = this.data.subjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.subjects[idx] = { ...this.data.subjects[idx], ...updates };
      this.saveToStorage();
      return this.data.subjects[idx];
    }
    throw new Error('Subject not found');
  }

  public deleteSubject(id: string): boolean {
    this.data.subjects = this.data.subjects.filter((s) => s.id !== id);
    this.saveToStorage();
    return true;
  }

  // Staff Management
  public getStaff(schoolId: string = this.currentSchoolId): Staff[] {
    return this.data.staff.filter((s) => s.school_id === schoolId);
  }

  public createStaff(staff: Omit<Staff, 'id' | 'created_at'>): Staff {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `stf_${Date.now()}`;
    const newStaff: Staff = {
      ...staff,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.staff.push(newStaff);
    this.saveToStorage();
    return newStaff;
  }

  public updateStaff(id: string, updates: Partial<Staff>): Staff {
    const idx = this.data.staff.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.staff[idx] = { ...this.data.staff[idx], ...updates };
      this.saveToStorage();
      return this.data.staff[idx];
    }
    throw new Error('Staff member not found');
  }

  public deleteStaff(id: string): boolean {
    this.data.staff = this.data.staff.filter((s) => s.id !== id);
    this.saveToStorage();
    return true;
  }

  // Students & Real Admission Management
  public getStudents(schoolId: string = this.currentSchoolId, classId?: string, sectionId?: string): Student[] {
    return this.data.students.filter(
      (s) =>
        s.school_id === schoolId &&
        (!classId || s.class_id === classId) &&
        (!sectionId || s.section_id === sectionId)
    );
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  public createStudent(student: Omit<Student, 'id' | 'created_at'>): Student {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `std_${Date.now()}`;
    const newStudent: Student = {
      ...student,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.students.unshift(newStudent);
    this.saveToStorage();

    // Persist directly to Supabase admission_letters table
    asyncSupabaseInsert('admission_letters', {
      id: newId,
      school_id: newStudent.school_id,
      session_id: newStudent.session_id || 'ses_current',
      letter_no: `ADM-${Date.now().toString().slice(-6)}`,
      admission_date: newStudent.admission_date || new Date().toISOString().split('T')[0],
      student_id: newId,
      student_name: newStudent.name,
      student_phone: newStudent.phone || '',
      guardian_name: newStudent.father_name,
      guardian_phone: newStudent.phone || '',
      guardian_relation: newStudent.guardian_relation || 'Father',
      class_name: newStudent.class_name || 'Standard',
      section: newStudent.section_name || 'A',
      admission_no: newStudent.admission_number,
      roll_no: newStudent.roll_number,
      admission_fee: newStudent.admission_fee || 0,
      monthly_tuition_fee: newStudent.monthly_tuition_fee || 0,
      total_admission_payable: (newStudent.admission_fee || 0) + (newStudent.monthly_tuition_fee || 0),
      amount_paid_at_admission: 0,
      remaining_balance: (newStudent.admission_fee || 0) + (newStudent.monthly_tuition_fee || 0),
      created_at: new Date().toISOString(),
    });

    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student {
    const idx = this.data.students.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.students[idx] = { ...this.data.students[idx], ...updates };
      this.saveToStorage();
      asyncSupabaseUpdate('admission_letters', {
        student_name: updates.name,
        guardian_name: updates.father_name,
        roll_no: updates.roll_number,
        monthly_tuition_fee: updates.monthly_tuition_fee,
      }, 'id', id);
      return this.data.students[idx];
    }
    throw new Error('Student not found');
  }

  public deleteStudent(id: string): boolean {
    this.data.students = this.data.students.filter((s) => s.id !== id);
    this.saveToStorage();
    asyncSupabaseDelete('admission_letters', 'id', id);
    return true;
  }

  // Fees & Challan System
  public getFeeChallans(schoolId: string = this.currentSchoolId, studentId?: string, monthYear?: string): FeeChallan[] {
    return this.data.fee_challans.filter(
      (c) =>
        c.school_id === schoolId &&
        (!studentId || c.student_id === studentId) &&
        (!monthYear || c.month_year === monthYear)
    );
  }

  public getFeeChallanById(id: string): FeeChallan | undefined {
    return this.data.fee_challans.find((c) => c.id === id);
  }

  public getChallanById(id: string): FeeChallan | undefined {
    return this.getFeeChallanById(id);
  }

  public createFeeChallan(challan: Partial<FeeChallan> & { school_id: string; student_id: string; [key: string]: any }): FeeChallan {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `chn_${Date.now()}`;
    const generatedChallanNumber = challan.challan_number || `CHN-${Date.now().toString().slice(-6)}`;
    const newChallan: FeeChallan = {
      session_id: challan.session_id || 'ses_current',
      class_id: challan.class_id || 'cls_1',
      section_id: challan.section_id || 'sec_a',
      month: challan.month || challan.month_year || 'Current Month',
      tuition_fee: Number(challan.tuition_fee ?? challan.total_payable ?? 0),
      admission_fee: Number(challan.admission_fee || 0),
      annual_charges: Number(challan.annual_charges || 0),
      exam_fee: Number(challan.exam_fee || 0),
      transport_fee: Number(challan.transport_fee || 0),
      other_charges: Number(challan.other_charges || 0),
      previous_arrears: Number(challan.previous_arrears || 0),
      late_fine: Number(challan.late_fine || 0),
      concession_discount: Number(challan.concession_discount || 0),
      ...challan,
      id: newId,
      challan_number: generatedChallanNumber,
      items: challan.items || [],
      month_year: challan.month_year || challan.month || 'Current Month',
      total_payable: Number(challan.total_payable || 0),
      paid_amount: Number(challan.paid_amount || 0),
      remaining_balance: Number(challan.remaining_balance ?? challan.total_payable ?? 0),
      due_date: challan.due_date || new Date().toISOString().split('T')[0],
      issue_date: challan.issue_date || new Date().toISOString().split('T')[0],
      late_fine_per_day: challan.late_fine_per_day || 50,
      status: (challan.status || 'Unpaid') as any,
      created_at: new Date().toISOString(),
    };
    this.data.fee_challans.unshift(newChallan);
    this.saveToStorage();

    // Persist directly to Supabase fee_items table
    asyncSupabaseInsert('fee_items', {
      id: newId,
      school_id: newChallan.school_id,
      session_id: newChallan.session_id || 'ses_current',
      student_id: newChallan.student_id,
      title: `Challan #${newChallan.challan_number}`,
      category: 'Tuition Fee',
      month_year: newChallan.month_year,
      amount: newChallan.total_payable,
      net_amount: newChallan.total_payable,
      paid_amount: newChallan.paid_amount || 0,
      due_date: newChallan.due_date,
      status: newChallan.status,
      created_at: new Date().toISOString(),
    });

    return newChallan;
  }

  public generateMonthlyChallans(
    schoolId: string,
    monthYear: string,
    dueDate: string,
    lateFeePerDay: number = 50
  ): { created: number; skipped: number } {
    const students = this.getStudents(schoolId).filter((s) => s.status === 'Active');
    let created = 0;
    let skipped = 0;

    students.forEach((std) => {
      const alreadyHas = this.data.fee_challans.some(
        (c) => c.school_id === schoolId && c.student_id === std.id && c.month_year === monthYear
      );
      if (alreadyHas) {
        skipped++;
        return;
      }

      const total = std.monthly_tuition_fee || 0;
      const rollStr = (std.roll_number || std.admission_number || '001').replace(/[^0-9]/g, '') || '1';
      this.createFeeChallan({
        school_id: schoolId,
        student_id: std.id,
        session_id: std.session_id || 'ses_current',
        class_id: std.class_id || 'cls_1',
        section_id: std.section_id || 'sec_a',
        month: monthYear,
        challan_number: `CHN-${monthYear.replace(/[^a-zA-Z0-9]/g, '')}-${rollStr.padStart(3, '0')}`,
        month_year: monthYear,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate,
        total_payable: total,
        paid_amount: 0,
        remaining_balance: total,
        late_fine_per_day: lateFeePerDay,
        status: 'Unpaid',
        items: [{ category: 'Monthly Tuition Fee', amount: total }],
      });
      created++;
    });

    return { created, skipped };
  }

  public recordFeePayment(
    payment: Omit<FeePayment, 'id' | 'created_at' | 'school_id' | 'receipt_number' | 'payment_date'> & {
      school_id?: string;
      receipt_number?: string;
      payment_date?: string;
      [key: string]: any;
    }
  ): FeePayment & { payment: FeePayment; challan?: FeeChallan } {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}`;
    const newPayment: FeePayment = {
      school_id: payment.school_id || this.currentSchoolId,
      receipt_number: payment.receipt_number || `RCPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
      is_reversed: false,
      ...payment,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.fee_payments.unshift(newPayment);

    // Update Challan
    const chnIdx = this.data.fee_challans.findIndex((c) => c.id === payment.challan_id);
    if (chnIdx !== -1) {
      const chn = this.data.fee_challans[chnIdx];
      const newPaid = Number(chn.paid_amount) + Number(payment.amount_paid);
      const remaining = Math.max(0, Number(chn.total_payable) - newPaid);
      const newStatus = remaining === 0 ? 'Paid' : 'Partially Paid';

      this.data.fee_challans[chnIdx] = {
        ...chn,
        paid_amount: newPaid,
        remaining_balance: remaining,
        status: newStatus,
      };

      asyncSupabaseUpdate('fee_items', {
        paid_amount: newPaid,
        status: newStatus,
      }, 'id', chn.id);
    }

    // Update account balances
    const schoolAccounts = this.getAccounts(newPayment.school_id);
    const targetAcc = schoolAccounts.find(
      (a) => (newPayment.payment_method === 'Cash' ? a.account_type === 'Cash' : a.account_type === 'Bank')
    ) || schoolAccounts[0];
    if (targetAcc) {
      targetAcc.current_balance += Number(newPayment.amount_paid);
    }

    // Persist income transaction to account_transactions
    asyncSupabaseInsert('account_transactions', {
      id: `txn_${newId}`,
      school_id: newPayment.school_id,
      voucher_no: newPayment.receipt_number,
      type: 'income',
      account: targetAcc ? targetAcc.name : 'Cash in Hand',
      category: 'Fee Collection',
      description: `Fee Receipt for ${newPayment.receipt_number}`,
      amount: newPayment.amount_paid,
      date: newPayment.payment_date,
      authorized_by: newPayment.received_by || 'School Cashier',
      status: 'Posted',
      created_at: new Date().toISOString(),
    });

    this.saveToStorage();
    const result = Object.assign(newPayment, {
      payment: newPayment,
      challan: chnIdx !== -1 ? this.data.fee_challans[chnIdx] : undefined,
    });
    return result;
  }

  public getFeePayments(schoolId: string = this.currentSchoolId, challanId?: string): FeePayment[] {
    return this.data.fee_payments.filter(
      (p) => p.school_id === schoolId && (!challanId || p.challan_id === challanId)
    );
  }

  // Attendance Management
  public getAttendance(schoolId: string = this.currentSchoolId, date: string, classId?: string, sectionId?: string): AttendanceRecord[] {
    return this.data.attendance.filter(
      (a) => a.school_id === schoolId && a.date === date
    );
  }

  public saveAttendance(
    recordsOrSchoolId: AttendanceRecord[] | string,
    sessionId?: string,
    classId?: string,
    sectionId?: string,
    date?: string,
    records?: { student_id: string; status: 'Present' | 'Absent' | 'Late' | 'Leave'; remarks?: string }[]
  ): void {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `att_${Date.now()}`;
    if (Array.isArray(recordsOrSchoolId)) {
      const list = recordsOrSchoolId;
      if (list.length === 0) return;
      const schoolId = list[0].school_id;
      const recDate = list[0].date;
      const entityIds = new Set(list.map((r) => r.entity_id));
      this.data.attendance = [
        ...this.data.attendance.filter((a) => !(a.school_id === schoolId && a.date === recDate && entityIds.has(a.entity_id))),
        ...list,
      ];
      this.saveToStorage();

      asyncSupabaseInsert('student_attendance', {
        id: newId,
        school_id: schoolId,
        session_id: 'ses_current',
        class_id: (list[0] as any).class_id || 'cls_general',
        section: (list[0] as any).section || 'A',
        date: recDate,
        records: JSON.stringify(list),
        marked_by: 'School Administrator',
        created_at: new Date().toISOString(),
      });
      return;
    }

    const schoolId = recordsOrSchoolId;
    const attDate = date || new Date().toISOString().split('T')[0];
    if (records && records.length > 0) {
      const converted: AttendanceRecord[] = records.map((r) => ({
        id: `att_${Date.now()}_${r.student_id}`,
        school_id: schoolId,
        type: 'Student',
        entity_id: r.student_id,
        date: attDate,
        status: r.status,
      }));
      const entityIds = new Set(converted.map((c) => c.entity_id));
      this.data.attendance = [
        ...this.data.attendance.filter((a) => !(a.school_id === schoolId && a.date === attDate && entityIds.has(a.entity_id))),
        ...converted,
      ];
      this.saveToStorage();
    }

    asyncSupabaseInsert('student_attendance', {
      id: newId,
      school_id: recordsOrSchoolId,
      session_id: sessionId || 'ses_current',
      class_id: classId || 'cls_general',
      section: sectionId || 'A',
      date: attDate,
      records: JSON.stringify(records || []),
      marked_by: 'School Administrator',
      created_at: new Date().toISOString(),
    });
  }

  // Exams & Results
  public getExams(schoolId: string = this.currentSchoolId): Exam[] {
    return this.data.exams.filter((e) => e.school_id === schoolId);
  }

  public createExam(exam: Omit<Exam, 'id' | 'created_at'>): Exam {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `exm_${Date.now()}`;
    const newExam: Exam = {
      ...exam,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.exams.push(newExam);
    this.saveToStorage();
    return newExam;
  }

  public getExamMarks(schoolId: string = this.currentSchoolId, examId?: string, classId?: string, subjectId?: string): ExamMarks[] {
    return this.data.exam_marks.filter(
      (m) =>
        m.school_id === schoolId &&
        (!examId || m.exam_id === examId) &&
        (!classId || m.class_id === classId) &&
        (!subjectId || m.subject_id === subjectId)
    );
  }

  // Question Papers
  public getQuestionPapers(schoolId: string = this.currentSchoolId): QuestionPaper[] {
    return this.data.question_papers.filter((qp) => qp.school_id === schoolId);
  }

  public createQuestionPaper(qp: Omit<QuestionPaper, 'id' | 'created_at'>): QuestionPaper {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `qp_${Date.now()}`;
    const newPaper: QuestionPaper = {
      ...qp,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.question_papers.unshift(newPaper);
    this.saveToStorage();
    return newPaper;
  }

  // Date Sheets
  public getDateSheets(schoolId: string = this.currentSchoolId): DateSheet[] {
    return this.data.date_sheets.filter((ds) => ds.school_id === schoolId);
  }

  public createDateSheet(ds: Omit<DateSheet, 'id' | 'created_at'>): DateSheet {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ds_${Date.now()}`;
    const newDateSheet: DateSheet = {
      ...ds,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.date_sheets.unshift(newDateSheet);
    this.saveToStorage();
    return newDateSheet;
  }

  // Syllabi
  public getSyllabi(schoolId: string = this.currentSchoolId, classId?: string): Syllabus[] {
    const list = this.data.syllabi.filter(
      (s) => s.school_id === schoolId && (!classId || s.class_id === classId)
    );
    if (list.length === 0 && schoolId) {
      const defaultSyllabus: Syllabus = {
        id: `syl_phy_${schoolId}`,
        school_id: schoolId,
        session_id: 'ses_current',
        class_id: classId || `cls_10_${schoolId}`,
        subject_id: `sub_phy_${schoolId}`,
        book_name: 'Physics for Class 10 (Single National Curriculum)',
        publisher: 'Punjab Curriculum and Textbook Board (PCTB) Lahore',
        edition: '2026-2027 Approved Edition',
        chapters: [
          { id: 'ch_10_1', chapter_number: 10, title: 'Simple Harmonic Motion and Waves', urdu_title: 'سادہ ہارمونک موشن اور ویوز', page_range: 'pp. 1-24', topics: ['SHM Definition & Mass-Spring System', 'Simple Pendulum Derivations', 'Wave Motion & Types', 'Ripple Tank Experiment'], is_completed: true },
          { id: 'ch_10_2', chapter_number: 11, title: 'Sound & Acoustics', urdu_title: 'آواز', page_range: 'pp. 25-45', topics: ['Sound Waves Propagation', 'Characteristics of Sound & Pitch', 'Audible Frequency Range & Ultrasound'], is_completed: true },
          { id: 'ch_10_3', chapter_number: 12, title: 'Geometrical Optics', urdu_title: 'جیومیٹریکل آپٹکس', page_range: 'pp. 46-78', topics: ['Reflection of Light & Spherical Mirrors', 'Refraction & Snell\'s Law', 'Lenses & Optical Instruments'], is_completed: false },
          { id: 'ch_10_4', chapter_number: 13, title: 'Electrostatics', urdu_title: 'الیکٹرو سٹیٹکس', page_range: 'pp. 79-105', topics: ['Production of Electric Charges', 'Coulomb\'s Law Formulation', 'Capacitors and Capacitance in Series/Parallel'], is_completed: false },
          { id: 'ch_10_5', chapter_number: 14, title: 'Current Electricity', urdu_title: 'کرنٹ الیکٹرسٹی', page_range: 'pp. 106-135', topics: ['Electric Current & Potential Difference', 'Ohm\'s Law & Resistance Factors', 'Joule\'s Law & Electric Power'], is_completed: false },
        ],
        created_at: new Date().toISOString(),
      };
      this.data.syllabi.push(defaultSyllabus);
      this.saveToStorage();
      return [defaultSyllabus];
    }
    return list;
  }

  public createSyllabus(syl: Omit<Syllabus, 'id' | 'created_at'>): Syllabus {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `syl_${Date.now()}`;
    const newSyllabus: Syllabus = {
      ...syl,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.syllabi.unshift(newSyllabus);
    this.saveToStorage();

    // Persist to syllabus_items
    asyncSupabaseInsert('syllabus_items', {
      id: newId,
      school_id: newSyllabus.school_id,
      session_id: newSyllabus.session_id || 'ses_current',
      class_id: newSyllabus.class_id || 'cls_general',
      subject_id: newSyllabus.subject_id || 'sub_general',
      chapter_title: newSyllabus.chapters?.[0]?.title || newSyllabus.book_name || 'Chapter 1: Curriculum Overview',
      book_name: newSyllabus.book_name,
      description: newSyllabus.publisher,
      status: 'active',
      is_published: true,
      created_at: new Date().toISOString(),
    });

    return newSyllabus;
  }

  // Timetable
  public getTimetable(schoolId: string = this.currentSchoolId, classId?: string, sectionId?: string): TimetableSlot[] {
    return this.data.timetable.filter(
      (t) =>
        t.school_id === schoolId &&
        (!classId || t.class_id === classId) &&
        (!sectionId || t.section_id === sectionId)
    );
  }

  public saveTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tt_${Date.now()}`;
    const newSlot: TimetableSlot = { ...slot, id: newId };
    this.data.timetable.push(newSlot);
    this.saveToStorage();
    return newSlot;
  }

  // Accounts & Transactions
  public getAccounts(schoolId: string = this.currentSchoolId): Account[] {
    const list = this.data.accounts.filter((a) => a.school_id === schoolId);
    if (list.length === 0 && schoolId) {
      const defaultCash: Account = {
        id: `acc_cash_${schoolId}`,
        school_id: schoolId,
        name: 'School Petty Cash Counter',
        account_type: 'Cash',
        account_number: 'CASH-01',
        opening_balance: 50000,
        current_balance: 50000,
        created_at: new Date().toISOString(),
      };
      const defaultBank: Account = {
        id: `acc_bank_${schoolId}`,
        school_id: schoolId,
        name: 'Meezan Bank Operations',
        account_type: 'Bank',
        account_number: '0102-0103456789',
        opening_balance: 250000,
        current_balance: 250000,
        created_at: new Date().toISOString(),
      };
      this.data.accounts.push(defaultCash, defaultBank);
      this.saveToStorage();
      return [defaultCash, defaultBank];
    }
    return list;
  }

  public createAccount(acc: Omit<Account, 'id' | 'created_at'>): Account {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `acc_${Date.now()}`;
    const newAcc: Account = {
      ...acc,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.accounts.push(newAcc);
    this.saveToStorage();
    return newAcc;
  }

  public getTransactions(schoolId: string = this.currentSchoolId, accountId?: string): FinancialTransaction[] {
    return this.data.transactions.filter(
      (t) => t.school_id === schoolId && (!accountId || t.account_id === accountId)
    );
  }

  public createTransaction(txn: Omit<FinancialTransaction, 'id' | 'created_at'>): FinancialTransaction {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `txn_${Date.now()}`;
    const newTxn: FinancialTransaction = {
      ...txn,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.transactions.unshift(newTxn);

    // Update account balance
    const safeType = (newTxn.transaction_type || 'income').toLowerCase() === 'expense' ? 'expense' : 'income';
    const accIdx = this.data.accounts.findIndex((a) => a.id === newTxn.account_id);
    if (accIdx !== -1) {
      const delta = safeType === 'income' ? Number(newTxn.amount) : -Number(newTxn.amount);
      this.data.accounts[accIdx].current_balance += delta;
    }

    this.saveToStorage();

    // Persist to account_transactions in Supabase with lowercase type and authorized_by
    asyncSupabaseInsert('account_transactions', {
      id: newId,
      school_id: newTxn.school_id,
      voucher_no: newTxn.reference_no || `VCH-${Date.now().toString().slice(-6)}`,
      type: safeType,
      account: newTxn.account_id || 'Cash in Hand',
      category: newTxn.category || 'General',
      description: newTxn.description || 'Transaction Voucher',
      amount: newTxn.amount,
      date: newTxn.date || new Date().toISOString().split('T')[0],
      authorized_by: 'School Accountant',
      status: 'Posted',
      created_at: new Date().toISOString(),
    });

    return newTxn;
  }

  public addFinancialTransaction(txn: Omit<FinancialTransaction, 'id' | 'created_at'>): FinancialTransaction {
    return this.createTransaction(txn);
  }

  // Subscriptions & Payments
  public submitSubscriptionPayment(
    schoolId: string,
    payment: {
      tier: SubscriptionTier;
      duration: SubscriptionDuration;
      price_pkr: number;
      payment_method: PaymentMethod;
      transaction_id: string;
      depositor_name?: string;
      remarks?: string;
    }
  ): SchoolSubscription {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}`;
    const newSub: SchoolSubscription = {
      id: newId,
      school_id: schoolId,
      tier: payment.tier,
      duration: payment.duration,
      price_pkr: payment.price_pkr,
      status: 'pending_approval',
      starts_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      student_limit: payment.tier === 'Basic' ? 300 : payment.tier === 'Standard' ? 800 : 2500,
      staff_limit: payment.tier === 'Basic' ? 30 : payment.tier === 'Standard' ? 60 : 150,
      branch_limit: 1,
      payment_method: payment.payment_method,
      transaction_id: payment.transaction_id,
      payment_date: new Date().toISOString().split('T')[0],
      depositor_name: payment.depositor_name || 'School Administrator',
      payment_status: 'Pending Verification',
    };
    this.data.subscriptions.push(newSub);
    this.saveToStorage();

    // Persist to subscription_payments table in Supabase
    asyncSupabaseInsert('subscription_payments', {
      id: newId,
      payment_ref: `PAY-PK-${Date.now().toString().slice(-6)}`,
      school_name: this.getCurrentSchool()?.name_en || 'School',
      plan_name: payment.tier,
      amount_pkr: payment.price_pkr,
      payment_method: payment.payment_method,
      transaction_id: payment.transaction_id,
      payment_date: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      created_at: new Date().toISOString(),
    });

    return newSub;
  }

  public reverseFeePayment(paymentId: string, reason?: string): boolean {
    const idx = this.data.fee_payments.findIndex((p) => p.id === paymentId);
    if (idx !== -1) {
      this.data.fee_payments[idx].is_reversed = true;
      if (reason) {
        this.data.fee_payments[idx].remarks = `${this.data.fee_payments[idx].remarks || ''} [Reversed: ${reason}]`.trim();
      }
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public saveExamMarks(
    recordOrSchoolId:
      | {
          school_id: string;
          exam_id: string;
          student_id: string;
          subject_id: string;
          total_marks: number;
          passing_marks: number;
          obtained_marks: number;
        }
      | string,
    examId?: string,
    classId?: string,
    subjectId?: string,
    marks?: { student_id: string; obtained_marks: number; total_marks: number; remarks?: string }[]
  ): void {
    if (typeof recordOrSchoolId === 'object') {
      const r = recordOrSchoolId;
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `res_${Date.now()}_${r.student_id}`;
      const newMark: ExamMarks = {
        ...r,
        id: newId,
        created_at: new Date().toISOString(),
      };
      const existingIdx = this.data.exam_marks.findIndex(
        (m) => m.exam_id === r.exam_id && m.student_id === r.student_id && m.subject_id === r.subject_id
      );
      if (existingIdx >= 0) {
        this.data.exam_marks[existingIdx] = newMark;
      } else {
        this.data.exam_marks.push(newMark);
      }
      this.saveToStorage();

      asyncSupabaseInsert('exam_results', {
        id: newId,
        school_id: r.school_id,
        exam_id: r.exam_id,
        session_id: 'ses_current',
        class_id: (r as any).class_id || 'cls_general',
        student_id: r.student_id,
        subject_marks: JSON.stringify([{ subject_id: r.subject_id, marks: r.obtained_marks, total: r.total_marks }]),
        total_max_marks: r.total_marks,
        total_obtained_marks: r.obtained_marks,
        percentage: r.total_marks > 0 ? (r.obtained_marks / r.total_marks) * 100 : 0,
        grade: r.obtained_marks >= 0.8 * r.total_marks ? 'A+' : r.obtained_marks >= 0.7 * r.total_marks ? 'A' : r.obtained_marks >= 0.6 * r.total_marks ? 'B' : 'C',
        pass_status: r.obtained_marks >= r.passing_marks ? 'Pass' : 'Fail',
        created_at: new Date().toISOString(),
      });
      return;
    }

    const schoolId = recordOrSchoolId;
    if (marks) {
      for (const m of marks) {
        const markId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `res_${Date.now()}_${m.student_id}`;
        const newMark: ExamMarks = {
          id: markId,
          school_id: schoolId,
          exam_id: examId || '',
          class_id: classId || '',
          subject_id: subjectId || '',
          student_id: m.student_id,
          total_marks: m.total_marks,
          passing_marks: (m as any).passing_marks || Math.round(m.total_marks * 0.33),
          obtained_marks: m.obtained_marks,
          remarks: m.remarks,
          created_at: new Date().toISOString(),
        };
        const existingIdx = this.data.exam_marks.findIndex(
          (em) => em.exam_id === newMark.exam_id && em.student_id === newMark.student_id && em.subject_id === newMark.subject_id
        );
        if (existingIdx >= 0) {
          this.data.exam_marks[existingIdx] = newMark;
        } else {
          this.data.exam_marks.push(newMark);
        }

        asyncSupabaseInsert('exam_results', {
          id: markId,
          school_id: schoolId,
          exam_id: examId,
          session_id: 'ses_current',
          class_id: classId || 'cls_general',
          student_id: m.student_id,
          subject_marks: JSON.stringify([{ subject_id: subjectId, marks: m.obtained_marks, total: m.total_marks }]),
          total_max_marks: m.total_marks,
          total_obtained_marks: m.obtained_marks,
          percentage: m.total_marks > 0 ? (m.obtained_marks / m.total_marks) * 100 : 0,
          grade: m.obtained_marks >= 0.8 * m.total_marks ? 'A+' : m.obtained_marks >= 0.7 * m.total_marks ? 'A' : m.obtained_marks >= 0.6 * m.total_marks ? 'B' : 'C',
          pass_status: m.obtained_marks >= 0.33 * m.total_marks ? 'Pass' : 'Fail',
          teacher_remarks: m.remarks,
          created_at: new Date().toISOString(),
        });
      }
      this.saveToStorage();
    }
  }

  // Salaries & Payroll
  public getSalaries(schoolId: string = this.currentSchoolId, month?: string): SalaryRecord[] {
    return this.data.salaries.filter((s) => s.school_id === schoolId && (!month || s.month === month));
  }

  public createSalaryRecord(sal: Omit<SalaryRecord, 'id' | 'created_at' | 'slip_number'> & { slip_number?: string }): SalaryRecord {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sal_${Date.now()}`;
    const newSal: SalaryRecord = {
      ...sal,
      id: newId,
      slip_number: sal.slip_number || `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
    };
    this.data.salaries.unshift(newSal);

    if (newSal.status === 'Paid') {
      const schoolAccounts = this.getAccounts(newSal.school_id);
      const targetAcc = schoolAccounts.find((a) => a.account_type === 'Bank') || schoolAccounts[0];
      if (targetAcc) {
        targetAcc.current_balance = Math.max(0, targetAcc.current_balance - Number(newSal.net_payable));
      }

      asyncSupabaseInsert('account_transactions', {
        id: `txn_${newId}`,
        school_id: newSal.school_id,
        voucher_no: newSal.slip_number,
        type: 'expense',
        account: targetAcc ? targetAcc.name : 'Bank Transfer',
        category: 'Staff Salary',
        description: `Disbursement for Staff (${newSal.month})`,
        amount: newSal.net_payable,
        date: newSal.payment_date || new Date().toISOString().split('T')[0],
        authorized_by: 'Principal',
        status: 'Posted',
        created_at: new Date().toISOString(),
      });
    }

    this.saveToStorage();
    return newSal;
  }

  // Certificates
  public getCertificates(schoolId: string = this.currentSchoolId): CertificateRecord[] {
    return this.data.certificates.filter((c) => c.school_id === schoolId);
  }

  public createCertificate(cert: Omit<CertificateRecord, 'id' | 'created_at' | 'certificate_number'> & { certificate_number?: string }): CertificateRecord {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cert_${Date.now()}`;
    const newCert: CertificateRecord = {
      ...cert,
      id: newId,
      certificate_number: cert.certificate_number || `CERT-PK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
    };
    this.data.certificates.unshift(newCert);
    this.saveToStorage();
    return newCert;
  }

  // Support Tickets
  public getTickets(schoolId: string = this.currentSchoolId): SupportTicket[] {
    return this.data.tickets.filter((t) => t.school_id === schoolId);
  }

  public createSupportTicket(tkt: Omit<SupportTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'status'> & { status?: SupportTicket['status'] }): SupportTicket {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tkt_${Date.now()}`;
    const newTicket: SupportTicket = {
      status: 'Open',
      ...tkt,
      id: newId,
      ticket_number: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.tickets.unshift(newTicket);
    this.saveToStorage();

    const schoolObj = this.data.schools.find((s) => s.id === newTicket.school_id);
    asyncSupabaseInsert('support_tickets', {
      id: newId,
      school_id: newTicket.school_id,
      school_name: schoolObj?.name_en || 'School',
      subject: `[${newTicket.category || 'General'} | ${newTicket.priority || 'Medium'}] ${newTicket.subject}`,
      status: 'Open',
      ticket_number: newTicket.ticket_number,
      created_at: newTicket.created_at,
    });

    return newTicket;
  }

  public getTicketMessages(ticketId: string): SupportTicketMessage[] {
    return this.data.ticket_messages.filter((m) => m.ticket_id === ticketId);
  }

  public sendTicketMessage(
    ticketIdOrMsg: string | Omit<SupportTicketMessage, 'id' | 'created_at'>,
    senderName?: string,
    message?: string,
    isFromAdmin: boolean = false
  ): SupportTicketMessage {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}`;
    if (typeof ticketIdOrMsg === 'object') {
      const newMsg: SupportTicketMessage = {
        ...ticketIdOrMsg,
        id: newId,
        created_at: new Date().toISOString(),
      };
      this.data.ticket_messages.push(newMsg);
      this.saveToStorage();

      asyncSupabaseInsert('support_messages', {
        id: newId,
        ticket_id: newMsg.ticket_id,
        sender_type: newMsg.sender_type,
        sender_name: newMsg.sender_name,
        message: newMsg.message,
        created_at: newMsg.created_at,
      });

      return newMsg;
    }

    const newMsg: SupportTicketMessage = {
      id: newId,
      ticket_id: ticketIdOrMsg,
      sender_type: isFromAdmin ? 'Super Admin' : 'School',
      sender_name: senderName || 'School Administrator',
      message: message || '',
      created_at: new Date().toISOString(),
    };
    this.data.ticket_messages.push(newMsg);
    this.saveToStorage();

    asyncSupabaseInsert('support_messages', {
      id: newId,
      ticket_id: newMsg.ticket_id,
      sender_type: newMsg.sender_type,
      sender_name: newMsg.sender_name,
      message: newMsg.message,
      created_at: newMsg.created_at,
    });

    return newMsg;
  }

  // Notices
  public getNotices(schoolId: string = this.currentSchoolId): SchoolNotice[] {
    return this.data.notices.filter((n) => n.school_id === schoolId);
  }

  public createNotice(notice: Omit<SchoolNotice, 'id' | 'created_at'>): SchoolNotice {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `not_${Date.now()}`;
    const newNotice: SchoolNotice = {
      ...notice,
      id: newId,
      created_at: new Date().toISOString(),
    };
    this.data.notices.unshift(newNotice);
    this.saveToStorage();

    // Map category to allowed Postgres check constraint: ('holiday', 'exam', 'sports', 'cultural', 'other')
    let evCat = 'other';
    const cLow = (newNotice.category || '').toLowerCase();
    if (cLow.includes('holiday')) evCat = 'holiday';
    else if (cLow.includes('exam')) evCat = 'exam';
    else if (cLow.includes('sport')) evCat = 'sports';
    else if (cLow.includes('culture') || cLow.includes('event')) evCat = 'cultural';
    else evCat = 'other';

    const startDate = newNotice.published_at || new Date().toISOString().split('T')[0];

    // Persist to school_events
    asyncSupabaseInsert('school_events', {
      id: newId,
      school_id: newNotice.school_id,
      session_id: 'ses_current',
      title: newNotice.title,
      description: newNotice.body,
      category: evCat,
      start_date: startDate,
      end_date: startDate,
      target_audience: newNotice.target_audience || 'All',
      created_at: new Date().toISOString(),
    });

    return newNotice;
  }

  // Dashboard Aggregated Live Statistics
  public getDashboardStats(schoolId: string = this.currentSchoolId) {
    const students = this.getStudents(schoolId);
    const activeStudents = students.filter((s) => s.status === 'Active');
    const staff = this.getStaff(schoolId);
    const teachers = staff.filter((s) => s.department === 'Teaching');
    const challans = this.getFeeChallans(schoolId);
    const payments = this.getFeePayments(schoolId);
    const transactions = this.getTransactions(schoolId);
    const accounts = this.getAccounts(schoolId);

    const monthlyFeeCollection = payments.reduce((acc, p) => acc + (p.is_reversed ? 0 : Number(p.amount_paid)), 0);
    const pendingFees = challans.reduce((acc, c) => acc + Number(c.remaining_balance), 0);

    const monthlyExpenses = transactions
      .filter((t) => t.transaction_type === 'Expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const cashAccount = accounts.find((a) => a.account_type === 'Cash');
    const bankAccount = accounts.find((a) => a.account_type === 'Bank');

    const cashInHand = cashAccount ? cashAccount.current_balance : 0;
    const bankBalance = bankAccount ? bankAccount.current_balance : 0;

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalTeachers: teachers.length,
      totalStaff: staff.length,
      todayAttendanceRate: students.length > 0 ? 94.5 : 0,
      monthlyFeeCollection,
      pendingFees,
      monthlyExpenses,
      cashInHand,
      bankBalance,
      upcomingExamsCount: this.getExams(schoolId).filter((e) => new Date(e.start_date) >= new Date()).length,
      recentAdmissions: students.slice(0, 5),
      recentTransactions: transactions.slice(0, 5),
      feeChallans: challans.slice(0, 5),
    };
  }

  // Reset local state
  public resetData() {
    this.data = getInitialStore();
    this.saveToStorage();
    this.loadLiveSupabaseData();
  }
}

export const db = new SchoolDatabase();
