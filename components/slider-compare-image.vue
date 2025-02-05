<template>
  <div class="row">
    <div v-if="isMobile && mobileImg" class="image-wrap">
      <img v-lazy="mobileImg" :alt="mobileImgAlt" :width="width" :height="height" />
      <slot name="position"></slot>
    </div>
    <div
      v-else
      ref="vfx-image-wrap"
      :class="{ auto: autoPlay }"
      class="vfx-image-wrap"
      @mousemove="mouseMove"
      @mouseleave="mouseLeave"
      @touchmove="touchMove"
      @touchend="backOrigin"
    >
      <div class="vfx-image-wrap-show" :style="{ height: imageH + 'px' }">
        <div ref="before-image" class="before-image">
          <img
            v-lazy="beforeImg"
            :alt="beforeImgAlt"
            :width="imageW"
            :height="imageH"
            :style="{ width: imageW + 'px', height: imageH + 'px' }"
            @load="imageLoad('before')"
          />
        </div>
        <div class="after-image">
          <img
            v-lazy="afterImg"
            :alt="afterImgAlt"
            :width="imageW"
            :height="imageH"
            :style="{ width: imageW + 'px', height: imageH + 'px' }"
            @load="imageLoad('after')"
          />
        </div>
        <div ref="divider-bar" v-if="!autoPlay" class="divider-bar">
          <div class="img-wrap" v-if="fromPromotion">
            <div class="inner-circle">
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAAXNSR0IArs4c6QAAAHpJREFUKFOVkbENwkAMRd+nS88yjEBDkZolIuZALJGagoKMkJHo8pFPOnQSinR2aT9/298iEUqw/GDbB+AuaaoCth/ATdIWuQLbHoAZGCW1AgaewFXSR7aPwAs4le5/ONIrcAn4DZzr6B04yktOObVzc3mfG71ep57yBec3QOHtHFDUAAAAAElFTkSuQmCC"
              />
            </div>
          </div>
          <i
            v-if="!fromPromotion && !autoPlay"
            class="iconfont icon-slide"
            :class="{ 'hover-show': !(isMobile && !mobileImg) && isHoverShowBarIcon }"
          ></i>
          <span v-if="isShow" class="span-left span">Before</span>
          <span v-if="isShow" class="span-right span">After</span>
        </div>
      </div>
      <slot name="position"></slot>
      <slot name="tag">
        <span v-if="showTag && !isMobile" class="tag-left tag quicksand-bold">
          {{ $t('common.remove_27') }}
        </span>
        <span v-if="showTag && !isMobile" class="tag-right tag quicksand-bold">
          {{ $t('common.remove_28') }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SliderCompareImage',
    inheritAttrs: false,
    props: {
      autoPlay: {
        type: Boolean,
        default: false,
      },
      showTag: {
        type: Boolean,
        default: true,
      },
      isMobile: { type: Boolean, default: false },
      imgHeight: { type: Number, default: 0 },
      fromPromotion: { type: Boolean, default: false },
      beforeImg: { type: String, default: '', required: true },
      beforeImgAlt: { type: String, default: '' },
      afterImg: { type: String, default: '', required: true },
      afterImgAlt: { type: String, default: '' },
      mobileImg: { type: String, default: '' },
      mobileImgAlt: { type: String, default: '' },
      width: { type: [Number, String], default: 742 },
      height: { type: [Number, String], default: 394 },
      isShow: { type: Boolean, default: false },
      isHoverShowBarIcon: { type: Boolean, default: true },
      containerOffSetLeft: { type: Number, default: 0 },
    },
    data() {
      return {
        afterLoading: true,
        beforeLoading: true,
        startTime: 0,
        clientWidth: 0,
        clientHeight: 0,
        imgW: 0,
        imgH: 0,
      }
    },
    computed: {
      imageW() {
        return this.imgW || this.width
      },
      imageH() {
        return this.imgH || this.height
      },
      successLoading() {
        if (!this.afterLoading && !this.beforeLoading) {
          return true
        }
        return false
      },
    },
    watch: {
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
      this.$nextTick(() => {
        this.onResize()
      })
      window.addEventListener('resize', this.onResize)
      this.startTime = Date.now()
      this.startImageLoad()
    },
    destroyed() {
      window.removeEventListener('resize', this.onResize)
    },
    methods: {
      startImageLoad() {
        this.$emit('imgLoadedElk')
      },
      imageLoad(val) {
        if (val === 'after') {
          this.afterLoading = false
        } else {
          this.beforeLoading = false
        }
      },
      onResize() {
        this.$nextTick(() => {
          const container = this.$refs['vfx-image-wrap']
          if (!container) {
            return
          }
          this.imgW = container.clientWidth
          this.imgH = (this.imgW / this.width) * this.height
          this.$nextTick(() => {
            this.$emit('imgLoadedElk', ((Date.now() - this.startTime) / 1000).toFixed(2))
          })
        })
      },
      mouseMove(event) {
        const wrap = this.$refs['vfx-image-wrap']
        if (this.autoPlay || !wrap) {
          return
        }
        const fullWidth = wrap.clientWidth
        let mouseX = event.pageX - wrap.offsetLeft - this.containerOffSetLeft
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
        if (this.autoPlay) {
          return
        }
        const topImage = this.$refs['before-image']
        topImage.style.width = '50%'
        topImage.style.transition = 'all 0.3s'

        const divider = this.$refs['divider-bar']
        divider.style.left = '50%'
        divider.style.transition = 'all 0.3s'
      },
      touchMove(event) {
        if (this.autoPlay) {
          return
        }
        const touch = event.touches[0]
        const container = this.$refs['vfx-image-wrap']
        const fullWidth = container.clientWidth
        let mouseX = touch.clientX - this.containerOffSetLeft
        if (mouseX < 0) {
          mouseX = 0
        } else if (mouseX > fullWidth) {
          mouseX = fullWidth
        }
        const divider = this.$refs['divider-bar']
        divider.style.left = mouseX + 'px'
        const topImage = this.$refs['before-image']
        topImage.style.width = mouseX + 'px'
      },
      backOrigin() {
        if (this.autoPlay) {
          return
        }
        const divider = this.$refs['divider-bar']
        divider.classList.add('transition-all')
        divider.style.left = '50%'
        const topImage = this.$refs['before-image']
        topImage.classList.add('transition-all')
        topImage.style.width = '50%'
        setTimeout(() => {
          divider.classList.remove('transition-all')
          topImage.classList.remove('transition-all')
        }, 200)
      },
    },
  }
