import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import CheckInPage from "./pages/CheckInPage";
import LogPage from "./pages/LogPage";
import SummaryPage from "./pages/SummaryPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <RouterProvider router={router} />
      </main>
      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SummaryPage,
});

const summaryAltRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/summary",
  component: SummaryPage,
});

const checkInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkin",
  component: CheckInPage,
});

const logRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/log",
  component: LogPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  summaryRoute,
  summaryAltRoute,
  checkInRoute,
  logRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
