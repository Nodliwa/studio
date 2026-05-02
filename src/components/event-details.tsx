"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from "@/components/ui/progress";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  expectedGuests: z.coerce.number().int().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EventDetails({
  budget,
  budgetRef,
  isBudgetLoading = false,
  isTemplateMode = false,
  eventType,
}: EventDetailsProps) {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    ready,
    suggestions: { status, data: autocompleteData },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    initOnMount: false,
  });

  useEffect(() => {
    if (isEditing) {
      setAutocompleteValue('', false);
    } else {
      clearSuggestions();
    }
  }, [isEditing]);

  const {
    control,
    handleSubmit,
    reset,
    setValue: setFormValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      eventLocation: "",
      eventDate: "",
      expectedGuests: 0,
    },
  });

  const eventLocationValue = watch("eventLocation");

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

  useEffect(() => {
    if (eventLocationValue) {
      setAutocompleteValue(eventLocationValue);
    }
  }, [eventLocationValue, setAutocompleteValue]);

  useEffect(() => {
    if (budget) {
      const initialValues = {
        name: budget.name || "",
        eventLocation: budget.eventLocation || "",
        eventDate: budget.eventDate
          ? new Date(budget.eventDate).toISOString().split("T")[0]
          : "",
        expectedGuests: budget.expectedGuests || 0,
      };
      reset(initialValues);
    }
  }, [budget, reset]);

  const onSubmit = (data: FormData) => {
    if (isTemplateMode) {
      router.push("/auth");
      return;
    }
    if (!budgetRef) return;

    const dataToSave = {
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : "",
      eventType: eventType || budget?.eventType || "",
    };

    setDocumentNonBlocking(budgetRef, dataToSave, { merge: true });
    setIsEditing(false);
    clearSuggestions();
  };

  const handleLocationSelect = (description: string) => {
    setFormValue("eventLocation", description, { shouldDirty: true });
    clearSuggestions();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !budgetRef || !user || !budget) return;

    const storage = getStorage();
    const storageRef = ref(storage, `budgets/${budget.id}/background`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploadProgress(null);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your image.' });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setDocumentNonBlocking(budgetRef, { backgroundImageUrl: downloadURL }, { merge: true });
        setUploadProgress(null);
        toast({ title: 'Image Uploaded', description: 'Your plan background has been updated.' });
      }
    );
  };

  return (
    <Card className="shadow-lg h-full card-glass">
      <form onSubmit={handleSubmit(onSubmit as any)}>
        <CardHeader className="flex flex-row items-start justify-between p-4 pb-0">
          <div className="space-y-1">
            <CardTitle className="font-headline text-2xl">
              {eventTitle}
            </CardTitle>
            <p className="text-sm font-semibold text-primary">{daysLeftText}</p>
          </div>
          {isTemplateMode ? (
            <Button onClick={() => router.push("/auth")} size="sm">
              Sign Up to Save
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploadProgress !== null}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadProgress !== null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {uploadProgress !== null ? `${Math.round(uploadProgress)}%` : "Background"}
              </Button>
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (budget) {
                        reset({
                          name: budget.name || "",
                          eventLocation: budget.eventLocation || "",
                          eventDate: budget.eventDate ? new Date(budget.eventDate).toISOString().split("T")[0] : "",
                          expectedGuests: budget.expectedGuests || 0,
                        });
                      }
                      setIsEditing(false);
                      clearSuggestions();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-4">
          {uploadProgress !== null && (
            <div className="mb-4 space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Uploading background...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">My-Plan Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    {...field}
                    placeholder="Life you are celebrating..."
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
                render={({ field }) => (
                  <Popover
                    open={ready && status === "OK" && autocompleteData.length > 0}
                  >
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
                      {status === "OK" && (
                        <div className="flex flex-col gap-2 p-2">
                          {autocompleteData.map((suggestion) => {
                            const {
                              place_id,
                              structured_formatting: { main_text, secondary_text },
                              description,
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
                                  <small className="text-muted-foreground">
                                    {secondary_text}
                                  </small>
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
                render={({ field }) => (
                  <Input
                    id="eventDate"
                    type="date"
                    {...field}
                    disabled={!isEditing}
                  />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="expectedGuests">Number of Guests</Label>
              <Controller
                name="expectedGuests"
                control={control}
                render={({ field }) => (
                  <Input
                    id="expectedGuests"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    disabled={!isEditing}
                    value={field.value || 0}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}