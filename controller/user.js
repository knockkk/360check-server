const UserModel = require("../models/user");
const ScoreModel = require("../models/score");
module.exports = {
  //获取评分列表
  async getRateList(req, res, next) {
    const allUsers = await UserModel.find();
    const user = await UserModel.findOne({ username: req.query.username });
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
