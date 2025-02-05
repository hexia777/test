<template>
  <div class="loadingBox" v-show="loadingShow">
    <div class="loadingTips">
      <i class="el-icon-close" @click="loadingShowClose"></i>
      <div
        class="loadingAll"
        v-loading="maxLoading"
        element-loading-background="rgba(255, 255, 255, 0)"
      ></div>
      <div class="tipsTest">{{ $t('common.downloading_tip_1') }} ({{ current }}/{{ total }})</div>
      <div class="tipsTest" v-html="$t('common.downloading_tip_2')"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LoadingAll',
    props: {
      current: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {
        maxLoading: true,
        loadingShow: true,
      }
    },
    methods: {
      loadingShowClose() {
        this.loadingShow = false
      },
    },
  }
</script>
<style lang="less">
  .loadingBox {
    .loadingTips {
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 99;
      width: 550px;
      height: auto;
      padding: 20px 15px;
      text-align: center;
      background: #fff;
      border: 1px solid #d7d7d7;
      border-radius: 5px;
      transform: translate(-50%, -50%);

      .el-icon-close {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
      }

      .loadingAll {
        position: relative;
        z-index: 99;
        width: 80px;
        height: 80px;
        margin: 0 auto;
        margin-bottom: 10px;
        background: none;
        border-radius: 5px;

        /deep/ .el-loading-mask {
          border-radius: 5px;

          .el-loading-spinner {
            .circular {
              width: 48px;
              height: 48px;
            }

            .path {
              stroke: #333;
              stroke-width: 4px;
            }
          }
        }
      }

      .cancel {
        margin: 15px 0;
        color: #169bd8;
        cursor: pointer;
      }
    }
  }

  @media (max-width: 1040px) {
    .loadingBox {
      .loadingTips {
        width: 80%;
      }
    }
  }
</style>
