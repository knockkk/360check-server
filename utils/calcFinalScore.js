const ScoreModel = require("../models/score");
const ImpressionModel = require("../models/impression");
const UserModel = require("../models/user");
const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
module.exports = calcFinalScore = async () => {
  const tutorList = await UserModel.getTutorList();
  const captain = await CommitteeModel.getCaptain();
  const committeeLeader = await CommitteeModel.getLeaders();
  const groupLeader = await GroupModel.getLeaders();

  const result = [];
  const allUsers = await UserModel.find({ identity: "在站" });
  for (let user of allUsers) {
    const thisUsername = user.username;
    let g_final_score = 0;
    let c_final_score = 0;
    //1. 队长
    if (thisUsername === captain.username) {
      let sum_a = 0,
        count_a = 0,
        sum_b = 0,
        count_b = 0,
        sum_c = 0,
        count_c = 0;
      const impressions = await ImpressionModel.find({ to: thisUsername });
      const leaderToCommittee = Object.keys(committeeLeader).reduce(
        (prev, groupName) => {
          let leaderName = committeeLeader[groupName];
          prev[leaderName] = groupName;
          return prev;
        },
        {}
      );
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (tutorList.includes(from)) {
          //导师impression
          sum_a += score;
          count_a += 1;
        } else {
          //队员impression
          sum_b += score;
          count_b += 1;

          //队委会组长 impression
          if (leaderToCommittee[from]) {
            sum_c += score;
            count_c += 1;
          }
        }
      });
      //项目组
      const g_a = count_a ? 0.8 * (sum_a / count_a) : 0;
      const g_b = count_b ? 0.8 * (sum_b / count_b) : 0;
      g_final_score = calAverageScore(g_b, 0.7, g_a, 0.3, 0, 0);
      //队委会
      const c_a = count_a ? 0.2 * (sum_a / count_a) : 0;
      const c_b = count_c ? 0.2 * (sum_c / count_c) : 0;
      c_final_score = calAverageScore(c_b, 0.7, c_a, 0.3, 0, 0);
    } else {
      const impressions = await ImpressionModel.find({ to: thisUsername });
      let imp_tutor_sum = 0,
        imp_tutor_count = 0,
        imp_captain_sum = 0,
        imp_captain_count = 0,
        imp_member_sum = 0,
        imp_member_count = 0;
      impressions.forEach((imp) => {
        const { from, score } = imp;
        if (from === captain.username) {
          //队长impression
          imp_captain_sum += score;
          imp_captain_count += 1;
        } else if (tutorList.includes(from)) {
          //导师impression
          imp_tutor_sum += score;
          imp_tutor_count += 1;
        } else {
          //队员impression
          imp_member_sum += score;
          imp_member_count += 1;
        }
      });
      const imp_tutor = imp_tutor_count ? imp_tutor_sum / imp_tutor_count : 0;
      const imp_captain = imp_captain_count
        ? imp_captain_sum / imp_captain_count
        : 0;
      const imp_member = imp_member_count
        ? imp_member_sum / imp_member_count
        : 0;

      //项目组
      const thisUserGroups = await GroupModel.find({ username: thisUsername });
      let g_score_sum = 0;
      for (let { groupName, identity } of thisUserGroups) {
        const scores = await ScoreModel.find({
          to: thisUsername,
          part: "group",
          partName: groupName,
        });
        if (identity === "组长") {
          let sum_a = 0,
            count_a = 0;
          scores.forEach((record) => {
            //项目组组员score
            sum_a += getArrSum(record.scores);
            count_a += 1;
          });
          const g_a = count_a ? sum_a / count_a : 0;
          const g_b = 0.8 * imp_captain;
          const g_c = 0.8 * imp_tutor;
          g_score_sum += calAverageScore(g_a, 0.3, g_b, 0.3, g_c, 0.4);
        } else {
          let sum_a = 0,
            count_a = 0,
            sum_b = 0,
            count_b = 0;
          scores.forEach((record) => {
            const { from, scores } = record;
            if (groupLeader[groupName] === from) {
              //项目组组长score
              sum_b += getArrSum(scores);
              count_b += 1;
            } else {
              //项目组组员score
              sum_a += getArrSum(scores);
              count_a += 1;
            }
          });
          const g_a = count_a ? sum_a / count_a : 0;
          const g_b = count_b ? sum_b / count_b : 0;
          const g_c = 0.8 * imp_captain;
          g_score_sum += calAverageScore(g_a, 0.3, g_b, 0.4, g_c, 0.3);
        }
      }
      g_final_score = parseFloat(
        (g_score_sum / thisUserGroups.length).toFixed(2)
      );

      //队委会
      const thisUserCommittees = await CommitteeModel.find({
        username: thisUsername,
      });
      if (thisUserCommittees[0].identity === "部长") {
        const c_a = 0.2 * imp_member;
        const c_b = 0.2 * imp_captain;
        const c_c = 0.2 * imp_tutor;
        c_final_score += calAverageScore(c_a, 0.3, c_b, 0.3, c_c, 0.4);
      } else {
        let c_score_sum = 0;
        for (let { groupName, identity } of thisUserCommittees) {
          const scores = await ScoreModel.find({
            to: thisUsername,
            part: "committee",
            partName: groupName,
          });

          if (identity === "组长") {
            let sum_a = 0,
              count_a = 0;
            scores.forEach((record) => {
              //队委会组员score
              sum_a += getArrSum(record.scores);
              count_a += 1;
            });
            const c_a = count_a ? sum_a / count_a : 0;
            const c_b = 0.2 * imp_captain;
            const c_c = 0.2 * imp_tutor;
            c_score_sum += calAverageScore(c_a, 0.3, c_b, 0.3, c_c, 0.4);
          } else {
            let sum_a = 0,
              count_a = 0,
              sum_b = 0,
              count_b = 0;
            scores.forEach((record) => {
              const { from, scores } = record;
              if (committeeLeader[groupName] === from) {
                //队委会组长score
                sum_b += getArrSum(scores);
                count_b += 1;
              } else {
                //队委会组员score
                sum_a += getArrSum(scores);
                count_a += 1;
              }
            });
            const c_a = count_a ? sum_a / count_a : 0;
            const c_b = count_b ? sum_b / count_b : 0;
            const c_c = 0.2 * imp_captain;
            c_score_sum += calAverageScore(c_a, 0.3, c_b, 0.4, c_c, 0.3);
          }
        }
        c_final_score = parseFloat(
          (c_score_sum / thisUserCommittees.length).toFixed(2)
        );
      }
    }

    const groups = await GroupModel.distinct("groupName", {
      username: thisUsername,
    });
    const thisUserFinalScore = {
      realname: user.realname,
      groups, //项目组
      groupScore: g_final_score, //项目组最终得分
      committeeScore: c_final_score, //队委会最终得分
    };
    result.push(thisUserFinalScore);
  }
  return result;
};
function getArrSum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

//计算平均分
//防止缺失某部分分数时的分数异常
function calAverageScore(
  part1_score,
  part1_ratio,
  part2_score,
  part2_ratio,
  part3_score,
  part3_ratio
) {
  if (part2_score == 0) {
    part1_ratio += part2_ratio;
    part2_ratio = 0;
  }
  if (part3_score == 0) {
    part1_ratio += part3_ratio;
    part3_ratio = 0;
  }
  return parseFloat(
    (
      part1_score * part1_ratio +
      part2_score * part2_ratio +
      part3_score * part3_ratio
    ).toFixed(2)
  );
}
