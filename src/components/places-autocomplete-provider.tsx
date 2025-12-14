"use client";

import React from "react";

// This component is kept for structural purposes but the script loading is now
// handled directly in the components that need it to prevent race conditions.
export const PlacesAutocompleteProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
