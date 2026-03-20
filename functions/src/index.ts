/**
 * Cloud Functions - cleanup khi user bị xóa khỏi Firebase Auth
 *
 * Deploy: firebase deploy --only functions
 * Cần firebase.json và .firebaserc ở root project
 */
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Khi user bị xóa khỏi Firebase Auth → xóa dữ liệu liên quan trong Firestore
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const db = admin.firestore();

  const batch = db.batch();

  // 1. Xóa users/{uid}
  const userRef = db.collection("users").doc(uid);
  batch.delete(userRef);

  // 2. Xóa userProgress/{uid}
  const progressRef = db.collection("userProgress").doc(uid);
  batch.delete(progressRef);

  // 3. Xóa submissions có userId = uid
  const submissionsSnap = await db
    .collection("submissions")
    .where("userId", "==", uid)
    .get();
  submissionsSnap.docs.forEach((doc) => batch.delete(doc.ref));

  // 4. Xóa grading_results có studentId = uid
  const gradingSnap = await db
    .collection("grading_results")
    .where("studentId", "==", uid)
    .get();
  gradingSnap.docs.forEach((doc) => batch.delete(doc.ref));

  // 5. Xóa users/{uid}/drafts (subcollection)
  const draftsSnap = await db
    .collection("users")
    .doc(uid)
    .collection("drafts")
    .get();
  draftsSnap.docs.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
  console.log(`Cleaned up data for deleted user: ${uid}`);
});
