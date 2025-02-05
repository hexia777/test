import servers from '@/static/config/common/server.config'
import axios from '@/static/script/request/axios'
import { deepClone } from '@/static/script/utils'
import { WorkFlowType } from '@/static/script/workflow_util'
import { getCookie, setCookie } from 'static/script/utils'

const web = 'vanceai'

const typeEnlarge = 'enlarge'
const typeEnlarge2 = 'enlarge2'
const typeEnlarge3 = 'enlarge3'
const typeEnlargeClarity = 'enlarge_clarity'
const typeChainner = 'chainner'
const typeChainnerTxt = 'chainner_txt'
const typeDenoise = 'denoise'
const typeSharpen = 'sharpen'
const typeOnlySharpen = 'onlySharpen'
const typeOnlyPortrait = 'onlyPortrait'
const typeOnlyWaifu = 'onlyWaifu'
const typeMatting = 'matting'
const typeOnlyMatting = 'onlyMatting'
const typeColorize = 'colorize'
const typePortrait = 'portrait'
const typeCartoonize = 'cartoonize'
const typePerfect = 'perfect'
const typeCompress = 'compress'
const typeRepair = 'repair'
const typeWaifu = 'waifu'
const typeJpegArtifact = 'jpeg_artifact'
const typeWorkflow = 'workflow'
const typeSeNight = 'se-night'
const typeSeHD = 'se-hd'
const typeSeOldRepair = 'se-old-repair'
const typeSePortEnhancement = 'se-portrait-enhancement'
const typeSketch = 'sketch'
const typeNewSketch = 'artLine'
const typeRealesrgan = 'real_esrgan'
const typeAnimegan = 'animegan'
const typeDehaze = 'se-dehazing'
const typeDebouncing = 'debouncing'
const typeBrightness = 'brightness'
const typeDeblur = 'deblur'
const typePassport = 'passport'
const typePortraitEnhancer = 'portrait_enhancer'
const typeRealesrgan2 = 'real_esrgan2'
const typeInpaint = 'inpaint'
const typePaddleMatting = 'pd_matting'
const typeSharpen2General = 'sharpen2_general'
const typeSharpen2MotionBlur = 'sharpen_mb'
const typeSharpen2LensBlur = 'sharpen_lb'
const typeSharpen2SortNormal = 'sharpen_sb'
const typeAnimegan2c = 'animegan2c'
const typeDeoldify2 = 'deoldify2'
const typeAnimeganToon = 'animegan_toon'
const typeEnhancer = 'enhancer'
const typeEnhancerCop = 'enhancer_cop'
const typeSharpenCop = 'sharpen_cop'
const typeSharpen3 = 'va_sharpen_standard'
const typeOldPhotoRestorerV2 = 'old_photo_restorer2'
const typeEnlarge3_96 = 'enlarge3_96'
const typeLineColor = 'linecolor'
const typeEnlargeSr = 'enlarge_sr'
// STEP 1: add new work type

const workTypeDict = {
  typeEnlarge3,
  typeEnlargeClarity,
  typeSharpen3,
  typeSharpenCop,
  typeEnhancerCop,
  typeAnimegan2c,
  typeDeoldify2,
  typeAnimeganToon,
  typeSharpen2SortNormal,
  typeSharpen2LensBlur,
  typeSharpen2MotionBlur,
  typeSharpen2General,
  typeEnlarge,
  typeEnlarge2,
  typeChainner,
  typeChainnerTxt,
  typeDenoise,
  typeSharpen,
  typeOnlySharpen,
  typeOnlyWaifu,
  typeOnlyPortrait,
  typeMatting,
  typeColorize,
  typePortrait,
  typeCartoonize,
  typePerfect,
  typeCompress,
  typeRepair,
  typeWaifu,
  typeJpegArtifact,
  typeWorkflow,
  typeSeNight,
  typeSeHD,
  typeSeOldRepair,
  typeSePortEnhancement,
  typeSketch,
  typeNewSketch,
  typeRealesrgan,
  // STEP 2: add new work type
  typeAnimegan,
  typeDebouncing,
  typeDehaze,
  typeBrightness,
  typeDeblur,
  typePassport,
  typePortraitEnhancer,
  typeRealesrgan2,
  typeInpaint,
  typePaddleMatting,
  typeOnlyMatting,
  typeEnhancer,
  typeOldPhotoRestorerV2,
  typeEnlarge3_96,
  typeLineColor,
  typeEnlargeSr,
}

