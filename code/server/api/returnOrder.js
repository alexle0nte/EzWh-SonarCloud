"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
    /********************************************************************
       *              ReturnOrder
       *******************************************************************/

    /**
     * GET /api/returnOrders
     * @returns array containg all return orders
     *
     */

    app.get("/api/returnOrders", (req, res) => {
        console.log("Retrieving  all return orders");

//        if (req.cookies.user !== "manager") {
//            res.status(401).end();
//            return;
//        }
        ezwh
            .getReturnOrders()
            .then((data) =>
                res.status(200).json(data.map(io => io.toJson()))
            )
            .catch((err) => res.status(500).end());
    });

    /**
     * GET /api/returnOrders/:id
     * @returns a return order, given its id.
     *
     */

    app.get("/api/returnOrders/:id", param("id").isInt({ min: 0 }), (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

//        if (req.cookies.user !== "manager")
//            return res.status(401).end();

        console.log("retrieving return order id = " + req.params.id);
        ezwh
            .getReturnOrderByID(req.params.id)
            .then(data =>
                data !== null
                    ? res.status(200).json(data.toJson())
                    : res.status(404).end()
            )
            .catch((err) => res.status(500).end());
    });

    /**
     * POST /api/returnOrder
     * Creates a new return order.
     *
     */

    app.post("/api/returnOrder", 
        body("returnDate").matches(
        /(^ *YYYY\/MM\/DD( +HH:MM)? *$)|(^ *\d{4}[\/](0?[1-9]|1[012])[\/](0[1-9]|[12][0-9]|3[01])( +([0-1][0-9]|2[0-4]):([0-5][0-9]))? *$)/),
        body("products").exists(),
        body("products.*.SKUId").isInt({ min: 0 }),
        body("products.*.itemId").isInt({ min: 0 }),
        body("products.*.description").isString(),
        body("products.*.price").isFloat({ min: 0 }),
        body("products.*.RFID").isString(),
        body("restockOrderId").isInt({ min: 0 }),
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(422).json({ errors: errors.array() });

//            if (req.cookies.user !== "manager")
//                return res.status(401).end();

            console.log("inserting new return order");

            ezwh
            .createReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderId)
                .then((data) =>
                    data !== -1
                        ? data !== null ? res.status(201).end() : res.status(503).end()
                        : res.status(404).end()
                )
                .catch((err) => res.status(503).end());
        });

    /**
       * DELETE /api/returnOrder/:id
       * deletes a return order, given its id
       *
       */

    app.delete("/api/returnOrder/:id", param("id").isInt({ min: 0 }), (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

//        if (req.cookies.user !== "manager") {
//            res.status(401).end();
//            return;
//        }

        console.log("deleting return order");

        ezwh
            .deleteReturnOrder(req.params.id)
            .then((data) => res.status(204).end())
            .catch((err) => res.status(503).end());
    });
}
