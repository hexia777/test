<template>
  <div class="mobile-preview-dialog mask" v-show="visible">
    <div class="dialog-container">
      <div class="dialog-header">
        <p class="dialog-title quicksand-bold">{{ $t('workspace.preview') }}</p>
        <div class="dialog-close" @click="close">
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div class="dialog-content">
        <div class="slider-mode" ref="sliderMode">
          <div
            ref="vfx-image-wrap"
            :style="{
              width: box.width + 'px',
              height: box.height + 'px',
            }"
            v-loading="afterLoading || beforeLoading"
            class="vfx-image-wrap"
            @touchmove="mouseMove"
            @touchendend="mouseLeave"
          >
            <div class="before-status">{{ $t('workspace.preview_1') }}</div>
            <div class="after-status">{{ $t('workspace.preview_2') }}</div>
            <div
              :style="{
                width: box.width + 'px',
                height: box.height + 'px',
              }"
              ref="before-image"
              class="before-image"
            >
              <img
                :style="{
                  left: '0',
                  top: '0',
                  height: box.height + 'px',
                  width: box.width + 'px',
                  position: 'absolute',
                }"
                ondragstart="return false;"
                draggable="false"
                @load="imageLoad('before')"
                :src="previewInfo.beforeImg"
                alt
                :width="box.width"
                :height="box.height"
              />
            </div>
            <div
              :style="{
                width: box.width + 'px',
                height: box.height + 'px',
              }"
              class="after-image"
            >
              <img
                :style="{
                  left: '0',
                  top: '0',
                  height: box.height + 'px',
                  width: box.width + 'px',
                  position: 'absolute',
                }"
                ondragstart="return false;"
                draggable="false"
                :src="previewInfo.afterImg"
                alt
                @load="imageLoad('after')"
                :width="box.width"
                :height="box.height"
              />
            </div>
            <div ref="divider-bar" class="divider-bar diff-icon-box compare-follow">
              <i class="iconfont icon-slide hover-show"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <div class="download-image">
          <button class="download-btn quicksand" @click="download">
            <!-- <i class="iconfont-single icon-s-download2"></i> -->
            {{ $t('workspace.upload_13') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      previewInfo: {
        type: Object,
        default: () => {
          return {
            beforeImg: '',
            afterImg: '',
            width: 0,
            height: 0,
            beforeLoading: true,
            afterLoading: true,
            info: {},
            resolutionFlag: true,
            userInfo: {},
          }
        },
      },
      work: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        afterLoading: true,
        beforeLoading: true,
        big: {
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          originWidth: 1,
          originHeight: 1,
        },
        box: {
          width: (360 / 9) * 16,
          height: 360,
        },
        thumb: {
          width: 1,
          height: 1,
        },
        thumbBox: {
          width: 275,
          height: 172,
        },
        mover: {
          top: 0,
          left: 0,
          width: 40,
          height: 26,
          originWidth: 40,
          originHeight: 26,
        },
        showDrag: false,
        showFreeUserTip: true,
        halfPreview: {
          width: 0,
          height: 0,
        },
      }
    },
    mounted() {
      this.update(this.previewInfo)

      window.onresize = () => {
        return (() => {
          this.update(this.previewInfo)
        })()
      }
      const sliderMode = this.$refs.sliderMode
      if (this.previewInfo.width > this.previewInfo.height) {
        if (this.previewInfo.width < sliderMode.offsetWidth) {
          this.box.height = this.big.height
          this.box.width = this.big.width
        } else {
          this.box.width = sliderMode.offsetWidth
          this.box.height = (sliderMode.offsetWidth / this.previewInfo.width) * this.previewInfo.height
        }
      } else {
        if (this.previewInfo.height < sliderMode.offsetHeight) {
          this.box.height = this.big.height
          this.box.width = this.big.width
        } else {
          this.box.height = sliderMode.offsetHeight
          this.box.width = (sliderMode.offsetHeight / this.previewInfo.height) * this.previewInfo.width
        }
      }
      this.$nextTick(() => {
        this.mouseLeave()
      })
    },
    methods: {
      setHalfPreview(halfPreview) {
        this.halfPreview.width = halfPreview.width
        this.halfPreview.height = halfPreview.height
      },
      download() {
        this.$emit('download', this.previewInfo.info)
      },
      close() {
        this.$emit('update:visible', false)
      },
      update(val) {
        if (val.width <= this.box.width && val.height <= this.box.height) {
          this.thumb.width = val.width
          this.thumb.height = val.height
        } else {
          if (val.width / val.height > this.thumbBox.width / this.thumbBox.height) {
            this.thumb.width = this.thumbBox.width
            this.thumb.height = (val.height / val.width) * this.thumb.width
          } else {
            this.thumb.height = this.thumbBox.height
            this.thumb.width = (val.width / val.height) * this.thumb.height
          }
        }
        this.big.width = this.previewInfo.info.w * this.previewInfo.info.config.scale
        this.big.height = this.previewInfo.info.h * this.previewInfo.info.config.scale
        this.big.originWidth = this.previewInfo.info.w * this.previewInfo.info.config.scale
        this.big.originHeight = this.previewInfo.info.h * this.previewInfo.info.config.scale
        if (this.activeMode === '2' || this.activeMode === '3') {
          this.showDrag = true
        }
        this.mover.width = this.thumb.width * (this.box.width / this.big.width)
        this.mover.height = (this.mover.width * 9) / 16
        this.mover.left = (this.thumb.width - this.mover.width) / 2
        this.mover.top = (this.thumb.height - this.mover.height) / 2
        if (this.mover.width > this.thumb.width) {
          this.mover.width = this.thumb.width
          this.mover.left = 0
        }

        const left = -(this.mover.left / this.thumb.width) * this.big.width
        const top = -(this.mover.top / this.thumb.height) * this.big.height
        this.moveBorderHandle(left, top)
      },
      moveBorderHandle(left, top) {
        if (left > 0) {
          this.big.left = 0
        } else if (left < -this.big.width) {
          this.big.left =
            -(this.box.width - this.halfPreview.width) > 0 ? 0 : -(this.box.width - this.halfPreview.width)
        } else if (Math.abs(left - this.halfPreview.width) > this.big.width) {
          this.big.left =
            -(this.big.width - this.halfPreview.width) > 0 ? 0 : -(this.big.width - this.halfPreview.width)
        } else {
          this.big.left = left
        }
        if (top > 0) {
          this.big.top = 0
        } else if (top < -this.big.height) {
          this.big.top = -this.big.height
        } else if (Math.abs(top - this.halfPreview.height) > this.big.height + 200) {
          this.big.top =
            -(this.big.height + 200 - this.halfPreview.height) > 0
              ? 0
              : -(this.big.height + 200 - this.halfPreview.height)
        } else {
          this.big.top = top
        }
      },
      imageLoad(val) {
        if (val === 'after') {
          this.afterLoading = false
        } else {
          this.beforeLoading = false
        }
      },
      mouseMove(event) {
        event = event.touches[0]
        const wrap = this.$refs['vfx-image-wrap']
        const fullWidth = wrap.clientWidth
        let mouseX = event.pageX - wrap.offsetLeft - 36
        if (mouseX < 0) {
          mouseX = 0
        } else if (mouseX > fullWidth) {
          mouseX = fullWidth
        }

        const divider = this.$refs['divider-bar']
        divider.style.left = mouseX + 'px'
        divider.style.transition = 'none'

        const topImage = this.$refs['before-image']
        topImage.style.width = mouseX + 'px'
        topImage.style.transition = 'none'
      },
      mouseLeave() {
        const topImage = this.$refs['before-image']
        topImage.style.width = '50%'
        topImage.style.transition = 'all 0.3s'

        const divider = this.$refs['divider-bar']
        divider.style.left = '50%'
        divider.style.transition = 'all 0.3s'
      },
    },
  }
