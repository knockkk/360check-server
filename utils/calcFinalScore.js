const ScoreModel = require("../models/score");
const UserModel = require("../models/user");
const PartModel = require("../models/part");
const ImpressionModel = require("../models/impression");
const { use } = require("../routes/score");
module.exports = calcFinalScore = async () => {
  const tutorList = await UserModel.getTutorList();
  const captain = await UserModel.getCaptain();
  const leaders = await PartModel.getLeaders();
  const groupLeaderNames = [];
  const committeeLeaderNames = [];
  const result = [];
  const allUsers = await UserModel.find();
  for (let i = 0; i < allUsers.length; i++) {
    let user = allUsers[i];
    const thisUsername = user.username;
    const finalScore = {
      username: user.username,
      realname: user.realname,
      isCaptain: false,
      isGroupLeader: false,
      isCommitteeLeader: false,
      groupNames: user.group,
      group: {
        a: 0,
        b: 0,
        c: 0,
      },
      committee: {
        a: 0,
        b: 0,
        c: 0,
      },
    };
    //一、计算项目组评分分数
    //1. 队长
    if (thisUsername === captain) {
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0;
      const impressions = await ImpressionModel.find({ to: thisUsername });
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (tutorList.includes(from)) {
          //导师impression
          sum_a += score * 0.8;
          count_a += 1;
        } else {
          //普通队员impression
          sum_b += score * 0.8;
          count_b += 1;
        }
      });
      //平均分
      finalScore.isCaptain = true;
      finalScore.group.a = count_a ? (sum_a / count_a).toFixed(2) : 0;
      finalScore.group.b = count_b ? (sum_b / count_b).toFixed(2) : 0;
    }
    //2. 项目组组长
    else if (groupLeaderNames.includes(thisUsername)) {
      const scores = await ScoreModel.find({ to: thisUsername, part: "group" });
      const impressions = await ImpressionModel.find({ to: thisUsername });
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0,
        sum_c = 0,
        count_c = 0;
      scores.forEach((record) => {
        //项目组组员score
        sum_a += getArrSum(record.scores);
        count_a += 1;
      });
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (from === captain) {
          //队长impression
          sum_b += score * 0.8;
          count_b += 1;
        } else {
          //导师impression
          sum_c += score * 0.8;
          count_c += 1;
        }
      });
      finalScore.isGroupLeader = true;
      finalScore.group.a = count_a ? (sum_a / count_a).toFixed(2) : 0;
      finalScore.group.b = count_b ? (sum_b / count_b).toFixed(2) : 0;
      finalScore.group.c = count_c ? (sum_c / count_c).toFixed(2) : 0;
    }
    //3. 普通项目组组员
    else {
      const scores = await ScoreModel.find({ to: thisUsername, part: "group" });
      const impressions = await ImpressionModel.find({ to: thisUsername });
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0,
        sum_c = 0,
        count_c = 0;
      scores.forEach((record) => {
        const { from, scores } = record;
        if (groupLeaderNames.includes(from)) {
          //项目组组长score
          sum_b += getArrSum(scores);
          count_b += 1;
        } else {
          //其他项目组组员score
          sum_a += getArrSum(scores);
          count_a += 1;
        }
      });
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (from === captain) {
          //队长impression
          sum_c += score * 0.8;
          count_c += 1;
        }
      });
      finalScore.group.a = count_a ? (sum_a / count_a).toFixed(2) : 0;
      finalScore.group.b = count_b ? (sum_b / count_b).toFixed(2) : 0;
      finalScore.group.c = count_c ? (sum_c / count_c).toFixed(2) : 0;
    }

    //二、计算队委会评分分数
    //1. 队长
    if (thisUsername === captain) {
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0;
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (tutorList.includes(from)) {
          //导师impression
          sum_a += score * 0.2;
          count_a += 1;
        } else if (committeeLeaderNames.includes(from)) {
          //队委会组长impression
          sum_b += score * 0.2;
          count_b += 1;
        }
      });
      //平均分
      finalScore.isCaptain = true;
      finalScore.committee.a = count_a ? (sum_a / count_a).toFixed(2) : 0;
      finalScore.committee.b = count_b ? (sum_b / count_b).toFixed(2) : 0;
    }
    //2. 队委会组长
    else if (committeeLeaderNames.includes(thisUsername)) {
      const scores = await ScoreModel.find({
        to: thisUsername,
        part: "committee",
      });
      const impressions = await ImpressionModel.find({ to: thisUsername });
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0,
        sum_c = 0,
        count_c = 0;
      scores.forEach((record) => {
        //队委会组员score
        sum_a += getArrSum(record.scores);
        count_a += 1;
      });
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (from === captain) {
          //队长impression
          sum_b += score * 0.2;
          count_b += 1;
        } else {
          //导师impression
          sum_c += score * 0.2;
          count_c += 1;
        }
      });
      finalScore.isGroupLeader = true;
      finalScore.committee.a = count_a ? (sum_a / count_a).toFixed(2) : 0;
      finalScore.committee.b = count_b ? (sum_b / count_b).toFixed(2) : 0;
      finalScore.committee.c = count_c ? (sum_c / count_c).toFixed(2) : 0;
    }
    //3. 普通队委会组员
    else {
      const scores = await ScoreModel.find({
        to: thisUsername,
        part: "committee",
      });
      const impressions = await ImpressionModel.find({ to: thisUsername });
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0,
        sum_c = 0,
        count_c = 0;
      scores.forEach((record) => {
        const { from, scores } = record;
        if (committeeLeaderNames.includes(from)) {
          //队委会组长score
          sum_b += getArrSum(scores);
          count_b += 1;
        } else {
          //其他队委会组员score
          sum_a += getArrSum(scores);
          count_a += 1;
        }
      });
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (from === captain) {
          //队长impression
          sum_c += score * 0.2;
          count_c += 1;
        }
      });
      finalScore.committee.a = count_a ? (sum_a / count_a).toFixed(2) : 0;
      finalScore.committee.b = count_b ? (sum_b / count_b).toFixed(2) : 0;
      finalScore.committee.c = count_c ? (sum_c / count_c).toFixed(2) : 0;
    }
    result.push(finalScore);
  }

  const finalScoreList = result.map((record) => {
    const {
      realname,
      isCaptain,
      isGroupLeader,
      isCommitteeLeader,
      group,
      committee,
      groupNames,
    } = record;
    let groupScore, committeeScore;
    if (isCaptain) {
      groupScore = (group.a * 0.3 + group.b * 0.7).toFixed(2);
    } else if (isGroupLeader) {
      if (group.c) {
        //存在导师评价
        groupScore = parseFloat(
          (group.a * 0.3 + group.b * 0.3 + group.c * 0.4).toFixed(2)
        );
      } else {
        groupScore = parseFloat((group.a * 0.7 + group.b * 0.3).toFixed(2));
      }
    } else {
      groupScore = parseFloat(
        (group.a * 0.3 + group.b * 0.4 + group.c * 0.3).toFixed(2)
      );
    }

    if (isCaptain) {
      committeeScore = parseFloat(
        (committee.a * 0.3 + committee.b * 0.7).toFixed(2)
      );
    } else if (isCommitteeLeader) {
      committeeScore = parseFloat(
        (committee.a * 0.3 + committee.b * 0.3 + committee.c * 0.4).toFixed(2)
      );
    } else {
      committeeScore = parseFloat(
        (committee.a * 0.3 + committee.b * 0.4 + committee.c * 0.3).toFixed(2)
      );
    }
    return { realname, groupScore, committeeScore, groups: groupNames };
  });
  return finalScoreList;
};
function getArrSum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}
