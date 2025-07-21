import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Backend API is working!',
    data: {
      endpoints: [
        'POST /api/auth/signup - User registration',
        'POST /api/auth/login - User authentication',
        'GET /api/projects/recommendations - Get project recommendations',
        'POST /api/projects/recommendations - Get custom recommendations'
      ]
    }
  } as ApiResponse<{ endpoints: string[] }>);
}
