const UserModel = require("../models/user");
const ScoreModel = require("../models/score");
const { requestyxAuth } = require("../utils/request");
module.exports = {
  //登出
  async logout(req, res, next) {
    req.session.destroy(function (err) {
      if (err) {
        next({
          status: 500,
          msg: "操作失败",
        });
      } else {
        res.send({
          code: 0,
          msg: "success",
        });
      }
    });
  },
  //登陆
  async login(req, res, next) {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.send({
        code: 1001,
        msg: "用户不存在",
      });
      return;
    }
    requestyxAuth(username, password)
      .then((authRes) => {
        if (authRes.statusCode === 200) {
          req.session.username = username; //存储session
          res.send({ code: 0, msg: "success" });
        } else {
          res.send({ code: 1002, msg: "密码错误" });
        }
      })
      .catch((err) => {
        console.log("Login Error", err);
        res.send({ code: 1003, msg: "登陆验证失败，请稍后再试" });
      });
  },
  //获取项目组、队委会、种子班信息
  async getPartInfo(req, res, next) {
    const partInfo = await UserModel.getPartInfo();
    res.send(partInfo);
  },
  //更新个人信息
  async updateProfile(req, res, next) {
    const { username, group, committee, seedClass } = req.body;
    const user = await UserModel.findOne({ username });
    user.group = group;
    user.committee = committee;
    user.seedClass = seedClass;
    await user.save((err) => {
      if (err) {
        next({
          status: 500,
          msg: "数据库错误",
        });
      } else {
        res.send({ msg: "success" });
      }
    });
  },
  //获取个人信息
  async getProfile(req, res, next) {
    const user = await UserModel.findOne({ username: req.session.username });
    const { username, realname, group, committee, seedClass } = user;
    res.send({ username, realname, group, committee, seedClass });
  },
  //获取需要评价的队员列表
  async getRateList(req, res, next) {
    const allUsers = await UserModel.find();
    const user = await UserModel.findOne({ username: req.session.username });
    const allScores = await ScoreModel.find({ from: user.username });
    const rateList = {
      group: {},
      committee: {},
      seedClass: {},
    };
    user.group.forEach((g) => {
      rateList.group[g] = [];
    });
    user.committee.forEach((c) => {
      rateList.committee[c] = [];
    });
    if (user.seedClass) rateList.seedClass[user.seedClass] = [];

    allUsers.forEach((u) => {
      if (u.username === user.username) return;
      let name = {
        username: u.username,
        realname: u.realname,
      };
      u.group.forEach((g) => {
        if (rateList.group.hasOwnProperty(g)) {
          rateList.group[g].push({ ...name, scores: [] });
        }
      });
      u.committee.forEach((c) => {
        if (rateList.committee.hasOwnProperty(c)) {
          rateList.committee[c].push({ ...name, scores: [] });
        }
      });
      if (rateList.seedClass.hasOwnProperty(u.seedClass)) {
        rateList.seedClass[u.seedClass].push({ ...name, scores: [] });
      }
    });

    allScores.forEach((s) => {
      const { part, partName, to, scores } = s;
      const detailArr = rateList[part][partName];
      for (let i = 0; i < detailArr.length; i++) {
        if (detailArr[i].username === to) {
          detailArr[i].scores = scores;
          break;
        }
      }
    });
    res.send(rateList);
  },
};
