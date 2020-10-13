const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    realname: { type: String, required: true },
    identity: { type: Number },
    //1. 导师
    //2. 队长
    //3. 其他

    //项目组
    group: {
      type: [String],
    },
    //队委会
    committee: {
      type: [String],
    },
    //种子班
    seedClass: { type: String },
  },
  { usePushEach: true }
);
//添加获取部门信息的静态方法
//可以改为从part表中获取
let partInfo = null;
UserSchema.statics.getPartInfo = async function () {
  if (partInfo) return partInfo; //因为第一次录入后就不会改变，所以只需要创建一次
  const group = new Set();
  const committee = new Set();
  const seedClass = new Set();
  const users = await this.find();
  users.forEach((u) => {
    u.group &&
      u.group.forEach((g) => {
        group.add(g);
      });
    u.committee &&
      u.committee.forEach((c) => {
        committee.add(c);
      });
    u.seedClass && seedClass.add(u.seedClass);
  });
  partInfo = {
    group: Array.from(group),
    committee: Array.from(committee),
    seedClass: Array.from(seedClass),
  };
  return partInfo;
};

//获取导师列表
let tutorList = [];
UserSchema.statics.getTutorList = async function () {
  if (tutorList.length > 0) return tutorList;
  //...
  tutorList.push("dian");
  return tutorList;
};
//获取队长信息
let captain = null;
UserSchema.statics.getCaptain = async function () {
  if (captain) return captain;
  //...
  captain = {
    username: "ZhiXiaoYu",
    realname: "彭宇",
  };
  return captain;
};

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
