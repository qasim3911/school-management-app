'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Student, Staff, AttendanceRecord } from '@/lib/types';
import { CheckSquare, Calendar, Check, X, AlertTriangle, Users, Printer } from 'lucide-react';
import { triggerPrint } from '@/lib/pdf-generator';

interface AttendanceModuleProps {
  school: School;
}

export function AttendanceModule({ school }: AttendanceModuleProps) {
  const [activeType, setActiveType] = useState<'Student' | 'Staff'>('Student');
  const clientTodayStr = React.useSyncExternalStore(
    () => () => {},
    () => new Date().toISOString().split('T')[0],
    () => '2026-11-01'
  );
  const [customDate, setCustomDate] = useState<string | null>(null);
  const selectedDate = customDate ?? clientTodayStr;
  const setSelectedDate = (dateVal: string) => setCustomDate(dateVal);

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');

  const classes = db.getClasses(school.id);
  const sections = db.getSections(school.id);
  const allStudents = db.getStudents(school.id);
  const staff = db.getStaff(school.id);

  // Filter students by selected class/section
  const students = allStudents.filter((s) => {
    if (selectedClassId !== 'all' && s.class_id !== selectedClassId) return false;
    if (selectedSectionId !== 'all' && s.section_id !== selectedSectionId) return false;
    return true;
  });

  // State mapping for attendance
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceRecord['status']>>({});

  const handleSetStatus = (id: string, status: AttendanceRecord['status']) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  const markAllPresent = () => {
    const list = activeType === 'Student' ? students : staff;
    const updated = { ...statusMap };
    list.forEach((item) => {
      updated[item.id] = 'Present';
    });
    setStatusMap(updated);
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveAttendanceRegister = () => {
    const list = activeType === 'Student' ? students : staff;
    const records: AttendanceRecord[] = list.map((item) => ({
      id: `att_${Date.now()}_${item.id}`,
      school_id: school.id,
      type: activeType,
      entity_id: item.id,
      date: selectedDate,
      status: statusMap[item.id] || 'Present',
    }));
    db.saveAttendance(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const list = activeType === 'Student' ? students : staff;
  const presentCount = list.filter((item) => (statusMap[item.id] || 'Present') === 'Present').length;
  const absentCount = list.filter((item) => statusMap[item.id] === 'Absent').length;
  const lateCount = list.filter((item) => statusMap[item.id] === 'Late').length;
  const leaveCount = list.filter((item) => statusMap[item.id] === 'Leave').length;
  const attendanceRate = list.length > 0 ? Math.round(((presentCount + lateCount) / list.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daily Attendance Register &amp; Turnout</h2>
          <p className="text-xs text-slate-500">
            Real-time daily register for student classes and faculty staff with automated monthly payroll deduction sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerPrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Daily Sheet
          </button>
          <button
            onClick={markAllPresent}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Mark All Present
          </button>
          <button
            onClick={saveAttendanceRegister}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            {saveSuccess ? 'Saved to Supabase!' : 'Save Register'}
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveType('Student')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              activeType === 'Student' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Students Register
          </button>
          <button
            onClick={() => setActiveType('Staff')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              activeType === 'Staff' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Teachers &amp; Staff Register
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {activeType === 'Student' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-xs"
                >
                  <option value="all">All Classes ({allStudents.length})</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Section:</span>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-xs"
                >
                  <option value="all">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-md font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Turnout Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Turnout Rate</span>
          <p className="text-xl font-black text-emerald-600 font-mono tabular-nums">{attendanceRate}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Present</span>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">{presentCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Late</span>
          <p className="text-xl font-black text-amber-600 font-mono tabular-nums">{lateCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Absent</span>
          <p className="text-xl font-black text-red-600 font-mono tabular-nums">{absentCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Approved Leave</span>
          <p className="text-xl font-black text-blue-600 font-mono tabular-nums">{leaveCount}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print-container">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="py-2.5 px-4 text-left font-semibold">ID / Adm No</th>
              <th className="py-2.5 px-4 text-left font-semibold">Name</th>
              <th className="py-2.5 px-4 text-left font-semibold">Role / Class</th>
              <th className="py-2.5 px-4 text-center font-semibold">Status Selection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((item) => {
              const currentStatus = statusMap[item.id] || 'Present';
              const isStudent = activeType === 'Student';
              const st = item as Student;
              const sf = item as Staff;
              return (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono font-bold text-orange-600">
                    {isStudent ? st.admission_number : sf.employee_id}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">
                    {isStudent ? 'Matric Science (Sec A)' : sf.designation}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-1 text-[11px] font-bold">
                      {(['Present', 'Late', 'Absent', 'Leave'] as AttendanceRecord['status'][]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleSetStatus(item.id, st)}
                          className={`px-3 py-1 rounded transition-colors ${
                            currentStatus === st
                              ? st === 'Present'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : st === 'Late'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : st === 'Absent'
                                ? 'bg-red-600 text-white shadow-2xs'
                                : 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
