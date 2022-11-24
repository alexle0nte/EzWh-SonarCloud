"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              SKU
   *******************************************************************/
  /**
   * GET /api/skus
   * @returns an array containing all SKUs.
   */
  app.get("/api/skus", (req, res) => {
    console.log("retrieving all SKUs");

    // if (
    //   req.cookies.user !== "manager" &&
    //   req.cookies.user !== "customer" &&
    //   req.cookies.user !== "clerk"
    // )
    //      return res.status(401).end();

    ezwh.warehouse
      .listSKUs()
      .then((skus) => skus.map((sku) => sku.toJson()))
      .then((data) => res.status(200).json(data))
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/sku/:id
   * @returns a SKU, given its id.
   */
  app.get("/api/skus/:id", param("id").isInt({ min: 0 }), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    //    if (req.cookies.user !== "manager") res.status(401).end();

    console.log("retrieving sku: " + req.params.id);
    ezwh.warehouse
      .getSKUbyID(req.params.id)
      .then((data) =>
        data
          ? res.status(200).json(data.toJson().noID())
          : res.status(404).end()
      )
      .catch((err) => res.status(500).json(err));
  });

  /**
   * POST /api/sku
   * Creates a new SKU with an empty array of testDescriptors.
   */
  app.post(
    "/api/sku",
    body("description").exists().isLength({ min: 1 }),
    body("notes").exists().isLength({ min: 1 }),
    body("weight").isInt({ min: 0 }),
    body("volume").isInt({ min: 0 }),
    body("availableQuantity").isInt({ min: 0 }),
    body("price").isFloat({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      //      if (req.cookies.user !== "manager") return res.status(401).end();

      console.log("inserting new SKU");
      ezwh.warehouse
        .insertNewSKU(
          req.body.description,
          req.body.weight,
          req.body.volume,
          req.body.notes,
          req.body.price,
          req.body.availableQuantity
        )
        .then(() => res.status(201).send())
        .catch((err) => res.status(503).end());
    }
  );

  /**
   * PUT /api/sku/:id
   * Modify an existing SKU.
   */
  app.put(
    "/api/sku/:id",
    body("newWeight").isInt({ min: 0 }),
    body("newVolume").isInt({ min: 0 }),
    body("newAvailableQuantity").isInt({ min: 0 }),
    body("newPrice").isFloat({ min: 0 }),
    param("id").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("modifying sku : " + req.params.id);

      //      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .modifySKU(
          req.params.id,
          req.body.newDescription,
          req.body.newWeight,
          req.body.newVolume,
          req.body.newNotes,
          req.body.newPrice,
          req.body.newAvailableQuantity
        )
        .then((data) => res.status(200).end())
        .catch((err) => {
          if (err === "404") return res.status(404).end();
          if (err === "422") return res.status(422).end();
          return res.status(503).end();
        });
    }
  );

  /**
   * PUT /api/sku/:id/position
   * Add or modify position of a SKU.
   */
  app.put(
    "/api/sku/:id/position",
    body("position").isInt({ min: 0 }).isLength({ min: 12, max: 12 }),
    param("id").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("modifying sku position: " + req.params.id);

      //      if (req.cookies.user !== "manager") return res.status(401).end();

      ezwh.warehouse
        .modifySKUPosition(req.params.id, req.body.position)
        .then((data) => res.status(200).end())
        .catch((err) => {
          if (err === "404") return res.status(404).end();
          if (err === "422") return res.status(422).end();
          return res.status(503).end();
        });
    }
  );

  /**
   * DELETE /api/skus/:id
   * Delete a SKU receiving its id.
   */

  app.delete("/api/skus/:id", param("id").isInt({ min: 0 }), (req, res) => {
    console.log("deleting sku :" + req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    //    if (req.cookies.user !== "manager") return res.status(401).end();

    ezwh.warehouse
      .deleteSKU(req.params.id)
      .then((data) => res.status(204).end())
      .catch((err) => res.status(503).end());
  });
};
