
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/page-header';
import Greeter from '@/components/greeter';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
    knownAs: z.string().min(1, 'This field is required'),
    displayName: z.string().min(1, 'This field is required'),
    email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => 
        (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null,
    [firestore, authUser]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userDocRef);

    const { 
        control, 
        handleSubmit, 
        reset,
        formState: { isSubmitting, errors, isDirty }
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            knownAs: '',
            displayName: '',
            email: '',
        }
    });

    useEffect(() => {
        if (!isAuthUserLoading && (!authUser || authUser.isAnonymous)) {
            router.push('/login');
        }
    }, [authUser, isAuthUserLoading, router]);

    useEffect(() => {
        if (userProfile) {
            reset({
                knownAs: userProfile.knownAs || '',
                displayName: userProfile.displayName || '',
                email: userProfile.email || '',
            });
        }
    }, [userProfile, reset]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!userDocRef) return;
        
        try {
            updateDocumentNonBlocking(userDocRef, {
                knownAs: data.knownAs,
                displayName: data.displayName
            });
            toast({
                title: 'Profile Updated',
                description: 'Your changes have been saved successfully.',
            });
             reset(data); // Resets the form's dirty state
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not save your changes. Please try again.',
            });
        }
    };

    if (isAuthUserLoading || isProfileLoading) {
        return (
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen w-full bg-secondary">
            <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
                <PageHeader />
                <main className="container mx-auto px-4 flex-grow flex flex-col mb-16">
                    <Greeter />
                    <div className="mt-8 max-w-2xl w-full mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Profile</CardTitle>
                                <CardDescription>Manage your personal information and account settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(isAuthUserLoading || isProfileLoading) ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="knownAs">Known As</Label>
                                            <Controller
                                                name="knownAs"
                                                control={control}
                                                render={({ field }) => <Input id="knownAs" {...field} />}
                                            />
                                            {errors.knownAs && <p className="text-sm text-destructive">{errors.knownAs.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Full Name</Label>
                                            <Controller
                                                name="displayName"
                                                control={control}
                                                render={({ field }) => <Input id="displayName" {...field} />}
                                            />
                                            {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Controller
                                                name="email"
                                                control={control}
                                                render={({ field }) => <Input id="email" type="email" {...field} disabled />}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={isSubmitting || !isDirty}>
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
