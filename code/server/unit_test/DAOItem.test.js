const DAO = require("../modules/DAO/DAO");
const Item = require("../modules/Item");

describe("test DAOItem", () => {
    beforeEach(async () => {
        await DAO.DBdeleteAllItems();
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
        {
            id : 14,
            description : "a new item",
            price : 10,
            SKUId : 1,
            supplierId : 2
        },
        {
            id : 16,
            description : "a new item",
            price : 10,
            SKUId : 1,
            supplierId : 2
        }    
    ]);
    testGetAllItems();
    testGetAllItems([item]);
    testGetItemByIdSupplier(item);
    testDeleteAllItems();
    testDeleteItemByIdSupplier(item);
    testNewItem(item);
    testModifyItemByIdSupplier(item, "item modified", 13.00);
    testNewInvalidItem(new Item(
        {
            description : "a new item",
            price : 10.99,
            SKUId : 1,
            supplierId : 2
        }
    ));
    testInvalidModifyItem(item, "item modified", "string price");
});

function testGetAllItems(items){
    const size = items? items.length :0;
    test("get all items table with " +size+ " items", async () =>{
        if(items !== undefined){
            for(item of items)
                await DAO.DBinsertItem(item);
        }

        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(finalSize).toStrictEqual(size);
    })
}
function testGetItemByIdSupplier(item){
    test("get item with valid id and supplierId", async () =>{
        await DAO.DBinsertItem(item);
        const searchedItem = await DAO.DBitemByIdSupplier(item.id, item.supplierId);

        expect(searchedItem).toStrictEqual(item);

    })

    test("get not existing item with id,supplier", async () =>{
        const searchedItem = await DAO.DBitemByIdSupplier(item.id, item.supplierId);

        expect(searchedItem).toStrictEqual(null);;
    })

    test("get item with only null id", async () =>{
        const searchedItem = await DAO.DBitemByIdSupplier(null, item.supplierId);
        expect(searchedItem).toStrictEqual(null);

    })

    test("get item with only negative id", async () =>{
        const searchedItem = await DAO.DBitemByIdSupplier(-1, item.supplierId);
        expect(searchedItem).toStrictEqual(null);
    })  
    test("get item with only null supplierId", async () =>{
        const searchedItem = await DAO.DBitemByIdSupplier(item.id, null);
        expect(searchedItem).toStrictEqual(null);

    })

    test("get item with only negative supplierId", async () =>{
        const searchedItem = await DAO.DBitemByIdSupplier(item.id, -1);
        expect(searchedItem).toStrictEqual(null);
    })   
}

function testDeleteAllItems(){
    test("delete all items filled table", async () =>{
        await DAO.DBinsertItem(new Item(
            {
                id : 12,
                description : "a new item",
                price : 10,
                SKUId : 1,
                supplierId : 2
            }
        ));
        await DAO.DBinsertItem(new Item(
            {
                id : 14,
                description : "a new item",
                price : 10,
                SKUId : 1,
                supplierId : 2
            }
        ));
        await DAO.DBinsertItem(new Item(
            {
                id : 16,
                description : "a new item",
                price : 10,
                SKUId : 1,
                supplierId : 2
            }
        ));
        var size_1 = await DAO.DBallItems().then(data => data.length);
        await DAO.DBdeleteAllItems();
        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - finalSize).toStrictEqual(3);
    });

    test("delete all items empty table", async() =>  {
        var size_1 = await DAO.DBallItems().then(data => data.length);
        await DAO.DBdeleteAllItems();
        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(size_1 == finalSize).toStrictEqual(true);
    })
}

