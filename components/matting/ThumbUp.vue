<template>
  <div class="like">
    <div class="result-box" :class="{ reset: vertical }" v-if="!show">
      <template>
        <div class="result-text" :class="{ reset: vertical }" v-html="$t('common.rate_1')"></div>
        <div class="result-img" :class="{ reset: vertical }">
          <div class="nice-box" @click="likeNums(1)">
            <i class="iconfont-single icon-s-nice"></i>
            <i class="iconfont-single icon-s-nice-hover"></i>
          </div>
          <div class="low-box" @click="likeNums(2)">
            <i class="iconfont-single icon-s-low"></i>
            <i class="iconfont-single icon-s-low-hover"></i>
          </div>
        </div>
      </template>
    </div>
    <div class="result-box" :class="{ reset: vertical }" v-else>
      <span v-html="$t('common.rate_2')"></span>
    </div>
    <my-dialog :visible.sync="rateDialog" @close="dialogClose('close_tp_review')">
      <div class="rate-dialog-container">
        <div class="rate-detail">
          <div class="rate-dialog-title h2">
            {{ $t('common.rate_dialog_title') }}
          </div>
          <div class="rate-dialog-desc">
            {{ $t('common.rate_dialog_desc') }}
          </div>
        </div>
        <div class="trustpilot-container">
          <a target="_blank" @click="dialogClose('go_tp_review')" :href="$t('common.rate_dialog_btn_link')">
            <div class="rate-dialog-star">
              <i class="iconfont-single icon-s-rate-star"></i>{{ $t('common.rate_dialog_star') }}
            </div>
            <div style="padding-bottom: 10px">
              <i v-for="id in 5" :key="id" class="iconfont-single icon-s-rate-sqstar"></i>
            </div>
          </a>
          <div class="rate-bottom">
            <a
              class="btn-main"
              target="_blank"
              @click="dialogClose('go_tp_review')"
              :href="$t('common.rate_dialog_btn_link')"
            >
              {{ $t('common.rate_dialog_btn') }}
            </a>
            <a class="thanks-btn" href="javascript:;" @click="dialogClose('refuse_tp_review')">{{
              $t('common.rate_dialog_exit')
            }}</a>
          </div>
        </div>
      </div>
    </my-dialog>
    <my-dialog
      v-if="rateDialogRepair"
      :visible.sync="rateDialogRepair"
      @close="dialogClosePh('close_ph_review')"
    >
      <div class="rate-dialog-container rate-dialog-ph">
        <div class="rate-detail">
          <div class="rate-dialog-title h2">
            {{ $t('common.rate_dialog_title') }}
          </div>
          <div class="rate-dialog-desc">
            {{ $t('common.rate_dialog_desc_producthunt') }}
          </div>
        </div>
        <div class="trustpilot-container">
          <a
            :href="$t('common.rate_dialog_btn_link_producthunt')"
            target="_blank"
            @click="dialogClosePh('go_ph_review')"
          >
            <img
              :src="'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=307985&theme=light'"
              alt="VanceAI Photo Restorer - Restore old damaged pictures online with AI & deep learning | Product Hunt"
              width="250"
              height="54"
            />
          </a>
          <div class="rate-bottom">
            <a
              class="btn-main"
              target="_blank"
              @click="dialogClosePh('go_ph_review')"
              :href="$t('common.rate_dialog_btn_link_producthunt')"
            >
              {{ $t('common.rate_dialog_btn_producthunt') }}
            </a>
            <a class="thanks-btn" href="javascript:;" @click="dialogClosePh('refuse_ph_review')">{{
              $t('common.rate_dialog_exit')
            }}</a>
          </div>
        </div>
      </div>
    </my-dialog>
  </div>
</template>

