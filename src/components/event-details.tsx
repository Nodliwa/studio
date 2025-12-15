
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
import { useLoadScript } from "@react-google-maps/api";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

interface EventDetailsProps {
  budget: Budget | null;
  budgetRef: DocumentReference | null;
  isTemplateMode?: boolean;
}

const formSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  eventLocation: z.string().optional(),
  eventDate: z.string().optional(),
  expectedGuests: z.coerce.number().int().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

const DEFAULT_BUDGET_NAME = "My Celebration Plan";
const libraries: "places"[] = ["places"];

export function EventDetails({ budget, budgetRef, isTemplateMode = false }: EventDetailsProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(isTemplateMode);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const {
    ready,
    suggestions: { status, data: autocompleteData },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { /* Define search scope here */ },
    debounce: 300,
    disabled: !isLoaded,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue: setFormValue,
    watch,
    formState: { isDirty, isSubmitting },
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
    today.setHours(0, 0, 0, 0); // Normalize today's date
    const diffTime = eventDate.getTime() - today.getTime();
    if (diffTime < 0) return "The event has passed.";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "The event is today!";
    if (diffDays === 1) return "You have 1 day to your event.";
    return `You have ${diffDays} days to your event.`;
  }, [budget?.eventDate]);

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
       setIsEditing(!budget.name || budget.name === DEFAULT_BUDGET_NAME && !budget.eventLocation);
    } else if (user && budgetRef && !budget) {
        const initialBudget: Omit<Budget, 'id'> = {
            name: DEFAULT_BUDGET_NAME,
            grandTotal: 0,
            userId: user.uid,
            eventLocation: "",
            eventDate: "",
            expectedGuests: 0,
            eventType: ""
        };
        setDocumentNonBlocking(budgetRef, initialBudget, {});
        setIsEditing(true);
    }
  }, [budget, reset, user, budgetRef, isTemplateMode, setAutocompleteValue]);


  const onSubmit = (data: FormData) => {
    if (isTemplateMode) {
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

  return (
    <Card className="shadow-lg border-border/60 h-full">
      <CardHeader className="flex flex-row items-start justify-between p-4 pb-0">
        <div className="flex-1">
          <CardTitle className="font-headline text-2xl">
            Event Details
          </CardTitle>
           <p className="text-sm font-semibold text-primary mt-2">{daysLeftText}</p>
        </div>
        {!isEditing && !isTemplateMode && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="name">My-Plan Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} disabled={!isEditing} />}
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
                        disabled={!isEditing || !isLoaded}
                        placeholder={isLoaded ? "Start typing your address..." : "Loading location..."}
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
          
          {isEditing && (
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
               {!isTemplateMode && (
                <Button type="button" variant="ghost" onClick={() => {
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
               )}
              <Button type="submit" disabled={isSubmitting}>
                {isTemplateMode ? 'Sign Up to Save' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
