import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import adminApp from "@/lib/firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    // Test Firebase Admin SDK initialization
    if (!adminApp) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Firebase Admin app is not initialized" 
        },
        { status: 500 }
      );
    }

    // Test Firestore connection
    const db = getFirestore(adminApp);
    
    // Try a simple read operation to verify credentials
    // This will fail if credentials are invalid
    const testCollection = db.collection('_test');
    await testCollection.limit(1).get();

    return NextResponse.json({ 
      success: true, 
      message: "Firebase Admin SDK initialized and connected successfully!",
      projectId: adminApp.options.projectId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        success: false,
        error: "Firebase Admin SDK connection failed",
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        troubleshooting: {
          hint: "Check your FIREBASE_PRIVATE_KEY format in .env.local",
          commonIssues: [
            "Private key must include BEGIN/END markers",
            "Newlines must be escaped as \\n in .env file",
            "Private key should be wrapped in quotes",
            "Make sure you copied the entire key from the JSON file"
          ]
        }
      },
      { status: 500 }
    );
  }
}



