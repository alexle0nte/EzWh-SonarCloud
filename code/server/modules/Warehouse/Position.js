"use strict";

class Position {

  constructor(
    positionID,
    aisleID,
    row,
    col,
    maxWeight,
    maxVolume,
    SKUID = undefined, //altough not required, it is usefull to check whether this position is assigned to some sku
    occupiedVolume = 0,
    occupiedWeight = 0
  ) {
    this.positionID = positionID;
    this.aisleID = aisleID;
    this.row = row;
    this.col = col;
    this.maxWeight = maxWeight;
    this.maxVolume = maxVolume;
    this.SKUID = SKUID;
    this.occupiedVolume = occupiedVolume;
    this.occupiedWeight = occupiedWeight;
  }

  toJson() {
    return {
      positionID: this.positionID,
      aisleID: this.aisleID,
      row: this.row,
      col: this.col,
      maxWeight: this.maxWeight,
      maxVolume: this.maxVolume,
      occupiedVolume: this.occupiedVolume,
      occupiedWeight: this.occupiedWeight,
    };
  }
}

module.exports = Position;
