"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export default function QueryClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
