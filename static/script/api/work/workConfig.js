// 获取config时候传入参数的格式
// {
//   name: 'config最外层的name 唯一 关联kind和dist',
//   models?: [ // 填入数组中的模型顺序不能随意调整
//     {name: '模型名称 唯一', options: {用户输入的对应模型参数}},
//   ],
//   options?: {用户输入的对应模型参数}
//   out_params?: {输出的参数}
// }

export function getWorksConfig(modelParams) {
  if (!modelParams.name) {
    return null
  }

  const configObj = {
    name: modelParams.name,
    config: [],
  }
  if (modelParams.models && modelParams.models.length) {
    modelParams.models.forEach((item) => {
      const modelConfigs = modelsConfigFun[item.name](item.options)
      if (!modelConfigs) {
        console.error('not found config name', item.name)
        return
      }
      configObj.config = [...configObj.config, ...modelConfigs.config]
    })
  } else {
    configObj.config = modelsConfigFun[modelParams.name](modelParams.options).config
  }

  configObj.config.forEach((item, index) => {
    if (index !== configObj.config.length - 1) {
      if (item.config.out_params) {
        item.config.out_params = {}
      }
    } else {
      if (modelParams.out_params) {
        item.config.out_params = item.config.out_params
          ? { ...item.config.out_params, ...modelParams.out_params }
          : modelParams.out_params
      }
    }
  })
  return configObj
}

export function handleWorksConfig({ imageUid }, config) {}

const modelsConfigFun = {
  // 可选功能 额外功能 增强功能
  CodeFormer: getCodeFormer, // 人脸增强时
  img2sr: getImg2sr, //

  // AI Image Upscaler (单工作台的 AI Photo Enhancer)
  enlarge3: getEnlarge3, // AI Image Upscaler
  chainner_anime: getChainnerAnime, //  Anime
  chainner_art_cg: getChainnerArtCG, //  Art & CG
  chainner_txt: getChainnerTxt, //  Text
  waifu: getWaifu, //  waifu
  real_esrgan: getRealEsrgan, //  real-esrgan
  enlarge_sr: getEnlargeSr, // VERY Blurry = enlarge3 + img2sr
  enlarge_clarity: getEnlargeClarity,

  // magic upscale
  magic_enlarge_clarity: getMagicEnlargeClarity,

  // AI Image Sharpener
  va_sharpen_standard: getVaSharpenStandard, // General
  sharpen_mb: getSharpenMb, // Motion Blur
  sharpen_lb: getSharpenLb, // Lens Blur
  sharpen_sb: getSharpenSb, // Soft Blur
  sharpen_sr: getSharpenSr, // VERY Blurry

  // Toongineer Cartoonizer
  img2anime: getImg2anime, // 新卡通 Avatar
  img2anime_st: getImg2anime, // 新卡通 Avatar
  img2anime_no_forge: getImg2anime, // 新卡通 Avatar
  animegan_toon: getAnimeganToon, // 旧卡通 Avatar
  animegan2c: getAnimegan2c, // 旧卡通 Character
  cartoonize: getCartoonize, // 旧卡通 Manga

  // AI Image Denoiser
  denoise: getDenoise,

  // AI Photo Colorizer
  recolor: getRecolor, // Delicate Reproduction
  colorize: getColorize, // Classic Restoration

  // AI Photo Retoucher
  brightness: getBrightness, // Color
  perfect: getPerfect, // Brightness

  // AI Photo Restorer
  repair_sd: getRepairSd,

  // AI Anime Upscaler
  // real_esrgan: getRealEsrgan, //  real-esrgan  同上方的 real_esrgan
  waifu_anime: getWaifuAnime, //  Waifu2x-cunet
  waifu2x_anime: getWaifu2xAnime, //  Waifu2x-upconv_7_anime_style_art_rgb

  // Photo to Sketch
  artLine: getArtLine, // Image to Sketch
  sketch: getArtLine, // 卡通工作台 Image to Sketch
  // linecolor: getLineColor, // Sketch to Image
  linecolor_cartoon: getLineColor, // Sketch to Image
  linecolor_real: getLineColor, // Sketch to Image

  // AI Photo Dehaze
  'se-dehazing': getSeDehazing,

  // AI Portrait Retoucher
  portrait_enhancer: getPortraitEnhancer,

  // AI Photo Enhancer
  real_esrgan2: getRealEsrgan2,

  // AI Background Remover
  matting: getMatting, // 单工作台 待定
  matting_portrait: getMattingPortrait, // 批量工作台 Portrait
  matting_object: getMattingObject, // 批量工作台 Object

  // AI JPEG Artifact Remover
  jpeg_artifact: getGpegArtifact,

  crease_repair: getCreaseRepair,
}

