<template>
  <div class="confirm_dialog mask base" v-if="show">
    <div class="con-login">
      <div class="container">
        <template v-if="show">
          <div class="box">
            <div class="top">
              <div v-html="titleText" class="title"></div>
            </div>
            <div class="bot">
              <el-button class="cancel" v-show="showCancel" round @click="cancel">{{ cancelText }}</el-button>
              <el-button class="yes" v-loading="confirmLoading" type="primary" round @click="confirm">
                {{ yesText }}
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      show: { type: Boolean, default: true },
      titleText: { type: String, default: '' },
      cancelText: { type: String, default: '' },
      yesText: { type: String, default: '' },
      showCancel: { type: Boolean, default: true },
      confirmLoading: { type: Boolean, default: false },
    },
    methods: {
      close() {
        this.show = false
      },
      confirm() {
        this.$emit('confirm')
      },
      cancel() {
        this.$emit('cancel')
      },
    },
  }
</script>

<style lang="less" scoped>
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);

    .con-login {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }

    .con-login .box {
      position: relative;
      width: 530 / @base;
      max-width: initial;
      min-height: 201 / @base;
      overflow-y: auto;
      background: #fff;
      border-radius: 2px;
      box-shadow: 0 2rem 4rem 0 rgba(6, 7, 50, 0.24);
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 125px;
      border-bottom: 1px solid rgb(242, 242, 242);

      .title {
        margin: 0 1rem;
        font-size: 18px;
        color: rgb(79, 103, 133);
        text-align: center;
      }
    }
  }

  /deep/ .bot {
    display: flex;
    justify-content: flex-end;
    padding: 16 / @base;
    padding-left: 0;

    .el-button {
      width: 136 / @base;
      height: 40 / @base;
      padding: 0;
      margin: 0;
      margin-left: 20px;
      border: 0 none;
    }

    .cancel {
      border: 1px solid rgb(230, 230, 230);

      &:hover {
        color: #4d4d4f;
        background: #fff;
        border-color: #4d4d4f;
      }
    }

    .yes {
      background-color: #ff9d1d;

      &:hover {
        background-color: #ffb85d;
      }
    }
  }

  @media (max-width: 1024px) {
    .mask .con-login {
      padding-top: 0;

      .box {
        padding: 0;
      }
    }
  }

  @media (max-width: 640px) {
    .mask .con-login .container .box {
      width: 90vw;
      height: 13.5625rem;
    }
  }
</style>
<style lang="less">
  .confirm_dialog {
    .el-loading-mask {
      background: #ffb048;
    }

    .el-loading-spinner .path {
      stroke: rgba(255, 255, 255, 0.5);
    }
  }
</style>
