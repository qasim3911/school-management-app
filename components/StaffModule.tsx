'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Staff } from '@/lib/types';
import { UserCheck, UserPlus, Search, Phone, Mail, Award, DollarSign, X, Check } from 'lucide-react';

interface StaffModuleProps {
  school: School;
}

export function StaffModule({ school }: StaffModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const staffList = db.getStaff(school.id);

  // Form State
  const [form, setForm] = useState({
    name: '',
    father_name: '',
    cnic: '',
    dob: '1990-01-01',
    gender: 'Male' as 'Male' | 'Female',
    mobile: '',
    address: '',
    province: school.province,
    district: school.district,
    qualification: '',
    experience_years: 5,
    designation: 'Subject Teacher',
    department: 'Teaching' as Staff['department'],
    joining_date: new Date().toISOString().split('T')[0],
    basic_salary: 55000,
  });

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cnic.includes(searchQuery) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cnic || !form.mobile || !form.designation) {
      alert('Please fill name, CNIC, mobile, and designation.');
      return;
    }

    const empId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    db.createStaff({
      school_id: school.id,
      employee_id: empId,
      name: form.name,
      father_name: form.father_name,
      cnic: form.cnic,
      dob: form.dob,
      gender: form.gender,
      mobile: form.mobile,
      address: form.address,
      province: form.province,
      district: form.district,
      qualification: form.qualification,
      experience_years: Number(form.experience_years),
      designation: form.designation,
      department: form.department,
      joining_date: form.joining_date,
      basic_salary: Number(form.basic_salary),
      status: 'Active',
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Teacher &amp; Staff Administration</h2>
          <p className="text-xs text-slate-500">
            Faculty directory, CNIC records, designations, and department payroll allocation
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <UserPlus className="w-4 h-4" />
          Register Staff Member
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Teacher Name, Designation, or CNIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white"
          >
            <option value="all">All Departments ({staffList.length})</option>
            <option value="Teaching">Teaching Faculty</option>
            <option value="Administration">Administration</option>
            <option value="Accounts">Accounts &amp; Fee</option>
            <option value="Support">Support Staff</option>
          </select>
        </div>
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((stf) => (
          <div
            key={stf.id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{stf.name}</h3>
                  <p className="text-xs text-orange-600 font-semibold">{stf.designation}</p>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {stf.employee_id}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>Father Name: <span className="text-slate-800">{stf.father_name}</span></div>
                <div>CNIC: <span className="font-mono text-slate-800">{stf.cnic}</span></div>
                <div>Mobile: <span className="font-mono text-slate-800">{stf.mobile}</span></div>
                <div>Qualification: <span className="text-slate-800 font-medium">{stf.qualification}</span></div>
                <div>Experience: <span className="text-slate-800">{stf.experience_years} Years</span></div>
                <div className="pt-1 border-t flex justify-between">
                  <span>Basic Salary:</span>
                  <strong className="text-slate-900 font-mono">PKR {stf.basic_salary.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                {stf.status}
              </span>
              <span className="text-slate-500 text-[11px]">Dept: {stf.department}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm">Register Faculty / Staff Member</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sir Muhammad Tariq"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Aslam"
                    value={form.father_name}
                    onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NADRA CNIC *</label>
                  <input
                    type="text"
                    required
                    placeholder="35201-1234567-1"
                    value={form.cnic}
                    onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Physics Teacher, Accountant"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as Staff['department'] })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="Teaching">Teaching Faculty</option>
                    <option value="Administration">Administration</option>
                    <option value="Accounts">Accounts &amp; Fee</option>
                    <option value="Support">Support Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc Physics, B.Ed"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Basic Monthly Salary (PKR)</label>
                  <input
                    type="number"
                    value={form.basic_salary}
                    onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street, Town, City"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Register Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
