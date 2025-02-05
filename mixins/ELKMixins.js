import { WorkFlowType } from '@/static/script/workflow_util'
export default {
  data() {
    return {
      //注册与订阅弹窗
      registerAndSubscribeVisible: false,
    }
  },
  methods: {
    firstAutoProcessELK() {
      if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_first_image: 'start',
          },
        })
      }
    },
    firstUploadELK() {
      if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'upload',
          event_value: 'upload',
          event_info: {
            process_first_image: 'upload',
          },
        })
      }
    },
    startUploadELK(resolution) {
      const [width, height] = (resolution || '').split('X')
      const image_megapixels = (width || 0) * (height || 0)
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'upload',
        event_value: 'upload',
        event_info: {
          upload_status: 'start',
          image_resolution: resolution,
          image_megapixels,
        },
      })
    },
    uploadCountELK() {
      if (this.$getCookie('userType') === 'register') {
        this.$store.commit(
          'SET_REGISTER_TRIAL',
          JSON.stringify({
            ...this.$store.state.registerTrial,
            upload: this.$store.state.registerTrial.upload + 1,
          })
        )

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'upload',
          event_value: 'upload',
          event_info: {
            free_user_trial_new: this.$store.state.registerTrial.upload,
          },
        })
      } else if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
        this.$store.commit(
          'SET_GUEST_TRIAL',
          JSON.stringify({
            ...this.$store.state.guestTrial,
            upload: this.$store.state.guestTrial.upload + 1,
          })
        )

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'upload',
          event_value: 'upload',
          event_info: {
            guest_trial_new: this.$store.state.guestTrial.upload,
          },
        })
      }
    },
    firstUploadedELK() {
      if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'upload',
          event_value: 'upload',
          event_info: {
            process_first_image: 'uploaded',
          },
        })
      }
    },
    uploadSuccessELK(md5, time) {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'upload',
        event_value: 'upload',
        event_info: {
          upload_status: 'success',
          upload_time: time,
        },
      })
    },
    uploadFailELK(resolution) {
      const [width, height] = (resolution || '').split('X')
      const image_megapixels = (width || 0) * (height || 0)
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'upload',
        event_value: 'upload',
        event_info: {
          image_resolution: resolution,
          image_megapixels,
        },
      })
    },
    uploadResizeELK(status, resolution, size) {
      const [width, height] = (resolution || '').split('X')
      const image_megapixels = (width || 0) * (height || 0)
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'editor',
        event_value: 'resize',
        event_info: {
          upload_status: status,
          image_resolution: resolution,
          image_megapixels,
          size,
        },
      })
    },
    uploadCompressELK(status, size) {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'editor',
        event_value: 'compress',
        event_info: {
          upload_status: status,
          size,
        },
      })
    },
    //游客下载elk
    guestDownloadELK(job, obj, work) {
      let elkweb_crop_img = 'true'
      let elkweb_source = ''
      if (obj) {
        if (!obj.crop_img) {
          elkweb_crop_img = 'false'
        }
        elkweb_source = obj.workspaceUrl
      }

      const elkParams = {
        event: 'download_popup',
        elk_process_type: job,
        elkweb_crop_img,
        elkweb_source,
      }
      const elkParams2 = {
        event: 'online_work',
        xargs_event_category: 'download',
        event_value: 'download_popup',
        xargs_process_type: job,
        event_info: {
          crop_img: elkweb_crop_img,
          source: elkweb_source,
        },
      }

      //放大模型的人脸增强进行上报
      if (work.new_params) {
        const lastConfig = work.new_params.config[0]
        if (work.new_params.job === WorkFlowType.enlarge) {
          if (lastConfig.name === WorkFlowType.CodeFormer) {
            elkParams.elkweb_enlarge_codeformer = 'true'
            elkParams2['event_info']['enlarge_codeformer'] = 'true'
          } else {
            elkParams.elkweb_enlarge_codeformer = 'false'
            elkParams2['event_info']['enlarge_codeformer'] = 'false'
          }
        }

        this.$trace.traceCustomEvent(elkParams2)
      }
    },
    //下载弹窗elk
    guestDownloadPopupELK() {
      if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
        this.$store.commit(
          'SET_GUEST_TRIAL',
          JSON.stringify({
            ...this.$store.state.guestTrial,
            download_popup: this.$store.state.guestTrial.download_popup + 1,
          })
        )

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'download',
          event_value: 'download_popup',
          event_info: {
            guest_trial_new: this.$store.state.guestTrial.download_popup,
          },
        })
      }
    },
    registerDownloadImgELK() {
      if (this.$getCookie('userType') === 'register') {
        this.$store.commit(
          'SET_REGISTER_TRIAL',
          JSON.stringify({
            ...this.$store.state.registerTrial,
            download_img: this.$store.state.registerTrial.download_img + 1,
          })
        )

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'download',
          event_value: 'download_img',
          event_info: {
            free_user_trial_new: this.$store.state.registerTrial.download_img,
          },
        })
      }
    },
    freeUserDownloadingPopup(level) {
      if (!level) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'download',
          event_value: 'downloading_popup',
        })
        this.registerAndSubscribeVisible = true
      }
    },
    downloadImgELK(job, transId, obj, enlager_type, work) {
      let elkweb_crop_img = 'true'
      let elkweb_source = ''
      if (obj) {
        if (!obj.crop_img) {
          elkweb_crop_img = 'false'
        }
        elkweb_source = obj.workspaceUrl
      }
      if (job === 'enlarge2') {
        job = 'enlarge'
      }

      const elkParams = {
        event: 'download_img',
        download_type: job,
        elkweb_model_name: transId,
        elkweb_crop_img,
        elkweb_source,
        elkweb_enlager_type: enlager_type,
      }
      const elkParams2 = {
        event: 'online_work',
        xargs_event_category: 'download',
        event_value: 'download_img',
        event_info: {
          download_type: job,
          model_name: transId,
          crop_img: elkweb_crop_img,
          source: elkweb_source,
          enlager_type,
        },
      }

      //放大模型的人脸增强进行上报
      if (work && work.new_params) {
        const lastConfig = work.new_params.config[0]
        if (work.new_params.job === WorkFlowType.enlarge) {
          if (lastConfig.name === WorkFlowType.CodeFormer) {
            elkParams.elkweb_enlarge_codeformer = 'true'
            elkParams2['event_info']['enlarge_codeformer'] = 'true'
          } else {
            elkParams.elkweb_enlarge_codeformer = 'false'
            elkParams2['event_info']['enlarge_codeformer'] = 'false'
          }
        }
      }

      this.$trace.traceCustomEvent(elkParams2)
    },
    noCreditsPopupELK() {
      this.$trace.traceCustomEvent({
        event: 'click',
        xargs_event_category: 'popup',
        event_value: 'no_credits_popup',
      })
    },
    selectPhotoFromWorkspace(uploadName) {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'editor',
        event_value: 'select_photo',
        event_label: uploadName,
      })
    },

    // 先阶段都是单一模型
    processELKV2(workConfig, params, extendsElkParams = {}) {
      const transId = params.transId
      const method = 'single'
      const configs = workConfig.config
      const steps = configs.length
      const type = workConfig.name
      const firstModelName = steps && configs[0].config.module_params.model_name
      const model_name = firstModelName || params.model_name
      const process_params = JSON.stringify(workConfig)
      const crop_img = params.crop_img
      const workspaceUrl = params.workspaceUrl
      const enlager_type = params.enlagerType
      const workflow = steps > 1

      const send_crop_img = crop_img ? 'true' : 'false'
      const elkData = {
        event: 'process',
        elkweb_process_id: transId, //work transId
        elkweb_process_method: method, //单一模型
        elkweb_process_steps: steps,
        elkweb_process_type: type, //job名称
        elkweb_model_name: model_name, //模型名称
        elkweb_process_params: process_params, //模型参数
        elkweb_workflow_name: '', //工作流名称
        elkweb_workflow: workflow, // config数组大于1时上报workflow:true，小于等于1时不上报workflow或者workflow:false
        elkweb_crop_img: send_crop_img, //是否裁剪过
        elkweb_source: workspaceUrl, //工作台名称
      }
      Object.keys(extendsElkParams).forEach((key) => {
        elkData[`elkweb_${key}`] = extendsElkParams[key]
      })
      if (enlager_type) {
        elkData.elkweb_enlager_type = enlager_type
      }

      const elkData2 = {
        event: 'online_work',
        xargs_event_category: 'process',
        event_value: 'process',
        event_info: {
          process_id: transId, //work transId
          process_method: method, //单一模型
          process_steps: steps,
          process_type: type, //job名称
          model_name, //模型名称
          process_params, //模型参数
          workflow_name: '', //工作流名称
          workflow: !!workflow, // config数组大于1时上报workflow:true，小于等于1时不上报workflow或者workflow:false
          crop_img: send_crop_img, //是否裁剪过
          source: workspaceUrl, //工作台名称
          ...extendsElkParams,
        },
      }

      this.$trace.traceCustomEvent(elkData2)
    },

    //目前只有老照片修复单工作台在使用
    processELKV3(workConfig, params, extendsElkParams = {}) {
      const configs = workConfig.configs
      const model_name = JSON.stringify(configs.map((item) => item.name))

      const elkData = {
        event: 'online_work',
        xargs_event_category: 'process',
        event_value: 'process',
        event_info: {
          process_id: params.transId, //work transId
          process_method: configs.length > 1 ? 'multiple' : 'single', //单一模型还是多模型
          process_steps: configs.length,
          process_type: workConfig.taskName,
          model_name, //模型名称
          process_params: JSON.stringify(workConfig), //模型参数
          workflow: configs.length > 1, // config数组大于1时上报workflow:true，小于等于1时不上报workflow或者workflow:false
          ...extendsElkParams,
        },
      }

      this.$trace.traceCustomEvent(elkData)
    },

    processELK(params) {
      const transId = params.transId
      const method = params.elk.process_method
      const steps = params.elk.process_steps
      const type = params.elkJob
      const configs = params.new_params && params.new_params.config
      const firstModelName = configs.length && configs[0].config.module_params.model_name
      const model_name = firstModelName || params.elk.model_name
      const workflow = configs.length > 1
      const process_params = params.elk.process_params
      const workflow_name = ''
      const crop_img = params.crop_img
      const workspaceUrl = params.workspaceUrl
      const enlager_type = params.enlagerType
      const send_crop_img = crop_img ? 'true' : 'false'
      const elkData = {
        event: 'process',
        elkweb_process_id: transId, //work transId
        elkweb_process_method: method, //单一模型
        elkweb_process_steps: steps,
        elkweb_process_type: type, //job名称
        elkweb_model_name: model_name, //模型名称
        elkweb_process_params: process_params, //模型参数
        elkweb_workflow_name: workflow_name, //工作流名称
        elkweb_workflow: workflow, // config数组大于1时上报workflow:true，小于等于1时不上报workflow或者workflow:false
        elkweb_crop_img: send_crop_img, //是否裁剪过
        elkweb_source: workspaceUrl, //工作台名称
      }
      if (enlager_type) {
        elkData.elkweb_enlager_type = enlager_type
      }

      const elkData2 = {
        event: 'online_work',
        xargs_event_category: 'process',
        event_value: 'process',
        event_info: {
          process_id: transId, //work transId
          process_method: method, //单一模型
          process_steps: steps,
          process_type: type, //job名称
          model_name, //模型名称
          process_params, //模型参数
          workflow_name, //工作流名称
          workflow: !!workflow, // config数组大于1时上报workflow:true，小于等于1时不上报workflow或者workflow:false
          crop_img: send_crop_img, //是否裁剪过
          source: workspaceUrl, //工作台名称
        },
      }
      if (type === 'cartoonize' || type === 'animegan_toon') {
        if (['style1', 'style2', 'style3', 'style4', 'style5', 'style6'].includes(model_name)) {
          elkData.elkweb_model_type = 'sd'
          elkData.elkweb_cartoon_model_type = params.cartoon_model_type
          elkData.elkweb_process_style_type = params.process_style_type
          elkData.elkweb_style_strength = params.new_params.config[0].config.module_params.style_strength
          elkData.elkweb_prompt_value =
            params.new_params.config[0].config.module_params.description || 'false'

          elkData2.event_info.model_type = 'sd'
          elkData2.event_info.cartoon_model_type = params.cartoon_model_type
          elkData2.event_info.process_style_type = params.process_style_type
          elkData2.event_info.style_strength = params.new_params.config[0].config.module_params.style_strength
          elkData2.event_info.prompt_value =
            params.new_params.config[0].config.module_params.description || 'false'
        } else {
          elkData.elkweb_model_type = 'traditional'
          elkData2.event_info.model_type = 'traditional'
        }
      }

      //TO DO：后续考虑做成配置化
      if (params.new_params.job === 'old_photo_restorer2') {
        delete elkData['elkweb_process_steps']
        delete elkData2['event_info']['process_steps']
      }

      //放大模型的人脸增强进行上报
      const lastConfig = params.new_params.config[0]
      if (params.new_params.job === WorkFlowType.enlarge) {
        if (lastConfig.name === WorkFlowType.CodeFormer) {
          elkData.elkweb_enlarge_codeformer = 'true'
          elkData2['event_info']['enlarge_codeformer'] = 'true'
        } else {
          elkData.elkweb_enlarge_codeformer = 'false'
          elkData2['event_info']['enlarge_codeformer'] = 'false'
        }
      }

      //上色模式
      if (params.name === WorkFlowType.repair) {
        const lastConfig = params.new_params.config[params.new_params.config.length - 1]
        if (lastConfig.name === WorkFlowType.recolor) {
          elkData.elkweb_color_type = 'delicate'
          elkData2.event_info.color_type = 'delicate'
        } else if (lastConfig.name === WorkFlowType.colorize) {
          elkData.elkweb_color_type = 'Classic'
          elkData2.event_info.color_type = 'Classic'
        }
      }

      this.$trace.traceCustomEvent(elkData2)
    },
    firstProcessELK(transId) {
      if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_id: transId,
            process_first_image: 'processing',
          },
        })
      }
    },
    processTimeoutELK(transId, uid) {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'process',
        event_value: 'process',
        event_info: {
          process_id: transId,
          process_status: 'timeout',
          uid,
          process_failed_reason: 'Timeout 180s',
        },
      })
    },
    processSuccessELK(work, extendParams) {
      const { transId, crop_img, image_resolution, elk } = work
      const { process_type: job, model_name } = elk
      const { time, experienceTime, workspaceUrl } = extendParams
      const elkweb_crop_img = crop_img ? 'true' : 'false'
      const elkweb_source = workspaceUrl || ''
      const configs = work.config.config
      const workflow = configs && configs.length > 1
      const firstModelName = configs && configs[0].config.module_params.model_name
      const send_model_name = firstModelName || model_name
      const [width, height] = (image_resolution || '').split('X')
      const image_megapixels = (width || 0) * (height || 0)
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'process',
        event_value: 'process',
        event_info: {
          process_id: transId,
          process_type: job,
          workflow: !!workflow,
          model_name: send_model_name,
          crop_img: elkweb_crop_img,
          source: elkweb_source,
          process_status: 'success',
          process_time: parseFloat(time),
          image_resolution,
          image_megapixels,
        },
      })
      if (experienceTime) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            experience_process_time: parseFloat(experienceTime),
          },
        })
      }
    },
    processFailELK(work, extendParams) {
      const { transId, image_resolution } = work
      const { time, experienceTime, reason = '' } = extendParams
      const [width, height] = (image_resolution || '').split('X')
      const image_megapixels = (width || 0) * (height || 0)
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'process',
        event_value: 'process',
        event_info: {
          process_id: transId,
          process_failed_reason: reason,
          process_status: 'failed',
          processing_time: parseFloat(time),
          image_resolution,
          image_megapixels,
        },
      })
      if (experienceTime) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            experience_process_time: parseFloat(experienceTime),
          },
        })
      }
    },
    processCountELK() {
      if (this.$getCookie('userType') === 'register') {
        this.$store.commit(
          'SET_REGISTER_TRIAL',
          JSON.stringify({
            ...this.$store.state.registerTrial,
            process: this.$store.state.registerTrial.process + 1,
          })
        )

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            free_user_trial_new: this.$store.state.registerTrial.process,
          },
        })
      } else if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
        this.$store.commit(
          'SET_GUEST_TRIAL',
          JSON.stringify({
            ...this.$store.state.guestTrial,
            process: this.$store.state.guestTrial.process + 1,
          })
        )

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            guest_trial_new: this.$store.state.guestTrial.process,
          },
        })
      }
    },
    imgLoadedElk(time) {
      if (!time) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'loading',
          event_value: 'loading',
          event_info: {
            loading_status: 'start',
          },
        })
      } else {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'loading',
          event_value: 'loading',
          event_info: {
            loading_status: 'success',
            loading_time: time,
          },
        })
      }
    },
    sampleProcessSuccess(index, transId, time) {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'process',
        event_info: {
          process_photo: 'sample',
          sample_position: index,
          process_id: transId,
          process_status: 'success',
          process_time: parseFloat(time),
        },
      })
    },
    // 编辑图片
    clickImageEditorBtnELK() {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'editor',
        event_value: 'edit_photo',
      })
    },
    // 下载编辑的图片
    clickImageEditorDownloadBtnELK() {
      this.$trace.traceCustomEvent({
        event: 'click',
        xargs_event_category: 'other',
        event_value: 'download_edit',
      })
    },
  },
}
