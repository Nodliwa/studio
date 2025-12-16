'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, initiateEmailSignUp, useUser, setUserData, useFirestore, initiateGoogleSignIn, handleGoogleRedirectResult, initiateFacebookSignIn, initiateTwitterSignIn } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { doc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';
import { useIsMobile } from '@/hooks/use-mobile';
import type { UserCredential } from 'firebase/auth';

const emailRegisterSchema = z.object({
  firstName: z.string().min(1, 'Known as is required'),
  lastName: z.string().min(1, 'Surname is required'),
  email: z.string().email('Invalid email address'),
  cellphone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  recaptcha: z.string().min(1, 'Please complete the reCAPTCHA'),
  consent: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions.",
  }),
});

const baseSchema = z.object({
    firstName: z.string().min(1, 'Known as is required'),
    lastName: z.string().min(1, 'Surname is required'),
    email: z.string().email('Invalid email address'),
    cellphone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    recaptcha: z.string().optional(),
    consent: z.boolean().optional(),
});


type RegisterFormValues = z.infer<typeof baseSchema>;

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.612-3.512-11.284-8.285l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.551,44,29.869,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props} width="20px" height="20px">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <linearGradient id="register-fb-grad-unique" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2aa4f4"></stop><stop offset="1" stopColor="#007ad9"></stop></linearGradient><path fill="url(#register-fb-grad-unique)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path><path fill="#fff" d="M26.707,26.707v11.729h5.895V26.707h4.228l0.58-4.885h-4.808v-2.883c0-1.428,0.395-2.399,2.444-2.399h2.583v-4.364c-0.445-0.059-1.979-0.19-3.757-0.19c-3.717,0-6.257,2.272-6.257,6.425v3.411h-4.25v4.885h4.25V26.707z"></path>
    </svg>
);


