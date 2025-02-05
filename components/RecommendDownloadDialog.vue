<template>
  <custom-dialog
    :visible.sync="visible"
    :width="950"
    class="recommend-download-dialog"
    :show-header="false"
    :show-close="showClose"
    @close="handleClose"
  >
    <p class="title tc bold">{{ $t('workspace.app_d_t') }}</p>
    <!-- <p class="f-14 mag-b-20 tc">{{ $t('workspace.app_d_t_2') }}</p> -->
    <div class="content">
      <ul class="mag-b-30">
        <li v-for="(item, i) in 4" :key="i" class="mag-b-10">
          <i class="iconfont-single icon-s-complete"></i>
          {{ $t(`workspace.recommend_download_desc_${item}`) }}
        </li>
      </ul>
      <a class="primary-small-button" target="_blank" @click="handleClick" :href="downloadLink">
        <i class="icon_icon_download_white"></i>
        {{ $t('workspace.download_vanceai_pc') }}
      </a>
    </div>
    <template #footer>
      <div class="progress-bar pad-40">
        <p class="tc mag-b-10">
          {{ showClose ? $t('workspace.downloaded') : $t('workspace.download_dialog_title_3') }}
        </p>
        <div class="flex justify-center align-center">
          <progress-bar :width="478" @finished="handleFinish" @change="handleChange" />
          <span class="progress f-14 tr">{{ progress }}%</span>
        </div>
      </div>
    </template>
  </custom-dialog>
</template>

<script>
  import CustomDialog from '@/components/CustomDialog.vue'
  import ProgressBar from '@/components/infrastructure/progress-bar.vue'

  export default {
    name: 'RecommendDownloadDialog',
    components: { ProgressBar, CustomDialog },
    props: {
      visible: Boolean,
      track: {
        type: String,
        default: '',
      },
      type: {
        type: String,
        default: 'multiple',
      },
    },
    data() {
      return {
        showClose: false,
        progress: 0,
      }
    },
    computed: {
      downloadLink() {
        return this.$store.state.ll + '/soft-downloading/' + this.track
      },
    },
    watch: {
      visible(val) {
        this.$emit('update:visible', val)
      },
    },
    mounted() {
      this.$trace.traceCustomEvent({
        event: 'click',
        xargs_event_category: 'popup',
        event_value: 'reffer_client_table',
        event_label: this.type === 'multiple' ? 'multiple' : 'single',
      })
    },
    methods: {
      handleClick() {
        this.elkSendData(false)
      },
      handleClose() {
        this.elkSendData(true)
      },
      elkSendData(status) {
        this.$trace.traceCustomEvent({
          event: 'download',
          xargs_event_category: 'download_soft',
          event_label: 'reffer_download',
          event_info: {
            type: this.type,
            close_status: status,
            source_soft_down: 'reffer_table',
          },
        })
      },
      handleFinish() {
        this.showClose = true
        this.$emit('finished')
      },
      handleChange(progress) {
        this.progress = progress
      },
    },
  }
</script>

<style scoped lang="less">
  .icon-s-complete {
    font-size: 16 / @base;
    margin-right: 10 / @base;
    color: #7963ea;
  }
  .recommend-download-dialog {
    /deep/ .dialog-content {
      padding: 40px 44px 30px;
      background-image: url('@{assetsImgPath}/common/download_bg.png');
      background-size: 100%;
    }

    /deep/ .dialog-footer {
      justify-content: center;
    }

    .title {
      font-size: 26px;
    }

    .content {
      padding: 0 60px;
    }

    ul {
      li {
        display: grid;
        grid-template-columns: 30px auto;
        align-items: center;
      }
    }

    .primary-small-button {
      color: #fff;
    }
  }

  //.progress-bar {
  //  width: 478px;
  //}

  .progress {
    width: 60px;
    color: #c3c3c3;
  }
</style>
