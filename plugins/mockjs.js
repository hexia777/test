// const Mock = require('../patch/mock')
// import servers from '@/static/config/common/server.config'

// Mock.mock(RegExp(servers.service + '/api/v2/client/devices' + '.*'), 'get', () => {
//   return require('@/static/json/api/client/devices.json')
// })
//
// Mock.mock(RegExp(servers.service + '/api/v2/order/subscribe/list' + '.*'), 'get', () => {
//   return require('@/static/json/api/order/subscribe_list.json')
// })
//
// Mock.mock(RegExp(servers.service + '/api/v2/order/billing' + '.*'), 'get', () => {
//   return require('@/static/json/api/order/billing.json')
// })
// const checkArgs = (body, args) => {
//   const obj = JSON.parse(body)
//   const setArgs = new Set(args)
//   const setKeys = new Set(Object.keys(obj))
//   const diff = new Set([...setKeys].filter((x) => !setArgs.has(x)))
//   return diff.size == 0
// }

// Mock.mock(servers.service + '/api/guest_token_v2', 'get', () => {
//   return require('@/static/json/api/guest_token_v2.json')
// })

// Mock.mock(servers.service + '/api/job/bind_token', 'post', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2', 'uids'])) {
//     return require('@/static/json/api/job/bind_token.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job/add', 'post', (options) => {
//   const args = ['token', 'guest_token_v2', 'jparam', 'file_id', 'dist', 'kind', 'name', 'job', 'uid', 'web']
//   if (checkArgs(options.body, args)) {
//     return require('@/static/json/api/job/add.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job_utils/progress', 'get', (options) => {
//   if (checkArgs(options.body, ['task_id', 'dst_file_id', 'token', 'guest_token_v2'])) {
//     return require('@/static/json/api/job_utils/progress_finish.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/license', 'get', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2'])) {
//     return require('@/static/json/api/license.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job/guest_record', 'get', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2', 'limit', 'page', 'dist', 'is_calc_num'])) {
//     return require('@/static/json/api/job/guest_record.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job/record', 'get', (options) => {
//   if (checkArgs(options.body, ['token', 'limit', 'page'])) {
//     return require('@/static/json/api/job/record.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job/thumbsup', 'get', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2', 'job_id', 'task_id', 'thumbsup'])) {
//     return require('@/static/json/api/job/thumbsup.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job_utils/upload/list', 'get', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2', 'limit'])) {
//     return require('@/static/json/api/job_utils/upload/list.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job_utils/upload_url', 'post', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2', 'type', 'web', 'url'])) {
//     return require('@/static/json/api/job_utils/upload_url.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// Mock.mock(servers.service + '/api/job_utils/download/sample/info', 'get', (options) => {
//   if (checkArgs(options.body, ['token', 'guest_token_v2', 'web'])) {
//     return require('@/static/json/api/job_utils/download/sample/info.json')
//   } else {
//     return {
//       code: 422,
//       msg: 'args not right.',
//     }
//   }
// })

// /*
// Mock.mock(servers.service + '/api/job_utils/download', 'get', () => {
//   return
// })

// Mock.mock(servers.service + '/api/job_utils/download/sample', 'get', () => {
//   return
// })

// Mock.mock(servers.service + '/api/job_utils/download/all', 'get', () => {
//   return
// })

// Mock.mock(servers.service + '/api/job_utils/preview', 'get', () => {
//   return
// })

// Mock.mock(servers.service + '/api/job_utils/download/src', 'get', () => {
//   return
// })

// Mock.mock(servers.service + '/api/job_utils/preview/src', 'get', () => {
//   return
// })
// //*/
