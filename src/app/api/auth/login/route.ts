import { NextRequest, NextResponse } from 'next/server';
import { db, verifyPassword } from '@/lib/firestoreDb';
import { ApiResponse, AuthResponse } from '@/types/api';
import { formatFirestoreError, getFirestoreErrorInfo } from '@/lib/firestoreErrors';
import { validateRequestBody, loginSchema, LoginRequest } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Validate request body using Zod schema
    const validationResult = await validateRequestBody<LoginRequest>(request, loginSchema);
    
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse, { status: 401 });
    }

    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
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

  } catch (error: unknown) {
    console.error('Login error:', error);
    
    // Check if it's a Firestore error
    const errorInfo = getFirestoreErrorInfo(error);
    
    return NextResponse.json({
      success: false,
      error: errorInfo.userMessage || 'Internal server error'
    } as ApiResponse, { status: errorInfo.statusCode || 500 });
  }
}
