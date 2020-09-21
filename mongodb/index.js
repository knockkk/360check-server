// 设置 Mongoose 连接
const mongoose = require("mongoose");
module.exports = (url) => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };
  mongoose.connect(url, options);
  mongoose.Promise = global.Promise;
  const db = mongoose.connection;
  db.once("open", () => {
    console.log("MongoDb connected...");
  });

  db.on("error", (error) => {
    console.warn("Error in MongoDb connection: " + error);
    mongoose.disconnect();
  });
};
