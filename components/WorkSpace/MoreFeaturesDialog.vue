<template>
  <div class="more-features">
    <div class="show-more" @click="toggleShowFeature">
      <i class="triangle" :class="[isRotate ? 'is-rotate' : 'is-reset']"></i>
      <span>{{ $t('workspace.more_features') }}</span>
    </div>
    <div v-show="isRotate" class="features" :class="[isRotate ? 'is-features-rotate' : 'is-features-reset']">
      <i class="iconfont-single icon-s-exit" @click="close"></i>
      <div class="feature-items">
        <div
          v-for="item in handleFeatures"
          :key="item.name"
          class="feature-item"
          @click="
            () => {
              linkTo(item)
            }
          "
        >
          <img :src="item.imgSrc" alt="item.name" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'MoreFeaturesDialog',
    props: {
      features: {
        type: Array,
        default: () => [],
      },
      fileId: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        isRotate: false,
        featuresData: {
          upscaler: {
            name: this.$t('workspace.upscaler'),
            imgSrc: this.$imgPath('/common/upscaler_w.png'),
            link: `${this.$store.state.ll}/image-enlarger/?medium=reffer_funtion`,
          },
          cartoonizer: {
            name: this.$t('workspace.cartoonizer'),
            imgSrc: this.$imgPath('/common/cartoonizer_w.png'),
            link: `${this.$store.state.ll}/toongineer-cartoonizer/?medium=reffer_funtion`,
          },
          sharpen: {
            name: this.$t('workspace.sharpen_f'),
            imgSrc: this.$imgPath('/common/sharpen_w.png'),
            link: `${this.$store.state.ll}/sharpen-ai/?medium=reffer_funtion`,
          },
          restorer: {
            name: this.$t('workspace.restorer'),
            imgSrc: this.$imgPath('/common/restorer_w.png'),
            link: `${this.$store.state.ll}/old-photo-restoration/?medium=reffer_funtion`,
          },
          enhancer: {
            name: this.$t('workspace.enhancer'),
            imgSrc: this.$imgPath('/common/enhancer_w.png'),
            link: `${this.$store.state.ll}/image-enhancer/?medium=reffer_funtion`,
          },
        },
      }
    },
    computed: {
      handleFeatures() {
        return this.features.map((item) => ({ ...this.featuresData[item], id: item }))
      },
    },
    mounted() {
      this.timer = setTimeout(() => {
        if (!this.isRotate) {
          this.isRotate = true

          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'general_click',
            event_value: 'preview_recommend',
          })
        }
      }, 5000)
    },
    destroyed() {
      clearTimeout(this.timer)
    },
    methods: {
      toggleShowFeature() {
        if (!this.isRotate) {
          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'general_click',
            event_value: 'preview_recommend',
          })
        }
        this.isRotate = !this.isRotate
      },
      close() {
        this.isRotate = false
      },
      linkTo(item) {
        window.open(`${item.link}&fileId=${this.fileId}`, '_blank')

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'general_click',
          event_value: 'reffer_function',
          event_info: {
            reffer_function_type: item.id,
          },
        })
      },
    },
  }
</script>

<style scoped lang="less">
  .more-features {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    .show-more {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 196 / @base;
      height: 40 / @base;
      font-size: 16 / @base;
      font-weight: bold;
      color: #393939;
      cursor: pointer;
      background: #fff;
      border: 1px solid #bdbdbd;
      // border-bottom-color: transparent;
      border-radius: 10px 10px 0 0;

      &:hover {
        color: #0072ff;

        .triangle {
          border-bottom: 10 / @base solid #0072ff;
        }
      }

      .triangle {
        width: 0;
        height: 0;
        margin-right: 10 / @base;
        border-right: 10 / @base solid transparent;
        border-bottom: 10 / @base solid #393939;
        border-left: 10 / @base solid transparent;
      }

      .is-rotate {
        transition: transform 0.6s;
        -webkit-transform: rotate(180deg);
        transform: rotate(180deg);
      }

      .is-reset {
        transition: transform 0.6s;
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
    }

    .features {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 0;
      padding-left: 16 / @base;
      background: #fff;
      border: 1px solid #bdbdbd;
      border-radius: 3px;
      transition: height 1s linear;

      .icon-s-exit {
        position: absolute;
        top: 20 / @base;
        right: 20 / @base;
        cursor: pointer;
      }

      .feature-items {
        display: flex;
        font-size: 14 / @base;
        color: #393939;
        text-align: center;
      }

      .feature-item {
        width: 150 / @base;
        height: 100 / @base;
        margin-right: 32 / @base;
        cursor: pointer;
      }
    }

    .is-features-rotate {
      height: 178 / @base;
    }

    .is-features-reset {
      height: 0;
    }
  }
</style>
