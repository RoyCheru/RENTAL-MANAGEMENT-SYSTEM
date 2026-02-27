import { useState } from "react";
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
  X
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { ScrollArea } from "./components/ui/scroll-area";

type ViewType = "dashboard" | "properties" | "tenants" | "payments" | "maintenance" | "reports" | "settings";

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

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

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
                <p className="text-xs text-muted-foreground">Manager</p>
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
                      isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : ""
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

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
            </div>
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
                    day: "numeric" 
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
                    <h3 className="px-2 pb-2 text-sm border-b">Notifications</h3>
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
                              <p className="text-xs text-muted-foreground">{notification.date}</p>
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
