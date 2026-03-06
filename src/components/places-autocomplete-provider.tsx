"use client";

import { useLoadScript } from "@react-google-maps/api";
import React from "react";

const libraries: "places"[] = ["places"];

export const PlacesAutocompleteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Load the Maps script in the background – do NOT block children from rendering.
  // Individual components that need the Places API check `isLoaded` themselves.
  useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  return <>{children}</>;
};
