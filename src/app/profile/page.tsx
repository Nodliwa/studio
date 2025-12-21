
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/page-header';
import Greeter from '@/components/greeter';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth, getSdks } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FirebaseError } from 'firebase/app';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';

const profileSchema = z.object({
    knownAs: z.string().min(1, 'This field is required'),
    displayName: z.string().min(1, 'This field is required'),
    email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const userDocRef = useMemoFirebase(() => 
        (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null,
    [firestore, authUser]);

    const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<AppUser>(userDocRef);

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

    const getUserInitials = () => {
        const knownAs = userProfile?.knownAs?.trim();
        if (knownAs) {
        return knownAs
            .split(' ')
            .map((word) => word[0].toUpperCase())
            .join('');
        }
        const displayName = userProfile?.displayName?.trim();
        if (displayName) {
        return displayName
            .split(' ')
            .map((word) => word[0].toUpperCase())
            .join('');
        }
        return authUser?.email?.charAt(0).toUpperCase() || '?';
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!userDocRef || !isDirty) return;
        
        try {
            await updateDoc(userDocRef, {
                knownAs: data.knownAs,
                displayName: data.displayName
            });

            toast({
                title: 'Profile Updated',
                description: 'Your changes have been saved successfully.',
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not save your changes. Please try again.',
            });
        }
    };
    
    const handlePasswordReset = async () => {
        if (!authUser?.email) return;
        try {
          await sendPasswordResetEmail(auth, authUser.email);
          toast({
            title: "Password Reset Email Sent",
            description: `A link to reset your password has been sent to ${authUser.email}.`,
          });
        } catch (error) {
          console.error("Error sending password reset email:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send password reset email. Please try again later.",
          });
        }
      };
    
      const handleDeleteAccount = async () => {
        if (!authUser) return;
        try {
          await deleteUser(authUser);
          toast({
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
          });
          router.push('/');
        } catch (error) {
          console.error("Error deleting account:", error);
          let description = "Could not delete your account. Please try again.";
          if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
            description = "This is a sensitive operation. Please log out and log back in before deleting your account.";
          }
          toast({
            variant: "destructive",
            title: "Deletion Failed",
            description,
          });
        }
      };
      
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !authUser || !userDocRef || !firestore) return;

        const { storage } = getSdks(auth.app);
        const storageRef = ref(storage, `profile-pictures/${authUser.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setUploadProgress(null);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "Your profile picture could not be uploaded.",
                });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await updateDoc(userDocRef, { photoURL: downloadURL });
                setUploadProgress(null);
                toast({
                    title: "Profile Picture Updated",
                });
            }
        );
    };

    if (isAuthUserLoading || (isProfileLoading && !profileError)) {
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
                    <div className="mt-8 max-w-2xl w-full mx-auto space-y-8">

                        <div>
                            <h2 className="text-2xl font-semibold font-headline">My Profile</h2>
                            <p className="text-muted-foreground mt-1">Manage your personal information.</p>
                            <div className="mt-6 p-6 border rounded-lg">
                                {(isAuthUserLoading || isProfileLoading) ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <Avatar className="h-24 w-24">
                                                <AvatarImage src={userProfile?.photoURL || authUser?.photoURL || undefined} alt="Profile picture" />
                                                <AvatarFallback className="text-3xl">{getUserInitials()}</AvatarFallback>
                                            </Avatar>
                                            <Button
                                                size="sm"
                                                className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadProgress !== null}
                                            >
                                                +
                                            </Button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/png, image/jpeg"
                                            />
                                        </div>

                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
                                            {uploadProgress !== null && (
                                                <div className="space-y-1">
                                                    <Label>Uploading...</Label>
                                                    <Progress value={uploadProgress} />
                                                </div>
                                            )}
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
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold font-headline">Account</h2>
                            <p className="text-muted-foreground mt-1">Manage your account settings.</p>
                            <div className="mt-6 p-6 border rounded-lg flex items-center justify-between">
                                <div>
                                    <Label className="font-semibold">Reset Password</Label>
                                    <p className="text-sm text-muted-foreground">Receive an email with a link to reset your password.</p>
                                </div>
                                <Button variant="outline" onClick={handlePasswordReset}>Send Email</Button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold font-headline text-destructive">Danger Zone</h2>
                            <p className="text-muted-foreground mt-1">These actions are permanent and cannot be undone.</p>
                            <div className="mt-6 p-6 border border-destructive rounded-lg bg-destructive/5 flex items-center justify-between">
                                 <div>
                                    <Label className="font-semibold text-destructive">Delete Account</Label>
                                    <p className="text-sm text-destructive/80">Permanently delete your account and all associated data.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete Account</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your account, your profile, and all of your plans.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive hover:bg-destructive/90"
                                                onClick={handleDeleteAccount}
                                            >
                                                Yes, delete my account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
