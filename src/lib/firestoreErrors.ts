/**
 * Firestore Error Handling Utilities
 * 
 * Provides consistent error handling and user-friendly error messages
 * for Firestore operations.
 */

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  statusCode: number;
}

/**
 * Maps Firestore error codes to user-friendly messages
 */
export function getFirestoreErrorInfo(error: unknown): FirestoreErrorInfo {
  // Type guard to check if error has code and message properties
  const hasErrorCode = (err: unknown): err is { code?: string; message?: string } => {
    return typeof err === 'object' && err !== null;
  };
  
  let errorCode = (hasErrorCode(error) && error.code) ? error.code : 'unknown';
  const errorMessage = (hasErrorCode(error) && error.message) ? error.message : 'An unknown error occurred';
  
  // Check for decoder errors in the message (common Firebase credential issue)
  if (errorMessage.includes('DECODER') || errorMessage.includes('DECODER routines') || 
      errorMessage.includes('Getting metadata from plugin failed')) {
    errorCode = 'decoder-error';
  }

  // Firebase/Firestore error codes
  const errorMap: Record<string, Omit<FirestoreErrorInfo, 'message'>> = {
    // Permission errors
    'permission-denied': {
      code: 'permission-denied',
      userMessage: 'You do not have permission to perform this operation. Please check your authentication.',
      isRetryable: false,
      statusCode: 403,
    },
    'unauthenticated': {
      code: 'unauthenticated',
      userMessage: 'Authentication required. Please log in and try again.',
      isRetryable: false,
      statusCode: 401,
    },
    
    // Not found errors
    'not-found': {
      code: 'not-found',
      userMessage: 'The requested resource was not found.',
      isRetryable: false,
      statusCode: 404,
    },
    
    // Validation errors
    'invalid-argument': {
      code: 'invalid-argument',
      userMessage: 'Invalid data provided. Please check your input and try again.',
      isRetryable: false,
      statusCode: 400,
    },
    'failed-precondition': {
      code: 'failed-precondition',
      userMessage: 'Operation cannot be completed. Please try again later.',
      isRetryable: true,
      statusCode: 400,
    },
    
    // Resource errors
    'already-exists': {
      code: 'already-exists',
      userMessage: 'This resource already exists.',
      isRetryable: false,
      statusCode: 409,
    },
    'resource-exhausted': {
      code: 'resource-exhausted',
      userMessage: 'Service temporarily unavailable due to high demand. Please try again later.',
      isRetryable: true,
      statusCode: 429,
    },
    
    // Network/Connection errors
    'deadline-exceeded': {
      code: 'deadline-exceeded',
      userMessage: 'Request timed out. Please check your connection and try again.',
      isRetryable: true,
      statusCode: 504,
    },
    'unavailable': {
      code: 'unavailable',
      userMessage: 'Service is temporarily unavailable. Please try again in a moment.',
      isRetryable: true,
      statusCode: 503,
    },
    'aborted': {
      code: 'aborted',
      userMessage: 'Operation was aborted. Please try again.',
      isRetryable: true,
      statusCode: 409,
    },
    
    // Internal errors
    'internal': {
      code: 'internal',
      userMessage: 'An internal error occurred. Please try again later.',
      isRetryable: true,
      statusCode: 500,
    },
    'data-loss': {
      code: 'data-loss',
      userMessage: 'Data integrity error. Please contact support if this persists.',
      isRetryable: false,
      statusCode: 500,
    },
    
    // Credential/Decoder errors
    'decoder-error': {
      code: 'decoder-error',
      userMessage: 'Firebase credentials are invalid or malformed. Please check your environment variables.',
      isRetryable: false,
      statusCode: 500,
    },
    
    // Unknown errors
    'unknown': {
      code: 'unknown',
      userMessage: 'An unexpected error occurred. Please try again later.',
      isRetryable: false,
      statusCode: 500,
    },
  };

  const errorInfo = errorMap[errorCode] || errorMap['unknown'];

  return {
    ...errorInfo,
    message: errorMessage,
  };
}

/**
 * Checks if a Firestore error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = getFirestoreErrorInfo(error);
  return errorInfo.isRetryable;
}

/**
 * Creates a user-friendly error message from a Firestore error
 */
export function formatFirestoreError(error: unknown): string {
  const errorInfo = getFirestoreErrorInfo(error);
  return errorInfo.userMessage;
}

/**
 * Wraps a Firestore operation with error handling
 */
export async function handleFirestoreOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Firestore operation'
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    const errorInfo = getFirestoreErrorInfo(error);
    
    // Log detailed error for debugging (but don't expose to user)
    console.error(`Firestore error in ${operationName}:`, {
      code: errorInfo.code,
      message: errorInfo.message,
      originalError: error,
    });
    
    // Provide additional troubleshooting for decoder errors
    if (errorInfo.code === 'decoder-error') {
      console.error('\n🔧 DECODER Error Troubleshooting:');
      console.error('   1. Check your FIREBASE_PRIVATE_KEY in .env.local');
      console.error('   2. Ensure the private key includes BEGIN/END markers');
      console.error('   3. Make sure newlines are escaped as \\n');
      console.error('   4. The key should be wrapped in quotes');
      console.error('   5. Try regenerating the service account key from Firebase Console');
      console.error('   6. Run: npm run check-firebase\n');
    }

    // Create a new error with user-friendly message
    const userError = new Error(errorInfo.userMessage);
    // Add additional properties to the error object
    Object.assign(userError, {
      code: errorInfo.code,
      statusCode: errorInfo.statusCode,
      isRetryable: errorInfo.isRetryable,
      originalError: error,
    });
    
    throw userError;
  }
}

/**
 * Checks if Firestore is available
 */
export function isFirestoreAvailable(): boolean {
  try {
    // This will be checked at runtime when firestore is imported
    return true;
  } catch {
    return false;
  }
}

