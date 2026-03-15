import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

import List "mo:core/List";


actor {
  include MixinStorage();

  // Types
  type Employee = {
    id : Text;
    employeeId : Text;
    name : Text;
    department : Text;
    dailySalary : Nat;
    faceDescriptor : Text;
    photo : Storage.ExternalBlob;
    createdAt : Int;
  };

  type AttendanceRecord = {
    id : Text;
    employeeId : Text;
    date : Text;
    status : Text;
    checkInTime : Int;
    note : Text;
  };

  type Holiday = {
    id : Nat;
    date : Text;
    reason : Text;
    createdAt : Int;
  };

  type SalaryPayment = {
    id : Nat;
    employeeId : Text;
    amount : Nat;
    paidDate : Text;
    note : Text;
    createdAt : Int;
  };

  // Employee Storage
  let employees = Map.empty<Text, Employee>();

  // Attendance Storage
  let attendance = Map.empty<Text, AttendanceRecord>();

  // Holiday Storage
  let holidays = Map.empty<Nat, Holiday>();
  var holidayCounter = 0;

  // Salary Payment Storage
  let salaryPayments = Map.empty<Nat, SalaryPayment>();
  var salaryPaymentCounter = 0;

  // Employee Methods
  public shared ({ caller }) func registerEmployee(
    employeeId : Text,
    name : Text,
    department : Text,
    dailySalary : Nat,
    faceDescriptor : Text,
    photo : Storage.ExternalBlob,
  ) : async Text {
    let id = employeeId.concat(Time.now().toText());
    let employee : Employee = {
      id;
      employeeId;
      name;
      department;
      dailySalary;
      faceDescriptor;
      photo;
      createdAt = Time.now();
    };
    employees.add(id, employee);
    id;
  };

  public shared ({ caller }) func updateEmployee(
    id : Text,
    name : Text,
    department : Text,
    dailySalary : Nat,
    faceDescriptor : Text,
    photo : Storage.ExternalBlob,
  ) : async () {
    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?existing) {
        let updated : Employee = {
          existing with
          name;
          department;
          dailySalary;
          faceDescriptor;
          photo;
        };
        employees.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteEmployee(id : Text) : async () {
    if (not employees.containsKey(id)) {
      Runtime.trap("Employee not found");
    };
    employees.remove(id);
  };

  public query ({ caller }) func listAllEmployees() : async [Employee] {
    employees.values().toArray();
  };

  public query ({ caller }) func getEmployeeByEmployeeId(employeeId : Text) : async ?Employee {
    let iter = employees.values().toArray().values();
    iter.find(func(e) { e.employeeId == employeeId });
  };

  // Attendance Methods
  public shared ({ caller }) func addAttendanceRecord(
    employeeId : Text,
    date : Text,
    status : Text,
    checkInTime : Int,
    note : Text,
  ) : async Text {
    let id = employeeId.concat("_").concat(Time.now().toText());
    let record : AttendanceRecord = {
      id;
      employeeId;
      date;
      status;
      checkInTime;
      note;
    };
    attendance.add(id, record);
    id;
  };

  public query ({ caller }) func getAttendanceByEmployeeId(employeeId : Text) : async [AttendanceRecord] {
    attendance.values().toArray().filter(
      func(record) { record.employeeId == employeeId }
    );
  };

  public query ({ caller }) func getAttendanceByDate(date : Text) : async [AttendanceRecord] {
    attendance.values().toArray().filter(
      func(record) { record.date == date }
    );
  };

  public query ({ caller }) func getAllAttendanceRecords() : async [AttendanceRecord] {
    attendance.values().toArray();
  };

  public shared ({ caller }) func deleteAttendanceRecord(id : Text) : async () {
    if (not attendance.containsKey(id)) {
      Runtime.trap("Attendance record not found");
    };
    attendance.remove(id);
  };

  // Holiday Methods
  public shared ({ caller }) func addHoliday(date : Text, reason : Text) : async Nat {
    let id = holidayCounter;
    holidayCounter += 1;
    let holiday : Holiday = {
      id;
      date;
      reason;
      createdAt = Time.now();
    };
    holidays.add(id, holiday);
    id;
  };

  public query ({ caller }) func listHolidays() : async [Holiday] {
    holidays.values().toArray();
  };

  public shared ({ caller }) func deleteHoliday(id : Nat) : async () {
    if (not holidays.containsKey(id)) {
      Runtime.trap("Holiday not found");
    };
    holidays.remove(id);
  };

  // Salary Payment Methods
  public shared ({ caller }) func addSalaryPayment(
    employeeId : Text,
    amount : Nat,
    paidDate : Text,
    note : Text,
  ) : async Nat {
    let id = salaryPaymentCounter;
    salaryPaymentCounter += 1;
    let payment : SalaryPayment = {
      id;
      employeeId;
      amount;
      paidDate;
      note;
      createdAt = Time.now();
    };
    salaryPayments.add(id, payment);
    id;
  };

  public query ({ caller }) func getSalaryPaymentsByEmployee(employeeId : Text) : async [SalaryPayment] {
    salaryPayments.values().toArray().filter(
      func(payment) { payment.employeeId == employeeId }
    );
  };

  public query ({ caller }) func getAllSalaryPayments() : async [SalaryPayment] {
    salaryPayments.values().toArray();
  };

  public shared ({ caller }) func deleteSalaryPayment(id : Nat) : async () {
    if (not salaryPayments.containsKey(id)) {
      Runtime.trap("Salary payment not found");
    };
    salaryPayments.remove(id);
  };
};
