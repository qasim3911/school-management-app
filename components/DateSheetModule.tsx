'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, DateSheet, DateSheetItem } from '@/lib/types';
import { Calendar, Plus, Printer, Trash2, X, AlertTriangle, Download } from 'lucide-react';
import { triggerPrint, downloadDateSheetPDF } from '@/lib/pdf-generator';

interface DateSheetModuleProps {
  school: School;
}

export function DateSheetModule({ school }: DateSheetModuleProps) {
  const dateSheets = db.getDateSheets(school.id);
  const classes = db.getClasses(school.id);
  const subjects = db.getSubjects(school.id);
  const exams = db.getExams(school.id);

  const [activeSheet, setActiveSheet] = useState<DateSheet | null>(dateSheets[0] || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [examId, setExamId] = useState(exams[0]?.id || '');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [instructions, setInstructions] = useState('Reporting time is 08:00 AM. Proper uniform and Roll No slips are mandatory.');
  const [items, setItems] = useState<DateSheetItem[]>([
    { id: '1', subject_id: subjects[0]?.id || '', exam_date: '2026-11-10', start_time: '08:30 AM', end_time: '11:00 AM', room_no: 'Hall A' },
    { id: '2', subject_id: subjects[1]?.id || '', exam_date: '2026-11-12', start_time: '08:30 AM', end_time: '11:00 AM', room_no: 'Hall A' },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${prev.length + 1}`,
        subject_id: subjects[0]?.id || '',
        exam_date: '2026-11-15',
        start_time: '08:30 AM',
        end_time: '11:00 AM',
        room_no: 'Hall B',
      },
    ]);
  };

  const handleSaveDateSheet = (e: React.FormEvent) => {
    e.preventDefault();
    const created = db.createDateSheet({
      school_id: school.id,
      exam_id: examId,
      class_id: classId,
      general_instructions: instructions,
      items,
      is_published: true,
    });
    setActiveSheet(created);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Examination Date Sheet Builder</h2>
          <p className="text-xs text-slate-500">
            Publish standardized examination date sheets with subject timings, halls, and student instructions
          </p>
        </div>

        <div className="flex gap-2">
          {activeSheet && (
            <>
              <button
                onClick={() => downloadDateSheetPDF(school, activeSheet, subjects)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={triggerPrint}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Date Sheet (A4)
              </button>
            </>
          )}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Build Date Sheet
          </button>
        </div>
      </div>

      {activeSheet && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 print-container max-w-4xl mx-auto">
          {/* School Header */}
          <div className="text-center border-b-2 border-orange-600 pb-3 space-y-0.5">
            <span className="text-xs font-urdu text-slate-500 font-bold">{school.name_ur}</span>
            <h1 className="text-2xl font-black text-orange-600">{school.name_en}</h1>
            <p className="text-xs text-slate-600">{school.address}</p>
          </div>

          <div className="text-center">
            <h3 className="text-base font-extrabold text-slate-900 uppercase">
              EXAMINATION DATE SHEET - FIRST TERM 2026
            </h3>
            <p className="text-xs text-slate-500">Class: Matric Science (Grade 10) · Academic Session 2026-2027</p>
          </div>

          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-orange-600 text-white font-bold">
              <tr>
                <th className="py-2 px-3 text-left">Exam Date</th>
                <th className="py-2 px-3 text-left">Day</th>
                <th className="py-2 px-3 text-left">Subject</th>
                <th className="py-2 px-3 text-center">Timings</th>
                <th className="py-2 px-3 text-center">Room / Hall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeSheet.items.map((it, idx) => {
                const sub = subjects.find((s) => s.id === it.subject_id);
                const dayName = new Date(it.exam_date).toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <tr key={it.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{it.exam_date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{dayName}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{sub?.name_en || 'Science'}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{it.start_time} - {it.end_time}</td>
                    <td className="py-2.5 px-3 text-center font-medium">{it.room_no || 'Examination Hall'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">Important Instructions for Candidates:</p>
            <p>{activeSheet.general_instructions}</p>
          </div>

          <div className="pt-6 flex justify-between text-xs text-slate-700">
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span>Controller of Exams</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span>Principal</span>
            </div>
          </div>
        </div>
      )}

      {/* Builder Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Build New Date Sheet</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDateSheet} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam</label>
                  <select value={examId} onChange={(e) => setExamId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">General Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">Exam Schedule Items</h4>
                  <button type="button" onClick={handleAddItem} className="text-xs font-bold text-orange-600 hover:underline">
                    + Add Date Slot
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded items-center">
                      <select
                        value={item.subject_id}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].subject_id = e.target.value;
                          setItems(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white text-xs"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name_en}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={item.exam_date}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].exam_date = e.target.value;
                          setItems(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white text-xs"
                      />
                      <input
                        type="text"
                        value={item.start_time}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].start_time = e.target.value;
                          setItems(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Room / Hall"
                        value={item.room_no || ''}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].room_no = e.target.value;
                          setItems(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs">
                  Save &amp; Publish Date Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
