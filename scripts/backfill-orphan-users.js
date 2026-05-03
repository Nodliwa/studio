#!/usr/bin/env node
"use strict";

/**
 * One-time backfill: creates users/{uid} documents for Firebase Auth accounts
 * that have plans in Firestore but no users/ doc.
 *
 * Run after deploying functions:
 *   node scripts/backfill-orphan-users.js
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Parse .env.local for Admin SDK credentials
const envRaw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
function envVar(name) {
  const m = envRaw.match(new RegExp(`^${name}="?([^"\n]+)"?`, "m"));
  if (!m) throw new Error(`Missing ${name} in .env.local`);
  return m[1].trim();
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "studio-1406892914-3d877",
    clientEmail: envVar("FIREBASE_CLIENT_EMAIL"),
    privateKey: envVar("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  }),
});

const authAdmin = admin.auth();
const db = admin.firestore();

// The 12 user IDs that have budget documents but no users/ doc.
// Identified by running the admin diagnostic on 2026-05-03.
const ORPHAN_UIDS = [
  "DGQWB7EnescJLoxFmGdigXEglWi1",
  "5qCHU9zZPiYHxgG8tT928OxazVB2",
  "9OtsbHHxt7c3aDoO5bbUVNxQIHX2",
  "KpqAfCbsIlVBXNKQH68V6aBaF1x1",
  "Mm23kzIuuGZa50t7ImLQlLR59ao1",
  "Ovymfa6BhpZdQZYbm9pb5LQ965M2",
  "kUpF19A29aT6nDbwXu23s2NlMZd2",
  "kZPTvlU9MwN2bDqUf71LgBGjnEJ2",
  "v8e6cfZEDccoe8M6PTApAEOy7Kg1",
  "w6ThQE5VwRg42SYCCeAlqmnxTVU2",
  "wqxx2gDeg5ceTSOadUKrXLoesIX2",
  "xhv4YsXt2uU0xhZllJEQzE9V6Oi2",
];

async function main() {
  console.log(`Backfilling ${ORPHAN_UIDS.length} orphan user docs...\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const uid of ORPHAN_UIDS) {
    const docRef = db.collection("users").doc(uid);

    // Safety: skip if a doc already exists (e.g. user registered between
    // the diagnostic run and this backfill)
    const existing = await docRef.get();
    if (existing.exists) {
      console.log(`  SKIP  ${uid} — doc already exists`);
      skipped++;
      continue;
    }

    // Fetch the Auth record so we can populate phone/email
    let authUser;
    try {
      authUser = await authAdmin.getUser(uid);
    } catch {
      console.warn(`  WARN  ${uid} — no Auth record, skipping`);
      errors++;
      continue;
    }

    try {
      await docRef.set(
        {
          email: authUser.email || "",
          displayName: authUser.displayName || "",
          knownAs: (authUser.displayName || "").split(" ")[0],
          phoneNumber: authUser.phoneNumber || "",
          photoURL: authUser.photoURL || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          backfilled: true,
        },
        { merge: true }
      );
      const contact = authUser.phoneNumber || authUser.email || "no contact info";
      console.log(`  OK    ${uid} (${contact})`);
      created++;
    } catch (err) {
      console.error(`  ERR   ${uid}`, err.message);
      errors++;
    }
  }

  console.log(`\nDone — created: ${created}, skipped: ${skipped}, errors: ${errors}`);
}

main().catch(console.error).finally(() => process.exit());
