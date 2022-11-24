const EzWh = require("../modules/EzWh");
const Item = require("../modules/Item");
const dao = require("../modules/DAO/DAO");

ezwh = new EzWh();

describe("integration tests of Item class", () => {
    beforeEach(async () => {
        await dao.DBdeleteAllItems();
    });

    const item = new Item(
        {
            id : 12,
            description : "a new item",
            price : 10.99,
            SKUId : 1,
            supplierId : 2
        }
    );

    testGetAllItems([item,
        new Item({
            id : 14,
            description : "a new item",
            price : 10,
            SKUId : 1,
            supplierId : 2
        }),
        new Item({
            id : 16,
            description : "a new item",
            price : 10,
            SKUId : 1,
            supplierId : 2
        })    
    ]);
    testGetAllItems();
    testGetAllItems([item]);
    testGetItemByIdSupplier(item);
    testcheckItemExists(item, 18, null, 3);
    testInsertNewItem(item);
    testInsertInvalidItem(new Item(
        {
            description : "a new item",
            price : 10.99,
            SKUId : 1,
            supplierId : 2
        }
    ));
    testModifyItemIdSupplier(item, "item modified", 13.00);
    testDeleteItem(item);
    testcheckInvalidParametersExists(item, 23, null, 3);
    testInvalidModifyItem(item, "item modified", "string price");
});

function testGetAllItems(items){
    const size = items? items.length :0;
    test("get all items table with "+ size+ " items", async () =>{
        if(items !== undefined){
            for(item of items)
                await ezwh.insertNewItem(item);
        }

        var finalSize = await ezwh.getAllItems().then(data => data.length);
        expect(finalSize).toStrictEqual(size);
    });   
}

function testGetItemByIdSupplier(itemInput){
    test("get item with valid id and supplierId", async () =>{
        await ezwh.insertNewItem(itemInput);
        const searchedItem = await ezwh.getItem(itemInput.id, itemInput.supplierId);

        expect(searchedItem.id).toStrictEqual(itemInput.id);
        expect(searchedItem.description).toStrictEqual(itemInput.description);
        expect(searchedItem.price).toStrictEqual(itemInput.price);
        expect(searchedItem.SKUId).toStrictEqual(itemInput.SKUId);
        expect(searchedItem.supplierId).toStrictEqual(itemInput.supplierId);
    })

    test("get not existing id", async () =>{
        const searchedItem = await ezwh.getItem(itemInput.id -1, itemInput.supplierId);

        expect(searchedItem).toStrictEqual(null);;
    })
    test("get not existing supplier id", async () =>{
        const searchedItem = await ezwh.getItem(itemInput.id , itemInput.supplierId-1);

        expect(searchedItem).toStrictEqual(null);;
    })    

    test("get item with null id", async () =>{
        const searchedItem = await ezwh.getItem(null, itemInput.supplierId);
        expect(searchedItem).toStrictEqual(null);

    })

    test("get item with null supplierId", async () =>{
        const searchedItem = await ezwh.getItem(itemInput.id,null);
        expect(searchedItem).toStrictEqual(null);

    })

    test("get item with negative id", async () =>{
        const searchedItem = await ezwh.getItem(-1, itemInput.supplierId);
        expect(searchedItem).toStrictEqual(null);
    })   
    
    test("get item with negative supplierid", async () =>{
        const searchedItem = await ezwh.getItem(itemInput.id,-1);
        expect(searchedItem).toStrictEqual(null);
    })
}

function testcheckItemExists(itemInput){
    test("check existing item", async() =>{
        await ezwh.insertNewItem(itemInput);
        const res = await ezwh.checkItemExists(itemInput.id, itemInput.supplierId, itemInput.SKUId);
        expect(res).toBe(true);
    })

    test("check not existing item", async() =>{
        const res = await ezwh.checkItemExists(itemInput.id, itemInput.supplierId, itemInput.SKUId);
        expect(res).toBe(false);
    });
}

function testcheckInvalidParametersExists(itemInput, fakeId, fakeSupplierId, fakeSKUId){
    test("check item with wrong id", async() => {
        await ezwh.insertNewItem(itemInput);
        const res = await ezwh.checkItemExists(fakeId, itemInput.supplierId, itemInput.SKUId);
        expect(res).toBe(true);        
    });

    test("check item with wrong supplierId", async() => {
        await ezwh.insertNewItem(itemInput);
        const res = await ezwh.checkItemExists(itemInput.id, fakeSupplierId, itemInput.SKUId);
        expect(res).toBe(false);        
    });

    test("check item with wrong SKUId", async() => {
        await ezwh.insertNewItem(itemInput);
        const res = await ezwh.checkItemExists(itemInput.id, itemInput.supplierId, fakeSKUId);
        expect(res).toBe(true);        
    });
};

