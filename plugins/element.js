import Vue from 'vue'

export default async ({ route, store }) => {
  if (!Vue.__element_ui__) {
    Vue.__element_ui__ = true
    Vue.component('ElBreadcrumb', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/breadcrumb')
    )
    Vue.component('ElBreadcrumbItem', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/breadcrumb-item')
    )
    Vue.component('ElButton', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/button'))
    Vue.component('ElCard', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/card'))
    Vue.component('ElCheckboxGroup', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/checkbox-group')
    )
    Vue.component('ElCheckbox', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/checkbox'))
    Vue.component('ElCarousel', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/carousel'))
    Vue.component('ElCarouselItem', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/carousel-item')
    )
    Vue.component('ElColorPicker', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/color-picker')
    )
    Vue.component('ElDropdown', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/dropdown'))
    Vue.component('ElDropdownMenu', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/dropdown-menu')
    )
    Vue.component('ElDropdownItem', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/dropdown-item')
    )
    Vue.component('ElForm', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/form'))
    Vue.component('ElFormItem', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/form-item'))
    Vue.component('ElIcon', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/icon'))
    Vue.component('ElInput', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/input'))
    Vue.component('ElInputNumber', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/input-number')
    )
    Vue.component('ElDialog', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/dialog'))
    Vue.component('ElLoading', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/loading'))
    Vue.component('ElMessage', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/message'))
    Vue.component('ElMessageBox', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/message-box')
    )
    Vue.component('ElOption', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/option'))
    Vue.component('ElProgress', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/progress'))
    Vue.component('ElPagination', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/pagination')
    )
    Vue.component('ElPopover', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/popover'))
    Vue.component('ElRadio', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/radio'))
    Vue.component('ElRadioButton', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/radio-button')
    )
    Vue.component('ElRadioGroup', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/radio-group')
    )
    Vue.component('ElSwitch', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/switch'))
    Vue.component('ElSlider', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/slider'))
    Vue.component('ElSelect', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/select'))
    Vue.component('ElOptionGroup', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/option-group')
    )
    Vue.component('ElTabs', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/tabs'))
    Vue.component('ElTabPane', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/tab-pane'))
    Vue.component('ElTable', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/table'))
    Vue.component('ElTableColumn', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/table-column')
    )
    Vue.component('ElTooltip', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/tooltip'))
    Vue.component('ElUpload', () => import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/upload'))
    const messageBox = Vue.component('MessageBox', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/message-box')
    )
    const message = Vue.component('Message', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/message')
    )

    const loading = Vue.component('Loading', () =>
      import(/* webpackChunkName: 'element-ui' */ 'element-ui/lib/loading')
    )
    const res = await loading()
    Vue.use(res.default.directive)

    const MBres = await messageBox()
    Vue.prototype.$msgbox = MBres.default
    Vue.prototype.$confirm = MBres.default.confirm

    const Mres = await message()
    Vue.prototype.$message = Mres.default
  }
}
