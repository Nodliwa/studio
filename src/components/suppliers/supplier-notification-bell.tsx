"use client";

import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useSupplierNotifications } from "@/firebase/supplier-hooks";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { SupplierNotification } from "@/lib/supplier-types";
import type { WithId } from "@/firebase/firestore/use-collection";

interface Props {
  uid: string;
}

export function SupplierNotificationBell({ uid }: Props) {
  const firestore = useFirestore();
  const router = useRouter();
  const { data: notifications } = useSupplierNotifications(uid);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const handleClick = async (notif: WithId<SupplierNotification>) => {
    if (!notif.read) {
      await updateDoc(doc(firestore, "supplier_notifications", notif.id), {
        read: true,
      });
    }
    if (notif.opportunityId) {
      router.push("/suppliers/dashboard");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-1.5 text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-muted"
          aria-label="Supplier notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#1D9E75] text-white text-[9px] flex items-center justify-center font-bold leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <p className="font-semibold text-sm">Notifications</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left p-3 space-y-0.5 hover:bg-muted/50 transition-colors ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{notif.title}</p>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-[#1D9E75] shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/80">{notif.message}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {notif.createdAt?.toDate
                      ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })
                      : "just now"}
                  </p>
                </button>
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
    </DropdownMenu>
  );
}
