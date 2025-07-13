import z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const registerSchema = z
  .object({
    code: z
      .string()
      .length(6, "O código deve ter exatamente 9 caracteres alfanuméricos")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "O código deve conter apenas caracteres alfanuméricos"
      ),
    email: z.string().email("Informe um email válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação de senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Path to highlight the error
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
