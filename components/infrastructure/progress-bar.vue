<template>
  <div class="progress-bar" :style="{ width: computedWidth, height: computedHeight }">
    <div class="progress-bar_progress" :style="{ width: computedProgress }">
      <div
        class="progress-bar_progress-bg"
        :style="{ width: computedWidth, height: computedHeight, transform: `scaleX(${100 / progress})` }"
      ></div>
    </div>
  </div>
</template>

<script>
  import { isNull } from '@/static/script/utils'
  import gsap from 'gsap'
  export default {
    name: 'ProgressBar',
    props: {
      width: {
        type: [String, Number],
        default: '100%',
      },
      height: {
        type: [String, Number],
        default: 12,
      },
      value: {
        type: Number,
        default: 0,
      },
      autoPlay: {
        type: Boolean,
        default: true,
      },
      duration: {
        type: Number,
        default: 3000,
      },
    },
    data() {
      return {
        progress: 0,
      }
    },
    computed: {
      computedProgress() {
        if (isNull(this.progress)) {
          return '100%'
        }
        if (Object.prototype.toString.call(this.progress).slice(8, -1) === 'String') {
          if (/^\d+$/.test(this.progress)) {
            return this.progress + '%'
          } else {
            return this.progress
          }
        } else if (Object.prototype.toString.call(this.progress).slice(8, -1) === 'Number') {
          return this.progress + '%'
        } else {
          return '100%'
        }
      },
      computedWidth() {
        if (isNull(this.width)) {
          return '100%'
        }
        if (Object.prototype.toString.call(this.width).slice(8, -1) === 'String') {
          if (/^\d+$/.test(this.width)) {
            return this.width + 'px'
          } else {
            return this.width
          }
        } else if (Object.prototype.toString.call(this.width).slice(8, -1) === 'Number') {
          return this.width + 'px'
        } else {
          return '100%'
        }
      },
      computedHeight() {
        if (isNull(this.height)) {
          return '12px'
        }
        if (Object.prototype.toString.call(this.height).slice(8, -1) === 'String') {
          if (/^\d+$/.test(this.height)) {
            return this.height + 'px'
          } else {
            return this.height
          }
        } else if (Object.prototype.toString.call(this.height).slice(8, -1) === 'Number') {
          return this.height + 'px'
        } else {
          return '12px'
        }
      },
    },
    watch: {
      progress(value) {
        this.$emit('change', value)
      },
    },
    mounted() {
      this.progress = this.value
      if (this.autoPlay) {
        this.handleAutoPlay()
      }
    },
    methods: {
      handleAutoPlay() {
        if (this.progress < 100) {
          gsap.to(this.$data, {
            ease: 'none',
            progress: 100,
            duration: this.duration / 1000, // 使用秒作为持续时间单位
            onUpdate: () => {
              // 更新进度条
              this.progress = parseInt(this.$data.progress.toFixed(0))
            },
            onComplete: () => {
              this.$emit('finished')
            },
          })
        }
      },
    },
  }
</script>

<style scoped lang="less">
  .progress-bar {
    position: relative;
    overflow: hidden;
    background: #ebf0f5;
    border-radius: 6px;
  }

  .progress-bar_progress,
  .progress-bar_progress-bg {
    width: 100%;
    height: 100%;
  }

  .progress-bar_progress {
    position: relative;
    overflow: hidden;
  }

  .progress-bar_progress-bg {
    background: linear-gradient(90deg, #ff4848, #ffc742);
    box-shadow: 0 8px 16px 0 rgba(205, 0, 0, 0.2), 0 0 5px 0 #fff;
    transform-origin: 0 0;
  }
</style>
