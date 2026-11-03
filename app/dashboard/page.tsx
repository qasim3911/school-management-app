'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { School, Student, FeeChallan, QuestionPaper, SchoolSubscription, PaymentMethod, SubscriptionTier, SubscriptionDuration } from '@/lib/types';
import { getStoredSupabaseConfig } from '@/lib/supabase';

// Core Navigation & Layout
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SupabaseModal } from '@/components/SupabaseModal';

// School Management Modules
import { DashboardOverview } from '@/components/DashboardOverview';
import { StudentsModule } from '@/components/StudentsModule';
import { ClassesModule } from '@/components/ClassesModule';
import { SubjectsModule } from '@/components/SubjectsModule';
import { StaffModule } from '@/components/StaffModule';
import { FeesModule } from '@/components/FeesModule';
import { AttendanceModule } from '@/components/AttendanceModule';
import { ExamsModule } from '@/components/ExamsModule';
import { QuestionPaperModule } from '@/components/QuestionPaperModule';
import { DateSheetModule } from '@/components/DateSheetModule';
import { SyllabusModule } from '@/components/SyllabusModule';
import { TimetableModule } from '@/components/TimetableModule';
import { PayrollModule } from '@/components/PayrollModule';
import { AccountsModule } from '@/components/AccountsModule';
import { CertificatesModule } from '@/components/CertificatesModule';
import { CommunicationModule } from '@/components/CommunicationModule';
import { SupportModule } from '@/components/SupportModule';
import { SettingsModule } from '@/components/SettingsModule';

// Official Pakistani Institutional Document Modals
import { AdmissionLetterModal } from '@/components/AdmissionLetterModal';
import { FeeChallanModal } from '@/components/FeeChallanModal';
import { ResultCardModal } from '@/components/ResultCardModal';
import { QuestionPaperModal } from '@/components/QuestionPaperModal';

