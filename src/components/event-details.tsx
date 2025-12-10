
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Budget } from "@/lib/types";
import { setDocumentNonBlocking, useUser } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DocumentReference, doc } from "firebase/firestore";
import { MapPin } from "lucide-react";

interface EventDetailsProps {
  budget: Budget | null;
  budgetRef: DocumentReference | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  eventDate: z.date().optional(),
  eventLocation: z.string().optional(),
  expectedGuests: z.coerce.number().int().min(0).optional(),
  eventType: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const DEFAULT_BUDGET_NAME = "My Celebration Plan";

export function EventDetails({ budget, budgetRef }: EventDetailsProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: DEFAULT_BUDGET_NAME,
      eventLocation: "",
      expectedGuests: 0,
      eventType: "",
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name || DEFAULT_BUDGET_NAME,
        eventDate: budget.eventDate ? new Date(budget.eventDate) : undefined,
        eventLocation: budget.eventLocation || "",
        expectedGuests: budget.expectedGuests || 0,
        eventType: budget.eventType || "",
      });
      // If the budget exists but still has the default name, assume it's the first time
      // and allow editing. Otherwise, default to view mode.
      setIsEditing(budget.name === DEFAULT_BUDGET_NAME);
    } else if (user && budgetRef) {
        // Budget doesn't exist, create it and enter edit mode.
        const initialBudget: Omit<Budget, 'id'> = {
            name: DEFAULT_BUDGET_NAME,
            grandTotal: 0,
            userId: user.uid,
        };
        setDocumentNonBlocking(budgetRef, initialBudget, {});
        setIsEditing(true);
    }
  }, [budget, reset, user, budgetRef]);

  const onSubmit = (data: FormData) => {
    if (!budgetRef || !isDirty) return;
    
    const budgetUpdate = {
        ...data,
        eventDate: data.eventDate ? data.eventDate.toISOString() : undefined,
    }

    setDocumentNonBlocking(budgetRef, budgetUpdate, { merge: true });
    setIsEditing(false);
  };
  
  const openGoogleMaps = () => {
    const location = watch("eventLocation");
    if (location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
    }
  }

  return (
    <Card className="shadow-lg border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl">
          Event Details
        </CardTitle>
        {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">My-Plan Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} disabled={!isEditing} />}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Controller
              name="eventDate"
              control={control}
              render={({ field }) => (
                <DatePicker 
                    date={field.value} 
                    setDate={field.onChange}
                    disabled={!isEditing}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventLocation">Event Location</Label>
            <div className="flex items-center gap-2">
              <Controller
                name="eventLocation"
                control={control}
                render={({ field }) => (
                  <Input id="eventLocation" {...field} disabled={!isEditing} />
                )}
              />
              <Button type="button" variant="outline" size="icon" onClick={openGoogleMaps} disabled={!watch('eventLocation')}>
                  <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedGuests">Number of Guests</Label>
            <Controller
              name="expectedGuests"
              control={control}
              render={({ field }) => (
                <Input id="expectedGuests" type="number" {...field} disabled={!isEditing} />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="funeral">Funeral</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {isEditing && (
            <div className="lg:col-span-4 flex justify-end gap-2 mt-4">
              <Button type="button" variant="ghost" onClick={() => {
                reset(); // Revert changes
                setIsEditing(false);
              }}>Cancel</Button>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
