"use client";

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { getUserProfile, getUserProfiles as dbGetUserProfiles, getOpportunities } from "./database";

// Get all user profiles
export const getUserProfiles = async () => {
  return dbGetUserProfiles();
};

// Get user profile by ID
export const getUserProfileById = async (userId: string) => {
  return getUserProfile(userId);
};

// Delete user
export const deleteUser = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
};

// Get unverified opportunities
export const getUnverifiedOpportunities = async () => {
  const oppsRef = collection(db, "opportunities");
  const q = query(oppsRef, where("verified", "==", false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Approve opportunity
export const approveOpportunity = async (opportunityId: string) => {
  const oppRef = doc(db, "opportunities", opportunityId);
  await updateDoc(oppRef, {
    verified: true,
    updatedAt: new Date().toISOString(), // Or serverTimestamp() but keeping consistent with existing pattern
  });
};

// Reject opportunity
export const rejectOpportunity = async (opportunityId: string) => {
  const oppRef = doc(db, "opportunities", opportunityId);
  await deleteDoc(oppRef);
};

// Get admin analytics
export const getAdminAnalytics = async () => {
  const users = await getUserProfiles();
  const opportunities = await getOpportunities();
  
  const now = new Date();
  const activeOps = opportunities.filter((op: any) => new Date(op.deadline) > now);
  const pendingOps = opportunities.filter((op: any) => !op.verified);

  return {
    totalUsers: users.length,
    totalOpportunities: opportunities.length,
    activeOpportunities: activeOps.length,
    pendingApproval: pendingOps.length,
  };
};