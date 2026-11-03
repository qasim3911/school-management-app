'use client';

import React from 'react';
import Link from 'next/link';
import {
  LogIn,
  UserPlus,
  KeyRound,
  Search,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Award,
  Users,
  Building2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function SchoolWelcomePage() {
  return (
    <div className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-800 text-xs font-semibold shadow-2xs">
          <span>🇵🇰</span>
          <span>Official Pakistan School Management SaaS Gateway</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Welcome to the School Administration Portal
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-medium">
          Secure, multi-tenant academic and institutional operating system built specifically for Pakistani private, semi-government, and foundation schools.
        </p>

        <p className="text-base sm:text-lg font-urdu text-orange-700 font-bold">
          تمام پاکستانی تعلیمی اداروں کے لیے مکمل اور جدید مینجمنٹ سسٹم
        </p>
      </div>

      {/* The Three Clearly Visible Core Options */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {/* Option 1: School Login */}
        <div className="bg-white rounded-2xl border-2 border-orange-500/80 shadow-md hover:shadow-lg transition-all p-7 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <LogIn className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Authorized Personnel
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                School Login
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-semibold mt-0.5">
                سکول ایڈمن لاگ ان
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in to your approved school administration portal. Manage daily admissions, fee challans, faculty payroll, examinations, and official student documents.
            </p>

            <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Supabase Auth email &amp; password</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Strict multi-tenant school isolation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Active subscription access</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
            <Link
              href="/school/login"
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors group-hover:gap-3"
            >
              <span>Login to School Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Option 2: Register Your School */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md hover:shadow-lg transition-all p-7 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <UserPlus className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                New Institutions
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Register Your School
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-semibold mt-0.5">
                اپنا سکول رجسٹر کریں
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Onboard your school, academy, or cadet college. Submit your institutional registration, principal credentials, district, and logo for Super Admin review.
            </p>

            <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unique Application ID generation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Super Admin approval safeguards</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>14-Day Full-Feature Trial</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
            <Link
              href="/school/register"
              className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors group-hover:gap-3"
            >
              <span>Register Your School</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Option 3: Forgot Password */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-7 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md">
              <KeyRound className="w-7 h-7 text-orange-400" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Account Recovery
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Forgot Password
              </h2>
              <p className="text-xs font-urdu text-slate-500 font-semibold mt-0.5">
                پاس ورڈ دوبارہ حاصل کریں
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Lost access to your principal or administrator credentials? Dispatch an automated and secure recovery link to your registered official school email address.
            </p>

            <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Supabase Auth encrypted reset link</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Direct password change form</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>No plain text password storage</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/school/forgot-password"
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors group-hover:gap-3"
            >
              <span>Reset School Password</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Track Application Banner */}
      <div className="mt-10 max-w-5xl mx-auto w-full bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400 shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">Already submitted an application?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Track your accreditation verification, Super Admin review remarks, or approval progress using your Application ID.
            </p>
          </div>
        </div>

        <Link
          href="/school/application-status"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Check Application Status</span>
        </Link>
      </div>

      {/* Feature Badges for Institutional Trust */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto w-full text-center">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <Receipt className="w-5 h-5 text-orange-600 mx-auto mb-2" />
          <h4 className="font-bold text-xs text-slate-900">3-in-1 Bank Challans</h4>
          <p className="text-[11px] text-slate-500">Bank, School &amp; Student copies</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <Award className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-xs text-slate-900">BISE Result Cards</h4>
          <p className="text-[11px] text-slate-500">Board grading &amp; positions</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
          <h4 className="font-bold text-xs text-slate-900">SLC &amp; Character Certs</h4>
          <p className="text-[11px] text-slate-500">Official serial-numbered PDFs</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <ShieldCheck className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <h4 className="font-bold text-xs text-slate-900">Data Security</h4>
          <p className="text-[11px] text-slate-500">Supabase Auth &amp; PostgreSQL RLS</p>
        </div>
      </div>
    </div>
  );
}
