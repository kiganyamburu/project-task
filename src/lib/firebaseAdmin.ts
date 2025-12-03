import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { requireFirebaseAdminEnv } from "./envValidation";

// Validate environment variables at startup
requireFirebaseAdminEnv();

/**
 * Cleans and formats the private key from environment variable
 * Handles various formats and ensures proper newline characters
 */
function cleanPrivateKey(privateKey: string | undefined): string {
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set');
  }

  // Remove surrounding quotes if present (single or double)
  let cleaned = privateKey.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // CRITICAL: Remove spaces before escaped newlines first
  // This handles cases like "                    \n" where spaces precede the \n
  cleaned = cleaned.replace(/\s+\\n/g, "\\n");
  cleaned = cleaned.replace(/\s+\\r/g, "\\r");
  
  // Replace escaped newlines with actual newlines (handles \n, \\n, etc.)
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\\r/g, "\r");
  
  // Remove any leading/trailing whitespace after quote removal
  cleaned = cleaned.trim();
  
  // Normalize all newlines to \n first (before line-by-line processing)
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\r/g, "\n");
  
  // CRITICAL: Remove leading/trailing whitespace from each line
  // This handles cases where the key was copied with indentation/spaces
  // Split into lines, trim each line, then rejoin
  const lines = cleaned.split('\n');
  cleaned = lines.map(line => line.trim()).join('\n');
  
  // Ensure the key has proper BEGIN/END markers
  if (!cleaned.includes('BEGIN PRIVATE KEY') && !cleaned.includes('BEGIN RSA PRIVATE KEY')) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is missing "-----BEGIN PRIVATE KEY-----" or "-----BEGIN RSA PRIVATE KEY-----" marker.\n' +
      'Please check that you copied the entire private key from the JSON file.'
    );
  }
  
  if (!cleaned.includes('END PRIVATE KEY') && !cleaned.includes('END RSA PRIVATE KEY')) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is missing "-----END PRIVATE KEY-----" or "-----END RSA PRIVATE KEY-----" marker.\n' +
      'Please check that you copied the entire private key from the JSON file.'
    );
  }
  
  // Ensure proper newlines between BEGIN/END markers and the key content
  // Handle both cases: keys with and without existing newlines
  if (cleaned.includes('BEGIN PRIVATE KEY')) {
    // Ensure newline after BEGIN marker (remove any existing, then add one)
    cleaned = cleaned.replace(
      /-----BEGIN PRIVATE KEY-----\s*/,
      '-----BEGIN PRIVATE KEY-----\n'
    );
    // Ensure newline before END marker (remove any existing, then add one)
    cleaned = cleaned.replace(
      /\s*-----END PRIVATE KEY-----/,
      '\n-----END PRIVATE KEY-----'
    );
  } else if (cleaned.includes('BEGIN RSA PRIVATE KEY')) {
    // Ensure newline after BEGIN marker
    cleaned = cleaned.replace(
      /-----BEGIN RSA PRIVATE KEY-----\s*/,
      '-----BEGIN RSA PRIVATE KEY-----\n'
    );
    // Ensure newline before END marker
    cleaned = cleaned.replace(
      /\s*-----END RSA PRIVATE KEY-----/,
      '\n-----END RSA PRIVATE KEY-----'
    );
  }
  
  // Remove any trailing newline after END marker
  cleaned = cleaned.replace(/\n+$/, '');
  
  // Clean up any excessive newlines (more than 2 consecutive) in the key content
  // This preserves the structure while removing extra whitespace
  const beginMarker = cleaned.includes('BEGIN PRIVATE KEY') 
    ? '-----BEGIN PRIVATE KEY-----' 
    : '-----BEGIN RSA PRIVATE KEY-----';
  const endMarker = cleaned.includes('END PRIVATE KEY') 
    ? '-----END PRIVATE KEY-----' 
    : '-----END RSA PRIVATE KEY-----';
  
  const beginIndex = cleaned.indexOf(beginMarker);
  const endIndex = cleaned.indexOf(endMarker);
  
  if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
    const beforeBegin = cleaned.substring(0, beginIndex);
    const keySection = cleaned.substring(beginIndex, endIndex + endMarker.length);
    const afterEnd = cleaned.substring(endIndex + endMarker.length);
    
    // Clean up the key section (remove excessive newlines but keep structure)
    const keySectionCleaned = keySection.replace(/\n{3,}/g, '\n\n');
    
    cleaned = beforeBegin + keySectionCleaned + afterEnd;
  }

  // Validate that the key content between markers looks valid
  // Extract the key content (between BEGIN and END markers)
  // Recalculate markers in case cleaned was modified
  const currentBeginMarker = cleaned.includes('BEGIN PRIVATE KEY') 
    ? '-----BEGIN PRIVATE KEY-----' 
    : '-----BEGIN RSA PRIVATE KEY-----';
  const currentEndMarker = cleaned.includes('END PRIVATE KEY') 
    ? '-----END PRIVATE KEY-----' 
    : '-----END RSA PRIVATE KEY-----';
  
  const currentBeginIndex = cleaned.indexOf(currentBeginMarker);
  const currentEndIndex = cleaned.indexOf(currentEndMarker);
  
  if (currentBeginIndex === -1 || currentEndIndex === -1 || currentEndIndex <= currentBeginIndex) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY has invalid format. BEGIN and END markers are not properly positioned.'
    );
  }
  
  // Extract the key content
  const keyContent = cleaned.substring(
    currentBeginIndex + currentBeginMarker.length,
    currentEndIndex
  );
  
  // CRITICAL: Clean the key content properly
  // Split into lines, trim each line (removes leading/trailing spaces)
  // Then filter out empty lines and rejoin
  const contentLines = keyContent.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Join the lines back together with newlines
  const cleanedKeyContent = contentLines.join('\n');
  
  // Reconstruct the full key with properly cleaned content
  cleaned = currentBeginMarker + '\n' + cleanedKeyContent + '\n' + currentEndMarker;
  
  // Validate that key content exists and looks like base64
  if (!cleanedKeyContent || cleanedKeyContent.length < 100) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY appears to be too short or empty. ' +
      'Please ensure you copied the complete private key from the JSON file.'
    );
  }
  
  // Check for common base64 characters (private keys are base64 encoded)
  // Allow newlines and base64 characters, but no spaces
  if (!/^[A-Za-z0-9+/=\n-]+$/.test(cleanedKeyContent.replace(/\n/g, ''))) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY contains invalid characters. ' +
      'Private keys should only contain base64 characters, newlines, and hyphens.'
    );
  }
  
  // Final check: ensure no spaces remain in the key content
  if (cleanedKeyContent.includes(' ') || cleanedKeyContent.includes('\t')) {
    // Remove any remaining spaces/tabs from key content
    const finalContent = cleanedKeyContent.replace(/[\s\t]+/g, '');
    // Reformat into 64-char lines if we had to remove spaces
    const reformatted = [];
    for (let i = 0; i < finalContent.length; i += 64) {
      reformatted.push(finalContent.substring(i, i + 64));
    }
    cleaned = currentBeginMarker + '\n' + reformatted.join('\n') + '\n' + currentEndMarker;
  }

  return cleaned;
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  }),
};

