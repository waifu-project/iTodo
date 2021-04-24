const vscode = require('vscode');
const path = require("path")

const database = require("./database")
const page = require("./page")

const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)

const title = "iTodo"

function activate(context) {

	const dbFile = path.join(context.extensionPath, "./db.json")
	const db = new database(dbFile)
	
	statusBar.text = title
	statusBar.show()

	statusBar.command = "itodo.showTodoUI"

	let panel = null

	let disposable = vscode.commands.registerCommand('itodo.showTodoUI', function () {

		if (panel != null) return

		panel = page(context, title, db.getAll())

		panel.onDidDispose(()=> {
			panel = null
		})
		
		panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'del':
					const text = message.text
					db.removeOnce(text)
					reload()
					break
				case 'add':
					const c = JSON.parse(message.text)
					const { t, a } = c 
					db.add(t, a)
					reload()
					break
				case "update":
					const e = JSON.parse(message.text)
					const { id, status } = e
					db.updateStatusByID(id, status)
					reload()
					break
			}
		}, undefined, context.subscriptions);
	
		const reload = ()=> {
			const a = db.getAll()
			const b = JSON.stringify(a)
			panel.webview.postMessage({
				command: "reload",
				text: b,
			});
		}

	});

	let dispSTTC = vscode.commands.registerCommand("itodo.showTotalTaskCount", function() {

		const l = db.getAll()
		const a = l.length
		let msg = "当前没有任务"
		if (a >= 1) msg = `当前共有${ a }个任务列表, `
		const u = l.filter(item=> item.task_status > 0).length
		msg += `未完成任务有${ u }个`
		vscode.window.showInformationMessage(msg)

	})

	context.subscriptions.push(disposable)
	context.subscriptions.push(dispSTTC)
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
