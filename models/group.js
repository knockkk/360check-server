const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const GroupSchema = new Schema({
  username: { type: String },
  realname: { type: String },
  groupName: { type: String }, //项目组名称
  identity: { type: String }, //1.组长 2.组员
});
//获取项目组组长信息
GroupSchema.statics.getLeaders = async function () {
  const result = {};
  try {
    const leaders = await this.find({ identity: "组长" });
    leaders.forEach((l) => {
      result[l.groupName] = l.username;
    });
  } catch (error) {
    console.log(error);
  }
  return result;
};
const GroupModel = mongoose.model("group", GroupSchema);
module.exports = GroupModel;
