<template>
  <div class="enlarge3-job">
    <div class="enlarge3-job-configs">
      <scale-list :scales="jobs" :image="image" @handleScaleChange="handleScaleChange" @showTip="showTip" />
      <workflow-operations v-if="config && !isNewEnlargeModel" :work="model_name" :config="config" />
      <div class="operations" v-if="isNewEnlargeModel">
        <div v-if="highQuality" class="high-quality-ctr">
          <va-switch @changeSwitchHandle="changeSwitchHandle" class="tp-title" />
          <slider
            :type="2"
            attr="suppress_noise"
            :value="newEnlarge3Obj.module_params.suppress_noise"
            :label="$t('workspace.config_4')"
            :disabled="newEnlarge3Obj.module_params.autoparams"
            @changeSliderHandle="changeSliderHandle"
          />
          <slider
            :type="2"
            attr="remove_blur"
            :value="newEnlarge3Obj.module_params.remove_blur"
            :label="$t('workspace.config_5')"
            :disabled="newEnlarge3Obj.module_params.autoparams"
            @changeSliderHandle="changeSliderHandle"
          />
          <slider
            :type="2"
            attr="fix_compression"
            :value="newEnlarge3Obj.module_params.fix_compression"
            :label="$t('workspace.fix_compression')"
            :disabled="newEnlarge3Obj.module_params.autoparams"
            @changeSliderHandle="changeSliderHandle"
          />
        </div>
        <div v-else>
          <va-switch @changeSwitchHandle="changeSwitchHandle" class="tp-title" />
          <slider
            :type="2"
            attr="suppress_noise"
            :value="standardObj.module_params.suppress_noise"
            :label="$t('workspace.config_4')"
            :disabled="standardObj.module_params.autoparams"
            @changeSliderHandle="changeSliderHandle"
          />
          <slider
            :type="2"
            attr="remove_blur"
            :value="standardObj.module_params.remove_blur"
            :label="$t('workspace.config_5')"
            :disabled="standardObj.module_params.autoparams"
            @changeSliderHandle="changeSliderHandle"
          />
        </div>
      </div>
    </div>
    <custom-dialog :visible.sync="tipVisible" :show-header="false" :show-close="false">
      <p v-html="$t('workspace.custom_tip_1')"></p>
      <p v-html="$t('workspace.custom_tip_2')"></p>
      <template #footer>
        <button
          class="primary-small-button"
          @click="tipVisible = false"
          v-track-label="$commonTrackLabel('tip_close_button')"
        >
          {{ $t('common.alert_ok') }}
        </button>
      </template>
    </custom-dialog>
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'

  import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
  import { isNull, deepClone } from 'static/script/utils'
  import ScaleList from '@/components/job/ScaleList.vue'
  import CustomDialog from '@/components/CustomDialog.vue'
  import Slider from '@/components/Slider.vue'
  import VaSwitch from '@/components/Switch.vue'

  export default {
    name: 'Enlarge3Job',
    components: { ScaleList, WorkflowOperations, CustomDialog, Slider, VaSwitch },
    props: {
      image: Object,
      highQuality: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        model_name: 'enlarge3',
        config: null,
        tipVisible: false,
        newEnlarge3Obj: deepClone(WorkFlowConfig(WorkFlowType.new_enlarge3)),
        standardObj: deepClone(WorkFlowConfig(WorkFlowType.enlarge)),
      }
    },
    computed: {
      jobs() {
        return [
          {
            label: this.$t('workspace.workflow_enlarge_7'),
            value: 1,
            config: WorkFlowConfig(WorkFlowType.enlarge3, 1),
          },
          {
            label: this.$t('workspace.workflow_enlarge_1'),
            value: 2,
            config: WorkFlowConfig(WorkFlowType.enlarge3, 2),
          },
          {
            label: this.$t('workspace.workflow_enlarge_2'),
            value: 4,
            config: WorkFlowConfig(WorkFlowType.enlarge3, 4),
          },
          {
            label: this.$t('workspace.workflow_enlarge_4'),
            value: 8,
            config: WorkFlowConfig(WorkFlowType.enlarge3, 8),
            afterBr: true,
          },
          {
            label: this.$t('workspace.720p'),
            value: '720p',
            type: 'setting',
            config: WorkFlowConfig(WorkFlowType.enlarge3, 4),
            // disabled: !this.showCustomize,
          },
          {
            label: this.$t('workspace.1080p'),
            value: '1080p',
            type: 'setting',
            config: WorkFlowConfig(WorkFlowType.enlarge3, 4),
            // disabled: !this.showCustomize,
          },
          {
            label: this.$t('workspace.4K'),
            value: '4k',
            type: 'setting',
            config: WorkFlowConfig(WorkFlowType.enlarge3, 4),
            // disabled: !this.showCustomize,
            afterBr: true,
          },
          {
            label: this.$t('workspace.pic_output_s_tit_3_check_4'),
            value: 'custom',
            type: 'setting',
            config: WorkFlowConfig(WorkFlowType.enlarge3, 4),
            disabled: !this.showCustomize,
          },
        ]
      },
      showCustomize() {
        const pages = [
          'workspace-enhance',
          'anime_upscaler',
          'denoise_ai',
          'image_enhancer',
          'image_enlarger',
          'image_upscaler',
          'increase_resolution',
          'make_photo_hd',
          'sharpen_ai',
          'unblur_image',
        ]
        return pages.includes(this.$route.name.replace('lang-', ''))
      },
      isNewEnlargeModel() {
        // return this.$store.state.isNewEnlargeModel
        return false
      },
    },
    watch: {
      config: {
        handler(val) {
          if (this.isNewEnlargeModel) {
            let config = deepClone(this.standardObj)
            if (this.highQuality) {
              config = deepClone(this.newEnlarge3Obj)
            }
            this.$emit('changeConfig', [
              {
                name: WorkFlowType.enlarge,
                elkJob: WorkFlowType.enlarge,
                elkName: WorkFlowType.enlarge,
                config,
              },
            ])
          } else {
            this.$emit('changeConfig', [
              {
                name: WorkFlowType.enlarge,
                elkJob: WorkFlowType.enlarge,
                elkName: WorkFlowType.enlarge3,
                config: val,
              },
            ])
          }
        },
        deep: true,
      },
      newEnlarge3Obj: {
        handler(val) {
          this.$emit('changeConfig', [
            {
              name: WorkFlowType.enlarge,
              elkJob: WorkFlowType.enlarge,
              elkName: WorkFlowType.enlarge3,
              config: val,
            },
          ])
        },
        deep: true,
      },
      standardObj: {
        handler(val) {
          this.$emit('changeConfig', [
            {
              name: WorkFlowType.enlarge,
              elkJob: WorkFlowType.enlarge,
              elkName: WorkFlowType.enlarge,
              config: val,
            },
          ])
        },
        deep: true,
      },
      highQuality(val) {
        let config = deepClone(this.standardObj)
        if (this.highQuality) {
          config = deepClone(this.newEnlarge3Obj)
        }
        this.$emit('changeConfig', [
          {
            name: WorkFlowType.enlarge,
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.enlarge3,
            config,
          },
        ])
      },
    },
    methods: {
      handleScaleChange(scale, w = 0, h = 0) {
        const filter = this.jobs.filter((item) => item.value === scale)
        if (!isNull(filter)) {
          if (scale === 'custom') {
            filter[0].config.module_params.customize = true
            filter[0].config.module_params.width = w
            filter[0].config.module_params.height = h
          } else {
            filter[0].config.module_params.customize = false
          }
          this.config = filter[0].config
        } else {
          this.config = WorkFlowConfig(WorkFlowType.enlarge3, 4)
          if (scale === 'p') {
            this.config.module_params.p = w
            this.config.module_params.customize = true
          }
        }
        if (this.isNewEnlargeModel) {
          const scale = this.config.module_params.scale
          if (this.highQuality) {
            const scaleName = String(scale).includes('x') ? scale : scale + 'x'
            this.newEnlarge3Obj.module_params.model_name = 'EnlargeStandard_' + scaleName + '_96_Stable'
            if (scale === 8) {
              this.newEnlarge3Obj.module_params.model_name = 'EnlargeStandard_4x_96_Stable'
            }
            this.newEnlarge3Obj.module_params.scale = scale
            this.newEnlarge3Obj.module_params.customize = this.config.module_params.customize
            this.newEnlarge3Obj.module_params.width = this.config.module_params.width
            this.newEnlarge3Obj.module_params.height = this.config.module_params.height
          } else {
            this.standardObj.module_params.model_name = 'EnlargeStable'
            this.standardObj.module_params.scale = scale
            this.standardObj.module_params.customize = this.config.module_params.customize
            this.standardObj.module_params.width = this.config.module_params.width
            this.standardObj.module_params.height = this.config.module_params.height
          }

          if (this.config.module_params.p) {
            this.newEnlarge3Obj.module_params.p = this.config.module_params.p
            this.standardObj.module_params.p = this.config.module_params.p
          } else {
            delete this.newEnlarge3Obj.module_params.p
            delete this.standardObj.module_params.p
          }
        }
      },
      showTip() {
        this.tipVisible = true
      },
      changeSwitchHandle(val) {
        if (this.highQuality) {
          this.newEnlarge3Obj.module_params.autoparams = val
        } else {
          this.standardObj.module_params.autoparams = val
        }
      },
      changeSliderHandle(val, attr) {
        if (attr) {
          if (this.highQuality) {
            this.newEnlarge3Obj.module_params[attr] = val
          } else {
            this.standardObj.module_params[attr] = val
          }
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .operations {
    padding: 10 / @base;
  }
</style>
