const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClassSchema = new Schema({
  username: { type: String, unique: true },
  realname: { type: String },
  className: { type: String }, //种子班名称
  identity: { type: String }, //1.班长 2.普通成员
});
//获取种子班级名称列表
let classNameList = [];
ClassSchema.statics.getClassNameList = async function () {
  if (classNameList.length > 0) return classNameList;
  classNameList = await this.distinct("className");
  return classNameList;
};
const ClassModel = mongoose.model("seedClass", ClassSchema);
module.exports = ClassModel;
