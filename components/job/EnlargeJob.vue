<template>
  <div class="enlarge-job">
    <p class="enlarge-job_title mag-b-10">
      <span>{{ $t('workspace.ai_mode') }}</span>
    </p>
    <job-list
      :active-job="activeJob"
      :jobs="jobs"
      :picture-mode="true"
      @selModelFun="selModelFun"
      @handleJobSwitch="handleJobSwitch"
    />
    <!-- <template v-if="isNewEnlargeModel">
      <va-switch
        class="pad-l-10 pad-r-10 mag-t-20 high-quality-wrap"
        @changeSwitchHandle="changeSwitchHandle"
        :value="high_quality"
        :label="$t('workspace.high_quality')"
        :sub-label="$t('workspace.auto')"
        binded-attribute="high_quality"
      />
    </template> -->
    <template v-if="activeJob === WorkFlowType.chainner">
      <!-- <anime-job
        :index="index"
        :image="image"
        :work-flow-type="activeJob"
        @changeConfig="changeConfigForParent"
        @changeActiveJob="changeActiveJob"
        @showTip="showTip"
      /> -->
      <image-size-set
        class="image-size-set"
        :active-job="activeJob"
        :can-customize="!isBatch"
        :has-no-enlarge="true"
        :image="image"
        :title="$t('workspace.workflow_waifu_2')"
        :default-size="2"
        :sizes="[
          { label: '2X', value: 2 },
          { label: '4X', value: 4 },
          { label: '6X', value: 6 },
          { label: '8X', value: 8 },
        ]"
        @changeConfig="changeConfigForParent"
        @showTip="showTip"
      />
    </template>

    <template v-else-if="activeJob === WorkFlowType.waifu">
      <anime-job
        :index="index"
        :image="image"
        :work-flow-type="activeJob"
        @changeConfig="changeConfigForParent"
        @changeActiveJob="changeActiveJob"
        @showTip="showTip"
      />
    </template>
    <template v-else-if="activeJob === WorkFlowType.enlarge3">
      <enlarge3-job :image="image" :high-quality="high_quality" @changeConfig="changeConfigForParent" />
    </template>
    <template v-else-if="activeJob === WorkFlowType.chainner_txt">
      <image-size-set
        class="image-size-set"
        :active-job="activeJob"
        :can-customize="!isBatch"
        :has-no-enlarge="false"
        :image="image"
        :default-size="2"
        :sizes="[
          { label: '1X', value: 1 },
          { label: '2X', value: 2 },
          { label: '4X', value: 4 },
          { label: '8X', value: 8 },
        ]"
        @changeConfig="changeConfigForParent"
        @showTip="showTip"
      />
    </template>
    <template v-else-if="activeJob === WorkFlowType.enlarge_clarity">
      <image-size-set
        class="image-size-set"
        :active-job="activeJob"
        :can-customize="!isBatch"
        :has-no-enlarge="false"
        :image="image"
        :default-size="2"
        :sizes="[
          { label: '1X', value: 1 },
          { label: '2X', value: 2 },
          { label: '4X', value: 4 },
          { label: '8X', value: 8 },
        ]"
        @changeConfig="changeConfigForParent"
        @showTip="showTip"
      />
      <div class="additional-setting-ctr">
        <p class="switch-title">
          {{ $t('workspace.additional_settings') }}
        </p>
        <va-switch
          class="mag-t-15"
          @changeSwitchHandle="(value) => changeSwitchHandle(value, 'denoise_auto')"
          :value="true"
          :label="$t('workspace.denoise_strength')"
          :sub-label="$t('workspace.auto')"
        />
        <slider
          class="mag-b-10"
          :value="0"
          @changeSliderHandle="(value) => changeSliderHandle(value, 'denoise_auto')"
          :disabled="denoise_auto"
        />
      </div>
    </template>
    <template v-else>
      <workflow-operations
        v-if="activeJobConfig"
        :work="activeJob"
        :config="activeJobConfig"
        :module="activeJobConfig.module"
        @changeCustomParams="changeCustomParams"
        @changeModuleFun="changeModuleFun"
        @showTip="showTip"
      />
    </template>
    <div class="additional-setting-ctr" v-if="currentJob.elkName === WorkFlowType.enlarge_sr">
      <p class="switch-title">
        {{ $t('workspace.additional_settings') }}
      </p>
      <va-switch
        class="mag-t-15"
        @changeSwitchHandle="changeSwitchHandle"
        :value="true"
        :label="$t('workspace.denoise_strength')"
        :sub-label="$t('workspace.auto')"
      />
      <slider
        class="mag-b-10"
        :value="50"
        @changeSliderHandle="changeSliderHandle"
        :disabled="!img2srConfig.config.module_params.denoising"
      />
      <div class="switch-wrap">
        <span class="switch-label">{{ $t('workspace.enhance_faces') }}</span>
        <el-switch
          v-model="img2srConfig.config.module_params.restore_faces"
          v-track-label="
            $commonTrackLabel('enhance_faces_' + !img2srConfig.config.module_params.restore_faces)
          "
        />
      </div>
    </div>
    <template v-if="activeJob === WorkFlowType.enlarge3">
      <div class="additional-setting-ctr">
        <p class="switch-title">
          {{ $t('workspace.additional_settings') }}
        </p>
        <va-switch
          class="mag-t-15"
          @changeSwitchHandle="changeSwitchHandle"
          :value="enhance_faces"
          binded-attribute="enhance_faces"
          :label="$t('workspace.enhance_faces')"
        />
      </div>
    </template>

    <custom-dialog :visible.sync="tipVisible" :show-header="false" :show-close="false">
      <p v-html="$t('workspace.custom_tip_1')"></p>
      <p v-html="$t('workspace.custom_tip_2')"></p>
      <template #footer>
        <button
          class="primary-small-button"
          @click="tipVisible = false"
          v-track-label="$commonTrackLabel('tip_close_button')"
        >
          {{ $t('common.alert_ok') }}
        </button>
      </template>
    </custom-dialog>
  </div>
