<template>
  <div class="anime-job">
    <div class="anime-job-configs">
      <!-- <p class="anime-job_title">
        {{ $t('workspace.workflow_waifu_1') }}
      </p> -->
      <!-- <el-select class="module-select" v-model="activeJob" popper-class="work-selection-down">
        <el-option v-for="(option, i) in jobs" :key="i" :label="option.label" :value="option.job" />
      </el-select> -->
      <workflow-operations
        v-if="activeJobConfig"
        :work="activeJob"
        :config="activeJobConfig"
        @showTip="showTip"
      />
    </div>
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'

  import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
  import { isNull } from 'static/script/utils'

  export default {
    name: 'AnimeJob',
    components: { WorkflowOperations },
    props: {
      index: Number,
      image: Object,
    },
    data() {
      return {
        activeJob: WorkFlowType.real_esrgan,
        jobs: [
          {
            job: WorkFlowType.chainner,
            label: this.$t('workspace.workflow_chainner_1'),
            config: WorkFlowConfig(WorkFlowType.chainner),
            elkJob: WorkFlowType.chainner,
          },
          {
            job: WorkFlowType.waifu_upconv,
            label: this.$t('workspace.workflow_waifu_4'),
            elkName: WorkFlowType.waifu,
            elkJob: WorkFlowType.waifu,
            config: WorkFlowConfig(WorkFlowType.waifu_upconv),
          },
          {
            job: WorkFlowType.real_esrgan,
            label: this.$t('workspace.workflow_waifu_9'),
            config: WorkFlowConfig(WorkFlowType.real_esrgan),
          },
        ],
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
    },
    watch: {
      activeJobConfig: {
        handler() {
          this.changeConfigForParent([
            {
              name: this.activeJob,
              elkJob: this.currentJob.elkJob || this.activeJob,
              elkName: this.currentJob.elkName || this.activeJob,
              config: this.activeJobConfig,
            },
          ])
          this.changeActiveJobParent()
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      showTip() {
        this.$emit('showTip')
      },
      changeActiveJobParent() {
        this.$emit('changeActiveJob', this.currentJob.elkJob || this.activeJob)
      },
      changeConfigForParent(config) {
        if (config[0].config.module_params.scale == 1) {
          config[0].config.module_params.customize = false
        }
        this.$emit('changeConfig', config, this.index)
      },
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
          this.config = null
        }
      },
    },
  }
</script>

<style lang="less">
  .anime-job {
    .anime-job_title {
      padding: 0 10 / @base;
      margin: 10 / @base 0 10 / @base;
      font-size: 14 / @base;
    }

    .module-select {
      margin-left: 10 / @base;
    }
  }
</style>
