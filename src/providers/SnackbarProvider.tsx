"use client"; // se estiver no App Router

import { SnackbarProvider } from "notistack";
import ErrorNotification from "../components/notistack/ErrorNotification";
import FloatingNotification from "../components/notistack/FloatingNotification";

export default function SnackbarClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      Components={{
        errorMUI: ErrorNotification,
        default: FloatingNotification,
      }}
      maxSnack={3}
    >
      {children}
    </SnackbarProvider>
  );
}
