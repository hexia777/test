<template>
  <custom-dialog
    v-if="content.length"
    class="register-subscribe-dialog"
    :visible.sync="visible"
    :width="width"
    :height="height"
    :title-border="false"
    :show-footer="false"
  >
    <div class="main">
      <div
        v-for="(item, index) in content"
        :key="index"
        class="main-block"
        :class="[content.length === 1 && 'full-width']"
      >
        <div v-if="item.icon" class="icon">
          <!-- <i :class="['iconfont-single', item.icon]"></i> -->
          <img :src="item.icon" />
        </div>
        <p class="title quicksand-bold">{{ item.title }}</p>
        <p v-for="(desc, i) in item.desc" :key="i" class="desc">
          <i class="iconfont-single" v-if="desc.icon" :class="[desc.icon]"></i>
          <span v-html="desc.text"></span>
        </p>
        <div class="btn-box" v-if="item.btn">
          <span
            v-if="item.btn.theme === 'text'"
            class="text-btn"
            @click="onClick(item.btn.click, item.btn.params, item.btn.elk)"
          >
            {{ item.btn.text }}
          </span>
          <button
            v-else
            class="set-btn"
            :class="['btn-main', item.btn.theme === 'white' && 'white-btn', 'quicksand-bold']"
            @click="onClick(item.btn.click, item.btn.params, item.btn.elk)"
          >
            <p class="quicksand-bold">{{ item.btn.text }}</p>
            <!-- <p v-if="item.btn.subText && item.btn.showSubText" class="sub-text">{{ item.btn.subText }}</p> -->
          </button>
          <p class="tip">{{ item.btn.tip }}</p>
        </div>
      </div>
      <!-- 1 -->
    </div>
  </custom-dialog>
</template>

<script>
  import CustomDialog from '@/components/CustomDialog'

  export default {
    name: 'FreeProcessTimesDialog',
    components: {
      CustomDialog,
    },
    props: {
      visible: { type: Boolean, default: false },
    },
    data() {
      return {}
    },
    computed: {
      width() {
        return 830
        // if (this.token && this.notPoint && this.isPaied) {
        //   return 550
        // } else {
        //   return 830
        // }
      },
      height() {
        return 620
        // if (this.token && this.notPoint && this.isPaied) {
        //   return 410
        // } else {
        //   return 620
        // }
      },
      content() {
        return [
          {
            icon: this.$imgPath('/common/download_dialog_9.png'),
            title: this.$t('workspace.process_not_times'),
            desc: [
              {
                text: this.$t('workspace.process_not_times_desc'),
              },
            ],
          },
          {
            title: this.$t('workspace.download_dialog_title_2'),
            desc: [
              {
                text: this.$t('workspace.download_dialog_desc_5'),
              },
              {
                icon: 'icon-s-credits',
                text: this.$t('workspace.download_dialog_desc_6'),
              },
              {
                icon: 'icon-s-ai-features',
                text: this.$t('workspace.download_dialog_desc_7'),
              },
              {
                icon: 'icon-s-upload-support',
                text: this.$t('workspace.download_dialog_desc_8'),
              },
              {
                icon: 'icon-s-download2',
                text: this.$t('workspace.download_dialog_desc_9'),
              },
              {
                icon: 'icon-s-batch-process',
                text: this.$t('workspace.download_dialog_desc_10'),
              },
              {
                icon: 'icon-s-customize-workflow',
                text: this.$t('workspace.download_dialog_desc_11'),
              },
              {
                icon: 'icon-s-customer-service',
                text: this.$t('workspace.download_dialog_desc_12'),
              },
              {
                icon: 'icon-s-money',
                text: this.$t('workspace.download_dialog_desc_13'),
              },
            ],
            btn: {
              text: this.$t('workspace.download_btn_2', {
                price: this.$t('common.white_paper_cuppon')
                  ? this.$t('common.white_paper_price')
                  : this.$t('common.annually_money_4') + this.$t('common.product_pricing_plan_22'),
              }),
              subText: this.$t('workspace.download_btn_2_subtext'),
              showSubText: this.$t('common.white_paper_cuppon'),
              click: 'subscribe',
              tip: this.$t('workspace.download_tip_2', {
                price: this.$t('pricing.product_pricing_plan_30'),
              }),
              elk: 'no_credits_popup',
            },
          },
        ]
      },
    },
    watch: {
      visible(val) {
        this.$emit('update:visible', val)
        //关闭
        if (!val) {
          this.$emit('closeBtn')
        }
      },
    },
    mounted() {},
    methods: {
      onClick(val, params, elk) {
        this.before()
        this.onSubscribe(params, elk)
      },
      before() {
        this.$emit('update:visible', false)
      },

      //未注册用户前往pricing页面start
      onSubscribe(params, elk) {
        //工作台页面特有逻辑
        if (this.$route.name.indexOf('workspace') !== -1) {
          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'general_click',
            event_value: 'process_price_click',
          })
          // this.$trace.traceCustomEvent({
          //   event: 'online_work',
          //   xargs_event_category: 'download',
          //   event_value: 'download_subscribe',
          //   event_info: {
          //     source: elk || '',
          //   },
          // })

          this.$emit('onSubscribe')
        } else {
          const elkParam = this.pricingParamFun() //页面跳转后携带的参数
          window.location.href =
            this.$store.state.mainWebsite +
            this.$store.state.specialLocaleLink +
            '/pricing?automaticprice=1&source=' +
            elkParam
        }
      },
      /**
       * @pricingParamFun 计算出跳转pricing页面需要携带的参数
       */
      pricingParamFun() {
        return 'no_credits_popup_0721'
      },
    },
  }
