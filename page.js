const vscode = require("vscode")
const pug = require("pug")
const path = require("path")

const utils = require("./utils")

const render = (context, title = "iTodo", datas) => {
  const webviewDir = path.join(context.extensionPath, '.')

  const _title = vscode.workspace.getConfiguration().get(`itodo.bartext`)

  if (!!_title) title = _title

  const panel = vscode.window.createWebviewPanel(
    "",
    title,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(webviewDir)]
    }
  );

  const tpl = path.join(webviewDir, 'todo.pug')

  const mainStyle = utils.getExtensionFileVscodeResource(context, "main.css")
  const mainJS = utils.getExtensionFileVscodeResource(context, "webview.js")

  const html = pug.renderFile(tpl, {
    css: mainStyle,
    webviewjs: mainJS,
    datas,
  })

  panel.webview.html = html
  
  return panel
}

module.exports = render