<template>
  <div>
    <div class="workflow" v-for="(item, index) in defaultFlows" :key="index">
      <div class="work-selection">
        <el-select
          class="step-select"
          v-model="item.name"
          @change="checkFlow(item.name, index)"
          popper-class="work-selection-down"
        >
          <el-option v-for="(option, i) in workOptions" :key="i" :label="workSpace[option]" :value="option" />
        </el-select>
      </div>
      <template v-if="item.name === jobs.sharpen">
        <sharpen-job :job="jobs.sharpen" :index="index" :config="item.config" @changeConfig="changeConfig" />
      </template>
      <template v-else-if="item.name === jobs.cartoonize">
        <cartoon-job
          :index="index"
          :job="jobs.cartoonize"
          :config="item.config"
          @changeConfig="changeConfig"
          @changeActiveJob="changeActiveJob"
          @selModelFun="selModelFun"
          @selEnlagerTypeFun="selEnlagerTypeFun"
        />
      </template>
      <template v-else-if="item.name === jobs.enlarge">
        <enlarge-job
          :index="index"
          :job="jobs.enlarge"
          :config="item.config"
          :is-batch="true"
          @changeConfig="changeConfig"
          @changeActiveJob="changeActiveJob"
          @selModelFun="selModelFun"
          @selEnlagerTypeFun="selEnlagerTypeFun"
        />
      </template>
      <template v-else-if="item.name === jobs.perfect">
        <perfect-job
          :index="index"
          :job="jobs.perfect"
          :config="item.config"
          @changeConfig="changeConfig"
          @changeActiveJob="changeActiveJob"
        />
      </template>
      <template v-else-if="item.name === jobs.sketch">
        <!-- <sketch-job
          :index="index"
          :job="jobs.sketch"
          :config="item.config"
          @changeConfig="changeConfig"
          @changeActiveJob="changeActiveJob"
        /> -->
        <sketch-job :index="index" @changeConfig="changeConfig" />
      </template>
      <template v-else-if="item.name === jobs.waifu">
        <waifu-job
          :index="index"
          :job="jobs.real_esrgan"
          :config="item.config"
          @changeConfig="changeConfig"
          @changeActiveJob="changeActiveJob"
        />
      </template>
      <template v-else-if="item.name === jobs.repair">
        <repair-job :index="index" :config="item.config" @changeRepairConfig="changeRepairConfig" />
      </template>
      <template v-else-if="item.name === jobs.colorize">
        <colorize-job :index="index" @changeConfig="changeConfig" />
      </template>
      <template v-else>
        <workflow-operations
          ref="workflowOperations"
          v-show="!item.hide"
          :work="item.name"
          :config="item.config"
          :work-index="index"
          :config-all-length="defaultFlows.length"
          v-on="$listeners"
        />
      </template>
    </div>
    <!-- <div class="workflow-operation scroll-bar" v-if="logged"> -->
    <!-- <button class="workflow-add-btn" v-show="showAddStep" @click="addStepHandle">
        <i class="iconfont-single icon-s-cross"></i>
        {{ $t('workspace.add_step') }}
      </button> -->
    <!-- <p v-show="disableAddWorkflowBtn" class="disable-tip">
        {{ $t('workspace.disable_workflow') }}
      </p> -->
    <!-- <p class="workflow-save" v-show="defaultFlows.length > 1" @click="showSaveWorkflowDialow">
        {{ $t('workspace.workflow_save_workflow') }}
      </p> -->
    <!-- </div> -->
  </div>
</template>

