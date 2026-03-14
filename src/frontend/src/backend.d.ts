import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Employee {
    id: string;
    name: string;
    createdAt: bigint;
    photo: ExternalBlob;
    department: string;
}
export interface AttendanceRecord {
    id: string;
    status: string;
    employeeName: string;
    checkInTime: bigint;
    employeeId: string;
    photo: ExternalBlob;
    department: string;
}
export interface backendInterface {
    addAttendanceRecord(employeeId: string, employeeName: string, department: string, checkInTime: bigint, photo: ExternalBlob, status: string): Promise<string>;
    deleteAttendanceRecord(id: string): Promise<void>;
    deleteEmployee(id: string): Promise<void>;
    getAllAttendanceRecords(): Promise<Array<AttendanceRecord>>;
    getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>>;
    getDailySummary(date: string): Promise<{
        presentCount: bigint;
        absentEmployees: Array<string>;
        lateCount: bigint;
    }>;
    listAllEmployees(): Promise<Array<Employee>>;
    listEmployeesByDepartment(): Promise<Array<Employee>>;
    registerEmployee(name: string, department: string, photo: ExternalBlob): Promise<string>;
}
