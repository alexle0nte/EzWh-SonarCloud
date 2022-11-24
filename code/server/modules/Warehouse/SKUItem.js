"use strict";

class SKUItem {

  constructor(RFID, available, SKUID, dateOfStock) {
    this.RFID = RFID;
    this.available = available;
    this.SKUID = SKUID;
    this.dateOfStock = dateOfStock;
  }

  noAvailable() {
    return {
      RFID: this.RFID,
      SKUId: this.SKUID,
      DateOfStock: this.dateOfStock,
    };
  }

  toJson() {
    return {
      RFID: this.RFID,
      Available: this.available,
      SKUId: this.SKUID,
      DateOfStock: this.dateOfStock,
    };
  }
}

module.exports = SKUItem;
