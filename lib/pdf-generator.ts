import jsPDF from 'jspdf';
import { School, Student, FeeChallan, FeePayment, QuestionPaper, DateSheet, SalaryRecord, Staff, CertificateRecord } from './types';

/**
 * Triggers native browser print preview styled specifically for A4
 */
export function triggerPrint() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Safely format numbers with fallback to 0
 */
function safeNum(val: any, fallback: number = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

/**
 * Safely format PKR amount strings
 */
function formatPKR(val: any, fallback: number = 0): string {
  return safeNum(val, fallback).toLocaleString();
}

/**
 * Safely format text with fallback string
 */
function safeStr(val: any, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback;
  return String(val);
}

/**
 * Initialize a jsPDF instance that safely sanitizes all string arguments to doc.text()
 * to prevent uncaught "Invalid arguments passed to jsPDF.text" exceptions.
 */
function initSafeDoc(options: any): jsPDF {
  const doc = new jsPDF(options);
  const origText = doc.text.bind(doc);

  // Wrap text method
  doc.text = function (text: any, x: any, y: any, textOptions?: any): any {
    let sanitized: any = text;
    if (sanitized === null || sanitized === undefined) {
      sanitized = '';
    } else if (Array.isArray(sanitized)) {
      sanitized = sanitized.map((line) => (line === null || line === undefined ? '' : String(line)));
    } else {
      sanitized = String(sanitized);
    }
    return origText(sanitized, x, y, textOptions);
  };

  return doc;
}

/**
 * Safely trigger PDF file download with fallback to Blob URL
 */
function safeSave(doc: jsPDF, filename: string) {
  const cleanName = (filename || 'document.pdf').replace(/[^\w\.\-_]/g, '_');
  try {
    doc.save(cleanName);
  } catch (err) {
    console.warn('[PDF] doc.save fallback trigger', err);
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (fallbackErr) {
      console.error('[PDF] Download failed completely', fallbackErr);
    }
  }
}

/**
 * Direct PDF Download for Pakistani 3-Part Bank Challan
 */
export function downloadChallanPDF(school: School, student: Student, challan: FeeChallan) {
  const doc = initSafeDoc({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const schoolPhone = safeStr(school?.phone, '0300-0000000');
  const regNo = safeStr(school?.registration_no, 'BISE/REG/2026');

  const studentName = safeStr(student?.name, 'Student Name');
  const fatherName = safeStr(student?.father_name, 'Father Name');
  const admNo = safeStr(student?.admission_number, 'ADM-001');
  const chnNo = safeStr(challan?.challan_number, 'CHN-001');
  const feeMonth = safeStr(challan?.month || (challan as any)?.month_year, 'Current Month');
  const issueDate = safeStr(challan?.issue_date, new Date().toISOString().split('T')[0]);
  const dueDate = safeStr(challan?.due_date, new Date().toISOString().split('T')[0]);

  const copies = ['BANK COPY', 'SCHOOL COPY', 'STUDENT COPY'];
  const colWidth = 90;
  const startY = 15;

  copies.forEach((copyTitle, index) => {
    const startX = 12 + index * colWidth;

    // Border box
    doc.setDrawColor(200, 200, 200);
    doc.rect(startX, startY, 84, 180);

    // Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 88, 12); // Orange primary
    doc.text(schoolName, startX + 42, startY + 8, { align: 'center', maxWidth: 80 });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(schoolAddress, startX + 42, startY + 13, { align: 'center', maxWidth: 78 });
    doc.text(`Phone: ${schoolPhone} | Reg: ${regNo}`, startX + 42, startY + 17, { align: 'center' });

    // Copy Type Tag
    doc.setFillColor(245, 245, 245);
    doc.rect(startX + 15, startY + 20, 54, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(copyTitle, startX + 42, startY + 24.5, { align: 'center' });

    // Challan Details
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Challan #: ${chnNo}`, startX + 4, startY + 32);
    doc.text(`Fee Month: ${feeMonth}`, startX + 50, startY + 32);
    doc.text(`Issue Date: ${issueDate}`, startX + 4, startY + 37);
    doc.text(`Due Date: ${dueDate}`, startX + 50, startY + 37);

    // Student Info
    doc.line(startX + 4, startY + 40, startX + 80, startY + 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student: ${studentName}`, startX + 4, startY + 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Father: ${fatherName}`, startX + 4, startY + 50);
    doc.text(`Adm #: ${admNo}`, startX + 4, startY + 55);
    doc.text(`Class/Section: Matric Science - A`, startX + 40, startY + 55);

    // Fee Breakdown Table
    doc.line(startX + 4, startY + 58, startX + 80, startY + 58);
    doc.setFont('helvetica', 'bold');
    doc.text('Fee Head', startX + 6, startY + 63);
    doc.text('Amount (PKR)', startX + 78, startY + 63, { align: 'right' });
    doc.line(startX + 4, startY + 65, startX + 80, startY + 65);

    doc.setFont('helvetica', 'normal');
    let currY = startY + 70;
    const items = [
      { name: 'Tuition Fee', amt: safeNum(challan?.tuition_fee) },
      { name: 'Exam Fee', amt: safeNum(challan?.exam_fee) },
      { name: 'Transport Charges', amt: safeNum(challan?.transport_fee) },
      { name: 'Other Charges', amt: safeNum(challan?.other_charges) },
      { name: 'Previous Arrears', amt: safeNum(challan?.previous_arrears) },
      { name: 'Concession / Discount', amt: -safeNum(challan?.concession_discount) },
    ];

    items.forEach((item) => {
      if (item.amt !== 0) {
        doc.text(item.name, startX + 6, currY);
        doc.text(`${item.amt.toLocaleString()} PKR`, startX + 78, currY, { align: 'right' });
        currY += 5;
      }
    });

    const totalPayable = safeNum(challan?.total_payable, safeNum(challan?.tuition_fee));

    // Total
    doc.line(startX + 4, currY + 2, startX + 80, currY + 2);
    currY += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Payable:', startX + 6, currY);
    doc.text(`${totalPayable.toLocaleString()} PKR`, startX + 78, currY, { align: 'right' });

    currY += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(`(Payable after due date: ${(totalPayable + 300).toLocaleString()} PKR)`, startX + 6, currY);

    // Footer / Signatures
    currY = startY + 160;
    doc.setFont('helvetica', 'normal');
    doc.text('__________________', startX + 6, currY);
    doc.text('Cashier / Officer', startX + 6, currY + 4);

    doc.text('__________________', startX + 50, currY);
    doc.text('School Stamp', startX + 50, currY + 4);

    doc.setFontSize(6.5);
    doc.text('Payable at Meezan Bank & EasyPaisa / JazzCash App', startX + 42, startY + 175, { align: 'center' });
  });

  safeSave(doc, `Challan_${chnNo}.pdf`);
}

/**
 * Direct PDF Download for Official Admission Letter
 */
export function downloadAdmissionLetterPDF(school: School, student: Student) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const schoolPhone = safeStr(school?.phone, '0300-0000000');
  const schoolEmail = safeStr(school?.email, 'admin@school.edu.pk');
  const principalName = safeStr(school?.principal_name, 'Head of Institution');

  const studentName = safeStr(student?.name, 'Student Name');
  const fatherName = safeStr(student?.father_name, 'Father Name');
  const admNo = safeStr(student?.admission_number, 'ADM-001');
  const bform = safeStr(student?.b_form_no, '35201-0000000-1');
  const guardianPhone = safeStr(student?.guardian_phone || student?.phone, '0300-0000000');
  const studentAddress = safeStr(student?.address, 'Pakistan');
  const discountPercent = safeNum(student?.scholarship_discount_percent, 0);

  // Border
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);

  // Inner margin
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, 184, 271);

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName, 105, 26, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(schoolAddress, 105, 32, { align: 'center' });
  doc.text(`Phone: ${schoolPhone} | Email: ${schoolEmail}`, 105, 37, { align: 'center' });
  doc.text(`Registration No: ${school?.registration_no || 'REG/EDU/PK/2026'}`, 105, 42, { align: 'center' });

  // Divider
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.6);
  doc.line(20, 46, 190, 46);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PROVISIONAL ADMISSION LETTER & FEE INTIMATION', 105, 56, { align: 'center' });

  // Letter info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref No: ADM-LTR-2026-${admNo}`, 22, 66);
  doc.text(`Issue Date: ${new Date().toISOString().split('T')[0]}`, 150, 66);

  // Salutation
  doc.setFontSize(10);
  doc.text(`To the Parent / Guardian of:`, 22, 75);
  doc.setFont('helvetica', 'bold');
  doc.text(`${studentName} (Son / Daughter of ${fatherName})`, 22, 81);
  doc.setFont('helvetica', 'normal');
  doc.text(`B-Form / CNIC: ${bform} | Contact: ${guardianPhone}`, 22, 87);
  doc.text(`Address: ${studentAddress}`, 22, 92);

  // Body
  doc.setFontSize(9.5);
  doc.text(
    `We are pleased to inform you that your child has been granted provisional admission to ${schoolName} for Academic Session 2026-2027 based on admission merit evaluation and document verification.`,
    22,
    102,
    { maxWidth: 166 }
  );

  // Admission Particulars Table
  doc.setFillColor(248, 250, 252);
  doc.rect(22, 115, 166, 35, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(22, 115, 166, 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Admission Particulars:', 26, 122);
  doc.setFont('helvetica', 'normal');
  doc.text(`Admission Number: ${admNo}`, 26, 130);
  doc.text(`Enrolled Class: Grade 10 (Matric Science)`, 26, 137);
  doc.text(`Section: Section A`, 26, 144);

  doc.text(`Academic Session: 2026-2027`, 110, 130);
  doc.text(`School Timings: ${school?.school_timings || '07:45 AM - 01:45 PM'}`, 110, 137);
  doc.text(`Concession: ${discountPercent}% Merit Discount`, 110, 144);

  // Fee Details
  doc.setFont('helvetica', 'bold');
  doc.text('Fee Structure & Payable At Time of Admission:', 22, 160);

  const admissionFee = safeNum((student as any)?.admission_fee, 8000);
  const tuitionFee = safeNum((student as any)?.monthly_tuition_fee, 7500);
  const netDue = admissionFee + tuitionFee;

  const feeItems = [
    { head: 'Admission Registration Fee (One-Time)', amount: `PKR ${admissionFee.toLocaleString()}` },
    { head: 'Monthly Tuition Fee (First Month)', amount: `PKR ${tuitionFee.toLocaleString()}` },
    { head: 'Annual Utility & Lab Charges', amount: 'PKR 4,000' },
    { head: 'Student ID Card & Diary', amount: 'PKR 1,000' },
    { head: `Merit Concession (${discountPercent}%)`, amount: discountPercent > 0 ? `- PKR ${Math.round(tuitionFee * (discountPercent / 100)).toLocaleString()}` : 'PKR 0' },
  ];

  let feeY = 168;
  doc.setFont('helvetica', 'normal');
  feeItems.forEach((f) => {
    doc.text(f.head, 26, feeY);
    doc.text(f.amount, 180, feeY, { align: 'right' });
    feeY += 6;
  });

  doc.setLineWidth(0.4);
  doc.line(22, feeY + 1, 188, feeY + 1);
  feeY += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Net Total Due at Admission:', 26, feeY);
  doc.text(`PKR ${(netDue + 5000).toLocaleString()}`, 180, feeY, { align: 'right' });

  // Instructions
  feeY += 14;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Instructions:', 22, feeY);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Dues must be cleared via bank challan within 7 working days from issue date.', 22, feeY + 5);
  doc.text('2. Please submit attested copy of Student B-Form, Father CNIC, and 4 passport-size photographs.', 22, feeY + 10);
  doc.text('3. School uniform and textbooks can be purchased from authorized school bookshop.', 22, feeY + 15);

  // Signatures & Stamp
  const sigY = 245;
  doc.line(26, sigY, 70, sigY);
  doc.text('Accounts Officer', 36, sigY + 5);

  doc.line(135, sigY, 180, sigY);
  doc.setFont('helvetica', 'bold');
  doc.text(principalName, 140, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Principal / Head of Institution', 135, sigY + 10);

  safeSave(doc, `Admission_Letter_${admNo}.pdf`);
}

/**
 * Direct PDF Download for Detailed Result Card / DMC
 */
export function downloadResultCardPDF(school: School, student: Student, marks: { subject: string; total: number; passing: number; obtained: number }[]) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const regNo = safeStr(school?.registration_no, 'BISE/REG/2026');

  const studentName = safeStr(student?.name, 'Student Name');
  const fatherName = safeStr(student?.father_name, 'Father Name');
  const admNo = safeStr(student?.admission_number, 'ADM-001');
  const bform = safeStr(student?.b_form_no, '35201-0000000-1');

  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName, 105, 24, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(schoolAddress, 105, 30, { align: 'center' });
  doc.text(`Affiliated with Board of Intermediate & Secondary Education | Reg: ${regNo}`, 105, 35, { align: 'center' });

  doc.line(18, 40, 192, 40);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DETAILED MARKS CERTIFICATE (DMC)', 105, 48, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('First Term Examination 2026 - Academic Session 2026-2027', 105, 54, { align: 'center' });

  // Student Info Box
  doc.setFillColor(248, 250, 252);
  doc.rect(18, 60, 174, 26, 'F');
  doc.rect(18, 60, 174, 26);

  doc.setFontSize(8.5);
  doc.text(`Student Name: ${studentName}`, 22, 67);
  doc.text(`Father Name: ${fatherName}`, 22, 73);
  doc.text(`Admission #: ${admNo}`, 22, 79);

  doc.text(`Class: Matric Science`, 110, 67);
  doc.text(`Roll / Section: Section A (Jinnah)`, 110, 73);
  doc.text(`B-Form / CNIC: ${bform}`, 110, 79);

  // Marks Table Header
  const tableY = 94;
  doc.setFillColor(234, 88, 12);
  doc.rect(18, tableY, 174, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Subject', 22, tableY + 5.5);
  doc.text('Total Marks', 95, tableY + 5.5, { align: 'center' });
  doc.text('Passing Marks', 125, tableY + 5.5, { align: 'center' });
  doc.text('Obtained Marks', 155, tableY + 5.5, { align: 'center' });
  doc.text('Status', 182, tableY + 5.5, { align: 'center' });

  let rowY = tableY + 14;
  let sumTotal = 0;
  let sumObtained = 0;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  const safeMarksList = Array.isArray(marks) && marks.length > 0 ? marks : [
    { subject: 'English', total: 75, passing: 25, obtained: 68 },
    { subject: 'Urdu', total: 75, passing: 25, obtained: 64 },
    { subject: 'Mathematics', total: 75, passing: 25, obtained: 72 },
    { subject: 'Physics', total: 60, passing: 20, obtained: 54 },
    { subject: 'Chemistry', total: 60, passing: 20, obtained: 51 },
    { subject: 'Computer Science', total: 50, passing: 17, obtained: 46 },
    { subject: 'Islamiyat', total: 50, passing: 17, obtained: 45 },
    { subject: 'Pakistan Studies', total: 50, passing: 17, obtained: 44 },
  ];

  safeMarksList.forEach((m, idx) => {
    const tot = safeNum(m.total, 100);
    const obt = safeNum(m.obtained, 0);
    const pass = safeNum(m.passing, Math.round(tot * 0.33));
    sumTotal += tot;
    sumObtained += obt;
    const isPass = obt >= pass;

    if (idx % 2 === 1) {
      doc.setFillColor(245, 245, 245);
      doc.rect(18, rowY - 5, 174, 7, 'F');
    }

    doc.text(safeStr(m.subject, 'Subject'), 22, rowY);
    doc.text(`${tot}`, 95, rowY, { align: 'center' });
    doc.text(`${pass}`, 125, rowY, { align: 'center' });
    doc.text(`${obt}`, 155, rowY, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPass ? 22 : 220, isPass ? 163 : 38, isPass ? 74 : 38);
    doc.text(isPass ? 'PASS' : 'FAIL', 182, rowY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    rowY += 7.5;
  });

  // Total summary
  doc.line(18, rowY, 192, rowY);
  rowY += 6;
  const percentage = sumTotal > 0 ? ((sumObtained / sumTotal) * 100).toFixed(1) : '0.0';
  let grade = 'A+';
  const pNum = Number(percentage);
  if (pNum < 80) grade = 'A';
  if (pNum < 70) grade = 'B';
  if (pNum < 60) grade = 'C';
  if (pNum < 50) grade = 'D';

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL / PERCENTAGE:', 22, rowY);
  doc.text(`${sumTotal}`, 95, rowY, { align: 'center' });
  doc.text('-', 125, rowY, { align: 'center' });
  doc.text(`${sumObtained}`, 155, rowY, { align: 'center' });
  doc.text(`${percentage}% (${grade})`, 182, rowY, { align: 'center' });

  // Remarks & Attendance Box
  rowY += 18;
  doc.rect(18, rowY, 174, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTENDANCE & BEHAVIOUR SUMMARY:', 22, rowY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('Attendance: 96% (Present: 115 / Total Days: 120)', 22, rowY + 12);
  doc.text('Class Position: 2nd out of 42 students', 22, rowY + 18);
  doc.text('Teacher Remarks: Consistently active, curious, and demonstrates excellent work ethic in analytical subjects.', 100, rowY + 12, { maxWidth: 88 });

  // Footer & Signature
  rowY = 245;
  doc.line(26, rowY, 70, rowY);
  doc.text('Class Teacher Signature', 30, rowY + 5);

  doc.line(135, rowY, 180, rowY);
  doc.text('Principal / Controller Exam', 138, rowY + 5);

  safeSave(doc, `ResultCard_${admNo}.pdf`);
}

/**
 * Direct PDF Download for Official Question Paper
 */
export function downloadQuestionPaperPDF(school: School, paper: QuestionPaper) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const paperTitle = safeStr(paper?.title, 'Examination Question Paper');
  const duration = safeNum(paper?.duration_minutes, 180);
  const totalMarks = safeNum(paper?.total_marks, 100);
  const instructions = safeStr(paper?.instructions, 'Attempt all questions. Mobile phones and unauthorized materials are strictly prohibited.');

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName, 105, 20, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(paperTitle, 105, 26, { align: 'center' });

  // Exam Info Bar
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 32, 182, 10, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, 32, 182, 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Time Allowed: ${duration} Minutes`, 18, 38.5);
  doc.text(`Maximum Marks: ${totalMarks}`, 105, 38.5, { align: 'center' });
  doc.text('Roll Number: _____________', 190, 38.5, { align: 'right' });

  // Instructions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Instructions: ${instructions}`, 14, 48, { maxWidth: 182 });

  doc.line(14, 55, 196, 55);

  let qY = 62;
  const questions = Array.isArray(paper?.questions) ? paper.questions : [];
  questions.forEach((q, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Q.${idx + 1} [${safeNum(q.marks, 5)} Marks]`, 14, qY);

    doc.setFont('helvetica', 'normal');
    doc.text(safeStr(q.text, 'Question text'), 36, qY, { maxWidth: 156 });

    qY += 8;

    if (q.options && q.options.length > 0) {
      doc.setFontSize(8.5);
      const optStr = q.options.map((opt, i) => `(${String.fromCharCode(65 + i)}) ${safeStr(opt)}`).join('     ');
      doc.text(optStr, 36, qY);
      qY += 8;
    }

    qY += 4;
  });

  safeSave(doc, `QuestionPaper_${safeStr(paper?.id, 'exam')}.pdf`);
}

/**
 * Direct PDF Download for Pocket-Sized Student ID Card (CR80 standard dimensions: 85.6mm x 54mm)
 */
export function downloadStudentIdCardPDF(school: School, student: Student, className: string = 'Grade 10 Matric') {
  const doc = initSafeDoc({
    orientation: 'landscape',
    unit: 'mm',
    format: [86, 54],
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const city = safeStr(school?.city, 'Lahore');
  const phone = safeStr(school?.phone, '0300-0000000');

  const studentName = safeStr(student?.name, 'Student Name');
  const fatherName = safeStr(student?.father_name, 'Father Name');
  const admNo = safeStr(student?.admission_number, 'ADM-001');
  const bform = safeStr(student?.b_form_no, '35201-0000000-1');
  const emergPhone = safeStr(student?.guardian_phone || student?.emergency_contact || student?.phone, phone);

  // Background gradient / solid fill
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 86, 54, 'F');

  // Outer border & top accent bar
  doc.setDrawColor(234, 88, 12); // Orange primary
  doc.setLineWidth(0.6);
  doc.rect(2, 2, 82, 50);

  // Top header bar
  doc.setFillColor(234, 88, 12);
  doc.rect(2, 2, 82, 11, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(schoolName.toUpperCase(), 43, 6, { align: 'center', maxWidth: 78 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.text(`${city} • ${phone}`, 43, 9.5, { align: 'center' });

  // Photo box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.rect(5, 16, 18, 22, 'FD');
  doc.setFontSize(5.5);
  doc.setTextColor(140, 140, 140);
  doc.text('STUDENT\nPHOTO', 14, 25, { align: 'center' });

  // Student Details
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(studentName, 26, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`S/D of: ${fatherName}`, 26, 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(234, 88, 12);
  doc.text(`Adm #: ${admNo}`, 26, 26);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`Class: ${className}`, 26, 30);
  doc.text(`B-Form: ${bform}`, 26, 34);
  doc.text(`Emerg Contact: ${emergPhone}`, 26, 38);

  // Bottom barcode simulation bar & validity
  doc.setFillColor(248, 250, 252);
  doc.rect(2, 42, 82, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(2, 42, 84, 42);

  doc.setFont('courier', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 100, 100);
  doc.text('||| | |||| || | |||| ||| || | ||||', 16, 46);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(234, 88, 12);
  doc.text('VALID FOR SESSION 2026-2027', 60, 46, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.setTextColor(100, 100, 100);
  doc.text('If found, return to school office • Principal Signature: _________________', 43, 49.5, { align: 'center' });

  safeSave(doc, `StudentID_${admNo}.pdf`);
}

/**
 * Direct PDF Download for Official Staff Salary Slip
 */
export function downloadSalarySlipPDF(school: School, staff: Staff, salary: SalaryRecord) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const schoolPhone = safeStr(school?.phone, '0300-0000000');
  const schoolEmail = safeStr(school?.email, 'admin@school.edu.pk');

  const staffName = safeStr(staff?.name, 'Staff Member');
  const empId = safeStr(staff?.employee_id, 'EMP-001');
  const designation = safeStr(staff?.designation, 'Faculty Member');
  const cnic = safeStr(staff?.cnic, '35201-0000000-1');
  const department = safeStr(staff?.department, 'Academic');

  const monthStr = safeStr(salary?.month, 'Current Month');
  const slipNo = safeStr(salary?.slip_number, 'PAY-2026-001');
  const paymentMethod = safeStr(salary?.payment_method, 'Bank Transfer');
  const paymentDate = safeStr(salary?.payment_date, new Date().toISOString().split('T')[0]);
  const status = safeStr(salary?.status, 'Paid');

  const basicSalary = safeNum(salary?.basic_salary, safeNum(staff?.basic_salary, 45000));
  const allowances = safeNum(salary?.allowances, 5000);
  const deductions = safeNum(salary?.deductions, 2000);
  const advance = safeNum(salary?.advance_salary, 0);
  const grossPay = basicSalary + allowances;
  const totalDeductions = deductions + advance;
  const netPay = safeNum(salary?.net_payable, grossPay - totalDeductions);

  // Outer Border
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.6);
  doc.rect(12, 12, 186, 273);

  // Inner Border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(15, 15, 180, 267);

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName, 105, 26, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(schoolAddress, 105, 32, { align: 'center' });
  doc.text(`Phone: ${schoolPhone} • Email: ${schoolEmail}`, 105, 37, { align: 'center' });

  doc.line(20, 42, 190, 42);

  // Title Box
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 46, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`STAFF MONTHLY SALARY DISBURSEMENT SLIP — ${monthStr.toUpperCase()}`, 105, 52.5, { align: 'center' });

  // Particulars Table
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 60, 170, 32, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(20, 60, 170, 32);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Employee Name:`, 24, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(staffName, 56, 68);

  doc.setFont('helvetica', 'bold');
  doc.text(`Employee ID:`, 110, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(empId, 140, 68);

  doc.setFont('helvetica', 'bold');
  doc.text(`Designation:`, 24, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(designation, 56, 75);

  doc.setFont('helvetica', 'bold');
  doc.text(`CNIC Number:`, 110, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(cnic, 140, 75);

  doc.setFont('helvetica', 'bold');
  doc.text(`Slip Reference:`, 24, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(slipNo, 56, 82);

  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Mode:`, 110, 82);
  doc.setFont('helvetica', 'normal');
  doc.text(`${paymentMethod} (${paymentDate})`, 140, 82);

  doc.setFont('helvetica', 'bold');
  doc.text(`Department:`, 24, 89);
  doc.setFont('helvetica', 'normal');
  doc.text(`${department} Department`, 56, 89);

  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Status:`, 110, 89);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text(status.toUpperCase(), 140, 89);
  doc.setTextColor(15, 23, 42);

  // Breakdown Table
  const tableY = 100;
  // Earnings Col
  doc.setFillColor(234, 88, 12);
  doc.rect(20, tableY, 82, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('EARNINGS & ALLOWANCES', 24, tableY + 5.5);
  doc.text('PKR', 98, tableY + 5.5, { align: 'right' });

  // Deductions Col
  doc.setFillColor(71, 85, 105);
  doc.rect(108, tableY, 82, 8, 'F');
  doc.text('DEDUCTIONS & RECOVERIES', 112, tableY + 5.5);
  doc.text('PKR', 186, tableY + 5.5, { align: 'right' });

  let rowY = tableY + 16;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  // Row 1
  doc.text('Basic Pay', 24, rowY);
  doc.text(basicSalary.toLocaleString(), 98, rowY, { align: 'right' });
  doc.text('Income Tax / Provident Fund', 112, rowY);
  doc.text(deductions.toLocaleString(), 186, rowY, { align: 'right' });

  // Row 2
  rowY += 8;
  doc.text('Allowances (Medical/House/Adhoc)', 24, rowY);
  doc.text(allowances.toLocaleString(), 98, rowY, { align: 'right' });
  doc.text('Advance Salary Deduction', 112, rowY);
  doc.text(advance.toLocaleString(), 186, rowY, { align: 'right' });

  // Totals line
  rowY += 12;
  doc.setLineWidth(0.3);
  doc.line(20, rowY, 190, rowY);

  rowY += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Gross Earnings:', 24, rowY);
  doc.text(`PKR ${grossPay.toLocaleString()}`, 98, rowY, { align: 'right' });

  doc.text('Total Deductions:', 112, rowY);
  doc.text(`PKR ${totalDeductions.toLocaleString()}`, 186, rowY, { align: 'right' });

  // Net Pay Callout
  rowY += 14;
  doc.setFillColor(240, 253, 244);
  doc.rect(20, rowY, 170, 16, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.rect(20, rowY, 170, 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 101, 52);
  doc.text('NET SALARY DISBURSED:', 26, rowY + 10.5);
  doc.setFontSize(13);
  doc.text(`PKR ${netPay.toLocaleString()}`, 184, rowY + 10.5, { align: 'right' });

  // Notes
  rowY += 26;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Note: This is a computer-generated salary slip and requires authorized institution stamps and signatures.', 20, rowY);
  doc.text('All queries regarding allowances or deductions must be reported to Accounts within 5 working days.', 20, rowY + 5);

  // Signatures
  const sigY = 240;
  doc.line(25, sigY, 75, sigY);
  doc.text('Employee Signature', 35, sigY + 5);

  doc.line(85, sigY, 130, sigY);
  doc.text('Accounts Officer', 95, sigY + 5);

  doc.line(140, sigY, 185, sigY);
  doc.text('Principal / Stamp', 150, sigY + 5);

  safeSave(doc, `SalarySlip_${empId}_${monthStr.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Direct PDF Download for Official Character Certificate
 */
export function downloadCharacterCertificatePDF(school: School, cert: CertificateRecord, student?: Student) {
  const doc = initSafeDoc({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const regNo = safeStr(school?.registration_no, 'BISE/EDU/2026');
  const principalName = safeStr(school?.principal_name, 'Head of Institution');

  const certNumber = safeStr(cert?.certificate_number, 'CERT-PK-2026-001');
  const issueDate = safeStr(cert?.issue_date, new Date().toISOString().split('T')[0]);

  // Ornate double border
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  doc.rect(13, 13, 271, 184);

  // Watermark emblem box
  doc.setFillColor(254, 243, 199);
  doc.rect(15, 15, 267, 180, 'F');

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName.toUpperCase(), 148, 30, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(schoolAddress, 148, 37, { align: 'center' });
  doc.text(`Affiliated with Board of Intermediate & Secondary Education • Reg No: ${regNo}`, 148, 43, { align: 'center' });

  // Title Ribbon
  doc.setFillColor(234, 88, 12);
  doc.rect(80, 52, 137, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('CHARACTER & BONAFIDE CERTIFICATE', 148, 60, { align: 'center' });

  // Serial & Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Certificate No: ${certNumber}`, 22, 75);
  doc.text(`Date of Issue: ${issueDate}`, 270, 75, { align: 'right' });

  // Body Content
  const studentName = safeStr(student?.name, 'The Candidate');
  const fatherName = safeStr(student?.father_name, 'The Father');
  const bform = safeStr(student?.b_form_no, '35201-0000000-1');
  const admNo = safeStr(student?.admission_number, 'ADM-2026-0001');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);

  const para1 = `This is to certify that ${studentName}, son / daughter of ${fatherName}, bearing Admission Number ${admNo} and NADRA B-Form Number ${bform}, has been a regular student of this institution in Grade 10 (Matric Science).`;
  doc.text(para1, 22, 90, { maxWidth: 250, lineHeightFactor: 1.5 });

  const para2 = `During his / her academic stay at this institution, his / her character and conduct was found to be ${cert?.character_conduct || 'EXEMPLARY, DILIGENT & MORALLY SOUND'}. He / she took keen interest in curricular and co-curricular activities, maintaining high discipline throughout the academic sessions.`;
  doc.text(para2, 22, 115, { maxWidth: 250, lineHeightFactor: 1.5 });

  const para3 = `To the best of our knowledge and belief, he / she bears good moral character and does not participate in any subversive or undisciplined activity. We wish him / her utmost success in all future academic pursuits.`;
  doc.text(para3, 22, 140, { maxWidth: 250, lineHeightFactor: 1.5 });

  // Signatures
  const sigY = 175;
  doc.line(28, sigY, 80, sigY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Teacher Signature', 36, sigY + 5);

  doc.line(125, sigY, 175, sigY);
  doc.text('Official Seal / Stamp', 133, sigY + 5);

  doc.line(215, sigY, 268, sigY);
  doc.text(principalName, 225, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Principal / Head of Institution', 222, sigY + 9);

  safeSave(doc, `Character_Certificate_${certNumber}.pdf`);
}

/**
 * Direct PDF Download for Official School Leaving Certificate (SLC)
 */
export function downloadLeavingCertificatePDF(school: School, cert: CertificateRecord, student?: Student) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const regNo = safeStr(school?.registration_no, 'BISE/EDU/2026');
  const principalName = safeStr(school?.principal_name, 'Head of Institution');

  // Triple border
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, 184, 271);

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName.toUpperCase(), 105, 24, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(schoolAddress, 105, 30, { align: 'center' });
  doc.text(`Registration / Affiliation BISE: ${regNo}`, 105, 35, { align: 'center' });

  doc.line(18, 40, 192, 40);

  // Title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SCHOOL LEAVING / TRANSFER CERTIFICATE (SLC)', 105, 48, { align: 'center' });

  // Serial & Date
  const certNumber = safeStr(cert?.certificate_number, 'SLC-PK-2026-001');
  const issueDate = safeStr(cert?.issue_date, new Date().toISOString().split('T')[0]);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Certificate Ref: ${certNumber}`, 20, 56);
  doc.text(`Date of Issue: ${issueDate}`, 190, 56, { align: 'right' });

  // Particulars Table
  const studentName = safeStr(student?.name, 'Student Name');
  const fatherName = safeStr(student?.father_name, 'Father Name');
  const bform = safeStr(student?.b_form_no, '35201-0000000-1');
  const admNo = safeStr(student?.admission_number, 'ADM-2026-0001');
  const dob = safeStr(student?.dob, '2010-08-14');

  const rows = [
    ['1. Admission / Registration No:', admNo],
    ['2. Name of Pupil in Full:', studentName],
    ['3. Father / Guardian Full Name:', fatherName],
    ['4. Nationality / Religion:', 'Pakistani / Islam'],
    ['5. NADRA B-Form / CNIC No:', bform],
    ['6. Date of Birth (in Christian Era):', dob],
    ['7. Date of First Admission to School:', safeStr(student?.admission_date, '2024-04-10')],
    ['8. Class in which student last studied:', 'Grade 10 (Matriculation Science)'],
    ['9. School / Board Annual Exam Last Taken:', 'BISE Secondary School Certificate Part I'],
    ['10. Whether qualified for promotion to higher class:', 'Yes, Qualified for Promotion'],
    ['11. Month up to which school dues have been paid:', 'All Dues Paid in Full up to Leaving Date'],
    ['12. Any fee concession availed:', student?.scholarship_discount_percent ? `${student.scholarship_discount_percent}% Merit Discount` : 'None'],
    ['13. Total attendance during academic session:', '186 / 195 Days (95.4% Turnout)'],
    ['14. Reason for leaving the institution:', safeStr(cert?.reason_for_leaving, 'Completed Secondary School Matriculation')],
    ['15. General Conduct and Moral Character:', safeStr(cert?.character_conduct, 'Good, Diligent & Well-Disciplined')],
    ['16. Date of Application for Certificate:', issueDate],
  ];

  let currY = 64;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);

  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.rect(20, currY - 4, 170, 7.5, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(label, 24, currY + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, 110, currY + 1);

    currY += 8;
  });

  // Footer instructions
  currY += 12;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Certified that the above particulars are in accordance with the school registers and verified against official admission records.', 20, currY);

  // Signatures
  const sigY = 248;
  doc.line(24, sigY, 68, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Prepared by (Clerk)', 28, sigY + 5);

  doc.line(80, sigY, 126, sigY);
  doc.text('Checked by (Incharge)', 86, sigY + 5);

  doc.line(140, sigY, 186, sigY);
  doc.text(principalName, 146, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Principal & Head of Institution', 144, sigY + 9);

  safeSave(doc, `SLC_${studentName.replace(/\s+/g, '_')}_${admNo}.pdf`);
}

/**
 * Direct PDF Download for Examination Date Sheet
 */
export function downloadDateSheetPDF(school: School, dateSheet: DateSheet, subjects: { id: string; name_en?: string; name?: string }[]) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const regNo = safeStr(school?.registration_no, 'BISE/2026');
  const principalName = safeStr(school?.principal_name, 'Head of Institution');

  // Border
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, 186, 273);

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName, 105, 24, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(schoolAddress, 105, 30, { align: 'center' });
  doc.text(`Official Examination Schedule & Date Sheet • BISE Affiliation: ${regNo}`, 105, 35, { align: 'center' });

  doc.line(20, 40, 190, 40);

  // Title Box
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 46, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('ANNUAL / MID-TERM EXAMINATION DATE SHEET', 105, 52.5, { align: 'center' });

  // Table Header
  const tableY = 64;
  doc.setFillColor(234, 88, 12);
  doc.rect(20, tableY, 170, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Sr #', 24, tableY + 5.5);
  doc.text('Exam Date & Day', 40, tableY + 5.5);
  doc.text('Subject', 95, tableY + 5.5);
  doc.text('Timings', 145, tableY + 5.5);
  doc.text('Room', 178, tableY + 5.5);

  let rowY = tableY + 14;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  const items = Array.isArray(dateSheet?.items) ? dateSheet.items : [];
  items.forEach((item, index) => {
    const subjObj = Array.isArray(subjects) ? subjects.find((s) => s.id === item.subject_id) : undefined;
    const subj = safeStr(subjObj?.name_en || (subjObj as any)?.name, 'Subject Paper');

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, rowY - 5, 170, 7.5, 'F');
    }

    doc.text(`${index + 1}`, 24, rowY);
    doc.text(safeStr(item.exam_date, '2026-11-10'), 40, rowY);
    doc.text(subj, 95, rowY);
    doc.text(`${safeStr(item.start_time, '09:00 AM')} - ${safeStr(item.end_time, '12:00 PM')}`, 145, rowY);
    doc.text(safeStr(item.room_no, 'Hall A'), 178, rowY);

    rowY += 8;
  });

  // Instructions
  rowY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Important Instructions for Candidates:', 20, rowY);

  rowY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('1. Candidates must arrive at the examination center 30 minutes before commencement of paper.', 20, rowY);
  rowY += 5;
  doc.text('2. Roll Number Slips / Student ID Cards are mandatory for entry into examination rooms.', 20, rowY);
  rowY += 5;
  doc.text('3. Mobile phones, smartwatches, calculators, and unauthorized paper material are strictly prohibited.', 20, rowY);
  rowY += 5;
  doc.text('4. No student will be allowed to leave the examination hall before half time.', 20, rowY);

  // Signatures
  const sigY = 245;
  doc.line(25, sigY, 75, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Controller of Examinations', 30, sigY + 5);

  doc.line(135, sigY, 185, sigY);
  doc.text(principalName, 145, sigY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Principal / Head of Institution', 140, sigY + 9);

  safeSave(doc, `DateSheet_${safeStr(dateSheet?.id, 'exam')}.pdf`);
}

/**
 * Direct PDF Download for Official Fee Receipt
 */
export function downloadFeeReceiptPDF(school: School, payment: FeePayment, student?: Student) {
  const doc = initSafeDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210], // A5 size
  });

  const schoolName = safeStr(school?.name_en || (school as any)?.name, 'PAKISTAN EXCELLENCE SCHOOL');
  const schoolAddress = safeStr(school?.address, 'Main Campus, Pakistan');
  const schoolPhone = safeStr(school?.phone, '0300-0000000');

  const receiptNo = safeStr(payment?.receipt_number, 'RCPT-001');
  const amountPaid = safeNum(payment?.amount_paid, 0);
  const paymentDate = safeStr(payment?.payment_date, new Date().toISOString().split('T')[0]);
  const paymentMethod = safeStr(payment?.payment_method, 'Cash');
  const receivedBy = safeStr(payment?.received_by, 'School Cashier');

  // Border
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 132, 194);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(234, 88, 12);
  doc.text(schoolName, 74, 18, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(schoolAddress, 74, 23, { align: 'center' });
  doc.text(`Phone: ${schoolPhone} • Official Fee Collection Receipt`, 74, 27, { align: 'center' });

  doc.line(14, 31, 134, 31);

  // Receipt Number Banner
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 34, 120, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`OFFICIAL FEE RECEIPT: ${receiptNo}`, 74, 39.5, { align: 'center' });

  // Details
  const studentName = safeStr(student?.name, 'Enrolled Student');
  const fatherName = safeStr(student?.father_name, 'Guardian');
  const admNo = safeStr(student?.admission_number, 'ADM-2026-0001');

  let curY = 48;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Received with thanks from:', 14, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${studentName} (S/D of ${fatherName})`, 54, curY);

  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Admission Number:', 14, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(admNo, 54, curY);

  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Date:', 14, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentDate, 54, curY);

  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Channel:', 14, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${paymentMethod} ${payment?.transaction_ref ? `(Ref: ${payment.transaction_ref})` : ''}`, 54, curY);

  curY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Received By:', 14, curY);
  doc.setFont('helvetica', 'normal');
  doc.text(receivedBy, 54, curY);

  // Amount Box
  curY += 10;
  doc.setFillColor(240, 253, 244);
  doc.rect(14, curY, 120, 14, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.rect(14, curY, 120, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text('AMOUNT RECEIVED:', 18, curY + 9);
  doc.setFontSize(11);
  doc.text(`PKR ${amountPaid.toLocaleString()}/-`, 130, curY + 9, { align: 'right' });

  // Footer & Stamp
  curY = 160;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Thank you for prompt fee clearance. Keep this receipt for institutional records.', 74, curY, { align: 'center' });

  curY += 15;
  doc.line(18, curY, 55, curY);
  doc.text('Cashier / Accounts Officer', 20, curY + 4);

  doc.line(90, curY, 128, curY);
  doc.text('School Stamp & Seal', 96, curY + 4);

  safeSave(doc, `Receipt_${receiptNo}.pdf`);
}