<script>
  import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import SharpenJob from '@/components/job/SharpenJob'
  import EnlargeJob from '@/components/job/EnlargeJob'
  import userLevel from '@/static/json/user_level'
  import CartoonJob from '@/components/job/CartoonJob.vue'
  import PerfectJob from '@/components/job/PerfectJob.vue'
  import WaifuJob from '@/components/job/WaifuJob.vue'
  import SketchJob from '@/components/job/SketchJob.vue'
  import RepairJob from '@/components/job/RepairJob.vue'
  import ColorizeJob from '@/components/job/ColorizeJob.vue'

  export default {
    name: 'BatchWsSelect',
    components: {
      SketchJob,
      WaifuJob,
      PerfectJob,
      CartoonJob,
      EnlargeJob,
      SharpenJob,
      WorkflowOperations,
      RepairJob,
      ColorizeJob,
    },
    props: {
      defaultFlows: Array,
      workOptions: Array,
      disableAddWorkflowBtn: Boolean,
    },
    data() {
      return {}
    },
    computed: {
      // showAddStep() {
      //   return this.$getCookie('userType') === 'paying' && !this.disableSave && !this.disableAddWorkflowBtn
      // },
      disableSave() {
        if (this.defaultFlows && this.defaultFlows.length) {
          if (this.isSubscribe) {
            return this.defaultFlows.length === 5
          } else {
            return this.defaultFlows.length === 3
          }
        } else {
          return false
        }
      },
      logged() {
        return this.$store.state.logged
      },
      isSubscribe() {
        return this.$store.state.userlevel === userLevel.paying
      },
      jobs() {
        return WorkFlowType
      },
      workSpace() {
        return {
          enlarge: this.$t('common.common_solution_1'),
          denoise: this.$t('common.common_solution_2'),
          sharpen: this.$t('common.common_solution_3'),
          matting: this.$t('common.common_solution_4'),
          colorize: this.$t('common.common_solution_5'),
          cartoonize: this.$t('common.common_solution_6'),
          portrait: this.$t('common.common_solution_7'),
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

        }
      },
    },
    methods: {
      selEnlagerTypeFun(req) {
        this.$emit('selEnlagerTypeFun', req)
      },
      selModelFun(req) {
        this.$emit('selModelFun', req)
      },
      // 直接通过对象 引用改变defaultFlows
      changeRepairConfig(config, index) {
        if (index !== undefined) {
          this.defaultFlows[index].elkName = 'old_photo_restorer2'
          this.defaultFlows[index].elkJob = 'old_photo_restorer2'
          this.defaultFlows[index].config.repairOptions = config
          this.defaultFlows[index].config.module = ''
          this.defaultFlows[index].config.module_params = {}
          this.defaultFlows[index].ext_params = {}
        }
      },

      changeConfig(config, index) {
        if (index !== undefined) {
          this.defaultFlows[index].elkName = config[0].elkName
          this.defaultFlows[index].elkJob = config[0].elkJob
          this.defaultFlows[index].config.module = config[0].config.module
          this.defaultFlows[index].config.module_params = config[0].config.module_params
          if (config[0].config.cn_configs) {
            this.defaultFlows[index].config.cn_configs = config[0].config.cn_configs
          } else {
            delete this.defaultFlows[index].config.cn_configs
          }
          if (config[0].cn_configs) {
            this.defaultFlows[index].cn_configs = config[0].cn_configs
          } else {
            delete this.defaultFlows[index].cn_configs
          }
          if (config[0].sd_script) {
            this.defaultFlows[index].sd_script = config[0].sd_script
          } else {
            delete this.defaultFlows[index].sd_script
          }

          //模型扩展
          if (config[0].ext_params) {
            this.defaultFlows[index].ext_params = config[0].ext_params
          } else {
            delete this.defaultFlows[index].ext_params
          }
          if (config[0].modelExtendFlag) {
            this.defaultFlows[index].modelExtendFlag = config[0].modelExtendFlag
            this.defaultFlows[index].modelExtend = config[0].modelExtend
            this.defaultFlows[index].index = config[0].index
            this.defaultFlows[index].newSketchName = config[0].newSketchName
          } else {
            delete this.defaultFlows[index].modelExtendFlag
            delete this.defaultFlows[index].modelExtend
            delete this.defaultFlows[index].index
            delete this.defaultFlows[index].newSketchName
          }
        }
      },
      changeActiveJob(val, index) {
        if (index !== undefined) {
          this.defaultFlows[index].elkJob = val
        }
      },
      checkFlow(val, i) {
        this.$emit('checkFlow', val, i)
      },
      // settingHandle(index) {
      //   const hide = this.defaultFlows[index].hide
      //   this.defaultFlows.forEach((item) => {
      //     this.$set(item, 'hide', true)
      //   })
      //   this.defaultFlows[index].hide = !hide
      // },
      // delHandle(index) {
      //   this.defaultFlows.splice(index, 1)
      // },
      // addStepHandle() {
      //   let flag = false
      //   if (this.defaultFlows && this.defaultFlows.length) {
      //     this.defaultFlows.forEach((item) => {
      //       if (flag) {
      //         item.flag = true
      //       } else {
      //         if (item.name === WorkFlowType.enlarge) {
      //           this.$set(item, 'disable', true)
      //           flag = true
      //           this.$emit(
      //             'showConfirmHandle',
      //             this.$t('workspace.workflow_enlarge_tooltip'),
      //             this.$t('workspace.workflow_first_use_confirm')
      //           )
      //         } else if (item.name === WorkFlowType.waifu) {
      //           this.$set(item, 'disable', true)
      //           flag = true
      //           this.$emit(
      //             'showConfirmHandle',
      //             this.$t('workspace.workflow_waifu_tooltip'),
      //             this.$t('workspace.workflow_first_use_confirm')
      //           )
      //         } else if (item.name === WorkFlowType.matting) {
      //           this.$set(item, 'disable', true)
      //           flag = true
      //           this.$emit(
      //             'showConfirmHandle',
      //             this.$t('workspace.workflow_rmbg_tooltip'),
      //             this.$t('workspace.workflow_first_use_confirm')
      //           )
      //         } else if (item.name === WorkFlowType.sharpen && item.config.module === WorkFlowType.waifu) {
      //           this.$set(item, 'disable', true)
      //           flag = true
      //           this.$emit(
      //             'showConfirmHandle',
      //             this.$t('workspace.tip_txt'),
      //             this.$t('workspace.workflow_first_use_confirm')
      //           )
      //         } else {
      //           this.$set(item, 'disable', false)
      //         }
      //       }
      //     })
      //   }
      //   if (!flag) {
      //     this.defaultFlows.forEach((item) => {
      //       item.hide = true
      //     })
      //     //新增步骤
      //     this.defaultFlows.push({
      //       name: WorkFlowType.denoise,
      //       config: WorkFlowConfig(WorkFlowType.denoise),
      //       hide: false,
      //     })
      //     this.checkFlow()
      //   }
      // },
      // showSaveWorkflowDialow() {
      //   this.$emit('showSaveWorkflowDialow')
      // },
    },
  }
