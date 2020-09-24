const lineReader = require("line-reader");
const dbConnect = require("../../mongodb");
dbConnect(require("../../config").dbUrl);
const UserModel = require("../../models/user");

let index = 0;
let username, realname;
lineReader.eachLine("users.csv", async (line) => {
  username = line.split(",")[2];
  realname = line.split(",")[1];

  const user = new UserModel({
    username,
    realname,
  });
  await user.save((err) => {
    err && console.log(err);
  });
  console.log(`${++index}:${username} ${realname}`);
});
