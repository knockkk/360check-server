const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ImpressionSchema = new Schema(
  {
    from: { type: String },
    to: { type: String },
    score: { type: Number },
  },
  { usePushEach: true }
);
const ImpressionModel = mongoose.model("impression", ImpressionSchema);
module.exports = ImpressionModel;
