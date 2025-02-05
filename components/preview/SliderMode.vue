<template>
  <div class="slider-mode" ref="sliderMode">
    <div
      ref="vfx-image-wrap"
      :style="{
        width: zoom ? previewInfo.info.w + 'px' : box.width + 'px',
        height: zoom
          ? previewInfoBig
            ? '100%'
            : previewInfo.info.h + 'px'
          : boxBig
          ? '100%'
          : box.height + 'px',
      }"
      v-loading="afterLoading || beforeLoading"
      class="vfx-image-wrap"
      @mousedown="mouseMoveStart"
      @mouseup="mouseLeave"
      @mouseleave="mouseLeave"
    >
      <div class="before-status quicksand-bold">{{ $t('workspace.preview_1') }}</div>
      <div class="after-status quicksand-bold">{{ $t('workspace.preview_2') }}</div>
      <div
        :style="{
          width: zoom ? previewInfo.info.w + 'px' : box.width + 'px',
          height: zoom ? previewInfo.info.h + 'px' : box.height + 'px',
        }"
        ref="before-image"
        class="before-image"
      >
        <img
          :style="{
            left: big.left + 'px',
            top: big.top + 'px',
            height: zoom ? big.height + 'px' : box.height + 'px',
            width: zoom ? big.width + 'px' : box.width + 'px',
            position: zoom ? 'absolute' : 'static',
          }"
          draggable="false"
          ondragstart="return false;"
          @load="imageLoad('before')"
          :src="previewInfo.beforeImg"
          alt
          :width="previewInfo.info.w"
          :height="previewInfo.info.h"
        />
      </div>
      <div
        v-if="previewInfo.resolutionFlag"
        :style="{
          width: zoom ? previewInfo.info.w + 'px' : box.width + 'px',
          height: zoom ? previewInfo.info.h + 'px' : box.height + 'px',
        }"
        class="after-image"
      >
        <img
          :style="{
            left: big.left + 'px',
            top: big.top + 'px',
            height: zoom ? big.height + 'px' : box.height + 'px',
            width: zoom ? big.width + 'px' : box.width + 'px',
            position: zoom ? 'absolute' : 'static',
          }"
          draggable="false"
          ondragstart="return false;"
          :src="previewInfo.afterImg"
          alt
          @load="imageLoad('after')"
          :width="previewInfo.info.w"
          :height="previewInfo.info.h"
        />
      </div>
      <div class="box1 new box-failed tc pa" v-else v-loading="previewInfo.afterLoading">
        <div>
          <img @contextmenu.prevent :src="$imgPath('/batch/preview-failed.png')" alt class="drag-img" />
          <p class="p-failed" v-html="$t('workspace.preview_5')"></p>
          <p v-html="$t('workspace.preview_6')"></p>
        </div>
      </div>
      <div ref="divider-bar" class="divider-bar diff-icon-box compare-follow">
        <i class="iconfont icon-slide hover-show"></i>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      previewInfo: {
        type: Object,
        default: () => {
          return {}
        },
      },
      big: {
        type: Object,
        default: () => {
          return {}
        },
      },
      zoom: {
        type: Number,
        default: 0,
      },
      activeMode: String,
    },
    data() {
      return {
        box: {
          width: 0,
          height: 0,
        },
        halfPreview: {
          width: 0,
          height: 0,
        },
        afterLoading: true,
        beforeLoading: true,
        sliderMode: null,
        startTime: 0,
      }
    },
    computed: {
      successLoading() {
        if (!this.afterLoading && !this.beforeLoading) {
          return true
        }
        return false
      },
      previewInfoBig() {
        const sliderMode = this.$refs.sliderMode
        if (sliderMode) {
          if (this.previewInfo.info.h > sliderMode.offsetHeight) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      },
      boxBig() {
        const sliderMode = this.$refs.sliderMode
        if (sliderMode) {
          if (this.box.height > sliderMode.offsetHeight) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      },
    },
    watch: {
      activeMode() {
        this.$nextTick(() => {
          this.computedWrapSize()
          this.computedBoxSize()
        })
      },
      big: {
        handler() {
          this.$nextTick(() => {
            this.mouseLeave()
          })
        },
        deep: true,
      },
      zoom() {
        this.computedBoxSize()
        this.$nextTick(() => {
          this.computedWrapSize()
        })
      },
      successLoading: {
        handler(val) {
          if (val) {
            this.$emit('imgLoadedElk', ((Date.now() - this.startTime) / 1000).toFixed(2))
          }
        },
        immediate: false,
      },
    },
    mounted() {
      this.startTime = Date.now()
      this.startImageLoad()
      this.computedBoxSize()
      this.$nextTick(() => {
        this.mouseLeave()
        this.computedWrapSize()
      })
      if (!this.previewInfo.resolutionFlag) {
        this.afterLoading = false
      }
    },
    methods: {
      computedWrapSize() {
        const wrap = this.$refs['vfx-image-wrap']
        this.$emit('wrapSize', wrap.offsetWidth, wrap.offsetHeight)
        this.halfPreview.width = wrap.offsetWidth
        this.halfPreview.height = wrap.offsetHeight
        this.$emit('halfPreview', this.halfPreview)
      },
      computedBoxSize() {
        const sliderMode = this.$refs.sliderMode
        this.sliderMode = this.$refs.sliderMode
        if (this.previewInfo.info.w > this.previewInfo.info.h) {
          if (this.previewInfo.info.w > sliderMode.offsetWidth) {
            this.box.width = sliderMode.offsetWidth
            this.box.height = (sliderMode.offsetWidth / this.previewInfo.info.w) * this.previewInfo.info.h
            if (this.box.height > sliderMode.offsetHeight) {
              this.box.height = sliderMode.offsetHeight
              this.box.width = (sliderMode.offsetHeight / this.previewInfo.info.h) * this.previewInfo.info.w
            }
          } else {
            this.box.width = sliderMode.offsetWidth
            this.box.height = (sliderMode.offsetWidth / this.previewInfo.info.w) * this.previewInfo.info.h
            if (this.box.height > sliderMode.offsetHeight) {
              this.box.height = sliderMode.offsetHeight
              this.box.width = (sliderMode.offsetHeight / this.previewInfo.info.h) * this.previewInfo.info.w
            }
          }
        } else {
          if (this.previewInfo.info.h > sliderMode.offsetHeight) {
            this.box.height = sliderMode.offsetHeight
            this.box.width = (sliderMode.offsetHeight / this.previewInfo.info.h) * this.previewInfo.info.w
            if (this.box.width > sliderMode.offsetWidth) {
              this.box.width = sliderMode.offsetWidth
              this.box.height = (sliderMode.offsetWidth / this.previewInfo.info.w) * this.previewInfo.info.h
            }
          } else {
            this.box.height = sliderMode.offsetHeight
            this.box.width = (sliderMode.offsetHeight / this.previewInfo.info.h) * this.previewInfo.info.w
            if (this.box.width > sliderMode.offsetWidth) {
              this.box.width = sliderMode.offsetWidth
              this.box.height = (sliderMode.offsetWidth / this.previewInfo.info.w) * this.previewInfo.info.h
            }
          }
        }
      },
      startImageLoad() {
        this.$emit('imgLoadedElk')
      },
      imageLoad(val) {
        if (val === 'after') {
          this.afterLoading = false
          const url = this.previewInfo.afterImg.split('?')
          if (url && url.length > 1) {
            const transId = new URLSearchParams('?' + url).get('trans_id')
            const param = { trans_id: transId, dl_sec: ((Date.now() - this.startTime) / 1000).toFixed(2) }
            this.$emit('rightImgLoadedElk', param)
          }
        } else {
          this.beforeLoading = false
        }
      },
      mouseMoveStart() {
        window.addEventListener('mousemove', this.mouseMove)
      },
      mouseMove(event) {
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
        window.removeEventListener('mousemove', this.mouseMove)
      },
    },
  }
</script>
<style lang="less" scoped>
  /deep/ .el-loading-mask {
    background: none;
  }

  .drag-img {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }

  .box-failed {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    margin: auto;
  }

  img {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .slider-mode {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
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

  @media (max-width: 1200px) {
    .slider-mode {
      display: block;
      margin: 20 / @base auto 0;
      text-align: center;
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
</style>