</script>
<style lang="less" scoped>
  .mobile-preview-dialog.mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1999;
    display: flex;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);

    .dialog-container {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: calc(100% - 80px);
      margin-top: 40px;
      background: #fff;

      .dialog-header {
        position: relative;
        width: 100%;
        text-align: center;

        .dialog-title {
          height: 60px;
          font-size: 24 / @base;
          line-height: 60px;
        }

        .dialog-close {
          position: absolute;
          top: 15px;
          right: 5px;

          .el-icon-close {
            font-size: 200%;
          }
        }
      }

      .dialog-content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: calc(100% - 120px);
        background: rgba(0, 0, 0, 0.6);
        border-bottom: 1px solid #ededed;
      }

      .dialog-footer {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 60px;
        padding: 0 10px;
      }
    }
  }

  .slider-mode {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;

    .image-wrap {
      position: relative;
      display: inline-block;
      width: 100%;
      height: auto;
      margin: 0 auto;
      vertical-align: middle;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .vfx-image-wrap {
      position: relative;
      display: inline-block;
      width: 100%;
      max-width: 100%;
      height: 100%;
      max-height: 100%;
      margin: 0 auto;
      overflow: hidden;
      vertical-align: middle;
      cursor: ew-resize;

      .before-status,
      .after-status {
        position: absolute;
        top: 20px;
        z-index: 2;
        width: 100px;
        padding: 2px;
        color: #fff;
        text-align: center;
        background: #221f1f;
      }

      .before-status {
        left: 0;
        border-radius: 0 20px 20px 0;
      }

      .after-status {
        right: 0;
        border-radius: 20px 0 0 20px;
      }

      .before-image {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 50%;
        height: 100%;
        overflow: hidden;
        transition: all 0.3s ease 0s;

        img {
          height: 100%;
        }
      }

      .before-image,
      .after-image {
        background: url('@{assetsImgPath}/common/visiable_bg.png');
      }

      .after-image {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        height: 100%;

        img {
          height: 100%;
        }
      }

      .divider-bar {
        position: absolute;
        top: 0;
        left: 50%;
        z-index: 2;
        display: block;
        width: 2px;
        height: 100%;
        background: #fff;
        box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.4);
        transition: all 0.3s ease 0s;

        i {
          position: absolute;
          top: 40%;
          left: -15px;
        }
      }

      .diff-icon-box {
        position: relative;

        .item {
          position: absolute;
          top: 20 / @base;
          z-index: 1;
          width: max-content;
          min-height: 27 / @base;
          padding: 0 25px;
          font-size: 14 / @base;
          line-height: 27 / @base;
          color: #fff;
          text-align: center;
          background-color: rgba(5, 12, 22, 0.7);
          border-radius: 2px;

          .item-desc {
            display: block;
            margin-top: -8px;
          }
        }
      }

      .compare-follow {
        .left,
        .right {
          min-width: 120px;

          span {
            text-shadow: none;
          }

          .item-text {
            display: inline-block;
            width: 100%;
            padding-bottom: 3px;
            margin-bottom: 8px;
            font-size: 18px;
          }

          .item-desc {
            font-size: 14px;
            font-weight: 400;
          }
        }

        .left {
          right: 2px;
          padding: 0 10px;
          text-align: right;
          border: 1px solid #ffde00;

          span {
            color: #fff116;
            text-align: right;
          }

          .item-text {
            border-bottom: 1px solid rgba(255, 241, 22, 0.3);
          }
        }

        .right {
          left: 2px;
          padding: 0 10px;
          text-align: left;
          border: 1px solid #1ec0fc;

          span {
            color: #08e5ff;
            text-align: left;
          }

          .item-text {
            border-bottom: 1px solid rgba(8, 229, 255, 0.3);
          }
        }
      }
    }
  }

  .download-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    .download-btn {
      width: 195px;
      height: 40px;
      color: #fff;
      background: #ff9d1d;
      border: none;
      border-radius: 3px;

      &:hover {
        background: #ffb048;
      }
    }
  }

  @media (max-width: 1024px) {
    .slider-mode {
      .image-wrap {
        display: flex;
        align-items: center;
        height: auto;

        img {
          height: auto;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .slider-mode {
      .vfx-image-wrap {
        width: 100%;
        height: 225px;

        .before-image img {
          width: 200%;
          height: 100%;
        }

        .diff-icon-box {
          .item {
            width: 7.875rem;
          }
        }
      }

      .image-wrap {
        height: 394px;
      }
    }
  }

  @media (max-width: 640px) {
    .slider-mode {
      .image-wrap {
        height: auto;
      }
    }
  }
  @media (max-width: 414px) {
    .mobile-preview-dialog.mask {
      .dialog-container {
        .dialog-header {
          .dialog-title {
            height: 50px;
            line-height: 50px;
          }
        }

        .dialog-content {
          height: calc(100% - 100px);
        }

        .dialog-footer {
          height: 50px;
        }
      }
    }
  }
</style>
