const vscode = acquireVsCodeApi()

const add_btn = document.getElementById("add_btn")
const title_input = document.getElementById("title")
const textarea_input = document.getElementById("textarea")

add_btn.addEventListener("click", function() {

  let t = title_input.value.trim()
  let a = textarea_input.value.trim()

  if (t.length <= 0) return

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

const renderHTML = (data)=> {
  const body =  document.getElementById("table_body")
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
        ops += `<option value="${ index }" selected>${ p[index] }</option>`
      } else {
        ops += `<option value="${ index }">${ p[index] }</option>`
      }
    }
    h += `
      <tr>
        <td>${ item.title }</td>
        <td>${ item.desc }</td>
        <td style="width: 40px">${ item.create_at }</td>
        <td style="width: 40px">${ item.task_status }</td>
        <td style="width: 40px">
          <button onclick="delTask('${ item.id }')">删除</button>
          <div>
            <select value="${ item.task_status }" onchange="changeStatus(this, '${ item.id }')">
              ${ ops }
            </select>
          </div>
        </td>
      </tr>
    `
  });
  body.innerHTML = h
}

window.changeStatus = (ele, id)=> {
  const value = ele.value
  vscode.postMessage({
    command: "update",
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
  } catch (error) {
    throw new Error(error)
  }
}

window.delTask = function (id) {
  vscode.postMessage({
    command: 'del',
    text: id,
  })
}

window.addEventListener('message', event => {
  const message = event.data;
  if (message.command == undefined || !message.command) {
    return;
  }
  courseId = message.command;
  switch (courseId) {
    case "reload":
      const x = message.text
      const data = JSON.parse(x)
      renderHTML(data)
      break;
  
    default:
      break;
  }
})