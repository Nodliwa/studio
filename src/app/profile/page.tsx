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
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  knownAs: z.string().min(1, 'This field is required'),
  secondaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  secondaryPhone: z.string().optional().or(z.literal('')),
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

function getDiceBearUrl(seed: string) {
  return 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(seed);
}

function getProviderLabel(providerId: string) {
  if (providerId === 'google.com') return 'Google';
  if (providerId === 'phone') return 'Mobile';
  if (providerId === 'password') return 'Email';
  return providerId;
}

export default function ProfilePage() {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const userDocRef = useMemoFirebase(() =>
    (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null,
    [firestore, authUser]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<AppUser>(userDocRef);

  const { control, handleSubmit, reset, formState: { isSubmitting, errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { knownAs: '', secondaryEmail: '', secondaryPhone: '' }
  });

  const primaryProvider = authUser?.providerData?.[0]?.providerId || 'phone';
  const isPrimaryPhone = primaryProvider === 'phone';
  const isPrimaryEmail = primaryProvider === 'password';
  const isPrimaryGoogle = primaryProvider === 'google.com';

  const primaryContact = isPrimaryPhone
    ? (authUser?.phoneNumber || '')
    : isPrimaryGoogle
    ? (authUser?.email || authUser?.displayName || '')
    : (authUser?.email || '');

  const avatarSeeds = authUser?.uid
    ? Array.from({ length: 6 }, (_, i) => authUser.uid + '_' + (i + 1))
    : [];

  const currentAvatarUrl = userProfile?.photoURL || authUser?.photoURL ||
    (authUser?.uid ? getDiceBearUrl(authUser.uid) : '');

  useEffect(() => {
    if (!isAuthUserLoading && (!authUser || authUser.isAnonymous)) {
      router.push('/auth');
    }
  }, [authUser, isAuthUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      reset({
        knownAs: userProfile.knownAs || userProfile.displayName?.split(' ')[0] || '',
        secondaryEmail: isPrimaryPhone ? (userProfile.email || '') : '',
        secondaryPhone: !isPrimaryPhone ? (userProfile.phoneNumber || authUser?.phoneNumber || '') : '',
      });
    } else if (authUser && !isProfileLoading) {
      reset({
        knownAs: authUser?.displayName?.split(' ')[0] || '',
        secondaryEmail: '',
        secondaryPhone: '',
      });
    }
  }, [userProfile, authUser, isProfileLoading, reset]);

  const getUserInitials = () => {
    const knownAs = userProfile?.knownAs?.trim() || authUser?.displayName?.trim();
    if (knownAs) return knownAs.charAt(0).toUpperCase();
    return authUser?.email?.charAt(0).toUpperCase() || '?';
  };

  const getMemberSince = () => {
    const creationTime = authUser?.metadata?.creationTime;
    if (!creationTime) return 'Unknown';
    return new Date(creationTime).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSelectDiceBear = async (seed: string) => {
    if (!userDocRef || !authUser) return;
    const url = getDiceBearUrl(seed);
    try {
      await updateDoc(userDocRef, { photoURL: url });
      await updateProfile(authUser, { photoURL: url });
      setShowAvatarPicker(false);
      toast({ title: 'Avatar updated' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not update avatar' });
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
      setShowAvatarPicker(false);
      uploadTask.on('state_changed',
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        () => {
          setUploadProgress(null);
          toast({ variant: 'destructive', title: 'Upload failed' });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(userDocRef, { photoURL: downloadURL });
          await updateProfile(authUser, { photoURL: downloadURL });
          setUploadProgress(null);
          toast({ title: 'Photo updated' });
        }
      );
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed' });
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        knownAs: data.knownAs,
        displayName: data.knownAs,
        ...(data.secondaryEmail && { email: data.secondaryEmail }),
        ...(data.secondaryPhone && { phoneNumber: data.secondaryPhone }),
      });
      if (authUser) await updateProfile(authUser, { displayName: data.knownAs });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!authUser) return;
    try {
      await deleteUser(authUser);
      toast({ title: 'Account deleted' });
      router.push('/');
    } catch (error) {
      let description = 'Could not delete your account. Please try again.';
      if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
        description = 'Please log out and log back in before deleting your account.';
      }
      toast({ variant: 'destructive', title: 'Deletion failed', description });
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
              <div className="mt-6 p-6 border rounded-lg space-y-6">
                {(isAuthUserLoading || isProfileLoading) ? (
                  <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative cursor-pointer" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                        <Avatar className="h-24 w-24 ring-2 ring-primary/20 hover:ring-primary/60 transition-all">
                          <AvatarImage src={currentAvatarUrl} alt="Profile picture" />
                          <AvatarFallback className="text-3xl">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">+</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-semibold tracking-wide text-amber-700">Membership</span>
                        <span className="text-base font-bold text-amber-800 bg-amber-50 border border-amber-300 px-4 py-1.5 rounded-full shadow-sm">🏆 Founding Member 🏆</span>
                      </div>

                      {showAvatarPicker && (
                        <div className="w-full border rounded-lg p-4 space-y-3 bg-muted/30">
                          <p className="text-sm font-medium text-center">Pick an avatar</p>
                          <div className="grid grid-cols-6 gap-2">
                            {avatarSeeds.map((seed) => (
                              <button key={seed} onClick={() => handleSelectDiceBear(seed)}
                                className="rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all">
                                <img src={getDiceBearUrl(seed)} alt="avatar option" className="w-full h-auto" />
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-center pt-1">
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                              Upload my own photo
                            </Button>
                          </div>
                          {uploadProgress !== null && (
                            <div className="space-y-1">
                              <Label>Uploading...</Label>
                              <Progress value={uploadProgress} />
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="knownAs">Known as</Label>
                        <Controller name="knownAs" control={control} render={({ field }) => <Input id="knownAs" {...field} />} />
                        {errors.knownAs && <p className="text-sm text-destructive">{errors.knownAs.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>{getProviderLabel(primaryProvider)}</Label>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">Primary</Badge>
                        </div>
                        <Input value={primaryContact} disabled className="bg-muted" />
                      </div>

                      {isPrimaryPhone && (
                        <div className="space-y-2">
                          <Label htmlFor="secondaryEmail">Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                          <Controller name="secondaryEmail" control={control} render={({ field }) => (
                            <Input id="secondaryEmail" type="email" placeholder="Add email address" {...field} />
                          )} />
                          {errors.secondaryEmail && <p className="text-sm text-destructive">{errors.secondaryEmail.message}</p>}
                        </div>
                      )}

                      {!isPrimaryPhone && (
                        <div className="space-y-2">
                          <Label htmlFor="secondaryPhone">Mobile <span className="text-muted-foreground text-xs">(optional)</span></Label>
                          <Controller name="secondaryPhone" control={control} render={({ field }) => (
                            <Input id="secondaryPhone" type="tel" placeholder="Add mobile number e.g. 0821234567" {...field} />
                          )} />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                        <p className="text-sm">Member since: {getMemberSince()}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          🏆 Founding Member
                        </span>
                      </div>
                        <Button type="submit" disabled={isSubmitting || !isDirty}>
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </form>
                  </>
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
                        This will permanently delete your account and all your plans. This cannot be undone.
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
