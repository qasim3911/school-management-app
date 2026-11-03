'use client';

import React from 'react';
import { School, Student } from '@/lib/types';
import { downloadResultCardPDF, triggerPrint } from '@/lib/pdf-generator';
import { Download, Printer, X, Award } from 'lucide-react';

interface ResultCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  student: Student;
  marks: { subject: string; total: number; passing: number; obtained: number }[];
}

export function ResultCardModal({ isOpen, onClose, school, student, marks }: ResultCardModalProps) {
  if (!isOpen) return null;

  const sumTotal = marks.reduce((acc, m) => acc + m.total, 0);
  const sumObtained = marks.reduce((acc, m) => acc + m.obtained, 0);
  const percentage = sumTotal > 0 ? ((sumObtained / sumTotal) * 100).toFixed(1) : '0';
  let grade = 'A+';
  if (Number(percentage) < 80) grade = 'A';
  if (Number(percentage) < 70) grade = 'B';
  if (Number(percentage) < 60) grade = 'C';
  if (Number(percentage) < 50) grade = 'D';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Actions */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">Detailed Marks Certificate (DMC / Result Card)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print DMC (A4)
            </button>
            <button
              onClick={() => downloadResultCardPDF(school, student, marks)}
              className="px-3 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DMC Document */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[720px] p-8 shadow-sm border border-slate-200 text-slate-900 space-y-5 print-container">
            {/* Header */}
            <div className="text-center border-b-2 border-orange-600 pb-3 space-y-1">
              <span className="text-xs font-urdu text-slate-500 font-bold">{school.name_ur}</span>
              <h1 className="text-2xl font-black text-orange-600 tracking-tight">{school.name_en}</h1>
              <p className="text-xs text-slate-600">{school.address}</p>
              <p className="text-[11px] text-slate-500">
                Board Affiliated · Reg No: {school.registration_no || 'BISE/LHR/9012'}
              </p>
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                Detailed Marks Certificate (DMC)
              </h2>
              <p className="text-xs text-slate-500">First Term Examination 2026 · Academic Session 2026-2027</p>
            </div>

            {/* Student Particulars */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>Student Name: <strong className="text-slate-900">{student.name}</strong></div>
              <div>Class &amp; Section: <strong>Matric Science - Sec A</strong></div>
              <div>Father Name: <span className="text-slate-700">{student.father_name}</span></div>
              <div>Admission #: <strong className="font-mono text-orange-600">{student.admission_number}</strong></div>
              <div>B-Form / CNIC: <span className="font-mono text-slate-600">{student.b_form_no}</span></div>
              <div>Class Position: <strong className="text-emerald-700">2nd Position</strong></div>
            </div>

            {/* Subject Marks Table */}
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-orange-600 text-white font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Subject Name</th>
                  <th className="py-2 px-3 text-center">Total Marks</th>
                  <th className="py-2 px-3 text-center">Passing Marks</th>
                  <th className="py-2 px-3 text-center">Obtained Marks</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {marks.map((m, idx) => {
                  const pass = m.obtained >= m.passing;
                  return (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="py-2 px-3 text-slate-900 font-sans font-medium">{m.subject}</td>
                      <td className="py-2 px-3 text-center">{m.total}</td>
                      <td className="py-2 px-3 text-center">{m.passing}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{m.obtained}</td>
                      <td className={`py-2 px-3 text-center font-bold font-sans ${pass ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pass ? 'PASS' : 'FAIL'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2 px-3 font-sans">Grand Total:</td>
                  <td className="py-2 px-3 text-center">{sumTotal}</td>
                  <td className="py-2 px-3 text-center">-</td>
                  <td className="py-2 px-3 text-center text-orange-600">{sumObtained}</td>
                  <td className="py-2 px-3 text-center text-emerald-700 font-sans">
                    {percentage}% ({grade})
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Behaviour, Remarks & Scale */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">Attendance Summary:</p>
                <p className="text-slate-600">Present Days: 115 / 120 (96% Attendance Rate)</p>
                <p className="text-slate-600 mt-1">Conduct: Exemplary, Punctual, Respectful</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Class Teacher Remarks:</p>
                <p className="text-slate-600 italic">
                  &quot;Consistently active, curious, and demonstrates excellent work ethic in analytical subjects.&quot;
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <p className="font-semibold text-slate-700">Class In-charge</p>
              </div>

              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <p className="font-semibold text-slate-700">Controller of Exams</p>
              </div>

              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <p className="font-bold text-slate-900">{school.principal_name}</p>
                <p className="text-[10px] text-slate-500">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
