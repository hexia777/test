<template>
  <div class="works">
    <div
      @click="switchCartoonVersion('new')"
      v-show="cartoonVersion == 'old'"
      class="version-ctr new-version"
      v-track-label="$commonTrackLabel('switch_cartoon_version_old')"
    >
      <span class="version-wrap"
        >{{ $t('workspace.switch_to_new_version') }}<i class="iconfont-single icon-s-arrow-right"></i
      ></span>
    </div>
    <div
      @click="switchCartoonVersion('old')"
      v-show="cartoonVersion == 'new'"
      class="version-ctr"
      v-track-label="$commonTrackLabel('switch_cartoon_version_new')"
    >
      <span class="version-wrap"
        ><i class="iconfont-single icon-s-arrow-left"></i>{{ $t('workspace.switch_to_old_version') }}</span
      >
    </div>
    <div class="tab-main scroll-bar">
      <div>
        <div class="tit-box">{{ $t('workspace.cartoon_label') }}</div>
        <div v-if="cartoonVersion == 'old'">
          <div class="flex mag-t-10">
            <div
              v-for="item in oldCartoonList"
              :key="item.value"
              @click="selTabFun(item.value)"
              class="flex1 sel-box1"
              :class="{ sel: cartoonMode === item.value }"
              v-track-label="$commonTrackLabel(`select_model_old_cartoon_${item.label}`)"
            >
              <img :src="item.img" />
              <p class="f-14">{{ item.label }}</p>
            </div>
          </div>
          <div>
            <div class="c333 mag-t-30 quicksand-bold">{{ $t('workspace.sketch') }}</div>
            <div class="flex mag-t-10 mag-b-30">
              <div
                v-for="item in sketchList"
                :key="item.value"
                @click="selTabFun(item.value)"
                class="flex1 sel-box1"
                :class="{ sel: cartoonMode === item.value }"
                v-track-label="$commonTrackLabel('select_model_old_sketch_avatar')"
              >
                <img :src="item.img" />
                <p class="f-14">{{ item.label }}</p>
              </div>
              <div class="flex1"></div>
            </div>
          </div>
        </div>
        <div class="mag-t-10" v-if="cartoonVersion == 'new'">
          <div class="btn-group">
            <button
              @click="switchCartoonType('female')"
              :class="{ sel: cartoonType == 'female' }"
              class="gender-btn female"
              v-track-label="$commonTrackLabel('switch_cartoon_type_female')"
            >
              <i class="iconfont-single icon-s-female"></i>
              {{ $t('workspace.female') }}
            </button>
            <button
              @click="switchCartoonType('male')"
              :class="{ sel: cartoonType == 'male' }"
              class="gender-btn male"
              v-track-label="$commonTrackLabel('switch_cartoon_type_male')"
            >
              <i class="iconfont-single icon-s-male"></i>{{ $t('workspace.male') }}
            </button>
          </div>
          <!-- todo 新增模型选项 -->
          <div class="flex style-box">
            <div
              v-for="item in newCartoonList"
              :key="item.value"
              class="sel-box1"
              :class="{ sel: cartoonMode === item.value }"
              @click="selTabFun(item.value)"
              v-track-label="$commonTrackLabel('select_cartoon_model_' + item.value)"
            >
              <img :src="item.img" />
              <p class="f-14">{{ item.label }}</p>
            </div>
          </div>
          <div class="style-strength-ctr mag-t-20">
            <p class="mag-b-20">{{ $t('workspace.style_strength') }}</p>
            <el-radio
              v-model="styleStrength"
              v-for="item of styleStrengthList"
              :key="item.value"
              :label="item.value"
              v-track-label="$commonTrackLabel('select_style_strength_' + item.value)"
            >
              <div v-html="item.label"></div>
            </el-radio>
            <p class="mag-b-20 cartoon_desc">{{ $t('workspace.cartoon_description') }}</p>
            <el-input
              type="textarea"
              rows="5"
              maxlength="140"
              :placeholder="$t('workspace.cartoon_description_pld')"
              class="mag-b-15"
              v-model="prompt"
            />
            <el-checkbox
              class="mag-b-10"
              @change="changeOverwrite"
              v-track-label="$commonTrackLabel('overwrite')"
            >
              {{ $t('workspace.overwrite_desc') }}
            </el-checkbox>
            <p class="assist-text" v-html="$t('workspace.cartoon_description_tip')"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CartoonizerWorks',
    props: {
      isFreeUser: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        cartoonVersion: 'new',
        cartoonType: 'female',
        hasFileId: false,
        overwrite: false,
        selectedNewCartoon_female: 'style1',
        selectedNewCartoon_male: 'style4',
        selectedOldModel: 'animegan2c',
        prompt: '',
        cartoonMode: 'style1',
        styleStrength: 'realistic',
      }
    },
    computed: {
      sketchList() {
        return [
          {
            label: this.$t('workspace.avatar'),
            value: 'sketch_single_face',
            img: this.$imgPath('/image_cartoonizer/image-cartoonizer-sketch.jpg'),
          },
          {
            label: this.$t('workspace.character'),
            value: 'sketch',
            img: this.$imgPath('/image_cartoonizer/image-cartoonizer-cartoon.jpg'),
          },
        ]
      },
      oldCartoonList() {
        return [
          {
            label: this.$t('workspace.avatar'),
            value: 'animegan_toon',
            img: this.$imgPath('/image_cartoonizer/portrait_cartoon.png'),
          },
          {
            label: this.$t('workspace.character'),
            value: 'animegan2c',
            img: this.$imgPath('/image_cartoonizer/full_cartoon.png'),
          },
          {
            label: this.$t('workspace.manga'),
            value: 'cartoonize',
            img: this.$imgPath('/image_cartoonizer/japan_cartoon.png'),
          },
        ]
      },
      newCartoonList() {
        const map = {
          female: [
            {
              label: this.$t('workspace.female_style1'),
              value: 'style1',
              img: this.$imgPath('/image_cartoonizer/girl-style1.jpg'),
            },
            {
              label: this.$t('workspace.female_style2'),
              value: 'style2',
              img: this.$imgPath('/image_cartoonizer/girl-style3.jpg'),
            },
            {
              label: this.$t('workspace.female_style3'),
              value: 'style3',
              img: this.$imgPath('/image_cartoonizer/girl-style2.jpg'),
            },
          ],
          male: [
            {
              label: this.$t('workspace.male_style1'),
              value: 'style4',
              img: this.$imgPath('/image_cartoonizer/boy-style1.jpg'),
            },
            {
              label: this.$t('workspace.male_style2'),
              value: 'style5',
              img: this.$imgPath('/image_cartoonizer/boy-style2.jpg'),
            },
            {
              label: this.$t('workspace.male_style3'),
              value: 'style6',
              img: this.$imgPath('/image_cartoonizer/boy-style3.jpg'),
            },
          ],
        }
        if (this.$store.state.locale === 'ja') {
          map.female = [
            ...map.female,
            {
              label: this.$t('workspace.ghibli'),
              value: 'Ghibli_girl',
              img: this.$imgPath('/image_cartoonizer/girl-cartoonizer-ghibli.jpg'),
            },
            {
              label: this.$t('workspace.disney'),
              value: 'disney_girl',
              img: this.$imgPath('/image_cartoonizer/girl-cartoonizer-disney.jpg'),
            },
            {
              label: this.$t('workspace.shikai_makoto'),
              value: 'shinkai_girl',
              img: this.$imgPath('/image_cartoonizer/girl-cartoonizer-shinkai.jpg'),
            },
          ]
          map.male = [
            ...map.male,
            {
              label: this.$t('workspace.ghibli'),
              value: 'Ghibli_boy',
              img: this.$imgPath('/image_cartoonizer/boy-cartoonizer-ghibli.jpg'),
            },
            {
              label: this.$t('workspace.disney'),
              value: 'disney_boy',
              img: this.$imgPath('/image_cartoonizer/boy-cartoonizer-disney.jpg'),
            },
            {
              label: this.$t('workspace.shikai_makoto'),
              value: 'shinkai_boy',
              img: this.$imgPath('/image_cartoonizer/boy-cartoonizer-shikai.jpg'),
            },
          ]
        } else {
          map.female = [
            ...map.female,
            {
              label: this.$t('workspace.comic'),
              value: 'us_comic_girl',
              img: this.$imgPath('/image_cartoonizer/girl-cartoonizer-comic.jpg'),
            },
            {
              label: this.$t('workspace.disney'),
              value: 'disney_girl',
              img: this.$imgPath('/image_cartoonizer/girl-cartoonizer-disney.jpg'),
            },
            {
              label: this.$t('workspace.ghibli'),
              value: 'Ghibli_girl',
              img: this.$imgPath('/image_cartoonizer/girl-cartoonizer-ghibli.jpg'),
            },
          ]
          map.male = [
            ...map.male,
            {
              label: this.$t('workspace.comic'),
              value: 'us_comic_boy',
              img: this.$imgPath('/image_cartoonizer/boy-us-comic.jpg'),
            },
            {
              label: this.$t('workspace.disney'),
              value: 'disney_boy',
              img: this.$imgPath('/image_cartoonizer/boy-cartoonizer-disney.jpg'),
            },
            {
              label: this.$t('workspace.ghibli'),
              value: 'Ghibli_boy',
              img: this.$imgPath('/image_cartoonizer/boy-cartoonizer-ghibli.jpg'),
            },
          ]
        }
        return map[this.cartoonType]
      },
      styleStrengthList() {
        return [
          {
            label: this.$t('workspace.more_cartoonish'),
            value: 'cartoonish',
          },
          {
            label: this.$t('workspace.more_realistic'),
            value: 'realistic',
          },
        ]
      },
      modelType() {
        return ['animegan_toon', 'animegan2c', 'cartoonize', 'sketch_single_face', 'sketch'].includes(
          this.cartoonMode
        )
          ? 'traditional'
          : 'sd'
      },
    },
    watch: {
      styleStrength(val) {
        const config = this.getWorkConfig(val)
        this.$emit(
          'updateWorkConfig',
          config.workName,
          {
            ...config.options,
            overwrite: this.overwrite,
            prompt: this.prompt,
            styleType: this.cartoonMode,
          },
          {
            switch_cartoon_versions: this.cartoonVersion,
            cartoon_model_type: this.cartoonVersion == 'old' ? '' : this.cartoonType,
            model_type: this.modelType,
          }
        )
      },
      overwrite(val) {
        const config = this.getWorkConfig()
        this.$emit(
          'updateWorkConfig',
          config.workName,
          {
            ...config.options,
            overwrite: val,
            prompt: this.prompt,
            styleType: this.cartoonMode,
          },
          {
            switch_cartoon_versions: this.cartoonVersion,
            cartoon_model_type: this.cartoonVersion == 'old' ? '' : this.cartoonType,
            model_type: this.modelType,
          }
        )
      },
      prompt(val) {
        const config = this.getWorkConfig()
        this.$emit(
          'updateWorkConfig',
          config.workName,
          {
            ...config.options,
            overwrite: this.overwrite,
            prompt: val,
            styleType: this.cartoonMode,
          },
          {
            switch_cartoon_versions: this.cartoonVersion,
            cartoon_model_type: this.cartoonVersion == 'old' ? '' : this.cartoonType,
            model_type: this.modelType,
          }
        )
      },
    },
    mounted() {
      const config = this.getWorkConfig()
      this.$emit(
        'updateWorkConfig',
        config.workName,
        {
          ...config.options,
          overwrite: this.overwrite,
          prompt: this.prompt,
          styleType: this.cartoonMode,
        },
        {
          switch_cartoon_versions: this.cartoonVersion,
          cartoon_model_type: this.cartoonVersion == 'old' ? '' : this.cartoonType,
          model_type: this.modelType,
        }
      )
    },
    methods: {
      getWorkConfig(value) {
        const styleStrength = value || this.styleStrength
        let cn_configs = []
        let denoising_strength
        if (['animegan_toon', 'animegan2c', 'cartoonize'].includes(this.cartoonMode)) {
          return {
            workName: this.cartoonMode,
            options: {},
          }
        }

        if (['sketch_single_face', 'sketch'].includes(this.cartoonMode)) {
          return {
            workName: 'sketch',
            options: { singleFace: this.cartoonMode === 'sketch_single_face' },
          }
        }

        if (['style1', 'style2', 'style3', 'style4', 'style5', 'style6'].includes(this.cartoonMode)) {
          if (styleStrength === 'realistic') {
            cn_configs = ['cartoon_lineart', 'cartoon_tile']
          }
          if (styleStrength === 'cartoonish') {
            cn_configs = ['cartoon_tile']
          }
          return {
            workName: 'img2anime',
            options: { cn_configs },
          }
        }
        if (['Ghibli_girl', 'Ghibli_boy', 'shinkai_girl', 'shinkai_boy'].includes(this.cartoonMode)) {
          cn_configs = ['cartoon_normal_noforge']
          if (styleStrength === 'realistic') {
            denoising_strength = 0.65
          }
          if (styleStrength === 'cartoonish') {
            denoising_strength = 0.75
          }
          return {
            workName: 'img2anime_no_forge',
            options: { cn_configs, denoising_strength },
          }
        }

        if (['disney_girl', 'disney_boy'].includes(this.cartoonMode)) {
          if (styleStrength === 'realistic') {
            cn_configs = ['more_real_lineart']
          }
          if (styleStrength === 'cartoonish') {
            cn_configs = ['more_cartoon_lineart']
          }
          return {
            workName: 'img2anime' || 'img2anime_st',
            options: { cn_configs },
          }
        }

        if (['us_comic_girl', 'us_comic_boy'].includes(this.cartoonMode)) {
          if (styleStrength === 'realistic') {
            cn_configs = ['cartoon_canny']
          }
          if (styleStrength === 'cartoonish') {
            cn_configs = ['cartoon_normal']
          }
          return {
            workName: 'img2anime',
            options: { cn_configs },
          }
        }
      },
      selTabFun(value) {
        this.cartoonMode = value
        if (this.cartoonVersion === 'old') {
          this.selectedOldModel = value
        } else {
          this['selectedNewCartoon_' + this.cartoonType] = value
        }
        const config = this.getWorkConfig()
        this.$emit(
          'updateWorkConfig',
          config.workName,
          {
            ...config.options,
            overwrite: this.overwrite,
            prompt: this.prompt,
            styleType: this.cartoonMode,
          },
          {
            switch_cartoon_versions: this.cartoonVersion,
            cartoon_model_type: this.cartoonVersion == 'old' ? '' : this.cartoonType,
            model_type: this.modelType,
          }
        )
      },
      switchCartoonVersion(version) {
        this.cartoonVersion = version

        if (version === 'old') {
          this.selTabFun(this.selectedOldModel)
        } else {
          this.switchCartoonType(this.cartoonType)
          this.selTabFun(this['selectedNewCartoon_' + this.cartoonType])
        }

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'general_click',
          event_value: 'switch_cartoon',
          event_info: {
            switch_cartoon_versions: version,
          },
        })
      },
      switchCartoonType(type) {
        this.cartoonType = type
        this.selTabFun(this['selectedNewCartoon_' + type])
      },
      changeOverwrite(val) {
        this.overwrite = val
      },
    },
    head() {
      const imageList = [
        this.$imgPath('/image_cartoonizer/girl-style1.jpg'),
        this.$imgPath('/image_cartoonizer/girl-style2.jpg'),
        this.$imgPath('/image_cartoonizer/girl-style3.jpg'),
        this.$imgPath('/image_cartoonizer/girl-cartoonizer-comic.jpg'),
        this.$imgPath('/image_cartoonizer/girl-cartoonizer-disney.jpg'),
        this.$imgPath('/image_cartoonizer/girl-cartoonizer-ghibli.jpg'),
      ]
      const link = []
      for (let i = 0; i < imageList.length; i++) {
        link.push({
          rel: 'preload',
          as: 'image',
          href: imageList[i],
        })
      }

      return {
        link,
      }
    },
  }
