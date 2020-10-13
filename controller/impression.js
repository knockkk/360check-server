const ImpressionModel = require("../models/impression");
const UserModel = require("../models/user");
const PartModel = require("../models/part");
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
    const thisUser = await UserModel.find({ username });
    if (thisUser.identity !== 2) {
      next({
        status: 401,
        msg: "无权限",
      });
      return;
    }
    const impressions = await ImpressionModel.find({ from: username });
    const impressionMap = {};
    impressions.forEach((imp) => {
      impressionMap[imp.to] = imp.score;
    });
    //获取所有队员名单
    const allUsers = await UserModel.find();
    const result = [];
    allUsers.forEach((user) => {
      if (user.identity > 2) {
        let { username, realname, group, committee, seedClass } = user;
        let score = impressionMap[username] || 0;
        result.push({
          username,
          realname,
          group,
          committee,
          seedClass,
          score,
        });
      }
    });
    res.send(result);
  },
  //获取对队长的impression（针对所有队员）
  async getImpressionToCaptain(req, res, next) {
    const captain = await UserModel.getCaptain();
    const from = req.session.username;
    const to = captain.username;
    let score = 0;
    const record = await ImpressionModel.findOne({ from, to });
    if (record) {
      score = record.score;
    }
    res.send(Object.assign(captain, { score }));
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
    if (!score || score <= 0 || score > 100) {
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
