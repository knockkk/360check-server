const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CommitteeSchema = new Schema({
  username: { type: String },
  realname: { type: String },
  deptName: { type: String }, //部门名称
  groupName: { type: String }, //部门小组名称
  identity: { type: String }, //1.队长，2.部长，3.组长，4.组员
});
//获取队长信息
CommitteeSchema.statics.getCaptain = async function () {
  const doc = await this.findOne({ identity: "队长" });
  if (doc) {
    return {
      username: doc.username,
      realname: doc.realname,
    };
  }
  return {};
};
//获取队委会小组组长信息
CommitteeSchema.statics.getLeaders = async function () {
  const leaders = await this.find({ identity: "组长" });
  const result = {};
  leaders.forEach((l) => {
    result[l.groupName] = l.username;
  });
  return result;
};
const CommitteeModel = mongoose.model("committee", CommitteeSchema);
module.exports = CommitteeModel;
