function add(a, b) {
  return a + b
}

function subtract(a, b) {
  return a - b
}

// 导出方法
module.exports = {
  add,
  subtract,
}

// const math = require('./math');  // 引入 math.js 文件
// const sum = math.add(5, 3);      // 使用导入的 add 方法