</template>

<script>
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import WorkflowOperationsMixins from '@/mixins/WorkflowOperationsMixins'
  import ImageSizeSet from './ImageSizeSet.vue'

  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import AnimeJob from '@/components/job/AnimeJob.vue'
  import JobList from '@/components/job/JobList'
  import CustomDialog from '@/components/CustomDialog.vue'
  import Enlarge3Job from '@/components/job/Enlarge3Job.vue'
  import { deepClone } from '@/static/script/utils'
  import Slider from '@/components/Slider.vue'
  import VaSwitch from '@/components/Switch.vue'
  export default {
    name: 'EnlargeJob',
    components: {
      ImageSizeSet,
      Enlarge3Job,
      CustomDialog,
      JobList,
      WorkflowOperations,
      AnimeJob,
      Slider,
      VaSwitch,
    },
    mixins: [WorkflowOperationsMixins],
    props: {
      index: Number,
      job: String,
      config: Object,
      image: Object,
      initWorkType: String,
      initModel: String,
      initScale: String,
      isBatch: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        activeJob: WorkFlowType.enlarge3,
        isAppendConfig: false,
        defaultFlows: [],
        WorkFlowType,
        open1: true,
        open2: true,
        tipVisible: false,
        modalType: 'STANDARD',
        jobs: [
          {
            job: WorkFlowType.enlarge3,
            config: WorkFlowConfig(WorkFlowType.enlarge3),
            label: this.$t('workspace.standard'),
            type: 'STANDARD',
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.enlarge3,
            img: this.$imgPath('/enhance/model_enlarge_photo.png'),
          },
          {
            job: WorkFlowType.chainner,
            elkJob: WorkFlowType.chainner,
            config: WorkFlowConfig(WorkFlowType.real_esrgan),
            label: this.$t('workspace.anime_model'),
            img: this.$imgPath('/enhance/model_enlarge_amime.png'),
          },
          {
            job: WorkFlowType.art_enlarge,
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.chainner,
            config: WorkFlowConfig(WorkFlowType.art_enlarge),
            label: this.$t('workspace.art_cg'),
            img: this.$imgPath('/enhance/model_enlarge_artcg.png'),
          },
          {
            job: WorkFlowType.chainner_txt,
            config: WorkFlowConfig(WorkFlowType.chainner_txt),
            label: this.$t('workspace.text'),
            elkJob: WorkFlowType.chainner_txt,
            elkName: WorkFlowType.chainner_txt,
            img: this.$imgPath('/enhance/model_enlarge_text.png'),
          },
          // {
          //   job: WorkFlowType.enlarge2,
          //   config: WorkFlowConfig(WorkFlowType.enlarge3),
          //   label: this.$t('workspace.low_resolution'),
          //   elkJob: WorkFlowType.enlarge,
          //   elkName: WorkFlowType.enlarge_sr,
          //   module: WorkFlowType.enlarge3,
          //   iconfont_icon: 'icon-s-new',
          //   img: this.$imgPath('/enhance/model_enlarge_compressed.png'),
          // },
          {
            job: WorkFlowType.enlarge_clarity,
            config: WorkFlowConfig(WorkFlowType.enlarge_clarity),
            label: this.$t('workspace.low_resolution'),
            elkJob: WorkFlowType.enlarge_clarity,
            elkName: WorkFlowType.enlarge_clarity,
            module: WorkFlowType.enlarge_clarity,
            iconfont_icon: 'icon-s-new',
            img: this.$imgPath('/enhance/model_enlarge_compressed.png'),
          },
        ],
        img2srConfig: {
          name: WorkFlowType.img2sr,
          config: deepClone(WorkFlowConfig(WorkFlowType.img2sr)),
          sd_script: 'repair_ssr',
        },
        enhance_faces: false,
        high_quality: false,
        currentConfig: null,
        denoise_auto: true,
        denoising_strength: 0.1,
      }
    },
    computed: {
      activeJobConfig() {
        if (this.currentJob) {
          return this.currentJob.config
        }
        return null
      },
      currentJob() {
        const filter = this.jobs.filter((item) => item.job === this.activeJob)
        if (filter.length) {
          return filter[0]
        } else {
          return null
        }
      },
      // isNewEnlargeModel() {
      //   return this.$store.state.isNewEnlargeModel
      //   return true
      // },
    },
    watch: {
      initModel(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          const config = {
            job: WorkFlowType.art_enlarge,
            elkJob: WorkFlowType.enlarge,
            elkName: WorkFlowType.enlarge,
            config: WorkFlowConfig(WorkFlowType.art_enlarge),
            label: this.$t('workspace.art_cg'),
            img: this.$imgPath('/enhance/model_enlarge_artcg.png'),
          }
          const artEnlargeConfig = WorkFlowConfig(WorkFlowType.art_enlarge)
          if (this.initScale == '4') {
            artEnlargeConfig.module_params.scale = 4
          }

          artEnlargeConfig.module_params.width = 60
          artEnlargeConfig.module_params.height = 70
          config.config = artEnlargeConfig
          this.jobs[2].config = artEnlargeConfig
          this.handleJobSwitch(config)
        }
      },
      activeJobConfig: {
        handler(val) {
          const config = deepClone(this.activeJobConfig)
          const configObj = {
            name: this.activeJob,
            elkName: this.currentJob.elkName,
            elkJob: this.currentJob.elkJob,
          }
          //Enlarge增加基于StableSR的超分复原的自定义处理
          if (this.currentJob.elkName === WorkFlowType.enlarge_sr) {
            configObj.index = 1
            configObj.modelExtendFlag = true
            configObj.modelExtend = [
              {
                index: 0,
                modal: this.img2srConfig,
              },
            ]
          }

          this.changeConfigForParent([{ ...configObj, config }])
        },
        deep: true,
        immediate: true,
      },
      denoising_strength(val) {
        if (this.currentConfig) {
          this.changeConfigForParent(this.currentConfig)
        }
      },
      enhance_faces(val) {
        if (this.currentConfig) {
          this.changeConfigForParent(this.currentConfig)
        }
      },
    },

    mounted() {
      this.initWorkType && (this.activeJob = this.initWorkType)
      this.defaultFlows = [this.config]
      this.$emit('selEnlagerTypeFun', 'Standard')
    },
    methods: {
      showTip() {
        this.tipVisible = true
      },
      selModelFun(req) {
        this.$emit('selModelFun', req)
      },
      openBoxFun(req) {
        this[req] = !this[req]
      },
      changeActiveJob(job) {
        this.$emit('changeActiveJob', job, this.index, this.modalType)
      },
      changeConfigForParent(config) {
        this.currentConfig = deepClone(config)
        if (this.activeJob === WorkFlowType.enlarge_clarity) {
          const configObj = deepClone(config[0])
          configObj.modelExtendFlag = true
          configObj.config.module_params.denoising_strength = this.denoising_strength
          this.$emit('changeConfig', [configObj], this.index, this.modalType)
          return
        }
        //photo模型选中时追加人脸增强模型
        if (this.activeJob === WorkFlowType.enlarge3 && this.enhance_faces) {
          const configObj = deepClone(config[0])
          configObj.index = 0
          configObj.modelExtendFlag = true
          configObj.modelExtend = [
            {
              index: 1,
              modal: {
                name: WorkFlowType.CodeFormer,
                config: deepClone(WorkFlowConfig(WorkFlowType.CodeFormer)),
              },
            },
          ]
          this.$emit('changeConfig', [configObj], this.index, this.modalType)
        } else {
          this.$emit('changeConfig', config, this.index, this.modalType)
        }
      },
      handleJobSwitch(item) {
        this.selBtnFun(item)

        this.activeJob = item.job
        this.modalType = item.type
        //如果不存在elkJob,就取job
        this.$emit('changeActiveJob', item.elkJob || item.job, this.index, this.modalType)
        this.$emit('changeEnlargeActiveModel', item.job)
      },
      selBtnFun(item) {
        const dataJson = {
          enlarge: 'Standard',
          chainner: 'Anime',
          art_enlarge: 'Art_CG',
          chainner_txt: 'Text',
          enlarge_clarity: 'Low_Resolution',
        }
        this.$emit('selEnlagerTypeFun', dataJson[item.job])
      },
      changeSliderHandle(val, attr) {
        if (attr === 'denoise_auto') {
          this.denoising_strength = Number(((0.25 / 100) * val + 0.1).toFixed(2))
          return
        }
        this.img2srConfig.config.module_params.denoising_strength = Number(
          (0.8 + (0.2 / 100) * val).toFixed(2)
        )
      },
      changeSwitchHandle(val, bindedAttribute) {
        if (bindedAttribute === 'denoise_auto') {
          if (val) {
            this.denoising_strength = 0.1
          }
          this.denoise_auto = val
          return
        }
        if (bindedAttribute) {
          this[bindedAttribute] = val
        } else {
          this.img2srConfig.config.module_params.denoising = !val
        }
      },
    },
    head() {
      const imageList = [
        this.$imgPath('/enhance/model_enlarge_photo.png'),
        this.$imgPath('/enhance/model_enlarge_amime.png'),
        this.$imgPath('/enhance/model_enlarge_artcg.png'),
        this.$imgPath('/enhance/model_enlarge_text.png'),
        this.$imgPath('/enhance/model_enlarge_compressed.png'),
        this.$imgPath('/sample/enlarge/thumbnail/1.jpg'),
        this.$imgPath('/sample/enlarge/thumbnail/2.jpeg'),
        this.$imgPath('/sample/enlarge/thumbnail/3.jpg'),
        this.$imgPath('/sample/enlarge/thumbnail/4.jpg'),
        this.$imgPath('/sample/enlarge/thumbnail/5.jpg'),
        this.$imgPath('/sample/enlarge/thumbnail/6.jpg'),
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
  .enlarge-job {
    .image-size-set {
      padding: 10px;
      margin-bottom: 10px;
    }

    .additional-setting-ctr {
      padding: 10 / @base;
      margin-top: -20 / @base;

      .switch-title {
        margin: 10 / @base 0 10 / @base;
        font-size: 16 / @base;
        text-align: left;
      }

      .switch-wrap {
        display: flex;
        justify-content: space-between;
      }

      .switch-label {
        font-size: 14 / @base;
      }
    }

    .enlarge-job_title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10 / @base;
      margin: 10 / @base 0 0;
      font-size: 16 / @base;

      &.mag-b-10 {
        margin-bottom: 10 / @base;
      }
    }

    .enlarge-job_mini-title {
      font-size: 14 / @base;
    }

    .enlarge-job_configs {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10 / @base;
      margin-bottom: 10 / @base;

      .enlarge-job_config_types {
        display: flex;
        align-items: center;
      }

      .enlarge-job_configs_item {
        padding: 5 / @base;
        font-size: 14 / @base;
        text-align: center;
        background-color: #ededed;
        border-radius: 3px;

        &:hover {
          color: #0374ff;
        }

        .icons {
          margin-right: 10 / @base;
        }
      }

      .enlarge-job_configs_item.is-active {
        color: #fff;
        background-color: #0374ff;
      }

      > :first-child {
        border-radius: 3px 0 0 3px;
      }

      > :last-child {
        border-radius: 0 3px 3px 0;
      }
    }

    .enlarge-job_switch {
      display: flex;
      justify-content: space-between;
    }

    /deep/ .workflow-operator {
      .radio-group > div {
        margin-right: 16 / @base;
      }
    }
  }

  .open-btn {
    cursor: pointer;
    transition: transform 0.3s;

    &.open {
      transform: rotate(180deg);
    }
  }

  .open-box {
    height: 0;
    overflow: hidden;

    &.open {
      height: auto;
    }
  }

  .high-quality-wrap {
    margin-bottom: 0 !important;
  }

  /deep/.feature-dialog.mask .dialog-container {
    .dialog-content {
      padding: 20px 10px 20px 20px;
    }

    .dialog-footer {
      justify-content: center;
      background: #fff;
      border-top: 1px solid #c2c1c1;
    }
  }
</style>
