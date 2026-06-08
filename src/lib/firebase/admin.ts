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
    let serviceAccount;

    // Try JSON.parse first
    try {
      serviceAccount = JSON.parse(sdkJson);
    } catch (jsonError) {
      // If JSON.parse fails, try base64 decode
      try {
        const decoded = Buffer.from(sdkJson, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
        console.log('Firebase Admin SDK JSON was base64-encoded, decoded successfully.');
      } catch (base64Error) {
        throw new Error('FIREBASE_ADMIN_SDK_JSON is neither valid JSON nor valid base64. Please paste the raw JSON from the Firebase service account key file, or base64-encode it.');
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

initializeFirebaseAdmin();

export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;

export default admin;
