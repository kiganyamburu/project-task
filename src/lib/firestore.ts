import { getFirestore } from "firebase-admin/firestore";
import adminApp from "./firebaseAdmin";

export const firestore = getFirestore(adminApp);
