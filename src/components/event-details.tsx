
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
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const LocationInput = ({ field, disabled }: { field: any, disabled: boolean }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { /* Define search scope here */ },
    debounce: 300,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    field.onChange(e.target.value);
  };

  const handleSelect = ({ description }: { description: string }) => () => {
    setValue(description, false);
    clearSuggestions();
    field.onChange(description);
  };

  const openGoogleMaps = () => {
    if (value) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`, '_blank');
    }
  }

  return (
    <Popover open={status === 'OK'}>
      <PopoverTrigger asChild>
        <div className="relative flex items-center">
            <Input
                {...field}
                value={value}
                onChange={handleInput}
                disabled={!ready || disabled}
                placeholder="Start typing your address..."
                className="pr-10"
            />
            <Button type="button" variant="ghost" size="icon" onClick={openGoogleMaps} disabled={!value} className="absolute right-0 h-9 w-10 text-muted-foreground hover:text-primary">
                <MapPin className="h-4 w-4" />
            </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        {status === "OK" && (
          <div className="flex flex-col gap-2 p-2">
            {data.map((suggestion) => {
              const {
                place_id,
                structured_formatting: { main_text, secondary_text },
              } = suggestion;
              return (
                <Button
                  key={place_id}
                  variant="ghost"
                  className="justify-start"
                  onClick={handleSelect(suggestion)}
                >
                  <div>
                    <strong>{main_text}</strong> <small>{secondary_text}</small>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};


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
      setIsEditing(budget.name === DEFAULT_BUDGET_NAME && !budget.eventDate);
    } else if (user && budgetRef) {
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
  
  return (
    <Card className="shadow-lg border-border/60">
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <CardTitle className="font-headline text-2xl">
          Event Details
        </CardTitle>
        {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </CardHeader>
      <CardContent className="p-2">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label htmlFor="name">My-Plan Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input id="name" {...field} disabled={!isEditing} />}
            />
          </div>
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Label htmlFor="eventLocation">Event Location</Label>
            <Controller
              name="eventLocation"
              control={control}
              render={({ field }) => <LocationInput field={field} disabled={!isEditing} />}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="expectedGuests">Number of Guests</Label>
            <Controller
              name="expectedGuests"
              control={control}
              render={({ field }) => (
                <Input id="expectedGuests" type="number" {...field} disabled={!isEditing} />
              )}
            />
          </div>
          <div className="space-y-1">
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
            <div className="lg:col-span-4 flex justify-end gap-2 mt-2">
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
