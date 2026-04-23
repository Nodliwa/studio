import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { initializeFirebase } from '@/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@simpliplan.co.za';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes between requests
const MAX_ATTEMPTS = 3;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const otpRef = doc(collection(firestore, 'email_otps'), email.toLowerCase());
    const existing = await getDoc(otpRef);

    if (existing.exists()) {
      const data = existing.data();
      const now = Date.now();
      const createdAt = (data.createdAt as Timestamp)?.toMillis() || 0;

      // Rate limit check
      if (now - createdAt < RATE_LIMIT_MS) {
        const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - createdAt)) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSeconds} seconds before requesting a new OTP.` },
          { status: 429 }
        );
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await setDoc(otpRef, {
      otp,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      attempts: 0,
    });

    const { error } = await resend.emails.send({
      from: `SimpliPlan <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Your SimpliPlan sign-in code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; bor
mkdir -p ./src/app/api/verify-otp && cat > ./src/app/api/verify-otp/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, doc, getDoc, updateDoc, deleteDoc, increment, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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

    const { firestore } = initializeFirebase();
    const otpRef = doc(collection(firestore, 'email_otps'), email.toLowerCase());
    const otpSnap = await getDoc(otpRef);

    if (!otpSnap.exists()) {
      return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 404 });
    }

    const data = otpSnap.data();
    const now = Date.now();
    const expiresAt = (data.expiresAt as Timestamp)?.toMillis() || 0;
    const attempts = data.attempts || 0;

    // Check max attempts
    if (attempts >= MAX_ATTEMPTS) {
      await deleteDoc(otpRef);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Check expiry
    if (now > expiresAt) {
      await deleteDoc(otpRef);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 410 });
    }

    // Check OTP
    if (data.otp !== otp.trim()) {
      await updateDoc(otpRef, { attempts: increment(1) });
      const remaining = MAX_ATTEMPTS - attempts - 1;
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      );
    }

    // OTP is valid — delete it and create custom token
    await deleteDoc(otpRef);

    // Check if user exists in Firebase Auth
    const adminApp = getAdminApp();
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
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