</script>

<style lang="less" scoped>
  .works {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
  }
  .version-ctr {
    height: 50 / @base;
    padding: 0 20 / @base;
    font-size: 14 / @base;
    line-height: 50 / @base;
    color: #0374ff;
    background: #f5f7fa;

    .iconfont-single {
      font-size: 12 / @base;
      color: #0374ff;
    }

    .icon-s-arrow-left {
      margin-right: 5 / @base;
    }

    .icon-s-arrow-right {
      margin-left: 5 / @base;
    }

    .version-wrap {
      cursor: pointer;
    }

    &.new-version {
      text-align: right;
    }
  }

  .tab-main {
    flex: 1;
    padding: 0 20 / @base 20 / @base;
    overflow: auto;

    .title {
      margin: 10 / @base 0 10 / @base;
    }
  }

  .sel-box1 {
    padding: 5px 0 0;
    font-size: 14px;
    color: #333;
    text-align: center;
    cursor: pointer;
    background: #f2f2f2;

    .sel-tab-txt {
      padding: 7px 0;
    }

    &.sel {
      color: #fff;
      background: #0374ff;

      p {
        color: #fff;
      }
    }
    img {
      width: 100px;
      height: 100px;
    }
  }

  .sel {
    color: #fff;
    background: #0374ff !important;

    p {
      color: #fff;
    }
  }

  .tit-box {
    margin: 10px 0;
    color: #333;
    font-family: Poppins, Open Sans;
    font-weight: 700;
  }
  .btn-group {
    display: flex;
    justify-content: center;
    margin-bottom: 20 / @base;
  }

  .gender-btn {
    display: flex;
    align-items: center;
    height: 36 / @base;
    padding: 5 / @base 15 / @base;
    font-size: 14 / @base;
    color: #777;
    background: #fff;
    border: solid 1px #eaeaea;
    border-color: #eaeaea;

    &.sel {
      color: #fff;

      .iconfont-single {
        color: #fff;
      }
    }

    &.female {
      border-width: 1px 0 1px 1px;
    }

    &.male {
      border-width: 1px 1px 1px 0;
    }

    .iconfont-single {
      margin-right: 14 / @base;
      font-size: 26 / @base;
    }
  }

  .style-box {
    flex-wrap: wrap;
    justify-content: flex-start;

    .sel-box1 {
      flex: 0;
      padding: 5px;

      img {
        width: 100px;
        height: 100px;
      }
    }
  }

  /deep/ .style-strength-ctr .el-radio {
    display: flex;
    margin-bottom: 15 / @base;
  }

  /deep/ .drives {
    margin-top: 10px;

    .selector {
      width: 100%;
    }

    .current-drives {
      flex: 1;
    }
  }
</style>
