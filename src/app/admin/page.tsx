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

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/login");
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
        setError(e.message);
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
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-mono">Loading plans...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-red-400 font-mono text-sm">⚠ {error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-mono">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">S</div>
            <span className="font-bold text-lg tracking-tight">Simpli<span className="text-purple-400">Plan</span></span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">Admin</span>
          </div>
          <p className="text-xs text-gray-600">{plans.length} total plans</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Plans", value: plans.length, sub: "across all users", color: "text-purple-400" },
            { label: "Total Guests", value: totalGuests.toLocaleString(), sub: "expected attendance", color: "text-pink-400" },
            { label: "Total Budget", value: `R${Math.round(totalBudget / 1000)}k`, sub: `${withBudget} plans budgeted`, color: "text-green-400" },
            { label: "Collaborated", value: collaborated, sub: "shared plans", color: "text-orange-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#12121a] border border-gray-800 rounded-xl p-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color} leading-none mb-1`}>{s.value}</p>
              <p className="text-[11px] text-gray-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Event Types */}
          <div className="bg-[#12121a] border border-gray-800 rounded-xl p-5">
            <div className="flex justify-between mb-4">
              <p className="font-bold text-sm">Events by Type</p>
              <p className="text-xs text-gray-600">{sortedTypes.length} types</p>
            </div>
            <div className="space-y-3">
              {sortedTypes.map(([type, count], i) => {
                const colors = ["#7c6aff","#ff6a9b","#6affb8","#ffb86a","#6ab8ff"];
                const pct = (count / (sortedTypes[0]?.[1] || 1)) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize">{type}</span>
                      <span className="text-gray-600">{count} plan{count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-[#12121a] border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex justify-between p-5 pb-3">
              <p className="font-bold text-sm">Top Locations</p>
              <p className="text-xs text-gray-600">{Object.keys(locCounts).length} unique</p>
            </div>
            {topLocs.map(([loc, count]) => (
              <div key={loc} className="flex justify-between items-center px-5 py-2.5 border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                <span className="text-xs">{loc}</span>
                <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <p className="font-bold text-sm mb-4">All Plans</p>
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            className="flex-1 min-w-[200px] px-3 py-2 bg-[#12121a] border border-gray-800 rounded-lg text-sm outline-none focus:border-purple-500 placeholder-gray-700"
            placeholder="Search name, location, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 bg-[#12121a] border border-gray-800 rounded-lg text-sm outline-none cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            {sortedTypes.map(([t]) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="bg-[#12121a] border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {["Plan Name","Type","Date","Location","Guests","Budget","Collab"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-600">No plans found</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] capitalize ${typeColor[(p.eventType||"").toLowerCase()] || "bg-gray-800 text-gray-500"}`}>
                      {p.eventType || "unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(p.eventDate)}</td>
                  <td className="px-4 py-3 text-gray-400">{p.eventLocation || "—"}</td>
                  <td className="px-4 py-3">{p.expectedGuests || 0}</td>
                  <td className="px-4 py-3 font-bold text-green-400">
                    {p.grandTotal > 0 ? `R${p.grandTotal.toLocaleString()}` : <span className="text-gray-600">R0</span>}
                  </td>
                  <td className="px-4 py-3">
                    {(p.collaborators?.length || 0) + (p.collaboratorEmails?.length || 0) > 0
                      ? <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">+{(p.collaborators?.length||0)+(p.collaboratorEmails?.length||0)}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}