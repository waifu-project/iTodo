const jsondb = require("./jsondb")
const utils = require("./utils")

const ief = require("./interface")

// 任务简介
// 任务详情(markdown)
// 任务开始时间
// 任务目前状态
// - 已完成
// - 未开始
// - 已开始
class database {

  _rawjsonfile

  _db

  _once_key = "todoData"

  constructor(filepath) {
    this._rawjsonfile = filepath
    utils.writeEmptyFile(filepath)
    this._db = new jsondb(filepath)
  }

  _write(value, key = this._once_key) {
    const str = JSON.stringify(value)
    this._db.set(key, str)
  }

  /**
   * 获取所有任务
   */
  getAll() {
    const rawData = this._db.get(this._once_key)
    if (!rawData) return []
    try {
      return JSON.parse(rawData) 
    } catch (error) {
      console.error(error)
      return []
    }
  }

  /**
   * 获取特定状态任务
   */
  getStatusTask(status) {
    const data = this.getAll()
    return data.filter(item=> (item.task_status == status))
  }

  /**
   * 通过`id`获取任务
   */
  getTaskByID(id) {
    const data = this.getAll()
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.id == id) {
        return element
      }
    }
  }

  /**
   * 增加
   */
  add(title, desc) {
    const data = ief.NewItem(title, desc)
    const list = this.getAll()
    list.unshift(data)
    this._write(list)
    return data.id
  }

  /**
   * 通过ID删除
   */
  removeOnce(id) {
    let f = false
    const data = this.getAll()
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.id == id) {
        data.splice(index, 1)
        f = true
        break
      }
    }
    this._write(data)
    return f
  }

  updateStatusByID(id, status) {
    const data = this.getAll()
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.id == id) {
        data[index]['task_status'] = status
        this._write(data)
        return true
      }
    }
    return false
  }

}

module.exports = database