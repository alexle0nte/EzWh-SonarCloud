"use strict";

class SKU {
  constructor(
    id,
    description,
    weight,
    volume,
    notes,
    positionID,
    price,
    availableQuantity
  ) {
    this.id = id;
    this.description = description;
    this.weight = weight;
    this.volume = volume;
    this.notes = notes;
    this.positionID = positionID;
    this.price = price;
    this.availableQuantity = availableQuantity;
  }

  getSKUItems() {}

  //this method is made to be coherent with the json expected in the API
  noID() {
    delete this.id;
    return this;
  }

  getAvailableQuantity() {
    return this.availableQuantity;
  }

  toJson() {
    let ret = Object.assign(this, { position: this.positionID });
    delete ret.positionID;
    return ret;
  }
}

module.exports = SKU;
