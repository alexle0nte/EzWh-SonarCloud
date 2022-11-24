"use strict";

const SKUItem = require("./SKUItem");
const dao = require("./../DAO/DAO");
const Position = require("./Position");

class Warehouse {
  insertNewSKU(description, weight, volume, notes, price, availableQuantity) {
    return dao.DBinsertSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
  }

  listSKUs() {
    return dao.DBallSKUs().then((skus) => {
      return dao.DBallTestDescriptors().then((tds) => {
        return skus.map((sku) => {
          return Object.assign(sku, {
            testDescriptors: tds
              .filter((td) => td.SKUID == sku.id)
              .map((td) => td.id),
          });
        });
      });
    });
  }

  getSKUbyID(ID) {
    return this.listSKUs()
      .then((skus) => {
        return skus;
      })
      .then((skus) => skus.filter((sku) => sku.id == parseInt(ID)))
      .then((skus) => {
        return skus;
      })
      .then((skus) => skus[0]);
  }

  modifySKU(
    id,
    newDescription,
    newWeight,
    newVolume,
    newNotes,
    newPrice,
    newAvailableQuantity
  ) {
    return (
      dao
        .DBallSKUs(id)
        .then((skus) => skus.filter((sku) => sku.id == id))
        .then((skus) => skus[0])
        .then((sku) => {
          //check if the given sku actually exists
          if (sku === undefined) throw "404";
          // check if it is assigned to a position,
          // if so, do further check on the position capability
          if (
            sku.positionID != undefined &&
            (sku.availableQuantity != newAvailableQuantity ||
              sku.volume != newVolume ||
              sku.weight != newWeight)
          ) {
            return dao
              .DBAllPositions()
              .then((positions) =>
                positions.filter(
                  (position) => position.positionID == sku.positionID
                )
              )
              .then((positions) => positions[0])
              .then((position) => {
                const newOccupiedVolume = newVolume * newAvailableQuantity;
                const newOccupiedWeight = newWeight * newAvailableQuantity;
                //check the position capability
                if (
                  newOccupiedVolume > position.maxVolume ||
                  newOccupiedWeight > position.maxWeight
                )
                  throw "422";
                // update the position
                return dao.DBmodifyPosition(
                  sku.positionID,
                  Object.assign(position, {
                    occupiedVolume: newVolume * newAvailableQuantity,
                    occupiedWeight: newWeight * newAvailableQuantity,
                  })
                );
              });
          }
        })
        // if all the check are passed, modify the SKU
        .then(() =>
          dao.DBmodifySKU(
            id,
            newDescription,
            newWeight,
            newVolume,
            newNotes,
            newPrice,
            newAvailableQuantity
          )
        )
    );
  }

