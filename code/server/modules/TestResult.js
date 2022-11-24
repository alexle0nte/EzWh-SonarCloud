"use strict";

class TestResult {
  constructor(id, RFID, result, date, IDTestDescriptor) {
    this.id = id;
    this.RFID = RFID;
    this.result = result;
    this.date = date;
    this.IDTestDescriptor = IDTestDescriptor;
  }

  toJson() {
    return {
      id: this.id,
      idTestDescriptor: this.IDTestDescriptor,
      Date: this.date,
      Result: this.result,
    };
  }
}

module.exports = TestResult;
