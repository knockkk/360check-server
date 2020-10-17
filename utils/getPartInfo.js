const CommitteeModel = require("../models/committee");
const GroupModel = require("../models/group");
const ClassModel = require("../models/seedClass");
let partInfo = null;
const getPartInfo = async () => {
  if (partInfo !== null) return partInfo;
  const committee = await CommitteeModel.distinct("groupName", {
    groupName: { $ne: "" },
  });
  const group = await GroupModel.distinct("groupName");
  const seedClass = await ClassModel.distinct("className");
  partInfo = { committee, group, seedClass };
  return partInfo;
};

module.exports = getPartInfo;
