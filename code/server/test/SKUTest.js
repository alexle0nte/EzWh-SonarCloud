const chai = require("chai");
const chaiHttp = require("chai-http");
const position = require("../api/position");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("test SKU apis", () => {
  beforeEach(async () => {
    await dao.DBdeleteAllSKU();
    await dao.DBdeleteAllPositions();
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

  getAllSKU([sku, sku, sku], 201);
  getSKUbyID(sku);
  insertSKU(sku);
  modifySKU(sku, position);
  modifySKUPosition(sku, position);
  deleteSKU(sku);
});

function getAllSKU(skus) {
  it("get all sku", async () => {
    for (sku of skus) {
      await agent
        .post("/api/sku")
        .set("Cookie", "user=manager;")
        .send(sku)
        .then((res) => res.should.have.status(201));
    }

    await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body[0].description.should.equal(sku.description);
        res.body[0].volume.should.equal(sku.volume);
        res.body[0].weight.should.equal(sku.weight);
        res.body[0].notes.should.equal(sku.notes);
        res.body[0].price.should.equal(sku.price);
        res.body[0].availableQuantity.should.equal(sku.availableQuantity);
      });
  });

  it("get all sku with empty db", async () => {
    await agent
      .get("/api/skus")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body.length.should.equal(0);
      });
  });

  // it("get all sku without authorization", async () => {
  //   await agent
  //     .get("/api/skus")
  //     .send()
  //     .then((res) => {
  //       res.should.have.status(401);
  //     });
  // });
}

function getSKUbyID(sku) {
  it("get a sku by ID", async () => {
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

    await agent
      .get(`/api/skus/${skuid}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body.description.should.equal(sku.description);
        res.body.description.should.equal(sku.description);
        res.body.volume.should.equal(sku.volume);
        res.body.weight.should.equal(sku.weight);
        res.body.notes.should.equal(sku.notes);
        res.body.price.should.equal(sku.price);
        res.body.availableQuantity.should.equal(sku.availableQuantity);
      });
  });

  it("get nonexistent sku", async () => {
    const skuid = 1;
    await agent
      .get(`/api/skus/${skuid}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(404);
      });
  });

  it("get sku with invalid skuid(wrong data type)", async () => {
    const skuid = "this is text";
    await agent
      .get(`/api/skus/${skuid}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(422);
      });
  });
}

function insertSKU(sku) {
  it("insert valid SKU", async () => {
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(sku)
      .then((res) => res.should.have.status(201));
  });

  it("insert invalid SKU (wrong body)", async () => {
    let invalidsku = Object.assign(Object.create(sku), {
      weight: "this should be a number",
    });
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));

    invalidsku = Object.assign(Object.create(sku), {
      volume: "this should be a number",
    });

    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));

    invalidsku = Object.assign(Object.create(sku), {
      price: "this should be a number",
      availableQuantity: "this should be a number",
    });

    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));
  });

  it("insert invalid SKU negative number", async () => {
    let invalidsku = Object.assign(Object.create(sku), {
      weight: -100,
    });
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));

    invalidsku = Object.assign(Object.create(sku), {
      volume: -100,
    });
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));
    invalidsku = Object.assign(Object.create(sku), {
      price: -100,
    });
    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));
  });

  it("insert invalid SKU with missing fields", async () => {
    let invalidsku = { ...sku };

    delete invalidsku.weight;

    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));

    invalidsku = { ...sku };

    delete invalidsku.volume;

    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));

    invalidsku = { ...sku };

    delete invalidsku.description;

    await agent
      .post("/api/sku")
      .set("Cookie", "user=manager;")
      .send(invalidsku)
      .then((res) => res.should.have.status(422));
  });
}

function modifySKU(sku, position) {
  it("modify valid sku", async () => {
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

    body = {
      newDescription: "test",
      newWeight: position.maxWeight - 10,
      newVolume: position.maxVolume - 10,
      newNotes: "modified",
      newPrice: 100.99,
      newAvailableQuantity: 1,
    };

    await agent
      .put(`/api/sku/${skuid}`)
      .set("Cookie", "user=manager;")
      .send(body)
      .then((res) => res.should.have.status(200));
  });

  it("modify sku to exceed position capability", async () => {
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

    body = {
      newDescription: "test",
      newWeight: position.maxWeight + 10,
      newVolume: position.maxVolume + 10,
      newNotes: "modified",
      newPrice: 100.99,
      newAvailableQuantity: 1,
    };

    await agent
      .put(`/api/sku/${skuid}`)
      .set("Cookie", "user=manager;")
      .send(body)
      .then((res) => res.should.have.status(422));
  });
}

function modifySKUPosition(sku, position) {
  it("modify valid sku position", async () => {
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
      .get(`/api/skus/${skuid}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body.position.should.equal(parseInt(position.positionID));
      });
  });

  it("modify sku with nonexistent position", async () => {
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

    //modify the position of the sku
    await agent
      .put(`/api/sku/${skuid}/position`)
      .set("Cookie", "user=manager;")
      .send({ position: position.positionID })
      .then((res) => res.should.have.status(404));
  });
}

function deleteSKU(sku) {
  it("delete sku", async () => {
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

    await agent
      .delete(`/api/skus/${skuid}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(204);
      });
  });
}
