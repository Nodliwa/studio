import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const SEED_OPPS = [
  {
    serviceType: "Catering",
    city: "Durban, KwaZulu-Natal",
    location: "KwaMashu Community Hall, KwaMashu",
    daysFromNow: 45,
    budgetMin: 8000,
    budgetMax: 15000,
    opportunityStrength: "high",
    creditCost: 1,
    plannerName: "Zanele Dlamini",
    plannerPhone: "+27821234567",
  },
  {
    serviceType: "DJ / Sound System",
    city: "Johannesburg, Gauteng",
    location: "Sandton City Conference Centre, Sandton",
    daysFromNow: 23,
    budgetMin: 3500,
    budgetMax: 7000,
    opportunityStrength: "medium",
    creditCost: 1,
    plannerName: "Sipho Nkosi",
    plannerPhone: "+27831234567",
  },
  {
    serviceType: "Photography",
    city: "Cape Town, Western Cape",
    location: "Constantia Valley, Cape Town",
    daysFromNow: 67,
    budgetMin: 5000,
    budgetMax: 12000,
    opportunityStrength: "low",
    creditCost: 1,
    plannerName: "Fatima Davids",
    plannerPhone: "+27841234567",
  },
];

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authHeader.slice(7);

  try {
    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const adminDb = getFirestore(app);
    const now = new Date();
    const batch = adminDb.batch();

    for (const opp of SEED_OPPS) {
      const eventDate = new Date(now.getTime() + opp.daysFromNow * 24 * 60 * 60 * 1000);
      const ref = adminDb.collection("supplier_opportunities").doc();
      batch.set(ref, {
        serviceType: opp.serviceType,
        city: opp.city,
        location: opp.location,
        eventDate: Timestamp.fromDate(eventDate),
        budgetMin: opp.budgetMin,
        budgetMax: opp.budgetMax,
        opportunityStrength: opp.opportunityStrength,
        creditCost: opp.creditCost,
        status: "active",
        targetedSupplierIds: [uid],
        unlockedBy: {},
        plannerId: null,
        plannerName: opp.plannerName,
        plannerPhone: opp.plannerPhone,
        createdAt: Timestamp.now(),
      });
    }

    await batch.commit();
    return NextResponse.json({ success: true, seeded: SEED_OPPS.length });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
