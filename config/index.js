const rules = require("./rules");
const committee = require("./committee");
module.exports = {
  dbUrl: "mongodb://admin:123456@127.0.0.1/360test",
  rules,
  deptToCommittees: committee,
};
