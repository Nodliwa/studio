
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
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { CalendarDays, MapPin, Users, PartyPopper } from 'lucide-react';
import PageHeader from '@/components/page-header';

const rsvpSchema = z.object({
  guestName: z.string().min(1, 'Please enter your name'),
  status: z.enum(['attending', 'not_attending'], {
    required_error: 'Please select your attendance status',
  }),
  additionalGuests: z.coerce.number().int().min(0).default(0),
});

type RsvpFormValues = z.infer<typeof rsvpSchema>;

async function findBudget(firestore: any, budgetId: string): Promise<Budget | null> {
    const usersCollectionRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);

    for (const userDoc of usersSnapshot.docs) {
        const budgetDocRef = doc(firestore, 'users', userDoc.id, 'budgets', budgetId);
        const budgetDocSnap = await getDoc(budgetDocRef);
        if (budgetDocSnap.exists()) {
            return budgetDocSnap.data() as Budget;
        }
    }
    return null;
}


export default function RsvpPage({ params }: { params: { budgetId: string } }) {
  const { budgetId } = params;
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
  });

  const status = watch('status');

  useEffect(() => {
    const fetchBudget = async () => {
      if (!firestore || !budgetId) return;
      setIsLoading(true);
      
      try {
        const foundBudget = await findBudget(firestore, budgetId);
        if (foundBudget) {
            setBudget(foundBudget);
        } else {
            setError('Could not find the event. The link may be incorrect or the event may have been removed.');
        }

      } catch (e) {
        setError('Could not find the event. Please check the link.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [budgetId, firestore]);

  const onSubmit = async (data: RsvpFormValues) => {
    setError(null);
    try {
      await addRsvp(budgetId, data);
      setIsSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'There was an error submitting your RSVP. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error && !budget) {
     return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center text-center p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  
  const formattedDate = budget?.eventDate 
    ? new Date(budget.eventDate).toLocaleDateString('en-US', {
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
            <Card className="w-full max-w-lg text-center">
                 <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <PartyPopper className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="pt-4">Thank You!</CardTitle>
                    <CardDescription>Your response has been recorded. We look forward to celebrating with you.</CardDescription>
                </CardHeader>
            </Card>
          ) : (
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">{budget?.name || 'You are Invited!'}</CardTitle>
                <CardDescription>You're invited to celebrate with us. Please let us know if you'll be there.</CardDescription>
                 <div className="pt-4 space-y-2 text-muted-foreground">
                    <p className="flex items-center justify-center gap-2"><CalendarDays className="h-4 w-4" /> {formattedDate}</p>
                    <p className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" /> {budget?.eventLocation || "Location to be announced"}</p>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="guestName">Your Full Name</Label>
                    <Input id="guestName" {...register('guestName')} />
                    {errors.guestName && <p className="text-destructive text-sm">{errors.guestName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Will you be attending?</Label>
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
                                    <Label htmlFor="attending">Yes, I'll be there!</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="not_attending" id="not_attending" />
                                    <Label htmlFor="not_attending">Sorry, I can't make it</Label>
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

                  {error && <p className="text-destructive text-sm">{error}</p>}
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
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
