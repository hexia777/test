<template>
  <div>
    <div>
      <div
        @click="switchCartoonVersion('new')"
        v-if="cartoonVersion == 'old'"
        class="version-ctr new-version"
        v-track-label="$commonTrackLabel('switch_cartoon_version_new')"
      >
        <span class="version-wrap"
          >{{ $t('workspace.switch_to_new_version') }}<i class="iconfont-single icon-s-arrow-right"></i
        ></span>
      </div>
      <div
        @click="switchCartoonVersion('old')"
        v-if="cartoonVersion == 'new'"
        class="version-ctr"
        v-track-label="$commonTrackLabel('switch_cartoon_version_old')"
      >
        <span class="version-wrap"
          ><i class="iconfont-single icon-s-arrow-left"></i>{{ $t('workspace.switch_to_old_version') }}</span
        >
      </div>
      <div class="c333 mag-t-20 quicksand-bold">{{ $t('workspace.cartoon_label') }}</div>
      <div class="mag-t-10">
        <div class="btn-group" v-if="cartoonVersion == 'new'">
          <button
            @click="switchCartoonType('female')"
            :class="{ sel: cartoonType == 'female' }"
            class="gender-btn female"
            v-track-label="$commonTrackLabel('switch_cartoon_type_female')"
          >
            <i class="iconfont-single icon-s-female"></i>{{ $t('workspace.female') }}</button
          ><button
            @click="switchCartoonType('male')"
            :class="{ sel: cartoonType == 'male' }"
            class="gender-btn male"
            v-track-label="$commonTrackLabel('switch_cartoon_type_male')"
          >
            <i class="iconfont-single icon-s-male"></i>{{ $t('workspace.male') }}
          </button>
        </div>
        <div class="flex style-box">
          <div
            v-for="item in cartoonList"
            :key="item.value"
            class="flex1 sel-box"
            :class="{ sel: selTab == item.value || (selTab === 6 && cartoonMode === item.value) }"
            @click="selTabFun(cartoonVersion === 'new' ? 6 : item.value, item.value)"
            v-track-label="$commonTrackLabel('select_cartoon_model_' + item.value)"
          >
            <img :src="item.img" />
            <p class="f-14">{{ item.label }}</p>
          </div>
        </div>
        <div class="style-strength-ctr mag-t-20" v-if="cartoonVersion == 'new'">
          <p class="mag-b-20">{{ $t('workspace.style_strength') }}</p>
          <el-radio
            v-model="styleStrength"
            v-for="item of styleStrengthList"
            :key="item.value"
            :label="item.value"
            @change="onStyleStrengthChange"
            v-track-label="$commonTrackLabel(item.trackName)"
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
            v-model="img2animeObj.module_params.prompt"
          />
          <el-checkbox
            class="mag-b-10"
            @change="changeOverwrite"
            v-track-label="$commonTrackLabel('overwrite_auto_generated_description')"
          >
            {{ $t('workspace.overwrite_desc') }}
          </el-checkbox>
          <p class="assist-text" v-html="$t('workspace.cartoon_description_tip')"></p>
        </div>
      </div>
    </div>
    <div v-if="cartoonVersion == 'old'">
      <div class="c333 mag-t-30 quicksand-bold">{{ $t('workspace.sketch') }}</div>
      <div class="flex mag-t-10 mag-b-30">
        <div
          v-for="(item, index) in sketchList"
          :key="'item' + index"
          class="flex1 sel-box"
          :class="{ sel: selTab === item.value }"
          @click="selTabFun(item.value)"
          v-track-label="$commonTrackLabel('select_sketch_model_' + item.value)"
        >
          <img :src="item.img" />
          <p class="f-14">{{ item.label }}</p>
        </div>
        <div class="flex1"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
  import { deepClone } from '@/static/script/utils'
  import Work from '@/static/script/work.js'

  export default {
    name: 'CartoonizerModal',
    data() {
      return {
        artLineObj: deepClone(WorkFlowConfig(WorkFlowType.artLine)),
        sketchObj: WorkFlowConfig(WorkFlowType.sketch),
        animeObj: WorkFlowConfig(WorkFlowType.animegan),
        cartoonizeStable: WorkFlowConfig(WorkFlowType.cartoonize),
        animegan2cObj: WorkFlowConfig(WorkFlowType.animegan2c),
        img2animeObj: deepClone(WorkFlowConfig(WorkFlowType.img2anime)),
        selTab: 6,
        cartoonVersion: 'new',
        cartoonType: 'female',
        cartoonMode: 'style1',
        styleStrength: 'realistic',
        overwrite: false,
        selectedNewCartoon_female: 'style1',
        selectedNewCartoon_male: 'style4',
        selectedOldSelTab: 5,
        cnConfigsMap: {
          '3': ['cartoon_tile'],
          '9': ['cartoon_lineart', 'cartoon_tile'],
        },
      }
    },
    computed: {
      cartoonList() {
        const oldCartoonList = [
          {
            label: this.$t('workspace.avatar'),
            value: '2',
            img: this.$imgPath('/image_cartoonizer/portrait_cartoon.png'),
          },
          {
            label: this.$t('workspace.character'),
            value: '5',
            img: this.$imgPath('/image_cartoonizer/full_cartoon.png'),
          },
          {
            label: this.$t('workspace.manga'),
            value: '4',
            img: this.$imgPath('/image_cartoonizer/japan_cartoon.png'),
          },
        ]
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
              img: this.$imgPath('/image_cartoonizer/girl-style2.jpg'),
            },
            {
              label: this.$t('workspace.female_style3'),
              value: 'style3',
              img: this.$imgPath('/image_cartoonizer/girl-style3.jpg'),
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
        return this.cartoonVersion === 'new' ? map[this.cartoonType] : oldCartoonList
      },
      sketchList() {
        return [
          {
            label: this.$t('workspace.avatar'),
            value: '1',
            img: this.$imgPath('/image_cartoonizer/image-cartoonizer-sketch.jpg'),
          },
          {
            label: this.$t('workspace.character'),
            value: '3',
            img: this.$imgPath('/image_cartoonizer/image-cartoonizer-cartoon.jpg'),
          },
        ]
      },
      artLineObj2() {
        const modal = deepClone(WorkFlowConfig(WorkFlowType.artLine))
        modal['module_params']['single_face'] = true
        return modal
      },
      styleStrengthList() {
        return [
          {
            label: this.$t('workspace.more_cartoonish'),
            value: 'cartoonish',
            trackName: 'more_cartoonish',
          },
          {
            label: this.$t('workspace.more_realistic'),
            value: 'realistic',
            trackName: 'more_realistic',
          },
        ]
      },
    },
    watch: {
      styleStrength(val) {
        // this.img2animeObj.cn_configs = this.cnConfigsMap[val]
        const options = this.getStyleStrengthConfig(val)
        this.img2animeObj.cn_configs = options.cn_configs
        if (options.denoising_strength) {
          this.$set(this.img2animeObj.module_params, 'denoising_strength', options.denoising_strength)
        } else {
          if (this.img2animeObj.module_params.denoising_strength) {
            delete this.img2animeObj.module_params.denoising_strength
          }
        }
      },
    },
    mounted() {
      //初始化配置
      this.initConfig()

      this.$nextTick(() => {
        this.selTabFun(6, 'style1')
      })
    },
    methods: {
      initConfig() {
        const options = this.getStyleStrengthConfig()
        this.img2animeObj.cn_configs = options.cn_configs
        if (options.denoising_strength) {
          this.$set(this.img2animeObj.module_params, 'denoising_strength', options.denoising_strength)
        } else {
          if (this.img2animeObj.module_params.denoising_strength) {
            delete this.img2animeObj.module_params.denoising_strength
          }
        }
        // this.img2animeObj.cn_configs = this.cnConfigsMap[this.styleStrength]
      },
      getStyleStrengthConfig(value) {
        const styleStrength = value ? value : this.styleStrength
        let cn_configs = []
        let denoising_strength
        if (['style1', 'style2', 'style3', 'style4', 'style5', 'style6'].includes(this.cartoonMode)) {
          if (styleStrength === 'realistic') {
            cn_configs = ['cartoon_lineart', 'cartoon_tile']
          }
          if (styleStrength === 'cartoonish') {
            cn_configs = ['cartoon_tile']
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
        }

        if (['disney_girl', 'disney_boy'].includes(this.cartoonMode)) {
          if (styleStrength === 'realistic') {
            cn_configs = ['more_real_lineart']
          }
          if (styleStrength === 'cartoonish') {
            cn_configs = ['more_cartoon_lineart']
          }
        }

        if (['us_comic_girl', 'us_comic_boy'].includes(this.cartoonMode)) {
          if (styleStrength === 'realistic') {
            cn_configs = ['cartoon_canny']
          }
          if (styleStrength === 'cartoonish') {
            cn_configs = ['cartoon_normal']
          }
        }
        if (denoising_strength && cn_configs.length) {
          return {
            denoising_strength,
            cn_configs,
          }
        }
        return { cn_configs }
      },
      onStyleStrengthChange() {
        this.$emit('changeMode', this.outputConfig(this.selTab))
      },
      selTabFun(req, value) {
        this.selTab = req
        if (this.cartoonVersion === 'old') {
          this.selectedOldSelTab = req
        }
        if (value) {
          this['selectedNewCartoon_' + this.cartoonType] = value
          this.cartoonMode = value
          this.$set(this.img2animeObj.module_params, 'model_name', this.cartoonMode)
          const options = this.getStyleStrengthConfig()
          this.img2animeObj.cn_configs = options.cn_configs
          if (options.denoising_strength) {
            this.$set(this.img2animeObj.module_params, 'denoising_strength', options.denoising_strength)
          } else {
            if (this.img2animeObj.module_params.denoising_strength) {
              delete this.img2animeObj.module_params.denoising_strength
            }
          }
        }
        this.$emit('changeMode', this.outputConfig(req))
      },
      /**
       * @outputConfig 输出模型参数
       */
      outputConfig(req) {
        const mapData = {
          1: this.artLineObj2,
          2: this.animeObj,
          3: this.artLineObj,
          4: this.cartoonizeStable,
          5: this.animegan2cObj,
          6: this.img2animeObj,
        }
        const nameData = {
          1: WorkFlowType.sketch,
          2: WorkFlowType.animegan_toon,
          3: WorkFlowType.sketch,
          4: WorkFlowType.cartoonize,
          5: WorkFlowType.animegan2c,
          6: WorkFlowType.img2anime,
        }
        const elkJob = {
          1: WorkFlowType.sketch,
          2: WorkFlowType.animegan_toon,
          3: WorkFlowType.sketch,
          4: WorkFlowType.cartoonize,
          5: WorkFlowType.animegan_toon,
          6: WorkFlowType.cartoonize,
        }

        let config = {
          config: mapData[req],
          name: nameData[req],
          elkName: nameData[req],
          elkJob: elkJob[req],
          disabledPreprocessing: req !== 1,
          ext_params: {
            cartoon_model_type: this.cartoonType,
            process_style_type: this.cartoonMode,
          },
        }
        console.log('outputConfig config11: ', JSON.parse(JSON.stringify(mapData[req])))

        // 新 sketch 模型 改版
        if (req == 1 || req == 3) {
          const extendConfig = {
            newSketchName: Work.typeNewSketch,
            modelExtendFlag: true,
            index: 2,
            modelExtend: [
              {
                name: 'portrait_enhancer',
                config: {
                  module: 'portrait_enhancer',
                  module_params: {
                    model_name: 'PortraitEnhancer_v1.4',
                  },
                },
              },
              {
                name: 'matting',
                config: {
                  module: 'matting',
                  module_params: {
                    model_name: 'MattingStable',
                    rescale: 532,
                    web_auto_mode: false,
                  },
                },
              },
            ],
          }
          config = {
            ...config,
            ...extendConfig,
          }
        }
        console.log('outputConfig config: ', JSON.parse(JSON.stringify(config)))
        return config
      },
      switchCartoonVersion(version) {
        this.cartoonVersion = version

        if (version === 'old') {
          this.selTabFun(this.selectedOldSelTab)
        } else {
          this.switchCartoonType(this.cartoonType)
          this.selTabFun(6, this['selectedNewCartoon_' + this.cartoonType])
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
        this.selTabFun(6, this['selectedNewCartoon_' + type])
      },
      changeOverwrite(val) {
        this.$set(this.img2animeObj.module_params, 'overwrite', val)
      },
    },
  }
</script>

<style lang="less" scoped>
  .style-box {
    flex-wrap: wrap;
    justify-content: flex-start;

    .sel-box {
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

  .sel-box {
    padding: 5px 0 0;
    font-size: 14px;
    color: #333;
    text-align: center;
    cursor: pointer;
    background: #f2f2f2;

    .sel-tab-txt {
      padding: 7px 0;
    }
  }

  .sel {
    color: #fff;
    background: #0374ff !important;

    p {
      color: #fff;
    }
  }
</style>
