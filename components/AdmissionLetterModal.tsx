'use client';

import React from 'react';
import { School, Student } from '@/lib/types';
import { downloadAdmissionLetterPDF, triggerPrint } from '@/lib/pdf-generator';
import { Download, Printer, X, FileCheck } from 'lucide-react';

interface AdmissionLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  student: Student;
}

export function AdmissionLetterModal({ isOpen, onClose, school, student }: AdmissionLetterModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    downloadAdmissionLetterPDF(school, student);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">Official Admission Letter (A4 Document Preview)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print A4
            </button>
            <button
              onClick={handleDownload}
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

        {/* Document Body (Styled for A4 Print) */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[720px] p-8 shadow-sm border border-slate-200 text-slate-900 space-y-6 print-container">
            {/* Header */}
            <div className="text-center border-b-2 border-orange-600 pb-4 space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 font-mono">REG: {school.registration_no || 'REG/PK/EDU/2026'}</span>
                <span className="text-xs font-urdu text-slate-600 font-bold">{school.name_ur}</span>
              </div>
              <h1 className="text-2xl font-black text-orange-600 tracking-tight">{school.name_en}</h1>
              <p className="text-xs text-slate-600">{school.address}</p>
              <p className="text-[11px] text-slate-500">
                Phone: {school.phone} · Email: {school.email} · Timings: {school.school_timings || '07:45 AM - 01:45 PM'}
              </p>
            </div>

            {/* Title */}
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-slate-100 text-slate-900 font-extrabold text-sm uppercase tracking-wider rounded border border-slate-200">
                Provisional Admission Intimation Letter
              </span>
              <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                <span>Ref: ADM-LTR-2026-{student.admission_number}</span>
                <span>Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Salutation */}
            <div className="text-xs space-y-1 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              <p>To the Parent / Guardian of:</p>
              <p className="text-sm font-bold text-slate-900">{student.name} s/d/o {student.father_name}</p>
              <p className="text-slate-600">B-Form / CNIC: <span className="font-mono">{student.b_form_no}</span> · Guardian Contact: {student.guardian_phone}</p>
              <p className="text-slate-600">Address: {student.address}</p>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              We are pleased to inform you that your child has qualified for admission into <strong>{school.name_en}</strong> for Academic Session 2026-2027 based on admission merit evaluation and document verification.
            </p>

            {/* Enrolled Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-orange-50/50 p-3 rounded border border-orange-100">
              <div>Admission Number: <strong className="font-mono text-orange-600">{student.admission_number}</strong></div>
              <div>Academic Session: <strong>2026-2027</strong></div>
              <div>Class Enrolled: <strong>Matric Science (Grade 10)</strong></div>
              <div>Section: <strong>Section A (Jinnah)</strong></div>
              <div>Admission Date: <strong>{student.admission_date}</strong></div>
              <div>Merit Concession: <strong>{student.scholarship_discount_percent}% Concession Granted</strong></div>
            </div>

            {/* Fee Intimation Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Fee Structure &amp; Payable At Time of Admission (PKR)
              </h4>
              <table className="w-full text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-1.5 px-3 text-left font-bold border-b">Fee Head</th>
                    <th className="py-1.5 px-3 text-right font-bold border-b">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-1.5 px-3 text-slate-800">Admission Registration Fee (One-Time)</td>
                    <td className="py-1.5 px-3 text-right">8,000</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 text-slate-800">Monthly Tuition Fee (First Month)</td>
                    <td className="py-1.5 px-3 text-right">7,500</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 text-slate-800">Annual Laboratory &amp; Utility Charges</td>
                    <td className="py-1.5 px-3 text-right">4,000</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 text-slate-800">Student ID Card &amp; School Diary</td>
                    <td className="py-1.5 px-3 text-right">1,000</td>
                  </tr>
                  {student.scholarship_discount_percent > 0 && (
                    <tr className="text-emerald-700">
                      <td className="py-1.5 px-3">Merit Scholarship Concession ({student.scholarship_discount_percent}%)</td>
                      <td className="py-1.5 px-3 text-right">- 750</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-2 px-3">Net Total Due at Admission:</td>
                    <td className="py-2 px-3 text-right text-orange-600">PKR 19,750</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Instructions */}
            <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded">
              <p className="font-bold text-slate-800">Mandatory Requirements:</p>
              <p>1. Please submit 4 passport-size photographs, attested copy of B-Form and Father&apos;s CNIC.</p>
              <p>2. Dues must be cleared via bank challan at Meezan Bank / JazzCash within 7 days.</p>
            </div>

            {/* Signatures */}
            <div className="pt-10 flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <p className="font-semibold text-slate-700">Accounts Department</p>
              </div>

              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <p className="font-bold text-slate-900">{school.principal_name}</p>
                <p className="text-[10px] text-slate-500">Principal / Head of Institution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
