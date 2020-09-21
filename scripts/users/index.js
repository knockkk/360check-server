const lineReader = require("line-reader");
const dbConnect = require("../../mongodb");
dbConnect(require("../../config").dbUrl);
const UserModel = require("../../models/users");

let index = 0;
lineReader.eachLine("users.csv", async (line) => {
  let username = line.split(",")[2];
  let realname = line.split(",")[1];

  const user = new UserModel({
    username,
    realname,
    score: {
      group: [],
      committee: [],
      seedClass: {},
    },
  });
  await user.save();
  console.log(`${++index}:${username} ${realname}`);
});
