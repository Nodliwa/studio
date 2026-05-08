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
        loaded: function(ph) {
          if (process.env.NODE_ENV === 'development') {
            ph.opt_out_capturing();
            ph.set_config({ disable_session_recording: true });
          }
        },
      }
    );

    // expose globally for debugging
    (window as any).posthog = posthog;
  }, []);

  return null;
}