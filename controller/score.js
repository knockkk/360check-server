const ScoreModel = require("../models/score");
const UserModel = require("../models/user");
const ClassModel = require("../models/seedClass");
const checkScore = require("../utils/checkScore");
const calcFinalScore = require("../utils/calcFinalScore");
const getPartInfo = require("../utils/getPartInfo");
const { rules } = require("../config");
module.exports = {
  async getSeedScore(req, res, next) {
    const result = {};
    const classNameList = await ClassModel.getClassNameList();
    for (let className of classNameList) {
      result[className] = [];
      const users = await ClassModel.find({ className });
      for (let user of users) {
        const records = await ScoreModel.find({
          part: "seedClass",
          partName: className,
          to: user.username,
        });
        let thisUserScores = [];
        if (records.length > 0) {
          thisUserScores = records
            .reduce((prev, curr) => {
              const { scores } = curr;
              const sum = [];
              for (let i = 0; i < scores.length; i++) {
                sum[i] =
                  prev[i] === undefined ? scores[i] : scores[i] + prev[i];
              }
              return sum;
            }, [])
            .map((sum) => parseFloat((sum / records.length).toFixed(2)));
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
    const thisUsername = req.session.username;
    const allUsers = await UserModel.find();
    const userAverageScore = [];
    for (let i = 0; i < allUsers.length; i++) {
      const { username, realname } = allUsers[i];
      const records = await ScoreModel.find({
        part: "group",
        to: username,
      });
      const averageScore = records
        .reduce((prev, record) => {
          const curr = [];
          const { scores } = record;
          scores.forEach((score, index) => {
            curr[index] =
              prev[index] === undefined ? score : prev[index] + score;
          });
          return curr;
        }, [])
        .map((sum) => parseFloat((sum / records.length).toFixed(2)));
      userAverageScore.push({
        username,
        realname,
        averageScore,
      });
    }
    let results = rules.group.map((item) => {
      return {
        question: item.subtitle,
        high: {
          score: -1,
          names: [],
        },
        total: 0,
        myScore: 0,
      };
    });
    userAverageScore.forEach((record) => {
      const { username, realname, averageScore } = record;
      for (let i = 0; i < averageScore.length; i++) {
        const score = averageScore[i];
        const { high } = results[i];
        if (score > high.score) {
          high.score = score;
          high.names = [realname];
        } else if (score === high.score) {
          high.names.push(realname);
        }
        if (username === thisUsername) {
          results[i].myScore = score;
        }
        results[i].total += score;
      }
    });
    results = results.map((item) => {
      return {
        question: item.question,
        high: item.high,
        average: parseFloat((item.total / userAverageScore.length).toFixed(2)),
        myScore: item.myScore,
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
    const partInfo = await getPartInfo();
    if (partInfo.hasOwnProperty(part) && partInfo[part].includes(partName)) {
      if (checkScore(part, scores)) {
        try {
          await ScoreModel.findOneAndUpdate(
            { from, to, part, partName },
            { scores },
            { upsert: true }
          );
          res.send({ code: 0, msg: "success" });
        } catch (error) {
          next({
            status: 500,
            msg: "数据库错误",
          });
        }
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
