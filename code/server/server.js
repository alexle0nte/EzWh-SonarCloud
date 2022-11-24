"use strict";

const EzWh = require("./modules/EzWh");
const express = require("express");
const cookieParser = require("cookie-parser");
const { body, param, validationResult } = require("express-validator");

//init facade class
const ezwh = new EzWh();
// init express
const app = new express();
const port = 3001;

app.use(express.json());
app.use(cookieParser());

//include api libraries
const sku = require("./api/sku")(app, ezwh, body, validationResult, param);
const skuitem = require("./api/skuitem")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
const position = require("./api/position")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
const user = require("./api/user")(app, ezwh, body, validationResult, param);
const internalOrder = require("./api/internalOrder")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
const item = require("./api/item")(app, ezwh, body, validationResult, param);
const testDescriptor = require("./api/testDescriptor")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
const testResult = require("./api/testResult")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
const restockOrder = require("./api/restockOrder")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
const returnOrder = require("./api/returnOrder")(
  app,
  ezwh,
  body,
  validationResult,
  param
);
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

//GET /api/test
app.get("/api/hello", (req, res) => {
  let message = {
    message: "Hello World!",
  };
  return res.status(200).json(message);
});

module.exports = app;