let adminApp: App;
try {
  adminApp = !getApps().length
    ? initializeApp(firebaseAdminConfig)
    : getApp();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Provide more specific error messages for common issues
  let helpfulMessage = '';
  if (errorMessage.includes('DECODER') || errorMessage.includes('DECODER routines')) {
    helpfulMessage = 
      '\n\n🔧 This error usually means the private key is malformed.\n' +
      'Common causes:\n' +
      '1. The private key was not copied completely from the JSON file\n' +
      '2. Newlines (\\n) are missing or incorrectly formatted\n' +
      '3. Extra spaces or characters were added during copy/paste\n\n' +
      'To fix:\n' +
      '1. Go to Firebase Console > Project Settings > Service accounts\n' +
      '2. Click "Generate new private key" if needed\n' +
      '3. Open the downloaded JSON file\n' +
      '4. Copy the ENTIRE "private_key" value (including BEGIN/END markers)\n' +
      '5. In .env.local, set: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"\n' +
      '6. Make sure to keep the \\n characters and wrap in quotes\n';
  } else if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized')) {
    helpfulMessage =
      '\n\n🔧 This error means the service account credentials are invalid.\n' +
      'Possible causes:\n' +
      '1. The service account key was revoked\n' +
      '2. Wrong project ID or client email\n' +
      '3. The service account was deleted\n\n' +
      'To fix: Generate a new private key from Firebase Console.\n';
  }
  
  throw new Error(
    `Failed to initialize Firebase Admin SDK: ${errorMessage}\n` +
    `Please check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.\n` +
    helpfulMessage +
    `See FIREBASE_SETUP.md for setup instructions.`
  );
}

export default adminApp;
