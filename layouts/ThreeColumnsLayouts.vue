<template>
  <div class="three-columns-layouts" :style="computedHeight">
    <div class="t" v-if="th" :style="{ height: th + 'px' }">
      <slot name="t"></slot>
    </div>
    <div class="layouts-main">
      <div class="l" :style="{ width: lw + 'px' }">
        <slot name="l"></slot>
      </div>
      <div class="c" :style="{ width: `calc(100vw - ${lw + rw}px)`, height: `calc(100% - ${subtract})` }">
        <slot></slot>
      </div>
      <div class="r" :style="{ width: rw + 'px' }">
        <slot name="r"></slot>
      </div>
    </div>
    <div class="b" v-if="bh" :style="{ height: bh + 'px' }">
      <slot name="b"></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ThreeColumnsLayouts',
    props: {
      lw: { type: Number, default: 140 },
      rw: { type: Number, default: 375 },
      th: { type: Number, default: 0 },
      bh: { type: Number, default: 0 },
    },
    computed: {
      subtract() {
        return this.th + this.bh
      },
      computedHeight() {
        let isMicroApp = false
        if (process.browser && window.__MICRO_APP_ENVIRONMENT__) {
          isMicroApp = true
        }
        return {
          height: isMicroApp ? 'calc(100vh - 64px)' : '100vh',
        }
      },
    },
  }
</script>

<style lang="less">
  .three-columns-layouts {
    display: flex;
    width: 100%;
    //height: calc(100vh - 64px);
    overflow: hidden;

    .t {
      width: 100%;
      height: 64 / @base;
    }

    .layouts-main {
      display: flex;
      width: 100%;
      height: 100%;

      .l {
        width: 140 / @base;
        height: 100%;
      }

      .r {
        width: 375 / @base;
        height: 100%;
      }

      .c {
        flex: 1;
        width: 100%;
        height: 100%;
      }
    }

    .b {
      width: 100%;
      height: 64 / @base;
    }
  }
</style>
