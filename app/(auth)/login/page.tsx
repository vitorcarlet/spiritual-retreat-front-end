import { Suspense } from "react";
import { Metadata } from "next";
import LoginPageContent from "@/src/auth/login";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
