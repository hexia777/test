<!-- 图片裁剪 -->
<template>
  <div class="feature-dialog mask" :class="{ 'hide-mask': hideMask }" v-show="visible">
    <div class="dialog-container">
      <div class="dialog-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ImageCrop',
    props: {
      hideMask: {
        type: Boolean,
        default: false,
      },
      visible: {
        type: Boolean,
        default: false,
      },
      width: {
        type: [Number, String],
        default: 570,
      },
      isSetWidth: {
        type: Boolean,
        default: false,
      },
      height: {
        type: [Number, String],
        default: 0,
      },
    },
    data() {
      // 1
      return {
        closeT: this.$t('workspace.feature-close-btn'),
        confirmT: this.$t('workspace.feature-confirm-btn'),
      }
    },
    methods: {
      // close() {
      //   this.$emit('close')
      //   this.$emit('update:visible', false)
      // },
    },
  }
</script>

<style scoped lang="less">
  .feature-dialog.mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    padding: 40 / @base;
    background: rgba(0, 0, 0, 0.7);

    &.hide-mask {
      background: none;

      // .dialog-container {
      //   box-shadow: 10px 10px 20px #888;
      // }
    }

    .dialog-container {
      // position: relative;
      // display: flex;
      // flex-direction: column;
      // align-items: center;
      // width: 570px;
      width: 100%;
      height: 100%;
      // min-height: 200px;
      // overflow: hidden;
      // background: #fff;

      .dialog-content {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
