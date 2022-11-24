' use strict'

class Item {
    constructor(objectItem) {
      this.id = objectItem.id;    
      this.description = objectItem.description;
      this.price = objectItem.price;
      this.SKUId = objectItem.SKUId;
      this.supplierId = objectItem.supplierId;
  
    }
  
  }
  
module.exports = Item;