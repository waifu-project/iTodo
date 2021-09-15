const vscode = require('vscode');
const path = require("path")

const database = require("./database")
const page = require("./page")
const { syncData2Remote, syncData2Local } = require('./sync')

const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)

const title = "iTodo"

function activate(context) {

	const dbFile = path.join(context.extensionPath, "./db.json")
	const db = new database(dbFile)

  const	getBar = ()=> {
		let text = vscode.workspace.getConfiguration().get(`itodo.bartext`)
		if (!text) text = title
		return text
	}

	statusBar.text = getBar()
	statusBar.show()

	statusBar.command = "itodo.showTodoUI"

	let panel = null

	vscode.workspace.onDidChangeConfiguration(event => {
		let affected = event.affectsConfiguration("itodo.bartext")
		if (affected) {
			statusBar.text = getBar()
		}
	})

	let sync2Remote = vscode.commands.registerCommand('itodo.syncDataToRemote', async function() {
		const is = await syncData2Remote(db)
		console.log(is)
	})

	let sync2Local = vscode.commands.registerCommand('itodo.syncDataToLocal', async function() {
		const is = await syncData2Local(db)
		if (is && !!panel) {
			panel.dispose()
		}
	})

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
					db.removeOnce(text['id'])
					reload('del', text)
					break
				case 'add':
					const c = JSON.parse(message.text)
					const { t, a } = c 
					const once = db.add(t, a)
					reload('add', once)
					break
				case "updateStatus":
					const e = JSON.parse(message.text)
					const { id, status } = e
					db.updateStatusByID(id, status)
					reload('updateStatus', { id, status })
					break
				case 'update':
					const p = JSON.parse(message.text)
					const { title, desc, id: ___id } = p
					db.updateTaskByID(___id, { title, desc })
					break
			}
		}, undefined, context.subscriptions);
	
		/**
		 * @param {string} action 
		 * @param {any} payload 
		 */
		const reload = (action, payload)=> {
			if (!payload) {
				const a = db.getAll()
				const b = JSON.stringify(a)
				payload = b
			}
			panel.webview.postMessage({
				command: action ? action : "reload",
				text: payload,
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
	context.subscriptions.push(sync2Remote)
	context.subscriptions.push(sync2Local)

}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
