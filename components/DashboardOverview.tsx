'use client';

import React from 'react';
import { db } from '@/lib/db';
import { School } from '@/lib/types';
import {
  Users,
  UserCheck,
  CheckSquare,
  Receipt,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileText,
} from 'lucide-react';

interface DashboardOverviewProps {
  school: School;
  setActiveModule: (mod: string) => void;
  onOpenAdmissionLetter: (studentId: string) => void;
  onOpenChallan: (challanId: string) => void;
}

export function DashboardOverview({
  school,
  setActiveModule,
  onOpenAdmissionLetter,
  onOpenChallan,
}: DashboardOverviewProps) {
  const stats = db.getDashboardStats(school.id);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {school.principal_name}
            </h2>
            <span className="text-xs font-urdu text-slate-500 font-bold">{school.name_ur}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Academic Session <span className="font-semibold text-slate-800">2026-2027</span> · Campus: {school.city}, {school.province} · Timings: {school.school_timings || '07:45 AM - 01:45 PM'}
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModule('students')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Admission
          </button>
          <button
            onClick={() => setActiveModule('fees')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-orange-600" />
            Issue Challan
          </button>
          <button
            onClick={() => setActiveModule('question_papers')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            Exam Paper
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {stats.totalStudents}
          </p>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span>{stats.activeStudents} actively enrolled</span>
          </div>
        </div>

        {/* Teachers & Staff */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Teaching &amp; Staff</span>
            <UserCheck className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {stats.totalStaff}
          </p>
          <p className="text-[11px] text-slate-500">
            {stats.totalTeachers} Senior Teachers
          </p>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Today&apos;s Attendance</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {stats.todayAttendanceRate}%
          </p>
          <p className="text-[11px] text-slate-500">High daily turnout</p>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Upcoming Exams</span>
            <Award className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {stats.upcomingExamsCount}
          </p>
          <p className="text-[11px] text-slate-500">Mid-Term Exams scheduled</p>
        </div>
      </div>

      {/* Financial Health Row (Pakistani Rupees PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Fee Collection */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Monthly Fee Collection</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
            PKR {stats.monthlyFeeCollection.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600">Cleared this month</p>
        </div>

        {/* Pending Fee Arrears */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Fees Arrears</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-black text-red-600 font-mono tabular-nums">
            PKR {stats.pendingFees.toLocaleString()}
          </p>
          <button
            onClick={() => setActiveModule('fees')}
            className="text-[11px] text-orange-600 font-semibold hover:underline"
          >
            View Defaulters List →
          </button>
        </div>

        {/* Cash in Hand */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cash in Hand (Counter)</span>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
            PKR {stats.cashInHand.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Petty Cash Ledger</p>
        </div>

        {/* Bank Balance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Meezan Bank Account</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
            PKR {stats.bankBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">A/C: 0102-0104882190</p>
        </div>
      </div>

      {/* Two Column Section: Recent Admissions & Fee Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Student Admissions</h3>
            <button
              onClick={() => setActiveModule('students')}
              className="text-xs text-orange-600 hover:underline font-semibold"
            >
              View All Students →
            </button>
          </div>

          <div className="overflow-x-auto">
            {stats.recentAdmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <p className="text-xs font-medium">No student admissions recorded yet.</p>
                <button
                  onClick={() => setActiveModule('students')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enroll First Student</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Adm #</th>
                    <th className="py-2 px-3 text-left font-semibold">Student Name</th>
                    <th className="py-2 px-3 text-left font-semibold">Father Name</th>
                    <th className="py-2 px-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentAdmissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono font-medium text-orange-600">{s.admission_number}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.father_name}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onOpenAdmissionLetter(s.id)}
                          className="px-2 py-0.5 text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded cursor-pointer"
                        >
                          Admission Letter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Fee Challans */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Fee Challans &amp; Status</h3>
            <button
              onClick={() => setActiveModule('fees')}
              className="text-xs text-orange-600 hover:underline font-semibold"
            >
              Fee Management →
            </button>
          </div>

          <div className="overflow-x-auto">
            {stats.feeChallans.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <p className="text-xs font-medium">No fee challans generated yet for this cycle.</p>
                <button
                  onClick={() => setActiveModule('fees')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-orange-600" />
                  <span>Issue Fee Challan</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Challan #</th>
                    <th className="py-2 px-3 text-right font-semibold">Payable</th>
                    <th className="py-2 px-3 text-center font-semibold">Status</th>
                    <th className="py-2 px-3 text-center font-semibold">Print 3-Part</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {stats.feeChallans.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{c.challan_number}</td>
                      <td className="py-2.5 px-3 text-right text-slate-900 font-bold">
                        PKR {c.total_payable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          c.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'Partially Paid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          onClick={() => onOpenChallan(c.id)}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded cursor-pointer"
                        >
                          3-Part Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