// 基础模型格式 (必须严格符合格式)
// {
//   name: '配置文件名称',
//   config: [
//     {
//       name: '配置文件名称',
//       config: {
//         module: '模块的名称',
//         module_params: {
//           model_name: '模型名称',
//         },
//         out_params?: {
//           compress: {
//             quality: 80,
//           },
//         },
//       },
//     },
//   ],
// }

function getCodeFormer() {
  return {
    name: 'CodeFormer',
    config: [
      {
        name: 'CodeFormer',
        config: {
          module: 'CodeFormer',
          module_params: {
            model_name: 'CodeFormerStable',
          },
        },
      },
    ],
  }
}

function getEnlarge3(options) {
  return {
    config: [
      {
        name: 'enlarge_2x',
        config: {
          module: 'enlarge3',
          module_params: {
            model_name: 'EnlargeStandard_2x_Stable',
            suppress_noise: 50,
            remove_blur: 25,
            scale: 2,
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
      },
    ],
    name: 'enlarge_2x',
  }
}

function getEnlargeSr(options) {
  return {
    config: [
      {
        name: 'img2sr',
        config: {
          module: 'stable_diffusion',
          module_params: {
            model_name: 'img2sr_512',
            restore_faces: false,
            denoising: false,
            denoising_strength: 0.9,
          },
        },
        sd_script: 'repair_ssr', // 后台配置的SD脚本ID
      },
      {
        name: 'enlarge3',
        config: {
          module: 'enlarge3',
          module_params: {
            model_name: 'EnlargeStandard_4x_Stable', //EnlargeStandard_{scale}x_Stable,选择8x时为EnlargeStandard_4x_Stable
            suppress_noise: 50,
            remove_blur: 25,
            scale: 4, //1,2,4,8
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'enlarge_sr',
  }
}

function getEnlargeClarity(options) {
  const { denoising_strength, imageUid, scale, customize, customImageWidth, customImageHeight, prompt } = options
  return {
    config: [
      {
        name: 'enlarge_clarity',
        sd_mode: 'sd_enlarge_clarity',
        config: {
          module: 'sd_enhance',
          module_params: {
            scale,
            customize: customize || false,
            model_name: 'sd_clarity_upscaler',
            width: customImageWidth,
            height: customImageHeight,
            denoising_strength,
            prompt,
          },
        },
        cn_configs: [
          {
            image_uid: imageUid,
            cn_name: 'tile_resample',
          },
        ],
        sd_script: 'tiled_diffusion',
      },
    ],
    name: 'enlarge_clarity',
  }
}

function getMagicEnlargeClarity(options) {
  const { denoising_strength, imageUid, scale, customize, customImageWidth, customImageHeight, prompt } = options
  return {
    config: [
      {
        name: 'magic_enlarge_clarity', 
        sd_mode: 'sd_enlarge_clarity', 
        config: {
          module: 'sd_enhance', 
          module_params: {
            scale,
            customize: customize || false,
            model_name: 'clarity_magic_enlarge', 
            width: customImageWidth,
            height: customImageHeight,
            denoising_strength, 
            prompt, 
          },
        },
        cn_configs: [
         
          {
            image_uid: imageUid,
            cn_name: 'tile_resample',
          },
          // {
          //   image_uid: imageUid,
          //   cn_name: 'magic_enlarge_reference',
          // },
        ],
        sd_script: 'tiled_diffusion', 
      },
    ],
    name: 'magic_enlarge_clarity', 
  }
}

function getVaSharpenStandard(options) {
  const { imageWidth, imageHeight } = options
  return {
    config: [
      {
        name: 'va_sharpen_standard',
        config: {
          module: 'sharpen3',
          module_params: {
            model_name: 'SharpenGeneralStable',
            blur_type: 1,
            remove_blur: 0.5,
            suppress_noise: 0.5,
            remove_artifacts: 0.5,
            autoparams: true,
            model_switch: 'vance_1',
            width: imageWidth,
            height: imageHeight,
          },
        },
      },
    ],
    name: 'va_sharpen_standard',
  }
}

function getSharpenMb() {
  return {
    config: [
      {
        name: 'sharpen_mb',
        config: {
          module: 'sharpen2',
          module_params: {
            model_name: 'SharpenMotionBlurStable',
            remove_blur: 0.18,
            suppress_noise: 0.08,
            remove_artifacts: 0.05,
            autoparams: false,
            model_switch: 'vance_1',
          },
        },
      },
    ],
    name: 'sharpen_mb',
  }
}

function getSharpenLb() {
  return {
    config: [
      {
        name: 'sharpen_lb',
        config: {
          module: 'sharpen2',
          module_params: {
            model_name: 'SharpenLensBlurStable',
            remove_blur: 0.18,
            suppress_noise: 0.08,
            remove_artifacts: 0.05,
            autoparams: false,
            model_switch: 'vance_1',
          },
        },
      },
    ],
    name: 'sharpen_lb',
  }
}

function getSharpenSb() {
  return {
    config: [
      {
        name: 'sharpen_sb',
        config: {
          module: 'sharpen2',
          module_params: {
            model_name: 'SharpenSoftNormalStable',
            remove_blur: 0.2,
            suppress_noise: 0.1,
            remove_artifacts: 0,
            autoparams: false,
            model_switch: 'vance_1',
          },
        },
      },
    ],
    name: 'sharpen_sb',
  }
}

function getSharpenSr() {
  return {
    config: [
      {
        name: 'img2sr',
        config: {
          config: {
            module: 'stable_diffusion',
            module_params: {
              model_name: 'img2sr_512',
              restore_faces: false,
              denoising: false,
              denoising_strength: 0.9,
            },
          },
          sd_script: 'repair_ssr', // 后台配置的SD脚本ID
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'sharpen_sr',
  }
}

function getDenoise(options) {
  const { imageWidth, imageHeight } = options
  return {
    config: [
      {
        name: 'denoise',
        config: {
          module: 'denoise',
          module_params: {
            model_name: 'DenoiseStable',
            autoparams: false,
            remove_noise: 65,
            sharpen: 65,
            remove_original_detail: 75,
            width: imageWidth,
            height: imageHeight,
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
      },
    ],
    name: 'denoise',
  }
}

function getChainnerAnime() {
  return {
    name: 'chainner',
    config: [
      {
        name: 'chainner',
        config: {
          module: 'chainner',
          module_params: {
            model_name: 'Anime_4x_AnimeSharp',
            scale: 4, //1x,2x,4x,8x
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
  }
}

function getChainnerArtCG() {
  return {
    config: [
      {
        name: 'chainner',
        config: {
          module: 'chainner',
          module_params: {
            model_name: 'Universal_UltraSharp_4x',
            scale: 2,
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'chainner',
  }
}

function getChainnerTxt() {
  return {
    config: [
      {
        name: 'chainner_txt',
        config: {
          module: 'chainner',
          module_params: {
            model_name: 'Text_4x_TextSharpV1',
            scale: 4,
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'chainner_txt',
  }
}

function getWaifu() {
  return {
    config: [
      {
        name: 'waifu',
        config: {
          module: 'waifu',
          module_params: {
            model_name: 'models-upconv_7_anime_style_art_rgb',
            noise_level: 2, //0，1，2，3
            scale: 2, //2x,4x,8x,16x
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'waifu',
  }
}

function getRealEsrgan() {
  return {
    config: [
      {
        name: 'real_esrgan',
        config: {
          module: 'real_esrgan',
          module_params: {
            model_name: 'RealEsrganStable',
            noise_level: 2, //0,1,2,3
            scale: 2, //1x,2x,4x,6x,8x,勾选了Enhance without enlargement时取值为1x
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'real_esrgan',
  }
}

function getCreaseRepair(options) {
  const { imageWidth, imageHeight } = options
  return {
    config: [
      {
        name: 'crease_repair',
        config: {
          module: 'crease_repair',
          module_params: {
            model_name: 'CreaseRepairStable',
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
      },
    ],
    name: 'repair_sd',
  }
}

function getImg2sr(options) {
  const { imageWidth, imageHeight } = options
  return {
    config: [
      {
        name: 'img2sr',
        config: {
          module: 'img2sr',
          module_params: {
            model_name: 'style_sr_512',
            face_enhancer: true,
            denoising: false,
            strength: 0.9,
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
      },
    ],
    name: 'repair_sd',
  }
}

function getRecolor(options) {
  const { imageWidth, imageHeight, prompt } = options
  return {
    config: [
      {
        name: 'recolor',
        config: {
          module: 'sd_recolor',
          module_params: {
            model_name: 'sd_recolor',
            negative_prompt: '',
            prompt: '',
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
      },
    ],
    name: 'recolor',
  }
}

function getColorize() {
  return {
    config: [
      {
        name: 'deoldify2',
        config: {
          module: 'deoldify2',
          module_params: {
            model_name: 'DeoldifyArtistic',
            render_factor: 30,
          },
          compress: {
            quality: 100,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'colorize',
  }
}

function getBrightness(options) {
  return {
    config: [
      {
        name: 'brightness',
        config: {
          module: 'dped_sharpen',
          module_params: {
            model_name: 'DpedSharpenStable',
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'brightness',
  }
}

function getPerfect() {
  return {
    config: [
      {
        name: 'perfect',
        config: {
          module: 'perfect',
          module_params: {
            model_name: 'perfect_2k',
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'perfect',
  }
}

function getRepairSd(options) {
  // 通过参数获取不同的config
  const {} = options
  return {
    config: [
      {
        //Fix Scratches/Creases/Spots
        name: 'crease_repair',
        config: {
          module: 'crease_repair',
          module_params: {
            model_name: 'CreaseRepairStable',
          },
        },
      },
      {
        //Improve Quality
        name: 'img2sr',
        config: {
          module: 'stable_diffusion',
          module_params: {
            model_name: 'img2sr_512',
            restore_faces: true,
            denoising: false,
            denoising_strength: 0.9,
          },
        },
        sd_script: 'repair_ssr',
      },
      {
        //Colorize B&W Photo（Classic Restoration）
        name: 'recolor',
        config: {
          module: 'stable_diffusion',
          module_params: {
            model_name: 'sd_recolor',
            negative_prompt: '',
            prompt: '',
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
        cn_configs: [
          {
            image_uid: '97e860d882229fd3d1faf1d05dc7e05c',
            controlnet_use_previous_output: true,
            cn_name: 'recolor',
          },
        ],
      },
      {
        //Colorize B&W Photo（Classic Restoration）
        name: 'deoldify2',
        config: {
          module: 'deoldify2',
          module_params: {
            model_name: 'DeoldifyArtistic',
            render_factor: 30,
          },
        },
      },
    ],
    name: 'repair_sd',
  }
}

function getWaifuAnime() {
  return {
    config: [
      {
        name: 'waifu',
        config: {
          module: 'waifu',
          module_params: {
            model_name: 'models-cunet',
            noise_level: 2, //0:No 1:Little 2:waifu 3:waifu
            scale: 2, //2x,4x,8x,16x
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'waifu',
  }
}

function getWaifu2xAnime() {
  return {
    config: [
      {
        name: 'waifu',
        config: {
          module: 'waifu',
          module_params: {
            model_name: 'models-upconv_7_anime_style_art_rgb',
            noise_level: 2, //0:No 1:Little 2:waifu 3:waifu
            scale: 2, //2x,4x,8x,16x
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'waifu',
  }
}

// imageUid
// imageWidth
// imageHeight
function getImg2anime(options) {
  const { imageUid, styleType, denoising_strength, overwrite, prompt, cn_configs = [], workName } = options
  // todo styleStrength逻辑处理
  const cnConfigs = cn_configs.map((item) => {
    return {
      image_uid: imageUid,
      cn_name: item,
    }
  })
  return {
    config: [
      {
        config: {
          module: 'stable_diffusion',
          module_params: {
            model_name: styleType,
            prompt,
            overwrite,
            denoising_strength,
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
        name: workName,
        // 可选项 需要参数判断
        cn_configs: cnConfigs,
      },
    ],
    name: workName,
  }
}

function getAnimeganToon() {
  return {
    config: [
      {
        name: 'animegan_toon',
        config: {
          module: 'animegan2',
          module_params: {
            model_name: 'Animegan2Stable',
            single_face: true,
            aligned_size: 512,
          },
          // out_params: {
          //   compress: {
          //     quality: 80,
          //   },
          //   keep_origin_name: false,
          // },
        },
      },
    ],
    name: 'animegan_toon',
  }
}

function getAnimegan2c() {
  return {
    config: [
      {
        name: 'animegan2c',
        config: {
          module: 'animegan2c',
          module_params: {
            model_name: 'Animegan2Stable',
          },
          // out_params: {
          //   compress: {
          //     quality: 80,
          //   },
          //   keep_origin_name: false,
          // },
        },
      },
    ],
    name: 'animegan2c',
  }
}

function getCartoonize() {
  return {
    config: [
      {
        name: 'cartoonize',
        config: {
          module: 'cartoonize',
          module_params: {
            model_name: 'CartoonizeStable',
            single_face: false,
            aligned_size: 512,
          },
          // out_params: {
          //   compress: {
          //     quality: 80,
          //   },
          //   keep_origin_name: false,
          // },
        },
      },
    ],
    name: 'cartoonize',
  }
}

function getArtLine(options) {
  const { imageWidth, imageHeight, singleFace, workName } = options
  return {
    config: [
      {
        name: 'portrait_enhancer',
        config: {
          module: 'portrait_enhancer',
          module_params: {
            model_name: 'PortraitEnhancer_v1.4',
          },
        },
      },
      {
        name: 'matting',
        config: {
          module: 'matting',
          module_params: {
            model_name: 'MattingStable',
            rescale: 532,
          },
        },
      },
      {
        config: {
          module: 'artLine',
          module_params: {
            model_name: 'ArtLineStable_650',
            single_face: singleFace,
            aligned_size: 512,
          },
          // out_params: {
          //   compress: {
          //     quality: 80,
          //   },
          // },
        },
        name: 'artLine',
      },
    ],
    name: workName,
  }
}

function getLineColor(options) {
  // prompt 暂时不能输入
  const { imageWidth, imageHeight, imageUid, styleType } = options
  const modelName = styleType === 'cartoon' ? 'linecolor_cartoon' : 'linecolor_real'
  // const cnName = styleType === 'cartoon' ? 'linecolor_canny' : ''
  return {
    config: [
      {
        config: {
          module: 'stable_diffusion',
          module_params: {
            model_name: modelName,
            prompt: options.prompt || '',
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
        name: 'stable_diffusion',
        cn_configs: [
          {
            image_uid: imageUid,
            cn_name: 'linecolor_canny',
          },
        ],
      },
    ],
    name: modelName,
  }
}

function getSeDehazing() {
  return {
    config: [
      {
        name: 'se-dehazing',
        config: {
          module: 'dehazing',
          module_params: {
            model_name: 'DehazingStable',
            contrast: 1,
            brightness: 20,
            autoRetoucher: true, //勾选Auto Color Optimization时需要传该字段，否则不传
          },
        },
      },
      {
        name: 'jpeg_artifact',
        config: {
          module: 'hinet_jpeg',
          module_params: {
            model_name: 'HinetJPEGStable',
            deblur: true,
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
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'se-dehazing',
  }
}

function getPortraitEnhancer(options) {
  const modelName = options.modelName
  //Retouch对应PortraitEnhancer_v1.4；Enhance对应PortraitEnhancer_v1.2
  const model_name = modelName === 'Retouch' ? 'PortraitEnhancer_v1.4' : 'PortraitEnhancer_v1.2'
  return {
    config: [
      {
        name: 'portrait_enhancer',
        config: {
          module: 'portrait_enhancer',
          module_params: {
            model_name: model_name,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'portrait_enhancer',
  }
}

function getRealEsrgan2() {
  return {
    config: [
      {
        name: 'real_esrgan2',
        config: {
          module: 'real_esrgan',
          module_params: {
            model_name: 'RealEnhancerStable',
            scale: 1,
            customize: false,
            width: 0,
            height: 0,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'real_esrgan2',
  }
}

function getMatting(options) {
  return {
    config: [
      {
        activeName: '1',
        name: 'matting',
        config: {
          module: 'portrait_matting',
          module_params: {
            model_name: 'PortraitMattingStable',
            no_face_blur: true,
          },
          out_params: {
            compress: {
              quality: 80,
            },
          },
        },
      },
    ],
    name: 'matting',
  }
}

function getMattingPortrait(options) {
  return {
    config: [
      {
        name: 'matting',
        config: {
          module: 'matting',
          module_params: {
            model_name: 'Mattingstable',
            no_face_blur: true,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'matting',
    zoomType: 1,
  }
}

function getMattingObject() {
  return {
    config: [
      {
        name: 'matting',
        config: {
          module: 'matting',
          module_params: {
            model_name: 'MattingStable',
            rescale: 532,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'matting',
    zoomType: 1,
  }
}

function getGpegArtifact() {
  return {
    config: [
      {
        name: 'jpeg_artifact',
        config: {
          module: 'hinet_jpeg',
          module_params: {
            model_name: 'HinetJPEGStable',
            deblur: true,
          },
          out_params: {
            compress: {
              quality: 80,
            },
            keep_origin_name: false,
          },
        },
      },
    ],
    name: 'jpeg_artifact',
  }
}

export const TaskName = {
  REPAIR_SD:'repair_sd'
}

export const ModelName = {
  CREASE_REPAIR:'crease_repair',
  IMG2SR:'img2sr',
  RECOLOR:'recolor',
  COLORIZE:'colorize'
}
