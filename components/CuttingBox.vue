<template>
  <div>
    <div
      ref="toolBox"
      :style="'height:' + viewSize.h + 'px;width:' + viewSize.w + 'px'"
      @mouseup="handelContainerMouseUp"
      @mousedown="handelContainerMouseDown"
      @mousemove="handelContainerMouseMove"
      @mouseleave="handelContainerMouseLeave"
      class="toolBox"
    >
      <!--裁剪区域-->
      <div
        ref="toolBoxControl"
        @mousedown="handelViewMouseDown"
        @mouseup="handelViewMouseUp"
        @mousemove="handelViewMove"
        class="toolBoxControl"
        :class="[{ 'disabled-event': drawLock || resizeLock }]"
        v-show="cutVisible"
        :style="{
          width: cutDomInfo.w + 'px',
          height: cutDomInfo.h + 'px',
          top: cutDomInfo.y + 'px',
          left: cutDomInfo.x + 'px',
        }"
      >
        <div class="toolBoxControlBox">
          <div class="controlBox">
            <!--蚂蚁线-->
            <div class="controlBoxInnerLine controlBoxInnerLineTop"></div>
            <div class="controlBoxInnerLine controlBoxInnerLineBottom"></div>
            <div class="controlBoxInnerLine controlBoxInnerLineLeft"></div>
            <div class="controlBoxInnerLine controlBoxInnerLineRight"></div>
            <!--工具栏提示-->
            <div class="selectArea" :class="[{ 'txt-move-bottom': upperBoundary }]">
              w:{{ cutW }} h:{{ cutH }} (x:{{ cutX }},y:{{ cutY }})
            </div>
            <!--操作杆-->
            <div
              data-name="leftUp"
              @mousedown="handleResizeCut($event, 'tl')"
              class="leftUp controlBtn"
            ></div>
            <div
              data-name="leftDown"
              @mousedown="handleResizeCut($event, 'bl')"
              class="leftDown controlBtn"
            ></div>
            <div
              data-name="rightUp"
              @mousedown="handleResizeCut($event, 'tr')"
              class="rightUp controlBtn"
            ></div>
            <div
              data-name="rightDown"
              @mousedown="handleResizeCut($event, 'br')"
              class="rightDown controlBtn"
            ></div>

            <div
              data-name="topCenter"
              @mousedown="handleResizeCut($event, 'tc')"
              class="topCenter controlBtn"
            ></div>
            <div
              data-name="downCenter"
              @mousedown="handleResizeCut($event, 'bc')"
              class="downCenter controlBtn"
            ></div>
            <div
              data-name="leftCenter"
              @mousedown="handleResizeCut($event, 'cl')"
              class="leftCenter controlBtn"
            ></div>
            <div
              data-name="rightCenter"
              @mousedown="handleResizeCut($event, 'cr')"
              class="rightCenter controlBtn"
            ></div>
          </div>
          <div class="toolBoxControlLine toolBoxControlLineItem-1"></div>
          <div class="toolBoxControlLine toolBoxControlLineItem-2"></div>
          <div class="toolBoxControlLine toolBoxControlLineItem-3"></div>
          <div class="toolBoxControlLine toolBoxControlLineItem-4"></div>
        </div>
        <!-- 确认按钮 -->
        <div v-show="confirmVisible" class="confirmBox flex" :class="[{ 'txt-move-top': lowerBoundary }]">
          <div @click="cancelDraw" class="icon_cancel_icon"></div>
          <div @click="confirmDraw" class="icon_confirm_icon mag-l-10"></div>
        </div>
      </div>
      <!--画布-->
      <canvas
        class="canvasSelectBox"
        ref="canvasSelectBox"
        :width="canvasSize.w"
        :height="canvasSize.h"
      ></canvas>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'ImgCutter',
    props: {
      viewSize: Object,
      canvasSize: Object,
      ratioOfWidthAndHeight: String,
      presetCutSize: Object,
    },
    data() {
      return {
        //绘制锁
        drawLock: false,
        // 拖拽锁
        dragLock: false,
        windowEventLock: false,
        windowEventDown: false,
        // resize锁
        resizeLock: false,
        resizeType: '',
        cutVisible: false,
        confirmVisible: false,
        cutPosition: {
          x: 0,
          y: 0,
        },
        cutSize: {
          w: 0,
          h: 0,
        },
        dragAnchor: {
          x: 0,
          y: 0,
        },
        widthCompareOfCutAndOrigin: 1,
        heightCompareOfCutAndOrigin: 1,
        mousePosition: ['', ''],
      }
    },
    computed: {
      cutW() {
        return this.cutInfo.w.toFixed(0)
      },
      cutH() {
        return this.cutInfo.h.toFixed(0)
      },
      cutX() {
        return this.cutInfo.x.toFixed(0)
      },
      cutY() {
        return this.cutInfo.y.toFixed(0)
      },
      cutDomInfo() {
        let x = this.cutPosition.x,
          y = this.cutPosition.y,
          w = this.cutSize.w,
          h = this.cutSize.h
        // 为负值时反向绘制
        if (w < 0) {
          x += w
          w = Math.abs(w)
        }
        if (h < 0) {
          y += h
          h = Math.abs(h)
        }
        //临界条件
        if (x < 0) {
          w += x
          x = 0
        } else if (x + w > this.viewSize.w) {
          w = this.viewSize.w - x
        }
        if (y < 0) {
          h += y
          y = 0
        } else if (y + h > this.viewSize.h) {
          h = this.viewSize.h - y
        }
        return { x, y, w, h }
      },
      cutInfo() {
        let x = this.cutPosition.x / this.widthCompareOfCutAndOrigin,
          y = this.cutPosition.y / this.heightCompareOfCutAndOrigin,
          w = this.cutSize.w / this.widthCompareOfCutAndOrigin,
          h = this.cutSize.h / this.heightCompareOfCutAndOrigin
        // 为负值时反向绘制
        if (w < 0) {
          x += w
          w = Math.abs(w)
        }
        if (h < 0) {
          y += h
          h = Math.abs(h)
        }
        //临界条件
        if (x < 0) {
          w += x
          x = 0
        } else if (x + w > this.canvasSize.w) {
          w = this.canvasSize.w - x
        }
        if (y < 0) {
          h += y
          y = 0
        } else if (y + h > this.canvasSize.h) {
          h = this.canvasSize.h - y
        }
        return { x, y, w, h }
      },
      upperBoundary() {
        return this.cutPosition.y < 20
      },
      lowerBoundary() {
        if (this.cutSize.h >= 0) {
          return this.cutPosition.y + this.cutSize.h > this.viewSize.h - 20
        } else {
          return this.cutPosition.y > this.viewSize.h - 20
        }
      },
    },
    watch: {
      presetCutSize: {
        handler(val) {
          if (!val.disabled) {
            this.handlePresetCut(val.width, val.height)
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.regiestWindowEvent()
      this.handlePresetCut(this.presetCutSize.width, this.presetCutSize.height)
    },
    destroyed() {
      window.removeEventListener('mousedown', this.windowMousedownEvent)
      window.removeEventListener('mouseup', this.windowMouseupEvent)
      window.removeEventListener('mousemove', this.windowMousemoveEvent)
    },
    methods: {
      regiestWindowEvent() {
        window.addEventListener('mousedown', this.windowMousedownEvent)
        window.addEventListener('mouseup', this.windowMouseupEvent)
        window.addEventListener('mousemove', this.windowMousemoveEvent)
      },
      windowMousedownEvent(e) {
        const tuiBox = document.querySelector('.tui-box')
        if (tuiBox === e.target) {
          this.windowEventDown = true
          const boxWidth = tuiBox.clientWidth
          const boxHeight = tuiBox.clientHeight
          const topBorder = (boxHeight - this.viewSize.h) / 2
          const bottomBorder = topBorder + this.viewSize.h
          const leftBorder = (boxWidth - this.viewSize.w) / 2
          const rightBorder = leftBorder + this.viewSize.w
          let xMousePosition, yMousePosition
          if (e.offsetY <= topBorder) {
            yMousePosition = 'top'
          } else if (e.offsetY >= bottomBorder) {
            yMousePosition = 'bottom'
          }
          if (e.offsetX <= leftBorder) {
            xMousePosition = 'left'
          } else if (e.offsetX >= rightBorder) {
            xMousePosition = 'right'
          }
          this.mousePosition = [xMousePosition, yMousePosition]
        }
        if (e.target === this.$refs.toolBox) {
          this.windowEventDown = true
        }
      },
      windowMouseupEvent(e) {
        console.log('windowMouseupEvent')
        this.mousePosition = ['', '']
        this.windowEventLock = false
        this.windowEventDown = false
        this.handelContainerMouseUp()
        this.handelViewMouseUp(e)
      },
      windowMousemoveEvent(e) {
        if (!this.windowEventDown) {
          return
        }

        const tuiBox = document.querySelector('.tui-box')
        const toolBox = this.$refs.toolBox
        console.log('windowMousemoveEvent', e.target)
        if (tuiBox === e.target || toolBox === e.target) {
          console.log('windowMousemoveEvent')
          if (!this.windowEventLock) {
            this.windowEventLock = true
            this.handelContainerMouseDown(e)
            this.handelContainerMouseMove(e)
          } else {
            this.handelContainerMouseMove(e)
          }
        }
      },
      handlePresetCut(w, h) {
        console.log('handlePresetCut')
        if (!w || !h) {
          return
        }
        this.clearMask()
        this.widthCompareOfCutAndOrigin = this.viewSize.w / this.canvasSize.w
        this.heightCompareOfCutAndOrigin = this.viewSize.h / this.canvasSize.h
        this.computedCutSize(w * this.widthCompareOfCutAndOrigin, h * this.heightCompareOfCutAndOrigin)
        this.cutPosition = {
          x: (this.viewSize.w - w * this.widthCompareOfCutAndOrigin) / 2,
          y: (this.viewSize.h - h * this.heightCompareOfCutAndOrigin) / 2,
        }

        this.cutVisible = true
        this.confirmVisible = true
        this.$nextTick(() => {
          //绘制遮罩
          this.drawMask()
          //绘制空白
          this.drawBlank()
        })
      },
      handelContainerMouseLeave(e) {
        // console.log(e.target)
      },
      handelContainerMouseDown(e) {
        //计算裁剪框与原图的比
        this.widthCompareOfCutAndOrigin = this.viewSize.w / this.canvasSize.w
        this.heightCompareOfCutAndOrigin = this.viewSize.h / this.canvasSize.h
        // 开启绘制锁
        this.drawLock = true
        // 非resize
        this.resizeType = ''
        // 绘制遮罩
        this.drawMask()
        // 确定起始点坐标
        let x = e.offsetX,
          y = e.offsetY
        const tuiBox = document.querySelector('.tui-box')
        if (tuiBox === e.target) {
          const boxWidth = tuiBox.clientWidth
          const boxHeight = tuiBox.clientHeight
          const topBorder = (boxHeight - this.viewSize.h) / 2
          const bottomBorder = topBorder + this.viewSize.h
          const leftBorder = (boxWidth - this.viewSize.w) / 2
          const rightBorder = leftBorder + this.viewSize.w
          x -= leftBorder
          y -= topBorder
        }
        if (this.mousePosition[1] === 'top') {
          y = 0
        } else if (this.mousePosition[1] === 'bottom') {
          y = this.viewSize.h
        }
        if (this.mousePosition[0] === 'left') {
          x = 0
        } else if (this.mousePosition[0] === 'right') {
          x = this.viewSize.w
        }
        this.cutPosition = {
          x,
          y,
        }
        this.cutSize = {
          w: 0,
          h: 0,
        }
        this.confirmVisible = false
      },
      handelContainerMouseUp() {
        this.drawLock = false
        this.resizeLock = false
        if (this.cutSize.w === 0 || !this.cutSize.h === 0) {
          this.cutPosition = {
            x: 0,
            y: 0,
          }
          this.confirmVisible = false
          this.clearMask()
        } else {
          this.confirmVisible = true
        }
      },
      handelContainerMouseMove(e, init = false) {
        console.log('handelContainerMouseMove')
        if ((!this.resizeLock && !this.drawLock) || this.dragLock) {
          return
        }
        if (this.resizeType === 'tl') {
          let w, h, x, y
          if (this.cutSize.w >= 0) {
            w = this.cutSize.w - e.movementX
            x = this.cutPosition.x + e.movementX
          } else {
            w = this.cutSize.w + e.movementX
            x = this.cutPosition.x
          }
          if (this.cutSize.h >= 0) {
            h = this.cutSize.h - e.movementY
            y = this.cutPosition.y + e.movementY
          } else {
            h = this.cutSize.h + e.movementY
            y = this.cutPosition.y
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'tr') {
          let w, h, x, y
          if (this.cutSize.w >= 0) {
            w = this.cutSize.w + e.movementX
            x = this.cutPosition.x
          } else {
            w = this.cutSize.w - e.movementX
            x = this.cutPosition.x + e.movementX
          }
          if (this.cutSize.h >= 0) {
            h = this.cutSize.h - e.movementY
            y = this.cutPosition.y + e.movementY
          } else {
            h = this.cutSize.h + e.movementY
            y = this.cutPosition.y
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'tc') {
          let h, y
          const w = this.cutSize.w,
            x = this.cutPosition.x
          if (this.cutSize.h >= 0) {
            h = this.cutSize.h - e.movementY
            y = this.cutPosition.y + e.movementY
          } else {
            h = this.cutSize.h + e.movementY
            y = this.cutPosition.y
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'br') {
          let w, h, x, y
          if (this.cutSize.w > 0) {
            w = this.cutSize.w + e.movementX
            x = this.cutPosition.x
          } else {
            w = this.cutSize.w - e.movementX
            x = this.cutPosition.x + e.movementX
          }
          if (this.cutSize.h >= 0) {
            h = this.cutSize.h + e.movementY
            y = this.cutPosition.y
          } else {
            h = this.cutSize.h - e.movementY
            y = this.cutPosition.y + e.movementY
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'bc') {
          let y, h
          const w = this.cutSize.w,
            x = this.cutPosition.x
          if (this.cutSize.h >= 0) {
            h = this.cutSize.h + e.movementY
            y = this.cutPosition.y
          } else {
            h = this.cutSize.h - e.movementY
            y = this.cutPosition.y + e.movementY
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'bl') {
          let w, h, x, y
          if (this.cutSize.w > 0) {
            w = this.cutSize.w - e.movementX
            x = this.cutPosition.x + e.movementX
          } else {
            w = this.cutSize.w + e.movementX
            x = this.cutPosition.x
          }
          if (this.cutSize.h >= 0) {
            h = this.cutSize.h + e.movementY
            y = this.cutPosition.y
          } else {
            h = this.cutSize.h - e.movementY
            y = this.cutPosition.y + e.movementY
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'cr') {
          let w, x
          const h = this.cutSize.h,
            y = this.cutPosition.y
          if (this.cutSize.w > 0) {
            w = this.cutSize.w + e.movementX
            x = this.cutPosition.x
          } else {
            w = this.cutSize.w - e.movementX
            x = this.cutPosition.x + e.movementX
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else if (this.resizeType === 'cl') {
          let w, x
          const h = this.cutSize.h,
            y = this.cutPosition.y
          if (this.cutSize.w > 0) {
            w = this.cutSize.w - e.movementX
            x = this.cutPosition.x + e.movementX
          } else {
            w = this.cutSize.w + e.movementX
            x = this.cutPosition.x
          }
          this.computedCutSize(w, h)
          this.cutPosition = {
            x,
            y,
          }
        } else {
          this.cutVisible = true
          const tuiBox = document.querySelector('.tui-box')
          if (tuiBox === e.target && !init) {
            const boxWidth = tuiBox.clientWidth
            const boxHeight = tuiBox.clientHeight
            const topBorder = (boxHeight - this.viewSize.h) / 2
            const bottomBorder = topBorder + this.viewSize.h
            const leftBorder = (boxWidth - this.viewSize.w) / 2
            const rightBorder = leftBorder + this.viewSize.w
            this.computedCutSize(
              e.offsetX - this.cutPosition.x - leftBorder,
              e.offsetY - this.cutPosition.y - topBorder
            )
          } else {
            // 计算裁剪区域
            this.computedCutSize(e.offsetX - this.cutPosition.x, e.offsetY - this.cutPosition.y)
          }
        }
        this.$nextTick(() => {
          //绘制遮罩
          this.drawMask()
          //绘制空白
          this.drawBlank()
          this.$emit('changeCutSize', this.cutInfo)
        })
      },
      computedCutSize(w, h) {
        if (this.ratioOfWidthAndHeight) {
          const [wRatio, hRatio] = this.ratioOfWidthAndHeight.split(':')
          const r = wRatio / hRatio
          let tempW, tempH
          if (r >= 1) {
            tempW = w
            tempH = w / r
            if (Math.abs(tempH) >= this.viewSize.h) {
              tempH = this.viewSize.h
              tempW = r * tempH
            }
          } else {
            tempW = h * r
            tempH = h
            if (Math.abs(tempW) >= this.viewSize.w) {
              tempW = this.viewSize.w
              tempH = r * tempH
            }
          }
          this.cutSize = {
            w: tempW,
            h: tempH,
          }
        } else {
          this.cutSize = {
            w,
            h,
          }
        }
      },
      getCutPositionX(e) {
        console.log('getCutPositionX')
        if (this.cutSize.w > 0) {
          let x = this.cutPosition.x - (this.dragAnchor.x - e.offsetX)
          if (x < 0) {
            x = 0
          } else if (x + this.cutSize.w > this.viewSize.w) {
            x = this.viewSize.w - this.cutSize.w
          }
          console.log('x:', x)
          return x
        } else {
          let x = this.cutPosition.x + this.cutSize.w - (this.dragAnchor.x - e.offsetX)
          if (x < 0) {
            x = Math.abs(this.cutSize.w)
          } else if (x + Math.abs(this.cutSize.w) > this.viewSize.w) {
            x = this.viewSize.w
          } else {
            x = this.cutPosition.x - (this.dragAnchor.x - e.offsetX)
          }
          console.log('x:', x)
          return x
        }
      },
      getCutPositionY(e) {
        console.log('getCutPositionY')
        if (this.cutSize.h > 0) {
          let y = this.cutPosition.y - (this.dragAnchor.y - e.offsetY)
          if (y < 0) {
            y = 0
          } else if (y + this.cutSize.h > this.viewSize.h) {
            y = this.viewSize.h - this.cutSize.h
          }
          console.log('y:', y)
          return y
        } else {
          let y = this.cutPosition.y + this.cutSize.h - (this.dragAnchor.y - e.offsetY)
          if (y < 0) {
            y = Math.abs(this.cutSize.h)
          } else if (y + Math.abs(this.cutSize.h) > this.viewSize.h) {
            y = this.viewSize.h
          } else {
            y = this.cutPosition.y - (this.dragAnchor.y - e.offsetY)
          }
          console.log('y:', y)
          return y
        }
      },
      drawBlank() {
        const canvas = this.$refs.canvasSelectBox
        const ctx = canvas.getContext('2d')
        ctx.clearRect(this.cutInfo.x, this.cutInfo.y, this.cutInfo.w, this.cutInfo.h)
      },
      clearMask() {
        const canvas = this.$refs.canvasSelectBox
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      },
      drawMask() {
        const canvas = this.$refs.canvasSelectBox
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      },
      handelViewMouseDown(e) {
        e.stopPropagation()
        //开启拖拽锁
        this.dragLock = true
        this.dragAnchor = {
          x: e.offsetX,
          y: e.offsetY,
        }
      },
      handelViewMouseUp(e) {
        e.stopPropagation()
        this.dragLock = false
      },
      handelViewMove(e) {
        if (!this.dragLock) {
          return
        }
        e.stopPropagation()
        this.cutPosition = {
          x: this.getCutPositionX(e),
          y: this.getCutPositionY(e),
        }
        this.$nextTick(() => {
          //绘制遮罩
          this.drawMask()
          //绘制空白
          this.drawBlank()
        })
      },
      handelViewLeave(e) {
        e.stopPropagation()
        this.dragLock = false
      },
      cancelDraw() {
        this.initCut()
        this.$emit('onCancelCrop')
      },
      initCut() {
        this.clearMask()
        // 初始化
        this.cutPosition = {
          x: 0,
          y: 0,
        }
        this.cutSize = {
          w: 0,
          h: 0,
        }
        this.dragAnchor = {
          w: 0,
          h: 0,
        }
        this.drawLock = false
        this.dragLock = false
        this.confirmVisible = false
        this.cutVisible = false
      },
      confirmDraw() {
        this.$emit('onCrop', { ...this.cutInfo })
        this.initCut()
      },
      handleResizeCut(e, type) {
        e.stopPropagation()
        this.resizeType = type
        //开启拖拽锁
        this.resizeLock = true
        // 隐藏操作框
        this.confirmVisible = false
        let x = e.offsetX
        let y = e.offsetY
        const toolBox = this.$refs.toolBox
        let target = e.target
        while (target !== toolBox) {
          x += target.offsetLeft || 0
          y += target.offsetTop || 0
          target = target.parentNode
        }
        this.dragAnchor = {
          x,
          y,
        }
      },
    },
  }
</script>
<style scoped lang="less">
  .confirmBox {
    position: absolute;
    right: 0;
    bottom: -23px;
    left: 0;
    z-index: 105;
    justify-content: center;
    min-width: 50px;
    margin: auto;
    color: white;
    text-align: center;

    &.txt-move-top {
      bottom: 0;
    }

    div {
      cursor: pointer;
    }
  }

  .vue-img-cutter {
    font-size: 12px;
    line-height: 130%;
  }

  .fl {
    float: left;
  }

  .fr {
    float: right;
  }

  .i-dialog-footer {
    display: block;
    width: 100%;
    margin-top: 15px;
    margin-bottom: 15px;
    text-align: left;
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    background: rgba(0, 0, 0, 0.6);
  }

  .dialogBox {
    clear: both;
  }

  .dialogBoxModal {
    position: relative;
    padding-top: 100px;
    padding-bottom: 100px;
    clear: both;
  }

  .dialogMainModal {
    position: absolute;
    top: 100px;
    left: 50%;
    z-index: 1000;
    box-sizing: border-box;
    padding: 15px 15px 0 15px;
    margin-bottom: 100px;
    font-size: 16px;
    line-height: 125%;

    /* iOS Safari */
    -webkit-user-select: none;

    /* Chrome/Safari/Opera */
    -khtml-user-select: none;

    /* Konqueror */
    -moz-user-select: none;

    /* Firefox */
    -ms-user-select: none;

    /* Internet Explorer/Edge */
    user-select: none;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.8);
    border-radius: 3px;
    transform: translateX(-50%);

    /* Non-prefixed version, currently */
    animation: dialogShow 0.3s;
    -webkit-touch-callout: none;
  }

  .dialogMain {
    z-index: 1000;
    box-sizing: border-box;
    font-size: 16px;
    line-height: 125%;

    /* iOS Safari */
    -webkit-user-select: none;

    /* Chrome/Safari/Opera */
    -khtml-user-select: none;

    /* Konqueror */
    -moz-user-select: none;

    /* Firefox */
    -ms-user-select: none;

    /* Internet Explorer/Edge */
    user-select: none;
    background: #fff;
    -webkit-touch-callout: none;

    /* Non-prefixed version, currently */
  }

  @keyframes dialogShow {
    from {
      margin-top: -50px;
      opacity: 0;
    }

    to {
      margin-top: 0;
      opacity: 1;
    }
  }

  .toolMain {
    box-sizing: border-box;
  }

  .toolBox {
    position: relative;

    /* border: 1px solid #dedede; */

    /* background-image: linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.25) 25%,
        transparent 0,
        transparent 75%,
        rgba(0, 0, 0, 0.25) 0
      ),
      linear-gradient(45deg, rgba(0, 0, 0, 0.25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.25) 0); */

    /* background-color: #eee; */

    /* background-size: 30px 30px; */

    /* background-position: 0 0, 15px 15px; */
    user-select: none;
  }

  .tool-title {
    margin-bottom: 10px;
  }

  .canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 98;
  }

  .canvasSelectBox {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  @keyframes zi-antBorder {
    0% {
      background-position: 0 0;
    }

    50% {
      background-position: 0 5px;
    }

    100% {
      background-position: 0 10px;
    }
  }

  .toolBoxControl {
    position: absolute;
    z-index: 101;
    box-sizing: border-box;
    cursor: move;
    background: rgba(255, 255, 255, 0);
  }

  .toolBoxControlBox {
    position: relative;
    z-index: 103;
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .controlBoxInnerLine {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    background-image: linear-gradient(
      -45deg,
      rgba(64, 158, 255, 1) 25%,
      rgba(64, 158, 255, 0) 25%,
      rgba(64, 158, 255, 0) 50%,
      rgba(64, 158, 255, 1) 50%,
      rgba(64, 158, 255, 1) 75%,
      rgba(64, 158, 255, 0) 75%,
      rgba(64, 158, 255, 0)
    );
    background-size: 10px 10px;
    -ms-animation: zi-antborder 0.8s linear 0s infinite normal;
    -moz-animation: zi-antborder 0.8s linear 0s infinite normal;
    -webkit-animation: zi-antborder 0.8s linear 0s infinite normal;
    animation: zi-antBorder 0.8s linear 0s infinite normal;
  }

  .controlBoxInnerLineTop {
    top: -1px;
    width: 100%;
    height: 1px;
  }

  .controlBoxInnerLineBottom {
    bottom: -1px;
    width: 100%;
    height: 1px;
  }

  .controlBoxInnerLineLeft {
    top: 0;
    left: -1px;
    width: 1px;
    height: 100%;
  }

  .controlBoxInnerLineRight {
    top: 0;
    right: -1px;
    width: 1px;
    height: 100%;
  }

  .toolBoxControlLine {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    background: transparent;
  }

  .toolBoxControlLineItem-1 {
    top: 33%;
    box-sizing: border-box;
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #409eff;
  }

  .toolBoxControlLineItem-2 {
    top: 66%;
    box-sizing: border-box;
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #409eff;
  }

  .toolBoxControlLineItem-3 {
    left: 33%;
    box-sizing: border-box;
    width: 1px;
    height: 100%;
    border-right: 1px dashed #409eff;
  }

  .toolBoxControlLineItem-4 {
    left: 66%;
    box-sizing: border-box;
    width: 1px;
    height: 100%;
    border-right: 1px dashed #409eff;
  }

  .controlBox {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    cursor: move;
    user-select: none;
  }

  .controlBtn {
    position: absolute;
    z-index: 999;
    box-sizing: border-box;
    width: 12px;
    height: 12px;
    user-select: none;
    background: #409eff;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }

  .leftUp {
    top: 0;
    left: 0;
    margin-top: -6px;
    margin-left: -6px;
    cursor: nw-resize;
  }

  .leftDown {
    bottom: 0;
    left: 0;
    margin-bottom: -6px;
    margin-left: -6px;
    cursor: sw-resize;
  }

  .rightUp {
    top: 0;
    right: 0;
    margin-top: -6px;
    margin-right: -6px;
    cursor: ne-resize;
  }

  .rightDown {
    right: 0;
    bottom: 0;
    margin-right: -6px;
    margin-bottom: -6px;
    cursor: se-resize;
  }

  .topCenter {
    top: 0;
    right: 50%;
    margin-top: -6px;
    margin-right: -6px;
    cursor: n-resize;
  }

  .downCenter {
    right: 50%;
    bottom: 0;
    margin-right: -6px;
    margin-bottom: -6px;
    cursor: s-resize;
  }

  .leftCenter {
    top: 50%;
    left: 0;
    margin-top: -6px;
    margin-left: -6px;
    cursor: w-resize;
  }

  .rightCenter {
    top: 50%;
    right: 0;
    margin-top: -6px;
    margin-right: -6px;
    cursor: e-resize;
  }

  .toolBar {
    margin-top: 10px;
  }

  .selectArea {
    position: absolute;
    top: -20px;
    right: 0;
    display: block;
    width: 260px;
    font-size: 10px;
    color: #fff;
    text-align: right;
    user-select: none;

    &.txt-move-bottom {
      top: 0;
    }
  }

  .tips {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 101;
    color: red;
    transform: translate(-50%, -50%);
  }

  .btn {
    box-sizing: border-box;
    display: inline-block;
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    line-height: 40px;
    text-align: center;
    cursor: pointer;

    /* iOS Safari */
    -webkit-user-select: none;

    /* Chrome/Safari/Opera */
    -khtml-user-select: none;

    /* Konqueror */
    -moz-user-select: none;

    /* Firefox */
    -ms-user-select: none;

    /* Internet Explorer/Edge */
    user-select: none;
    background: #dedede;
    border: 1px solid;
    border-radius: 4px;
    transition: background 0.3s, color 0.3s;
    -webkit-touch-callout: none;

    /* Non-prefixed version, currently */
  }

  .btn[disabled] {
    color: #333;
    cursor: default;
    background-color: #fff !important;
    border-color: #dedede !important;
    opacity: 0.6;
  }

  .btn[disabled]:hover {
    color: #333 !important;
    background-color: #fff !important;
    border-color: #dedede !important;
    opacity: 0.6;
  }

  .btn-default {
    color: #333;
    background-color: #fff;
    border-color: #dcdfe6;
    transition: background 0.3s, color 0.3s;
  }

  .btn-default:hover {
    color: #409eff;
    background-color: #ecf5ff;
    border-color: #c6e2ff;
  }

  .btn-primary {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
    transition: background 0.3s, color 0.3s;
  }

  .btn-primary:hover {
    color: #fff;
    background: #66b1ff;
    border-color: #66b1ff;
  }

  .btn-warning {
    color: #fff;
    background-color: #e6a23c;
    border-color: #e6a23c;
  }

  .btn-warning:hover {
    color: #fff;
    background-color: #eeba6c;
    border-color: #e6a23c;
    transition: background 0.3s, color 0.3s;
  }

  .btn-primary-plain {
    color: #409eff;
    background-color: #ecf5ff;
    border-color: #c6e2ff;
    transition: background 0.3s, color 0.3s;
  }

  .btn-primary-plain:hover {
    color: #fff;
    background: #66b1ff;
    border-color: #66b1ff;
  }

  .btn-xs {
    height: 26px;
    padding: 0 10px;
    font-size: 12px;
    line-height: 26px;
  }

  .dialog-footer {
    float: right;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-in-enter {
    margin-top: -50px;
    opacity: 0;
    transition: margin-top 0.2s, opacity 0.2s;
  }

  .fade-out-enter {
    transition: margin-top 0.2s, opacity 0.2s;
  }

  .fade-in-active {
    transition: margin-top 0.2s, opacity 0.2s;
  }

  .fade-out-active {
    margin-top: -50px;
    opacity: 0;
    transition: margin-top 0.2s, opacity 0.2s;
  }

  .file-input {
    box-sizing: border-box;
    height: 40px;
    padding: 0 10px;
    line-height: 40px;
    border: 1px solid #dedede;
    border-radius: 4px;
  }

  .file-input::placeholder {
    color: #c0c4cc;
  }

  .toolbar-item {
    display: inline-block;
  }

  .closeIcon {
    display: block;
    float: right;
    width: 18px;
    height: 18px;
    padding: 0;
    margin: 0;
    line-height: 18px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    background: #c6e2ff;
    border-radius: 50%;
    transition: transform 0.3s, background 0.3s;

    /* transform: rotate(90deg); */
  }

  .closeIcon:hover {
    background: #409eff;
    transform: rotate(180deg);
  }

  .copyright {
    position: absolute !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 100 !important;
    display: block !important;
    width: 100% !important;
    clear: both !important;
    font-size: 10px !important;
    line-height: 100% !important;
    text-align: right !important;
    opacity: 0.5 !important;
  }

  .copyright a {
    position: relative !important;
    display: inline-block !important;
    padding: 2px !important;
    color: #fff !important;
    text-decoration: none !important;
    background: rgba(0, 0, 0, 0.4);
    opacity: 1 !important;
  }

  /* 工具栏 */
  .dockMain {
    position: absolute;
    bottom: 5px;
    left: 5px;
    z-index: 1002;

    /* width: 98%; */
    box-sizing: border-box;
    padding: 5px 5px;
    border-radius: 5px;

    /* transform: translateX(-50%); */
    opacity: 0.5;
    transition: opacity 0.5s;
  }

  .dockMain:hover {
    opacity: 1;
  }

  .dockBtn {
    display: inline-block;
    height: 20px;
    padding: 1px 4px;
    margin-right: 4px;
    font-size: 10px;
    line-height: 16px;
    color: #409eff;
    cursor: pointer;

    /* iOS Safari */
    -webkit-user-select: none;

    /* Chrome/Safari/Opera */
    -khtml-user-select: none;

    /* Konqueror */
    -moz-user-select: none;

    /* Firefox */
    -ms-user-select: none;

    /* Internet Explorer/Edge */
    user-select: none;
    background-color: #ecf5ff;
    border: 1px solid #c6e2ff;
    border-radius: 3px;
    transition: background 0.2s, color 0.2s;
    -webkit-touch-callout: none;

    /* Non-prefixed version, currently */
  }

  .dockBtn:hover {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
  }

  /* 旋转进度条 */
  .dockBtnScrollBar {
    position: relative;
    display: inline-block;
    width: 200px;
    height: 10px;
    margin-right: 4px;
    margin-left: 10px;

    /* iOS Safari */
    -webkit-user-select: none;

    /* Chrome/Safari/Opera */
    -khtml-user-select: none;

    /* Konqueror */
    -moz-user-select: none;

    /* Firefox */
    -ms-user-select: none;

    /* Internet Explorer/Edge */
    user-select: none;
    background: #409eff;
    border-radius: 5px;
    -webkit-touch-callout: none;

    /* Non-prefixed version, currently */
  }

  .scrollBarControl {
    position: absolute;
    top: 50%;
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    cursor: pointer;
    background: #fff;
    border: 2px solid #409eff;
    border-radius: 50%;
    box-shadow: 0 0 3px #1f5184;
    transform: translate(-50%, -50%);
  }

  .scrollBarText {
    position: absolute;
    top: -16px;
    height: 14px;
    padding: 2px;
    font-size: 10px;
    line-height: 14px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 3px;
    transform: translate(-50%, -50%);
  }

  .disabled-event {
    pointer-events: none;
  }

  .normal-event {
    pointer-events: default;
  }
</style>
