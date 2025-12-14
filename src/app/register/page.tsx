
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateEmailSignUp, useUser, setUserData, useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { doc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  cellphone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  recaptcha: z.string().min(1, 'Please complete the reCAPTCHA'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/my-plans');
    }
  }, [user, isUserLoading, router]);


  const onSubmit = async (data: RegisterFormValues) => {
    setFirebaseError(null);
    try {
      const displayName = `${data.firstName} ${data.lastName}`;
      const userCredential = await initiateEmailSignUp(auth, data.email, data.password, displayName);
      
      if (userCredential?.user) {
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        await setUserData(userRef, userCredential.user.email!, displayName);
        router.push('/my-plans');
      }
      
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('An unexpected error occurred during registration.');
      }
    } finally {
        recaptchaRef.current?.reset();
        setValue('recaptcha', '');
    }
  };
  
    if (isUserLoading || (user && !user.isAnonymous)) {
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
        <main className="container mx-auto flex items-center justify-center px-4 flex-grow mb-16">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle as="h2">Create an Account</CardTitle>
                <CardDescription>Start planning your celebrations with SimpliPlan.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cellphone">Cellphone (Optional)</Label>
                    <Input id="cellphone" type="tel" {...register('cellphone')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...register('password')} />
                    {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
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
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardContent>
            </Card>
        </main>
        </div>
    </div>
  );
}
