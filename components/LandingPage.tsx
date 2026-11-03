'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  SchoolType,
  SubscriptionTier,
  SubscriptionDuration,
  SchoolApplication,
  PaymentMethod,
} from '@/lib/types';
import {
  Building2,
  Check,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileText,
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Lock,
  Phone,
  HelpCircle,
  Database,
  Printer,
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: (schoolId: string) => void;
  onOpenSupabaseModal: () => void;
}

export function LandingPage({ onEnterDashboard, onOpenSupabaseModal }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'status' | 'login' | 'payment'>('home');
  const [selectedPlanDuration, setSelectedPlanDuration] = useState<SubscriptionDuration>('Monthly');

  // Registration Form State
  const [regForm, setRegForm] = useState({
    school_name_en: '',
    school_name_ur: '',
    school_type: 'Private' as SchoolType,
    owner_name: '',
    principal_name: '',
    official_email: '',
    mobile_number: '',
    whatsapp_number: '',
    province: 'Punjab',
    district: 'Lahore',
    city: 'Lahore',
    complete_address: '',
    student_count_estimate: 250,
    teacher_count_estimate: 18,
    branches_count: 1,
    registration_number: '',
    selected_plan: 'Standard' as SubscriptionTier,
    selected_duration: 'Monthly' as SubscriptionDuration,
    password: '',
  });

  const [submittedApp, setSubmittedApp] = useState<SchoolApplication | null>(null);

  // Status Search State
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [foundApp, setFoundApp] = useState<SchoolApplication | null | 'not_found'>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState('admin@iqbalschool.edu.pk');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Payment Form State
  const [payForm, setPayForm] = useState({
    schoolId: 'sch_iqbal_lahore',
    tier: 'Standard' as SubscriptionTier,
    duration: 'Yearly' as SubscriptionDuration,
    paymentMethod: 'Bank Transfer' as PaymentMethod,
    transactionId: '',
    depositorName: '',
    remarks: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Pricing Matrix in PKR
  const PRICING_MATRIX: Record<SubscriptionTier, Record<SubscriptionDuration, number>> = {
    Basic: {
      Monthly: 3500,
      Quarterly: 9500,
      'Six Months': 18000,
      Yearly: 32000,
    },
    Standard: {
      Monthly: 7500,
      Quarterly: 21000,
      'Six Months': 39000,
      Yearly: 72000,
    },
    Premium: {
      Monthly: 12500,
      Quarterly: 35000,
      'Six Months': 65000,
      Yearly: 120000,
    },
  };

  const PROVINCES = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Gilgit-Baltistan',
    'Azad Jammu & Kashmir',
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.school_name_en || !regForm.owner_name || !regForm.official_email || !regForm.mobile_number) {
      alert('Please fill all mandatory school registration fields.');
      return;
    }

    const newApp = db.registerSchoolApplication({
      school_name_en: regForm.school_name_en,
      school_name_ur: regForm.school_name_ur || regForm.school_name_en,
      school_type: regForm.school_type,
      owner_name: regForm.owner_name,
      principal_name: regForm.principal_name || regForm.owner_name,
      official_email: regForm.official_email,
      mobile_number: regForm.mobile_number,
      whatsapp_number: regForm.whatsapp_number || regForm.mobile_number,
      province: regForm.province,
      district: regForm.district,
      city: regForm.city,
      complete_address: regForm.complete_address,
      student_count_estimate: Number(regForm.student_count_estimate),
      teacher_count_estimate: Number(regForm.teacher_count_estimate),
      branches_count: Number(regForm.branches_count),
      registration_number: regForm.registration_number,
      selected_plan: regForm.selected_plan,
      selected_duration: regForm.selected_duration,
    });

    setSubmittedApp(newApp);
  };

  const handleStatusSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusSearchQuery.trim()) return;
    const query = statusSearchQuery.trim().toLowerCase();
    const apps = db.getApplications();
    const match = apps.find(
      (a) =>
        a.application_id.toLowerCase() === query ||
        a.official_email.toLowerCase() === query ||
        a.mobile_number === query
    );
    setFoundApp(match || 'not_found');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const schools = db.getAllSchools();
    const matchedSchool = schools.find((s) => s.email.toLowerCase() === loginEmail.trim().toLowerCase());

    if (!matchedSchool) {
      setLoginError('No approved school account found with this email. Please check your credentials or register your school first.');
      return;
    }

    if (matchedSchool.status === 'suspended') {
      setLoginError('This school account has been suspended by the Super Admin. Please contact support.');
      return;
    }

    // Login successful
    onEnterDashboard(matchedSchool.id);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.transactionId || !payForm.depositorName) {
      alert('Please enter Transaction ID and Depositor Name.');
      return;
    }

    const price = PRICING_MATRIX[payForm.tier][payForm.duration];
    db.submitSubscriptionPayment(payForm.schoolId, {
      tier: payForm.tier,
      duration: payForm.duration,
      price_pkr: price,
      payment_method: payForm.paymentMethod,
      transaction_id: payForm.transactionId,
      depositor_name: payForm.depositorName,
      remarks: payForm.remarks,
    });

    setPaymentSuccess(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Navigation (Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-base shadow-xs">
            PK
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Pakistan School Management SaaS
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600">
          <Link
            href="/school/welcome"
            className="text-orange-700 hover:text-orange-800 transition-colors whitespace-nowrap shrink-0 font-bold flex items-center gap-1"
          >
            <span>Portal Gateway</span>
          </Link>
          <Link
            href="/school/login"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            School Login
          </Link>
          <Link
            href="/school/register"
            className="text-emerald-700 hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 font-bold"
          >
            Register Your School
          </Link>
          <Link
            href="/school/application-status"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Track Status
          </Link>
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeTab === 'home' ? 'text-slate-900 font-bold underline' : 'hover:text-slate-900'}`}
          >
            Pricing &amp; Plans
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onEnterDashboard('sch_iqbal_lahore')}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Live School Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Viewports */}
      <main className="flex-1">
        {/* TAB 1: HOME & PLATFORM OVERVIEW */}
        {activeTab === 'home' && (
          <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="bg-white border-b border-slate-200 py-16 px-6 sm:px-12">
              <div className="max-w-5xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-medium text-orange-800">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Tailored Specifically for Pakistani Schools, Boards & Curricula</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight text-balance leading-tight">
                  The Complete Multi-School SaaS Platform for Pakistan
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Enterprise school administration powered by Supabase PostgreSQL. Manage student admissions with B-Form, generate Pakistani 3-copy Bank Fee Challans (Cash / JazzCash / EasyPaisa), create customized question papers, and print official A4 DMC Result Cards.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Link
                    href="/school/welcome"
                    className="px-6 py-3 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span>School Portal Gateway</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/school/register"
                    className="px-6 py-3 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>Register Your School</span>
                  </Link>
                  <button
                    onClick={() => onEnterDashboard('sch_iqbal_lahore')}
                    className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                  >
                    Explore Live School Dashboard
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">3-Part Bank Challan</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Bank, School & Student copies on single A4</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">Manual Subjects</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">No forced lists; custom classes & Urdu labels</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">Paper & DMC Builder</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">MCQs, short questions, and printable result cards</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-900">Meezan / JazzCash</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Direct Pakistani payment gateways & cash book</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Modules Showcase */}
            <section className="max-w-6xl mx-auto px-6">
              <div className="text-center space-y-2 mb-10">
                <h2 className="text-2xl font-bold text-slate-900">Comprehensive Operational Modules</h2>
                <p className="text-sm text-slate-500">Every tool school principals and accountants need for day-to-day operations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Users,
                    title: 'Student Admissions & B-Form',
                    desc: 'Complete student records with B-Form validation, guardian contacts, merit concessions, printable ID cards, and instant official A4 Admission Letters.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Fee Challans & Cashier Counter',
                    desc: 'Generate monthly class-wise fee challans with previous arrears and late fines. Support partial payments, payment reversal audit trail, and print receipts.',
                  },
                  {
                    icon: BookOpen,
                    title: 'Manual Subject & Class Creator',
                    desc: 'Create custom classes (e.g. Matric Science, FSc Pre-Medical, O-Levels) and manually assign subjects with Urdu names, total marks, and passing criteria.',
                  },
                  {
                    icon: FileText,
                    title: 'Question Paper & Date Sheet Builder',
                    desc: 'Build exam question papers with MCQs, short questions, and answer keys. Generate examination date sheets with automatic room & teacher clash detection.',
                  },
                  {
                    icon: Award,
                    title: 'DMC Result Cards & Grading',
                    desc: 'Record term marks, calculate percentages, assign Pakistani board grades (A+, A, B, C), compute class positions, and print official Detailed Marks Certificates.',
                  },
                  {
                    icon: Calendar,
                    title: 'Timetable, Payroll & Cash Book',
                    desc: 'Weekly 6-day timetable with clash prevention, staff payroll with salary slip generation, and daily cash book with Meezan/HBL bank ledgers.',
                  },
                ].map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{feat.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Pricing Section in PKR */}
            <section className="max-w-6xl mx-auto px-6">
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Subscription Plans for Pakistani Schools</h2>
                <p className="text-sm text-slate-500">Transparent pricing in Pakistani Rupees (PKR) without hidden charges</p>

                {/* Duration Switcher */}
                <div className="inline-flex p-1 bg-slate-200 rounded-lg text-xs font-semibold">
                  {(['Monthly', 'Quarterly', 'Six Months', 'Yearly'] as SubscriptionDuration[]).map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setSelectedPlanDuration(dur)}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        selectedPlanDuration === dur
                          ? 'bg-white text-orange-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    tier: 'Basic' as SubscriptionTier,
                    label: 'For Primary & Middle Schools',
                    students: 'Up to 300 Students',
                    staff: 'Up to 30 Teachers & Staff',
                    branches: 'Single Campus',
                    features: [
                      'Student Admission & B-Form',
                      'Monthly Fee Challan Generation',
                      'Daily Attendance Register',
                      'Class & Subject Management',
                      'Official Admission Letters',
                    ],
                  },
                  {
                    tier: 'Standard' as SubscriptionTier,
                    label: 'For High Schools & Inter Colleges',
                    popular: true,
                    students: 'Up to 800 Students',
                    staff: 'Up to 60 Teachers & Staff',
                    branches: 'Up to 2 Campuses',
                    features: [
                      'Everything in Basic Plan',
                      '3-Part Bank Challan Printing',
                      'DMC / Result Card Builder',
                      'Question Paper & Date Sheet Builder',
                      'Staff Payroll & Salary Slips',
                      'Daily Cash Book & Bank Accounts',
                    ],
                  },
                  {
                    tier: 'Premium' as SubscriptionTier,
                    label: 'For School Systems & Cadets',
                    students: 'Up to 2,500 Students',
                    staff: 'Up to 150 Teachers & Staff',
                    branches: 'Up to 5 Campuses',
                    features: [
                      'Everything in Standard Plan',
                      'WhatsApp Broadcast Notifications',
                      'Weekly Timetable Clash Detection',
                      'Character & Leaving Certificates',
                      'Priority Support Ticket Hotline',
                      'Dedicated Supabase DB Backup',
                    ],
                  },
                ].map((plan) => {
                  const price = PRICING_MATRIX[plan.tier][selectedPlanDuration];
                  return (
                    <div
                      key={plan.tier}
                      className={`p-6 rounded-xl bg-white border flex flex-col justify-between relative ${
                        plan.popular ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                          Most Popular in Pakistan
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{plan.tier} Package</h3>
                          <p className="text-xs text-slate-500">{plan.label}</p>
                        </div>

                        <div className="py-2 border-y border-slate-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-slate-900 font-mono">
                              PKR {price.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500">/{selectedPlanDuration.toLowerCase()}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {plan.students} · {plan.branches}
                          </p>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-700">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={() => {
                            setRegForm({ ...regForm, selected_plan: plan.tier, selected_duration: selectedPlanDuration });
                            setActiveTab('register');
                          }}
                          className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors ${
                            plan.popular
                              ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          Register for {plan.tier}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: SCHOOL REGISTRATION */}
        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto px-6 py-12">
            {submittedApp ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">School Application Submitted!</h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Thank you for registering <strong className="text-slate-900">{submittedApp.school_name_en}</strong>. Your application has been logged to the shared Supabase database and forwarded to the Super Admin Panel for approval.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md mx-auto text-left space-y-1.5 text-xs">
                  <div>Application ID: <strong className="font-mono text-orange-600 text-sm">{submittedApp.application_id}</strong></div>
                  <div>Official Email: <strong className="text-slate-900">{submittedApp.official_email}</strong></div>
                  <div>Status: <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">{submittedApp.status}</span></div>
                  <div>Selected Plan: <strong className="text-slate-900">{submittedApp.selected_plan} ({submittedApp.selected_duration})</strong></div>
                </div>

                <p className="text-xs text-slate-500">
                  Save your Application ID. You can check your application review status at any time.
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setStatusSearchQuery(submittedApp.application_id);
                      setFoundApp(submittedApp);
                      setActiveTab('status');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                  >
                    Track Application Status
                  </button>
                  <button
                    onClick={() => setSubmittedApp(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Register Another School
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">New School Registration</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Please provide complete and authentic school details as registered with your provincial education department or board.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b pb-1">
                      1. School Identification
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          School Name (English) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Quaid Science Model High School"
                          value={regForm.school_name_en}
                          onChange={(e) => setRegForm({ ...regForm, school_name_en: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          School Name (Urdu)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: قائد سائنس ماڈل ہائی سکول"
                          value={regForm.school_name_ur}
                          onChange={(e) => setRegForm({ ...regForm, school_name_ur: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md font-urdu focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          School Type *
                        </label>
                        <select
                          value={regForm.school_type}
                          onChange={(e) => setRegForm({ ...regForm, school_type: e.target.value as SchoolType })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                        >
                          <option value="Private">Private School</option>
                          <option value="Higher Secondary">Higher Secondary / Inter College</option>
                          <option value="Cadet College">Cadet College</option>
                          <option value="Semi-Government">Semi-Government / Cantonment Board</option>
                          <option value="Foundation / NGO">Foundation / NGO / Trust</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Govt / Board Registration No. (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. REG/LHR/EDU/2021-998"
                          value={regForm.registration_number}
                          onChange={(e) => setRegForm({ ...regForm, registration_number: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Leadership & Contacts */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b pb-1">
                      2. Leadership & Official Contacts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Owner / Chairman Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Muhammad Aslam Chaudhry"
                          value={regForm.owner_name}
                          onChange={(e) => setRegForm({ ...regForm, owner_name: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Principal / Head Teacher Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Nabila Rauf"
                          value={regForm.principal_name}
                          onChange={(e) => setRegForm({ ...regForm, principal_name: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Official School Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="admin@schoolname.edu.pk"
                          value={regForm.official_email}
                          onChange={(e) => setRegForm({ ...regForm, official_email: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number (SMS verification) *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0300-1234567"
                          value={regForm.mobile_number}
                          onChange={(e) => setRegForm({ ...regForm, mobile_number: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          WhatsApp Business Number
                        </label>
                        <input
                          type="tel"
                          placeholder="0300-1234567"
                          value={regForm.whatsapp_number}
                          onChange={(e) => setRegForm({ ...regForm, whatsapp_number: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Portal Login Password *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Choose a strong password"
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location & Statistics */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b pb-1">
                      3. Location & Campus Metrics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Province *</label>
                        <select
                          value={regForm.province}
                          onChange={(e) => setRegForm({ ...regForm, province: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                        >
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lahore, Rawalpindi, Peshawar"
                          value={regForm.district}
                          onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lahore"
                          value={regForm.city}
                          onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Complete Campus Address *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Street, Sector/Block, Postal Code"
                        value={regForm.complete_address}
                        onChange={(e) => setRegForm({ ...regForm, complete_address: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Students</label>
                        <input
                          type="number"
                          value={regForm.student_count_estimate}
                          onChange={(e) => setRegForm({ ...regForm, student_count_estimate: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Teachers</label>
                        <input
                          type="number"
                          value={regForm.teacher_count_estimate}
                          onChange={(e) => setRegForm({ ...regForm, teacher_count_estimate: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Branches Count</label>
                        <input
                          type="number"
                          min={1}
                          value={regForm.branches_count}
                          onChange={(e) => setRegForm({ ...regForm, branches_count: Number(e.target.value) })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 border-b pb-1">
                      4. Subscription Plan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['Basic', 'Standard', 'Premium'] as SubscriptionTier[]).map((tier) => (
                        <div
                          key={tier}
                          onClick={() => setRegForm({ ...regForm, selected_plan: tier })}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            regForm.selected_plan === tier
                              ? 'border-orange-500 bg-orange-50/60 ring-1 ring-orange-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{tier} Plan</span>
                            {regForm.selected_plan === tier && (
                              <Check className="w-3.5 h-3.5 text-orange-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            PKR {PRICING_MATRIX[tier][regForm.selected_duration].toLocaleString()} / {regForm.selected_duration.toLowerCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
                    >
                      <span>Submit Application for Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPLICATION STATUS TRACKER */}
        {activeTab === 'status' && (
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Track School Application Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your unique Application ID (e.g. <span className="font-mono">APP-PK-2026-9021</span>) or official registered email.
                </p>
              </div>

              <form onSubmit={handleStatusSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Application ID (APP-PK-2026-XXXX) or Email"
                  value={statusSearchQuery}
                  onChange={(e) => setStatusSearchQuery(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Check Status
                </button>
              </form>
            </div>

            {foundApp === 'not_found' && (
              <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                No matching school registration found for &quot;{statusSearchQuery}&quot;. Please verify the Application ID or registered email.
              </div>
            )}

            {foundApp && foundApp !== 'not_found' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{foundApp.school_name_en}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{foundApp.application_id}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    foundApp.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : foundApp.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : foundApp.status === 'Under Review'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {foundApp.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg">
                  <div>Principal: <strong className="text-slate-900">{foundApp.principal_name}</strong></div>
                  <div>Campus: <strong className="text-slate-900">{foundApp.city}, {foundApp.province}</strong></div>
                  <div>Submission Date: <strong className="text-slate-900">{foundApp.created_at.split('T')[0]}</strong></div>
                  <div>Plan Selected: <strong className="text-orange-600">{foundApp.selected_plan} ({foundApp.selected_duration})</strong></div>
                  {foundApp.internal_notes && (
                    <div className="col-span-2 text-slate-600 pt-2 border-t border-slate-200">
                      Super Admin Note: <span className="italic">{foundApp.internal_notes}</span>
                    </div>
                  )}
                </div>

                {foundApp.status === 'Approved' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Application Approved by Super Admin!</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Your school account has been provisioned. Log in to access your School Management Dashboard.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setLoginEmail(foundApp.official_email);
                        setActiveTab('login');
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                    >
                      Proceed to School Login
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Your application is currently being reviewed by the platform administrators. You can also test approving it instantly via the top right &quot;Super Admin&quot; drawer!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SCHOOL ADMIN LOGIN */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto px-6 py-14">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold mx-auto text-xl shadow-xs">
                  PK
                </div>
                <h2 className="text-xl font-bold text-slate-900 pt-2">School Admin Portal</h2>
                <p className="text-xs text-slate-500">
                  Sign in to manage your school students, fee challans, and staff
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official School Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered official email.'); }} className="text-[11px] text-orange-600 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs transition-colors"
                >
                  Sign In to School Dashboard
                </button>
              </form>

              {/* Instant Test Accounts */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Quick Login Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onEnterDashboard('sch_iqbal_lahore')}
                    className="p-2 border border-slate-200 rounded-md text-left hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900 truncate">Iqbal Public School</p>
                    <p className="text-[10px] text-slate-500">Lahore · Standard</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterDashboard('sch_quaid_islamabad')}
                    className="p-2 border border-slate-200 rounded-md text-left hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900 truncate">Quaid-e-Azam Academy</p>
                    <p className="text-[10px] text-slate-500">Islamabad · Premium</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pakistan School Management SaaS. Built for Pakistani Education Institutions.</p>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('home')} className="hover:text-slate-900">Features</button>
            <button onClick={() => setActiveTab('register')} className="hover:text-slate-900">Registration</button>
            <button onClick={() => setActiveTab('status')} className="hover:text-slate-900">Status Check</button>
          </div>
        </div>
      </footer>
    </div>
  );
}