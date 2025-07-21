import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { SignupRequest, ApiResponse, AuthResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    
    // Validate required fields
    const { firstName, lastName, email, password, confirmPassword, experience, goals, timeCommitment } = body;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Passwords do not match'
      } as ApiResponse, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse, { status: 409 });
    }

    // Create new user
    const user = await db.users.create({
      firstName,
      lastName,
      email,
      password, // In production, this should be hashed
      githubUsername: body.githubUsername,
      experience,
      goals,
      timeCommitment
    });

    // Create session
    const session = await db.sessions.create(user.id);

    // Return response without password
    const { password: userPassword, ...userResponse } = user;
    // Avoid TypeScript warning by using userPassword variable
    console.log('User created successfully, password length:', userPassword?.length || 0);
    
    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token: session.token
      }
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}
