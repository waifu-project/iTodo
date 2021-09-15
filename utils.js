const vscode = require("vscode")
const path = require("path")
const fs = require("fs")

/**
 * 获取某个扩展文件相对于webview需要的一种特殊路径格式
 * 形如：vscode-resource:/Users/toonces/projects/vscode-cat-coding/media/cat.gif
 * @param context 上下文
 * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
 */
const getExtensionFileVscodeResource = (context, relativePath) => {
  const diskPath = vscode.Uri.file(path.join(context.extensionPath, relativePath));
  return diskPath.with({ scheme: 'vscode-resource' }).toString();
}

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
    return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
  });
  return html;
}

/**
 * 生成UUID
 */
const uuid = (len = 12) => {
  var IDX = 36, HEX = '';
  while (IDX--) HEX += IDX.toString(36);
  var str = '', num = len || 11;
  while (num--) str += HEX[Math.random() * 36 | 0];
  return str;
}

/**
 * 生成空文件
 */
const writeEmptyFile = (filePath) => {
  if (fs.existsSync(filePath)) return true
  var data = '';
  fs.writeFileSync(filePath, data)
  return true;
}

/**
 * 人性化时间处理 传入时间戳
 * https://blog.csdn.net/qq_35875470/article/details/79832936
 */
const timeDiyFormat = (timestamp) => {
  var mistiming = Math.round(new Date() / 1000) - timestamp;
  var postfix = mistiming > 0 ? '前' : '后'
  mistiming = Math.abs(mistiming)
  var arrr = ['年', '个月', '星期', '天', '小时', '分钟', '秒'];
  var arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];

  for (var i = 0; i < 7; i++) {
    var inm = Math.floor(mistiming / arrn[i])
    if (inm != 0) {
      if (isNaN(inm)) return '刚刚'
      const _ = inm + arrr[i] + postfix
      return _
    }
  }
}

module.exports = {
  getExtensionFileVscodeResource,
  getWebViewContent,
  uuid,
  writeEmptyFile,
  timeDiyFormat,
}