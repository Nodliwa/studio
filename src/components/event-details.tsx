
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

const DEFAULT_BUDGET_NAME = "";

export function EventDetails({ budget, budgetRef, isBudgetLoading = false, isTemplateMode = false, eventType }: EventDetailsProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(isTemplateMode);

  const {
    ready,
    suggestions: { status, data: autocompleteData },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue: setFormValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: DEFAULT_BUDGET_NAME,
      eventLocation: "",
      eventDate: "",
      expectedGuests: 0,
    },
  });

  const eventLocationValue = watch('eventLocation');

  const daysLeftText = useMemo(() => {
    if (!budget?.eventDate) return null;
    const eventDate = new Date(budget.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const diffTime = eventDate.getTime() - today.getTime();
    if (diffTime < 0) return "The event has passed.";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "The event is today!";
    if (diffDays === 1) return "You have 1 day to your event.";
    return `You have ${diffDays} days to your event.`;
  }, [budget?.eventDate]);

  const eventTitle = useMemo(() => {
    if (!eventType) return "Event Details";
    return `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Details`;
  }, [eventType]);

  const isNewPlan = useMemo(() => {
    return !budget?.name || budget.name === DEFAULT_BUDGET_NAME;
  }, [budget?.name]);

  useEffect(() => {
    if (eventLocationValue) {
      setAutocompleteValue(eventLocationValue);
    }
  }, [eventLocationValue, setAutocompleteValue]);
  
  useEffect(() => {
    if (isTemplateMode) {
      setIsEditing(true);
    } else if (budget) {
      const initialValues = {
        name: budget.name || DEFAULT_BUDGET_NAME,
        eventLocation: budget.eventLocation || "",
        eventDate: budget.eventDate ? new Date(budget.eventDate).toISOString().split('T')[0] : "",
        expectedGuests: budget.expectedGuests || 0,
      };
      reset(initialValues);
      // Auto-open editing if it's a completely blank new plan
      if (!budget.name || budget.name === DEFAULT_BUDGET_NAME) {
        setIsEditing(true);
      }
    }
  }, [budget, reset, isTemplateMode]);


  const onSubmit = (data: FormData) => {
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/register');
      return;
    }
    
    if (!budgetRef) return;
    
    const dataToSave = {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : ''
    };
    
    setDocumentNonBlocking(budgetRef, dataToSave, { merge: true });
    setIsEditing(false);
    clearSuggestions();
  };

  const handleLocationSelect = (description: string) => {
      setFormValue('eventLocation', description, { shouldDirty: true });
      clearSuggestions();
  }

  // Determine if we should show the "Signup to Save" state
  const showGuestState = isTemplateMode && (!user || user.isAnonymous);

  return (
    <Card className="shadow-lg h-full card-glass">
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="flex flex-row items-start justify-between p-4 pb-0">
                <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl">
                        {eventTitle}
                    </CardTitle>
                    <p className="text-sm font-semibold text-primary">{daysLeftText}</p>
                </div>
                {showGuestState ? (
                    <Button type="button" onClick={() => router.push('/register')} size="sm">Sign Up to Save</Button>
                ) : isEditing ? (
                    <div className="flex items-center gap-2">
                         <Button type="button" variant="ghost" size="sm" onClick={() => {
                            if (budget) {
                                const initialValues = {
                                name: budget.name || DEFAULT_BUDGET_NAME,
                                eventLocation: budget.eventLocation || "",
                                eventDate: budget.eventDate ? new Date(budget.eventDate).toISOString().split('T')[0] : "",
                                expectedGuests: budget.expectedGuests || 0,
                            };
                            reset(initialValues);
                            }
                            setIsEditing(false);
                            clearSuggestions();
                        }}>Cancel</Button>
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
                        <Controller
                        name="name"
                        control={control}
                        render={({ field }) => <Input id="name" {...field} placeholder="Life you are celebrating..." disabled={!isEditing} />}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <Label htmlFor="eventLocation">Event Location</Label>
                        <Controller
                            name="eventLocation"
                            control={control}
                            render={({ field }) => (
                            <Popover open={ready && status === 'OK' && autocompleteData.length > 0}>
                                <PopoverAnchor>
                                <Input
                                    id="eventLocation"
                                    {...field}
                                    disabled={!isEditing || !ready}
                                    placeholder={ready ? "Start typing your address..." : "Loading location..."}
                                    autoComplete="off"
                                />
                                </PopoverAnchor>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                {status === 'OK' && (
                                    <div className="flex flex-col gap-2 p-2">
                                    {autocompleteData.map((suggestion) => {
                                        const {
                                        place_id,
                                        structured_formatting: { main_text, secondary_text },
                                        description
                                        } = suggestion;
                                        return (
                                        <Button
                                            key={place_id}
                                            variant="ghost"
                                            className="justify-start h-auto text-left"
                                            onClick={() => handleLocationSelect(description)}
                                        >
                                            <div>
                                            <strong>{main_text}</strong>
                                            <br />
                                            <small className="text-muted-foreground">{secondary_text}</small>
                                            </div>
                                        </Button>
                                        );
                                    })}
                                    </div>
                                )}
                                </PopoverContent>
                            </Popover>
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="eventDate">Event Date</Label>
                        <Controller
                        name="eventDate"
                        control={control}
                        render={({ field }) => <Input id="eventDate" type="date" {...field} disabled={!isEditing} />}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="expectedGuests">Number of Guests</Label>
                        <Controller
                        name="expectedGuests"
                        control={control}
                        render={({ field }) => (
                            <Input id="expectedGuests" type="number" {...field} disabled={!isEditing} value={field.value || 0} />
                        )}
                        />
                    </div>
                </div>
            </CardContent>
        </form>
    </Card>
  );
}
