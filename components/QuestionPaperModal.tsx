'use client';

import React, { useState } from 'react';
import { School, QuestionPaper } from '@/lib/types';
import { downloadQuestionPaperPDF, triggerPrint } from '@/lib/pdf-generator';
import { Download, Printer, X, FileQuestion, Eye, EyeOff } from 'lucide-react';

interface QuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  paper: QuestionPaper;
}

export function QuestionPaperModal({ isOpen, onClose, school, paper }: QuestionPaperModalProps) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Actions Bar */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm">Official Question Paper Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
            </button>
            <button
              onClick={triggerPrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Paper (A4)
            </button>
            <button
              onClick={() => downloadQuestionPaperPDF(school, paper)}
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

        {/* Paper Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-[720px] p-8 shadow-sm border border-slate-200 text-slate-900 space-y-6 print-container">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <span className="text-xs font-urdu text-slate-500 font-bold">{school.name_ur}</span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{school.name_en}</h1>
              <p className="text-sm font-bold text-orange-600">{paper.title}</p>
            </div>

            {/* Examination Metrics Strip */}
            <div className="flex justify-between items-center text-xs font-bold border border-slate-300 p-2.5 bg-slate-50">
              <div>Time Allowed: <span className="font-normal font-mono">{paper.duration_minutes} Minutes</span></div>
              <div>Total Marks: <span className="font-mono text-orange-600">{paper.total_marks}</span></div>
              <div>Roll No: <span className="inline-block w-24 border-b border-slate-400"></span></div>
            </div>

            {/* Instructions */}
            <div className="text-xs italic text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong>Instructions:</strong> {paper.instructions}
            </div>

            {/* Questions List */}
            <div className="space-y-6 pt-2">
              {paper.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-900">Q.{idx + 1}</span>
                        <span className="text-slate-800">{q.text}</span>
                      </div>
                      {q.urdu_text && (
                        <p className="font-urdu text-right text-slate-700 text-xs pr-4">{q.urdu_text}</p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-600 text-[11px] shrink-0 ml-3">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </div>

                  {/* MCQ Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="text-slate-700">
                          <span className="font-bold font-mono">({String.fromCharCode(65 + oIdx)})</span> {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer Key Box (if toggled) */}
                  {showAnswerKey && q.answer_key && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 ml-6">
                      <strong className="text-emerald-800">Answer Key:</strong> {q.answer_key}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