const workTypes = [
  typeEnlarge3,
  typeEnlargeClarity,
  typeSharpen3,
  typeSharpenCop,
  typeEnhancerCop,
  typeAnimegan2c,
  typeDeoldify2,
  typeAnimeganToon,
  typeEnlarge,
  typeEnlarge2,
  typeChainner,
  typeChainnerTxt,
  typeDenoise,
  typeSharpen,
  typeOnlySharpen,
  typeMatting,
  typeColorize,
  typePortrait,
  typeCartoonize,
  typePerfect,
  typeCompress,
  typeRepair,
  typeWaifu,
  typeJpegArtifact,
  typeWorkflow,
  typeSeNight,
  typeSeHD,
  typeSeOldRepair,
  typeSePortEnhancement,
  typeSketch,
  typeRealesrgan,
  typeAnimegan,
  typeDebouncing,
  typeDehaze,
  typeBrightness,
  typeDeblur,
  typePassport,
  typePortraitEnhancer,
  typeRealesrgan2,
  typeInpaint,
  typePaddleMatting,
  typeOnlyWaifu,
  typeOnlyPortrait,
  typeOnlyMatting,
  typeSharpen2SortNormal,
  typeSharpen2LensBlur,
  typeSharpen2MotionBlur,
  typeSharpen2General,
  typeEnhancer,
  typeEnlargeSr,
] // STEP 3: add new work type
/* 开始任务 */
function start(workType, uid, config, workflowId, scale = 1, dst_file_name, otherParams, maskUid) {
  console.log('workType', workType, config)
  //后端根据name从数据库中查询对应的job、kind和dist，前端不需要再传了
  delete config['job']
  delete config['kind']
  delete config['dist']

  const tbl = {}
  tbl[typeEnlarge] = startEnlarge
  tbl[typeEnlarge2] = startEnlarge
  tbl[typeEnlarge3] = startEnlarge
  tbl[typeEnlargeClarity] = startEnlargeClarity
  tbl[typeChainner] = startWork
  tbl[typeChainnerTxt] = startWork
  tbl[typeDenoise] = startWork
  tbl[typeSharpen3] = startSharpen
  tbl[typeSharpen] = startSharpen
  tbl[typeOnlySharpen] = startSharpen
  tbl[typeOnlyPortrait] = startSharpen
  tbl[typeOnlyWaifu] = startWaifu
  tbl[typeMatting] = startWork
  tbl[typeOnlyMatting] = startOnlyMatting
  tbl[typeColorize] = startColorize
  tbl[typePortrait] = startWork
  tbl[typeCartoonize] = startCartoonize
  tbl[typePerfect] = startPerfect
  tbl[typeCompress] = startCompress
  tbl[typeRepair] = startRepair
  tbl[typeWaifu] = startWaifu
  tbl[typeJpegArtifact] = startWork
  tbl[typeWorkflow] = startWorkflow
  tbl[typeSeNight] = startWork
  tbl[typeSeHD] = startWork
  tbl[typeSeOldRepair] = startWork
  tbl[typeSePortEnhancement] = startWork
  tbl[typeSketch] = startSketch
  tbl[typeRealesrgan] = startWork
  tbl[typeAnimegan] = startWork
  tbl[typeDebouncing] = startWork
  tbl[typeDehaze] = startWork
  tbl[typeBrightness] = startWork
  tbl[typeDeblur] = startWork
  tbl[typePassport] = startWork
  tbl[typePortraitEnhancer] = startWork
  tbl[typeRealesrgan2] = startWork
  tbl[typeInpaint] = startInpaint
  tbl[typePaddleMatting] = startWork
  tbl[typeSharpen3] = startWork
  tbl[typeSharpen2SortNormal] = startSharpen2
  tbl[typeSharpen2LensBlur] = startSharpen2
  tbl[typeSharpen2MotionBlur] = startSharpen2
  tbl[typeSharpen2General] = startSharpen2
  tbl[typeAnimegan2c] = startWork
  tbl[typeDeoldify2] = startWork
  tbl[typeAnimeganToon] = startWork
  tbl[typeEnhancerCop] = startWork
  tbl[typeSharpenCop] = startSharpen
  tbl[typeOldPhotoRestorerV2] = oldPhotoRestorerV2
  tbl[typeEnlarge3_96] = enlarge3_96
  tbl[typeLineColor] = startLineColor
  // STEP 4: add new work type & start function map
  if (workType && tbl[workType]) {
    return tbl[workType]({
      uid,
      config,
      workflowId,
      scale,
      dst_file_name,
      workType,
      otherParams,
      maskUid,
    }).then((res) => {
      const use_feature = getCookie('cloud_use_feature')
      if (use_feature) {
        setCookie('cloud_use_feature', Number(use_feature) + 1, 3650)
      } else {
        setCookie('cloud_use_feature', 1, 3650)
      }
      return res
    }).catch((err) => {
      return err
    })
  } else {
    return startWork({ uid, config, workflowId, scale, dst_file_name, workType, otherParams, maskUid }).then(
      (res) => {
        const use_feature = getCookie('cloud_use_feature')
        if (use_feature) {
          setCookie('cloud_use_feature', use_feature + 1, 3650)
        } else {
          setCookie('cloud_use_feature', 1, 3650)
        }
        return res
      }
    )
  }
}
function addAbTestParamToTransform(params) {
  return { ...params, abtest: getCookie('userType') !== 'paying' ? 'b' : 'a' }
}

