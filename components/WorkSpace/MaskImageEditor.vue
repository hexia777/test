<template>
  <div draggable="false">
    <div class="mask">
      <div class="img-box" id="img-box">
        <div class="img-mask">
          <img
            :src="currentImage.originImg"
            :style="{
              width: imgWidth * scale + 'px',
              height: imgHeight * scale + 'px',

              transform: `translate(${translateX}px, ${translateY}px)`,
            }"
          />
          <canvas
            id="mask-canvas"
            class="mask-canvas"
            :style="{
              width: imgWidth * scale + 'px',
              height: imgHeight * scale + 'px',

              transform: `translate(${translateX}px, ${translateY}px)`,
            }"
          >
          </canvas>
          <div
            class="mouse-box"
            id="mouse-box"
            :style="{
              width: imgWidth * scale + 'px',
              height: imgHeight * scale + 'px',

              transform: `translate(${translateX}px, ${translateY}px)`,
            }"
          >
            <div
              class="circle"
              id="circle"
              :style="{
                width: sliderValue + 'px',
                height: sliderValue + 'px',
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="right-content">
        <div>
          <div class="dialog-close">
            <i class="iconfont-single icon-s-exit" @click="cancel"></i>
          </div>
          <div class="title">{{ $t('workspace.config_tit') }}</div>
          <div class="sub-title">{{ $t('workspace.edit_brush_size') }}</div>
          <v-slider :min="5" :max="100" :value="sliderValue" @changeSliderHandle="changeSliderHandle" />
          <div class="btns">
            <button class="undo" @click="undo">
              <i class="iconfont-single icon-s-undo"></i>
              <span> {{ $t('workspace.edit_popup_2') }}</span>
            </button>
            <button @click="reset">
              <i class="iconfont-single icon-s-reset"></i>
              <span>{{ $t('workspace.edit_reset_btn') }}</span>
            </button>
          </div>
          <div class="space"></div>
          <div class="block">
            <img src="https://c.vanceai.com/old_fix.gif" alt />
          </div>
          <div class="fix-use">{{ $t('workspace.use_fix') }}</div>
          <div class="tip-fix">
            <i class="iconfont-single icon-s-icon_tips"></i>
            <div v-html="$t('workspace.tip_fix')"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-btn">
        <div class="scale-btn">
          <div class="scale image-remove" @click="onDrag" :class="{ 'active-remove': isDrag }">
            <i class="iconfont-single icon-s-move"></i>
          </div>
          <div class="scale zoom">
            <i class="iconfont-single icon-s-ZoomOut" @click="lowerZoom"></i>
            <span>{{ imageScale }}</span>
            <i class="iconfont-single icon-s-ZoomIn" @click="enlargeZoom"></i>
          </div>
        </div>
      </div>
      <div class="footer-btns">
        <div class="ok-cancel">
          <button class="cancel-btn" @click="cancel">
            {{ $t('workspace.crop_cancel') }}
          </button>
          <button class="ok-btn" @click="ok">
            {{ $t('workspace.crop_ok') }}
          </button>
        </div>
        <input ref="hiddenButton" class="hidden-input" />
      </div>
    </div>
  </div>
</template>

