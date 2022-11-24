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
    await dao.DBdeleteAllSKUItems();
  });

  const position = {
    positionID: "800234543412",
    aisleID: "8002",
    row: "3454",
    col: "3412",
    maxWeight: 1000,
    maxVolume: 1000,
  };

  insertPosition(position);
  getPositions(position);
  modifyPosition(position);
  modifyPositionID(position);
  deletePosition(position);
});

function insertPosition(position) {
  it("insert valid position", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));
  });

  it("insert invalid position (wrong row)", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(Object.assign({ ...position }, { row: 1111 }))
      .then((res) => res.should.have.status(422));
  });

  it("insert invalid position (wrong aisleID)", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(Object.assign({ ...position }, { aisleID: 1111 }))
      .then((res) => res.should.have.status(422));
  });

  it("insert invalid position (wrong positionID lenght)", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(Object.assign({ ...position }, { positionID: 2222222 }))
      .then((res) => res.should.have.status(422));
  });
  it("insert invalid position (wrong maxWeight: negative number)", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(Object.assign({ ...position }, { maxWeight: -19 }))
      .then((res) => res.should.have.status(422));
  });

  it("insert position with positionID already used", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(503));
  });
}

function getPositions(position) {
  it("get all position", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .withCredentials((res) => {
        res.should.have.status(200);
        res.body[0].positionID.should.equal(position.positionID);
      });
  });

  it("get all position with empty db", async () => {
    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .withCredentials((res) => {
        res.should.have.status(404);
      });
  });
}

function modifyPosition(position) {
  it("modify position ", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    const newPosition = {
      newAisleID: "1234",
      newRow: "5678",
      newCol: "9123",
      newMaxWeight: 1200,
      newMaxVolume: 600,
      newOccupiedWeight: 200,
      newOccupiedVolume: 100,
    };

    await agent
      .put(`/api/position/${position.positionID}`)
      .set("Cookie", "user=manager;")
      .send(newPosition)
      .then((res) => res.should.have.status(200));

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body[0].positionID
          .toString()
          .should.equal(
            newPosition.newAisleID + newPosition.newRow + newPosition.newCol
          );
      });
  });

  it("modify position with invalid data", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    const newPosition = {
      newAisleID: "234",
      newRow: "567",
      newCol: "912",
      newMaxWeight: 1200,
      newMaxVolume: 600,
      newOccupiedWeight: 200,
      newOccupiedVolume: 100,
    };

    await agent
      .put(`/api/position/${position.positionID}`)
      .set("Cookie", "user=manager;")
      .send(newPosition)
      .then((res) => res.should.have.status(422));
  });
}

function modifyPositionID(position) {
  it("modify positionID ", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    const newPositionID = "123456789012";

    await agent
      .put(`/api/position/${position.positionID}/changeID`)
      .set("Cookie", "user=manager;")
      .send({ newPositionID: newPositionID })
      .then((res) => res.should.have.status(200));

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body[0].aisleID
          .toString()
          .should.equal(newPositionID.substring(0, 4));
        res.body[0].row.toString().should.equal(newPositionID.substring(4, 8));
        res.body[0].col.toString().should.equal(newPositionID.substring(8, 12));
      });
  });

  it("modify positionID with invalid ID", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    const newPositionID = "this should be an integer";

    await agent
      .put(`/api/position/${position.positionID}/changeID`)
      .set("Cookie", "user=manager;")
      .send({ newPositionID: newPositionID })
      .then((res) => res.should.have.status(422));
  });
}

function deletePosition(position) {
  it("delete position", async () => {
    await agent
      .post("/api/position")
      .set("Cookie", "user=manager;")
      .send(position)
      .then((res) => res.should.have.status(201));

    await agent
      .delete(`/api/position/${position.positionID}`)
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => res.should.have.status(204));

    await agent
      .get("/api/positions")
      .set("Cookie", "user=manager;")
      .send()
      .then((res) => {
        res.should.have.status(200);
        res.body.length.should.equal(0);
      });
  });
}
