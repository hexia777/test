<template>
  <div class="main-top" v-if="!isDialog">
    <div @click="onUploadClick('workdesk_top')" v-track-label="$commonTrackLabel('top_upload_button')">
      <file-upload
        class="upload-btn"
        :disabled="disabled"
        :multiple="false"
        :upload-list="uploadList"
        @onUpload="onUpload"
      >
        <button class="primary-small-button">
          {{ $t('workspace.upload_2') }}
        </button>
      </file-upload>
    </div>

    <div
      v-if="leadStrokeVisible"
      class="batch-btn minor-small-button"
      @click="showAppDownload"
      v-track-label="$commonTrackLabel('show_app_download_button')"
    >
      {{ $t('workspace.batch_process') }}
    </div>
    <a
      v-else
      class="batch-btn minor-small-button"
      :href="$store.state.ll + '/workspace?source=workdesk&type=' + workspaceUrl"
      v-track-label="$commonTrackLabel('batch_process_link')"
    >
      {{ $t('workspace.batch_process') }}
    </a>
  </div>
</template>

<script>
  import FileUpload from '@/components/FileUpload'

  export default {
    name: 'WorkMIddleTop',
    components: {
      FileUpload,
    },
    props: {
      isDialog: {
        type: Boolean,
        default: false,
      },
      upgradeLink: {
        type: String,
        default: '',
      },
      downloadLink: {
        type: String,
        default: '',
      },
      userType: {
        type: String,
        default: '',
      },
      leadStrokeVisible: {
        type: Boolean,
        default: false,
      },
      uploadList: {
        type: Array,
        default: () => [],
      },
      workspaceUrl: {
        type: String,
        default: '',
      },
      downloadLink: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      onUpload(list) {
        this.$emit('onUpload', list)
      },
      onUploadClick(type) {
        this.$emit('onUploadClick', type)
      },
      showAppDownload() {
        this.$emit('showAppDownload')
      },
    },
  }
</script>

<style scoped lang="less">
  .main-top {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 62px;
    padding: 0 20px;

    .upload-btn {
      width: 200 / @base;
    }
  }

  .batch-btn {
    margin-left: 10 / @base;
  }
</style>
