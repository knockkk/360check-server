const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: { type: String, unique: true },
  realname: { type: String },
  teamNo: { type: Number }, //团队编号(预备队员编号为0)
  identity: { type: String }, //1. 导师 2. 队员
});
//获取导师列表
let tutorList = [];
UserSchema.statics.getTutorList = async function () {
  if (tutorList.length > 0) return tutorList;
  try {
    const tutors = await this.find({ identity: "导师" });
    tutors.forEach((t) => {
      tutorList.push(t.username);
    });
  } catch (error) {
    console.log(error);
  }
  return tutorList;
};
const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
