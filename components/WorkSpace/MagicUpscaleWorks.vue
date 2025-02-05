<template>
  <div class="works">
    <div class="title-box">
      <div class="title">{{ $t('workspace.image_type') }}</div>
      <el-tooltip effect="dark" placement="top">
        <div slot="content" v-html="$t('workspace.image_type_tip')"></div>
        <i class="iconfont-single icon-s-icon_tips"></i>
      </el-tooltip>
    </div>
    <div @mouseleave="leaveHandle()">
      <div
        v-for="item in imageTypesData"
        :key="item.name"
        class="type-item"
        :class="{ 'active-item': item.name === imageType }"
        @click="clickImageItem(item)"
        @mouseover="selModelFun(item)"
        v-track-label="$commonTrackLabel('magic_enlarge_image_type_' + item.name)"
      >
        <i class="iconfont-single" :class="item.icon"></i>
        <div class="item-label">{{ item.label }}</div>
      </div>
    </div>

    <!-- Denoising Strength -->
    <div class="additional-setting-ctr">
      <va-switch
        class="mag-t-15"
        @changeSwitchHandle="(value) => changeSwitchHandle(value, 'denoise_auto')"
        :value="denoise_auto"
        :sub-label="$t('workspace.auto')"
      >
        <template #label>
          <div class="title-box">
            <div class="title">{{ $t('workspace.creativity') }}</div>
            <el-tooltip effect="dark" placement="top">
              <div slot="content" v-html="$t('workspace.creativity_tip')"></div>
              <i class="iconfont-single icon-s-icon_tips"></i>
            </el-tooltip>
          </div>
        </template>
      </va-switch>
      <slider-v2
        class="mag-b-10"
        :value="sliderValue"
        @changeSliderHandle="(value) => changeSliderHandle(value, 'denoising_strength')"
        :disabled="denoise_auto"
      />
    </div>

    <!-- 图片尺寸设置 -->
    <new-image-size-set
      class="image-size-set"
      :model-name="workName"
      :can-customize="!isBatch"
      :has-no-enlarge="false"
      :image="image"
      :title="$t('workspace.scaler_factor')"
      :default-size="2"
      :sizes="selectSizes"
      @setImageSize="setImageSize"
      @showTip="showCustomerTip"
    />

    <div class="prompt">
      <div class="title-box">
        <div class="title">{{ $t('workspace.image_description') }}</div>
        <el-tooltip effect="dark" placement="top">
          <div slot="content" v-html="$t('workspace.image_description_tip')"></div>
          <i class="iconfont-single icon-s-icon_tips"></i>
        </el-tooltip>
      </div>
      <el-input
        type="textarea"
        rows="5"
        maxlength="140"
        :placeholder="$t('workspace.image_description_pl')"
        class="mag-b-15"
        v-model="prompt"
      />
    </div>

    <div class="tags">
      <div
        class="tag"
        v-for="tag in tags"
        :key="tag"
        @click="clickTag(tag)"
        v-track-label="$commonTrackLabel('magic_enlarge_tag_' + tag)"
      >
        {{ tag }}
      </div>
    </div>

    <custom-dialog :visible.sync="customerTipVisible" :show-header="false" :show-close="false">
      <p v-html="$t('workspace.custom_tip_1')"></p>
      <p v-html="$t('workspace.custom_tip_2')"></p>
      <template #footer>
        <button
          class="primary-small-button"
          @click="customerTipVisible = false"
          v-track-label="$commonTrackLabel('tip_close_button')"
        >
          {{ $t('common.alert_ok') }}
        </button>
      </template>
    </custom-dialog>
  </div>
</template>

