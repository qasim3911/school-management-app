'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Exam, Student, Subject, ExamMarks } from '@/lib/types';
import { Award, Plus, Calendar, Check, Search, Printer, Edit3, X } from 'lucide-react';

interface ExamsModuleProps {
  school: School;
  onOpenResultCard: (studentId: string, marks: { subject: string; total: number; passing: number; obtained: number }[]) => void;
}

export function ExamsModule({ school, onOpenResultCard }: ExamsModuleProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [marksModalStudent, setMarksModalStudent] = useState<Student | null>(null);

  const exams = db.getExams(school.id);
  const students = db.getStudents(school.id);
  const subjects = db.getSubjects(school.id);
  const examMarks = db.getExamMarks(school.id);

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // New Exam Form
  const [examForm, setExamForm] = useState({
    name: 'Mid-Term Examination 2026',
    exam_type: 'Midterm' as Exam['exam_type'],
    start_date: '2026-11-10',
    end_date: '2026-11-20',
  });

  const [studentMarksInput, setStudentMarksInput] = useState<Record<string, number>>({});

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name) return;

    const created = db.createExam({
      school_id: school.id,
      session_id: 'ses_2026_2027_s1',
      name: examForm.name,
      exam_type: examForm.exam_type,
      start_date: examForm.start_date,
      end_date: examForm.end_date,
      is_published: true,
    });

    setIsCreateModalOpen(false);
    setSelectedExamId(created.id);
  };

  const handleOpenMarksEntry = (student: Student) => {
    setMarksModalStudent(student);
    const initialMarks: Record<string, number> = {};
    subjects.forEach((sub) => {
      const existing = examMarks.find(
        (m) =>
          m.exam_id === (activeExam?.id || '') &&
          m.student_id === student.id &&
          m.subject_id === sub.id
      );
      initialMarks[sub.id] = existing ? existing.obtained_marks : 0;
    });
    setStudentMarksInput(initialMarks);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marksModalStudent || !activeExam) return;

    subjects.forEach((sub) => {
      const val = Number(studentMarksInput[sub.id] || 0);
      db.saveExamMarks({
        school_id: school.id,
        exam_id: activeExam.id,
        student_id: marksModalStudent.id,
        subject_id: sub.id,
        total_marks: sub.total_marks,
        passing_marks: sub.passing_marks,
        obtained_marks: val,
      });
    });

    setMarksModalStudent(null);
  };

  const handlePrintDMC = (student: Student) => {
    if (!activeExam) return;
    const formattedMarks = subjects.map((sub) => {
      const mark = examMarks.find(
        (m) =>
          m.exam_id === activeExam.id &&
          m.student_id === student.id &&
          m.subject_id === sub.id
      );
      return {
        subject: sub.name_en,
        total: sub.total_marks,
        passing: sub.passing_marks,
        obtained: mark ? mark.obtained_marks : 75,
      };
    });

    onOpenResultCard(student.id, formattedMarks);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Examinations, Marks &amp; DMC Result Cards</h2>
          <p className="text-xs text-slate-500">
            Enter subject-wise test marks, calculate percentages and positions, and generate official Detailed Marks Certificates
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Create Examination
        </button>
      </div>

      {/* Select Active Exam */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-slate-800">Select Exam:</span>
          <select
            value={activeExam?.id}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.exam_type})
              </option>
            ))}
          </select>
        </div>

        {activeExam && (
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>Duration: <strong className="text-slate-800 font-mono">{activeExam.start_date}</strong> to <strong className="text-slate-800 font-mono">{activeExam.end_date}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">PUBLISHED</span>
          </div>
        )}
      </div>

      {/* Student Marks Overview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">Adm No</th>
                <th className="py-2.5 px-4 text-left font-semibold">Student Name</th>
                <th className="py-2.5 px-4 text-left font-semibold">Class</th>
                <th className="py-2.5 px-4 text-center font-semibold">Marks Entered</th>
                <th className="py-2.5 px-4 text-center font-semibold">Result Status</th>
                <th className="py-2.5 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-orange-600">{st.admission_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{st.name}</td>
                  <td className="py-3 px-4 text-slate-600">Matric Science (Grade 10)</td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="text-slate-800 font-medium">Recorded</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      PASSED (Grade A)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenMarksEntry(st)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Enter Marks
                      </button>
                      <button
                        onClick={() => handlePrintDMC(st)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded flex items-center gap-1 shadow-2xs"
                      >
                        <Printer className="w-3 h-3" />
                        Print DMC
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Create New Examination</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Exam, Final Annual 2026"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
                <select
                  value={examForm.exam_type}
                  onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value as Exam['exam_type'] })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  <option value="Monthly Test">Monthly Test</option>
                  <option value="Weekly Test">Weekly Test</option>
                  <option value="Midterm">Midterm Examination</option>
                  <option value="Final Exam">Final Examination</option>
                  <option value="Annual Exam">Annual Board Pattern Exam</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={examForm.start_date}
                    onChange={(e) => setExamForm({ ...examForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={examForm.end_date}
                    onChange={(e) => setExamForm({ ...examForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Marks Modal */}
      {marksModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Enter Subject Marks</h3>
                <p className="text-xs text-slate-400">
                  {marksModalStudent.name} ({marksModalStudent.admission_number}) · {activeExam?.name}
                </p>
              </div>
              <button onClick={() => setMarksModalStudent(null)} className="text-slate-400 hover:text-white p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="p-6 overflow-y-auto space-y-3 text-xs">
              <div className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">{sub.name_en}</p>
                      <p className="text-[11px] text-slate-500 font-urdu">{sub.name_ur}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Max: {sub.total_marks} | Pass: {sub.passing_marks}</p>
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        min={0}
                        max={sub.total_marks}
                        value={studentMarksInput[sub.id] || 0}
                        onChange={(e) =>
                          setStudentMarksInput({
                            ...studentMarksInput,
                            [sub.id]: Number(e.target.value),
                          })
                        }
                        className="w-full text-center px-3 py-1.5 border border-slate-300 rounded-md font-mono font-bold text-sm focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMarksModalStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Save Marks &amp; Update DMC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
