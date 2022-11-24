const SKUItem = require("../modules/Warehouse/SKUItem");
const chai = require("chai");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
chai.use(chaiHttp);
chai.should();


const app = require("../server");
let agent = chai.request.agent(app);

describe("test TestResult apis", () => {
  const rfid = "12345678901234567890123456789012";
  beforeEach(async () => {
    dao.DBdeleteAllSKU();
    dao.DBdeleteAllSKUItems();
    dao.DBdeleteAllTestDescriptors();
    dao.DBdeleteAllTestResults();
  })

  getAllTestResultsByRFID(rfid);
  getTestResultByIDandRFID(rfid)
  insertTestResult(rfid);
  modifyTestResult(rfid);
  deletetestResult(rfid);
})

function getAllTestResultsByRFID(rfid) {
  describe("test get all test results", () => {
    let testResults;
    let testResult1;
    beforeEach(async () => {
      let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
      await dao.DBinsertSKUItem(new SKUItem(rfid, 1, skuId, "2021/01/01 10:00"));
      let testDescriptorId1 = await dao.DBinsertTestDescriptor("name 1", "procedure description 1", skuId)
      let testDescriptorId2 = await dao.DBinsertTestDescriptor("name 2", "procedure description 2", skuId)
      testResult1 = {
        "rfid": rfid,
        "idTestDescriptor": testDescriptorId1,
        "Date": "2021/11/28",
        "Result": true
      }
      let testResult2 = {
        "rfid": rfid,
        "idTestDescriptor": testDescriptorId2,
        "Date": "2022/12/29",
        "Result": false
      }
      testResults = [testResult1, testResult2];
    });

    it("get all test results by RFID", async () => {
      for (const testResult of testResults) {
        await agent
          .post("/api/skuitems/testResult")
          .set("Cookie", "user=manager;")
          .send(testResult)
          .then((res) => res.should.have.status(201));
      }

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(200);
          res.body[0].idTestDescriptor.should.equal(testResult1.idTestDescriptor);
          res.body[0].Date.should.equal(testResult1.Date);
          res.body[0].Result.should.equal(testResult1.Result);
        });
    });

    it("get all test results with empty db", async () => {
      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(200);
        })
    })

    it("get all test results with non existing RFID", async () => {
      await agent
        .get(`/api/skuitems/${rfid.slice(0,31) + '9'}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(404);
        })
    })

    it("get all test results with invalid RFID (wrong data type)", async () => {
      let wrongRFID = "wrong data type";
      await agent
        .get(`/api/skuitems/${wrongRFID}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(422);
        })
    });

    it("get all test results with invalid RFID (wrong length)", async () => {
      let wrongRFID = 1234;
      await agent
        .get(`/api/skuitems/${wrongRFID}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(422);
        })
    })

    /* it("get all test results by RFID without authorization", async () => {
      for (const testResult of testResults) {
        await agent
          .post("/api/skuitems/testResult")
          .set("Cookie", "user=manager;")
          .send(testResult)
          .then((res) => res.should.have.status(201));
      }

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=invalid;")
        .send()
        .then(res => res.should.have.status(401));
    }); */
  })
}

function getTestResultByIDandRFID(rfid) {
  describe("test get test result by ID and RFID", () => {
    let testResult;
    beforeEach(async () => {
      let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
      await dao.DBinsertSKUItem(new SKUItem(rfid, 1, skuId, "2021/01/01 10:00"));
      let testDescriptorId = await dao.DBinsertTestDescriptor("name", "procedure description", skuId)
      testResult = {
        "rfid": rfid,
        "idTestDescriptor": testDescriptorId,
        "Date": "2021/11/28",
        "Result": true
      }
    });

    it("get a test result by ID and RFID", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.body[0].id);

      await agent
        .get(`/api/skuitems/${rfid}/testResults/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(200);
          res.body.idTestDescriptor.should.equal(testResult.idTestDescriptor);
          res.body.Date.should.equal(testResult.Date);
          res.body.Result.should.equal(testResult.Result);
        });
    });

    it("get non existing test result (non existing ID)", async () => {
      const testResultId = 1;
      await agent
        .get(`/api/skuitems/${rfid}/testResults/${testResultId + 1}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(404));
    });

    it("get non existing test result (non existing RFID)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.body[0].id);

      await agent
        .get(`/api/skuitems/${rfid.slice(0,31) + '9'}/testResults/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(404));
    });

    it("get test result with invalid ID (wrong data type)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = "wrong data type";
      await agent
        .get(`/api/skuitems/${rfid}/testResults/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(422));
    });

    it("get test result with invalid RFID (wrong data type)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.body[0].id);

      let wrongRFID = "wrong data type";
      await agent
        .get(`/api/skuitems/${wrongRFID}/testResults/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(422));
    });

    it("get test result with invalid RFID (wrong length)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.body[0].id);

      let wrongRFID = 1234;
      await agent
        .get(`/api/skuitems/${wrongRFID}/testResults/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(422));
    });

    /* it("get a test result by ID and RFID without authorization", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.body[0].id);

      await agent
        .get(`/api/skuitems/${rfid}/testResults/${testResultId}`)
        .set("Cookie", "user=invalid;")
        .send()
        .then(res => res.should.have.status(401));
    }); */

  })
}

function insertTestResult(rfid) {
  describe("test insert test result", () => {
    let testResult;
    let testDescriptorId;
    beforeEach(async () => {
      let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
      await dao.DBinsertSKUItem(new SKUItem(rfid, 1, skuId, "2021/01/01 10:00"));
      testDescriptorId = await dao.DBinsertTestDescriptor("name", "procedure description", skuId)
      testResult = {
        "rfid": rfid,
        "idTestDescriptor": testDescriptorId,
        "Date": "2021/11/28",
        "Result": true
      }
    });

    it("insert valid test result", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));
    });

    it("insert invalid test result (wrong body)", async () => {
      let invalidtestResult = Object.assign(Object.create(testResult), {
        "rfid": parseInt(rfid)
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));

      invalidtestResult = Object.assign(Object.create(testResult), {
        "idTestDescriptor": "this should be a number"
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));

      invalidtestResult = Object.assign(Object.create(testResult), {
        "Date": 1
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));

      invalidtestResult = Object.assign(Object.create(testResult), {
        "Result": "this should be a boolean"
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));
    });

    it("insert invalid test result (negative number)", async () => {
      let invalidtestResult = Object.assign(Object.create(testResult), {
        "idTestDescriptor": -1
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));
    });

    it("insert invalid test result with missing fields", async () => {
      let invalidtestResult = { ...testResult };

      delete invalidtestResult.rfid;
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));

      delete invalidtestResult.idTestDescriptor;
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));

      delete invalidtestResult.Date;
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));

      delete invalidtestResult.Result;
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(422));
    });

    it("insert invalid test result (non existing RFID)", async () => {
      let invalidtestResult = Object.assign(Object.create(testResult), {
        "rfid": rfid.slice(0,31) + '9',
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(404));
    });

    it("insert invalid test result (non existing test descriptor)", async () => {
      let invalidtestResult = Object.assign(Object.create(testResult), {
        "idTestDescriptor": testDescriptorId + 1
      });
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(invalidtestResult)
        .then(res => res.should.have.status(404));
    });

    /* it("insert test result without authorization", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=invalid;")
        .send(testResult)
        .then(res => res.should.have.status(401));
    }); */
  })
}

function modifyTestResult(rfid) {
  describe("test modify test result", () => {
    let testResult;
    let testDescriptorId1;
    let testDescriptorId2;
    beforeEach(async () => {
      let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
      await dao.DBinsertSKUItem(new SKUItem(rfid, 1, skuId, "2021/01/01 10:00"));
      testDescriptorId1 = await dao.DBinsertTestDescriptor("name 1", "procedure description 1", skuId)
      testDescriptorId2 = await dao.DBinsertTestDescriptor("name 2", "procedure description 2", skuId)
      testResult = {
        "rfid": rfid,
        "idTestDescriptor": testDescriptorId1,
        "Date": "2021/11/28",
        "Result": true
      }
    });

    it("modify test result", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(200));

      await agent
        .get(`/api/skuitems/${rfid}/testResults/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          res.should.have.status(200);
          res.body.idTestDescriptor.should.equal(body.newIdTestDescriptor);
          res.body.Date.should.equal(body.newDate);
          res.body.Result.should.equal(body.newResult);
        });
    });

    it("modify non existing test result (non existing ID)", async () => {
      const testResultId = 1;
      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(404));
    });

    it("modify non existing test result (non existing RFID)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      await agent
        .put(`/api/skuitems/${rfid.slice(0,31) + '9'}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(404));
    });

    it("modify test result with invalid ID (wrong data type)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      const testResultId = "wrong data type";
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(422));
    });

    it("modify test result with invalid RFID (wrong data type)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      let wrongRFID = "wrong data type";
      await agent
        .put(`/api/skuitems/${wrongRFID}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(422));
    });

    it("modify test result with invalid RFID (wrong length)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      let wrongRFID = 1234;
      await agent
        .put(`/api/skuitems/${wrongRFID}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(422));
    });

    it("modify test result (wrong body)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      let invalidBody = {
        "newIdTestDescriptor": "this should be a number",
        "newDate": "2022/05/05",
        "newResult": false
      }
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(invalidBody)
        .then(res => res.should.have.status(422));

      invalidBody = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": 1,
        "newResult": false
      }
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(invalidBody)
        .then(res => res.should.have.status(422));

      invalidBody = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": "this should be a boolean"
      }
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(invalidBody)
        .then(res => res.should.have.status(422));
    });

    it("modify test result (negative number of newIdTestDescriptor)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      let invalidBody = {
        "newIdTestDescriptor": -testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(invalidBody)
        .then(res => res.should.have.status(422));
    });

    it("modify test result with missing fields", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      let body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      delete body.newIdTestDescriptor;
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(422));

      delete body.newDate;
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(422));

      delete body.newResult;
      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(422));
    });

    it("modify test result with non existing newIdTestDescriptor", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const body = {
        "newIdTestDescriptor": testDescriptorId2 + testDescriptorId1,
        "newDate": "2022/05/05",
        "newResult": false
      }

      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send(body)
        .then(res => res.should.have.status(404));
    });

    /* it("modify test result without authorization", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const body = {
        "newIdTestDescriptor": testDescriptorId2,
        "newDate": "2022/05/05",
        "newResult": false
      }

      await agent
        .put(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=invalid;")
        .send(body)
        .then(res => res.should.have.status(401));
    }); */
  })
}

function deletetestResult(rfid) {
  describe("test delete test result", () => {
    let testResult;
    beforeEach(async () => {
      let skuId = await dao.DBinsertSKU("a description", 1, 1, "a note", 10.99, 100);
      await dao.DBinsertSKUItem(new SKUItem(rfid, 1, skuId, "2021/01/01 10:00"));
      let testDescriptorId = await dao.DBinsertTestDescriptor("name", "procedure description", skuId)
      testResult = {
        "rfid": rfid,
        "idTestDescriptor": testDescriptorId,
        "Date": "2021/11/28",
        "Result": true
      }
    });

    it("delete test result", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      await agent
        .delete(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(204));
    });

    it("delete test result with invalid ID (wrong data type)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = "wrong data type";
      await agent
        .delete(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(422));

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(200));
    });

    it("delete test result with invalid RFID (wrong data type)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const wrongRFID = "wrong data type";
      await agent
        .delete(`/api/skuitems/${wrongRFID}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(422));

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(200));
    });

    it("delete test result with invalid RFID (wrong length)", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      const wrongRFID = 1234;
      await agent
        .delete(`/api/skuitems/${wrongRFID}/testResult/${testResultId}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(422));

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(200));
    });

    it("delete non existing test result", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      await agent
        .delete(`/api/skuitems/${rfid}/testResult/${testResultId + 1}`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(204));

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(200));
    });

    /* it("delete test result without authorization", async () => {
      await agent
        .post("/api/skuitems/testResult")
        .set("Cookie", "user=manager;")
        .send(testResult)
        .then(res => res.should.have.status(201));

      const testResultId = await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => {
          return res.body[0].id;
        });

      await agent
        .delete(`/api/skuitems/${rfid}/testResult/${testResultId}`)
        .set("Cookie", "user=invalid;")
        .send()
        .then(res => res.should.have.status(401));

      await agent
        .get(`/api/skuitems/${rfid}/testResults`)
        .set("Cookie", "user=manager;")
        .send()
        .then(res => res.should.have.status(200));
    }); */
  })
}