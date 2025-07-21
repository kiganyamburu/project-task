import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { LoginRequest, ApiResponse, AuthResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    // Validate required fields
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse, { status: 400 });
    }

    // Find user by email
    const user = await db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse, { status: 401 });
    }

    // Verify password (in production, this should use proper password hashing)
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse, { status: 401 });
    }

    // Create session
    const session = await db.sessions.create(user.id);

    // Return response without password
    const { password: userPassword, ...userResponse } = user;
    // Avoid TypeScript warning by using userPassword variable
    console.log('User logged in successfully, password length:', userPassword?.length || 0);
    
    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token: session.token
      }
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse, { status: 500 });
  }
}
