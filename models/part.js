const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PartSchema = new Schema(
  {
    part: {
      type: String,
      enum: ["group", "committee", "seedClass"],
    },
    partName: { type: String, unique: true },
    leader: {
      username: { type: String },
      realname: { type: String },
    },
  },
  { usePushEach: true }
);

//获取各项目组及队委会组长信息
let leaders = [];
PartSchema.statics.getLeaders = async function () {
  if (leaders.length > 0) return leaders;
  //...
  leaders.push({
    username: "zdw",
    realname: "曾德巍",
    group: "鹰眼组",
    committee: "Web组",
  });
  return leaders;
};
const PartModel = mongoose.model("part", PartSchema);
module.exports = PartModel;
