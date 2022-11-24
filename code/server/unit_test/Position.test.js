const Warehouse = require("../modules/Warehouse/Warehouse");
const dao = require("../modules/DAO/DAO");

wh = new Warehouse();

describe("intergation test of SKU class", () => {
  beforeEach(async () => {
    //await dao.DBdeleteAllSKU();
    //await dao.DBdeleteAllSKUItems();
    await dao.DBdeleteAllPositions();
  });

  insertAndListPositions(800212345678, 8002, 1234, 5678, 100, 100);
  modifyPosition(800212345678, 8002, 1234, 5678, 100, 100);
  getPositionbyID(800212345678, 8002, 1234, 5678, 100, 100);
  modifyPositionID(800212345678, 8002, 1234, 5678, 100, 100);
});

function insertAndListPositions(id, aisle, row, col, maxWeight, maxVolume) {
  test("insert and list all positions", async () => {
    await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    await wh.addPosition(id + 1, aisle, row, col, maxWeight, maxVolume);
    await wh.addPosition(id + 2, aisle, row, col, maxWeight, maxVolume);

    const length = await wh.listPositions().then((data) => data.length);
    expect(length).toStrictEqual(3);
  });

  test("insert position with id already used", async () => {
    await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    await expect(async () => {
      await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    }).rejects.toThrow();
  });
}

function getPositionbyID(id, aisle, row, col, maxWeight, maxVolume) {
  test("get position by ID", async () => {
    await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    const position = await wh.getPositionByID(id);

    expect(position.positionID).toStrictEqual(id);
    expect(position.aisleID).toStrictEqual(aisle);
    expect(position.row).toStrictEqual(row);
    expect(position.col).toStrictEqual(col);
    expect(position.maxWeight).toStrictEqual(maxWeight);
    expect(position.maxVolume).toStrictEqual(maxVolume);
  });
}

function modifyPosition(id, aisle, row, col, maxWeight, maxVolume) {
  test("modify valid position ", async () => {
    await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    await wh.modifyPosition(
      id,
      aisle + 1,
      row + 1,
      col + 1,
      maxWeight + 1,
      maxVolume + 1,
      100,
      100
    );
    const newID = parseInt(
      (aisle + 1).toString() + (row + 1).toString() + (col + 1).toString()
    );

    const modifiedPosition = await wh.getPositionByID(newID);

    expect(modifiedPosition.positionID.toString()).toStrictEqual(
      (aisle + 1).toString() + (row + 1).toString() + (col + 1).toString()
    );
    expect(modifiedPosition.aisleID).toStrictEqual(aisle + 1);
    expect(modifiedPosition.row).toStrictEqual(row + 1);
    expect(modifiedPosition.col).toStrictEqual(col + 1);
    expect(modifiedPosition.maxWeight).toStrictEqual(maxWeight + 1);
    expect(modifiedPosition.maxVolume).toStrictEqual(maxVolume + 1);
    expect(modifiedPosition.occupiedWeight).toStrictEqual(100);
    expect(modifiedPosition.occupiedVolume).toStrictEqual(100);
  });

  test("modify nonexistent position", async () => {
    await expect(
      async () =>
        await wh.modifyPosition(id, aisle, row, col, maxWeight, maxVolume, 0, 0)
    ).rejects.toBe("404");
  });
}

function modifyPositionID(id, aisle, row, col, maxWeight, maxVolume) {
  test("modify valid position ID", async () => {
    await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    const newPositionID = (123456789056).toString();
    await wh.modifyPositionID(id, newPositionID);
    const position = await wh.getPositionByID(newPositionID);

    expect(position.positionID.toString()).toStrictEqual(newPositionID);
    expect(position.aisleID.toString()).toStrictEqual(
      newPositionID.substring(0, 4)
    );
    expect(position.row.toString()).toStrictEqual(
      newPositionID.substring(4, 8)
    );
    expect(position.col.toString()).toStrictEqual(
      newPositionID.substring(8, 12)
    );
  });

  test("modify position with invalid positionID length", async () => {
    await wh.addPosition(id, aisle, row, col, maxWeight, maxVolume);
    await expect(async () => await wh.modifyPositionID(id, 11)).rejects.toBe(
      "422"
    );
  });
}
