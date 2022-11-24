const EzWh = require("../modules/EzWh");
const User = require("../modules/User");
const dao = require("../modules/DAO/DAO");

ezwh = new EzWh();

describe("integration tests of EzWh:User methods", () => {

    beforeEach(async () => {
        await dao.DBdeleteAllUsers();
    });

    const user = new User(
        {
            username:"user1@ezwh.com",
            name:"John",
            surname : "Smith",
            password : "testpassword",
            type : "customer"
        }
    );
    testLogin(user, "user2@ezwh.com", "supplier", "ezwh");
    testgetUserInfoByID(user);
    testgetAllSuppliers();
    testGetAllUsers();
    testUserExists(user);
    testDeleteUser(user, "user2@ezwh.com", "supplier");
    testAddUser(user);
    testAddInvalidUser(new User (
        {
            username:"user1@ezwh.com",
            name:"John",
            surname : "Smith",
            type : "customer"            
        }
    ));
    testModifyUser(user, "supplier");
});

function testLogin(user, fakeUsername, fakeType, fakePassword){
    test("login with credentials existing user", async() => {
        await ezwh.addUser(user);
        const res = await ezwh.login(user.username, user.type, user.password);
        expect(res.id).toStrictEqual(1);
        expect(res.username).toStrictEqual(user.username);
        expect(res.name).toStrictEqual(user.name);
    });
    test("login credentials not existing user", async() => {
        const res = await ezwh.login(user.username, user.type, user.password);
        expect(res).toBe(null);        
    });
    test("login with wrong username credentials", async() => {
        await ezwh.addUser(user);
        const res = await ezwh.login(fakeUsername, user.type, user.password);
        expect(res).toBe(null);        
    });
    test("login with wrong type credentials", async() => {
        await ezwh.addUser(user);
        const res = await ezwh.login(user.username, fakeType, user.password);
        expect(res).toBe(null);        
    });
    test("login with wrong password credentials", async() => {
        await ezwh.addUser(user);
        const res = await ezwh.login(user.username, user.type, fakePassword);
        expect(res).toBe(null);        
    });    
}

function testgetUserInfoByID(userInput){
    test("get info of an existing user", async() => {
        await ezwh.addUser(userInput);
        const searchedUser = await ezwh.getUserInfoByID(1);
        expect(searchedUser.username).toStrictEqual(userInput.username);
        expect(searchedUser.name).toStrictEqual(userInput.name);
        expect(searchedUser.surname).toStrictEqual(userInput.surname);
        expect(searchedUser.type).toStrictEqual(userInput.type);
    });

    test("get info of not existing user", async() => {
        const searchedUser = await ezwh.getUserInfoByID(1);
        expect(searchedUser).toStrictEqual(null);
    });
    test("get user info with null id", async () =>{
        await ezwh.addUser(userInput);
        const searchedUser = await ezwh.getUserInfoByID(null); 
        expect(searchedUser).toStrictEqual(null);
    })

    test("get user info with negative id", async () =>{
        await ezwh.addUser(userInput);
        const searchedUser = await ezwh.getUserInfoByID(-1); 
        expect(searchedUser).toStrictEqual(null);

    })  
}

function testgetAllSuppliers(){
    test("get all suppliers empty table", async () =>{
        var finalSize = await ezwh.getAllSupliers().then(data => data.length);
        expect(finalSize).toStrictEqual(0);        
    })

    test("get all suppliers filled table", async () =>{
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "supplier"
            }
        ));
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "customer"
            }
        ));
        await ezwh.addUser(new User(
            {
                name:"Michael",
                surname:"Jordan",
                username:"michael.jordan@supplier.ezwh.com",
                password : "testpassword",
                type:"supplier"
            }
        ));
        await ezwh.addUser(new User(
            {            
                name:"Mario",
                surname:"Rossi",
                username:"mario.rossi@supplier.ezwh.com",
                password : "testpassword",
                type:"clerk" 
            }           
        ));

        var finalSize = await ezwh.getAllSupliers().then(suppliers => suppliers.length);
        expect(finalSize).toStrictEqual(2);
    }); 
    
    test("get all suppliers filled table without suppliers", async () =>{
        await ezwh.addUser(new User(
            {            
                name:"Mario",
                surname:"Rossi",
                username:"mario.rossi@supplier.ezwh.com",
                password : "testpassword",
                type:"clerk" 
            }           
        ));

        var finalSize = await ezwh.getAllSupliers().then(data => data.length);
        expect(finalSize).toStrictEqual(0);
    }); 
};

