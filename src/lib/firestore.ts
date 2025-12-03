import { getFirestore, Firestore } from "firebase-admin/firestore";
import adminApp from "./firebaseAdmin";

let firestoreInstance: Firestore | null = null;

/**
 * Get Firestore instance with error handling
 */
export function getFirestoreInstance(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  try {
    if (!adminApp) {
      throw new Error(
        'Firebase Admin app is not initialized. Please check your Firebase configuration.'
      );
    }

    firestoreInstance = getFirestore(adminApp);
    return firestoreInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to initialize Firestore:', errorMessage);
    throw new Error(
      `Failed to initialize Firestore: ${errorMessage}\n` +
      `Please check your Firebase Admin SDK configuration.\n` +
      `See FIREBASE_SETUP.md for setup instructions.`
    );
  }
}

export const firestore = getFirestoreInstance();