</script>

<style lang="less" scoped>
  .iconfont-single {
    font-weight: 900;
  }

  .icon-s-upload-support {
    font-size: 17 / @base;
  }

  .icon-s-download2 {
    font-size: 18 / @base;
    font-weight: 400;
    color: #777;
  }

  .icon-s-tea,
  .icon-s-user2 {
    color: #0374ff;
  }

  .icon-s-credits,
  .icon-s-ai-features,
  .icon-s-batch-process,
  .icon-s-upload-support,
  .icon-s-customize-workflow,
  .icon-s-customer-service,
  .icon-s-money,
  .icon-s-download2 {
    color: #000;
  }

  .register-subscribe-dialog {
    .main {
      display: flex;
      width: 100%;
      height: 100%;
      padding: 16px 0;

      .main-block {
        flex: 1;
        height: 100%;
        padding: 0 20 / @base;

        .iconfont-single,
        .icon,
        .title {
          margin-bottom: 15 / @base;
          text-align: center;
        }

        .title {
          font-size: 18px;
          font-weight: bold;
        }

        .desc {
          display: flex;
          align-items: center;
          margin-bottom: 10 / @base;

          .icon,
          .iconfont-single {
            margin: 0 15 / @base 0 0;
          }
        }

        &:nth-child(2) {
          border-left: 1px solid #efefef;
        }

        .btn-box {
          margin-top: 30px;
          text-align: center;

          p {
            line-height: 1.25;
            color: #fff;
          }

          .sub-text {
            font-size: 12px;
            font-weight: 500;
            line-height: 1;
            color: #7f7f7f;
          }

          .tip {
            margin-top: 8 / @base;
            font-size: 12px;
            color: #7f7f7f;
          }

          .white-btn {
            color: #333;
            background-color: #fff;
            border-color: #333;

            p {
              color: #333;
            }

            &:hover {
              background-color: #efefef;
            }
          }

          .text-btn {
            color: #169bd5;
            cursor: pointer;

            &:hover {
              color: #0662eb;
            }
          }
        }
      }

      .full-width {
        width: 100%;
      }
    }

    .footer {
      width: 100%;
      height: 30px;
    }
  }
  @media screen and (max-width: 768px) {
    .register-subscribe-dialog {
      .main {
        flex-direction: column;
      }
    }
  }
</style>
<style lang="less">
  .register-subscribe-dialog {
    .dialog-content {
      flex: 1;
    }

    .dialog-container {
      overflow: auto !important;
    }
  }
</style>
