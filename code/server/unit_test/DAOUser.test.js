const User = require("../modules/User");
const DAO = require("../modules/DAO/DAO");

describe("test DAOUser", () => {
    beforeEach(async() =>{
        await DAO.DBdeleteAllUsers();
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
    testNewUser(user);
    testDeleteUser(user, "user2@ezwh.com", "supplier");
    testGetAllUsers([user,
        new User({
            username:"user1@ezwh.com",
            name:"John",
            surname : "Smith",
            password : "testpassword",
            type : "qualityEmployee"
        }),
        new User({
            name:"Michael",
            surname:"Jordan",
            username:"michael.jordan@supplier.ezwh.com",
            password : "testpassword",
            type:"supplier"
        })

    ]);

    testGetAllUsers();
    testGetAllUsers([user]);
    testGetUserByUsernameType(user);
    testGetUserById(user);
    testDeleteAllUsers();
    testModifyUser(user, "supplier");
    testNewInvalidUser(new User (
        {
            username:"user1@ezwh.com",
            name:"John",
            surname : "Smith",
            type : 66           
        }
    ));
    testcheckCredentials(user, "user2@ezwh.com", "supplier", "ezwh");
})

function testNewUser(userInput){

    test("insert valid user", async () => {
        await DAO.DBinsertUser(userInput);
        var users = await DAO.DBallUsers();
        var user = users[0];
        expect(user.id).toStrictEqual(1);
        expect(user.email).toStrictEqual(userInput.username);
        expect(user.name).toStrictEqual(userInput.name);
        expect(user.surname).toStrictEqual(userInput.surname);
        expect(user.type).toStrictEqual(userInput.type);
    });

    test("insert null user", async () =>{
        await expect(async () => {
            await DAO.DBinsertUser(null);
        }).rejects.toThrow();
    });


}

function testNewInvalidUser(invalidUser){
    test("insert invalid user", async() => {
        await expect(async () => {
            await DAO.DBinsertUser(invalidUser);
          }).rejects.toThrow();
    })
}

function testModifyUser(user, newType){
    test("modify user", async () => {
        
        await DAO.DBinsertUser(user);
        await DAO.DBmodifyUser(user.username, user.type, newType);
        const modifiedUser = await DAO.DBgetUserByUsernameType(user.username, newType);
        
        expect(modifiedUser.id).toStrictEqual(1);
        expect(modifiedUser.username).toStrictEqual(user.username);
        expect(modifiedUser.name).toStrictEqual(user.name);
        expect(modifiedUser.surname).toStrictEqual(user.surname);
        expect(modifiedUser.type).toStrictEqual(newType);
    })

    test("modify non existing user", async () => {
        
        const res = await DAO.DBmodifyUser(user.username, user.type, newType);
        expect(res).toStrictEqual(0);
    });

    test("modify user with null username", async () => {
        await DAO.DBinsertUser(user);
        const res = await DAO.DBmodifyUser(null, user.type, newType);
        expect(res).toBe(0); 

    });

    test("modify user with null new type", async () => {
        
        await expect(async () => {
            await DAO.DBinsertUser(user);
            await DAO.DBmodifyUser(user.username, user.type, null);
        }).rejects.toThrow(); 

    });

    test("modify user with null old type", async () => {
        await DAO.DBinsertUser(user);
        const res =  await DAO.DBmodifyUser(user.username, null, newType);

        expect(res).toBe(0); 
    });
}

function testDeleteUser(inputUser, fakeUsername, fakeType){
    test("delete user existing", async () => {
        var size_0 = await DAO.DBallUsers().then(data => data.length);
        await DAO.DBinsertUser(inputUser);
        var size_1 = await DAO.DBallUsers().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await DAO.DBdeleteUser(inputUser.username, inputUser.type);
        var finalSize = await DAO.DBallUsers().then(data => data.length);
        expect(size_1-finalSize).toBe(1);
    });

    test("delete user with wrong username", async () => {
        var size_0 = await DAO.DBallUsers().then(data => data.length);
        await DAO.DBinsertUser(inputUser);
        var size_1 = await DAO.DBallUsers().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await DAO.DBdeleteUser(fakeUsername, inputUser.type);
        var finalSize = await DAO.DBallUsers().then(data => data.length);
        expect(size_1-finalSize).toBe(0);           
    });

    test("delete user with wrong type", async () => {
        var size_0 = await DAO.DBallUsers().then(data => data.length);
        await DAO.DBinsertUser(inputUser);
        var size_1 = await DAO.DBallUsers().then(data => data.length);
        expect(size_1 - size_0).toBe(1);
        await DAO.DBdeleteUser(inputUser.username, fakeType);
        var finalSize = await DAO.DBallUsers().then(data => data.length);
        expect(size_1 - finalSize).toStrictEqual(0);           
    });    

    test("delete not existing user", async()=> {
        const res = await DAO.DBdeleteUser(inputUser.username, inputUser.type);
        expect(res).toStrictEqual(0);           
    })
}


function testGetAllUsers(users){

    const size = (users? users.length : 0);
    test("get all users table with " + size + " users", async () =>{
        if(users !== undefined){
            for(user of users){
                await DAO.DBinsertUser(user);
            }            
        }
        var finalSize = await DAO.DBallUsers().then(data => data.length);
        expect(finalSize).toStrictEqual(size);
    });
}

function testGetUserByUsernameType(userInput){

    test("search valid username and type", async () =>{
        await DAO.DBinsertUser(userInput);
        const searchedUser = await DAO.DBgetUserByUsernameType(userInput.username, userInput.type);
        expect(searchedUser.id).toStrictEqual(1);
        expect(searchedUser.username).toStrictEqual(userInput.username);
        expect(searchedUser.name).toStrictEqual(userInput.name);
        expect(searchedUser.surname).toStrictEqual(userInput.surname);
        expect(searchedUser.type).toStrictEqual(userInput.type);
    });

    test("search not existing user", async () =>{
        const searchedUser = await DAO.DBgetUserByUsernameType(userInput.username, userInput.type);

        expect(searchedUser).toStrictEqual(null);
               
    });

    test("search wrong username", async() =>  {
        await DAO.DBinsertUser(userInput); 
       const searchedUser = await DAO.DBgetUserByUsernameType(userInput.username + "com", userInput.type); 
       expect(searchedUser).toStrictEqual(null);
    });

    test("search wrong type", async() =>  {
        await DAO.DBinsertUser(userInput); 
       const searchedUser = await DAO.DBgetUserByUsernameType(userInput.username , userInput.type+ "com"); 
       expect(searchedUser).toStrictEqual(null);
    });

    test("search null username", async () =>{
        await DAO.DBinsertUser(userInput); 
       const searchedUser = await DAO.DBgetUserByUsernameType(null, userInput.type); 
        
    });

    test("saerch null type", async() => {
        await DAO.DBinsertUser(userInput); 
       const searchedUser = await DAO.DBgetUserByUsernameType(userInput.username, null); 
        expect(searchedUser).toStrictEqual(null);        
    });
}

function testGetUserById(userInput){
    test("get user with valid id", async () =>{
        await DAO.DBinsertUser(userInput);
        const searchedUser = await DAO.DBgetUserbyId(1);

        expect(searchedUser.username).toStrictEqual(userInput.username);
        expect(searchedUser.name).toStrictEqual(userInput.name);
        expect(searchedUser.surname).toStrictEqual(userInput.surname);
        expect(searchedUser.type).toStrictEqual(userInput.type);
    })

    test("get not existing user", async () =>{

        const searchedUser = await DAO.DBgetUserbyId(0);

        expect(searchedUser).toStrictEqual(null);;
    })

    test("get user with null id", async () =>{
        await DAO.DBinsertUser(userInput);
        const searchedUser = await DAO.DBgetUserbyId(null); 
        expect(searchedUser).toStrictEqual(null);
    })

    test("get user with negative id", async () =>{
        await DAO.DBinsertUser(userInput);
        const searchedUser = await DAO.DBgetUserbyId(-1); 
        expect(searchedUser).toStrictEqual(null);

    })    
}

function testDeleteAllUsers(){
    test("delete all users filled table", async () =>{
        await DAO.DBinsertUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "customer"
            }
        ));
        await DAO.DBinsertUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "customer"
            }
        ));
        await DAO.DBinsertUser(new User(
            {
                name:"Michael",
                surname:"Jordan",
                username:"michael.jordan@supplier.ezwh.com",
                password : "testpassword",
                type:"supplier"
            }
        ));
        var size_1 = await DAO.DBallUsers().then(data => data.length);
        await DAO.DBdeleteAllUsers();
        var finalSize = await DAO.DBallUsers().then(data => data.length);
        expect(size_1 - finalSize).toStrictEqual(3);
    });
    test("delete all users empty table", async()=>{
        var size_1 = await DAO.DBallUsers().then(data => data.length);
        await DAO.DBdeleteAllUsers();
        var finalSize = await DAO.DBallUsers().then(data => data.length);
        expect(size_1 === finalSize).toStrictEqual(true);        
    })
}

function testcheckCredentials(user, fakeUsername, fakeType, fakePassword){
    test("check with credentials existing user", async() => {
        await DAO.DBinsertUser(user);
        const res = await DAO.DBcheckCredentials(user.username, user.type, user.password);
        expect(res.id).toStrictEqual(1);
        expect(res.username).toStrictEqual(user.username);
        expect(res.name).toStrictEqual(user.name);
    });
    test("check credentials not existing user", async() => {
        const res = await DAO.DBcheckCredentials(user.username, user.type, user.password);
        expect(res).toBe(null);        
    });
    test("check with wrong username credentials", async() => {
        await DAO.DBinsertUser(user);
        const res = await DAO.DBcheckCredentials(fakeUsername, user.type, user.password);
        expect(res).toBe(null);        
    });
    test("check with wrong type credentials", async() => {
        await DAO.DBinsertUser(user);
        const res = await DAO.DBcheckCredentials(user.username, fakeType, user.password);
        expect(res).toBe(null);        
    });
    test("check with wrong password credentials", async() => {
        await DAO.DBinsertUser(user);
        const res = await DAO.DBcheckCredentials(user.username, user.type, fakePassword);
        expect(res).toBe(null);        
    });    
}
