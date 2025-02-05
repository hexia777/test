const WorkFlowType = {
  denoise: 'denoise',
  colorize: 'colorize',
  enlarge: 'enlarge',
  chainner: 'chainner',
  chainner_txt: 'chainner_txt',
  enlarge2: 'enlarge2',
  perfect: 'perfect',
  sharpen: 'sharpen',
  onlySharpen: 'onlySharpen',
  onlyPortrait: 'onlyPortrait',
  cartoonize: 'cartoonize',
  portrait: 'portrait',
  matting: 'matting',
  onlyMatting: 'onlyMatting',
  passport: 'passport',
  repair: 'repair',
  waifu: 'waifu',
  waifu_cunet: 'waifu_cunet',
  waifu_upconv: 'waifu_upconv',
  real_esrgan: 'real_esrgan',
  onlyWaifu: 'onlyWaifu',
  jpeg_artifact: 'jpeg_artifact',
  sharpen_auto: 'sharpen_auto',
  colorize_pro: 'colorize_pro',
  old_photo_repire_colorize: 'se-old-repair',
  night_scene: 'se-night',
  super_hd: 'se-hd',
  portrait_enhancement: 'se-portrait-enhancement',
  sketch: 'sketch',
  // 新增模型
  animegan: 'animegan',
  'se-dehazing': 'se-dehazing',
  debouncing: 'debouncing',
  brightness: 'brightness',
  deblur: 'deblur',
  portrait_enhancer: 'portrait_enhancer',
  real_esrgan2: 'real_esrgan2',
  inpaint: 'inpaint',
  paddle_matting: 'pd_matting',
  sharpen2_general: 'sharpen2_general',
  sharpen2_motion_blur: 'sharpen_mb',
  sharpen2_lens_blur: 'sharpen_lb',
  sharpen2_sort_normal: 'sharpen_sb',
  enhance_v1_2: 'enhance_v1_2',
  art_enlarge: 'art_enlarge',
  text_enlarge: 'text_enlarge',
  animegan2c: 'animegan2c',
  deoldify2: 'deoldify2',
  animegan_toon: 'animegan_toon',
  sharpen_cop: 'sharpen_cop',
  sharpen3: 'va_sharpen_standard',
  enlarge3: 'enlarge3',
  new_enlarge3: 'new_enlarge3',
  enlarge_clarity: 'enlarge_clarity',
  CodeFormer: 'CodeFormer',
  img2anime: 'img2anime',
  img2anime_st: 'img2anime_st',
  img2sr: 'img2sr',
  enlarge_sr: 'enlarge_sr',
  sharpen_sr: 'sharpen_sr',
  compress: 'compress',
  artLine: 'artLine',
  linecolor: 'linecolor',
  sd_recolor: 'sd_recolor',
  recolor: 'recolor',
}
const WorkFlowModuleMap = {
  CodeFormer: 'CodeFormer',
  sharpen3: 'va_sharpen_standard',
  denoise: 'denoise',
  colorize: 'colorize',
  enlarge: 'enlarge',
  chainner: 'chainner',
  chainner_txt: 'chainner',
  enlarge2: 'enlarge2',
  perfect: 'perfect',
  sharpen: 'sharpen',
  onlySharpen: 'onlySharpen',
  onlyPortrait: 'onlyPortrait',
  cartoonize: 'cartoonize',
  portrait: 'portrait',
  passport: 'passport',
  repair: 'repair',
  waifu: 'waifu',
  waifu_cunet: 'waifu_cunet',
  waifu_upconv: 'waifu_upconv',
  real_esrgan: 'real_esrgan',
  onlyWaifu: 'onlyWaifu',
  jpeg_artifact: 'jpeg_artifact',
  sharpen_auto: 'sharpen_auto',
  colorize_pro: 'colorize_pro',
  old_photo_repire_colorize: 'se-old-repair',
  night_scene: 'se-night',
  super_hd: 'se-hd',
  portrait_enhancement: 'se-portrait-enhancement',
  sketch: 'sketch',
  // 新增模型
  animegan: 'animegan',
  'se-dehazing': 'se-dehazing',
  debouncing: 'debouncing',
  brightness: 'brightness',
  deblur: 'deblur',
  portrait_enhancer: 'portrait_enhancer',
  real_esrgan2: 'real_esrgan2',
  inpaint: 'inpaint',
  paddle_matting: 'pd_matting',
  matting: 'matting',
  onlyMatting: 'onlyMatting',
  sharpen2_general: 'sharpen2_general',
  sharpen2_motion_blur: 'sharpen_mb',
  sharpen2_lens_blur: 'sharpen_lb',
  sharpen2_sort_normal: 'sharpen_sb',
  enhance_v1_2: 'enhance_v1_2',
  art_enlarge: 'art_enlarge',
  text_enlarge: 'text_enlarge',
  animegan2c: 'animegan2c',
  deoldify2: 'deoldify2',
  animegan_toon: 'animegan_toon',
  enlarge3: 'enlarge3',
  new_enlarge3: 'new_enlarge3',
  enlarge_clarity: 'enlarge_clarity',
  img2anime: 'img2anime',
  img2anime_st: 'img2anime_st',
  img2sr: 'img2sr',
  artLine: 'artLine',
  linecolor: 'linecolor',
  sd_recolor: 'sd_recolor',
  recolor: 'recolor',
}

