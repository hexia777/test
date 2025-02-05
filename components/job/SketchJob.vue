<template>
  <div class="sketch-job">
    <div class="c333 quicksand-bold title">{{ $t('workspace.sketch') }}</div>
    <div class="flex mag-t-10">
      <div
        @click="switchSketchType(true)"
        class="flex1 sel-box"
        :class="{ sel: activeJobConfig.module_params.single_face }"
        v-track-label="$commonTrackLabel('select_sketch_type_single_face')"
      >
        <img :src="$imgPath('/photo_to_sketch/sketch-portrait.jpg')" />
        <p class="f-14">{{ $t('workspace.portrait') }}</p>
      </div>
      <div
        @click="switchSketchType(false)"
        class="flex1 sel-box"
        :class="{ sel: !activeJobConfig.module_params.single_face }"
        v-track-label="$commonTrackLabel('select_sketch_type_full_frame')"
      >
        <img :src="$imgPath('/photo_to_sketch/sketch-full.jpg')" />
        <p class="f-14">{{ $t('workspace.full_frame') }}</p>
      </div>
      <div class="flex1"></div>
    </div>
    <div class="description-ctr">
      <i class="iconfont-single icon-s-info"></i>{{ $t('workspace.sketch_description_tip') }}
    </div>
  </div>
</template>

<script>
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import { deepClone } from '@/static/script/utils'

  export default {
    name: 'SketchJob',
    props: {
      index: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        activeJob: WorkFlowType.sketch,
        activeJobConfig: deepClone(WorkFlowConfig(WorkFlowType.artLine)),
        extendConfig: {
          modelExtendFlag: true,
          index: 2,
          modelExtend: [
            {
              name: 'portrait_enhancer',
              config: {
                module: 'portrait_enhancer',
                module_params: {
                  model_name: 'PortraitEnhancer_v1.4',
                },
              },
            },
            {
              name: 'matting',
              config: {
                module: 'matting',
                module_params: {
                  model_name: 'MattingStable',
                  rescale: 532,
                  web_auto_mode: false,
                },
              },
            },
          ],
        },
      }
    },
    watch: {
      activeJobConfig: {
        handler(val) {
          console.log('sketch config:', val)
          this.changeConfigForParent([
            {
              name: this.activeJob,
              elkName: WorkFlowType.artLine,
              elkJob: this.activeJob,
              config: this.activeJobConfig,
              ...this.extendConfig,
            },
          ])
        },
        deep: true,
      },
    },
    mounted() {
      console.log('11111: ', 11111)
      this.changeConfigForParent([
        {
          name: this.activeJob,
          elkName: WorkFlowType.artLine,
          elkJob: this.activeJob,
          config: this.activeJobConfig,
          ...this.extendConfig,
        },
      ])
    },
    methods: {
      changeConfigForParent(config) {
        this.$emit('changeConfig', config, this.index)
      },
      switchSketchType(single_face) {
        this.$set(this.activeJobConfig.module_params, 'single_face', single_face)
      },
    },
  }
</script>

<style lang="less" scoped>
  .description-ctr {
    display: flex;
    background: #f2f2f2;
    border-radius: 3px;
    border: 1px solid #dcdcdc;
    padding: 10 / @base;
    margin-top: 12 / @base;
    font-size: 14 / @base;
    color: #8f8f8f;
    line-height: 22 / @base;
    .icon-s-info {
      display: block;
      margin-right: 10px;
      font-size: 18px;
      color: #0374ff;
    }
  }
  .sketch-job {
    padding: 20px;
    .title {
      font-size: 16px;
    }
    .sel-box {
      display: flex;
      flex-direction: column;
      padding: 5px;
      font-size: 14px;
      color: #333;
      text-align: center;
      cursor: pointer;
      background: #f2f2f2;
      .sel-tab-txt {
        padding: 7px 0;
      }
    }
    .sel {
      color: #fff;
      background: #0374ff !important;
      p {
        color: #fff;
      }
    }
  }
</style>
