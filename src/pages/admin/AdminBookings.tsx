import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type Booking } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
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

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  PENDING: "bg-secondary/10 text-secondary",
  COMPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export default function AdminBookings() {
  const [page, setPage] = useState(0);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminBookings', page],
    queryFn: () => adminApi.getBookings(page, 20),
  });

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

  if (isLoading) {
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
        <p className="text-sm text-muted-foreground">{data?.totalElements || 0} bookings</p>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground/90">Travel / booked-on dates</strong> are the calendar days stored
          for the reservation (no timezone shift).{" "}
          <strong className="text-foreground/90">Reserved at / last updated</strong> use{" "}
          Morocco time ({MOROCCO_TZ}).
        </p>
      </div>
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Booking Reference</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell align-top">
                  <span className="block">Travel & pickup</span>
                  <span className="block text-[10px] font-normal normal-case text-muted-foreground/90 mt-0.5">
                    Morocco time
                  </span>
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">Guests</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.content && data.content.length > 0 ? (
                data.content.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-xs">{b.bookingReference}</td>
                    <td className="p-4 font-medium">
                      {b.activity?.slug ? (
                        <Link to={`/activities/${b.activity.slug}`} className="text-primary hover:underline">
                          {b.activity.title}
                        </Link>
                      ) : (
                        b.activity?.title || "N/A"
                      )}
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
                    <td className="p-4 font-medium">${b.totalPrice?.toFixed(2) || '0.00'}</td>
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
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
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                  <p className="font-semibold">${detailBooking.totalPrice?.toFixed(2) ?? "0.00"}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
