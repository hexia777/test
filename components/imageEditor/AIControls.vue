<template>
  <div class="ai-controls">
    <!-- Sharpen  -->
    <div v-show="activeUtil === 'sharpen'" class="sharpen">
      <div>
        <ul v-show="isQualityEnhancements">
          <li
            v-for="item in enhancements"
            :key="item.key"
            @click="onAiHandle(item)"
            v-track-label="$commonTrackLabel('select_ai_handle_' + item.function)"
          >
            <i class="iconfont-single" :class="item.icon"></i>
            <button>{{ item.title }}</button>
          </li>
        </ul>
        <ul v-show="!isQualityEnhancements">
          <li
            v-for="item in restorations"
            :key="item.id"
            @click="onAiHandle(item)"
            v-track-label="$commonTrackLabel(item.function)"
          >
            <i class="iconfont-single" :class="item.icon"></i>
            <button>{{ item.title }}</button>
          </li>
        </ul>
      </div>
      <div class="sharpen-type">
        <ul>
          <li
            @click="() => selectSharpenType('QualityEnhancements')"
            :class="{ 'active-sharpen-type': isQualityEnhancements }"
          >
            <button v-track-label="$commonTrackLabel('quality_enhancement')">
              {{ $t('workspace.edit_ai_1') }}
            </button>
          </li>
          <li
            @click="() => selectSharpenType('PhotoRestoration')"
            :class="{ 'active-sharpen-type': !isQualityEnhancements }"
          >
            <button v-track-label="$commonTrackLabel('photo_restoration')">
              {{ $t('workspace.edit_ai_6') }}
            </button>
          </li>
        </ul>
      </div>
    </div>
    <!-- Cutout 使用其他取色器 -->
    <div v-show="activeUtil === 'cutout'" class="cutout">
      <div class="bg-c-img">
        <div class="color-picker">
          <div @click.stop>
            <color-picker @input="onBgColorChange" :value="colors" v-show="showColorPicker" />
            <i class="icon icon_transparents">
              <div
                class="select-color"
                :style="{ backgroundColor: colors.hex, opacity: colors.a }"
                @click="selectColor"
                v-track-label="$commonTrackLabel('select_color')"
              >
                <span class="circle"></span>
              </div>
            </i>
          </div>
        </div>
        <div @click="selectImage" class="image-upload-box">
          <!-- <span>{{ $t('workspace.select_image') }}</span> -->
          <i class="iconfont-single icon-s-select-image"></i>

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            class="image-input"
            @change="onBgImageUpload"
          />
        </div>
      </div>
      <div class="cutout-type">
        <ul>
          <li
            class="cutout-item"
            v-for="item in cutouts"
            :key="item.id"
            @click="onAiHandle(item)"
            v-track-label="$commonTrackLabel('select_ai_handle_' + item.subId)"
          >
            <button>{{ item.title }}</button>
          </li>
        </ul>
      </div>
    </div>
    <!-- Erase 样式自行实现 应用使用编辑器应用 -->
    <div v-show="activeUtil === 'erase'" class="erase">
      <div class="el-slider">
        <el-slider
          :min="1"
          :max="100"
          :value="brushSize"
          @input="onDraw"
          v-track-label="$commonTrackLabel('erase_slider')"
        />
      </div>
      <el-checkbox
        :value="isAutoRemove"
        @change="onAutoRemoteChange"
        v-track-label="$commonTrackLabel('auto-remove')"
      >
        {{ $t('workspace.auto_remove') }}
      </el-checkbox>
      <div
        class="remove-object-btn"
        @click="onEraseAI"
        :class="{ 'remote-btn-disable': isAutoRemove }"
        v-track-label="$commonTrackLabel('remove_object')"
      >
        <i class="iconfont-single icon-s-erase"></i>
        <span>{{ $t('workspace.remove_object') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { WorkFlowType } from '@/static/script/workflow_util'
  import ColorPicker from '@/components/colorPicker/ColorPicker.vue'
  import { fileToDataURL, dataURLToBlob, blobToImagePath } from '@/static/script/utils'

  export default {
    name: 'AIControls',
    components: { ColorPicker },
    props: {
      activeUtil: {
        type: String,
        default: '',
      },
      brushSize: {
        type: Number,
        default: 20,
      },
      isAutoRemove: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        colors: { hex: '#67c23a', a: 1 },
        isQualityEnhancements: true,
        // brushSize: 20,
        checked: true,
        showColorPicker: false,
      }
    },
    computed: {
      getBrushSize() {
        return this.brushSize
      },
      enhancements() {
        return [
          {
            key: '1',
            id: WorkFlowType.enlarge3,
            params: { scale: 2 },
            title: this.$t('workspace.edit_ai_2'),
            icon: 'icon-s-enlarge-2x',
            iconHover: 'icon_2x_enlargement_hover',
            function: 'enlarge_2x',
          },
          {
            key: '2',
            id: WorkFlowType.enlarge3,
            params: { scale: 4 },
            title: this.$t('workspace.edit_ai_3'),
            icon: 'icon-s-enlarge-4x',
            iconHover: 'icon_4x_enlargement_hover',
            function: 'enlarge_4x',
          },
          {
            key: '3',
            id: WorkFlowType.sharpen,
            title: this.$t('workspace.edit_ai_4'),
            icon: 'icon-s-sharpen',
            iconHover: 'icon_sharpen_hover',
            function: 'sharpen',
          },
          {
            key: '4',
            id: WorkFlowType.denoise,
            title: this.$t('workspace.edit_ai_5'),
            icon: 'icon-s-erase',
            iconHover: 'icon_denoise_hover',
            function: 'denoise',
          },
        ]
      },
      restorations() {
        return [
          {
            id: WorkFlowType.repair,
            title: this.$t('workspace.edit_ai_7'),
            icon: 'icon-s-sharpen-2',
            iconHover: 'icon_quality_restore_hover',
            function: 'restore_quality',
          },
          {
            id: WorkFlowType.colorize,
            title: this.$t('workspace.edit_ai_8'),
            icon: 'icon-s-colorise',
            iconHover: 'icon_colorise_hover',
            function: 'colorize',
          },
          {
            id: WorkFlowType.portrait_enhancer,
            title: this.$t('workspace.edit_ai_9'),
            icon: 'icon-s-portrait-retoucher',
            iconHover: 'icon_portrait_beautify_hover',
            function: 'beautify_portrait',
          },
        ]
      },
      cutouts() {
        return [
          {
            id: WorkFlowType.paddle_matting,
            subId: 'cutouthuman',
            title: this.$t('workspace.edit_cut_2'),
            icon: 'icon_cutout_2',
            iconHover: 'icon_cutout_2_hover',
          },
          {
            id: WorkFlowType.matting,
            subId: 'cutoutobject',
            title: this.$t('workspace.edit_cut_3'),
            icon: 'icon_cutout_1',
            iconHover: 'icon_cutout_1_hover',
          },
        ]
      },
    },
    mounted() {
      document.addEventListener('click', this.hideColorPicker)
    },
    methods: {
      onEraseAI() {
        if (this.isAutoRemove) {
          return
        }
        this.$emit('onEraseAI')
      },
      selectSharpenType(type) {
        if (type === 'QualityEnhancements') {
          this.isQualityEnhancements = true
        } else {
          this.isQualityEnhancements = false
        }
      },
      selectImage() {
        // console.log('selectImageselectImage', this.colors)
      },
      onDraw(brushSize) {
        // this.brushSize = brushSize
        this.$emit('update:brushSize', brushSize)
      },
      onAutoRemoteChange(checked) {
        this.$emit('onAutoRemoteChange', checked)
      },
      hideColorPicker() {
        if (this.showColorPicker) {
          this.showColorPicker = false
        }
      },
      selectColor() {
        this.showColorPicker = true
      },
      async onBgImageUpload(e) {
        const file = e.target.files[0]
        const dataurl = await fileToDataURL(file)
        const blob = dataURLToBlob(dataurl)
        const imgpath = blobToImagePath(blob)
        const image = new Image()
        image.src = imgpath
        image.onload = () => {
          // this.onBackgroundChange(image, true)
          this.$emit('onBgImageChange', imgpath)
          e.target.value = ''
        }
      },
      onBgColorChange(colors) {
        this.colors = colors
        this.$emit('onBgColorChange', this.colors)
      },
      onAiHandle(item, otherParams = {}) {
        // 来源为编辑页面
        otherParams.front_edit = 1
        this.$emit('onAiHandle', item, otherParams)
      },
    },
  }
</script>

<style scoped lang="less">
  .ai-controls {
    position: absolute;
    bottom: 40 / @base;
    left: 0;
    z-index: 12;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100 / @base;
    background-color: #fff;
    // opacity: 0.75;
    // background-color: red;
    .cutout,
    .sharpen {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: 100%;
      padding: 10 / @base 0;

      .sharpen-type,
      .cutout-type {
        margin-top: 10 / @base;
      }

      .active-sharpen-type {
        background-color: rgba(0, 0, 0, 0.15);
        border: 1px solid #b8c7d2;
        border-radius: 30 / @base;
      }
    }

    .erase {
      display: flex;
      align-items: center;
      font-size: 14px;

      // /deep/ .el-checkbox__label {
      //   font-size: 12px;
      // }

      .el-slider {
        width: 150 / @base;
        margin-right: 16 / @base;
      }

      .remove-object-btn {
        margin-left: 16 / @base;
        cursor: pointer;

        .icon-s-erase {
          margin-right: 4 / @base;
          font-size: 15 / @base;
        }
      }

      .remote-btn-disable {
        color: #bfc1c2;

        .icon-s-erase {
          color: #bfc1c2;
        }
      }
    }

    .cutout {
      display: flex;

      .cutout-item {
        border: 1px solid #b8c7d2;
        border-radius: 30 / @base;

        &:hover {
          background-color: rgba(0, 0, 0, 0.15);
        }
      }

      .bg-c-img {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding-top: 4 / @base;
      }

      .color-picker {
        position: relative;
      }
    }

    .icon_transparents {
      width: 24 / @base;
      height: 24 / @base;
      border-radius: 50%;
    }

    .select-color {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24 / @base;
      height: 24 / @base;
      border-radius: 50%;

      .circle {
        display: inline-block;
        width: 12 / @base;
        height: 12 / @base;
        background-color: #fff;
        border-radius: 50%;
      }
    }

    ul {
      display: flex;
      justify-content: center;

      li {
        display: flex;
        align-items: center;
        height: 28 / @base;
        padding: 0 12 / @base;
        margin: 0 10 / @base 0 0;
        font-size: 12px;
        list-style: none;
        border: 1px solid transparent;

        &:hover {
          border: 1px solid #b8c7d2;
          border-radius: 30 / @base;
        }

        button {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0;
          margin: 0;
          background-color: transparent;
          border: 0;
          outline: none;

          span {
            // vertical-align: top;
          }
        }
      }
    }
  }

  .image-upload-box {
    position: relative;
    text-align: center;
    cursor: pointer;

    .icon-s-select-image {
      font-size: 22 / @base;
      cursor: pointer;
    }

    .image-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      opacity: 0;
    }
  }

  .iconfont-single {
    margin-right: 8 / @base;
    font-size: 14 / @base;
  }
</style>
