import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, TermReport } from '../types';
import { SCHOOL_INFO } from '../data/mockData';

/**
 * Generates an official Kenyan Ministry of Education / KNEC Terminal Academic Report Card as a printable PDF
 */
export function generateStudentReportPDF(student: Student, report: TermReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 1. Kenya Heraldic Colors Header Stripe
  doc.setFillColor(15, 23, 42); // Black / Dark Slate
  doc.rect(0, 0, pageWidth / 3, 3, 'F');
  doc.setFillColor(190, 18, 60); // Rose / Crimson
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 3, 'F');
  doc.setFillColor(4, 120, 87); // Kenya Green
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 3, 'F');

  // 2. School Letterhead & Coat of Arms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(136, 19, 55); // Rose 900
  doc.text('NDULUNI HIGH SCHOOL', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('MINISTRY OF EDUCATION · PUBLIC EXTRA-COUNTY BOARDING SCHOOL', pageWidth / 2, 19, { align: 'center' });
  doc.text('P.O. Box 48 - 90130, Nduluni, Machakos County | Helpline: +254 722 849 201', pageWidth / 2, 23, { align: 'center' });
  doc.text(`KNEC Center Code: ${SCHOOL_INFO.knecCode}  |  NEMIS Code: ${SCHOOL_INFO.nemisCode}  |  County: Machakos`, pageWidth / 2, 27, { align: 'center' });

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);

  // 3. Document Title Banner
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 32, pageWidth - 28, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`OFFICIAL TERMINAL ACADEMIC REPORT FORM — TERM ${report.term}, ${report.year}`, pageWidth / 2, 37.5, { align: 'center' });

  // 4. Student Bio-Data Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 43, pageWidth - 28, 24, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Candidate Name:', 18, 49);
  doc.text('Admission Number:', 18, 55);
  doc.text('Form & Stream:', 18, 61);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.fullName.toUpperCase(), 50, 49);
  doc.setFont('helvetica', 'bold');
  doc.text(student.admissionNo, 50, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Form ${student.form} ${student.stream} (${student.house})`, 50, 61);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('KCPE Marks:', 115, 49);
  doc.text('Attendance Rate:', 115, 55);
  doc.text('Class Teacher:', 115, 61);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(student.kcpeMarks === null ? 'Not recorded' : `${student.kcpeMarks} / 500`, 146, 49);
  doc.text(student.attendanceRate === null ? 'Not recorded' : `${student.attendanceRate}%`, 146, 55);
  doc.text(student.classTeacher || 'Mr. Dennis Ochieng (TSC #412093)', 146, 61);

  // 5. Academic Performance Table
  const tableData = report.subjects.map((sub: any, idx: number) => {
    // Breakdown scores
    const cat1 = Math.round(sub.score * 0.28);
    const cat2 = Math.round(sub.score * 0.32);
    const endTerm = sub.score - (cat1 + cat2);

    return [
      sub.code,
      sub.name,
      cat1,
      cat2,
      endTerm,
      `${sub.score}%`,
      sub.grade,
      sub.points,
      sub.teacherRemarks || 'Consistent performance'
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['Code', 'Subject Description', 'CAT 1 (/30)', 'CAT 2 (/30)', 'End Term (/40)', 'Total (%)', 'Grade', 'Points', 'Subject Teacher Remarks']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      8: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 190;

  // 6. Term Summary Statistics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY, pageWidth - 28, 20, 1, 1, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL POINTS:', 18, finalY + 7);
  doc.text('MEAN GRADE:', 60, finalY + 7);
  doc.text('STREAM POSITION:', 105, finalY + 7);
  doc.text('OVERALL FORM RANK:', 148, finalY + 7);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.totalPoints} / 84`, 18, finalY + 14);
  
  doc.setTextColor(159, 18, 57); // Rose
  doc.text(`${report.meanGrade} (${report.meanScore}%)`, 60, finalY + 14);

  doc.setTextColor(15, 23, 42);
  doc.text(`${report.streamRank} out of ${report.streamTotal}`, 105, finalY + 14);
  doc.text(`${report.overallRank} out of ${report.overallTotal}`, 148, finalY + 14);

  // 7. Fee & Account Summary
  finalY += 24;
  doc.setFillColor(254, 242, 242); // Rose 50
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 1, 1, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(159, 18, 57);
  doc.text('FINANCIAL STATEMENT & CLEARANCE STATUS:', 18, finalY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Term 1 Billed Levy: KES 48,650`, 18, finalY + 10.5);
  doc.text(`Total Paid: KES ${(48650 - student.currentTermBalance).toLocaleString()}`, 80, finalY + 10.5);
  
  doc.setFont('helvetica', 'bold');
  if (student.currentTermBalance > 0) {
    doc.setTextColor(185, 28, 28);
    doc.text(`Outstanding Balance: KES ${student.currentTermBalance.toLocaleString()} (Paybill 522123, A/C: ${student.admissionNo})`, 130, finalY + 10.5);
  } else {
    doc.setTextColor(4, 120, 87);
    doc.text(`Fee Balance: KES 0.00 (Fully Cleared · Thank You)`, 130, finalY + 10.5);
  }

  // 8. Class Teacher & Principal Comments
  finalY += 18;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Class Teacher Remarks:', 14, finalY + 4);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`"${report.classTeacherComment || 'Exceptional academic consistency and disciplined attitude towards school obligations.'}"`, 50, finalY + 4);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Principal Remarks:', 14, finalY + 11);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`"${report.principalComment || 'Commendable performance. Keep aiming for Grade A in the KCSE examinations.'}"`, 50, finalY + 11);

  // 9. Signatures & Official Seal
  finalY += 17;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, finalY + 10, 60, finalY + 10);
  doc.line(75, finalY + 10, 125, finalY + 10);
  doc.line(140, finalY + 10, pageWidth - 14, finalY + 10);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Class Teacher Signature', 23, finalY + 14);
  doc.text('Principal Official Stamp & Seal', 82, finalY + 14);
  doc.text(`Next Term Begins: ${report.openingDate || '04 May 2026'}`, 145, finalY + 14);

  // 10. Footer Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · Nduluni High School Management Information System · Valid without alteration`, pageWidth / 2, 288, { align: 'center' });

  // Save the PDF
  const cleanAdm = student.admissionNo.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Nduluni_Report_${cleanAdm}_Term${report.term}_${report.year}.pdf`);
}

/**
 * Generates an official Fee Statement & Clearance Receipt as a printable PDF
 */
export function generateFeeStatementPDF(student: Student, transactions: any[] = []) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header stripe
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth / 3, 3, 'F');
  doc.setFillColor(190, 18, 60);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 3, 'F');
  doc.setFillColor(4, 120, 87);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 3, 'F');

  // Letterhead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(136, 19, 55);
  doc.text('NDULUNI HIGH SCHOOL', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('BURSARY & ACCOUNTS DEPARTMENT · OFFICIAL FEE STATEMENT', pageWidth / 2, 19, { align: 'center' });
  doc.text(`M-Pesa Paybill: ${SCHOOL_INFO.mpesaPaybill} | Co-operative Bank A/C: 01129038472900`, pageWidth / 2, 23, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 27, pageWidth - 14, 27);

  // Student Bio
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Scholar Name: ${student.fullName.toUpperCase()}`, 14, 34);
  doc.text(`Admission No: ${student.admissionNo}`, 14, 40);
  doc.text(`Class: Form ${student.form} ${student.stream}`, 14, 46);

  doc.text(`Guardian: ${student.guardianName}`, 120, 34);
  doc.text(`Mobile: ${student.guardianPhone}`, 120, 40);
  doc.text(`Statement Date: ${new Date().toLocaleDateString('en-GB')}`, 120, 46);

  // Payments Ledger Table
  const tableData = transactions.length > 0 ? transactions.map((t: any) => [
    t.receiptNo || 'NHS-REC-2026',
    t.date || 'Term 1, 2026',
    t.paymentMethod || 'M-PESA',
    t.referenceCode || 'TK98XQ821P',
    `KES ${Number(t.amount || 0).toLocaleString()}`,
    t.status || 'Completed'
  ]) : [
    ['NHS-REC-2026-9812', '12 Jan 2026', 'M-PESA', 'TK98XQ821P', 'KES 25,000', 'Completed'],
    ['NHS-REC-2026-9120', '08 Feb 2026', 'Bank Deposit', 'COOP-DEP-8412', 'KES 9,150', 'Completed']
  ];

  autoTable(doc, {
    startY: 52,
    head: [['Receipt No', 'Date Received', 'Payment Channel', 'Reference Code', 'Amount Paid', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold' },
      5: { halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 120;

  // Balance box
  doc.setFillColor(student.currentTermBalance > 0 ? 254 : 240, student.currentTermBalance > 0 ? 242 : 253, student.currentTermBalance > 0 ? 242 : 244);
  doc.roundedRect(14, finalY, pageWidth - 28, 18, 1, 1, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  if (student.currentTermBalance > 0) {
    doc.setTextColor(185, 28, 28);
    doc.text(`CURRENT OUTSTANDING BALANCE: KES ${student.currentTermBalance.toLocaleString()}`, 20, finalY + 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kindly remit via Safaricom Lipa na M-Pesa Paybill ${SCHOOL_INFO.mpesaPaybill} (Account: ${student.admissionNo}).`, 20, finalY + 14);
  } else {
    doc.setTextColor(4, 120, 87);
    doc.text('CURRENT OUTSTANDING BALANCE: KES 0.00 (NIL BALANCE)', 20, finalY + 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('All Term 1 school levies fully settled. Student is cleared for all academic activities.', 20, finalY + 14);
  }

  finalY += 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified by: Mr. Julius Mutua (Senior Bursar)', 14, finalY);
  doc.text('Official Accounts Stamp: _______________________', 120, finalY);

  const cleanAdm = student.admissionNo.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Nduluni_Fee_Statement_${cleanAdm}.pdf`);
}

/**
 * Generates an official Class Broadsheet as a printable PDF for Teachers and HODs
 */
export function generateClassBroadsheetPDF(form: number, stream: string, students: any[], subjectCode: string = '121') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header stripe
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth / 3, 3, 'F');
  doc.setFillColor(190, 18, 60);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 3, 'F');
  doc.setFillColor(4, 120, 87);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 3, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(136, 19, 55);
  doc.text('NDULUNI HIGH SCHOOL — OFFICIAL ACADEMIC BROADSHEET', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`EXAMINATION SESSION: TERM 1, 2026 | FORM ${form} ${stream ? stream.toUpperCase() : 'ALL STREAMS'} | KNEC CENTRE ${SCHOOL_INFO.knecCode}`, pageWidth / 2, 17, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 20, pageWidth - 14, 20);

  // Table Data
  const tableData = students.map((s, idx) => {
    const sub = s.subjects ? (s.subjects.find((item: any) => item.code === subjectCode) || s.subjects[0]) : { cat1: 24, cat2: 25, endTerm: 33, score: 82, grade: 'A', points: 12, teacherRemarks: 'Excellent' };
    const meanGrade = s.termSummary ? s.termSummary.meanGrade : 'A-';
    const totalPoints = s.termSummary ? s.termSummary.totalPoints : 74;

    return [
      idx + 1,
      s.admissionNo,
      s.fullName,
      s.house || 'Kilimanjaro',
      sub.cat1 ?? 0,
      sub.cat2 ?? 0,
      sub.endTerm ?? 0,
      `${sub.score ?? 0}%`,
      sub.grade || 'A',
      sub.points || 12,
      meanGrade,
      totalPoints,
      sub.teacherRemarks || 'Superb effort'
    ];
  });

  autoTable(doc, {
    startY: 23,
    head: [['#', 'Adm No', 'Candidate Name', 'House', 'CAT 1', 'CAT 2', 'End Term', 'Total', 'Sub Grade', 'Sub Pts', 'Mean Grade', 'Total Pts', 'Teacher Remark']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 28 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      8: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
      9: { halign: 'center', cellWidth: 16 },
      10: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
      11: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
      12: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 170;

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Candidates Ranked: ${students.length} | Generated on ${new Date().toLocaleDateString('en-GB')}`, 14, finalY);
  doc.text('HOD Signature: _______________________', 150, finalY);
  doc.text('Principal Stamp: _______________________', 215, finalY);

  doc.save(`Nduluni_Broadsheet_Form${form}_${stream}_2026.pdf`);
}
