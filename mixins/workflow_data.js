export default {
  data() {
    return {
      workSpace: {
        enlarge: this.$t('common.common_solution_1'),
        denoise: this.$t('common.common_solution_2'),
        sharpen: this.$t('common.common_solution_3'),
        matting: this.$t('common.common_solution_4'),
        colorize: this.$t('common.common_solution_5'),
        cartoonize: this.$t('common.common_solution_6'),
        portrait: this.$t('common.comumon_solution_7'),
        sketch: this.$t('common.photo_to_sketch'),
        perfect: this.$t('common.common_solution_8'),
        face_enhancer: this.$t('common.common_solution_14'),
        repair: this.$t('common.common_solution_15'),
        waifu: this.$t('common.common_solution_16'),
        jpeg_artifact: this.$t('common.common_solution_17'),
        'se-dehazing': this.$t('common.common_solution_18'),
        portrait_enhancer: this.$t('common.common_solution_20'),
        animegan_toon: this.$t('common.common_solution_6'),
        real_esrgan2: this.$t('common.common_solution_21'),
        stable_diffusion: this.$t('common.common_solution_26'),
        sd_clothing: this.$t('common.common_solution_34'),
        sd_generator: this.$t('common.common_solution_33'),
        sd_extended: this.$t('common.common_nav_extender_workspace'),
        linecolor: this.$t('common.common_solution_36'),
      },
      workFlowSelect: {
        'se-night': this.$t('common.se-night'),
        'se-hd': this.$t('common.se-hd'),
        'se-portrait-enhancement': this.$t('common.se-portrait-enhancement'),
        'se-old-repair': this.$t('common.se-old-repair'),
      },
    }
  },
}
