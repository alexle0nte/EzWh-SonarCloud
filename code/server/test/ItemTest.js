const chai = require("chai");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
const Item = require("../modules/Item");
chai.use(chaiHttp);
chai.should();


const app = require("../server");
var agent = chai.request.agent(app);

describe("test Item apis", () => {

    beforeEach(async() => {
        await dao.DBdeleteAllItems();
        await dao.DBdeleteAllSKU();
        await dao.DBinsertSKU(
            "a new sku",
            100,
            50,
            "first SKU",
            10.99,
            0,
        );
        await dao.DBinsertSKU(
            "another sku",
            3,
            65,
            "second SKU",
            44.50,
            0,
        );      

    });

    const item ={    
        id : 12,
        description : "a new item",
        price : 10.99,
        SKUId : 1,
        supplierId : 2
    };

    arrayItems([item,
        {
            id:2,
            description : "another item",
            price : 12.99,
            SKUId : 1,
            supplierId : 1
        }
    ]);
    getItem(item);
    newItem(item,
        {
            id:2,
            description : "another item",
            price : "string",
            SKUId : 1,
            supplierId : 1
        }
    );
    modifyItem(item, 13.87, "inputDescription");
    deleteItem(item);
});

function arrayItems(items){
    it("items from filled table", async() =>{
        for(item of items){
            await agent
                .post("/api/item")
                .set("Cookie", "user = supplier;")
                .send(item)
                .then(res => res.should.have.status(201));           
        }      

        await agent
            .get("/api/items")
            .set("Cookie", "user = supplier;")
            .then(res => {
                res.should.have.status(200);
                var i= 0;
                for(item of items){
                    res.body[i].id.should.equal(item.id);
                    res.body[i].description.should.equal(item.description);
                    res.body[i].price.should.equal(item.price);
                    res.body[i].SKUId.should.equal(item.SKUId);
                    res.body[i].supplierId.should.equal(item.supplierId);
                    i++;
                }
            });
    });

/*    it("items without right authorization", async() => {
        await agent
            .get("/api/items")
            .set("Cookie", "user = clerk;")
            .then(res => {
                res.should.have.status(401);
            });          
    });

    it("items not logged", async() => {
        await agent
            .get("/api/items")
            .then(res => {
                res.should.have.status(401);
            });          
    });*/ 
}

function getItem(item){
    it("get existing item id, supplierid", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(item)
            .then(res => res.should.have.status(201));
            
        await agent
            .get(`/api/items/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = manager;")
            .then(res => {
                res.should.have.status(200);
                res.body.id.should.equal(item.id);
                res.body.description.should.equal(item.description);
                res.body.price.should.equal(item.price);
                res.body.SKUId.should.equal(item.SKUId);
                res.body.supplierId.should.equal(item.supplierId);
            });
    });

    it("get not existing item id,supplierid", async() => {
        await agent
            .get(`/api/items/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = manager;")
            .then(res => {
                res.should.have.status(404);
            });
    });
    
    it("get item id,supplierid wrong id(not an integer)", async() => {
        await agent
            .get(`/api/items/string/${item.supplierId}`)
            .set("Cookie", "user = manager;")
            .then(res => {
                res.should.have.status(422);
            });           
    })

    it("get item id,supplierid wrong supplier id(not an integer)", async() => {
        await agent
            .get(`/api/items/${item.id}/string`)
            .set("Cookie", "user = manager;")
            .then(res => {
                res.should.have.status(422);
            });           
    })    
}

function newItem(item, invalidItem){
    it("add item", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(item)
            .then(res => res.should.have.status(201));        
    });

/*    it("add item without right authorization", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = manager;")
            .send(item)
            .then(res => res.should.have.status(401));         
    });

    it("add item logged out", async() => {
        await agent
            .post("/api/item")
            .send(item)
            .then(res => res.should.have.status(401));           
    });
*/
    it("add item wrong sku", async() => {
        const itemWrongSku = {...item};
        itemWrongSku.SKUId = 77;
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(itemWrongSku)
            .then(res => res.should.have.status(404));           
    });

    it("add item invalid body", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(invalidItem)
            .then(res => res.should.have.status(422));          
    });

    it("add item supplier same SKUId", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(item)
            .then(res => res.should.have.status(201));
        
        const itemSameSKU = {
            id: 33,
            SKUId: item.SKUId,
            supplierId: item.supplierId,
            price: 22
        }    
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(itemSameSKU)
            .then(res => res.should.have.status(422));  
    });

    it("add item supplier same id", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(item)
            .then(res => res.should.have.status(201));
        
        const itemSameID = {
            id: item.id,
            SKUId: 2,
            supplierId: item.supplierId,
            price: 22
        }    
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(itemSameID)
            .then(res => res.should.have.status(422));         
    });

};

function modifyItem(item, inputPrice, inputDescription){
    it("modify existing item id,supplierid", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(item)
            .then(res => res.should.have.status(201));
        await agent
            .put(`/api/item/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = supplier;")        
            .send(
                {
                    newPrice: inputPrice,
                    newDescription: inputDescription
                }
            ).then(res => {
                res.should.have.status(200);
            })
    });

    it("modify not existing item id, supplierId", async() => {
        await agent
            .put(`/api/item/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = supplier;")        
            .send(
                {
                    newPrice: inputPrice,
                    newDescription: inputDescription
                }
            ).then(res => {
                res.should.have.status(404);
            })
    });

    it("modify id,supplierId wrong body, price not float", async() => {
        await agent
            .put(`/api/item/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = supplier;")        
            .send(
                {
                    newPrice: "string",
                    newDescription: inputDescription
                }
            ).then(res => {
                res.should.have.status(422);
            })        
    })
}

function deleteItem(item){
    it("delete existing item id, supplierId", async() => {
        await agent
            .post("/api/item")
            .set("Cookie", "user = supplier;")
            .send(item)
            .then(res => res.should.have.status(201));
            
        await agent
            .delete(`/api/items/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = supplier;")
            .then(res => res.should.have.status(204));
    });
/*
    it("delete item with wrong authorization", async() => {
        await agent
            .delete(`/api/items/${item.id}`)
            .set("Cookie", "user = manager;")
            .then(res => res.should.have.status(401));
    });

    it("delete item not logged", async() => {
        await agent
            .delete(`/api/items/${item.id}`)
            .then(res => res.should.have.status(401));
    });
*/
    it("delete not existing item id,supplierId", async() => {
            
        await agent
            .delete(`/api/items/${item.id}/${item.supplierId}`)
            .set("Cookie", "user = supplier;")
            .then(res => res.should.have.status(204));
    });   

    it("delete id,supplierId wrong type id", async() => {
        await agent
            .delete(`/api/items/string/${item.supplierId}`)
            .set("Cookie", "user = supplier;")
            .then(res => res.should.have.status(422));        
    })

    it("delete id,supplierId wrong type supplierId", async() => {
        await agent
            .delete(`/api/items/${item.id}/string`)
            .set("Cookie", "user = supplier;")
            .then(res => res.should.have.status(422));        
    })
}