const DAO = require("../modules/DAO/DAO");

describe("test DAOSKU", () => {
  beforeEach(async () => {
    await DAO.DBdeleteAllSKU();
  });

  testNewSKU("a description", 1, 1, "a note", 10, 0);
  modifySKU("a description", 1, 1, "a note", 10, 0);
  modifySKUPosition("a description", 1, 1, "a note", 10, 0);
  decreaseSKUAvailableQuantity("a description", 1, 1, "a note", 10, 0);
  increaseSKUAvailableQuantity("a description", 1, 1, "a note", 10, 0);
  deleteSKU();
  getAllSKU();
});

function testNewSKU(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("insert valid sku", async () => {
    await DAO.DBinsertSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    var skus = await DAO.DBallSKUs();
    var sku = skus[0];
    expect(skus.length).toStrictEqual(1);
    expect(sku.description).toStrictEqual(description);
    expect(sku.weight).toStrictEqual(weight);
    expect(sku.volume).toStrictEqual(volume);
    expect(sku.notes).toStrictEqual(notes);
    expect(sku.price).toStrictEqual(price);
    expect(sku.availableQuantity).toStrictEqual(availableQuantity);
  });

  test("insert invalid sku", async () => {
    expect(async () => {
      await DAO.DBinsertSKU(
        "a description",
        "Here should be a number",
        1,
        "a note",
        10,
        0
      );
    }).rejects.toThrow();
  });
}

function deleteSKU() {
  test("delete sku", async () => {
    await DAO.DBinsertSKU("a description", 1, 1, "a note", 10, 0);
    var skuid = await DAO.DBallSKUs().then((sku) => sku[0].id);
    await DAO.DBdeleteSKU(skuid);
    var finalSize = await DAO.DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == skuid))
      .then((skus) => skus.length);
    expect(finalSize).toStrictEqual(0);
  });
}

function modifySKU(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("modify sku", async () => {
    await DAO.DBinsertSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    var skuid = await DAO.DBallSKUs().then((skus) => skus[0].id);
    await DAO.DBmodifySKU(
      skuid,
      description + "test",
      weight + 100,
      volume + 100,
      notes + "test",
      price + 100,
      availableQuantity + 100
    );
    const modifiedSKU = await DAO.DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == skuid))
      .then((skus) => skus[0]);

    expect(modifiedSKU.description).toStrictEqual(description + "test");
    expect(modifiedSKU.weight).toStrictEqual(weight + 100);
    expect(modifiedSKU.volume).toStrictEqual(volume + 100);
    expect(modifiedSKU.notes).toStrictEqual(notes + "test");
    expect(modifiedSKU.price).toStrictEqual(price + 100);
    expect(modifiedSKU.availableQuantity).toStrictEqual(
      availableQuantity + 100
    );
  });
}

function getAllSKU() {
  test("get all skus", async () => {
    await DAO.DBinsertSKU("a description", 1, 1, "a note", 10, 0);
    await DAO.DBinsertSKU("a description", 1, 1, "a note", 10, 0);
    await DAO.DBinsertSKU("a description", 1, 1, "a note", 10, 0);
    await DAO.DBinsertSKU("a description", 1, 1, "a note", 10, 0);

    var finalSize = await DAO.DBallSKUs().then((data) => data.length);
    expect(finalSize).toStrictEqual(4);
  });
}

function modifySKUPosition(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("modify SKU position", async () => {
    await DAO.DBinsertSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    var skuid = await DAO.DBallSKUs().then((skus) => skus[0].id);
    await DAO.DBmodifySKUPosition(skuid, 12345);
    const sku = await DAO.DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == skuid))
      .then((skus) => skus[0]);
    expect(sku.positionID).toStrictEqual(12345);
  });
}

function decreaseSKUAvailableQuantity(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("decrease SKU available quantity", async () => {
    await DAO.DBinsertSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    var skuid = await DAO.DBallSKUs().then((skus) => skus[0].id);
    await DAO.DBdecreaseSKUAvailableQuantity(skuid, 1);
    const sku = await DAO.DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == skuid))
      .then((skus) => skus[0]);
    expect(sku.availableQuantity).toStrictEqual(availableQuantity - 1);
  });
}

function increaseSKUAvailableQuantity(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("increase SKU available quantity", async () => {
    await DAO.DBinsertSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    var skuid = await DAO.DBallSKUs().then((skus) => skus[0].id);
    await DAO.DBincreaseSKUAvailableQuantity(skuid, 1);
    const sku = await DAO.DBallSKUs()
      .then((skus) => skus.filter((sku) => sku.id == skuid))
      .then((skus) => skus[0]);
    expect(sku.availableQuantity).toStrictEqual(availableQuantity + 1);
  });
}
