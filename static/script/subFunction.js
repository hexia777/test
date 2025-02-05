/**
 * 处理模型子函数
 */
import { WorkFlowType } from '@/static/script/workflow_util'
const workName = {
  [WorkFlowType.sharpen]: sharpenSub,
  [WorkFlowType.portrait_enhancer]: portrait_enhancer,
}

function sharpenSub(req) {
  console.log('req', req)
  let name = ''
  const mapName = {
    SharpenGeneralStable: 'va_sharpen_standard',
    SharpenMotionBlurStable: 'sharpen_mb',
    SharpenLensBlurStable: 'sharpen_lb',
    SharpenSoftNormalStable: 'sharpen_sb',
  }
  if (Array.isArray(req.config)) {
    req.config.forEach((val) => {
      const model_name = val.config.module_params.model_name
      if (mapName[model_name]) {
        name = mapName[model_name]
      }
    })
  } else {
    const model_name = req.config.module_params.model_name
    if (mapName[model_name]) {
      name = mapName[model_name]
    }
  }

  return name
}

function portrait_enhancer(req) {
  let name = ''
  const mapName = {
    'PortraitEnhancer_v1.4': 'portrait',
  }
  const config = req.config

  const model_name = config.module_params.model_name
  if (mapName[model_name]) {
    name = mapName[model_name]
  }

  return name
}

export default {
  workName,
}
