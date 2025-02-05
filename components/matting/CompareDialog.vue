<template>
  <div class="compare-dialog">
    <my-dialog :visible.sync="trueVisible" :title="title" @close="hide">
      <div>
        <div class="compare-img">
          <div class="img-box">
            <span class="quicksand-bold tips" v-html="$t('common.original')"></span>
            <img width="282" height="357" :alt="$t('common.original')" />
          </div>
          <div class="img-box">
            <span class="quicksand-bold tips" v-html="$t('common.upload_3')"></span>
            <!-- <img width="282" height="357" :src="$imgPath('/batch/basic.jpg')" :alt="$t('common.upload_3')" /> -->
          </div>
          <div class="img-box">
            <span class="quicksand-bold tips" v-html="$t('common.upload_pro')"></span>
            <!-- <img width="282" height="357" :src="$imgPath('/batch/pro.jpg')" :alt="$t('common.upload_pro')" /> -->
          </div>
        </div>
        <div class="compare-desc" v-html="$t('workspace.process_limit_7')"></div>
        <div class="compare-button">
          <a
            class="btn-main"
            :href="
              $store.state.mainWebsite +
              $store.state.specialLocaleLink +
              '/pricing/?source=workspace&medium=colorise&location=pro_feature'
            "
            v-html="$t('workspace.upload_limit_4')"
          >
          </a>
          <span class="no-need" @click="hide" v-html="$t('workspace.process_limit_6')"></span>
        </div>
      </div>
    </my-dialog>
  </div>
</template>

<script>
  import myDialog from '@/components/matting/MyDialog'

  export default {
    name: 'BatchCompareDialog',
    components: { myDialog },
    props: {
      visible: { type: Boolean, default: false },
    },
    data() {
      return {
        title: this.$t('workspace.process_limit_5'),
        trueVisible: false,
      }
    },
    computed: {
      logged() {
        return this.$store.state.token
      },
    },
    watch: {
      visible(val) {
        this.trueVisible = val
      },
    },
    methods: {
      hide() {
        this.$emit('update:visible', false)
      },
    },
  }
</script>

<style lang="less">
  .compare-dialog {
    .dialog-mask .box {
      max-width: 830 / @base;
    }

    .compare-img {
      display: flex;
    }

    .img-box {
      position: relative;
      flex: 1;
      border: 1px solid #fff;

      .tips {
        position: absolute;
        top: 10px;
        left: 10px;
        min-width: 90 / @base;
        height: 27 / @base;
        padding: 0 10px;
        font-size: 14 / @base;
        line-height: 25 / @base;
        color: #fff;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid #626262;
        border-radius: 2px;
      }

      img {
        max-width: 100%;
      }
    }

    .compare-desc {
      margin: 20 / @base 5 / @base 10 / @base;
    }

    .compare-button {
      position: relative;

      .no-need {
        position: absolute;
        right: 10 / @base;
        bottom: 15 / @base;
        font-size: 14px;
        color: #717e8f;
        text-decoration: underline;
        cursor: pointer;

        &:hover {
          color: #0374ff;
        }
      }
    }
  }
  @media (max-width: 768px) {
    .compare-dialog {
      .dialog-mask .box {
        max-width: 93%;
        padding: 10px;
      }

      .img-box {
        .tips {
          top: 5px;
          left: 5px;
          min-width: 70 / @base;
          padding: 0 5px;
          font-size: 12 / @base;
        }
      }

      .compare-button {
        .no-need {
          position: static;
          display: block;
          margin-top: 5 / @base;
        }
      }
    }
  }
</style>
