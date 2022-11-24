const chai = require("chai");
const chaiHttp = require("chai-http");
const dao = require("../modules/DAO/DAO");
const User = require("../modules/User");
chai.use(chaiHttp);
chai.should();


const app = require("../server");
var agent = chai.request.agent(app);

describe("test User apis", () => {
    beforeEach(async() => {
        await dao.DBdeleteAllUsers()
    });

    const possibleTypes = [
        "customer",
        "qualityEmployee",
        "clerk",
        "deliveryEmployee",
        "supplier",
        "manager"
    ];
    const user = {
        username:"user1@ezwh.com",
        name:"John",
        surname : "Smith",
        password : "testpassword",
        type : "customer"
    };

    const users = [user,
        {
            username:"user1@ezwh.com",
            name:"John",
            surname : "Smith",
            password : "testpassword",
            type : "supplier"
        },
        {
            name:"Michael",
            surname:"Jordan",
            username:"michael.jordan@supplier.ezwh.com",
            password : "testpassword",
            type:"supplier"
        },
        {            
            name:"Mario",
            surname:"Rossi",
            username:"mario.rossi@supplier.ezwh.com",
            password : "testpassword",
            type:"clerk" 
        } 
    ]
    getInfoUser(user);
    arraySuppliers(users);
    arrayUsers(users);
    newUser(user,{
        username:"user1@ezwh.com",
        name:"John",
        surname : "Smith",
        password : "testpassword",
        type : "dancer"        
    });

    for(possibleType of possibleTypes){
        login(        
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : possibleType
            }
        );
        logOut(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : possibleType
            }
        )          
    };
    logoutNoUser();
    modifyUserRights(user,"supplier");
    deleteUser(users[3]);
});

function getInfoUser(user){
    it("get info logged user", async() => {
   
        await agent
            .post("/api/newUser")
            .set("Cookie", "user = manager;")
            .send(user)
            .then((res) => res.should.have.status(201));

        await agent
            .get("/api/userInfo")
            .set("Cookie", "user = "+ user.type+";userid = 1;")
            .send()
            .then((res) =>{
                res.should.have.status(200);
                res.body.id.should.equal(1);
                res.body.username.should.equal(user.username);
                res.body.name.should.equal(user.name);
                res.body.surname.should.equal(user.surname);
                res.body.type.should.equal(user.type);
               
            })
    });
/*
    it("get info of not logged user", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie", "user = manager;")
            .send(user)
            .then((res) => res.should.have.status(201)); 
        await agent
            .get("/api/userInfo")
            .send()
            .then((res) => res.should.have.status(401));       
    });*/
}

function arraySuppliers(users){
    it("suppliers from empty table", async() => {
        await agent
            .get("/api/suppliers")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                res.should.have.status(200);
            })
    });

    it("suppliers from filled table without suppliers", async() => {
        for(user of users){
            if(user.type !== 'supplier'){
                await agent
                    .post("/api/newUser")
                    .set("Cookie", "user = manager;")
                    .send(user)
                    .then((res) => res.should.have.status(201));
            }             
        }
        
        await agent
            .get("/api/suppliers")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                res.should.have.status(200);
            });
    });

    it("suppliers from filled table with suppliers", async() =>{
        var nSuppliers = 0;
        for(user of users){
            if(user.type === "supplier")
                nSuppliers++;
            await agent
                .post("/api/newUser")
                .set("Cookie", "user = manager;")
                .send(user)
                .then((res) => res.should.have.status(201));             
        }
        
        await agent
            .get("/api/suppliers")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                var i = 0;
                res.should.have.status(200);
                res.body.length.should.equal(nSuppliers);
                for(user of users){
                    if(user.type === "supplier"){
                        res.body[i].email.should.equal(user.username);
                        res.body[i].name.should.equal(user.name);
                        res.body[i].surname.should.equal(user.surname);                   
                        i++; 
                    }
                    
                }
            });
    });

/*
    it("suppliers without right authorization", async() => {
        await agent
            .get("/api/suppliers")
            .set("Cookie","user=clerk;")
            .send()
            .then((res) => {
                res.should.have.status(401);
            });
    })

    it("suppliers not logged", async() => {
        await agent
            .get("/api/suppliers")
            .send()
            .then((res) => {
                res.should.have.status(401);
            });
    })*/
}

