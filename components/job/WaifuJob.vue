<template>
  <div class="sharpen-job">
    <!-- <p class="quicksand-bold">{{ $t('workspace.workflow_waifu_1') }}</p>
    <select-job-list :active-job="activeJob" :jobs="jobs" @handleJobSwitch="handleJobSwitch" /> -->
    <workflow-operations :work="activeJob" :config="activeJobConfig" />
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  // import SelectJobList from '@/components/job/SelectJobList.vue'

  export default {
    name: 'WaifuJob',
    components: { WorkflowOperations },
    props: {
      index: Number,
      job: String,
      config: Object,
    },
    data() {
      return {
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
      }
    },
    computed: {
      activeJobConfig() {
        if (this.currentJob) {
          return this.currentJob.config
        } else {
          return null
        }
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
              elkJob: this.currentJob.elkJob,
              config: this.activeJobConfig,
              elkName: this.currentJob.elkName,
            },
          ])
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.activeJob = this.job
    },

    methods: {
      changeConfigForParent(config) {
        this.$emit('changeConfig', config, this.index)
      },
      handleJobSwitch(item) {
        this.activeJob = item
      },
    },
  }
</script>

<style lang="less" scoped>
  .sharpen-job {
    .sharpen-job_title {
      padding: 0 10 / @base;
      margin: 10 / @base 0 10 / @base;
      font-size: 16 / @base;
      text-align: left;
    }

    .sharpen-job_mini-title {
      font-size: 14 / @base;
    }

    .sharpen-job_switch {
      display: flex;
      justify-content: space-between;
      padding: 0 10 / @base 10 / @base;
    }
  }

  /deep/ .el-switch.is-disabled {
    .el-switch__core,
    .el-switch__core::after {
      background-color: #c0c4cc;
    }
  }
</style>
