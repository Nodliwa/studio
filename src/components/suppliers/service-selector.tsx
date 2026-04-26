"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceSuggestions } from "@/lib/supplier-data";
import type { ServiceOffering, PricingType } from "@/lib/supplier-types";

interface ServiceSelectorProps {
  value: ServiceOffering[];
  onChange: (services: ServiceOffering[]) => void;
}

const PRICING_LABELS: Record<PricingType, string> = {
  starting: "Starting Price",
  actual: "Actual Price",
  average: "Average Price",
  custom_quote: "Custom Quote",
};

function makeServiceId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => getServiceSuggestions(), []);
  const fuse = useMemo(
    () => new Fuse(suggestions, { threshold: 0.35, minMatchCharLength: 2 }),
    [suggestions],
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || q.length < 2) return suggestions.slice(0, 10);
    return fuse.search(q).slice(0, 10).map((r) => r.item);
  }, [query, fuse, suggestions]);

  const selectedNames = useMemo(() => new Set(value.map((s) => s.name)), [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addService = (name: string) => {
    if (selectedNames.has(name)) return;
    onChange([
      ...value,
      {
        serviceId: makeServiceId(name),
        name,
        pricingType: "starting",
        price: null,
        customQuoteAvailable: true,
      },
    ]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeService = (name: string) => {
    onChange(value.filter((s) => s.name !== name));
    setExpanded((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const updateService = (name: string, updates: Partial<ServiceOffering>) => {
    onChange(value.map((s) => (s.name === name ? { ...s, ...updates } : s)));
  };

  const toggleExpanded = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const trimmedQuery = query.trim();
  const showCustomOption =
    trimmedQuery.length >= 2 && !results.includes(trimmedQuery);

  return (
    <div className="space-y-3">
      <div ref={wrapperRef} className="relative">
        <Input
          ref={inputRef}
          placeholder="Search services (e.g. Catering, Photography, DJ…)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
            {results.length === 0 && !showCustomOption && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No matches found
              </p>
            )}
            {results.map((name) => (
              <button
                key={name}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  selectedNames.has(name)
                    ? "text-muted-foreground cursor-default bg-muted/30"
                    : "hover:bg-muted",
                )}
                onClick={() => {
                  if (!selectedNames.has(name)) addService(name);
                }}
              >
                {selectedNames.has(name) && (
                  <span className="text-primary mr-1">✓</span>
                )}
                {name}
              </button>
            ))}
            {showCustomOption && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-muted transition-colors flex items-center gap-1.5 border-t"
                onClick={() => addService(trimmedQuery)}
              >
                <Plus className="h-3 w-3 shrink-0" />
                Add &ldquo;{trimmedQuery}&rdquo; as custom service
              </button>
            )}
          </div>
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Search above and select the services you offer.
        </p>
      )}

      <div className="space-y-2">
        {value.map((service) => (
          <div key={service.name} className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30">
              <button
                type="button"
                className="flex items-center gap-2 flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
                onClick={() => toggleExpanded(service.name)}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expanded[service.name] && "rotate-180",
                  )}
                />
                {service.name}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({PRICING_LABELS[service.pricingType]})
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeService(service.name)}
                className="text-muted-foreground hover:text-destructive transition-colors ml-2 p-0.5"
                aria-label={`Remove ${service.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {expanded[service.name] && (
              <div className="px-3 py-3 space-y-3 border-t bg-background">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Pricing Type
                  </Label>
                  <Select
                    value={service.pricingType}
                    onValueChange={(v) =>
                      updateService(service.name, { pricingType: v as PricingType })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(PRICING_LABELS) as [PricingType, string][]).map(
                        ([v, l]) => (
                          <SelectItem key={v} value={v}>
                            {l}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {service.pricingType !== "custom_quote" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Price (R) — stored privately, not shown publicly
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        R
                      </span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={service.price ?? ""}
                        onChange={(e) =>
                          updateService(service.name, {
                            price: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="pl-7 h-9 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`cq-${service.serviceId}`}
                    checked={service.customQuoteAvailable}
                    onCheckedChange={(v) =>
                      updateService(service.name, { customQuoteAvailable: !!v })
                    }
                  />
                  <Label
                    htmlFor={`cq-${service.serviceId}`}
                    className="text-xs cursor-pointer"
                  >
                    Custom quote available on request
                  </Label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
