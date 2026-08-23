import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type Booking, type CustomTripRequest } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { formatIsoDateOnly } from "@/lib/dateDisplay";

/** Morocco (Marrakech) — same zone as Casablanca, year-round UTC+1 */
const MOROCCO_TZ = "Africa/Casablanca";

function formatDateTimeMorocco(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString(undefined, {
        timeZone: MOROCCO_TZ,
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function formatTourType(value?: string) {
  if (!value) return "—";
  const v = value.toLowerCase();
  if (v === "private") return "Private";
  if (v === "premium") return "Premium";
  return "Shared";
}

function formatComfortLevel(value?: string) {
  if (!value) return "—";
  return value.toLowerCase() === "luxury" ? "Luxury" : "Standard";
}

function formatBookingPrice(value?: number) {
  if (value == null) return "—";
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  PENDING: "bg-secondary/10 text-secondary",
  COMPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePage, setActivePage] = useState(0);
  const [cancelledPage, setCancelledPage] = useState(0);
  const [customPage, setCustomPage] = useState(0);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [view, setView] = useState<"bookings" | "custom">(() =>
    searchParams.get("view") === "custom" ? "custom" : "bookings",
  );
  const [bookingSegment, setBookingSegment] = useState<"active" | "cancelled">("active");
  const [detailCustom, setDetailCustom] = useState<CustomTripRequest | null>(null);
  const [customToDelete, setCustomToDelete] = useState<CustomTripRequest | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setView(searchParams.get("view") === "custom" ? "custom" : "bookings");
  }, [searchParams]);

  const setAdminView = (next: "bookings" | "custom") => {
    setView(next);
    const params = new URLSearchParams(searchParams);
    if (next === "custom") params.set("view", "custom");
    else params.delete("view");
    setSearchParams(params, { replace: true });
  };

  const activeBookingsQuery = useQuery({
    queryKey: ["adminBookings", "active", activePage, showHidden],
    queryFn: () => adminApi.getBookings(activePage, 20, showHidden, false),
    enabled: view === "bookings",
    staleTime: 0,
    gcTime: 0,
  });

  const cancelledBookingsQuery = useQuery({
    queryKey: ["adminBookings", "cancelled", cancelledPage, showHidden],
    queryFn: () => adminApi.getBookings(cancelledPage, 20, showHidden, true),
    enabled: view === "bookings",
    staleTime: 0,
    gcTime: 0,
  });

  const segmentQuery =
    bookingSegment === "cancelled" ? cancelledBookingsQuery : activeBookingsQuery;

  const customTripsQuery = useQuery({
    queryKey: ["adminCustomTripRequests", customPage],
    queryFn: () => adminApi.getCustomTripRequests(customPage, 20),
    enabled: view === "custom",
    staleTime: 0,
  });

  const data = view === "bookings" ? segmentQuery.data : customTripsQuery.data;
  const isLoading = view === "bookings" ? segmentQuery.isLoading : customTripsQuery.isLoading;
  const tableRows = view === "bookings" ? ((segmentQuery.data?.content as Booking[] | undefined) ?? []) : [];
  const bookingsTableLoading =
    view === "bookings" && (segmentQuery.isLoading || segmentQuery.isFetching);
  const page =
    view === "custom"
      ? customPage
      : bookingSegment === "cancelled"
        ? cancelledPage
        : activePage;
  const setPage =
    view === "custom"
      ? setCustomPage
      : bookingSegment === "cancelled"
        ? setCancelledPage
        : setActivePage;
  const activeCount = activeBookingsQuery.data?.totalElements;
  const cancelledCount = cancelledBookingsQuery.data?.totalElements;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      toast({ title: "Success", description: "Booking status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateHiddenMutation = useMutation({
    mutationFn: ({ id, hidden }: { id: number; hidden: boolean }) => adminApi.updateBookingHidden(id, hidden),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      setDetailBooking((prev) => (prev && prev.id === updated.id ? updated : prev));
      toast({
        title: "Success",
        description: updated.hidden ? "Booking hidden" : "Booking restored",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCustomStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateCustomTripRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCustomTripRequests"] });
      toast({ title: "Success", description: "Request status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCustomMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCustomTripRequest(id),
    onSuccess: (_void, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["adminCustomTripRequests"] });
      setCustomToDelete(null);
      setDetailCustom((prev) => (prev?.id === deletedId ? null : prev));
      const rows = (customTripsQuery.data?.content as CustomTripRequest[] | undefined) ?? [];
      if (rows.length <= 1 && customPage > 0) {
        setCustomPage(customPage - 1);
      }
      toast({ title: "Success", description: "Custom trip request deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBooking(id),
    onSuccess: (_void, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      setBookingToDelete(null);
      setDetailBooking((prev) => (prev?.id === deletedId ? null : prev));
      if (tableRows.length <= 1 && page > 0) {
        setPage(page - 1);
      }
      toast({ title: "Success", description: "Booking deleted permanently" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {bookingsTableLoading
              ? "Loading…"
              : view === "bookings"
                ? `${data?.totalElements ?? 0} ${
                    bookingSegment === "cancelled" ? "cancelled bookings" : "active bookings"
                  } · ${tableRows.length} on this page`
                : `${data?.totalElements ?? 0} custom trip requests`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={view === "bookings" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setAdminView("bookings");
              }}
            >
              Bookings
            </Button>
            <Button
              type="button"
              variant={view === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setCustomPage(0);
                setAdminView("custom");
              }}
            >
              Custom trips
            </Button>
          </div>
        </div>
        {view === "bookings" && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={bookingSegment === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActivePage(0);
                  setBookingSegment("active");
                }}
              >
                Active bookings{activeCount != null ? ` (${activeCount})` : ""}
              </Button>
              <Button
                type="button"
                variant={bookingSegment === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCancelledPage(0);
                  setBookingSegment("cancelled");
                }}
              >
                Cancelled bookings{cancelledCount != null ? ` (${cancelledCount})` : ""}
              </Button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground">Show hidden</span>
              <Switch
                checked={showHidden}
                onCheckedChange={(v) => {
                  setActivePage(0);
                  setCancelledPage(0);
                  setShowHidden(Boolean(v));
                }}
                aria-label="Show hidden bookings"
              />
            </div>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground/90">Travel / booked-on dates</strong> are the calendar days stored
          for the reservation (no timezone shift).{" "}
          <strong className="text-foreground/90">Reserved at / last updated</strong> use{" "}
          Morocco time ({MOROCCO_TZ}).
        </p>
      </div>
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {view === "bookings" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Booking Reference</th>
                  <th className="text-left p-4 font-medium text-muted-foreground min-w-[10rem] align-top">
                    <span className="block">Submitted</span>
                    <span className="block text-[10px] font-normal normal-case text-muted-foreground/90 mt-0.5">
                      Morocco time
                    </span>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell align-top">
                    <span className="block">Travel & pickup</span>
                    <span className="block text-[10px] font-normal normal-case text-muted-foreground/90 mt-0.5">
                      Morocco time
                    </span>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Guests</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Options</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Total</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookingsTableLoading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      Loading bookings…
                    </td>
                  </tr>
                ) : tableRows.length > 0 ? (
                  tableRows.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-xs">{b.bookingReference}</td>
                      <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDateTimeMorocco(b.createdAt)}
                      </td>
                      <td className="p-4 font-medium">
                        {b.activity?.slug ? (
                          <Link to={`/activities/${b.activity.slug}`} className="text-primary hover:underline">
                            {b.activity.title}
                          </Link>
                        ) : (
                          b.activity?.title || "N/A"
                        )}
                        {b.hidden ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            Hidden
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">
                        {b.user?.firstName} {b.user?.lastName}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">
                        <div className="space-y-0.5">
                          <div className="text-foreground">{formatIsoDateOnly(b.travelDate)}</div>
                          {b.activity?.meetingTime ? (
                            <div className="text-xs text-muted-foreground leading-snug max-w-[14rem]">
                              {b.activity.meetingTime}
                              <span className="text-muted-foreground/70"> · Morocco time</span>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/70">—</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{b.numberOfPeople}</td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">
                        <div>{formatTourType(b.tourType)}</div>
                        <div className="text-muted-foreground/80">{formatComfortLevel(b.comfortLevel)}</div>
                      </td>
                      <td className="p-4 hidden lg:table-cell font-medium tabular-nums">
                        {formatBookingPrice(b.totalPrice)}
                      </td>
                      <td className="p-4">
                        <Select
                          value={b.status}
                          onValueChange={(value) => updateStatusMutation.mutate({ id: b.id, status: value })}
                        >
                          <SelectTrigger className="w-[120px] h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="View booking details"
                            onClick={() => setDetailBooking(b)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={b.hidden ? "Unhide booking" : "Hide booking"}
                            disabled={updateHiddenMutation.isPending}
                            onClick={() => updateHiddenMutation.mutate({ id: b.id, hidden: !Boolean(b.hidden) })}
                          >
                            {b.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete booking"
                            disabled={deleteBookingMutation.isPending}
                            onClick={() => setBookingToDelete(b)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      {bookingSegment === "cancelled"
                        ? "No cancelled bookings found"
                        : "No active bookings found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Submitted</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Traveler</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Route</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Preferred date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Guests</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.content && data.content.length > 0 ? (
                  (data.content as CustomTripRequest[]).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDateTimeMorocco(r.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </td>
                      <td className="p-4 font-medium">
                        {r.startCity} → {r.destinationCity}
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">
                        {r.preferredDate ? formatIsoDateOnly(r.preferredDate) : "—"}
                      </td>
                      <td className="p-4 hidden lg:table-cell">{r.numberOfPeople ?? "—"}</td>
                      <td className="p-4">
                        <Select
                          value={r.status}
                          onValueChange={(value) => updateCustomStatusMutation.mutate({ id: r.id, status: value })}
                        >
                          <SelectTrigger className="w-[180px] h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="CONVERTED_TO_BOOKING">Converted</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="View request details"
                            onClick={() => setDetailCustom(r)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete custom trip request"
                            disabled={deleteCustomMutation.isPending}
                            onClick={() => setCustomToDelete(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No custom trip requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {data && data.totalElements > 0 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * (data.size ?? 20) + 1}–
            {Math.min((page + 1) * (data.size ?? 20), data.totalElements)} of {data.totalElements}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || bookingsTableLoading}
              onClick={() => setPage(0)}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || bookingsTableLoading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="min-w-[7rem] text-center text-sm text-muted-foreground">
              Page {page + 1} of {Math.max(data.totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages - 1 || bookingsTableLoading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages - 1 || bookingsTableLoading}
              onClick={() => setPage(data.totalPages - 1)}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      <Dialog open={detailBooking !== null} onOpenChange={(open) => !open && setDetailBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription className="text-xs">
              Travel and booked-on dates are shown as stored. Reservation timestamps use Morocco time ({MOROCCO_TZ}).
            </DialogDescription>
          </DialogHeader>
          {detailBooking && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reference</p>
                  <p className="font-mono font-medium">{detailBooking.bookingReference}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="capitalize">{detailBooking.status?.toLowerCase()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hidden</p>
                  <p className="text-sm text-foreground">
                    {detailBooking.hidden ? "Yes (hidden from admin list)" : "No"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={updateHiddenMutation.isPending}
                  onClick={() =>
                    updateHiddenMutation.mutate({
                      id: detailBooking.id,
                      hidden: !Boolean(detailBooking.hidden),
                    })
                  }
                >
                  {detailBooking.hidden ? "Unhide" : "Hide"}
                </Button>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Travel</p>
                <p>
                  <span className="font-medium">{formatIsoDateOnly(detailBooking.travelDate)}</span>
                  {detailBooking.activity?.meetingTime && (
                    <span className="text-muted-foreground">
                      {" "}
                      — {detailBooking.activity.meetingTime}{" "}
                      <span className="text-muted-foreground/80">(Morocco time)</span>
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Booked on (date)</p>
                  <p>{formatIsoDateOnly(detailBooking.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reserved at</p>
                  <p>{formatDateTimeMorocco(detailBooking.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Activity</p>
                {detailBooking.activity?.slug ? (
                  <Link to={`/activities/${detailBooking.activity.slug}`} className="text-primary font-medium hover:underline">
                    {detailBooking.activity.title}
                  </Link>
                ) : (
                  <p className="font-medium">{detailBooking.activity?.title ?? "—"}</p>
                )}
                {detailBooking.activity?.duration && (
                  <p className="text-muted-foreground mt-1">Duration: {detailBooking.activity.duration}</p>
                )}
                {detailBooking.activity?.location && (
                  <p className="text-muted-foreground">Location: {detailBooking.activity.location}</p>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Customer</p>
                <p className="font-medium">
                  {detailBooking.user?.firstName} {detailBooking.user?.lastName}
                </p>
                <p className="text-muted-foreground">{detailBooking.user?.email}</p>
                {detailBooking.user?.phone && <p className="text-muted-foreground">{detailBooking.user.phone}</p>}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Guests</p>
                  <p>{detailBooking.numberOfPeople}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total price</p>
                  <p className="font-medium tabular-nums">{formatBookingPrice(detailBooking.totalPrice)}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tour type</p>
                  <p>{formatTourType(detailBooking.tourType)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Comfort level</p>
                  <p>{formatComfortLevel(detailBooking.comfortLevel)}</p>
                </div>
              </div>

              {detailBooking.specialRequest?.trim() && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Special requests</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{detailBooking.specialRequest}</p>
                  </div>
                </>
              )}

              {detailBooking.updatedAt && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Last updated: {formatDateTimeMorocco(detailBooking.updatedAt)}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteBookingMutation.isPending}
                  onClick={() => setBookingToDelete(detailBooking)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={bookingToDelete !== null} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove booking{" "}
              <span className="font-mono font-medium">{bookingToDelete?.bookingReference}</span>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBookingMutation.isPending}
              onClick={() => bookingToDelete && deleteBookingMutation.mutate(bookingToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailCustom !== null} onOpenChange={(open) => !open && setDetailCustom(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom trip request</DialogTitle>
            <DialogDescription className="text-xs">
              Submitted timestamps use Morocco time ({MOROCCO_TZ}).
            </DialogDescription>
          </DialogHeader>
          {detailCustom && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Traveler</p>
                  <p className="font-medium">{detailCustom.name}</p>
                  <p className="text-xs text-muted-foreground">{detailCustom.email}</p>
                  {detailCustom.phone && <p className="text-xs text-muted-foreground">{detailCustom.phone}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="capitalize">{detailCustom.status?.toLowerCase().replaceAll("_", " ")}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Route</p>
                  <p className="font-medium">
                    {detailCustom.startCity} → {detailCustom.destinationCity}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preferred date</p>
                  <p>{detailCustom.preferredDate ? formatIsoDateOnly(detailCustom.preferredDate) : "—"}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Guests</p>
                  <p>{detailCustom.numberOfPeople ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Submitted</p>
                  <p>{formatDateTimeMorocco(detailCustom.createdAt)}</p>
                </div>
              </div>

              {detailCustom.message && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{detailCustom.message}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteCustomMutation.isPending}
                  onClick={() => setCustomToDelete(detailCustom)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={customToDelete !== null} onOpenChange={(open) => !open && setCustomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this custom trip request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the request from{" "}
              <span className="font-medium">
                {customToDelete?.startCity} → {customToDelete?.destinationCity}
              </span>{" "}
              submitted by {customToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCustomMutation.isPending}
              onClick={() => customToDelete && deleteCustomMutation.mutate(customToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
