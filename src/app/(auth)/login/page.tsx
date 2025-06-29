import { Suspense } from "react";
import { Metadata } from "next";

import { Box } from "@mui/material";
import LoginForm from "@/src/auth/login";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <Box>
      <Suspense>
        <LoginForm />
      </Suspense>
    </Box>
  );
}
