const lineReader = require("line-reader");
const dbConnect = require("../../mongodb");
dbConnect(require("../../config").dbUrl);
const UserModel = require("../../models/user");
const CommitteeModel = require("../../models/committee");
const GroupModel = require("../../models/group");
const ClassModel = require("../../models/seedClass");
const ScoreModel = require("../../models/score");
const ImpressionModel = require("../../models/impression");
async function main() {
  //1. 清空数据库
  await UserModel.deleteMany();
  await CommitteeModel.deleteMany();
  await GroupModel.deleteMany();
  await ClassModel.deleteMany();
  await ScoreModel.deleteMany();
  await ImpressionModel.deleteMany();
  console.log("Start writing data...");
  //2. 写入数据
  let index = 0;
  let username, realname, teamNo, identity;
  let c_deptName, c_groupName, c_identity;
  let g_groupName, g_identity;
  let className, class_identity;
  lineReader.eachLine("user.csv", async (line) => {
    index++;
    if (index > 1) {
      let content = line.split(",");
      realname = content[0];
      username = content[1];
      teamNo = content[2] === "无" ? 0 : content[2];
      identity = content[3];
      const user = new UserModel({
        username,
        realname,
        teamNo,
        identity,
      });
      await user.save((err) => {
        err && console.log(err);
      });

      c_deptName = content[4] === "无" ? "" : content[4];
      c_groupName = content[5] === "无" ? "" : content[5];
      c_identity = content[6] === "无" ? "" : content[6];
      if (c_identity) {
        const committee = new CommitteeModel({
          username,
          realname,
          deptName: c_deptName,
          groupName: c_groupName,
          identity: c_identity,
        });
        await committee.save((err) => {
          err && console.log(err);
        });
      }

      g_groupName = content[7] === "无" ? "" : content[7];
      g_identity = content[8] === "无" ? "" : content[8];
      if (g_groupName && g_identity) {
        const group = new GroupModel({
          username,
          realname,
          groupName: g_groupName,
          identity: g_identity,
        });
        await group.save((err) => {
          err && console.log(err);
        });
      }

      className = content[9] === "无" ? "" : content[9];
      class_identity = content[10] === "无" ? "" : content[10];
      if (className && class_identity) {
        const seedClass = new ClassModel({
          username,
          realname,
          className,
          identity: class_identity,
        });
        await seedClass.save((err) => {
          err && console.log(err);
        });
      }

      console.log(
        `${
          index - 1
        }:${username} ${realname} ${teamNo} ${identity} ${c_deptName} ${c_groupName} ${c_identity} ${g_groupName} ${g_identity} ${className} ${class_identity}  `
      );
    }
  });
}
main();
