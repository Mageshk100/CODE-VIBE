import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let firebaseInitialized = false;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('[Firebase Admin] Initialized successfully with service account credentials');
  } catch (err) {
    console.error('[Firebase Admin] Initialization failed:', err.message);
  }
} else {
  console.warn('[Firebase Admin] Warning: Missing service account environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
}

/**
 * Verify real Firebase ID Token using Firebase Admin SDK
 * Rejects expired, invalid or tampered tokens.
 */
export async function verifyToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Authentication token required');
  }

  if (!firebaseInitialized) {
    throw new Error('Firebase Admin SDK is not initialized. Please verify FIREBASE_* credentials in backend/.env');
  }

  return await admin.auth().verifyIdToken(idToken);
}

export default {
  admin,
  verifyToken,
};