// Icons
import {
  Lock,
  Clock,
  ShieldAlert,
  AlertCircle,
  CreditCard,
  Building2,
  LogIn,
  Search,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export default function SchoolDashboardPage() {
  const router = useRouter();
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [dataVersion, setDataVersion] = useState(0);
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Document Preview Modals
  const [admissionStudent, setAdmissionStudent] = useState<Student | null>(null);
  const [activeChallan, setActiveChallan] = useState<{ challan: FeeChallan; student: Student } | null>(null);
  const [activeResultCard, setActiveResultCard] = useState<{
    student: Student;
    marks: { subject: string; total: number; passing: number; obtained: number }[];
  } | null>(null);
  const [activeQuestionPaper, setActiveQuestionPaper] = useState<QuestionPaper | null>(null);

  // Renewal Form State (for Expired Subscription)
  const [renewalTxId, setRenewalTxId] = useState('');
  const [renewalMethod, setRenewalMethod] = useState<PaymentMethod>('Bank Transfer');
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  const refreshData = () => {
    setDataVersion((v) => v + 1);
  };

  // Auth & Access Status Check
  const authState = React.useMemo(() => {
    if (!isMounted) {
      return { status: 'loading' as const };
    }
    void dataVersion;

    const session = db.getAuthenticatedSession();
    if (!session) {
      return { status: 'unauthenticated' as const };
    }

    const verification = db.verifySchoolAccess(session.email);
    return {
      status: verification.status,
      school: verification.school,
      application: verification.application,
      subscription: verification.subscription,
      message: verification.message,
    };
  }, [isMounted, dataVersion]);

  // Derived Data State for Approved Schools
  const allSchools = React.useMemo(() => {
    if (!isMounted) return [];
    void dataVersion;
    return db.getAllSchools();
  }, [isMounted, dataVersion]);

  const currentSchool = React.useMemo(() => {
    if (!isMounted) return null;
    void dataVersion;
    return authState.school || db.getCurrentSchool();
  }, [isMounted, dataVersion, authState.school]);

  const supabaseConfig = React.useMemo(() => {
    if (!isMounted) {
      return { url: '', anonKey: '', isConfigured: false, source: 'none' as const };
    }
    void dataVersion;
    return getStoredSupabaseConfig();
  }, [isMounted, dataVersion]);

  // Redirection for Unauthenticated Users
  useEffect(() => {
    if (isMounted && authState.status === 'unauthenticated') {
      const timer = setTimeout(() => {
        router.push('/school/login?error=auth_required');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isMounted, authState.status, router]);

  // Handle Switch School
  const handleSelectSchool = (schoolId: string) => {
    db.setCurrentSchoolId(schoolId);
    refreshData();
  };

  const handleOpenAdmissionLetter = (studentId: string) => {
    const student = db.getStudentById(studentId);
    if (student) setAdmissionStudent(student);
  };

  const handleOpenChallan = (challanId: string) => {
    const chn = db.getChallanById(challanId);
    if (chn) {
      const student = db.getStudentById(chn.student_id);
      if (student) {
        setActiveChallan({ challan: chn, student });
      }
    }
  };

  const handleOpenResultCard = (
    studentId: string,
    marks: { subject: string; total: number; passing: number; obtained: number }[]
  ) => {
    const student = db.getStudentById(studentId);
    if (student) {
      setActiveResultCard({ student, marks });
    }
  };

  const handleRenewalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool || !renewalTxId) return;

    db.submitSubscriptionPayment(currentSchool.id, {
      tier: 'Standard',
      duration: 'Yearly',
      price_pkr: 72000,
      payment_method: renewalMethod,
      transaction_id: renewalTxId,
      depositor_name: currentSchool.principal_name,
      remarks: 'Renewal submission from expired dashboard prompt',
    });

    setRenewalSubmitted(true);
    setTimeout(() => {
      refreshData();
    }, 2000);
  };

  // 1. Loading State
  if (!isMounted || authState.status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xl shadow-xs mb-3">
            🇵🇰
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pakistan School Management SaaS
          </h2>
          <p className="text-xs text-slate-500 font-urdu mt-0.5">
            سکول ایڈمن ڈیش بورڈ لوڈ ہو رہا ہے
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <div className="w-3.5 h-3.5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <span>Verifying authenticated school session...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Prompt & Auto-Redirect)
  if (authState.status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            You must be logged in with an approved school account to access the School Admin Dashboard. Redirecting you to the login page...
          </p>
          <div className="pt-2">
            <Link
              href="/school/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to School Login Now</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Pending Super Admin Review
  if (authState.status === 'pending' || authState.status === 'under_review' || authState.status === 'info_required') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Application Status: {authState.status === 'pending' ? 'Pending Review' : authState.status === 'under_review' ? 'Under Review' : 'Additional Information Required'}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 pt-2">
              School Dashboard Locked
            </h2>
            <p className="text-xs font-urdu text-amber-800 font-bold">
              ڈیش بورڈ تک رسائی سپر ایڈمن کی منظوری کے بعد فعال ہو گی
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
            {authState.message}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {authState.application?.application_id && (
              <Link
                href={`/school/application-status?appId=${authState.application.application_id}&email=${encodeURIComponent(authState.application.official_email)}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Track Application ({authState.application.application_id})</span>
              </Link>
            )}
            <button
              onClick={() => db.logout().then(() => router.push('/school/login'))}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Rejected or Suspended School Access
  if (authState.status === 'rejected' || authState.status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {authState.status === 'suspended' ? 'School Account Suspended' : 'Application Not Approved'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-900">
            {authState.message}
          </p>
          <div className="pt-2">
            <button
              onClick={() => db.logout().then(() => router.push('/school/login'))}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs"
            >
              Back to School Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Subscription Expired & Renewal Screen
  if (authState.status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Subscription Expired
            </h2>
            <p className="text-xs text-slate-600">
              Your school&apos;s SaaS subscription has expired. Please submit your renewal payment to unlock full dashboard access.
            </p>
          </div>

          {renewalSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-xs text-emerald-900">Renewal Submitted!</h4>
              <p className="text-[11px] text-emerald-800">
                Your payment proof is under verification by Super Admin. Dashboard access will re-activate upon approval.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRenewalSubmit} className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Pakistani Bank Payment Details:</p>
                <p className="text-slate-600">Meezan Bank · A/C: 0102-0104889124 · Title: Pakistan School SaaS</p>
                <p className="text-slate-600">JazzCash / EasyPaisa Till ID: 0300-8451920</p>
                <p className="text-orange-700 font-bold pt-1">Renewal Amount: PKR 72,000 (Standard Yearly)</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={renewalMethod}
                  onChange={(e) => setRenewalMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Bank Transfer">Meezan / HBL Bank Transfer</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Transaction ID / Ref No
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FT-99214482"
                  value={renewalTxId}
                  onChange={(e) => setRenewalTxId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors"
                >
                  Submit Renewal Proof
                </button>
                <button
                  type="button"
                  onClick={() => db.logout().then(() => router.push('/school/login'))}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Logout
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 6. Approved, Active School Dashboard View
  if (!currentSchool) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xs text-slate-500">No school profile associated with session.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentSchool={currentSchool}
        allSchools={allSchools}
        onSelectSchool={handleSelectSchool}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onViewLanding={() => router.push('/')}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        supabaseConnected={supabaseConfig.isConfigured}
      />

      {/* Main Body with Sidebar + Viewport */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar with Visible Logout */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {activeModule === 'overview' && (
            <DashboardOverview
              school={currentSchool}
              setActiveModule={setActiveModule}
              onOpenAdmissionLetter={handleOpenAdmissionLetter}
              onOpenChallan={handleOpenChallan}
            />
          )}

          {activeModule === 'students' && (
            <StudentsModule
              school={currentSchool}
              onOpenAdmissionLetter={handleOpenAdmissionLetter}
            />
          )}

          {activeModule === 'classes' && <ClassesModule school={currentSchool} />}
          {activeModule === 'subjects' && <SubjectsModule school={currentSchool} />}
          {activeModule === 'staff' && <StaffModule school={currentSchool} />}
          {activeModule === 'fees' && (
            <FeesModule
              school={currentSchool}
              onOpenChallan={handleOpenChallan}
            />
          )}
          {activeModule === 'attendance' && <AttendanceModule school={currentSchool} />}
          {activeModule === 'exams' && (
            <ExamsModule
              school={currentSchool}
              onOpenResultCard={handleOpenResultCard}
            />
          )}
          {activeModule === 'question_papers' && (
            <QuestionPaperModule
              school={currentSchool}
              onOpenQuestionPaperModal={(p) => setActiveQuestionPaper(p)}
            />
          )}
          {activeModule === 'date_sheets' && <DateSheetModule school={currentSchool} />}
          {activeModule === 'syllabus' && <SyllabusModule school={currentSchool} />}
          {activeModule === 'timetable' && <TimetableModule school={currentSchool} />}
          {activeModule === 'payroll' && <PayrollModule school={currentSchool} />}
          {activeModule === 'accounts' && <AccountsModule school={currentSchool} />}
          {activeModule === 'certificates' && <CertificatesModule school={currentSchool} />}
          {activeModule === 'notices' && <CommunicationModule school={currentSchool} />}
          {activeModule === 'support' && <SupportModule school={currentSchool} />}
          {activeModule === 'settings' && (
            <SettingsModule
              school={currentSchool}
              onSchoolUpdated={refreshData}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          refreshData();
        }}
      />

      {/* Document PDF & Print Modals */}
      {admissionStudent && (
        <AdmissionLetterModal
          isOpen={!!admissionStudent}
          onClose={() => setAdmissionStudent(null)}
          school={currentSchool}
          student={admissionStudent}
        />
      )}

      {activeChallan && (
        <FeeChallanModal
          isOpen={!!activeChallan}
          onClose={() => setActiveChallan(null)}
          school={currentSchool}
          student={activeChallan.student}
          challan={activeChallan.challan}
        />
      )}

      {activeResultCard && (
        <ResultCardModal
          isOpen={!!activeResultCard}
          onClose={() => setActiveResultCard(null)}
          school={currentSchool}
          student={activeResultCard.student}
          marks={activeResultCard.marks}
        />
      )}

      {activeQuestionPaper && (
        <QuestionPaperModal
          isOpen={!!activeQuestionPaper}
          onClose={() => setActiveQuestionPaper(null)}
          school={currentSchool}
          paper={activeQuestionPaper}
        />
      )}
    </div>
  );
}
