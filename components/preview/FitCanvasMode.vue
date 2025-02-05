<template>
  <div class="fit-canvas-mode">
    <div class="before-status quicksand-bold">{{ $t('workspace.preview_1') }}</div>
    <div class="after-status quicksand-bold">{{ $t('workspace.preview_2') }}</div>
    <div class="le" v-loading="beforeLoading">
      <img
        :src="previewInfo.beforeImg"
        draggable="false"
        ondragstart="return false;"
        alt
        class="before-img"
        @load="imageLoad('before')"
      />
    </div>
    <div
      class="rt"
      v-loading="afterLoading && previewInfo.resolutionFlag"
      :class="{ 'bg-fff': !previewInfo.resolutionFlag }"
    >
      <img
        v-if="previewInfo.resolutionFlag"
        :src="previewInfo.afterImg"
        draggable="false"
        ondragstart="return false;"
        alt
        class="after-img"
        @load="imageLoad('after')"
      />
      <div v-if="!previewInfo.resolutionFlag" class="box1 new box-failed tc">
        <img @contextmenu.prevent :src="$imgPath('/batch/preview-failed.png')" alt class="drag-img" />
        <p class="p-failed" v-html="$t('workspace.preview_5')"></p>
        <p v-html="$t('workspace.preview_6')"></p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FitCanvasMode',
    props: {
      previewInfo: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        beforeLoading: true,
        afterLoading: true,
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
    },
    methods: {
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

  .fit-canvas-mode {
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

    .le,
    .rt {
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(50% - 1px);
      height: 100%;
      background: url('@{assetsImgPath}/common/visiable_bg.png');

      &.bg-fff {
        background: #fff;
      }

      .before-img,
      .after-img {
        max-width: 100%;
        max-height: 100%;
        pointer-events: none;
      }
    }
  }
</style>
