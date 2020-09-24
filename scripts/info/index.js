const lineReader = require("line-reader");
const dbConnect = require("../../mongodb");
dbConnect(require("../../config").dbUrl);
const UserModel = require("../../models/user");

let groups = [];
let committees = [];
let classes = [];
let index = 0,
  p1,
  p2;
lineReader.eachLine("info.csv", async (line) => {
  index++;
  if (index === 2) {
    const arr = line.split(",,");
    groups = arr[1].split(",");
    committees = arr[2].split(",");
    classes = arr[3].split(",");
    p1 = 3 + groups.length;
    p2 = 4 + groups.length + committees.length;
  } else if (index >= 3) {
    const arr = line.split(",");
    const user = await UserModel.findOne({ username: arr[0] });
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == 1) {
        if (i <= p1) {
          const groupName = groups[i - 3];
          if (user.group.length <= 2 && !user.group.includes(groupName)) {
            user.group.push(groupName);
          }
        } else if (i <= p2) {
          const cmtName = committees[i - p1 - 1];
          if (user.committee.length <= 2 && !user.committee.includes(cmtName)) {
            user.committee.push(cmtName);
          }
        } else {
          user.seedClass = classes[i - p2 - 1];
        }
      }
    }
    await user.save((err) => {
      err && console.log(err);
    });
    console.log(JSON.stringify(user));
  }
});