function testInsertNewItem(itemInput){
    test("insert valid item", async () => {
        await ezwh.insertNewItem(itemInput);
        var items = await ezwh.getAllItems();
        var item = items[0];
        expect(item).toStrictEqual(itemInput);

    });

    test("insert null item", async () =>{
        await expect(async () => {
            await ezwh.insertNewItem(null);
        }).rejects.toThrow();
    });
    
    test("insert existing item", async() => {
        await expect(async () => {
            await ezwh.insertNewItem(itemInput);
            await ezwh.insertNewItem(itemInput);
        }).rejects.toThrow();
    });
};

function testInsertInvalidItem(invalidItem){
    test("insert invalid item", async() => {
        await expect(async () => {
            await ezwh.insertNewItem(invalidItem);
        }).rejects.toThrow();
    });
};

function testModifyItemIdSupplier(item, newDescription, newPrice){
    test("modify item", async () => {
        await ezwh.insertNewItem(item);
        await ezwh.modifyItem(item.id, newDescription, newPrice,item.supplierId);
        const modifiedItem = await ezwh.getItem(item.id, item.supplierId);

        expect(modifiedItem).toStrictEqual(new Item(
            {
                id: item.id,
                description:newDescription,
                price:newPrice,
                SKUId: item.SKUId,
                supplierId:item.supplierId
            }
        ));
    });

    test("modify non existing item", async () => {
        const res = await ezwh.modifyItem(item.id, newDescription, newPrice,item.supplierId);
        expect(res).toStrictEqual(0);
    });

    test("modify item with null id", async () => {

        const res = await ezwh.modifyItem(null, newDescription, newPrice,item.supplierId);
        expect(res).toBe(0); 

    });

    test("modify item with null supplierid", async () => {

        const res = await ezwh.modifyItem(item.id, newDescription, newPrice,null);
        expect(res).toBe(0); 

    });

    test("modify item with wrong type id", async() => {
        const res = await ezwh.modifyItem("string", newDescription, newPrice,item.supplierId);
        expect(res).toBe(0);        
    });

    test("modify item with wrong type supplierid", async() => {
        const res = await ezwh.modifyItem(item.id, newDescription, newPrice,"string");
        expect(res).toBe(0);        
    });

    test("modify item with null price", async () => {
        await expect(async () => {
            await ezwh.insertNewItem(item);
            await ezwh.modifyItem(item.id, newDescription, null,item.supplierId);
        }).rejects.toThrow(); 
    });
};

function testInvalidModifyItem(item, newDescription, invalidPrice){
    test("modify item with invalid new price id and supplierId", async() => {
        await expect(async () => {
            await ezwh.insertNewItem(item);
            await ezwh.modifyItem(item.id, newDescription, invalidPrice,item.supplierId);
        }).rejects.toThrow(); 
    })

}

function testDeleteItem(itemInput){
    test("delete item existing", async () => {
        var size_0 = await ezwh.getAllItems().then(data => data.length);
        await ezwh.insertNewItem(itemInput);
        var size_1 = await ezwh.getAllItems().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await ezwh.deleteItem(itemInput.id,itemInput.supplierId);
        var finalSize = await ezwh.getAllItems().then(data => data.length);
        expect(size_1-finalSize).toBe(1);

    });

    test("delete not existing item", async () => {

        var size_1 = await ezwh.getAllItems().then(data => data.length);

        await ezwh.deleteItem(itemInput.id + 1,itemInput.supplierId);
        var finalSize = await ezwh.getAllItems().then(data => data.length);
        expect(size_1-finalSize).toBe(0);
       
    });

    test("delete null item id", async () => {
        var size_0 = await ezwh.getAllItems().then(data => data.length);
        await ezwh.insertNewItem(itemInput);
        var size_1 = await ezwh.getAllItems().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await ezwh.deleteItem(null, itemInput.supplierId);
        var finalSize = await ezwh.getAllItems().then(data => data.length);
        expect(size_1-finalSize).toBe(0);  
    });

    test("delete null item supplierId", async () => {
        var size_0 = await ezwh.getAllItems().then(data => data.length);
        await ezwh.insertNewItem(itemInput);
        var size_1 = await ezwh.getAllItems().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await ezwh.deleteItem(itemInput.id, null);
        var finalSize = await ezwh.getAllItems().then(data => data.length);
        expect(size_1-finalSize).toBe(0);  
    });
}

