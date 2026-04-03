import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { api, type UserNotification } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

function notificationBody(
  n: UserNotification,
  t: (key: string, opts?: Record<string, string>) => string,
): string {
  if (n.notificationType === "NEW_BOOKING" || n.status === "NEW_BOOKING") {
    return t("notifications.newBookingAdmin", {
      reference: n.bookingReference ?? "",
      activity: n.activityTitle ?? "",
    });
  }
  if (n.notificationType === "CONTACT_MESSAGE" || n.status === "CONTACT_MESSAGE") {
    return t("notifications.contactMessage", { subject: n.activityTitle || "" });
  }
  if (n.notificationType === "CONTACT_REPLY" || n.status === "CONTACT_REPLY") {
    return t("notifications.contactReply", { subject: n.activityTitle || "" });
  }
  const key = `notifications.status.${n.status}`;
  const translated = t(key, {
    reference: n.bookingReference ?? "",
    activity: n.activityTitle ?? "",
  });
  if (translated === key) {
    return t("notifications.status.UNKNOWN", {
      reference: n.bookingReference ?? "",
      activity: n.activityTitle ?? "",
      status: n.status,
    });
  }
  return translated;
}

function isContactReplyNotification(n: UserNotification): boolean {
  return n.notificationType === "CONTACT_REPLY" || n.status === "CONTACT_REPLY";
}

export default function NotificationBell({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { token, user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => api.getUnreadNotificationCount(),
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
    enabled: Boolean(token),
    retry: false,
  });

  const { data: page } = useQuery({
    queryKey: ["notifications-list"],
    queryFn: () => api.getNotifications(0, 40),
    enabled: open && Boolean(token),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    },
  });

  const allItems = page?.content ?? [];
  const items = allItems
    .filter((n) => !n.read)
    .slice()
    .sort((a, b) => Number(a.read) - Number(b.read));

  const openNotificationTarget = (n?: UserNotification) => {
    if (n && !n.read) {
      markReadMutation.mutate(n.id);
    }
    setOpen(false);
    if (!n) {
      if (user?.role === "ROLE_ADMIN") navigate("/admin/bookings");
      else navigate("/profile?tab=bookings");
      return;
    }
    const isNewBooking =
      n.notificationType === "NEW_BOOKING" || n.status === "NEW_BOOKING";
    if (isNewBooking && user?.role === "ROLE_ADMIN") {
      navigate("/admin/bookings");
      return;
    }
    const isContact =
      n.notificationType === "CONTACT_REPLY" ||
      n.status === "CONTACT_REPLY" ||
      n.notificationType === "CONTACT_MESSAGE" ||
      n.status === "CONTACT_MESSAGE";
    if (isContact) {
      if (user?.role === "ROLE_ADMIN") navigate("/admin/messages");
      else navigate("/profile?tab=messages");
      return;
    }
    navigate("/profile?tab=bookings");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 shrink-0 text-foreground hover:text-primary hover:bg-primary/10", className)}
          aria-label={t("notifications.title")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-5 min-w-5 px-1 flex items-center justify-center p-0 text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,22rem)] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">{t("notifications.title")}</span>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[min(60vh,320px)]">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-3 text-left text-sm transition-colors hover:bg-muted/60",
                      !n.read && "bg-primary/5",
                    )}
                    onClick={() => openNotificationTarget(n)}
                  >
                    <p className="text-foreground leading-snug">{notificationBody(n, t)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button variant="outline" className="w-full h-9 text-sm" onClick={() => openNotificationTarget()}>
            {user?.role === "ROLE_ADMIN" ? t("notifications.viewBookingsAdmin") : t("notifications.viewBookings")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
