<template>
  <div class="new-preview-dialog mask" v-show="visible">
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="dialog-header-le">
          <p class="dialog-title quicksand-bold">{{ $t('workspace.preview') }}</p>
          <div class="mode-switch">
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('workspace.preview_hover_tip_1')"
              placement="top"
            >
              <div class="icon" @click="switchMode('1')" :class="[activeMode === '1' && 'active']">
                <i class="iconfont-single icon-s-batch-full"></i>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('workspace.preview_hover_tip_2')"
              placement="top"
            >
              <div class="icon" @click="switchMode('2')" :class="[activeMode === '2' && 'active']">
                <i class="iconfont-single icon-s-batch-compared"></i>
              </div>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('workspace.preview_hover_tip_3')"
              placement="top"
              :class="[work.operation === 'portrait' && 'mouse-style']"
            >
              <div class="icon" @click="switchMode('3')" :class="[activeMode === '3' && 'active']">
                <i class="iconfont-single icon-s-batch-slide"></i>
              </div>
            </el-tooltip>
          </div>
          <div class="zoom-box">
            <span class="zoom-label">{{ $t('workspace.zoom') }}</span>
            <el-select class="select-zoom" :disabled="disableZoom" v-model="zoom" @change="zoomChangeHandle">
              <el-option
                v-for="(item, index) in zooms"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="dialog-close" @click="close">
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div class="dialog-content">
        <div class="view">
          <fit-canvas-mode
            v-if="activeMode === '1'"
            :preview-info="previewInfo"
            @imgLoadedElk="imgLoadedElk"
            @rightImgLoadedElk="rightImgLoadedElk"
          />
          <slider-mode
            v-if="activeMode === '3'"
            :big="big"
            :zoom="zoom"
            :preview-info="previewInfo"
            :active-mode="activeMode"
            @wrapSize="wrapSize"
            @halfPreview="setHalfPreview"
            @imgLoadedElk="imgLoadedElk"
            @rightImgLoadedElk="rightImgLoadedElk"
          />
          <compared-mode
            v-if="activeMode === '2'"
            :preview-info="previewInfo"
            :big="big"
            :zoom="zoom"
            :active-mode="activeMode"
            @imageMove="imageMove"
            @halfPreview="setHalfPreview"
            @imgLoadedElk="comparedImgLoadedElk"
            @rightImgLoadedElk="rightImgLoadedElk"
          />
        </div>
        <div class="preview">
          <div class="preview-box" v-loading="previewImgLoading">
            <div
              class="preview-image"
              :style="{
                height: thumb.height + 'px',
                width: thumb.width + 'px',
                position: 'relative',
              }"
            >
              <img
                @load="previewLoaded"
                ref="previewImg"
                :src="previewInfo.beforeImg"
                alt=""
                class="thumbnail"
              />
              <vue-draggable-resizable
                v-if="showVueDraggable"
                ref="dragL"
                :w="mover.width"
                :h="mover.height"
                :x="mover.left"
                :y="mover.top"
                :parent="true"
                :grid="[1, 1]"
                :resizable="false"
                class="thumbnail-mover"
                :class="mover.width < 20 && 'thumbnail-mover-small'"
                class-name="dragging1"
                id="thumbnail-mover"
                @dragging="onDrag"
                @dragstop="onDragstop"
                @activated="onDrag"
              >
                <template
                  v-if="
                    this.$getCookie('cloud_isFirstDrag') && JSON.parse(this.$getCookie('cloud_isFirstDrag'))
                  "
                >
                  <div class="drag-tip" v-html="$t('workspace.preview_7')"></div>
                </template>
                <template v-if="mover.width < 20">
                  <div
                    class="mover"
                    :style="{
                      width: mover.width + 'px',
                      height: mover.height + 'px',
                    }"
                  >
                    <i class="iconfont-single icon-s-magnifier"></i>
                  </div>
                </template>
              </vue-draggable-resizable>
            </div>
          </div>
          <div class="preview-info">
            <div class="info-msg filename">
              <span v-html="$t('workspace.upload_25') + ':'" class="pic-msg quicksand-bold"></span>
              <span>{{ previewInfo.info.filename }}</span>
            </div>
            <div class="info-msg">
              <span v-html="$t('workspace.upload_3') + ':'" class="pic-msg quicksand-bold"></span>
              <span>
                {{ previewInfo.beforeW || previewInfo.info.w }}
                x
                {{ previewInfo.beforeH || previewInfo.info.h }} px
              </span>
            </div>
            <div class="info-msg">
              <span v-html="$t('workspace.upload_4') + ':'" class="pic-msg quicksand-bold"></span>
              <span>
                {{
                  previewInfo.info.customWidth ||
                  previewInfo.afterW ||
                  (previewInfo.info.w * previewInfo.info.config.scale).toFixed(0)
                }}
                x
                {{
                  previewInfo.info.customHeight ||
                  previewInfo.afterH ||
                  (previewInfo.info.h * previewInfo.info.config.scale).toFixed(0)
                }}
                px
              </span>
            </div>
            <div class="info-msg">
              <span v-html="$t('workspace.upload_24') + ':'" class="pic-msg quicksand-bold"></span>
              <span>
                {{ $t(`common.${previewInfo.info.operation}`) }}
              </span>
            </div>
          </div>

          <div class="download-image">
            <div class="credits-bottom">
              <div class="line">
                {{ $t('workspace.credits_preview') }}
              </div>
              <div class="line" style="display: flex; justify-content: space-between;">
                <span>
                  {{ toFixed($store.state.credits) }}
                  {{ $t('workspace.credits_preview_s_credits') }}
                </span>
                <a
                  :href="
                    $store.state.mainWebsite +
                    $store.state.specialLocaleLink +
                    '/pricing/?source=preview&medium=get_credits'
                  "
                  style="text-decoration: underline;"
                  class="credits-tip"
                >
                  {{ $t('workspace.credits_preview_get') }}
                </a>
              </div>
            </div>

            <div class="tc download-btn" v-if="isWatermarkPlanB">
              <div class="primary-none-button quicksand" v-loading="downloadBtn" @click="download">
                <span>{{
                  userType !== 'paying' ? $t('workspace.download_watermark_free') : $t('workspace.upload_13')
                }}</span>
                <div class="credits-size">
                  <a
                    class="credits-tip"
                    :href="
                      $store.state.mainWebsite +
                      $store.state.specialLocaleLink +
                      '/pricing/?source=preview&medium=credits'
                    "
                  >
                    {{ deductionCredit }} {{ $t('workspace.credits_preview_m_Credits') }}
                  </a>
                  <span v-if="fileSize"> {{ $t('workspace.text_32') }}{{ fileSize }}</span>
                </div>
              </div>
              <drives v-if="false" :trans-ids="selectedList" :drop-box-redirect-url="dropBoxRedirectUrl" />
            </div>

            <button v-loading="downloadBtn" class="download-image-btn quicksand" @click="download" v-else>
              <!-- <i class="iconfont-single icon-s-download2"></i> -->
              {{ $t('workspace.upload_13') }}
            </button>
            <!-- <a v-show="isFreeUser" :href="this.$t('workspace.preview_to_pricing_href')" class="price-link">
              {{ $t('workspace.preview_remove_watermark') }}
            </a> -->
            <div class="file-size-txt" v-if="!isWatermarkPlanB">
              <a
                class="credits-tip"
                :href="
                  $store.state.mainWebsite +
                  $store.state.specialLocaleLink +
                  '/pricing/?source=preview&medium=credits'
                "
              >
                {{ deductionCredit }} {{ $t('workspace.credits_preview_m_Credits') }}
              </a>
              <span v-if="fileSize"> {{ $t('workspace.text_32') }}{{ fileSize }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-footer">
        <div class="feedback-btn">
          <div class="btn-sub" @click="feedBackDialog">
            {{ $t('common.feed_back_btn') }}
          </div>
        </div>
        <thumb-up
          v-if="!work.sample"
          :item="{
            transId: work.transId,
            operation: work.operation,
            likes: work.likes,
            config: work.config,
          }"
          @likeNums="likeNums"
        />
        <Dialog :class="'feedback-dialog'" :visible.sync="showDialog">
          <div class="dialog-container-feedback">
            <div class="feedback-title">{{ $t('common.feed_back_dialog_tit') }}</div>
            <div class="feedback-desc">{{ $t('common.feed_back_dialog_desc') }}</div>
            <el-input
              class="input feedback-input"
              type="text"
              :disabled="!!$getCookie('email')"
              v-model="formData.email"
              :placeholder="$t('common.feed_back_dialog_email')"
            />
            <p v-if="emailError" class="error_valid">{{ emailErrorText }}</p>
            <textarea
              :placeholder="$t('common.feed_back_dialog_msg')"
              v-model="formData.message"
              class="input_style textarea feedback-input"
              ref="blur_message"
            ></textarea>
            <p v-if="error" class="error_valid">{{ errorText }}</p>
            <div class="btn-container mag-t-20">
              <div
                class="primary-small-button"
                :class="btndisabled ? '' : 'feedback-message-ok'"
                @click="feedBackPublish"
              >
                {{ $t('common.feed_back_dialog_btn') }}
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script>
  import ComparedMode from '@/components/preview/ComparedMode'
  import ThumbUp from '@/components/matting/ThumbUp'
  import Dialog from '@/components/giveaway/Dialog'
  import FitCanvasMode from '@/components/preview/FitCanvasMode'
  import SliderMode from '@/components/preview/SliderMode'
  import DesktopDownloadTip from '@/components/WorkSpace/DesktopDownloadTip'
  import Work from '@/static/script/work.js'
  import servers from '@/static/config/common/server.config'
  import UserInfoMixins from '@/mixins/UserInfoMixins'

  import { emailStr } from '@/static/script/rules.js'

  import VueDraggableResizable from 'vue-draggable-resizable'
  // import TrafficBanner from '@/components/TrafficBanner'

  export default {
    name: 'NewPreviewDialog',
    components: {
      // TrafficBanner,
      SliderMode,
      FitCanvasMode,
      ThumbUp,
      ComparedMode,
      Dialog,
      VueDraggableResizable,
    },
    inject: ['leadStrokeVisible'],
    mixins: [UserInfoMixins],
    props: {
      isWatermarkPlanB: {
        type: Boolean,
        default: false,
      },
      visible: {
        type: Boolean,
        default: false,
      },
      isAuthorize: {
        type: Boolean,
        default: false,
      },
      previewInfo: {
        type: Object,
        default: () => {
          return {
            beforeImg: '',
            afterImg: '',
            width: 0,
            height: 0,
            afterW: 0,
            afterH: 0,
            beforeW: 0,
            beforeH: 0,
            beforeLoading: true,
            afterLoading: true,
            info: {},
            resolutionFlag: true,
            userInfo: {},
          }
        },
      },
      work: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        deductionCredit: 0,
        downloadBtn: false,
        zooms: [
          {
            label: this.$t('workspace.preview_hover_tip_1'),
            value: 0,
          },
          {
            label: '25%',
            value: 0.25,
          },
          {
            label: '50%',
            value: 0.5,
          },
          {
            label: '75%',
            value: 0.75,
          },
          {
            label: '100%',
            value: 1,
          },
          {
            label: '200%',
            value: 2,
          },
          {
            label: '300%',
            value: 3,
          },
          {
            label: '400%',
            value: 4,
          },
        ],
        zoom: 1,
        activeMode: '2',
        big: {
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          originWidth: 1,
          originHeight: 1,
        },
        box: {
          width: (360 / 9) * 16,
          height: 360,
        },
        thumb: {
          width: 1,
          height: 1,
        },
        thumbBox: {
          width: 275,
          height: 172,
        },
        mover: {
          top: 0,
          left: 0,
          width: 40,
          height: 26,
          originWidth: 40,
          originHeight: 26,
        },
        showDrag: false,
        showFreeUserTip: true,
        halfPreview: {
          width: 0,
          height: 0,
        },
        previewImgLoading: true,
        wrap: {
          width: 0,
          height: 0,
        },
        formData: {
          email: '',
          message: '',
        },
        errorText: '',
        error: false,
        emailErrorText: '',
        emailError: false,
        btndisabled: true,
        showDialog: false,
        savefeedback: false,
        isComparedImgLoaded: false,
      }
    },
    computed: {
      showVueDraggable() {
        return !this.previewImgLoading && this.zoom && this.showDrag && this.mover.width < this.thumb.width
      },
      hasCloseDownloadAppTip() {
        return !!this.$getCookie('cloud_close_app_d_t')
      },
      disableZoom() {
        return this.activeMode === '1' || this.work.operation === Work.typePortrait
      },
      fileSize() {
        if (this.previewInfo && this.previewInfo.filesize) {
          const fileSizeNum = this.previewInfo.filesize / 1024
          if (fileSizeNum >= 1024) {
            return (fileSizeNum / 1024).toFixed(1) + 'MB'
          } else {
            return fileSizeNum.toFixed(1) + 'KB'
          }
        }
        return '0KB'
      },
    },
    watch: {
      zoom(val) {
        this.zoomChangeHandle(val)
      },
      thumb: {
        handler() {
          this.previewImgLoading = true
          setTimeout(() => {
            this.previewImgLoading = false
          })
        },
        deep: true,
      },
      'formData.message'(val) {
        const messageV = /.{10,}/
        if (!messageV.test(val)) {
          this.error = true
          this.errorText = this.$t('common.feed_back_dialog_tip')
          this.$refs.blur_message.style = 'border-color:red'
          this.btndisabled = true
        } else {
          this.error = false
          this.btndisabled = false
        }
      },
    },
    created() {
      if (process.browser) {
        if (
          this.work.operation === 'denoise' ||
          this.work.operation === 'enlarge' ||
          this.work.operation === 'sharpen'
        ) {
          this.activeMode = '2'
        } else {
          this.activeMode = '1'
          this.zoom = 0
        }
      }
    },
    mounted() {
      this.getCredit()
      this.update(this.previewInfo)
      window.onresize = () => {
        return (() => {
          this.update(this.previewInfo)
        })()
      }
      document.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches.length > 1) {
            e.preventDefault()
          }
        },
        { passive: false }
      )
      let lastTouchEnd = 0
      document.addEventListener(
        'touchend',
        (e) => {
          const now = Date.now()
          if (now - lastTouchEnd <= 300) {
            e.preventDefault()
          }
          lastTouchEnd = now
        },
        { passive: false }
      )
    },
    methods: {
      getCredit() {
        this.$axios
          .post(servers.service + '/api/v2/job/point', {
            trans_id: this.previewInfo.info.transId,
          })
          .then((res) => {
            if (res.code == 200) {
              this.deductionCredit = res.data
            }
          })
      },
      imgLoadedElk(time) {
        if (!time) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'loading',
            event_value: 'loading',
            event_info: {
              loading_status: 'start',
            },
          })
        } else {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'loading',
            event_value: 'loading',
            event_info: {
              loading_status: 'success',
              loading_time: time,
            },
          })
        }
      },
      rightImgLoadedElk(param) {
        Work.reportPreviewTime(param)
      },
      comparedImgLoadedElk(time) {
        if (!time) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'loading',
            event_value: 'loading',
            event_info: {
              loading_status: 'start',
            },
          })
        } else {
          this.isComparedImgLoaded = true

          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'loading',
            event_value: 'loading',
            event_info: {
              loading_status: 'success',
              loading_time: time,
            },
          })
        }
      },
      /**
       * @sizeFileFun 计算处理后图片的大小
       * @param req {Object}  transId:计算的图片id
       */
      wrapSize(w, h) {
        this.wrap.width = w
        this.wrap.height = h
        this.$nextTick(() => {
          this.zoomChangeHandle(this.zoom)
        })
      },
      previewLoaded() {
        this.previewImgLoading = false
        this.thumb.width = this.$refs.previewImg ? this.$refs.previewImg.clientWidth : 0
        this.thumb.height = this.$refs.previewImg ? this.$refs.previewImg.clientHeight : 0
      },
      setHalfPreview(halfPreview) {
        this.halfPreview.width = halfPreview.width
        this.halfPreview.height = halfPreview.height
        this.zoomChangeHandle(this.zoom)
      },
      imageMove(e, x, y) {
        const mx = e.clientX - x
        const my = e.clientY - y
        const bigL = this.big.left + mx
        const bigT = this.big.top + my
        this.moveBorderHandle(bigL, bigT)
        this.mover.left = (Math.abs(this.big.left) / this.big.width) * this.thumb.width
        this.mover.top = (Math.abs(this.big.top) / this.big.height) * this.thumb.height
      },
      moveBorderHandle(left, top) {
        if (left > 0) {
          this.big.left = 0
        } else if (left < -this.big.width) {
          this.big.left =
            -(this.box.width - this.halfPreview.width) > 0 ? 0 : -(this.box.width - this.halfPreview.width)
        } else if (this.activeMode === '2' && Math.abs(left - this.halfPreview.width) > this.big.width) {
          this.big.left =
            -(this.big.width - this.halfPreview.width) > 0 ? 0 : -(this.big.width - this.halfPreview.width)
        } else if (this.activeMode === '3' && Math.abs(left - this.wrap.width) > this.big.width) {
          this.big.left =
            -(this.big.width - this.wrap.width) > 0
              ? (this.wrap.width - this.big.width) / 2
              : -(this.big.width - this.wrap.width)
        } else {
          this.big.left = left
        }
        if (top > 0) {
          this.big.top = 0
        } else if (top < -this.big.height) {
          this.big.top = -this.big.height
        } else if (this.activeMode === '2' && Math.abs(top - this.halfPreview.height) > this.big.height) {
          this.big.top =
            -(this.big.height - this.halfPreview.height) > 0
              ? 0
              : -(this.big.height - this.halfPreview.height)
        } else if (this.activeMode === '3' && Math.abs(top - this.wrap.height) > this.big.height) {
          this.big.top =
            -(this.big.height - this.wrap.height) > 0
              ? (this.wrap.height - this.big.height) / 2
              : -(this.big.height - this.wrap.height)
        } else {
          this.big.top = top
        }
      },
      download() {
        if (this.downloadBtn) {
          return
        }
        this.downloadBtn = true
        this.$emit('download', this.previewInfo.info)
        setTimeout(() => {
          this.downloadBtn = false
        }, 2000)
      },
      closeTip() {
        this.showFreeUserTip = false
        this.setAppDownloadTipClose()

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'popup',
          event_value: 'reffer_client_table',
          event_label: 'close',
        })
      },
      clickDownloadApp() {
        this.showFreeUserTip = false
        this.setAppDownloadTipClose()

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'activities',
          event_value: 'reffer_download',
          event_label: 'mutiple',
        })
        window.open(`${this.$store.state.ll}/soft-downloading/?source=multiple&date=20230322`, '_blank')
      },
      setAppDownloadTipClose() {
        this.$setCookie('cloud_close_app_d_t', 1, 2)
      },
      toFixed(value) {
        value = value && Number(value)
        if (!value && value !== 0) {
          return ''
        }
        if (value <= 0) {
          return 0
        }
        if (String(value).indexOf('.') < 0) {
          return value
        }
        if (typeof value === 'number') {
          value = value.toFixed(1)
          return value
        }
      },
      zoomChangeHandle(val) {
        if (val) {
          this.big.width = this.big.originWidth * val
          this.big.height = this.big.originHeight * val

          // this.mover.width = (this.thumb.width * (this.box.width / this.big.width)) / val
          // this.mover.height = (this.mover.width * 9) / 16
          this.computedMoverSize()
          this.mover.left = (this.thumb.width - this.mover.width) / 2 / val
          this.mover.top = (this.thumb.height - this.mover.height) / 2 / val
          if (this.mover.width > this.thumb.width) {
            this.mover.width = this.thumb.width
            this.mover.left = 0
          }
          if (this.mover.height > this.thumb.height) {
            this.mover.height = this.thumb.height
            this.mover.top = 0
          }
          const left = -(this.mover.left / this.thumb.width) * this.big.width
          const top = -(this.mover.top / this.thumb.height) * this.big.height
          this.moveBorderHandle(left, top)
        } else {
          this.big.width = this.big.originWidth
          this.big.height = this.big.originHeight
          this.computedMoverSize()
          this.mover.left = (this.thumb.width - this.mover.width) / 2
          this.mover.top = (this.thumb.height - this.mover.height) / 2
          if (this.mover.width > this.thumb.width) {
            this.mover.width = this.thumb.width
            this.mover.left = 0
          }
          if (this.mover.height > this.thumb.height) {
            this.mover.height = this.thumb.height
            this.mover.top = 0
          }
          const left = -(this.mover.left / this.thumb.width) * this.big.width
          const top = -(this.mover.top / this.thumb.height) * this.big.height
          this.moveBorderHandle(left, top)
        }
      },
      close() {
        this.$emit('update:visible', false)
      },
      switchMode(mode) {
        if (mode === '3' && this.work.operation === Work.typePortrait) {
          return
        }
        this.activeMode = mode
        if (mode === '1') {
          this.zoom = 0
          this.showDrag = false
        } else if (mode === '2') {
          this.showDrag = true
          if (this.work.operation === Work.typePortrait) {
            this.zoom = 0
          } else {
            this.zoom = 1
          }
        } else {
          this.zoom = 0
          this.showDrag = true
        }
      },
      computedMoverSize() {
        if (this.activeMode === '3') {
          this.mover.width = this.wrap.width * (this.thumb.width / this.big.width)
          this.mover.height = this.wrap.height * (this.thumb.height / this.big.height)
        } else {
          this.mover.width = this.halfPreview.width * (this.thumb.width / this.big.width)
          this.mover.height = this.halfPreview.height * (this.thumb.height / this.big.height)
        }
      },
      update(val) {
        if (val.width <= this.box.width && val.height <= this.box.height) {
          this.thumb.width = this.thumbBox.width
          this.thumb.height = this.thumbBox.height
        } else {
          if (val.width / val.height > this.thumbBox.width / this.thumbBox.height) {
            this.thumb.width = this.thumbBox.width
            this.thumb.height = (val.height / val.width) * this.thumb.width
          } else {
            this.thumb.height = this.thumbBox.height
            this.thumb.width = (val.width / val.height) * this.thumb.height
          }
        }
        this.big.width = this.previewInfo.info.w * this.previewInfo.info.config.scale
        this.big.height = this.previewInfo.info.h * this.previewInfo.info.config.scale
        this.big.originWidth = this.previewInfo.info.w
        this.big.originHeight = this.previewInfo.info.h
        if (this.activeMode === '2' || this.activeMode === '3') {
          this.showDrag = true
        }
        this.computedMoverSize()
        // this.mover.width = this.thumb.width * (this.box.width / this.big.width)
        // this.mover.height = (this.mover.width * 9) / 16
        this.mover.left = (this.thumb.width - this.mover.width) / 2
        this.mover.top = (this.thumb.height - this.mover.height) / 2
        if (this.mover.width > this.thumb.width) {
          this.mover.width = this.thumb.width
          this.mover.left = 0
        }
        if (this.mover.height > this.thumb.height) {
          this.mover.height = this.thumb.height
          this.mover.top = 0
        }
        const left = -(this.mover.left / this.thumb.width) * this.big.width
        const top = -(this.mover.top / this.thumb.height) * this.big.height
        this.moveBorderHandle(left, top)
        setTimeout(() => {
          this.zoomChangeHandle(this.zoom)
        }, 1000)
      },
      onDrag(x, y) {
        if (x === undefined || y === undefined) {
          return
        }
        if (!this.dragElk) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'preview',
            event_value: 'preview_drag',
          })
        }
        this.dragElk = true
        this.$setCookie('cloud_isFirstDrag', false, 365)
        this.mover.left = x
        this.mover.top = y

        const left = -(this.mover.left / this.thumb.width) * this.big.width
        const top = -(this.mover.top / this.thumb.height) * this.big.height
        this.moveBorderHandle(left, top)
      },
      onDragstop() {
        this.$nextTick(() => {
          // this.$refs.bigbox.style.overflow = 'auto'
        })
      },
      likeNums(likesVal) {
        this.work.likes = likesVal
      },
      feedBackPublish() {
        const messageV = /.{10,}/
        if (!messageV.test(this.formData.message)) {
          this.error = true
          this.errorText = this.$t('common.feed_back_dialog_tip')
          this.$refs.blur_message.style = 'border-color:red'
        } else {
          this.error = false
        }
        const emailV = emailStr
        if (!emailV.test(this.formData.email)) {
          this.emailError = true
          this.emailErrorText = this.$t('common.common_password_4')
        } else {
          this.emailError = false
        }
        if (this.emailError || this.error) {
          return
        }
        if (this.savefeedback) {
          return
        }
        this.savefeedback = true

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          email: this.formData.email,
          xargs_user_level: this.userType,
          event_info: {
            process_type: this.work.operation,
          },
        })
        // fetch
        this.$axios
          .post(servers.service + '/api/feedback/add', {
            email: this.formData.email,
            content: `${this.formData.message}`,
            web: 'vanceai',
            trans_id: this.work.transId || this.work.trans_id,
          })
          .then((res) => {
            if (res.code == 200) {
              this.showDialog = false
              this.formData.message = ''
              this.formData.email = ''
              this.savefeedback = false
              this.$message.success(this.$t('common.feedback_success'))
            }
            this.savefeedback = false
          })
      },
      feedBackDialog() {
        if (this.$getCookie('email')) {
          this.formData.email = this.$getCookie('email')
        }
        this.showDialog = true
      },
    },
  }
