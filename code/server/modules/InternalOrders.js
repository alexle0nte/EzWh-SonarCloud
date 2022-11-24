"use strict";

class InternalOrder {
  constructor(id, issueDate, state, SKUQuantity, SKURFIDs, customerID) {
    this.id = id;
    this.issueDate = issueDate;
    this.state = state;
    this.SKUQuantity = SKUQuantity;
    this.SKURFIDs = SKURFIDs;
    this.customerID = customerID;
  }

  toJson() {
    if (this.state !== "COMPLETED") {
      return {
        id: this.id,
        issueDate: this.issueDate,
        state: this.state,
        products: Array.from(this.SKUQuantity.entries()).map((p) => {
          return {
            SKUId: p[0].id,
            description: p[0].description,
            price: p[0].price,
            qty: p[1],
          };
        }),
        customerId: this.customerID,
      };
    } else {
      let products = [];
      Array.from(this.SKURFIDs.entries()).map((p) => {
        p[1].forEach((rfid) => {
          products.push({
            SKUId: p[0].id,
            description: p[0].description,
            price: p[0].price,
            RFID: rfid,
          });
        });
      });

      return {
        id: this.id,
        issueDate: this.issueDate,
        state: this.state,
        products: products,
        customerId: this.customerID,
      };
    }
  }
}

module.exports = InternalOrder;
