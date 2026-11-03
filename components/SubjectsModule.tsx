'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Subject, SchoolClass } from '@/lib/types';
import { BookOpen, Plus, Search, Edit, Trash2, X, Check, Filter } from 'lucide-react';

interface SubjectsModuleProps {
  school: School;
}

export function SubjectsModule({ school }: SubjectsModuleProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const classes = db.getClasses(school.id);
  const sessions = db.getSessions(school.id);
  const subjects = db.getSubjects(school.id);
  const staff = db.getStaff(school.id);
  const teachers = staff.filter((s) => s.department === 'Teaching');

  // Form State
  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    code: '',
    class_id: classes[0]?.id || '',
    session_id: sessions[0]?.id || 'ses_2026_2027_s1',
    type: 'Compulsory' as 'Compulsory' | 'Elective',
    total_marks: 100,
    passing_marks: 33,
    is_optional: false,
    description: '',
    teacher_id: '',
    is_active: true,
  });

  const filteredSubjects = subjects.filter(
    (s) => selectedClassId === 'all' || s.class_id === selectedClassId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_en || !formData.code || !formData.class_id) {
      alert('Please fill subject name, code, and assign a class.');
      return;
    }

    if (editingSubject) {
      db.updateSubject(editingSubject.id, {
        name_en: formData.name_en,
        name_ur: formData.name_ur || formData.name_en,
        code: formData.code,
        class_id: formData.class_id,
        session_id: formData.session_id,
        type: formData.type,
        total_marks: Number(formData.total_marks),
        passing_marks: Number(formData.passing_marks),
        is_optional: formData.is_optional,
        description: formData.description,
        teacher_id: formData.teacher_id || undefined,
        is_active: formData.is_active,
      });
      setEditingSubject(null);
    } else {
      db.createSubject({
        school_id: school.id,
        class_id: formData.class_id,
        session_id: formData.session_id,
        name_en: formData.name_en,
        name_ur: formData.name_ur || formData.name_en,
        code: formData.code,
        type: formData.type,
        total_marks: Number(formData.total_marks),
        passing_marks: Number(formData.passing_marks),
        is_optional: formData.is_optional,
        description: formData.description,
        teacher_id: formData.teacher_id || undefined,
        is_active: formData.is_active,
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      name_en: sub.name_en,
      name_ur: sub.name_ur,
      code: sub.code,
      class_id: sub.class_id,
      session_id: sub.session_id,
      type: sub.type,
      total_marks: sub.total_marks,
      passing_marks: sub.passing_marks,
      is_optional: sub.is_optional,
      description: sub.description || '',
      teacher_id: sub.teacher_id || '',
      is_active: sub.is_active,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      db.deleteSubject(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ur: '',
      code: '',
      class_id: classes[0]?.id || '',
      session_id: sessions[0]?.id || 'ses_2026_2027_s1',
      type: 'Compulsory',
      total_marks: 100,
      passing_marks: 33,
      is_optional: false,
      description: '',
      teacher_id: '',
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Manual Subject Management</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">
              Fully Customizable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manually create and allocate curriculum subjects per class and academic group. No forced automatic lists.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSubject(null);
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Add Custom Subject
        </button>
      </div>

      {/* Class Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-700">Filter by Class:</span>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white max-w-xs"
        >
          <option value="all">All Classes ({subjects.length} Subjects)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((sub) => {
          const cls = classes.find((c) => c.id === sub.class_id);
          const teacher = teachers.find((t) => t.id === sub.teacher_id);
          return (
            <div
              key={sub.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{sub.name_en}</h3>
                    <p className="text-xs font-urdu text-slate-500 font-bold">{sub.name_ur}</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {sub.code}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span>Assigned Class:</span>
                    <strong className="text-slate-800">{cls?.name || 'Unassigned'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Subject Type:</span>
                    <span className={`font-semibold ${sub.type === 'Compulsory' ? 'text-blue-700' : 'text-purple-700'}`}>
                      {sub.type} {sub.is_optional && '(Elective)'}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Total / Passing Marks:</span>
                    <strong className="text-slate-900">{sub.total_marks} / {sub.passing_marks}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Subject Teacher:</span>
                    <span className="text-slate-800">{teacher ? teacher.name : 'Not assigned'}</span>
                  </div>
                </div>

                {sub.description && (
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                    {sub.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  sub.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {sub.is_active ? 'Active' : 'Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(sub)}
                    className="p-1 text-slate-500 hover:text-orange-600 hover:bg-slate-100 rounded"
                    title="Edit Subject"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm">
                  {editingSubject ? 'Edit Subject' : 'Add New Manual Subject'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name (Urdu)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: کمپیوٹر سائنس"
                    value={formData.name_ur}
                    onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md font-urdu focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC-10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Class *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Compulsory' | 'Elective' })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                  >
                    <option value="Compulsory">Compulsory</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={formData.passing_marks}
                    onChange={(e) => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Subject Teacher</label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-white"
                >
                  <option value="">-- No Teacher Assigned --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Single National Curriculum PTB Edition"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_optional}
                    onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Allow student-specific optional selection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Active in Exams</span>
                </label>
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
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
