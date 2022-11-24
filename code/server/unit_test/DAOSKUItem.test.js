const DAO = require("../modules/DAO/DAO");
const SKUItem = require("../modules/Warehouse/SKUItem");

describe("test DAOSKUItem", () => {
  beforeEach(async () => {
    await DAO.DBdeleteAllSKUItems();
  });

  const skuitem = new SKUItem("123456", 0, 1, "DD/MM/YYYY");

  testNewSKUItem(skuitem);
  getAllSKUItem(skuitem);
  modifySKUItem(skuitem);
  deleteSKUItem(skuitem);
});

function testNewSKUItem(skuitem) {
  test("insert valid skuitem", async () => {
    await DAO.DBinsertSKUItem(skuitem);
    var storedskuitem = await DAO.DBallSKUItems().then(
      (skuitems) => skuitems[0]
    );

    expect(storedskuitem.RFID).toStrictEqual(skuitem.RFID);
    expect(storedskuitem.available).toStrictEqual(skuitem.available);
    expect(storedskuitem.SKUID).toStrictEqual(skuitem.SKUID);
    expect(storedskuitem.dateOfStock).toStrictEqual(skuitem.dateOfStock);
  });

  test("insert invalid skuitem", async () => {
    await expect(async () => {
      await DAO.DBinsertSKUItem(
        Object.assign(Object.create(skuitem), { SKUID: "text" })
      );
    }).rejects.toThrow();
  });

  test("insert skuitems with same RFID", async () => {
    await expect(async () => {
      await DAO.DBinsertSKUItem(skuitem);
      await DAO.DBinsertSKUItem(skuitem);
    }).rejects.toThrow();
  });
}

function getAllSKUItem(skuitem) {
  test("get all skuItems", async () => {
    var initialSize = await DAO.DBallSKUItems().then((data) => data.length);
    await DAO.DBinsertSKUItem(skuitem);
    await DAO.DBinsertSKUItem(
      Object.assign(Object.create(skuitem), { RFID: skuitem.RFID + 1 })
    );
    await DAO.DBinsertSKUItem(
      Object.assign(Object.create(skuitem), { RFID: skuitem.RFID + 2 })
    );
    await DAO.DBinsertSKUItem(
      Object.assign(Object.create(skuitem), { RFID: skuitem.RFID + 3 })
    );
    await DAO.DBinsertSKUItem(
      Object.assign(Object.create(skuitem), { RFID: skuitem.RFID + 4 })
    );

    var finalSize = await DAO.DBallSKUItems().then((data) => data.length);
    expect(finalSize - initialSize).toStrictEqual(5);
  });
}

function modifySKUItem(skuitem) {
  test("modify skuitem", async () => {
    await DAO.DBinsertSKUItem(skuitem);
    var RFID = await DAO.DBallSKUItems().then((skuitems) => skuitems[0].RFID);

    const skuitem_2 = new SKUItem(
      skuitem.RFID + 50,
      skuitem.available + 1,
      skuitem.SKUID + 1,
      "DD/MM/YYYY"
    );

    await DAO.DBmodifySKUItem(RFID, skuitem_2);

    const modifiedSKUItem = await DAO.DBallSKUItems()
      .then((skuitems) =>
        skuitems.filter((skuitem) => skuitem.RFID == skuitem_2.RFID)
      )
      .then((skuitems) => skuitems[0]);

    expect(modifiedSKUItem.RFID).toStrictEqual(skuitem_2.RFID);
    expect(modifiedSKUItem.available).toStrictEqual(skuitem_2.available);
    expect(modifiedSKUItem.SKUID).toStrictEqual(skuitem_2.SKUID);
    expect(modifiedSKUItem.dateOfStock).toStrictEqual(skuitem_2.dateOfStock);
  });
}

function deleteSKUItem(skuitem) {
  test("delete skuitem", async () => {
    var size_0 = await DAO.DBallSKUItems().then((skuitems) => skuitems.length);
    await DAO.DBinsertSKUItem(skuitem);
    var size_1 = await DAO.DBallSKUItems().then((skuitems) => skuitems.length);
    expect(size_1 - size_0).toBe(1);
    await DAO.DBdeleteSKUItem(skuitem.RFID);
    var size_2 = await DAO.DBallSKUItems().then((skuitems) => skuitems.length);
    expect(size_1 - size_2).toBe(1);
  });
}
