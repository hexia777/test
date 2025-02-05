<template>
  <div class="single-queue-tip">
    <div class="tip">
      <p class="flex">
        <i class="iconfont-single icon-s-queue"></i>
        <span v-html="text1"></span>
      </p>
      <div class="loading-container" v-if="!isPaied || (isPaied && busyJobs < 5)">
        <div class="background-container" :class="!isPaied ? 'free' : ''">
          <!-- 拼接两个loading达到预设长度 -->
          <div class="loading-image-container">
            <img :src="$imgPath('/common/loading.png')" alt />
            <img :src="$imgPath('/common/loading.png')" alt />
          </div>
        </div>
      </div>
      <!-- Case 1 付费用户: 当排队数量少于5个时(用户稍等一会就可以进入处理阶段) -->
      <div v-if="isPaied && busyJobs < 5">
        <p class="m-t-8" v-html="text2"></p>
        <p class="m-t-8" v-html="text3"></p>
      </div>
      <!-- Case 2 付费用户：当排队数量超出5个时(用户需要等很久才进入处理阶段) -->
      <div v-if="isPaied && busyJobs > 4" class="m-t-24">
        <p class="m-t-8" v-html="text2_2"></p>
        <p class="m-t-8" v-html="text2_3"></p>
        <slot></slot>
      </div>
      <!-- Case 4: 免费用户排队展示 -->
      <div v-show="!isPaied">
        <p class="m-t-8" v-html="text2Free"></p>
        <p class="m-t-8" v-html="text3Free"></p>
        <div class="btn-container">
          <a
            target="_blank"
            class="btn-main upgrade-btn"
            :href="`${domain}${$t('common.common_nav_link_2')}?source=workspace_${source}&medium=job_queue`"
          >
            {{ $t('workspace.free_wait_job_btn') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { AVERAGE_PROCESSING_TIME } from '@/static/config/common/constants'
  import ELKMixins from '@/mixins/ELKMixins'

  export default {
    name: 'SingleQueueTip',
    mixins: [ELKMixins],
    props: {
      busyJobs: Number,
      workerCount: {
        type: Number,
        default: 0,
      },
      source: String,
      isPaied: Boolean,
    },
    data() {
      const text2 = `${this.$t('workspace.new_wait_job_text_2', { pre: '<b class="orange">', suf: '</b>' })}`
      const text3 = `${this.$t('workspace.single_wait_job_text_3', { pre: '<b>', suf: '</b>' })}`

      const text2_2 = `${this.$t('workspace.batch_wait_job_text_2', {
        pre: '<b class="orange">',
        suf: '</b>',
        page: `<b>${this.$t('workspace.history')}</b>`,
      })}`
      const text2_3 = `<b>${this.$t('workspace.single_wait_job_text_2')}</b>`
      const text2Free = this.$t('workspace.single_free_wait_job_text_2', {
        pre: '<b>',
        suf: '</b>',
        page: `<b>${this.$t('workspace.history')}</b>`,
      })
      const text3Free = `<b>${this.$t('workspace.free_wait_job_text_3')}</b>`
      return {
        text2,
        text3,
        text2_2,
        text2_3,
        text2Free,
        text3Free,
      }
    },
    computed: {
      text1() {
        const count = `<b>${this.busyJobs}</b>`
        const time = `<b>${this.getTime}</b>`
        return this.busyJobs > 1
          ? this.$t('workspace.new_wait_job_text_1', { count, time })
          : this.$t('workspace.new_wait_job_text_1_single', { count, time })
      },
      isMainSite() {
        return this.$store.state.website === 'vanceai.com'
      },
      domain() {
        return this.isMainSite ? '' : 'https://vanceai.com'
      },
      getTime() {
        let time = this.busyTime
        if (typeof s !== 'number') {
          time = Number(time) || 0
        }
        if (time < 0) {
          return
        }
        const m = 60 // 1分钟的毫秒数
        const h = m * 60 // 1小时的毫秒数
        const hours = Math.floor(time / h)
        const minutes = Math.floor((time % h) / m)
        const seconds = (time % h) % m
        const filter = (item) => {
          return item > 9 ? '' + item : '0' + item
        }
        return `${filter(hours)}:${filter(minutes)}:${filter(seconds)}`
      },
      busyTime() {
        return Math.ceil((this.busyJobs * AVERAGE_PROCESSING_TIME[this.source]) / this.workerCount)
      },
    },
    watch: {
      busyJobs: {
        handler(val) {
          if (val) {
            this.$trace.traceCustomEvent({
              event: 'submit',
              xargs_event_category: 'upgrade_account',
              event_label: 'single_job_queue',
            })
          }
        },
        deep: true,
      },
    },
  }
</script>

<style scoped lang="less">
  .single-queue-tip {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0 24px;
    border-radius: 2px;

    p {
      line-height: 24px;
    }

    .m-t-8 {
      margin-top: 8px;
    }

    .flex {
      display: flex;
    }

    .m-t-24 {
      margin-top: 24px;
    }

    .tip {
      max-width: 508px;
      text-align: left;
    }

    i {
      color: #0374ff;
    }

    /deep/.orange {
      font-weight: bold;
      color: #ff9d1d;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;

      .background-container {
        position: relative;
        width: 200px;
        height: 12px;
        margin: 24px 0 32px 0;
        overflow: hidden;
        background-image: linear-gradient(to right, #ff69b4, rgba(255, 165, 0, 0.5));
        border-radius: 6px;

        &.free {
          background-image: linear-gradient(270deg, #aad0ff 0%, #0374ff 100%);
        }

        .loading-image-container {
          display: flex;
          animation: scroll 10s linear infinite;

          img {
            flex-shrink: 0;
            width: 100%;
          }
        }
        @keyframes scroll {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(0);
          }
        }
      }
    }

    .upgrade-btn {
      height: 44px;
      padding: 0 32px;
      margin-top: 32px;
      line-height: 44px;
    }

    .btn-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  }
</style>
