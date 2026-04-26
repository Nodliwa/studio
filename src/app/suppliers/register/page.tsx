"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  doc,
  setDoc,
  collection,
  writeBatch,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useFirebase, useUser } from "@/firebase";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { PlacesAutocompleteProvider } from "@/components/places-autocomplete-provider";
import { PhoneOtpForm } from "@/components/suppliers/phone-otp-form";
import { ServiceSelector } from "@/components/suppliers/service-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
  mobileVerified: string,
  services: ServiceOffering[],
  cityRegion: string,
): number {
  const checks = [
    !!data.tradingAs,
    !!data.contactPerson,
    !!mobileVerified,
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

function RegisterFormInner() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [mobileVerified, setMobileVerified] = useState<string>("");
  const [cityRegion, setCityRegion] = useState("");
  const [cityPlaceId, setCityPlaceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectChecking, setIsRedirectChecking] = useState(true);
  const autocompleteRef = useRef<any>(null);
  const justRegistered = useRef(false);

  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: MAPS_LIBS,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Redirect if already registered as supplier
  useEffect(() => {
    if (justRegistered.current) return;
    if (isUserLoading) return;
    if (!user || user.isAnonymous) {
      setIsRedirectChecking(false);
      return;
    }
    getDoc(doc(firestore, "suppliers", user.uid)).then((snap) => {
      if (justRegistered.current) return;
      if (snap.exists()) {
        console.log("supplier exists, redirecting to dashboard");
        router.push("/suppliers/dashboard");
      } else {
        setIsRedirectChecking(false);
      }
    });
  }, [user, isUserLoading, firestore, router]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setCityRegion(place.formatted_address || place.name || "");
      setCityPlaceId(place.place_id || "");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!mobileVerified) {
      toast({
        variant: "destructive",
        title: "Mobile number required",
        description: "Please verify your mobile number before submitting.",
      });
      return;
    }
    if (services.length === 0) {
      toast({
        variant: "destructive",
        title: "Services required",
        description: "Please add at least one product or service.",
      });
      return;
    }
    if (!cityRegion) {
      toast({
        variant: "destructive",
        title: "City required",
        description: "Please select your city or region.",
      });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please verify your mobile number again.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const completionPct = calculateCompletion(data, mobileVerified, services, cityRegion);
      const batch = writeBatch(firestore);

      batch.set(doc(firestore, "suppliers", currentUser.uid), {
        uid: currentUser.uid,
        tradingAs: data.tradingAs,
        contactPerson: data.contactPerson,
        mobileNumber: mobileVerified,
        services,
        cityRegion,
        cityPlaceId,
        areasServed: data.areasServed || "",
        shortDescription: data.shortDescription || "",
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        website: data.website || "",
        yearsInBusiness: data.yearsInBusiness ? Number(data.yearsInBusiness) : null,
        photoUrls: [],
        credits: 1,
        profileCompletionPct: completionPct,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(collection(firestore, "supplier_credits")), {
        supplierId: currentUser.uid,
        type: "credit",
        amount: 1,
        reason: "signup_bonus",
        opportunityId: null,
        description: "1 free credit awarded on registration",
        balanceBefore: 0,
        balanceAfter: 1,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      justRegistered.current = true;
      router.push("/suppliers/success");
    } catch (e) {
      console.error("Registration error:", e);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRedirectChecking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-card rounded-2xl shadow-lg px-5 md:px-8 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Create Your Supplier Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tell planners who you are and what you offer.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Business Details ─────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Business Details
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="tradingAs">
                  Trading As <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tradingAs"
                  placeholder="Your business or trading name"
                  {...register("tradingAs")}
                />
                {errors.tradingAs && (
                  <p className="text-xs text-destructive">{errors.tradingAs.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="Full name of the person to contact"
                  {...register("contactPerson")}
                />
                {errors.contactPerson && (
                  <p className="text-xs text-destructive">{errors.contactPerson.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <PhoneOtpForm onVerified={setMobileVerified} />
              </div>
            </div>

            {/* ── Services ─────────────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Products &amp; Services <span className="text-destructive">*</span>
              </h2>
              <ServiceSelector value={services} onChange={setServices} />
            </div>

            {/* ── Location ─────────────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Location
              </h2>

              <div className="space-y-1.5">
                <Label>
                  City / Region <span className="text-destructive">*</span>
                </Label>
                {mapsLoaded ? (
                  <Autocomplete
                    onLoad={(a) => (autocompleteRef.current = a)}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      types: ["(cities)"],
                      componentRestrictions: { country: "za" },
                    }}
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
                  placeholder="e.g. Durban CBD, Umlazi, Pinetown, Surrounding areas"
                  {...register("areasServed")}
                />
              </div>
            </div>

            {/* ── Optional Details ─────────────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Optional Details
              </h2>

              <div className="space-y-1.5">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="A brief description of your business and what makes you stand out…"
                  className="resize-none h-24"
                  {...register("shortDescription")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@yourhandle"
                    {...register("instagram")}
                  />
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
                <Label>Upload Photos</Label>
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

            {/* ── Submit ───────────────────────────────────────────────── */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 font-bold text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating your profile…
                  </>
                ) : (
                  "Create Supplier Profile"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Profiles with clear and complete information may receive better
                opportunities.
              </p>
            </div>
          </form>

          <p className="text-xs text-center text-muted-foreground border-t pt-4">
            Already registered?{" "}
            <Link
              href="/suppliers/login"
              className="text-primary underline underline-offset-2"
            >
              Log in to your supplier dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SupplierRegisterPage() {
  return (
    <PlacesAutocompleteProvider>
      <RegisterFormInner />
    </PlacesAutocompleteProvider>
  );
}
