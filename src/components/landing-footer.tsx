
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Facebook,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { submitContactForm } from "@/app/contact/actions";
import { cn } from "@/lib/utils";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 1200 1227"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L596.021 389.542L643.489 457.436L1029.51 1142.1H866.905L569.165 687.828Z" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 448 512"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z" />
  </svg>
);

function ClientOnlyForm() {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<{
    success: boolean;
    message: string;
    errors?: any;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      void submitContactForm(formData).then((result) => {
        setFormState(result);
      });
    });
  };

  if (formState?.success) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-bold">Message Sent!</h3>
        <p className="text-green-900 dark:text-green-200">
          {formState.message}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h3">We'd love to hear from you...</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Input id="name" name="name" placeholder="Your Name" required />
              {formState?.errors?.name && (
                <p className="text-xs text-destructive">
                  {formState.errors.name[0]}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your Email"
                required
              />
              {formState?.errors?.email && (
                <p className="text-xs text-destructive">
                  {formState.errors.email[0]}
                </p>
              )}
            </div>
          </div>
          <div className="relative space-y-1">
            <Textarea
              id="message"
              name="message"
              placeholder="Your message..."
              className="pr-20 min-h-[120px]"
              required
            />
            <Button
              type="submit"
              size="sm"
              className="absolute"
              style={{ bottom: "0.5rem", right: "0.5rem" }}
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Send"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
            {formState?.errors?.message && (
              <p className="text-xs text-destructive">
                {formState.errors.message[0]}
              </p>
            )}
          </div>
          {formState && !formState.success && formState.message && (
            <div className="flex items-center gap-2 text-sm text-destructive p-2 rounded-md bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <p>{formState.message}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default function LandingFooter() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className="w-full mt-24 py-12 bg-[hsl(210,30%,88%)] border-t border-[hsl(210,35%,80%)]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
          <div>
            {isClient ? (
              <ClientOnlyForm />
            ) : (
              <Card className="h-[268px] animate-pulse bg-muted/50"></Card>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-headline font-bold">
              Connect with Us
            </h3>
            <div className="flex justify-center items-center gap-6 mt-6">
              <Link
                href="https://www.facebook.com/SimpliPlanApp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
              >
                <Facebook className="h-8 w-8" />
              </Link>
              <Link
                href="https://x.com/PlanSimpli21515"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
              >
                <XIcon className="h-8 w-8" />
              </Link>
              <Link
                href="https://www.tiktok.com/@simpli_plan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
              >
                <TikTokIcon className="h-8 w-8" />
              </Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground max-w-xs mx-auto">
              Follow our social channels for tips, inspiration, and updates on making your next celebration simple and stress-free.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
