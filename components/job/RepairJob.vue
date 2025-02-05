<template>
  <div class="repair-job">
    <div class="restorer-option">{{ $t('workspace.photo_restorer_options') }}</div>
    <div class="options-select">
      <div class="restorer-options">
        <span>{{ $t('workspace.photo_restorer_options1') }}</span>
        <el-switch v-model="optionsValue1" v-track-label="$commonTrackLabel('fix_scratches')" />
      </div>
      <div class="restorer-options">
        <span>{{ $t('workspace.photo_restorer_options2') }}</span>
        <el-switch v-model="optionsValue2" v-track-label="$commonTrackLabel('improve_quality')" />
      </div>
      <div v-show="optionsValue2">
        <el-radio
          v-model="denoising"
          :label="true"
          class="mag-t-10"
          v-track-label="$commonTrackLabel('auto_denoise')"
        >
          {{ $t('workspace.auto_denoise') }}
        </el-radio>
        <el-radio
          v-model="denoising"
          :label="false"
          class="mag-t-10"
          v-track-label="$commonTrackLabel('manual_denoise')"
        >
          {{ $t('workspace.manual') }}
        </el-radio>
        <slider
          :value="50"
          @changeSliderHandle="changeSliderHandle"
          :disabled="!img2srConfig.module_params.denoising"
        />
        <el-checkbox
          v-model="img2srConfig.module_params.restore_faces"
          class="mag-b-10"
          @change="changeRestoreFaces"
          v-track-label="$commonTrackLabel('restore_faces')"
        >
          {{ $t('workspace.restore_faces') }}
        </el-checkbox>
      </div>
      <div class="restorer-options">
        <span>{{ $t('workspace.photo_restorer_options3') }}</span>
        <el-switch v-model="optionsValue3" v-track-label="$commonTrackLabel('colorize')" />
      </div>
      <div v-show="optionsValue3">
        <el-radio
          v-model="isRecolor"
          :label="false"
          class="mag-t-10"
          v-track-label="$commonTrackLabel('recolor_classic')"
        >
          {{ $t('workspace.recolor_classic') }}
        </el-radio>
        <el-radio
          v-model="isRecolor"
          :label="true"
          class="mag-t-10"
          v-track-label="$commonTrackLabel('recolor_delicate')"
        >
          {{ $t('workspace.recolor_delicate') }}
        </el-radio>
      </div>
      <div v-if="optionsValue3 && isRecolor">
        <p class="mag-t-15 mag-b-20 modal-desc-title">{{ $t('workspace.cartoon_description') }}</p>
        <el-input
          type="textarea"
          rows="5"
          maxlength="140"
          :placeholder="$t('workspace.recolor_des_pld')"
          class="mag-b-15"
          v-model="recolorConfig.module_params.prompt"
        />
        <p class="mag-b-20 modal-assist-text">{{ $t('workspace.recolor_sub_desc') }}</p>
      </div>
      <div class="tip-ctr"><i class="iconfont-single icon-s-info"></i>{{ $t('workspace.recolor_tip') }}</div>
    </div>
  </div>
</template>

