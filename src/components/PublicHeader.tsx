import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Menu, X, LogOut, User, Globe, DollarSign, ChevronDown, UserCircle, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "react-i18next";
import MoroccoMosaicLogo from "@/components/MoroccoMosaicLogo";
import NotificationBell from "@/components/NotificationBell";
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

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export default function PublicHeader() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, setCurrency, selectedCurrency } = useCurrency();

  const language = i18n.language || "en";

  useEffect(() => {
    // Sync language from localStorage if available
    const savedLanguage = localStorage.getItem("i18nextLng") || "en";
    if (savedLanguage !== language && languages.some(l => l.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n, language]);

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.activities"), to: "/activities" },
    { label: t("nav.destinations"), to: "/destinations" },
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  const selectedLanguage = languages.find((l) => l.code === language) || languages[0];

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  /** Close drawer when crossing desktop breakpoint (menu controls are md:hidden). */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[10500] bg-beige-gradient-light dark:bg-slate-900/95 backdrop-blur-xl shadow-sm border-b border-border/50">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] border-beige-gradient"></div>
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="group flex items-center transition-all duration-300 hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg px-1 -ml-1"
        >
          <MoroccoMosaicLogo size="md" variant="compact" className="transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Desktop & tablet navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
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
          <Select value={language} onValueChange={handleLanguageChange}>
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
                    {t("header.admin")}
                  </Button>
                </Link>
              )}
              <NotificationBell />
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
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/12 flex items-center justify-center border-2 border-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{user.firstName} {user.lastName}</span>
                          <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile?tab=profile")} 
                    className="cursor-pointer focus:bg-primary/10 focus:text-primary"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    {t("header.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile?tab=bookings")} 
                    className="cursor-pointer focus:bg-primary/10 focus:text-primary"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t("header.myBookings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile?tab=settings")} 
                    className="cursor-pointer focus:bg-primary/10 focus:text-primary"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t("header.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4 text-foreground hover:text-primary hover:bg-primary/10 font-semibold">
                  {t("header.signIn")}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all">
                  {t("header.getStarted")}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger (< md only) */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:hidden">
          {isAuthenticated && user && <NotificationBell />}
          <button
            type="button"
            className="text-foreground inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-primary/10 active:bg-primary/15 transition-colors touch-manipulation"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu-panel"
            aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
          >
            {open ? <X className="h-6 w-6 shrink-0" /> : <Menu className="h-6 w-6 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Mobile menu: portaled to document.body so fixed layers are not clipped by header backdrop-filter */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed left-0 right-0 top-16 bottom-0 z-[10400] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 md:hidden"
              aria-hidden
              tabIndex={-1}
              onClick={closeMenu}
            />
            <div
              id="mobile-menu-panel"
              className="fixed left-0 right-0 top-16 bottom-0 z-[10450] overflow-y-auto overflow-x-hidden overscroll-y-contain border-b border-border bg-background shadow-2xl [-webkit-overflow-scrolling:touch] animate-in slide-in-from-top fade-in duration-200 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t("header.mobileNavigation")}
            >
            <nav
              className="flex flex-col gap-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
              aria-label={t("header.mobileNavigation")}
            >
              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("header.menuSectionExplore")}
              </p>
              <div className="flex flex-col gap-0.5 rounded-xl bg-muted/30 p-1.5">
                {navLinks.map((l) => {
                  const isActive = location.pathname === l.to;
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={closeMenu}
                      className={cn(
                        "min-h-[44px] px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center",
                        isActive
                          ? "bg-primary/15 text-primary shadow-sm"
                          : "text-foreground active:bg-primary/10 hover:bg-primary/8"
                      )}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>

              <section className="mt-5 border-t border-border/60 pt-5" aria-labelledby="mobile-preferences-heading">
                <h2 id="mobile-preferences-heading" className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("header.menuSectionPreferences")}
                </h2>
                <div className="rounded-xl border border-border/60 bg-card/50 p-3 space-y-4">
                  <div>
                    <span className="mb-2 block text-xs font-medium text-foreground">{t("header.theme")}</span>
                    <div className="flex justify-start">
                      <ThemeToggle />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="min-w-0">
                      <label htmlFor="mobile-lang" className="mb-2 block text-xs font-medium text-foreground">
                        {t("header.language")}
                      </label>
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger
                          id="mobile-lang"
                          className="h-11 w-full min-w-0 border-2 border-border bg-background shadow-sm"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Globe className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
                            <SelectValue>
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="text-base">{selectedLanguage.flag}</span>
                                <span className="truncate font-semibold text-foreground">{selectedLanguage.name}</span>
                              </span>
                            </SelectValue>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="!z-[10600]">
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
                    <div className="min-w-0">
                      <label htmlFor="mobile-currency" className="mb-2 block text-xs font-medium text-foreground">
                        {t("header.currency")}
                      </label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger
                          id="mobile-currency"
                          className="h-11 w-full min-w-0 border-2 border-border bg-background shadow-sm"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <DollarSign className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
                            <SelectValue>
                              <span className="flex items-center gap-2 font-semibold text-foreground">
                                <span className="text-base">{selectedCurrency.symbol}</span>
                                <span>{selectedCurrency.code}</span>
                              </span>
                            </SelectValue>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="!z-[10600]">
                          {currencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              <div className="flex items-center gap-2.5">
                                <span className="text-base font-semibold">{curr.symbol}</span>
                                <span className="text-sm font-medium">{curr.code}</span>
                                <span className="text-xs text-muted-foreground">({curr.name})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-5 border-t border-border/60 pt-5 pb-1" aria-labelledby="mobile-account-heading">
                <h2 id="mobile-account-heading" className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("header.menuSectionAccount")}
                </h2>
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    {user.role === "ROLE_ADMIN" && (
                      <Link to="/admin" className="block" onClick={closeMenu}>
                        <Button
                          variant="outline"
                          className="h-11 w-full border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                          size="sm"
                        >
                          {t("header.adminPanel")}
                        </Button>
                      </Link>
                    )}
                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/12">
                          <User className="h-5 w-5 text-primary" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-xl bg-muted/30 p-1.5">
                      <Button
                        variant="ghost"
                        className="h-11 w-full justify-start px-3 font-semibold text-foreground hover:bg-primary/10 hover:text-primary"
                        size="sm"
                        onClick={() => {
                          navigate("/profile?tab=profile");
                          closeMenu();
                        }}
                      >
                        <UserCircle className="mr-2 h-4 w-4 shrink-0" />
                        {t("header.profile")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-11 w-full justify-start px-3 font-semibold text-foreground hover:bg-primary/10 hover:text-primary"
                        size="sm"
                        onClick={() => {
                          navigate("/profile?tab=bookings");
                          closeMenu();
                        }}
                      >
                        <BookOpen className="mr-2 h-4 w-4 shrink-0" />
                        {t("header.myBookings")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-11 w-full justify-start px-3 font-semibold text-foreground hover:bg-primary/10 hover:text-primary"
                        size="sm"
                        onClick={() => {
                          navigate("/profile?tab=settings");
                          closeMenu();
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4 shrink-0" />
                        {t("header.settings")}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-11 w-full font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4 shrink-0" />
                      {t("header.logout")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" className="block" onClick={closeMenu}>
                      <Button
                        variant="outline"
                        className="h-11 w-full font-semibold border-border/80"
                        size="sm"
                      >
                        {t("header.signIn")}
                      </Button>
                    </Link>
                    <Link to="/register" className="block" onClick={closeMenu}>
                      <Button className="h-11 w-full bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90" size="sm">
                        {t("header.getStarted")}
                      </Button>
                    </Link>
                  </div>
                )}
              </section>
            </nav>
          </div>
          </>,
          document.body,
        )}
    </header>
  );
}
