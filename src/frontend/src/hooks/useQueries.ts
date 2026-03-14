import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { AttendanceRecord, Employee } from "../backend.d";
import { useActor } from "./useActor";

export type { Employee, AttendanceRecord };

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAttendanceByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendanceByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useAllAttendance() {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAttendanceRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailySummary(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    presentCount: bigint;
    absentEmployees: string[];
    lateCount: bigint;
  }>({
    queryKey: ["summary", date],
    queryFn: async () => {
      if (!actor)
        return { presentCount: 0n, absentEmployees: [], lateCount: 0n };
      return actor.getDailySummary(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useRegisterEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      department,
      photoFile,
    }: {
      name: string;
      department: string;
      photoFile: File;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.registerEmployee(name, department, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEmployee(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useAddAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      employeeName,
      department,
      photoFile,
      status,
    }: {
      employeeId: string;
      employeeName: string;
      department: string;
      photoFile: File;
      status: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const checkInTime = BigInt(Date.now()) * 1_000_000n;
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.addAttendanceRecord(
        employeeId,
        employeeName,
        department,
        checkInTime,
        blob,
        status,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-all"] });
    },
  });
}

export function useDeleteAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAttendanceRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-all"] });
    },
  });
}

export function formatTimestamp(ts: bigint): { date: string; time: string } {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
