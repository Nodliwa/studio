
"use client";

import { useLoadScript } from "@react-google-maps/api";
import React from "react";

const libraries: "places"[] = ["places"];

export const PlacesAutocompleteProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  if (!isLoaded) {
    // You can return a loading indicator here if needed
    return null;
  }

  return <>{children}</>;
};

    