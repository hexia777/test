<template>
  <div class="app-download-modal">
    <div class="app-download-container">
      <div class="app-d-close" @click="closeModal"></div>
      <div class="app-d-title">{{ $t('workspace.app_d_t') }}</div>

      <div class="app-d-tags">
        <div v-for="item in 4" :key="item" class="app-d-tag">
          <!-- <va-checkbox
            :label="$t(`workspace.app_tag_${item}`)"
            :is-disabled="true"
            :is-checked="true"
            :is-active="true"
            @change="toggleCheck"
          /> -->
          <span class="checkbox-btn"></span>
          <span>{{ $t(`workspace.app_tag_${item}`) }}</span>
        </div>
      </div>
      <div class="app-d-btn">
        <va-button size="small" @click="clickDownload">
          <i class="iconfont-single icon-s-win"></i> {{ $t('workspace.app_d_btn') }}
        </va-button>
      </div>
    </div>
  </div>
</template>

<script>
  import VaButton from '@/components/common/VaButton'
  // import VaCheckbox from '@/components/common/VaCheckbox'
  export default {
    name: 'DesktopDownloadTip',
    components: { VaButton },
    methods: {
      closeModal() {
        this.$emit('closeModal')
      },
      clickDownload() {
        this.$emit('clickDownloadApp')
      },
      toggleCheck() {
        console.log('xxx')
      },
    },
  }
</script>

<style scoped lang="less">
  .app-download-modal {
    position: absolute;
    bottom: 20px;
    z-index: 2;
    display: flex;
    justify-content: center;
    width: 100%;

    .app-download-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-content: center;
      // width: calc(100% - 170px);
      // max-width: 740px;
      min-width: 760 / @base;
      padding-bottom: 25px;
      background: rgba(255, 255, 255);
      border: 1px solid #bdbdbd;
      border-radius: 3px;

      .app-d-close {
        // background: red;
        position: absolute;
        top: 16px;
        right: 20px;
        width: 30px;
        height: 30px;
        font-size: 20px;
        text-align: center;
        cursor: pointer;
      }

      .app-d-close::before {
        // background-color: #0076fb;
        position: absolute;
        top: -12px;
        left: 0;
        width: 100%;
        font-size: 32px;
        color: #595959;
        content: '\00D7';
      }

      .app-d-title {
        margin: 36 / @base 0 26 / @base 0;
        font-size: 16px;
        font-weight: bold;
        color: #393939;
        text-align: center;
      }

      .app-d-tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        padding: 0 20px;
        margin-bottom: 25px;

        .app-d-tag {
          display: flex;
          align-items: center;
          justify-content: flex-start;

          .checkbox-btn {
            position: relative;
            width: 16px;
            height: 16px;
            margin-right: 10px;
            overflow: hidden;
            text-align: center;
            border-radius: 3px;
          }

          .checkbox-btn::before {
            position: absolute;
            top: -2px;
            left: 0;
            width: 100%;
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            content: '\2713';
            background-color: #0076fb;
          }
        }
      }

      .app-d-btn {
        display: flex;
        justify-content: center;
      }
    }
  }
</style>
