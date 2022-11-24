"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              TEST RESULT
   *******************************************************************/
  /**
   * GET /api/skuitems/:rfid/testResults
   * @returns an array containing all test results for a certain sku item identified by RFID.
   */
  app.get(
    "/api/skuitems/:rfid/testResults",
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    (req, res) => {
//      if (
//        req.cookies.user !== "manager" &&
//        req.cookies.user !== "quality employee"
//      )
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("retrieving all test results for rfid:" + req.params.rfid);
      ezwh
        .getTestResultsByRFID(req.params.rfid)
        .then(testResults => res.status(200).json(testResults.map(tr => tr.toJson())))
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(500).end()
        );
    }
  );

  /**
   * GET /api/skuitems/:rfid/testResults/:id
   * @returns Return  a single test result for a certain sku item identified by RFID.
   */
  app.get(
    "/api/skuitems/:rfid/testResults/:id",
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    param("id").isInt({ min: 0 }),
    (req, res) => {
//      if (
//        req.cookies.user !== "manager" &&
//        req.cookies.user !== "quality employee"
//      )
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log(
        "retrieving test result: " + req.params.id + " for " + req.params.rfid
      );
      ezwh
        .getTestResultByIDandRFID(req.params.id, req.params.rfid)
        .then((testResult) =>
          testResult
            ? res.status(200).json(testResult.toJson())
            : res.status(404).end()
        )
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(500).end()
        );
    }
  );

  /**
   * POST /api/skuitems/testResult
   * Creates a new test Result for a certain sku item identified by RFID.
   */
  app.post(
    "/api/skuitems/testResult",
    body("rfid").isString().isLength({ min: 32, max: 32 }),
    body("idTestDescriptor").isInt({ min: 0 }),
    body("Date").isString(),
    body("Result").isBoolean(),
    (req, res) => {
//      if (
//        req.cookies.user !== "manager" &&
//        req.cookies.user !== "quality employee"
//      )
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("creating new test result");
      ezwh
        .createTestResult(
          req.body.rfid,
          req.body.idTestDescriptor,
          req.body.Date,
          req.body.Result
        )
        .then(() => res.status(201).send())
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(503).end()
        );
    }
  );

  /**
   * PUT /api/skuitems/:rfid/testResult/:id
   * Modify a test Result identified by id for a certain sku item identified by RFID.
   */
  app.put(
    "/api/skuitems/:rfid/testResult/:id",
    body("newIdTestDescriptor").isInt({ min: 0 }),
    body("newDate").isString(),
    body("newResult").isBoolean(),
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    param("id").isInt({ min: 0 }),
    (req, res) => {
//      if (
//        req.cookies.user !== "manager" &&
//        req.cookies.user !== "quality employee"
//      )
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log(
        "modifying test result:" + req.params.id + " of " + req.params.rfid
      );
      ezwh
        .updateTestResult(
          req.params.id,
          req.params.rfid,
          req.body.newResult,
          req.body.newIdTestDescriptor,
          req.body.newDate
        )
        .then((data) => res.status(200).end())
        .catch((err) =>
          err == "404" ? res.status(404).end() : res.status(503).end()
        );
    }
  );

  /**
   * DELETE /api/skuitems/:rfid/testResult/:id
   * Delete a test result, given its id for a certain sku item identified by RFID.
   */
  app.delete(
    "/api/skuitems/:rfid/testResult/:id",
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    param("id").isInt({ min: 0 }),
    (req, res) => {
//      if (
//        req.cookies.user !== "manager" &&
//        req.cookies.user !== "quality employee"
//      )
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log(
        "deleting test result :" + req.params.id + " of " + req.params.rfid
      );
      ezwh
        .deleteTestResult(req.params.id, req.params.rfid)
        .then((data) => res.status(204).end())
        .catch((err) => res.status(503).end());
    }
  );
};
