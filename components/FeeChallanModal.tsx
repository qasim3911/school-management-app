'use client';

import React from 'react';
import { School, Student, FeeChallan } from '@/lib/types';
import { downloadChallanPDF, triggerPrint } from '@/lib/pdf-generator';
import { Download, Printer, X, Receipt } from 'lucide-react';

interface FeeChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  student: Student;
  challan: FeeChallan;
}

export function FeeChallanModal({ isOpen, onClose, school, student, challan }: FeeChallanModalProps) {
  if (!isOpen) return null;

  const copies = ['BANK COPY', 'SCHOOL COPY', 'STUDENT COPY'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Action Header */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">Pakistani 3-in-1 Bank Fee Challan Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Challan (A4 Landscape)
            </button>
            <button
              onClick={() => downloadChallanPDF(school, student, challan)}
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

        {/* 3-Part Challan Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[1020px] p-4 shadow-sm border border-slate-200 text-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 print-container">
            {copies.map((copyTitle, idx) => (
              <div
                key={copyTitle}
                className={`p-3.5 border border-slate-300 rounded text-xs space-y-3 flex flex-col justify-between ${
                  idx < 2 ? 'md:border-r-2 md:border-dashed md:border-slate-400' : ''
                }`}
              >
                {/* Header */}
                <div className="text-center border-b pb-2 space-y-0.5">
                  <h3 className="font-bold text-sm text-orange-600">{school.name_en}</h3>
                  <p className="text-[10px] text-slate-500 truncate">{school.address}</p>
                  <p className="text-[9px] text-slate-400">Phone: {school.phone} · Reg: {school.registration_no || 'N/A'}</p>
                  <div className="mt-1 inline-block px-2.5 py-0.5 bg-slate-100 font-extrabold text-[10px] rounded border border-slate-300 text-slate-900 uppercase">
                    {copyTitle}
                  </div>
                </div>

                {/* Challan & Student particulars */}
                <div className="space-y-1 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Challan #:</span>
                    <span className="font-mono font-bold text-slate-900">{challan.challan_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fee Month:</span>
                    <span className="font-semibold text-slate-800">{challan.month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-bold text-red-600">{challan.due_date}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <div><span className="text-slate-500">Student:</span> <strong>{student.name}</strong></div>
                    <div><span className="text-slate-500">Father:</span> {student.father_name}</div>
                    <div className="flex justify-between">
                      <span>Adm #: <span className="font-mono">{student.admission_number}</span></span>
                      <span>Class: Matric-A</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="py-1 px-2 text-left font-semibold">Head</th>
                      <th className="py-1 px-2 text-right font-semibold">PKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    {(challan.tuition_fee || 0) > 0 && (
                      <tr>
                        <td className="py-1 px-2">Tuition Fee</td>
                        <td className="py-1 px-2 text-right">{(challan.tuition_fee || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    {(challan.exam_fee || 0) > 0 && (
                      <tr>
                        <td className="py-1 px-2">Exam Fee</td>
                        <td className="py-1 px-2 text-right">{(challan.exam_fee || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    {(challan.transport_fee || 0) > 0 && (
                      <tr>
                        <td className="py-1 px-2">Transport Charges</td>
                        <td className="py-1 px-2 text-right">{(challan.transport_fee || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    {(challan.other_charges || 0) > 0 && (
                      <tr>
                        <td className="py-1 px-2">Other Dues</td>
                        <td className="py-1 px-2 text-right">{(challan.other_charges || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    {(challan.previous_arrears || 0) > 0 && (
                      <tr className="text-red-600">
                        <td className="py-1 px-2">Arrears</td>
                        <td className="py-1 px-2 text-right">+{(challan.previous_arrears || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    {(challan.concession_discount || 0) > 0 && (
                      <tr className="text-emerald-700">
                        <td className="py-1 px-2">Discount</td>
                        <td className="py-1 px-2 text-right">-{(challan.concession_discount || 0).toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t">
                      <td className="py-1.5 px-2">Payable by Due Date:</td>
                      <td className="py-1.5 px-2 text-right text-orange-600 font-extrabold">{(challan.total_payable || 0).toLocaleString()}</td>
                    </tr>
                    <tr className="text-[9px] text-slate-500 italic">
                      <td className="py-0.5 px-2">After Due Date (+300):</td>
                      <td className="py-0.5 px-2 text-right">{((challan.total_payable || 0) + 300).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="pt-6 flex justify-between items-end text-[9px] text-slate-500">
                  <div className="text-center">
                    <div className="w-20 border-b border-slate-300 mb-0.5"></div>
                    <span>Bank Cashier</span>
                  </div>
                  <div className="text-center">
                    <div className="w-20 border-b border-slate-300 mb-0.5"></div>
                    <span>School Stamp</span>
                  </div>
                </div>

                <p className="text-[8px] text-center text-slate-400">
                  Deposit at Meezan Bank / HBL / JazzCash Merchant
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
