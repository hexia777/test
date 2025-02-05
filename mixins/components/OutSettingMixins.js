import { deepClone } from '@/static/script/utils'
export default {
  data() {
    return {
      outSettingVisible: false,
      //输出参数
      outSettingConfig: {
        compress: {
          quality: 80,
        },
        keep_origin_name: true,
        dpi: 'default',
        format: 'default',
        isRemerber: false,
      },
      //输出参数copy
      outSettingConfigCopy: {
        compress: {
          quality: 80,
        },
        keep_origin_name: true,
        dpi: 'default',
        format: 'default',
        isRemerber: false,
      },
    }
  },
  methods: {
    getOutSetting() {
      if (this.$getCookie('cloud_outSeting')) {
        this.outSettingConfig = JSON.parse(this.$getCookie('cloud_outSeting'))
      } else {
        this.outSettingConfig = deepClone(this.outSettingConfigCopy)
      }
    },
    closeOutSetDialog() {
      this.outSettingVisible = false
    },
    /**
     * @openSetWin
     */
    onOutSettingsDialog() {
      // 未修改使用默认值或本地记录cookie值
      this.getOutSetting()
      this.outSettingVisible = true
    },
    confirmOutSet() {
      this.outSettingVisible = false
      if (this.outSettingConfig.isRemerber) {
        this.$setCookie('cloud_outSeting', JSON.stringify(this.outSettingConfig), 365)
      } else {
        this.$setCookie('cloud_outSeting', '', -1)
      }
    },
  },
}