function arrayUsers(users){
    it("users from empty table", async() => {
        await agent
            .get("/api/users")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                res.should.have.status(200);
            })
    });

    it("users from filled table without managers", async() => {
        for(user of users){
            await agent
                .post("/api/newUser")
                .set("Cookie", "user = manager;")
                .send(user)
                .then((res) => res.should.have.status(201));
            
        }
        
        await agent
            .get("/api/users")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                var i = 0;
                res.should.have.status(200);
                res.body.length.should.equal(users.length);
                for(user of users){
                    
                    res.body[i].email.should.equal(user.username);
                    res.body[i].name.should.equal(user.name);
                    res.body[i].surname.should.equal(user.surname);                   
                    res.body[i].type.should.equal(user.type);
                    i++;
                }
            });
    });

    it("users from filled table with managers", async() =>{
        await dao.DBinsertUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "manager"
            }
        ));
        await dao.DBinsertUser(
            new User(
                {
                    username:"user3@ezwh.com",
                    name:"Will",
                    surname : "Smith",
                    password : "testpassword",
                    type : "manager"
                }
        ));
        for(user of users){
            await agent
                .post("/api/newUser")
                .set("Cookie", "user = manager;")
                .send(user)
                .then((res) => res.should.have.status(201));             
        }
        
        await agent
            .get("/api/users")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                var i = 0;
                res.should.have.status(200);
                for(user of users){
                    res.body[i].email.should.equal(user.username);
                    res.body[i].name.should.equal(user.name);
                    res.body[i].surname.should.equal(user.surname);
                    res.body[i].type.should.equal(user.type);                   
                    i++;
                }
            });
    });

    it("users from filled table with only managers", async() =>{
        await dao.DBinsertUser(new User(
            {
                username:"user1@ezwh.com",
                name:"John",
                surname : "Smith",
                password : "testpassword",
                type : "manager"
            }
        ));
        await dao.DBinsertUser(
            new User(
                {
                    username:"user3@ezwh.com",
                    name:"Will",
                    surname : "Smith",
                    password : "testpassword",
                    type : "manager"
                }
        ));
        await agent
            .get("/api/users")
            .set("Cookie", "user = manager;")
            .send()
            .then((res) => {
                res.should.have.status(200);
            });
    });
/*
    it("users without right authorization", async() => {
        await agent
            .get("/api/users")
            .set("Cookie","user=clerk;")
            .send()
            .then((res) => {
                res.should.have.status(401);
            });
    });

    it("users not logged", async() => {
        await agent
            .get("/api/suppliers")
            .send()
            .then((res) => {
                res.should.have.status(401);
            });
    })*/
};

function newUser(user,invalidUser){
/*
    it("add user not logged", async() => {
        await agent
            .post("/api/newUser")
            .send(user)
            .then(res => {
                res.should.have.status(401);
            })
    });

    it("add user without right authorization", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user = clerk;")
            .send(user)
            .then(res => {
                res.should.have.status(401);
            })
    });    
*/
    it("add user with invalid body", async() =>{
        await agent
            .post("/api/newUser")
            .set("Cookie","user = manager;")
            .send(invalidUser)
            .then(res => {
                res.should.have.status(422);
            })
    });

    it("add existing user", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });
        
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(409);
            });        
    });

    it("add new user", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });        
    })
}

function login(user){
    it("login existing " + user.type, async() => {
        await dao.DBinsertUser(new User(user));

        await agent
            .post("/api/" + user.type +"Sessions")
            .send({
                username : user.username,
                password: user.password
            }).then(res => {
                res.should.have.status(200);
                res.body.id.should.equal(1);
                res.body.username.should.equal(user.username);
                res.body.name.should.equal(user.name);
            })
    });
/*
    it("login not existing " + user.type, async() => {
        await agent
            .post("/api/" + user.type +"Sessions")
            .send({
                username : user.username,
                password: user.password
            }).then(res => {
                res.should.have.status(401);
            })
    });

    it(user.type + " login with wrong username", async() => {
        await dao.DBinsertUser(new User(user));
        await agent
            .post("/api/" + user.type +"Sessions")
            .send({
                username : user.username + "com",
                password: user.password
            }).then(res => {
                res.should.have.status(401);
            })
    });

    it(user.type + " login with wrong password", async() => {
        await dao.DBinsertUser(new User(user));

        await agent
            .post("/api/" + user.type +"Sessions")
            .send({
                username : user.username,
                password: user.password + "com"
            }).then(res => {
                res.should.have.status(401);
            })
    });
*/    
    it("login " + user.type + " with empty fields", async() => {
        await agent
            .post("/api/" + user.type + "Sessions")
            .send()
            .then(res => {
                res.should.have.status(422);
            });
    });

    it("login " + user.type + " with no body", async() => {
        await agent
            .post("/api/" + user.type + "Sessions")
            .then(res => {
                res.should.have.status(422);
            });
    });

}

