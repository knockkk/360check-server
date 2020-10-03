const { rules } = require("../config");
const checkScore = (part, scores) => {
  //对scores的长度以及每项score的大小进行验证
  const max = rules[part].map((item) => item.options[0].score);
  if (scores.length !== max.length) return false;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > max[i]) return false;
  }
  return true;
};
module.exports = checkScore;