<script>
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import WorkConfigurationPreprocessingMixins from '@/mixins/components/WorkConfigurationPreprocessingMixins'
  import { deepClone } from '@/static/script/utils'
  import Slider from '@/components/Slider.vue'

  export default {
    name: 'RepairJob',
    components: { Slider },
    mixins: [WorkConfigurationPreprocessingMixins],
    props: {
      index: Number,
    },
    data() {
      return {
        optionsValue1: true,
        optionsValue2: true,
        optionsValue3: false,

        activeJob: WorkFlowType.real_esrgan,
        jobs: [
          {
            job: WorkFlowType.waifu_cunet,
            elkJob: WorkFlowType.waifu,
            config: WorkFlowConfig(WorkFlowType.waifu_cunet),
            label: this.$t('workspace.workflow_waifu_3'),
          },
          {
            job: WorkFlowType.waifu_upconv,
            elkJob: WorkFlowType.waifu,
            config: WorkFlowConfig(WorkFlowType.waifu_upconv),
            label: this.$t('workspace.workflow_waifu_4'),
          },
          {
            job: WorkFlowType.real_esrgan,
            config: WorkFlowConfig(WorkFlowType.real_esrgan),
            label: this.$t('workspace.workflow_waifu_9'),
            elkName: WorkFlowType.real_esrgan,
            elkJob: WorkFlowType.real_esrgan,
          },
        ],
        denoising: true,
        img2srConfig: deepClone(WorkFlowConfig(WorkFlowType.img2sr)),
        isRecolor: true, //是否是精细修复，默认为精细修复
        deoldifyConfig: deepClone(WorkFlowConfig(WorkFlowType.deoldify2)), //黑白照片上色功能的经典修复模型
        recolorConfig: deepClone(WorkFlowConfig(WorkFlowType.sd_recolor)), //黑白照片上色功能的精细修复模型
      }
    },
    computed: {
      // activeJobConfig() {
      //   if (this.currentJob) {
      //     return this.currentJob.config
      //   } else {
      //     return null
      //   }
      // },
      // currentJob() {
      //   const filter = this.jobs.filter((item) => item.job === this.activeJob)
      //   if (filter.length) {
      //     return filter[0]
      //   } else {
      //     return null
      //   }
      // },
    },
    watch: {
      optionsValue1: {
        handler() {
          this.changeConfigForParent()
        },
      },
      optionsValue2: {
        handler() {
          this.changeConfigForParent()
        },
      },
      optionsValue3: {
        handler() {
          this.changeConfigForParent()
        },
      },
      denoising(val) {
        this.img2srConfig.module_params.denoising = !val
      },
      isRecolor() {
        this.changeConfigForParent()
      },
      recolorConfig: {
        handler() {
          this.changeConfigForParent()
        },
        deep: true,
      },
    },
    created() {
      this.$set(this.img2srConfig.module_params, 'restore_faces', true)
    },
    mounted() {
      // this.activeJob = this.job
      this.changeConfigForParent()
    },

    methods: {
      changeConfigForParent() {
        // config = config.map((item) => ({ ...item, elkJob: 'old_photo_restorer2' }))
        this.$store.commit(
          'SET_BATCH_PROCESS_DISABLE',
          !this.optionsValue1 && !this.optionsValue2 && !this.optionsValue3
        )
        this.$emit(
          'changeRepairConfig',
          {
            isFix: this.optionsValue1,
            isImproveQuality: { flag: this.optionsValue2, config: this.img2srConfig },
            isColorize: this.optionsValue3,
            recolorConfig: {
              isRecolor: this.isRecolor,
              config: this.isRecolor
                ? {
                    name: WorkFlowType.recolor,
                    config: this.recolorConfig,
                    cn_configs: [
                      {
                        image_uid: '',
                        controlnet_use_previous_output: this.optionsValue1 || this.optionsValue2,
                        cn_name: 'recolor',
                      },
                    ],
                  }
                : { name: WorkFlowType.colorize, config: this.deoldifyConfig },
            },
          },
          this.index
        )
      },
      changeSliderHandle(val) {
        this.img2srConfig.module_params.denoising_strength = Number((0.8 + (0.2 / 100) * val).toFixed(2))
      },
      // handleJobSwitch(item) {
      //   this.activeJob = item
      // },
      changeRestoreFaces(val) {
        this.$set(this.img2srConfig.module_params, 'restore_faces', val)
      },
    },
  }
</script>

<style lang="less" scoped>
  .el-radio {
    display: block;
  }

  .repair-job {
    padding: 0 20px;
    margin-bottom: 20 / @base;
  }

  .options-select {
    // padding: 10 / @base;
    // background-color: #f5f7fa;
  }

  .restorer-option {
    // padding: 0 10 / @base;
    margin: 10 / @base 0 10 / @base;
    font-size: 16 / @base;
    font-weight: bold;
    // text-align: left;
  }

  .restorer-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32 / @base;
    font-size: 16 / @base;
  }
</style>
