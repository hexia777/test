<template>
  <div class="colorize-job">
    <div class="c333 quicksand-bold title">{{ $t('workspace.colorization_mode') }}</div>
    <div class="radio-ctr">
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
    <div v-if="isRecolor">
      <p class="mag-t-15 mag-b-20 modal-desc-title">{{ $t('workspace.cartoon_description') }}</p>
      <el-input
        type="textarea"
        rows="5"
        maxlength="140"
        :placeholder="$t('workspace.recolor_des_pld')"
        class="mag-b-15"
        v-model="recolorConfig.module_params.prompt"
        @change="changePrompt"
      />
      <p class="mag-b-20 modal-assist-text">{{ $t('workspace.recolor_sub_desc') }}</p>
    </div>
    <div class="tip-ctr"><i class="iconfont-single icon-s-info"></i>{{ $t('workspace.recolor_tip') }}</div>
  </div>
</template>

<script>
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import { deepClone } from '@/static/script/utils'

  export default {
    name: 'ColorizeJob',
    props: {
      index: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        name: WorkFlowType.recolor,
        activeJob: WorkFlowType.colorize,
        activeJobConfig: deepClone(WorkFlowConfig(WorkFlowType.sd_recolor)),
        isRecolor: true, //是否是精细修复，默认为精细修复
        deoldifyConfig: deepClone(WorkFlowConfig(WorkFlowType.deoldify2)), //黑白照片上色功能的经典修复模型
        recolorConfig: deepClone(WorkFlowConfig(WorkFlowType.sd_recolor)), //黑白照片上色功能的精细修复模型
      }
    },
    watch: {
      isRecolor(val) {
        if (val) {
          this.name = WorkFlowType.recolor
          this.activeJobConfig = deepClone(this.recolorConfig)
        } else {
          this.name = WorkFlowType.colorize
          this.activeJobConfig = deepClone(this.deoldifyConfig)
        }
      },
      activeJobConfig: {
        handler(val) {
          console.log('colorize config:', val)
          this.changeConfigForParent([
            {
              name: this.name,
              elkName: this.name,
              elkJob: this.activeJob,
              config: val,
            },
          ])
        },
        deep: true,
      },
    },
    mounted() {
      this.changeConfigForParent([
        {
          name: this.name,
          elkName: this.name,
          elkJob: this.activeJob,
          config: this.activeJobConfig,
        },
      ])
    },
    methods: {
      changeConfigForParent(config) {
        if (this.name === WorkFlowType.recolor) {
          config[0].cn_configs = [
            {
              image_uid: '',
              controlnet_use_previous_output: false,
              cn_name: 'recolor',
            },
          ]
        }
        this.$emit('changeConfig', config, this.index)
      },
      changePrompt(val) {
        this.$set(this.recolorConfig.module_params, 'prompt', val)
        this.activeJobConfig = deepClone(this.recolorConfig)
      },
    },
  }
</script>

<style lang="less" scoped>
  .colorize-job {
    padding: 0 10px;
    .radio-ctr {
      display: flex;
      flex-direction: column;
    }
  }
</style>
