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
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { setCurrentEmployee } = useAppContext();
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) return;
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setLoading(true);
    try {
      const emp = await actor.getEmployeeByEmployeeId(employeeId.trim());
      if (!emp) {
        toast.error("Employee ID not found. Please check and try again.");
        return;
      }
      setCurrentEmployee(emp);
      navigate({ to: "/employee/dashboard" });
    } catch {
      toast.error("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          data-ocid="employee-login.back.button"
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

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">
              Employee Login
            </CardTitle>
            <CardDescription>
              Enter your Employee ID to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empId">Employee ID</Label>
                <Input
                  id="empId"
                  data-ocid="employee-login.input"
                  placeholder="e.g. EMP001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <Button
                data-ocid="employee-login.submit_button"
                type="submit"
                className="w-full"
                disabled={loading || !employeeId.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Searching...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
