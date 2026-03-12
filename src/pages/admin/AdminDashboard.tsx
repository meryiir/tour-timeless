import { Activity, MapPin, CalendarCheck, Users, DollarSign, TrendingUp } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['recentBookings'],
    queryFn: () => adminApi.getBookings(0, 4),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    { label: "Total Activities", value: stats?.totalActivities || 0, icon: Activity, color: "text-primary" },
    { label: "Total Bookings", value: stats?.totalBookings || 0, icon: CalendarCheck, color: "text-secondary" },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-primary" },
    { label: "Destinations", value: stats?.totalDestinations || 0, icon: MapPin, color: "text-secondary" },
    { label: "Revenue", value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: "text-primary" },
    { label: "Total Reviews", value: stats?.totalReviews || 0, icon: TrendingUp, color: "text-secondary" },
  ];

  // Convert bookingsByStatus to chart data
  const chartData = stats?.bookingsByStatus ? Object.entries(stats.bookingsByStatus).map(([status, count]) => ({
    status: status.charAt(0) + status.slice(1).toLowerCase(),
    bookings: count,
  })) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardStats.map((s, i) => (
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
            <h3 className="font-display text-lg font-semibold mb-4">Bookings by Status</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No booking data available
              </div>
            )}
          </div>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="p-6 rounded-xl bg-card shadow-card">
            <h3 className="font-display text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {recentBookings?.content && recentBookings.content.length > 0 ? (
                recentBookings.content.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{b.activity?.title || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.user?.firstName} {b.user?.lastName} · {new Date(b.travelDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      b.status === "CONFIRMED" ? "bg-primary/10 text-primary" :
                      b.status === "PENDING" ? "bg-secondary/10 text-secondary" :
                      b.status === "COMPLETED" ? "bg-primary/10 text-primary" :
                      "bg-destructive/10 text-destructive"
                    }`}>{b.status?.toLowerCase()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">No recent bookings</div>
              )}
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}
