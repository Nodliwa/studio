"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useFirebase, useUser } from "@/firebase";
import { useSupplierProfile } from "@/firebase/supplier-hooks";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { PlacesAutocompleteProvider } from "@/components/places-autocomplete-provider";
import { ServiceSelector } from "@/components/suppliers/service-selector";
import { PhoneUpdateForm } from "@/components/suppliers/phone-update-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageOff, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ServiceOffering } from "@/lib/supplier-types";

const MAPS_LIBS: "places"[] = ["places"];

const schema = z.object({
  tradingAs: z.string().min(2, "Trading name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  areasServed: z.string().optional(),
  shortDescription: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  yearsInBusiness: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function calculateCompletion(
  data: FormData,
  mobileNumber: string,
  services: ServiceOffering[],
  cityRegion: string,
): number {
  const checks = [
    !!data.tradingAs,
    !!data.contactPerson,
    !!mobileNumber,
    services.length > 0,
    !!cityRegion,
    !!data.areasServed,
    !!data.shortDescription,
    !!(data.instagram || data.facebook),
    !!data.website,
    !!data.yearsInBusiness,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function ProfilePageInner() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const uid = user && !user.isAnonymous ? user.uid : undefined;
  const { data: supplier, isLoading: supplierLoading } = useSupplierProfile(uid);

  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [cityRegion, setCityRegion] = useState("");
  const [cityPlaceId, setCityPlaceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhoneUpdate, setShowPhoneUpdate] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: MAPS_LIBS,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || user.isAnonymous) router.push("/suppliers/login");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!supplier || initialized) return;
    reset({
      tradingAs: supplier.tradingAs,
      contactPerson: supplier.contactPerson,
      areasServed: supplier.areasServed,
      shortDescription: supplier.shortDescription,
      instagram: supplier.instagram,
      facebook: supplier.facebook,
      website: supplier.website,
      yearsInBusiness: supplier.yearsInBusiness != null ? String(supplier.yearsInBusiness) : "",
    });
    setServices(supplier.services ?? []);
    setMobileNumber(supplier.mobileNumber);
    setCityRegion(supplier.cityRegion);
    setCityPlaceId(supplier.cityPlaceId ?? "");
    setInitialized(true);
  }, [supplier, initialized, reset]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setCityRegion(place.formatted_address || place.name || "");
      setCityPlaceId(place.place_id || "");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!uid) return;
    setIsSubmitting(true);
    try {
      const completionPct = calculateCompletion(data, mobileNumber, services, cityRegion);
      await updateDoc(doc(firestore, "suppliers", uid), {
        tradingAs: data.tradingAs,
        contactPerson: data.contactPerson,
        services,
        cityRegion,
        cityPlaceId,
        areasServed: data.areasServed || "",
        shortDescription: data.shortDescription || "",
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        website: data.website || "",
        yearsInBusiness: data.yearsInBusiness ? Number(data.yearsInBusiness) : null,
        profileCompletionPct: completionPct,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Profile saved", description: "Your changes have been saved." });
    } catch (e) {
      console.error("Profile update error:", e);
      toast({ variant: "destructive", title: "Save failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneUpdated = async (newNumber: string) => {
    if (!uid) return;
    await updateDoc(doc(firestore, "suppliers", uid), {
      mobileNumber: newNumber,
      updatedAt: serverTimestamp(),
    });
    setMobileNumber(newNumber);
    setShowPhoneUpdate(false);
    toast({ title: "Mobile number updated" });
  };

  if (isUserLoading || supplierLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-card rounded-2xl shadow-lg px-5 md:px-8 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Profile completion:{" "}
              <span className="font-semibold text-foreground">
                {supplier.profileCompletionPct}%
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Business Details ──────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Business Details
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="tradingAs">
                  Trading As <span className="text-destructive">*</span>
                </Label>
                <Input id="tradingAs" {...register("tradingAs")} />
                {errors.tradingAs && (
                  <p className="text-xs text-destructive">{errors.tradingAs.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <Input id="contactPerson" {...register("contactPerson")} />
                {errors.contactPerson && (
                  <p className="text-xs text-destructive">{errors.contactPerson.message}</p>
                )}
              </div>
            </div>

            {/* ── Mobile Number ─────────────────────────────────────────── */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Mobile Number
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{mobileNumber || "—"}</span>
                {!showPhoneUpdate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPhoneUpdate(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Change Number
                  </Button>
                )}
              </div>
              {showPhoneUpdate && (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    Enter and verify your new mobile number.
                  </p>
                  <PhoneUpdateForm onUpdated={handlePhoneUpdated} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowPhoneUpdate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* ── Services ──────────────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Products &amp; Services
              </h2>
              <ServiceSelector value={services} onChange={setServices} />
            </div>

            {/* ── Location ──────────────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Location
              </h2>

              <div className="space-y-1.5">
                <Label>City / Region</Label>
                {mapsLoaded ? (
                  <Autocomplete
                    onLoad={(a) => (autocompleteRef.current = a)}
                    onPlaceChanged={onPlaceChanged}
                    options={{ types: ["(cities)"], componentRestrictions: { country: "za" } }}
                  >
                    <Input
                      placeholder="e.g. Durban, KwaZulu-Natal"
                      value={cityRegion}
                      onChange={(e) => setCityRegion(e.target.value)}
                    />
                  </Autocomplete>
                ) : (
                  <Input
                    placeholder="e.g. Durban, KwaZulu-Natal"
                    value={cityRegion}
                    onChange={(e) => setCityRegion(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="areasServed">Areas You Serve</Label>
                <Input
                  id="areasServed"
                  placeholder="e.g. Durban CBD, Umlazi, Pinetown"
                  {...register("areasServed")}
                />
              </div>
            </div>

            {/* ── Optional Details ──────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Optional Details
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  className="resize-none h-24"
                  placeholder="A brief description of your business and what makes you stand out…"
                  {...register("shortDescription")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="@yourhandle" {...register("instagram")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="facebook.com/yourpage"
                    {...register("facebook")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.co.za"
                    {...register("website")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 3"
                    {...register("yearsInBusiness")}
                  />
                </div>
              </div>

              {/* Photo upload — Phase 2 */}
              <div className="space-y-1.5">
                <Label>Photos</Label>
                <div className="flex items-center gap-3 border border-dashed rounded-lg px-4 py-5 bg-muted/30 text-muted-foreground">
                  <ImageOff className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Photo uploads coming soon.</p>
                    <p className="text-xs mt-0.5">
                      You will be able to add photos to your profile in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 font-bold text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SupplierProfilePage() {
  return (
    <PlacesAutocompleteProvider>
      <ProfilePageInner />
    </PlacesAutocompleteProvider>
  );
}