<script>
  import NewImageSizeSet from '@/components/job/NewImageSizeSet.vue'
  import SliderV2 from '@/components/SliderV2.vue'
  import VaSwitch from '@/components/Switch.vue'
  import CustomDialog from '@/components/CustomDialog.vue'

  export default {
    name: 'MagicUpscaleWorks',
    components: { SliderV2, VaSwitch, NewImageSizeSet, CustomDialog },
    props: {
      image: {
        type: Object,
        default: () => {},
      },
      isBatch: {
        type: Boolean,
        default: false,
      },
      workName: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        customerTipVisible: false,
        sliderValue: 50,
        // denoising_strength: 0.2,
        imageType: 'portrait',
        denoise_auto: true,
        showTip: false,
        prompt: '',
        imageSizeParams: {},
        imageTypesData: [
          {
            label: this.$t('workspace.portrait'),
            icon: 'icon-s-protrait',
            name: 'portrait',
          },
          {
            label: this.$t('workspace.scene'),
            icon: 'icon-s-scene',
            name: 'scene',
          },
          {
            label: this.$t('workspace.very_blur'),
            icon: 'icon-s-very_blur',
            name: 'very_blur',
          },
        ],
        selectSizes: [
          { label: '1X', value: 1 },
          { label: '2X', value: 2 },
          { label: '4X', value: 4 },
          { label: '8X', value: 8 },
        ],
      }
    },
    computed: {
      denoising_strength() {
        switch (this.imageType) {
          case 'portrait':
            return Number(((0.2 / 100) * this.sliderValue + 0.1).toFixed(2))
          case 'scene':
            return Number(((0.4 / 100) * this.sliderValue + 0.1).toFixed(2))
          case 'very_blur':
            return Number(((0.3 / 100) * this.sliderValue + 0.3).toFixed(2))
          default:
            return Number(((0.2 / 100) * this.sliderValue + 0.1).toFixed(2))
        }
      },
      tags() {
        return [1, 2, 3, 4, 5, 6, 7].map((tag) => this.$t(`workspace.clarity_tag_${tag}`))
      },
    },
    methods: {
      getWorkConfig() {
        return {
          prompt: this.prompt,
          denoising_strength: this.denoising_strength,
          ...this.imageSizeParams,
        }
      },
      clickTag(tag) {
        if (this.prompt && this.prompt.length >= 140) {
          return
        }
        this.prompt = `${this.prompt || ''}${tag}`
      },
      clickImageItem(item) {
        if (this.imageType === item.name) {
          return
        }
        this.imageType = item.name
        this.denoise_auto = true
        this.sliderValue = 50
        this.selModelFun(item, 'click')
      },
      changeSliderHandle(value) {
        this.sliderValue = value
      },
      changeSwitchHandle(val, bindedAttribute) {
        if (bindedAttribute === 'denoise_auto') {
          if (val) {
            this.sliderValue = 50
          }
          this.denoise_auto = val
          return
        }
        this[bindedAttribute] = val
      },
      setImageSize(params) {
        this.imageSizeParams = params
        // this.$emit('updateWorkConfig', params)
      },
      showCustomerTip() {
        this.customerTipVisible = true
      },
      selModelFun(item, handle = 'hover') {
        // if (handle === 'hover') {
        //   if (this.hoverHandel) {
        //     clearTimeout(this.hoverHandel)
        //     this.hoverHandel = null
        //   }
        //   this.hoverHandel = setTimeout(() => {
        //     this.$emit('selModelFun', { model: item, handle })
        //   }, 100)
        // }
        this.$emit('selModelFun', { model: { job: item.name }, handle })
      },
      leaveHandle() {
        // if (this.hoverHandel) {
        //   clearTimeout(this.hoverHandel)
        //   this.hoverHandel = null
        // }
        this.$emit('selModelFun', { model: '', handle: 'hover' })
      },
    },
  }
</script>
<style lang="less" scoped>
  .works {
    // background-color: #f5f7fa;
    // padding: 0 20 / @base;
    .title-box {
      display: flex;
      align-items: center;
      margin-bottom: 12 / @base;
      .title {
        font-size: 16 / @base;
        color: #232323;
        font-weight: bold;
        margin-right: 6 / @base;
      }
      .icon-s-icon_tips {
        font-size: 16 / @base;
        color: #eaeaea;
        line-height: 1;
      }
    }

    .type-item {
      display: flex;
      margin-bottom: 8 / @base;
      align-items: center;
      cursor: pointer;
      padding: 0 12 / @base;
      height: 40 / @base;
      background: #fafafa;
      border-radius: 4px;
      border: 1px solid transparent;
      &:hover {
        border: 1px solid #0374ff;
      }
      .iconfont-single {
        margin-right: 12 / @base;
        line-height: 1;
      }
      .item-label {
        font-size: 14 / @base;
        color: #232323;
      }
    }
    .active-item {
      border: 1px solid #0374ff;
      .iconfont-single {
        color: #0374ff;
      }
      .item-label {
        font-size: 14 / @base;
        color: #0374ff;
      }
    }

    .additional-setting-ctr {
      margin-top: 6 / @base;
    }
    .prompt {
      margin-top: 6 / @base;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      .tag {
        // height: 20px;
        background: #fafafa;
        padding: 4px;
        font-size: 14px;
        color: #232323;
        line-height: 1;
        margin-right: 8 / @base;
        cursor: pointer;
        margin-bottom: 10 / @base;
      }
    }
  }
</style>
