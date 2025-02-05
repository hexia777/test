import ImageFileCompressMixins from '@/mixins/components/ImageFileCompressMixins.js'
import UploadImageMixins from '@/mixins/components/UploadImgMixinsV2'
import ELKMixins from '@/mixins/ELKMixins'
import { COUNTRY, TRANSID_MODAL, TRANS_MPDAL_BTN } from '@/static/config/common/localstorage_constants'
import Work from '@/static/script/work.js'
import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
import { fileSizeFun, setLoginDialogShow, getCredits } from '@/static/script/utils'

import WorkConfigurationPreprocessingMixins from '@/mixins/components/WorkConfigurationPreprocessingMixins'
import servers from '@/static/config/common/server.config'
import user_level from '@/static/json/user_level'
import { getDownloadUrlFromS3 } from '@/static/plugin/awsS3V2'
import { getWorksConfig } from '@/static/script/api/work/workConfig.js'
import { browserDownload, convertToMask } from '@/static/script/util/imageUtil'
import { TaskName } from '@/static/script/api/work/workConfig'

export default {
  mixins: [UploadImageMixins, ImageFileCompressMixins, WorkConfigurationPreprocessingMixins, ELKMixins],
  data() {
    return {
      downloadAppTrack: '?source=single&type=app_version&date=0515',
      queryQueueParams: null,
      requestTransform: false,
      lastRecordsTime: 0,
      workerCount: 0,
      lastProcessTransIds: [],
      handleNext: false,
      deductionCredit: 0,
      isProcess: false,
      guideWin: false,
      runUpdate: true,
      processLoading: false,
      noPointsDialogVisible: false,
      freeProcessTimesVisible: false,
      processStep: 0,
      downloadLoading: false,
      waitingDownload: false,
      previewImgLoading: false,
      convert: false,
      minLoading: false,
      notPoint: false,
      fabulousWin: false,
      otherParams: {},
      downloadFlag: true,
      enlagerType: '',
      busyJobs: 0,
      process_time: 0,
      record_process_time: 0,
      downloadDialogVisible: false,
      recommendDownloadVisible: false,
      // preImageOriginUid: '',
      workPoint: {}, // 存储work的积分扣点信息
    }
  },
  mounted() {
    if (this.queueImprove) {
      this.getWorkerCount()
    }
  },
  computed: {
    intervalTime() {
      let interval = 2 * 1000
      // 处理进度  轮询间隔
      // 0-1min 2s
      // 1-3min 5s
      // 3min-5min 10s
      // 5-10min 30s
      // 10min+ 60s
      if (this.process_time > 59 && this.process_time < 180) {
        interval = 5 * 1000
      } else if (this.process_time > 179 && this.process_time < 300) {
        interval = 10 * 1000
      } else if (this.process_time > 299 && this.process_time < 600) {
        interval = 30 * 1000
      } else if (this.process_time > 599) {
        interval = 60 * 1000
      }
      return interval
    },
    recordIntervalTime() {
      let interval = 2 * 1000
      // 处理进度  轮询间隔
      // 0-1min 2s
      // 1-3min 5s
      // 3min-5min 10s
      // 5-10min 30s
      // 10min+ 60s
      if (this.record_process_time > 59 && this.record_process_time < 180) {
        interval = 5 * 1000
      } else if (this.record_process_time > 179 && this.record_process_time < 300) {
        interval = 10 * 1000
      } else if (this.record_process_time > 299 && this.record_process_time < 600) {
        interval = 30 * 1000
      } else if (this.record_process_time > 599) {
        interval = 60 * 1000
      }
      return interval
    },
    downloadLink() {
      return this.$store.state.ll + 'soft-/downloading/' + this.downloadAppTrack
    },
    upgradeLink() {
      return (
        this.$store.state.mainWebsite +
        this.$store.state.specialLocaleLink +
        '/pricing/?source=workspace&type=app_version&date=0515'
      )
    },
    selectedList() {
      return this.work ? [this.work.transId] : []
    },
    isDevelopedCountryFlag() {
      if (this.$getCookie('developed_country')) {
        return this.$getCookie('developed_country') === '1'
      }
      return this.$store.state.isDevelopedCountry
    },
    showWaiteTime() {
      return (
        this.$getCookie('queuetime') ||
        ((this.isDevelopedCountryFlag ? this.process_time >= 60 : this.process_time >= 15) &&
          this.busyJobs > 0)
      )
    },
    processStepMap() {
      return {
        none: 0,
        upload: 1,
        processing: 2,
        processed: 3,
        error: 4,
      }
    },
  },
  watch: {
    processeds: {
      handler(val) {
        // 排队优化的工作台监听历史记录
        if (this.queueImprove) {
          const transIds = []
          const successTransIds = []
          const failTransIds = []
          const successTaskMap = {}
          const failTaskMap = {}

          // 只有当前任务在处理中
          let onlyProcessCurrent = true
          // 根据progress更新历史记录状态的不进行其他操作
          let updateStatusByProgress = false
          let maxProcessTime = 0
          val.forEach((item) => {
            const { transId, byProgress, processStatus, process_time, job_timelines } = item
            if (transId === this.work.transId && byProgress) {
              updateStatusByProgress = true
            }
            if (processStatus === 'progress' || processStatus === 'busy') {
              transIds.push(transId)
              if (transId !== this.work.transId) {
                onlyProcessCurrent = false
              }
            }
            if (processStatus === 'success') {
              successTransIds.push(transId)
              if (job_timelines) {
                successTaskMap[transId] = JSON.parse(job_timelines)
              }
            }
            if (processStatus === 'fail') {
              failTransIds.push(transId)
              if (job_timelines) {
                failTaskMap[transId] = JSON.parse(job_timelines)
              }
            }
            if (process_time && process_time > maxProcessTime) {
              maxProcessTime = process_time
            }
          })
          this.record_process_time = maxProcessTime
          if (updateStatusByProgress) {
            return
          }
          // 有正在处理的轮询历史记录，因为可以跟当前选中的任务轮询无关，所以单独写
          // 历史记录中显示的唯一正在处理的任务，处于激活状态，则只轮询progress，不轮询历史记录
          if (transIds.length && !onlyProcessCurrent) {
            setTimeout(() => {
              const timeInterval = Date.now() - this.lastRecordsTime
              // 避免刷新频次过快，或者多个正在执行的任务切换多次触发
              if (timeInterval < this.recordIntervalTime) {
                return
              }
              this.lastRecordsTime = Date.now()
              this.getProcesseds()
            }, this.recordIntervalTime)
          }
          if (this.lastProcessTransIds.length) {
            this.setProcessElkTime(successTransIds, failTransIds, successTaskMap, failTaskMap)
            const set = new Set(successTransIds)
            const newSuccess = this.lastProcessTransIds.filter((item) => set.has(item))
            if (newSuccess.length) {
              const first = newSuccess[0]
              // 当前主界面显示的是当前任务就不显示完成提示
              if (first !== this.work.transId) {
                const task = document.querySelector(`.task${first}`)
                if (task) {
                  const rect = task.getBoundingClientRect()
                  const completeTip = this.$refs['completeTip']
                  completeTip.style.display = 'block'
                  completeTip.style.top = `${rect.top + 30}px`
                  completeTip.style.left = `${rect.left + 102}px`
                  setTimeout(() => {
                    completeTip.style.display = 'none'
                  }, 3000)
                }
              }
            }
          }
          this.lastProcessTransIds = [...transIds]
        }
      },
      deep: true,
    },
    logged(val) {
      if (val) {
        //用户登录以后自动执行之前的下载操作
        setTimeout(() => {
          this.beginDownloadImage()
        }, 2000)
      }
    },
    processed(val) {
      if (val) {
        //获取点数
        this.getCredit()
      }
    },
  },
  methods: {
    setProcessElkTime(successTransIds, failTransIds, successTaskMap, failTaskMap) {
      const set = new Set(successTransIds)
      const newSuccess = this.lastProcessTransIds.filter((item) => set.has(item))
      newSuccess.forEach((item) => {
        if (successTaskMap[item]) {
          successTaskMap[item]['job_timelines'].forEach((processItem) => {
            if (processItem.node === 'jobserver' || processItem.node === 'worker') {
              this.setTime && this.setTime(processItem.step, 'start', item, processItem.start)
              this.setTime &&
                this.setTime(processItem.step, 'end', item, processItem.end, processItem.trans_time)
            }
          })
        }
        this.setTime && this.setTime('load', 'start', item)
        // 不是当前任务的不加载图片，加载时间为0
        if (item !== this.work.transId) {
          this.setTime && this.setTime('load', 'end', item)
        }
      })
      const failSet = new Set(failTransIds)
      const newFail = this.lastProcessTransIds.filter((item) => failSet.has(item))
      newFail.forEach((item) => {
        if (failTaskMap[item]) {
          failTaskMap[item]['job_timelines'].forEach((processItem) => {
            if (processItem.node === 'jobserver' || processItem.node === 'worker') {
              this.setTime && this.setTime(processItem.step, 'start', item, processItem.start)
              this.setTime &&
                this.setTime(processItem.step, 'end', item, processItem.end, processItem.trans_time)
            }
          })
        }
        this.setTime && this.setTime('load', 'start', item)
        this.setTime && this.setTime('load', 'end', item)
      })
    },
    handleDownloadTipClose() {
      this.downloadDialogVisible = false
    },
    continueDownload() {
      this.onDownload()

      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'download',
        event_value: 'download_img',
      })
      this.downloadDialogVisible = false
    },
    handleDriveSave(drive) {
      this.$trace.traceCustomEvent({
        event: 'click',
        xargs_event_category: 'other',
        event_value: 'save_to_drive',
        event_label: drive,
      })
      this.downloadDialogVisible = false
    },
    getCredit() {
      this.$axios
        .post(servers.service + '/api/v2/job/point', {
          trans_id: this.work.transId,
        })
        .then((res) => {
          if (res.code == 200) {
            this.deductionCredit = res.data
            getCredits()
          }
        })
    },
    /**
     * @removeWorkData 移除本地过期的图片以及样图
     */
    removeWorkData(reqData) {
      const currentData = new Date().valueOf()
      const maxData = 24 * 60 * 60 * 1000 //24h
      //读取缓存
      if (reqData && typeof reqData === 'object') {
        reqData = reqData.filter((val) => {
          if (!val.endTime) {
            return false
          }
          if (currentData - val.endTime > maxData) {
            return false
          }
          if (val.sample) {
            return false
          }
          return true
        })
        //重新写入缓存
        localStorage.setItem('processeds', JSON.stringify(reqData))
      }
      return reqData
    },
    initProcess() {
      this.offset = {
        x: 0,
        y: 0,
      }
      this.processLoading = true
      this.showPreview = false
      this.processStep = this.processStepMap.none
      this.previewImgLoading = false
    },
    /**
     * @selRateFun 根据不用模型自动切换放大比例
     */
    selRateFun() {
      //这里需要根据不用的路由来启动当前功能
      const regeX = /workspace-enhance|image_enlarger/g
      const routerName = regeX.test(this.$route.name)
      if (routerName) {
        if (this.work.elkJob == 'sharpen') {
          this.rate = 1
        } else {
          this.rate = 2
        }
      }
    },
    getMaskUid(maskImageUrl) {
      return new Promise((resolve, reject) => {
        const img = new Image()

        img.src = maskImageUrl
        img.setAttribute('crossOrigin', 'anonymous')
        img.onload = async () => {
          const uploadImageInfo = await this.initUploadImgInfo(img, 'png')
          uploadImageInfo.params = {
            name: 'repair_sd',
            job: 'repair',
          }
          const maskUid = await this.getUid({ work: uploadImageInfo })
          resolve(maskUid)
        }
      })
    },

    async getUidV2({ work = {} }, workName) {
      let uid = this.prepareUid || work.uid
      console.log('work', work)
      //含有transid 直接转化uid
      if (!uid) {
        //上传转化uid
        const uploadImgData = await this.uploadImgV2(work, workName)
        uid = uploadImgData.uid
      }
      this.currentImage.uid = uid
      work.uid = uid
      return uid
    },

    checkProcessStart() {
      const country = localStorage.getItem(COUNTRY)
      if (country === 'IN' && !this.$getCookie('token')) {
        //提示用户登录
        setLoginDialogShow()
        return { canStart: false }
      }

      if (this.$getCookie('token')) {
        //开启引导添加快捷方式弹窗
        if (
          !this.$getCookie('cloud_guideWin') &&
          !this.$store.state.mobile &&
          this.$route.name.indexOf('workspace') !== -1
        ) {
          this.$setCookie('cloud_guideWin', 1, 3650)
          this.guideWin = true

          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'other',
            event_value: 'add_desktop',
          })
        }
      }

      //登录后token和guestTokenV2同时正常过期，需要弹出登录框
      if (!this.$getCookie('token') && !this.$getCookie('guestTokenV2')) {
        console.log('token has expired')

        this.$store.commit('SET_TOKEN', '')
        //提示用户登录
        setLoginDialogShow()

        this.$store.commit('SET_USER_INFO_LEVEL', 'free')
        this.$store.commit('SET_USER_LOGINED', false)
        return { canStart: false }
      }
      // 非示例图片，免费用户没有处理次数弹窗
      if (
        this.$getCookie('token') &&
        this.$getCookie('userType') !== 'paying' &&
        !this.work.sample &&
        this.freeProcessWebNum <= 0
      ) {
        this.freeProcessTimesVisible = true

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'general_click',
          event_value: 'process_insufficient',
        })
        return { canStart: false }
      }

      return { canStart: true }
    },

    async onStartProcess() {
      console.log('async onStartProcess')

      const country = localStorage.getItem(COUNTRY)
      if (country === 'IN' && !this.$getCookie('token')) {
        //提示用户登录
        setLoginDialogShow()
        return
      }

      if (this.$getCookie('token')) {
        //开启引导添加快捷方式弹窗
        if (
          !this.$getCookie('cloud_guideWin') &&
          !this.$store.state.mobile &&
          this.$route.name.indexOf('workspace') !== -1
        ) {
          this.$setCookie('cloud_guideWin', 1, 3650)
          this.guideWin = true

          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'other',
            event_value: 'add_desktop',
          })
        }
      }

      //登录后token和guestTokenV2同时正常过期，需要弹出登录框
      if (!this.$getCookie('token') && !this.$getCookie('guestTokenV2')) {
        console.log('token has expired')

        this.$store.commit('SET_TOKEN', '')
        //提示用户登录
        setLoginDialogShow()

        this.$store.commit('SET_USER_INFO_LEVEL', 'free')
        this.$store.commit('SET_USER_LOGINED', false)

        return
      }
      // 非示例图片，免费用户没有处理次数弹窗
      if (
        this.$getCookie('token') &&
        this.$getCookie('userType') !== 'paying' &&
        !this.work.sample &&
        this.freeProcessWebNum <= 0
      ) {
        this.freeProcessTimesVisible = true

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'general_click',
          event_value: 'process_insufficient',
        })
        return
      }

      this.initProcess()
      // if (!this.identityCheck()) {
      //   this.processLoading = false
      //   return
      // }
      this.work = this.initWork(this.work)
      this.generateParams(this.work)
      this.addNewParams(this.work)
      this.workConfigurationPreprocessing(this.work, true)
      //输出参数设置
      this.setOutParams(this.work)
      this.delWebKey(this.work)
      this.calulateSacle(this.work)
      if (this.work.sample) {
        this.processStep = this.processStepMap.processing
        this.uploadList.unshift({ originImg: this.work.originImg, w: this.work.w, h: this.work.h })
        this.getProgressAndStartNextForSample(this.work)
        if (this.resetSampleFun) {
          this.resetSampleFun()
        }
        this.requestTransform = false
        return
      }
      this.processStep = this.processStepMap.upload
      let maskUid = ''
      if (this.maskImageUrl && this.maskHistory.length) {
        // maskUid = await this.getMaskUid(this.maskHistory[this.maskHistory.length - 1].uploadUrl)
        const maskBase64 = await convertToMask(this.maskImageUrl)
        maskUid = await this.uploadMask(maskBase64, 'mask.png', {
          job: this.work.params.job,
        })
      }
      await this.getUid({ work: this.work })
      let config = this.processExtendParams(this.work.uid, { ...this.work.new_params })
      config = this.formatEnlargeParams(config, this.work)
      this.processStep = this.processStepMap.processing
      this.freeUserProcessRecord()
      if (!this.$getCookie('token')) {
        if (
          !(this.work.elkJob === 'repair' || this.work.elkJob === 'old_photo_restorer2') &&
          this.$getCookie('leftCredits') <= 0
        ) {
          //游客积分不足
          this.notPoint = true
          this.isProcess = true
          this.registerAndSubscribeVisible = true
          this.noCreditsPopupELK()
          this.processLoading = false
          this.processStep = this.processStepMap.error
          return
        }
      }
      this.processCountELK()
      this.setTime && this.setTime('pre_process', 'end')
      let jobTimelines
      if (this.formatJobTimelines) {
        jobTimelines = this.formatJobTimelines()
        this.otherParams = {
          ...this.otherParams,
          job_timelines: JSON.stringify(jobTimelines),
        }
      }
      // this.setTime && this.setTime('process','start')
      try {
        //Cutout.pro 的API测试1.3
        // if (this.work.elkJob === WorkFlowType.sharpen_cop) {
        //   if (Array.isArray(config.config)) {
        //     config.config.map((item) => {
        //       if (item.config.module === 'sharpen2') {
        //         item.name = WorkFlowType.sharpen_cop
        //         item.config.module_params.model_switch = 'vance_cop'
        //       }
        //     })
        //   } else {
        //     config.config.module_params.model_switch = 'vance_cop'
        //   }
        // }

        // if (this.work.elkJob) {
        //   return
        // }
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_status: 'start',
          },
        })
        //针对tp的enlarge、sharpen和denoise功能的自动选参数做上报
        if (
          (this.work.elkJob == 'enlarge' && this.work.elkName == 'enlarge3') ||
          (this.work.elkJob == 'sharpen' && this.work.elkName == 'va_sharpen_standard') ||
          this.work.elkJob == 'denoise'
        ) {
          let autoparams = ''
          let model_name = ''
          if (this.work.new_params.config.length == 1) {
            if (this.work.new_params.config[0].config.module_params.autoparams) {
              autoparams = 'true'
            } else {
              autoparams = 'false'
            }
            model_name = this.work.new_params.config[0].config.module_params.model_name
          }
          if (this.work.new_params.config.length == 2) {
            if (this.work.new_params.config[0].name == 'CodeFormer') {
              if (this.work.new_params.config[1].config.module_params.autoparams) {
                autoparams = 'true'
              } else {
                autoparams = 'false'
              }
              model_name = this.work.new_params.config[1].config.module_params.model_name
            } else {
              if (this.work.new_params.config[0].config.module_params.autoparams) {
                autoparams = 'true'
              } else {
                autoparams = 'false'
              }
              model_name = this.work.new_params.config[0].config.module_params.model_name
            }
          }
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'autoparams',
            event_info: {
              autoparams,
              model_name,
            },
          })
        }

        this.work.startTime = Date.now()
        const { data } = await Work.start(
          this.work.elkJob,
          this.work.uid,
          config,
          '',
          this.work.config.scale,
          this.work.dst_file_name,
          this.otherParams,
          maskUid
        )
        //异常校验
        if (this.errorHandler(data)) {
          return
        }
        // todo
        // this.preImageOriginUid = this.work.uid
        this.getOutSetting()
        this.generateProcessELKParams()

        let elkJob = this.work.elkJob
        if (elkJob === Work.typeChainnerTxt) {
          elkJob = Work.typeChainner
        }
        if (elkJob === Work.typeEnlarge2) {
          elkJob = Work.typeEnlarge
        }

        //Cutout.pro 的API测试1.3
        if (elkJob === 'sharpen_cop') {
          this.$setCookie('cloud_process_cop', elkJob)
        }

        //开始处理上报elk
        const params = {
          ...this.work,
          elkJob,
          workspaceUrl: this.workspaceUrl,
          enlagerType: this.enlagerType,
        }
        this.processELK(params)
        //异常校验
        if (this.errorHandler(data)) {
          return
        }

        const transId = data.data.trans_id
        this.currentImage.transId = transId
        //完善工作任务数据
        this.work.transId = transId
        this.saveToRealTimeMap && this.saveToRealTimeMap(transId, config)
        // this.work.originImageUid = this.work.uid

        this.work.config = { ...this.work.config, ...config }
        this.requestTransform = false
        //完善工作任务数据end
        await new Promise((resolve, reject) => {
          if (this.queueImprove) {
            this.getProcesseds()
          }
          this.handleNext = false
          this.getProcessingProgress(transId, resolve, reject)
        }, this.intervalTime)
        this.tansIdModel({ transId: this.work.transId, model_name: this.work.elk.model_name })
        this.afterProcessed(transId)
      } catch (e) {
        this.isDownload = false
        this.processStep = this.processStepMap.error
        this.requestTransform = false
        console.log(e)
      } finally {
        this.processLoading = false
        this.requestTransform = false
      }
    },
    errorHandler(data) {
      if (!this.verificationMoney(data)) {
        this.processLoading = false
        this.isDownload = false
        this.processStep = this.processStepMap.error
        return true
      }
      return false
    },
    afterProcessed(transId) {
      //loading事件的start状态上报
      this.imgLoadedElk()
      this.work.previewStartTime = Date.now()
      this.work.transId = transId
      //扣点
      this.pointsFun()
      this.onPreview(this.work)

      //处理成功以后自动切换放大比例
      this.selRateFun()
      this.processeds.unshift(this.work)
      this.processedListSaveToLocal()

      // 重新恢复正在执行的任务，执行成功后还是重新请求历史记录更新列表
      this.getProcesseds()

      if (this.work.selectedModel) {
        this.processedModels[this.work.selectedModel] = transId
      }
    },
    handleHistoryItemClick(item) {
      // 是否继续处理旧逻辑
      let continueOldHandler = false
      this.requestTransform = false
      if (item.processStatus === 'progress' || item.processStatus === 'busy') {
        this.handleHistoryProcessing(item.transId)
      } else if (item.processStatus === 'fail') {
        this.handleHistoryFail()
      } else {
        this.handleHistorySuccess()
        continueOldHandler = true
      }
      return continueOldHandler
    },
    handleHistoryProcessing(transId) {
      this.work.afterImg = ''
      this.handleNext = false
      this.processStep = this.processStepMap.processing
      this.work = this.initWork(this.work)
      this.work.transId = transId
      this.getCredit()
      //菜单选择项调整
      this.selMenuConfig && this.selMenuConfig(transId)
      this.getProcessingProgress(
        transId,
        () => {
          this.afterProcessed(transId)
        },
        () => {
          this.handleHistoryFail()
        }
      )
    },
    handleHistoryFail() {
      this.work.afterImg = ''
      this.handleNext = false
      this.processStep = this.processStepMap.error
    },
    handleHistorySuccess() {
      this.processNext()
      // 点到已完成的时候也要更新下历史记录，如果有正在执行的就可以重新出发历史记录轮询
      this.getProcesseds()
    },
    getWorkerCount() {
      this.$axios.post(servers.service + '/api/v2/worker/count').then((res) => {
        if (res.code == 200) {
          this.workerCount = res.data.workerCount
        }
      })
    },

    async getWorkNamePoint(workName) {
      if (this.workPoint[workName]) {
        this.handle_point = this.workPoint[workName].handle_point
        this.download_point = this.workPoint[workName].download_point
        return
      }
      try {
        const res = await Work.getWorkInfo(workName)
        if (res.data.code == 200 && res.data.data) {
          // return {
          //   handle_point: res.data.data.handle_point,
          //   download_point: res.data.data.download_point,
          //   success: true,
          // }
          this.handle_point = Number(res.data.data.handle_point || 0)
          this.download_point = Number(res.data.data.download_point || 0)
          this.workPoint[workName] = {
            handle_point: Number(res.data.data.handle_point || 0),
            download_point: Number(res.data.data.download_point || 0),
          }
        }
      } catch (err) {
        console.log('getWorkNamePoint-------------err', err)
      }
    },

    async onStartProcessV2(workName, options, extendsElkParams) {
      console.log('async onStartProcessV2')

      const { canStart } = await this.checkProcessStart()
      if (!canStart) {
        return
      }

      this.initProcess()

      this.work = this.initWork(this.work) //todo 部分处理config

      // this.generateParams(this.work) //todo 处理config
      // this.addNewParams(this.work) //todo 处理config
      // this.workConfigurationPreprocessing(this.work, true) //todo 处理config
      // //输出参数设置
      // this.setOutParams(this.work) //todo 处理config
      // this.delWebKey(this.work) //todo 处理config
      // this.calulateSacle(this.work) //todo 处理config
      // todo 存储到本地的是否还需要
      if (this.work.sample) {
        this.processStep = this.processStepMap.processing
        this.uploadList.unshift({ originImg: this.work.originImg, w: this.work.w, h: this.work.h })
        this.getProgressAndStartNextForSample(this.work)
        if (this.resetSampleFun) {
          this.resetSampleFun()
        }
        return
      }
      this.processStep = this.processStepMap.upload
      let maskUid = ''
      if (this.maskImageUrl && this.maskHistory.length) {
        //maskUid = await this.getMaskUid(this.maskHistory[this.maskHistory.length - 1].uploadUrl)
        const maskBase64 = await convertToMask(this.maskImageUrl)
        maskUid = await this.uploadMask(maskBase64, 'mask.png', {
          job: this.work.params.job,
        })
      }
      // todo 需要处理work的参数
      await this.getUidV2({ work: this.work }, workName)

      const workConfig = options

      // todo
      // const config = this.processExtendParams(this.work.uid, { ...this.work.new_params })
      this.processStep = this.processStepMap.processing
      // todo 处理workflow工作流问题
      // this.freeUserProcessRecord()
      if (!this.$getCookie('token')) {
        if (
          !(this.work.elkJob === 'repair' || this.work.elkJob === 'old_photo_restorer2') &&
          this.$getCookie('leftCredits') <= 0
        ) {
          //游客积分不足
          this.notPoint = true
          this.isProcess = true
          this.registerAndSubscribeVisible = true
          this.noCreditsPopupELK()
          this.processLoading = false
          this.processStep = this.processStepMap.error
          return
        }
      }
      this.processCountELK()
      try {
        // todo 处理这个方法直接获取config startWorkCommonApi
        const requirePngWorks = [WorkFlowType.matting, WorkFlowType.paddle_matting]
        workConfig.input_params = {
          type: 'file',
          uid: this.work.uid,
        }
        workConfig.out_params = this.work.out_params
        const transformParams = {
          jconfig: JSON.stringify(workConfig),
          extra: {
            dst_file_name: this.setFileName(
              this.work.filename,
              requirePngWorks.includes(workName) ? 'png' : this.outSettingConfig.format
            ),
          },
        }
        if (options.scale) {
          transformParams.extra.scale = options.scale
        }
        if (maskUid) {
          transformParams.extra.mask_uid = maskUid
        }
        let jobTimelines
        if (this.formatJobTimelines) {
          jobTimelines = this.formatJobTimelines()
          transformParams.extra.job_timelines = JSON.stringify(jobTimelines)
        }
        transformParams.extra = JSON.stringify(transformParams.extra)
        this.setTime && this.setTime('pre_process', 'end')

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_status: 'start',
          },
        })
        this.work.startTime = Date.now()
        const { data } = await Work.startWorkCommonApiV2(transformParams)
        //异常校验
        if (this.errorHandler(data)) {
          return
        }
        // todo
        // this.preImageOriginUid = this.work.uid
        this.getOutSetting() // todo 待分析

        // todo work elk
        this.processELKV3(workConfig, { transId: data.data.trans_id }, extendsElkParams)

        //异常校验
        if (this.errorHandler(data)) {
          return
        }

        const transId = data.data.trans_id
        this.saveToRealTimeMap && this.saveToRealTimeMap(transId, workConfig)
        this.currentImage.transId = transId
        //完善工作任务数据
        this.work.transId = transId
        this.work.workName = workName
        // this.work.originImageUid = this.work.uid

        this.work.config = workConfig
        this.requestTransform = false
        //完善工作任务数据end
        await new Promise((resolve, reject) => {
          if (this.queueImprove) {
            this.getProcesseds()
          }
          this.handleNext = false
          this.getProcessingProgress(transId, resolve, reject)
        }, this.intervalTime)
        // todo 待确认作用
        this.tansIdModel({ transId: this.work.transId, model_name: this.work.elk.model_name })
        this.afterProcessed(transId)
      } catch (e) {
        this.isDownload = false
        this.processStep = this.processStepMap.error
        console.log(e)
      } finally {
        this.processLoading = false
      }
    },

    tansIdModel(req) {
      let tansId_modelJson = localStorage.getItem(TRANSID_MODAL)
      if (tansId_modelJson) {
        tansId_modelJson = JSON.parse(tansId_modelJson)
      } else {
        tansId_modelJson = {}
      }
      tansId_modelJson[req.transId] = req.model_name
      try {
        localStorage.setItem(TRANSID_MODAL, JSON.stringify(tansId_modelJson))
      } catch (e) {
        localStorage.removeItem(TRANSID_MODAL)
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'cloud',
          event_value: 'localstorage_quota_exceeded',
          event_info: {
            token: this.$getCookie('token'),
            guestTokenV2: this.$getCookie('guestTokenV2'),
            email: this.$getCookie('email'),
            key: TRANSID_MODAL,
          },
        })
      }

      let tansId_model_btn = localStorage.getItem(TRANS_MPDAL_BTN)
      if (tansId_model_btn) {
        tansId_model_btn = JSON.parse(tansId_model_btn)
      } else {
        tansId_model_btn = {}
      }
      tansId_model_btn[req.transId] = this.enlagerType
      try {
        localStorage.setItem(TRANS_MPDAL_BTN, JSON.stringify(tansId_model_btn))
      } catch (e) {
        localStorage.removeItem(TRANS_MPDAL_BTN)
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'cloud',
          event_value: 'localstorage_quota_exceeded',
          event_info: {
            token: this.$getCookie('token'),
            guestTokenV2: this.$getCookie('guestTokenV2'),
            email: this.$getCookie('email'),
            key: TRANS_MPDAL_BTN,
          },
        })
      }
    },
    getProgressAndStartNextForSample(work) {
      this.work.startTime = Date.now()
      setTimeout(() => {
        work.endTime = Date.now()
        this.work.endTime = Date.now()
        this.work.afterImg = this.work.targetImg
        const time = parseInt((work.endTime - work.startTime) / 1000)
        this.sampleProcessSuccess(work.selIndex, work.transId, time)
        parseInt((work.endTime - work.startTime) / 1000)
        this.processCountELK()
        this.onPreview(this.work)
        this.processeds.unshift(this.work)
        this.processedListSaveToLocal()
        this.isDownload = true
        this.processLoading = false
        this.processStep = this.processStepMap.processed
      }, 4000)
    },
    processedListSaveToLocal() {
      if (!this.logged) {
        localStorage.setItem('processeds', JSON.stringify(this.processeds))
      }
    },
    generateProcessELKParams() {
      let process_type = this.work.elkJob,
        process_params = '',
        model_name = '',
        module = ''
      if (Array.isArray(this.work.params.config)) {
        module = this.work.params.config[0].config.module
        if (process_type !== Work.typeDehaze) {
          model_name = this.work.params.config[0].config.module_params.model_name
          process_params = this.work.params.config[0].config.module_params
        }

        if (model_name === 'PortraitEnhancer_v1.2') {
          model_name = this.work.params.config[1].config.module_params.model_name
          process_params = this.work.params.config[1].config.module_params
        }
        if (process_type === Work.typeRepair) {
          model_name = 'workflow_repair'
          process_params = WorkFlowConfig(WorkFlowType.repair)
        }
        if (process_type === Work.typeSketch) {
          if (this.work.params.config[0].config.module_params.auto_mode) {
            model_name = 'workflow_sketch'
          }
        }
      } else {
        module = this.work.params.config.config.module
        if (process_type === Work.typeWaifu && this.work.params.config.config.module === 'real_esrgan') {
          process_type = Work.typeRealesrgan
        }
        if (process_type !== Work.typeDehaze) {
          model_name = this.work.params.config.config.module_params.model_name
          process_params = this.work.params.config.config.module_params

          // if (
          //   process_type === Work.sharpen2_general &&
          //   cutoutCityList.includes(localStorage.getItem(COUNTRY)) &&
          //   ['en', 'ja'].includes(this.$store.state.locale)
          // ) {
          //   model_name = 'SharpenGeneralStable'
          //   process_params = {
          //     module: 'sharpen2',
          //     module_params: {
          //       model_name: 'SharpenGeneralStable',
          //       blur_type: 1,
          //       remove_blur: 0.06, //参数值 （0~1）s
          //       suppress_noise: 0.15, //参数值 （0~1）
          //       remove_artifacts: 0.05, //SharpenGeneralStable选这个参数,参数值 （0~1）
          //       autoparams: false,
          //       model_switch: 'vance_cop',
          //     },
          //   }
          // }
        }
        if (process_type === Work.typeChainnerTxt) {
          process_type = Work.typeChainner
        }
        if (process_type === Work.typeEnlarge2) {
          process_type = Work.typeEnlarge
        }
        if (this.work.params.config.config.module === Work.typeSketch) {
          if (this.work.params.config.config.module_params.auto_mode) {
            model_name = 'workflow_sketch'
          } else {
            model_name = 'SketchStable'
          }
        } else if (this.work.params.config.config.module === Work.typeRepair) {
          if (this.work.params.config.config.module_params.convert) {
            model_name = 'workflow_repair_colorize'
          } else {
            if (this.work.params.config.config.module_params.auto_mode) {
              model_name = 'workflow_repair'
            } else {
              model_name = 'RepairStable'
            }
          }
        }
      }
      const moduleIsModelName = ['animegan2c']
      this.work.elk = {
        process_type,
        process_id: this.work.transId,
        process_method: 'single',
        process_steps: 0,
        model_name: moduleIsModelName.includes(module) ? module : model_name,
        process_params: JSON.stringify(process_params),
      }
    },
    freeUserProcessRecord() {
      console.log('freeUserProcessRecord', this.work.params.config)
      const notPaying = this.$getCookie('userType') !== 'paying'
      if (!this.$getCookie('token') || notPaying) {
        const workConfig = this.work.params.config
        //工作流
        if (workConfig.job === 'workflow') {
          this.$setCookie('cloud_workflow_elk', '1', '365') //功能名称
        } else {
          this.$setCookie('cloud_workflow_elk', '0', '365') //功能名称
          this.$setCookie('cloud_process_type_final', localStorage.getItem('type'), '365') //功能名称
          const moduleIsModelName = ['animegan2c']
          //不是工作流
          if (Array.isArray(workConfig)) {
            const { config } = workConfig[0]
            if (config) {
              this.$setCookie(
                'cloud_model_name_final',
                moduleIsModelName.includes(config.module) ? config.module : config.module_params.model_name,
                '365'
              ) //模型名称
            }
          } else {
            //工作流
            this.$setCookie(
              'cloud_model_name_final',
              moduleIsModelName.includes(workConfig.config.module)
                ? workConfig.config.module
                : workConfig.config.module_params.model_name,
              '365'
            ) //功能名称
          }
        }
      }
    },
    onSubscribe() {
      window.location.href =
        this.$store.state.mainWebsite +
        this.$store.state.specialLocaleLink +
        '/pricing?source=downloading_popup&location=download_subscribe&automaticprice=1'
      // this.subscribeDialogVisible = true 唤起支付弹窗
    },
    processNext() {
      this.handleNext = true
      this.busyJobs = 0
      this.process_time = 0

      this.$trace.traceCustomEvent({
        event: 'click',
        xargs_event_category: 'general_click',
        event_value: 'workspace_queue_upload',
      })
    },
    getProcessingProgress(transId, resolve, reject) {
      // 排队时直接处理下一张图，停止此次轮询
      if (this.handleNext || transId !== this.work.transId) {
        this.handleNext = false
        return
      }
      // 排队优化的工作台轮询同时更新左侧历史记录

      Work.getProgressV2({ trans_id: transId }).then((res) => {
        res = res.data
        let experienceTime = null
        const { status, content, process_time } = res.data
        if (res.code === 200) {
          this.process_time = process_time
          if (status === 'busy') {
            this.busyJobs = Number(JSON.parse(content).data) || 0
          } else {
            this.busyJobs = 0
          }
          // 激活正在处理或者排队时，仅轮询了progress，没有轮询历史记录，通过progress更新
          if (status === 'progress' || status === 'busy' || status === 'fatal') {
            if (this.queueImprove) {
              // 测试参数
              const { count, isPay } = this.$route.query
              if (count) {
                this.queryQueueParams = {
                  count,
                  isPay: isPay === 'true',
                }
                this.busyJobs = parseInt(count)
                this.process_time = 100
              }
              let hasActiveTaskInHistory = false
              this.processeds = this.processeds.map((item) => {
                if (item.transId === transId) {
                  item.processStatus = status === 'fatal' ? 'fail' : status
                  item.busyJobs = this.busyJobs
                  item.process_time = this.process_time
                  item.byProgress = true
                  hasActiveTaskInHistory = true
                }
                return item
              })
              // 第一次没有更新出当前执行任务时，再次更新历史记录
              if (!hasActiveTaskInHistory) {
                this.getProcesseds()
              }
            }
          }
          if (res.data.status === 'finish') {
            this.work.endTime = Date.now()
            const time = ((this.work.endTime - this.work.startTime) / 1000).toFixed(2)
            if (this.clickStartTime) {
              experienceTime = ((this.work.endTime - this.clickStartTime) / 1000).toFixed(2)
            }
            // 点击了其他任务，再还原处理的不能取到初始参数，不进行成功上报
            if (this.work.elk) {
              this.processSuccessELK(this.work, {
                time,
                workspaceUrl: this.workspaceUrl,
                experienceTime,
              })
            }

            this.work.filesize = res.data.filesize
            this.processStep = this.processStepMap.processed
            this.isDownload = true
            if (!this.$getCookie('cloud_close_app_d_t')) {
              this.showDownloadAppTip = true
            }

            this.processLoading = false
            if (this.$getCookie('leftCredits')) {
              let leftcredits = parseInt(this.$getCookie('leftCredits'))
              leftcredits--
              this.$setCookie('leftCredits', String(leftcredits), 365)
            }
            if (this.$getCookie('userType') === 'guest') {
              const usedWorkNum = parseInt(this.$getCookie('cloud_usedWorkNum'))
              if (usedWorkNum) {
                if (usedWorkNum > 0) {
                  this.$trace.traceCustomEvent({
                    event: 'click',
                    xargs_event_category: 'other',
                    event_info: {
                      guest_trial: usedWorkNum > 6 ? 6 : usedWorkNum + 1,
                    },
                  })
                } else {
                  this.$trace.traceCustomEvent({
                    event: 'click',
                    xargs_event_category: 'other',
                    event_info: {
                      guest_trial: 1,
                    },
                  })
                }
              } else {
                this.$trace.traceCustomEvent({
                  event: 'click',
                  xargs_event_category: 'other',
                  event_info: {
                    guest_trial: 1,
                  },
                })
              }
            } else if (this.$getCookie('userType') === 'register') {
              this.$trace.traceCustomEvent({
                event: 'click',
                xargs_event_category: 'other',
                event_info: {
                  free_user_trial: 6 - this.userInfo.leftCredits,
                },
              })
            }
            resolve()
          } else if (res.data.status === 'fatal') {
            this.work.endTime = Date.now()
            const time = ((this.work.endTime - this.work.startTime) / 1000).toFixed(2)
            if (this.clickStartTime) {
              experienceTime = ((this.work.endTime - this.clickStartTime) / 1000).toFixed(2)
            }
            this.processFailELK(this.work, { time, experienceTime })
            reject()
          } else {
            this.processTime = setTimeout(() => {
              this.getProcessingProgress(transId, resolve, reject)
            }, this.intervalTime)
          }
        } else {
          this.work.endTime = Date.now()
          const time = ((this.work.endTime - this.work.startTime) / 1000).toFixed(2)
          if (this.clickStartTime) {
            experienceTime = ((this.work.endTime - this.clickStartTime) / 1000).toFixed(2)
          }
          this.processFailELK(this.work, { time, experienceTime, reason: res.content })
          reject()
        }
      })
    },

    getAiConfig(work) {
      console.log('getAiConfig')
      const config = work.params
      let config_temp
      if (config) {
        // if (work.params) {
        //   for (const key in work.params) {
        //     config.module_params[key] = work.params[key]
        //   }
        // }
        if (Array.isArray(config)) {
          const length = config.length
          config[length - 1]['config']['out_params'] = this.getOutParams()
          config_temp = {
            config,
            name: work.elkName || work.elkJob,
            job: work.elkJob,
          }
        } else {
          config['config']['out_params'] = this.getOutParams()
          config_temp = {
            ...config,
            name: config.elkName || work.elkName || work.elkJob,
            job: work.elkJob,
          }
        }
        if (
          work.operation === WorkFlowType.matting ||
          work.operation === WorkFlowType.onlyMatting ||
          work.operation === WorkFlowType.paddle_matting
        ) {
          config.zoomType = 1
        }
        return config_temp
      } else {
        return ''
      }
    },
    getOutParams() {
      const result = {}
      for (const key in this.outSettingConfig) {
        if (this.outSettingConfig[key] != 'default') {
          if (this.outSettingConfig[key] == 'custom') {
            result[key] = this.outSettingConfig['custom']
          } else {
            result[key] = this.outSettingConfig[key]
          }
        }
      }
      delete result.isRemerber
      delete result.custom
      return result
    },
    async getUid({ work = {} }) {
      let uid = this.prepareUid || work.uid
      console.log('work', work)
      //含有transid 直接转化uid
      if (!uid) {
        //上传转化uid
        this.prepareUid = ''
        const uploadImgData = await this.uploadImg(work)
        uid = uploadImgData.uid
      }
      if (!this.currentImage.uid) {
        this.currentImage.uid = uid
      }

      work.uid = uid
      return uid
    },
    setFileName(filename, type) {
      if (type && type !== 'default') {
        return filename.replace(/\.(jpg|png|jpeg|gif)$/, '.' + type).toLowerCase()
      }
      return filename.toLowerCase()
    },
    /**
     * @pointsFun 扣点流程
     */
    pointsFun() {
      this.getPoint()
    },
    generateParams(work) {
      work.operation = work.name || work.elkJob
      work.params = {
        config: work.params,
        name: work.elkName || work.elkJob,
        job: work.elkJob,
      }
      //兼容bg工作台的传参
      if (work.elkName == 'matting') {
        work.params.activeName = work.activeName
        work.params.elkJob = work.elkName
      }
      if (work.isStandardConfig) {
        return
      }
      work.config.scale = 1
      if (Array.isArray(work.params.config)) {
        // 兼容多config情况
        if (work.operation === WorkFlowType.sharpen) {
          work.config.sharpenBeta = 'manual'
        } else if (work.operation === WorkFlowType.sharpen_auto) {
          work.config.sharpenBeta = 'auto'
        } else if (work.operation === WorkFlowType.colorize || work.operation === WorkFlowType.colorize_pro) {
          work.config.quality = work.operation === WorkFlowType.colorize ? 'high' : 'best'
          work.config.isPsd = work.params.config[0].config.module_params.psd
          if (work.params.config[0].config.module_params.convert === undefined) {
            work.params.config[0].config.module_params.convert = this.convert
          } else {
            this.convert = work.params.config[0].config.module_params.convert
          }
          if (work.params.config[0].config.module_params.convert) {
            work.config.convert = {
              source: 'gray',
            }
            delete work.params.config[0].config.module_params.convert
          } else {
            delete work.params.config[0].config.convert
            delete work.params.config[0].config.module_params.convert
          }
        } else if (work.operation === WorkFlowType.portrait) {
          work.config.singleFace = work.params.config[0].config.module_params.single_face ? 'face' : 'entire'
        } else if (work.operation === WorkFlowType.sketch) {
          work.config.singleFace = work.params.config[0].config.module_params.single_face ? 'face' : 'entire'
          work.config.sigma = work.params.config[0].config.module_params.sigma
          work.config.alpha = work.params.config[0].config.module_params.alpha
        } else if (work.operation === WorkFlowType.enlarge) {
          const filter = work.params.config.filter((item) => item.config.module_params.scale)
          work.config.scale = filter.length ? parseInt(filter[0].config.module_params.scale) : 1
        } else if (work.operation === WorkFlowType.waifu) {
          const filter = work.params.config.filter((item) => item.config.module_params.scale)
          work.config.scale = filter.length ? parseInt(filter[0].config.module_params.scale) : 1
        } else if (work.operation === WorkFlowType.real_esrgan) {
          const filter = work.params.config.filter((item) => item.config.module_params.scale)
          work.config.scale = filter.length ? parseInt(filter[0].config.module_params.scale) : 1
        }
      } else {
        if (work.operation === WorkFlowType.sharpen) {
          work.config.sharpenBeta = 'manual'
        } else if (work.operation === WorkFlowType.sharpen_auto) {
          work.config.sharpenBeta = 'auto'
        } else if (work.operation === WorkFlowType.colorize || work.operation === WorkFlowType.colorize_pro) {
          work.config.quality = work.operation === WorkFlowType.colorize ? 'high' : 'best'
          work.config.isPsd = work.params.config.module_params.psd
          if (work.params.config.module_params.convert === undefined) {
            work.params.config.module_params.convert = this.convert
          } else {
            if (work.params.module_params) {
              this.convert = work.params.module_params.convert
            }
          }
          if (work.params.config.module_params.convert) {
            work.config.convert = {
              source: 'gray',
            }
            delete work.config.module_params.convert
          } else {
            delete work.config.convert
            if (work.config.module_params) {
              delete work.config.module_params.convert
            }
          }
        } else if (work.operation === WorkFlowType.portrait) {
          work.config.singleFace = work.params.config.module_params.single_face ? 'face' : 'entire'
        } else if (work.operation === WorkFlowType.sketch) {
          work.config.singleFace = work.params.config.module_params.single_face ? 'face' : 'entire'
          work.config.sigma = work.params.config.module_params.sigma
          work.config.alpha = work.params.config.module_params.alpha
        } else if (work.operation === WorkFlowType.enlarge) {
          if (work.params.config.module_params.customize) {
            work.config.scale = work.params.config.module_params.width / work.w
          } else {
            work.config.scale = parseInt(work.params.config.module_params.scale)
          }
        } else if (work.operation === WorkFlowType.waifu) {
          work.config.scale = parseInt(work.params.config.module_params.scale)
        } else if (work.operation === WorkFlowType.real_esrgan) {
          work.config.scale = parseInt(work.params.config.module_params.scale)
        }
      }
      isNaN(work.config.scale) && (work.config.scale = 1)
      const requirePngWorks = [WorkFlowType.matting, WorkFlowType.paddle_matting]
      work.dst_file_name = this.setFileName(
        this.work.filename,
        requirePngWorks.includes(work.operation) ? 'png' : this.outSettingConfig.format
      )
    },
    /**
     * @verificationMoney 余额校验
     */
    verificationMoney(reqData) {
      //余额不足
      if (reqData.code === 10012 || reqData.code === 40011) {
        this.noCreditsPopupELK()
        this.notPoint = true
        this.isProcess = true
        this.registerAndSubscribeVisible = true
        return false
      } else if (reqData.code !== 200) {
        //处理失败
        return false
      } else if (reqData.code === 200) {
        this.firstProcessELK(reqData.data.trans_id)
        const usedWorkNum = parseInt(this.$getCookie('cloud_usedWorkNum'))
        if (usedWorkNum) {
          if (usedWorkNum > 0) {
            this.$setCookie('cloud_usedWorkNum', usedWorkNum + 1)
          } else {
            this.$setCookie('cloud_usedWorkNum', 1)
          }
        } else {
          this.$setCookie('cloud_usedWorkNum', 1)
        }
      }
      return true
    },
    /**
     * @identityCheck 用户身份校验
     */
    identityCheck() {
      if (this.$getCookie('token')) {
        return true
      }
      //提示用户登录
      setLoginDialogShow()
      return false
    },
    initWork(work) {
      return {
        ...work,
        afterImg: work.afterImg,
        u_uid: work.cid,
        cid: Date.now() + Math.random().toString(16),
        //operation: this.config.operation,
        status: Work.statusReady,
        //
        startTime: 0,
        endTime: 0,
        checked: false,
        config: {
          isPsd: false,
          //scale: this.config.operation === Work.typeEnlarge ? 2 : 1,
          //sharpenBeta: this.config.sharpenBeta,
          //quality: this.config.quality,
          //singleFace: this.config.singleFace,
        },
        //
        selected: false,
        // isProcessed: false,
        transId: '',
        jobId: '',
        targetName: '',
        dstFileId: '',
        likes: 0,
        // only for matting zoom
        zoomTransId: '',
        zoomJobId: '',
        zoomTargetName: '',
        zoomDstFileId: '',
        out_params: this.getOutParams(),
      }
    },
    onDownloadBefore(download = true) {
      // if (this.work.filesize / 1024 / 1024 > 20) {
      //   this.downloadDialogVisible = true
      // } else {
      return this.onDownload(download)
      // }
    },
    beginDownloadImage() {
      if (this.waitingDownload) {
        this.waitingDownload = false
        this.onDownloadBefore()
      }
    },
    async onDownload(download = true) {
      console.log('onDownload')
      if (this.work.sample) {
        const src = Work.downloadSampleUrl(
          this.work.elkJob,
          this.work.uid,
          'processed',
          this.work.config.scale
        )

        if (download) {
          const _link = document.createElement('a')
          _link.href = src
          _link.click()
        }
        this.downloadImgELK(this.work.elkJob, '', {
          crop_img: this.work.crop_img,
          workspaceUrl: this.workspaceUrl,
        })
        this.registerDownloadImgELK()
        return Promise.resolve(src)
      }
      this.downloadFlag = download
      // windows免费用户 可以不扣积分下载素描及卡通工作台小图
      if (this.$getCookie('token')) {
        return await this.onDownloadUrl(this.work)
      } else {
        if (download) {
          this.waitingDownload = true
        }
        this.guestDownloadELK(
          this.work.elkJob,
          {
            crop_img: this.work.crop_img,
            workspaceUrl: this.workspaceUrl,
          },
          this.work
        )
        this.guestDownloadPopupELK()
        this.$setCookie('cloud_download_for_workspace', '1')
        //提示用户登录
        setLoginDialogShow()
        return Promise.resolve()
      }
    },
    onDownloadUrl(work) {
      //裁剪完立即点下载的场景
      if (!work.transId) {
        return
      }
      if (this.isPaied && this.downloadFlag) {
        this.minLoading = true
      }
      this.downloadLoading = true
      let tansId_modelJson = localStorage.getItem(TRANSID_MODAL)
      if (!tansId_modelJson) {
        tansId_modelJson = {}
      } else {
        tansId_modelJson = JSON.parse(tansId_modelJson)
      }

      let tansId_model_btn = localStorage.getItem(TRANS_MPDAL_BTN)
      if (!tansId_model_btn) {
        tansId_model_btn = {}
      } else {
        tansId_model_btn = JSON.parse(tansId_model_btn)
      }

      this.downloadImgELK(
        work.elkJob,
        tansId_modelJson[work.transId],
        {
          crop_img: this.work.crop_img,
          workspaceUrl: this.workspaceUrl,
        },
        tansId_model_btn[work.transId],
        work
      )
      this.registerDownloadImgELK()
      return new Promise((resolve, reject) => {
        Work.pointCheck({ trans_ids: [work.transId] })
          .then((res) => {
            // windows免费用户 可以不扣积分下载素描及卡通工作台小图
            if (res.code === 200 || this.isWindowsFreeUser) {
              // 初始化点数判断
              this.notPoint = false

              this.pointsFun()
              if (!this.isPaied && this.$store.state.client === 'win') {
                this.recommendDownloadVisible = true
              }
              const time = this.isPaied || this.$store.state.client !== 'win' ? 0 : 3000
              let issrc = 0
              // windows免费用户 可以不扣积分下载素描及卡通工作台小图
              if (this.isWindowsFreeUser) {
                issrc = 3
              }
              setTimeout(async () => {
                const { presignUrl: imageUrl, extra } = await getDownloadUrlFromS3(work.transId, issrc)
                const { downloadFileName } = JSON.parse(extra || '{}')
                getCredits()
                if (this.downloadFlag) {
                  this.freeUserDownloadingPopup(this.$getCookie('userType'))
                  //S3下载
                  const isDownloaded = await browserDownload(imageUrl, downloadFileName)
                  if (isDownloaded) {
                    if (this.userType === user_level.paying) {
                      //引导点赞弹窗
                      if (!this.$getCookie('cloud_ratedialog')) {
                        this.fabulousWin = true
                      }
                    }
                    resolve(imageUrl)
                  } else {
                    this.$message.error(this.$t('下载失败了'))
                  }
                } else {
                  //S3下载
                  return resolve(imageUrl)
                }
                setTimeout(() => {
                  this.getPoint(() => {
                    if (this.userType === user_level.paying) {
                      //引导点赞弹窗
                      if (!this.$getCookie('cloud_ratedialog')) {
                        this.fabulousWin = true
                      }
                    }
                    resolve()
                  })
                }, 2000)
              }, time)

              // todo 暂时此方法解决，未完善
            } else if (res.code === 30004) {
              this.notPoint = true
              this.registerAndSubscribeVisible = true
              this.noCreditsPopupELK()
              reject()
            }
          })
          .catch(() => {
            reject()
          })
      }).finally(() => {
        setTimeout(() => {
          this.minLoading = false
          this.downloadLoading = false
        }, 2000)
      })
    },
    sizeFun(req) {
      return fileSizeFun(req)
    },
  },
}
