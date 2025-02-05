<template>
  <div class="my_a-dialog mask" v-show="visible">
    <div class="my_a-dialog-container">
      <div class="my_a-close" v-if="showClose && closeBtnShow" @click="closeDialog">
        <i class="el-icon-close"></i>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AdDialog',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      showClose: {
        type: Boolean,
        default: true,
      },
      closeDelay: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        closeBtnShow: false,
      }
    },
    mounted() {
      setTimeout(() => {
        this.closeBtnShow = true
      }, this.closeDelay)
    },
    methods: {
      closeDialog() {
        this.$emit('update:visible', false)
      },
    },
  }
</script>

<style scoped lang="less">
  .my_a-dialog.mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);

    .my_a-dialog-container {
      position: relative;

      .my_a-close {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 99;
        cursor: pointer;
      }
    }

    .el-icon-close::before {
      font-size: 25px;
    }
  }

  @media (max-width: 1024px) {
    .my_a-dialog.mask {
      .my_a-dialog-container {
        .my_a-close {
          .el-icon-close::before {
            font-size: 40px;
          }
        }
      }
    }
  }

  @media (max-width: 414px) {
    .my_a-dialog.mask {
      .my_a-dialog-container {
        .my_a-close {
          .el-icon-close::before {
            font-size: 20px;
          }
        }
      }
    }
  }
</style>
