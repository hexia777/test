<template>
  <div>
    <p class="tip">{{ $t('workspace.recommend_model_tip') }}</p>
    <div class="job_configs">
      <div
        class="job_configs_item pointer icons view-tag"
        v-for="(item, i) in jobs"
        :class="[
          { 'is-active': activeSharpenModel === item.job },
          { 'item-disable': processLoading },
          { flex2: item.flex2 },
          item.iconfont_icon ? 'icon-tag' : '',
        ]"
        :key="i"
        @click="handleModelSwitch(item)"
        v-track-label="$commonTrackLabel('switch_model_' + item.job)"
      >
        <span class="job_config_item_label view-tag">{{ item.label }}</span>
        <el-tooltip
          v-if="!!item.desc"
          class="job_config_item_desc"
          effect="dark"
          :content="item.desc"
          placement="top-start"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  export default {
    name: 'SharpenModels',
    props: {
      activeSharpenModel: {
        type: String,
        required: false,
        default: '',
      },
      processLoading: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        jobs: [
          {
            job: WorkFlowType.sharpen3,
            // config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_general)),
            label: this.$t('workspace.general'),
            icon: 'icon_sharpen_job_general',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen3,
          },
          {
            job: WorkFlowType.sharpen2_motion_blur,
            // config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_motion_blur)),
            label: this.$t('workspace.motion_blur'),
            icon: 'icon_sharpen_job_motion',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen2_motion_blur,
          },
          {
            job: WorkFlowType.sharpen2_lens_blur,
            // config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_lens_blur)),
            label: this.$t('workspace.lens_blur'),
            icon: 'icon_sharpen_job_focus',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen2_lens_blur,
          },
          {
            job: WorkFlowType.sharpen2_sort_normal,
            // config: deepClone(WorkFlowConfig(WorkFlowType.sharpen2_sort_normal)),
            label: this.$t('workspace.sort_blur'),
            icon: 'icon_sharpen_job_feather',
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen2_sort_normal,
          },
          {
            job: WorkFlowType.img2sr,
            // config: deepClone(WorkFlowConfig(WorkFlowType.img2sr)),
            label: this.$t('workspace.very_blur'),
            flex2: true,
            elkJob: WorkFlowType.sharpen,
            elkName: WorkFlowType.sharpen_sr,
            iconfont_icon: 'icon-s-new',
          },
        ],
      }
    },

    methods: {
      handleModelSwitch(item) {
        if (this.processLoading) {
          return
        }
        // 建议后期 config的组装放到上层，所有配置信息的组装在一层一个地方完成
        let config = []
        let name = item.job
        let job = item.elkJob
        if (item.job === WorkFlowType.sharpen3) {
          config = [
            {
              name: 'va_sharpen_standard',
              config: {
                module: 'sharpen3',
                module_params: {
                  model_name: 'SharpenGeneralStable',
                  blur_type: 1,
                  remove_blur: 0.5,
                  suppress_noise: 0.5,
                  remove_artifacts: 0.5,
                  autoparams: true,
                  model_switch: 'vance_1',
                },
              },
            },
            {
              name: 'CodeFormer',
              config: {
                module: 'CodeFormer',
                module_params: { model_name: 'CodeFormerStable' },
              },
            },
          ]
          name = 'va_sharpen_standard'
          job = 'sharpen'
        }

        if (item.job === WorkFlowType.sharpen2_motion_blur) {
          config = [
            {
              name: 'sharpen_mb',
              config: {
                module: 'sharpen2',
                module_params: {
                  model_name: 'SharpenMotionBlurStable',
                  remove_blur: 0.18,
                  suppress_noise: 0.08,
                  remove_artifacts: 0.05,
                  autoparams: false,
                  model_switch: 'vance_1',
                },
              },
            },
            {
              name: 'CodeFormer',
              config: {
                module: 'CodeFormer',
                module_params: { model_name: 'CodeFormerStable' },
              },
            },
          ]
          name = 'sharpen_mb'
          job = 'sharpen'
        }

        if (item.job === WorkFlowType.sharpen2_lens_blur) {
          config = [
            {
              name: 'sharpen_lb',
              config: {
                module: 'sharpen2',
                module_params: {
                  model_name: 'SharpenLensBlurStable',
                  remove_blur: 0.18,
                  suppress_noise: 0.08,
                  remove_artifacts: 0.05,
                  autoparams: false,
                  model_switch: 'vance_1',
                },
              },
            },
            {
              name: 'CodeFormer',
              config: {
                module: 'CodeFormer',
                module_params: { model_name: 'CodeFormerStable' },
              },
            },
          ]
          name = 'sharpen_lb'
          job = 'sharpen'
        }

        if (item.job === WorkFlowType.sharpen2_sort_normal) {
          config = [
            {
              name: 'sharpen_sb',
              config: {
                module: 'sharpen2',
                module_params: {
                  model_name: 'SharpenSoftNormalStable',
                  remove_blur: 0.2,
                  suppress_noise: 0.1,
                  remove_artifacts: 0,
                  autoparams: false,
                  model_switch: 'vance_1',
                  width: 142,
                  height: 115,
                },
              },
            },
            {
              name: 'CodeFormer',
              config: {
                module: 'CodeFormer',
                module_params: { model_name: 'CodeFormerStable' },
              },
            },
          ]
          name = 'sharpen_sb'
          job = 'sharpen'
        }

        if (item.job === WorkFlowType.img2sr) {
          config = [
            {
              name: 'img2sr',
              config: {
                module: 'img2sr',
                module_params: {
                  model_name: 'style_sr_512',
                  restore_faces: true,
                  denoising: false,
                  denoising_strength: 0.9,
                },
              },
            },
          ]
          name = 'sharpen_sr'
          job = 'sharpen'
          const sd_script = 'repair_ssr'

          this.$emit('handleModelSwitch', { config, name, job, sd_script }, item)
        }

        this.$emit('handleModelSwitch', { config, name, job }, item)
      },
    },
  }
</script>

<style scoped lang="less">
  .tip {
    padding: 0 10 / @base 10 / @base 10 / @base;
    font-size: 14 / @base;
    color: #4d4d4f;
  }

  .job_configs {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10 / @base;

    .job_configs_item {
      position: relative;
      display: flex;
      align-items: center;
      width: calc(50% - 5px);
      padding: 5 / @base;
      margin-bottom: 10 / @base;
      font-size: 14 / @base;
      background-color: #ededed;
      border-radius: 3px;

      &.flex2 {
        width: 100%;
        margin-right: 0;
      }

      &:hover {
        color: #0374ff;
      }

      .icons {
        margin-right: 10 / @base;
      }

      .job_config_item_label {
        display: -webkit-box;
        width: 100%;
        overflow: hidden;
        text-align: center;
        text-overflow: ellipsis;
        word-break: break-all;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }

    .item-disable {
      cursor: not-allowed;
    }

    .icon-tag {
      position: relative;

      .iconfont-single {
        position: absolute;
        top: -10px;
        right: 0;
        font-size: 16px;
        color: #fd4158;
      }

      .icon-text {
        position: absolute;
        top: -6px;
        right: 7px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
    }

    .job_configs_item.is-active {
      color: #fff;
      background-color: #0374ff;
    }

    > :nth-child(odd) {
      margin-right: 10 / @base;
    }
  }
</style>
