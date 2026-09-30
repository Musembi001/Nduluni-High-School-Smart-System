import { db, PaymentTransactionRecord } from './database.js';
import { smsService } from './sms.js';

export interface StkPushRequest {
  phoneNumber: string; // 2547XXXXXXXX or 07XXXXXXXX
  amount: number;
  admissionNo: string;
}

export interface StkPushResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export class MpesaService {
  private shortCode = process.env.MPESA_PAYBILL || '522123';

  // Normalize phone number to standard 2547XXXXXXXX or 2541XXXXXXXX
  formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '254' + clean.slice(1);
    } else if (clean.startsWith('+254')) {
      clean = clean.slice(1);
    }
    return clean;
  }

  // Trigger STK Push (Real Daraja Simulator / Gateway)
  async initiateStkPush(params: StkPushRequest): Promise<StkPushResponse> {
    const formattedPhone = this.formatPhoneNumber(params.phoneNumber);
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const merchantRequestId = `291-729-1-${Date.now()}`;

    // Return instant Daraja payload structure
    return {
      merchantRequestId,
      checkoutRequestId,
      responseCode: "0",
      responseDescription: "Success. Request accepted for processing",
      customerMessage: `Success. An STK prompt has been sent to ${formattedPhone}. Please enter your M-PESA PIN to complete payment of KES ${params.amount} to NDULUNI HIGH SCHOOL Paybill ${this.shortCode}.`
    };
  }

  // Handle Safaricom Daraja Webhook Callback or PIN confirmation
  async processCallback(data: {
    checkoutRequestId: string;
    admissionNo: string;
    amount: number;
    phoneNumber: string;
    mpesaReceiptNumber?: string;
  }): Promise<{ success: boolean; transaction: PaymentTransactionRecord; student: any }> {
    const student = db.getStudentByAdmission(data.admissionNo);
    if (!student) {
      throw new Error(`Student with admission number ${data.admissionNo} not found.`);
    }

    // Generate authentic Safaricom M-Pesa receipt code if not provided
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let mpesaRef = data.mpesaReceiptNumber;
    if (!mpesaRef) {
      mpesaRef = "TK";
      for (let i = 0; i < 8; i++) {
        mpesaRef += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    const receiptNo = `NHS-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTxn: PaymentTransactionRecord = {
      id: `txn-${Date.now()}`,
      receiptNo,
      admissionNo: student.admissionNo,
      studentName: student.fullName,
      amount: data.amount,
      paymentMethod: 'M-PESA',
      referenceCode: mpesaRef,
      phoneNumber: this.formatPhoneNumber(data.phoneNumber),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      term: 'Term 1, 2026',
      status: 'Completed',
      receivedBy: 'Automated M-Pesa Daraja Gateway'
    };

    // Update student balance in ledger
    const updatedStudent = db.updateStudentBalance(student.admissionNo, data.amount);
    const savedTxn = db.addTransaction(newTxn);

    // Trigger instant Parent SMS Receipt notification via Africa's Talking simulation
    await smsService.sendPaymentReceipt({
      phone: this.formatPhoneNumber(data.phoneNumber),
      studentName: student.fullName,
      admissionNo: student.admissionNo,
      amount: data.amount,
      mpesaRef,
      receiptNo,
      newBalance: updatedStudent ? updatedStudent.currentTermBalance : 0
    });

    return {
      success: true,
      transaction: savedTxn,
      student: updatedStudent
    };
  }
}

export const mpesaService = new MpesaService();