function testGetAllUsers(){
    test("get all users empty table", async () =>{
        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(finalSize).toStrictEqual(0);        
    })

    test("get all users filled table without managers", async () =>{
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "supplier"
            }
        ));
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "customer"
            }
        ));
        await ezwh.addUser(new User(
            {
                name:"Michael",
                surname:"Jordan",
                username:"michael.jordan@supplier.ezwh.com",
                password : "testpassword",
                type:"supplier"
            }
        ));
        await ezwh.addUser(new User(
            {            
                name:"Mario",
                surname:"Rossi",
                username:"mario.rossi@supplier.ezwh.com",
                password : "testpassword",
                type:"clerk" 
            }           
        ));

        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(finalSize).toStrictEqual(4);
    });
    
    test("get all users filled table with managers", async () =>{
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "supplier"
            }
        ));
        await ezwh.addUser(new User(
            {
                username:"user3@ezwh.com",
                name:"Will",
                surname : "Smith",
                password : "testpassword",
                type : "manager"
            }
        ));
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "customer"
            }
        ));
        await ezwh.addUser(new User(
            {
                name:"Michael",
                surname:"Jordan",
                username:"michael.jordan@supplier.ezwh.com",
                password : "testpassword",
                type:"supplier"
            }
        ));
        await ezwh.addUser(new User(
            {            
                name:"Mario",
                surname:"Rossi",
                username:"mario.rossi@supplier.ezwh.com",
                password : "testpassword",
                type:"manager" 
            }           
        ));
        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(finalSize).toStrictEqual(3);
    });

    test("get all users filled table with only managers", async () =>{
        await ezwh.addUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "manager"
            }
        ));

        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(finalSize).toStrictEqual(0);
    });

}

function testUserExists(userInput){
    test("user exists", async() => {
        await ezwh.addUser(userInput);
        const res = await ezwh.userExists(userInput.username, userInput.type);
        expect(res).toBe(true);
    });
    test("user doesn't exists", async() => {
        const res = await ezwh.userExists(userInput.username, userInput.type);
        expect(res).toBe(false);
    });

    test("search wrong username", async () =>{
        await ezwh.addUser(userInput); 
       const res = await ezwh.userExists(userInput.username + "com", userInput.type); 
       expect(res).toBe(false);
    });

    test("search wrong type", async() => {
        await ezwh.addUser(userInput); 
       const res = await ezwh.userExists(userInput.username, userInput.type + "com"); 
       expect(res).toBe(false);       
    });

    test("search with null username", async () =>{
        await ezwh.addUser(userInput); 
       const res = await ezwh.userExists(null, userInput.type); 
       expect(res).toBe(false);
    });

    test("search null type", async() => {
        await ezwh.addUser(userInput); 
       const res = await ezwh.userExists(userInput.username, null); 
       expect(res).toBe(false);       
    })
}

function testDeleteUser(inputUser, fakeUsername, fakeType){
    test("delete user existing", async () => {
        var size_0 = await ezwh.getAllUsers().then(data => data.length);
        await ezwh.addUser(inputUser);
        var size_1 = await ezwh.getAllUsers().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await ezwh.deleteUser(inputUser.username, inputUser.type);
        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(size_1-finalSize).toBe(1);
    });

    test("delete not existing user", async() => {
        const res = await ezwh.deleteUser(inputUser.username, inputUser.type);
        expect(res).toBe(0);        
    });

    test("delete not existing username", async () => {
        var size_0 = await ezwh.getAllUsers().then(data => data.length);
        await ezwh.addUser(inputUser);
        var size_1 = await ezwh.getAllUsers().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await ezwh.deleteUser(fakeUsername, inputUser.type);
        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(size_1-finalSize).toBe(0);           
    });

    test("delete not existing type", async () => {
        var size_0 = await ezwh.getAllUsers().then(data => data.length);
        await ezwh.addUser(inputUser);
        var size_1 = await ezwh.getAllUsers().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await ezwh.deleteUser(inputUser.username, fakeType);
        var finalSize = await ezwh.getAllUsers().then(data => data.length);
        expect(size_1 - finalSize).toBe(0);           
    });    

}

function testAddUser(userInput){

    test("insert valid user", async () => {
        await ezwh.addUser(userInput);
        var users = await dao.DBallUsers();
        var user = users[0];
        expect(user.id).toStrictEqual(1);
        expect(user.username).toStrictEqual(userInput.email);
        expect(user.name).toStrictEqual(userInput.name);
        expect(user.surname).toStrictEqual(userInput.surname);
        expect(user.type).toStrictEqual(userInput.type);
    });

    test("insert null user", async () =>{
        await expect(async () => {
            await ezwh.addUser(null);
        }).rejects.toThrow();
    });


}

function testAddInvalidUser(invalidUser){
    test("insert invalid user", async() => {
        await expect(async () => {
            await ezwh.addUser(invalidUser);
          }).rejects.toThrow();
    })
}

function testModifyUser(user, newType){
    test("modify user", async () => {
        
        await ezwh.addUser(user);
        await ezwh.modifyUser(user.username, user.type, newType);
        const modifiedUser = await ezwh.getAllUsers().then(users => users[0]);
        
        expect(modifiedUser.id).toStrictEqual(1);
        expect(modifiedUser.username).toStrictEqual(user.email);
        expect(modifiedUser.name).toStrictEqual(user.name);
        expect(modifiedUser.surname).toStrictEqual(user.surname);
        expect(modifiedUser.type).toStrictEqual(newType);
    })

    test("modify non existing user", async () => {
        const res = await ezwh.modifyUser(user.username, user.type, newType);
        expect(res).toStrictEqual(0);
    });

    test("modify user with null username", async () => {
        const res = await ezwh.modifyUser(null, user.type, newType);
        expect(res).toBe(0); 

    });

    test("modify user with null new type", async () => {
        
        await expect(async () => {
            await ezwh.addUser(user);
            await ezwh.modifyUser(user.username, user.type, null);
        }).rejects.toThrow(); 

    });

    test("modify user with null old type", async () => {
        await ezwh.addUser(user);
        const res =  await ezwh.modifyUser(user.username, null, newType);

        expect(res).toBe(0); 
    });
}
