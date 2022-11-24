"use strict";

class RestockOrder {
    constructor(
        id,
        issueDate,
        state,
        supplierId,
        item_RFID,
        transportNote,
        item_Quantity
    ) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.supplierId = supplierId;
        this.item_RFID = item_RFID !== null ? new Map(JSON.parse(item_RFID)) : new Map();
        this.transportNote = transportNote;
        this.item_Quantity = item_Quantity;
    }

    toJson() {
        if (this.state != "ISSUED") {
            return {
                id: this.id,
                issueDate: this.issueDate,
                state: this.state,
                products: Array.from(this.item_Quantity.entries()).map(p => {
                    return {
                        SKUId: p[0].SKUId,
                        itemId: p[0].itemId,
                        description: p[0].description,
                        price: p[0].price,
                        qty: p[1]
                    }
                }),
                supplierId: this.supplierId,
                transportNote: { "deliveryDate" : this.transportNote},
                skuItems: this.state == "DELIVERY" ? [] : Array.from(this.item_RFID.values())            
                }
        }
        else {
            return {
                id: this.id,
                issueDate: this.issueDate,
                state: this.state,
                products: Array.from(this.item_Quantity.entries()).map(p => {
                    return {
                        SKUId: p[0].SKUId,
                        itemId: p[0].itemId,
                        description: p[0].description,
                        price: p[0].price,
                        qty: p[1]
                    }
                }),
                supplierId: this.supplierId,
                skuItems: []
            }
        }
    }

}

module.exports= RestockOrder;