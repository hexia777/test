import Work from '@/static/script/work'
import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
export default {
  data() {
    return {
      defaultFlows: [],
    }
  },
  methods: {
    switchCartoonMode(val, index) {
      this.defaultFlows[index].config = WorkFlowConfig(val ? WorkFlowType.cartoonize : WorkFlowType.animegan)
    },
    switchWaiFuMode(val, index) {
      this.defaultFlows[index].config = WorkFlowConfig(val ? WorkFlowType.real_esrgan : WorkFlowType.waifu)
    },
    switchSketchMode(val, index) {
      this.defaultFlows[index].config = WorkFlowConfig(val ? WorkFlowType.animegan : WorkFlowType.sketch)
    },
    switchSharpenMode(val, index) {
      const map = {
        1: WorkFlowType.sharpen,
        2: WorkFlowType.debouncing,
        3: WorkFlowType.deblur,
      }
      let config = ''
      if (val === '1') {
        config = localStorage.getItem('workflow_config_sharpen')
      } else if (val === '2') {
        config = localStorage.getItem('workflow_config_debouncing')
      }

      this.defaultFlows[index].config = config ? JSON.parse(config) : WorkFlowConfig(map[val])
    },
    switchShapeMode(val, index) {
      this.defaultFlows[index].config = WorkFlowConfig(val ? WorkFlowType.sharpen_auto : WorkFlowType.sharpen)
    },
    switchColorizeMode(val, index) {
      this.defaultFlows[index].config = WorkFlowConfig(
        val ? WorkFlowType.colorize_pro : WorkFlowType.colorize,
        {
          psd: this.defaultFlows[index].config.module_params.psd,
        }
      )
    },
    // switchDehazeMode(val, index) {
    //   this.defaultFlows[index].config = WorkFlowConfig(WorkFlowType['se-dehazing'], val)
    // },
    switchRetoucherMode(val, index) {
      this.defaultFlows[index].config = WorkFlowConfig(val ? WorkFlowType.brightness : WorkFlowType.perfect)
    },
    changeCustomParams(val, index) {
      if (this.defaultFlows.length === 0) {
        return
      }
      console.log(val, index)
      const workMap = {
        [Work.typeColorize]: { key: 'isBest', fn: this.switchColorizeMode },
        [Work.typeWaifu]: { key: 'isRealEsrgan', fn: this.switchWaiFuMode },
        [Work.typeSketch]: { key: 'isAnimegan', fn: this.switchSketchMode },
        // [Work.typeDehaze]: { key: 'isAutoRetoucher', fn: this.switchDehazeMode },
        [Work.typeSharpen]: { key: 'sharpenJob', fn: this.switchSharpenMode },
        [Work.typePerfect]: { key: 'isBrightness', fn: this.switchRetoucherMode },
        [Work.typeCartoonize]: { key: 'isCartoon', fn: this.switchCartoonMode },
      }
      const currentWork = workMap[this.defaultFlows[index].name]
      if (!currentWork) {
        return
      }
      currentWork.fn(val[currentWork.key], index)
    },
    changeModuleFun(obj) {
      console.log('changeModuleFun')
      this.defaultFlows[obj.index].config.module_params = obj.module_params
      this.defaultFlows[obj.index].config.module = obj.module
    },
  },
}