const WorkFlowConfig = (val, option) => {
  const workflowConfig = {}
  workflowConfig[WorkFlowType.denoise] = _denoiseConfig
  workflowConfig[WorkFlowType.colorize] = _colorizeConfig
  workflowConfig[WorkFlowType.enlarge] = _enlargeConfig
  workflowConfig[WorkFlowType.chainner] = _chainnerConfig
  workflowConfig[WorkFlowType.chainner_txt] = _chainnerTxtConfig
  workflowConfig[WorkFlowType.enlarge2] = _enlargeConfig
  workflowConfig[WorkFlowType.perfect] = _perfectConfig
  workflowConfig[WorkFlowType.sharpen] = _sharpenConfig
  workflowConfig[WorkFlowType.onlySharpen] = _onlySharpenConfig
  workflowConfig[WorkFlowType.onlyPortrait] = _onlyPortraitConfig
  workflowConfig[WorkFlowType.cartoonize] = _cartoonizeConfig
  workflowConfig[WorkFlowType.animegan_toon] = _cartoonizeConfig
  workflowConfig[WorkFlowType.sharpen_auto] = _sharpen_autoConfig
  workflowConfig[WorkFlowType.matting] = _mattingConfig
  workflowConfig[WorkFlowType.onlyMatting] = _onlyMattingConfig
  workflowConfig[WorkFlowType.passport] = _mattingConfig
  workflowConfig[WorkFlowType.portrait] = _portraitConfig
  workflowConfig[WorkFlowType.repair] = _repairConfig
  workflowConfig[WorkFlowType.waifu] = _waifuConfig
  workflowConfig[WorkFlowType.waifu_cunet] = _waifu_cunetConfig
  workflowConfig[WorkFlowType.waifu_upconv] = _waifu_upconvConfig
  workflowConfig[WorkFlowType.onlyWaifu] = _waifuConfig
  workflowConfig[WorkFlowType.real_esrgan] = _realEsrganConfig
  workflowConfig[WorkFlowType.jpeg_artifact] = _jpeg_artifactConfig
  workflowConfig[WorkFlowType.colorize_pro] = _colorize_proConfig
  workflowConfig[WorkFlowType.old_photo_repire_colorize] = _old_photo_repire_colorize
  workflowConfig[WorkFlowType.night_scene] = _night_scene
  workflowConfig[WorkFlowType.super_hd] = _super_hd
  workflowConfig[WorkFlowType.portrait_enhancement] = _portrait_enhancement
  workflowConfig[WorkFlowType.sketch] = _sketchConfig
  workflowConfig[WorkFlowType.animegan] = _animeganConfig
  workflowConfig[WorkFlowType['se-dehazing']] = _dehazeConfig
  workflowConfig[WorkFlowType.debouncing] = _debouncingConfig
  workflowConfig[WorkFlowType.brightness] = _brightnessConfig
  workflowConfig[WorkFlowType.deblur] = _deblurConfig
  workflowConfig[WorkFlowType.portrait_enhancer] = _portraitEnhancerConfig
  workflowConfig[WorkFlowType.real_esrgan2] = _realEsrganConfig2
  workflowConfig[WorkFlowType.inpaint] = _inpaintConfig
  workflowConfig[WorkFlowType.paddle_matting] = _paddleMattingConfig
  workflowConfig[WorkFlowType.sharpen3] = _sharpen2GeneralConfig
  workflowConfig[WorkFlowType.sharpen2_general] = _sharpen2GeneralConfig
  workflowConfig[WorkFlowType.sharpen2_motion_blur] = _sharpen2MotionBlurConfig
  workflowConfig[WorkFlowType.sharpen2_lens_blur] = _sharpen2LensBlurConfig
  workflowConfig[WorkFlowType.sharpen2_sort_normal] = _sharpen2SoftNormalConfig
  workflowConfig[WorkFlowType.enhance_v1_2] = _enhanceV1_2Config
  workflowConfig[WorkFlowType.art_enlarge] = _artEnlargeConfig
  workflowConfig[WorkFlowType.text_enlarge] = _textEnlargeConfig
  workflowConfig[WorkFlowType.animegan2c] = _animegan3Config
  workflowConfig[WorkFlowType.deoldify2] = _deoldify2Config
  workflowConfig[WorkFlowType.sd_recolor] = _sdRecolorConfig
  workflowConfig[WorkFlowType.enlarge3] = _enlarge3Config
  workflowConfig[WorkFlowType.new_enlarge3] = _newEnlarge3Config
  workflowConfig[WorkFlowType.enlarge_clarity] = _enlargeClarityConfig
  workflowConfig[WorkFlowType.CodeFormer] = _codeFormerConfig
  workflowConfig[WorkFlowType.img2anime] = _img2animeConfig
  workflowConfig[WorkFlowType.img2anime_st] = _img2animeStConfig
  workflowConfig[WorkFlowType.img2sr] = _img2srConfig
  workflowConfig[WorkFlowType.artLine] = _artLineConfig
  workflowConfig[WorkFlowType.linecolor] = _lineColorConfig
  //新增模型
  if (val) {
    return workflowConfig[val] ? workflowConfig[val](option) : null
  } else {
    return workflowConfig[WorkFlowType.denoise](option)
  }
}

