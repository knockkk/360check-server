const UserModel = require("../models/user");
const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
const ClassModel = require("../models/seedClass");
const ScoreModel = require("../models/score");
const { requestyxAuth } = require("../utils/request");
const getParts = require("../utils/getPartInfo");
const { deptToCommittees } = require("../config");
module.exports = {
  //登出
  async logout(req, res, next) {
    req.session.destroy(function (err) {
      if (err) {
        next({
          status: 500,
          msg: "操作失败",
        });
      } else {
        res.send({
          code: 0,
          msg: "success",
        });
      }
    });
  },
  //登陆
  async login(req, res, next) {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.send({
        code: 1,
        msg: "用户不存在",
      });
      return;
    }
    req.session.username = username; //存储session
    res.send({ code: 0, msg: "success" });
    // requestyxAuth(username, password)
    //   .then((authRes) => {
    //     req.session.username = username; //存储session
    //     if (authRes.statusCode === 200) {
    //       req.session.username = username; //存储session
    //       res.send({ code: 0, msg: "success" });
    //     } else {
    //       res.send({ code: 1, msg: "密码错误" });
    //     }
    //   })
    //   .catch((err) => {
    //     res.send({ code: 1, msg: "登陆验证失败，请稍后再试" });
    //   });
  },
  //获取项目组、队委会、种子班信息
  async getPartInfo(req, res, next) {
    const partInfo = await getParts();
    res.send(partInfo);
  },
  //更新个人信息：只允许添加项目组或队委会
  async addGroupOrCommittee(req, res, next) {
    const username = req.session.username;
    const { group, committee } = req.body;
    const { realname } = await UserModel.findOne({ username });
    const partInfo = await getParts();

    let errMessage = "";
    if (group) {
      const groupDocs = await GroupModel.find({ username });
      if (groupDocs.length >= 2) {
        errMessage = "项目组不能超过两个";
      } else if (groupDocs[0] && groupDocs[0].groupName === group) {
        errMessage = "项目组已存在";
      } else if (!partInfo.group.includes(group)) {
        errMessage = "项目组不存在";
      }
    }
    let thisDeptName = "";
    if (!errMessage && committee) {
      const committeeDocs = await CommitteeModel.find({ username });
      if (committeeDocs.length >= 2) {
        errMessage = "队委会不能超过两个";
      } else if (committeeDocs[0] && committeeDocs[0].groupName === committee) {
        errMessage = "队委会信息已存在";
      } else if (!partInfo.committee.includes(committee)) {
        errMessage = "队委会不存在";
      } else {
        for (let deptName in deptToCommittees) {
          if (deptToCommittees[deptName].includes(committee)) {
            thisDeptName = deptName;
            break;
          }
        }
      }
    }

    if (errMessage) {
      res.send({ code: 1, msg: errMessage });
    } else {
      try {
        if (group) {
          const groupDoc = new GroupModel({
            username,
            realname,
            groupName: group,
            identity: "组员",
          });
          await groupDoc.save();
        }
        if (committee) {
          const committeeDoc = new CommitteeModel({
            username,
            realname,
            deptName: thisDeptName,
            groupName: committee,
            identity: "干事",
          });
          await committeeDoc.save();
        }
      } catch (err) {
        next({
          status: 500,
          msg: "数据库错误",
        });
      }
      res.send({ code: 0, msg: "success" });
    }
  },
  //获取个人信息
  async getProfile(req, res, next) {
    const username = req.session.username;
    const user = await UserModel.findOne({ username });
    const committees = await CommitteeModel.find({ username }, [
      "deptName",
      "groupName",
      "identity",
    ]);
    const groups = await GroupModel.find({ username }, [
      "groupName",
      "identity",
    ]);
    const seedClass = await ClassModel.findOne({ username }, [
      "className",
      "identity",
    ]);
    const { realname, teamNo, identity } = user;
    const result = {
      username,
      realname,
      teamNo,
      identity,
      committees,
      groups,
      seedClass,
    };
    res.send(result);
  },
  //获取需要评价的队员列表
  async getRateList(req, res, next) {
    const username = req.session.username;
    const rateList = {
      group: {},
      committee: {},
    };
    const thisGroups = await GroupModel.find({ username });
    for (let { groupName } of thisGroups) {
      const thisGroupUsers = await GroupModel.find({
        groupName,
        username: { $ne: username },
      });
      const list = (rateList.group[groupName] = []);
      for (let user of thisGroupUsers) {
        const doc = await ScoreModel.findOne({
          from: username,
          to: user.username,
          part: "group",
          partName: groupName,
        });
        list.push({
          username: user.username,
          realname: user.realname,
          scores: doc && doc.scores ? doc.scores : [],
        });
      }
    }

    const thisCommittees = await CommitteeModel.find({ username });
    let committeeGroups = [];
    if (thisCommittees.length > 0 && thisCommittees[0].identity === "部长") {
      const { deptName } = thisCommittees[0];
      committeeGroups = deptToCommittees[deptName];
    } else {
      committeeGroups = thisCommittees.map((c) => c.groupName);
    }
    for (let groupName of committeeGroups) {
      const thisGroupUsers = await CommitteeModel.find({
        groupName,
        username: { $ne: username },
      });
      const list = (rateList.committee[groupName] = []);
      for (let user of thisGroupUsers) {
        const doc = await ScoreModel.findOne({
          from: username,
          to: user.username,
          part: "committee",
          partName: groupName,
        });
        list.push({
          username: user.username,
          realname: user.realname,
          scores: doc && doc.scores ? doc.scores : [],
        });
      }
    }

    //种子班部分
    const doc = await ClassModel.findOne({ username });
    if (doc) {
      const { className } = doc;
      rateList.seedClass = {};
      const list = (rateList.seedClass[className] = []);
      const thisClassUsers = await ClassModel.find({
        className,
        username: { $ne: username },
      });
      for (let user of thisClassUsers) {
        const doc = await ScoreModel.findOne({
          from: username,
          to: user.username,
          part: "seedClass",
          partName: className,
        });
        list.push({
          username: user.username,
          realname: user.realname,
          scores: doc && doc.scores ? doc.scores : [],
        });
      }
    }
    res.send(rateList);
  },
};