function logOut(user){
    it("logout " + user.type, async() => {
        await dao.DBinsertUser(new User(user));
        
        await agent
            .post("/api/" + user.type +"Sessions")
            .send({
                username : user.username,
                password: user.password
            }).then(res => {
                res.should.have.status(200);
            })
        
        await agent
            .post("/api/logout")
            .then(res => res.should.have.status(200));

    });

};

function logoutNoUser(){
    it("logout no user logged", async() => {
        await agent
            .post("/api/logout")
            .then(res => res.should.have.status(200));
    });
}

function modifyUserRights(user, newValidType){
    it("modify existing user", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });
            
        await agent
            .put(`/api/users/${user.username}`)
            .set("Cookie","user=manager;")
            .send(
                {
                    oldType: user.type,
                    newType: newValidType
                }
            ).then(res => {
                res.should.have.status(200);
            })
    });

    it("modify not existing user", async() => {
        await agent
            .put(`/api/users/${user.username}`)
            .set("Cookie","user=manager;")
            .send(
                {
                    oldType: user.type,
                    newType: newValidType
                }
            ).then(res => {
                res.should.have.status(404);
            })        
    });
/*
    it("modify with wrong authorization", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });

        await agent
            .put(`/api/users/${user.username}`)
            .set("Cookie","user=clerk;")
            .send(
                {
                    oldType: user.type,
                    newType: newValidType
                }
            ).then(res => {
                res.should.have.status(401);
            })        
    });

    it("modify not logged", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });

        await agent
            .put(`/api/users/${user.username}`)
            .send(
                {
                    oldType: user.type,
                    newType: newValidType
                }
            ).then(res => {
                res.should.have.status(401);
            })        
    });    
*/
    it("modify wrong body", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });
        await agent
            .put(`/api/users/${user.username}`)
            .set("Cookie","user=manager;")
            .send(
                {
                    oldType: user.type,
                    newType: "dancer"
                }
            ).then(res => {
                res.should.have.status(422);
            })         
    });

    it("modify wrong username format", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });

        await agent
            .put(`/api/users/${user.name}`)
            .set("Cookie","user=manager;")
            .send(
                {
                    oldType: user.type,
                    newType: newValidType
                }
            ).then(res => {
                res.should.have.status(422);
            })         
    });
    
    it("modify empty body", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });
        await agent
            .put(`/api/users/${user.name}`)
            .set("Cookie","user=manager;")
            .send()
            .then(res => {
                res.should.have.status(422);
            })         
    });
};

function deleteUser(user){
    it("delete existing user", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });
            
        await agent
            .delete(`/api/users/${user.username}/${user.type}`)
            .set("Cookie","user=manager;")
            .then(res => {
                res.should.have.status(204);
            })
    });

    it("delete not existing user", async() => {
        await agent
            .delete(`/api/users/${user.username}/${user.type}`)
            .set("Cookie","user=manager;")
            .then(res => {
                res.should.have.status(204);
            })        
    });
/*
    it("delete with wrong authorization", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });

        await agent
            .delete(`/api/users/${user.username}/${user.type}`)
            .set("Cookie","user=clerk;")
            .then(res => {
                res.should.have.status(401);
            })        
    });

    it("delete not logged", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });

        await agent
            .delete(`/api/users/${user.username}/${user.type}`)
            .then(res => {
                res.should.have.status(401);
            })        
    });    
*/
    it("delete wrong type", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });
        await agent
            .delete(`/api/users/${user.username}/dancer`)
            .set("Cookie","user=manager;")
            .then(res => {
                res.should.have.status(422);
            })         
    });

    it("delete wrong username format", async() => {
        await agent
            .post("/api/newUser")
            .set("Cookie","user=manager;")
            .send(user)
            .then(res => {
                res.should.have.status(201);
            });

        await agent
            .delete(`/api/users/${user.name}/${user.type}`)
            .set("Cookie","user=manager;")
            .then(res => {
                res.should.have.status(422);
            })         
    });
    
}