const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
const { deptToCommittees } = require("../config");
let partInfo = null;
const getPartInfo = async () => {
  if (partInfo !== null) return partInfo;
  const committee = await CommitteeModel.distinct("groupName", {
    groupName: { $nin: ["", ...Object.keys(deptToCommittees)] },
  });
  const group = await GroupModel.distinct("groupName");
  partInfo = { committee, group };
  return partInfo;
};

module.exports = getPartInfo;
