import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import app from "@/lib/firebase";

export async function GET(req: NextRequest) {
  // Example: return a simple message or check Firebase connection
  return NextResponse.json({ message: "Firebase initialized successfully!" });
}
