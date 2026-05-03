"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collectionGroup,
  getDocs,
  doc,
  getDoc,
  collection,
  updateDoc,
} from "firebase/firestore";

type Role = "admin" | "viewer";

interface Plan {
  userId: string;
  name: string;
  eventType: string;
  eventDate: any;
  eventLocation: string;
  expectedGuests: number;
  grandTotal: number;
  collaborators: any[];
  collaboratorEmails: any[];
  createdAt: any;
  last_activity_at: any;
  itemCount: number | null;
  plannerLastOpenedAt: any;
}

interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  isTestAccount: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [supplierCount, setSupplierCount] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth?redirect=/admin");
        return;
      }
      setUserEmail(user.email || "");
      try {
        const db = getFirestore();

        const roleDoc = await getDoc(doc(db, "admins", user.email!));
        if (!roleDoc.exists()) {
          setError("Access denied. You do not have dashboard access.");
          setLoading(false);
          return;
        }
        setRole(roleDoc.data()?.role as Role);

        const [usersSnap, suppliersCount, plansSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "suppliers")).then((s) => s.size),
          getDocs(collectionGroup(db, "budgets")),
        ]);

        const users: UserRecord[] = [];
        usersSnap.forEach((d) => {
          const u = d.data();
          users.push({
            id: d.id,
            email: u.email || "",
            displayName: u.displayName || "",
            phoneNumber: u.phoneNumber || "",
            isTestAccount: u.isTestAccount === true,
          });
        });
        setAllUsers(users);
        setSupplierCount(suppliersCount);

        const plans: Plan[] = [];
        plansSnap.forEach((d) => {
          const p = d.data();
          plans.push({
            userId: p.userId || "",
            name: p.name || p.planName || "—",
            eventType: p.eventType || "",
            eventDate: p.eventDate || null,
            eventLocation: p.eventLocation || "",
            expectedGuests: p.expectedGuests || 0,
            grandTotal: p.grandTotal || 0,
            collaborators: p.collaborators || [],
            collaboratorEmails: p.collaboratorEmails || [],
            createdAt: p.createdAt || null,
            last_activity_at: p.last_activity_at || null,
            itemCount: p.itemCount ?? null,
            plannerLastOpenedAt: p.plannerLastOpenedAt || null,
          });
        });
        setAllPlans(plans);
      } catch (e: any) {
        console.error("ADMIN ERROR:", e.code, e.message);
        setError(`${e.code}: ${e.message}`);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const testAccountIds = useMemo(
    () => new Set(allUsers.filter((u) => u.isTestAccount).map((u) => u.id)),
    [allUsers]
  );

  const realPlans = useMemo(
    () => allPlans.filter((p) => !testAccountIds.has(p.userId)),
    [allPlans, testAccountIds]
  );

  const realUsers = useMemo(
    () => allUsers.filter((u) => !u.isTestAccount),
    [allUsers]
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const t = typeFilter.toLowerCase();
    return realPlans.filter((p) => {
      const ms = !s || [p.name, p.eventLocation, p.eventType].some((v) =>
        (v || "").toLowerCase().includes(s)
      );
      const mt = !t || (p.eventType || "").toLowerCase() === t;
      return ms && mt;
    });
  }, [search, typeFilter, realPlans]);

  // ── Metrics (all based on realPlans) ──────────────────────────────────────
  const totalBudget = realPlans.reduce((s, p) => s + (p.grandTotal || 0), 0);
  const withBudget = realPlans.filter((p) => p.grandTotal > 0).length;
  const collaborated = realPlans.filter(
    (p) => p.collaborators?.length > 0 || p.collaboratorEmails?.length > 0
  ).length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const toDate = (v: any): Date | null => {
    if (!v) return null;
    try { return v.toDate ? v.toDate() : new Date(v); } catch { return null; }
  };

  const createdThisMonth = realPlans.filter((p) => {
    const d = toDate(p.createdAt);
    return d ? d >= startOfMonth : false;
  }).length;

  const activeThisWeek = realPlans.filter((p) => {
    const d = toDate(p.last_activity_at);
    return d ? d >= sevenDaysAgo : false;
  }).length;

  const plansWithItemCount = realPlans.filter((p) => p.itemCount !== null);
  const avgItems = plansWithItemCount.length > 0
    ? Math.round(plansWithItemCount.reduce((s, p) => s + (p.itemCount ?? 0), 0) / plansWithItemCount.length)
    : null;

  const openedInPlanner = realPlans.filter((p) => !!p.plannerLastOpenedAt).length;

  const typeCounts: Record<string, number> = {};
  realPlans.forEach((p) => {
    const t = (p.eventType?.trim() || "not set").toLowerCase();
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const locCounts: Record<string, number> = {};
  realPlans.forEach((p) => {
    if (p.eventLocation) {
      const l = p.eventLocation.split(",")[0].trim();
      if (l) locCounts[l] = (locCounts[l] || 0) + 1;
    }
  });
  const topLocs = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (d: any) => {
    const dt = toDate(d);
    if (!dt) return "—";
    return dt.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
  };

  const userLabel = (u: UserRecord) =>
    u.displayName || u.email || u.phoneNumber || u.id;

  const typeColor: Record<string, string> = {
    wedding: "bg-purple-500/20 text-purple-300",
    umgidi: "bg-pink-500/20 text-pink-300",
    umemulo: "bg-green-500/20 text-green-300",
    funeral: "bg-orange-500/20 text-orange-300",
  };

  const handleToggleTestAccount = async (userId: string, current: boolean) => {
    if (role !== "admin") return;
    setTogglingUserId(userId);
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "users", userId), { isTestAccount: !current });
      setAllUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, isTestAccount: !current } : u)
      );
    } catch (e) {
      console.error("Toggle failed:", e);
    } finally {
      setTogglingUserId(null);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-mono">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center max-w-md px-6">
        <p className="text-red-400 font-mono text-sm mb-2">{error}</p>
        <p className="text-gray-600 text-xs">Signed in as: {userEmail}</p>
      </div>
    </div>
  );

  const testCount = testAccountIds.size;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="text-gray-100 font-mono">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">S</div>
            <span className="font-bold text-lg tracking-tight">Simpli<span className="text-purple-400">Plan</span></span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
              {role === "admin" ? "Admin" : "Viewer"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {testCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                {testCount} test account{testCount > 1 ? "s" : ""} excluded
              </span>
            )}
            <p className="text-xs text-gray-600">{userEmail} · {realPlans.length} plans</p>
          </div>
        </div>

        {/* Primary stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Plans", value: realPlans.length, sub: "excl. test accounts", color: "text-purple-400" },
            { label: "My-Plans Users", value: realUsers.length.toLocaleString(), sub: "registered planners", color: "text-pink-400" },
            { label: "Suppliers", value: supplierCount.toLocaleString(), sub: "registered suppliers", color: "text-cyan-400" },
            { label: "Total Budget", value: `R${Math.round(totalBudget / 1000)}k`, sub: `${withBudget} plans budgeted`, color: "text-green-400" },
            { label: "Collaborated", value: collaborated, sub: "shared plans", color: "text-orange-400" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#12121a" }} className="border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color} leading-none mb-1`}>{s.value}</p>
              <p className="text-xs text-gray-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Engagement metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Created This Month",
              value: createdThisMonth,
              sub: `${realPlans.filter(p => !p.createdAt).length} plans pre-tracking`,
              color: "text-violet-400",
            },
            {
              label: "Active (7 days)",
              value: activeThisWeek,
              sub: `${realPlans.filter(p => !p.last_activity_at).length} plans pre-tracking`,
              color: "text-sky-400",
            },
            {
              label: "Avg. Items / Plan",
              value: avgItems !== null ? avgItems : "—",
              sub: `${plansWithItemCount.length} plans tracked`,
              color: "text-amber-400",
            },
            {
              label: "Opened in Planner",
              value: openedInPlanner,
              sub: `${realPlans.length - openedInPlanner} never opened`,
              color: "text-rose-400",
            },
          ].map((s) => (
            <div key={s.label} style={{ background: "#12121a" }} className="border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color} leading-none mb-1`}>{s.value}</p>
              <p className="text-xs text-gray-600">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div style={{ background: "#12121a" }} className="border border-gray-800 rounded-xl p-5">
            <div className="flex justify-between mb-4">
              <p className="font-bold text-sm">Events by Type</p>
              <p className="text-xs text-gray-600">{sortedTypes.length} types</p>
            </div>
            <div className="space-y-3">
              {sortedTypes.map(([type, count], i) => {
                const colors = ["#7c6aff", "#ff6a9b", "#6affb8", "#ffb86a", "#6ab8ff"];
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

          <div style={{ background: "#12121a" }} className="border border-gray-800 rounded-xl overflow-hidden">
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

        {/* Plans table */}
        <p className="font-bold text-sm mb-4">All Plans</p>
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            style={{ background: "#12121a" }}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-800 rounded-lg text-sm outline-none focus:border-purple-500 placeholder-gray-700"
            placeholder="Search name, location, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ background: "#12121a" }}
            className="px-3 py-2 border border-gray-800 rounded-lg text-sm outline-none cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            {sortedTypes.map(([t]) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ background: "#12121a" }} className="border border-gray-800 rounded-xl overflow-x-auto mb-12">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {["Plan Name", "Type", "Date", "Location", "Guests", "Budget", "Collab"].map(h => (
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
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${typeColor[(p.eventType || "").toLowerCase()] || "bg-gray-800 text-gray-500"}`}>
                      {p.eventType?.trim() || "not set"}
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
                      ? <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">+{(p.collaborators?.length || 0) + (p.collaboratorEmails?.length || 0)}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Test Accounts Manager */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-sm">Test Accounts</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {testCount > 0
                  ? `${testCount} account${testCount > 1 ? "s" : ""} flagged — their plans are excluded from all metrics above`
                  : "No test accounts flagged — all metrics include every user"}
              </p>
            </div>
            {role !== "admin" && (
              <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">View only</span>
            )}
          </div>

          <div style={{ background: "#12121a" }} className="border border-gray-800 rounded-xl overflow-hidden">
            {allUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-600 text-xs">No users found</p>
            ) : (
              allUsers
                .slice()
                .sort((a, b) => Number(b.isTestAccount) - Number(a.isTestAccount))
                .map((u) => (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between px-5 py-3 border-b border-gray-800/60 last:border-0 transition-colors ${
                      u.isTestAccount ? "bg-yellow-500/5" : "hover:bg-gray-800/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.isTestAccount && (
                        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                          test
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{userLabel(u)}</p>
                        {u.displayName && u.email && (
                          <p className="text-xs text-gray-600 truncate">{u.email}</p>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={role !== "admin" || togglingUserId === u.id}
                      onClick={() => handleToggleTestAccount(u.id, u.isTestAccount)}
                      className={`shrink-0 ml-4 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                        u.isTestAccount ? "bg-yellow-500" : "bg-gray-700"
                      }`}
                      aria-label={u.isTestAccount ? "Unmark as test account" : "Mark as test account"}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          u.isTestAccount ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
