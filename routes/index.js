const user = require("./user");
const score = require("./score");
const impression = require("./impression");
module.exports = (app) => {
  app.use("/user", user);
  app.use("/score", score);
  app.use("/impression", impression);
};
