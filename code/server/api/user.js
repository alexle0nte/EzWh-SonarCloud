"use strict";

module.exports = function (app, ezwh, body, validationResult, param) {
  /********************************************************************
   *              USERS
   *******************************************************************/

  /**
   * GET /api/userinfo
   * @returns user informations if logged in.
   *
   */
  app.get("/api/userinfo", (req, res) => {
    console.log("Retrieving info about logged user : " + req.cookies.userid);

    //not logged in

    if (req.cookies.userid === undefined) {
//      return res.status(401).end();
    }

    ezwh
      .getUserInfoByID(req.cookies.userid)
      .then((data) =>
        data !== null ? res.status(200).json(data) : res.status(404).end()
      )
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/suppliers
   * @returns an array containing all suppliers.
   *
   */

  app.get("/api/suppliers", (req, res) => {
    console.log("Retrieving list of all suppliers");
//    if (req.cookies.user !== "manager") return res.status(401).end();

    ezwh
      .getAllSupliers()
      .then((data) =>
        res.status(200).json(data)
      )
      .catch((err) => res.status(500).end());
  });

  /**
   * GET /api/users
   * @returns an array containing all users excluding managers.
   *
   */

  app.get("/api/users", (req, res) => {
    console.log("Retrieving list of all users");
//    if (req.cookies.user !== "manager") return res.status(401).end();

    ezwh
      .getAllUsers()
      .then((data) =>
        res.status(200).json(data)
      )
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/newUser
   * Creates a new user.
   *
   */

  app.post(
    "/api/newUser",
    body("username").isEmail(),
    body("password").isLength({min:8}),
    body("name").matches(/[a-zA-Z][a-zA-Z\ \-]*/),
    body("surname").matches(/[a-zA-Z][a-zA-Z\ \-]*/),
    (req, res) => {
    const possibleTypes = [
      "customer",
      "qualityEmployee",
      "clerk",
      "deliveryEmployee",
      "supplier",
    ];
    const errors = validationResult(req);
    console.log("inserting new user");

    //check if logged and manager
//    if (req.cookies.user !== "manager") return res.status(401).end();

    //check if not trying to create manager/administrator
    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
    
    if (req.body.type === "manager" || req.body.type === "administrator")
      return res.status(422).end();

    //check of body
    //type + mail
    if (
      possibleTypes.every((t) => t !== req.body.type) ||
      !errors.isEmpty()
    )
      return res.status(422).end();

    ezwh
      .userExists(req.body.username, req.body.type)
      .then((data) =>
        data
          ? res.status(409).end()
          : ezwh
              .addUser(req.body)
              .then((data) => res.status(201).end())
              .catch((err) => res.status(503).end())
      )
      .catch((err) => res.status(503).end());
  });

  /**
   * POST /api/managerSessions
   * Login of managers
   *
   */

  app.post("/api/managerSessions", (req, res) => {
    console.log("manager login");

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
  
    ezwh
      .login(req.body.username, "manager", req.body.password)
      .then((data) => {
//        if (data === null) return res.status(401).end();
//        else {
	 if (data !== null) {
          res.cookie("user", "manager");
          res.cookie("userid", data.id);
          return res
            .status(200)
            .json({ id: data.id, username: data.username, name: data.name });
        // }
      }})
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/customerSessions
   * Login of customers
   *
   */

  app.post("/api/customerSessions", (req, res) => {
    console.log("customer login");

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
  
    ezwh
      .login(req.body.username, "customer", req.body.password)
      .then((data) => {
        // if (data === null) return res.status(401).end();
        // else {
          res.cookie("user", "customer");
          res.cookie("userid", data.id);
          return res
            .status(200)
            .json({ id: data.id, username: data.username, name: data.name });
        //}
      })
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/supplierSessions
   * Login of suppliers
   *
   */

  app.post("/api/supplierSessions", (req, res) => {
    console.log("supplier login");

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
  
    ezwh
      .login(req.body.username, "supplier", req.body.password)
      .then((data) => {
//        if (data === null) return res.status(401).end();
//        else {
	  if (data !== null) {
          res.cookie("user", "supplier");
          res.cookie("userid", data.id);
          return res
            .status(200)
            .json({ id: data.id, username: data.username, name: data.name });
        // }
      }})
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/clerkSessions
   * Login of clerks
   *
   */

  app.post("/api/clerkSessions", (req, res) => {
    console.log("clerk login");

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
  
    ezwh
      .login(req.body.username, "clerk", req.body.password)
      .then((data) => {
//        if (data === null) return res.status(401).end();
//        else {
	  if (data !== null) {
          res.cookie("user", "clerk");
          res.cookie("userid", data.id);
          return res
            .status(200)
            .json({ id: data.id, username: data.username, name: data.name });
        // }
      }})
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/qualityEmployeeSessions
   * Login of quality employees
   *
   */

  app.post("/api/qualityEmployeeSessions", (req, res) => {
    console.log("quality employee login");

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
  
    ezwh
      .login(req.body.username, "qualityEmployee", req.body.password)
      .then((data) => {
//        if (data === null) return res.status(401).end();
//        else {
	  if (data !== null) {
          res.cookie("user", "qalityEmployee");
          res.cookie("userid", data.id);
          return res
            .status(200)
            .json({ id: data.id, username: data.username, name: data.name });
        // }
      }})
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/deliveryEmployeeSessions
   * Login of delivery employees
   *
   */

  app.post("/api/deliveryEmployeeSessions", (req, res) => {
    console.log("delivery employee login");

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();

    ezwh
      .login(req.body.username, "deliveryEmployee", req.body.password)
      .then((data) => {
//        if (data === null) return res.status(401).end();
//        else {
	  if (data !== null) {
          res.cookie("user", "deliveryEmployee");
          res.cookie("userid", data.id);
          return res
            .status(200)
            .json({ id: data.id, username: data.username, name: data.name });
        // }
      }})
      .catch((err) => res.status(500).end());
  });

  /**
   * POST /api/logout
   * Logout
   *
   */

  app.post("/api/logout", (req, res) => {
    console.log("Logout user");
    if (req.cookies.user !== undefined) {
      try {
        res.clearCookie("user");
        res.clearCookie("userid");
      } catch (error) {
        return res.status(500);
      }
    }
    return res.status(200).end();
  });

  /**
   * PUT /api/users/:username
   * Modify rights of user, given its username. Username is the email of the user.
   *
   */

  app.put("/api/users/:username",
    param("username").isEmail(),
    (req, res) => {
    const possibleTypes = [
      "customer",
      "qualityEmployee",
      "clerk",
      "deliveryEmployee",
      "supplier",
    ];
    const errors = validationResult(req);
    console.log("Modifying user");

    //check if logged and manager
//    if (req.cookies.user !== "manager") return res.status(401).end();

    if(req.body === undefined || !Object.keys(req.body).length)
      return res.status(422).end();
  
    //check if not trying to modify manager/administrator
    if (req.body.oldType === "manager" || req.body.oldType === "administrator")
      return res.status(422).end();

    //check of body
    //type + mail
    if (
      possibleTypes.every((t) => t !== req.body.oldType) ||
      possibleTypes.every((t) => t !== req.body.newType) ||
      !errors.isEmpty()
    )
      return res.status(422).end();

    ezwh
      .userExists(req.params.username, req.body.oldType)
      .then((data) =>
        !data
          ? res.status(404).end()
          : ezwh
              .modifyUser(
                req.params.username,
                req.body.oldType,
                req.body.newType
              )
              .then((data) => res.status(200).end())
              .catch((err) => res.status(503).end())
      )
      .catch((err) => res.status(503).end());
  });

  /**
   * DELETE /api/users/:username/:type
   * Deletes the user identified by username (email) and type
   *
   */
  app.delete("/api/users/:username/:type",
    param("username").isEmail(),
    (req, res) => {
    const possibleTypes = [
      "customer",
      "qualityEmployee",
      "clerk",
      "deliveryEmployee",
      "supplier"
    ];
    const errors = validationResult(req);
    console.log("deleting user");

    //check if logged and manager
//    if (req.cookies.user !== "manager") return res.status(401).end();


    //check if not trying to delete manager/administrator
    if (req.params.type === "manager" || req.params.type === "administrator")
    {
      return res.status(422).end();
    } 
    
    
    //check of body
    //type + mail
    if (
      possibleTypes.every((t) => t !== req.params.type) ||
      !errors.isEmpty()){
        return res.status(422).end();
      }
        
      
    ezwh
      .deleteUser(req.params.username, req.params.type)
      .then((data) => res.status(204).end())
      .catch((err) => res.status(503).end())

  });
};
