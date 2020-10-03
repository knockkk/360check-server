const ScoreModel = require("../models/score");
const UserModel = require("../models/user");
const checkScore = require("../utils/checkScore");
const { rules } = require("../config");
module.exports = {
  //项目组分数详情
  async getGroupScore(req, res, next) {
    const username = req.session.username;
    const records = await ScoreModel.find({ part: "group" });
    if (records.length === 0) {
      res.send([]);
      return;
    }
    let results = rules["group"].map((item) => {
      return {
        question: item.subtitle,
        high: {
          score: -1,
          names: [],
        },
        total: 0,
        myScore: {
          total: 0,
          count: 0,
        },
      };
    });
    records.forEach((record) => {
      let { to, scores } = record;
      for (let i = 0; i < scores.length; i++) {
        let { high, myScore } = results[i];
        let score = scores[i];
        if (scores[i] > high.score) {
          high.score = score;
          high.names = [to];
        } else if (score === high.score) {
          high.names.push(to);
        }

        if (to === username) {
          myScore.total += score;
          myScore.count++;
        }
        results[i].total += score;
      }
    });
    results = results.map((item) => {
      return {
        question: item.question,
        high: item.high,
        average: (item.total / records.length).toFixed(2),
        myScore: (item.myScore.total / item.myScore.count).toFixed(2),
      };
    });
    res.send(results);
  },
  async updateScore(req, res, next) {
    const { username, part, partName, scores } = req.body;
    const from = req.session.username;
    const to = username;
    const toUser = await UserModel.findOne({ username: to });
    if (!toUser) {
      next({
        status: 400,
        msg: "用户不存在",
      });
      return;
    }
    //参数校验
    const partInfo = await UserModel.getPartInfo();
    if (partInfo.hasOwnProperty(part) && partInfo[part].includes(partName)) {
      if (checkScore(part, scores)) {
        let record = await ScoreModel.findOne({ from, to, part, partName });
        if (record) {
          record.scores = scores;
        } else {
          record = new ScoreModel({ from, to, part, partName, scores });
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
      } else {
        next({
          status: 400,
          msg: "scores参数无效",
        });
      }
    } else {
      next({
        status: 400,
        msg: "part或partName参数无效",
      });
    }
  },
};
