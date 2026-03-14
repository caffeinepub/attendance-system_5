import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { ClipboardList, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { useDarkMode } from "../hooks/useDarkMode";

const navLinks = [
  { to: "/", label: "Summary", ocid: "nav.summary_link" },
  { to: "/checkin", label: "Check-In", ocid: "nav.checkin_link" },
  { to: "/log", label: "Log", ocid: "nav.log_link" },
  { to: "/admin", label: "Admin", ocid: "nav.admin_link" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const { dark, toggle } = useDarkMode();

  const isActive = (to: string) => {
    if (to === "/") return currentPath === "/" || currentPath === "/summary";
    return currentPath.startsWith(to);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 dark:bg-card/95 backdrop-blur-sm shadow-xs transition-colors duration-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-bold text-xl text-foreground transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <ClipboardList className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">Attendance</span>
          <span className="hidden sm:inline text-primary">System</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                isActive(link.to)
                  ? "bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-secondary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <Button
            data-ocid="nav.darkmode_toggle"
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-border bg-card dark:bg-card px-4 pb-4 flex flex-col gap-1 transition-colors duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              onClick={() => setOpen(false)}
              className={cn(
                "px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200",
                isActive(link.to)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
