const Warehouse = require("../modules/Warehouse/Warehouse");
const SKU = require("../modules/Warehouse/SKU");
const dao = require("../modules/DAO/DAO");

wh = new Warehouse();

describe("intergation test of SKU class", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllSKU();
    await dao.DBdeleteAllPositions();
  });

  insertAndListSKU("a description", 1, 1, "a note", 1, 1);
  getSKUbyID("a description", 1, 1, "a note", 1, 1);
  modifySKU("a description", 1, 1, "a note", 1, 1);
  modifySKUPosition("a description", 1, 1, "a note", 1, 1);
  deleteSKU("a description", 1, 1, "a note", 1, 1);
});

function insertAndListSKU(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("list SKUs", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );

    const numberOfSKUs = await wh.listSKUs().then((data) => data.length);

    expect(numberOfSKUs).toStrictEqual(3);
  });
}

function getSKUbyID(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("get SKU by ID", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    await wh.insertNewSKU(
      description + 1,
      weight + 1,
      volume + 1,
      notes + 1,
      price + 1,
      availableQuantity + 1
    );
    await wh.insertNewSKU(
      description + 2,
      weight + 2,
      volume + 2,
      notes + 2,
      price + 2,
      availableQuantity + 2
    );

    const SKUs = await wh.listSKUs();
    const SKU_1 = SKUs[0];
    const SKU_2 = SKUs[1];

    const SKU_1_wh = await wh.getSKUbyID(SKU_1.id);
    const SKU_2_wh = await wh.getSKUbyID(SKU_2.id);

    expect(SKU_1).toStrictEqual(SKU_1_wh);
    expect(SKU_2).toStrictEqual(SKU_2_wh);

    expect(SKU_1.toJson().id).toBe(SKU_1.id);
    expect(SKU_1.getAvailableQuantity()).toStrictEqual(SKU_1.availableQuantity);
    expect(SKU_1.noID().id).toBe(undefined);
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
  test("modify SKU", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );

    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await wh.modifySKU(
      skuid,
      description + "test",
      weight + 1,
      volume,
      notes + "test",
      price + 100,
      availableQuantity
    );

    const modifiedSKU = await wh.listSKUs().then((skus) => skus[0]);

    expect(modifiedSKU.description).toStrictEqual(description + "test");
    expect(modifiedSKU.weight).toStrictEqual(weight + 1);
    expect(modifiedSKU.volume).toStrictEqual(volume);
    expect(modifiedSKU.notes).toStrictEqual(notes + "test");
    expect(modifiedSKU.price).toStrictEqual(price + 100);
    expect(modifiedSKU.availableQuantity).toStrictEqual(availableQuantity);
  });

  test("modify sku in order to exceed position capability", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );

    await wh.addPosition(800234543423, 8002, 3454, 3423, 1000, 1000);

    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await wh.modifySKUPosition(skuid, 800234543423);

    await expect(async () => {
      await wh.modifySKU(
        skuid,
        description,
        weight,
        volume,
        notes,
        price,
        11100
      );
    }).rejects.toBe("422");

    await expect(async () => {
      await wh.modifySKU(
        skuid,
        description,
        1000000,
        volume,
        notes,
        price,
        availableQuantity
      );
    }).rejects.toBe("422");

    await expect(async () => {
      await wh.modifySKU(
        skuid,
        description,
        weight,
        10000,
        notes,
        price,
        availableQuantity
      );
    }).rejects.toBe("422");
  });

  test("modify sku with wrong skuid", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );

    await wh.addPosition(800234543423, 8002, 3454, 3423, 1000, 1000);

    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await expect(async () => {
      await wh.modifySKU(
        skuid + 1,
        description,
        weight,
        volume,
        notes,
        price,
        availableQuantity
      );
    }).rejects.toBe("404");
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
  test("modify sku position", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );

    await wh.addPosition(800234543423, 8002, 3454, 3423, 1000, 1000);

    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await wh.modifySKUPosition(skuid, 800234543423);

    const sku = await wh.getSKUbyID(skuid);

    expect(sku.positionID).toStrictEqual(800234543423);
  });

  test("modify sku position with invalid position", async () => {
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await expect(
      async () => await wh.modifySKUPosition(skuid, 800234543423)
    ).rejects.toBe("404");
  });

  test("modify sku position with not enough capability", async () => {
    await wh.insertNewSKU(description, weight, volume, notes, price, 1000000);
    const skuid = await wh.listSKUs().then((skus) => skus[0].id);

    await wh.addPosition(800234543423, 8002, 3454, 3423, 1000, 1000);

    await expect(
      async () => await wh.modifySKUPosition(skuid, 800234543423)
    ).rejects.toBe("422");
  });
}

function deleteSKU(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("delete sku", async () => {
    const size_0 = await wh.listSKUs().then((data) => data.length);
    await wh.insertNewSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    const skuid = await wh.listSKUs().then((skus) => skus[0].id);
    const size_1 = await wh.listSKUs().then((data) => data.length);
    expect(size_1 - size_0).toStrictEqual(1);
    await wh.deleteSKU(skuid);
    const size_2 = await wh.listSKUs().then((data) => data.length);
    expect(size_1 - size_2).toStrictEqual(1);
  });
}
