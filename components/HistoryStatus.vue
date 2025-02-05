<template>
  <div class="loading-container" :class="`task${item.transId}`">
    <div v-if="item.processStatus === 'progress' || waitQueue" class="progress mask">
      <div class="img-container">
        <img width="22" height="22" :src="$imgPath('/common/icon_loading.png')" alt />
      </div>
      <div v-html="$t('workspace.history_status_processing')"></div>
    </div>

    <div v-if="item.processStatus === 'fail'" class="fail mask">
      <div class="status-container">
        <i class="iconfont-single icon-s-precess-fail"></i>
      </div>
      <div v-html="$t('workspace.history_status_failed')"></div>
    </div>

    <div v-if="showQueue" class="queue mask">
      <div class="status-container">
        <span>{{ item.busyJobs }}</span>
      </div>
      <div v-html="$t('workspace.history_status_in_queue')"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Loading',
    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },
    computed: {
      isDevelopedCountryFlag() {
        if (this.$getCookie('developed_country')) {
          return this.$getCookie('developed_country') === '1'
        }
        return this.$store.state.isDevelopedCountry
      },
      showQueue() {
        const isBusy = this.item.processStatus === 'busy'
        const process_time = parseInt(this.item.process_time || 0)
        const matchProgressCount = this.isDevelopedCountryFlag ? process_time >= 60 : process_time >= 15
        return isBusy && matchProgressCount
      },
      waitQueue() {
        const isBusy = this.item.processStatus === 'busy'
        return isBusy && !this.showQueue
      },
    },
    methods: {},
  }
</script>

<style lang="less" scoped>
  .loading-container {
    position: absolute;
    width: 100%;
    height: 100%;
    font-size: 14px;
    line-height: 20px;
    color: #fff;
    text-align: center;

    .mask {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.55);

      &.fail {
        color: #ff2929;

        i {
          font-size: 22px;
          color: #ff2929;
        }
      }

      &.queue {
        span {
          font-size: 18px;
          font-weight: bold;
          color: #ff9d1d;
        }
      }
    }

    .img-container {
      margin-top: 10 / @base;
      margin-bottom: 8 / @base;

      img {
        animation: rotate 2s linear infinite;
      }
    }

    .status-container {
      margin-top: 2 / @base;
      margin-bottom: 4 / @base;
    }
  }
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
