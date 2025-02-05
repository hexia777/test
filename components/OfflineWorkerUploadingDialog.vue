<template>
  <custom-dialog
    class="offline-worker-uploading-dialog"
    :visible.sync="visible"
    :show-header="false"
    :show-footer="false"
    :show-close="false"
  >
    <div class="main">
      <i class="iconfont-single icon-s-upload3"></i>
      <p v-html="$t('workspace.offline_process_uploading_tip')"></p>

      <p>
        <i class="iconfont-single icon-s-loading"></i>{{ $t('workspace.uploading_status') }}
        {{ uploadedNumber }}/{{ works.length }}
      </p>
    </div>
    <div class="cancel">
      <p v-html="$t('workspace.offline_process_upload_cancel_tip')"></p>
      <button class="cancel-btn" @click="onCancel">{{ $t('workspace.upload_18') }}</button>
    </div>
  </custom-dialog>
</template>

<script>
  import CustomDialog from '@/components/CustomDialog'
  export default {
    name: 'OfflineWorkerUploadingDialog',
    components: {
      CustomDialog,
    },
    props: {
      visible: { type: Boolean, default: false },
      cancel: { type: Boolean, default: false },
      works: { type: Array, default: () => [] },
    },
    data() {
      return {}
    },
    computed: {
      uploadedNumber() {
        return this.works.filter((item) => item.uid).length
      },
    },
    methods: {
      onCancel() {
        this.$emit('update:cancel', true)
        this.$emit('update:visible', false)
      },
    },
  }
</script>

<style lang="less" scoped>
  .icon-s-upload3 {
    color: #0374ff;
  }
  .offline-worker-uploading-dialog {
    p {
      margin-bottom: 16 / @base;
    }

    .main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 25px;

      p {
        display: flex;
        align-items: center;
        padding: 0 25px;
      }
    }

    .cancel {
      width: 100%;
      padding: 25px;
      text-align: center;
      background: #efefef;

      .cancel-btn {
        color: #8a8a8a;
        border: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  @keyframes loading {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
