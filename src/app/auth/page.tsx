"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, fetchSignInMethodsForEmail, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { initiateGoogleSignIn } from "@/firebase/auth-operations";
import { verifyRecaptcha } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Loader2 } from "lucide-react";
import Script from "next/script";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY || "";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.612-3.512-11.284-8.285l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.551,44,29.869,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

type Step = "input" | "otp";
type ContactType = "phone" | "email";

// Validation helpers
const isPhone = (val: string) => /^(\+27|0)[6-8][0-9]{8}$/.test(val.trim().replace(/\s/g, ""));
const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
const isValidContact = (val: string) => isPhone(val) || isEmail(val);

function AuthPageInner() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("input");
  const [contactType, setContactType] = useState<ContactType>("phone");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const phoneRecaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        const redirect = searchParams.get("redirect") || "/my-plans";
        router.push(redirect);
      }
    });
    return () => unsub();
  }, [auth, router, searchParams]);

  useEffect(() => {
    if (!auth) return;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = localStorage.getItem("emailForSignIn");
      const savedName = localStorage.getItem("nameForSignIn");
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            localStorage.removeItem("emailForSignIn");
            localStorage.removeItem("nameForSignIn");
            await saveUserToFirestore(result.user, savedEmail, savedName || "");
            const redirect = searchParams.get("redirect") || "/my-plans";
            router.push(redirect);
          })
          .catch(() => setError("Invalid or expired link. Please try again."));
      }
    }
  }, [auth]);

  const renderEnterpriseRecaptcha = () => {
    if (!RECAPTCHA_SITE_KEY || !recaptchaContainerRef.current) return;
    if (recaptchaWidgetId.current !== null) return;
    const enterprise = (window as any).grecaptcha?.enterprise;
    if (!enterprise) return;
    enterprise.ready(() => {
      if (!recaptchaContainerRef.current || recaptchaWidgetId.current !== null) return;
      recaptchaWidgetId.current = enterprise.render(recaptchaContainerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (token: string) => setRecaptchaToken(token),
        "expired-callback": () => setRecaptchaToken(null),
        "error-callback": () => setRecaptchaToken(null),
      });
    });
  };

  useEffect(() => { renderEnterpriseRecaptcha(); }, []);

  const saveUserToFirestore = async (user: any, email: string, displayName: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: email || user.email || "",
        displayName: displayName || user.displayName || "",
        knownAs: (displayName || user.displayName || "").split(" ")[0],
        phoneNumber: user.phoneNumber || "",
      }, { merge: true });
    }
  };

  const handleContactBlur = () => {
    if (!contact.trim()) { setContactError(""); return; }
    if (!isValidContact(contact)) {
      setContactError("Enter a valid SA number (e.g. 0821234567) or email address");
    } else {
      setContactError("");
    }
  };

  const handleSendOTP = async () => {
    if (!auth) return;
    setError("");

    if (!contact.trim()) { setError("Please enter your cell number or email."); return; }
    if (!isValidContact(contact)) { setError("Enter a valid SA number (e.g. 0821234567) or email address."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (name.trim().length < 2) { setError("Please enter at least 2 characters for your name."); return; }
    if (!consentGiven) { setError("Please accept the Terms & Conditions."); return; }
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) { setError("Please complete the reCAPTCHA challenge."); return; }
    if (RECAPTCHA_SITE_KEY && recaptchaToken) {
      const verified = await verifyRecaptcha(recaptchaToken);
      if (!verified) { setError("reCAPTCHA failed. Please try again."); return; }
    }

    setIsLoading(true);
    const detectedPhone = isPhone(contact);
    setContactType(detectedPhone ? "phone" : "email");

    try {
      if (detectedPhone) {
        if (phoneRecaptchaRef.current) phoneRecaptchaRef.current.clear();
        const recaptchaVerifier = new RecaptchaVerifier(auth, "phone-recaptcha-container", { size: "invisible" });
        phoneRecaptchaRef.current = recaptchaVerifier;
        const formatted = contact.trim().startsWith("+") ? contact.trim() : `+27${contact.trim().replace(/^0/, "")}`;
        const result = await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
        setConfirmationResult(result);
        setStep("otp");
      } else {
        const methods = await fetchSignInMethodsForEmail(auth, contact.trim());
        if (methods.length === 0) setIsNewUser(true);
        localStorage.setItem("emailForSignIn", contact.trim());
        localStorage.setItem("nameForSignIn", name.trim());
        await sendSignInLinkToEmail(auth, contact.trim(), {
          url: `${window.location.origin}/auth`,
          handleCodeInApp: true,
        });
        setStep("otp");
      }
    } catch (e: any) {
      const msgs: Record<string, string> = {
        "auth/invalid-phone-number": "Invalid phone number. Use format: 0821234567",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
        "auth/invalid-email": "Invalid email address.",
      };
      setError(msgs[e.code] || e.message);
      if (recaptchaWidgetId.current !== null) {
        (window as any).grecaptcha?.enterprise?.reset(recaptchaWidgetId.current);
      }
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!auth) return;
    setError("");
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
    if (otp.trim().length !== 6) { setError("OTP must be 6 digits."); return; }
    if (!/^\d{6}$/.test(otp.trim())) { setError("OTP must contain numbers only."); return; }
    setIsLoading(true);
    try {
      if (contactType === "phone" && confirmationResult) {
        const result = await confirmationResult.confirm(otp.trim());
        await saveUserToFirestore(result.user, result.user.email || "", name);
        const redirect = searchParams.get("redirect") || "/my-plans";
        router.push(redirect);
      } else {
        setError("Please check your email for a sign-in link and click it.");
      }
    } catch (e: any) {
      const msgs: Record<string, string> = {
        "auth/invalid-verification-code": "Incorrect OTP. Please try again.",
        "auth/code-expired": "OTP expired. Please request a new one.",
      };
      setError(msgs[e.code] || e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    setError("");
    try {
      const result = await initiateGoogleSignIn(auth);
      if (result) {
        await saveUserToFirestore(result.user, result.user.email || "", result.user.displayName || "");
      }
    } catch (e: any) {
      setError("Could not complete Google sign-in. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto flex items-center justify-center px-4 flex-grow mb-16">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 space-y-6">

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                {step === "otp"
                  ? contactType === "phone" ? "Enter OTP" : "Check your email"
                  : "Welcome to SimpliPlan"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {step === "otp"
                  ? contactType === "phone"
                    ? `We sent a 6-digit code to ${contact}`
                    : `We sent a sign-in link to ${contact}. Click the link in your email.`
                  : "Plan every moment that matters"}
              </p>
            </div>

            {step === "input" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-3 h-12 text-sm font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Input
                    placeholder="0821234567 or you@email.com"
                    value={contact}
                    onChange={(e) => { setContact(e.target.value); setContactError(""); }}
                    onBlur={handleContactBlur}
                    disabled={isLoading}
                    className={contactError ? "border-destructive" : ""}
                  />
                  {contactError && <p className="text-xs text-destructive">{contactError}</p>}
                  {!contactError && contact && isValidContact(contact) && (
                    <p className="text-xs text-muted-foreground">
                      {isPhone(contact) ? "📱 We'll send an SMS OTP" : "📧 We'll send a sign-in link"}
                    </p>
                  )}
                </div>

                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />

                {RECAPTCHA_SITE_KEY && (
                  <div className="flex justify-center overflow-hidden w-full">
                    <div ref={recaptchaContainerRef} />
                    <Script
                      src="https://www.google.com/recaptcha/enterprise.js"
                      strategy="afterInteractive"
                      onLoad={renderEnterpriseRecaptcha}
                    />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="underline text-primary">Terms & Conditions</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="underline text-primary">Privacy Policy</Link>
                  </label>
                </div>

                {error && <p className="text-destructive text-sm font-medium bg-destructive/5 border border-destructive/20 p-2 rounded">{error}</p>}

                <Button
                  className="w-full h-12 font-bold"
                  onClick={handleSendOTP}
                  disabled={isLoading || (!!RECAPTCHA_SITE_KEY && !recaptchaToken) || !consentGiven}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            )}

            {step === "otp" && contactType === "phone" && (
              <>
                <Input
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono h-14"
                  disabled={isLoading}
                  inputMode="numeric"
                />

                {error && <p className="text-destructive text-sm font-medium bg-destructive/5 border border-destructive/20 p-2 rounded">{error}</p>}

                <Button
                  className="w-full h-12 font-bold"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setStep("input"); setOtp(""); setError(""); }}
                >
                  ← Back
                </Button>
              </>
            )}

            {step === "otp" && contactType === "email" && (
              <>
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">📧</div>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to sign in. You can close this tab.
                  </p>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setStep("input"); setError(""); }}
                >
                  ← Try again
                </Button>
              </>
            )}

            <div id="phone-recaptcha-container" />

          </div>
        </main>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthPageInner />
    </Suspense>
  );
}