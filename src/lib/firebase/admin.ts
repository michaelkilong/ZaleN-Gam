import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  const sdkJson = process.env.FIREBASE_ADMIN_SDK_JSON;

  if (!sdkJson) {
    console.warn('FIREBASE_ADMIN_SDK_JSON not set. Firebase Admin features will be disabled.');
    return;
  }

  try {
    const serviceAccount = JSON.parse(sdkJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    console.error('FIREBASE_ADMIN_SDK_JSON appears to be invalid JSON. Make sure to paste the entire JSON content without newlines, or base64-encode it.');
  }
}

initializeFirebaseAdmin();

export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;

export default admin;
