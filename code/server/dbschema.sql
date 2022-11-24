

DROP TABLE IF EXISTS "TestResult";
CREATE TABLE IF NOT EXISTS "TestResult" (
	"id"	INTEGER NOT NULL PRIMARY KEY UNIQUE CHECK(typeof(id) == "integer"),
	"RFID"	TEXT NOT NULL CHECK(typeof(RFID) == "text"),
	"result"	TEXT NOT NULL CHECK(typeof(result) == "text"),
	"date"	TEXT NOT NULL CHECK(typeof(date) == "text"),
	"IDTestDescriptor"	INTEGER NOT NULL CHECK(typeof(IDTestDescriptor) == "integer")
);
DROP TABLE IF EXISTS "TestDescriptor";
CREATE TABLE IF NOT EXISTS "TestDescriptor" (
	"id"	INTEGER NOT NULL PRIMARY KEY UNIQUE CHECK(typeof(id) == "integer"),
	"name"	TEXT NOT NULL CHECK(typeof(name) == "text"),
	"procedureDescription"	TEXT NOT NULL CHECK(typeof(procedureDescription) == "text"),
	"SKUID"	INTEGER NOT NULL CHECK(typeof(SKUID) == "integer")
);

DROP TABLE IF EXISTS "InternalOrderProduct";
CREATE TABLE IF NOT EXISTS "InternalOrderProduct" (
	"internalOrderID"	INTEGER NOT NULL CHECK(typeof(internalOrderID) == "integer"),
	"SKUID"	INTEGER NOT NULL CHECK(typeof(SKUID) == "integer"),
	"quantity"	INTEGER NOT NULL CHECK(typeof(quantity) == "integer"),
	"RFIDs"	TEXT NOT NULL CHECK(typeof(RFIDs) == "text"),
	"description"	TEXT NOT NULL CHECK(typeof(description) == "text"),
	"price"	REAL NOT NULL CHECK(typeof(price) == "real")
);
DROP TABLE IF EXISTS "InternalOrder";
CREATE TABLE IF NOT EXISTS "InternalOrder" (
	"id" INTEGER NOT NULL PRIMARY KEY UNIQUE CHECK(typeof(id) == "integer"),
	"issueDate"	TEXT NOT NULL CHECK(typeof(issueDate) == "text"),
	"state"	TEXT NOT NULL CHECK(typeof(state) == "text"),
	"customerID" INTEGER NOT NULL CHECK(typeof(customerID) == "integer")
);
DROP TABLE IF EXISTS "SKUItem";
CREATE TABLE IF NOT EXISTS "SKUItem" (
	"RFID"	TEXT NOT NULL UNIQUE CHECK(typeof(RFID) == "text"),
	"available"	INTEGER NOT NULL DEFAULT 0 CHECK(typeof(available) == "integer"),
	"SKUID"	INTEGER NOT NULL CHECK(typeof(SKUID) == "integer"),
	"dateOfStock"	TEXT NOT NULL CHECK(typeof(dateOfStock) == "text"),
	"associatedToIO"	INTEGER NOT NULL,
	PRIMARY KEY("RFID")
);
DROP TABLE IF EXISTS "Position";
CREATE TABLE IF NOT EXISTS "Position" (
	"id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE CHECK(typeof(id) == "integer"),
	"aisle"	INTEGER NOT NULL CHECK(typeof(aisle) == "integer"),
	"row"	INTEGER NOT NULL CHECK(typeof(row) == "integer"),
	"column"	INTEGER NOT NULL CHECK(typeof(column) == "integer"),
	"maxWeight"	INTEGER NOT NULL CHECK(typeof(maxWeight) == "integer"),
	"maxVolume"	INTEGER NOT NULL CHECK(typeof(maxVolume) == "integer"),
	"SKUID"	INTEGER CHECK(typeof(SKUID) == "integer" || SKUID == NULL),
	"occupiedWeight"	INTEGER CHECK(typeof(occupiedWeight) == "integer" || occupiedWeight == NULL),
	"occupiedVolume"	INTEGER CHECK(typeof(occupiedVolume) == "integer" || occupiedVolume == NULL)
);
DROP TABLE IF EXISTS "SKU";
CREATE TABLE IF NOT EXISTS "SKU" (
	"id"	INTEGER NOT NULL PRIMARY KEY UNIQUE,
	"description"	TEXT CHECK(typeof(description) == "text"),
	"weight"	INTEGER NOT NULL CHECK(typeof(weight) == "integer"),
	"volume"	INTEGER NOT NULL CHECK(typeof(volume) == "integer"),
	"notes"	TEXT CHECK(typeof(notes) == "text"), 
	"positionID"	INTEGER CHECK(typeof(positionID) == "positionID" || positionID == NULL),
	"price"	INTEGER NOT NULL CHECK(typeof(price) == "integer" || price == NULL),
	"available_quantity"	INTEGER CHECK(typeof(available_quantity) == "integer")
);
DROP TABLE IF EXISTS "User";
CREATE TABLE IF NOT EXISTS "User" (
	"id"	INTEGER NOT NULL PRIMARY KEY UNIQUE,
	"name"	STRING NOT NULL,
	"surname"	STRING NOT NULL,
	"username"	VARCHAR NOT NULL,
	"password"	TEXT NOT NULL,
	"type"	STRING NOT NULL
);
DROP TABLE IF EXISTS "RestockOrder";
CREATE TABLE IF NOT EXISTS "RestockOrder" (
	"id" INTEGER NOT NULL PRIMARY KEY UNIQUE CHECK(typeof(id) == "integer"), 
	"issueDate" TEXT NOT NULL, state TEXT NOT NULL, 
	"supplierId" INTEGER NOT NULL, 
	"transportNote" TEXT DEFAULT NULL,
	"item_Quantity" TEXT NOT NULL, 
	"item_RFID" TEXT DEFAULT NULL
	);

