<template>
  <div
    v-if="leadStrokeVisible && leadStrokeVisible() && !$store.state.mobile"
    class="free-download"
    @click="clickDownload"
  >
    <a
      class="free-download-btn minor-button"
      :class="[type ? 'va-button--' + type : '', size ? 'va-button--' + size : '']"
      target="_blank"
      :href="downloadLink"
    >
      <i class="iconfont-single icon-s-win"></i>{{ $t('common.download_software') }}
    </a>
  </div>
</template>

<script>
  export default {
    name: 'FreeDownloadA',
    inject: ['leadStrokeVisible'],
    props: {
      type: {
        required: false,
        type: String,
        default: '',
      },
      label: {
        required: false,
        type: String,
        default: '',
      },
      needElk: {
        required: false,
        type: Boolean,
        default: false,
      },
      eventLabel: {
        required: false,
        type: String,
        default: '',
      },
      workspaceType: {
        required: false,
        type: String,
        default: '',
      },
      size: {
        required: false,
        type: String,
        default: '',
      },
    },
    computed: {
      downloadLink() {
        return `${this.$store.state.ll}/soft-downloading/?label=${this.label}`
      },
    },
    methods: {
      clickDownload() {
        if (!this.needElk) {
          return
        }

        this.$trace.traceCustomEvent({
          event: 'download',
          xargs_event_category: 'download_soft',
          event_label: this.eventLabel,
          event_info: {
            workspace_type: this.workspaceType,
          },
        })
      },
    },
  }
</script>

<style scoped lang="less">
  .button-base {
    display: inline-block;
    min-width: 200 / @base;
    height: 60 / @base;
    padding: 0 10 / @base;
    font-size: 18px;
    font-weight: 700;
    line-height: 60 / @base;
    color: #351e01;
    text-align: center;
    cursor: pointer;
    // margin: 0;
    border: none;
    // padding: 10/@base 8/@base;
    border-radius: 3px;
  }

  .va-button--medium {
    min-height: 60 / @base;
    line-height: 60 / @base;
    // padding: 10/@base 8/@base;
  }

  .va-button--primary {
    .button-base();

    background-color: #ff9d1d;

    &:hover {
      color: #351e01;
      background-color: #ffb048;
    }
  }

  .va-button--small {
    height: 40 / @base;
    line-height: 40 / @base;
    // padding: 8/@base 6/@base;
  }

  // .primary-button-disabled {
  //   .button-base();
  //   background-color: #ff9d1d;
  //   color: #b46601;
  // }

  .free-download {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .free-download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;

    .icon-s-win {
      margin-right: 15px;
      font-size: 24 / @base;
      color: black;
    }
  }
</style>
