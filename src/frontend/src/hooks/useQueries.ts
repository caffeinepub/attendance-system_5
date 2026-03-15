import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  AttendanceRecord,
  Employee,
  Holiday,
  SalaryPayment,
} from "../backend.d";
import { useActor } from "./useActor";

export type { Employee, AttendanceRecord, Holiday, SalaryPayment };

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

export function useAttendanceByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-emp", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      return actor.getAttendanceByEmployeeId(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useHolidays() {
  const { actor, isFetching } = useActor();
  return useQuery<Holiday[]>({
    queryKey: ["holidays"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listHolidays();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSalaryPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryPayment[]>({
    queryKey: ["salary-all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSalaryPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSalaryByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryPayment[]>({
    queryKey: ["salary-emp", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      return actor.getSalaryPaymentsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAddAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      date,
      status,
      note,
    }: {
      employeeId: string;
      date: string;
      status: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const checkInTime = BigInt(Date.now()) * BigInt(1_000_000);
      return actor.addAttendanceRecord(
        employeeId,
        date,
        status,
        checkInTime,
        note,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-all"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-emp"] });
    },
  });
}

export function useRegisterEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      name,
      department,
      dailySalary,
      faceDescriptor,
      photoFile,
    }: {
      employeeId: string;
      name: string;
      department: string;
      dailySalary: number;
      faceDescriptor: string;
      photoFile: File;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.registerEmployee(
        employeeId,
        name,
        department,
        BigInt(dailySalary),
        faceDescriptor,
        blob,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      name,
      department,
      dailySalary,
      faceDescriptor,
      existingPhotoUrl,
    }: {
      employeeId: string;
      name: string;
      department: string;
      dailySalary: number;
      faceDescriptor: string;
      existingPhotoUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const photo = ExternalBlob.fromURL(existingPhotoUrl);
      return actor.updateEmployee(
        employeeId,
        name,
        department,
        BigInt(dailySalary),
        faceDescriptor,
        photo,
      );
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

export function useAddHoliday() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addHoliday(date, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useDeleteHoliday() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteHoliday(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useAddSalaryPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      amount,
      paidDate,
      note,
    }: {
      employeeId: string;
      amount: number;
      paidDate: string;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSalaryPayment(employeeId, BigInt(amount), paidDate, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-all"] });
      queryClient.invalidateQueries({ queryKey: ["salary-emp"] });
    },
  });
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