</script>
<style lang="less" scoped>
  .transition-all {
    box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.4);
    transition: all 0.3s ease 0s;
  }

  @keyframes autoAnimation {
    0% {
      width: 0;
    }

    50% {
      width: 100%;
    }

    100% {
      width: 0;
    }
  }

  @keyframes autoAnimation2 {
    0% {
      left: 0;
    }

    50% {
      left: 100%;
    }

    100% {
      left: 0;
    }
  }

  .row {
    display: inline-block;
    width: 100%;
    background: #ccc;

    &.transparent-img-bg {
      background: transparent;
    }

    .hover-show {
      display: none;
    }

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
      // height: 210px;
      margin: 0 auto;
      overflow: hidden;
      vertical-align: middle;
      cursor: ew-resize;

      &.auto {
        cursor: initial;
        .before-image {
          width: 0;
          animation: autoAnimation 4s infinite;
          /* 设置动画为2秒钟的时间，并无限循环 */
        }

        .divider-bar {
          left: 0;
          animation: autoAnimation2 4s infinite;
          /* 设置动画为2秒钟的时间，并无限循环 */
        }
      }

      .before-image {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 50%;
        height: 100%;
        overflow: hidden;

        img {
          height: 100%;
        }
      }

      .after-image {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: 100%;
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

        .img-wrap {
          position: absolute;
          top: 46%;
          left: -11px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
          /* 使用半透明的白色 */
          border-radius: 50%;

          .inner-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            background: #335d41;
            border: 1px solid rgba(255, 255, 255, 1);
            border-radius: 50%;
          }

          img {
            width: 12px;
            height: 12px;
          }
        }

        i {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translateX(-50%);
        }

        .span-left {
          position: absolute;
          top: 20px;
          left: -90px;
          border-radius: 3px 0 0 3px;
        }

        .span-right {
          position: absolute;
          top: 20px;
          left: 2px;
          border-radius: 0 3px 3px 0;
        }

        .span {
          display: inline-block;
          width: 90px;
          height: 27px;
          font-size: 14px;
          font-weight: bold;
          line-height: 27px;
          color: #fff;
          text-align: center;
          background: #2f2724;
        }
      }

      .scene-icon {
        &.new-icon {
          padding: 12px 19px;
        }

        position: absolute;
        top: 0;
        left: 0;

        .icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 55px;
          height: 55px;
          overflow: hidden;
          border-radius: 50%;
        }
      }

      .tag {
        position: absolute;
        top: 30px;
        z-index: 5;
        min-width: 110px;
        min-height: 27px;
        padding: 3px 10px;
        font-size: 14px;
        color: #fff;
        text-align: center;
        background: rgba(34, 31, 31, 0.9);
      }

      .tag-left {
        left: 50px;
        border-radius: 0 3px 3px 0;
      }

      .tag-right {
        right: 50px;
        border-radius: 3px 0 0 3px;
      }
    }
  }

  .row:hover {
    .hover-show {
      display: block;
    }
  }

  @media (max-width: 1200px) {
    .row {
      display: block;
      text-align: center;
    }
  }

  @media (max-width: 1024px) {
    .row {
      .image-wrap {
        position: relative;
        display: flex;
        align-items: center;
        height: auto;

        img {
          height: auto;
        }

        .scene-icon {
          position: absolute;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .row {
      margin: 0;

      .image-wrap {
        img {
          width: 100%;
          max-height: 210px;
          object-fit: cover;
        }
      }
    }
  }

  @media (max-width: 640px) {
    .sharpened {
      .row {
        margin: 0;

        .image-wrap {
          min-height: 100%;

          img {
            height: 330px;
            max-height: initial;
            object-fit: cover;
          }
        }
      }
    }
  }

  @media (max-width: 460px) {
    .sharpened {
      .row {
        margin: 0;
        .image-wrap {
          min-height: 100%;

          img {
            height: 220px;
            object-fit: cover;
          }
        }
      }
    }
    .row {
      .vfx-image-wrap {
        .tag {
          top: 20px;
        }
        .tag-left {
          left: 20px;
        }
        .tag-right {
          right: 20px;
        }
      }
    }
  }
</style>
