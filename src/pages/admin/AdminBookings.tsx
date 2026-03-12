import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-primary/10 text-primary",
  PENDING: "bg-secondary/10 text-secondary",
  COMPLETED: "bg-primary/10 text-primary",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export default function AdminBookings() {
  const [page, setPage] = useState(0);
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
      <p className="text-sm text-muted-foreground">{data?.totalElements || 0} bookings</p>
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Booking Reference</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Travel Date</th>
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
                    <td className="p-4 font-medium">{b.activity?.title || 'N/A'}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">
                      {b.user?.firstName} {b.user?.lastName}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">
                      {new Date(b.travelDate).toLocaleDateString()}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
    </div>
  );
}
