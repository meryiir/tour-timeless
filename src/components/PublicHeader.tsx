import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, MapPin, LogOut, User, Globe, DollarSign, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Activities", to: "/activities" },
  { label: "Destinations", to: "/destinations" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const selectedLanguage = languages.find((l) => l.code === language) || languages[0];
  const selectedCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-beige-gradient-light backdrop-blur-xl shadow-sm">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] border-beige-gradient"></div>
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
          <Link 
          to="/" 
          className="flex items-center gap-2.5 font-display text-xl font-bold text-foreground group transition-all duration-200 hover:scale-105"
        >
          <div className="relative">
            <MapPin className="h-7 w-7 text-primary transition-colors duration-200 group-hover:text-accent" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
            Wanderlust
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg",
                  "hover:bg-primary/10 hover:text-primary",
                  isActive
                    ? "text-primary bg-primary/12 font-bold"
                    : "text-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">{l.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className="h-5 w-px bg-border/60 mx-0.5" />

          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 w-[130px] border-2 border-[hsl(35,20%,85%)] bg-background/80 hover:bg-background hover:border-[hsl(35,20%,75%)] transition-all shadow-sm">
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-foreground" />
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-base">{selectedLanguage.flag}</span>
                    <span className="text-xs font-semibold text-foreground">{selectedLanguage.code.toUpperCase()}</span>
                  </span>
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Currency Selector */}
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-9 w-[110px] border-2 border-[hsl(35,20%,85%)] bg-background/80 hover:bg-background hover:border-[hsl(35,20%,75%)] transition-all shadow-sm">
              <div className="flex items-center gap-2.5">
                <DollarSign className="h-4 w-4 text-foreground" />
                <SelectValue>
                  <span className="text-xs font-semibold text-foreground">{selectedCurrency.code}</span>
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-base">{curr.symbol}</span>
                    <span className="text-sm font-medium">{curr.code}</span>
                    <span className="text-xs text-muted-foreground ml-1">({curr.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Divider */}
          <div className="h-5 w-px bg-border/60 mx-0.5" />

          {/* User Menu */}
          {isAuthenticated && user ? (
            <>
              {user.role === "ROLE_ADMIN" && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="h-9 px-4 border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                    Admin
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-3 flex items-center gap-2.5 hover:bg-primary/8 hover:text-primary transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/12 flex items-center justify-center border border-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:inline text-sm font-semibold text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{user.firstName} {user.lastName}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4 text-foreground hover:text-primary hover:bg-primary/10 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground p-2 rounded-lg hover:bg-primary/5 transition-colors" 
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-background/98 backdrop-blur-xl border-t border-border/60 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col p-5 gap-1">
            {navLinks.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3.5 text-sm font-semibold rounded-lg transition-all",
                    isActive
                      ? "bg-primary/12 text-primary border-l-2 border-primary font-bold"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            
            {/* Mobile Theme Toggle */}
            <div className="pt-4 mt-3 border-t border-border/60 px-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 block">
                Theme
              </label>
              <div className="flex justify-start">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Language & Currency */}
            <div className="pt-4 mt-3 border-t border-border/60 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 block px-4">
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full border-2 border-[hsl(35,20%,85%)] bg-background/80 hover:border-[hsl(35,20%,75%)] shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4 text-foreground" />
                      <SelectValue>
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">{selectedLanguage.flag}</span>
                          <span className="font-semibold text-foreground">{selectedLanguage.name}</span>
                        </span>
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 block px-4">
                  Currency
                </label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full border-2 border-[hsl(35,20%,85%)] bg-background/80 hover:border-[hsl(35,20%,75%)] shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="h-4 w-4 text-foreground" />
                      <SelectValue>
                        <span className="flex items-center gap-2.5">
                          <span className="font-semibold text-base text-foreground">{selectedCurrency.symbol}</span>
                          <span className="font-semibold text-foreground">{selectedCurrency.code}</span>
                        </span>
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-base">{curr.symbol}</span>
                          <span className="text-sm font-medium">{curr.code}</span>
                          <span className="text-xs text-muted-foreground ml-1">({curr.name})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-4 mt-3 border-t border-border/60 space-y-3">
              {isAuthenticated && user ? (
                <>
                  {user.role === "ROLE_ADMIN" && (
                    <Link to="/admin" className="block" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full h-10 border-primary/30 hover:border-primary/50 hover:bg-primary/5" size="sm">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <div className="px-4 py-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/12 flex items-center justify-center border border-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-foreground">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold" 
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full h-10 text-foreground hover:text-primary hover:bg-primary/10 font-semibold" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="block" onClick={() => setOpen(false)}>
                    <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
