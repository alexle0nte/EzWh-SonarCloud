"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              SKU ITEM
   *******************************************************************/

  /**
   * GET /api/skuitems
   * @returns an array containing all SKU items.
   *
   */
  app.get("/api/skuitems", (req, res) => {
    console.log("retrieving all SKUItems");

//    if (req.cookies.user !== "manager") return res.status(401).end();

    ezwh.warehouse
      .listSKUItems()
      .then((data) => data.map((sku) => sku.toJson()))
      .then((data) => res.status(200).json(data))
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/skuitems/sku/:id
   * @returns an array containing all SKU items for a certain SKUId with Available = 1
   *
   */
  app.get(
    "/api/skuitems/sku/:id",
    param("id").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("retrieving all skuitem of sku" + req.params.id);

//      if (req.cookies.user !== "manager" && req.cookies.user !== "customer") return res.status(401).end();

      ezwh.warehouse
        .getSKUItembySKU(req.params.id)
        .then((data) =>
          data.length > 0 ? res.status(200).json(data) : res.status(404).end()
        )
        .catch((err) => res.status(500).end());
    }
  );

  /**
   * GET /api/skuitems/:rfid
   * @returns a SKU item, given its RFID
   *
   */
  app.get(
    "/api/skuitems/:rfid",
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("retrieving skuitems with RFID : " + req.params.rfid);

//      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .getSKUItembyRFID(req.params.rfid)
        .then((data) =>
          data ? res.status(200).json(data.toJson()) : res.status(404).end()
        )
        .catch((err) => res.status(500).end());
    }
  );

  /**
   * POST /api/skuitem
   * Creates a new SKU item with Available =0.
   *
   */
  app.post(
    "/api/skuitem",
    body("RFID").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    body("SKUId").isInt({ min: 0 }),
    body("DateOfStock").matches(
      /(^ *YYYY\/MM\/DD( +HH:MM)? *$)|(^ *\d{4}[\/](0?[1-9]|1[012])[\/](0[1-9]|[12][0-9]|3[01])( +([0-1][0-9]|2[0-4]):([0-5][0-9]))? *$)/
    ),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("inserting a new skuitem");

//      if (req.cookies.user !== "manager" && req.cookies.user !== "clerk") return res.status(401).end();
      ezwh.warehouse
        .insertSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock)
        .then((data) => res.status(201).end())
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(503).json(err)
        );
    }
  );

  /**
   * PUT /api/skuitems/:rfid
   * Modify RFID, available and date of stock fields of an existing SKU Item.
   *
   */
  app.put(
    "/api/skuitems/:rfid",
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    body("newRFID").isInt({ min: 0 }),
    body("newAvailable").isInt({ min: 0 }),
    body("newDateOfStock").matches(
      /(^ *YYYY\/MM\/DD( +HH:MM)? *$)|(^ *\d{4}[\/](0?[1-9]|1[012])[\/](0[1-9]|[12][0-9]|3[01])( +([0-1][0-9]|2[0-4]):([0-5][0-9]))? *$)/
    ),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("modifying skuitem");

//      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .modifySKUItem(
          req.params.rfid,
          req.body.newRFID,
          req.body.newAvailable,
          req.body.newDateOfStock
        )
        .then(() => res.status(200).end())
        .catch((err) =>
          err === "404" ? res.status(404).end() : res.status(503).end()
        );
    }
  );

  /**
   * DELETE /api/skuitems/:rfid
   * Delete a SKU item receiving his rfid.
   *
   */
  app.delete(
    "/api/skuitems/:rfid",
    param("rfid").isInt({ min: 0 }).isLength({ min: 32, max: 32 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("deleting skuitem" + req.params.rfid);

//      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .deleteSKUItem(req.params.rfid)
        .then(() => res.status(204).end())
        .catch(() => res.status(503).end());
    }
  );
};
