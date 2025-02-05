<template>
  <div>
    <div v-if="title" class="title">
      <div>{{ title }}</div>
    </div>
    <div class="image-size">
      <el-radio-group :value="scale" class="radio-group" size="mini" @input="scaleClick">
        <el-radio-button
          v-for="size in sizes"
          :key="size.value"
          :label="size.value"
          class="radio-item"
          v-track-label="$commonTrackLabel(modelName + '_' + 'enlarge_' + size.value)"
        >
          <!-- <span></span> -->
          {{ size.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="canCustomize" class="custom-size">
      <div
        @click="customSize"
        class="custom-size-btn"
        :class="{ 'is-active': isCustomize }"
        v-track-label="$commonTrackLabel(modelName + 'enlarge_customize')"
      >
        <span class="workflow-radio-label">{{ $t('workspace.edit_crop_5') }}</span>
      </div>
      <div class="mag-l-10 input-size" v-if="isCustomize">
        <el-input
          @input="(value) => changeInputNumber('width', value)"
          class="input-number mag-ve-10"
          :controls="false"
          size="small"
          :min="0"
          :max="imgSize ? imgSize.w * 8 : null"
          :step="1"
          ref="width"
          :value="customImageWidth"
          :placeholder="$t('workspace.width')"
        />
        <span class="input-size-x">x</span>
        <el-input
          @input="(value) => changeInputNumber('height', value)"
          class="input-number"
          :controls="false"
          size="small"
          :min="0"
          :max="imgSize ? imgSize.h * 8 : null"
          :step="1"
          ref="height"
          :value="customImageHeight"
          :placeholder="$t('workspace.height')"
        />
        <span class="input-size-px">px</span>

        <i class="iconfont-single icon-s-info" @click="$emit('showTip')"></i>
      </div>
    </div>
    <div v-if="hasNoEnlarge">
      <el-checkbox :value="isNoEnlarge" @change="changeEnlarge" />
      <span class="no-enlarge">{{ $t('workspace.workflow_waifu_12') }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'NewImageSizeSet',
    props: {
      sizes: {
        type: Array,
        default: () => [],
      },
      defaultSize: {
        type: Number,
        default: 2,
      },
      canCustomize: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '',
      },
      hasNoEnlarge: {
        type: Boolean,
        default: false,
      },
      modelName: {
        type: String,
        default: '',
      },
      image: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        isCustomize: false,
        isNoEnlarge: false,
        scale: this.defaultSize,
        customImageWidth: 0,
        customImageHeight: 0,
      }
    },
    computed: {
      imgSize() {
        return this.image ? this.image : null
      },
    },
    watch: {
      scale(val) {
        this.$emit('changeSize', val)
      },
      image: {
        handler(val) {
          this.customImageWidth = val.w || 0
          this.customImageHeight = val.h || 0
        },
        deep: true,
      },
    },

    mounted() {
      this.customImageWidth = (this.image && this.image.w) || 0
      this.customImageHeight = (this.image && this.image.h) || 0
      this.changeConfigForParent({
        customize: false,
        scale: 2,
      })
    },
    methods: {
      scaleClick(value) {
        this.isCustomize = false
        this.isNoEnlarge = false
        this.scale = value
        this.changeConfigForParent({
          customize: false,
          scale: value,
        })
      },
      customSize() {
        this.isCustomize = true
        this.isNoEnlarge = false
        this.scale = 0
        this.changeConfigForParent({
          customize: true,
          scale: 4,
          customImageWidth: Number(this.customImageWidth),
          customImageHeight: Number(this.customImageHeight),
        })
      },
      changeEnlarge(value) {
        this.isNoEnlarge = value
        if (value) {
          this.isCustomize = false
          this.scale = 1
        } else {
          this.isCustomize = false
          this.scale = 2
        }
        this.changeConfigForParent({
          customize: false,
          scale: this.scale,
        })
      },

      changeInputNumber(key, val) {
        if (!/^[0-9]*$/.test(val)) {
          return
        }
        if (this.imgSize) {
          const imageSize = this.imgSize
          const r = imageSize.w / imageSize.h

          if (key === 'width') {
            if (val > imageSize.w * 8) {
              this.customImageWidth = Math.round(imageSize.w * 8)
              this.customImageHeight = Math.round(imageSize.h * 8)
            } else {
              this.customImageWidth = val
              this.customImageHeight = Math.round(this.customImageWidth / r)
            }
          } else {
            if (val > imageSize.h * 8) {
              this.customImageWidth = Math.round(imageSize.w * 8)
              this.customImageHeight = Math.round(imageSize.h * 8)
            } else {
              this.customImageHeight = val
              this.customImageWidth = Math.round(r * this.customImageHeight)
            }
          }
          // const scale = this.handleScaleNumber(this.customImageWidth, imageSize.w)
          this.changeConfigForParent({
            customize: true,
            scale: 4,
            customImageWidth: Number(this.customImageWidth),
            customImageHeight: Number(this.customImageHeight),
          })
        }
      },
      changeConfigForParent(params) {
        // // 后期可以根据不同的job来设置不同的config
        // let workType = this.activeJob
        // if (workType === WorkFlowType.chainner) {
        //   workType = WorkFlowType.real_esrgan
        // }
        // const baseConfig = WorkFlowConfig(workType)

        // if (params.isCustomize) {
        //   baseConfig.module_params.customize = true
        //   baseConfig.module_params.width = params.width
        //   baseConfig.module_params.height = params.height
        //   baseConfig.module_params.scale = params.scale
        // } else {
        //   baseConfig.module_params.customize = false
        //   baseConfig.module_params.scale = params.scale
        //   baseConfig.module_params.width = 0
        //   baseConfig.module_params.height = 0
        // }

        this.$emit('setImageSize', params)
      },
    },
  }
