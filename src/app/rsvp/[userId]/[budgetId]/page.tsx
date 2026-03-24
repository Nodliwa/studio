
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addRsvp } from '@/app/rsvp/actions';
import type { Budget } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CalendarDays, MapPin, PartyPopper, AlertTriangle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/page-header';

const rsvpSchema = z.object({
  guestName: z.string().min(1, 'Please enter your name'),
  status: z.enum(['attending', 'not_attending'], {
    error: 'Please select your attendance status',
  }),
  additionalGuests: z.coerce.number().int().min(0).default(0),
});

type RsvpFormValues = z.infer<typeof rsvpSchema>;

export default function RsvpPage({ params }: { params: { userId: string, budgetId: string } }) {
  const { userId, budgetId } = params;
  const { firestore } = useFirebase();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
        additionalGuests: 0,
    }
  });

  const status = watch('status');

  useEffect(() => {
    const fetchBudget = async () => {
      // Basic sanity check for params
      if (!userId || !budgetId || userId === 'undefined' || budgetId === 'undefined') {
          // If params are undefined, it might be a hydration delay in some Next.js versions.
          // We don't error immediately if we think they might resolve.
          return;
      }

      if (!firestore) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const budgetRef = doc(firestore, 'users', userId, 'budgets', budgetId);
        const snap = await getDoc(budgetRef);
        
        if (snap.exists()) {
            setBudget(snap.data() as Budget);
        } else {
            setError('Could not find the event details. The link may be invalid or the event might have been removed.');
        }
      } catch (e) {
        setError('Could not access event details. This might be a temporary connection issue.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [userId, budgetId, firestore]);

  const onSubmit = async (data: RsvpFormValues) => {
    setError(null);
    try {
      await addRsvp(userId, budgetId, data);
      setIsSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'There was an error submitting your RSVP. Please try again.');
    }
  };

  if (isLoading && !error) {
    return (
      <div className="min-h-screen w-full bg-secondary flex flex-col">
        <PageHeader />
        <main className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Loading invitation...</p>
            </div>
        </main>
      </div>
    );
  }

  if (error && !budget) {
     return (
      <div className="min-h-screen w-full bg-secondary">
        <PageHeader />
        <main className="container mx-auto flex items-center justify-center px-4 py-20">
            <Card className="w-full max-w-md border-destructive/20 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="pt-4 text-destructive">Invitation Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button variant="outline" onClick={() => window.location.href = '/'}>Go to Home</Button>
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }
  
  const formattedDate = budget?.eventDate 
    ? new Date(budget.eventDate).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    : "Date to be confirmed";

  return (
     <div className="min-h-screen bg-secondary">
      <div className="bg-background shadow-2xl min-h-full container mx-auto flex flex-col">
        <PageHeader />
        <main className="container mx-auto flex items-center justify-center px-4 flex-grow my-16">
          {isSubmitted ? (
            <Card className="w-full max-w-lg text-center shadow-2xl border-primary/20">
                 <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <PartyPopper className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="pt-4 font-headline text-2xl">Response Recorded!</CardTitle>
                    <CardDescription>Thank you, {watch('guestName')}. We've updated the guest list for the host.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">You can close this window now.</p>
                </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-lg shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">{budget?.name || 'You are Invited!'}</CardTitle>
                <CardDescription>We'd love to have you celebrate with us. Please let us know if you'll be there.</CardDescription>
                 <div className="pt-4 space-y-2 text-muted-foreground">
                    <p className="flex items-center justify-center gap-2"><CalendarDays className="h-4 w-4" /> {formattedDate}</p>
                    <p className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" /> {budget?.eventLocation || "Location to be confirmed"}</p>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">Your Full Name</Label>
                    <Input id="guestName" {...register('guestName')} placeholder="Enter your name" />
                    {errors.guestName && <p className="text-destructive text-sm">{errors.guestName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Are you attending?</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4 pt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="attending" id="attending" />
                                    <Label htmlFor="attending" className="cursor-pointer">Yes, I'll be there</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="not_attending" id="not_attending" />
                                    <Label htmlFor="not_attending" className="cursor-pointer">I can't make it</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    {errors.status && <p className="text-destructive text-sm">{errors.status.message}</p>}
                  </div>

                  {status === 'attending' && (
                     <div className="space-y-2">
                        <Label htmlFor="additionalGuests">Additional Guests (+1s)</Label>
                        <Input id="additionalGuests" type="number" min="0" {...register('additionalGuests')} />
                        {errors.additionalGuests && <p className="text-destructive text-sm">{errors.additionalGuests.message}</p>}
                    </div>
                  )}

                  {error && <p className="text-destructive text-sm font-bold bg-destructive/10 p-3 rounded">{error}</p>}
                  
                  <Button type="submit" className="w-full font-bold h-12 text-lg" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending Response...' : 'Submit Response'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
