import { NextRequest, NextResponse } from 'next/server';
import { db } from './firestoreDb';
import { ApiResponse } from '@/types/api';

/**
 * Authenticated user context
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  experience: string;
  goals: string[];
  timeCommitment: string;
  githubUsername?: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  session?: {
    id: string;
    token: string;
    expiresAt: Date;
  };
  error?: string;
  statusCode?: number;
}

/**
 * Extracts the authentication token from the request
 * Supports both Authorization header and query parameter
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
  }

  // Fallback to query parameter (for GET requests)
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (token) {
    return token;
  }

  return null;
}

/**
 * Verifies the authentication token and returns user information
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Extract token from request
    const token = extractToken(request);
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is required',
        statusCode: 401,
      };
    }

    // Find session by token
    const session = await db.sessions.findByToken(token);
    
    if (!session) {
      return {
        success: false,
        error: 'Invalid or expired authentication token',
        statusCode: 401,
      };
    }

    // Check if session is expired (additional check, though findByToken already does this)
    if (new Date(session.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Authentication token has expired',
        statusCode: 401,
      };
    }

    // Get user information
    const user = await db.users.findById(session.userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        statusCode: 404,
      };
    }

    // Return authenticated user (without password)
    const { password, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword as AuthenticatedUser,
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Internal server error during authentication',
      statusCode: 500,
    };
  }
}

/**
 * Middleware wrapper that requires authentication
 * Returns the authenticated user or an error response
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedUser; session: { id: string; token: string; expiresAt: Date } } | NextResponse> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.success || !authResult.user || !authResult.session) {
    return NextResponse.json(
      {
        success: false,
        error: authResult.error || 'Authentication required',
      } as ApiResponse,
      { status: authResult.statusCode || 401 }
    );
  }

  return {
    user: authResult.user,
    session: authResult.session,
  };
}

/**
 * Creates a consistent authentication error response
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required',
  statusCode: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    } as ApiResponse,
    { status: statusCode }
  );
}



