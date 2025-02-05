<template>
  <div class="job_configs">
    <p class="tip">{{ $t('workspace.recommend_model_tip') }}</p>
    <div class="job_configs_wrap">
      <div
        class="pointer job_item"
        :style="{ backgroundImage: `url(${encodeURI(item.img)})` }"
        v-for="(item, i) in jobs"
        :class="[
          { 'is-active': activeEnlargeModel === item.job },
          { flex2: item.flex2 },
          { 'item-disable': processLoading },
          item.iconfont_icon ? 'icon-tag' : '',
        ]"
        :key="i"
        @click="handleModelSwitch(item)"
        v-track-label="$commonTrackLabel('switch_model_' + item.job)"
      >
        <span class="labe">{{ item.label }}</span>
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
    name: 'EnlargeModels',
    props: {
      activeEnlargeModel: {
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
            job: WorkFlowType.enlarge3,
            config: WorkFlowConfig(WorkFlowType.enlarge3),
            label: this.$t('workspace.standard'),
            type: 'STANDARD',
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.enlarge3,
            img: this.$imgPath('/enhance/model_enlarge_photo.png'),
          },
          {
            job: WorkFlowType.chainner,
            elkJob: WorkFlowType.waifu,
            config: WorkFlowConfig(WorkFlowType.real_esrgan),
            label: this.$t('workspace.anime_model'),
            img: this.$imgPath('/enhance/model_enlarge_amime.png'),
          },
          {
            job: WorkFlowType.art_enlarge,
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.enlarge,
            config: WorkFlowConfig(WorkFlowType.art_enlarge),
            label: this.$t('workspace.art_cg'),
            img: this.$imgPath('/enhance/model_enlarge_artcg.png'),
          },
          {
            job: WorkFlowType.chainner_txt,
            config: WorkFlowConfig(WorkFlowType.chainner_txt),
            label: this.$t('workspace.text'),
            elkJob: WorkFlowType.chainner_txt,
            elkName: WorkFlowType.chainner_txt,
            img: this.$imgPath('/enhance/model_enlarge_text.png'),
          },
          {
            job: WorkFlowType.enlarge2,
            config: WorkFlowConfig(WorkFlowType.enlarge3),
            label: this.$t('workspace.lowx_resolution'),
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.enlarge_sr,
            module: WorkFlowType.enlarge3,
            iconfont_icon: 'icon-s-new',
            img: this.$imgPath('/enhance/model_enlarge_compressed.png'),
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
        let config = {}
        let name = item.job
        let job = item.elkJob
        if (item.job === WorkFlowType.enlarge3) {
          config = [
            {
              name: 'enlarge_2x',
              config: {
                module: 'enlarge3',
                module_params: {
                  model_name: 'EnlargeStandard_2x_Stable',
                  suppress_noise: 50,
                  remove_blur: 25,
                  scale: 2,
                  customize: false,
                  width: 0,
                  height: 0,
                },
              },
            },
          ]
          name = 'enlarge_2x'
          job = 'enlarge'
        }

        if (item.job === WorkFlowType.chainner) {
          config = [
            {
              name: 'chainner',
              config: {
                module: 'chainner',
                module_params: {
                  model_name: 'Anime_4x_AnimeSharp',
                  scale: 4,
                  customize: false,
                  width: 0,
                  height: 0,
                },
              },
            },
          ]
          name = 'chainner'
          job = 'chainner'
        }

        if (item.job === WorkFlowType.art_enlarge) {
          config = [
            {
              name: 'enlarge',
              config: {
                module: 'chainner',
                module_params: {
                  model_name: 'Universal_UltraSharp_4x',
                  scale: 2,
                  customize: false,
                  width: 60,
                  height: 70,
                },
              },
            },
          ]
          name = 'enlarge'
          job = 'enlarge'
        }

        if (item.job === WorkFlowType.chainner_txt) {
          config = [
            {
              name: 'chainner_txt',
              config: {
                module: 'chainner',
                module_params: {
                  model_name: 'Text_4x_TextSharpV1',
                  scale: 4,
                  customize: false,
                  width: 0,
                  height: 0,
                },
              },
            },
          ]
          name = 'chainner_txt'
          job = 'chainner_txt'
        }

        if (item.job === WorkFlowType.enlarge2) {
          config = [
            {
              name: 'img2sr',
              config: {
                module: 'img2sr',
                module_params: {
                  model_name: 'style_sr_512',
                  restore_faces: false,
                  denoising: false,
                  denoising_strength: 0.9,
                },
              },
            },
            {
              name: 'enlarge_2x',
              config: {
                module: 'enlarge3',
                module_params: {
                  model_name: 'EnlargeStandard_2x_Stable',
                  suppress_noise: 50,
                  remove_blur: 25,
                  scale: 2,
                  customize: false,
                  width: 0,
                  height: 0,
                },
              },
            },
          ]
          name = 'enlarge_sr'
          job = 'enlarge'
        }

        this.$emit('handleModelSwitch', { config, name, job }, item)
      },
    },
  }
</script>

<style scoped lang="less">
  .job_configs_wrap {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    margin: 0 0 -10px 0 !important;

    .job_item {
      position: relative;
      width: calc(50% - 4px);
      height: 64px;
      margin-bottom: 10 / @base;
      background-size: cover;
      border-radius: 4px;

      .labe {
        position: absolute;
        bottom: 6px;
        left: 50%;
        z-index: 999;
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        color: #fff;
        text-align: center;
        transform: translateX(-50%);
      }
    }

    .item-disable {
      cursor: not-allowed;
    }

    .job_item::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      background-image: linear-gradient(to top, rgba(77, 77, 77, 1) 0%, rgba(255, 255, 255, 0) 80%);
      border-radius: 4px;
    }

    .job_item:hover::before {
      border: 2px solid #1074ff;
    }

    .job_item.is-active::before {
      background-image: linear-gradient(to top, rgba(16, 116, 255, 1) 0%, rgba(77, 77, 77, 0) 80%) !important;
    }
  }

  .job_configs {
    padding: 0 10 / @base;

    .tip {
      padding-bottom: 10 / @base;
      font-size: 14 / @base;
      color: #4d4d4f;
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

    > :nth-child(odd) {
      margin-right: 10 / @base;
    }
  }
</style>
