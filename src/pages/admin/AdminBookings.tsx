import { bookings } from "@/data/mockData";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary",
  pending: "bg-secondary/10 text-secondary",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminBookings() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{bookings.length} bookings</p>
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Booking</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Guests</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{b.activityTitle}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{b.userName}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{b.date}</td>
                  <td className="p-4">{b.guests}</td>
                  <td className="p-4 font-medium">${b.totalPrice}</td>
                  <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span></td>
                  <td className="p-4 text-right"><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
