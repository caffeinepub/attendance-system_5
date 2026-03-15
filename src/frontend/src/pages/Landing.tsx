import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  Camera,
  Clock,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            PAVITHRA EXPLOSIVES
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          Face Recognition Attendance System
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Seamless face recognition for effortless time tracking and payroll
            management.
          </p>
        </motion.div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <motion.button
            data-ocid="landing.employee.button"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate({ to: "/employee" })}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                Employee Portal
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                View your attendance records, daily salary, and total earnings.
                Login with your Employee ID.
              </p>
              <div className="mt-6 flex items-center gap-2 text-primary text-sm font-medium">
                <span>Enter Portal</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </motion.button>

          <motion.button
            data-ocid="landing.manager.button"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate({ to: "/manager/register" })}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-left hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                Manager Portal
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Register employees, mark attendance via face scan, manage
                holidays and salary reports.
              </p>
              <div className="mt-6 flex items-center gap-2 text-primary text-sm font-medium">
                <span>Enter Portal</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl"
        >
          {[
            { icon: Camera, label: "Face Recognition" },
            { icon: BarChart3, label: "Salary Reports" },
            { icon: CalendarDays, label: "Holiday Tracking" },
            { icon: Clock, label: "Real-Time Logs" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
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
  );
}
