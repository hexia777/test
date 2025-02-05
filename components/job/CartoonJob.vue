<template>
  <div class="cartoon-job">
    <cartoonizer-modal @changeMode="changeMode" />
    <!-- <p class="cartoon-job_title mag-b-10">
      <span>{{ $t('workspace.ai_mode') }}</span>
    </p>
    <el-select v-model="activeJob">
      <el-option v-for="(item, i) in jobs" :key="i" :value="item.job" :label="item.label" />
    </el-select>
    <workflow-operations
      v-if="activeJobConfig"
      :work="job"
      :config="activeJobConfig"
      @changeCustomParams="changeCustomParams"
      @changeModuleFun="changeModuleFun"
    /> -->
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import WorkflowOperationsMixins from '@/mixins/WorkflowOperationsMixins'
  import CartoonizerModal from '@/components/job/components/CartoonizerModal'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  export default {
    name: 'CartoonJob',
    // components: { WorkflowOperations },
    components: { CartoonizerModal },
    mixins: [WorkflowOperationsMixins],
    props: {
      index: Number,
      job: String,
      config: Object,
    },
    data() {
      return {
        activeJob: WorkFlowType.animegan2c,
        isAppendConfig: false,
        WorkFlowType,
        open1: true,
        open2: true,
        jobs: [
          {
            job: WorkFlowType.animegan2c,
            elkJob: WorkFlowType.animegan2c,
            elkName: WorkFlowType.animegan2c,
            config: WorkFlowConfig(WorkFlowType.animegan2c),
            label: this.$t('workspace.cartoon_model'),
          },
          {
            job: WorkFlowType.animegan,
            elkJob: WorkFlowType.animegan_toon,
            config: WorkFlowConfig(WorkFlowType.animegan),
            label: this.$t('workspace.anime_select_option'),
          },
          {
            job: WorkFlowType.cartoonize,
            elkJob: WorkFlowType.cartoonize,
            config: WorkFlowConfig(WorkFlowType.img2anime),
            label: this.$t('workspace.workflow_sketch_option_2'),
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
              elkName: this.currentJob.elkName,
              elkJob: this.currentJob.elkJob,
              config: this.activeJobConfig,
            },
          ])
        },
        deep: true,
        immediate: true,
      },
    },

    methods: {
      selModelFun(req) {
        this.$emit('selModelFun', req)
      },
      openBoxFun(req) {
        this[req] = !this[req]
      },
      changeConfig(config) {
        this.activeJobConfig = config
      },
      changeConfigForParent(config) {
        this.$emit('changeConfig', config, this.index)
      },
      changeMode(config) {
        this.changeConfigForParent([config])
      },
    },
  }
</script>

<style lang="less" scoped>
  .cartoon-job {
    padding: 0 10 / @base;

    .cartoon-job_title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10 / @base;
      margin: 10 / @base 0 0;
      font-size: 16 / @base;

      &.mag-b-10 {
        margin-bottom: 10 / @base;
      }
    }

    .cartoon-job_mini-title {
      font-size: 14 / @base;
    }

    .cartoon-job_configs {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10 / @base;
      margin-bottom: 10 / @base;

      .cartoon-job_config_types {
        display: flex;
        align-items: center;
      }

      .cartoon-job_configs_item {
        padding: 5 / @base;
        font-size: 14 / @base;
        text-align: center;
        background-color: #ededed;
        border-radius: 3px;

        &:hover {
          color: #0374ff;
        }

        .icons {
          margin-right: 10 / @base;
        }
      }

      .cartoon-job_configs_item.is-active {
        color: #fff;
        background-color: #0374ff;
      }

      > :first-child {
        border-radius: 3px 0 0 3px;
      }

      > :last-child {
        border-radius: 0 3px 3px 0;
      }
    }

    .cartoon-job_switch {
      display: flex;
      justify-content: space-between;
    }

    /deep/ .workflow-operator {
      .radio-group > div {
        margin-right: 16 / @base;
      }
    }
  }

  .open-btn {
    cursor: pointer;
    transition: transform 0.3s;

    &.open {
      transform: rotate(180deg);
    }
  }

  .open-box {
    height: 0;
    overflow: hidden;

    &.open {
      height: auto;
    }
  }
</style>
