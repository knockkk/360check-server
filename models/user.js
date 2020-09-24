const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    realname: { type: String, required: true },
    identity: { type: Number }, //身份：导师、队长、项目组组长、队委会部长、组员等
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
const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
