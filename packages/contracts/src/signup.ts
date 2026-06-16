import { z } from 'zod';
import { emailSchema } from './common.js';
import { createOrganizationBodySchema } from './organizations.js';
import { passwordSchema } from './auth.js';
// ============================================================================
// 1. Live Domain Verification
// ============================================================================
export const verifyDomainQuerySchema = z.object({
  email: emailSchema,
});
export type VerifyDomainQuery = z.infer<typeof verifyDomainQuerySchema>;

export const verifyDomainResponseSchema = z.object({
  exists: z.boolean(),
});
export type VerifyDomainResponse = z.infer<typeof verifyDomainResponseSchema>;

// ============================================================================
// 2. Progressive Onboarding & OTP Flows
// ============================================================================

// Phase 1: POST /signup/email
export const emailInitiateSchema = z.object({
  email: emailSchema,
});
export type EmailInitiateSchema = z.infer<typeof emailInitiateSchema>;

// Phase 2: POST /signup/verify
export const verifyLinkSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required')
    // Assumes 32 random bytes converted to hex = 64 characters long
    .regex(/^[a-fA-F0-9]{64}$/, 'Invalid verification token format'),
});
export type VerifyLinkDto = z.infer<typeof verifyLinkSchema>;

// Phase 3: POST /signup/password
export const passwordSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type PasswordSignupSchema = z.infer<typeof passwordSignupSchema>;

// ============================================================================
// 3. Individual Signup (Legacy/Alternative)
// ============================================================================
export const individualSignupBodySchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});
export type IndividualSignupBody = z.infer<typeof individualSignupBodySchema>;

// ============================================================================
// 3.1. Finalize Registration (Post-Verification) - Shared by Both Individual & Organization Flows
// ============================================================================
export const finalizeRegistrationSchema = z
  .object({
    token: z.string().min(1, 'Session token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(8, 'Please confirm your password'),

    // 💡 Allow optional strings or empty values for account link flows
    firstName: z.string().trim().optional().or(z.literal('')),
    lastName: z.string().trim().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  // 🌲 Super Refine: Enforce name requirements ONLY if it's a fresh signup
  .superRefine((data, ctx) => {
    // If one name field is provided, we assume they are attempting a full registration track
    const isAttemptingNameRegistration =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      (data.firstName && data.firstName.length > 0) || (data.lastName && data.lastName.length > 0);

    if (isAttemptingNameRegistration) {
      if (!data.firstName || data.firstName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'First name must be at least 2 characters',
          path: ['firstName'],
        });
      }
      if (!data.lastName || data.lastName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last name must be at least 2 characters',
          path: ['lastName'],
        });
      }
    }
  });

export type FinalizeRegistrationDto = z.infer<typeof finalizeRegistrationSchema>;

// ============================================================================
// 4. Organization Signup
// ============================================================================
export const organizationSignupBodySchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  organization: createOrganizationBodySchema.extend({
    allowedDomains: z.array(z.string()).default([]),
    orgSize: z.enum(['1-10', '11-50', '51-200', '201+']),
    industry: z.enum(['FINANCE', 'TECHNOLOGY', 'HEALTHCARE', 'OTHER']),
    aiUsage: z.enum(['DEPLOYER', 'PROVIDER', 'NONE']),
  }),
});
export type OrganizationSignupBody = z.infer<typeof organizationSignupBodySchema>;
