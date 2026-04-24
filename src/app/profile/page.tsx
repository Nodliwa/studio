'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/page-header';
import Greeter from '@/components/greeter';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteUser, updateProfile } from 'firebase/auth';
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
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      let w = img.width, h = img.height;
      if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
      else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
    };
    img.src = url;
  });
}

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

  const { control, handleSubmit, reset, formState: { isSubmitting, errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { knownAs: '', email: '', phone: '' }
  });

  useEffect(() => {
    if (!isAuthUserLoading && (!authUser || authUser.isAnonymous)) {
      router.push('/auth');
    }
  }, [authUser, isAuthUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      reset({
        knownAs: userProfile.knownAs || userProfile.displayName?.split(' ')[0] || '',
        email: userProfile.email || authUser?.email || '',
        phone: userProfile.phoneNumber || authUser?.phoneNumber || '',
      });
    } else if (authUser && !isProfileLoading) {
      reset({
        knownAs: authUser?.displayName?.split(' ')[0] || '',
        email: authUser?.email || '',
        phone: authUser?.phoneNumber || '',
      });
    }
  }, [userProfile, authUser, isProfileLoading, reset]);

  const getUserInitials = () => {
    const knownAs = userProfile?.knownAs?.trim();
    if (knownAs) return knownAs.charAt(0).toUpperCase();
    const displayName = userProfile?.displayName?.trim();
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (authUser?.displayName) return authUser.displayName.charAt(0).toUpperCase();
    return authUser?.email?.charAt(0).toUpperCase() || '?';
  };

  const getMemberSince = () => {
    const creationTime = authUser?.metadata?.creationTime;
    if (!creationTime) return 'Unknown';
    return new Date(creationTime).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        knownAs: data.knownAs,
        displayName: data.knownAs,
        ...(data.email && { email: data.email }),
        ...(data.phone && { phoneNumber: data.phone }),
      });
      if (authUser) {
        await updateProfile(authUser, { displayName: data.knownAs });
      }
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ variant: 'destructive', title: 'Update failed', description: 'Could not save your changes.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!authUser) return;
    try {
      await deleteUser(authUser);
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      let description = 'Could not delete your account. Please try again.';
      if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
        description = 'Please log out and log back in before deleting your account.';
      }
      toast({ variant: 'destructive', title: 'Deletion failed', description });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser || !userDocRef) return;
    try {
      const compressed = await compressImage(file);
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, 'profile-pictures/' + authUser.uid);
      const uploadTask = uploadBytesResumable(storageRef, compressed);
      uploadTask.on('state_changed',
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => {
          console.error('Upload failed:', error);
          setUploadProgress(null);
          toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not upload your photo.' });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(userDocRef, { photoURL: downloadURL });
          await updateProfile(authUser, { photoURL: downloadURL });
          setUploadProgress(null);
          toast({ title: 'Photo updated' });
        }
      );
    } catch (error) {
      console.error('Compression failed:', error);
      toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not process your photo.' });
    }
  };

  if (isAuthUserLoading || (isProfileLoading && !profileError)) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
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
              <h2 className="text-2xl font-semibold">My Profile</h2>
              <p className="text-muted-foreground mt-1">Manage your personal information.</p>
              <div className="mt-6 p-6 border rounded-lg">
                {(isAuthUserLoading || isProfileLoading) ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={userProfile?.photoURL || authUser?.photoURL || undefined} alt="Profile picture" />
                        <AvatarFallback className="text-3xl">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 h-7 w-7 rounded-full p-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadProgress !== null}
                      >+</Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 w-full">
                      {uploadProgress !== null && (
                        <div className="space-y-1">
                          <Label>Uploading...</Label>
                          <Progress value={uploadProgress} />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="knownAs">Known as</Label>
                        <Controller name="knownAs" control={control} render={({ field }) => <Input id="knownAs" {...field} />} />
                        {errors.knownAs && <p className="text-sm text-destructive">{errors.knownAs.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email {!authUser?.email && <span className="text-muted-foreground text-xs">(optional)</span>}</Label>
                        <Controller name="email" control={control} render={({ field }) => (
                          <Input id="email" type="email" placeholder="Add email address" {...field} disabled={!!authUser?.email} />
                        )} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone {!authUser?.phoneNumber && <span className="text-muted-foreground text-xs">(optional)</span>}</Label>
                        <Controller name="phone" control={control} render={({ field }) => (
                          <Input id="phone" type="tel" placeholder="Add phone number e.g. 0821234567" {...field} disabled={!!authUser?.phoneNumber} />
                        )} />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">Member since {getMemberSince()}</p>
                        <Button type="submit" disabled={isSubmitting || !isDirty}>
                          {isSubmitting ? 'Saving...' : 'Save changes'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-destructive">Danger zone</h2>
              <p className="text-muted-foreground mt-1">These actions are permanent and cannot be undone.</p>
              <div className="mt-6 p-6 border border-destructive rounded-lg bg-destructive/5 flex items-center justify-between">
                <div>
                  <Label className="font-semibold text-destructive">Delete account</Label>
                  <p className="text-sm text-destructive/80">Permanently delete your account and all associated data.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and all your plans.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteAccount}>
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
