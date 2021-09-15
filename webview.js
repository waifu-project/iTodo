const vscode = acquireVsCodeApi()

const add_btn = document.getElementById("add_btn")
const title_input = document.getElementById("title")
const textarea_input = document.getElementById("textarea")

const tableBodyWrapper = document.getElementById('table_body')

const data = {
  _canBeChanged: false,

  //////
  ele: null,
  id: '',
  title: '',
  desc: '',
  //////

}

Object.defineProperty(data, 'canbeChanged', {
  get() {
    return this['_canBeChanged']
  },
  /**
   * 
   * @param {boolean} val
   */
  set(val) {
    const text = val ? '修改' : '添加'
    add_btn.innerText = text
    if (val) {
      let t      = title_input.value.trim()
      let a      = textarea_input.value.trim()
      data.title = t
      data.desc  = a
    }
    this['_canBeChanged'] = val
  }
})

add_btn.addEventListener("click", function () {

  let t = title_input.value.trim()
  let a = textarea_input.value.trim()

  if (t.length <= 0) return
  
  if (data.canbeChanged) {
    vscode.postMessage({
      command: 'update',
      text: JSON.stringify({
        id: data.id,
        title: t,
        desc: a,
      })
    })
    trigerEditAction(data.title, data.desc)
    if (!!data.ele) {
      data.ele.querySelectorAll('td')[0].innerText = t
      data.ele.querySelectorAll('td')[1].innerText = a
      data.ele.setAttribute('data-title', t)
      data.ele.setAttribute('data-desc', a)
    }
    data.canbeChanged = false
    return
  }

  vscode.postMessage({
    command: "add",
    text: JSON.stringify({
      t,
      a,
    })
  })

  title_input.value = ""
  textarea_input.value = ""

})

const renderHTML = (data) => {
  const body = document.getElementById("table_body")
  let h = ``
  data.forEach(item => {
    let x = +item.task_status
    let ops = ""
    let p = [
      "已完成",
      "未完成",
      "未开始"
    ]
    for (let index = 0; index < 3; index++) {
      if (x == index) {
        ops += `<option value="${index}" selected>${p[index]}</option>`
      } else {
        ops += `<option value="${index}">${p[index]}</option>`
      }
    }
    h += `
      <tr>
        <td>${item.title}</td>
        <td>${item.desc}</td>
        <td style="width: 40px">${item.create_at}</td>
        <td style="width: 40px">${item.task_status}</td>
        <td style="width: 40px">
          <button onclick="delTask('${item.id}')">删除</button>
          <div>
            <select value="${item.task_status}" onchange="changeStatus(this, '${item.id}')">
              ${ops}
            </select>
          </div>
        </td>
      </tr>
    `
  });
  body.innerHTML = h
}

window.changeStatus = (ele, id) => {
  const value = ele.value
  vscode.postMessage({
    command: "updateStatus",
    text: JSON.stringify({
      id,
      status: +value
    })
  })
  try {
    const eles = ele.getElementsByTagName("option")
    for (let index = 0; index < eles.length; index++) {
      const element = eles[index];
      element.selected = false;
    }
    eles[+value].selected = true;
    const beforeEle = ele.parentElement.parentElement.previousElementSibling
    beforeEle.innerText = value
  } catch (error) {
    throw new Error(error)
  }
}

window.delTask = function (id) {
  vscode.postMessage({
    command: 'del',
    text: { id },
  }) 
}

const trigerEditAction = (title, desc)=> {
  title_input.value = title
  textarea_input.value = desc
}

window.editTask = function(ele, id) {
  const _ = ele.parentElement.parentElement
  const title = _.getAttribute('data-title')
  const desc = _.getAttribute('data-desc')
  const t = title_input.value.trim()
  const a = textarea_input.value.trim()
  data.ele = _
  data.title = t
  data.desc = a
  setTimeout(()=>{
    trigerEditAction(title, desc)
  }, 200)
  data.canbeChanged = true
  data.id = id
}

window.addEventListener('message', event => {
  const message = event.data;
  if (message.command == undefined || !message.command) return
  const action = message.command;
  let { text: payload } = message
  if (typeof text == 'string') return 
  switch (action) {
    case "add":
      updateUI(updateAction.Add, payload)
      break
    case 'del':
      updateUI(updateAction.Remove, payload)
      break
    case "reload":
      const x = message.text
      const data = JSON.parse(x)
      renderHTML(data)
      break;

    default:
      break;
  }
})

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

const updateAction = {
  Add: 0,
  Remove: 1,
}

const updateUI = (action, payload)=> {
  switch (action) {
    case updateAction.Add:
      const create_at = timeDiyFormat(payload['create_at'])
      const id = payload['id']
      const htmlTemplate = `
      <td>${ payload.title }</td>
      <td>${ payload.desc }</td>
      <td width="60px">${ create_at }</td>
      <td width="30px">${ payload.task_status }</td>
      <td width="60px">
        <div>
          <select id="select" value="${ payload.task_status }" onchange="changeStatus(this, '${ id }')">
            <option value="0">已完成</option>
            <option value="1">未完成</option>
            <option value="2" selected="">未开始</option>
          </select>
        </div>
        <button class="action-btn" onclick="editTask('${ id }')">编辑</button>
        <button class="action-btn" onclick="delTask('${ id }')">删除</button>
      </td>`
      const tr = document.createElement('tr')
      tr.setAttribute('data-id', id)
      tr.innerHTML = htmlTemplate
      toggleTable(true)
      tableBodyWrapper.insertBefore(tr, tableBodyWrapper.childNodes[0])
      break

    case updateAction.Remove:
      const { id: tid } = payload
      const ele = document.querySelector(`tr[data-id="${ tid }"]`)
      ele.remove()
      toggleTable(false)
      break
  }
}

/**
 * 
 * @param {boolean} flag 
 */
const toggleTable = (flag)=>{
  if (!tableBodyWrapper.innerHTML) {
    const action = flag ? 'add' : 'remove'
    if (!tableBodyWrapper.innerHTML) {
      document.getElementsByClassName('styled-table')[0].classList[action]('active')
    }
  }
}