import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

const MAX_ATTEMPTS = 3;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const otpRef = db.collection('email_otps').doc(email.toLowerCase());
    const otpSnap = await otpRef.get();

    if (!otpSnap.exists) {
      return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 404 });
    }

    const data = otpSnap.data()!;
    const now = Date.now();
    const expiresAt = data.expiresAt?.toMillis() || 0;
    const attempts = data.attempts || 0;

    if (attempts >= MAX_ATTEMPTS) {
      await otpRef.delete();
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 429 });
    }

    if (now > expiresAt) {
      await otpRef.delete();
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 410 });
    }

    if (data.otp !== otp.trim()) {
      await otpRef.update({ attempts: FieldValue.increment(1) });
      const remaining = MAX_ATTEMPTS - attempts - 1;
      return NextResponse.json({ error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` }, { status: 400 });
    }

    await otpRef.delete();

    const adminAuth = getAuth(adminApp);
    let uid: string;
    let isNewUser = false;

    try {
      const userRecord = await adminAuth.getUserByEmail(email.toLowerCase());
      uid = userRecord.uid;
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        const newUser = await adminAuth.createUser({ email: email.toLowerCase() });
        uid = newUser.uid;
        isNewUser = true;
      } else {
        throw err;
      }
    }

    const customToken = await adminAuth.createCustomToken(uid);
    return NextResponse.json({ success: true, customToken, isNewUser });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
