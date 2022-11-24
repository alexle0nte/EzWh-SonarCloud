const Warehouse = require("../modules/Warehouse/Warehouse");
const dao = require("../modules/DAO/DAO");
const Position = require("../modules/Warehouse/Position");

wh = new Warehouse();

describe("intergation test of SKU class", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllSKU();
    await dao.DBinsertSKU("a description", 1, 1, "a note", 10, 0);
    await dao.DBinsertSKU("a description", 1, 1, "a note", 10, 0);
    await dao.DBdeleteAllSKUItems();
  });

  insertAndListSKUItem("12345678901245689012345689016", "DD/MM/YYY");
  getSKUItembySKU("12345678901245689012345689016", "DD/MM/YYY");
  getSKUItembyRFID("12345678901245689012345689016", "DD/MM/YYY");
  modifySKUItem("12345678901245689012345689016", "DD/MM/YYY");
});

function insertAndListSKUItem(rfid, dateOfStock) {
  test("list SKUs", async () => {
    const skuid = await wh.listSKUs().then((skus) => skus[0].id);
    await wh.insertSKUItem(rfid, skuid, dateOfStock);
    await wh.insertSKUItem(rfid + 1, skuid, dateOfStock);
    await wh.insertSKUItem(rfid + 2, skuid, dateOfStock);
    await wh.insertSKUItem(rfid + 3, skuid, dateOfStock);

    const numberOfSKUItems = await wh
      .listSKUItems()
      .then((data) => data.length);

    expect(numberOfSKUItems).toStrictEqual(4);
  });
}

function getSKUItembySKU(rfid, dateOfStock) {
  test("get skuitem by sku with available = 1", async () => {
    const skus = await wh.listSKUs();
    const skuid_1 = skus[0].id;
    const skuid_2 = skus[1].id;

    await wh.insertSKUItem(rfid, skuid_1, dateOfStock);
    await wh.insertSKUItem(rfid + 1, skuid_2, dateOfStock);

    await wh.modifySKUItem(rfid, rfid, 1, dateOfStock);
    await wh.modifySKUItem(rfid + 1, rfid + 1, 1, dateOfStock);

    const skuitem_1 = await wh
      .getSKUItembySKU(skuid_1)
      .then((skuitems) => skuitems[0]);
    const skuitem_2 = await wh
      .getSKUItembySKU(skuid_2)
      .then((skuitems) => skuitems[0]);

    expect(skuitem_1.RFID).toStrictEqual(rfid);
    expect(skuitem_2.RFID).toStrictEqual(rfid + 1);
  });
}

function getSKUItembyRFID(rfid, dateOfStock) {
  test("get skuitem by rfid", async () => {
    const skus = await wh.listSKUs();
    const skuid_1 = skus[0].id;
    const skuid_2 = skus[1].id;

    await wh.insertSKUItem(rfid, skuid_1, dateOfStock);
    await wh.insertSKUItem(rfid + 1, skuid_2, dateOfStock);

    const skuitem_1 = await wh.getSKUItembyRFID(rfid);
    const skuitem_2 = await wh.getSKUItembyRFID(rfid + 1);

    expect(skuitem_1.RFID).toStrictEqual(rfid);
    expect(skuitem_1.SKUID).toStrictEqual(skuid_1);
    expect(skuitem_2.RFID).toStrictEqual(rfid + 1);
    expect(skuitem_2.SKUID).toStrictEqual(skuid_2);
  });
}

function modifySKUItem(rfid, dateOfStock) {
  test("modify skuitem with valid data", async () => {
    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await wh.insertSKUItem(rfid, skuid, dateOfStock);

    await wh.modifySKUItem(rfid, rfid + 1, 1, dateOfStock + 1);

    const skuitem_1 = await wh.getSKUItembyRFID(rfid);
    const skuitem_2 = await wh.getSKUItembyRFID(rfid + 1);

    expect(skuitem_1).toBe(undefined);

    expect(skuitem_2.RFID).toStrictEqual(rfid + 1);
    expect(skuitem_2.dateOfStock).toStrictEqual(dateOfStock + 1);
    expect(skuitem_2.available).toStrictEqual(1);
  });

  test("modify skuitem with rfid already used", async () => {
    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await wh.insertSKUItem(rfid, skuid, dateOfStock);
    await wh.insertSKUItem(rfid + 1, skuid, dateOfStock);

    await expect(async () => {
      await wh.modifySKUItem(rfid, rfid + 1, 1, dateOfStock + 1);
    }).rejects.toThrow();
  });

  test("modify skuitem which does not exists", async () => {
    await expect(async () => {
      await wh.modifySKUItem(rfid, rfid + 1, 1, dateOfStock + 1);
    }).rejects.toBe("404");
  });

  test("modify availability and check availability of SKU and occupied volume and weight in the position", async () => {
    await dao.DBdeleteAllPositions();
    await dao.DBinsertPosition(
      new Position(800212345678, 8002, 1234, 5678, 100, 100, undefined, 0, 0)
    );

    let sku = await wh.listSKUs().then((skus) => skus[0]);

    await wh.modifySKU(
      sku.id,
      sku.description,
      10,
      10,
      sku.notes,
      sku.price,
      0
    );

    await wh.modifySKUPosition(sku.id, 800212345678);
    await wh.insertSKUItem(rfid, sku.id, dateOfStock);
    await wh.modifySKUItem(rfid, rfid, 1, dateOfStock);

    sku = await wh.listSKUs().then((skus) => skus[0]);
    const position = await wh.listPositions().then((positions) => positions[0]);

    expect(sku.availableQuantity).toBe(1);
    expect(position.occupiedWeight).toBe(10);
    expect(position.occupiedVolume).toBe(10);
  });

  test("modify availability to exceed position capability", async () => {
    await dao.DBdeleteAllPositions();
    await dao.DBinsertPosition(
      new Position(800212345678, 8002, 1234, 5678, 100, 100, undefined, 0, 0)
    );

    let sku = await wh.listSKUs().then((skus) => skus[0]);

    await wh.modifySKU(
      sku.id,
      sku.description,
      10,
      1100,
      sku.notes,
      sku.price,
      0
    );

    await wh.modifySKUPosition(sku.id, 800212345678);
    await wh.insertSKUItem(rfid, sku.id, dateOfStock);

    await expect(async () => {
      await wh.modifySKUItem(rfid, rfid, 1, dateOfStock);
    }).rejects.toBe("422");
  });
}
