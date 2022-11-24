"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              ITEMS
   *******************************************************************/
  /**
   * GET /api/items
   * @returns array containg all items
   *
   */
  app.get("/api/items", (req, res) => {
    console.log("Retrieving list of all items");
//    if (req.cookies.user !== "manager" && req.cookies.user !== "supplier") {
//      return res.status(401).end();
//    }
    ezwh
      .getAllItems()
      .then((data) =>
        res.status(200).json(data)
      )
      .catch((err) => res.status(500).end());
  });

    /**
   * GET /api/items/:id/:supplierId
   * @returns an item given its id.
   *
   */

  app.get("/api/items/:id/:supplierId",
     param("id").isInt(),
     param("supplierId").isInt(),
    (req, res) => {
      const errors =validationResult(req);
     console.log("Retrieving an item");
 //    if (req.cookies.user !== "manager") return res.status(401).end();
 
     //check if id int
 
     if (!errors.isEmpty()) {
       res.status(422).end();
       return;
     }
 
     ezwh
       .getItem(parseInt(req.params.id), parseInt(req.params.supplierId))
       .then((data) =>
         data !== null ? res.status(200).json(data) : res.status(404).end()
       )
       .catch((err) => res.status(500).end());
   });

  /**
   * POST /api/item
   * Creates a new Item.
   *
   */

  app.post("/api/item",
    body("id").isInt({min:0}),
    body("SKUId").isInt({min:0}),
    body("supplierId").isInt({min:0}),
    body("price").isFloat({min:0}),
   (req, res) => {
    const errors = validationResult(req);

    console.log("inserting new item");

    //check if logged and supplier
//    if (req.cookies.user !== "supplier") return res.status(401).end();

    if (!errors.isEmpty())
      return res.status(422).end();

    ezwh.warehouse
      .getSKUbyID(req.body.SKUId)
      .then((data) =>
        !data 
          ? res.status(404).end()
          : ezwh
              .checkItemExists(req.body.id, req.body.supplierId, req.body.SKUId)
              .then((data) =>
                data
                  ? res.status(422).end()
                  : ezwh
                      .insertNewItem(req.body)
                      .then((data) => res.status(201).end())
                      .catch((err) => res.status(503).end())
              )
              .catch((err) => res.status(503).end())
      )
      .catch((err) => res.status(503).end());
  });


    /**
   * PUT /api/item/:id/:supplierId
   *
   * Modify an existing item.
   *
   */

     app.put("/api/item/:id/:supplierId",
     param("id").isInt(),
     param("supplierId").isInt(),
     body("newPrice").isFloat({min:0}),
    (req, res) => {
     const errors = validationResult(req);
     console.log("Modifying item");
 
     //check if logged and supplier
 //    if (req.cookies.user !== "supplier") return res.status(401).end();
     if(!errors.isEmpty() || req.body.newDescription === undefined)
       return res.status(422).end();
 
     ezwh
      .getItem(parseInt(req.params.id), parseInt(req.params.supplierId))
       .then((data) =>
         !data
           ? res.status(404).end()
           : ezwh
               .modifyItem(
                 req.params.id,
                 req.body.newDescription,
                 req.body.newPrice,
                 req.params.supplierId
               )
               .then((data) => res.status(200).end())
               .catch((err) => res.status(503).end())
       )
       .catch((err) => res.status(503).end());
   });

  /**
   * DELETE /api/items/:id/:supplierId
   * deletes item identifyed by id and supplierId
   *
   */
   app.delete("/api/items/:id/:supplierId",
   param("id").isInt({min:0}), 
   param("supplierId").isInt(), 
   (req, res) => {
     const errors = validationResult(req);
     console.log("deleting user");
 
     //check if logged and supplier
 //    if (req.cookies.user !== "supplier") return res.status(401).end();
     if(!errors.isEmpty())
       return res.status(422).end();
       
     ezwh
       .deleteItem(req.params.id, req.params.supplierId)
       .then((data) => res.status(204).end())
       .catch((err) => res.status(503).end())
   });  
};
