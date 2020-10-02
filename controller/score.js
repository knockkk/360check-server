const ScoreModel = require("../models/score");
const UserModel = require("../models/user");
module.exports = {
  async updateScore(req, res, next) {
    const { username, part, partName, scores } = req.body;
    const from = req.session.username;
    const to = username;
    const fromUser = await UserModel.findOne({ username: from });
    const toUser = await UserModel.findOne({ username: to });
    if (!fromUser || !toUser) {
      next({
        status: 400,
        msg: "用户不存在",
      });
      return;
    }
    //参数校验
    const partInfo = await UserModel.getPartInfo();
    if (partInfo.hasOwnProperty(part) && partInfo[part].includes(partName)) {
      //检验分数值大小
      let isValid = true;
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] < 0 || scores[i] > 20) {
          isValid = false;
          break;
        }
      }
      if (isValid) {
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