</script>

<style scoped lang="less">
  .icon-s-batch-slide,
  .icon-s-batch-compared,
  .icon-s-batch-full {
    font-size: 14 / @base;
    color: #5d5151;
  }
  .new-preview-dialog /deep/.el-loading-spinner {
    margin-top: -18px !important;
  }

  .file-size-txt {
    height: 21px;
    font-size: 14px;
    line-height: 21px;
  }

  .new-preview-dialog.mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);

    .dialog-container {
      width: calc(100vw - 80px);
      height: calc(100vh - 80px);
      overflow: auto;
      background: #fff;

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 50px;
        padding: 10px 20px;
        background: #fff;

        .dialog-header-le {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: calc(100% - 295px);

          .dialog-title {
            position: absolute;
            left: 0;
            font-size: 24 / @base;
            color: #4d4d4f;
          }

          .mode-switch {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 150px;
            padding-right: 0.5rem;
            text-align: right;
            cursor: pointer;

            .icon {
              width: 40px;
              height: 30px;
              line-height: 30px;
              text-align: center;
              border: 1px solid #c3ccd8;

              &:hover {
                background: #e8eef6;
              }
            }

            .mouse-style {
              cursor: not-allowed;

              &:hover {
                background: #fff;
              }
            }

            .active {
              background: #e8eef6;
            }

            > :first-child {
              border-right: none;
            }

            > :last-child {
              border-left: none;
            }
          }

          .zoom-box {
            position: relative;
            margin-left: 0.5rem;

            .zoom-label {
              position: absolute;
              top: 6px;
              left: 10px;
              z-index: 2;
              font-size: 12px;
            }
          }
        }
      }

      .dialog-content {
        display: flex;
        width: 100%;
        height: calc(100vh - 184px);
        border-top: 1px solid #ededed;
        border-bottom: 1px solid #ededed;

        .view {
          position: relative;
          box-sizing: border-box;
          display: inline-block;
          width: calc(100% - 295px);
          height: 100%;
          padding-right: 10px;
        }

        .preview {
          position: relative;
          box-sizing: border-box;
          display: inline-block;
          width: 295px;
          height: calc(100% - 2px);
          padding: 10px 10px 0 0;
          margin-top: 1px;
          background: #fff;

          .preview-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            margin-bottom: 10px;
            background: #ededed;
          }

          .preview-info {
            display: flex;
            flex-direction: column;

            .filename {
              display: -webkit-box;
              overflow: hidden;
              text-overflow: ellipsis;
              word-break: break-all;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .info-msg {
              width: 100%;
              margin-bottom: 5px;
              font-size: 14 / @base;

              .pic-msg {
                margin-right: 5px;
                font-size: 14 / @base;
              }
            }
          }

          .download-image {
            position: absolute;
            bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding-right: 10 / @base;
            background: #fff;

            .credits-bottom {
              width: 100%;
              padding: 15px;
              margin: 5px 0 20px;
              font-size: 14px;
              border-top: 1px solid #ccc;
              border-bottom: 1px solid #ccc;

              .line {
                padding: 5px;
              }
            }

            .credits-tip {
              font-weight: bold;
              color: #0374ff;
            }

            .download-image-btn {
              display: block;
              // width: 195px;
              min-width: 200 / @base;
              height: 40px;
              padding: 0 10px;
              margin-bottom: 5px;
              font-size: 16px;
              font-weight: 700;
              line-height: 40 / @base;
              color: #351e01;
              text-align: center;
              cursor: pointer;
              background-color: #ff9d1d;
              // margin: 0;
              border: none;
              border-radius: 3px;

              &:hover {
                color: #351e01;
                background-color: #ffb048;
              }
            }

            .price-link {
              font-size: 12 / @base;
              color: #0076fb;

              &:hover {
                text-decoration: underline;
              }
            }
          }

          .preview-image {
            display: flex;
            align-items: center;
            justify-content: center;

            .thumbnail {
              max-width: 100%;
              max-height: 100%;
            }
          }
        }
      }

      .dialog-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 50px;
        padding: 0;
      }
    }
  }

  .credits-helpdialog {
    .h2 {
      margin-bottom: 20px;
    }

    p {
      margin-bottom: 16 / @base;
    }
  }

  .credits-helpdialog.home-container {
    /deep/.dialog-container {
      max-width: 550 / @base;
      margin: 0 auto;
      text-align: left;

      .box {
        position: relative;
        width: 550 / @base;
        min-height: 490 / @base;
        padding: 10px 20px 20px;

        .btn-main {
          margin: auto;
        }
      }

      h2 {
        margin-bottom: 30px;
      }

      p {
        margin-bottom: 16px;

        :last-of-type {
          margin-bottom: 40px;
        }
      }
    }
  }

  .dialog-close {
    cursor: pointer;

    .el-icon-close {
      font-size: 150%;
    }
  }

  .thumbnail-mover {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    width: 40 / @base;
    max-width: 100%;
    height: 24 / @base;
    cursor: move;
    background: rgba(225, 225, 225, 0.5);
    border: 1px solid #fff;
  }

  .thumbnail-mover-small {
    width: 4 / @base !important;
    height: 4 / @base !important;
    background: #fff;
    border: 1px solid #4d4d4f;

    .mover {
      position: relative;

      .icon-s-magnifier {
        position: absolute;
        top: 4 / @base;
        left: 4 / @base;
        color: #fff;
      }
    }
  }

  .drag-tip {
    position: absolute;
    top: 15%;
    left: 50%;
    display: block;
    width: 220px;
    padding: 5px 8px;
    font-size: 14px;
    line-height: 20px;
    color: #fff;
    text-align: left;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
    transform: translate(-50%, -50%);

    &::after {
      position: absolute;
      bottom: -16px;
      left: 50%;
      display: block;
      width: 0;
      height: 0;
      margin-left: -4px;
      content: '';
      border: 8px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.7);
    }
  }

  .icon-s-download2 {
    margin-right: 5px;
  }

  .feedback-btn {
    position: relative;
    display: flex;
    flex: 1;
    justify-content: center;

    .icon_feedback {
      margin-right: 16 / @base;
    }

    .btn-sub {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      height: 2.2rem;
      padding: 5px 10px;
    }
  }

  /deep/ .like {
    width: 295px;
  }

  /deep/.my_a-dialog-container {
    width: 680px;
    padding: 18px;
    background: #fff;

    .dialog-container-feedback {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .feedback-title {
      font-size: 16px;
      font-weight: bold;
      color: #4f6785;
      text-align: left;
    }

    .feedback-desc {
      margin-top: 45px;
      color: #4f6785;
    }

    .feedback-input {
      margin-top: 20px;

      &::placeholder {
        color: #a8afb6;
      }
    }

    .textarea {
      width: 100%;
      min-height: 124px;
      padding: 0 15px;
      resize: none;

      &::placeholder {
        color: #a8afb6;
      }
    }

    .error_valid {
      color: #f00;
    }

    .btn-main,
    .primary-small-button {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      background: #c2c2c2;
      border: 1px solid #c2c2c2;
    }

    .feedback-message-ok {
      background: #ff9d1d;
      border: 1px solid #ff9d1d;
    }

    .btn-container {
      display: flex;
      justify-content: center;
    }
  }

  @media (max-width: 900px) {
    .new-preview-dialog.mask .dialog-container .dialog-header .dialog-header-le {
      width: calc(100% - 100px) !important;
    }
  }
  @media (max-width: 768px) {
    /deep/.my_a-dialog-container {
      width: 90%;
    }
  }
</style>
<style lang="less">
  .download-btn {
    width: 100%;
  }

  .primary-none-button {
    display: block;
    padding: 4px 4px;

    .credits-size {
      font-size: 14px;
      font-weight: normal;
      color: #9b5800;
      text-align: center;

      .credits-tip {
        color: #9b5800;
      }
    }
  }

  .new-preview-dialog {
    .select-zoom {
      width: 200 / @base;

      .el-input {
        width: 100%;
      }

      .el-input__inner {
        width: 100%;
        height: 30px;
        padding-left: 70px;
        font-size: 12 / @base;
        line-height: 30px;
      }

      .el-input__icon {
        width: 15px;
      }
    }
  }

  .credits-tip-set {
    padding: 8px;
    font-size: 14px;
    color: #fff;
    background: #4d4d4f;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);

    .popper__arrow::after {
      border-top-color: #4d4d4f !important;
    }
  }
</style>
