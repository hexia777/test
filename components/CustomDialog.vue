<template>
  <div class="feature-dialog mask" :class="{ 'hide-mask': hideMask }" v-show="visible">
    <div
      class="dialog-container scroll-bar"
      :style="{
        width: width ? (isSetWidth ? width : `${width}px`) : null,
        height: height ? `${height}px` : null,
      }"
    >
      <div class="dialog-close">
        <i class="el-icon-close" v-show="showClose" @click="close"></i>
      </div>
      <div class="dialog-header" v-if="showHeader" :style="{ borderWidth: titleBorder ? '1px' : '0' }">
        <slot name="title">
          <p class="dialog-title quicksand-bold">{{ title }}</p>
        </slot>
      </div>
      <div class="dialog-content">
        <slot></slot>
      </div>
      <div class="dialog-footer" v-if="showFooter" :class="footerClassName">
        <slot name="footer">
          <button v-show="showClose" class="btn close-btn" @click="closeCallback">
            {{ closeText || $t('workspace.feature-close-btn') }}
          </button>
          <button v-show="showConfirm" class="btn confirm-btn" @click="confirmCallback">
            {{ confirmText || $t('workspace.feature-confirm-btn') }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CustomDialog',
    props: {
      hideMask: {
        type: Boolean,
        default: false,
      },
      visible: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '',
      },
      titleBorder: {
        type: Boolean,
        default: true,
      },
      showConfirm: {
        type: Boolean,
        default: true,
      },
      confirmText: {
        type: String,
        default: '',
      },
      confirmCallback: {
        type: Function,
        default: () => {},
      },
      showClose: {
        type: Boolean,
        default: true,
      },
      showHeader: {
        type: Boolean,
        default: true,
      },
      showFooter: {
        type: Boolean,
        default: true,
      },
      closeText: {
        type: String,
        default: '',
      },
      closeCallback: {
        type: Function,
        default: () => {
          this.close()
        },
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
      footerClassName: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        closeT: this.$t('workspace.feature-close-btn'),
        confirmT: this.$t('workspace.feature-confirm-btn'),
      }
    },
    methods: {
      close() {
        this.$emit('close')
        this.$emit('update:visible', false)
      },
    },
  }
</script>

<style scoped lang="less">
  .feature-dialog.mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);

    &.hide-mask {
      background: none;

      .dialog-container {
        box-shadow: 10px 10px 20px #888;
      }
    }
  }

  .dialog-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 570px;
    min-height: 200px;
    max-height: 100%;
    overflow-y: auto;
    background: #fff;
  }

  .dialog-close {
    cursor: pointer;

    &:hover {
      /deep/ .el-icon-close {
        color: #999;
      }
    }
  }

  .dialog-content {
    width: 100%;
    height: 100%;
    padding: 10 / @base;
    overflow: hidden;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 5 / @base 15 / @base 15 / @base;
    border: 1px solid #efefef;

    .dialog-title {
      font-size: 20px;
      color: #4d4d4f;
    }
  }

  .dialog-close {
    position: absolute;
    top: 5px;
    right: 8px;
    z-index: 29;
    font-size: 150%;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 10 / @base 20 / @base;
    background: #fafafa;

    .btn {
      min-width: 130px;
      padding: 0 10 / @base;
      margin-left: 10 / @base;
      line-height: 35 / @base;
      text-align: center;
      background: #fff;
      border: 2px solid #efefef;
      border-radius: 10 / @base;

      &:first-child {
        margin-left: 0;
      }
    }

    .confirm-btn {
      color: #fff;
      background: #e6a23c;
      border: 1px solid #e6a23c;
    }

    .close-btn {
      color: #454545;
    }
  }

  .models-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    justify-content: center;

    .btn {
      min-height: 40px;
      padding: 4 / @base 10 / @base;
    }

    .confirm-btn {
      font-size: 16px;
      font-weight: bold;
      // line-height: 24px;
      color: #232323;
      background: #ff9d1d;
      border-radius: 4px;
    }

    .close-btn {
      font-size: 16px;
      font-weight: bold;
      // line-height: 24px;
      color: #232323;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }
</style>
