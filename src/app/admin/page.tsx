"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collectionGroup, getDocs } from "firebase/firestore";

const ADMIN_EMAIL = "elkay40@gmail.com";

interface Plan {
  name: string;
  eventType: string;
  eventDate: any;
  eventLocation: string;
  expectedGuests: number;
  grandTotal: number;
  collaborators: any[];
  collaboratorEmails: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filtered, setFiltered] = useState<Plan[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login?redirect=/admin");
        return;
      }
      setUserEmail(user.email || "");
      if (user.email !== ADMIN_EMAIL) {
        setError(`Access denied. Logged in as ${user.email}`);
        setLoading(false);
        return;
      }
      try {
        const db = getFirestore();
        const snap = await getDocs(collectionGroup(db, "budgets"));
        const data: Plan[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          data.push({
            name: d.name || d.planName || "—",
            eventType: d.eventType || "",
            eventDate: d.eventDate || null,
            eventLocation: d.eventLocation || "",
            expectedGuests: d.expectedGuests || 0,
            grandTotal: d.grandTotal || 0,
            collaborators: d.collaborators || [],
            collaboratorEmails: d.collaboratorEmails || [],
          });
        });
        setPlans(data);
        setFiltered(data);
      } catch (e: any) {
        console.error("ADMIN ERROR:", e.code, e.message);
        setError(`${e.code}: ${e.message}`);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const s = search.toLowerCase();
    const t = typeFilter.toLowerCase();
    setFiltered(
      plans.filter((p) => {
        const ms = !s || [p.name, p.eventLocation, p.eventType].some((v) =>
          (v || "").toLowerCase().includes(s)
        );
        const mt = !t || (p.eventType || "").toLowerCase() === t;
        return ms && mt;
      })
    );
  }, [search, typeFilter, plans]);

  const totalGuests = plans.reduce((s, p) => s + (p.expectedGuests || 0), 0);
  const totalBudget = plans.reduce((s, p) => s + (p.grandTotal || 0), 0);
  const withBudget = plans.filter((p) => p.grandTotal > 0).length;
  const collaborated = plans.filter(
    (p) => p.collaborators?.length > 0 || p.collaboratorEmails?.length > 0
  ).length;

  const typeCounts: Record<string, number> = {};
  plans.forEach((p) => {
    const t = (p.eventType || "unknown").toLowerCase();
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const locCounts: Record<string, number> = {};
  plans.forEach((p) => {
    if (p.eventLocation) {
      const l = p.eventLocation.split(",")[0].trim();
      if (l) locCounts[l] = (locCounts[l] || 0) + 1;
    }
  });
  const topLocs = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const formatDate = (d: any) => {
    if (!d) return "—";
    try {
      const dt = d.toDate ? d.toDate() : new Date(d);
      return dt.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
    } catch { return "—"; }
  };

  const typeColor: Record<string, string> = {
    wedding: "bg-purple-500/20 text-purple-300",
    umgidi: "bg-pink-500/20 text-pink-300",
    umemulo: "bg-green-500/20 text-green-300",
    funeral: "bg-orange-500/20 text-orange-300",
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-ce