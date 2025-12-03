/**
 * Input Validation Middleware
 * 
 * Provides centralized, type-safe validation using Zod schemas
 * for all API request bodies and query parameters.
 */

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  success: false;
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Email validation schema
 */
const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * Minimum 8 characters, with at least one letter and one number
 */
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Name validation schema
 */
const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * GitHub username validation schema
 */
const githubUsernameSchema = z.string()
  .min(1, 'GitHub username is required')
  .max(39, 'GitHub username must be less than 39 characters')
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,37}[a-zA-Z0-9]$/, 'Invalid GitHub username format')
  .optional();

/**
 * Experience level validation
 */
const experienceSchema = z.enum(['beginner', 'intermediate', 'advanced'], {
  message: 'Experience must be beginner, intermediate, or advanced',
});

/**
 * Goals validation schema
 */
const goalsSchema = z.array(z.string().min(1, 'Goal cannot be empty').max(200, 'Goal must be less than 200 characters'))
  .min(1, 'At least one goal is required')
  .max(10, 'Maximum 10 goals allowed');

/**
 * Time commitment validation schema
 */
const timeCommitmentSchema = z.string()
  .regex(/^(\d+-\d+|\d+\+)$/, 'Time commitment must be in format "X-Y" or "X+" (e.g., "5-10" or "10+")')
  .min(1, 'Time commitment is required');

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Signup request validation schema
 */
export const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  githubUsername: githubUsernameSchema,
  experience: experienceSchema,
  goals: goalsSchema,
  timeCommitment: timeCommitmentSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * Project recommendations POST request validation schema
 */
export const projectRecommendationsSchema = z.object({
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  interests: z.array(z.string().min(1).max(100)).optional(),
  preferredTechnologies: z.array(z.string().min(1).max(100)).optional(),
  userId: z.string().uuid('Invalid user ID format').optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

/**
 * Project recommendations GET query parameters validation schema
 */
export const projectRecommendationsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format').optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  interests: z.string().optional(), // Comma-separated string
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
});

// ============================================================================
// Validation Middleware
// ============================================================================

/**
 * Validates request body against a Zod schema
 * Returns validated data or a validation error response
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors
      const errors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      // Create a user-friendly error message
      const errorMessage = errors.length === 1
        ? errors[0].message
        : `Validation failed: ${errors.map((e) => `${e.field} - ${e.message}`).join(', ')}`;

      const errorResponse: ValidationErrorResponse = {
        success: false,
        error: errorMessage,
        errors,
      };

      return {
        success: false,
        response: NextResponse.json(errorResponse as ApiResponse, { status: 400 }),
      };
    }

    // Handle JSON parsing errors
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        } as ApiResponse,
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates query parameters against a Zod schema
 * Returns validated data or a validation error response
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string | string[] | undefined> = {};
    
    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      // Handle comma-separated values (e.g., interests)
      if (value.includes(',')) {
        params[key] = value.split(',').map(v => v.trim());
      } else {
        params[key] = value;
      }
    });

    const validatedData = schema.parse(params);
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors
      const errors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const errorMessage = errors.length === 1
        ? errors[0].message
        : `Invalid query parameters: ${errors.map((e) => `${e.field} - ${e.message}`).join(', ')}`;

      const errorResponse: ValidationErrorResponse = {
        success: false,
        error: errorMessage,
        errors,
      };

      return {
        success: false,
        response: NextResponse.json(errorResponse as ApiResponse, { status: 400 }),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
        } as ApiResponse,
        { status: 400 }
      ),
    };
  }
}

/**
 * Type inference helpers for validated data
 */
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ProjectRecommendationsRequest = z.infer<typeof projectRecommendationsSchema>;
export type ProjectRecommendationsQuery = z.infer<typeof projectRecommendationsQuerySchema>;