export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const isMobile = useIsMobile();
  const [isProcessingGoogleSignIn, setIsProcessingGoogleSignIn] = useState(true);


  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      consent: false,
    }
  });

  const processGoogleUser = async (userCredential: UserCredential) => {
    if (!firestore || !userCredential.user.email) return;
    const userRef = doc(firestore, 'users', userCredential.user.uid);
    // This will create the user document if it doesn't exist, or merge if it does.
    await setUserData(userRef, userCredential.user.email, userCredential.user.displayName || 'New User');
  };

  useEffect(() => {
    // This effect handles the result from a Google Sign-In redirect.
    if (!auth || !firestore) {
      // Services not ready yet.
      setIsProcessingGoogleSignIn(false);
      return;
    }
  
    handleGoogleRedirectResult(auth)
      .then((userCredential) => {
        if (userCredential) {
          // User has just returned from Google redirect. Process their info.
          processGoogleUser(userCredential);
          // The onAuthStateChanged listener in the next useEffect will handle the redirect.
        } else {
          // No user from redirect, so we're not in that flow.
          setIsProcessingGoogleSignIn(false);
        }
      })
      .catch((error) => {
        if (error instanceof FirebaseError) {
          setFirebaseError(error.message);
        } else {
          setFirebaseError('An unexpected error occurred during social sign-in.');
        }
        setIsProcessingGoogleSignIn(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, firestore]);


  useEffect(() => {
    // This is the primary redirect logic, relying on the live auth state.
    if (!isUserLoading && user && !user.isAnonymous) {
      // If we have a signed-in, non-anonymous user, they should be on the plans page.
      router.push('/my-plans');
    } else if (!isUserLoading && !user) {
        // If auth is loaded and there's no user, we can stop processing.
        setIsProcessingGoogleSignIn(false);
    }
  }, [user, isUserLoading, router]);


  const onSubmit = async (data: RegisterFormValues) => {
    if (!auth || !firestore) return;
    setFirebaseError(null);

    const validationResult = emailRegisterSchema.safeParse(data);
    if (!validationResult.success) {
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setValue('recaptcha', undefined);
        const { fieldErrors } = validationResult.error;
        if (fieldErrors.recaptcha) {
             setFirebaseError("Please complete the reCAPTCHA.");
        } else if (fieldErrors.consent) {
             setFirebaseError("You must accept the terms and conditions.");
        }
        return; 
    }
    
    try {
      const displayName = `${data.firstName} ${data.lastName}`;
      // onAuthStateChanged will handle the redirect after this completes
      const userCredential = await initiateEmailSignUp(auth, data.email, data.password, displayName);
      
      if (userCredential?.user) {
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        await setUserData(userRef, userCredential.user.email!, displayName);
      }
      
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('An unexpected error occurred during registration.');
      }
    } finally {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setValue('recaptcha', undefined);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'twitter') => {
    if (!auth) return;
    setFirebaseError(null);

    const signInFunction = {
        google: initiateGoogleSignIn,
        facebook: initiateFacebookSignIn,
        twitter: initiateTwitterSignIn,
    }[provider];

    try {
        const userCredential = await signInFunction(auth, isMobile);
        if (userCredential) {
            await processGoogleUser(userCredential);
        }
    } catch (error) {
        if (error instanceof FirebaseError) {
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                setFirebaseError(error.message);
            }
        } else {
            setFirebaseError(`An unexpected error occurred during ${provider} sign-in.`);
        }
    }
  };
  
  // Prevent UI flash while auth state is resolving or redirect is pending.
  if (isUserLoading || isProcessingGoogleSignIn || (user && !user.isAnonymous)) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
          <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 flex-grow mb-16">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle as="div" className="flex justify-between items-center">
                    <h2 className='text-2xl font-semibold leading-none tracking-tight'>Create Account</h2>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/login" className="font-bold">Login</Link>
                    </Button>
                </CardTitle>
                <CardDescription>Start planning your celebrations with SimpliPlan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialSignIn('google')}>
                            <GoogleIcon className="mr-2" /> Google
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialSignIn('facebook')}>
                            <FacebookIcon className="mr-2" /> Facebook
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialSignIn('twitter')}>
                            <XIcon className="mr-2" /> X
                        </Button>
                    </div>

                     <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Input id="firstName" placeholder="Known as" {...register('firstName')} />
                            {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                            <Input id="lastName" placeholder="Surname" {...register('lastName')} />
                            {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Input id="email" type="email" placeholder="Email" {...register('email')} />
                            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Input id="cellphone" type="tel" placeholder="Cellphone (Optional)" {...register('cellphone')} />
                        </div>
                        <div className="space-y-2">
                            <Input id="password" type="password" placeholder="Password" {...register('password')} />
                            {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                        </div>
                        
                         <div className="items-top flex space-x-2">
                            <Checkbox id="consent" {...register('consent')} onCheckedChange={(checked) => setValue('consent', checked as boolean, { shouldValidate: true })} />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                htmlFor="consent"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                I agree to the <Link href="/terms" className="underline">Terms & Conditions</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                                </label>
                                {errors.consent && <p className="text-destructive text-sm">{errors.consent.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                        {siteKey ? (
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={siteKey}
                                onChange={(token) => setValue('recaptcha', token || '', { shouldValidate: true })}
                            />
                        ) : (
                            <p className="text-destructive text-sm">reCAPTCHA site key is not configured.</p>
                        )}
                        {errors.recaptcha && <p className="text-destructive text-sm">{errors.recaptcha.message}</p>}
                        </div>

                        {firebaseError && <p className="text-destructive text-sm">{firebaseError}</p>}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                </div>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardContent>
            </Card>
            <div className="mt-8 max-w-md w-full text-center p-4 rounded-lg bg-muted/50 border">
                <h3 className="text-base font-semibold font-headline">Our Commitment to Your Privacy</h3>
                <p className="text-xs text-muted-foreground mt-2">
                    We collect only what's needed to create your account and save your plans. Your data is yours—we will never sell it. Everything is securely stored using Google's trusted services, and you are always in control of your information.
                </p>
                <p className="text-xs mt-2">
                    For full details, please read our <Link href="/privacy" className="underline">Privacy Policy</Link>.
                </p>
            </div>
        </main>
        </div>
    </div>
  );
}
