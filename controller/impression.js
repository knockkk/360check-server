const UserModel = require("../models/user");
const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
const ClassModel = require("../models/seedClass");
const ImpressionModel = require("../models/impression");
const user = require("./user");
const PartModel = "";
module.exports = {
  //获取导师impression评价列表（只针对导师），返回各项目组和队委会干部信息
  async getImpressionForTutor(req, res, next) {
    const username = req.session.username;
    //鉴别导师身份...
    const thisUser = await UserModel.find({ username });
    if (thisUser.identity !== 1) {
      next({
        status: 401,
        msg: "无权限",
      });
      return;
    }
    const impressions = await ImpressionModel.find({ from: username });
    const impressionMap = {}; //还是直接查数据库?
    impressions.forEach((imp) => {
      impressionMap[imp.to] = imp.score;
    });
    //获取所有队员名单
    const leaders = await PartModel.getLeaders();
    const result = leaders.map((leader) => {
      return Object.assign(leader, {
        score: impressionMap[leader.username] || 0,
      });
    });
    res.send(result);
  },
  //获取队长的impression评价列表（只针对队长）
  async getImpressionForCaptain(req, res, next) {
    const username = req.session.username;
    //鉴别队长身份...
    const captain = await CommitteeModel.getCaptain();
    if (username !== captain.username) {
      next({
        status: 401,
        msg: "无权限",
      });
      return;
    }
    //获取所有队员名单
    const result = [];
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
    res.send(result);
  },
  //获取对队长的impression（针对所有队员及导师）
  async getImpressionToCaptain(req, res, next) {
    const captain = await CommitteeModel.getCaptain();
    const captainInfo = await getUserInfo({ username: captain.username });
    const impressionDoc = await ImpressionModel.findOne({
      from: req.session.username,
      to: captain.username,
    });
    const impression = impressionDoc ? impressionDoc.score : 0;
    res.send(Object.assign(captainInfo, { impression }));
  },
  async updateImpression(req, res, next) {
    const from = req.session.username;
    const { score, username } = req.body;
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
    await record.save((err) => {
      if (err) {
        next({
          status: 500,
          msg: "数据库错误",
        });
      } else {
        res.send({ code: 0, msg: "success" });
      }
    });
  },
};

async function getUserInfo(thisUser) {
  const userInfo = {};
  const { username } = thisUser;
  if (!thisUser.realname) {
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

  const captain = await CommitteeModel.getCaptain();
  if (username !== captain.username) {
    const committeeDocs = await CommitteeModel.find({
      username,
    });
    userInfo.committees = committeeDocs.map((g) => {
      return {
        groupName: g.groupName,
        identity: g.identity,
      };
    });
  }

  const classDoc = await ClassModel.findOne({ username });
  if (classDoc) {
    const seedClass = (userInfo.seedClass = {});
    seedClass.className = classDoc.className;
    seedClass.identity = classDoc.identity;
  }

  return userInfo;
}
