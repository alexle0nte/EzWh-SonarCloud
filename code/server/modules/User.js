"use strict";

class User {
  constructor(objectUser) {
    this.id = objectUser.id;
    this.name = objectUser.name;
    this.surname = objectUser.surname;
    this.username = objectUser.username;
    this.password = objectUser.password;
    this.type = objectUser.type;
    this.email = objectUser.email;
  }
}

module.exports = User;
