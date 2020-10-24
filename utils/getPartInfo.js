const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
const { deptToCommittees } = require("../config");
let partInfo = null;
const getPartInfo = async () => {
  if (partInfo !== null) return partInfo;
  try {
    const committee = await CommitteeModel.distinct("groupName", {
      groupName: { $nin: ["", ...Object.keys(deptToCommittees)] },
    });
    const group = await GroupModel.distinct("groupName");
    partInfo = { committee, group };
  } catch (error) {
    console.log(error);
  }
  return partInfo;
};

module.exports = getPartInfo;
