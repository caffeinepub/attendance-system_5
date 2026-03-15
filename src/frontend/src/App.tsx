import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppProvider } from "./context/AppContext";
import Landing from "./pages/Landing";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import Holidays from "./pages/manager/Holidays";
import ManagerLayout from "./pages/manager/ManagerLayout";
import MarkAttendance from "./pages/manager/MarkAttendance";
import MonthlyAttendance from "./pages/manager/MonthlyAttendance";
import MonthlySalary from "./pages/manager/MonthlySalary";
import RegisterEmployee from "./pages/manager/RegisterEmployee";

const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AppProvider>
  ),
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const employeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employee",
  component: EmployeeLogin,
});

const employeeDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employee/dashboard",
  component: EmployeeDashboard,
});

const managerParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager",
  component: ManagerLayout,
});

const managerRegisterRoute = createRoute({
  getParentRoute: () => managerParentRoute,
  path: "/register",
  component: RegisterEmployee,
});

const managerAttendanceRoute = createRoute({
  getParentRoute: () => managerParentRoute,
  path: "/attendance",
  component: MarkAttendance,
});

const managerHolidaysRoute = createRoute({
  getParentRoute: () => managerParentRoute,
  path: "/holidays",
  component: Holidays,
});

const managerMonthlyRoute = createRoute({
  getParentRoute: () => managerParentRoute,
  path: "/monthly-attendance",
  component: MonthlyAttendance,
});

const managerSalaryRoute = createRoute({
  getParentRoute: () => managerParentRoute,
  path: "/salary",
  component: MonthlySalary,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  employeeRoute,
  employeeDashboardRoute,
  managerParentRoute.addChildren([
    managerRegisterRoute,
    managerAttendanceRoute,
    managerHolidaysRoute,
    managerMonthlyRoute,
    managerSalaryRoute,
  ]),
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
