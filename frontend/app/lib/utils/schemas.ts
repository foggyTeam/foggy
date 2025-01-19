import z from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9._]+\.[a-zA-Z]{2,}$/;

export const loginFormSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required')
    .max(100, 'Email must be no more than 100 characters long')
    .email('Email must be valid')
    .regex(
      emailRegex,
      'Email may contain only latin letters, digits and special symbols ".@_"',
    ),

  password: z
    .string()
    .nonempty('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(20, 'Password must be no more than 20 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least 1 letter and 1 number',
    ),
});

export type loginForm = z.infer<typeof loginFormSchema>;
