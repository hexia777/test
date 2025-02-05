import Work from '@/static/script/work'
import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
import { deepClone, isNull } from '@/static/script/utils'

export default {
  methods: {
    calulateSacle(work) {
      work.config.scale = work.new_params.config.reduce((prev, cur) => {
        let scale = 1
        if (cur.config.module_params.scale) {
          if (cur.config.module_params.customize && work.w) {
            scale = cur.config.module_params.width / work.w
            //job=enlarge的需要对scale进行处理
            if (work.operation === WorkFlowType.enlarge) {
              cur.config.module_params.scale = 4
            }
          } else {
            const r = /\d+/.exec(cur.config.module_params.scale)
            if (r) {
              scale = r[0] || 1
            } else {
              scale = 1
            }
            //job=enlarge的需要对scale进行处理
            if (work.operation === WorkFlowType.enlarge) {
              if (cur.config.module_params.model_name !== 'EnlargeStable') {
                cur.config.module_params.scale = Number(scale)
              }
            }
          }
        }
        return prev * scale
      }, 1)
    },
    /**
     * params仅用于批处理单任务识别
     * @param work
     */
    addNewParams(work) {
      work.new_params = { ...work.params }
    },
    /**
     * 处理传到transform接口的jconfig参数
     * @param work.new_params
     */
    processExtendParams(uid, params) {
      const newParams = { ...params }
      if (Array.isArray(params.config)) {
        newParams.config = params.config.map((modal) => {
          if (modal.name !== 'img2anime' || modal.name !== 'img2anime_st') {
            delete modal['cartoon_model_type']
            delete modal['process_style_type']
            delete modal['ext_params']
          }
          //SD服务的ControlNet模型需要传入cn_configs
          if (modal.config.cn_configs && modal.config.cn_configs.length) {
            modal.cn_configs = modal.config.cn_configs.map((cn_name) => {
              return { image_uid: uid, cn_name }
            })
            delete modal.config.cn_configs
          }
          //SD服务的ControlNet模型需要传入cn_configs
          if (modal.cn_configs && modal.cn_configs.length) {
            modal.cn_configs = modal.cn_configs.map((cn_config) => {
              return { ...cn_config, image_uid: uid }
            })
          }
          return modal
        })
        //Sharpen增加基于StableSR的超分复原
        if (newParams.config[0].name === WorkFlowType.sharpen_sr) {
          newParams.name = WorkFlowType.sharpen_sr
          newParams.config[0].name = WorkFlowType.img2sr
        }
      }
      const configs = newParams.config
      // enlarge 2x模型单独分配两台服务器需求参数特殊处理
      if (
        configs.length === 1 &&
        configs[0].config.module_params.model_name === 'EnlargeStandard_2x_Stable'
      ) {
        newParams.name = 'enlarge_2x'
        if (configs[0].name) {
          configs[0].name = 'enlarge_2x'
        }
      }
      return newParams
    },
    formatEnlargeParams(config, work) {
      // 720p 1080p 4k cutomize
      // 前端判断所选尺寸高度/图片高度=N
      // N≤1，则使用1x模型，比如所选高度为720，输图片高度为1000，那么使用1x模型前端先进行等比压缩使用1x模型放大
      // 1<N≤2,则使用2x模型，比如所选高度为720，输入图片高度为360，那么使用2x模型不压缩，直接使用2x模型放大。底层放大到道先定尺寸
      // 2<N，则使用4x模型，比如所选高度为720，输入图片高度为200，那么使用4x模型不压缩，直接使用4x模型放大。底层放大到道先定尺寸
      const { h } = work
      config.config.forEach((item, index) => {
        if (item.name === 'enlarge3') {
          const module_params = item.config.module_params
          if (module_params.customize) {
            const { height } = module_params
            const limitN = height / h
            if (limitN <= 1) {
              item.config.module_params = {
                ...module_params,
                model_name: 'EnlargeStandard_1x_Stable',
                scale: 1,
              }
            } else if (limitN <= 2) {
              item.config.module_params = {
                ...module_params,
                model_name: 'EnlargeStandard_2x_Stable',
                scale: 2,
              }
              if (index === 0) {
                config.name = 'enlarge_2x'
                item.name = 'enlarge_2x'
              }
            }
          }
        }
      })
      return config
    },
    workConfigurationPreprocessing(work, ignore = false) {
      const fnMap = {
        [Work.typeSketch]: this.sketchConfigFun,
        [Work.typeNewSketch]: this.newSketchConfigFun,
        [Work.typeRepair]: this.repairConfigFun,
        [Work.typeOldPhotoRestorerV2]: this.repairConfigFunV2WithConfig,
        [Work.typeSharpen]: this.sharpenConfigFun,
        [Work.typeSharpen3]: this.sharpenConfigFun,
        [Work.typeSharpen2LensBlur]: this.sharpenConfigFun,
        [Work.typeSharpen2MotionBlur]: this.sharpenConfigFun,
        [Work.typeSharpen2SortNormal]: this.sharpenConfigFun,
        [Work.typeEnlarge]: this.enlargeConfigFun,
        [Work.typeEnlarge2]: this.enlargeConfigFun,
        [Work.typeEnlarge3]: this.enlargeConfigFun,
        [Work.typeEnlargeClarity]: this.enlargeClarityConfigFun,
        [Work.typeEnlargeSr]: this.enlargeSrConfigFun,
        [Work.typeCartoonize]: this.cartoonConfigFun,
        [Work.typeDehaze]: this.dehazeConfigFun,
      }
      if (work.operation === 'old_photo_restorer2') {
        work.new_params.config = work.params.config
        return
      }
      //将PortraitEnhancer_v1.2模型替换为tp的人脸增强
      if (work.operation === 'portrait_enhancer') {
        if (
          work.new_params &&
          work.new_params.config &&
          work.new_params.config[0].config &&
          work.new_params.config[0].config.module == 'enlarge3'
        ) {
          work.new_params.name = 'enlarge_batch'
          work.new_params.config[0].name = 'enlarge_batch'
        }
        return
      }
      console.log('work.params: ', work.params)
      work.new_params.config = work.params.config.reduce((prev, curr) => {
        // newSketchName 为新版sketch 模型的新增字段
        curr.name = curr.newSketchName || curr.elkName || curr.name
        if (!ignore && !curr.workConfigurationPreprocessing && !isNull(fnMap[curr.name])) {
          return [...prev, ...fnMap[curr.name](curr, work)]
        }
        //模型扩展
        if (curr.modelExtendFlag) {
          if (typeof fnMap[curr.name] === 'function') {
            return [...prev, ...fnMap[curr.name](curr, work)]
          } else {
            delete curr.newSketchName
            delete curr.modelExtendFlag
            delete curr.modelExtend
            delete curr.index
          }
        }
        return [...prev, ...this.pConfigFn(curr, work)]
      }, [])
    },
    dehazeConfigFun(config) {
      return [
        config,
        {
          name: 'jpeg_artifact',
          config: WorkFlowConfig(WorkFlowType.jpeg_artifact),
        },
        config.config.module_params.autoRetoucher
          ? {
              name: 'perfect',
              config: WorkFlowConfig(WorkFlowType.perfect),
            }
          : null,
      ].filter((item) => item !== null)
    },
    cartoonConfigFun(config) {
      if (config.config.module === 'animegan2') {
        config.name = 'animegan_toon'
      }
      return [config]
    },
    pConfigFn(config, work) {
      if (config.config.module_params.p) {
        const p = config.config.module_params.p
        const r = p / work.h
        config.config.module_params.height = p
        config.config.module_params.width = Math.ceil(work.w * r)
        delete config.config.module_params.p
      }
      return [config]
    },
    /**
     * @enlargeConfigFun 模块处理方案
     */
    enlargeConfigFun(cfg, work) {
      let config = deepClone(cfg)
      if (config.config.module === 'real_esrgan') {
        config.name = Work.typeRealesrgan2
      }
      if (config.name === 'enlarge2') {
        config.name = 'enlarge'
      }
      if (config.config.module_params.p) {
        const p = config.config.module_params.p
        const r = p / work.h
        config.config.module_params.height = p
        config.config.module_params.width = Math.ceil(work.w * r)
        delete config.config.module_params.p
      }
      if (config.modelExtendFlag) {
        config = this.modelExtend(config)
      }
      return [].concat(config)
    },

    enlargeClarityConfigFun(config, work) {
      const module_params = config.config.module_params

      const newConfig = {
        name: 'enlarge_clarity',
        sd_mode: 'sd_enlarge_clarity',
        config: {
          module: 'sd_enhance',
          module_params: {
            ...module_params,
            customize: true, //是否是自定义放大
            width: module_params.customize ? module_params.width : work.w * module_params.scale,
            height: module_params.customize ? module_params.height : work.h * module_params.scale,
          },
        },
      }
      return [newConfig]
    },
    /**
     * @enlargeSrConfigFun 模块处理方案(Enlarge增加基于StableSR的超分复原的自定义处理)
     */
    enlargeSrConfigFun(config, work) {
      const newConfig = []
      //模型扩展
      config.modelExtend.forEach((item) => {
        newConfig[item.index] = item.modal
      })

      if (config.config.module_params.scale === 8) {
        config.config.module_params.model_name = 'EnlargeStandard_4x_Stable'
      }
      newConfig[config.index] = { ...config, name: Work.typeEnlarge3 }
      delete newConfig[config.index]['index']
      delete newConfig[config.index]['modelExtendFlag']
      delete newConfig[config.index]['modelExtend']

      work.new_params.name = Work.typeEnlargeSr

      return newConfig
    },

    /**
     * @sketchConfigFun 模块处理方案
     */
    sketchConfigFun(config) {
      if (config.config.module_params.auto_mode) {
        return [
          {
            name: 'sharpen',
            config: WorkFlowConfig(WorkFlowType.sharpen),
          },
          {
            name: 'matting',
            config: {
              module: 'matting',
              module_params: {
                model_name: 'Mattingstable',
              },
              out_params: {
                bg_composed: {
                  bg_color: {
                    r: 255,
                    g: 255,
                    b: 255,
                  },
                },
              },
            },
          },
          config,
        ]
      }
      return [config]
    },

    /**
     * new sketch 模块处理
     */
    newSketchConfigFun(config) {
      console.log('newSketchConfigFun  config: ', JSON.parse(JSON.stringify(config)))
      if (config && config.modelExtendFlag && Array.isArray(config.modelExtend)) {
        const newConfig = JSON.parse(JSON.stringify(config))
        delete newConfig.modelExtendFlag
        delete newConfig.modelExtend
        delete newConfig.index
        if (newConfig.newSketchName) {
          delete newConfig.newSketchName
        }
        return [...config.modelExtend, newConfig]
      }
      return [config]
    },
    /**
     * @repairConfigFun 模块处理方案
     */
    repairConfigFun(config) {
      if (config.config.module_params.auto_mode) {
        return [
          {
            name: 'portrait_enhancer',
            config: WorkFlowConfig(WorkFlowType.portrait_enhancer),
          },
          {
            name: 'sharpen',
            config: WorkFlowConfig(WorkFlowType.sharpen, { autoparams: true }),
          },
          config,
          config.config.module_params.convert
            ? {
                name: 'colorize',
                config: WorkFlowConfig(WorkFlowType.deoldify2),
              }
            : null,
        ].filter((item) => item !== null)
      }
      return [config]
    },

    repairConfigFunV2WithConfig(config) {
      console.log('repairConfigFunV2WithConfig', config)
      if (config.config.repairOptions) {
        return this.repairConfigFunV2(config.config.repairOptions)
      }
      return []
    },
    // 要求必须至少选择一项
    repairConfigFunV2(options) {
      const configs = []
      if (options.isFix) {
        configs.push({
          name: 'crease_repair',
          config: {
            module: 'crease_repair',
            module_params: {
              model_name: 'CreaseRepairStable',
            },
          },
        })
      }
      if (options.isImproveQuality && options.isImproveQuality.flag) {
        configs.push({
          name: WorkFlowType.img2sr,
          config: deepClone(options.isImproveQuality.config),
          sd_script: 'repair_ssr',
        })
      }
      if (options.isColorize) {
        //经典修复:deoldify;精细修复:recolor
        configs.push(options.recolorConfig.config)
      }
      return configs
    },

    /**
     * @sharpenConfigFun 模块处理方案
     */
    sharpenConfigFun(config) {
      if (config.config.module_params.custom_auto_mode !== 0) {
        return [
          config,
          {
            name: WorkFlowType.CodeFormer,
            config: WorkFlowConfig(WorkFlowType.CodeFormer),
          },
        ]
      }
      return [config]
    },

    setOutParams(work) {
      const config = work.new_params.config.pop()
      config.config.out_params = work.out_params
      work.new_params.config.push(config)
    },
    /**
     * @delWebKey 移除前端自定义属性
     */
    delWebKey(work) {
      //移除不需要的属性
      if (Array.isArray(work.new_params.config)) {
        work.new_params.config.forEach((item) => {
          delete item.config.module_params.web_auto_mode
          delete item.config.module_params.custom_auto_mode
          delete item.hide
          delete item.elkJob
          delete item.elkName
          delete item.activeName
          delete item.disabledPreprocessing
        })
      } else {
        delete work.new_params.config.module_params.web_auto_mode
        delete work.new_params.config.module_params.custom_auto_mode
        delete work.new_params.config.module_params.elkJob
      }
      delete work.new_params.hide
      delete work.new_params.elkJob
      delete work.new_params.elkName
      delete work.new_params.disabledPreprocessing
    },
    /**
     * @modelExtend 模型扩展
     */
    modelExtend(config) {
      const newConfig = []
      config.modelExtend.forEach((item) => {
        newConfig[item.index] = item.modal
      })
      newConfig[config.index] = deepClone(config)
      delete newConfig[config.index]['index']
      delete newConfig[config.index]['modelExtendFlag']
      delete newConfig[config.index]['modelExtend']

      //enlarge模型的人脸增强需要放到前面
      newConfig.reverse()

      return newConfig
    },
  },
}
