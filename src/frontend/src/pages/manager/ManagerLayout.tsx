import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart2,
  Calendar,
  Clock,
  DollarSign,
  Lock,
  LogOut,
  Menu,
  ScanFace,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MANAGER_PASSWORD = "admin123";

const navItems = [
  { path: "/manager/register", label: "Register Employee", icon: UserPlus },
  { path: "/manager/attendance", label: "Mark Attendance", icon: ScanFace },
  { path: "/manager/holidays", label: "Holidays", icon: Calendar },
  {
    path: "/manager/monthly-attendance",
    label: "Monthly Attendance",
    icon: BarChart2,
  },
  { path: "/manager/salary", label: "Monthly Salary", icon: DollarSign },
];

export default function ManagerLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem("manager_authed") === "true",
  );
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setTimeout(() => {
      if (password === MANAGER_PASSWORD) {
        sessionStorage.setItem("manager_authed", "true");
        setIsAuthed(true);
        toast.success("Welcome, Manager!");
      } else {
        toast.error("Incorrect password. Try admin123");
      }
      setLoginLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("manager_authed");
    setIsAuthed(false);
    toast.success("Logged out successfully");
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            data-ocid="manager-login.back.button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-border">|</span>
          <span className="font-display font-bold text-lg">
            PAVITHRA EXPLOSIVES
          </span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">
                Manager Login
              </CardTitle>
              <CardDescription>
                Enter the manager password to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mgr-password">Password</Label>
                  <Input
                    id="mgr-password"
                    data-ocid="manager-login.input"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button
                  data-ocid="manager-login.submit_button"
                  type="submit"
                  className="w-full"
                  disabled={loginLoading || !password}
                >
                  {loginLoading ? "Authenticating..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === "Escape" && closeSidebar()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static z-30 md:z-auto inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-5 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Clock className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sidebar-foreground">
            PAVITHRA EXPLOSIVES
          </span>
          <button
            type="button"
            className="ml-auto md:hidden text-sidebar-foreground"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Manager Panel
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              type="button"
              data-ocid={`manager-nav.${label.toLowerCase().replace(/ /g, "-")}.link`}
              onClick={() => {
                navigate({ to: path as any });
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                currentPath === path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button
            data-ocid="manager-nav.logout.button"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            data-ocid="manager-nav.home.link"
            className="w-full justify-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="manager-mobile.back.button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="sr-only">Back</span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-semibold">
            {navItems.find((n) => n.path === currentPath)?.label ??
              "Manager Portal"}
          </span>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
