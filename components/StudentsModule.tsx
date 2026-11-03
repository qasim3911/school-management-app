'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Student, SchoolClass } from '@/lib/types';
import {
  Users,
  UserPlus,
  Search,
  Download,
  Printer,
  FileCheck,
  CreditCard,
  Edit,
  Trash2,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { downloadStudentIdCardPDF, triggerPrint } from '@/lib/pdf-generator';

interface StudentsModuleProps {
  school: School;
  onOpenAdmissionLetter: (studentId: string) => void;
}

export function StudentsModule({ school, onOpenAdmissionLetter }: StudentsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [admissionTab, setAdmissionTab] = useState<'student' | 'guardian' | 'academic'>('student');

  const classes = db.getClasses(school.id);
  const sessions = db.getSessions(school.id);
  const students = db.getStudents(school.id);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    father_name: '',
    mother_name: '',
    dob: '2012-05-15',
    gender: 'Male' as 'Male' | 'Female',
    b_form_no: '',
    student_phone: '',
    guardian_phone: '',
    emergency_contact: '',
    address: '',
    province: school.province,
    district: school.district,
    tehsil: '',
    previous_school: '',
    class_id: classes[0]?.id || '',
    section_id: 'sec_mat_a',
    admission_date: '2026-11-01',
    scholarship_discount_percent: 0,
  });

  const filteredStudents = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.father_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.b_form_no.includes(searchQuery);

    const matchesClass = selectedClassId === 'all' || s.class_id === selectedClassId;
    return matchesQuery && matchesClass;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.father_name || !newStudent.b_form_no || !newStudent.guardian_phone) {
      alert('Please fill student name, father name, B-form and guardian phone.');
      return;
    }

    const admNum = `ADM-2026-00${Math.floor(50 + Math.random() * 50)}`;
    const created = db.createStudent({
      school_id: school.id,
      session_id: sessions[0]?.id || 'ses_2026_2027_s1',
      class_id: newStudent.class_id,
      section_id: newStudent.section_id,
      admission_number: admNum,
      name: newStudent.name,
      father_name: newStudent.father_name,
      mother_name: newStudent.mother_name,
      dob: newStudent.dob,
      gender: newStudent.gender,
      b_form_no: newStudent.b_form_no,
      student_phone: newStudent.student_phone,
      guardian_phone: newStudent.guardian_phone,
      emergency_contact: newStudent.emergency_contact || newStudent.guardian_phone,
      address: newStudent.address,
      province: newStudent.province,
      district: newStudent.district,
      tehsil: newStudent.tehsil,
      previous_school: newStudent.previous_school,
      admission_date: newStudent.admission_date,
      scholarship_discount_percent: Number(newStudent.scholarship_discount_percent),
      status: 'Active',
    });

    setIsAddModalOpen(false);
    // Trigger official admission letter preview
    onOpenAdmissionLetter(created.id);
  };

  const exportCSV = () => {
    const headers = 'Admission No,Name,Father Name,B-Form,Gender,DOB,Guardian Phone,Address,Status\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.admission_number}","${s.name}","${s.father_name}","${s.b_form_no}","${s.gender}","${s.dob}","${s.guardian_phone}","${s.address}","${s.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Students_${school.slug}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Directory &amp; Admissions</h2>
          <p className="text-xs text-slate-500">
            Registered students, Nadra B-Form verification, admission letters &amp; student ID cards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Admission
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Name, Father Name, Admission No, or B-Form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
          >
            <option value="all">All Classes ({students.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">Adm No</th>
                <th className="py-2.5 px-4 text-left font-semibold">Student Name</th>
                <th className="py-2.5 px-4 text-left font-semibold">Father Name</th>
                <th className="py-2.5 px-4 text-left font-semibold">B-Form / CNIC</th>
                <th className="py-2.5 px-4 text-left font-semibold">Guardian Phone</th>
                <th className="py-2.5 px-4 text-center font-semibold">Concession</th>
                <th className="py-2.5 px-4 text-center font-semibold">Status</th>
                <th className="py-2.5 px-4 text-center font-semibold">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No student records found matching search filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-orange-600">{s.admission_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-700">{s.father_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.b_form_no}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{s.guardian_phone}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {s.scholarship_discount_percent > 0 ? (
                        <span className="text-emerald-700 font-bold">{s.scholarship_discount_percent}%</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenAdmissionLetter(s.id)}
                          className="px-2 py-1 text-[11px] font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                          title="Print Admission Letter"
                        >
                          Letter
                        </button>
                        <button
                          onClick={() => setIdCardStudent(s)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="View Student ID Card"
                        >
                          ID Card
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="font-bold text-sm">3-Section Student Admission Form</h3>
                  <p className="text-[10px] text-slate-400">NADRA verification, parental CNIC, and academic enrolment</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Navigation Tabs */}
            <div className="flex border-b bg-slate-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAdmissionTab('student')}
                className={`flex-1 py-3 px-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                  admissionTab === 'student'
                    ? 'border-orange-600 text-orange-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] flex items-center justify-center font-bold">1</span>
                <span>Student Info</span>
              </button>
              <button
                type="button"
                onClick={() => setAdmissionTab('guardian')}
                className={`flex-1 py-3 px-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                  admissionTab === 'guardian'
                    ? 'border-orange-600 text-orange-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] flex items-center justify-center font-bold">2</span>
                <span>Parent &amp; Guardian</span>
              </button>
              <button
                type="button"
                onClick={() => setAdmissionTab('academic')}
                className={`flex-1 py-3 px-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                  admissionTab === 'academic'
                    ? 'border-orange-600 text-orange-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] flex items-center justify-center font-bold">3</span>
                <span>Academic &amp; Concession</span>
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* SECTION 1: STUDENT INFORMATION */}
              {admissionTab === 'student' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-orange-800 text-[11px] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Section 1 of 3: Enter student legal identity and NADRA B-Form particulars.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Bilal"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                      <select
                        value={newStudent.gender}
                        onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'Male' | 'Female' })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">NADRA B-Form Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="35201-1234567-1"
                        value={newStudent.b_form_no}
                        onChange={(e) => setNewStudent({ ...newStudent, b_form_no: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={newStudent.dob}
                        onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Previous School Attended</label>
                      <input
                        type="text"
                        placeholder="e.g. Army Public School or DPS"
                        value={newStudent.previous_school}
                        onChange={(e) => setNewStudent({ ...newStudent, previous_school: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Student Personal Mobile (Optional)</label>
                      <input
                        type="tel"
                        placeholder="0300-1122334"
                        value={newStudent.student_phone}
                        onChange={(e) => setNewStudent({ ...newStudent, student_phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setAdmissionTab('guardian')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md flex items-center gap-1.5 shadow-xs"
                    >
                      Next: Parent &amp; Guardian Info
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 2: PARENT & GUARDIAN DETAILS */}
              {admissionTab === 'guardian' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800 text-[11px] flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Section 2 of 3: Father / Guardian CNIC and residential contact details.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Father / Guardian Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Mehmood"
                        value={newStudent.father_name}
                        onChange={(e) => setNewStudent({ ...newStudent, father_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mother Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Nuzhat Parveen"
                        value={newStudent.mother_name}
                        onChange={(e) => setNewStudent({ ...newStudent, mother_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Guardian Mobile / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0300-8451122"
                        value={newStudent.guardian_phone}
                        onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0321-4455667"
                        value={newStudent.emergency_contact}
                        onChange={(e) => setNewStudent({ ...newStudent, emergency_contact: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Province *</label>
                      <input
                        type="text"
                        value={newStudent.province}
                        onChange={(e) => setNewStudent({ ...newStudent, province: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">District / Tehsil *</label>
                      <input
                        type="text"
                        placeholder="e.g. Lahore / Model Town"
                        value={newStudent.district}
                        onChange={(e) => setNewStudent({ ...newStudent, district: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Complete Home Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House/Street, Mohallah, Town, City"
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-3 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setAdmissionTab('student')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdmissionTab('academic')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md flex items-center gap-1.5 shadow-xs"
                    >
                      Next: Academic Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 3: ACADEMIC ASSIGNMENT & CONCESSION */}
              {admissionTab === 'academic' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Section 3 of 3: Class, Section, Admission Date, and Merit Concession.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Enrolling Class *</label>
                      <select
                        value={newStudent.class_id}
                        onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Section Assigned *</label>
                      <select
                        value={newStudent.section_id}
                        onChange={(e) => setNewStudent({ ...newStudent, section_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                      >
                        <option value="sec_mat_a">Section A (Jinnah / Rose)</option>
                        <option value="sec_g5_b">Section B (Iqbal / Tulip)</option>
                        <option value="sec_fsc_a">Section Alpha</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Admission Date *</label>
                      <input
                        type="date"
                        required
                        value={newStudent.admission_date}
                        onChange={(e) => setNewStudent({ ...newStudent, admission_date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Merit Concession Discount %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newStudent.scholarship_discount_percent}
                        onChange={(e) => setNewStudent({ ...newStudent, scholarship_discount_percent: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setAdmissionTab('guardian')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md"
                    >
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Complete Admission &amp; Issue Letter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Student ID Card Modal Preview */}
      {idCardStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-xs text-slate-900">Student ID Card (Pocket Size)</span>
              <button onClick={() => setIdCardStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Badge Card */}
            <div className="border-2 border-orange-600 rounded-xl p-4 bg-orange-50/30 text-left space-y-3 shadow-xs">
              <div className="text-center border-b border-orange-200 pb-2">
                <p className="text-[10px] font-urdu text-slate-500 font-bold">{school.name_ur}</p>
                <h4 className="font-black text-xs text-orange-600">{school.name_en}</h4>
                <p className="text-[9px] text-slate-500">{school.city}</p>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-16 h-20 rounded bg-slate-200 border flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                  PHOTO
                </div>
                <div className="text-[11px] space-y-0.5">
                  <p className="font-extrabold text-slate-900">{idCardStudent.name}</p>
                  <p className="text-slate-600">S/D of {idCardStudent.father_name}</p>
                  <p className="font-mono text-orange-600 font-bold">ADM: {idCardStudent.admission_number}</p>
                  <p className="text-slate-600">Class: Matric Science</p>
                  <p className="text-slate-500 text-[10px]">Emerg: {idCardStudent.emergency_contact}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-orange-200 text-center">
                <div className="font-mono text-[9px] tracking-widest text-slate-400">||| | |||| || |||||| | ||</div>
                <p className="text-[8px] text-slate-400 mt-0.5">Valid for Session 2026-2027</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  downloadStudentIdCardPDF(school, idCardStudent);
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={triggerPrint}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
