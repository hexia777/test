<template>
  <div class="dialog-mask drag" :style="{ 'z-index': zIndex }" v-show="visible">
    <div class="dialog-container">
      <div class="box">
        <slot name="title">
          <div class="dialog-close" v-show="exitshow" @click="hide">
            <i class="el-icon-close"></i>
          </div>
          <div class="quicksand text" :class="{ tc: txtCenter }" v-html="title"></div>
        </slot>

        <slot></slot>

        <div class="dialog-btn-box" :style="!$slots.footer ? 'display: none;' : 'display: flex;'">
          <slot name="footer">
            <!-- TODO -->
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      visible: { type: Boolean, default: false, required: true },
      title: { type: String, default: '' },
      exitshow: { type: Boolean, default: true },
      //头部文本居中
      txtCenter: { type: Boolean, default: false },
      //弹窗层级
      zIndex: {
        type: String,
        default: '101',
      },
    },
    methods: {
      hide() {
        this.$emit('update:visible', false)
        this.$emit('close')
      },
    },
  }
</script>

<style lang="less">
  .dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 101;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);

    .dialog-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }

    .text {
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: 800;
      color: #364255;
      text-align: left;

      &.tc {
        text-align: center;
      }
    }

    .dialog-btn-box {
      display: flex;
      justify-content: flex-end;
      margin-top: 80px;

      .el-button {
        width: 130px;
        height: auto;
        margin-left: 20px;
        font-size: 1rem;
        border-radius: 2px;
      }
    }

    .box {
      position: relative;
      width: auto;
      padding: 20px;
      padding-top: 10px;
      background: #fff;
      border-radius: 2px;
      box-shadow: 0 1rem 2rem 0 rgba(6, 7, 50, 0.24);

      .dialog-close {
        position: absolute;
        top: 0.95rem;
        right: 0.95rem;
        z-index: 3;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
      }
    }
  }

  @media (max-width: 1024px) {
    .dialog-mask.paddle-box .dialog-container {
      .box {
        overflow: auto;
        overflow-y: scroll;
      }
    }

    .dialog-mask .dialog-container {
      padding-top: 0;

      .box {
        max-width: 95%;
        max-height: 80vh;
        margin: 0 auto;
        overflow: scroll;
      }
    }
  }

  @media (max-width: 768px) {
    .dialog-mask .dialog-container {
      padding-top: 0;
    }
  }

  @media (max-width: 640px) {
    .dialog-mask .dialog-container .container .box {
      width: auto;
      height: auto;
    }
  }
</style>
