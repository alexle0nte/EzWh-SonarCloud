"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              INTERNAL ORDER
   *******************************************************************/
  /**
   * GET /api/internalOrders
   * @returns an array containing all internal orders.
   */
  app.get("/api/internalOrders", (req, res) => {
//    if (req.cookies.user !== "manager") return res.status(401).end();

    console.log("retrieving all internal orders");
    ezwh
      .getInternalOrders()
      .then(internalOrders => res.status(200).json(internalOrders.map(io => io.toJson())))
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/internalOrderIssued
   * @returns an array containing all internal orders in state = ISSUED.
   */
  app.get("/api/internalOrdersIssued", (req, res) => {
//    if (
//      req.cookies.user !== "manager" &&
//      req.cookies.user !== "customer"
//    )
//      return res.status(401).end();

    console.log("Retrieving issued internal orders");
    ezwh
      .getInternalOrdersByState("ISSUED")
      .then(internalOrders => res.status(200).json(internalOrders.map(io => io.toJson())))
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/internalOrderAccepted
   * @returns an array containing all internal orders in state = ACCEPTED.
   */
  app.get("/api/internalOrdersAccepted", (req, res) => {
//    if (
//      req.cookies.user !== "manager" &&
//      req.cookies.user !== "delivery employee"
//    )
//      return res.status(401).end();

    console.log("Retrieveing accepted internal orders");
    ezwh
      .getInternalOrdersByState("ACCEPTED")
      .then(internalOrders => res.status(200).json(internalOrders.map(io => io.toJson())))
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/internalOrders/:id
   * @returns an internal order, given its id.
   */
  app.get("/api/internalOrders/:id", param("id").isInt({ min: 0 }), (req, res) => {
    // if (
    //   req.cookies.user !== "manager" &&
    //   req.cookies.user !== "delivery employee"
    // )
    //   return res.status(401).end();

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });


    console.log("retrieving internal order: " + req.params.id);
    ezwh
      .getInternalOrderByID(req.params.id)
      .then((internalOrder) =>
        internalOrder
          ? res.status(200).json(internalOrder.toJson())
          : res.status(404).end()
      )
      .catch((err) => err === "404" ? res.status(404).end() : res.status(500).end());
  });

  /**
   * POST /api/internalOrders
   * Creates a new internal order in state = ISSUED.
   */
  app.post(
    "/api/internalOrders",
    body("issueDate").isString(),
    body("products"),
    body("products.*.SKUId").isInt({ min: 0 }),
    body("products.*.description").isString(),
    body("products.*.price").isFloat({ min: 0 }),
    body("products.*.qty").isInt({ min: 0 }),
    body("customerId").isInt({ min: 0 }),
    (req, res) => {
//      if (
//        req.cookies.user !== "customer" &&
//        req.cookies.user !== "manager"
//      )
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("creating new internal order");
      ezwh
        .createInternalOrder(
          req.body.issueDate,
          req.body.products,
          req.body.customerId
        )
        .then(() => res.status(201).send())
        .catch((err) => err === "422" ? res.status(422).end() : res.status(503).end());
    });

  /**
   * PUT /api/internalOrders/:id
   * Modify the state of an internal order, given its id. If newState is = COMPLETED an array of RFIDs is sent.
   */
  app.put(
    "/api/internalOrders/:id",
    body("newState").isString(),
    body("products.*.SkuID").isInt({ min: 0 }),
    body("products.*.RFID").isString(),
    param("id").isInt({ min: 0 }),
    (req, res) => {
//      if (
//        req.cookies.user !== "manager" &&
//        req.cookies.user !== "customer")
//        return res.status(401).end();

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      console.log("modifying internal order : " + req.params.id);
      if (req.body.newState === "COMPLETED") {
        let RFIDs = [];
        req.body.products.forEach((p) => RFIDs.push(p.RFID));
        return ezwh
          .modifyInternalOrderState(req.params.id, req.body.newState, RFIDs)
          .then((data) => res.status(200).end())
          .catch((err) =>
            err == "404" ? res.status(404).end() : res.status(503).end()
          );
      } else
        return ezwh
          .modifyInternalOrderState(req.params.id, req.body.newState)
          .then((data) => res.status(200).end())
          .catch((err) =>
            err == "404" ? res.status(404).end() : res.status(503).end()
          );
    });

  /**
   * DELETE /api/internalOrders/:id
   * Delete an internal order, given its id.
   */
  app.delete("/api/internalOrders/:id", param("id").isInt({ min: 0 }), (req, res) => {
//    if (req.cookies.user !== "manager") return res.status(401).end();

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    console.log("deleting internal order :" + req.params.id);
    ezwh
      .deleteInternalOrder(req.params.id)
      .then((data) => res.status(204).end())
      .catch((err) => res.res.status(503).end());
  });
};
