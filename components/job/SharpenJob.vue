<template>
  <div class="sharpen-job">
    <p class="sharpen-job_title pad-l-10">
      {{ $t('workspace.sharpen_mode') }}
    </p>
    <job-list :active-job="activeJob" :jobs="jobs" @handleJobSwitch="handleJobSwitch" />
    <workflow-operations v-if="activeJob !== 'img2sr'" :work="activeJob" :config="activeJobConfig" />
    <div v-if="activeJobConfig && !useCutoutApi" class="additional-setting-ctr">
      <p class="sharpen-job_title">
        {{ $t('workspace.additional_settings') }}
      </p>
      <div v-if="activeJob === 'img2sr'">
        <div class="switch-wrap mag-t-15">
          <span class="switch-label">{{ $t('workspace.denoise_strength') }}</span>
          <el-switch v-model="denoising" v-track-label="$commonTrackLabel('denoise_strength')" />
        </div>
        <slider
          class="mag-b-10"
          :value="50"
          @changeSliderHandle="changeSliderHandle"
          :disabled="!activeJobConfig.module_params.denoising"
        />
      </div>
      <div class="switch-wrap">
        <span class="switch-label">{{ $t('workspace.portrait_retouch') }}</span>
        <el-switch
          @change="handleAppendChange"
          v-model="isAppendConfig"
          v-track-label="$commonTrackLabel('portrait_retouch')"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import { isNull, deepClone } from '@/static/script/utils'
  import JobList from '@/components/job/JobList'
  import Slider from '@/components/Slider.vue'

  export default {
    name: 'SharpenJob',
    components: { JobList, WorkflowOperations, Slider },
    props: {
      index: Number,
      job: String,
      config: Object,
    },
    data() {
      return {
        activeJob: WorkFlowType.sharpen3,
        isAppendConfig: true,
        denoising: true,
      }
    },
    computed: {
      activeJobConfig() {
        if (this.currentJob) {
          return this.currentJob.config
        }
        return null
      },
      currentJob() {
        const filter = this.jobs.filter((item) => item.job === this.activeJob)
        if (filter.length) {
          return filter[0]
        } else {
          return null
        }
      },
      jobs() {
        return [
          {
            job: WorkFlowType.sharpen3,
            config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_general)),
            label: this.$t('workspace.general'),
            icon: 'icon_sharpen_job_general',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen3,
          },
          {
            job: WorkFlowType.sharpen2_motion_blur,
            config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_motion_blur)),
            label: this.$t('workspace.motion_blur'),
            icon: 'icon_sharpen_job_motion',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen2_motion_blur,
          },
          {
            job: WorkFlowType.sharpen2_lens_blur,
            config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_lens_blur)),
            label: this.$t('workspace.lens_blur'),
            icon: 'icon_sharpen_job_focus',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen2_lens_blur,
          },
          {
            job: WorkFlowType.sharpen2_sort_normal,
            config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_sort_normal)),
            label: this.$t('workspace.sort_blur'),
            icon: 'icon_sharpen_job_feather',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen2_sort_normal,
          },
          {
            job: WorkFlowType.img2sr,
            config: deepClone(WorkFlowConfig(WorkFlowType.img2sr)),
            label: this.$t('workspace.very_blur'),
            flex2: true,
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen_sr,
            iconfont_icon: 'icon-s-new',
          },
        ]
      },
      useCutoutApi() {
        return false
      },
    },
    watch: {
      activeJobConfig: {
        handler() {
          this.handleAppendChange(this.isAppendConfig)
        },
        deep: true,
        immediate: true,
      },
      denoising(val) {
        this.activeJobConfig.module_params.denoising = !val
      },
    },

    mounted() {
      this.activeJob = this.jobs[0].job
    },
    methods: {
      changeConfigForParent(config) {
        this.$emit('changeConfig', config, this.index)
      },
      handleJobSwitch(item) {
        if (isNull(item)) {
          return
        }

        this.activeJob = item.job
        if (this.activeJob === WorkFlowType.sharpen) {
          this.isAppendConfig = true
        }
        this.$emit('changeSharpenActiveModel', item.job)
      },
      handleAppendChange(val) {
        console.log('handleAppendConfig')
        this.activeJobConfig.module_params.custom_auto_mode = this.isAppendConfig ? 1 : 0
        if (val && !this.useCutoutApi) {
          this.changeConfigForParent([
            {
              name: this.activeJob,
              config: this.activeJobConfig,
              elkName: this.currentJob.elkName,
            },
            {
              name: WorkFlowType.CodeFormer,
              config: WorkFlowConfig(WorkFlowType.CodeFormer),
            },
          ])
        } else {
          this.changeConfigForParent([
            {
              name: this.activeJob,
              config: this.activeJobConfig,
              elkName: this.currentJob.elkName,
            },
          ])
        }

        //Sharpen增加基于StableSR的超分复原
        if (this.activeJob === 'img2sr') {
          const config = { ...this.activeJobConfig }
          config.module_params.restore_faces = val ? true : false
          this.changeConfigForParent([
            {
              name: this.activeJob,
              config,
              elkName: this.currentJob.elkName,
              sd_script: 'repair_ssr',
            },
          ])
        }
      },
      changeSliderHandle(val) {
        this.activeJobConfig.module_params.denoising_strength = Number((0.8 + (0.2 / 100) * val).toFixed(2))
      },
    },
  }
</script>

<style lang="less" scoped>
  .sharpen-job {
    .additional-setting-ctr {
      padding: 10 / @base;
    }

    .sharpen-job_title {
      margin: 10 / @base 0 10 / @base;
      font-size: 16 / @base;
      text-align: left;
    }

    .switch-label {
      font-size: 14 / @base;
    }

    .switch-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  /deep/ .el-switch.is-disabled {
    .el-switch__core,
    .el-switch__core::after {
      background-color: #c0c4cc;
    }
  }
</style>
