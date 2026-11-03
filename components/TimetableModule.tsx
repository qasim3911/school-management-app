'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, TimetableSlot } from '@/lib/types';
import { Clock, Plus, Printer, AlertCircle, X } from 'lucide-react';
import { triggerPrint } from '@/lib/pdf-generator';

interface TimetableModuleProps {
  school: School;
}

export function TimetableModule({ school }: TimetableModuleProps) {
  const [selectedDay, setSelectedDay] = useState<TimetableSlot['day_of_week']>('Monday');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);

  const timetable = db.getTimetable(school.id);
  const classes = db.getClasses(school.id);
  const sections = db.getSections(school.id);
  const subjects = db.getSubjects(school.id);
  const staff = db.getStaff(school.id);
  const teachers = staff.filter((s) => s.department === 'Teaching');

  const [form, setForm] = useState({
    class_id: classes[0]?.id || '',
    section_id: sections[0]?.id || '',
    day_of_week: 'Monday' as TimetableSlot['day_of_week'],
    period_number: 1,
    start_time: '08:00 AM',
    end_time: '08:45 AM',
    subject_id: subjects[0]?.id || '',
    teacher_id: teachers[0]?.id || '',
    room_number: 'Room 20',
  });

  const days: TimetableSlot['day_of_week'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.saveTimetableSlot({
        school_id: school.id,
        class_id: form.class_id,
        section_id: form.section_id,
        day_of_week: form.day_of_week,
        period_number: Number(form.period_number),
        start_time: form.start_time,
        end_time: form.end_time,
        subject_id: form.subject_id,
        teacher_id: form.teacher_id,
        room_number: form.room_number,
      });
      setIsAddSlotOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const daySlots = timetable.filter((t) => t.day_of_week === selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Weekly Academic Timetable</h2>
          <p className="text-xs text-slate-500">
            6-day timetable (Monday to Saturday) with automated teacher and room collision protection
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={triggerPrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Timetable
          </button>
          <button
            onClick={() => setIsAddSlotOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Assign Period Slot
          </button>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              selectedDay === d ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-b-xl border border-slate-200 shadow-2xs overflow-hidden print-container">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">{selectedDay} Schedule</h3>
          <span className="text-xs text-slate-500">Class: Grade 10 Matric Science</span>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="py-2.5 px-4 text-left font-semibold">Period #</th>
              <th className="py-2.5 px-4 text-left font-semibold">Timings</th>
              <th className="py-2.5 px-4 text-left font-semibold">Subject</th>
              <th className="py-2.5 px-4 text-left font-semibold">Assigned Teacher</th>
              <th className="py-2.5 px-4 text-center font-semibold">Room / Lab</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {daySlots.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No periods scheduled for {selectedDay}. Click &quot;Assign Period Slot&quot; to configure.
                </td>
              </tr>
            ) : (
              daySlots.map((slot) => {
                const sub = subjects.find((s) => s.id === slot.subject_id);
                const teacher = teachers.find((t) => t.id === slot.teacher_id);
                return (
                  <tr key={slot.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold font-mono text-orange-600">Period {slot.period_number}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{slot.start_time} - {slot.end_time}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub?.name_en || 'Subject'}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{teacher?.name || 'Assigned Staff'}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{slot.room_number || 'Hall'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Timetable Slot</h3>
              <button onClick={() => setIsAddSlotOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={form.day_of_week}
                  onChange={(e) => setForm({ ...form, day_of_week: e.target.value as TimetableSlot['day_of_week'] })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period #</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={form.period_number}
                    onChange={(e) => setForm({ ...form, period_number: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={form.room_number}
                    onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name_en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <select
                  value={form.teacher_id}
                  onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddSlotOpen(false)} className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs">
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
