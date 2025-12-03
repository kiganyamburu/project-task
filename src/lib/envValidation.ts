/**
 * Environment Variable Validation
 * 
 * Validates required Firebase environment variables at startup
 * and provides helpful error messages if any are missing.
 */

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  errors: string[];
}

/**
 * Validates Firebase Client SDK environment variables
 */
export function validateFirebaseClientEnv(): ValidationResult {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missing: string[] = [];
  const errors: string[] = [];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
      errors.push(
        `Missing required environment variable: ${key}\n` +
        `  → This is needed for Firebase Client SDK initialization.\n` +
        `  → Get it from Firebase Console > Project Settings > Your apps > Web app config.`
      );
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    errors,
  };
}

/**
 * Validates Firebase Admin SDK environment variables
 */
export function validateFirebaseAdminEnv(): ValidationResult {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missing: string[] = [];
  const errors: string[] = [];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
      
      if (key === 'FIREBASE_PROJECT_ID') {
        errors.push(
          `Missing required environment variable: ${key}\n` +
          `  → This is your Firebase project ID.\n` +
          `  → Get it from Firebase Console > Project Settings > General tab.`
        );
      } else if (key === 'FIREBASE_CLIENT_EMAIL') {
        errors.push(
          `Missing required environment variable: ${key}\n` +
          `  → This is the service account email for Firebase Admin SDK.\n` +
          `  → Get it from Firebase Console > Project Settings > Service accounts tab.\n` +
          `  → Format: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
        );
      } else if (key === 'FIREBASE_PRIVATE_KEY') {
        errors.push(
          `Missing required environment variable: ${key}\n` +
          `  → This is the private key for Firebase Admin SDK.\n` +
          `  → Get it from Firebase Console > Project Settings > Service accounts tab.\n` +
          `  → Click "Generate new private key" to download the JSON file.\n` +
          `  → Extract the "private_key" field from the JSON.`
        );
      }
    }
  }

  // Additional validation for private key format
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && !privateKey.includes('BEGIN PRIVATE KEY')) {
    errors.push(
      `Warning: FIREBASE_PRIVATE_KEY may be incorrectly formatted.\n` +
      `  → It should start with "-----BEGIN PRIVATE KEY-----"\n` +
      `  → Make sure newlines are preserved (use \\n in .env file).`
    );
  }

  return {
    isValid: missing.length === 0,
    missing,
    errors,
  };
}

/**
 * Validates all Firebase environment variables
 */
export function validateFirebaseEnv(): ValidationResult {
  const clientResult = validateFirebaseClientEnv();
  const adminResult = validateFirebaseAdminEnv();

  const allMissing = [...clientResult.missing, ...adminResult.missing];
  const allErrors = [...clientResult.errors, ...adminResult.errors];

  return {
    isValid: clientResult.isValid && adminResult.isValid,
    missing: allMissing,
    errors: allErrors,
  };
}

/**
 * Throws an error with helpful messages if validation fails
 */
export function requireFirebaseClientEnv(): void {
  const result = validateFirebaseClientEnv();
  if (!result.isValid) {
    const errorMessage = [
      '❌ Firebase Client SDK environment variables are missing!',
      '',
      'Missing variables:',
      ...result.errors,
      '',
      'To fix this:',
      '1. Create a .env.local file in your project root',
      '2. Add the missing variables (see FIREBASE_SETUP.md for details)',
      '3. Restart your development server',
      '',
      'For more information, see: FIREBASE_SETUP.md',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Throws an error with helpful messages if validation fails
 */
export function requireFirebaseAdminEnv(): void {
  const result = validateFirebaseAdminEnv();
  if (!result.isValid) {
    const errorMessage = [
      '❌ Firebase Admin SDK environment variables are missing!',
      '',
      'Missing variables:',
      ...result.errors,
      '',
      'To fix this:',
      '1. Create a .env.local file in your project root',
      '2. Add the missing variables (see FIREBASE_SETUP.md for details)',
      '3. Restart your development server',
      '',
      '⚠️  WARNING: These are SECRET credentials. Never commit them to git!',
      '',
      'For more information, see: FIREBASE_SETUP.md',
    ].join('\n');

    throw new Error(errorMessage);
  }
}



