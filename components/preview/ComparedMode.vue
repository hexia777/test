<template>
  <div class="compare-mode">
    <div class="lt" ref="comparedMode" v-show="zoom">
      <div v-show="!previewInfo.beforeLoading" class="before-status quicksand-bold">
        {{ $t('workspace.preview_1') }}
      </div>
      <!-- before -->
      <div
        class="before-img"
        :style="{
          height: zoom ? big.height + 'px' : box.height + 'px',
          width: zoom ? big.width + 'px' : box.width + 'px',
        }"
        id="box1"
        ref="box1"
        v-loading="beforeLoading"
        @mousedown="imageTouch"
        @mouseleave="imageMouseUp"
      >
        <img
          @contextmenu.prevent
          :src="previewInfo.beforeImg"
          alt
          class="drag-img"
          draggable="false"
          @load="imageLoad('before')"
          ondragstart="return false;"
          :style="{
            left: big.left + 'px',
            top: big.top + 'px',
            height: zoom ? big.height + 'px' : box.height + 'px',
            width: zoom ? big.width + 'px' : box.width + 'px',
            position: zoom ? 'absolute' : 'static',
          }"
        />
      </div>
    </div>
    <div class="lt" ref="comparedMode2" v-show="!zoom">
      <div v-show="!previewInfo.beforeLoading" class="before-status quicksand-bold">
        {{ $t('workspace.preview_1') }}
      </div>
      <!-- before -->
      <img
        @contextmenu.prevent
        :src="previewInfo.beforeImg"
        alt
        class="drag-img"
        draggable="false"
        ondragstart="return false;"
        @load="imageLoad('before')"
        :class="[!zoom && 'img-fit-cover']"
      />
    </div>
    <!-- after -->
    <div class="rt" v-show="zoom">
      <div v-show="!previewInfo.afterLoading" class="after-status quicksand-bold">
        {{ $t('workspace.preview_2') }}
      </div>
      <div
        class="after-img"
        :class="[!zoom && 'img-fit-cover']"
        :style="{
          height: zoom ? big.height + 'px' : box.height + 'px',
          width: zoom ? big.width + 'px' : box.width + 'px',
        }"
        v-if="previewInfo.resolutionFlag"
        draggable="false"
        ondragstart="return false;"
        v-loading="afterLoading"
        @mousedown="imageTouch"
        @mouseleave="imageMouseUp"
      >
        <img
          @contextmenu.prevent
          :src="previewInfo.afterImg"
          alt
          @load="imageLoad('after')"
          draggable="false"
          ondragstart="return false;"
          class="drag-img"
          :class="[!zoom && 'img-fit-cover']"
          :style="{
            left: big.left + 'px',
            top: big.top + 'px',
            height: zoom ? big.height + 'px' : 'auto',
            width: zoom ? big.width + 'px' : 'auto',
            position: zoom ? 'absolute' : 'static',
          }"
        />
      </div>
      <div class="box1 new box-failed tc" v-else v-loading="previewInfo.afterLoading">
        <img @contextmenu.prevent :src="$imgPath('/batch/preview-failed.png')" alt class="drag-img" />
        <p class="p-failed" v-html="$t('workspace.preview_5')"></p>
        <p v-html="$t('workspace.preview_6')"></p>
      </div>
    </div>
    <div class="rt" v-show="!zoom">
      <div v-show="!previewInfo.afterLoading" class="after-status quicksand-bold">
        {{ $t('workspace.preview_2') }}
      </div>
      <img
        v-if="previewInfo.resolutionFlag"
        @contextmenu.prevent
        :src="previewInfo.afterImg"
        alt
        @load="imageLoad('after')"
        class="drag-img"
        :class="[!zoom && 'img-fit-cover']"
      />
      <div class="box1 new box-failed tc" v-else v-loading="previewInfo.afterLoading">
        <img @contextmenu.prevent :src="$imgPath('/batch/preview-failed.png')" alt class="drag-img" />
        <p class="p-failed" v-html="$t('workspace.preview_5')"></p>
        <p v-html="$t('workspace.preview_6')"></p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ComparedMode',
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
        beforeLoading: true,
        afterLoading: true,
        box: {
          width: 0,
          height: 0,
        },
        halfPreview: {
          width: 0,
          height: 0,
        },
        initMove: {
          x: 0,
          y: 0,
        },
        startTime: 0,
        firstLoading: true,
      }
    },
    computed: {
      successLoading() {
        if (!this.afterLoading && !this.beforeLoading) {
          return true
        }
        return false
      },
    },
    watch: {
      activeMode() {
        this.$nextTick(() => {
          this.computedBoxSize()
        })
      },
      zoom() {
        this.computedBoxSize()
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
    },
    methods: {
      computedBoxSize() {
        const comparedMode = this.$refs.comparedMode
        if (comparedMode.offsetWidth) {
          this.halfPreview.width = comparedMode.offsetWidth
          this.halfPreview.height = comparedMode.offsetHeight
        } else {
          const comparedMode2 = this.$refs.comparedMode2
          this.halfPreview.width = comparedMode2.offsetWidth
          this.halfPreview.height = comparedMode2.offsetHeight
        }

        this.$emit('halfPreview', this.halfPreview)
        if (this.previewInfo.width > this.previewInfo.height) {
          if (this.previewInfo.width < comparedMode.offsetWidth) {
            this.box.height = this.big.height
            this.box.width = this.big.width
          } else {
            this.box.width = comparedMode.offsetWidth
            this.box.height = (comparedMode.offsetWidth / this.previewInfo.width) * this.previewInfo.height
          }
        } else {
          if (this.previewInfo.height < comparedMode.offsetHeight) {
            this.box.height = this.big.height
            this.box.width = this.big.width
          } else {
            this.box.height = comparedMode.offsetHeight
            this.box.width = (comparedMode.offsetHeight / this.previewInfo.height) * this.previewInfo.width
          }
        }
      },
      imageTouch(e) {
        this.initMove.x = e.clientX
        this.initMove.y = e.clientY
        window.addEventListener('mousemove', this.imageMouseMove)

        window.addEventListener('mouseup', this.imageMouseUp)
      },
      imageMouseMove(e) {
        this.$emit('imageMove', e, this.initMove.x, this.initMove.y)
        this.initMove.x = e.clientX
        this.initMove.y = e.clientY
      },
      imageMouseUp() {
        window.removeEventListener('mousemove', this.imageMouseMove)
        this.initMove.x = 0
        this.initMove.y = 0
      },
      startImageLoad() {
        this.$emit('imgLoadedElk')
      },
      imageLoad(val) {
        if (val === 'after') {
          this.afterLoading = false
          if (this.firstLoading) {
            this.firstLoading = false
            const url = this.previewInfo.afterImg.split('?')
            if (url && url.length > 1) {
              const transId = new URLSearchParams('?' + url).get('trans_id')
              const param = { trans_id: transId, dl_sec: ((Date.now() - this.startTime) / 1000).toFixed(2) }
              this.$emit('rightImgLoadedElk', param)
            }
          }
        } else {
          this.beforeLoading = false
        }
      },
    },
  }
</script>

<style scoped lang="less">
  /deep/ .el-loading-mask {
    background: none;
  }

  .drag-img {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }

  .compare-mode {
    position: relative;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;

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

    .lt,
    .rt {
      // background: #ededed;
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(50% - 0.5px);
      height: 100%;

      .before-img,
      .after-img {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        overflow: hidden;
        background: url('@{assetsImgPath}/common/visiable_bg.png');

        .drag-img {
          z-index: 0;
          cursor: move;
        }
      }
    }

    .img-fit-cover {
      width: auto !important;
      max-width: 100% !important;
      height: auto !important;
      max-height: 100% !important;
    }
  }
</style>
