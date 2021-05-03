const vscode = require('vscode')
const JsonBinIoApi = require("./jsonbin")

const jsonbinCommandKey = "itodo.jsonbinSecretKey"
const jsonbinIDKey = "itodo.jsonbinID"

const createMsg = msg=> `[itodo] ${ msg }`

const printNotEnv = ()=> vscode.window.showErrorMessage(createMsg(`未设置环境变量或未知错误`))

const getEnv = ()=> {
  const binkey = vscode.workspace.getConfiguration().get(jsonbinCommandKey)
  const id = vscode.workspace.getConfiguration().get(jsonbinIDKey)
  if (!binkey || binkey.length <= 1 || !id || id.length <= 1) {
    printNotEnv()
    return false
  }
  return [ binkey, id ]
}

/**
 * 合并数据
 */
const mergeData = (rawData, remoteData)=> {
  const result = remoteData
  rawData.forEach(item=> {
    const { id } = item
    let reIndex = null
    for (let index = 0; index < remoteData.length; index++) {
      const element = remoteData[index];
      if (element.id == id) {
        reIndex = index
        result[index] = item
        break
      }
    }
    if (reIndex == null) {
      result.unshift(item)
    }
  })
  return result
}

/**
 * 同步数据到本地
 */
const syncData2Local = async (db)=> {
  const env = getEnv()
  if (!env) return false
  const binkey = env[0], id = env[1]
  const jsonbin = new JsonBinIoApi(binkey)
  const data = await jsonbin.readBin({ id })
  if (data.hasOwnProperty("message")) {
    printNotEnv()
    return false
  }
  const output = mergeData(db.getAll(), data)
  db._write(output)
  vscode.window.showInformationMessage(createMsg(`同步到本地成功`))
  return true
}

/**
 * 同步数据到远程
 * TODO
 * [ 合并操作 ]
 */
const syncData2Remote = async (db)=> {
  const env = getEnv()
  if (!env) return false
  const binkey = env[0], id = env[1]
  const jsonbin = new JsonBinIoApi(binkey)
  const data = db.getAll()
  const res = await jsonbin.updateBin({
    data,
    id
  })
  if (res.hasOwnProperty("message")) {
    printNotEnv()
    return false
  }
  vscode.window.showInformationMessage(createMsg(`同步到远程成功`))
  return true;
}

module.exports = {
  syncData2Local,
  syncData2Remote
}