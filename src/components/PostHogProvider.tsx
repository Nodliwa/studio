'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogProvider() {
  useEffect(() => {
    posthog.init(
      process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
      {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: true,
      }
    );

    // expose globally for debugging
    (window as any).posthog = posthog;
  }, []);

  return null;
}