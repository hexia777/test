// elk数据追踪
export const elk = {
  key: 'vance_price',
  a: '',
  b: '',
  version: 'v1',
  enable: true, // 可选值：true、false；数据追踪启用或者关闭
  invalid_time: '',
}

export const expire = '1'

// 是否需要整站做ab测试
export const full_site = false

//ab测试列表
export const ab_test_list = [
  // 'demo',
  // 'demo_ip',
  //'page_content_ab',
  // 'recall_user',
  // 'sharpen_ai_btn',
  // 'watermark',
  'client',
  'common_ab_test',
]
