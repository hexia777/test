export const ruleRequireOnBlur = (vm) => {
  return {
    required: true,
    message: vm.$t('common.common_filed'),
    trigger: 'blur',
  }
}

export const ruleRequireOnChange = (vm) => {
  return {
    required: true,
    message: vm.$t('member.member_new_2'),
    trigger: 'change',
  }
}

export const ruleString = (min = 6, max = 15, vm) => {
  return { min, max, message: vm.$t('member.member_add_58'), trigger: 'blur' }
}

export const ruleNumber = () => {
  return { type: 'number', message: 'Please enter a value', trigger: 'blur' }
}

export const ruleNumberNoRequire = () => {
  return {
    validator: (rule, value, callback) => {
      if (!value || (Number.isFinite(value - 0) && (value + '').indexOf('.') == -1)) {
        callback()
      } else {
        callback(new Error('Please enter a value'))
      }
    },
    trigger: 'blur',
  }
}

export const ruleInteger = (type = 1, min, max) => {
  // type 不传代表所有整数 1:正整数 0:0和正整数
  return {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else if (type === 0 || type === 1) {
        if (type === 1) {
          if (!Number.isFinite(value - 0)) {
            callback(new Error('Please enter a value'))
          } else if (value <= 0) {
            callback(new Error('Please enter a positive integer'))
          } else {
            callback()
          }
        } else if (value < 0) {
          callback(new Error('Only positive integers or zeros can be entered'))
        } else {
          callback()
        }
      } else if (min && max && minMax(value, min, max, callback)) {
        // do
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

export const ruleFloat = (num, flag = true, min, max) => {
  // flag为false 代表可以为负数
  return {
    validator: (rule, value, callback) => {
      if (!Number.isFinite(value - 0)) {
        callback(new Error('请输入数值'))
      } else if (flag && value <= 0) {
        callback(new Error('请输入大于0的数字'))
      } else if ((value + '').indexOf('.') != -1 && (value + '').split('.')[1].length > num) {
        callback(new Error('小数点后面只能保留' + num + '位'))
      } else if (min && max && minMax(value, min, max, callback)) {
        // do
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

export const rulePhone = () => {
  return {
    validator: (rule, value, callback) => {
      const phoneV = /^1[3|4|5|8|7][0-9]\d{8}$/
      if (!phoneV.test(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

export const ruleEmail = (vm) => {
  return {
    validator: (rule, value, callback) => {
      // eslint-disable-next-line no-useless-escape
      const emailV = /^[\w\-\.\_\+]+@[\w\-\.]+(\.\w+)+$/
      if (!emailV.test(value)) {
        callback(new Error(vm.$t('common.common_password_4')))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

export const specialCharCheck = () => {
  return {
    validator: (rule, value, callback) => {
      if (!/^[0-9a-zA-Z\u4e00-\u9fa5]{1,15}$/.test(value)) {
        callback(new Error('Cannot enter special characters'))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

function minMax(value, min, max, callback) {
  if (min && max) {
    if (max < value || min > value) {
      callback(new Error('数值只能在' + min + '-' + max + '之间'))
      return true
    }
  } else {
    if (min === undefined && max < value) {
      callback(new Error('数值最大只能为' + max))
      return true
    }
    if (max === undefined && min > value) {
      callback(new Error('最小最大只能为' + min))
      return true
    }
  }
  return false
}

export const rulepassword = (vm) => {
  return {
    validator: (rule, value, callback) => {
      //确保密码 包含数字 包含字母 剩余字符不做限制  8-48位
      if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
        callback(new Error(vm.$t('common.common_passwordV')))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}

//邮箱规则
// eslint-disable-next-line no-useless-escape
export const emailStr = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
