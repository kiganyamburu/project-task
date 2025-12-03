import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { ApiResponse } from '@/types/api';

/**
 * GET /api/user/profile
 * 
 * Get the authenticated user's profile
 * Requires: Authentication token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication - this route is fully protected
    const authResult = await requireAuth(request);
    
    // If authResult is a NextResponse, it's an error response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Return user profile (password is already excluded by authMiddleware)
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        githubUsername: user.githubUsername,
        experience: user.experience,
        goals: user.goals,
        timeCommitment: user.timeCommitment,
      },
    } as ApiResponse<typeof user>);
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}



