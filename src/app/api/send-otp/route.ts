import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@simpliplan.co.za';
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RATE_LIMIT_MS = 2 * 60 * 1000;

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-1406892914-3d877',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const db = getFirestore(getAdminApp());
    const otpRef = db.collection('email_otps').doc(email.toLowerCase());
    const existing = await otpRef.get();

    if (existing.exists) {
      const data = existing.data()!;
      const now = Date.now();
      const createdAt = data.createdAt?.toMillis() || 0;
      if (now - createdAt < RATE_LIMIT_MS) {
        const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - createdAt)) / 1000);
        return NextResponse.json({ error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` }, { status: 429 });
      }
    }

    const otp = generateOTP();

    await otpRef.set({
      otp,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + OTP_EXPIRY_MS)),
      createdAt: FieldValue.serverTimestamp(),
      attempts: 0,
    });

    const { error } = await resend.emails.send({
      from: `SimpliPlan <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Your SimpliPlan sign-in code',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px"><h2 style="color:#00A693;text-align:center">SimpliPlan</h2><p>Your sign-in code is:</p><div style="text-align:center;margin:32px 0"><span style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#00A693">${otp}</span></div><p style="color:#666;font-size:14px">This code expires in <strong>5 minutes</strong>.</p><p style="color:#666;font-size:14px">If you did not request this, ignore this email.</p></div>`,
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send OTP error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
