import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Activity, MapPin, CalendarCheck, Users, Star, Settings, LogOut, Menu, X, Home, ChevronLeft, ChevronRight, User, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import MoroccoLiveClock from "@/components/MoroccoLiveClock";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Activities", to: "/admin/activities", icon: Activity },
  { label: "Destinations", to: "/admin/destinations", icon: MapPin },
  { label: "Bookings", to: "/admin/bookings", icon: CalendarCheck },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
  { label: "Messages", to: "/admin/messages", icon: Mail },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen w-full bg-muted">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-screen flex flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 shrink-0 px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <Link to="/admin" className="font-display text-lg font-bold text-sidebar-primary-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sidebar-primary" />
              <span>Admin</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link to="/admin" className="mx-auto">
              <MapPin className="h-5 w-5 text-sidebar-primary" />
            </Link>
          )}
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Toggle (Desktop Only) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-1.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
            {/* Mobile Close Button */}
            <button 
              className="lg:hidden text-sidebar-foreground p-1.5" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border p-2 shrink-0">
          {/* Back to Site */}
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? "Back to Site" : ''}
          >
            <Home className="h-4.5 w-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className={`h-16 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 z-50 shadow-sm transition-[left] duration-300 ${
          sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'
        } left-0`}>
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Page Title */}
            <h2 className="font-display text-lg font-semibold text-foreground">
              {navItems.find((n) => location.pathname === n.to || (n.to !== "/admin" && location.pathname.startsWith(n.to)))?.label || "Dashboard"}
            </h2>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MoroccoLiveClock />
            <NotificationBell className="text-foreground hover:text-primary hover:bg-primary/10" />
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/12 flex items-center justify-center border border-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                      <span className="text-xs text-muted-foreground font-normal mt-1">
                        Role: {user.role.replace('ROLE_', '')}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <Home className="mr-2 h-4 w-4" />
                    View Site
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
