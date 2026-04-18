const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.deleteUserWithProfile = functions.https.onCall(async (request) => {
  const auth = request.auth;
  const data = request.data || {};
  const uid = String(data.uid || "").trim();

  if (!auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }

  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid is required.");
  }

  const requesterDoc = await admin.firestore().collection("users").doc(auth.uid).get();
  if (!requesterDoc.exists || requesterDoc.data().role !== "Admin") {
    throw new functions.https.HttpsError("permission-denied", "Only Admin can delete users.");
  }

  if (uid === auth.uid) {
    throw new functions.https.HttpsError("failed-precondition", "Admin cannot delete their own account.");
  }

  const profileRef = admin.firestore().collection("users").doc(uid);
  const profileSnapshot = await profileRef.get();
  if (!profileSnapshot.exists) {
    throw new functions.https.HttpsError("not-found", "User profile not found.");
  }

  const userRole = String(profileSnapshot.data().role || "");
  if (userRole === "Admin") {
    throw new functions.https.HttpsError("failed-precondition", "Cannot delete an admin account.");
  }

  try {
    await admin.auth().deleteUser(uid);
  } catch (error) {
    if (!(error && error.code === "auth/user-not-found")) {
      throw new functions.https.HttpsError("internal", "Failed to delete auth user.");
    }
  }

  await profileRef.delete();
  return { success: true };
});
