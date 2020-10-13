const ScoreModel = require("../models/score");
const UserModel = require("../models/user");
const checkScore = require("../utils/checkScore");
const calcFinalScore = require("../utils/calcFinalScore");
const { rules } = require("../config");
const user = require("./user");
module.exports = {
  async getSeedScore(req, res, next) {
    const result = {};
    const classNames = ["17级"];
    for (let className of classNames) {
      result[className] = [];
      const users = await UserModel.find({ seedClass: className });
      for (let user of users) {
        let thisUserScores = [];
        const records = await ScoreModel.find({
          part: "seedClass",
          partName: className,
          to: user.username,
        });
        console.log("scores", records);

        if (records.length > 0) {
          let scoreSum = records.reduce((prev, curr) => {
            let scores = curr.scores;
            let sum = [];
            for (let i = 0; i < scores.length; i++) {
              sum[i] = prev[i] === undefined ? scores[i] : scores[i] + prev[i];
            }
            return sum;
          }, []);
          thisUserScores = scoreSum.map((sum) =>
            parseFloat((sum / records.length).toFixed(2))
          );
          console.log("sum", thisUserScores);
        }
        result[className].push({
          realname: user.realname,
          scores: thisUserScores,
        });
      }
    }

    res.send(result);
  },
  async getStars(req, res, next) {
    const records = await calcFinalScore();
    records.sort((a, b) => {
      return (
        b.groupScore + b.committeeScore - (a.groupScore + a.committeeScore)
      );
    });
    const result = records.slice(0, 5).map((r) => {
      const { realname, groupScore, committeeScore } = r;
      return {
        realname,
        groupScore,
        committeeScore,
      };
    });
    res.send(result);
  },
  async getFinalScore(req, res, next) {
    const result = await calcFinalScore();
    res.send(result);
  },
  //项目组分数详情
  async getGroupScore(req, res, next) {
    const username = req.session.username;
    const records = await ScoreModel.find({ part: "group" });
    const allUsers = await UserModel.find();
    const nameMap = allUsers.reduce((prev, curr) => {
      prev[curr.username] = curr.realname;
      return prev;
    }, {});

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
          high.names = [nameMap[to]];
        } else if (score === high.score) {
          high.names.push(nameMap[to]);
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
