<template>
  <div v-if="showWin || showLock" class="img-view view-tag">
    <!-- @mouseleave="leaveHandle()" -->
    <div class="view-tag">
      <div class="view-slider mag-b-20 view-tag">
        <div v-if="compareData[selModel].img">
          <img :src="compareData[selModel].img" alt="" />
        </div>
        <slider-compare-image
          v-else
          :is-mobile="$store.state.mobile"
          :before-img="compareData[selModel].before"
          :after-img="compareData[selModel].after"
          :width="704"
          :height="374"
        >
          <template #tag>
            <div class="label label-l view-tag">
              <p class="tag-text quicksand-bold view-tag">{{ $t('common.remove_27') }}</p>
            </div>
            <div class="label label-r view-tag">
              <p class="tag-text quicksand-bold view-tag">{{ $t('common.remove_28') }}</p>
            </div>
          </template>
        </slider-compare-image>
      </div>
      <div class="f-b f-14 c3939 view-tag view-tag">{{ compareData[selModel].title }}</div>
      <div class="f-14 c4d4d view-tag view-tag">
        {{ compareData[selModel].desc }}
      </div>
      <!-- <div class="f-14 c777 mag-t-10 close-btn view-tag" @click="leaveHandle">
        {{ $t('workspace.disable_model_tooltips') }}
      </div> -->
    </div>
  </div>
</template>

<script>
  import SliderCompareImage from '@/components/slider-compare-image'
  import { WorkFlowType } from 'static/script/workflow_util'

  export default {
    components: {
      SliderCompareImage,
    },
    data() {
      return {
        showLock: false,
        selModel: 'enlarge',
        showWin: false,
        compareData: {
          enlarge: {
            before: this.$imgPath('/enhance/standard_1.jpg'),
            after: this.$imgPath('/enhance/standard_2.jpg'),
            title: this.$t('workspace.standard'),
            desc: this.$t('workspace.standard_desc'),
          },
          enlarge_clarity: {
            before: this.$imgPath('/enhance/enlarge_clarity_3.jpg'),
            after: this.$imgPath('/enhance/enlarge_clarity_4.jpg'),
            title: this.$t('workspace.low_resolution'),
            desc: this.$t('workspace.low_resolution_desc'),
          },
          [WorkFlowType.enlarge3]: {
            before: this.$imgPath('/enhance/standard_1.jpg'),
            after: this.$imgPath('/enhance/standard_2.jpg'),
            title: this.$t('workspace.standard'),
            desc: this.$t('workspace.standard_desc'),
          },
          chainner: {
            before: this.$imgPath('/enhance/anime_1.jpg'),
            after: this.$imgPath('/enhance/anime_2.jpg'),
            title: this.$t('workspace.anime'),
            desc: this.$t('workspace.anime_desc'),
          },
          art_enlarge: {
            before: this.$imgPath('/enhance/art_1.jpg'),
            after: this.$imgPath('/enhance/art_2.jpg'),
            title: this.$t('workspace.art_cg'),
            desc: this.$t('workspace.art_cg_desc'),
          },
          chainner_txt: {
            before: this.$imgPath('/enhance/text_1.jpg'),
            after: this.$imgPath('/enhance/text_2.jpg'),
            title: this.$t('workspace.text'),
            desc: this.$t('workspace.text_desc'),
          },
          portrait: {
            img: this.$imgPath('/enhance/portrait.jpg'),
            title: this.$t('workspace.portrait'),
            desc: this.$t('workspace.portrait_desc'),
          },
          scene: {
            img: this.$imgPath('/enhance/scene.png'),
            title: this.$t('workspace.scene'),
            desc: this.$t('workspace.scene_desc'),
          },
          very_blur: {
            img: this.$imgPath('/enhance/very_blur.jpg'),
            title: this.$t('workspace.very_blur'),
            desc: this.$t('workspace.very_blur_desc'),
          },
        },
      }
    },
    mounted() {
      document.addEventListener('click', (e) => {
        const tags = e.target.className
        if (tags !== '' && tags && tags.indexOf && tags.indexOf('view-tag') === -1) {
          this.leaveHandle()
        }
      })
    },
    methods: {
      testFun() {
        console.log(111)
      },
      leaveHandle() {
        this.showLock = false
        this.showWin = false
      },
      selOptionFun(req) {
        if (req.model) {
          this.selModel = req.model.job
          this.showWin = true
          if (req.handle === 'click' && !this.showLock) {
            this.showLock = true
          }
        } else {
          if (!this.showLock) {
            this.showWin = false
          }
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .view-slider {
    overflow: hidden;
    border-radius: 10px;
  }

  .img-view {
    width: 640px;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 15px 35px 0 rgba(0, 0, 0, 0.08);
  }

  .label {
    position: absolute;
    top: 10 / @base;
    z-index: 2;
    min-width: 90 / @base;
    padding: 3 / @base 10 / @base;
    font-size: 14 / @base;
    text-align: center;
    background: rgba(34, 31, 31, 0.9);
    border-radius: 3px;

    .tag-text {
      color: #fff;
    }

    &.label-l {
      left: 10 / @base;
    }

    &.label-r {
      right: 10 / @base;
    }
  }

  .close-btn {
    cursor: pointer;
  }
</style>
