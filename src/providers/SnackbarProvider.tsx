"use client"; // se estiver no App Router

import { SnackbarProvider } from "notistack";
import ErrorNotification from "../components/notistack/ErrorNotification";

export default function SnackbarClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      Components={{
        errorMUI: ErrorNotification,
      }}
      maxSnack={3}
    >
      {children}
    </SnackbarProvider>
  );
}
