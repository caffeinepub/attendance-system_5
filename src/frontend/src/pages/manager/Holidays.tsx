import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  formatDate,
  useAddHoliday,
  useDeleteHoliday,
  useHolidays,
} from "../../hooks/useQueries";

export default function Holidays() {
  const { data: holidays, isLoading } = useHolidays();
  const addHoliday = useAddHoliday();
  const deleteHoliday = useDeleteHoliday();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !reason.trim()) {
      toast.error("Please provide both date and reason.");
      return;
    }
    try {
      await addHoliday.mutateAsync({ date, reason: reason.trim() });
      toast.success("Holiday added successfully!");
      setDate("");
      setReason("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add holiday.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteHoliday.mutateAsync(id);
      toast.success("Holiday removed.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete holiday.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground flex items-center gap-3">
          <Calendar className="w-7 h-7 text-primary" />
          Holiday Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage official holidays for attendance calculations.
        </p>
      </div>

      {/* Add Holiday */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-display text-lg">Add Holiday</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                data-ocid="holidays.date.input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex-[2] space-y-1">
              <Label htmlFor="holiday-reason">Reason</Label>
              <Input
                id="holiday-reason"
                data-ocid="holidays.reason.input"
                placeholder="e.g. Diwali"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                data-ocid="holidays.add.submit_button"
                type="submit"
                disabled={addHoliday.isPending}
              >
                {addHoliday.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Holidays List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">
            All Holidays ({holidays?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              data-ocid="holidays.list.loading_state"
              className="p-4 space-y-2"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !holidays?.length ? (
            <div
              data-ocid="holidays.list.empty_state"
              className="p-8 text-center text-muted-foreground"
            >
              No holidays added yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...holidays]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((h, idx) => (
                    <TableRow
                      key={String(h.id)}
                      data-ocid={`holidays.item.${idx + 1}`}
                    >
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(h.date)}
                      </TableCell>
                      <TableCell>{h.reason}</TableCell>
                      <TableCell>
                        <Button
                          data-ocid={`holidays.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(h.id)}
                          disabled={deleteHoliday.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