<script>
  import VSlider from '@/components/common/VSlider.vue'

  export default {
    name: 'MaskImageEditor',
    components: { VSlider },
    props: {
      // imgSrc: {
      //   type: String,
      //   required: true,
      // },
      currentImage: {
        type: Object,
        required: false,
        default: () => {},
      },
      maskHistory: {
        type: Array,
        required: false,
        default: () => [],
      },
    },
    data() {
      return {
        context2d: null,
        imageLoading: false,
        isEnterMaskCanvas: false,
        isDrag: false,
        translateX: 0,
        translateY: 0,
        dp: 1,
        imgWidth: 0,
        imgHeight: 0,
        offsetLeft: 0,
        offsetTop: 0,
        canvasHistory: this.maskHistory || [],
        historyIndex: 0,
        scale: 1,
        sliderValue: 20,
        uploadCanvas: null,
      }
    },
    computed: {
      imageScale() {
        return (this.scale * 100).toFixed(0) + '%'
      },
    },
    mounted() {
      // 获取焦点要键盘事件可以触发
      this.$refs.hiddenButton.focus()

      this.scale = this.computedDP()

      this.imgWidth = this.currentImage.w
      this.imgHeight = this.currentImage.h

      this.changeOffset(this.scale)
      // 需要画两张canvas图片，
      // 1张用于图片上的mask显示涂抹
      // 1张用于上传，保持图片原尺寸大小
      const maskCanvas = document.getElementById('mask-canvas')
      this.uploadCanvas = document.createElement('canvas')
      const mouseCircle = document.getElementById('circle')
      const imgBox = document.getElementById('img-box')
      const mouseBox = document.getElementById('mouse-box')

      document.addEventListener('keyup', (e) => {
        if (e && e.keyCode === 32) {
          this.isDrag = false
          mouseBox.style.cursor = 'none'
          if (this.isEnterMaskCanvas) {
            mouseCircle.style.display = 'block'
          }
        }
      })

      document.addEventListener('keydown', (e) => {
        if (e && e.keyCode === 32) {
          this.isDrag = true
          mouseCircle.style.display = 'none'
          mouseBox.style.cursor = 'move'
        }
      })

      // maskCanvas.width = this.currentImage.w
      // maskCanvas.height = this.currentImage.h

      maskCanvas.width = this.imgWidth
      maskCanvas.height = this.imgHeight

      this.uploadCanvas.width = this.imgWidth
      this.uploadCanvas.height = this.imgHeight

      this.context2d = maskCanvas.getContext('2d')
      this.uploadContext2d = this.uploadCanvas.getContext('2d')

      this.uploadContext2d.fillStyle = 'rgb(0, 0, 0)'
      this.uploadContext2d.fillRect(0, 0, this.imgWidth, this.imgHeight)

      // maskCanvas.getContext('2d').imageSmoothingEnabled = true
      const lineWidth = this.sliderValue
      const lineColor = 'rgb(189, 255, 1)'
      // const lineColor = 'rgb(0, 255, 0)'
      let painting = false

      if (this.canvasHistory.length) {
        this.showLastHistory()
      }
      mouseBox.onmousedown = (e) => {
        if (this.isDrag) {
          // const imgMask = document.getElementById('img-box')
          // const imgMaskHeight = imgMask.clientHeight
          // const imgMaskWidth = imgMask.clientWidth
          // console.log('-----------------tttttttttttt---', imgMaskWidth, this.imgWidth * this.scale)
          // if (imgMaskWidth > this.imgWidth * this.scale && imgMaskHeight > this.imgHeight * this.scale) {
          //   return
          // }
          const startX = e.clientX - this.translateX
          const startY = e.clientY - this.translateY
          document.onmousemove = (event) => {
            // console.log('--------------xxxx-----------', startX, this.translateX, event)
            const boxHeight = imgBox.clientHeight
            const boxWidth = imgBox.clientWidth
            let maxDragWidth = (boxWidth - this.imgWidth * this.scale) / 2
            let maxDragHeight = (boxHeight - this.imgHeight * this.scale) / 2
            const translateX = event.clientX - startX
            const translateY = event.clientY - startY

            if (this.imgWidth * this.scale <= boxWidth && this.imgHeight * this.scale <= boxHeight) {
              return
            }

            // 图片大小超过盒子大小
            const largerWidth = this.imgWidth * this.scale - boxWidth
            const largerHeight = this.imgHeight * this.scale - boxHeight
            // 缩放会对距离计算有影响
            if (largerWidth > 0) {
              maxDragWidth = largerWidth > boxWidth ? largerWidth / 2 : boxHeight / 2
            }
            if (largerHeight > 0) {
              maxDragHeight = largerHeight > boxHeight ? largerHeight / 2 : boxHeight / 2
            }
            // console.log('=====-----------xxxxxx', maxDragWidth, translateX)
            // 移动距离超出范围
            if (this.imgWidth * this.scale <= boxWidth) {
              this.translateX = 0
            } else if (largerWidth < boxWidth) {
              if (Math.abs(translateX) > largerWidth / 2) {
                this.translateX = translateX > 0 ? largerWidth / 2 : -largerWidth / 2
              } else {
                this.translateX = translateX
              }
            } else if (maxDragWidth <= Math.abs(translateX)) {
              this.translateX = translateX > 0 ? maxDragWidth : -maxDragWidth
            } else {
              this.translateX = translateX
            }

            // 图片大小小于盒子大小不能拖动
            if (this.imgHeight * this.scale <= imgBox.clientHeight) {
              this.translateY = 0
            } else if (largerHeight < boxHeight) {
              if (Math.abs(translateY) > largerHeight / 2) {
                this.translateY = translateY > 0 ? largerHeight / 2 : -largerHeight / 2
              } else {
                this.translateY = translateY
              }
            } else if (maxDragHeight <= Math.abs(translateY)) {
              this.translateY = translateY > 0 ? maxDragHeight : -maxDragHeight
            } else {
              this.translateY = translateY
            }
          }
          document.onmouseup = function () {
            document.onmousemove = null
            document.onmouseup = null
          }
          return
        }
        painting = true
        const event = e || window.event
        this.context2d.lineCap = 'round'
        this.context2d.lineJoin = 'round'

        this.uploadContext2d.lineCap = 'round'
        this.uploadContext2d.lineJoin = 'round'

        const x = event.offsetX
        const y = event.offsetY
        // 鼠标
        mouseCircle.style.background = lineColor
        // const startPositionX = this.scale > 1 ? x / this.scale : x / this.scale
        // const startPositionY = this.scale > 1 ? y / this.scale : y / this.scale
        const startPositionX = this.scale > 1 ? x / this.scale : x / this.scale
        const startPositionY = this.scale > 1 ? y / this.scale : y / this.scale

        this.context2d.beginPath()
        this.context2d.moveTo(startPositionX, startPositionY)
        this.context2d.lineWidth = this.sliderValue / this.scale
        this.context2d.strokeStyle = lineColor

        this.uploadContext2d.beginPath()
        this.uploadContext2d.moveTo(startPositionX, startPositionY)
        this.uploadContext2d.lineWidth = this.sliderValue / this.scale
        this.uploadContext2d.strokeStyle = 'rgb(225,225,225)'
      }
      // 移动
      mouseBox.onmousemove = (e) => {
        if (this.isDrag) {
          return
        }
        mouseCircle.style.display = 'block'
        const event = e || window.event
        // event.stopPropagation()
        const x = event.offsetX
        const y = event.offsetY
        // 鼠标
        // console.log('xxxx----onmousemove', x, y, e)
        mouseCircle.style.top = `${y - this.sliderValue / 2}px`
        mouseCircle.style.left = `${x - this.sliderValue / 2}px`
        if (!painting) {
          return
        }

        // const positionX = ((1 - this.scale) * (x - 0)) / this.scale + (x - (x - 0) / this.scale)
        // const positionX = this.scale > 1 ? x * (1 - this.scale) : x / this.scale
        // const positionY = this.scale > 1 ? y * (1 - this.scale) : y / this.scale
        // const positionY = (1 - this.scale) * y

        const positionX = this.scale > 1 ? x / this.scale : x / this.scale
        const positionY = this.scale > 1 ? y / this.scale : y / this.scale
        //////
        // console.log('point', x, y)
        this.context2d.lineTo(positionX, positionY)
        this.context2d.stroke()

        this.uploadContext2d.lineTo(positionX, positionY)
        this.uploadContext2d.stroke()
      }

      // imgBox.onmousemove = (e) => {
      //   const event = e || window.event
      //   const x = event.clientX
      //   const y = event.clientY
      //   console.log('xxxx----6666----onmousemove', x, y, e)
      //   //鼠标
      //   mouseCircle.style.top = `${x}px`
      //   mouseCircle.style.left = `${y}px`
      // }
      // 抬笔
      mouseBox.onmouseup = () => {
        if (this.isDrag) {
          return
        }
        mouseCircle.style.background = 'none'
        if (!painting) {
          return false
        }
        painting = false
        this.context2d.closePath()
        this.uploadContext2d.closePath()
        this.addHistory()
      }

      // 离开画板
      mouseBox.onmouseleave = () => {
        this.isEnterMaskCanvas = false
        mouseCircle.style.display = 'none'
        mouseCircle.style.background = 'none'
        mouseBox.style.cursor = 'none'
        if (!painting) {
          return false
        }
        painting = false
        this.context2d.closePath()
        this.uploadContext2d.closePath()
        this.addHistory()
      }

      // 离开画板
      mouseBox.onmouseenter = () => {
        this.isEnterMaskCanvas = true
        if (this.isDrag) {
          mouseBox.style.cursor = 'move'
          return
        }
        mouseCircle.style.display = 'block'
      }

      // maskCanvas.onmouseover = () => {
      //   console.log('xxxx----mouseover')
      //   mouseCircle.style.display = 'block'
      // }

      this.onwheel()
    },
    destroyed() {},
    methods: {
      cancel() {
        this.$emit('editorCancel', this.canvasHistory)
      },
      ok() {
        const value = this.canvasHistory.length
          ? this.canvasHistory[this.canvasHistory.length - 1].maskUrl
          : ''
        // this.download()
        this.$emit('editorOk', value, this.canvasHistory)
      },
      changeSliderHandle(value) {
        this.sliderValue = value
      },
      changeOffset(scale, oldScale) {
        // const offsetLeft = Math.abs((scale * this.imgWidth - this.imgWidth) / 2)
        // const offsetTop = Math.abs((scale * this.imgHeight - this.imgHeight) / 2)
        // this.offsetLeft = scale > 0 ? -offsetLeft : offsetLeft
        // this.offsetTop = scale > 0 ? -offsetTop : offsetTop
        const mouseCircle = document.getElementById('circle')
        mouseCircle.style.display = 'none'
        // if(oldScale > scale) {
        // }
        // mouseCircle.style.top = Number(mouseCircle.style.top.replace('px', '')) / this.scale + 'px'
        // mouseCircle.style.left = Number(mouseCircle.style.left.replace('px', '')) / this.scale + 'px'
      },
      enlargeZoom() {
        this.scale += 0.1
        this.changeOffset(this.scale)
      },
      lowerZoom() {
        this.scale -= 0.1
        this.changeOffset(this.scale)
      },
      onDrag() {
        this.isDrag = !this.isDrag
      },
      addHistory() {
        const maskCanvas = document.getElementById('mask-canvas')
        // this.canvasHistory.push(1)
        const maskUrl = maskCanvas.toDataURL()
        const uploadUrl = this.uploadCanvas.toDataURL('image/png')
        this.canvasHistory = [...this.canvasHistory, { maskUrl, uploadUrl }]
        this.historyIndex += 1
      },
      undo() {
        // 方式1 存储粗点方式
        // 方式2 存储的图片地址方式
        if (this.canvasHistory.length === 1) {
          this.context2d.clearRect(0, 0, this.imgWidth, this.imgHeight)
          this.uploadContext2d.clearRect(0, 0, this.imgWidth, this.imgHeight)
          this.canvasHistory = []
          return
        }

        const canvasPic = new Image()

        this.canvasHistory.pop()
        canvasPic.src = this.canvasHistory[this.canvasHistory.length - 1].maskUrl

        canvasPic.onload = () => {
          // 清理画布
          this.context2d.clearRect(0, 0, this.imgWidth, this.imgHeight)
          // 将缓存复制到画布上，通过这种方式可以解决画面闪动的问题
          this.context2d.drawImage(canvasPic, 0, 0)
        }
      },
      showLastHistory() {
        const canvasPic = new Image()

        canvasPic.src = this.canvasHistory[this.canvasHistory.length - 1].maskUrl
        canvasPic.setAttribute('crossOrigin', 'anonymous')
        canvasPic.onload = () => {
          // 清理画布
          this.context2d.clearRect(0, 0, this.imgWidth, this.imgHeight)
          // 将缓存复制到画布上，通过这种方式可以解决画面闪动的问题
          this.context2d.drawImage(canvasPic, 0, 0)
        }
      },
      reset() {
        this.canvasHistory = []
        this.context2d.clearRect(0, 0, this.imgWidth, this.imgHeight)
        this.uploadContext2d.clearRect(0, 0, this.imgWidth, this.imgHeight)
      },
      download() {
        // this.imgWidth = this.currentImage.w * this.dp
        // this.imgHeight = this.currentImage.h * this.dp
        // this.context2d.scale(1 + 1 - this.dp, 1 + 1 - this.dp)
        const lastHistory = this.canvasHistory[this.canvasHistory.length - 1]
        const aLink = document.createElement('a')
        aLink.download = 'show1.png'
        aLink.href = lastHistory.maskUrl
        aLink.click()

        const aLink2 = document.createElement('a')
        aLink2.download = 'mask2.png'
        aLink2.href = lastHistory.uploadUrl
        aLink2.click()
      },
      computedDP() {
        const imgMask = document.getElementById('img-box')
        const imgMaskHeight = imgMask.clientHeight
        const imgMaskWidth = imgMask.clientWidth
        if (this.currentImage.h <= imgMaskHeight && this.currentImage.w <= imgMaskWidth) {
          // if (this.currentImage.w < 560 && this.currentImage.h * (imgMaskWidth / 650) < imgMaskHeight) {
          //   return 560 / this.currentImage.w
          // }
          return 1
        }
        // 高度比大于宽度比 按宽度比缩放效果更好
        if (this.currentImage.h / imgMaskHeight > this.currentImage.w / imgMaskWidth) {
          // 是否超出边界
          if (this.currentImage.h * (imgMaskWidth / this.currentImage.w) > imgMaskHeight) {
            return imgMaskHeight / this.currentImage.h
          }
          return imgMaskWidth / this.currentImage.w
        }
        // 高度比小于于宽度比 按高度比缩放效果更好

        if (this.currentImage.w * (imgMaskHeight / this.currentImage.h) > imgMaskWidth) {
          return imgMaskWidth / this.currentImage.w
        }
        return imgMaskHeight / this.currentImage.h
      },
      rafThrottle(fn) {
        let locked = false
        return function (...res) {
          if (locked) {
            return
          }
          locked = true
          window.requestAnimationFrame(() => {
            fn.apply(this, res)
            locked = false
          })
        }
      },
      onwheel() {
        const imgBox = document.getElementById('img-box')
        imgBox.onwheel = this.rafThrottle((event) => {
          let scale = this.scale + (event.deltaY * -0.01) / 10

          // Restrict scale
          scale = Math.min(Math.max(0.125, scale), 4)
          this.scale = scale
          this.changeOffset(this.scale)
        })
      },
    },
  }
