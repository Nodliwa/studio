"use client";

import { useLoadScript } from "@react-google-maps/api";
import React, { createContext, useContext } from "react";

const libraries: "places"[] = ["places"];

const MapsLoadedContext = createContext(false);

export const useMapsLoaded = () => useContext(MapsLoadedContext);

export const PlacesAutocompleteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  return (
    <MapsLoadedContext.Provider value={isLoaded}>
      {children}
    </MapsLoadedContext.Provider>
  );
};
