const user = require("./user");
const score = require("./score");
module.exports = (app) => {
  app.use("/user", user);
  app.use("/score", score);
};
