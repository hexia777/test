<template>
  <div class="vc-alpha">
    <div class="vc-alpha-checkboard-wrap">
      <checkboard />
    </div>
    <div class="vc-alpha-gradient" :style="{ background: gradientColor }"></div>
    <div
      class="vc-alpha-container"
      ref="container"
      @mousedown="handleMouseDown"
      @touchmove="handleChange"
      @touchstart="handleChange"
    >
      <div class="vc-alpha-pointer" :style="{ left: colors.a * 100 + '%' }">
        <div class="vc-alpha-picker"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import checkboard from './Checkboard.vue'

  export default {
    name: 'Alpha',
    components: {
      checkboard,
    },
    props: {
      value: Object,
      onChange: Function,
    },
    computed: {
      colors() {
        return this.value
      },
      gradientColor() {
        const rgba = this.colors.rgba
        const rgbStr = [rgba.r, rgba.g, rgba.b].join(',')
        return 'linear-gradient(to right, rgba(' + rgbStr + ', 0) 0%, rgba(' + rgbStr + ', 1) 100%)'
      },
    },
    methods: {
      handleChange(e, skip) {
        !skip && e.preventDefault()
        const container = this.$refs.container
        if (!container) {
          // for some edge cases, container may not exist. see #220
          return
        }
        const containerWidth = container.clientWidth

        const xOffset = container.getBoundingClientRect().left + window.pageXOffset
        const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0)
        const left = pageX - xOffset

        let a
        if (left < 0) {
          a = 0
        } else if (left > containerWidth) {
          a = 1
        } else {
          a = Math.round((left * 100) / containerWidth) / 100
        }

        if (this.colors.a !== a) {
          this.$emit('change', {
            h: this.colors.hsl.h,
            s: this.colors.hsl.s,
            l: this.colors.hsl.l,
            a,
            source: 'rgba',
          })
        }
      },
      handleMouseDown(e) {
        this.handleChange(e, true)
        window.addEventListener('mousemove', this.handleChange)
        window.addEventListener('mouseup', this.handleMouseUp)
      },
      handleMouseUp() {
        this.unbindEventListeners()
      },
      unbindEventListeners() {
        window.removeEventListener('mousemove', this.handleChange)
        window.removeEventListener('mouseup', this.handleMouseUp)
      },
    },
  }
</script>

<style>
  .vc-alpha {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .vc-alpha-checkboard-wrap {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
  }

  .vc-alpha-gradient {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .vc-alpha-container {
    position: relative;
    z-index: 2;
    height: 100%;
    margin: 0 3px;
    cursor: pointer;
  }

  .vc-alpha-pointer {
    position: absolute;
    z-index: 2;
  }

  .vc-alpha-picker {
    width: 4px;
    height: 8px;
    margin-top: 1px;
    cursor: pointer;
    background: #fff;
    border-radius: 1px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
    transform: translateX(-2px);
  }
</style>