DROP TABLE IF EXISTS "ReturnOrder";
CREATE TABLE IF NOT EXISTS "ReturnOrder" (
	"id" INTEGER NOT NULL PRIMARY KEY UNIQUE CHECK(typeof(id) == "integer"), 
	"returnDate" TEXT NOT NULL, 
	"items" TEXT NOT NULL, 
	"restockId" INTEGER NOT NULL
	);

DROP TABLE IF EXISTS "Item";
CREATE TABLE "Item" (
    "id" INTEGER UNIQUE NOT NULL CHECK(typeof(id) == "integer"),
    "description" TEXT,
    "price" REAL  NOT NULL CHECK(typeof(price) == "real"),
    "SKUId" INTEGER NOT NULL CHECK(typeof(SKUId) == "integer"),
    "supplierId"  INTEGER NOT NULL CHECK(typeof(supplierId) == "integer")                       
);


INSERT INTO "User"("name","surname","username","password","type") VALUES ("mario","rossi","user1@ezwh.com","8bb6118f8fd6935ad0876a3be34a717d32708ffd","customer");
INSERT INTO "User"("name","surname","username","password","type") VALUES ("mario","verdi","qualityEmployee1@ezwh.com","8bb6118f8fd6935ad0876a3be34a717d32708ffd","qualityEmployee");
INSERT INTO "User"("name","surname","username","password","type") VALUES ("mario","bianchi","clerk1@ezwh.com","8bb6118f8fd6935ad0876a3be34a717d32708ffd","clerk");
INSERT INTO "User"("name","surname","username","password","type") VALUES ("mario","gialli","deliveryEmployee1@ezwh.com","8bb6118f8fd6935ad0876a3be34a717d32708ffd","deliveryEmployee");
INSERT INTO "User"("name","surname","username","password","type") VALUES ("mario","blu","supplier1@ezwh.com","8bb6118f8fd6935ad0876a3be34a717d32708ffd","supplier");
INSERT INTO "User"("name","surname","username","password","type") VALUES ("mario","viola","manager1@ezwh.com","8bb6118f8fd6935ad0876a3be34a717d32708ffd","manager");

