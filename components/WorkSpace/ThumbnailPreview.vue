<template>
  <div class="thumbnail-preview">
    <div class="preview-frame" :style="{ width: frame.w + 'px', height: frame.h + 'px' }">
      <div class="preview-draw" :style="{ width: thumbnail.w + 'px', height: thumbnail.h + 'px' }">
        <img :src="previewInfo.thumbnail" />
        <vue-draggable-resizable
          v-if="dragLoaded"
          :w="dragBlock.w"
          :h="dragBlock.h"
          :x="dragBlock.x"
          :y="dragBlock.y"
          :parent="true"
          :grid="[1, 1]"
          :resizable="false"
          class="thumbnail-drag"
          :class="dragBlock.w < 20 && 'thumbnailMover-small'"
          @dragging="onDrag"
          @activated="onDrag"
        >
          <template v-if="!isFirstDrag">
            <div class="drag-tip" v-html="$t('workspace.preview_7')"></div>
          </template>
          <template v-if="dragBlock.w < 20">
            <div
              class="mover"
              :style="{
                width: dragBlock.w + 'px',
                height: dragBlock.h + 'px',
              }"
            >
              <i class="iconfont-single icon-s-magnifier"></i>
            </div>
          </template>
        </vue-draggable-resizable>
      </div>
    </div>
  </div>
</template>

<script>
  import VueDraggableResizable from 'vue-draggable-resizable'

  export default {
    name: 'ThumbnailPreview',
    components: {
      VueDraggableResizable,
    },
    props: {
      rate: { type: Number, default: 1 },
      maxw: {
        type: Number,
        default: 300,
      },
      maxh: {
        type: Number,
        default: 200,
      },
      offset: {
        type: Object,
        default: () => {
          return { x: 0, y: 0 }
        },
      },
      previewSize: {
        type: Object,
        default: () => ({
          w: 0,
          h: 0,
          imgw: 0,
          imgh: 0,
        }),
      },
      previewInfo: {
        type: Object,
        default: () => ({
          thumbnail: '',
          w: 0,
          h: 0,
        }),
      },
    },
    data() {
      return {
        dragLoaded: false,
        frame: {
          w: 0,
          h: 0,
        },
        thumbnail: {
          w: 0,
          h: 0,
        },
        center: {
          x: 0,
          y: 0,
        },
        dragBlock: {
          w: 1,
          h: 1,
          x: 0,
          y: 0,
        },
        r: 0,
        isFirstDrag: this.$getCookie('cloud_thumbnailPreviewDraged'),
      }
    },
    watch: {
      offset: {
        handler(val) {
          const x = this.center.x - this.dragBlock.w / 2 - val.x * this.r * this.rate
          const y = this.center.y - this.dragBlock.h / 2 - val.y * this.r * this.rate
          this.onDrag(x, y, false)
        },
        deep: true,
      },
      rate(val, old) {
        if (val > 1) {
          this.dragLoaded = true
        } else {
          this.dragLoaded = false
        }
        this.changeDrawPosition()
      },
      previewSize: {
        handler() {
          this.changeDrawPosition()
        },
        deep: true,
      },
    },
    mounted() {
      this.initSize()
    },
    methods: {
      initSize() {
        console.log('initSize')
        this.frame.w = this.maxw
        this.frame.h = this.maxh

        this.thumbnail.h = this.frame.h
        this.thumbnail.w = (this.previewInfo.w / this.previewInfo.h) * this.thumbnail.h

        //重置比例宽高
        // const resetData = this.imgProportionFun(this.frame.w, this.frame.h)

        // this.thumbnail.w = resetData.w
        // this.thumbnail.h = resetData.h

        this.center = {
          x: this.thumbnail.w / 2,
          y: this.thumbnail.h / 2,
        }
        this.dragBlock.w = this.thumbnail.w / this.rate
        this.dragBlock.h = this.thumbnail.h / this.rate
        this.dragBlock.x = this.center.x - this.dragBlock.w / 2
        this.dragBlock.y = this.center.y - this.dragBlock.h / 2
      },
      /**
       * @imgProportionFun 图片比例缩放
       */
      imgProportionFun(w, h) {
        const proportionNum = w / h
        let wNum = w
        let hNum = h
        if (w >= h) {
          if (w > 335) {
            wNum = 335
            hNum = wNum / proportionNum
          }
        } else {
          if (h > 200) {
            hNum = 200
            wNum = hNum * proportionNum
          }
        }
        return { w: wNum.toFixed(1), h: hNum.toFixed(1) }
      },
      changeDrawPosition() {
        //缩略图与大图的比例
        this.r = this.thumbnail.w / this.previewSize.imgw
        let w, h, x, y
        if (this.previewSize.imgw > this.previewSize.w) {
          w = this.previewSize.w * this.r
          x = this.center.x - w / 2 - this.offset.x * this.r * this.rate
        } else {
          w = this.thumbnail.w
          x = 0
        }
        if (this.previewSize.imgh > this.previewSize.h) {
          h = this.previewSize.h * this.r
          y = this.center.y - h / 2 - this.offset.y * this.r * this.rate
        } else {
          h = this.thumbnail.h
          y = 0
        }
        this.dragBlock.w = w
        this.dragBlock.h = h
        this.dragBlock.x = x
        this.dragBlock.y = y
        this.onDrag(this.dragBlock.x, this.dragBlock.y)
      },
      onDrag(x = 0, y = 0, isEmited = true) {
        this.$setCookie('cloud_thumbnailPreviewDraged', '1')
        this.isFirstDrag = true
        this.dragBlock.x = x
        this.dragBlock.y = y

        if (isEmited) {
          this.$emit('onDrag', {
            x: (-1 * (x - this.center.x + this.dragBlock.w / 2)) / this.rate / this.r,
            y: (-1 * (y - this.center.y + this.dragBlock.h / 2)) / this.rate / this.r,
          })
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .thumbnail-preview {
    .preview-frame {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ededed;

      .preview-draw {
        position: relative;
        width: 100%;
        background: url('@{assetsImgPath}/common/visiable_bg.png');

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-drag {
          position: absolute;
          top: 0;
          left: 0;
          display: inline-block;
          width: 40 / @base;
          max-width: 100%;
          height: 24 / @base;
          cursor: move;
          background: rgba(225, 225, 225, 0.5);
          border: 1px solid #fff;
        }

        .thumbnail-drag-small {
          width: 4 / @base !important;
          height: 4 / @base !important;
          background: #fff;
          border: 1px solid #4d4d4f;

          .mover {
            position: relative;

            .icon-s-magnifier {
              position: absolute;
              top: 4 / @base;
              left: 4 / @base;
              color: #fff;
            }
          }
        }

        .drag-tip {
          position: absolute;
          top: 15%;
          left: 50%;
          display: block;
          width: 220px;
          padding: 5px 8px;
          font-size: 14px;
          line-height: 20px;
          color: #fff;
          text-align: left;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 10px;
          transform: translate(-50%, -50%);

          &::after {
            position: absolute;
            bottom: -16px;
            left: 50%;
            display: block;
            width: 0;
            height: 0;
            margin-left: -4px;
            content: '';
            border: 8px solid transparent;
            border-top-color: rgba(0, 0, 0, 0.7);
          }
        }
      }
    }
  }
</style>
