"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              RestockOrder
   *******************************************************************/

  /**
   * GET /api/restockOrders
   * @returns array containg all restock orders
   *
   */

  app.get("/api/restockOrders", (req, res) => {
    console.log("Retrieving  all restock orders");

    //        if (req.cookies.user !== "manager" && req.cookies.user !== "clerk" && req.cookies.user !== "qualityEmployee") {
    //            res.status(401).end();
    //            return;
    //       }
    ezwh
      .getRestockOrders()
      .then((data) => res.status(200).json(data.map((io) => io.toJson())))
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/restockOrdersIssued
   * @returns an array containing all restock orders in state = ISSUED.
   *
   */
  app.get("/api/restockOrdersIssued", (req, res) => {
    if (req.cookies.user !== "manager" && req.cookies.user !== "supplier") {
      //            res.status(401).end();
      //            return;
    }

    console.log("Retrieving list of all restock orders in state = ISSUED");
    ezwh
      .getRestockOrdersByState("ISSUED")
      .then((data) =>
        res
          .status(200)
          .json(data.map((io) => io.toJson()))
          .end()
      )
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/restockOrders/:id
   * @returns a restock order, given its id.
   *
   */

  app.get(
    "/api/restockOrders/:id",
    param("id").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
      //        if (req.cookies.user !== "manager") return res.status(401).end();

      console.log("retrieving restock order id = " + req.params.id);
      ezwh
        .getRestockOrderByID(req.params.id)
        .then((data) =>
          data !== null
            ? res.status(200).json(data.toJson())
            : res.status(404).end()
        )
        .catch((err) => res.status(500).end());
    }
  );

  /**
   * GET /api/restockOrders/:id/returnItems
   * @returns sku items to be returned of a restock order, given it's id.
   *
   */

  app.get(
    "/api/restockOrders/:id/returnItems",
    param("id").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      //        if (req.cookies.user !== "manager")  return res.status(401).end();

      console.log(
        "retrieving sku items to be returned of restock order, id = " +
          req.params.id
      );
      ezwh
        .getRestockOrderByID(req.params.id)
        .then((data) =>
          data !== null
            ? ezwh
                .getReturnItemsRestock(req.params.id, false)
                .then((returnOrders) =>
                  returnOrders !== null
                    ? res.status(200).json(returnOrders)
                    : res.status(422).end()
                )
            : res.status(404).end()
        )
        .catch((err) => res.status(500).end());
    }
  );

  /**
   * POST /api/restockOrder
   * Creates a new restock order in state = ISSUED with an empty list of skuItems.
   *
   */

  app.post(
    "/api/restockOrder",
    body("issueDate").isString(),
    body("products"),
    body("products.*.SKUId").isInt({ min: 0 }),
    body("products.*.itemId").isInt({ min: 0 }),
    body("products.*.description").isString(),
    body("products.*.price").isFloat({ min: 0 }),
    body("products.*.qty").isInt({ min: 0 }),
    body("supplierId").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
      //check if logged manager and supplier
      //            if (req.cookies.user !== "manager" && req.cookies.user !== "supplier") return res.status(401).end();

      console.log("inserting new restock order in state = ISSUED");

      ezwh
        .createRestockOrder(
          req.body.issueDate,
          req.body.products,
          req.body.supplierId
        )
        .then(() => res.status(201).send())
        .catch((err) =>
          err == "422" ? res.status(422).end() : res.status(503).end()
        );
    }
  );

  /**
   * PUT /api/restockOrder/:id
   *
   * Modify the state of a restock order, given its id.
   *
   */

  app.put(
    "/api/restockOrder/:id",
    param("id").isInt({ min: 0 }),
    body("newState").isString(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
      //check if logged manager and clerk
      //   if (req.cookies.user !== "manager" && req.cookies.user !== "clerk") {
      //     //                 res.status(401).end();
      //     //                 return;
      //   }

      console.log("Modify state of restock order: " + req.params.id);

      ezwh
        .getRestockOrderByID(req.params.id)
        .then((data) =>
          data !== null
            ? ezwh
                .modifyRestockOrderState(req.params.id, req.body.newState)
                .then((data) =>
                  data !== null ? res.status(200).end() : res.status(503).end()
                )
            : res.status(404).end()
        )
        .catch((err) => res.status(503).end());
    }
  );

  /**
   * PUT /api/restockOrder/:id/skuItems
   *
   * Add a non empty list of skuItems to a restock order, given its id.
   *
   */

  app.put(
    "/api/restockOrder/:id/skuitems",
    param("id").isInt({ min: 0 }),
    body("skuItems").exists(),
    body("products.*.SKUId").isInt({ min: 0 }),
    body("products.*.itemId").isInt({ min: 0 }),
    body("products.*.rfid").isString(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      //check if logged manager and clerk
      //   if (req.cookies.user !== "manager" && req.cookies.user !== "clerk") {
      //     //                res.status(401).end();
      //     //                return;
      //   }

      console.log("Add a non empty list of skuItems to a restock order");

      ezwh
        .getRestockOrderByID(req.params.id)
        .then((data) =>
          data !== null
            ? ezwh
                .addSKUItemToRestockOrder(req.params.id, req.body.skuItems)
                .then((items) =>
                  items !== null ? res.status(200).end() : res.status(422).end()
                )
            : res.status(404).end()
        )
        .catch((err) => res.status(503).end());
    }
  );

  /**
   * PUT /api/restockOrder/:id/transportNote
   *
   * Add a transport note to a restock order, given its id.
   *
   */

  app.put(
    "/api/restockOrder/:id/transportNote",
    param("id").isInt({ min: 0 }),
    body("transportNote.deliveryDate").isString(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      //check if logged manager and clerk
      //   if (req.cookies.user !== "manager" && req.cookies.user !== "supplier") {
      //     //                res.status(401).end();
      //     //                return;
      //   }

      console.log("Add a transport note to a restock order");

      ezwh
        .getRestockOrderByID(req.params.id)
        .then((data) =>
          data !== null
            ? ezwh
                .addTransportNote(req.params.id, req.body.transportNote)
                .then((restock) =>
                  restock !== null
                    ? res.status(200).end()
                    : res.status(422).end()
                )
            : res.status(404).end()
        )
        .catch((err) => res.status(503).end());
    }
  );

  /**
   * DELETE /api/restockOrder/:id
   * deletes a restock order, given its id
   *
   */

  app.delete(
    "/api/restockOrder/:id",
    param("id").isInt({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      //check if logged and supplier
      //   if (req.cookies.user !== "manager") {
      //     //                res.status(401).end();
      //     //                return;
      //   }
      console.log("deleting restock order");

      ezwh
        .deleteRestockOrder(req.params.id)
        .then((data) => res.status(204).end())
        .catch((err) => res.status(503).end());
    }
  );
};
