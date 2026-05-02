import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AgeGroup } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(value);
};

const MILESTONE_AGES = [18, 21, 30, 40, 50, 60] as const;

export function getAgeGroup(age: number): AgeGroup {
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 59) return 'adult';
  return 'senior';
}

export function isMilestoneBirthday(age: number): boolean {
  return (MILESTONE_AGES as readonly number[]).includes(age);
}
