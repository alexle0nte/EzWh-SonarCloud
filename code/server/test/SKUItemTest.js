const chai = require("chai");
const chaiHttp = require("chai-http");
const position = require("../api/position");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("test SKUitem apis", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllSKU();
    await dao.DBdeleteAllPositions();
    await dao.DBdeleteAllSKUItems();
  });

  const sku = {
    description: "a new sku",
    weight: 100,
    volume: 50,
    notes: "first SKU",
    price: 10.99,
    availableQuantity: 0,
  };

  const position = {
    positionID: "800234543412",
    aisleID: "8002",
    row: "3454",
    col: "3412",
    maxWeight: 1000,
    maxVolume: 1000,
  };

  const skuitem = {
    RFID: "12345678901212345678909876543234",
    SKUId: 1,
    DateOfStock: "2021/11/29 12:30",
  };

  getAllSKUItems(sku, skuitem);
  getSKUItemBySKUID(sku, skuitem);
  getSKUItemByRFID(sku, skuitem);
  insertSKUItem(sku, skuitem);
  deleteSKUItem(sku, skuitem, position);
  modifySKUItem(sku, skuitem, position);
});

function getAllSKUItems(sku, skuitem) {
  it("get all skuitems", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    await agent
      .get("/api/skuitems")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => res.body[0].RFID.should.equal(skuitem.RFID));
  });
}

function getSKUItemBySKUID(sku, skuitem) {
  it("get skuitems by SKUID", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    await agent
      .put(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send({
        newRFID: skuitem.RFID,
        newAvailable: 1,
        newDateOfStock: skuitem.DateOfStock,
      })
      .then((res) => {
        res.should.have.status(200);
      });

    await agent
      .get(`/api/skuitems/sku/${skuid}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body[0].RFID.should.equal(skuitem.RFID);
      });
  });
}

function getSKUItemByRFID(sku, skuitem) {
  it("get skuitems by RFID", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    await agent
      .get(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body.RFID.should.equal(skuitem.RFID);
        res.body.Available.should.equal(0);
        res.body.DateOfStock.should.equal(skuitem.DateOfStock);
      });
  });

  it("get skuitems with wrong RFID", async () => {
    await agent
      .get(`/api/skuitems/text_instead_of_int`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(422);
      });
  });

  it("get skuitems with nonexistent RFID", async () => {
    await agent
      .get(`/api/skuitems/11111111111111111111111111111111`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(404);
      });
  });

  // it("get skuitems without authorization", async () => {
  //   await agent
  //     .get(`/api/skuitems/1`)
  //     .send()
  //     .then((res) => {
  //       res.should.have.status(401);
  //     });
  // });
}

function insertSKUItem(sku, skuitem) {
  it("insert invalid skuitem (wrong dateOfStock)", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign(
      { ...skuitem },
      { SKUId: skuid, DateOfStock: "this is not a date" }
    );

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(422));
  });

  it("insert invalid skuitem (wrong RFID)", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign(
      { ...skuitem },
      { SKUId: skuid, RFID: 12345 }
    );

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(422));
  });

  it("insert invalid skuitem (nonexistent skuid)", async () => {
    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem)
      .then((res) => res.should.have.status(404));
  });
}

function modifySKUItem(sku, skuitem, position) {
  it("modify skuitem", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    //insert position
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    //modify the position of the sku
    await agent
      .put(`/api/sku/${skuid}/position`)
      .set("Cookie", "user=manager;")
      .send({ position: position.positionID })
      .then((res) => res.should.have.status(200));

    await agent
      .put(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send({
        newRFID: skuitem.RFID,
        newAvailable: 1,
        newDateOfStock: skuitem.DateOfStock,
      })
      .then((res) => {
        res.should.have.status(200);
      });

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        return res.body.filter(
          (data) => data.positionID == position.positionID
        )[0];
      })
      .then((data) => {
        data.occupiedWeight.should.equal(sku.weight);
        data.occupiedVolume.should.equal(sku.volume);
      });
  });

  it("modify skuitem to exceed position capability", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    //insert position
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(Object.assign({ ...position }, { maxVolume: 10 }))
      .then((res) => res.should.have.status(201));

    //modify the position of the sku
    await agent
      .put(`/api/sku/${skuid}/position`)
      .set("Cookie", "user=manager;")
      .send({ position: position.positionID })
      .then((res) => res.should.have.status(200));

    await agent
      .put(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send({
        newRFID: skuitem.RFID,
        newAvailable: 1,
        newDateOfStock: skuitem.DateOfStock,
      })
      .then((res) => {
        res.should.have.status(503);
      });
  });
}

function deleteSKUItem(sku, skuitem, position) {
  it("delete skuitem", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    await agent
      .delete(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => res.should.have.status(204));

    await agent
      .get(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(404);
      });
  });

  it("delete skuitem and decrease position volume and weight", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));

    const skuid = await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        return res.body[0].id;
      });

    let skuitem_tmp = Object.assign({ ...skuitem }, { SKUId: skuid });

    await agent
      .post("/api/skuitem")
      .set("Cookie", "user=manager;")
      .send(skuitem_tmp)
      .then((res) => res.should.have.status(201));

    //insert position
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    //modify the position of the sku
    await agent
      .put(`/api/sku/${skuid}/position`)
      .set("Cookie", "user=manager;")
      .send({ position: position.positionID })
      .then((res) => res.should.have.status(200));

    await agent
      .put(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send({
        newRFID: skuitem.RFID,
        newAvailable: 1,
        newDateOfStock: skuitem.DateOfStock,
      })
      .then((res) => {
        res.should.have.status(200);
      });

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        return res.body.filter(
          (data) => data.positionID == position.positionID
        )[0];
      })
      .then((data) => {
        data.occupiedWeight.should.equal(sku.weight);
        data.occupiedVolume.should.equal(sku.volume);
      });

    await agent
      .delete(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => res.should.have.status(204));

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        return res.body.filter(
          (data) => data.positionID == position.positionID
        )[0];
      })
      .then((data) => {
        data.occupiedWeight.should.equal(0);
        data.occupiedVolume.should.equal(0);
      });

    await agent
      .get(`/api/skuitems/${skuitem.RFID}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(404);
      });
  });
}
