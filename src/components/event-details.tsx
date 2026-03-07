
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Budget } from "@/lib/types";
import { setDocumentNonBlocking, useUser } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DocumentReference } from "firebase/firestore";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

interface EventDetailsProps {
  budget: Budget | null;
  budgetRef: DocumentReference | null;
  isBudgetLoading?: boolean;
  isTemplateMode?: boolean;
  eventType?: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  eventLocation: z.string().optional(),
  eventDate: z.string().optional(),
  expectedGuests: z.number().int().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EventDetails({ budget, budgetRef, isTemplateMode = false, eventType }: EventDetailsProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(isTemplateMode);

  const {
    ready,
    suggestions: { status, data: autocompleteData },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  const {
    control,
    handleSubmit,
    reset,
    setValue: setFormValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", eventLocation: "", eventDate: "", expectedGuests: 0 },
  });

  const eventLocationValue = watch('eventLocation');

  useEffect(() => {
    if (eventLocationValue) setAutocompleteValue(eventLocationValue);
  }, [eventLocationValue, setAutocompleteValue]);
  
  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name || "",
        eventLocation: budget.eventLocation || "",
        eventDate: budget.eventDate ? new Date(budget.eventDate).toISOString().split('T')[0] : "",
        expectedGuests: budget.expectedGuests || 0,
      });
      if (!budget.name) setIsEditing(true);
    }
  }, [budget, reset]);

  const onSubmit = (data: FormData) => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/register');
      return;
    }
    if (!budgetRef) return;
    const dataToSave = { ...data, eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : '' };
    setDocumentNonBlocking(budgetRef, dataToSave, { merge: true });
    setIsEditing(false);
    clearSuggestions();
  };

  const isNewPlan = !budget?.name;
  const showGuestState = !isUserLoading && isTemplateMode && (!user || user.isAnonymous);

  return (
    <Card className="shadow-lg h-full card-glass">
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="flex flex-row items-start justify-between p-4 pb-0">
                <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl">
                        {(eventType ? eventType.charAt(0).toUpperCase() + eventType.slice(1) : "Event") + " Details"}
                    </CardTitle>
                </div>
                {showGuestState ? (
                    <Button type="button" onClick={() => router.push('/register')} size="sm">Sign Up to Save</Button>
                ) : isEditing ? (
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isNewPlan ? "Add New Plan" : "Save Changes"}
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(true)}>Edit</Button>
                )}
            </CardHeader>
            <CardContent className="p-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">My-Plan Name</Label>
                        <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} placeholder="Life you are celebrating..." disabled={!isEditing} />} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="eventLocation">Event Location</Label>
                        <Controller
                            name="eventLocation"
                            control={control}
                            render={({ field }) => (
                            <Popover open={ready && status === 'OK' && autocompleteData.length > 0}>
                                <PopoverAnchor>
                                <Input id="eventLocation" {...field} disabled={!isEditing || !ready} placeholder="Start typing address..." autoComplete="off" />
                                </PopoverAnchor>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    {status === 'OK' && autocompleteData.map((s) => (
                                        <Button key={s.place_id} variant="ghost" className="justify-start h-auto w-full text-left p-2" onClick={() => { setFormValue('eventLocation', s.description); clearSuggestions(); }}>
                                            <div className="text-sm"><strong>{s.structured_formatting.main_text}</strong><br /><small>{s.structured_formatting.secondary_text}</small></div>
                                        </Button>
                                    ))}
                                </PopoverContent>
                            </Popover>
                            )}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="eventDate">Event Date</Label>
                        <Controller name="eventDate" control={control} render={({ field }) => <Input id="eventDate" type="date" {...field} disabled={!isEditing} />} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="expectedGuests">Number of Guests</Label>
                        <Controller name="expectedGuests" control={control} render={({ field }) => <Input id="expectedGuests" type="number" {...field} disabled={!isEditing} value={field.value || 0} />} />
                    </div>
                </div>
            </CardContent>
        </form>
    </Card>
  );
}
