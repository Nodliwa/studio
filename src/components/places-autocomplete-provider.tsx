"use client";

import { useLoadScript } from "@react-google-maps/api";
import React from "react";

const libraries: "places"[] = ["places"];

export const PlacesAutocompleteProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
