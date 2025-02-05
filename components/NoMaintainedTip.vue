<template>
  <client-only>
    <div
      class="no-maintained-tip"
      :class="{ hidden: closed || sourceHidden, top: top, sketch: source === 'sketch_to_image' }"
    >
      <div class="tip">
        <i class="el-dialog__close el-icon el-icon-close" @click="closedTip"></i>
        <p v-html="$t('workspace.no_maintained')"></p>
        <div class="btns">
          <a class="btn-main cat-btn" target="_blank" :href="link" @click.prevent="toLearnMore">
            {{ $t('workspace.learn_more') }}
          </a>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script>
  export default {
    name: 'NoMaintainedTip',
    props: {
      top: {
        type: Boolean,
        default: false,
      },
      source: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        closed: false,
      }
    },
    computed: {
      localStorageKey() {
        return `no_maintained__${this.source}`
      },
      sourceHidden() {
        const value = localStorage && localStorage.getItem(this.localStorageKey)
        return value ? true : false
      },
      link() {
        return `${this.$store.state.ll}/terminate-service/`
      },
    },
    methods: {
      toLearnMore() {
        this.closedTip()
        window.open(this.link)
      },
      closedTip() {
        this.closed = true
        localStorage.setItem(this.localStorageKey, '1')
      },
    },
  }
</script>

<style scoped lang="less">
  .no-maintained-tip {
    position: absolute;
    right: 384px;
    bottom: 24px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 320px;
    padding: 36px 20px 20px 20px;
    margin-top: 10px;
    background: #fff;
    border: none;
    border-radius: 2px;
    box-shadow: 0 30px 70px 0 rgba(6, 7, 50, 0.24);

    &.sketch {
      right: 399px;
    }

    &.top {
      top: 12px;
      right: 20px;
      height: fit-content;
    }

    &.hidden {
      display: none;
    }

    p {
      line-height: 24px;
    }

    .m-t-8 {
      margin-top: 8px;
    }

    .flex {
      display: flex;
    }

    .btns {
      display: flex;
      justify-content: center;
      margin-top: 16px;

      .cat-btn {
        width: 155px;
        height: 40px;
        line-height: 40px;
      }
    }

    .tip {
      max-width: 508px;
      text-align: left;

      i {
        font-size: 20px;
      }

      .el-dialog__close {
        position: absolute;
        top: 8px;
        right: 8px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
</style>
