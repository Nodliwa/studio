"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  doc,
  collection,
  writeBatch,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { User } from "firebase/auth";
import { useFirebase, useUser } from "@/firebase";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { PlacesAutocompleteProvider } from "@/components/places-autocomplete-provider";
import { PhoneOtpForm } from "@/components/suppliers/phone-otp-form";
import { ServiceSelector } from "@/components/suppliers/service-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import type { ServiceOffering } from "@/lib/supplier-types";

const MAPS_LIBS: "places"[] = ["places"];

const schema = z.object({
  tradingAs: z.string().min(2, "Trading name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email"),
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
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
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
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
    setValue,
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
        router.push("/suppliers/dashboard");
      } else {
        setIsRedirectChecking(false);
      }
    });
  }, [user, isUserLoading, firestore, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setGoogleUser(result.user);
      if (result.user.displayName) setValue("contactPerson", result.user.displayName);
      if (result.user.email) setValue("email", result.user.email);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setGoogleError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setCityRegion(place.formatted_address || place.name || "");
      setCityPlaceId(place.place_id || "");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!googleUser && !mobileVerified) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please sign in with Google or verify your mobile number.",
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
        description: "Please sign in again.",
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
        email: data.email || "",
        mobileNumber: mobileVerified || "",
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* ── Auth: Google or Phone OTP ─────────────────────────── */}
              <div className="space-y-3">
                {!googleUser ? (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-2.5 h-10 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      Continue with Google
                    </button>

                    {googleError && (
                      <p className="text-xs text-destructive text-center">{googleError}</p>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs text-muted-foreground">
                        <span className="bg-card px-3">— or continue with phone —</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Mobile Number</Label>
                      <PhoneOtpForm onVerified={setMobileVerified} />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                    <span>
                      Signed in with Google as{" "}
                      <span className="font-medium">{googleUser.email}</span>
                    </span>
                  </div>
                )}
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