function testDeleteItemByIdSupplier(itemInput){
    test("delete item existing by id,supplierId", async () => {
        var size_0 = await DAO.DBallItems().then(data => data.length);
        await DAO.DBinsertItem(itemInput);
        var size_1 = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await DAO.DBdeleteItemByIdSupplierId(itemInput.id,itemInput.supplierId);
        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(size_1-finalSize).toBe(1);

    });

    test("delete not existing item by id,supplierId", async () => {

        var size_1 = await DAO.DBallItems().then(data => data.length);
        await DAO.DBdeleteItemByIdSupplierId(itemInput.id+1,itemInput.supplierId);
        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - finalSize).toStrictEqual(0);           
    });

    test("delete only null item id", async () => {
        var size_0 = await DAO.DBallItems().then(data => data.length);
        await DAO.DBinsertItem(itemInput);
        var size_1 = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await DAO.DBdeleteItemByIdSupplierId(null,itemInput.supplierId);
        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - finalSize).toStrictEqual(0);            
    });
    test("delete null item supplierId", async () => {
        var size_0 = await DAO.DBallItems().then(data => data.length);
        await DAO.DBinsertItem(itemInput);
        var size_1 = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await DAO.DBdeleteItemByIdSupplierId(itemInput.id,null);
        var finalSize = await DAO.DBallItems().then(data => data.length);
        expect(size_1 - finalSize).toStrictEqual(0);            
    });
}

function testNewItem(itemInput){
    test("insert valid item", async () => {
        await DAO.DBinsertItem(itemInput);
        var items = await DAO.DBallItems();
        var item = items[0];
        expect(item).toStrictEqual(itemInput);
    });

    test("insert null item", async () =>{
        await expect(async () => {
            await DAO.DBinsertItem(null);
        }).rejects.toThrow();
    });
    
    test("insert existing item", async() => {
        await expect(async () => {
            await DAO.DBinsertItem(itemInput);
            await DAO.DBinsertItem(itemInput);
        }).rejects.toThrow();
    });
};

function testNewInvalidItem(invalidItem){
    test("insert invalid item", async() => {
        await expect(async () => {
            await DAO.DBinsertItem(invalidItem);
        }).rejects.toThrow();
    });
};

function testModifyItemByIdSupplier(item, newDescription, newPrice){
    test("modify item by id, supplierId", async () => {
        await DAO.DBinsertItem(item);
        await DAO.DBmodifyItemByIdSupplierId(item.id,item.supplierId, newDescription, newPrice);
        const modifiedItem = await DAO.DBitemByIdSupplier(item.id,item.supplierId);

        expect(modifiedItem).toStrictEqual(new Item(
            {
                id: item.id,
                description:newDescription,
                price:newPrice,
                SKUId: item.SKUId,
                supplierId:item.supplierId
            }
        ));
    })

    test("modify non existing item by id, supplierId", async () => {
        const res = await DAO.DBmodifyItemByIdSupplierId(item.id,item.supplierId, newDescription, newPrice);
        expect(res).toStrictEqual(0);
    });

    test("modify item with only null id", async () => {

        const res = await DAO.DBmodifyItemByIdSupplierId(null,item.supplierId, newDescription, newPrice);
        expect(res).toBe(0); 

    });
    test("modify item with null supplierId", async () => {

        const res = await DAO.DBmodifyItemByIdSupplierId(item.id,null, newDescription, newPrice);
        expect(res).toBe(0); 

    });    

    test("modify item with only wrong type id", async() => {
        const res = await DAO.DBmodifyItemByIdSupplierId("string",item.supplierId, newDescription, newPrice);
        expect(res).toBe(0);        
    });

    test("modify item with wrong type supplierid", async() => {
        const res = await DAO.DBmodifyItemByIdSupplierId(item.id,"string", newDescription, newPrice);
        expect(res).toBe(0);        
    });

    test("modify item with null price by id, supplierId", async () => {
        await expect(async () => {
            await DAO.DBinsertItem(item);
            await DAO.DBmodifyItemById(item.id, newDescription, null);
        }).rejects.toThrow(); 

    });
};

function testInvalidModifyItem(item, newDescription, invalidPrice){
    test("modify item with invalid new price id and supplierid", async() => {
        await expect(async () => {
            await DAO.DBinsertItem(item);
            await DAO.DBmodifyItemByIdSupplierId(item.id,item.supplierId, newDescription, invalidPrice);
        }).rejects.toThrow(); 
    })
}