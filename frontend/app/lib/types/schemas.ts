import z from 'zod';
import settingsStore from '../../stores/settingsStore';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9._]+\.[a-zA-Z]{2,}$/;

export const loginFormSchema = z.object({
  email: z
    .string()
    .nonempty(settingsStore.t.validationErrors.email.required)
    .max(100, settingsStore.t.validationErrors.email.maxLength)
    .email(settingsStore.t.validationErrors.email.invalidEmail)
    .regex(emailRegex, settingsStore.t.validationErrors.email.invalidSymbols),

  password: z
    .string()
    .nonempty(settingsStore.t.validationErrors.password.required)
    .min(8, settingsStore.t.validationErrors.password.minLength)
    .max(20, settingsStore.t.validationErrors.password.maxLength)
    .regex(
      passwordRegex,
      settingsStore.t.validationErrors.password.invalidPassword,
    ),
});

export type loginForm = z.infer<typeof loginFormSchema>;