//新增方法
const _lineColorConfig = ({ modelName, prompt }) => {
  return {
    module: 'stable_diffusion',
    module_params: {
      model_name: modelName,
      prompt: prompt,
    },
  }
}

//新增方法
const _artLineConfig = () => {
  return {
    module: 'artLine',
    module_params: {
      model_name: 'ArtLineStable_650',
      single_face: false,
      aligned_size: 512,
    },
  }
}
const _img2srConfig = () => {
  return {
    module: 'stable_diffusion',
    module_params: {
      model_name: 'img2sr_512',
      restore_faces: false,
      denoising: false,
      denoising_strength: 0.9,
    },
  }
}

const _img2animeConfig = () => {
  return {
    module: 'stable_diffusion',
    module_params: {
      model_name: 'style1',
      prompt: '',
      overwrite: false,
    },
  }
}

const _img2animeStConfig = () => {
  return {
    module: 'stable_diffusion',
    module_params: {
      model_name: 'style1',
      prompt: '',
      overwrite: false,
    },
  }
}

const _codeFormerConfig = () => {
  return {
    module: 'CodeFormer',
    module_params: {
      model_name: 'CodeFormerStable',
    },
  }
}
const _enlarge3Config = (scale = 2) => {
  return {
    module: 'enlarge3',
    module_params: {
      model_name: `EnlargeStandard_${scale === 8 ? 4 : scale}x_Stable`, //EnlargeStandard_1x_Stable， EnlargeStandard_4x_Stable
      suppress_noise: 50,
      remove_blur: 25,
      scale: scale, //1,4
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _newEnlarge3Config = (scale = 2) => {
  return {
    module: 'enlarge3_96',
    module_params: {
      model_name: `EnlargeStandard_${scale === 8 ? 4 : scale}x_96_Stable`, //EnlargeStandard_1x_Stable， EnlargeStandard_4x_Stable
      suppress_noise: 50,
      remove_blur: 25,
      scale: scale, //1,4
      fix_compression: 28,
      autoparams: false,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}

const _enlargeClarityConfig = (scale = 2) => {
  return {
    module: 'sd_enhance',
    module_params: {
      scale: scale, //前端选择的放大倍数
      customize: false, //是否是自定义放大
      model_name: 'sd_clarity_upscaler',
      width: 0, //放大后输出图片尺寸宽
      height: 0, //放大后输出图片尺寸高
    },
  }
}
const _deoldify2Config = () => {
  return {
    module: 'deoldify2',
    module_params: {
      model_name: 'DeoldifyArtistic',
      render_factor: 30,
    },
  }
}
const _sdRecolorConfig = () => {
  return {
    module: 'stable_diffusion',
    module_params: {
      model_name: 'sd_recolor',
      negative_prompt: '',
      prompt: '',
    },
  }
}
const _animegan3Config = () => {
  return {
    module: 'animegan2c',
    module_params: {
      model_name: 'Animegan2Stable',
    },
  }
}
const _waifu_cunetConfig = () => {
  return {
    module: 'waifu',
    module_params: {
      model_name: 'models-cunet',
      noise_level: 2,
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _waifu_upconvConfig = () => {
  return {
    module: 'waifu',
    module_params: {
      model_name: 'models-upconv_7_anime_style_art_rgb',
      noise_level: 2,
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _enhanceV1_2Config = () => {
  return {
    module: 'portrait_enhancer',
    module_params: {
      model_name: 'PortraitEnhancer_v1.2',
    },
  }
}
const _sharpen2GeneralConfig = () => {
  return {
    module: 'sharpen3',
    module_params: {
      model_name: 'SharpenGeneralStable',
      blur_type: 1,
      remove_blur: 0.5, //参数值 （0~1）s
      suppress_noise: 0.5, //参数值 （0~1）
      remove_artifacts: 0.5, //SharpenGeneralStable选这个参数,参数值 （0~1）
      autoparams: true,
      model_switch: 'vance_1',
    },
  }
}
const _sharpen2MotionBlurConfig = () => {
  return {
    module: 'sharpen3',
    module_params: {
      model_name: 'SharpenMotionBlurStable',
      remove_blur: 0.18, //参数值 （0~1）
      suppress_noise: 0.08, //参数值 （0~1）
      remove_artifacts: 0.05, //SharpenGeneralStable选这个参数,参数值 （0~1）
      autoparams: false,
      model_switch: 'vance_1',
    },
  }
}
const _sharpen2LensBlurConfig = () => {
  return {
    module: 'sharpen3',
    module_params: {
      model_name: 'SharpenLensBlurStable',
      remove_blur: 0.18, //参数值 （0~1）
      suppress_noise: 0.08, //参数值 （0~1）
      remove_artifacts: 0.05, //SharpenGeneralStable选这个参数,参数值 （0~1）
      autoparams: false,
      model_switch: 'vance_1',
    },
  }
}
const _sharpen2SoftNormalConfig = () => {
  return {
    module: 'sharpen3',
    module_params: {
      model_name: 'SharpenSoftNormalStable',
      remove_blur: 0.2, //参数值 （0~1）
      suppress_noise: 0.1, //参数值 （0~1）
      remove_artifacts: 0, //SharpenGeneralStable选这个参数,参数值 （0~1）
      autoparams: false,
      model_switch: 'vance_1',
    },
  }
}

export const _paddleMattingConfig = () => ({
  module: 'matting',
  module_params: {
    model_name: 'Mattingstable',
    no_face_blur: true,
    web_auto_mode: true,
  },
})

const _inpaintConfig = () => {
  return {
    module: 'inpaint_lama',
    module_params: {
      model_name: 'InpaintLamaStable',
    },
  }
}
const _portraitEnhancerConfig = () => {
  return {
    module: 'portrait_enhancer',
    module_params: {
      model_name: 'PortraitEnhancer_v1.4',
    },
  }
}
const _deblurConfig = () => {
  return {
    module: 'hinet_realblur',
    module_params: {
      model_name: 'HinetRealblurStable',
    },
  }
}
const _brightnessConfig = () => {
  return {
    module: 'dped_sharpen',
    module_params: {
      model_name: 'DpedSharpenStable',
    },
  }
}

const _dehazeConfig = (option) => {
  // const config = [
  //   {
  //     name: 'dehazing',
  //     config: {
  //       module: 'dehazing',
  //       module_params: {
  //         model_name: 'DehazingStable',
  //         contrast: 1,
  //         brightness: 20,
  //       },
  //     },
  //   },
  //   {
  //     name: 'jpeg_artifact',
  //     config: {
  //       module: 'hinet_jpeg',
  //       module_params: {
  //         model_name: 'HinetJPEGStable',
  //         deblur: true,
  //       },
  //     },
  //   },
  // ]
  // if (option) {
  //   config.push({
  //     name: 'perfect',
  //     config: {
  //       module: 'perfect',
  //       module_params: {
  //         model_name: 'perfect_2k',
  //       },
  //     },
  //   })
  // }
  return {
    module: 'dehazing',
    module_params: {
      model_name: 'DehazingStable',
      contrast: 1,
      brightness: 20,
    },
  }
}

export const _onlyMattingConfig = () => {
  return {
    module: 'matting',
    module_params: {
      model_name: 'MattingStable',
      rescale: 532,
      web_auto_mode: false,
    },
  }
}
export const _mattingConfig = () => {
  return {
    module: 'matting',
    module_params: {
      model_name: 'MattingStable',
      rescale: 532,
      web_auto_mode: '',
    },
  }
}
const _portraitConfig = () => {
  return {
    module: 'portrait',
    module_params: {
      model_name: 'PortraitStable',
      single_face: true,
    },
  }
}
const _sketchConfig = () => {
  return {
    module: 'sketch',
    module_params: {
      model_name: 'SketchStable',
      single_face: true,
      composite: true,
      sigma: 0,
      alpha: 0,
      auto_mode: true,
    },
  }
}
const _animeganConfig = () => {
  return {
    module: 'animegan2',
    module_params: {
      model_name: 'Animegan2Stable',
      single_face: true,
      aligned_size: 512,
    },
  }
}
const _debouncingConfig = () => {
  return {
    module: 'debouncing',
    module_params: {
      model_name: 'DebouncingStable',
      sharpness: 65,
      suppress_noise: 65,
    },
  }
}
const _repairConfig = () => {
  return {
    module: 'repair',
    module_params: {
      model_name: 'RepairStable',
      with_scratch: true,
      inpainting: true,
      auto_mode: true,
      convert: false,
      face_enhancer: false,
    },
  }
}

export const _waifuConfig = () => {
  return {
    module: 'waifu',
    module_params: {
      model_name: 'models-cunet',
      noise_level: 2,
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _realEsrganConfig = () => {
  return {
    module: 'real_esrgan',
    module_params: {
      model_name: 'RealEsrganStable',
      noise_level: 2,
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _realEsrganConfig2 = () => {
  return {
    module: 'real_esrgan',
    module_params: {
      model_name: 'RealEnhancerStable',
      scale: 1,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _jpeg_artifactConfig = () => {
  return {
    module: 'hinet_jpeg',
    module_params: {
      model_name: 'HinetJPEGStable',
      deblur: true,
    },
  }
}
const _denoiseConfig = () => {
  return {
    module: 'denoise',
    module_params: {
      model_name: 'DenoiseStable',
      autoparams: false,
      remove_noise: 65,
      sharpen: 65,
      remove_original_detail: 75,
    },
  }
}
const _colorizeConfig = (option) => {
  return {
    module: 'deoldify2',
    module_params: {
      model_name: 'DeoldifyStable',
      render_factor: 60,
      psd: (option && option.psd) || false,
    },
    compress: {
      quality: 100,
    },
  }
}
const _enlargeConfig = () => {
  return {
    module: 'enlarge',
    module_params: {
      model_name: 'EnlargeStable',
      autoparams: false,
      suppress_noise: 65,
      remove_blur: 65,
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _chainnerConfig = () => {
  return {
    module: 'chainner',
    module_params: {
      model_name: 'Anime_4x_AnimeSharp',
      scale: 4,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _chainnerTxtConfig = () => {
  return {
    module: 'chainner',
    module_params: {
      model_name: 'Text_4x_TextSharpV1',
      scale: 4,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}
const _perfectConfig = () => {
  return {
    module: 'perfect',
    module_params: {
      model_name: 'perfect_2k',
    },
  }
}

const _onlyTextConfig = () => ({
  module: 'sharpen',
  module_params: {
    model_name: 'SharpenStable',
    autoparams: false,
    sharpness: 65,
    suppress_noise: 65,
    add_grain: 0,
    auto_mode: false,
  },
})
const _onlyPortraitConfig = () => ({
  module: 'sharpen',
  module_params: {
    model_name: 'SharpenStable',
    autoparams: false,
    sharpness: 65,
    suppress_noise: 65,
    add_grain: 0,
    auto_mode: true,
  },
})
const _onlySharpenConfig = () => ({
  module: 'sharpen',
  module_params: {
    model_name: 'SharpenStable',
    autoparams: false,
    sharpness: 65,
    suppress_noise: 65,
    add_grain: 0,
    auto_mode: false,
  },
})
const _sharpenConfig = (options = {}) => {
  return {
    module: 'sharpen',
    module_params: {
      model_name: 'SharpenStable',
      sharpness: 65,
      suppress_noise: 65,
      add_grain: 0,
      auto_mode: true,
      autoparams: false,
      ...options,
    },
  }
}
const _cartoonizeConfig = () => {
  return {
    module: 'cartoonize',
    module_params: {
      model_name: 'CartoonizeStable',
      single_face: false,
      aligned_size: 512,
    },
  }
}

const _sharpen_autoConfig = () => {
  return {
    module: 'sharpen_auto',
    module_params: {
      model_name: 'DpedSharpenStable',
    },
  }
}
const _colorize_proConfig = (option) => {
  return {
    module: 'deoldify2',
    module_params: {
      model_name: 'DeoldifyStable',
      render_factor: 30,
      psd: (option && option.psd) || false,
    },
    compress: {
      quality: 100,
    },
  }
}
const _night_scene = () => {
  return [
    {
      name: 'denoise',
      config: {
        module: 'denoise',
        module_params: {
          model_name: 'DenoiseStable',
          autoparams: true,
          remove_noise: 75,
          sharpen: 75,
          remove_original_detail: 0,
        },
      },
    },
    {
      name: 'perfect',
      config: {
        module: 'perfect',
        module_params: {
          model_name: 'perfect_2k',
        },
      },
    },
  ]
}
const _super_hd = () => {
  return [
    {
      name: 'denoise',
      config: {
        module: 'denoise',
        module_params: {
          model_name: 'DenoiseStable',
          remove_noise: 35,
          sharpen: 20,
          remove_original_detail: 15,
        },
      },
    },
    {
      name: 'enlarge',
      config: {
        module: 'enlarge',
        module_params: {
          model_name: 'EnlargeStable',
          autoparams: true,
          suppress_noise: 65,
          remove_blur: 65,
          scale: 2,
          customize: false,
          width: 0,
          height: 0,
        },
      },
    },
  ]
}
const _artEnlargeConfig = () => {
  return {
    module: 'chainner',
    module_params: {
      model_name: 'Universal_UltraSharp_4x',
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}

const _textEnlargeConfig = () => {
  return {
    module: 'chainner',
    module_params: {
      model_name: 'Specialized_Text_TextSharp_4x',
      scale: 2,
      customize: false,
      width: 0,
      height: 0,
    },
  }
}

const _portrait_enhancement = () => {
  return [
    {
      name: 'denoise',
      config: {
        module: 'denoise',
        module_params: {
          model_name: 'DenoiseStable',
          autoparams: true,
          remove_noise: 75,
          sharpen: 75,
          remove_original_detail: 0,
        },
      },
    },
    {
      name: 'face_enhancer',
      config: {
        module: 'face_enhancer',
        module_params: {
          model_name: 'FaceEnhancerStable',
        },
      },
    },
    {
      name: 'enlarge',
      config: {
        module: 'enlarge',
        module_params: {
          model_name: 'EnlargeStable',
          autoparams: true,
          suppress_noise: 50,
          remove_blur: 50,
          scale: 2,
          customize: false,
          width: 0,
          height: 0,
        },
      },
    },
  ]
}

const _old_photo_repire_colorize = () => {
  return [
    {
      name: 'denoise',
      config: {
        module: 'denoise',
        module_params: {
          model_name: 'DenoiseStable',
          remove_noise: 65,
          sharpen: 65,
        },
      },
    },
    {
      name: 'repair',
      config: {
        module: 'repair',
        module_params: {
          model_name: 'RepairStable',
          with_scratch: true,
          inpainting: true,
          face_enhancer: false,
        },
      },
    },
    {
      name: 'colorize',
      config: {
        module: 'colorize',
        module_params: {
          model_name: 'ColorizeStable',
        },
      },
    },
    {
      name: 'sharpen',
      config: {
        module: 'sharpen',
        module_params: {
          model_name: 'SharpenStable',
          autoparams: true,
        },
      },
    },
    {
      name: 'perfect',
      config: {
        module: 'perfect',
        module_params: {
          model_name: 'perfect_2k',
        },
      },
    },
  ]
}

export { WorkFlowConfig, WorkFlowModuleMap, WorkFlowType }
