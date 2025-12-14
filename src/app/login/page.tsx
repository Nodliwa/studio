
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateEmailSignIn, useUser } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/page-header';
import { signInWithEmailAndPassword } from 'firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

   useEffect(() => {
    // Redirect if a non-anonymous user is already logged in.
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/my-plans');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setFirebaseError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/my-plans');
    } catch (error) {
      if (error instanceof FirebaseError) {
        setFirebaseError(error.message);
      } else {
        setFirebaseError('An unexpected error occurred.');
      }
    }
  };

  // Prevent form flash while loading or redirecting
  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
          <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
       <div className="bg-background shadow-2xl min-h-full rounded-lg mx-auto">
        <PageHeader />
        <main className="flex items-center justify-center mx-auto px-40">
            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Access your celebration plans.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...register('password')} />
                    {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                </div>

                {firebaseError && <p className="text-destructive text-sm">{firebaseError}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="underline">
                        Sign up
                    </Link>
                </div>
            </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}
