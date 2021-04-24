const utils = require("./utils")

const TaskEnumDone = 0 // 已完成

const TaskEnumUnDone = 1 // 未完成

const TaskEnumUnStart = 2 // 未开始

const NewItem = (title, desc)=> {
  const xcore = utils.uuid()
  return {
    id: xcore,
    create_at: new Date(),
    update_at: new Date(),
    title,
    desc,
    task_status: 2,
  }
}

module.exports = {
  NewItem,
  enum: {
    [TaskEnumDone]: "已完成",
    [TaskEnumUnDone]: "未完成",
    [TaskEnumUnStart]: "未开始",
  }
}