<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="tui-con">
    <pintura-editor
      ref="pinturaEditor"
      :src="currentImage.originImg"
      v-bind="editorDefaults"
      :locale="localeLang"
      layoutDirectionPreference="horizontal"
      layoutHorizontalUtilsPreference="right"
      layoutVerticalToolbarPreference="bottom"
      :cropEnableButtonFlipVertical="true"
      :cropEnableInfoIndicator="true"
      :enableMoveTool="true"
      :enableViewTool="true"
      :cropSelectPresetOptions="cropSelectPresetOptions"
      cropSelectPresetFilter="landscape"
      :utils="utils"
      :fillOptions="fillOptions"
      :stickers="stickers"
      :willRenderToolbar="willRenderToolbar"
      :markupEditorToolbar="markupEditorToolbar"
      :markupEditorToolStyles="markupEditorToolStyles"
    />
  </div>
</template>

<script>
  import UploadImageMixins from '@/mixins/components/UploadImgMixins'
  import ELKMixins from '@/mixins/ELKMixins'
  import ImageFileCompressMixins from '@/mixins/components/ImageFileCompressMixins'
  import { dataURLtoBlob, blobToFile } from '@/static/script/utils'
  import UserInfoMixins from '@/mixins/UserInfoMixins'

  import {
    getEditorDefaults,
    createDefaultColorOptions,
    createNode,
    createDefaultImageWriter,
    createMarkupEditorToolbar,
    createMarkupEditorToolStyles,
    createMarkupEditorToolStyle,
  } from '@pqina/pintura'

  import { PinturaEditor } from '@pqina/vue-pintura/vue-2'
  import locale_de_DE from '@pqina/pintura/locale/de_DE'
  import locale_en_GB from '@pqina/pintura/locale/en_GB'
  import locale_fr_FR from '@pqina/pintura/locale/fr_FR'
  import locale_ja_JA from '@/static/pintura/locale/ja_JA'

  export default {
    name: 'ImageCropEdit',
    components: {
      PinturaEditor,
      // UploadToLocal,
      // CuttingBox,
    },
    mixins: [UploadImageMixins, ImageFileCompressMixins, UserInfoMixins, ELKMixins],
    props: {
      currentImage: {
        // currentImage 的file 没有type
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        editorDefaults: getEditorDefaults(),
        willRenderToolbar: (toolbar, env, redraw) => {
          toolbar.pop()
          return [
            // Existing footer items
            ...toolbar,
            createNode(
              'div',
              'v-image-btn',
              {
                class: '"PinturaNavGroup"',
              },
              [
                createNode('Button', 'v-image-done', {
                  // textContent: 'OK',
                  hideLabel: false,
                  icon: false,
                  label: this.$t('workspace.crop_ok'),
                  class: 'PinturaButtonExport v-confirm-btn',
                  onclick: () => {
                    this.editImageConfirm()
                  },
                }),
                createNode('Button', 'v-image-cancel', {
                  // textContent: 'Cancel',
                  hideLabel: false,
                  icon: false,
                  label: this.$t('workspace.crop_cancel'),
                  class: 'PinturaButtonExport v-cancel-btn',
                  onclick: () => {
                    this.$emit('updateEditorCropVisible', false)
                  },
                }),
              ]
            ),
          ]
        },
        imageCropAspectRatio: 1,
        utils: ['crop', 'finetune', 'filter', 'annotate', 'sticker', 'fill', 'redact', 'frame', 'resize'],
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
        markupEditorToolStyles: createMarkupEditorToolStyles({
          text: createMarkupEditorToolStyle('text', {
            color: [1, 0.2549, 0.2118],
            fontSize: '4%',
            backgroundColor: [0, 0, 0, 0],
            textAlign: 'left',
          }),
        }),
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

        confirmBtnLoading: false,

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
      }
    },
    computed: {
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
      initLoaded() {
        return this.originImageLoaded
      },
      //用户登录状态
      loginType() {
        return !!this.$store.state.token
      },
      /**
       * @hasImage 是否存在图片
       */
      hasImage() {
        if (Object.keys(this.currentImage).length === 0) {
          return false
        } else {
          return true
        }
      },
    },

    methods: {
      async editImageConfirm() {
        //防止重复点击
        if (this.confirmBtnLoading) {
          return
        }
        this.confirmBtnLoading = true

        //是否存在图片
        if (!this.hasImage) {
          return
        }

        const typeJson = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          webp: 'image/webp',
        }

        try {
          let imgType = ''
          //用户设置输出参数
          if (this.outSettingConfig.format !== 'default') {
            imgType = this.outSettingConfig.format
          }

          const mimeType = typeJson[imgType]
          const writerOptions = {
            format: 'canvas',
            quality: this.outSettingConfig.compress.quality / 100,
          }
          if (mimeType) {
            writerOptions.mimeType = mimeType
          }
          const res = await this.$refs.pinturaEditor.editor.processImage({
            imageWriter: createDefaultImageWriter(writerOptions),
          })

          console.log('resresresres', res)
          //文件压缩处理
          const href = res.dest.toDataURL()

          //base64 转file文件
          const blob = dataURLtoBlob(href)
          const file = blobToFile(blob, this.currentImage.filename, res.src.type.split('/')[1])
          //生成缩率图
          const thumbnail = await this.imgThumbFun(href)
          this.confirmBtnLoading = false
          //返回处理后的图片
          this.$emit('cropImgSrc', {
            href,
            file,
            thumbnail,
            w: res.dest.width,
            h: res.dest.height,
          })
          this.$emit('updateEditorCropVisible', false)
        } catch (err) {
          console.log('error crop image', err)
          this.confirmBtnLoading = false
        }
      },
      /**
       * @imgThumbFun
       */
      imgThumbFun(imgSrc) {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = imgSrc
          img.onload = () => {
            const thumb = this.imgThumb(img, 180, 180)
            resolve(thumb)
          }
        })
      },
    },
  }