</script>

<style scoped lang="less">
  .mask-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9;
    cursor: none;
    // width: 100%;
    // height: 100%;
  }

  .drag-mouse {
    cursor: move;
  }

  .mask {
    position: relative;
    display: flex;
    height: calc(100vh - 130px);
    user-select: none;
    background: #fff;
    border-radius: 2px;

    .img-box {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 0;
      overflow: hidden;

      .circle {
        position: absolute;
        z-index: 88;
        display: none;
        // width: 20px;
        // height: 20px;
        pointer-events: none;
        border: 2px solid rgb(51, 51, 51);
        border-radius: 50%;
      }

      .img-mask {
        position: relative;
        // flex: 1;
        // width: 100%;
        // height: 100%;
        // min-width: 0;
        // min-height: 0;
        .mouse-box {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 28;
          cursor: none;
        }

        .drag-box {
          position: absolute;
          top: 0;
          left: 0;
        }

        img {
          // width: 100%;
          // height: 100%;
        }
      }
    }
  }

  .right-content {
    display: flex;
    flex-direction: column;
    width: 260 / @base;
    padding: 0 10 / @base 0 15 / @base;

    .dialog-close {
      display: flex;
      justify-content: flex-end;
      cursor: pointer;

      .icon-s-exit {
        font-size: 18px;
      }
    }

    .title {
      margin-top: 25 / @base;
      font-size: 14px;
      font-weight: bold;
      line-height: 26px;
      color: #333;
    }

    .sub-title {
      margin-top: 26 / @base;
      font-size: 14px;
      line-height: 22px;
      color: #232323;
    }

    .btns {
      display: flex;
      justify-content: center;
      margin-top: 25 / @base;

      button {
        display: flex;
        align-items: center;
        min-width: 100 / @base;
        padding: 6px 10px;
        font-size: 14px;
        line-height: 1;
        color: #232323;
        // white-space: pre-wrap;
        background: #fff;
        border: 2px solid #ddd;
        border-radius: 4px;

        span {
          word-break: break-all;
          white-space: pre-wrap;
        }

        .iconfont-single {
          margin-right: 10 / @base;
          font-size: 14px;
          color: #232323;
        }
      }

      .undo {
        margin-right: 5px;
      }
    }

    .space {
      margin-top: 20 / @base;
      margin-bottom: 10 / @base;
      border: 1px solid #ddd;
    }

    .block {
      height: 90 / @base;
      margin-bottom: 10 / @base;
      // background: #d8d8d8;
      border-radius: 4px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .fix-use {
      margin-bottom: 10 / @base;
      font-size: 14px;
      line-height: 22px;
      color: #8f8f8f;
    }

    .tip-fix {
      display: flex;
      padding: 10 / @base;
      // margin-bottom: 74 / @base;
      font-size: 14px;
      line-height: 22px;
      color: #8f8f8f;
      background: #f2f2f2;
      border: 1px solid #dcdcdc;
      border-radius: 4px;

      .icon-s-icon_tips {
        margin-right: 6 / @base;
        font-size: 16px;
        color: #0d73e3;
      }
    }
  }

  .footer {
    position: relative;
    z-index: 66;
    display: flex;
    padding-top: 8px;

    .footer-btn {
      // position: absolute;
      // bottom: 0;
      // left: 0;
      z-index: 19;
      display: flex;
      flex: 1;
      justify-content: center;
      // width: 100%;

      .scale-btn {
        display: flex;

        .scale {
          line-height: 1;
          border: 2px solid #ddd;
          border-radius: 2px;
        }

        i {
          display: inline-block;
          padding: 8px;
        }

        .image-remove {
          margin-right: 12 / @base;

          &:hover {
            border-color: #0374ff;

            .icon-s-move {
              color: #0374ff;
            }
          }
        }

        .active-remove {
          border-color: #0374ff;

          .icon-s-move {
            color: #0374ff;
          }
        }

        .zoom {
          display: flex;
          align-items: center;
          width: 118 / @base;

          .icon-s-ZoomOut {
            cursor: pointer;
          }

          .icon-s-ZoomIn {
            cursor: pointer;
          }
        }
      }
    }

    .footer-btns {
      display: flex;
      // flex: 1;
      // flex-direction: column;
      // justify-content: space-around;
      width: 260 / @base;
      font-size: 16px;
      font-weight: bold;
      line-height: 24px;
      color: #232323;

      .ok-cancel {
        display: flex;
        justify-content: space-around;
        width: 100%;
      }

      button {
        min-width: 100 / @base;
        padding: 6px 10px;
        border-radius: 4px;
      }

      .cancel-btn {
        // margin-right: 10 / @base;
        background: #fff;
        border: 1px solid #ddd;
      }

      .ok-btn {
        background: #ff9d1d;
        border: none;
      }
    }

    .hidden-input {
      width: 0;
      height: 0;
      border: none;
    }
  }
</style>
