
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, setUserData, handleGoogleRedirectResult, useFirebase } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { signInWithEmailAndPassword, sendPasswordResetEmail, type UserCredential } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { initiateGoogleSignIn } from '@/firebase/auth-operations';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.612-3.512-11.284-8.285l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.551,44,29.869,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

export default function LoginPage() {
  const { auth, firestore, areServicesAvailable } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [isProcessingSocialSignIn, setIsProcessingSocialSignIn] = useState(true);
  const { toast } = useToast();

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
    const userRef = doc(firestore, 'users', userCredential.user.uid);
    // This will create the user document if it doesn't exist, or merge if it does.
    await setUserData(userRef, userCredential.user.email, userCredential.user.displayName || 'New User');
  };

  useEffect(() => {
    if (!areServicesAvailable) {
      return; // Wait for services to be ready.
    }
  
    // We only want to process the redirect result once, on initial load.
    if (isProcessingSocialSignIn) {
      handleGoogleRedirectResult(auth)
        .then((userCredential) => {
          if (userCredential) {
            // A user was returned from a redirect. Process them.
            // The main `useEffect` for `user` will handle the redirect to `/my-plans`.
            processSocialUser(userCredential);
          }
          // Whether a user was returned or not, we're done processing the redirect.
          setIsProcessingSocialSignIn(false);
        })
        .catch((error) => {
          if (error instanceof FirebaseError) {
            setFirebaseError(error.message);
          } else {
            setFirebaseError('An unexpected error occurred during social sign-in.');
          }
          setIsProcessingSocialSignIn(false);
        });
    }
  // We only want this to run once when services are available.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areServicesAvailable]); 

  useEffect(() => {
    // Redirect a logged-in user to their plans.
    // This runs whenever the user's auth state is confirmed.
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/my-plans');
    }
  }, [user, isUserLoading, router]);

  const onEmailSubmit = async (data: LoginFormValues) => {
    if (!auth) return;
    setFirebaseError(null);
    try {
      // onAuthStateChanged will handle the redirect
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('An unexpected error occurred.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setFirebaseError(null);
    setIsProcessingSocialSignIn(true);
    try {
        const userCredential = await initiateGoogleSignIn(auth, isMobile);
        if (userCredential) {
            // For popup sign-in, process the user immediately.
            await processSocialUser(userCredential);
        }
        // For redirect, the effect hook will handle it on page load.
    } catch (error) {
        if (error instanceof FirebaseError) {
            if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
                setFirebaseError(error.message);
            }
        } else {
            setFirebaseError('An unexpected error occurred during Google sign-in.');
        }
        setIsProcessingSocialSignIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth) return;
    setFirebaseError(null);
    const email = getValues('email');
    if (!email) {
      setFirebaseError('Please enter your email address to reset your password.');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, a password reset link has been sent to it.`,
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('An unexpected error occurred while sending the password reset email.');
      }
    }
  };

  // Only show the main loading indicator while the initial user state is being determined.
  // The page is still usable even if a social sign-in is processing in the background.
  if (isUserLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
          <p>Loading...</p>
      </div>
    );
  }

  // If a logged-in user somehow lands here, redirect them.
  if (user && !user.isAnonymous) {
     return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
          <p>Redirecting...</p>
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
                  <div className="flex justify-center">
                    <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={handleGoogleSignIn} disabled={isProcessingSocialSignIn}>
                        <GoogleIcon />
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

                    <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handlePasswordReset}>
                                Forgot Password?
                            </Button>
                        </div>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                    </div>

                    {firebaseError && <p className="text-destructive text-sm">{firebaseError}</p>}
                    
                     <div className="pb-6 pt-2 px-6">
                        <Button type="submit" className="w-full" disabled={isSubmitting || isProcessingSocialSignIn}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                         <div className="mt-4 text-center text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="underline">
                                Sign up
                            </Link>
                        </div>
                        <div className="mt-6 text-center text-xs text-muted-foreground">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-primary">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                        </div>
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
