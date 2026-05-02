"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Budget } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { submitRSVP } from '@/app/rsvp/actions';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, MapPin, RefreshCw, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const rsvpFormSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  attending: z.enum(['yes', 'no', 'maybe'] as const, { message: 'Please select an option' }),
  guests: z.coerce.number().min(0, 'Cannot be negative').default(0),
  dietaryRequirements: z.string().optional(),
});

type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

interface Props {
  budget: Budget;
  userId: string;
  budgetId: string;
}

export default function RsvpForm({ budget, userId, budgetId }: Props) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema) as any,
    defaultValues: { attending: 'yes', guests: 0 },
  });

  const attendingValue = watch('attending');

  const onSubmit = async (data: RsvpFormValues) => {
    try {
      const result = await submitRSVP({ ...data, budgetId, userId });
      if (result.success) {
        setSubmitted(true);
        toast({ title: "RSVP Sent", description: "Thank you for letting us know!" });
      } else {
        toast({ variant: 'destructive', title: "Error", description: result.message });
      }
    } catch {
      toast({ variant: 'destructive', title: "Error", description: "An unexpected error occurred." });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <CardTitle className="text-3xl font-headline">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              Your response has been sent to the organizer of <strong>{budget.name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>Update Response</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const eventDate = budget.eventDate
    ? new Date(budget.eventDate).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })
    : 'TBD';

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center py-12 px-4">
      <div className="max-w-xl w-full space-y-8">
        <Card className="overflow-hidden border-none shadow-xl">
          <div className="relative h-48 w-full bg-primary/20">
            {budget.backgroundImageUrl ? (
              <Image src={budget.backgroundImageUrl} alt="Background" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-teal-700" />
            )}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold font-headline mb-2 text-shadow">{budget.name}</h1>
              <p className="text-sm md:text-lg font-medium opacity-90 text-shadow-sm uppercase tracking-widest">You're Invited!</p>
            </div>
          </div>
          <CardContent className="p-6 grid gap-4 bg-background">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">When</p>
                <p className="font-semibold">{eventDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Where</p>
                <p className="font-semibold">{budget.eventLocation || 'Venue to be confirmed'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Confirm Attendance</CardTitle>
            <CardDescription>Please let us know if you'll be joining us by filling out the form below.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit as any)}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Full Name</Label>
                <Input id="name" {...register('name')} placeholder="John Doe" />
                {errors.name && <p className="text-xs text-destructive font-bold">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-destructive font-bold">{errors.email.message}</p>}
              </div>

              <div className="space-y-3">
                <Label>Are you attending?</Label>
                <RadioGroup
                  defaultValue="yes"
                  onValueChange={(val: any) => setValue('attending', val)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-black/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="flex-grow cursor-pointer font-bold">Yes, I'll be there!</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-black/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="maybe" id="maybe" />
                    <Label htmlFor="maybe" className="flex-grow cursor-pointer font-bold">Maybe / Not sure yet</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-black/5 cursor-pointer transition-colors">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="flex-grow cursor-pointer font-bold">Sorry, I can't make it</Label>
                  </div>
                </RadioGroup>
              </div>

              {attendingValue === 'yes' && (
                <div className="space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="guests">Bringing any extra guests?</Label>
                    <Input
                      id="guests"
                      type="number"
                      {...register('guests')}
                      min="0"
                      className="w-full sm:w-1/3"
                    />
                    <p className="text-[10px] text-muted-foreground italic">Excluding yourself.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dietary">Dietary Requirements / Special Requests</Label>
                    <Textarea
                      id="dietary"
                      {...register('dietaryRequirements')}
                      placeholder="e.g., Vegetarian, Allergies, etc."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" size="lg" className="w-full font-bold h-14 text-lg" disabled={isSubmitting}>
                {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : null}
                Send RSVP
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
