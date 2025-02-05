<template>
  <div class="loadingBox">
    <div class="loading" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.1)"></div>
  </div>
</template>

<script>
  export default {
    name: 'Loading',
    data() {
      return {
        loading: true,
      }
    },
  }
</script>
<style lang="less">
  .loadingBox {
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 200000;
      width: 148px;
      height: 148px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 5px;
      transform: translate(-50%, -50%);

      /deep/ .el-loading-mask {
        border-radius: 5px;

        .el-loading-spinner {
          .circular {
            width: 48px;
            height: 48px;
          }

          .path {
            stroke: #fff;
            stroke-width: 4px;
          }
        }
      }
    }
  }
</style>
