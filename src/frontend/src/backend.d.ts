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
export interface SalaryPayment {
    id: bigint;
    note: string;
    createdAt: bigint;
    paidDate: string;
    employeeId: string;
    amount: bigint;
}
export interface Employee {
    id: string;
    name: string;
    createdAt: bigint;
    employeeId: string;
    faceDescriptor: string;
    photo: ExternalBlob;
    department: string;
    dailySalary: bigint;
}
export interface Holiday {
    id: bigint;
    date: string;
    createdAt: bigint;
    reason: string;
}
export interface AttendanceRecord {
    id: string;
    status: string;
    date: string;
    note: string;
    checkInTime: bigint;
    employeeId: string;
}
export interface backendInterface {
    addAttendanceRecord(employeeId: string, date: string, status: string, checkInTime: bigint, note: string): Promise<string>;
    addHoliday(date: string, reason: string): Promise<bigint>;
    addSalaryPayment(employeeId: string, amount: bigint, paidDate: string, note: string): Promise<bigint>;
    deleteAttendanceRecord(id: string): Promise<void>;
    deleteEmployee(id: string): Promise<void>;
    deleteHoliday(id: bigint): Promise<void>;
    deleteSalaryPayment(id: bigint): Promise<void>;
    getAllAttendanceRecords(): Promise<Array<AttendanceRecord>>;
    getAllSalaryPayments(): Promise<Array<SalaryPayment>>;
    getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByEmployeeId(employeeId: string): Promise<Array<AttendanceRecord>>;
    getEmployeeByEmployeeId(employeeId: string): Promise<Employee | null>;
    getSalaryPaymentsByEmployee(employeeId: string): Promise<Array<SalaryPayment>>;
    listAllEmployees(): Promise<Array<Employee>>;
    listHolidays(): Promise<Array<Holiday>>;
    registerEmployee(employeeId: string, name: string, department: string, dailySalary: bigint, faceDescriptor: string, photo: ExternalBlob): Promise<string>;
    updateEmployee(id: string, name: string, department: string, dailySalary: bigint, faceDescriptor: string, photo: ExternalBlob): Promise<void>;
}
