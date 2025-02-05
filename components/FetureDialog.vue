<template>
  <div class="feature-dialog mask" v-show="visible">
    <div class="dialog-container">
      <div class="dialog-header">
        <slot name="title">
          <img class="bgi" :src="bgi" />
        </slot>
        <span class="new-feature-lable">{{ $t('common.newfeature') }}</span>
        <div class="dialog-close" @click="close">
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div class="dialog-content">
        <slot>
          <p class="dialog-content-title quicksand-bold">{{ featureTitle }}</p>
          <p class="dialog-content-text">{{ featureText }}</p>
        </slot>
      </div>
      <div class="dialog-footer">
        <slot name="footer">
          <button class="btn close-btn" @click="closeCallback">
            {{ closeText || $t('common.close') }}
          </button>
          <button class="btn confirm-btn" @click="confirmCallback">
            {{ confirmText || $t('common.alert_ok') }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FetureDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      bgi: {
        type: String,
        default: '',
      },
      featureTitle: {
        type: String,
        default: '',
      },
      featureText: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: '',
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
      closeText: {
        type: String,
        default: '',
      },
      closeCallback: {
        type: Function,
        default: () => {},
      },
    },
    data() {
      return {}
    },
    methods: {
      close() {
        this.$emit('update:visible', false)
        this.closeCallback()
      },
    },
  }
</script>

<style scoped lang="less">
  .feature-dialog.mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);

    .dialog-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 570px;
      min-height: 200px;
      background: #fff;

      .dialog-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .bgi {
          width: 100%;
        }

        .dialog-close {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 150%;
        }

        .new-feature-lable {
          position: absolute;
          top: 30px;
          left: 0;
          padding: 3px 15px;
          font-size: 14px;
          color: #fff;
          background: #007caf;
          border-radius: 0 20px 20px 0;
        }
      }

      .dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .dialog-content-title {
          font-size: 20 / @base;
          color: #4d4d4f;
          text-align: center;
        }

        .dialog-content-text {
          font-size: 16 / @base;
          color: #4d4d4f;
          text-align: center;
        }
      }

      .dialog-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin: 15px 0 10px 0;

        > :first-child {
          margin-right: 20px;
        }

        .btn {
          min-width: 100px;
          padding: 5px 10px;
          background: #fff;
          border: 1px solid #efefef;
        }

        .confirm-btn {
          color: #fff;
          background: #e6a23c;
          border: 1px solid #e6a23c;
        }
      }
    }
  }
</style>
