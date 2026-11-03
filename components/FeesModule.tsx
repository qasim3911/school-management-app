'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, FeeChallan, FeePayment, PaymentMethod } from '@/lib/types';
import {
  Receipt,
  PlusCircle,
  CreditCard,
  Printer,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  X,
  FileCheck,
  Download,
} from 'lucide-react';
import { downloadFeeReceiptPDF, triggerPrint } from '@/lib/pdf-generator';

interface FeesModuleProps {
  school: School;
  onOpenChallan: (challanId: string) => void;
}

export function FeesModule({ school, onOpenChallan }: FeesModuleProps) {
  const [activeTab, setActiveTab] = useState<'challans' | 'payments' | 'defaulters'>('challans');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [receiptPayment, setReceiptPayment] = useState<FeePayment | null>(null);

  const students = db.getStudents(school.id);
  const classes = db.getClasses(school.id);
  const challans = db.getFeeChallans(school.id);
  const payments = db.getFeePayments(school.id);
  const accounts = db.getAccounts(school.id);

  // New Challan Form State
  const [challanForm, setChallanForm] = useState({
    student_id: students[0]?.id || '',
    month: 'November 2026',
    issue_date: '2026-11-01',
    due_date: '2026-11-15',
    tuition_fee: 7500,
    admission_fee: 0,
    annual_charges: 0,
    exam_fee: 1200,
    transport_fee: 3500,
    other_charges: 300,
    previous_arrears: 0,
    late_fine: 0,
    concession_discount: 750,
  });

  // Payment Recording Form State
  const [payForm, setPayForm] = useState({
    amount_paid: 0,
    payment_method: 'JazzCash' as PaymentMethod,
    transaction_ref: '',
    received_by: 'Kashif Mehmood (Accountant)',
    remarks: '',
  });

  const filteredChallans = challans.filter((c) => {
    const student = students.find((s) => s.id === c.student_id);
    const matchesSearch =
      c.challan_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'defaulters') {
      return matchesSearch && c.remaining_balance > 0;
    }
    return matchesSearch;
  });

  const handleCreateChallan = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === challanForm.student_id);
    if (!st) {
      alert('Please select a student.');
      return;
    }

    const total =
      Number(challanForm.tuition_fee) +
      Number(challanForm.admission_fee) +
      Number(challanForm.annual_charges) +
      Number(challanForm.exam_fee) +
      Number(challanForm.transport_fee) +
      Number(challanForm.other_charges) +
      Number(challanForm.previous_arrears) +
      Number(challanForm.late_fine) -
      Number(challanForm.concession_discount);

    const newChallan = db.createFeeChallan({
      school_id: school.id,
      student_id: st.id,
      session_id: st.session_id,
      class_id: st.class_id,
      section_id: st.section_id,
      month: challanForm.month,
      issue_date: challanForm.issue_date,
      due_date: challanForm.due_date,
      tuition_fee: Number(challanForm.tuition_fee),
      admission_fee: Number(challanForm.admission_fee),
      annual_charges: Number(challanForm.annual_charges),
      exam_fee: Number(challanForm.exam_fee),
      transport_fee: Number(challanForm.transport_fee),
      other_charges: Number(challanForm.other_charges),
      previous_arrears: Number(challanForm.previous_arrears),
      late_fine: Number(challanForm.late_fine),
      concession_discount: Number(challanForm.concession_discount),
      total_payable: Math.max(0, total),
      paid_amount: 0,
      remaining_balance: Math.max(0, total),
      status: 'Unpaid',
    });

    setIsGenerateModalOpen(false);
    onOpenChallan(newChallan.id);
  };

  const handleOpenPay = (challan: FeeChallan) => {
    setSelectedChallan(challan);
    setPayForm({
      amount_paid: challan.remaining_balance,
      payment_method: 'JazzCash',
      transaction_ref: '',
      received_by: 'Kashif Mehmood (Accountant)',
      remarks: 'Monthly school fee deposit',
    });
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallan) return;
    if (payForm.amount_paid <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const res = db.recordFeePayment({
      challan_id: selectedChallan.id,
      student_id: selectedChallan.student_id,
      amount_paid: Number(payForm.amount_paid),
      payment_method: payForm.payment_method,
      transaction_ref: payForm.transaction_ref,
      received_by: payForm.received_by,
      remarks: payForm.remarks,
    });

    setIsPayModalOpen(false);
    setReceiptPayment(res.payment);
  };

  const handleReversePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    if (!reversalReason.trim()) {
      alert('Please state authorized reversal reason.');
      return;
    }

    try {
      db.reverseFeePayment(selectedPayment.id, reversalReason);
      setIsReverseModalOpen(false);
      setReversalReason('');
      setSelectedPayment(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const totalFeeCollection = payments.reduce((acc, p) => acc + (p.is_reversed ? 0 : Number(p.amount_paid)), 0);
  const totalPendingDues = challans.reduce((acc, c) => acc + Number(c.remaining_balance), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Fee Management &amp; Pakistani Bank Challans</h2>
          <p className="text-xs text-slate-500">
            Generate 3-part bank vouchers (Cash / JazzCash / EasyPaisa), process partial payments, and audit fee defaulters
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <PlusCircle className="w-4 h-4" />
          Issue Fee Challan
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Cleared Collection</span>
          <p className="text-xl font-black text-emerald-600 font-mono tabular-nums">
            PKR {totalFeeCollection.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Saved in Cash Book &amp; Bank</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Outstanding Arrears Balance</span>
          <p className="text-xl font-black text-red-600 font-mono tabular-nums">
            PKR {totalPendingDues.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Due from student accounts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Supported Gateways</span>
          <p className="text-sm font-bold text-slate-800">
            Meezan Bank · JazzCash · EasyPaisa
          </p>
          <p className="text-[11px] text-slate-500">Counter Cash with printed receipts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('challans')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'challans'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          All Fee Challans ({challans.length})
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'defaulters'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Fee Defaulters ({challans.filter((c) => c.remaining_balance > 0).length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment History &amp; Reversals ({payments.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-b-xl border border-slate-200 shadow-2xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by Challan #, Receipt #, or Student Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs px-2 py-1.5 focus:outline-hidden"
        />
      </div>

      {/* Tab: Challans & Defaulters Table */}
      {(activeTab === 'challans' || activeTab === 'defaulters') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold">Challan #</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Student Name</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Month</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Total</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Paid</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Balance</th>
                  <th className="py-2.5 px-4 text-center font-semibold">Status</th>
                  <th className="py-2.5 px-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredChallans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-xs font-sans">
                      No fee records matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredChallans.map((c) => {
                    const st = students.find((s) => s.id === c.student_id);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.challan_number}</td>
                        <td className="py-3 px-4 font-sans font-medium text-slate-900">
                          {st ? st.name : 'Unknown Student'}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-600">{c.month}</td>
                        <td className="py-3 px-4 font-sans text-slate-600">{c.due_date}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {c.total_payable.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600">
                          {c.paid_amount.toLocaleString()}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${c.remaining_balance > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {c.remaining_balance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
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
                        <td className="py-3 px-4 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenChallan(c.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1"
                              title="Print 3-Part Bank Challan"
                            >
                              <Printer className="w-3 h-3" />
                              3-Part
                            </button>
                            {c.remaining_balance > 0 && (
                              <button
                                onClick={() => handleOpenPay(c)}
                                className="px-2 py-1 text-[11px] font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded flex items-center gap-1"
                              >
                                <DollarSign className="w-3 h-3" />
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payment History & Reversals */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold">Receipt #</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Student Name</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Amount Paid</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Method &amp; Ref</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Payment Date</th>
                  <th className="py-2.5 px-4 text-left font-semibold">Received By</th>
                  <th className="py-2.5 px-4 text-center font-semibold">Status</th>
                  <th className="py-2.5 px-4 text-center font-semibold">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payments.map((p) => {
                  const st = students.find((s) => s.id === p.student_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-orange-600">{p.receipt_number}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">{st?.name}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        PKR {p.amount_paid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-slate-800">{p.payment_method}</span>
                        {p.transaction_ref && (
                          <span className="block text-[10px] font-mono text-slate-500">{p.transaction_ref}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">{p.payment_date}</td>
                      <td className="py-3 px-4 font-sans text-slate-600 truncate max-w-xs">{p.received_by}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        {p.is_reversed ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800">
                            REVERSED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            CLEARED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {!p.is_reversed ? (
                          <button
                            onClick={() => {
                              setSelectedPayment(p);
                              setIsReverseModalOpen(true);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 mx-auto"
                            title="Reverse payment with audit trail"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reverse
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Audit Logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Fee Challan Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm">Issue Monthly Fee Challan</h3>
              </div>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallan} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={challanForm.student_id}
                  onChange={(e) => setChallanForm({ ...challanForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admission_number}) - Grade 10 Matric
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fee Month *</label>
                  <input
                    type="text"
                    value={challanForm.month}
                    onChange={(e) => setChallanForm({ ...challanForm, month: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={challanForm.due_date}
                    onChange={(e) => setChallanForm({ ...challanForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Tuition Fee</label>
                  <input
                    type="number"
                    value={challanForm.tuition_fee}
                    onChange={(e) => setChallanForm({ ...challanForm, tuition_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Exam Fee</label>
                  <input
                    type="number"
                    value={challanForm.exam_fee}
                    onChange={(e) => setChallanForm({ ...challanForm, exam_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Transport</label>
                  <input
                    type="number"
                    value={challanForm.transport_fee}
                    onChange={(e) => setChallanForm({ ...challanForm, transport_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Arrears</label>
                  <input
                    type="number"
                    value={challanForm.previous_arrears}
                    onChange={(e) => setChallanForm({ ...challanForm, previous_arrears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Other Dues</label>
                  <input
                    type="number"
                    value={challanForm.other_charges}
                    onChange={(e) => setChallanForm({ ...challanForm, other_charges: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-slate-700 mb-1">Discount</label>
                  <input
                    type="number"
                    value={challanForm.concession_discount}
                    onChange={(e) => setChallanForm({ ...challanForm, concession_discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Generate 3-Part Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Record Fee Collection</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div>Challan: <strong className="font-mono text-orange-600">{selectedChallan.challan_number}</strong></div>
              <div>Month: <strong>{selectedChallan.month}</strong></div>
              <div>Remaining Balance: <strong className="font-mono text-red-600">PKR {selectedChallan.remaining_balance.toLocaleString()}</strong></div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (PKR) *</label>
                <input
                  type="number"
                  required
                  max={selectedChallan.remaining_balance}
                  value={payForm.amount_paid}
                  onChange={(e) => setPayForm({ ...payForm, amount_paid: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Gateway / Method *</label>
                <select
                  value={payForm.payment_method}
                  onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 border rounded-md bg-white font-medium"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="JazzCash">JazzCash Merchant</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank Transfer">Meezan / HBL Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Slip Number</label>
                <input
                  type="text"
                  placeholder="e.g. JC-99214482 or Cash Voucher Ref"
                  value={payForm.transaction_ref}
                  onChange={(e) => setPayForm({ ...payForm, transaction_ref: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Received By</label>
                <input
                  type="text"
                  value={payForm.received_by}
                  onChange={(e) => setPayForm({ ...payForm, received_by: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
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
                  className="px-4 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Reversal Modal */}
      {isReverseModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Authorized Payment Reversal</span>
              </div>
              <button onClick={() => setIsReverseModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Reversing receipt <strong className="font-mono text-slate-900">{selectedPayment.receipt_number}</strong> for <strong className="font-mono text-slate-900">PKR {selectedPayment.amount_paid.toLocaleString()}</strong> will restore the student&apos;s unpaid challan balance and log an audit reversal in the Cash Book.
            </p>

            <form onSubmit={handleReversePayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Reversal *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Bank chargeback, duplicate payment entry, or bounced cheque"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReverseModalOpen(false)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instant Receipt Preview Modal */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-urdu text-slate-500 font-bold">{school.name_ur}</p>
              <h4 className="font-bold text-slate-900 text-sm">Official Fee Receipt Generated</h4>
              <p className="text-xs font-mono font-bold text-orange-600 mt-0.5">{receiptPayment.receipt_number}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-left">
              <div>Amount: <strong className="font-mono text-emerald-700">PKR {receiptPayment.amount_paid.toLocaleString()}</strong></div>
              <div>Method: <strong>{receiptPayment.payment_method}</strong></div>
              <div>Date: <strong>{receiptPayment.payment_date}</strong></div>
              <div>Received By: <span className="text-slate-600">{receiptPayment.received_by}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const student = students.find((s) => s.id === receiptPayment.student_id);
                  downloadFeeReceiptPDF(school, receiptPayment, student);
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={triggerPrint}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            </div>
            <button
              onClick={() => setReceiptPayment(null)}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