<script>
  import Work from '@/static/script/work.js'
  import myDialog from '@/components/matting/MyDialog'

  export default {
    name: 'ThumbUp',
    components: { myDialog },
    props: {
      // eslint-disable-next-line vue/require-valid-default-prop
      item: {
        type: Object,
        default: () => {
          return {}
        },
      },
      //修改点赞组件的排版 class 变更
      vertical: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        show: this.item.likes,
        rateDialog: false,
        rateDialogRepair: false,
      }
    },
    watch: {
      item: {
        handler(val) {
          this.show = val.likes
        },
        deep: true,
      },
    },
    methods: {
      likeNums(num) {
        if (this.item.operation == 'repair') {
          if (num == 1 && !this.$getCookie('cloud_ratedialogph') && this.$getCookie('token')) {
            this.rateDialogRepair = true
          }
        } else {
          if (num == 1 && !this.$getCookie('cloud_ratedialog') && this.$getCookie('token')) {
            this.rateDialog = true
          }
        }
        Work.thumbUp(this.item.transId, num)
          .then((res) => {
            res = res.data

            if (res.code == 200) {
              this.show = true
              // this.$set(item, 'likes', true)
              this.$emit('likeNums', true, num)
              // 根据选择的不同选项 上报对应的type类型 sharpen_auto
              let rate_type = this.item.operation
              if (this.item.operation == Work.typeSharpen) {
                rate_type = this.item.operation + '_' + this.item.config.sharpenBeta
              }
              if (this.item.operation == Work.typeColorize) {
                rate_type = this.item.operation + '_' + this.item.config.quality
              }
              if (this.item.operation == Work.typePortrait) {
                rate_type = this.item.operation + '_' + this.item.config.singleFace
              }

              this.$trace.traceCustomEvent({
                event: 'click',
                xargs_event_category: 'other',
                event_value: 'rate',
                event_info: {
                  rate_result: num == 1 ? 'good' : 'bad',
                  rate_type,
                },
              })
            } else {
              this.$emit('likeNums', false)
              this.$message.error(this.$t('workspace.check_network'))
            }
          })
          .catch(() => {
            this.$emit('likeNums', false)
            this.$message.error(this.$t('workspace.check_network'))
          })
      },
      dialogClose(value) {
        this.rateDialog = false
        this.$setCookie('cloud_ratedialog', 1, 14)

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: value,
        })
      },
      dialogClosePh(value) {
        this.rateDialogRepair = false
        this.$setCookie('cloud_ratedialogph', 1, 14)

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: value,
        })
      },
    },
  }
</script>

<style lang="less" scoped>
  .icon-s-rate-star {
    font-size: 32 / @base;
    color: #44a675;
  }
  .icon-s-rate-sqstar {
    font-size: 28 / @base;
    color: #44a675;
    margin-right: 2 / @base;
  }
  .icon-s-nice,
  .icon-s-low,
  .icon-s-nice-hover,
  .icon-s-low-hover {
    font-size: 24 / @base;
  }

  .icon-s-nice-hover,
  .icon-s-low-hover {
    color: #0374ff;
  }
  .result-box {
    display: flex;
    align-items: center;
    justify-content: center;

    &.reset {
      display: block;
      margin-top: 50px;
      text-align: center;
    }

    min-height: 32px;

    .icon-s-nice,
    .icon-s-nice-hover,
    .icon-s-low,
    .icon-s-low-hover {
      cursor: pointer;
    }

    .icon-s-nice-hover {
      display: none;
    }

    .icon-s-low-hover {
      display: none;
    }

    .result-text {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;

      &.reset {
        display: block;
        margin-right: 0;
        text-align: center;
      }
    }

    .result-img {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 45px;

      &.reset {
        margin-top: 10 / @base;
      }

      .nice-box:hover {
        .icon-s-nice {
          display: none;
        }

        .icon-s-nice-hover {
          display: inline-block;
        }
      }

      .low-box {
        height: 26px;
        margin-left: 10px;

        &:hover {
          .icon-s-low {
            display: none;
          }

          .icon-s-low-hover {
            display: inline-block;
          }
        }
      }
    }
  }

  .colorize-container {
    .result-box {
      position: static;
      margin-top: 20px;
    }
  }

  .rate-dialog-container {
    width: 640px;

    .rate-detail {
      padding: 20px 30px;
    }

    .rate-dialog-desc {
      margin: 20 / @base 0 30 / @base;
      line-height: 1.5;
      text-align: left;
    }

    .trustpilot-container {
      padding: 20px 30px;
      background: #f2f4f7;
    }

    .rate-dialog-star {
      display: flex;
      justify-content: center;
      font-size: 26px;
      font-weight: 500;
      align-content: center;
    }

    .rate-bottom {
      position: relative;
      display: flex;
      align-items: center;
      vertical-align: middle;

      .btn-main {
        margin: auto;
      }

      .thanks-btn {
        position: absolute;
        right: 0;
        color: #999;
        text-decoration: underline;
      }
    }
  }

  .rate-dialog-ph {
    .rate-bottom {
      margin-top: 20px;
    }
  }

  @media (max-width: 768px) {
    .result-box {
      position: static;
      margin-top: 20px;

      .result-text {
        margin-right: 10px;
      }

      .result-img {
        .low-box {
          margin-left: 12px;
        }
      }
    }

    .rate-dialog-container {
      width: 100%;
    }
  }

  /* @media (max-width: 640px) {
    .result-box {
      position: absolute;
      right: 0;
      bottom: 20px;
      left: 0;
      z-index: 2;
      width: 100%;
      text-align: center;
    }
  } */
</style>
