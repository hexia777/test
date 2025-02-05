<template>
  <my-dialog :visible.sync="dialogVisible">
    <div class="container">
      <p class="message">{{ $t('workspace.workflow_save_workflow_message') }}</p>
      <el-input v-model="name" :maxlength="50" :show-word-limit="true" />
    </div>
    <template #footer>
      <div class="footer-btns">
        <button class="cancel-btn" @click="dialogVisible = false">
          {{ $t('workspace.workflow_btn_cancel') }}
        </button>
        <button class="save-btn" @click="saveHandle">{{ $t('workspace.workflow_btn_save') }}</button>
      </div>
    </template>
  </my-dialog>
</template>

<script>
  import MyDialog from '@/components/matting/MyDialog'
  export default {
    name: 'SaveWorkflowDialog',
    components: { MyDialog },
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      width: {
        type: [String, Number],
        default: '530',
      },
    },
    data() {
      return {
        name: '',
        dialogVisible: false,
      }
    },
    watch: {
      visible: {
        handler(val) {
          this.dialogVisible = val
        },
        immediate: true,
      },
      dialogVisible(val) {
        this.$emit('update:visible', val)
      },
    },
    methods: {
      saveHandle() {
        this.name = this.name || 'workflow_' + Date.now()
        this.$emit('saveWorkflow', this.name)
      },
    },
  }
</script>

<style scoped lang="less">
  .container {
    width: 530px;
    padding: 10px 20px;

    .message {
      text-align: left;
    }
  }

  .footer-btns {
    display: flex;
    justify-content: flex-end;
    padding: 10px 20px;

    button {
      min-width: 130px;
      padding: 0.5rem 1rem;
      margin-left: 20px;
      border-radius: 3px;
    }

    .cancel-btn {
      background: #fff;
      border: 1px solid #d4d4d4;

      &:hover {
        border: 1px solid #333;
      }
    }

    .save-btn {
      color: #fff;
      background: #ff9d1d;
      border: none;

      &:hover {
        background: #f5b45f;
      }
    }
  }
  @media screen and (max-width: 476px) {
    .container {
      width: 100%;
    }
  }
</style>
<style>
  .dialog-mask .dialog-btn-box {
    padding-top: 10px;
    margin-top: 0;
    border-top: 1px solid #f2f4f7;
  }
</style>
