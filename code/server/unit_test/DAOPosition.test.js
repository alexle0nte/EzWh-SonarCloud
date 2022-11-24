const DAO = require("../modules/DAO/DAO");
const Position = require("../modules/Warehouse/Position");

describe("test DAOPosition", () => {
  beforeEach(async () => {
    await DAO.DBdeleteAllPositions();
  });

  const pos = new Position(
    800212345678,
    8002,
    1234,
    5678,
    100,
    100,
    undefined,
    0,
    0
  );

  AllPositions(pos);
  insertPosition(pos);
  modifyPosition(pos);
  deletePosition(pos);
});

function AllPositions(position) {
  test("all positions", async () => {
    let initialSize = await DAO.DBAllPositions().then((data) => data.length);
    await DAO.DBinsertPosition(position);
    await DAO.DBinsertPosition(
      Object.assign(Object.create(position), {
        positionID: position.positionID + 1,
      })
    );
    await DAO.DBinsertPosition(
      Object.assign(Object.create(position), {
        positionID: position.positionID + 2,
      })
    );
    await DAO.DBinsertPosition(
      Object.assign(Object.create(position), {
        positionID: position.positionID + 3,
      })
    );

    let finalSize = await DAO.DBAllPositions().then((data) => data.length);
    expect(finalSize - initialSize).toBe(4);
  });
}

function insertPosition(position) {
  test("insert valid position", async () => {
    let initialSize = await DAO.DBAllPositions().then((data) => data.length);
    await DAO.DBinsertPosition(position);
    let finalSize = await DAO.DBAllPositions().then((data) => data.length);
    expect(finalSize - initialSize).toBe(1);
  });

  test("insert invalid position (wrong data type)", async () => {
    let initialSize = await DAO.DBAllPositions().then((data) => data.length);

    await expect(async () => {
      await DAO.DBinsertPosition(
        Object.assign(Object.create(position), { positionID: "text" })
      );
    }).rejects.toThrow();

    let finalSize = await DAO.DBAllPositions().then((data) => data.length);
    expect(finalSize - initialSize).toBe(0);
  });
}

function modifyPosition(position) {
  test("modify position ", async () => {
    await DAO.DBinsertPosition(position);
    const pos_2 = new Position(
      position.positionID,
      position.aisleID,
      position.row,
      position.col,
      position.maxWeight + 100,
      position.maxVolume + 100,
      1,
      100,
      100
    );
    await DAO.DBmodifyPosition(position.positionID, pos_2);
    const modifiedPos = await DAO.DBAllPositions().then(
      (positions) => positions[0]
    );
    expect(modifiedPos.positionID).toStrictEqual(pos_2.positionID);
    expect(modifiedPos.aisleID).toStrictEqual(pos_2.aisleID);
    expect(modifiedPos.row).toStrictEqual(pos_2.row);
    expect(modifiedPos.col).toStrictEqual(pos_2.col);
    expect(modifiedPos.maxWeight).toStrictEqual(pos_2.maxWeight);
    expect(modifiedPos.maxVolume).toStrictEqual(pos_2.maxVolume);
    expect(modifiedPos.SKUID).toStrictEqual(pos_2.SKUID);
    expect(modifiedPos.occupiedWeight).toStrictEqual(pos_2.occupiedWeight);
    expect(modifiedPos.occupiedVolume).toStrictEqual(pos_2.occupiedVolume);
  });
}

function deletePosition(position) {
  test("delete position", async () => {
    let size_0 = await DAO.DBAllPositions().then((data) => data.length);
    await DAO.DBinsertPosition(position);
    let size_1 = await DAO.DBAllPositions().then((data) => data.length);
    expect(size_1 - size_0).toBe(1);
    await DAO.DBdeletePosition(position.positionID);
    let size_2 = await DAO.DBAllPositions().then((data) => data.length);
    expect(size_1 - size_2).toBe(1);
  });
}
