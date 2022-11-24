"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              POSITIONS
   *******************************************************************/

  /**
   * GET /api/positions
   * @returns an array containing all positions.
   *
   */
  app.get("/api/positions", (req, res) => {
    console.log("retrieving all positions");

//    if (req.cookies.user !== "manager" && req.cookies.user !== "clerk")
//      return res.status(401).end();

    ezwh.warehouse
      .listPositions()
      .then((data) => res.status(200).json(data))
      .catch(() => res.status(500).end());
  });

  /**
   * POST /api/position
   * creates a new position
   *
   */
  app.post(
    "/api/position",
    body("positionID").isInt().isLength({ min: 12, max: 12 }),
    body("aisleID").isInt().isLength({ min: 4, max: 4 }),
    body("row").isInt().isLength({ min: 4, max: 4 }),
    body("col").isInt().isLength({ min: 4, max: 4 }),
    body("maxWeight").isInt({ min: 0 }),
    body("maxVolume").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);

      if (req.body.positionID != req.body.aisleID + req.body.row + req.body.col)
        return res.status(422).end();
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
      console.log("creating a new position");

//      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .addPosition(
          req.body.positionID,
          req.body.aisleID,
          req.body.row,
          req.body.col,
          req.body.maxWeight,
          req.body.maxVolume
        )
        .then(() => res.status(201).end())
        .catch(() => res.status(503).end());
    }
  );

  /**
   * PUT /api/position/:positionID
   * Modify a position identified by positionID.
   *
   */
  app.put(
    "/api/position/:positionID",
    param("positionID").isInt().isLength({ min: 12, max: 12 }),
    body("newAisleID").isInt().isLength({ min: 4, max: 4 }),
    body("newRow").isInt().isLength({ min: 4, max: 4 }),
    body("newCol").isInt().isLength({ min: 4, max: 4 }),
    body("newMaxWeight").isInt({ min: 0 }),
    body("newMaxVolume").isInt({ min: 0 }),
    body("newOccupiedWeight").isInt({ min: 0 }),
    body("newOccupiedVolume").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("modifying position: " + req.params.positionID);

//      if (req.cookies.user !== "manager" && req.cookies.user !== "clerk")
//        return res.status(401).end();

      ezwh.warehouse
        .modifyPosition(
          req.params.positionID,
          req.body.newAisleID,
          req.body.newRow,
          req.body.newCol,
          req.body.newMaxWeight,
          req.body.newMaxVolume,
          req.body.newOccupiedWeight,
          req.body.newOccupiedVolume
        )
        .then(() => res.status(200).end())
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(503).end()
        );
    }
  );

  /**
   * PUT /api/position/:positionID/changeID
   * Modify the positionID of a position position, given its old positionID.
   *
   */
  app.put(
    "/api/position/:positionID/changeID",
    param("positionID").isInt().isLength({ min: 12, max: 12 }),
    body("newPositionID").isInt().isLength({ min: 12, max: 12 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
      console.log("modifying positionID of: " + req.params.positionID);

//      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .modifyPositionID(req.params.positionID, req.body.newPositionID)
        .then(() => res.status(200).end())
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(503).end()
        );
    }
  );

  /**
   * DELETE /api/position/:positionID
   * Delete a position receiving its positionID.
   *
   */
  app.delete(
    "/api/position/:positionID",
    param("positionID").isInt().isLength({ min: 12, max: 12 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
      console.log("deleting position : " + req.params.positionID);

//      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .deletePosition(req.params.positionID)
        .then(() => res.status(204).end())
        .catch(() => res.status(503).end());
    }
  );
};
