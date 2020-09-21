const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    username: { type: String, unique: true },
    realname: { type: String },
    identity: { type: Number }, //身份：导师、队长、项目组组长、队委会部长、组员等
    //项目组
    group: [
      {
        name: { type: String },
        scoreList: [
          {
            from: { type: String },
            scores: [Number],
          },
        ],
      },
    ],
    //队委会
    committee: [
      {
        name: { type: String },
        scoreList: [
          {
            from: { type: String },
            scores: [Number],
          },
        ],
      },
    ],
    //种子班
    seedClass: {
      name: { type: String },
      scoreList: [
        {
          from: { type: String },
          scores: [Number],
        },
      ],
    },
    impression: [
      {
        from: String,
        identity: String,
        score: Number,
      },
    ],
  },
  { usePushEach: true }
);
const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
