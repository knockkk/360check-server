module.exports = class PartToUser {
  constructor() {
    this.set = {};
  }
  async init() {
    const UserModel = require("../models/user");
    let users = [];
    try {
      users = await UserModel.find();
    } catch (err) {
      console.log(err);
    }
    users.forEach((u) => {
      u.group &&
        u.group.forEach((g) => {
          this.insert(g, u.username);
        });

      u.committee &&
        u.committee.forEach((c) => {
          this.insert(c, u.username);
        });

      u.seedClass && this.insert(u.seedClass, u.username);
    });
    console.log("part-users", this.set);
  }
  insert(partName, user) {
    if (!this.set[partName]) this.set[partName] = [];
    if (!this.set[partName].includes(user)) this.set[partName].push(user);
  }
  remove(partName, user) {
    let index;
    if ((index = this.set[partName].indexOf(user) > 0))
      this.set[partName].splice(index, 1);
  }
  update(oldPartName, newPartName, user) {
    this.remove(oldPartName, user);
    this.insert(newPartName, user);
  }
  getUsers(partName) {
    return this.set[partName] || [];
  }
};
