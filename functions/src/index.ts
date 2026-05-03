import {setGlobalOptions} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {beforeUserCreated} from "firebase-functions/v2/identity";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {CATEGORY_MAP} from "./supplier-category-map.js";

setGlobalOptions({maxInstances: 10});
initializeApp();
const db = getFirestore();

// Local types — functions environment cannot import from Next.js src/

interface ServiceOffering {
  name: string;
  status?: string;
}

interface SupplierData {
  services: ServiceOffering[];
  cityRegion: string;
  areasServed: string;
  profileCompletionPct: number;
  status?: string;
}

interface LeadData {
  status: string;
  plannerId: string;
  planId: string;
  itemId: string;
  itemName: string;
  mappedCategory: string;
  location: string;
  targetedSupplierIds?: string[];
}

// Helpers

/**
 * Splits a location string into city and province components.
 * @param {string} location - Comma-separated location string.
 * @return {{city: string, province: string}}
 */
function parseLocation(
  location: string
): {city: string; province: string} {
  const parts = location.split(",").map((p) => p.trim());
  return {city: parts[0] ?? "", province: parts[1] ?? ""};
}

/**
 * Scores how well a supplier's services match the lead category.
 * Returns 1.0 for exact match, 0.6 for keyword match, 0.0 otherwise.
 * @param {ServiceOffering[]} services - Supplier's service list.
 * @param {string} mappedCategory - Lead's mapped category name.
 * @return {number} Score: 0, 0.6, or 1.0.
 */
function computeServiceMatchScore(
  services: ServiceOffering[],
  mappedCategory: string
): number {
  const catLower = mappedCategory.toLowerCase();
  const mapEntry = CATEGORY_MAP.find(
    (e) => e.category.toLowerCase() === catLower
  );
  const keywords = mapEntry?.keywords ?? [];

  for (const service of services) {
    const svcLower = (service.name ?? "").toLowerCase();
    if (!svcLower) continue;
    if (svcLower === catLower) return 1.0;
    if (keywords.some((kw) => svcLower.includes(kw))) return 0.6;
  }
  return 0.0;
}

/**
 * Scores how well a supplier's location matches the lead location.
 * Returns 1.0 for city match, 0.5 for areas-served match, 0.0 otherwise.
 * @param {SupplierData} supplier - Supplier document data.
 * @param {string} city - Extracted city from lead location.
 * @param {string} province - Extracted province from lead location.
 * @return {number} Score: 0, 0.5, or 1.0.
 */
function computeLocationScore(
  supplier: SupplierData,
  city: string,
  province: string
): number {
  const cityLower = city.toLowerCase();
  const provinceLower = province.toLowerCase();
  const regionLower = (supplier.cityRegion ?? "").toLowerCase();
  const areasLower = (supplier.areasServed ?? "").toLowerCase();

  if (city && regionLower.includes(cityLower)) return 1.0;
  if (
    (city && areasLower.includes(cityLower)) ||
    (province && areasLower.includes(provinceLower))
  ) {
    return 0.5;
  }
  return 0.0;
}

// Cloud Functions

export const createUserProfile = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user?.uid) return;

  try {
    await db.collection("users").doc(user.uid).set(
      {
        email: user.email || "",
        displayName: user.displayName || "",
        knownAs: (user.displayName || "").split(" ")[0],
        phoneNumber: user.phoneNumber || "",
        photoURL: user.photoURL || "",
        createdAt: FieldValue.serverTimestamp(),
      },
      {merge: true}
    );
    logger.info(`createUserProfile: created users/${user.uid}`);
  } catch (err) {
    // Never throw — a thrown error here blocks the user from being created
    logger.error(`createUserProfile: failed for ${user.uid}`, err);
  }
});

export const matchSupplierToLead = onDocumentCreated(
  "supplier_opportunities/{opportunityId}",
  async (event) => {
    const opportunityId = event.params.opportunityId;
    const snap = event.data;

    if (!snap) {
      logger.warn(
        `matchSupplierToLead: no snapshot for ${opportunityId}`
      );
      return;
    }

    const lead = snap.data() as LeadData;

    // Guard: only process planner-created, unmatched, open leads
    if (lead.status !== "open") return;
    if (!lead.plannerId) return;
    if (lead.targetedSupplierIds && lead.targetedSupplierIds.length > 0) {
      return;
    }

    try {
      const {city, province} = parseLocation(lead.location ?? "");

      // Step 2: Load suppliers with non-zero profile completion.
      // Phase 3 optimisation: add composite indexes on (services,
      // cityRegion) to filter in Firestore instead of loading all.
      const suppliersSnap = await db
        .collection("suppliers")
        .where("profileCompletionPct", ">", 0)
        .get();

      // Step 3: Score each supplier
      const scored: {uid: string; score: number}[] = [];

      for (const supplierDoc of suppliersSnap.docs) {
        const supplier = supplierDoc.data() as SupplierData;

        if (supplier.status === "suspended") continue;

        const serviceMatchScore = computeServiceMatchScore(
          supplier.services ?? [],
          lead.mappedCategory
        );
        // Skip entirely if no service overlap
        if (serviceMatchScore === 0) continue;

        const profileCompletionScore =
          (supplier.profileCompletionPct ?? 0) / 100;
        const locationScore =
          computeLocationScore(supplier, city, province);

        // Phase 3 optimisation: replace per-supplier recency query
        // with a denormalised lastOpportunityAt field on the supplier
        // document to eliminate this O(N) query loop.
        const thirtyDaysAgo = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        );
        const recentSnap = await db
          .collection("supplier_opportunities")
          .where("targetedSupplierIds", "array-contains", supplierDoc.id)
          .where("createdAt", ">=", thirtyDaysAgo)
          .get();
        const recencyScore = Math.max(0, 1 - recentSnap.size / 10);

        const score =
          profileCompletionScore * 0.20 +
          serviceMatchScore * 0.40 +
          locationScore * 0.30 +
          recencyScore * 0.10;

        if (score >= 0.2) scored.push({uid: supplierDoc.id, score});
      }

      // Step 4: Sort descending, cap at 10
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, 10);
      const topUids = top.map((s) => s.uid);

      const batch = db.batch();

      // Step 5: Update lead with matched supplier list
      const opportunityRef = db
        .collection("supplier_opportunities")
        .doc(opportunityId);
      batch.update(opportunityRef, {
        targetedSupplierIds: topUids,
        matchedSupplierCount: topUids.length,
        status: topUids.length > 0 ? "open" : "unmatched",
        matchedAt: FieldValue.serverTimestamp(),
      });

      // Step 6: Update planner budget matchedCount
      const budgetRef = db.doc(
        `users/${lead.plannerId}/budgets/${lead.planId}`
      );
      batch.set(
        budgetRef,
        {supplierRequests: {[lead.itemId]: {matchedCount: topUids.length}}},
        {merge: true}
      );

      // Step 7: Notify each matched supplier
      for (const supplierUid of topUids) {
        const notifRef = db.collection("supplier_notifications").doc();
        batch.set(notifRef, {
          supplierId: supplierUid,
          type: "new_opportunity",
          title: "New Opportunity Matched",
          message: `A planner needs ${lead.itemName}` +
            ` in ${city || lead.location}.`,
          opportunityId,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // Step 8: Commit and log
      await batch.commit();
      logger.info(
        `matchSupplierToLead: matched ${topUids.length}` +
        ` suppliers for ${opportunityId}`
      );
    } catch (err) {
      // Log and exit gracefully — do not throw, prevents infinite retries
      logger.error(
        `matchSupplierToLead: failed for ${opportunityId}`, err
      );
    }
  }
);
