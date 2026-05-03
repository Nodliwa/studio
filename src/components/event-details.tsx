"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Budget, AgeGroup } from "@/lib/types";
import { setDocumentNonBlocking, useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DocumentReference, collection, getDocs, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { planActivityFields } from "@/lib/plan-activity";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from "@/components/ui/progress";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAgeGroup, isMilestoneBirthday } from "@/lib/utils";
import { budgetTemplates } from "@/lib/data";

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
  birthdayAge: z.coerce.number().int().min(1).max(120).optional(),
});

type FormData = z.infer<typeof formSchema>;

function calcTemplateTotal(categories: typeof budgetTemplates.birthday_adult): number {
  return categories.reduce((sum, cat) => {
    const itemsTotal = (cat.items || []).reduce((s, item) => s + (item.total || 0), 0);
    return sum + itemsTotal;
  }, 0);
}

function ageGroupLabel(g: AgeGroup) {
  return g === 'child' ? 'Kids' : g.charAt(0).toUpperCase() + g.slice(1);
}

export function EventDetails({
  budget,
  budgetRef,
  isBudgetLoading = false,
  isTemplateMode = false,
  eventType,
}: EventDetailsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [pendingTemplateChange, setPendingTemplateChange] = useState<{
    newAgeGroup: AgeGroup;
    oldAgeGroup: AgeGroup;
  } | null>(null);
  const [isReplacingTemplate, setIsReplacingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveEventType = eventType || budget?.eventType || "";

  const {
    init,
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
      init();
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
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      eventLocation: "",
      eventDate: "",
      expectedGuests: 0,
      birthdayAge: undefined,
    },
  });

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
    if (!effectiveEventType) return "Event Details";
    return `${effectiveEventType.charAt(0).toUpperCase() + effectiveEventType.slice(1)} Details`;
  }, [effectiveEventType]);

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name || "",
        eventLocation: budget.eventLocation || "",
        eventDate: budget.eventDate
          ? new Date(budget.eventDate).toISOString().split("T")[0]
          : "",
        expectedGuests: budget.expectedGuests || 0,
        birthdayAge: budget.birthdayMeta?.birthdayAge ?? undefined,
      });
    }
  }, [budget, reset]);

  const onSubmit = (data: FormData) => {
    if (isTemplateMode) {
      router.push("/auth");
      return;
    }
    if (!budgetRef) return;

    const { birthdayAge, ...rest } = data;

    const dataToSave: Record<string, any> = {
      ...rest,
      eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : "",
      eventType: effectiveEventType,
    };

    if (effectiveEventType === 'birthday' && birthdayAge) {
      const newAgeGroup = getAgeGroup(birthdayAge);
      const oldAgeGroup = budget?.birthdayMeta?.ageGroup;
      dataToSave.birthdayMeta = {
        birthdayAge,
        ageGroup: newAgeGroup,
        isMilestone: isMilestoneBirthday(birthdayAge),
      };
      if (oldAgeGroup && oldAgeGroup !== newAgeGroup) {
        setPendingTemplateChange({ newAgeGroup, oldAgeGroup });
      }
    }

    setDocumentNonBlocking(budgetRef, { ...dataToSave, ...planActivityFields(budget?.is_customized) }, { merge: true });
    setIsEditing(false);
    clearSuggestions();
  };

  const handleReplaceTemplate = async () => {
    if (!budgetRef || !pendingTemplateChange || !budget || !firestore) return;
    setIsReplacingTemplate(true);

    const { newAgeGroup } = pendingTemplateChange;
    const templateKey = (newAgeGroup === 'child' ? 'birthday_kids' : `birthday_${newAgeGroup}`) as keyof typeof budgetTemplates;
    const template = budgetTemplates[templateKey] ?? budgetTemplates.birthday_adult;
    const newTotal = calcTemplateTotal(template);

    try {
      const batch = writeBatch(firestore);

      const catsSnap = await getDocs(collection(budgetRef, 'categories'));
      catsSnap.forEach(d => batch.delete(d.ref));

      template.forEach((cat, i) => {
        const catRef = doc(collection(budgetRef, 'categories'));
        batch.set(catRef, { ...cat, id: catRef.id, order: i, budgetId: budget.id });
      });

      batch.update(budgetRef, { grandTotal: newTotal, ...planActivityFields(budget?.is_customized) });

      await batch.commit();
      toast({
        title: 'Plan Updated',
        description: `Switched to ${ageGroupLabel(newAgeGroup)} birthday template.`,
      });
    } catch (e) {
      console.error('Template replace failed:', e);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update the plan template.' });
    } finally {
      setIsReplacingTemplate(false);
      setPendingTemplateChange(null);
    }
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
    <>
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
                            birthdayAge: budget.birthdayMeta?.birthdayAge ?? undefined,
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
                          onChange={(e) => {
                            field.onChange(e);
                            setAutocompleteValue(e.target.value);
                          }}
                          disabled={!isEditing}
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
                                  type="button"
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

              {effectiveEventType === 'birthday' && (
                <div className="space-y-1">
                  <Label htmlFor="birthdayAge">Birthday Age</Label>
                  <Controller
                    name="birthdayAge"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="birthdayAge"
                        type="number"
                        min="1"
                        max="120"
                        placeholder="e.g. 30"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                        disabled={!isEditing}
                      />
                    )}
                  />
                  {budget?.birthdayMeta && (
                    <p className="text-xs text-muted-foreground">
                      {ageGroupLabel(budget.birthdayMeta.ageGroup)} birthday
                      {budget.birthdayMeta.isMilestone ? ' · 🎉 Milestone!' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </form>
      </Card>

      <AlertDialog open={!!pendingTemplateChange} onOpenChange={(open) => { if (!open && !isReplacingTemplate) setPendingTemplateChange(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Plan Template?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Age <strong>{pendingTemplateChange && budget?.birthdayMeta?.birthdayAge !== undefined ? `${budget.birthdayMeta.birthdayAge} → ` : ''}</strong> falls into a new birthday category:
                </p>
                <p className="mt-2 font-semibold text-foreground">
                  {pendingTemplateChange && `${ageGroupLabel(pendingTemplateChange.oldAgeGroup)} → ${ageGroupLabel(pendingTemplateChange.newAgeGroup)}`}
                </p>
                <p className="mt-2 text-destructive font-medium text-sm">
                  This will replace your current plan categories with the {pendingTemplateChange && ageGroupLabel(pendingTemplateChange.newAgeGroup)} birthday template.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReplacingTemplate}>Keep Current Plan</AlertDialogCancel>
            <AlertDialogAction disabled={isReplacingTemplate} onClick={handleReplaceTemplate}>
              {isReplacingTemplate && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
