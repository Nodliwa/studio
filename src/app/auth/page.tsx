"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { initiateGoogleSignIn } from "@/firebase/auth-operations";
import { verifyRecaptcha } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Loader2, CheckCircle } from "lucide-react";
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

type Step = "input" | "otp" | "register";
type ContactType = "phone" | "email";
type SendStatus = "idle" | "sending" | "sent_phone" | "sent_email" | "error";

const isPhone = (val: string) => /^(\+27|0)[6-8][0-9]{8}$/.test(val.trim().replace(/\s/g, ""));
const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
const isValidContact = (val: string) => isPhone(val) || isEmail(val);

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, "").replace(/^27/, "0");
  return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
};

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
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
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
      if (user && !user.isAnonymous && step !== "register") {
        const redirect = searchParams.get("redirect") || "/my-plans";
        router.push(redirect);
      }
    });
    return () => unsub();
  }, [auth, router, searchParams, step]);

  useEffect(() => {
    if (!auth) return;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = localStorage.getItem("emailForSignIn");
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            localStorage.removeItem("emailForSignIn");
            if (result.additionalUserInfo?.isNewUser) {
              setStep("register");
            } else {
              const redirect = searchParams.get("redirect") || "/my-plans";
              router.push(redirect);
            }
          })
          .catch(() => setError("Invalid or expired link. Please try again."));
      }
    }
  }, [auth]);

  useEffect(() => {
    if (step === "register") {
      setTimeout(() => renderEnterpriseRecaptcha(), 500);
    }
  }, [step]);

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

  const saveUserToFirestore = async (user: any, displayName: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email || "",
        displayName: displayName || user.displayName || "",
        knownAs: (displayName || user.displayName || "").split(" ")[0],
        phoneNumber: user.phoneNumber || "",
      }, { merge: true });
    }
  };

  const handleContactBlur = async () => {
    if (!contact.trim() || !isValidContact(contact)) {
      if (contact.trim() && !isValidContact(contact)) {
        setContactError("Enter a valid SA number (e.g. 0821234567) or email address");
      }
      return;
    }
    setContactError("");
    await handleAutoSend(contact);
  };

  const handleAutoSend = async (contactVal: string) => {
    if (!auth) return;
    setSendStatus("sending");
    setError("");
    const detectedPhone = isPhone(contactVal);
    setContactType(detectedPhone ? "phone" : "email");
    try {
      if (detectedPhone) {
        if (phoneRecaptchaRef.current) phoneRecaptchaRef.current.clear();
        const recaptchaVerifier = new RecaptchaVerifier(auth, "phone-recaptcha-container", { size: "invisible" });
        phoneRecaptchaRef.current = recaptchaVerifier;
        const formatted = contactVal.trim().startsWith("+") ? contactVal.trim() : `+27${contactVal.trim().replace(/^0/, "")}`;
        const result = await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
        setConfirmationResult(result);
        setSendStatus("sent_phone");
        // Auto-navigate to OTP screen after 2 seconds
        setTimeout(() => setStep("otp"), 2000);
      } else {
        localStorage.setItem("emailForSignIn", contactVal.trim());
        await sendSignInLinkToEmail(auth, contactVal.trim(), {
          url: "https://simpliplan.co.za/auth",
          handleCodeInApp: true,
        });
        setSendStatus("sent_email");
      }
    } catch (e: any) {
      const msgs: Record<string, string> = {
        "auth/invalid-phone-number": "Invalid phone number. Use format: 0821234567",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
        "auth/invalid-email": "Invalid email address.",
      };
      setError(msgs[e.code] || e.message);
      setSendStatus("error");
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
        if (result.additionalUserInfo?.isNewUser) {
          setStep("register");
        } else {
          const redirect = searchParams.get("redirect") || "/my-plans";
          router.push(redirect);
        }
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

  const handleCompleteRegistration = async () => {
    if (!auth?.currentUser) return;
    setError("");
    if (!name.trim() || name.trim().length < 2) { setError("Please enter your name."); return; }
    if (!consentGiven) { setError("Please accept the Terms & Conditions."); return; }
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) { setError("Please complete the reCAPTCHA challenge."); return; }
    if (RECAPTCHA_SITE_KEY && recaptchaToken) {
      const verified = await verifyRecaptcha(recaptchaToken);
      if (!verified) { setError("reCAPTCHA failed. Please try again."); return; }
    }
    setIsLoading(true);
    try {
      await saveUserToFirestore(auth.currentUser, name.trim());
      const redirect = searchParams.get("redirect") || "/my-plans";
      router.push(redirect);
    } catch (e: any) {
      setError("Something went wrong. Please try again.");
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
        await saveUserToFirestore(result.user, result.user.displayName || "");
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
          <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg px-3 py-8 space-y-6 overflow-visible">

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                {step === "register" ? "Almost there! 👋" :
                 step === "otp" ? "Enter OTP" :
                 "Welcome to SimpliPlan"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {step === "register" ? "Just a few more details to get you started" :
                 step === "otp" ? `We sent a 6-digit code to ${formatPhone(contact)}` :
                 "Plan every moment that matters"}
              </p>
            </div>

            {/* Step 1 — Contact only */}
            {step === "input" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-3 h-12 text-sm font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || sendStatus === "sending"}
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

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="0821234567 or you@email.com"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        setContactError("");
                        setSendStatus("idle");
                      }}
                      onBlur={handleContactBlur}
                      onKeyDown={(e) => { if (e.key === "Enter" && isValidContact(contact)) handleAutoSend(contact); }}
                      disabled={sendStatus === "sending" || sendStatus === "sent_phone" || sendStatus === "sent_email"}
                      className={contactError ? "border-destructive pr-16" : "pr-16"}
                    />
                    {sendStatus === "sending" ? (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    ) : sendStatus === "idle" && contact && isValidContact(contact) ? (
                      <button onClick={() => handleAutoSend(contact)} className="absolute right-2 top-1.5 h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors z-10 shadow-md">
                        <span className="text-base font-bold">→</span>
                      </button>
                    ) : null}
                    {(sendStatus === "sent_phone" || sendStatus === "sent_email") && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                  </div>

                  {contactError && <p className="text-xs text-destructive">{contactError}</p>}

                  {sendStatus === "sending" && (
                    <p className="text-xs text-muted-foreground animate-pulse">Sending...</p>
                  )}

                  {sendStatus === "sent_phone" && (
                    <p className="text-xs text-green-600 font-medium">
                      ✅ OTP sent to {formatPhone(contact)} — redirecting...
                    </p>
                  )}

                  {sendStatus === "sent_email" && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-primary font-medium">
                        ✅ Link sent to {contact}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check your inbox and spam folder. Click the link to sign in.
                      </p>
                    </div>
                  )}

                  {sendStatus === "error" && error && (
                    <p className="text-xs text-destructive font-medium bg-destructive/5 border border-destructive/20 p-2 rounded">{error}</p>
                  )}

                  {sendStatus === "error" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { setSendStatus("idle"); setError(""); }}
                    >
                      Try again
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Step 2 — OTP */}
            {step === "otp" && (
              <>
                <Input
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono h-14"
                  disabled={isLoading}
                  inputMode="numeric"
                  autoFocus
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
                <Button variant="ghost" className="w-full" onClick={() => { setStep("input"); setOtp(""); setError(""); setSendStatus("idle"); }}>
                  ← Back
                </Button>
              </>
            )}

            {/* Step 3 — New user registration */}
            {step === "register" && (
              <>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                  autoFocus
                />

                {RECAPTCHA_SITE_KEY && (
                  <div className="w-full flex justify-center">
                    <div className="scale-[0.85] origin-center">
                      <div ref={recaptchaContainerRef} />
                      <Script
                        src="https://www.google.com/recaptcha/enterprise.js"
                        strategy="afterInteractive"
                        onLoad={renderEnterpriseRecaptcha}
                      />
                    </div>
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
                  onClick={handleCompleteRegistration}
                  disabled={isLoading || name.trim().length < 2 || !consentGiven || (!!RECAPTCHA_SITE_KEY && !recaptchaToken)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Setting up..." : "Let's Go! 🎉"}
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