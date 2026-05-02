"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { signOutUser } from "@/firebase/auth-operations";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Bell, Home, LayoutGrid } from "lucide-react";
import { collection, query, where, doc, writeBatch, getDoc } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import type { SupplierNotification } from "@/lib/supplier-types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const RandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none">R</text>
  </svg>
);

export default function PageHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || user.isAnonymous || !firestore) return null;
    return query(collection(firestore, "notifications"), where("userId", "==", user.uid));
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.read && n.status === 'pending').length || 0;

  // Dual-role: check if this user also has a supplier profile
  const [isSupplier, setIsSupplier] = useState(false);
  useEffect(() => {
    if (isUserLoading || !user || user.isAnonymous) return;
    getDoc(doc(firestore, "suppliers", user.uid)).then((snap) => {
      setIsSupplier(snap.exists());
    });
  }, [isUserLoading, user, firestore]);

  // Supplier unread notifications — only fetched when dual-role is confirmed
  const supplierNotifsQuery = useMemoFirebase(() => {
    if (!isSupplier || !user || user.isAnonymous) return null;
    return query(
      collection(firestore, "supplier_notifications"),
      where("supplierId", "==", user.uid),
      where("read", "==", false),
    );
  }, [isSupplier, user, firestore]);
  const { data: supplierNotifs } = useCollection<SupplierNotification>(supplierNotifsQuery);
  const supplierUnreadCount = supplierNotifs?.length ?? 0;

  const handleSwitchToSupplier = () => {
    localStorage.setItem("simpliplan_active_role", "supplier");
    router.push("/suppliers/dashboard");
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOutUser(auth);
    router.push("/auth");
  };

  const handleApprove = async (notification: Notification) => {
    if (!firestore || !user) return;
    const batch = writeBatch(firestore);
    batch.update(doc(firestore, "notifications", notification.id), { status: 'approved', read: true });
    batch.update(doc(firestore, "users", user.uid, "budgets", notification.budgetId), {
      collaborators: [{ email: notification.inviteeContact, name: notification.inviteeName, rights: 'read/write' }],
      collaboratorEmails: [notification.inviteeContact],
    });
    const inviteeRef = doc(collection(firestore, "notifications"));
    batch.set(inviteeRef, {
      userId: notification.inviteeUid,
      type: 'collaborator_approved',
      budgetId: notification.budgetId,
      budgetName: notification.budgetName,
      inviteeName: notification.inviteeName,
      inviteeContact: notification.inviteeContact,
      inviteeUid: notification.inviteeUid,
      token: notification.token,
      status: 'approved',
      createdAt: new Date(),
      read: false,
    });
    await batch.commit();
  };

  const handleReject = async (notification: Notification) => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    batch.update(doc(firestore, "notifications", notification.id), { status: 'rejected', read: true });
    const inviteeRef = doc(collection(firestore, "notifications"));
    batch.set(inviteeRef, {
      userId: notification.inviteeUid,
      type: 'collaborator_rejected',
      budgetId: notification.budgetId,
      budgetName: notification.budgetName,
      inviteeName: notification.inviteeName,
      inviteeContact: notification.inviteeContact,
      inviteeUid: notification.inviteeUid,
      token: notification.token,
      status: 'rejected',
      createdAt: new Date(),
      read: false,
    });
    await batch.commit();
  };

  const markAllRead = async () => {
    if (!firestore || !notifications) return;
    const batch = writeBatch(firestore);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(firestore, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  const NotifContent = () => (
    <DropdownMenuContent align="end" className="w-80 p-0">
      <div className="p-3 border-b">
        <p className="font-semibold text-sm">Notifications</p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications && notifications.length > 0 ? (
          <div className="divide-y">
            {notifications.map((notif) => (
              <div key={notif.id} className={cn("p-3 space-y-2", !notif.read && "bg-primary/5")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {notif.type === 'collaborator_request' && (
                      <p className="text-sm font-medium"><span className="text-primary">{notif.inviteeName}</span> wants to collaborate on <span className="font-bold">{notif.budgetName}</span></p>
                    )}
                    {notif.type === 'collaborator_approved' && (
                      <p className="text-sm font-medium text-green-600">Your request to join <span className="font-bold">{notif.budgetName}</span> was approved!</p>
                    )}
                    {notif.type === 'collaborator_rejected' && (
                      <p className="text-sm font-medium text-destructive">Your request to join <span className="font-bold">{notif.budgetName}</span> was not approved.</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notif.inviteeContact} · {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                  </div>
                  {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
                {notif.type === 'collaborator_request' && notif.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => handleApprove(notif)}>Approve</Button>
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs text-destructive border-destructive/30" onClick={() => handleReject(notif)}>Reject</Button>
                  </div>
                )}
                {notif.status === 'approved' && notif.type === 'collaborator_request' && <p className="text-xs text-green-600 font-medium">Approved</p>}
                {notif.status === 'rejected' && notif.type === 'collaborator_request' && <p className="text-xs text-destructive font-medium">Rejected</p>}
                {notif.type === 'collaborator_approved' && (
                  <Button size="sm" className="w-full h-7 text-xs" onClick={() => router.push('/planner/' + notif.budgetId)}>Open Plan</Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </DropdownMenuContent>
  );

  const navLinks = (
    <>
      <Link href="/" className={cn("flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors", pathname === "/" ? "text-muted-foreground" : "text-primary")}>
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link href="/my-plans" className={cn("flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors", pathname === "/my-plans" ? "text-muted-foreground" : "text-primary")}>
        <LayoutGrid className="h-5 w-5" />
        <span className="text-[10px] font-medium">My Plans</span>
      </Link>
      <Link href="/pricing" className={cn("flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors", pathname === "/pricing" ? "text-muted-foreground" : "text-primary")}>
        <RandIcon />
        <span className="text-[10px] font-medium">Pricing</span>
      </Link>
      <Link href="/suppliers" className="flex flex-col items-center justify-center px-3 py-1 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        <span className="text-[10px] font-medium">Suppliers</span>
      </Link>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[hsl(210,55%,93%)] shadow-md">
        <div className="w-full flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/images/brand2.png" alt="SimpliPlan Logo" width={143} height={36} className="w-[120px] h-auto md:w-[143px]" priority />
          </Link>
          <nav className="hidden md:flex items-center justify-center gap-6 text-lg">
            <Link href="/" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}>Home</Link>
            <Link href="/my-plans" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/my-plans" ? "text-foreground" : "text-foreground/60")}>MyPlans</Link>
            <Link href="/pricing" className={cn("font-bold transition-colors hover:text-foreground/80", pathname === "/pricing" ? "text-foreground" : "text-foreground/60")}>Pricing</Link>
            <Link href="/suppliers" className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors font-normal">Suppliers</Link>
          </nav>
          {!isUserLoading && user && !user.isAnonymous ? (
            <div className="flex items-center gap-2 md:gap-3">
              {isSupplier && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-xs"
                  onClick={handleSwitchToSupplier}
                >
                  Switch to Supplier
                </Button>
              )}
              <div className="hidden md:block">
                <DropdownMenu onOpenChange={(open) => { if (open) markAllRead(); }}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{unreadCount}</span>}
                      {supplierUnreadCount > 0 && (
                        <span
                          onClick={(e) => { e.stopPropagation(); handleSwitchToSupplier(); }}
                          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#1D9E75] text-white text-[9px] flex items-center justify-center font-bold cursor-pointer"
                          title="Unread supplier notifications"
                        >
                          S
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <NotifContent />
                </DropdownMenu>
              </div>
              <Link href="/profile">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/60 transition-all">
                  <AvatarImage src={user.photoURL || undefined} alt="Profile" />
                  <AvatarFallback className="text-sm font-medium">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="sm" className="text-sm md:text-lg" onClick={handleLogout}>Get Out</Button>
            </div>
          ) : (
            <Button asChild size="sm" className="text-sm md:text-lg">
              <Link href="/auth">Get In</Link>
            </Button>
          )}
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[hsl(210,55%,93%)] border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navLinks}
          {!isUserLoading && user && !user.isAnonymous && (
            <DropdownMenu onOpenChange={(open) => { if (open) markAllRead(); }}>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-primary transition-colors">
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{unreadCount}</span>}
                    {supplierUnreadCount > 0 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); handleSwitchToSupplier(); }}
                        className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#1D9E75] text-white text-[8px] flex items-center justify-center font-bold cursor-pointer"
                        title="Unread supplier notifications"
                      >
                        S
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">Alerts</span>
                </button>
              </DropdownMenuTrigger>
              <NotifContent />
            </DropdownMenu>
          )}
        </div>
      </nav>

      <div className="md:hidden h-16" />
    </>
  );
}