</script>

<style scoped lang="less">
  .title {
    margin: 8 / @base 0;
    color: #232323;
    font-size: 16 / @base;
    font-weight: bold;
  }

  .radio-group {
    display: flex;

    .radio-item {
      // width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0;
      margin-right: 1rem;
      text-align: center;

      &:last-child {
        margin-bottom: 0;
      }

      /deep/ .el-radio-button__inner {
        min-width: 50px;
        font-size: 14px;
        border: 1px solid #cecece;
        border-radius: 3px;

        &:hover {
          border-color: #0374ff;
        }
      }

      span {
        display: block;
        // padding: 10px 0;
      }

      &.is-active {
        color: #fff;

        /deep/ .el-radio-button__inner {
          background-color: #0374ff;
          border: transparent;
        }
      }
    }
  }

  .custom-size {
    display: flex;
  }

  .custom-size-btn {
    display: inline-block;
    min-width: 50px;
    height: 28px;
    padding: 0 8px;
    margin: 10px 0;
    // margin-right: 1rem;
    font-size: 14px;
    line-height: 28px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #cecece;
    border-radius: 3px;

    &:hover {
      color: #0374ff;
      border-color: #0374ff;
    }

    &.is-active {
      color: #fff;
      background-color: #0374ff;
      border-color: #0374ff;
    }
  }

  .icon-s-info {
    margin-top: 2px;
    margin-left: 5px;
    font-size: 14px;
    color: #232323;
    cursor: pointer;
  }

  .input-size {
    display: flex;
    align-items: center;
  }

  .input-size-x {
    margin: 0 4px;
  }

  .input-size-px {
    margin-left: 6px;
  }

  /deep/ .el-input__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60 / @base;
    text-align: center;
  }

  /deep/ .el-input .el-input__inner {
    height: 28px;
    padding: 0 5px !important;
    line-height: 28px;
  }

  .no-enlarge {
    padding-left: 6px;
    font-size: 14px;
  }
</style>
