"use client";

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  orderBy, 
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/config/firebase";

// USER SERVICES
export const createUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

export const getUserProfiles = async () => {
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// OPPORTUNITIES
export const createOpportunity = async (data: any) => {
  const oppsRef = collection(db, "opportunities");
  const docRef = await addDoc(oppsRef, {
    ...data,
    views: 0,
    verified: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateOpportunity = async (opportunityId: string, data: any) => {
  const oppRef = doc(db, "opportunities", opportunityId);
  await updateDoc(oppRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getOpportunity = async (opportunityId: string) => {
  const oppRef = doc(db, "opportunities", opportunityId);
  const oppSnap = await getDoc(oppRef);
  if (oppSnap.exists()) {
    return { id: oppSnap.id, ...oppSnap.data() };
  }
  return null;
};

export const getOpportunities = async (options: any = {}) => {
  let oppsRef = collection(db, "opportunities");
  let q: any = oppsRef;

  const constraints = [];

  if (options.where) {
    Object.keys(options.where).forEach(key => {
      constraints.push(where(key, "==", options.where[key]));
    });
  }

  if (options.category) {
    constraints.push(where("category", "==", options.category));
  }

  if (options.sortBy) {
    constraints.push(orderBy(options.sortBy, "desc"));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  if (options.limit) {
    constraints.push(limit(options.limit));
  }

  if (constraints.length > 0) {
    q = query(oppsRef, ...constraints);
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
};

// SEARCH
export const searchOpportunities = async (searchTerm: string) => {
  const oppsRef = collection(db, "opportunities");
  const querySnapshot = await getDocs(oppsRef);
  const lowerTerm = searchTerm.toLowerCase();
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as any }))
    .filter(o => 
      o.title.toLowerCase().includes(lowerTerm) || 
      o.organization.toLowerCase().includes(lowerTerm)
    );
};

// BOOKMARKS
export const addBookmark = async (userId: string, opportunityId: string) => {
  const bookmarksRef = collection(db, "bookmarks");
  const docRef = await addDoc(bookmarksRef, {
    userId,
    opportunityId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const removeBookmark = async (userId: string, opportunityId: string) => {
  const bookmarksRef = collection(db, "bookmarks");
  const q = query(bookmarksRef, where("userId", "==", userId), where("opportunityId", "==", opportunityId));
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const getUserBookmarks = async (userId: string) => {
  const bookmarksRef = collection(db, "bookmarks");
  const q = query(bookmarksRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const isBookmarked = async (userId: string, opportunityId: string) => {
  const bookmarksRef = collection(db, "bookmarks");
  const q = query(bookmarksRef, where("userId", "==", userId), where("opportunityId", "==", opportunityId));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// APPLICATIONS
export const createApplication = async (userId: string, opportunityId: string) => {
  const appsRef = collection(db, "applications");
  const docRef = await addDoc(appsRef, {
    userId,
    opportunityId,
    status: "applied",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const appRef = doc(db, "applications", applicationId);
  await updateDoc(appRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const getUserApplications = async (userId: string) => {
  const appsRef = collection(db, "applications");
  const q = query(appsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// NOTIFICATIONS
export const getUserNotifications = async (userId: string) => {
  const notifsRef = collection(db, "notifications");
  const q = query(notifsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createNotification = async (userId: string, data: any) => {
  const notifsRef = collection(db, "notifications");
  const docRef = await addDoc(notifsRef, {
    userId,
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notRef = doc(db, "notifications", notificationId);
  await updateDoc(notRef, {
    read: true,
  });
};

// REAL-TIME LISTENER FOR NOTIFICATIONS
export const subscribeToNotifications = (userId: string, callback: (notifs: any[]) => void) => {
  const notifsRef = collection(db, "notifications");
  const q = query(notifsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifs);
  });
};