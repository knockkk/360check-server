const UserModel = require("../models/users");
module.exports = {
  async getAll(req, res, next) {
    try {
      const result = await UserModel.find({});
      res.send(result);
    } catch (err) {
      console.log("获取学生信息失败...");
      res.send({
        status: 0,
        type: "ERROR_DATA",
        message: "获取学生信息失败",
      });
    }
  },
};
