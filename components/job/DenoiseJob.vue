<template>
  <div class="denoise-job">
    <div class="denoise-job_configs" v-if="jobs.length > 1">
      <div
        class="denoise-job_configs_item pointer icons"
        v-for="(item, i) in jobs"
        :class="[{ 'is-active': activeJob === item.job }]"
        :key="i"
        @click="handleJobSwitch(item)"
        v-track-label="$commonTrackLabel('switch_job_' + item.job)"
      >
        <div class="icons">
          <i :class="['icon', item.icon]"></i>
          <i :class="['icon_hover', `${item.icon}_hover`]"></i>
          <i :class="['icon_active', `${item.icon}_active`]"></i>
        </div>
        {{ item.label }}
      </div>
    </div>
    <workflow-operations :work="activeJob" :config="activeJobConfig" />
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  export default {
    name: 'DenoiseJob',
    components: { WorkflowOperations },
    props: {
      index: Number,
      config: Object,
    },
    data() {
      return {
        activeJob: '',
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
            job: WorkFlowType.denoise,
            config: WorkFlowConfig(WorkFlowType.denoise),
            icon: 'icon_denise',
          },
        ]
      },
    },
    watch: {
      activeJobConfig: {
        handler(val) {
          this.changeConfigForParent([{ name: this.activeJob, config: val }])
        },
        deep: true,
      },
    },

    mounted() {
      this.activeJob = this.jobs[0].job
    },
    methods: {
      changeConfigForParent(config) {
        this.$emit('changeConfig', config)
      },
      handleJobSwitch(item) {
        this.activeJob = item.job
      },
    },
  }
</script>

<style lang="less" scoped>
  .denoise-job {
    padding: 10 / @base 0;

    .denoise-job_title {
      padding: 0 10 / @base;
      margin: 10 / @base 0 10 / @base;
      font-size: 14 / @base;
    }

    .denoise-job_mini-title {
      font-size: 12 / @base;
    }

    .denoise-job_configs {
      display: flex;
      flex-wrap: wrap;

      .denoise-job_configs_item {
        display: flex;
        align-items: center;
        width: calc(50% - 5px);
        padding: 5 / @base;
        margin-bottom: 10 / @base;
        background-color: #ededed;
        border-radius: 3px;

        &:hover {
          color: #0374ff;
        }

        .icons {
          margin-right: 10 / @base;
        }
      }

      .denoise-job_configs_item.is-active {
        color: #fff;
        background-color: #0374ff;
      }

      > :nth-child(odd) {
        margin-right: 10 / @base;
      }
    }

    .denoise-job_switch {
      display: flex;
      justify-content: space-between;
    }
  }
</style>
