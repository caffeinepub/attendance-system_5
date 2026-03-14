import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type Employee = {
    id : Text;
    name : Text;
    department : Text;
    photo : Storage.ExternalBlob;
    createdAt : Int;
  };

  module Employee {
    public func compare(e1 : Employee, e2 : Employee) : Order.Order {
      e1.name.compare(e2.name);
    };

    public func compareByDepartment(e1 : Employee, e2 : Employee) : Order.Order {
      switch (e1.department.compare(e2.department)) {
        case (#equal) { e1.name.compare(e2.name) };
        case (order) { order };
      };
    };
  };

  type AttendanceRecord = {
    id : Text;
    employeeId : Text;
    employeeName : Text;
    department : Text;
    checkInTime : Int;
    photo : Storage.ExternalBlob;
    status : Text;
  };

  module AttendanceRecord {
    public func compareByCheckInTime(a1 : AttendanceRecord, a2 : AttendanceRecord) : Order.Order {
      Int.compare(a1.checkInTime, a2.checkInTime);
    };
  };

  let employees = Map.empty<Text, Employee>();
  let attendance = Map.empty<Text, AttendanceRecord>();

  public shared ({ caller }) func registerEmployee(name : Text, department : Text, photo : Storage.ExternalBlob) : async Text {
    let id = name.concat(department).concat(Time.now().toText());
    let employee : Employee = {
      id;
      name;
      department;
      photo;
      createdAt = Time.now();
    };
    employees.add(id, employee);
    id;
  };

  public query ({ caller }) func listAllEmployees() : async [Employee] {
    employees.values().toArray().sort();
  };

  public query ({ caller }) func listEmployeesByDepartment() : async [Employee] {
    employees.values().toArray().sort(Employee.compareByDepartment);
  };

  public shared ({ caller }) func deleteEmployee(id : Text) : async () {
    if (not employees.containsKey(id)) {
      Runtime.trap("Employee not found");
    };
    employees.remove(id);
  };

  public shared ({ caller }) func addAttendanceRecord(
    employeeId : Text,
    employeeName : Text,
    department : Text,
    checkInTime : Int,
    photo : Storage.ExternalBlob,
    status : Text,
  ) : async Text {
    let id = employeeId.concat("_").concat(Time.now().toText());
    let record : AttendanceRecord = {
      id;
      employeeId;
      employeeName;
      department;
      checkInTime;
      photo;
      status;
    };
    attendance.add(id, record);
    id;
  };

  public query ({ caller }) func getAttendanceByDate(date : Text) : async [AttendanceRecord] {
    let dayRecords = attendance.values().toArray().filter(
      func(record) {
        getDateString(record.checkInTime) == date;
      }
    );
    dayRecords.sort(AttendanceRecord.compareByCheckInTime);
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

  public query ({ caller }) func getDailySummary(date : Text) : async {
    presentCount : Nat;
    lateCount : Nat;
    absentEmployees : [Text];
  } {
    let records = attendance.values().toArray().filter(
      func(record) {
        getDateString(record.checkInTime) == date;
      }
    );

    var present = 0;
    var late = 0;
    for (record in records.values()) {
      switch (record.status) {
        case ("present") { present += 1 };
        case ("late") { late += 1 };
        case (_) {};
      };
    };

    let allEmployees = employees.values().toArray();
    let absent = allEmployees.filter(
      func(emp) {
        not records.any(func(rec) { rec.employeeId == emp.id });
      }
    );

    {
      presentCount = present;
      lateCount = late;
      absentEmployees = absent.map(func(emp) { emp.name });
    };
  };

  func getDateString(timestamp : Int) : Text {
    timestamp.toText();
  };
};
