"use client";

import { useState, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneOtpFormProps {
  onVerified: (e164Number: string) => void;
  className?: string;
}

type OtpStep = "idle" | "sending" | "sent" | "verifying" | "verified";

const isSAPhone = (v: string) =>
  /^(\+27|0)[6-8][0-9]{8}$/.test(v.replace(/\s/g, ""));

const toE164 = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.startsWith("27") ? `+${d}` : `+27${d.replace(/^0/, "")}`;
};

const formatDisplay = (v: string) =>
  v
    .replace(/\D/g, "")
    .replace(/^27/, "0")
    .replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");

export function PhoneOtpForm({ onVerified, className }: PhoneOtpFormProps) {
  const auth = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<OtpStep>("idle");
  const [error, setError] = useState("");
  const confirmationRef = useRef<any>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const sendOtp = async () => {
    if (!isSAPhone(phone)) {
      setError("Enter a valid SA mobile number (e.g. 0821234567)");
      return;
    }
    setError("");
    setStep("sending");
    try {
      if (recaptchaRef.current) recaptchaRef.current.clear();
      const verifier = new RecaptchaVerifier(auth, "phone-recaptcha-supplier", {
        size: "invisible",
      });
      recaptchaRef.current = verifier;
      const result = await signInWithPhoneNumber(auth, toE164(phone), verifier);
      confirmationRef.current = result;
      setStep("sent");
    } catch (e: any) {
      const msgs: Record<string, string> = {
        "auth/invalid-phone-number": "Invalid number. Use format: 0821234567",
        "auth/too-many-requests": "Too many attempts. Please wait before trying again.",
        "auth/quota-exceeded": "SMS quota exceeded. Please try again later.",
      };
      setError(msgs[e.code] || "Failed to send OTP. Please try again.");
      setStep("idle");
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError("");
    setStep("verifying");
    try {
      await confirmationRef.current.confirm(otp);
      setStep("verified");
      onVerified(toE164(phone));
    } catch (e: any) {
      const msgs: Record<string, string> = {
        "auth/invalid-verification-code": "Incorrect code. Please try again.",
        "auth/code-expired": "Code expired. Click 'Change' and request a new one.",
      };
      setError(msgs[e.code] || "Verification failed. Please try again.");
      setStep("sent");
    }
  };

  if (step === "verified") {
    return (
      <div className={cn("flex items-center gap-2 text-sm font-medium text-green-600 py-2", className)}>
        <CheckCircle className="h-4 w-4 shrink-0" />
        Verified: {formatDisplay(phone)}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="0821234567"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          disabled={step !== "idle"}
          inputMode="numeric"
          className="flex-1"
        />
        {step === "idle" && (
          <Button
            type="button"
            variant="outline"
            onClick={sendOtp}
            disabled={!isSAPhone(phone)}
            className="shrink-0"
          >
            Send OTP
          </Button>
        )}
        {step === "sending" && (
          <Button type="button" variant="outline" disabled className="shrink-0">
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            Sending…
          </Button>
        )}
        {(step === "sent" || step === "verifying") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-xs"
            onClick={() => {
              setStep("idle");
              setOtp("");
              setError("");
            }}
          >
            Change
          </Button>
        )}
      </div>

      {(step === "sent" || step === "verifying") && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Code sent to {formatDisplay(phone)} — enter it below.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              maxLength={6}
              inputMode="numeric"
              className="text-center tracking-widest font-mono flex-1"
              autoFocus
            />
            <Button
              type="button"
              onClick={verifyOtp}
              disabled={otp.length < 6 || step === "verifying"}
              className="shrink-0"
            >
              {step === "verifying" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              {step === "verifying" ? "Verifying…" : "Verify"}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-2 py-1.5 rounded">
          {error}
        </p>
      )}

      <div id="phone-recaptcha-supplier" />
    </div>
  );
}
