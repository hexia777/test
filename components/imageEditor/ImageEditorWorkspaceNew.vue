<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="image-editor-workspace">
    <div class="main" style="padding: 0;">
      <!-- <button @click="getHistory">获取history</button> -->
      <div class="content">
        <div v-show="!currentImage.targetImg" class="upload-drager-box">
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

        <div v-show="currentImage.targetImg" class="editor-content">
          <div class="left-editor-content">
            <div class="va-pintura-editor">
              <pintura-editor
                ref="pinturaEditor"
                :src="imageFile || currentImage.targetImg"
                v-bind="editorDefaults"
                :image-crop-aspect-ratio="imageCropAspectRatio"
                :willRenderToolbar="willRenderToolbar"
                :enableToolbar="true"
                :enableUtils="false"
                :locale="localeLang"
                :cropEnableButtonFlipVertical="true"
                :cropEnableInfoIndicator="true"
                :cropEnableButtonToggleCropLimit="true"
                :cropSelectPresetOptions="cropSelectPresetOptions"
                cropSelectPresetFilter="landscape"
                layoutDirectionPreference="horizontal"
                layoutVerticalToolbarPreference="bottom"
                :utils="utils"
                :fillOptions="fillOptions"
                :stickers="stickers"
                :markupEditorToolStyles="markupEditorToolStyles"
                :markupEditorToolbar="markupEditorToolbar"
                :enableMoveTool="true"
                :enableViewTool="true"
                :finetuneControlConfiguration="finetuneControlConfiguration"
                :finetuneOptions="finetuneOptions"
                @pintura:load="onPinturaEditorLoad"
                @pintura:writehistory="onWritehistory"
                @pintura:addshape="handleEditorAddShape"
                @pintura:selectcontrol="onSelectcontrol"
              />
            </div>
            <AIControls
              v-show="isAIUtil"
              :active-util="activeUtil"
              :brushSize="brushSize"
              :isAutoRemove="isAutoRemove"
              @update:brushSize="onUpdateBrushSize"
              @onBgColorChange="onBgColorChange"
              @onBgImageChange="onBgImageChange"
              @onAutoRemoteChange="onAutoRemoteChange"
              @onAiHandle="onAiHandle"
              @onEraseAI="handleEraseAI"
            />
          </div>
        </div>

        <right-utils @clickUtil="clickUtil" :active-util="activeUtil" />
      </div>

      <div class="footer-action-bar">
        <div
          @click="uploadFile2"
          class="open-image-btn"
          style="padding-bottom: 20px;"
          v-track-label="$commonTrackLabel('open_image_button')"
        >
          <div class="icon-btn horizontal-item">
            <!-- <div class="icons">
          <i class="icon icon_open_image"></i>
          <i class="icon_hover icon_open_image_hover"></i>
        </div> -->
            <i class="iconfont-single icon-s-open-image"></i>
            <span class="icon-text">{{ $t('workspace.edit_popup_4') }}</span>
          </div>
        </div>

        <div v-show="currentImage.targetImg" class="right-footer">
          <div class="pic_out_setting_cont" v-if="showSetting">
            <out-setting
              @confirm="confirmOutSet(true)"
              @close="confirmOutSet(false)"
              :config="outSettingConfigCopy"
              :remember="false"
            />
          </div>
          <div class="out-set" @click="openSetWin">
            <i class="iconfont-single icon-s-setting"></i>
          </div>
          <el-button
            v-loading="isDownloading"
            @click="downLoadImage"
            class="primary-small-button save-download-btn"
            v-track-label="$commonTrackLabel('downLoad_image')"
          >
            {{ $t('workspace.edit_popup_6') }}
          </el-button>
        </div>
      </div>
    </div>

    <custom-dialog
      class="loading-image-dialog"
      :visible.sync="loadingImage"
      :title-border="false"
      @close="closeLoadingImageHandle"
    >
      <div class="loading-image-main">
        <div
          class="loading-all"
          v-loading="loadingImage"
          element-loading-background="rgba(255, 255, 255, 0)"
        ></div>
        <div class="tipsTest" v-html="$t('common.loading_1')"></div>
      </div>

      <template #footer>
        <div class="offline-dialog-btns">
          <span class="no_thanks" @click="loadingImage = false">{{ $t('common.loading_2') }}</span>
        </div>
      </template>
    </custom-dialog>
    <!-- AI处理中弹窗 -->
    <custom-dialog
      :hide-mask="true"
      :visible.sync="aiProcessing"
      :show-close="false"
      :show-header="false"
      :show-footer="false"
    >
      <div class="f-14 mag-t-20"></div>
      <div class="flex guide_box pad-20 justify-center">
        <i class="icon_my_loading"></i>
      </div>
      <div class="mag-t-20 tc">
        {{ $t('workspace.tip_1') }}
      </div>
      <div class="tc">
        <div
          class="btn-main btn mag-t-30 mag-b-20"
          @click="cancelProcess"
          v-track-label="$commonTrackLabel('cance_process_button')"
        >
          {{ $t('common.loading_2') }}
        </div>
      </div>
    </custom-dialog>
    <!-- AI处理失败弹窗 -->
    <custom-dialog :visible.sync="aiFail" :show-close="false" :show-header="false" :show-footer="false">
      <div class="pad-20">
        <div class="flex guide_box justify-center">
          <i class="icon_min_set_failed"></i>
        </div>
        <div class="tc mag-t-20">
          {{ $t('workspace.tip_2') }}
        </div>
        <div class="tc">
          <div
            class="btn-main btn mag-t-30"
            @click="closeAiFail"
            v-track-label="$commonTrackLabel('close_ai_fail_button')"
          >
            {{ $t('common.alert_ok') }}
          </div>
        </div>
      </div>
    </custom-dialog>
    <!-- 尺寸超出限制弹窗 -->
    <custom-dialog :visible.sync="sizeWin" :show-close="false" :show-header="false" :show-footer="false">
      <div class="pad-20">
        <div slot="title">
          <div class="tl f-30 f-b">{{ $t('workspace.tip_4') }}</div>
        </div>
        <div class="tl mag-t-30">
          {{ $t('workspace.tip_3') }}
        </div>
        <div class="flex mag-t-20">
          <div class="flex1"></div>

          <div class="btn-main btn mag-t-30" @click="closeSizeWin(1)">
            {{ $t('common.alert_ok') }}
          </div>
          <div class="flex1"></div>
          <div class="btn-main cancel btn mag-t-30" @click="closeSizeWin(2)">
            {{ $t('common.loading_2') }}
          </div>
          <div class="flex1"></div>
        </div>
      </div>
    </custom-dialog>
    <!-- 积分不足弹窗 -->
    <custom-dialog :visible.sync="pointWin" :show-footer="false">
      <template slot="title">
        <span class="v-hide">close</span>
      </template>

      <div class="">
        <div slot="title">
          <div class="tc f-30 f-b mag-t-20">
            <img :src="$imgPath('/common/download_dialog_9.png')" />
          </div>
        </div>
        <div class="tc f-b">
          {{ $t('workspace.tip_5') }}
        </div>
        <div class="tc mag-t-30" style="padding: 0 20px;">
          {{ $t('workspace.process_not_point_desc') }}
        </div>
        <div class="mag-t-20 mag-b-40 flex justify-center">
          <div
            class="btn-main btn mag-t-30"
            @click="closePointWin"
            v-track-label="$commonTrackLabel('close_point_win')"
          >
            {{ $t('workspace.tip_7') }}
          </div>
        </div>
      </div>
    </custom-dialog>

    <!-- 替换文件提示 -->
    <custom-dialog :visible.sync="fileWin" :show-close="false" :show-header="false" :show-footer="false">
      <div class="pad-20">
        <div slot="title">
          <div class="tl f-30 f-b">{{ $t('workspace.tip_4') }}</div>
        </div>
        <div class="tl mag-t-30">
          {{ $t('workspace.tip_8') }}
        </div>
        <div class="flex mag-t-20">
          <div class="flex1"></div>

          <div class="btn-main btn mag-t-30" @click="btnFileWinFun(true)">
            {{ $t('workspace.tip_9') }}
          </div>
          <div class="flex1"></div>
          <div class="btn-main cancel btn mag-t-30" @click="btnFileWinFun(false)">
            {{ $t('workspace.tip_10') }}
          </div>
          <div class="flex1"></div>
        </div>
      </div>
    </custom-dialog>
  </div>
