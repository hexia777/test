<template>
  <div class="sharpen-job">
    <p class="quicksand-bold">{{ $t('workspace.workflow_perfect_1') }}</p>
    <icon-job-list :active-job="activeJob" :jobs="jobs" @handleJobSwitch="handleJobSwitch" />
    <workflow-operations :work="activeJob" :config="activeJobConfig" />
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import IconJobList from '@/components/job/IconJobList.vue'

  export default {
    name: 'PerfectJob',
    components: { IconJobList, WorkflowOperations },
    props: {
      index: Number,
      job: String,
      config: Object,
    },
    data() {
      return {
        activeJob: WorkFlowType.perfect,
      }
    },
    computed: {
      activeJobConfig() {
        const filter = this.jobs.filter((item) => item.job === this.activeJob)
        if (filter.length) {
          return filter[0].config
        } else {
          return null
        }
      },
      jobs() {
        return [
          {
            job: WorkFlowType.brightness,
            config: WorkFlowConfig(WorkFlowType.brightness),
            label: this.$t('workspace.workflow_perfect_2'),
            icon: 'iconfont-single icon-s-palette',
          },
          {
            job: WorkFlowType.perfect,
            config: WorkFlowConfig(WorkFlowType.perfect),
            label: this.$t('workspace.workflow_perfect_4'),
            icon: 'iconfont-single icon-s-brightness',
          },
        ]
      },
    },
    watch: {
      activeJobConfig: {
        handler() {
          this.changeConfigForParent([
            {
              name: this.activeJob,
              elkJob: this.activeJob,
              config: this.activeJobConfig,
            },
          ])
        },
        deep: true,
      },
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
