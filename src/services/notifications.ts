"use client";

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  deleteDoc, 
  writeBatch
} from "firebase/firestore";
import { db } from "@/config/firebase";

export const initializeNotifications = async (userId: string) => {
  // FCM integration can be added here
  return true;
};

export const subscribeToTopic = async (topic: string) => {
  return true;
};

export const unsubscribeFromTopic = async (topic: string) => {
  return true;
};

export const getUnreadNotificationCount = async (userId: string) => {
  const notifsRef = collection(db, "notifications");
  const q = query(notifsRef, where("userId", "==", userId), where("read", "==", false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const notifsRef = collection(db, "notifications");
  const q = query(notifsRef, where("userId", "==", userId), where("read", "==", false));
  const querySnapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  
  await batch.commit();
};

export const deleteNotification = async (notificationId: string) => {
  const notRef = doc(db, "notifications", notificationId);
  await deleteDoc(notRef);
};