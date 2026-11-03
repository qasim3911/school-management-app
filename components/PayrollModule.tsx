'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Staff, SalaryRecord } from '@/lib/types';
import { Banknote, Plus, Printer, X, Check, DollarSign, Download } from 'lucide-react';
import { triggerPrint, downloadSalarySlipPDF } from '@/lib/pdf-generator';

interface PayrollModuleProps {
  school: School;
}

export function PayrollModule({ school }: PayrollModuleProps) {
  const staffList = db.getStaff(school.id);
  const salaries = db.getSalaries(school.id);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<{ staff: Staff; salary: SalaryRecord } | null>(null);

  const [form, setForm] = useState({
    staff_id: staffList[0]?.id || '',
    month: 'October 2026',
    basic_salary: 65000,
    allowances: 8000,
    deductions: 1500,
    advance_salary: 0,
    payment_method: 'Bank Transfer' as SalaryRecord['payment_method'],
  });

  const netPayable =
    Number(form.basic_salary) +
    Number(form.allowances) -
    Number(form.deductions) -
    Number(form.advance_salary);

  const handleCreateSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const created = db.createSalaryRecord({
      school_id: school.id,
      staff_id: form.staff_id,
      month: form.month,
      basic_salary: Number(form.basic_salary),
      allowances: Number(form.allowances),
      deductions: Number(form.deductions),
      advance_salary: Number(form.advance_salary),
      net_payable: Math.max(0, netPayable),
      paid_amount: Math.max(0, netPayable),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: form.payment_method,
      status: 'Paid',
    });

    setIsPayModalOpen(false);
    const stf = staffList.find((s) => s.id === created.staff_id);
    if (stf) setSelectedSlip({ staff: stf, salary: created });
  };

  const handleSelectStaff = (stfId: string) => {
    const stf = staffList.find((s) => s.id === stfId);
    if (stf) {
      setForm({
        ...form,
        staff_id: stfId,
        basic_salary: stf.basic_salary,
      });
    }
  };

  const totalPayrollPaid = salaries.reduce((acc, s) => acc + Number(s.paid_amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Faculty &amp; Staff Monthly Payroll</h2>
          <p className="text-xs text-slate-500">
            Process monthly faculty compensation, compute deductions, and issue A4 salary slips (PKR)
          </p>
        </div>

        <button
          onClick={() => setIsPayModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Disburse Salary Slip
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Payroll Disbursed</span>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
            PKR {totalPayrollPaid.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700">Debited from Bank Account</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Active Employees</span>
          <p className="text-xl font-black text-orange-600 font-mono tabular-nums">
            {staffList.length}
          </p>
          <p className="text-[11px] text-slate-500">Teachers, Admins &amp; Support</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Standard Payment Mode</span>
          <p className="text-sm font-bold text-slate-800">
            Meezan Bank Direct Deposit
          </p>
          <p className="text-[11px] text-slate-500">Official signed vouchers</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Disbursed Salary History</h3>
          <span className="text-xs text-slate-500">Session 2026-2027</span>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="py-2.5 px-4 text-left font-semibold">Slip #</th>
              <th className="py-2.5 px-4 text-left font-semibold">Employee Name</th>
              <th className="py-2.5 px-4 text-left font-semibold">Designation</th>
              <th className="py-2.5 px-4 text-left font-semibold">Month</th>
              <th className="py-2.5 px-4 text-right font-semibold">Basic</th>
              <th className="py-2.5 px-4 text-right font-semibold">Net Paid (PKR)</th>
              <th className="py-2.5 px-4 text-center font-semibold">Method</th>
              <th className="py-2.5 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {salaries.map((s) => {
              const stf = staffList.find((st) => st.id === s.staff_id);
              return (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-orange-600">{s.slip_number}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">{stf?.name || 'Staff Member'}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{stf?.designation}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{s.month}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{s.basic_salary.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{s.net_payable.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                      {s.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {stf && (
                      <button
                        onClick={() => setSelectedSlip({ staff: stf, salary: s })}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 mx-auto"
                      >
                        <Printer className="w-3 h-3" />
                        Print Slip
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disburse Salary Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Disburse Monthly Salary Slip</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSalary} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
                <select
                  value={form.staff_id}
                  onChange={(e) => handleSelectStaff(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white font-medium"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary Month</label>
                  <input
                    type="text"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value as SalaryRecord['payment_method'] })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (Meezan/HBL)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Basic Salary (PKR)</label>
                  <input
                    type="number"
                    value={form.basic_salary}
                    onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Allowances (PKR)</label>
                  <input
                    type="number"
                    value={form.allowances}
                    onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Deductions (Tax/Leave)</label>
                  <input
                    type="number"
                    value={form.deductions}
                    onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Advance Deducted</label>
                  <input
                    type="number"
                    value={form.advance_salary}
                    onChange={(e) => setForm({ ...form, advance_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-red-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-between items-center text-xs">
                <span className="font-bold text-orange-900">Net Take-Home Payable:</span>
                <span className="font-mono font-extrabold text-base text-orange-600">
                  PKR {netPayable.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Confirm &amp; Disburse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Modal Preview */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold text-xs">Official Staff Salary Slip (A4 Document)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSalarySlipPDF(school, selectedSlip.staff, selectedSlip.salary)}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  onClick={triggerPrint}
                  className="px-3 py-1 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button onClick={() => setSelectedSlip(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
              <div className="bg-white w-full max-w-[500px] p-6 rounded border border-slate-300 shadow-xs space-y-4 text-xs print-container">
                {/* Header */}
                <div className="text-center border-b pb-3 space-y-0.5">
                  <span className="text-[10px] font-urdu text-slate-500 font-bold">{school.name_ur}</span>
                  <h3 className="font-bold text-base text-orange-600">{school.name_en}</h3>
                  <p className="text-[10px] text-slate-500">{school.address}</p>
                  <div className="mt-1 inline-block px-2.5 py-0.5 bg-slate-100 font-bold text-[10px] rounded uppercase">
                    Salary Payment Slip - {selectedSlip.salary.month}
                  </div>
                </div>

                {/* Particulars */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                  <div>Employee: <strong>{selectedSlip.staff.name}</strong></div>
                  <div>Emp ID: <span className="font-mono font-bold text-orange-600">{selectedSlip.staff.employee_id}</span></div>
                  <div>Designation: <strong>{selectedSlip.staff.designation}</strong></div>
                  <div>CNIC: <span className="font-mono">{selectedSlip.staff.cnic}</span></div>
                  <div>Slip Ref: <span className="font-mono">{selectedSlip.salary.slip_number}</span></div>
                  <div>Payment Mode: <strong>{selectedSlip.salary.payment_method}</strong></div>
                </div>

                {/* Salary Breakdown */}
                <table className="w-full text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="py-1 px-2 text-left">Earnings</th>
                      <th className="py-1 px-2 text-right">PKR</th>
                      <th className="py-1 px-2 text-left border-l">Deductions</th>
                      <th className="py-1 px-2 text-right">PKR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                    <tr>
                      <td className="py-1 px-2">Basic Salary</td>
                      <td className="py-1 px-2 text-right">{selectedSlip.salary.basic_salary.toLocaleString()}</td>
                      <td className="py-1 px-2 border-l">Income Tax / Fund</td>
                      <td className="py-1 px-2 text-right">{selectedSlip.salary.deductions.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2">Allowances</td>
                      <td className="py-1 px-2 text-right">{selectedSlip.salary.allowances.toLocaleString()}</td>
                      <td className="py-1 px-2 border-l">Advance Deducted</td>
                      <td className="py-1 px-2 text-right">{selectedSlip.salary.advance_salary.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t">
                      <td className="py-1.5 px-2 font-sans">Total Gross:</td>
                      <td className="py-1.5 px-2 text-right">{(selectedSlip.salary.basic_salary + selectedSlip.salary.allowances).toLocaleString()}</td>
                      <td className="py-1.5 px-2 font-sans border-l">Net Payable:</td>
                      <td className="py-1.5 px-2 text-right text-orange-600 font-extrabold">{selectedSlip.salary.net_payable.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Signatures */}
                <div className="pt-8 flex justify-between text-[10px] text-slate-600">
                  <div className="text-center">
                    <div className="w-24 border-b border-slate-400 mb-0.5"></div>
                    <span>Employee Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="w-24 border-b border-slate-400 mb-0.5"></div>
                    <span>Principal / Stamp</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
