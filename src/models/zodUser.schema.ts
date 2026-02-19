import { z } from 'zod';

export const SignupSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).trim(),
    email: z.string().email("Invalid email format").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters").trim(). regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
    phone: z.string().optional(),
    })
});

//   name: z.string().min(2, "Name is too short"),
//     email: z.string().email("Invalid email address"),
//     password: z.string().min(8, "Password must be at least 8 characters"),
//     phone: z.string().optional(),

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email"),
    password: z.string().min(1, "Password is required"),
  })
});

// src/schemas/user.schema.ts (Add this)
export const UpdateMeSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).strict() // .strict() prevents users from sending fields like "role" or "password"
});


// THE PRO MOVE: Derive TypeScript types from the Zod schemas
export type SignupInput = z.infer<typeof SignupSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>['body'];