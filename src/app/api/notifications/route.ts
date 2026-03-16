import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : {
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  if (serviceAccount.projectId && (serviceAccount.clientEmail || process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("Firebase Admin credentials missing. Notifications will not work.");
  }
}

const messaging = getMessaging();

export async function POST(request: Request) {
  try {
    const { token, payload } = await request.json();

    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await messaging.send(message);
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}