</script>

<style scoped lang="less">
  .work-selection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 19px;

    /deep/ .work-selection-down {
      max-height: 15rem;
      overflow: auto;

      .el-select-dropdown__item.selected {
        color: #fff;
        background: #409eff;
      }
    }

    .work-operator {
      display: flex;
      align-items: center;

      .work-operator-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 5px;
        margin-left: 10px;
        text-align: center;
        cursor: pointer;
        background: #f2f2f2;
        border-radius: 3px;
      }

      .work-operator-icon.active {
        background: #e5f1ff;
      }
    }
  }

  .icon_my_loading {
    animation: around 1s ease infinite;
  }

  .icon-rotate {
    animation: around 1s ease infinite;
  }

  @keyframes around {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .workflow-operation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-bottom: 10 / @base;

    .disable-tip {
      font-size: 12px;
      color: #9a9999;
    }

    .workflow-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 268 / @base;
      height: 34 / @base;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 3px;

      i {
        margin-right: 1rem;
      }

      &:hover {
        color: #0374ff;
        border: 1px solid #0374ff;

        .icon-s-cross {
          color: #0374ff;
        }
      }
    }

    .workflow-save {
      width: 100%;
      padding: 10px 0;
      font-size: 12px;
      color: #0374ff;
      text-align: center;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
        text-decoration-color: #0374ff;
      }
    }
  }

  .workflow-operator {
    padding: 10px 20px;
  }
</style>
