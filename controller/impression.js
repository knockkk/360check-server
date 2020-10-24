const UserModel = require("../models/user");
const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
const ClassModel = require("../models/seedClass");
const ImpressionModel = require("../models/impression");
module.exports = {
  async getImpressionList(req, res, next) {
    const thisUsername = req.session.username;
    try {
      const thisUser = await UserModel.findOne({ username: thisUsername });
      const captain = await CommitteeModel.getCaptain();
      let result = [];
      if (thisUser.identity === "导师") {
        result = await getImpressionForTutor(thisUsername);
      } else if (thisUsername === captain.username) {
        result = await getImpressionForCaptain(thisUsername);
      } else {
        result = await getManagers(thisUsername);
      }
      res.send(result);
    } catch (error) {
      next(error);
    }
  },
  async updateImpression(req, res, next) {
    const from = req.session.username;
    const { score, username } = req.body;
    try {
      const toUser = await UserModel.findOne({ username });
      if (!toUser) {
        next({
          status: 400,
          msg: "用户不存在",
        });
        return;
      }
      if (!score || score < 0 || score > 100) {
        next({
          status: 400,
          msg: "score参数无效",
        });
        return;
      }
      const to = username;
      let record = await ImpressionModel.findOne({ from, to });
      if (record) {
        record.score = score;
      } else {
        record = new ImpressionModel({ from, to, score });
      }
      await record.save((error) => {
        if (error) {
          next(error);
        } else {
          res.send({ code: 0, msg: "success" });
        }
      });
    } catch (error) {
      next(error);
    }
  },
};
//获取导师impression评价列表（只针对导师），返回各项目组和队委会干部信息
async function getImpressionForTutor(thisUsername) {
  const result = [];
  try {
    const committeeLeaders = await CommitteeModel.find({
      identity: {
        $in: ["队长", "部长", "组长"],
      },
    });
    const groupLeaders = await GroupModel.find({
      identity: "组长",
    });
    const nameSet = new Set();
    committeeLeaders.forEach((u) => nameSet.add(u.username));
    groupLeaders.forEach((u) => nameSet.add(u.username));
    const managerNames = Array.from(nameSet);

    for (let managerName of managerNames) {
      const userInfo = await getUserInfo({ username: managerName });
      const impressionDoc = await ImpressionModel.findOne({
        from: thisUsername,
        to: managerName,
      });
      const impression = impressionDoc ? impressionDoc.score : 0;
      result.push({ ...userInfo, impression });
    }
  } catch (error) {
    console.log(error);
  }
  return result;
}

//获取队长的impression评价列表（只针对队长）
async function getImpressionForCaptain(username) {
  //获取所有队员名单
  const result = [];
  try {
    const allUsers = await UserModel.find({
      identity: "在站",
      username: { $ne: username },
    });
    for (let thisUser of allUsers) {
      const userInfo = await getUserInfo(thisUser);
      const impressionDoc = await ImpressionModel.findOne({
        from: username,
        to: thisUser.username,
      });
      const impression = impressionDoc ? impressionDoc.score : 0;
      result.push(Object.assign(userInfo, { impression }));
    }
  } catch (error) {
    console.log(error);
  }
  return result;
}

//获取对队长及三大部长的impression（针对所有队员）
async function getManagers(thisUsername) {
  const result = [];
  try {
    const managers = await CommitteeModel.find({
      identity: {
        $in: ["队长", "部长"],
      },
    });
    for (let user of managers) {
      const userInfo = await getUserInfo({ username: user.username });
      const impressionDoc = await ImpressionModel.findOne({
        from: thisUsername,
        to: user.username,
      });
      const impression = impressionDoc ? impressionDoc.score : 0;
      result.push({ ...userInfo, impression });
    }
  } catch (error) {
    console.log(error);
  }
  return result;
}

async function getUserInfo(thisUser) {
  const userInfo = {};
  const { username } = thisUser;
  try {
    if (!thisUser.teamNo) {
      thisUser = await UserModel.findOne({ username });
    }
    userInfo.username = thisUser.username;
    userInfo.realname = thisUser.realname;
    userInfo.teamNo = thisUser.teamNo;

    const groupDocs = await GroupModel.find({
      username,
    });
    userInfo.groups = groupDocs.map((g) => {
      return {
        groupName: g.groupName,
        identity: g.identity,
      };
    });
    const committeeDocs = await CommitteeModel.find({
      username,
    });
    userInfo.committees = committeeDocs.map((g) => {
      return {
        groupName: g.groupName,
        identity: g.identity,
      };
    });

    const classDoc = await ClassModel.findOne({ username });
    if (classDoc) {
      const seedClass = (userInfo.seedClass = {});
      seedClass.className = classDoc.className;
      seedClass.identity = classDoc.identity;
    }
  } catch (error) {
    console.log(error);
  }
  return userInfo;
}
