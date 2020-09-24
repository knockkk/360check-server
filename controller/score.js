const ScoreModel = require("../models/score");
module.exports = {
  async updateScore(req, res, next) {
    const { from, to, part, partName, scores } = req.body;
    const model = new ScoreModel({ from, to, part, partName, scores });
    await model.save((err) => {
      err && console.log(err);
      res.send(400);
    });
    res.send(200);
  },
};
