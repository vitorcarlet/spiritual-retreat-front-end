import { Metadata } from "next";
import LoginCodeContent from "@/src/auth/LoginCode";

export const metadata: Metadata = {
  title: "Login Code",
  description: "Enter your login code to access your account",
};

export default async function Page() {
  return <LoginCodeContent />;
}
