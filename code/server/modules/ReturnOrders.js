"use strict";

class ReturnOrder {
    constructor(
        id,
        returnDate,
        items,
        restockId
    ) {
        this.id = id;
        this.returnDate = returnDate;
        this.items = items;
        this.restockId = restockId;
    }

    toJson() {
        return {
            id: this.id,
            returnDate: this.returnDate,
            products: this.items,
            restockOrderId: this.restockId
        }
    }
}
module.exports = ReturnOrder;