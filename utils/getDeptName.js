//获取队委会小组的部门信息，如web组 -> 技术部
const { committee } = require("../config");
module.exports = (groupName) => {
  for (let dept in committee) {
    if (committee[dept].includes(groupName)) {
      return dept;
    }
  }
};
