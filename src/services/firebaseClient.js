import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

/**
 * Real Firebase email and password sign-in
 */
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

/**
 * Real Firebase email and password registration
 */
export async function registerWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  const idToken = await cred.user.getIdToken();
  return { user: cred.user, idToken };
}

/**
 * Real Firebase password reset email dispatch
 */
export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
  return true;
}

/**
 * Real Firebase sign-out
 */
export async function logoutFirebase() {
  await signOut(auth);
}

export { auth, app };
export default {
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  logoutFirebase,
  auth,
  app,
};
