const lineReader = require("line-reader");
const dbConnect = require("../../mongodb");
dbConnect(require("../../config").dbUrl);
const UserModel = require("../../models/users");

//首先清空个人部分信息
const clearInfo = async (UserModel) => {
  await UserModel.updateMany(
    {},
    {
      $set: {
        group: [],
        committee: [],
        seedClass: {},
      },
    }
  );
};
clearInfo(UserModel);

let groups = [];
let committees = [];
let classes = [];
let index = 0,
  p1,
  p2;
lineReader.eachLine("info.csv", async (line) => {
  index++;
  if (index === 2) {
    let arr = line.split(",,");
    groups = arr[1].split(",");
    committees = arr[2].split(",");
    classes = arr[3].split(",");
    p1 = 3 + groups.length;
    p2 = 4 + groups.length + committees.length;
  }
  if (index >= 3) {
    let arr = line.split(",");
    let username = arr[0];
    let realname = arr[1];
    let info = { username, realname };
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == 1) {
        if (i <= p1) {
          info.group = groups[i - 3];
          try {
            await UserModel.findOneAndUpdate(
              { username },
              {
                $push: {
                  group: {
                    name: info.group,
                    scoreList: [],
                  },
                },
              }
            );
          } catch (err) {
            err & console.log(err);
          }
        } else if (i <= p2) {
          info.committee = committees[i - p1 - 1];
          try {
            await UserModel.findOneAndUpdate(
              { username },
              {
                $push: {
                  committee: {
                    name: info.committee,
                    scoreList: [],
                  },
                },
              }
            );
          } catch (err) {
            err & console.log(err);
          }
        } else {
          //种子班
          info.class = classes[i - p2 - 1];
          try {
            await UserModel.findOneAndUpdate(
              { username },
              {
                $set: {
                  seedClass: {
                    name: info.class,
                    scoreList: [],
                  },
                },
              }
            );
          } catch (err) {
            err & console.log(err);
          }
        }
      }
    }
    console.log(`${index - 2}: ${JSON.stringify(info)}`); //index 始终同是一个值3？
  }
});
