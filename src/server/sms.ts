import { db, SmsRecord } from './database.js';

export class SmsService {
  async sendPaymentReceipt(params: {
    phone: string;
    studentName: string;
    admissionNo: string;
    amount: number;
    mpesaRef: string;
    receiptNo: string;
    newBalance: number;
  }): Promise<SmsRecord> {
    const formattedPhone = params.phone.startsWith('+') ? params.phone : `+${params.phone}`;
    const textMessage = `Confirmed: KES ${params.amount.toLocaleString()} received for ${params.studentName} (${params.admissionNo}) via M-PESA ${params.mpesaRef}. New Term 1 Balance: KES ${params.newBalance.toLocaleString()}. Receipt: ${params.receiptNo}. Thank you. Nduluni High School Accounts.`;

    const smsRecord: SmsRecord = {
      id: `sms-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipientPhone: formattedPhone,
      recipientName: params.studentName,
      message: textMessage,
      status: 'DeliveredToTerminal',
      cost: 'KES 0.80',
      type: 'FEE_RECEIPT',
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    if (!(await db.addSmsLog(smsRecord))) throw new Error('Payment receipt could not be saved to the school ledger.');
    return smsRecord;
  }

  async sendAcademicAlert(params: {
    phone: string;
    studentName: string;
    meanGrade: string;
    totalPoints: number;
    overallRank: number;
  }): Promise<SmsRecord> {
    const formattedPhone = params.phone.startsWith('+') ? params.phone : `+${params.phone}`;
    const textMessage = `Nduluni High School: Term 1 2026 KCSE Assessment results for ${params.studentName} are published. Mean Grade: ${params.meanGrade} (${params.totalPoints} pts), Rank: #${params.overallRank}. Access full report card via portal. Closing: 10th Apr.`;

    const smsRecord: SmsRecord = {
      id: `sms-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipientPhone: formattedPhone,
      recipientName: params.studentName,
      message: textMessage,
      status: 'DeliveredToTerminal',
      cost: 'KES 0.80',
      type: 'ACADEMIC_ALERT',
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    if (!(await db.addSmsLog(smsRecord))) throw new Error('Academic alert could not be saved to the school ledger.');
    return smsRecord;
  }
}

export const smsService = new SmsService();
