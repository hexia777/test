<template>
  <div
    class="vc-saturation"
    :style="{ background: bgColor }"
    ref="container"
    @mousedown="handleMouseDown"
    @touchmove="handleChange"
    @touchstart="handleChange"
  >
    <div class="vc-saturation--white"></div>
    <div class="vc-saturation--black"></div>
    <div class="vc-saturation-pointer" :style="{ top: pointerTop, left: pointerLeft }">
      <div class="vc-saturation-circle"></div>
    </div>
  </div>
</template>

<script>
  import clamp from 'clamp'
  import throttle from 'lodash.throttle'

  export default {
    name: 'Saturation',
    props: {
      value: Object,
    },
    computed: {
      colors() {
        return this.value
      },
      bgColor() {
        return `hsl(${this.colors.hsv.h}, 100%, 50%)`
      },
      pointerTop() {
        return -(this.colors.hsv.v * 100) + 1 + 100 + '%'
      },
      pointerLeft() {
        return this.colors.hsv.s * 100 + '%'
      },
    },
    methods: {
      throttle: throttle(
        (fn, data) => {
          fn(data)
        },
        20,
        {
          leading: true,
          trailing: false,
        }
      ),
      handleChange(e, skip) {
        !skip && e.preventDefault()
        const container = this.$refs.container
        if (!container) {
          // for some edge cases, container may not exist. see #220
          return
        }
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight

        const xOffset = container.getBoundingClientRect().left + window.pageXOffset
        const yOffset = container.getBoundingClientRect().top + window.pageYOffset
        const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0)
        const pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0)
        const left = clamp(pageX - xOffset, 0, containerWidth)
        const top = clamp(pageY - yOffset, 0, containerHeight)
        const saturation = left / containerWidth
        const bright = clamp(-(top / containerHeight) + 1, 0, 1)

        this.throttle(this.onChange, {
          h: this.colors.hsv.h,
          s: saturation,
          v: bright,
          a: this.colors.hsv.a,
          source: 'hsva',
        })
      },
      onChange(param) {
        this.$emit('change', param)
      },
      handleMouseDown(e) {
        // this.handleChange(e, true)
        window.addEventListener('mousemove', this.handleChange)
        window.addEventListener('mouseup', this.handleChange)
        window.addEventListener('mouseup', this.handleMouseUp)
      },
      handleMouseUp(e) {
        this.unbindEventListeners()
      },
      unbindEventListeners() {
        window.removeEventListener('mousemove', this.handleChange)
        window.removeEventListener('mouseup', this.handleChange)
        window.removeEventListener('mouseup', this.handleMouseUp)
      },
    },
  }
</script>

<style>
  .vc-saturation,
  .vc-saturation--white,
  .vc-saturation--black {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    cursor: pointer;
  }

  .vc-saturation--white {
    background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
  }

  .vc-saturation--black {
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
  }

  .vc-saturation-pointer {
    position: absolute;
    cursor: pointer;
  }

  .vc-saturation-circle {
    width: 4px;
    height: 4px;
    cursor: head;
    border-radius: 50%;
    box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0, 0, 0, 0.3), 0 0 1px 2px rgba(0, 0, 0, 0.4);
    transform: translate(-2px, -2px);
  }
</style>