</script>
<style>
  @import '@/node_modules/@pqina/pintura/pintura.css';
</style>
<style lang="less">
  .v-confirm-btn,
  .v-cancel-btn {
    // z-index: 888;
    width: 60px !important;
    // height: 28px;
    // line-height: 28px;
    text-align: center;
    // background: #ff9d1d;
    border-radius: 12px;
  }

  .v-cancel-btn {
    margin-left: 10px !important;
    background: #fff !important;
    border: 1px solid #b8c7d2 !important;
  }
</style>
<style scoped lang="less">
  .tui-con {
    position: relative;
    height: calc(100vh - 64px);
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 30px 70px 0 rgba(6, 7, 50, 0.24);

    /deep/ * {
      user-select: none;
    }

    .tui-box {
      height: calc(100% - 64px);
      padding: 20px;
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
        padding: 0 20px;
        color: #4d4d4f;
        cursor: pointer;
        border-right: 1px solid #ededed;

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
          margin-right: 10px;
        }

        .icon_undo_hover,
        .icon_redo_hover {
          display: none;
        }
      }

      .disabled {
        cursor: not-allowed;
        opacity: 0.3;

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
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;

      .l-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 510px;

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
          align-items: center;
          justify-content: center;
          background: #fff;
        }

        .upload-drager-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;

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
            align-items: center;
            justify-content: center;
          }

          /deep/ .el-upload-dragger {
            height: auto;
          }
        }

        .upload-dragger {
          position: relative;
          width: 100%;
          padding: 25px 2rem;

          .upload-text-tip {
            margin-top: 1.125rem;

            p {
              font-size: 14px;
              color: #9a9999;
            }

            .small {
              font-size: 12px;
            }
          }
        }

        .upload-img {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 70%;
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
            font-size: 30px;
            font-weight: bold;
            line-height: 54px;
            color: #4f6785;
            text-align: center;
          }
        }

        .border-top {
          position: absolute;
          top: 0;
          left: 5px;
          width: 100%;
          height: 1px;
          background-image: linear-gradient(to right, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-repeat: repeat-x;
          background-size: 11px 1px;
        }

        .border-left {
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 100%;
          background-image: linear-gradient(to top, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-repeat: repeat-y;
          background-size: 1px 11px;
        }

        .border-bottom {
          position: absolute;
          bottom: 0;
          left: 5px;
          width: 100%;
          height: 1px;
          background-image: linear-gradient(to right, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-repeat: repeat-x;
          background-size: 11px 1px;
        }

        .border-right {
          position: absolute;
          top: 0;
          right: 0;
          width: 1px;
          height: 100%;
          background-image: linear-gradient(to top, #dfdede 0%, #dfdede 50%, transparent 50%);
          background-repeat: repeat-y;
          background-size: 1px 11px;
        }
      }

      .tui-foot {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;
        border-top: 1px solid #ededed;
      }
    }

    .right-haddle {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 323px;
      overflow: hidden;
      overflow-y: auto;
      border-left: 1px solid #ebeff2;

      .h4 {
        margin: 25px 0 6px;
        font-size: 18px;

        &.reset {
          margin: 25px 0 16px;
        }

        &.reset2 {
          margin-bottom: 16px;
        }
      }

      p {
        margin: 8px 0 6px;
        font-size: 13px;
      }

      .right-footer {
        position: sticky;
        bottom: 0;
        left: 0;
        z-index: 21;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        width: 100%;
        height: 64px;
        padding: 13px 20px;
        background: #fff;
        border-top: 1px solid #ebeff2;

        .save-download-btn,
        .icon-btn {
          height: 44px;
          line-height: 1;
        }

        .save-download-btn {
          width: 100%;
        }

        .icon-btn {
          width: 44px;
          margin-left: 2px;
          background: #ff9d1d;
          border: none;
        }
      }

      .icon-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-right: 15px;

        &:hover {
          .icons {
            border-color: #0374ff;
          }

          span {
            color: #0374ff;
          }
        }

        .icons {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          margin-bottom: 3px;
          cursor: pointer;
          background-color: #fff;
          border: 1px solid #c5c5c5;
          border-radius: 2px;

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
          font-size: 12px;
          color: #7e7e7e;
        }
      }

      .bg-ccc {
        display: flex;
        padding: 10px;
        background: #e6e6e6;
        border-radius: 2px;
      }

      .min-title {
        display: block;
        margin: 10px 0;
        font-size: 12px;
        color: #333;
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
          font-size: 14px;
          line-height: 2.4375rem;
        }
      }

      .r-inner {
        position: relative;
        height: calc(100% - 85px);

        .header {
          position: sticky;
          top: 0;
          left: 0;
          z-index: 21;
          width: 100%;
          height: 40px;
          background: #fff;
        }

        .item {
          padding: 0 15px 20px;
          margin-bottom: 5px;
          border-bottom: 1px solid #fff;

          &.reset {
            padding: 0 15px 10px;
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
          margin-top: 10px;

          .vanceai-tabs_nav {
            justify-content: center;
            margin-bottom: 20px;

            .vanceai-tabs_item {
              min-width: 85px;
              padding: 5px 10px;
              margin: 0;
              text-align: center;
              background: #ededed;

              &:first-child {
                border-radius: 3px 0 0 3px;
              }

              &:last-child {
                border-radius: 0 3px 3px 0;
              }
            }

            .is-active {
              color: #fff;
              background: #0374ff;
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #333;

          .scale {
            width: 72px;
            min-width: 72px;
            height: 38px;
            line-height: 38px;
          }
        }

        .crop-ratio {
          .el-input-number {
            width: 123px;
            max-width: 123px;
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
          margin-top: 20px;

          .reset-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 38px;
            padding: 0 30px;
            border: 2px solid #ddd;

            .icon_reset_btn_hover {
              display: none;
            }

            .icon {
              margin-right: 15px;
            }
          }

          .reset-btn:hover {
            color: #ff9d1d;
            background: #fff;
            border-color: #ff9d1d;

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
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 36px;
            min-height: 36px;
            font-size: 14px;
            line-height: 1;
            background-color: #eee;

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
            display: block;
            margin-bottom: 10px;

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
            width: 50%;
            margin-right: 0;
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
                background: #00f;
              }
            }

            .list:last-child {
              em {
                background: #70b603;
              }
            }

            /deep/ .el-checkbox {
              display: flex;
              flex-direction: column;
              align-items: center;
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
            align-items: center;
            justify-content: center;

            .icon {
              display: flex;
              flex-shrink: 0;
              align-items: center;
              justify-content: center;
              width: 38px;
              height: 38px;
              margin-bottom: 3px;
              cursor: pointer;
              border-radius: 2px;

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
            font-size: 12px;
            color: #7e7e7e;
          }
        }

        .block {
          display: flex;
        }

        .rotate-box-num {
          padding: 0 15px;
        }

        .rotate-box {
          padding: 15px;
          background: #f5f7fa;
        }
      }
    }

    .blur-box {
      color: #333;
    }
  }

  .blur-box {
    &:last-child {
      border: none;
    }

    .blur {
      padding: 10px 0;

      li {
        position: relative;
        background-position: center;
        background-size: cover;

        &:hover,
        &.active {
          .target-img::before {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            content: '';
            border: 2px solid #fff;
          }
        }

        .target-img {
          position: relative;
          width: 100%;
          height: 100%;
          background-position: center;
          background-size: cover;
        }
      }
    }

    ul {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;

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
      position: absolute;
      right: 0;
      bottom: 0;
      color: green;
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
            width: 20px;
            height: 20px;
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
          height: 40px;
          padding: 0;
          font-size: 12px;
          text-align: center;
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
          font-size: 16px;
          background: transparent;
          border: 0;
          border-radius: 2px;

          i {
            margin-right: 10px;
            vertical-align: middle;
          }

          .hover {
            display: none;
          }

          &:hover {
            color: #fff;
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
    margin-left: 10px;
  }

  .horizontal-item {
    display: flex;
    flex-direction: row !important;
    align-items: center;
    width: 100%;
  }

  .horizontal-item2 {
    display: flex;
    flex-direction: row !important;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
  }

  .ai-list,
  .filter-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 20px;

    .ai-item,
    .filter-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 136px;
      height: 86px;
      margin-bottom: 10px;
      text-align: center;
      cursor: pointer;
      border: 2px solid #ebeff2;
      border-radius: 3px;

      p {
        margin: 0;
        font-size: 14px;
        color: #4d4d4f;
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
      flex-direction: row;
      align-items: center;
      height: 48px;

      .icons {
        margin-right: 10px;
      }
    }
  }

  .ai-list {
    &.reset {
      margin-top: 0;
    }
  }

  .icons {
    display: flex;
    align-items: center;
    justify-content: center;
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

  .text-icon {
    width: 40px;
    height: 38px;
    margin: 0 8px 8px 0;
    border: 1px solid #b8c7d2;
    border-radius: 3px;
  }

  .text-long-icon {
    justify-content: space-around;
    width: 64px;
    height: 38px;
    margin: 0 8px 8px 0;
    border: 1px solid #b8c7d2;
    border-radius: 3px;

    &::after {
      font-size: 12px;
      content: '\25bc';
    }
  }

  .icon-list {
    display: flex;
    flex-wrap: wrap;

    .icon-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 47px;
      height: 47px;
      margin: 0 10px 10px 0;
      border: 2px solid #ebeff2;
      border-radius: 3px;
    }
  }

  .filter-list {
    .filter-item {
      position: relative;
      height: 106px;

      .title {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        border-radius: 0 0 3px 3px;
      }
    }
  }

  .background-list {
    display: flex;
    flex-wrap: wrap;

    .thumbnail-block {
      margin: 0 10px 10px 0;
      cursor: pointer;
      border-color: buttonborder;
      border-style: outset;
      border-width: 1px;
      border-radius: 3px;
    }

    .active-block {
      box-shadow: 0 0 0 1px #0374ff;
    }

    .upload-block {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 82px;
      height: 84px;
      cursor: pointer;
      background: #6f6f70;

      .text {
        font-size: 12px;
        line-height: 1.25;
        color: #fff;
        text-align: center;
      }
    }

    .background-item {
      position: relative;
      margin-right: 10px;
      font-size: 12px;
      color: #fff;
      cursor: pointer;

      .sel_icon {
        position: absolute;
        top: 9px;
        right: 0;
        left: 0;
        display: none;
        margin: auto;
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

  .el-input__inner {
    user-select: none;
  }

  .icon-btn {
    width: auto;
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    margin-left: 10px;
    background: #fff;
    border: 1px solid #b8c7d2;
    border-radius: 3px;

    .icon-text {
      margin-left: 10px;
      font-size: 14px;
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
    width: 132px;
    height: 36px;
    padding: 0 10px;
    margin-left: 10px;
    background: #fff;
    border: 1px solid #b8c7d2;
    border-radius: 3px;
  }

  .open-image-btn {
    height: 36px;
    cursor: pointer;

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
    top: 0;
    left: 0;
  }

  .hide-item {
    width: 100%;
    height: 100%;
    cursor: pointer;
    opacity: 0;

    /deep/ .el-color-picker__trigger {
      width: 100%;
      height: 100%;
    }
  }

  .item-margin {
    margin-bottom: 8px;
  }

  .pop-ups {
    top: 38px;
    left: -60px;
    z-index: 99;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 204px;
    padding: 0 20px;
    background-color: #fff;
    border: 1px solid #b8c7d2;
    box-shadow: 0 20px 50px 0 rgba(0, 0, 0, 0.15);

    .pop-ups-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 35px;

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
    left: -56px;
    width: 120px;
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
