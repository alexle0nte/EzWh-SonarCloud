# **EZWH - Code**

## **Setup and start of frontend and backend**

### **How to start backend**

1. Open a new shell
2. In code folder run cmd `cd server`
3. Run cmd `npm install -g nodemon`
4. Run cmd `npm install` to install all modules
5. Run cmd `nodemon server.js`

Steps 3 and 4 need to be executed ONLY THE FIRST TIME you start the server. Then just skip them and follow step 1,2,5.

### **How to start frontend**

1. Open a new shell
2. In code folder run cmd `cd client`
3. Run cmd `npm install` to install all modules
4. Run cmd `npm start`

Steps 3 need to be executed ONLY THE FIRST TIME you start the frontend. Then just skip it and follow step 1,2,4.

## **List of hardcoded accounts**

**Password is always**: testpassword

**Customer**: user1@ezwh.com

**Quality Employee**: qualityEmployee1@ezwh.com

**Clerk**: clerk1@ezwh.com

**Delivery Employee**: deliveryEmployee1@ezwh.com

**Supplier**: supplier1@ezwh.com

**Manager**: manager1@ezwh.com

# Additional information

When the backend is started, it will check the existence of the database, in case the file is not found a new database is
created from scratch with all the tables empty, except for the **User table** which contains the default users with the hash of `testpassword`.

Whenever is needed to reset the database, it can be done either deleting the file and restarting the backend, or running the command

```
node initDB.js
```

(beaware to be in the `/code/server` path)
