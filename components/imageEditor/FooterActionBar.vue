<template>
  <div class="tui-foot tc">
    <div @click="openImage" class="open-image-btn">
      <div class="icon-btn horizontal-item">
        <!-- <div class="icons">
          <i class="icon icon_open_image"></i>
          <i class="icon_hover icon_open_image_hover"></i>
        </div> -->
        <i class="iconfont-single icon-s-open-image"></i>
        <span class="icon-text">{{ $t('workspace.edit_popup_4') }}</span>
      </div>
    </div>

    <div class="right-footer">
      <div class="pic_out_setting_cont" v-if="showSetting">
        <out-setting
          @confirm="confirmOutSet(true)"
          @close="confirmOutSet(false)"
          :config="outSettingConfigCopy"
          :remember="false"
        />
      </div>
      <div class="out-set" @click="openSetWin">
        <i class="iconfont-single icon-s-setting"></i>
      </div>
      <el-button v-loading="isDownloading" @click="downLoadImage" class="btn-main save-download-btn">
        {{ $t('workspace.edit_popup_6') }}
      </el-button>
    </div>
  </div>
</template>

<script>
  import outSetting from '@/components/WorkSpace/OutSetting'
  import { deepClone } from '@/static/script/utils'

  export default {
    name: 'FooterActionBar',
    components: { outSetting },
    props: {
      activeUtil: {
        type: String,
        default: '',
      },
      onUndo: {
        type: Function,
        default: () => {},
      },
      onRedo: {
        type: Function,
        default: () => {},
      },
      onRevert: {
        type: Function,
        default: () => {},
      },
      openImage: {
        type: Function,
        default: () => {},
      },
      isDownloading: {
        type: Boolean,
        default: false,
      },
      zoomLevel: {
        type: Number,
        default: null,
      },
      outSettingConfig: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        showSetting: false,
        zoom: 0,
        //输出参数copy
        outSettingConfigCopy: {},
      }
    },
    computed: {},
    mounted() {
      //复制输出参数弹窗
      this.outSettingConfigCopy = deepClone(this.outSettingConfig)
    },
    methods: {
      handleCommand(command) {
        this.$emit('changeRoom', Number(command))
      },
      subtractZoomLevel() {
        let zoomLevel = this.zoomLevel
        if (zoomLevel) {
          if (zoomLevel - 0.2 <= 0.25) {
            zoomLevel = 0.25
          } else {
            zoomLevel = zoomLevel - 0.1
          }
        } else {
          zoomLevel = 0.5
        }

        this.$emit('changeRoom', zoomLevel)
      },
      addZoomLevel() {
        let zoomLevel = this.zoomLevel
        if (zoomLevel) {
          if (zoomLevel + 0.2 >= 3) {
            zoomLevel = 3
          } else {
            zoomLevel = zoomLevel + 0.1
          }
        } else {
          zoomLevel = 0.5
        }
        this.$emit('changeRoom', zoomLevel)
      },

      downLoadImage() {
        this.$emit('downLoadImage')
      },
      confirmOutSet(showSetting) {
        if (showSetting) {
          this.$emit('changeOutSet', deepClone(this.outSettingConfigCopy))
        }
        this.showSetting = false
      },
      openSetWin() {
        this.outSettingConfigCopy = deepClone(this.outSettingConfig)
        this.showSetting = true
      },
    },
  }
</script>

<style lang="less" scoped>
  .tui-foot {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 64 / @base;
    padding: 0 16 / @base;
    background: #fff;
    background: transparent;
    // border-top: 1px solid #ededed;

    .middle {
      display: flex;
      flex: 1;
      height: 100%;
      pointer-events: none;

      .revert {
        margin-right: 16 / @base;
        border-radius: 36 / @base;
      }

      .undo {
        width: 34 / @base;
        border-right: 0;
        border-top-left-radius: 36 / @base;
        border-bottom-left-radius: 36 / @base;
      }

      .redo {
        width: 34 / @base;
        border-top-right-radius: 36 / @base;
        border-bottom-right-radius: 36 / @base;
      }

      .room {
        display: flex;
        align-items: center;
        margin-left: 16 / @base;

        .add {
          width: 34 / @base;
          height: 28 / @base;
          border: 1px solid #b8c7d2;
          border-top-left-radius: 36 / @base;
          border-bottom-left-radius: 36 / @base;
        }

        .subtract {
          width: 34 / @base;
          height: 28 / @base;
          border: 1px solid #b8c7d2;
          border-top-right-radius: 36 / @base;
          border-bottom-right-radius: 36 / @base;
        }

        .el-dropdown-link {
          width: 56 / @base;
          height: 28 / @base;
          border: 1px solid #b8c7d2;
          border-right: 0;
          border-left: 0;
        }
      }
    }
  }

  .open-image-btn {
    display: flex;
    align-items: center;
    height: 40 / @base;
    cursor: pointer;

    .horizontal-item {
      display: flex;
      flex-direction: row !important;
      align-items: center;
      // width: 100%;
      height: 28 / @base;
      padding: 0 20 / @base;
      font-size: 12px;
      font-weight: 400;
      line-height: 20 / @base;
      color: #4d4d4f;
      border-radius: 12 / @base;
    }

    /deep/ .el-upload-dragger {
      width: auto;
      height: auto;
      border: none;
      border-radius: 3px;
    }
  }

  .right-footer {
    // position: sticky;
    // bottom: 0;
    // left: 0;
    position: relative;
    z-index: 21;
    display: flex;
    align-items: center;
    justify-content: center;
    // width: 100%;
    // padding: 20 / @base 30 / @base;
    // background: #fff;
    // border-top: 1px solid #ebeff2;
    .out-set {
      margin-right: 10 / @base;
      cursor: pointer;
    }

    .save-download-btn {
      height: 28 / @base;
      padding: 0 8 / @base;
      font-size: 14 / @base;
      font-weight: 400;
      line-height: 28 / @base;
      border-radius: 12 / @base;
    }
  }

  .pic_out_setting_cont {
    // display: none;
    position: absolute;
    top: -400 / @base;
    z-index: 100;
    min-width: 240 / @base;
    height: 392 / @base;
    padding: 10 / @base;
    text-align: left;
    background: #f5f7fa;
    border: 1px solid #f0f0f0;
    // box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
  }

  .icon-btn {
    // width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28 / @base;
    height: 28 / @base;
    cursor: pointer;
    // padding: 0 10 / @base;
    background: #fff;
    border: 1px solid #b8c7d2;

    &:hover {
      background-color: rgba(0, 0, 0, 0.15);
    }

    svg {
      width: 16 / @base;
      height: 16 / @base;
    }

    span {
      display: flex;
      align-items: center;
      height: 100%;
    }

    .icon-text {
      margin-left: 10 / @base;
      font-size: 12 / @base;
      user-select: none;
    }

    .icon_hover {
      display: none;
    }
  }

  .icons {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    cursor: pointer;

    .icon_hover {
      display: none;
    }

    &:hover {
      .icon {
        display: none;
      }

      .icon_hover {
        display: inline-block;
      }
    }
  }

  .icon-s-open-image {
    font-size: 16px;

    &:hover {
      color: #0374ff;
    }
  }
</style>