</template>

<script>
  import CustomDialog from '@/components/CustomDialog'
  import UploadToLocal from '@/components/UploadToLocal'
  import RightUtils from '@/components/imageEditor/RightUtils.vue'
  import FooterActionBar from '@/components/imageEditor/FooterActionBar.vue'
  import AIControls from './AIControls.vue'
  import outSetting from '@/components/WorkSpace/OutSetting'
  import { deepClone, setLoginDialogShow } from '@/static/script/utils'

  import UploadImageMixins from '@/mixins/components/UploadImgMixins'
  import ImageFileCompressMixins from '@/mixins/components/ImageFileCompressMixins'
  import UserInfoMixins from '@/mixins/UserInfoMixins'

  import Work from '@/static/script/work.js'
  import { USER_LOGIN, USER_LOGOUT } from '@/static/config/common/localstorage_constants'
  import { WorkFlowType, WorkFlowConfig } from '@/static/script/workflow_util'
  import { changeDpiDataUrl } from 'changedpi'
  import { getPreviewUrl } from '@/static/plugin/awsS3'

  // Import the editor default configuration
  import {
    getEditorDefaults,
    createDefaultColorOptions,
    colorStringToColorArray,
    createMarkupEditorToolStyles,
    createMarkupEditorToolStyle,
    createDefaultImageWriter,
    plugin_finetune_defaults,
    createMarkupEditorToolbar,
    createNode,
  } from '@pqina/pintura'

  import { PinturaEditor } from '@pqina/vue-pintura/vue-2'
  import locale_de_DE from '@pqina/pintura/locale/de_DE'
  import locale_en_GB from '@pqina/pintura/locale/en_GB'
  import locale_fr_FR from '@pqina/pintura/locale/fr_FR'
  import locale_ja_JA from '@/static/pintura/locale/ja_JA'

  export default {
    name: 'ImageEditorWorkspaceNew',
    components: { CustomDialog, UploadToLocal, outSetting, PinturaEditor, RightUtils, AIControls },
    mixins: [UserInfoMixins, UploadImageMixins, ImageFileCompressMixins],
    props: {
      tool: {
        type: String,
        default: '1',
      },
    },
    data() {
      return {
        editorDefaults: getEditorDefaults(),
        imageCropAspectRatio: 1,
        revertBtnDisabled: true,
        undoBtnDisabled: true,
        redoBtnDisabled: true,
        willRenderToolbar: (toolbar, env, redraw) => {
          toolbar.shift()
          toolbar.pop()
          toolbar[0][3][0] = createNode(
            'div',
            'v-history',
            {
              class: 'PinturaNavSet',
            },
            [
              // revert,
              createNode('Button', 'v-history-revert', {
                disabled: this.computedRevertBtdDisabled,
                hideLabel: true,
                icon:
                  '<g fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width=".125em"><path d="M7.388 18.538a8 8 0 10-2.992-9.03"/><path fill="currentColor" d="M2.794 11.696L2.37 6.714l5.088 3.18z"/><path d="M12 8v4M12 12l4 2"/></g>',
                label: this.$t('workspace.edit_popup_5'),
                class: 'v-history-revert',
                onclick: () => {
                  this.onRevert()
                },
              }),

              createNode('Button', 'v-history-undo', {
                disabled: this.computedUndoBtdDisabled,
                hideLabel: true,
                icon:
                  '<g fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width=".125em"><path d="M10 8h4c2.485 0 5 2 5 5s-2.515 5-5 5h-4"/><path fill="currentColor" d="M5 8l4-3v6z"/></g>',
                label: this.$t('workspace.edit_popup_2'),
                class: 'v-history-undo',
                onclick: () => {
                  this.onUndo()
                },
              }),
              createNode('Button', 'v-history-redo', {
                disabled: this.computedRedoBtdDisabled,
                hideLabel: true,
                icon:
                  '<g fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width=".125em"><path d="M14 8h-4c-2.485 0-5 2-5 5s2.515 5 5 5h4"/><path fill="currentColor" d="M19 8l-4-3v6z"/></g>',
                label: this.$t('workspace.edit_popup_3'),
                class: 'v-history-redo',
                onclick: () => {
                  this.onRedo()
                },
              }),
            ]
          )

          return [...toolbar]
        },
        fillOptions: [...Object.values(createDefaultColorOptions())],
        stickers: [
          [this.$t('workspace.edit_emoji'), ['⭐️', '😊', '👍', '👎', '☀️', '🌤', '🌥']],
          [
            this.$t('workspace.edit_markers'),
            [
              {
                src:
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSIgaWQ9ImEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjREIzQTU2IiBvZmZzZXQ9IjAlIi8+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGMThBNUEiIG9mZnNldD0iMTAwJSIvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8Y2lyY2xlICBjeD0iNjQiIGN5PSI2NCIgcj0iNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI3IiBmaWxsPSJ1cmwoI2EpIi8+CiAgICA8dGV4dCB4PSI2MiIgeT0iODciIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSInQXJpYWwgQmxhY2snLCdBcmlhbCBCb2xkJywnQXZlbmlyLUJsYWNrJywnc2Fucy1zZXJpZiciIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjY0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xPC90ZXh0Pgo8L3N2Zz4=',
                // thumb: this.$imgPath('/svg/sticker-one.svg'),
                width: '5%',
                alt: 'One',
              },
              {
                src:
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSIgaWQ9ImEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzAyM0FFIiBvZmZzZXQ9IjAlIi8+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNFQzVDNTEiIG9mZnNldD0iMTAwJSIvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8Y2lyY2xlICBjeD0iNjQiIGN5PSI2NCIgcj0iNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI3IiBmaWxsPSJ1cmwoI2EpIi8+CiAgICA8dGV4dCB4PSI2MiIgeT0iODciIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSInQXJpYWwgQmxhY2snLCdBcmlhbCBCb2xkJywnQXZlbmlyLUJsYWNrJywnc2Fucy1zZXJpZiciIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjY0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4yPC90ZXh0Pgo8L3N2Zz4=',
                // thumb: this.$imgPath('/svg/sticker-two.svg'),
                width: '5%',
                alt: 'Two',
              },
              {
                src:
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCI+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSIgaWQ9ImEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMTdDMTc2IiBvZmZzZXQ9IjAlIi8+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMxMzQ1QjEiIG9mZnNldD0iMTAwJSIvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8Y2lyY2xlICBjeD0iNjQiIGN5PSI2NCIgcj0iNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI3IiBmaWxsPSJ1cmwoI2EpIi8+CiAgICA8dGV4dCB4PSI2MiIgeT0iODciIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSInQXJpYWwgQmxhY2snLCdBcmlhbCBCb2xkJywnQXZlbmlyLUJsYWNrJywnc2Fucy1zZXJpZiciIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjY0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4zPC90ZXh0Pgo8L3N2Zz4=',
                // thumb: this.$imgPath('/svg/sticker-three.svg'),
                width: '5%',
                alt: 'Three',
              },
            ],
          ],
        ],
        // 文字大小需要在node_modules\@pqina\pintura\pintura.js createToolStyles方法修改
        markupEditorToolStyles: createMarkupEditorToolStyles({
          text: createMarkupEditorToolStyle('text', {
            color: [1, 0.2549, 0.2118],
            fontSize: '4%',
            backgroundColor: [0, 0, 0, 0],
            textAlign: 'left',
          }),
        }),
        markupEditorToolbar: createMarkupEditorToolbar([
          'move',
          'sharpie',
          'eraser',
          'text',
          'path',
          'line',
          'arrow',
          'rectangle',
          'ellipse',
          'preset',
        ]),
        // zoomLevel: null,
        finetuneControlConfiguration: plugin_finetune_defaults.finetuneControlConfiguration,
        finetuneOptions: plugin_finetune_defaults.finetuneOptions,
        cropSelectPresetOptions: [
          [undefined, 'Custom'],
          [1, 'Square'],
          // shown when cropSelectPresetFilter is set to 'landscape'
          [2 / 1, '2:1'],
          [3 / 2, '3:2'],
          [4 / 3, '4:3'],
          [16 / 10, '16:10'],
          [16 / 9, '16:9'],
          // shown when cropSelectPresetFilter is set to 'portrait'
          [1 / 2, '1:2'],
          [2 / 3, '2:3'],
          [3 / 4, '3:4'],
          [10 / 16, '10:16'],
          [9 / 16, '9:16'],
        ],
        utils: [
          'crop',
          'finetune',
          'filter',
          'annotate',
          'sticker',
          // 'fill',
          'redact',
          'frame',
          'resize',
        ],

        showSetting: false,
        isHandZoomChange: false,
        activeUtil: '',
        isAIUtil: false,
        brushSize: 20,
        isAutoRemove: true,
        removeObjectOriginFile: null,
        removeObjectAnnotationStartIndex: 0,

        isDownloading: false,

        processTime: null, //处理定时器
        processNum: 0, //定时器
        processType: true, //是否可以处理
        aiProcessing: false, //AI处理中

        aiFail: false, //AI处理失败
        sizeWin: false, //超出限制提示
        pointWin: false, //积分不足
        fileWin: false, //替换文件

        activeTool: '1',
        currentImage: {},
        imageFile: null,
        imgInfo: null,
        loadingImage: false,

        //输出参数
        outSettingConfig: {
          compress: {
            quality: 95,
          },
          keep_origin_name: true,
          dpi: 72,
          format: 'default',
        },
        //输出参数copy
        outSettingConfigCopy: {},
        imageSize: {
          originWidth: 0,
          originHeight: 0,
          width: 0,
          height: 0,
        },
        history: [],
        historyIndex: 0,
        pqinaHistoryLength: 0,
        aiHistoryLength: 0,
        latestAIHistoryIndex: 0,
        prevImageUrl: '',
        isFirstLoad: true,
        isNeedDeductPoint: false,
        isDownLoadImageDeductPoint: false,
        uploadLocation: '',
        defaultFileType: '',
      }
    },
    computed: {
      computedUndoBtdDisabled() {
        return this.undoBtnDisabled
      },
      computedRedoBtdDisabled() {
        return this.redoBtnDisabled
      },
      computedRevertBtdDisabled() {
        return this.revertBtnDisabled
      },
      localeLang() {
        switch (this.$store.state.locale) {
          case 'en':
            return locale_en_GB
          case 'fr':
            return locale_fr_FR
          case 'de':
            return locale_de_DE
          case 'ja':
            return locale_ja_JA
          default:
            return locale_en_GB
        }
      },
      currentTool() {
        return this.activeTool || this.tool
      },
    },
    watch: {
      imgInfo: {
        handler(val) {
          if (val) {
            // this.convertUrlToFile(val)
            this.getPoint()
          }
        },
        deep: true,
      },
      historyIndex: {
        handler(val) {
          let needForceUpdate = false
          if (val > 0) {
            if (this.undoBtnDisabled) {
              this.undoBtnDisabled = false
              needForceUpdate = true
            }
            if (this.revertBtnDisabled) {
              this.revertBtnDisabled = false
              needForceUpdate = true
            }
          } else {
            if (!this.undoBtnDisabled) {
              this.undoBtnDisabled = true
              needForceUpdate = true
            }
            if (!this.revertBtnDisabled) {
              this.revertBtnDisabled = true
              needForceUpdate = true
            }
          }

          if (val + 1 < this.history.length) {
            if (this.redoBtnDisabled) {
              this.redoBtnDisabled = false
              needForceUpdate = true
            }
          } else {
            if (!this.redoBtnDisabled) {
              this.redoBtnDisabled = true
              needForceUpdate = true
            }
          }
          if (needForceUpdate) {
            this.$forceUpdate()
          }
        },
      },
    },
    mounted() {
      this.initData()
      //初始化侧边栏选择
      // const sel_tab = this.$route.query['sel_tab']
      // this.activeTool = sel_tab

      //复制输出参数弹窗
      this.outSettingConfigCopy = deepClone(this.outSettingConfig)

      window.addEventListener('storage', (e) => {
        if (e.key === 'imgInfo') {
          this.imgInfo = JSON.parse(e.newValue)
          localStorage.removeItem('imgInfo')
          this.workspaceImgInfoToEditImageInfo()
        } else if (e.key === USER_LOGOUT || e.key === USER_LOGIN) {
          if (e.newValue === '1') {
            this.logout()
          }
        }
      })
      this.initLocalstorageImg()

      setTimeout(() => {
        window.editor = this.$refs.pinturaEditor.editor
      }, 0)
    },
    methods: {
      initData() {
        if (window && window.__MICRO_APP_ENVIRONMENT__) {
          const data = window.microApp.getData()
          console.log('主应用下发的data数据:', data)
          if (data.tool) {
            this.tool = data.tool
          }
        }
      },
      onSelectcontrol(value) {},
      onUpdateBrushSize(brushSize) {
        this.brushSize = brushSize
        this.markupEditorToolStyles = createMarkupEditorToolStyles({
          // create the text tool style and override fontSize property
          sharpie: createMarkupEditorToolStyle('path', {
            strokeWidth: brushSize,
            // strokeColor: [0.062, 0.396, 0.063],
            strokeColor: colorStringToColorArray('rgba(189, 255, 1, 1)'),
            disableErase: false,
            disableResize: true,
            disableMove: true,
          }),
        })
      },
      onBgColorChange(colors) {
        const { r, g, b, a } = colors.rgba
        // this.bgColors = colorStringToColorArray(`rgba(${r}, ${g}, ${b}, ${a}`)
        const imageState = this.$refs.pinturaEditor.editor.imageState
        imageState.backgroundColor = colorStringToColorArray(`rgba(${r}, ${g}, ${b}, ${a}`)
        imageState.backgroundImage = undefined
        this.$refs.pinturaEditor.editor.history.write(imageState)
        // this.imageBackgroundImage = undefined
      },
      onBgImageChange(image) {
        const imageState = this.$refs.pinturaEditor.editor.imageState
        imageState.backgroundColor = [0, 0, 0, 0]
        imageState.backgroundImage = image
        this.$refs.pinturaEditor.editor.history.write(imageState)
      },
      onAutoRemoteChange(checked) {
        this.isAutoRemove = checked
      },
      async clickUtil(type, util) {
        if (!this.history.length) {
          return
        }
        if (util === 'erase') {
          //校验用户身份
          if (!this.identityCheck()) {
            return
          }
        } else {
          this.cancelEraseEditorAnnotations()
        }

        this.removeObjectOriginFile = null
        this.removeObjectAnnotationStartIndex = 0
        this.activeUtil = util
        if (type === 'AI') {
          this.isAIUtil = true

          if (util === 'erase') {
            // 生成当前图片
            const processRes = await this.$refs.pinturaEditor.editor.processImage()
            this.removeObjectOriginFile = processRes.dest

            this.removeObjectAnnotationStartIndex = this.$refs.pinturaEditor.editor.imageState.annotation.length
            this.$refs.pinturaEditor.editor.util = 'annotate'
            this.$refs.pinturaEditor.editor.annotateActiveTool = 'sharpie'
            this.markupEditorToolStyles = createMarkupEditorToolStyles({
              // create the text tool style and override fontSize property
              sharpie: createMarkupEditorToolStyle('path', {
                strokeWidth: this.brushSize,
                strokeColor: colorStringToColorArray('rgba(189, 255, 1, 1)'),
                disableErase: false,
                disableResize: true,
                disableMove: true,
              }),
            })
          } else {
            this.$refs.pinturaEditor.editor.util = 'finetune'
          }

          // footers.forEach((footer) => footer.setAttribute('style', 'display: none'))
        } else {
          const footers = [...document.getElementsByClassName('PinturaUtilFooter')]
          footers.forEach((footer) => footer.setAttribute('style', 'display: block'))
          if (util === 'annotate') {
            this.markupEditorToolStyles = createMarkupEditorToolStyles({
              // create the text tool style and override fontSize property
              sharpie: createMarkupEditorToolStyle('path', {
                strokeWidth: '0.5%',
                strokeColor: [1, 0.2549, 0.2118],
                disableErase: false,
                disableResize: true,
                disableMove: true,
              }),
            })
          }
          this.$refs.pinturaEditor.editor.util = util
          this.isAIUtil = false
        }
      },

      onWritehistory(res) {
        this.changePqinaHistory(this.$refs.pinturaEditor.editor.history.get())
      },

      handleEditorAddShape() {
        if (this.isAutoRemove && this.activeUtil === 'erase') {
          this.handleEraseAI()
        }
      },

      cancelEraseEditorAnnotations() {
        const currentHistories = this.$refs.pinturaEditor.editor.history.get()
        const addAnnotationLength =
          currentHistories[currentHistories.length - 1].annotation.length -
          this.removeObjectAnnotationStartIndex
        const addAnnotationIndex =
          this.$refs.pinturaEditor.editor.imageState.annotation.length - this.removeObjectAnnotationStartIndex

        if (addAnnotationLength > 0) {
          this.$refs.pinturaEditor.editor.history.set(
            currentHistories.slice(0, currentHistories.length - addAnnotationLength)
          )
          // this.changePqinaHistory(this.$refs.pinturaEditor.editor.history.get())
          this.history = this.history.slice(0, this.history.length - addAnnotationIndex)
          this.historyIndex = this.history.length - addAnnotationIndex
          this.$refs.pinturaEditor.editor.history.index = currentHistories.length - addAnnotationIndex
          // for (let i = 0; i < addAnnotationLength; i++) {
          //   this.$refs.pinturaEditor.editor.history.undo()
          // }
        }
      },

      async handleEraseAI() {
        this.processingFun(true)
        this.processType = true
        try {
          const image = await this.createMaskCanvas()
          const work = await this.initWork(image)
          work.params = {
            name: 'Inpaint',
            job: 'Inpaint',
          }
          const uid = await this.getUid({ work })
          this.cancelEraseEditorAnnotations()

          this.onAiHandle({ id: 'inpaint' }, { mask_uid: uid }, this.removeObjectOriginFile)
        } catch {
          this.processingFun(false)
        }
      },

      createMaskCanvas() {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas')
          const size = this.$refs.pinturaEditor.editor.imageCropSize
          canvas.width = size.width
          canvas.height = size.height
          const ctx = canvas.getContext('2d')
          const targetAnnotations = this.$refs.pinturaEditor.editor.imageState.annotation.slice(
            this.removeObjectAnnotationStartIndex
          )

          targetAnnotations.forEach((item) => {
            ctx.strokeStyle = this.colorsToRgb(item.strokeColor)
            ctx.lineWidth = item.strokeWidth
            ctx.lineJoin = 'round'
            ctx.lineCap = 'butt'
            this.drawLine(ctx, item.points, size)
          })

          const imgURL = canvas.toDataURL()
          const img = new Image()

          img.src = imgURL
          img.setAttribute('crossOrigin', 'anonymous')
          img.onload = () => {
            resolve(img)
          }
        })
      },

      drawLine(ctx, points, size) {
        points = points.map((point) => {
          return { x: (parseFloat(point.x) * size.width) / 100, y: (parseFloat(point.y) * size.height) / 100 }
        })
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        // Loop through the points and draw the curve
        for (let i = 1; i < points.length - 2; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }
        const length = points.length
        // Draw the last segment of the curve
        ctx.quadraticCurveTo(
          points[length - 2].x,
          points[length - 2].y,
          points[length - 1].x,
          points[length - 1].y
        )

        // Stroke the curve
        ctx.stroke()
        ctx.closePath()
      },

      colorsToRgb(colors) {
        return `rgb(${(colors[0] * 255).toFixed(0)}, ${(colors[1] * 255).toFixed(0)}, ${(
          colors[2] * 255
        ).toFixed(0)})`
      },

      onPinturaEditorLoad(res) {
        if (this.isFirstLoad) {
          this.changePqinaHistory(this.$refs.pinturaEditor.editor.history.get())
          this.isFirstLoad = false
          this.clickUtil('AI', 'sharpen')
        }
        // setTimeout(() => {
        // }, 0)
      },

      changePqinaHistory(pqinaHistory) {
        const pqinaHistoryLength = pqinaHistory.length
        if (pqinaHistoryLength === 0) {
          return
        }
        // this.undoBtnDisabled = false
        // 获取历史记录
        // 如果没有ai操作 直接替换
        // if (this.aiHistoryLength === 0) {
        //   this.history = pqinaHistory
        //   this.historyIndex = pqinaHistoryLength - 1
        // } else {
        if (!this.history.length) {
          this.history.push(pqinaHistory[0])
          return
        }
        if (pqinaHistoryLength === this.pqinaHistoryLength) {
          // 最后一项是编辑器的历史记录
          const latestHistory = this.history[this.history.length - 1]
          if (latestHistory.isAIHistory) {
            return
          }
          // 替换历史记录最后一项
          this.history.splice(this.historyIndex, 1, pqinaHistory[pqinaHistoryLength - 1])
        }
        // 如果当前的P历史记录等于存储的P历史记录
        else if (pqinaHistoryLength < this.pqinaHistoryLength) {
          // 回退操作任务操作自行控制 最后一项应该是P历史记录
          // history.length > lastAiHistoryIndex   应该会大于
          // 移除多余选项
          this.history.splice(this.historyIndex + 1, this.history.length - 1 - this.historyIndex + 1)
          // 添加最后一项
          this.history.push(pqinaHistory[pqinaHistoryLength - 1])

          // index
          this.historyIndex = this.historyIndex + 1

          // 如果当前的P历史记录大于存储的P历史记录
        } else {
          this.history.push(pqinaHistory[pqinaHistoryLength - 1])
          //  index
          // 增加长度pqinaHistoryLength
          this.historyIndex = this.history.length - 1
        }
        this.pqinaHistoryLength = pqinaHistoryLength
        // }
      },

      addAIHistory(aiHistory) {
        // {
        //   isAIHistory: true,
        //   src: ''
        //   preSrc: ''
        // }
        if (this.historyIndex + 1 >= this.history.length) {
          this.history.push(aiHistory)
          // this.latestAIHistoryIndex = this.historyIndex + 1
          // this.historyIndex += 1
          // this.aiHistoryLength += 1
          this.historyIndex = this.history.length - 1
        } else {
          this.history.splice(this.historyIndex + 1, this.history.length - 1 - this.historyIndex + 1)
          this.history.push(aiHistory)
          // todo  this.aiHistoryLength += 1
          this.historyIndex += 1
        }
        // this.latestAIHistoryIndex = this.historyIndex + 1

        // this.aiHistoryLength += 1
      },
      // 底部操作相关

      async onUndo() {
        if (!this.history.length) {
          return
        }
        // this.refs.pinturaEditor.editor.history.get()
        if (this.historyIndex <= 0) {
          return
        }
        // if (this.$refs.pinturaEditor.editor.history.index > this.historyIndex) {
        //   this.$refs.pinturaEditor.editor.history.undo()
        //   return
        // }
        const latestHistory = this.history[this.historyIndex]
        if (latestHistory.isAIHistory) {
          // todo  加载前一张图片
          console.log('prevHistoriesprevHistories', latestHistory)
          // const image = new Image()
          // image.src = latestHistory.prevImageUrl
          // //获取图片处理后的图片格式
          // // Work.getCanDownload(transId).then((reqData) => {
          // //   const suffix = reqData.data.data.filename.split('.')[1]
          // //   // this.imageEditor.setImageType(suffix)
          // //   this.outSettingConfig.format = suffix
          // // })
          // image.crossOrigin = 'anonymous'
          // image.onload = () => {
          //   // this.$emit('processingFun', false)
          //   // this.processingFun(false)
          //   // this.$refs.pinturaEditor.editor.updateImage(Work.targetImgUrl(transId))
          // }
          // const pqinaHistoryIndex = this.$refs.pinturaEditor.editor.history.index
          // console.log('undo--pqinaHistorypqinaHistory', pqinaHistoryIndex)
          const nextHistories = this.$refs.pinturaEditor.editor.history.get()

          await this.$refs.pinturaEditor.editor.loadImage(latestHistory.prevImageUrl)
          this.$refs.pinturaEditor.editor.history.set(latestHistory.prevHistories)

          this.history[this.historyIndex].nextHistories = nextHistories

          // const undoHistory = this.history.slice(this.historyIndex)
          // undoHistory
          //   .filter((item) => !item.isAIHistory)
          //   .forEach(() => {
          //     this.$refs.pinturaEditor.editor.history.undo()
          //   })
          // this.historyIndex =
          // this.$refs.pinturaEditor.editor.history.index = pqinaHistoryIndex
          // image.onerror = () => {
          //   // this.$emit('processingFun', false)
          //   // this.processingFun(false)
          // }

          // this.history.pop()
        } else {
          this.$refs.pinturaEditor.editor.history.undo()
        }

        this.historyIndex -= 1
        // p History 回退
      },

      async onRedo() {
        if (!this.history.length) {
          return
        }
        if (this.historyIndex === this.history.length - 1) {
          return
        }
        const latestHistory = this.history[this.historyIndex + 1]
        if (latestHistory.isAIHistory) {
          // todo  加载前一张图片
          await this.$refs.pinturaEditor.editor.loadImage(latestHistory.src)
          this.$refs.pinturaEditor.editor.history.set(latestHistory.nextHistories)
          this.$refs.pinturaEditor.editor.history.index = 0
        } else {
          this.$refs.pinturaEditor.editor.history.redo()
        }
        this.historyIndex += 1
      },

      async onRevert() {
        if (!this.history.length) {
          return
        }
        const firstAiHistory = this.history.find((item) => item.isAIHistory)
        if (!firstAiHistory) {
          this.historyIndex = 0
          this.$refs.pinturaEditor.editor.history.revert()
          const initHistory = this.$refs.pinturaEditor.editor.history.get()
          this.history = initHistory
          this.pqinaHistoryLength = initHistory.length
          return
        }
        this.history = []
        this.historyIndex = 0
        const initHistory = this.$refs.pinturaEditor.editor.history.get()
        // const nextHistories = this.$refs.pinturaEditor.editor.history.get()
        await this.$refs.pinturaEditor.editor.loadImage(this.currentImage.targetImg)
        this.history = this.$refs.pinturaEditor.editor.history.get()
        this.pqinaHistoryLength = initHistory.length
        // this.$refs.pinturaEditor.editor.history.set(firstAiHistory.prevHistories)
        // this.$refs.pinturaEditor.editor.history.index = 0
        // this.history[this.historyIndex].nextHistories = nextHistories
      },

      changeOutSet(outSettingConfig) {
        this.outSettingConfig = outSettingConfig
      },
      uploadFile2(isValidate = true) {
        //用户已经下载过图片
        if (this.history.length > 0 && isValidate) {
          //唤起更换提示弹窗
          // this.fileWinFun(true)
          this.fileWin = true
          return
        }
        const inp = document.createElement('input')
        inp.type = 'file'
        inp.accept = 'image/png,image/jpeg,image/jpg'
        inp.click()
        //防止重复绑定
        inp.removeEventListener('change', () => {})
        inp.addEventListener('change', () => {
          this.initHistoryParams()
          // this.$emit('uploadFile', inp.files[0])
          this.uploadFile(inp.files[0])
          // this.$refs.pinturaEditor.editor.loadImage(inp.files[0])
          // this.imageFile = inp.files[0]
        })
      },
      initHistoryParams() {
        this.isFirstLoad = true
        this.history.length = []
        this.historyIndex = 0
        this.pqinaHistoryLength = 0
        this.aiHistoryLength = 0
        this.latestAIHistoryIndex = 0
        this.isDownLoadImageDeductPoint = false
        this.isNeedDeductPoint = false
      },
      async downLoadImage() {
        //是否存在图片
        if (!this.history.length) {
          return
        }
        //锁定用户下载
        if (this.isDownloading) {
          return
        }

        if (this.isNeedDeductPoint && !this.isDownLoadImageDeductPoint) {
          const res = await Work.deductPoint({ trans_id: this.work.transId })
          if (!this.verificationMoney(res)) {
            return
          }
          this.isDownLoadImageDeductPoint = true
          //扣点
          this.pointsFun()
        }

        this.isDownloading = true

        let imgType = this.defaultFileType
        //用户设置输出参数
        if (this.outSettingConfig.format !== 'default') {
          imgType = this.outSettingConfig.format
        }
        const typeJson = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
        }
        const mimeType = typeJson[imgType]

        const writerOptions = {
          format: 'canvas',
          quality: this.outSettingConfig.compress.quality / 100,
        }
        if (mimeType) {
          writerOptions.mimeType = mimeType
        } else {
          writerOptions.mimeType = this.$refs.pinturaEditor.editor.imageFile.type
        }
        const imageFile = this.$refs.pinturaEditor.editor.imageFile

        const res = await this.$refs.pinturaEditor.editor.processImage({
          imageWriter: createDefaultImageWriter(writerOptions),
        })
        //文件压缩处理
        const href = res.dest.toDataURL(writerOptions.mimeType, 1)

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
          event: 'online_work',
          xargs_event_category: 'editor',
          event_value: 'save_img',
        })
        if (this.currentImage && this.currentImage.filename) {
          a.download = this.currentImage.filename
        } else {
          a.download = Date.now() + '.' + imgType
        }

        a.href = outHref
        a.dispatchEvent(new MouseEvent('click'))

        //恢复用户下载
        this.isDownloading = false
      },

      confirmOutSet(showSetting) {
        if (showSetting) {
          this.changeOutSet(deepClone(this.outSettingConfigCopy))
        }
        this.showSetting = false
      },
      openSetWin() {
        this.outSettingConfigCopy = deepClone(this.outSettingConfig)
        this.showSetting = true
      },
      // AI图片处理相关

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
      getAiConfig(item) {
        const config = WorkFlowConfig(item.id, (item.params && item.params.scale) || 2)
        if (config) {
          if (item.params) {
            for (const key in item.params) {
              config.module_params[key] = item.params[key]
            }
          }

          config.out_params = this.getOutParams()
          return {
            config: [
              {
                config: {
                  ...config,
                },

                name: item.id == 'pd_matting' ? 'matting' : item.id,
              },
            ],
            name: item.id == 'pd_matting' ? 'matting' : item.id,
          }
        } else {
          return ''
        }
      },

      /**
       * @getUid 获取Uid
       * @param {Object} work 处理的图片结果
       */
      async getUid({ work = {} }) {
        // const transid = this.imageEditor.getLastAiTransId()

        //含有transid 直接转化uid
        // if (transid) {
        //   const reqData = await Work.conversionUid(transid)
        //   uid = reqData.data.data.uid
        // } else {
        //   //上传转化uid
        //   const uploadImgData = await this.uploadImg(work)
        //   uid = uploadImgData.uid
        // }
        const { uid, uploadLocation } = await this.uploadImg(work)
        this.uploadLocation = uploadLocation

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
       * @verificationMoney 余额校验
       */
      verificationMoney(reqData) {
        //余额不足
        if (reqData.code === 10012) {
          // this.$emit('pointWinFun', true)
          this.pointWinFun(true)
          return false
        } else if (reqData.code !== 200) {
          //处理失败
          // this.$emit('aiFailFun', true)
          this.aiFailFun(true)
          return false
        }
        return true
      },
      pointsFun() {
        this.getPoint()
      },

      /**
       * @processElk  开始处理上报elk
       */
      processElk() {
        const model_name = this.work.config.config[0].config.module_params.model_name
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_id: this.work.transId, //work transId
            process_method: 'single', //单一模型
            process_steps: '',
            process_type: this.work.config.name, //job名称
            model_name, //模型名称
            process_params: JSON.stringify(this.work.config.config.module_params), //模型参数
            workflow_name: '', //工作流名称
          },
        })
      },
      /**
       * @processSuccessElk  处理成功上报elk
       */
      processSuccessElk() {
        const model_name = this.work.config.config[0].config.module_params.model_name
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process',
          event_info: {
            process_id: this.work.transId,
            process_type: this.work.config.job,
            _model_name: model_name,
            process_status: 'success',
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
                // this.$emit('aiFailFun', true)
                this.aiFailFun(true)
                reject()
              } else {
                this.processTime = setTimeout(() => {
                  this.getProcessingProgress(transId, resolve, reject)
                }, 2000)
              }
            } else {
              //处理失败
              // this.$emit('aiFailFun', true)
              this.aiFailFun(true)
              reject()
            }
          })
        } else {
          //处理失败(超时)
          // this.$emit('aiFailFun', true)
          this.aiFailFun(true)
          this.processNum = 0
        }
      },
      async onAiHandle(item, otherParams = {}, imageFile) {
        //开启处理流程
        otherParams.front_edit = 1
        //校验用户身份
        if (!this.identityCheck()) {
          return
        }
        if (!imageFile) {
          this.processType = true
          this.processingFun(true)
        }
        // todo 判断图片是否加载完成
        // const image = this.imageEditor.getUnprocessedImage()
        // const imagSize = this.$refs.pinturaEditor.editor.imagSize // File类型
        const prevImageFile = this.$refs.pinturaEditor.editor.imageFile // File类型
        let targetImageFile = imageFile
        if (!targetImageFile) {
          const processRes = await this.$refs.pinturaEditor.editor.processImage() // File类型
          targetImageFile = processRes.dest
        }

        // const work = await this.initWork(image, this.imageEditor.getImageType())
        const work = await this.initWorkNew(targetImageFile, targetImageFile.type)

        //AI处理中弹窗
        // this.$emit('processingFun', true)
        const config = this.getAiConfig(item)
        const configs = config.config
        // enlarge 2x模型单独分配两台服务器需求参数特殊处理
        if (
          configs.length === 1 &&
          configs[0].config.module_params.model_name === 'EnlargeStandard_2x_Stable'
        ) {
          config.name = 'enlarge_2x'
          if (configs[0].name) {
            configs[0].name = 'enlarge_2x'
          }
        }
        work.params = {
          name: config.name,
          job: config.name,
        }
        const uid = await this.getUid({ work })

        const requirePngWorks = [WorkFlowType.matting, WorkFlowType.paddle_matting]
        const dst_file_name = this.setFileName(
          work.filename,
          requirePngWorks.includes(item.id) ? 'png' : this.outSettingConfig.format
        )

        if (config) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'process',
            event_info: {
              process_status: 'start',
            },
          })
          try {
            const scale = (item.params && item.params.scale) || 1
            const { data } = await Work.start(item.id, uid, config, '', scale, dst_file_name, otherParams)

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

            this.isNeedDeductPoint = true
            //图片放大流程
            // this.enlargeFun(item)

            //扣点
            this.pointsFun()
            this.prevImageUrl = prevImageFile
            const image = new Image()
            const workImageUrl = await getPreviewUrl({ transId, issrc: 0 })

            image.src = workImageUrl
            //获取图片处理后的图片格式
            // Work.getCanDownload(transId).then((reqData) => {
            //   const suffix = reqData.data.data.filename.split('.')[1]
            //   // this.imageEditor.setImageType(suffix)
            //   this.outSettingConfig.format = suffix
            // })
            image.crossOrigin = 'anonymous'
            image.onload = async () => {
              // this.$emit('processingFun', false)
              this.processingFun(false)
              if (!this.processType) {
                return
              }

              const prevHistories = this.$refs.pinturaEditor.editor.history.get()

              await this.$refs.pinturaEditor.editor.loadImage(workImageUrl)

              if (this.activeUtil === 'sharpen') {
                if (item.id === WorkFlowType.enlarge && item.key === '1') {
                  this.$refs.pinturaEditor.editor.zoomLevel = 2
                }
                if (item.id === WorkFlowType.enlarge && item.key === '2') {
                  this.$refs.pinturaEditor.editor.zoomLevel = 4
                }
              }

              if (this.activeUtil === 'erase') {
                const eraseProcessRes = await this.$refs.pinturaEditor.editor.processImage()
                this.removeObjectOriginFile = eraseProcessRes.dest
              }

              this.addAIHistory({
                isAIHistory: true,
                src: workImageUrl,
                prevImageUrl: this.prevImageUrl,
                prevHistories,
              })

              // this.imageEditor.ai(image, transId, item.id)
            }
            image.onerror = () => {
              // this.$emit('processingFun', false)
              this.processingFun(false)
            }
          } catch (e) {
            console.log(e)
          }
        }
      },

      // 取消处理
      cancelProcess() {
        this.aiProcessing = false
        this.processType = false
        // console.log('xxxxxx---processType')
        if (this.processTime) {
          clearTimeout(this.processTime)
          this.processTime = null
        }
      },
      /**
       * @sizeWinFun 大小超出限制
       */
      sizeWinFun(req) {
        this.sizeWin = req
      },
      /**
       * @processingFun AI处理中
       */
      processingFun(req) {
        this.aiProcessing = req
      },
      /**
       * @processingFun AI处理失败
       */
      aiFailFun(req) {
        this.aiFail = req
        this.aiProcessing = false
      },
      /**
       * @pointWinFun 积分不足
       */
      pointWinFun(req) {
        this.pointWin = req
        this.aiProcessing = false
      },
      /**
       * @closeAiProcessing 关闭处理中弹窗
       */
      closeAiProcessing() {
        this.aiProcessing = false
      },
      /**
       * @closeAiFail 关闭处理失败
       */
      closeAiFail() {
        this.aiFail = false
        this.aiProcessing = false
      },
      /**
       * @closeSizeWin 超出大小限制
       */
      closeSizeWin(req) {
        // 1:确定 2:取消
        this.implement(req)
        this.sizeWin = false
        if (req === 2) {
          this.cancelProcess()
        }
      },
      /**
       * @closeSizeWin 积分不足
       */
      closePointWin() {
        this.pointWin = false
        location.href =
          this.$store.state.mainWebsite +
          this.$store.state.specialLocaleLink +
          '/pricing?source=image_editor&popup_type=nocredits'
      },
      /**
       * @FileWinFun 替换文件弹窗
       */
      fileWinFun(req) {
        this.fileWin = req
      },
      /**
       * @btnFileWinFun 替换文件弹窗,钮操作
       */
      btnFileWinFun(isUpload) {
        if (isUpload) {
          this.uploadFile2(false)
        }
        this.fileWin = false
      },
      logout() {
        this.$router.go(0)
      },
      closeLoadingImageHandle() {
        this.loadingImage = false
      },
      convertUrlToFile({ originImg, filename }) {
        this.loadingImage = true
        if (!originImg) {
          return
        }
        const img = new Image()
        img.src = originImg
        img.setAttribute('crossOrigin', 'anonymous')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const dataurl = canvas.toDataURL('image/png')
          this.imgInfo = null
          setTimeout(() => {
            if (this.loadingImage) {
              this.fileList.unshift(blobToFile(dataURLToBlob(dataurl)))
            }
            this.loadingImage = false
          }, 1000)
          function dataURLToBlob(dataurl) {
            const arr = dataurl.split(',')
            const mime = arr[0].match(/:(.*?);/)[1]
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], { type: mime })
          }
          function blobToFile(blob) {
            return new window.File([blob], filename)
          }
        }
        img.onerror = () => {
          this.loadingImage = false
        }
      },
      initLocalstorageImg() {
        const imgInfo = localStorage.getItem('imgInfo')
        if (imgInfo) {
          this.imgInfo = JSON.parse(imgInfo)
          localStorage.removeItem('imgInfo')
          this.workspaceImgInfoToEditImageInfo()
        }
      },
      /**
       *  for workspace edit function are converted to object required for image editor
       */

      workspaceImgInfoToEditImageInfo() {
        this.initHistoryParams()
        this.loadingImage = true
        this.currentImage = {
          targetImg: this.imgInfo.originImg,
          filename: this.imgInfo.filename,
          w: '',
          h: '',
          type: this.imgInfo.filename.substr(this.imgInfo.filename.lastIndexOf('.') + 1),
        }
        this.loadImg()
      },
      changeToolHandle(val) {
        this.activeTool = val
      },
      uploadFile(file) {
        this.defaultFileType = file.type.replace('image/', '')
        this.imageFile = file
        const myBlob = new window.Blob([file], { type: file.type })
        const qrUrl = window.URL.createObjectURL(myBlob)

        // this.zoomLevel = null
        this.currentImage = {
          targetImg: qrUrl,
          filename: file.name,
          w: '',
          h: '',
          type: file.type.replace('image/', ''),
        }
        //用户选择图片

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'editor',
          event_value: 'select_img',
        })
        this.loadImg()
      },

      handleUndo() {
        this.$emit('handleUndo')
      },
      handleRedo() {
        this.$emit('handleRedo')
      },
      loadImg() {
        const img = new Image()
        img.setAttribute('crossOrigin', 'anonymous')
        img.src = this.currentImage.targetImg
        img.onload = () => {
          this.currentImage = { ...this.currentImage, ...{ w: img.width, h: img.height, image: img } }
          this.loadingImage = false
        }
        img.onerror = () => {
          this.loadingImage = false
        }
      },
    },
  }
