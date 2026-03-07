import { Activity, MapPin, CalendarCheck, Users, DollarSign, TrendingUp } from "lucide-react";
import { activities, bookings, users, destinations } from "@/data/mockData";
import FadeInSection from "@/components/FadeInSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { label: "Total Activities", value: activities.length, icon: Activity, color: "text-primary" },
  { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "text-secondary" },
  { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
  { label: "Destinations", value: destinations.length, icon: MapPin, color: "text-secondary" },
  { label: "Revenue", value: "$6,095", icon: DollarSign, color: "text-primary" },
  { label: "Growth", value: "+24%", icon: TrendingUp, color: "text-secondary" },
];

const chartData = [
  { month: "Jan", bookings: 12 }, { month: "Feb", bookings: 19 }, { month: "Mar", bookings: 28 },
  { month: "Apr", bookings: 15 }, { month: "May", bookings: 22 }, { month: "Jun", bookings: 34 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <FadeInSection key={s.label} delay={i * 0.05}>
            <div className="p-5 rounded-xl bg-card shadow-card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeInSection>
          <div className="p-6 rounded-xl bg-card shadow-card">
            <h3 className="font-display text-lg font-semibold mb-4">Booking Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="p-6 rounded-xl bg-card shadow-card">
            <h3 className="font-display text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.activityTitle}</p>
                    <p className="text-xs text-muted-foreground">{b.userName} · {b.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    b.status === "confirmed" ? "bg-primary/10 text-primary" :
                    b.status === "pending" ? "bg-secondary/10 text-secondary" :
                    b.status === "completed" ? "bg-primary/10 text-primary" :
                    "bg-destructive/10 text-destructive"
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
