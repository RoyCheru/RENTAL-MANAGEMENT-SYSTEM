import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Button } from "./components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Wrench,
  FileText,
  Settings,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import { DashboardOverview } from "./components/dashboard-overview";
import { PropertiesView } from "./components/properties-view";
import { TenantsView } from "./components/tenants-view";
import { PaymentsView } from "./components/payments-view";
import { MaintenanceView } from "./components/maintenance-view";
import { ReportsView } from "./components/reports-view";
import { SettingsView } from "./components/settings-view";
import { Badge } from "./components/ui/badge";
import { useTheme } from "next-themes";
import { mockNotifications } from "./components/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { ScrollArea } from "./components/ui/scroll-area";

import { ApiError } from "./lib/api";
import { me, register, signin, signout } from "./lib/services/auth.service";

type ViewType =
  | "dashboard"
  | "properties"
  | "tenants"
  | "payments"
  | "maintenance"
  | "reports"
  | "settings";

type AuthUser = {
  id?: number;
  full_name?: string;
  phone?: string;
  email?: string | null;
  role?: "landlord" | "tenant";
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}

function AuthScreen({ onAuthed }: { onAuthed: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // sign in fields
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // sign up fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"landlord" | "tenant">("landlord");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "signup" && !fullName.trim()) return false;
    return true;
  }, [mode, email, password, fullName]);

  const friendlyError = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.status === 401) return "Invalid email or password.";
      if (err.status >= 500) return "Server error. Please try again shortly.";
      return err.message; // backend messages like "Phone already exists"
    }
    return "Network error. Please check your connection and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      setLoading(true);

      if (mode === "signin") {
        const data = await signin(email.trim(), password);
        console.log("Email and password:", email.trim(), password);
        console.log("Signin response data:", data);
        onAuthed(data.user);
        return;
      }

      // signup
      const data = await register({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
        role,
      });

      // After register, you can either:
      // A) auto-login by calling signin, or
      // B) just switch to sign-in mode
      // We'll auto-login for better UX:
      const login = await signin(email.trim(), password);
      onAuthed(login.user);
    } catch (err) {
      setErrorMsg(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const clearErrorOnType = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (errorMsg) setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md border rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary rounded-lg">
            <Building2 className="size-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl">RentFlow</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue"
                : "Create your account"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
            }}
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            className="flex-1"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
          >
            Sign Up
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && <ErrorBanner message={errorMsg} />}

          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Full name
                </label>
                <input
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                  value={fullName}
                  onChange={(e) =>
                    clearErrorOnType(setFullName)(e.target.value)
                  }
                  placeholder="e.g. Roy Cheruiyot"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Email (optional)
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                  value={email}
                  onChange={(e) => clearErrorOnType(setEmail)(e.target.value)}
                  placeholder="roy@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                  value={phone}
                  onChange={(e) => clearErrorOnType(setPhone)(e.target.value)}
                  placeholder="07xxxxxxxx"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Role</label>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as any);
                    if (errorMsg) setErrorMsg(null);
                  }}
                >
                  <option value="landlord">Landlord</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={email}
              onChange={(e) => clearErrorOnType(setEmail)(e.target.value)}
              placeholder="roy@gmail.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              value={password}
              onChange={(e) => clearErrorOnType(setPassword)(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={!canSubmit || loading}
          >
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ On load, check cookie session
  useEffect(() => {
    (async () => {
      try {
        const data = await me();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const navigationItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    { id: "properties" as ViewType, label: "Properties", icon: Building2 },
    { id: "tenants" as ViewType, label: "Tenants", icon: Users },
    { id: "payments" as ViewType, label: "Payments", icon: DollarSign },
    { id: "maintenance" as ViewType, label: "Maintenance", icon: Wrench },
    { id: "reports" as ViewType, label: "Reports", icon: FileText },
    { id: "settings" as ViewType, label: "Settings", icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview />;
      case "properties":
        return <PropertiesView />;
      case "tenants":
        return <TenantsView />;
      case "payments":
        return <PaymentsView />;
      case "maintenance":
        return <MaintenanceView />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  const handleLogout = async () => {
    try {
      await signout();
    } finally {
      setUser(null);
      setCurrentView("dashboard");
    }
  };

  // ✅ Nice loading state while checking /me
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Checking session...</div>
      </div>
    );
  }

  // ✅ If not logged in, show Auth screen
  if (!user) {
    return <AuthScreen onAuthed={(u) => setUser(u)} />;
  }

  const displayName = user.full_name || "User";
  const displayEmail = user.email || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg">RentFlow</h1>
                <p className="text-xs text-muted-foreground">
                  {user.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "User"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : ""
                    }`}
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Info + Sign Out */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {displayEmail || user.phone || ""}
                      </p>
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => setCurrentView("settings")}>
                  <UserIcon className="mr-2 size-4" />
                  Profile / Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-5" />
                    {unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2">
                    <h3 className="px-2 pb-2 text-sm border-b">
                      Notifications
                    </h3>
                    <div className="space-y-1 mt-2 max-h-96 overflow-y-auto">
                      {mockNotifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg hover:bg-muted cursor-pointer ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-1">
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {notification.date}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="size-2 rounded-full bg-primary mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-2" size="sm">
                      View All
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}
