<template>
  <custom-dialog
    :visible="dialogVisible"
    :width="950"
    class="recommend-download-dialog"
    :show-header="false"
    :show-footer="false"
    :show-close="true"
    @close="handleClose"
    v-track-label="$commonTrackLabel('close_button')"
  >
    <p class="title tc bold">{{ title ? title : $t('workspace.app_d_t') }}</p>
    <!-- <p class="f-14 mag-b-20 tc">{{ $t('workspace.app_d_t_2') }}</p> -->
    <div class="content">
      <ul class="mag-b-30">
        <li v-for="(item, i) in 4" :key="i" class="mag-b-10">
          <i class="iconfont-single icon-s-complete"></i>
          {{ $t(`workspace.recommend_download_desc_${item}`) }}
        </li>
      </ul>
      <a
        class="primary-small-button btn"
        target="_blank"
        @click="handleClick"
        :href="downloadLink"
        v-track-label="$commonTrackLabel('download_soft_link')"
      >
        <i class="iconfont-single icon-s-download2"></i>
        {{ $t('workspace.download_vanceai_pc') }}
      </a>
    </div>
  </custom-dialog>
</template>

<script>
  import CustomDialog from '@/components/CustomDialog.vue'

  export default {
    name: 'RecommendAppDialog',
    components: { CustomDialog },
    props: {
      visible: Boolean,

      track: {
        type: String,
        default: '',
      },
      title: {
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
        dialogVisible: this.visible,
      }
    },
    computed: {
      downloadLink() {
        return this.$store.state.ll + '/soft-downloading/' + this.track
      },
    },
    watch: {
      dialogVisible(val) {
        this.$emit('update:visible', val)
      },
    },

    methods: {
      handleClose() {
        this.dialogVisible = false
      },
      handleClick() {
        this.$trace.traceCustomEvent({
          event: 'download',
          xargs_event_category: 'download_soft',
          event_info: {
            source_workspace: true,
            workspace_type: 'single',
          },
        })
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
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 500 / @base;
      background-image: url('@{assetsImgPath}/common/download2_bg.png');
      background-size: 100%;
    }

    /deep/ .dialog-footer {
      justify-content: center;
    }

    .title {
      font-size: 26px;
      font-weight: bold;
      color: #333;
    }

    .content {
      padding: 0 60 / @base;
      margin-top: 70 / @base;
    }

    ul {
      li {
        display: grid;
        grid-template-columns: 30px auto;
        align-items: center;
      }
    }

    .icon-s-download2 {
      color: #351e01;
    }

    .primary-small-button {
      // color: #fff;
      margin-top: 50 / @base;
    }
  }

  .progress {
    width: 60px;
    color: #c3c3c3;
  }
</style>
