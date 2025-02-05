<template>
  <div class="tui-con">
    <!-- 图片操作区域 -->
    <div class="main">
      <div class="left-img">
        <div class="l-inner">
          <div v-show="Object.keys(imageParams).length === 0" class="upload-drager-box">
            <upload-to-local @uploadFile="uploadFile">
              <div class="upload-dragger">
                <div class="drag-img-shell">
                  <div class="drag-img-box">
                    <img class="drag-img" width="229" height="97" :src="$imgPath('/common/drag.png')" alt />
                    <img
                      class="drag-img-hover"
                      width="229"
                      height="97"
                      :src="$imgPath('/common/drag-hover.png')"
                      alt
                    />
                  </div>
                  <div class="el-upload__text" v-if="$store.state.locale === 'ja'">
                    <div>
                      <span v-if="!$store.state.mobile" v-html="$t('common.upload_11')"></span>
                      <span class="icon-upload-box">
                        <i class="icon_upload_black"></i>
                        <i class="icon_upload"></i>
                        <em v-html="$t('common.banner_4_1')"></em>
                        <span v-html="$t('common.banner_4_2')"></span>
                      </span>
                    </div>
                  </div>
                  <div class="el-upload__text" v-else>
                    <div>
                      <span v-if="!$store.state.mobile" v-html="$t('common.upload_11')"></span>
                      <span class="icon-upload-box">
                        <i class="icon_upload_black"></i>
                        <i class="icon_upload"></i>
                        <span class="quicksand-bold" v-html="$t('common.upload_12')"></span>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="upload-text-tip">
                  <p>{{ $t('workspace.upload_tip_1') }}{{ $t('workspace.upload_tip_2') }}</p>
                </div>
              </div>
            </upload-to-local>
          </div>
          <div style="width: 100%; height: 100%;">
            <div class="tui-box" ref="tuiBox" v-loading="!initLoaded">
              <div ref="image-editor-box" class="image-editor-box" v-if="cutboxVisible">
                <cutting-box
                  v-if="cuttingBoxType"
                  :disabled-pre-cut="true"
                  :box-width="cuttingBoxObj.width"
                  :box-height="cuttingBoxObj.height"
                  :box-offset-x="cuttingBoxObj.x"
                  :box-offset-y="cuttingBoxObj.y"
                  :box-scale="cuttingBoxObj.scale"
                  :cut-width="0"
                  :cut-height="0"
                  :cutbox-update-flag="cutBoxUpdateFlag"
                  ref="cuttingBox"
                  @changeSize="changeSize"
                  :rate="ratio"
                  @onCrop="onCrop"
                  @onCropVisibile="onCropVisibile"
                  @onCancelCrop="initCropArea"
                  @onWindowEventRegister="onWindowEventRegister"
                  @onWindowEventDestroy="onWindowEventDestroy"
                />
              </div>
              <div id="image-editor-container"></div>
            </div>
            <div class="tui-foot tc">
              <!-- <div @click="uploadFile2" class="open-image-btn">
                <div class="icon-btn horizontal-item">
                  <div class="icons">
                    <i class="icon icon_open_image"></i>
                    <i class="icon_hover icon_open_image_hover"></i>
                  </div>
                  <span class="icon-text">{{ $t('workspace.edit_popup_4') }}</span>
                </div>
              </div> -->
              <el-button class="icon-btn iconfont-ctr" @click="onUndo">
                <div class="icons">
                  <i class="iconfont-single icon-s-pre-step"></i>
                </div>
              </el-button>
              <el-button class="icon-btn iconfont-ctr" @click="onRedo">
                <div class="icons">
                  <i class="iconfont-single icon-s-next-step"></i>
                </div>
              </el-button>
              <!-- <el-button class="icon-btn" @click="onReset">
                <div class="icons">
                  <i class="icon icon_reset"></i>
                  <i class="icon_hover icon_reset_hover"></i>
                </div>
              </el-button> -->
              <el-button
                :class="['drag-mode', 'icon-btn', 'iconfont-ctr', isDrag && 'active-icon']"
                @click="onDrag"
              >
                <div class="icons">
                  <i class="iconfont-single icon-s-move"></i>
                </div>
              </el-button>
              <div class="horizontal-item scale-btn">
                <div class="icons" :class="[cropVisible && 'disable-icon']" @click="onSetScale(-0.05)">
                  <i class="iconfont-single icon-s-ZoomOut"></i>
                </div>
                {{ imageScale }}
                <div class="icons" :class="[cropVisible && 'disable-icon']" @click="onSetScale(0.05)">
                  <i class="iconfont-single icon-s-magnifier"></i>
                </div>
              </div>
              <el-button class="icon-btn scale-wrap" @click="onSetScale(view.initScale, true)">
                <span>1:1</span>
              </el-button>
              <!-- <el-button class="icon-btn" @click="setWatermark">
                <div class="icons">
                  <i class="icon icon_control_group"></i>
                  <i class="icon_hover icon_control_group_hover"></i>
                </div>
              </el-button> -->
            </div>
          </div>
        </div>
      </div>
      <div class="right-haddle">
        <div class="r-inner">
          <div class="header"></div>
          <div class="scroll-bar" style="height: calc(100% - 40px); overflow: auto;">
            <!-- crop image -->
            <!-- <div class="item crop_image">
              <p class="h4" v-html="$t('workspace.edit_crop_1')"></p>
              <div class="radios">
                <p>{{ $t('workspace.edit_crop_2') }}</p>
                <el-select class="select-ratio" v-model="ratio" @change="selRatioFun">
                  <el-option
                    v-for="item in cropOptions"
                    :key="item.val"
                    :label="item.label"
                    :value="item.val"
                  />
                </el-select>
              </div>
              <p>{{ $t('workspace.edit_crop_3') }}</p>
              <div class="inputs crop-ratio">
                <div class="flex1">
                  <el-input
                    :controls="false"
                    v-model="crop.width"
                    @change="onSetCustomCrop('width')"
                    @key.enter.native="onSetCustomCrop('width')"
                  >
                    <i class="crop-icon-font" slot="suffix">W</i>
                  </el-input>
                </div>

                <div class="icons">
                  <i v-if="!ratio" class="icon_lock"></i>
                  <i v-else class="icon_lock_hover"></i>
                </div>

                <div class="flex1">
                  <el-input
                    :controls="false"
                    v-model="crop.height"
                    @change="onSetCustomCrop('height')"
                    @key.enter.native="onSetCustomCrop('height')"
                  >
                    <i class="crop-icon-font" slot="suffix">H</i>
                  </el-input>
                </div>
              </div>
            </div>
            <div class="diving-line"></div> -->
            <div class="item manuals">
              <p class="h4">
                {{ $t('workspace.edit_cut_4') }} <i class="iconfont-single icon-s-diamond"></i>
              </p>
              <div class="ai-list">
                <div
                  class="ai-item ai-horizontal-item"
                  v-for="(item, i) in manuals"
                  :class="[currentDrawId === item.id && 'active-icon']"
                  :key="i"
                  @click="onDraw(item.id, 'click')"
                >
                  <div class="icons">
                    <i :class="['icon', item.icon]"></i>
                    <i :class="['icon_hover', item.iconHover]"></i>
                  </div>
                  <p>{{ item.title }}</p>
                </div>
              </div>
              <span class="min-title">{{ $t('workspace.edit_brush_size') }}</span>
              <div class="horizontal-item">
                <div class="el-slider">
                  <el-slider :min="1" :max="60" @change="onDraw(currentDrawId)" v-model="draw.brushSize" />
                </div>
                <div class="el-num">
                  <el-input-number
                    :min="1"
                    :max="60"
                    @change="onDraw(currentDrawId)"
                    v-model="draw.brushSize"
                    :controls="false"
                  />
                </div>
              </div>
            </div>
            <div class="diving-line"></div>
            <div class="item">
              <p class="h4 reset">{{ $t('workspace.edit_background_1') }}</p>
              <span class="min-title">{{ $t('workspace.edit_background_16') }}</span>
              <div class="horizontal-item">
                <div class="el-slider">
                  <el-slider :min="0" :max="100" @change="onBgBlurChange" v-model="draw.blurSize" />
                </div>
                <div class="el-num">
                  <el-input-number
                    v-model="draw.blurSize"
                    :min="0"
                    :max="100"
                    @change="onBgBlurChange"
                    :controls="false"
                  />
                </div>
              </div>
              <span class="min-title">{{ $t('workspace.edit_background_13') }}</span>
              <vanceai-tabs v-model="activeName">
                <vamceai-tab-pane :name="'color'" :label="$t('workspace.edit_background_12')">
                  <div class="background-list">
                    <div class="background-item position-relative-item">
                      <color-picker-btn />
                      <el-color-picker
                        v-model="bg"
                        show-alpha
                        :predefine="predefineColors"
                        @change="onBeforeBackgroundChange"
                        class="hide-item position-absolute-item"
                      />
                    </div>
                    <thumbnail-block
                      v-for="(item, i) in colorData.backgrounds"
                      class="thumbnail-block"
                      :class="{
                        'active-block': bg === item,
                      }"
                      :key="i"
                      :thumbnail="colorData.thumbnail"
                      :background="item"
                      @click="onBeforeBackgroundChange"
                    />
                  </div>
                </vamceai-tab-pane>
                <vamceai-tab-pane :name="'image'" :label="$t('workspace.edit_background_14')">
                  <div class="background-list">
                    <div class="background-item position-relative-item thumbnail-block upload-block">
                      <div class="icons">
                        <i class="icon icon_upload_32x32"></i>
                        <i class="icon_hover icon_upload_32x32"></i>
                      </div>
                      <p class="text">{{ $t('workspace.edit_background_15') }}</p>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        ref="bgFile"
                        class="hide-item position-absolute-item"
                        @change="onBgImageUpload"
                      />
                    </div>
                    <thumbnail-block
                      v-for="(item, i) in imageData.backgrounds"
                      class="thumbnail-block"
                      :class="{
                        'active-block': bgIndex === item + 1,
                      }"
                      :key="i"
                      :background-image="true"
                      :thumbnail="imageData.thumbnail"
                      :index="item + 1"
                      :background="item < 44 ? $imgPath(`/image_editor/bg${item + 1}.jpg`) : ''"
                      @click="onBeforeBackgroundChange"
                    />
                  </div>
                </vamceai-tab-pane>
              </vanceai-tabs>
            </div>
          </div>
        </div>
        <div class="right-footer tc">
          <div class="pic_out_setting_cont" v-if="showSetting">
            <out-setting
              @confirm="confirmOutSet(true)"
              @close="confirmOutSet(false)"
              :config="outSettingConfigCopy"
              :remember="false"
            />
          </div>
          <el-button
            v-loading="loadImageType"
            @click="downLoadImage"
            class="quicksand-bold btn-main save-download-btn"
          >
            {{ $t('workspace.editor_9') }}
          </el-button>
          <!-- <div class="icon-btn icons" @click="openSetWin">
            <i class="icon icon_setting"></i>
            <i class="icon_hover icon_setting_hover"></i>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import html2canvas from 'html2canvas'
  import UploadImageMixins from '@/mixins/components/UploadImgMixins'
  import ImageFileCompressMixins from '@/mixins/components/ImageFileCompressMixins'
  import UploadToLocal from '@/components/UploadToLocal'
  import ImageEditor from '@/static/script/ImageEditor'
  import Work from '@/static/script/work.js'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import {
    fileToDataURL,
    dataURLToBlob,
    blobToImagePath,
    deepClone,
    setLoginDialogShow,
  } from '@/static/script/utils'
  import outSetting from '@/components/WorkSpace/OutSetting'
  import VanceaiTabs from '@/components/infrastructure/tabs'
  import VamceaiTabPane from '@/components/infrastructure/tab-pane'
  import ThumbnailBlock from '@/components/ThumbnailBlock'
  // 图片裁剪框
  import CuttingBox from '@/components/CuttingBox'
  import ColorPickerBtn from '@/components/ColorPickerBtn'
  //图片dpi修改
  import { changeDpiDataUrl } from 'changedpi'
  export default {
    name: 'ImageEditor',
    components: {
      UploadToLocal,
      CuttingBox,
      outSetting,
      ColorPickerBtn,
      VanceaiTabs,
      VamceaiTabPane,
      ThumbnailBlock,
    },
    mixins: [UploadImageMixins, ImageFileCompressMixins],
    props: {
      imageParams: {
        type: Object,
        default: () => {
          return {
            imageurl: '',
            image: '',
            filename: '',
            w: '',
            h: '',
            type: '',
          }
        },
      },
      aiImageParams: {
        type: Object,
        default: () => {
          return {
            imageurl: '',
            image: '',
            filename: '',
            w: '',
            h: '',
            type: '',
            operater: '',
            transId: '',
          }
        },
      },
      currentTool: {
        type: String,
        default: '1',
      },
    },
    data() {
      return {
        imageEditor: null,
        processTime: null, //处理定时器
        processNum: 0, //定时器
        processType: true, //是否可以处理
        bgSel: '', //背景选择
        scaleNumWidth: 1, //宽度放大倍数
        scaleNumHeight: 1, //高度放大倍数
        fileType: null, //文件类型
        showSetting: false, //显示参数编辑
        uploadFileIntercept: null, //提示用户是否要重新上传图片
        loadImageType: false, //用户下载图片
        cuttingBoxType: false, //裁剪框是否展示
        rotate90: false, //标记旋转状态
        interceptType: null, //拦截
        cuttingBoxObj: {
          //裁剪框所需要参数
          width: null,
          height: null,
        },
        work: null, //当前处理的工作任务
        view: {
          scale: 1,
          initScale: 1,
        },
        isDrag: false,
        ratio: '',
        crop: {
          width: 0, //要使用的图像的宽度
          height: 0, //要使用的图像的高度
        },
        imageSize: {
          originWidth: 0,
          originHeight: 0,
          width: 0,
          height: 0,
        },
        rotateDeg: 0,
        //背景图
        bg: 'transparent',
        bgImg: '',
        bgIndex: '',
        //sharpen
        currentDrawId: '',
        draw: {
          fontFamily: '',
          fontSize: 32,
          color: '#333333',
          strong: false,
          underline: false,
          bevel: false,
          align: 'left',
          lineWidth: 2,
          lineStyle: 'none',
          lineColor: '#333333',
          fillColor: '',
          opacity: 1,
          brushSize: 20,
          cutoutBrush: 20,
          blurSize: 0,
        },
        blurSize: 0,
        triggers: {
          lineWidthVisible: false,
          lineStyleVisible: false,
          alignVisible: false,
        },
        currentSelected: null,

        //输出参数
        outSettingConfig: {
          compress: {
            quality: 95,
          },
          dpi: 72,
          format: 'default',
        },
        //输出参数copy
        outSettingConfigCopy: {},

        prevAction: null,
        cropVisible: false,
        cutBoxUpdateFlag: 0,
        windowEvents: {},
        cutboxVisible: false,
        originImageLoaded: false,
        aiImageLoaded: false,
        timer: null,
        activeName: 'color',
      }
    },
    computed: {
      colorData() {
        return {
          thumbnail: this.aiImageParams.imageurl,
          backgrounds: [
            'transparent',
            'rgb(255, 255, 255)',
            'rgb(244, 67, 54)',
            'rgb(233, 30, 99)',
            'rgb(156, 39, 176)',
            'rgb(103, 58, 183)',
            'rgb(63, 81, 181)',
            'rgb(33, 150, 243)',
            'rgb(3, 169, 244)',
            'rgb(0, 188, 212)',
            'rgb(0, 150, 136)',
            'rgb(76, 175, 80)',
            'rgb(139, 195, 74)',
            'rgb(205, 220, 57)',
            'rgb(255, 235, 59)',
            'rgb(255, 193, 7)',
            'rgb(255, 152, 0)',
            'rgb(255, 87, 34)',
            'rgb(121, 85, 72)',
            'rgb(158, 158, 158)',
            'rgb(96, 125, 139)',
            'rgb(0, 0, 0)',
          ],
        }
      },
      imageData() {
        return {
          thumbnail: this.aiImageParams.imageurl,
          backgrounds: 44,
        }
      },
      initLoaded() {
        return this.originImageLoaded && this.aiImageLoaded
      },
      // cutboxVisible() {
      //   return this.currentTool === '1' && !this.isDrag
      // },
      //用户登录状态
      loginType() {
        return !!this.$store.state.token
      },
      /**
       * @hasImage 是否存在图片
       */
      hasImage() {
        if (Object.keys(this.imageParams).length === 0) {
          return false
        } else {
          return true
        }
      },
      cropOptions() {
        const cropItem = (idx, val = '') => {
          return {
            label: this.$t('workspace.edit_crop_' + idx),
            val,
          }
        }
        return [
          cropItem(5, ''),
          cropItem(6, '1:1'),
          cropItem(7, '2.63:1'),
          cropItem(8, '1.9:1'),
          cropItem(9, '16:9'),
          cropItem(10, '3:1'),
          cropItem(11, '9:16'),
        ]
      },
      enhancements() {
        return [
          {
            id: WorkFlowType.enlarge,
            params: { scale: '2x' },
            title: this.$t('workspace.edit_ai_2'),
            icon: 'icon_2x_enlargement',
            iconHover: 'icon_2x_enlargement_hover',
          },
          {
            id: WorkFlowType.enlarge,
            params: { scale: '4x' },
            title: this.$t('workspace.edit_ai_3'),
            icon: 'icon_4x_enlargement',
            iconHover: 'icon_4x_enlargement_hover',
          },
          {
            id: WorkFlowType.sharpen,
            title: this.$t('workspace.edit_ai_4'),
            icon: 'icon_sharpen',
            iconHover: 'icon_sharpen_hover',
          },
          {
            id: WorkFlowType.denoise,
            title: this.$t('workspace.edit_ai_5'),
            icon: 'icon_denoise',
            iconHover: 'icon_denoise_hover',
          },
        ]
      },
      restorations() {
        return [
          {
            id: WorkFlowType.repair,
            title: this.$t('workspace.edit_ai_7'),
            icon: 'icon_quality_restore',
            iconHover: 'icon_quality_restore_hover',
          },
          {
            id: WorkFlowType.colorize,
            title: this.$t('workspace.edit_ai_8'),
            icon: 'icon_colorise',
            iconHover: 'icon_colorise_hover',
          },
          {
            id: WorkFlowType.portrait_enhancer,
            title: this.$t('workspace.edit_ai_9'),
            icon: 'icon_portrait_beautify',
            iconHover: 'icon_portrait_beautify_hover',
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
      manuals() {
        return [
          {
            id: 'reserve',
            title: this.$t('workspace.edit_cut_5'),
            icon: 'iconfont-single icon-s-expand',
            iconHover: 'iconfont-single icon-s-expand',
          },
          {
            id: 'remove',
            title: this.$t('workspace.edit_cut_6'),
            icon: 'iconfont-single icon-s-shrink',
            iconHover: 'iconfont-single icon-s-shrink',
          },
        ]
      },
      erases() {
        return [
          {
            id: 'removeObject',
            title: this.$t('workspace.edit_erase_2'),
            icon: 'icon_brush',
            iconHover: 'icon_brush_hover',
          },
          // {
          //   id: 'mosaic',
          //   title: this.$t('workspace.edit_erase_3'),
          //   icon: 'icon_mosaics',
          //   iconHover: 'icon_mosaics_hover',
          // },
        ]
      },
      filters() {
        return [
          {
            id: 'none',
            title: this.$t('workspace.edit_filter_9'),
          },
          {
            id: 'vintage',
            title: this.$t('workspace.edit_filter_10'),
          },
        ]
      },
      texts() {
        return [
          {
            id: 'text',
            title: this.$t('workspace.edit_text_2'),
            icon: 'icon_text',
            iconHover: 'icon_text_hover',
          },
          // {
          //   id: 'image',
          //   title: this.$t('workspace.edit_text_3'),
          //   icon: 'icon_image',
          //   iconHover: 'icon_image_hover',
          // },
        ]
      },
      icons() {
        return [
          {
            id: 'curve',
            icon: 'icon_curve',
            iconHover: 'icon_curve_hover',
          },
          {
            id: 'rectangle',
            icon: 'icon_rectangle',
            iconHover: 'icon_rectangle_hover',
          },
          {
            id: 'circular',
            icon: 'icon_circle',
            iconHover: 'icon_circle_hover',
          },
          {
            id: 'line',
            icon: 'icon_line',
            iconHover: 'icon_line_hover',
          },
          {
            id: 'arrow',
            icon: 'icon_arrow',
            iconHover: 'icon_arrow_hover',
          },
          // {
          //   id: 'number',
          //   icon: 'icon_number',
          //   iconHover: 'icon_number_hover',
          // },
          // {
          //   id: 'right',
          //   icon: 'icon_right',
          //   iconHover: 'icon_right_hover',
          // },
          // {
          //   id: 'wrong',
          //   icon: 'icon_wrong',
          //   iconHover: 'icon_wrong_hover',
          // },
          // {
          //   id: 'question_mark',
          //   icon: 'icon_question_mark',
          //   iconHover: 'icon_question_mark_hover',
          // },
          // {
          //   id: 'flag',
          //   icon: 'icon_flag',
          //   iconHover: 'icon_flag_hover',
          // },
        ]
      },
      lineWidths() {
        return [
          {
            width: 0,
          },
          {
            width: 1,
          },
          {
            width: 2,
          },
          {
            width: 4,
          },
          {
            width: 6,
          },
          {
            width: 8,
          },
          {
            width: 12,
          },
        ]
      },
      lineStyles() {
        const arr = [
          {
            width: 'none',
          },
          {
            width: '8:2',
          },
          {
            width: '3:3',
          },
        ]
        if (this.currentDrawId === 'text') {
          arr.unshift({
            width: null,
          })
        }
        return arr
      },
      aligns() {
        return [
          {
            type: 'left',
            icon: 'icon_text_align_l',
            iconHover: 'icon_text_align_l_hover',
          },
          {
            type: 'center',
            icon: 'icon_text_align_c',
            iconHover: 'icon_text_align_c_hover',
          },
          {
            type: 'right',
            icon: 'icon_text_align_r',
            iconHover: 'icon_text_align_r_hover',
          },
        ]
      },
      imageScale() {
        return (this.view.scale * 100).toFixed(0) + '%'
      },
      showFontFamily() {
        return (
          this.currentDrawId === 'text' ||
          this.currentDrawId === 'number' ||
          this.currentDrawId === 'right' ||
          this.currentDrawId === 'wrong' ||
          this.currentDrawId === 'question_mark' ||
          this.currentDrawId === 'flag'
        )
      },
      showFontSize() {
        return (
          this.currentDrawId === 'text' ||
          this.currentDrawId === 'number' ||
          this.currentDrawId === 'right' ||
          this.currentDrawId === 'wrong' ||
          this.currentDrawId === 'question_mark' ||
          this.currentDrawId === 'flag'
        )
      },
      showColor() {
        return (
          this.currentDrawId === 'text' ||
          this.currentDrawId === 'number' ||
          this.currentDrawId === 'right' ||
          this.currentDrawId === 'wrong' ||
          this.currentDrawId === 'question_mark' ||
          this.currentDrawId === 'flag'
        )
      },
      showStrong() {
        return this.currentDrawId === 'text'
      },
      showBevel() {
        return this.currentDrawId === 'text'
      },
      showUnderline() {
        return this.currentDrawId === 'text'
      },
      showAlign() {
        return this.currentDrawId === 'text'
      },
      showLineColor() {
        return (
          this.currentDrawId === 'text' ||
          this.currentDrawId === 'curve' ||
          this.currentDrawId === 'line' ||
          this.currentDrawId === 'circular' ||
          this.currentDrawId === 'rectangle' ||
          this.currentDrawId === 'arrow'
        )
      },
      showLineStyle() {
        return (
          this.currentDrawId === 'curve' ||
          this.currentDrawId === 'line' ||
          this.currentDrawId === 'circular' ||
          this.currentDrawId === 'rectangle'
        )
      },
      showLineWeight() {
        return (
          this.currentDrawId === 'text' ||
          this.currentDrawId === 'curve' ||
          this.currentDrawId === 'line' ||
          this.currentDrawId === 'circular' ||
          this.currentDrawId === 'rectangle' ||
          this.currentDrawId === 'arrow'
        )
      },
      showFillColor() {
        return (
          this.currentDrawId === 'text' ||
          this.currentDrawId === 'circular' ||
          this.currentDrawId === 'rectangle' ||
          this.currentDrawId === 'number' ||
          this.currentDrawId === 'right' ||
          this.currentDrawId === 'wrong' ||
          this.currentDrawId === 'question_mark' ||
          this.currentDrawId === 'flag'
        )
      },
      drawParams() {
        if (this.currentSelected) {
          return this.currentSelected
        } else {
          return this.draw
        }
      },
      predefineColors() {
        return [
          '#d71345',
          '#f47920',
          '#c37e00',
          '#ffd400',
          '#145b7d',
          '#45b97c',
          '#8552a1',
          '#000000',
          '#ffffff',
        ]
      },
    },
    watch: {
      'draw.blurSize'(val) {
        this.blurSize = val * 5
      },
      initLoaded(val) {
        if (val) {
          this.onDraw('remove')
        }
      },
      loginType: {
        handler(newData) {
          this.imageEditor.setWatermarkVisible(!newData)
        },
      },
      cutboxVisible(val) {
        if (val) {
          this.initCuttingBoxFun()
        }
      },
      aiImageParams: {
        handler(val) {
          if (val && val.image) {
            this.timer = setInterval(() => {
              if (this.originImageLoaded) {
                clearInterval(this.timer)
                this.imageEditor.setImageType(val.type)
                this.imageEditor.ai(val.image, val.transId, val.operater)
                this.aiImageLoaded = true
              }
            }, 1000)
          }
        },
        deep: true,
      },
      imageParams: {
        handler(val) {
          if (val && val.image) {
            this.setImageSize(val.w, val.h)
            this.loadImage()
          }
        },
        deep: true,
      },
      currentTool(val) {
        this.switchMode(val)
      },
      isDrag(val) {
        if (val) {
          this.$nextTick(() => {
            this.$el.querySelector('.drag-mode').classList.add('active-drag')
            setTimeout(() => {
              this.$el.querySelector('.drag-mode').classList.remove('active-drag')
            }, 2000)
          })
        }
      },
    },
    mounted() {
      //复制输出参数弹窗
      this.outSettingConfigCopy = deepClone(this.outSettingConfig)

      this.initImageEditor('#image-editor-container', { watermarkVisible: !this.loginType })
    },
    destroyed() {
      this.onWindowEventDestroy()
    },
    methods: {
      bgBlurInputChange(val) {
        this.draw.blurSize = val / 5
      },
      onWindowEventRegister(event, callback) {
        if (this.windowEvents[event]) {
          window.removeEventListener(event, this.windowEvents[event])
        }
        this.windowEvents[event] = callback
        window.addEventListener(event, callback)
      },
      onWindowEventDestroy(event) {
        if (event) {
          if (this.windowEvents[event]) {
            window.removeEventListener(event, this.windowEvents[event])
          }
        } else {
          for (const key in this.windowEvents) {
            if (this.windowEvents[key]) {
              window.removeEventListener(key, this.windowEvents[key])
            }
          }
        }
        // window.removeEventListener('mousedown', this.windowMouseDownEvent)
        // window.removeEventListener('mousemove', this.windowMouseMoveEvent)
        // window.removeEventListener('mouseup', this.windowMouseUpEvent)
        // window.removeEventListener('mouseleave', this.windowMouseLeaveEvent)
      },
      onCropVisibile(val) {
        if (this.currentTool === '1') {
          this.cropVisible = true
        } else {
          this.cropVisible = val
        }
      },
      cancelProcess() {
        this.processType = false
        if (this.processTime) {
          clearTimeout(this.processTime)
          this.processTime = null
        }
      },
      onFontChange(item) {
        this.drawParams.fontFamily = `'${item.font}',${item.spare}`
        this.onDraw(this.currentDrawId)
      },
      initCropArea() {
        this.crop.width = 0
        this.crop.height = 0
      },
      /**
       * @enlargeFun 图片放大功能
       */
      enlargeFun(item) {
        if (!item.params) {
          return
        }
        const scale = item.params.scale
        if (scale === '2x') {
          this.imageSize.originWidth *= 2
          this.imageSize.originHeight *= 2

          this.imageSize.height *= 2
          this.imageSize.width *= 2
        } else if (scale === '4x') {
          this.imageSize.originWidth *= 4
          this.imageSize.originHeight *= 4

          this.imageSize.height *= 4
          this.imageSize.width *= 4
        }
      },
      /**
       * @confirmOutSet 确认参数设置
       */
      confirmOutSet(req) {
        if (req) {
          this.outSettingConfig = deepClone(this.outSettingConfigCopy)
        }
        this.showSetting = false
      },
      /**
       * @openSetWin
       */
      openSetWin() {
        this.outSettingConfigCopy = deepClone(this.outSettingConfig)
        this.showSetting = true
      },
      /**
       * @getGraphical 获取图形
       */
      getGraphical() {
        return new Promise((resolve) => {
          const frame = document.querySelector('div[data-tag="frame"]').cloneNode(true)
          frame.style.zIndex = '-1'
          frame.style.position = 'fixed'

          const container = frame.querySelector('div[data-tag="container"]')
          container.style.background = 'none'
          const moveCanvas = container.querySelector('.lower-canvas')
          container.removeChild(moveCanvas)
          const eventCanvas = container.querySelector('.upper-canvas')
          container.removeChild(eventCanvas)

          const view = frame.querySelector('div[data-tag="view"]')
          frame.removeChild(view)

          document.getElementsByTagName('body')[0].appendChild(frame)

          //图层画布
          //图片尺寸大小
          const viewSize = this.imageEditor.getViewSize()

          html2canvas(frame, {
            width: viewSize.w,
            height: viewSize.h,
            allowTaint: true,
            backgroundColor: 'none',
          }).then(function (canvas) {
            const img = new Image()
            img.src = canvas.toDataURL()
            img.onload = () => {
              resolve(img)
              frame.remove()
            }
          })
        })
      },
      setWatermark() {
        this.imageEditor.setWatermarkVisible(false)
      },
      async getImage() {
        const image = await this.imageEditor.getImage()
        document.body.appendChild(image)
      },
      getSvgLayout() {
        return new Promise((resolve, reject) => {
          const svg = this.imageEditor.getSvg().cloneNode(true)
          console.log(svg)
          if (svg) {
            const size = this.imageEditor.getImageSize()
            const child = svg.querySelector('svg')
            child.setAttribute('width', size.w)
            child.setAttribute('height', size.h)
            child.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`)
            svg.style.opacity = 1
            svg.style.position = 'absolute'
            svg.style.top = `-${size.h}px`
            svg.style.left = `-${size.w}px`
            document.body.appendChild(svg)
            html2canvas(svg, {
              width: size.w,
              height: size.h,
              allowTaint: true,
              backgroundColor: 'none',
            }).then((canvas) => {
              const img = new Image()
              img.src = canvas.toDataURL()
              img.onload = () => {
                document.body.removeChild(svg)
                console.log(img)
                resolve(img)
              }
            })
          } else {
            resolve()
          }
        })
      },
      /**
       * @downLoadImage 下载图片
       */
      async downLoadImage() {
        //是否存在图片
        if (!this.hasImage) {
          return
        }

        //锁定用户下载
        if (this.loadImageType) {
          return
        }
        this.clickImageEditorDownloadBtnELK()
        this.loadImageType = true

        //获取图形层
        // const graphicalImg = await this.getSvgLayout()
        // if (!graphicalImg) {
        //   this.loadImageType = false
        //   return
        // }
        const graphicalImg = await this.getGraphical()
        //图片尺寸大小
        const imgW = this.imageSize.originWidth
        const imgH = this.imageSize.originHeight
        const canvas = document.createElement('canvas')
        canvas.width = imgW
        canvas.height = imgH

        //图片
        // const image = await this.imageEditor.getImage()
        //获取背景
        // const bg = this.imageEditor.getBackground()
        // if (bg) {
        //   bg.render(canvas)
        // }
        const ctx = canvas.getContext('2d')
        // const img = new Image()
        // img.src = image.getAttribute('src')
        // img.setAttribute('crossOrigin', 'anonymous')
        // img.onload = () => {
        // ctx.drawImage(img, 0, 0, imgW, imgH)
        ctx.drawImage(graphicalImg, 0, 0, imgW, imgH)
        //标记用户是否已经将编辑过的图片下载了
        this.imageEditor.initImageChanged()
        //下载图片
        let imgType = this.imageEditor.getImageType() || 'jpg'
        //用户设置输出参数
        if (this.outSettingConfig.format !== 'default') {
          imgType = this.outSettingConfig.format
        }
        //压缩比例
        const quality = this.outSettingConfig.compress.quality / 100

        const typeJson = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
        }

        //文件压缩处理
        const href = canvas.toDataURL(typeJson[imgType], quality)

        const a = document.createElement('a') // 创建a标签
        let outHref = null
        let dpiData = null

        //dpi设置
        if (this.outSettingConfig.dpi === 'default') {
          outHref = href
        } else {
          if (this.outSettingConfig.dpi === 'custom') {
            dpiData = changeDpiDataUrl(href, this.outSettingConfig.custom)
          } else {
            dpiData = changeDpiDataUrl(href, this.outSettingConfig.dpi)
          }
          outHref = dpiData
        }
        //上报下载事件
        this.$trace.traceCustomEvent({
          event: 'editor',
          xargs_event_category: 'editor',
          event_value: 'save_img',
        })

        a.download = Date.now() + '.' + imgType // 设置图片名字
        a.href = outHref
        a.dispatchEvent(new MouseEvent('click'))

        //恢复用户下载
        this.loadImageType = false
        // }
      },
      testFun() {
        this.$refs['cuttingBox'].setCuttingBox()
      },
      /**
       * @verificationMoney 余额校验
       */
      verificationMoney(reqData) {
        //余额不足
        if (reqData.code === 10012) {
          this.$emit('pointWinFun', true)
          return false
        } else if (reqData.code !== 200) {
          //处理失败
          this.$emit('aiFailFun', true)
          return false
        }
        return true
      },
      /**
       * @changeSize 裁剪框大小调整
       */
      changeSize(req) {
        this.crop.width = req.width
        this.crop.height = req.height
      },
      /**
       * @selRatioFun 选择比例
       */
      selRatioFun() {
        this.initCropArea()
        // setTimeout(() => {
        //   this.$refs['cuttingBox'].loadImage()
        // }, 0)
      },

      calculateDasharray(item, lineWidth = 5) {
        if ((item === 'none' || !item) && item.indexOf(':') === -1) {
          return item
        } else {
          const arr = item.split(':')
          return `${lineWidth * Number(arr[0])} ${lineWidth * Number(arr[1])}`
        }
      },
      onTrigger(key, flag = '1') {
        this.triggers[key] = flag === '1' ? !this.triggers[key] : flag
      },
      onSetDrawParams(e, key, val, trigger) {
        if (e) {
          e.stopPropagation()
        }
        this.drawParams[key] = val
        this.onDraw(this.currentDrawId)
        if (trigger) {
          this.onTrigger(trigger, false)
        }
      },
      switchMode(val) {
        if (val === '1') {
          this.onDraw()
          this.onSetScale(1, true)
        } else if (val === '2') {
          this.onDraw()
        } else if (val === '3') {
          this.onDraw()
        } else if (val === '4') {
          this.onDraw()
        } else if (val === '5') {
          this.onDraw()
        } else if (val === '6') {
          this.onDraw()
        }
      },
      onDraw(type, action) {
        if (this.currentDrawId !== type) {
          this.currentSelected = null
        } else if (action === 'click') {
          this.setAction(ImageEditor.MODE.NONE)
          this.cutboxVisible = false
          this.currentDrawId = ''
          return
        }
        this.cutboxVisible = false
        this.cuttingBoxType = false
        let shape, mode
        if (type === 'curve') {
          shape = ImageEditor.SHAPE.CURVE
          mode = ImageEditor.MODE.SHAPE
        } else if (type === 'rectangle') {
          shape = ImageEditor.SHAPE.RECTANGLE
          mode = ImageEditor.MODE.SHAPE
        } else if (type === 'circular') {
          shape = ImageEditor.SHAPE.CIRCULAR
          mode = ImageEditor.MODE.SHAPE
        } else if (type === 'line') {
          shape = ImageEditor.SHAPE.LINE
          mode = ImageEditor.MODE.SHAPE
        } else if (type === 'arrow') {
          shape = ImageEditor.SHAPE.ARROW
          mode = ImageEditor.MODE.SHAPE
        } else if (type === 'text') {
          mode = ImageEditor.MODE.TEXT
        } else if (type === 'removeObject') {
          //校验用户身份
          if (!this.identityCheck()) {
            return
          }
          shape = ImageEditor.SHAPE.REMOVERRUSH
          mode = ImageEditor.MODE.SHAPE
        } else if (type === 'reserve') {
          shape = ImageEditor.BRUSH.RESERVE
          mode = ImageEditor.MODE.MASK_BRUSH
        } else if (type === 'remove') {
          shape = ImageEditor.BRUSH.REMOVE
          mode = ImageEditor.MODE.MASK_BRUSH
        } else if (type === 'mosaic') {
          shape = ImageEditor.BRUSH.MOSAIC
          mode = ImageEditor.MODE.BRUSH
        } else {
          mode = ImageEditor.MODE.SHAPE
        }

        this.currentDrawId = type

        if (
          mode === ImageEditor.MODE.SHAPE ||
          mode === ImageEditor.MODE.MASK_BRUSH ||
          mode === ImageEditor.MODE.BRUSH
        ) {
          this.isDrag = false
          this.imageEditor.setGlobalParamsOfEvent('canDrag', false)
          this.setAction(
            mode,
            {
              onSelected: (item) => {
                this.currentSelected = item.selected
                if (item.action === ImageEditor.MODE.SHAPE) {
                  if (item.type === ImageEditor.SHAPE.RECTANGLE) {
                    this.currentDrawId = 'rectangle'
                  } else if (item.type === ImageEditor.SHAPE.CIRCULAR) {
                    this.currentDrawId = 'circular'
                  } else if (item.type === ImageEditor.SHAPE.TRIANGLE) {
                    this.currentDrawId = 'triangle'
                  } else if (item.type === ImageEditor.SHAPE.ARROW) {
                    this.currentDrawId = 'arrow'
                  } else if (item.type === ImageEditor.SHAPE.LINE) {
                    this.currentDrawId = 'line'
                  } else if (item.type === ImageEditor.SHAPE.CURVE) {
                    this.currentDrawId = 'curve'
                  }
                } else if (item.action === ImageEditor.MODE.TEXT) {
                  this.currentDrawId = 'text'
                }
              },
              onUnselect: () => {
                this.currentSelected = null
                this.setActionParams({
                  ...this.drawParams,
                  type: shape,
                })
              },
              onRemoveBrush: (blob) => {
                //开启处理流程
                this.processType = true
                this.$emit('processingFun', true)
                const image = new Image()
                image.src = window.URL.createObjectURL(blob)
                image.onload = async () => {
                  try {
                    const work = await this.initWork(image)
                    const { uid } = await this.uploadImg(work)
                    if (!this.processType) {
                      return
                    }
                    this.onAiHandle({ id: 'inpaint' }, { mask_uid: uid })
                  } catch (e) {
                    this.$emit('processingFun', false)
                  }
                }
                image.onerror = () => {
                  this.$emit('processingFun', false)
                }
              },
            },
            {
              ...this.drawParams,
              type: shape,
            }
          )
        } else {
          this.setAction(
            mode,
            {
              onSelected: (item) => {
                this.currentSelected = item.selected
                if (item.action === ImageEditor.MODE.SHAPE) {
                  if (item.type === ImageEditor.SHAPE.RECTANGLE) {
                    this.currentDrawId = 'rectangle'
                  } else if (item.type === ImageEditor.SHAPE.CIRCULAR) {
                    this.currentDrawId = 'circular'
                  } else if (item.type === ImageEditor.SHAPE.TRIANGLE) {
                    this.currentDrawId = 'triangle'
                  } else if (item.type === ImageEditor.SHAPE.ARROW) {
                    this.currentDrawId = 'arrow'
                  } else if (item.type === ImageEditor.SHAPE.LINE) {
                    this.currentDrawId = 'line'
                  } else if (item.type === ImageEditor.SHAPE.CURVE) {
                    this.currentDrawId = 'curve'
                  }
                } else if (item.action === ImageEditor.MODE.TEXT) {
                  this.currentDrawId = 'text'
                }
              },
              onUnselect: () => {
                this.currentSelected = null
                this.setActionParams(this.drawParams)
              },
            },
            this.drawParams
          )
        }
        console.log(this.drawParams)
        if (this.drawParams !== this.draw) {
          this.drawParams.render(this.drawParams.target)
        }
      },
      setActionParams(params) {
        this.imageEditor.setActionParams(params)
      },
      setAction(mode, callback, params) {
        if (typeof params !== 'boolean') {
          this.prevAction = {
            mode,
            callback,
            params,
          }
        }

        this.imageEditor.setAction(mode, {
          params,
          callback,
        })
      },
      async onBgImageUpload(e) {
        const file = e.target.files[0]
        const dataurl = await fileToDataURL(file)
        const blob = dataURLToBlob(dataurl)
        const imgpath = blobToImagePath(blob)
        const image = new Image()
        image.src = imgpath
        image.onload = () => {
          this.bgImg = image
          this.bg = ''
          this.onBackgroundChange(true)
          e.target.value = ''
        }
      },
      onBeforeBackgroundChange(val, isImage = false, index = null) {
        if (val && !isImage) {
          this.bg = val
          this.bgImg = ''
          this.bgIndex = ''
          this.onBackgroundChange(isImage)
        } else if (val && isImage && index) {
          const image = new Image()
          image.setAttribute('crossOrigin', 'anonymous')
          image.src = this.$imgPath(`/image_editor/bg${index}.jpg`)
          this.aiImageLoaded = false
          image.onload = () => {
            this.aiImageLoaded = true
            this.bgIndex = index
            this.bgImg = image
            this.bg = ''
            this.onBackgroundChange(isImage)
          }
        }
      },
      onBackgroundChange(isImage = false) {
        console.log('onBackgroundChange', isImage)
        if (isImage) {
          this.bg = ''
          this.imageEditor.maskBg(this.bgImg, this.draw.blurSize, isImage)
        } else {
          this.bgImg = ''
          this.bgIndex = ''
          this.imageEditor.maskBg(this.bg, this.draw.blurSize, isImage)
        }
      },
      onBgBlurChange() {
        this.imageEditor.maskBg(this.bgImg || this.bg, this.draw.blurSize, !!this.bgImg)
      },
      onRotate() {
        this.imageEditor.rotate(this.rotateDeg).then(() => {
          //初始化裁剪框
          this.initCuttingBoxFun()
        })
      },
      initRotate() {
        this.rotateDeg = 0
        this.imageEditor.resetRotate().then(() => {
          const { w, h } = this.imageEditor.getImageSize()
          this.setImageSize(w, h)
          this.onSetScale(1, true)
          this.initCuttingBoxFun()
        })
      },
      onSetCustomCanvasSize(type) {
        if (!type) {
          this.imageSize.originWidth = this.imageSize.width
          this.imageSize.originHeight = this.imageSize.height
        } else {
          if (type === 'width') {
            this.imageSize.height = Math.round(
              (this.imageSize.width / this.imageSize.originWidth) * this.imageSize.originHeight
            )
          } else {
            this.imageSize.width = Math.round(
              (this.imageSize.height / this.imageSize.originHeight) * this.imageSize.originWidth
            )
          }
        }
      },
      onCanvasRotate(val) {
        //重绘剪切板
        this.imageEditor.canvasRotate(val).then(() => {
          //初始化裁剪框
          this.initCuttingBoxFun()
          //置换宽高值
          this.substitutionSize()
        })
      },
      /**
       * @substitutionSize 置换宽高值
       */
      substitutionSize() {
        // eslint-disable-next-line no-extra-semi
        ;[
          this.imageSize.originWidth,
          this.imageSize.originHeight,
          this.imageSize.width,
          this.imageSize.height,
        ] = [
          this.imageSize.originHeight,
          this.imageSize.originWidth,
          this.imageSize.height,
          this.imageSize.width,
        ]
      },
      onFlip(type) {
        this.imageEditor.flip(type)
      },
      /**
       * @onSetCustomCrop
       * @param {String} req  width | height
       */
      onSetCustomCrop(req) {
        //是否为指定比例
        if (this.ratio) {
          const p = this.ratio.split(':')[0] / this.ratio.split(':')[1]

          if (req === 'width' && this.crop.width) {
            //反算高度
            this.crop.height = (this.crop.width / p).toFixed(2)
          }
          if (req === 'height' && this.crop.height) {
            //反算宽度
            this.crop.width = (this.crop.height * p).toFixed(2)
          }
        }
        if (this.crop.width && this.crop.height) {
          const viewSize = this.imageEditor.getViewSize()
          const imageSize = this.imageEditor.getImageSize()
          const scale = imageSize ? viewSize.w / imageSize.w : 1
          this.$refs['cuttingBox'].setCuttingBox(this.crop.width * scale, this.crop.height * scale)
        }
      },
      onSetScale(scale, isSet = false) {
        console.log('onSetScale')
        if (this.cropVisible) {
          return
        }
        if (!isSet && (this.view.scale + scale > 3 || this.view.scale + scale < 0.04)) {
          return
        }
        this.onDrag(null, true)
        this.imageEditor.setContainerScale(scale, isSet)
        this.initCuttingBoxFun(false)
        this.onDrag(null, 'false')
      },
      onDrag(e, isSet = false) {
        if (isSet === 'false') {
          this.isDrag = false
        } else {
          this.isDrag = isSet || !this.isDrag
        }
        if (e) {
          this.imageEditor.setGlobalParamsOfEvent('canDrag', this.isDrag)
        }
        if (this.isDrag) {
          this.setAction(ImageEditor.MODE.NONE, null, false)
        } else {
          if (this.prevAction) {
            this.setAction(this.prevAction.mode, this.prevAction.callback, this.prevAction.params)
          }
        }
      },
      onRedo() {
        this.imageEditor.redo()
        this.initCuttingBoxFun()
      },
      onUndo() {
        this.imageEditor.undo()
        this.initCuttingBoxFun()
      },
      onReset() {
        this.imageEditor.reset()
        this.setImageSize(this.imageParams.w, this.imageParams.h)
        this.rotateDeg = 0
        //init isDrag is false
        this.onDrag(null, 'false')
        this.cuttingBoxType = false
        this.onSetScale(1, true)
      },
      initImageEditor(id, options) {
        this.imageEditor = new ImageEditor(id, options)
        this.imageEditor.addCallback(() => {
          const { w, h } = this.imageEditor.getImageSize()
          this.setImageSize(w, h)
          this.initCuttingBoxFun()
        })
        this.imageEditor.registerGlobalCallback([
          {
            event: 'onSpaceUp',
            callback: () => {
              console.log('onSpaceUp')
              this.onDrag(null, 'false')
            },
          },
          {
            event: 'onSpaceDown',
            callback: () => {
              console.log('onSpaceDown')
              this.onDrag(null, true)
            },
          },
          {
            event: 'onMousewheel',
            callback: (scale) => {
              this.view.scale = scale
            },
          },
        ])
        // this.onCrop()
      },
      loadImage() {
        this.onReset()
        const tuiBox = this.$refs['tuiBox']
        this.imageEditor.setOptions({
          maxWidth: tuiBox.clientWidth - 40,
          maxHeight: tuiBox.clientHeight - 40,
        })
        const size = this.imageEditor.loadImage(this.imageParams.image, this.imageParams.type)
        this.view.scale = 1
        this.view.initScale = 1
        this.originImageLoaded = true
        //初始化裁剪框
        this.initCuttingBoxFun()
      },
      /**
       * @initCuttingBoxFun 初始化裁剪框
       */
      initCuttingBoxFun(flag = true) {
        if (flag) {
          this.cuttingBoxType = false
        }

        this.$nextTick(() => {
          console.log('initCuttingBoxFun')
          //初始化裁剪框的大小
          const tuiBox = this.$refs['tuiBox']
          if (!tuiBox) {
            return
          }
          const viewSize = this.imageEditor.getViewSize()
          const { x, y } = this.imageEditor.getOffset()
          const imageSize = this.imageEditor.getImageSize()
          this.initCuttingBox(
            { width: viewSize.w, height: viewSize.h, x, y, scale: imageSize ? viewSize.w / imageSize.w : 1 },
            flag
          )
        })
      },
      /**
       * @initCuttingBox 裁剪框
       * @param {Object} reqObj width height
       */
      initCuttingBox(reqObj, flag) {
        const targetBox = this.$refs['image-editor-box']
        if (!targetBox) {
          return
        }
        this.cuttingBoxObj.width = reqObj.width
        this.cuttingBoxObj.height = reqObj.height
        this.cuttingBoxObj.x = reqObj.x
        this.cuttingBoxObj.y = reqObj.y
        this.cuttingBoxObj.scale = reqObj.scale
        targetBox.style.width = reqObj.width + 'px'
        targetBox.style.height = reqObj.height + 'px'
        if (flag) {
          this.cuttingBoxType = true
        }
      },
      setImageSize(w, h) {
        this.imageSize.originWidth = w
        this.imageSize.originHeight = h
        this.imageSize.width = w
        this.imageSize.height = h
      },
      onCrop(crop) {
        this.initCropArea()
        this.imageEditor.crop(crop.x, crop.y, crop.w, crop.h).then(() => {
          const size = this.imageEditor.getImageSize()
          this.setImageSize(Math.round(size.w), Math.round(size.h))
          this.initCuttingBoxFun(false)
          this.rotateDeg = 0
        })

        //重绘裁剪框

        // this.setAction(ImageEditor.MODE.CROP, {
        //   cropping: (w, h) => {
        //     this.crop.width = w.toFixed(0)
        //     this.crop.height = h.toFixed(0)
        //   },
        //   crop: (w, h) => {
        //     this.setImageSize(w.toFixed(0), h.toFixed(0))
        //   },
        //   cancel: () => {
        //     this.crop.width = 0
        //     this.crop.height = 0
        //   },
        // })
      },
      async onAiHandle(item, otherParams = {}) {
        //开启处理流程
        this.processType = true
        //来源为编辑页面
        otherParams.front_edit = 1
        //校验用户身份
        if (!this.identityCheck()) {
          return
        }

        const image = this.imageEditor.getUnprocessedImage()
        const work = await this.initWork(image, this.imageEditor.getImageType())

        //AI处理中弹窗
        this.$emit('processingFun', true)

        const uid = await this.getUid({ work })

        const config = this.getAiConfig(item)
        const requirePngWorks = [WorkFlowType.matting, WorkFlowType.paddle_matting]
        const dst_file_name = this.setFileName(
          work.filename,
          requirePngWorks.includes(item.id) ? 'png' : this.outSettingConfig.format
        )
        if (config) {
          try {
            const { data } = await Work.start(item.id, uid, config, '', 1, dst_file_name, otherParams)

            //异常校验
            if (!this.verificationMoney(data)) {
              return
            }

            const transId = data.data.trans_id

            //完善工作任务数据
            this.work = work
            this.work.transId = transId
            this.work.config = config
            this.work.startTime = Date.now()
            //完善工作任务数据end

            //开始处理上报elk
            this.processElk()
            if (!this.processType) {
              return
            }
            this.processNum = 0
            await new Promise((resolve, reject) => {
              this.getProcessingProgress(transId, resolve, reject)
            }, 2000)

            //图片放大流程
            this.enlargeFun(item)

            const image = new Image()
            //image.src = Work.targetImgUrl(transId)
            //获取图片处理后的图片格式
            // Work.getCanDownload(transId).then((reqData) => {
            //   const suffix = reqData.data.data.filename.split('.')[1]
            //   this.imageEditor.setImageType(suffix)
            //   this.outSettingConfig.format = suffix
            // })
            image.crossOrigin = 'anonymous'
            image.onload = () => {
              this.$emit('processingFun', false)
              this.imageEditor.ai(image, transId, item.id)
            }
            image.onerror = () => {
              this.$emit('processingFun', false)
            }
          } catch (e) {
            console.log(e)
          }
        }
      },
      /**
       * @modelExpansion 模型拓展
       */
      modelExpansion(req) {
        //校验是否需需要模型拓展
        const type = this.checkModel(req)
        if (!type) {
          return req
        }

        const config = req
        let sendJson = []
        const out_params = { ...config.config.out_params }
        if (config.name === 'sharpen') {
          delete config.job
          delete config.out_params
          sendJson = [
            {
              name: 'portrait_enhancer',
              config: {
                module: 'portrait_enhancer',
                module_params: {
                  model_name: 'PortraitEnhancer_v1.3',
                },
              },
            },
            {
              ...config,
              out_params,
            },
          ]
        }
        return {
          job: 'workflow',
          config: sendJson,
        }
      },
      /**
       * @checkModel 校验模型是否需要拓展
       */
      checkModel(config) {
        const modelList = ['sharpen']
        if (modelList.indexOf(config.name) !== -1) {
          return true
        }
        return false
      },
      /**
       * @getUid 获取Uid
       * @param {Object} work 处理的图片结果
       */
      async getUid({ work = {} }) {
        const transid = this.imageEditor.getLastAiTransId()

        let uid = null
        //含有transid 直接转化uid
        if (transid) {
          const reqData = await Work.conversionUid(transid)
          uid = reqData.data.data.uid
        } else {
          //上传转化uid
          const uploadImgData = await this.uploadImg(work)
          uid = uploadImgData.uid
        }

        return uid
      },
      /**
       * @identityCheck 用户身份校验
       */
      identityCheck() {
        if (this.$getCookie('token')) {
          return true
        }
        //提示用户登录
        setLoginDialogShow()
        return false
      },
      /**
       * @processElk  开始处理上报elk
       */
      processElk() {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_id: this.work.transId, //work transId
            process_method: 'single', //单一模型
            process_steps: '',
            process_type: this.work.config.job, //job名称
            model_name: this.work.config.config.module_params.model_name, //模型名称
            process_params: JSON.stringify(this.work.config.config.module_params), //模型参数
            workflow_name: '', //工作流名称
          },
        })
      },
      /**
       * @processSuccessElk  处理成功上报elk
       */
      processSuccessElk() {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_status: 'success',
            process_id: this.work.transId,
            process_type: this.work.config.job,
            model_name: this.work.config.config.module_params.model_name,
            process_time: parseFloat((this.work.endTime - this.work.startTime) / 1000),
          },
        })
      },
      getProcessingProgress(transId, resolve, reject) {
        if (this.processNum <= 90) {
          this.processNum++
          Work.getProgress(transId).then((res) => {
            res = res.data
            if (res.code === 200) {
              if (res.data.status === 'finish') {
                //成功以后上报elk
                this.work.endTime = Date.now()
                this.processSuccessElk()
                resolve()
              } else if (res.data.status === 'fatal') {
                //处理失败
                this.$emit('aiFailFun', true)
                reject()
              } else {
                this.processTime = setTimeout(() => {
                  this.getProcessingProgress(transId, resolve, reject)
                }, 2000)
              }
            } else {
              //处理失败
              this.$emit('aiFailFun', true)
              reject()
            }
          })
        } else {
          //处理失败(超时)
          this.$emit('aiFailFun', true)
          this.processNum = 0
        }
      },
      getAiConfig(item) {
        const config = WorkFlowConfig(item.id)
        if (config) {
          if (item.params) {
            for (const key in item.params) {
              config.module_params[key] = item.params[key]
            }
          }
          config.out_params = this.getOutParams()
          return {
            config: {
              ...config,
            },
            name: item.id,
            job: item.id,
          }
        } else {
          return ''
        }
      },
      setFileName(filename, type) {
        if (type && type !== 'default') {
          return filename.replace(/\.(jpg|png|jpeg|gif)$/, '.' + type).toLowerCase()
        }
        return filename.toLowerCase()
      },
      getOutParams() {
        const result = {}
        for (const key in this.outSettingConfig) {
          if (this.outSettingConfig[key] != 'default') {
            if (this.outSettingConfig[key] == 'custom') {
              result[key] = this.outSettingConfig['custom']
            } else {
              result[key] = this.outSettingConfig[key]
            }
          }
        }
        delete result.isRemerber
        delete result.custom
        return result
      },
      uploadFile(file) {
        this.$emit('uploadFile', file)
      },
      /**
       * @uploadFile2 open Image 上传图片按钮
       */
      async uploadFile2() {
        //用户已经下载过图片
        if (this.imageEditor.getImageChanged()) {
          //唤起更换提示弹窗
          this.$emit('fileWinFun', true)
          const intercep = await this.uploadFileInterceptFun()
          if (!intercep) {
            return
          }
        }
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'image/png,image/jpeg,image/jpg'
        inp.click()
        //防止重复绑定
        inp.removeEventListener('change', () => {})
        inp.addEventListener('change', () => {
          this.$emit('uploadFile', inp.files[0])
        })
      },
      /**
       * @uploadFileIntercept 用户下载拦截器
       */
      uploadFileInterceptFun() {
        return new Promise((resolve) => {
          this.uploadFileIntercept = resolve
        })
      },
    },
  }
</script>
<style scoped lang="less">
  .icon-s-expand {
    font-size: 18px;
    font-weight: bold;
    color: #0374ff;
  }
  .icon-s-shrink {
    font-size: 18px;
    font-weight: bold;
    color: red;
  }
  .icon-s-password1 {
    font-size: 16px;
  }
  .icon-s-magnifier,
  .icon-s-ZoomOut {
    font-weight: bold;
    &:hover {
      color: #0374ff;
    }
  }
  .icon-s-diamond {
    color: #ff9d1d;
    font-size: 16px;
    margin-left: 10px;
  }
  .scale-wrap {
    span {
      font-weight: bold;
    }
    &:hover {
      span {
        color: #0374ff;
      }
    }
  }
  .bg-f5 {
    background: #f5f7fa;
  }

  .pic_out_setting_cont {
    // display: none;
    position: absolute;
    width: 90%;
    height: 380px;
    top: -400px;
    padding: 10px;
    background: #f5f7fa;
    z-index: 100;
    border: 1px solid #f0f0f0;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
    text-align: left;
  }

  .image-editor-box {
    position: absolute;
    z-index: 2;
  }

  .diving-line {
    width: 100%;
    height: 1px;
    background-color: #ebeff2;
  }

  .r-inner {
    /deep/ .el-input-number {
      max-width: 82 / @base;

      .el-input-number__decrease,
      .el-input-number__increase {
        width: 20px;
        line-height: 14px;
        border: none;
        background: none;
      }

      .el-input-number__decrease {
        bottom: 4px;
      }

      .el-input-number__increase {
        top: 4px;
      }

      .el-icon-arrow-up::before {
        content: '\25b2';
      }

      .el-icon-arrow-down::before {
        content: '\25bc';
      }
    }

    /deep/ .el-input__inner {
      height: 38 / @base;
      line-height: 38 / @base;
    }

    /deep/ .el-color-picker__trigger,
    /deep/ .el-color-picker__color,
    /deep/ .el-color-picker__color-inner {
      border-radius: 50%;
      overflow: hidden;
    }

    .ribbon {
      display: flex;
      align-items: center;

      .ribbon-item {
        display: flex;
        flex-direction: column;
        font-size: 12px;
        color: #7e7e7e;

        span {
          text-align: center;
        }
      }
    }

    /deep/ .el-slider {
      width: 90%;

      &:hover {
        .el-slider__button {
          background-color: #0374ff;
        }
      }
    }

    /deep/ .el-num {
      width: 30%;

      .el-input__inner {
        padding: 0;
      }

      &:hover {
        .el-input__inner {
          border-color: #0374ff;
        }
      }

      .el-input-number {
        width: 100%;
      }
    }

    /deep/ .el-slider__button-wrapper {
      top: -17px;
      z-index: 20;
    }

    /deep/ .el-slider__runway {
      height: 2px;
      background-color: #b5b5b5;
    }

    /deep/ .el-slider__bar {
      background-color: #3887fe;
    }

    /deep/ .el-slider__button {
      width: 10px;
      height: 10px;
      background-color: #3887fe;
      border: none;
    }

    /deep/ .el-slider__bar {
      height: 2px;
    }
  }

  .crop-ratio {
    .icons {
      margin: 0 10 / @base;
    }

    /deep/.el-input__suffix {
      right: 19px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .crop-icon-font {
      font-style: normal;
      color: #4d4d4f;
      font-size: 16px;
    }
  }

  .tui-box {
    /*height: 600px;*/
    overflow: hidden;
    // padding: 20px;
  }

  .tui-con {
    height: calc(100vh - 64px);
    position: relative;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 30px 70px 0 rgba(6, 7, 50, 0.24);

    /deep/ * {
      user-select: none;
    }

    .tui-box {
      height: calc(100% - 64px);
      padding: 20 / @base;
    }

    .redo {
      position: absolute;
      top: -58px;
      right: 0;
      display: flex;
      border-left: 1px solid #ededed;

      .redo_btn {
        display: flex;
        align-items: center;
        height: 58px;
        color: #4d4d4f;
        border-right: 1px solid #ededed;
        padding: 0 20 / @base;
        cursor: pointer;

        &:hover {
          color: #0374ff;

          .icon_undo,
          .icon_redo {
            display: none;
          }

          .icon_undo_hover,
          .icon_redo_hover {
            display: inline-block;
          }
        }

        i {
          margin-right: 10 / @base;
        }

        .icon_undo_hover,
        .icon_redo_hover {
          display: none;
        }
      }

      .disabled {
        opacity: 0.3;
        cursor: not-allowed;

        &:hover {
          color: #4d4d4f;

          .icon_undo,
          .icon_redo {
            display: inline-block;
          }

          .icon_undo_hover,
          .icon_redo_hover {
            display: none;
          }
        }
      }
    }

    .main {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 100%;
    }

    .left-img {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .l-inner {
        height: 100%;
        min-height: 510px;
        display: flex;
        justify-content: center;
        align-items: center;

        &::-webkit-scrollbar {
          width: 4px;
          height: 4px;
          background: #fff;
        }

        &::-webkit-scrollbar-thumb {
          background: #6e6e6e;
          border-radius: 4px;
        }

        .tui-box {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
        }

        .upload-drager-box {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;

          .upload-dragger {
            .icon_upload_black {
              display: inline-block;
            }

            .icon_upload {
              display: none;
            }

            &:hover {
              .icon_upload_black {
                display: none;
              }

              .icon_upload {
                display: inline-block;
              }
            }
          }

          .drag-img-box {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          /deep/ .el-upload-dragger {
            height: auto;
          }
        }

        .upload-dragger {
          width: 100%;
          position: relative;
          padding: 25 / @base 2rem;

          .upload-text-tip {
            margin-top: 1.125rem;

            p {
              color: #9a9999;
              font-size: 14px;
            }

            .small {
              font-size: 12px;
            }
          }
        }

        .upload-img {
          width: 70%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .operator {
          width: 30%;
        }

        .drag-img-shell {
          .drag-img {
            display: block;
          }

          .drag-img-hover {
            display: none;
          }

          &:hover {
            .drag-img-hover {
              display: block;
            }

            .drag-img {
              display: none;
            }

            .quicksand-bold {
              text-decoration: underline;
            }
          }
        }

        .full-mask {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 9;
          width: 100%;
          height: 100%;
          background: rgba(225, 225, 225, 0.85);

          * {
            pointer-events: none;
          }

          .full-mask-body {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          img {
            width: auto !important;
            height: auto !important;
          }

          p.fdrag {
            font-size: 30 / @base;
            font-weight: bold;
            line-height: 54 / @base;
            color: #4f6785;
            text-align: center;
          }
        }

        .border-top {
          width: 100%;
          top: 0;
          left: 5px;
          height: 1px;
          background-image: linear-gradient(to right, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-size: 11px 1px;
          background-repeat: repeat-x;
          position: absolute;
        }

        .border-left {
          width: 1px;
          left: 0;
          top: 0;
          height: 100%;
          background-image: linear-gradient(to top, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-size: 1px 11px;
          background-repeat: repeat-y;
          position: absolute;
        }

        .border-bottom {
          width: 100%;
          left: 5px;
          height: 1px;
          bottom: 0;
          background-image: linear-gradient(to right, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-size: 11px 1px;
          background-repeat: repeat-x;
          position: absolute;
        }

        .border-right {
          width: 1px;
          right: 0;
          top: 0;
          height: 100%;
          background-image: linear-gradient(to top, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-size: 1px 11px;
          background-repeat: repeat-y;
          position: absolute;
        }
      }

      .tui-foot {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: 1px solid #ededed;
      }
    }

    .right-haddle {
      overflow: hidden;
      width: 323px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-left: 1px solid #ebeff2;
      position: relative;

      .h4 {
        margin: 25px 0 6px;
        font-size: 18 / @base;

        &.reset {
          margin: 25px 0 16px;
        }

        &.reset2 {
          margin-bottom: 16 / @base;
        }
      }

      p {
        margin: 8px 0 6px;
        font-size: 13 / @base;
      }

      .right-footer {
        display: flex;
        justify-content: center;
        border-top: 1px solid #ebeff2;
        padding: 20 / @base 30 / @base;
        width: 100%;
        position: sticky;
        left: 0;
        bottom: 0;
        background: #fff;
        z-index: 21;

        .save-download-btn,
        .icon-btn {
          height: 44 / @base;
          line-height: 1;
        }
        .save-download-btn {
          width: 100%;
        }

        .icon-btn {
          border: none;
          width: 44 / @base;
          margin-left: 2 / @base;
          background: #ff9d1d;
        }
      }

      .icon-box {
        display: flex;
        flex-direction: column;
        margin-right: 15px;
        align-items: center;

        &:hover {
          .icons {
            border-color: #0374ff;
          }

          span {
            color: #0374ff;
          }
        }

        .icons {
          width: 38px;
          height: 38px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 2px;
          background-color: #fff;
          border: 1px solid #c5c5c5;
          margin-bottom: 3px;
          flex-shrink: 0;
          cursor: pointer;

          &:hover {
            .icon_90,
            .icon_-90,
            .icon_flipx,
            .icon_flipy,
            .icon_b,
            .icon_i,
            .icon_u,
            .icon_text_align_left,
            .icon_text_align_center,
            .icon_text_align_right {
              display: none;
            }

            .icon_90_hover,
            .icon_-90_hover,
            .icon_flipx_hover,
            .icon_flipy_hover,
            .icon_b_hover,
            .icon_i_hover,
            .icon_u_hover,
            .icon_text_align_left_hover,
            .icon_text_align_center_hover,
            .icon_text_align_right_hover {
              display: inline-block;
            }
          }

          .icon_90_hover,
          .icon_-90_hover,
          .icon_flipx_hover,
          .icon_flipy_hover,
          .icon_b_hover,
          .icon_i_hover,
          .icon_u_hover,
          .icon_text_align_left_hover,
          .icon_text_align_center_hover,
          .icon_text_align_right_hover {
            display: none;
          }
        }

        span {
          color: #7e7e7e;
          font-size: 12px;
        }
      }

      .bg-ccc {
        padding: 10px;
        background: #e6e6e6;
        border-radius: 2px;
        display: flex;
      }

      .min-title {
        color: #333333;
        display: block;
        font-size: 12px;
        margin: 10px 0;
      }

      .btn-crop {
        display: flex;
        justify-content: space-between;

        button {
          min-width: 48%;
          max-width: 48%;
        }
      }

      .btns {
        button {
          height: 2.4375rem;
          line-height: 2.4375rem;
          font-size: 14 / @base;
        }
      }

      .r-inner {
        position: relative;
        height: calc(100% - 85px);
        .header {
          width: 100%;
          height: 40 / @base;
          position: sticky;
          top: 0;
          left: 0;
          background: #fff;
          z-index: 21;
        }
        .item {
          border-bottom: 1px solid #fff;
          margin-bottom: 5 / @base;
          padding: 0 15 / @base 20 / @base;

          &.reset {
            padding: 0 15 / @base 10 / @base;
          }

          &.reset2 {
            padding-bottom: 10px;
            margin-bottom: 0;
          }

          &:last-child {
            border-bottom: 0;
          }
        }
        /deep/ .vanceai-tabs {
          margin-top: 10 / @base;
          .vanceai-tabs_nav {
            justify-content: center;
            margin-bottom: 20 / @base;
            .vanceai-tabs_item {
              padding: 5 / @base 10 / @base;
              background: #ededed;
              min-width: 85 / @base;
              margin: 0;
              text-align: center;
              &:first-child {
                border-radius: 3 / @base 0 0 3 / @base;
              }
              &:last-child {
                border-radius: 0 3 / @base 3 / @base 0;
              }
            }
            .is-active {
              background: #0374ff;
              color: #fff;
            }
          }
        }
        .no-padding-item {
          padding: 0;
        }

        /deep/ .el-input-number.is-controls-right .el-input__inner {
          padding-right: 20px;
        }

        .inputs {
          color: #333333;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .scale {
            width: 72 / @base;
            min-width: 72 / @base;
            height: 38 / @base;
            line-height: 38 / @base;
          }
        }

        .crop-ratio {
          .el-input-number {
            width: 123 / @base;
            max-width: 123 / @base;
          }

          .icons {
            cursor: pointer;
          }
        }

        .rotate-icon {
          display: flex;
          align-items: center;
          margin: 18px 0;

          .icon-box {
            text-align: center;
          }
        }

        .select-ratio {
          width: 100%;
        }

        .self-set {
          margin-top: 20 / @base;

          .reset-btn {
            width: auto;
            height: 38 / @base;
            border: 2px solid #dddddd;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 30 / @base;

            .icon_reset_btn_hover {
              display: none;
            }

            .icon {
              margin-right: 15 / @base;
            }
          }

          .reset-btn:hover {
            background: #fff;
            border-color: #ff9d1d;
            color: #ff9d1d;

            .icon_reset_btn {
              display: none;
            }

            .icon_reset_btn_hover {
              display: inline-block;
            }
          }
        }

        .flip {
          padding: 0 15px;

          .btn-sub {
            width: 100%;
            font-size: 14px;
            min-height: 36px;
            height: 36px;
            line-height: 1;
            background-color: #eeeeee;
            display: flex;
            align-items: center;
            justify-content: center;

            i {
              margin-right: 10px;
            }

            &:hover {
              color: #ff9d1d;
              border-color: #ff9d1d;
            }
          }
        }

        .filter-box {
          padding: 0 15px;

          .filter-list {
            margin-bottom: 10px;
            display: block;

            .block {
              display: flex;
              align-items: center;
              justify-content: flex-end;

              /deep/ .el-slider {
                width: 90%;
              }

              .demonstration {
                font-size: 12px;
                color: #606266;
              }
            }
          }

          .filter-list-1 /deep/ .el-checkbox {
            margin-right: 0;
            width: 50%;
          }

          .filter-list-2 {
            .list:first-child {
              /deep/ .el-slider {
                width: 60%;
                margin-left: 10px;
              }
            }
          }

          .filter-list-2,
          .filter-list-3 {
            padding: 0;

            .list {
              padding: 10px;
              border-bottom: 1px solid #fff;

              /deep/ .el-slider__runway {
                margin: 10px 0;
              }
            }

            .list:last-child {
              border: 0;
            }
          }

          .filter-list-3 {
            .list:last-child {
              /deep/ .el-slider {
                width: 60%;
                margin-left: 10px;
              }
            }
          }

          .filter-list-4 {
            display: flex;
            align-items: center;
            justify-content: center;

            .list {
              text-align: center;

              em {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 1px solid #bdbdbd;
                border-radius: 50%;
              }
            }

            .list:first-child {
              em {
                background: #facd91;
              }
            }

            .list:nth-child(2) {
              em {
                background: #0000ff;
              }
            }

            .list:last-child {
              em {
                background: #70b603;
              }
            }

            /deep/ .el-checkbox {
              display: flex;
              align-items: center;
              flex-direction: column;
              justify-content: center;

              .el-checkbox__label {
                margin: 0 0 5px;
              }

              .el-checkbox__input {
                order: 1;
              }
            }
          }

          /deep/ .el-checkbox__inner {
            background: #e6e6e6;
            border-color: #b1b1b1;
          }

          /deep/ .el-checkbox__label {
            font-size: 12px;
          }

          /deep/ .is-checked {
            .el-checkbox__inner {
              background-color: #0076fb;
              border-color: #0076fb;
            }

            .el-checkbox__label {
              color: #4d4d4f;
            }
          }
        }

        .text-box {
          color: #4d4d4f;

          /deep/ .el-color-picker {
            margin-right: 15px;
          }
        }

        .draw-content {
          .bg-ccc {
            justify-content: space-around;
          }

          .icons {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .icon {
              width: 38px;
              height: 38px;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 2px;
              margin-bottom: 3px;
              flex-shrink: 0;
              cursor: pointer;

              &:hover {
                .icon_free,
                .icon_straight {
                  display: none;
                }

                .icon_free_hover,
                .icon_straight_hover {
                  display: inline-block;
                }
              }

              .icon_free_hover,
              .icon_straight_hover {
                display: none;
              }
            }
          }

          span {
            color: #7e7e7e;
            font-size: 12px;
          }
        }

        .block {
          display: flex;
        }

        .rotate-box-num {
          padding: 0 15 / @base;
        }

        .rotate-box {
          background: #f5f7fa;
          padding: 15 / @base;
        }
      }
    }

    .blur-box {
      color: #333333;
    }
  }

  .blur-box {
    &:last-child {
      border: none;
    }

    .blur {
      padding: 10 / @base 0;

      li {
        position: relative;
        background-position: center;
        background-size: cover;

        &:hover,
        &.active {
          .target-img:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 2px solid #fff;
          }
        }

        .target-img {
          width: 100%;
          height: 100%;
          position: relative;
          background-position: center;
          background-size: cover;
        }
      }
    }

    ul {
      display: flex;
      justify-content: space-between;
      margin-top: 10 / @base;

      li {
        width: 40px;
        overflow: hidden;
        text-align: center;
        cursor: pointer;
        border-radius: 5px;

        img {
          width: 100%;
          height: 100%;
          vertical-align: center;
          object-fit: cover;
        }
      }
    }

    .li-position {
      position: relative;
    }

    .el-icon-success {
      color: green;
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }

  .blur-box {
    .color {
      ul {
        li {
          width: 40px;
          height: 40px;
          border: 2px solid transparent;

          &:hover,
          &.active {
            border-color: #fff;
          }

          img {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20 / @base;
            height: 20 / @base;
            margin: auto;
          }

          &:first-of-type {
            display: flex;
            align-items: center;
            background-color: #fff;
            background-image: linear-gradient(
                45deg,
                rgba(0, 0, 0, 0.15) 25%,
                transparent 0,
                transparent 75%,
                rgba(0, 0, 0, 0.15) 0
              ),
              linear-gradient(
                45deg,
                rgba(0, 0, 0, 0.15) 25%,
                transparent 0,
                transparent 75%,
                rgba(0, 0, 0, 0.15) 0
              );
            background-repeat: repeat;
            background-position: 0 0, 15px 15px;
            background-size: 30px 30px;
          }

          &:nth-of-type(2) {
            display: flex;
            align-items: center;
            background-color: #fff;
          }

          &:nth-of-type(3) {
            border: 0;
          }

          &:last-of-type {
            width: 68px;
            color: #fff;
            background-color: #3b3b3b;
            border: 0;

            .el-input__inner {
              padding: 0 !important;
            }
          }
        }

        /deep/.el-input__inner {
          padding: 0;
          font-size: 12px;
          text-align: center;
          height: 40px;
        }
      }
    }

    .el-color-picker {
      /deep/.el-color-picker__trigger {
        border: 2px solid #fff;
      }
    }

    /deep/ .el-color-picker__trigger,
    /deep/ .el-color-picker__color,
    /deep/ .el-color-picker__color-inner {
      border-radius: 0;
    }

    /deep/.el-color-picker__color-inner {
      // background: url('@{assetsImgPath}/editor/1x_m/icon/icon_color.png') no-repeat !important;
    }

    /deep/.el-color-picker__empty {
      display: none;
    }

    /deep/.el-color-picker__icon {
      display: none;
    }
  }

  .blur-box {
    .rt4 {
      ul {
        li {
          position: relative;
          flex: 1;
          overflow: hidden;
          border: 0;
        }

        button {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
          background: transparent;
          border-radius: 2px;
          font-size: 16 / @base;

          i {
            margin-right: 10 / @base;
            vertical-align: middle;
          }

          .hover {
            display: none;
          }

          &:hover {
            color: #fff;

            // border-color: #ff697b;
            // background: #ff697b;
            .hover {
              display: inline-block;
            }

            .default {
              display: none;
            }
          }
        }
      }
    }
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .icon_diamond {
    margin-left: 10 / @base;
  }

  .horizontal-item {
    width: 100%;
    display: flex;
    flex-direction: row !important;
    align-items: center;
  }

  .horizontal-item2 {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: row !important;
    flex-wrap: wrap;
  }

  .ai-list,
  .filter-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 20 / @base;

    .ai-item,
    .filter-item {
      cursor: pointer;
      width: 136 / @base;
      height: 86 / @base;
      text-align: center;
      border: 2px solid #ebeff2;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 10 / @base;

      p {
        margin: 0;
        color: #4d4d4f;
        font-size: 14px;
      }

      &:hover {
        border-color: #0072ff;

        p {
          color: #0072ff;
        }

        .icon {
          display: none;
        }

        .icon_hover {
          display: inline-block;
        }
      }
    }

    .ai-horizontal-item {
      height: 48 / @base;
      align-items: center;
      flex-direction: row;

      .icons {
        margin-right: 10 / @base;
      }
    }
  }

  .ai-list {
    &.reset {
      margin-top: 0;
    }
  }

  .icons {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon_hover {
      display: none;
    }

    &:hover {
      .icon {
        display: none;
      }

      .icon_hover {
        display: inline-block;
      }
    }
  }

  .text-icon {
    margin: 0 8 / @base 8 / @base 0;
    border: 1px solid #b8c7d2;
    border-radius: 3px;
    width: 40 / @base;
    height: 38 / @base;
  }

  .text-long-icon {
    justify-content: space-around;
    margin: 0 8 / @base 8 / @base 0;
    border: 1px solid #b8c7d2;
    border-radius: 3px;
    width: 64 / @base;
    height: 38 / @base;

    &::after {
      content: '\25bc';
      font-size: 12 / @base;
    }
  }

  .icon-list {
    display: flex;
    flex-wrap: wrap;

    .icon-item {
      margin: 0 10 / @base 10 / @base 0;
      width: 47 / @base;
      height: 47 / @base;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #ebeff2;
      border-radius: 3px;
    }
  }

  .filter-list {
    .filter-item {
      height: 106 / @base;
      position: relative;

      .title {
        width: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 0px 0px 3px 3px;
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
  }

  .background-list {
    display: flex;
    flex-wrap: wrap;

    .thumbnail-block {
      cursor: pointer;
      margin: 0 10 / @base 10 / @base 0;
      border-width: 1px;
      border-radius: 3px;
      border-style: outset;
      border-color: buttonborder;
    }

    .active-block {
      box-shadow: 0 0 0 1px #0374ff;
    }

    .upload-block {
      cursor: pointer;
      width: 82 / @base;
      height: 84 / @base;
      background: #6f6f70;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .text {
        font-size: 12 / @base;
        color: #fff;
        text-align: center;
        line-height: 1.25;
      }
    }
    .background-item {
      position: relative;
      cursor: pointer;
      margin-right: 10 / @base;
      color: #fff;
      font-size: 12 / @base;
      .sel_icon {
        position: absolute;
        right: 0;
        left: 0;
        top: 9px;
        margin: auto;
        display: none;
      }

      &.bg-sel {
        .sel_icon {
          display: block !important;
        }
      }

      .icon_hover {
        display: none;
      }

      &:hover {
        .icon {
          display: none;
        }

        .icon_hover {
          display: inline-block;
        }
      }
    }
  }

  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  button,
  .scale-btn {
    user-select: none;
  }

  /deep/ .el-input__inner {
    user-select: none;
  }

  .icon-btn {
    min-width: 36 / @base;
    height: 36 / @base;
    padding: 0 10 / @base;
    background: #ffffff;
    border: 1px solid #b8c7d2;
    border-radius: 3px;
    margin-left: 10 / @base;
    width: auto;

    .icon-text {
      font-size: 14 / @base;
      margin-left: 10 / @base;
      user-select: none;
    }

    .icon_hover {
      display: none;
    }

    &:hover {
      border-color: #0374ff;

      .icon-text {
        color: #0374ff;
      }

      .icon {
        display: none;
      }

      .icon_hover {
        display: inline-block;
      }
    }
  }
  .icons {
    .icon {
      display: inline-block;
    }

    .icon_hover {
      display: none;
    }
    &:hover {
      .icon-text {
        color: #0374ff;
      }

      .icon {
        display: none;
      }

      .icon_hover {
        display: inline-block;
      }
    }
  }

  .active-icon {
    border-color: #0374ff !important;

    .icon_hover {
      display: inline-block !important;
    }

    .icon {
      display: none !important;
    }

    .icon-text {
      color: #0374ff !important;
    }

    &:hover {
      .icon-text {
        color: #0374ff;
      }

      .icon {
        display: none;
      }

      .icon_hover {
        display: inline-block;
      }
    }
  }

  .scale-btn {
    justify-content: space-between;
    width: 132 / @base;
    height: 36 / @base;
    padding: 0 10 / @base;
    background: #ffffff;
    border: 1px solid #b8c7d2;
    border-radius: 3px;
    margin-left: 10 / @base;
  }

  .open-image-btn {
    cursor: pointer;
    height: 36 / @base;

    /deep/ .el-upload-dragger {
      width: auto;
      height: auto;
      border: none;
      border-radius: 3px;
    }
  }

  .position-relative-item {
    position: relative;
  }

  .position-absolute-item {
    position: absolute;
    left: 0;
    top: 0;
  }

  .hide-item {
    cursor: pointer;
    width: 100%;
    height: 100%;
    opacity: 0;

    /deep/ .el-color-picker__trigger {
      width: 100%;
      height: 100%;
    }
  }

  .item-margin {
    margin-bottom: 8 / @base;
  }

  .pop-ups {
    z-index: 99;
    border: 1px solid #b8c7d2;
    top: 38 / @base;
    left: -60 / @base;
    background-color: #ffffff;
    box-shadow: 0px 20px 50px 0px rgba(0, 0, 0, 0.15);
    width: 204 / @base;
    padding: 0 20 / @base;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .pop-ups-item {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 35 / @base;

      .line {
        width: 100%;
        background: #5c5c6a;
      }

      &:hover {
        background: #ebedf0;
      }
    }

    .pop-ups-active-item {
      background: #ebedf0;

      .icons2 {
        .icon2 {
          display: none;
        }

        .icon2_hover {
          display: inline-block;
        }
      }
    }
  }

  .pop-ups2 {
    left: -56 / @base;
    width: 120 / @base;
  }

  .icons2 {
    .icon2_hover {
      display: none;
    }

    &:hover {
      .icon2 {
        display: none;
      }

      .icon2_hover {
        display: inline-block;
      }
    }
  }

  .disable-icon {
    cursor: not-allowed !important;

    &:hover {
      .icon {
        display: inline-block !important;
      }

      .icon_hover {
        display: none !important;
      }
    }
  }
</style>
<style lang="less">
  .active-drag {
    animation: shine 1s infinite;
  }

  @keyframes shine {
    form {
      box-shadow: 0 0 0 3px #0374ff;
    }

    to {
      box-shadow: 0 0 5px 3px #0374ff;
    }
  }

  .tui-image-editor-canvas-container {
    width: fit-content;
    height: fit-content;
    margin: auto;
    cursor: move;
    background-color: #fff;
    background-image: linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.15) 25%,
        transparent 0,
        transparent 75%,
        rgba(0, 0, 0, 0.15) 0
      ),
      linear-gradient(45deg, rgba(0, 0, 0, 0.15) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, 0.15) 0);
    background-repeat: repeat;
    background-position: 0 0, 10px 10px;
    background-size: 20px 20px;
  }

  .blur-box {
    .el-slider {
      width: 100%;
    }
  }
</style>
<style>
  .do_not_disturb {
    display: flex;
    align-items: center;
    color: #7f7f7f;
  }
</style>
