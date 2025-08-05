
import { Metadata } from "next";
import LoginPageContent from "@/src/auth/login";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  return <LoginPageContent />;
}