</script>

<style>
  @import '@/node_modules/@pqina/pintura/pintura.css';
</style>
<style lang="less">
  .PinturaShapeStyleLabel {
    color: #232323 !important;
  }

  .PinturaNavTools {
    height: 40 / @base !important;
    padding-bottom: 0 !important;
  }
  // .v-editor-history {
  //   padding-top: 10 / @base;
  // }
</style>
<style scoped lang="less">
  .main {
    display: flex;
    flex-direction: column;
    // width: 100%;
    // height: 100%;
    padding-bottom: 10 / @base;
    background-color: #fff;

    .content {
      display: flex;
      flex: 1;
      // height: 100%;
    }
  }

  .editor-content {
    display: flex;
    flex: 1;
    // height: 100%;

    .left-editor-content {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;

      .va-pintura-editor {
        height: 100%;
      }
    }
  }

  .right-feature-bar {
    // width: 323px;
    background-color: #fff;
  }

  .icon_my_loading {
    animation: around 1s ease infinite;
  }
  @keyframes around {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .tip-box {
    min-width: 400 / @base;
    padding-bottom: 30 / @base;
  }

  .upload-drager-box {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    background-color: #fff;

    .upload-dragger {
      .icon_upload_black {
        display: inline-block;
        margin: 10 / @base 10 / @base 0;
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
          margin: 10 / @base 10 / @base 0;
        }
      }
    }

    .drag-img-box {
      display: flex;
      align-items: center;
      justify-content: center;
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

    /deep/ .el-upload-dragger {
      height: auto;
    }
  }

  .image-editor-workspace {
    display: flex;
    justify-content: space-between;
    height: calc(100vh - 64px);

    .main {
      width: 100%;
      height: 100%;

      .tui-con {
        box-shadow: none;

        /deep/ h2 {
          display: none;
        }

        /deep/ .r-inner {
          padding-top: 0;
        }
      }
    }

    .dialog-right {
      width: 50 / @base;
      overflow: hidden;
      background: #ebebeb;

      .tools-bar {
        float: left;
        width: 100%;

        .tool {
          width: 100%;
          height: 43 / @base;
          line-height: 50 / @base;
          text-align: center;
          cursor: pointer;
        }

        .active-tool {
          background: #0374ff;
        }
      }
    }

    .loading-image-dialog {
      .loading-image-main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin-bottom: 20px;
      }

      .loading-all {
        width: 60px;
        height: 60px;
      }

      .no_thanks {
        cursor: pointer;

        &:hover {
          color: #e6a23c;
        }
      }
    }
  }

  .footer-action-bar {
    position: relative;
    display: flex;
    justify-content: space-between;
    padding: 0 32 / @base;
  }

  .open-image-btn {
    // position: absolute;
    // bottom: 30 / @base;
    // left: 16 / @base;
    z-index: 100;
    display: flex;
    align-items: center;
    height: 40 / @base;
    cursor: pointer;

    .horizontal-item {
      display: flex;
      flex-direction: row !important;
      align-items: center;
      // width: 100%;
      height: 40 / @base;
      padding: 0 20 / @base;
      font-size: 18px;
      font-weight: 400;
      line-height: 40 / @base;
      color: #4d4d4f;
      border: 1px solid #b8c7d2;
      border-radius: 3px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
    }

    /deep/ .el-upload-dragger {
      width: auto;
      height: auto;
      border: none;
      border-radius: 3px;
    }
  }

  .right-footer {
    position: relative;
    // position: absolute;
    // right: 16 / @base;
    // bottom: 30 / @base;
    z-index: 21;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40 / @base;

    .out-set {
      margin-right: 10 / @base;
      line-height: 1;
      cursor: pointer;
    }

    .icon-s-setting {
      font-size: 27 / @base;
    }

    .save-download-btn {
      // height: 28 / @base;
      // padding: 0 8 / @base;
      // font-size: 14 / @base;
      // font-weight: 400;
      // line-height: 28 / @base;
      // border-radius: 12 / @base;
    }
  }

  .pic_out_setting_cont {
    // display: none;
    position: absolute;
    top: -400 / @base;
    z-index: 100;
    min-width: 240 / @base;
    height: 392 / @base;
    padding: 10 / @base;
    text-align: left;
    background: #f5f7fa;
    border: 1px solid #f0f0f0;
    // box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
  }

  .icons {
    display: flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    cursor: pointer;

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

  .icon-s-open-image {
    margin-right: 10 / @base;
    font-size: 16px;

    &:hover {
      color: #0374ff;
    }
  }
</style>
