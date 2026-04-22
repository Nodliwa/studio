"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUserData, useFirebase, useUser } from "@/firebase";
import { FirebaseError } from "firebase/app";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/page-header";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { initiateGoogleSignIn, initiateFacebookSignIn } from "@/firebase/auth-operations";
import { Eye, EyeOff, Loader2, Info } from "lucide-react";
import Script from "next/script";
import { verifyRecaptcha } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" {...props}>
    <linearGradient id="login-fb-grad-unique" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#2aa4f4"></stop>
      <stop offset="1" stopColor="#007ad9"></stop>
    </linearGradient>
    <path fill="url(#login-fb-grad-unique)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path>
    <path fill="#fff" d="M26.707,26.707v11.729h5.895V26.707h4.228l0.58-4.885h-4.808v-2.883c0-1.428,0.395-2.399,2.444-2.399h2.583v-4.364c-0.445-0.059-1.979-0.19-3.757-0.19c-3.717,0-6.257,2.272-6.257,6.425v3.411h-4.25v4.885h4.25V26.707z"></path>
  </svg>
);

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.612-3.512-11.284-8.285l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.551,44,29.869,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY || "";

function LoginPageInner() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isProcessingSocialSignIn, setIsProcessingSocialSignIn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const processSocialUser = async (userCredential: UserCredential) => {
    if (!firestore || !userCredential.user.email) return;
    const userRef = doc(firestore, "users", userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setUserData(
        userRef,
        userCredential.user.email,
        userCredential.user.displayName || "New User",
      );
    }
  };

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      const redirect = searchParams.get("redirect") || "/my-plans";
      router.push(redirect);
    }
  }, [user, isUserLoading, router, searchParams]);

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

  useEffect(() => {
    renderEnterpriseRecaptcha();
  }, []);

  const onEmailSubmit = async (data: LoginFormValues) => {
    if (!auth) return;
    setFirebaseError(null);

    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setFirebaseError("Please complete the reCAPTCHA challenge.");
      return;
    }

    try {
      if (RECAPTCHA_SITE_KEY && recaptchaToken) {
        const isVerified = await verifyRecaptcha(recaptchaToken);
        if (!isVerified) {
          setFirebaseError("reCAPTCHA verification failed. Please try again.");
          if (recaptchaWidgetId.current !== null) {
            (window as any).grecaptcha?.enterprise?.reset(recaptchaWidgetId.current);
          }
          setRecaptchaToken(null);
          return;
        }
      }
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        const friendlyMessages: Record<string, string> = {
          'auth/invalid-credential': 'Incorrect email or password. Please try again.',
          'auth/user-not-found': 'No account found with this email address.',
          'auth/wrong-password': 'Incorrect password. Please try again.',
          'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
          'auth/user-disabled': 'This account has been disabled.',
          'auth/invalid-email': 'Please enter a valid email address.',
        };
        setFirebaseError(friendlyMessages[error.code] || error.message);
      } else {
        setFirebaseError("An unexpected error occurred.");
      }
      if (recaptchaWidgetId.current !== null) {
        (window as any).grecaptcha?.enterprise?.reset(recaptchaWidgetId.current);
      }
      setRecaptchaToken(null);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setFirebaseError(null);
    setIsProcessingSocialSignIn(true);
    try {
      const userCredential = await initiateGoogleSignIn(auth);
      if (userCredential) {
        await processSocialUser(userCredential);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setFirebaseError("Could not complete Google sign-in. Please try again.");
    } finally {
      setIsProcessingSocialSignIn(false);
    }
  };

  const handleFacebookSignIn = async () => {
    if (!auth) return;
    setFirebaseError(null);
    setIsProcessingSocialSignIn(true);
    try {
      const userCredential = await initiateFacebookSignIn(auth);
      if (userCredential) {
        await processSocialUser(userCredential);
      }
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      setFirebaseError("Could not complete Facebook sign-in. Please try again.");
    } finally {
      setIsProcessingSocialSignIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth) return;
    setFirebaseError(null);
    setResetSentTo(null);
    const email = getValues("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setFirebaseError("Please enter your full email address in the field above to receive a reset link.");
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSentTo(email);
      toast({
        title: "Reset Link Sent",
        description: `Check your inbox (${email}) for a reset link. Note: There is no numeric code; simply click the link in the email.`,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof FirebaseError) {
        const friendlyMessages: Record<string, string> = {
          'auth/user-not-found': 'No account found with this email address.',
          'auth/invalid-email': 'Please enter a valid email address.',
          'auth/too-many-requests': 'Too many requests. Please wait a moment.',
        };
        setFirebaseError(friendlyMessages[error.code] || error.message);
      } else {
        setFirebaseError("An unexpected error occurred while sending the password reset email.");
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  if (isUserLoading || isProcessingSocialSignIn || (user && !user.isAnonymous)) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto flex items-center justify-center px-4 flex-grow mb-16">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Access your celebration plans.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || isSendingReset}
                  >
                    <GoogleIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={handleFacebookSignIn}
                    disabled={isSubmitting || isSendingReset}
                  >
                    <FacebookIcon />
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {resetSentTo && (
                  <Alert className="bg-primary/10 border-primary/20">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Check your email</AlertTitle>
                    <AlertDescription className="text-xs">
                      We've sent a reset link to <strong>{resetSentTo}</strong>.{" "}
                      Please click the link in that email to choose a new password.{" "}
                      <strong>Check your Spam folder</strong> if you don't see it within 2 minutes.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="your@email.com" />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={handlePasswordReset}
                        disabled={isSendingReset}
                      >
                        {isSendingReset ? "Sending..." : "Forgot Password?"}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                  </div>

                  {RECAPTCHA_SITE_KEY && (
                    <div className="flex justify-center">
                      <div ref={recaptchaContainerRef} />
                      <Script
                        src="https://www.google.com/recaptcha/enterprise.js"
                        strategy="afterInteractive"
                        onLoad={renderEnterpriseRecaptcha}
                      />
                    </div>
                  )}

                  {firebaseError && (
                    <p className="text-destructive text-sm font-medium border border-destructive/20 p-2 rounded bg-destructive/5">{firebaseError}</p>
                  )}

                  <div className="pb-6 pt-2">
                    <Button
                      type="submit"
                      className="w-full font-bold"
                      disabled={isSubmitting || isSendingReset || (!!RECAPTCHA_SITE_KEY && !recaptchaToken)}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                    <p className="mt-4 text-center text-sm">
                      Don't have an account?{" "}
                      <Link href="/register" className="underline font-bold">Sign up</Link>
                    </p>
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                      By continuing, you agree to our{" "}
                      <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginPageInner />
    </Suspense>
  );
}
