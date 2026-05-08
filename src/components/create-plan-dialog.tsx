"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { v4 as uuidv4 } from "uuid";
import type { Budget, BudgetCategory, BirthdayMeta } from "@/lib/types";
import { getAgeGroup, isMilestoneBirthday } from "@/lib/utils";
import { budgetTemplates } from "@/lib/templates";
import { Autocomplete } from "@react-google-maps/api";
import { useMapsLoaded } from "@/components/places-autocomplete-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const planSchema = z.object({
  name: z.string().min(1, "Celebration name is required"),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  expectedGuests: z.coerce.number().int().min(1, "At least 1 guest expected"),
  birthdayAge: z.coerce.number().int().min(1).max(120).optional(),
}).superRefine((data, ctx) => {
  if (data.eventType === "birthday" && !data.birthdayAge) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Age being celebrated is required",
      path: ["birthdayAge"],
    });
  }
});

type PlanFormValues = z.infer<typeof planSchema>;

function calculateInitialTotal(categories: BudgetCategory[]): number {
  let total = 0;
  categories.forEach(cat => {
    let catTotal = 0;
    cat.items?.forEach(item => { catTotal += (item.quantity || 0) * (item.unitPrice || 0); });
    if (cat.subCategories) catTotal += calculateInitialTotal(cat.subCategories);
    total += catTotal;
  });
  return total;
}

function countTemplateItems(cats: BudgetCategory[]): number {
  return cats.reduce((sum, cat) =>
    sum + (cat.items?.length || 0) + countTemplateItems(cat.subCategories || []), 0);
}

function markTemplateItems(cat: BudgetCategory): BudgetCategory {
  return {
    ...cat,
    items: (cat.items || []).map(item => ({ ...item, is_template: true })),
    subCategories: (cat.subCategories || []).map(markTemplateItems),
  };
}

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEventType?: string;
}

export default function CreatePlanDialog({
  open,
  onOpenChange,
  initialEventType,
}: CreatePlanDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const mapsLoaded = useMapsLoaded();
  const locationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: "",
      eventType: "",
      eventDate: "",
      eventLocation: "",
      expectedGuests: 50,
      birthdayAge: undefined,
    },
  });

  const watchedEventType = watch("eventType");

  useEffect(() => {
    if (watchedEventType !== "birthday") {
      setValue("birthdayAge", undefined);
    }
  }, [watchedEventType, setValue]);

  useEffect(() => {
    if (initialEventType) {
      setValue("eventType", initialEventType);
    }
  }, [initialEventType, setValue]);

  const handleCreateNewPlan = async (data: PlanFormValues) => {
    if (!user || !firestore) return;

    const newId = uuidv4();
    const budgetRef = doc(firestore, "users", user.uid, "budgets", newId);

    let templateKey = data.eventType as keyof typeof budgetTemplates;
    let birthdayMeta: BirthdayMeta | undefined;

    if (data.eventType === "birthday" && data.birthdayAge) {
      const ageGroup = getAgeGroup(data.birthdayAge);
      templateKey = `birthday_${ageGroup}` as keyof typeof budgetTemplates;
      birthdayMeta = {
        birthdayAge: data.birthdayAge,
        ageGroup,
        isMilestone: isMilestoneBirthday(data.birthdayAge),
      };
    }

    const template = budgetTemplates[templateKey] || budgetTemplates.other;
    const initialTotal = calculateInitialTotal(template);

    const newBudget: Budget = {
      id: newId,
      name: data.name,
      grandTotal: initialTotal,
      userId: user.uid,
      eventType: data.eventType,
      eventDate: new Date(data.eventDate).toISOString(),
      eventLocation: data.eventLocation,
      expectedGuests: data.expectedGuests,
      ...(birthdayMeta && { birthdayMeta }),
      createdAt: serverTimestamp(),
      last_activity_at: serverTimestamp(),
      is_customized: false,
      customized_at: null,
      itemCount: countTemplateItems(template),
      addedItemCount: 0,
      removedItemCount: 0,
    };

    try {
      const batch = writeBatch(firestore);
      batch.set(budgetRef, newBudget);
      template.forEach((category, index) => {
        const catRef = doc(collection(budgetRef, "categories"));
        batch.set(catRef, { ...markTemplateItems(category), id: catRef.id, order: index, budgetId: newId });
      });
      await batch.commit();
      toast({ title: "Plan created successfully!" });
      onOpenChange(false);
      reset();
      router.push(`/planner/${newId}`);
    } catch (error) {
      console.error("Creation failed:", error);
      toast({ variant: "destructive", title: "Failed to create plan" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start a New Celebration</DialogTitle>
          <DialogDescription>
            Every great event starts with a solid plan. Tell us what you&apos;re celebrating.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleCreateNewPlan as any)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name (e.g., Mom&apos;s 60th)</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" {...field} placeholder="Life you are celebrating..." />
              )}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Celebration Type</Label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="funeral">Funeral</SelectItem>
                    <SelectItem value="umemulo">uMemulo</SelectItem>
                    <SelectItem value="umgidi">uMgidi</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventType && <p className="text-xs text-destructive">{errors.eventType.message}</p>}
          </div>

          {watchedEventType === "birthday" && (
            <div className="space-y-2">
              <Label htmlFor="birthdayAge">Age being celebrated</Label>
              <Controller
                name="birthdayAge"
                control={control}
                render={({ field }) => (
                  <Input
                    id="birthdayAge"
                    type="number"
                    min={1}
                    max={120}
                    placeholder="e.g. 30"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
              {errors.birthdayAge && (
                <p className="text-xs text-destructive">{errors.birthdayAge.message}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date</Label>
              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => <Input id="eventDate" type="date" {...field} />}
              />
              {errors.eventDate && (
                <p className="text-xs text-destructive">{errors.eventDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedGuests">Guests</Label>
              <Controller
                name="expectedGuests"
                control={control}
                render={({ field }) => <Input id="expectedGuests" type="number" {...field} />}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventLocation">Location</Label>
            <Controller
              name="eventLocation"
              control={control}
              render={({ field }) =>
                mapsLoaded ? (
                  <Autocomplete
                    onLoad={(a) => { locationAutocompleteRef.current = a; }}
                    onPlaceChanged={() => {
                      const place = locationAutocompleteRef.current?.getPlace();
                      if (place?.formatted_address) field.onChange(place.formatted_address);
                      else if (place?.name) field.onChange(place.name);
                    }}
                  >
                    <Input
                      id="eventLocation"
                      name={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      placeholder="Start typing your address..."
                      autoComplete="off"
                    />
                  </Autocomplete>
                ) : (
                  <Input
                    id="eventLocation"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    placeholder="Loading location..."
                    autoComplete="off"
                  />
                )
              }
            />
            {errors.eventLocation && (
              <p className="text-xs text-destructive">{errors.eventLocation.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? "Creating Plan..." : "Create and Start Planning"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
