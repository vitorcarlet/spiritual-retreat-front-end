import { Metadata } from "next";
import RegisterPageContent from "@/src/auth/register";
export const metadata: Metadata = {
  title: "Registre-se",
  description: "Cadastre-se para criar uma conta",
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