function startCompress({ uid }) {
  const jconfig = {
    name: 'compress',
    config: {
      module: 'compress',
      module_params: {
        quality: 50,
      },
    },
  }
  const param = {
    uid,
    jconfig: JSON.stringify(jconfig),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(param))
}

function startWork({ uid, config, scale, dst_file_name, workType, otherParams }) {
  config = batchPreProcess(config)
  //移除不需要的属性
  if (!Array.isArray(config.config)) {
    delete config.config.module_params.web_auto_mode
  }
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }

  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

function startSharpen2({ uid, config, scale, dst_file_name, workType, otherParams }) {
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

function startOnlyMatting({ uid, config, scale, dst_file_name, workType, otherParams }) {
  //移除不需要的属性
  if (!Array.isArray(config.config)) {
    delete config.config.module_params.web_auto_mode
  }

  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

function startInpaint({ uid, otherParams, config, scale, dst_file_name, workType }) {
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

function startEnlarge({ uid, config, scale, dst_file_name, workType, otherParams }) {
  config = batchPreProcess(config)
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

function startEnlargeClarity({ uid, config, scale, dst_file_name, workType, otherParams }) {
  config = batchPreProcess(config)
  config.config[0].cn_configs = [
    {
      image_uid: uid,
      cn_name: 'tile_resample',
    },
  ]
  config.config[0].sd_script = 'tiled_diffusion'
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

function startWorkflow({ uid, config, workflowId, scale, dst_file_name, otherParams }) {
  const params = {
    ...otherParams,
    uid,
    scale,
    workflow_id: workflowId,
    dst_file_name,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

/* 私有方法，开始 sharpen 任务 */
function startSharpen({ uid, config, dst_file_name, otherParams }) {
  config = batchPreProcess(config)
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify(config),
  }

  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}

async function startCartoonize({ uid, config, dst_file_name, otherParams }) {
  if (config.config && config.config[0].name === 'img2anime') {
    delete config['config'][0]['cartoon_model_type']
    delete config['config'][0]['process_style_type']
    delete config['config'][0]['ext_params']
    if (config['config'][0]['config'] && config['config'][0]['config']['module_params']['prompt']) {
      const res = await axios.post(servers.service + '/api/tools/translate', {
        text: config['config'][0]['config']['module_params']['prompt'],
      })
      if (res.data.code === 200 && res.data.data) {
        config['config'][0]['config']['module_params']['prompt'] = res.data.data.text
      }
    }
    if (
      ['Ghibli_girl', 'Ghibli_boy', 'shinkai_girl', 'shinkai_boy'].includes(
        config['config'][0]['config']['module_params']['model_name']
      )
    ) {
      config.config[0].name = 'img2anime_no_forge'
      config.name = 'img2anime_no_forge'
    }
    // if (
    //   ['disney_girl', 'disney_boy'].includes(config['config'][0]['config']['module_params']['model_name'])
    // ) {
    //   config.config[0].name = 'img2anime_st'
    //   config.name = 'img2anime_st'
    // }
  }
  const param = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(param))
}

function startImg2sketch({ uid, config, dst_file_name, otherParams }) {
  const param = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', param)
}

async function oldPhotoRestorerV2({ uid, config, dst_file_name, otherParams, maskUid }) {
  config.name = 'repair_sd'
  const deepCopyConfig = deepClone(config)
  if (deepCopyConfig && deepCopyConfig.config) {
    const lastConfig = deepCopyConfig.config[deepCopyConfig.config.length - 1]
    if (lastConfig.name === WorkFlowType.recolor && lastConfig.config.module_params.prompt) {
      const res = await axios.post(servers.service + '/api/tools/translate', {
        text: lastConfig['config']['module_params']['prompt'],
      })
      if (res.data.code === 200 && res.data.data) {
        deepCopyConfig.config[deepCopyConfig.config.length - 1]['config']['module_params']['prompt'] = res.data.data.text
      }
    }
  }

  const param = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify(deepCopyConfig),
    name: 'repair_portrait',
  }
  if (maskUid) {
    param.mask_uid = maskUid
  }
  return axios.post(servers.service + '/api/v2/transform', param)
}

async function startColorize({ uid, config, scale, dst_file_name, workType, otherParams }) {
  config.name = WorkFlowType.colorize
  if (config && config.config) {
    const lastConfig = config.config[config.config.length - 1]
    if (lastConfig.name === WorkFlowType.recolor) {
      config.name = WorkFlowType.recolor
      if (lastConfig['config']['module_params']['prompt']) {
        const res = await axios.post(servers.service + '/api/tools/translate', {
          text: lastConfig['config']['module_params']['prompt'],
        })
        if (res.data.code === 200 && res.data.data) {
          config.config[config.config.length - 1]['config']['module_params']['prompt'] = res.data.data.text
        }
      }
    }
  }

  const param = {
    ...otherParams,
    uid,
    dst_file_name,
    scale,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', param)
}

function enlarge3_96({ uid, config, dst_file_name, otherParams }) {
  config.name = 'enlarge3'
  let scaleTemp = 1
  config.config = config.config.map((item) => {
    const scaleString = item.config.module_params.scale || 1
    const scaleMap = {
      '1x': 1,
      '2x': 2,
      '4x': 4,
      '8x': 8,
    }
    const scale = scaleMap[scaleString] || scaleString || 1
    scaleTemp = scale
    let model_name = `EnlargeStandard_${scale}x_96_Stable`
    if (scale === 8) {
      model_name = `EnlargeStandard_4x_96_Stable`
    }
    return {
      ...item,
      name: 'enlarge3',
      config: {
        ...item.config,
        module: 'enlarge3_96',
        module_params: {
          ...item.config.module_params,
          scale,
          model_name,
        },
      },
    }
  })
  const param = {
    ...otherParams,
    uid,
    name: 'enlarge3',
    dst_file_name,
    jconfig: JSON.stringify(config),
    scale: scaleTemp,
  }
  return axios.post(servers.service + '/api/v2/transform', param)
}

function startLineColor({ uid, config, dst_file_name, otherParams }) {
  config.config[0] = {
    config: config.config[0].config,
    name: 'stable_diffusion',
    cn_configs: [
      {
        image_uid: uid, //原图的uid
        cn_name: 'linecolor_canny',
      },
    ],
  }
  config.name = config.config[0].config.module_params.model_name
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify({ ...config }),
    name: 'linecolor',
  }
  return axios.post(servers.service + '/api/v2/transform', params)
}

function startRepair({ uid, config, dst_file_name, otherParams }) {
  const params = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify({ ...config }),
    name: 'repair_portrait',
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(params))
}
async function startSketch({ uid, config, dst_file_name, otherParams }) {
  //参数整理
  const param = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(param))
}
/* 私有方法，开始 cartoonize 任务 */
function startPerfect({ uid, config, dst_file_name, otherParams }) {
  const param = {
    ...otherParams,
    uid,
    dst_file_name,
    jconfig: JSON.stringify(config),
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(param))
}

/* 私有方法，开始 Waifu 任务 */
function startWaifu({ uid, config, scale, dst_file_name, otherParams }) {
  const param = {
    ...otherParams,
    uid,
    scale,
    jconfig: JSON.stringify(config),
    dst_file_name,
  }
  return axios.post(servers.service + '/api/v2/transform', addAbTestParamToTransform(param))
}

function startWorkCommonApi(params) {
  return axios.post(servers.service + '/api/v2/transform', params)
}

function startWorkCommonApiV2(params) {
  return axios.post(servers.service + '/api/v3/transform ', params)
}

/* 获取任务进度信息 */
function getProgress(transId) {
  const params = {
    trans_id: transId,
  }
  return axios.get(servers.service + '/api/v2/progress', { params })
}
/* 获取任务进度信息V2 */
function getProgressV2(params) {
  return axios.get(servers.service + '/api/v3/progress', { params })
}
/**
 * @conversionUid  trans_id 转化为 uid
 */
function conversionUid(target2uid) {
  return axios.post(servers.service + '/api/v2/target2uid', { trans_id: target2uid, web: 'vanceai' })
}

/* 下载（样图） */
function downloadSample(workType, idx, type = 'processed', rate = null) {
  const params = {
    job: workType,
    type,
    num: idx,
    rate,
  }
  return axios({
    url: servers.serviceFile + '/api/v2/sample/download',
    method: 'GET',
    params,
    responseType: 'blob',
  })
}

function downloadSampleUrl(workType, idx, type = 'processed', rate = null) {
  const args =
    workType === typeEnlarge || workType === typePortrait
      ? `?job=${workType}&type=processed&num=${idx}&type=${type}&rate=${rate}`
      : `?job=${workType}&type=processed&num=${idx}&type=${type}`

  return servers.service + '/api/v2/sample/download' + args
}

/* samples */
function samples() {
  return axios({
    url: servers.service + '/api/v2/sample/info',
    method: 'GET',
  })
}

/* 获取任务历史记录 */

function record(currentPage, pageSize, job, all = 0) {
  const params = {
    front_edit: 0,
    job,
    all,
    limit: pageSize,
    page: currentPage,
  }
  return axios.get(servers.service + '/api/v2/record', { params })
}

/* 获取任务历史记录V2 */
function recordV2(currentPage, pageSize, job, all = 0) {
  const params = {
    limit: pageSize,
    page: currentPage,
    extra:JSON.stringify({    
      front_edit: 0,
      job,
      all
    })
  }
  return axios.get(servers.service + '/api/v3/record', { params })
}

/* 评价任务效果 */
function thumbUp(transId, num) {
  const params = {
    trans_id: transId,
    thumbsup: num,
  }
  return axios({
    url: servers.service + '/api/v2/thumbsup',
    method: 'POST',
    data: params,
  })
}

function getPreviewSrcBlob(transId) {
  return axios({
    url: servers.service + `/api/v2/preview/src?web=vanceai&trans_id=${transId}`,
    responseType: 'blob',
    method: 'GET',
  })
}

/* 获取小图的尺寸*/
function getSmallSize(trans_id) {
  return axios({
    url: servers.service + '/api/v2/small/size',
    method: 'GET',
    params: {
      trans_id,
    },
  })
}

/* 下载小图*/
function downloadSmall(trans_id) {
  return (
    servers.serviceFile +
    `/api/v2/download/small?web=vanceai&guest_token_v2=${getCookie('guestTokenV2')}&trans_id=${trans_id}`
  )
}

//workflow start
function getWorkflowList(params) {
  return axios({
    url: servers.service + '/api/work_flow/list',
    method: 'GET',
    params,
  }).then((res) => {
    return res.data
  })
}
function addWorkflow(params) {
  return axios({
    url: servers.service + '/api/work_flow/add',
    method: 'POST',
    data: params,
  }).then((res) => {
    return res.data
  })
}
function updateWorkflow(params) {
  return axios({
    url: servers.service + '/api/work_flow/update',
    method: 'POST',
    data: params,
  }).then((res) => {
    return res.data
  })
}
function deleteWorkflow(params) {
  return axios({
    url: servers.service + '/api/work_flow/delete',
    method: 'POST',
    data: params,
  }).then((res) => {
    return res.data
  })
}
function getWorkflow(data) {
  return axios({
    url: servers.service + '/api/work_flow/get',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}
function activeWorkflow(params) {
  return axios({
    url: servers.service + '/api/work_flow/active_flows',
    method: 'POST',
    data: params,
  }).then((res) => {
    return res.data
  })
}
function deleteUploadImage(params, token) {
  return axios({
    url: servers.service + '/api/v2/upload/delete',
    method: 'POST',
    data: params,
    params: {
      cancelToken: token,
    },
  }).then((res) => {
    return res.data
  })
}
function pointCheck(data) {
  return axios({
    url: servers.service + '/api/v2/point/check',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

// 前端根据使用情形主动扣点
function deductPoint(data) {
  return axios({
    url: servers.service + '/api/v2/edit/kou',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

//转为离线任务
function batchTransform(data) {
  return axios({
    url: servers.service + '/api/v2/batch_transform',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}
//离线任务状态
function batchTransformStatus(data) {
  return axios({
    url: servers.service + '/api/v2/batch_transform_status',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}
// 删除任务
function deleteWork(data) {
  return axios({
    url: servers.service + '/api/v2/transform/delete',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

const addFeedBack = (data) => {
  return axios({
    url: servers.service + '/api/feedback/add',
    method: 'POST',
    data,
  })
}

const reportPreviewTime = (data) => {
  return axios({
    url: servers.service + '/api/report/preview',
    method: 'POST',
    data,
  })
}

const saveToGoogleDrive = (data) => {
  return axios({
    url: servers.service + '/api/v1/netbox/google_drive',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

const saveToOneDrive = (data) => {
  return axios({
    url: servers.service + '/api/v1/netbox/onedrive',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

const saveToDropbox = (data) => {
  return axios({
    url: servers.service + '/api/v1/netbox/dropbox',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

function translateText(text) {
  return axios.post(servers.service + '/api/tools/translate', { text })
}

function getWorkInfo(workName) {
  return axios.post(servers.service + '/api/jobcategory/info', { name: workName })
}

function sendJobTimeLines(params) {
  return axios.post(servers.service + '/api/v2/elk/report/task', params)
}

function batchPreProcess(config){
  const newConfig = {...config}
  const enlargeBatchModelList = ['EnlargeStandard_1x_Stable','EnlargeStandard_2x_Stable','EnlargeStandard_4x_Stable','portrait_enhancer']
  const sharpenBatchModelList = ['SharpenGeneralStable','SharpenLensBlurStable','SharpenSoftNormalStable','SharpenMotionBlurStable']
  const denoiseBatchModelList = ['DenoiseStable']
  if(newConfig.config.length == 1 && !newConfig.config[0].config.module_params.autoparams){
    if(enlargeBatchModelList.includes(newConfig.config[0].config.module_params.model_name)){
      newConfig.name = 'enlarge_batch'
      newConfig.config[0].name = 'enlarge_batch'
      if(newConfig.config[0].config.module_params.model_name != 'portrait_enhancer'){
        newConfig.config[0].config.module_params.portrait_enhancer = false
      }
    }else if(sharpenBatchModelList.includes(newConfig.config[0].config.module_params.model_name)){
      newConfig.name = 'sharpen_batch'
      newConfig.config[0].name = 'sharpen_batch'
      newConfig.config[0].config.module_params.portrait_enhancer = false
    }else if(denoiseBatchModelList.includes(newConfig.config[0].config.module_params.model_name)){
      newConfig.name = 'denoise_batch'
      newConfig.config[0].name = 'denoise_batch'
      newConfig.config[0].config.module_params.portrait_enhancer = false
    }
  }else if(newConfig.config.length == 2){
    //tp的enlarge
    if(newConfig.config[0].name == 'CodeFormer' && !newConfig.config[1].config.module_params.autoparams){
      if(enlargeBatchModelList.includes(newConfig.config[1].config.module_params.model_name)){
        newConfig.name = 'enlarge_batch'
        newConfig.config[1].name = 'enlarge_batch'
        newConfig.config[1].config.module_params.portrait_enhancer = true
        newConfig.config = newConfig.config.slice(1)
      }
    }else if(newConfig.config[1].name == 'CodeFormer' && !newConfig.config[0].config.module_params.autoparams){
      //tp的sharpen
      if(sharpenBatchModelList.includes(newConfig.config[0].config.module_params.model_name)){
        newConfig.name = 'sharpen_batch'
        newConfig.config[0].name = 'sharpen_batch'
        newConfig.config[0].config.module_params.portrait_enhancer = true
        newConfig.config = newConfig.config.slice(0,1)
      }
    }
  }
  return newConfig
}

export default {
  web,
  ...workTypeDict,
  workTypes,
  saveToGoogleDrive,
  saveToOneDrive,
  saveToDropbox,
  start,
  getProgress,
  getProgressV2,
  sendJobTimeLines,
  conversionUid,
  downloadSample,
  downloadSampleUrl,
  samples,
  record,
  recordV2,
  thumbUp,
  getPreviewSrcBlob,
  getSmallSize,
  downloadSmall,
  getWorkflowList,
  addWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflow,
  activeWorkflow,
  deleteUploadImage,
  pointCheck,
  batchTransform,
  batchTransformStatus,
  deleteWork,
  addFeedBack,
  reportPreviewTime,
  translateText,
  deductPoint,
  startWorkCommonApi,
  startWorkCommonApiV2,
  getWorkInfo,
}