  deleteSKU(id) {
    return dao
      .DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == id))
      .then((skus) => skus[0])
      .then((sku) => {
        if (sku != undefined && sku.positionID != undefined) {
          return dao
            .DBAllPositions()
            .then((positions) =>
              positions.filter(
                (position) => position.positionID == sku.positionID
              )
            )
            .then((positions) =>
              positions.forEach((position) => {
                //reset position occupied volume and weight
                return this.modifyPosition(
                  position.positionID,
                  position.aisleID,
                  position.row,
                  position.col,
                  position.maxWeight,
                  position.maxVolume,
                  0,
                  0
                );
              })
            );
        }
      })
      .then(() => dao.DBdeleteSKU(id));
  }

  modifySKUPosition(id, newPositionID) {
    return (
      dao
        .DBallSKUs(id)
        //search the SKU
        .then((skus) => skus.filter((sku) => sku.id == id))
        .then((skus) => skus[0])
        .then((sku) => {
          //throw an error if the sku does not exists
          if (sku === undefined) throw "404";
          return (
            dao
              //search the new position
              .DBAllPositions()
              .then((positions) =>
                positions.filter(
                  (position) => position.positionID == newPositionID
                )
              )
              .then((positions) => positions[0])
              .then((position) => {
                //throw an error if the new position does not exists
                if (position === undefined) throw "404";
                //compute the new values
                const newVolume = sku.volume * sku.availableQuantity;
                const newWeight = sku.weight * sku.availableQuantity;
                //check the capability of the position
                if (
                  position.SKUID != undefined ||
                  newVolume > position.maxVolume ||
                  newVolume > position.maxWeight
                )
                  throw "422";

                const newPosition = Object.assign(position, {
                  SKUID: sku.id,
                  occupiedVolume: newVolume,
                  occupiedWeight: newWeight,
                });

                return (
                  dao
                    //modify the new position
                    .DBmodifyPosition(newPositionID, newPosition)
                    //modify the sku with the new position
                    .then(dao.DBmodifySKUPosition(id, newPositionID))
                    //finally, if the sku was associated to a position before,
                    //update the old position
                    .then(() => {
                      if (sku.positionID != undefined) {
                        return dao
                          .DBAllPositions()
                          .then((oldpositions) =>
                            oldpositions.filter(
                              (oldposition) =>
                                oldposition.positionID == sku.positionID
                            )
                          )
                          .then((oldpositions) => oldpositions[0])
                          .then((oldposition) => {
                            if (oldposition != undefined) {
                              return dao.DBmodifyPosition(
                                sku.positionID,
                                Object.assign(oldposition, {
                                  SKUID: undefined,
                                  occupiedVolume: 0,
                                  occupiedWeight: 0,
                                })
                              );
                            }
                          });
                      }
                    })
                );
              })
          );
        })
    );
  }

  listSKUItems() {
    return dao.DBallSKUItems();
  }

  getSKUItembySKU(SKUID) {
    return dao
      .DBallSKUItems()
      .then((skuitems) =>
        skuitems.filter(
          (skuitem) => skuitem.SKUID == parseInt(SKUID) && skuitem.available
        )
      )
      .then((skuitems) => skuitems.map((sku) => sku.noAvailable()));
  }

  getSKUItembyRFID(RFID) {
    return dao
      .DBallSKUItems()
      .then((skuitems) => skuitems.filter((skuitem) => skuitem.RFID == RFID))
      .then((skuitems) => skuitems[0]);
  }

  insertSKUItem(RFID, SKUID, dateOfStock) {
    return dao
      .DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == SKUID))
      .then((skus) => {
        if (skus.length > 0) {
          return dao.DBinsertSKUItem(new SKUItem(RFID, 0, SKUID, dateOfStock));
        } else throw "404";
      });
  }

  modifySKUItem(oldRFID, newRFID, newAvailable, newDateOfStock) {
    return (
      dao
        .DBallSKUItems()
        //retrieve the skuitem
        .then((skuitems) =>
          skuitems.filter((skuitem) => skuitem.RFID == oldRFID)
        )
        .then((skuitems) => skuitems[0])
        .then((oldSKUItem) => {
          //if the skuitem does not exists, throw an error
          if (oldSKUItem === undefined) throw "404";
          else {
            if (oldSKUItem.available != newAvailable) {
              //update sku availability only if the availability is changed
              return (
                dao
                  .DBallSKUs()
                  .then((skus) =>
                    skus.filter((sku) => sku.id == oldSKUItem.SKUID)
                  )
                  .then((skus) => skus[0])
                  .then((sku) => {
                    if (sku != undefined) {
                      return this.modifySKU(
                        sku.id,
                        sku.description,
                        sku.weight,
                        sku.volume,
                        sku.notes,
                        sku.price,
                        sku.availableQuantity +
                          (newAvailable - oldSKUItem.available)
                      );
                    }
                  })
                  //update the skuitem
                  .then(() =>
                    dao.DBmodifySKUItem(
                      oldRFID,
                      new SKUItem(
                        newRFID,
                        newAvailable,
                        oldSKUItem.SKUID,
                        newDateOfStock
                      )
                    )
                  )
              );
            } //if the availability is not changed, update only the skuitem
            return dao.DBmodifySKUItem(
              oldRFID,
              new SKUItem(
                newRFID,
                newAvailable,
                oldSKUItem.SKUID,
                newDateOfStock
              )
            );
          }
        })
    );
  }

  deleteSKUItem(rfid) {
    //retrieve the SKU associated to this SKUItem in order to update the avaliability
    return this.getSKUItembyRFID(rfid)
      .then((skuitem) => {
        return this.getSKUbyID(skuitem.SKUID).then((sku) => {
          //update the availability of the SKU associated to this SKUItem
          if (sku != undefined) {
            return this.modifySKU(
              sku.id,
              sku.description,
              sku.weight,
              sku.volume,
              sku.notes,
              sku.price,
              sku.availableQuantity - skuitem.available
            );
          }
        });
      })
      .then(() => dao.DBdeleteSKUItem(rfid));
  }

  listPositions() {
    return dao
      .DBAllPositions()
      .then((positions) => positions.map((position) => position.toJson()));
  }

  addPosition(id, aisle, row, col, maxWeight, maxVolume) {
    return dao.DBinsertPosition(
      new Position(id, aisle, row, col, maxWeight, maxVolume)
    );
  }

  modifyPosition(
    oldID,
    newAisleID,
    newRow,
    newCol,
    newMaxWeight,
    newMaxVolume,
    newOccupiedWeight,
    newOccupiedVolume,
    SKUID = undefined
  ) {
    //NOTE : since the front-end can modify newOccupiedWeight and newOccupiedVolume, it could lead to
    // inconsistency with the actual SKU stored in that position!!

    const newPositionID =
      newAisleID.toString() + newRow.toString() + newCol.toString();

    return dao
      .DBAllPositions()
      .then((positions) =>
        positions.filter((position) => position.positionID == oldID)
      )
      .then((positions) => positions[0])
      .then((oldposition) => {
        if (oldposition === undefined) throw "404";
        else {
          const position = new Position(
            newPositionID,
            newAisleID,
            newRow,
            newCol,
            newMaxWeight,
            newMaxVolume,
            SKUID,
            newOccupiedVolume,
            newOccupiedWeight
          );

          return dao
            .DBmodifyPosition(oldID, position)
            .then(/*then we need oldposition*/ () => oldposition);
        }
      }) // update also the SKU with associated positionID
      .then((oldposition) => {
        return dao
          .DBallSKUs()
          .then((skus) =>
            skus.filter((sku) => sku.positionID == oldposition.positionID)
          )
          .then((skus) => skus[0])
          .then((sku) => {
            if (sku != undefined) {
              return dao.DBmodifySKUPosition(sku.id, newPositionID);
            }
          });
      });
  }

  modifyPositionID(oldID, newID) {
    if (newID.toString().length != 12) throw "422";

    return dao
      .DBAllPositions()
      .then((positions) =>
        positions.filter((position) => position.positionID == oldID)
      )
      .then((positions) => positions[0])
      .then((oldposition) => {
        if (oldposition === undefined) throw "404";
        else {
          const position = Object.assign(oldposition, {
            positionID: newID,
            aisleID: newID.substring(0, 4),
            row: newID.substring(4, 8),
            col: newID.substring(8, 12),
          });
          return dao.DBmodifyPosition(oldID, position);
        }
      }) // update also the SKU with associated positionID
      .then(() => {
        return dao
          .DBallSKUs()
          .then((skus) => skus.filter((sku) => sku.positionID == oldID))
          .then((skus) => skus[0])
          .then((sku) => {
            if (sku != undefined) {
              return dao.DBmodifySKUPosition(sku.id, newID);
            }
          });
      });
  }

  deletePosition(positionID) {
    //NOTE : is it supposed to delete the position even though there is some SKU associated to this position??
    return dao.DBdeletePosition(positionID);
  }

  getPositionByID(positionID) {
    return this.listPositions().then(
      (positions) =>
        positions.filter(
          (position) => position.positionID == parseInt(positionID)
        )[0]
    );
  }

  /********************************************************************
   *              INTERNAL ORDER
   *******************************************************************/

  retrieveInternalOrderProduct(SKUID, quantity) {
    return dao
      .DBdecreaseSKUAvailableQuantity(SKUID, quantity)
      .then(() =>
        dao
          .DBgetSKUItemFIFO(SKUID, quantity)
          .then((skuItems) =>
            Promise.all(
              skuItems.map((skuItem) =>
                dao.DBmodifySKUItemAssociation(skuItem.RFID, 1)
              )
            ).then(() => skuItems)
          )
          .then((skuItems) => skuItems.map((skuItem) => skuItem.RFID))
      );
  }

  removeInternalOrderProduct(SKUID, quantity) {
    return dao
      .DBincreaseSKUAvailableQuantity(SKUID, quantity);
  }
}

module.exports = Warehouse;
