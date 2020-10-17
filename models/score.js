const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ScoreSchema = new Schema({
  from: { type: String },
  to: { type: String },
  part: {
    type: String,
    enum: ["group", "committee", "seedClass"],
  },
  partName: { type: String },
  scores: { type: [Number] },
});
const ScoreModel = mongoose.model("score", ScoreSchema);
module.exports = ScoreModel;
