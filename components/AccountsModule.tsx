'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Account, FinancialTransaction } from '@/lib/types';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, CreditCard, Printer, Search, X } from 'lucide-react';

interface AccountsModuleProps {
  school: School;
}

export function AccountsModule({ school }: AccountsModuleProps) {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const accounts = db.getAccounts(school.id);
  const transactions = db.getTransactions(school.id);

  const [form, setForm] = useState({
    account_id: accounts[0]?.id || '',
    transaction_type: 'Expense' as 'Income' | 'Expense',
    category: 'Utility Bills' as FinancialTransaction['category'],
    amount: 5000,
    date: '2026-11-01',
    reference_no: '',
    description: '',
  });

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'Income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'Expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const cashAccount = accounts.find((a) => a.account_type === 'Cash');
  const bankAccount = accounts.find((a) => a.account_type === 'Bank');

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) {
      alert('Please fill description and valid amount.');
      return;
    }

    db.addFinancialTransaction({
      school_id: school.id,
      account_id: form.account_id,
      transaction_type: form.transaction_type,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      reference_no: form.reference_no,
      description: form.description,
    });

    setIsVoucherModalOpen(false);
  };

  const filteredTxns = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.reference_no && t.reference_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Accounts &amp; Daily Cash Book</h2>
          <p className="text-xs text-slate-500">
            Real balance formula: Opening Balance + Income - Expenses = Closing Balance (PKR)
          </p>
        </div>

        <button
          onClick={() => setIsVoucherModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Add Cash / Bank Voucher
        </button>
      </div>

      {/* Account Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">School Petty Cash</span>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
            PKR {(cashAccount?.current_balance ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Physical Counter Safe</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Meezan Bank Account</span>
          <p className="text-xl font-black text-slate-900 font-mono tabular-nums">
            PKR {(bankAccount?.current_balance ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">A/C: {bankAccount?.account_number || 'Cash/Bank Counter'}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Income (This Month)</span>
          <p className="text-xl font-black text-emerald-600 font-mono tabular-nums flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            PKR {totalIncome.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700">Fees + Admissions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Expenses (This Month)</span>
          <p className="text-xl font-black text-red-600 font-mono tabular-nums flex items-center gap-1">
            <ArrowDownRight className="w-4 h-4 text-red-600" />
            PKR {totalExpense.toLocaleString()}
          </p>
          <p className="text-[11px] text-red-700">Salaries, LESCO &amp; Supplies</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900">Daily Cash Book &amp; Bank Ledger Transactions</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search description or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-md"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-2.5 px-3 text-left font-semibold">Date</th>
                <th className="py-2.5 px-3 text-left font-semibold">Ref No</th>
                <th className="py-2.5 px-3 text-left font-semibold">Category</th>
                <th className="py-2.5 px-3 text-left font-semibold">Description</th>
                <th className="py-2.5 px-3 text-center font-semibold">Type</th>
                <th className="py-2.5 px-3 text-right font-semibold">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTxns.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-sans text-slate-600">{t.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{t.reference_no || '-'}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">{t.category}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">{t.description}</td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      t.transaction_type === 'Income'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {t.transaction_type}
                    </span>
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${
                    t.transaction_type === 'Income' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {t.transaction_type === 'Income' ? '+' : '-'} {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Voucher Modal */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Cash / Bank Voucher</h3>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voucher Type</label>
                  <select
                    value={form.transaction_type}
                    onChange={(e) => setForm({ ...form, transaction_type: e.target.value as 'Income' | 'Expense' })}
                    className="w-full px-3 py-2 border rounded-md bg-white font-bold"
                  >
                    <option value="Expense">Expense Voucher</option>
                    <option value="Income">Income Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account</label>
                  <select
                    value={form.account_id}
                    onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as FinancialTransaction['category'] })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Utility Bills">Utility Bills (LESCO/SNGPL)</option>
                    <option value="Staff Salary">Staff Salary</option>
                    <option value="Stationery">Stationery &amp; Registers</option>
                    <option value="Lab Supplies">Lab Supplies</option>
                    <option value="Maintenance">Building Maintenance</option>
                    <option value="Fee Collection">Fee Collection</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Electricity commercial bill paid"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / Invoice #</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-88219"
                    value={form.reference_no}
                    onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
