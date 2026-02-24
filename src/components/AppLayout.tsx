import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { AppLocale, LOCALE_CONFIG } from "@/i18n/translations";
import { Globe, LayoutDashboard, Calendar, FileText, Users, LogOut, Languages, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale, dir } = useLanguage();

  if (!user) return null;

  const navItems = [
    { to: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/calendar", label: t("calendar"), icon: Calendar },
    { to: "/bookings", label: t("bookings"), icon: FileText },
    { to: "/reports", label: t("reports"), icon: FileText },
  ];

  if (user.role === "admin") {
    navItems.push({ to: "/manage-users", label: t("manageUsers"), icon: Users });
  }

  if (user.role === "customer") {
    navItems.splice(2, 0, { to: "/book-session", label: t("bookSession"), icon: PlusCircle });
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen" dir={dir}>
      {/* Sidebar */}
      <aside className="no-print flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Globe className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-primary-foreground">{t("appName")}</span>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
            <p className="text-sm font-medium text-sidebar-accent-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{t(user.role as any)}</p>
            {user.languages && (
              <div className="mt-1 flex items-center gap-1 text-xs text-sidebar-foreground/50">
                <Languages className="h-3 w-3" />
                {user.languages.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="px-4 pb-3">
          <Select value={locale} onValueChange={(v) => setLocale(v as AppLocale)}>
            <SelectTrigger className="h-8 bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(LOCALE_CONFIG) as [AppLocale, { name: string }][]).map(([code, cfg]) => (
                <SelectItem key={code} value={code}>{cfg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
