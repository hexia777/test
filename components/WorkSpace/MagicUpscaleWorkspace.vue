<template>
  <div class="enhance-workspace workspace-drag-ctr" :class="[isDialog && 'fixed-dialog']">
    <div class="enhance-workspace-nav" v-if="isDialog">
      <div class="enhance-workspace-nav-l">
        <h1 class="workspace_tit pad-space">
          {{ $t('workspace.workspace_title') }}
        </h1>
      </div>
      <div class="enhance-workspace-nav-c">
        <div @click="onUploadClick('workdesk_top')" v-track-label="$commonTrackLabel('upload_workdesk_top')">
          <file-upload
            class="upload-btn"
            :multiple="false"
            :upload-list="uploadList"
            :disabled="requestTransform"
            @onUpload="onUpload"
          >
            <button class="primary-small-button">
              {{ $t('workspace.upload_2') }}
            </button>
          </file-upload>
        </div>
        <div
          v-if="leadStrokeVisible && leadStrokeVisible()"
          class="batch-btn minor-small-button"
          @click="showAppDownload"
          v-track-label="$commonTrackLabel('show_app_download_button')"
        >
          {{ $t('workspace.batch_process') }}
        </div>
        <a
          v-else
          class="batch-btn minor-small-button"
          :href="$store.state.ll + '/workspace?source=workdesk&type=' + workspaceUrl"
          v-track-label="$commonTrackLabel('batch_process_link')"
        >
          {{ $t('workspace.batch_process') }}
        </a>
      </div>
      <div class="enhance-workspace-nav-r">
        <div class="close" @click="onClose" v-track-label="$commonTrackLabel('close_dialog_button')">
          <i class="icon el-icon-close"></i>
        </div>
      </div>
    </div>
    <three-columns-layouts class="layouts">
      <template #l>
        <p class="l-title">{{ $t('workspace.history') }}</p>
        <div class="divider"></div>
        <div class="complete-tip" ref="completeTip">
          <span>{{ $t('workspace.history_status_complete') }}</span>
        </div>
        <list-layouts class="l-list" :datas="processeds">
          <template v-slot="{ item }">
            <div
              class="l-list-item"
              :class="[item.transId === work.transId && 'l-list-active-item']"
              @click="onApplyProcessedImage(item)"
              v-track-label="$commonTrackLabel('historylist_select_' + item.operation + '_' + item.transId)"
            >
              <history-status class="history-status" :item="item" />
              <img :src="item.thumbnail" v-lazy="item.thumbnail" />
            </div>
          </template>
          <template #empty>
            <div class="empty">
              <i class="iconfont-single icon-s-empty"></i>
              <p class="l-title">{{ $t('workspace.empty') }}</p>
            </div>
          </template>
        </list-layouts>
        <div
          class="delete-btn icons iconfont-ctr"
          v-if="processeds.length"
          @click="delAllDialogVisible = true"
          v-track-label="$commonTrackLabel('historylist_clear_all_button')"
        >
          <div class="icons">
            <i class="iconfont-single icon-s-delete"></i>
          </div>
          <span>{{ $t('workspace.delete_all_txt') }}</span>
        </div>
      </template>
      <div class="enhance-main">
        <work-middle-top
          :is-dialog="isDialog"
          :lead-stroke-visible="leadStrokeVisible && leadStrokeVisible()"
          :workspace-url="workspaceUrl"
          :upgrade-link="upgradeLink"
          :download-link="downloadLink"
          :user-type="userType"
          @onUploadClick="onUploadClick"
          :disabled="requestTransform"
          :upload-list="uploadList"
          @onUpload="onUpload"
          @showAppDownload="showAppDownload"
        />

        <div class="divider" v-if="!isDialog"></div>
        <div class="main-center" :class="[isDialog && 'dialog-main-center']" ref="mainCenter">
          <div v-if="currentImage" class="review">
            <div
              class="review-half review-l"
              @mousedown="moveLock = true"
              @mousemove="onPreviewImageDrag"
              @mouseup="moveLock = false"
              @mouseleave="imageOutFun"
              @mouseenter="imageEnterFun"
              v-loading="beforeImageLoading"
            >
              <p class="review-tag">
                <span>{{ $t('common.remove_27') }}</span>
                <span v-if="work.w && work.h"> {{ work.w }} x {{ work.h }} px </span>
              </p>
              <!-- 图片裁剪 -->
              <div
                class="image-crop-btn target_btn"
                v-show="cropBtnType"
                @click="cropFun"
                @mouseenter="imageEnterFun"
                v-track-label="$commonTrackLabel('image_crop_button')"
              >
                <span>
                  <i class="el-icon-crop"></i>
                  {{ $t('common.crop') }}
                </span>
              </div>
              <img
                @load="beforeImageLoading = false"
                :style="{
                  width: `${showImgW}px`,
                  height: `${showImgH}px`,
                  opacity: beforeImageLoading ? 0 : 1,
                  transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                }"
                :src="currentImage.originImg"
              />
            </div>
            <div
              class="review-half review-r"
              ref="half"
              @mousewheel="onPreviewImageWhell"
              @mousedown="moveLock = true"
              @mousemove="onPreviewImageDrag"
              @mouseup="moveLock = false"
              @mouseleave="moveLock = false"
              v-loading="work.afterImg && afterImageLoading"
            >
              <template v-if="work.afterImg">
                <p class="review-tag quicksand-blod">
                  <span>{{ $t('common.remove_28') }}</span>
                  <span v-if="previewInfo && previewInfo.afterW">
                    {{ previewInfo.afterW }} x {{ previewInfo.afterH }} px
                  </span>
                </p>

                <img
                  @load="afterImageLoad"
                  ref="preview"
                  :style="{
                    opacity: afterImageLoading ? 0 : 1,
                    width: `${showImgW}px`,
                    height: `${showImgH}px`,
                    transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                  }"
                  :src="work.afterImg == 'null' ? '' : work.afterImg"
                />
              </template>
              <template v-else>
                <div class="ready-process">
                  <p class="title" v-if="processStep === processStepMap.none && !uploading">
                    {{ $t('workspace.ready_process') }}
                  </p>
                  <div class="status" v-else-if="processStep === processStepMap.upload || uploading">
                    <i class="iconfont-single icon-s-loading"></i>
                    <span class="title" v-html="$t('workspace.upload_status_1')"></span>
                  </div>
                  <div class="status-column" v-else-if="processStep === processStepMap.processing">
                    <div class="status" v-show="!showWaiteTime">
                      <i class="iconfont-single icon-s-loading"></i>
                      <span class="title" v-html="$t('workspace.upload_status_3')"></span>
                    </div>
                    <single-queue-tip
                      v-show="showWaiteTime"
                      :busy-jobs="busyJobs"
                      :worker-count="workerCount"
                      :is-paied="queryQueueParams ? queryQueueParams.isPay : isPaied"
                      :source="`magic-upscale`"
                    >
                      <file-upload
                        class="queue-upload"
                        :multiple="false"
                        :upload-list="uploadList"
                        :disabled="requestTransform"
                        @onUpload="onUpload"
                      >
                        <div class="btn-container">
                          <div class="btn-main next-btn">
                            {{ $t('workspace.single_wait_job_btn') }}
                          </div>
                        </div>
                      </file-upload>
                    </single-queue-tip>
                  </div>
                  <div class="status" v-else-if="processStep === processStepMap.error">
                    <i class="iconfont-single icon-s-fail"></i>
                    <span class="title" v-html="$t('workspace.upload_status_6')"></span>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <!-- 未上传图片时候显示 -->
          <div
            class="upload-box"
            v-else
            @click="onUploadClick('banner')"
            v-track-label="$commonTrackLabel('main_upload_button')"
          >
            <file-upload
              ref="fileUpload"
              class="uploaded"
              :multiple="false"
              :upload-list="uploadList"
              :disabled="requestTransform"
              @onUpload="onUpload"
            />
          </div>
        </div>

        <div v-if="showFreeUserProcessHint" class="free-user-hint">
          <el-tooltip effect="dark" :content="$t('workspace.free_process_hint_hover')" placement="top">
            <i class="iconfont-single icon-s-kongxinwenhao"></i>
          </el-tooltip>
          <span> {{ $t('workspace.free_process_hint') }}</span>
          <span class="hint-number">{{ freeProcessWebNum }}</span>
        </div>

        <!-- <div class="main-bottom"> -->
        <div class="main-bottom" v-if="processed">
          <div class="scale-btns">
            <el-select v-model="rate" @change="onChangeRate(rate, true)">
              <el-option
                v-for="(item, index) in rateData"
                :key="index"
                :label="item.title"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="feedback-btn">
            <div class="btn-sub" @click="feedBackDialog" v-track-label="$commonTrackLabel('feedback_button')">
              {{ $t('common.feed_back_btn') }}
            </div>
          </div>
        </div>
      </div>
      <template #r>
        <div v-show="isDownload" class="tab download-tab">
          <div class="tab-nav nav-left">
            <div
              class="tab-nav-btn"
              :class="[disabledBack && 'hide']"
              @click="onSwitchTab('back')"
              v-track-label="$commonTrackLabel('switch_tab_back')"
            >
              <i class="arrow"></i>
              <span>{{ $t('workspace.back') }}</span>
            </div>
          </div>
          <div class="tab-main">
            <div class="preview-recommend">
              <thumbnail-preview
                v-if="showPreview"
                :preview-info="previewInfo"
                :preview-size="previewSize"
                :rate="rate"
                :maxw="maxw"
                :offset="offset"
                @onDrag="onThumbnailPreviewDrag"
              />
              <!-- 占位 -->
              <div v-else class="preview-space"></div>
            </div>

            <div class="fa-box-height">
              <div class="skeleton-screen" v-if="processStep !== processStepMap.processed">
                <div class="line-grade-box"></div>
                <div class="child-mode mag-t-10"></div>
                <div class="child-mode mag-t-10"></div>
                <div class="line-grade-box mag-t-10"></div>
                <div class="child-mode2 mag-t-10"></div>
                <div class="child-mode mag-t-10"></div>
                <div class="child-mode2 mag-t-10"></div>
              </div>
              <div v-else>
                <div class="download-image">
                  <div class="credits-bottom">
                    <div class="line f-16">
                      {{ $t('workspace.credits_preview') }}
                    </div>
                    <div class="line credits-box" style="display: flex; justify-content: space-between;">
                      <div class="f-14">
                        <span class="f-b">{{ toFixed($store.state.credits) }}</span>
                        <span>
                          {{ $t('workspace.credits_preview_s_credits') }}
                        </span>
                      </div>
                      <div>
                        <a
                          :href="
                            $store.state.mainWebsite +
                            $store.state.specialLocaleLink +
                            '/pricing/?source=' +
                            workspaceUrl +
                            '&medium=get_credits'
                          "
                          class="credits-tip"
                          v-track-label="$commonTrackLabel('credits_pricing_link')"
                        >
                          {{ $t('workspace.credits_preview_get') }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tc download-btn btn-box-w" v-if="isWatermarkPlanB">
                  <div
                    class="primary-none-button"
                    v-loading="downloadLoading"
                    @click="onDownloadBefore"
                    v-track-label="$commonTrackLabel('download_button')"
                  >
                    <!-- <i class="iconfont-single icon-s-download2"></i> -->
                    <span>{{
                      userType !== 'paying'
                        ? $t('workspace.download_watermark_free')
                        : $t('workspace.upload_13')
                    }}</span>
                    <div class="credits-size">
                      <span
                        :class="{ 'v-hide': processStep !== processStepMap.processed }"
                        v-if="download_point"
                      >
                        {{ download_point }} {{ $t('workspace.credits_preview_m_Credits') }}
                      </span>
                      <span v-show="download_point && processStep === processStepMap.processed">
                        |
                      </span>
                      <span v-if="processStep === processStepMap.processed">
                        {{ $t('workspace.text_32') }}{{ sizeFun(work.filesize) }}</span
                      >
                    </div>
                  </div>
                  <drives
                    v-if="false"
                    :trans-ids="selectedList"
                    :drop-box-redirect-url="dropBoxRedirectUrlProp || dropBoxRedirectUrl"
                  />
                </div>

                <div class="tc download-btn btn-box-w" v-else>
                  <div
                    class="primary-small-button block"
                    v-loading="downloadLoading"
                    @click="onDownloadBefore"
                    v-track-label="$commonTrackLabel('download_button')"
                  >
                    <!-- <i class="iconfont-single icon-s-download2"></i> -->
                    {{ $t('workspace.upload_13') }}
                  </div>
                  <drives
                    v-if="false"
                    :trans-ids="selectedList"
                    :drop-box-redirect-url="dropBoxRedirectUrlProp || dropBoxRedirectUrl"
                  />
                </div>

                <div class="f-14 tc cA2A mag-ve-20" v-if="!isWatermarkPlanB">
                  <span :class="{ 'v-hide': processStep !== processStepMap.processed }">
                    {{ deductionCredit }} {{ $t('workspace.credits_preview_m_Credits') }}
                  </span>
                  <span v-if="processStep === processStepMap.processed">
                    | {{ $t('workspace.text_32') }}{{ sizeFun(work.filesize) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="tab-footer">
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
          </div>
        </div>
        <div v-show="!isDownload" class="tab setting-tab">
          <div class="img-box">
            <WorkSpaceImgView ref="WorkSpaceImgView" />
          </div>
          <div
            class="tab-nav nav-right"
            @click="onSwitchTab('download')"
            v-track-label="$commonTrackLabel('switch_tab_download')"
          >
            <div class="tab-nav-btn" :class="[!processed && 'disabled']">
              <el-tooltip
                popper-class="icon-tip"
                effect="dark"
                :content="$t('workspace.unprocess_download_tip')"
                placement="bottom"
                :disabled="processed"
              >
                <div>
                  <span>{{ $t('workspace.download') }}</span>
                  <i class="arrow flip-arrow" :class="[!processed && 'arrow-disabled']"></i>
                </div>
              </el-tooltip>
            </div>
          </div>
          <!-- 选择栏 -->
          <div class="tab-main scroll-bar">
            <magic-upscale-works
              ref="upscalerWorksConfig"
              @selModelFun="selModelFun"
              work-name="magic_enlarge_clarity"
              :image="currentImage"
            />
          </div>
          <div class="tab-footer">
            <div class="process-setting">
              <button
                class="start-process-btn primary-small-button"
                :class="[processedLock && 'disabled-btn']"
                v-loading="processLoading || waitTimes > 0"
                :disabled="processedLock"
                @click="checkUploadThenStart(true)"
                v-track-label="'workspace_process'"
              >
                <span>{{ $t('workspace.config_7') }}</span>
                <div class="process-credits" v-if="handle_point">
                  {{ $t('workspace.num_credits_required', { num: handle_point }) }}
                </div>
              </button>
              <div class="pic_out_setting">
                <div class="pic_out_setting_cont" v-if="outSettingVisible">
                  <out-setting
                    @confirm="confirmOutSet"
                    @close="closeOutSetDialog"
                    :config="outSettingConfig"
                  />
                </div>
                <button
                  class="pic_out_btn"
                  @click="onOutSettingsDialog"
                  v-track-label="$commonTrackLabel('out_setting_button')"
                >
                  <i class="iconfont-single icon-s-setting"></i>{{ $t('workspace.pic_output_setting_btn') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </three-columns-layouts>
    <Dialog :class="'feedback-dialog'" :visible.sync="feedBackDialogVisible">
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
          @input="onValidateMessage"
          class="input_style textarea feedback-input"
          ref="blur_message"
        ></textarea>
        <p v-if="error" class="error_valid">{{ errorText }}</p>
        <div class="btn-container mag-t-20">
          <div
            class="primary-small-button"
            :class="btndisabled ? '' : 'feedback-message-ok'"
            v-loading="savefeedback"
            @click="feedBackPublish"
            v-track-label="$commonTrackLabel('feedback_submit_button')"
          >
            {{ $t('common.feed_back_dialog_btn') }}
          </div>
        </div>
      </div>
    </Dialog>
    <download-loading v-show="minLoading" />
    <custom-dialog
      :visible.sync="delAllDialogVisible"
      :show-close="false"
      :show-header="false"
      :show-footer="false"
    >
      <div class="dialog-container">
        <div class="pad-20">
          <div class="flex guide_box justify-center" :style="{ marginTop: '20px' }">
            <i class="iconfont-single icon-s-fail"></i>
            <span class="mag-l-20 flex flex-align-c"> {{ $t('workspace.delete_all') }}</span>
          </div>
          <div class="flex mag-t-20">
            <div class="flex1"></div>
            <div
              class="minor-small-button cancel btn mag-t-30"
              @click="btnFileWinFun(false)"
              v-track-label="$commonTrackLabel('historylist_clear_all_cancel_button')"
            >
              {{ $t('workspace.workflow_btn_cancel') }}
            </div>

            <div class="flex1"></div>
            <div
              class="primary-small-button btn mag-t-30 mag-l-20"
              @click="btnFileWinFun(true)"
              v-track-label="$commonTrackLabel('historylist_clear_all_ok_button')"
            >
              {{ $t('workspace.workflow_btn_yes') }}
            </div>
            <div class="flex1"></div>
          </div>
        </div>
      </div>
    </custom-dialog>
    <!-- 积分不足弹窗 -->
    <custom-dialog :visible.sync="noPointsDialogVisible" :show-footer="false">
      <template slot="title">
        <span class="v-hide">close</span>
      </template>
      <div class="dialog-container">
        <div class="">
          <div slot="title">
            <div class="tc f-30 f-b mag-t-20">
              <img :src="$imgPath('/common/download_dialog_9.png')" />
            </div>
          </div>
          <div class="tc f-b">
            {{ $t('common.process_limit_1') }}
          </div>
          <div class="tc mag-t-30" style="padding: 0 20px;">
            {{ $t('workspace.process_not_point_desc') }}
          </div>
          <div class="mag-t-20 mag-b-40 flex justify-center">
            <div
              class="primary-small-button btn mag-t-30"
              @click="closePointWin"
              v-track-label="$commonTrackLabel('nopoints_dialog_close_button')"
            >
              {{ $t('workspace.upgrade_plan_btn') }}
            </div>
          </div>
        </div>
      </div>
    </custom-dialog>

    <free-process-times-dialog
      v-if="freeProcessTimesVisible"
      :visible.sync="freeProcessTimesVisible"
      @onSubscribe="onSubscribe"
    />

    <register-and-subscribe-dialog
      v-if="registerAndSubscribeVisible"
      :visible.sync="registerAndSubscribeVisible"
      :not-point="notPoint"
      :is-process="isProcess"
      :is-paied="isPaied"
      :token="$store.state.token"
      @onTryAgainDownload="onDownloadBefore"
      @onSubscribe="onSubscribe"
      :work="work"
    />
    <!-- 引导弹窗 -->
    <my-dialog
      v-if="guideWin"
      :visible.sync="guideWin"
      :txt-center="true"
      :title="$t('common.guide_title')"
      @close="guideWin = false"
    >
      <div class="f-14 mag-t-20">{{ $t('common.guide_describe') }}</div>
      <div class="flex guide_box pad-20">
        <div class="flex1 mag-r-10">
          <div class="f-b f-16 quicksand guid_txt">{{ $t('common.guide_step1') }}</div>
          <div class="guide_img mag-t-10">
            <img :src="$imgPath('/common/guide2.jpg')" />
          </div>
        </div>
        <div class="flex1">
          <div class="f-b f-16 quicksand guid_txt">{{ $t('common.guide_step2') }}</div>
          <div class="guide_img mag-t-10">
            <img :src="$imgPath('/common/guide1.jpg')" />
          </div>
        </div>
      </div>
      <div class="tc guide_btn_box mag-b-20">
        <div
          class="primary-small-button btn"
          @click="guideWin = false"
          v-track-label="$commonTrackLabel('close_guidewin')"
        >
          {{ $t('common.get_it') }}
        </div>
      </div>
    </my-dialog>

    <fabulous v-if="fabulousWin" :fabulous-win.sync="fabulousWin" :current-work="work" />
    <!-- 图片裁剪 -->
    <ImageCrop :width="'calc(100vw - 80px)'" :visible="editorEditorCrop">
      <ImageCropEdit
        v-if="editorEditorCrop && currentImage.file"
        :current-image="currentImage"
        @updateEditorCropVisible="updateEditorCropVisible"
        @cropImgSrc="cropImgSrc"
      />
    </ImageCrop>

    <recommend-app-dialog
      v-if="recommendAppVisible"
      :visible.sync="recommendAppVisible"
      :title="$t('workspace.recommend_download_batch')"
      track="?source=single&type=table&date=0706"
    />

    <recommend-download-dialog
      v-if="recommendDownloadVisible"
      :visible.sync="recommendDownloadVisible"
      track="?source=single&type=enhancer&date=20230601"
      type="enhancer"
    />
    <custom-dialog
      class="tip-dialog"
      :visible.sync="downloadDialogVisible"
      :show-header="false"
      @close="handleDownloadTipClose"
    >
      <p class="mag-b-10 tc f-20 f-b">{{ $t('workspace.recommend_save_tip') }}</p>
      <p>{{ $t('workspace.recommend_save_tip_2') }}</p>
      <div class="tc flex flex-c`ol align-center mag-t-20">
        <drives
          class="mag-b-10"
          :is-download="true"
          :trans-ids="selectedList"
          :drop-box-redirect-url="dropBoxRedirectUrlProp || dropBoxRedirectUrl"
          @onSave="handleDriveSave"
        />
        <div
          class="download_btn minor-small-button"
          @click="continueDownload"
          v-track-label="$commonTrackLabel('continue_download_button')"
        >
          {{ $t('workspace.download_directly') }}
        </div>
      </div>
      <client-only>
        <template #footer>
          <el-checkbox v-track-label="$commonTrackLabel('show_again_checkbox')">
            {{ $t('workspace.dont_show_again') }}
          </el-checkbox>
        </template>
      </client-only>
    </custom-dialog>
  </div>
</template>
<script>
  //package
  import { lastValueFrom } from 'rxjs'
  //component
  import ThreeColumnsLayouts from '@/layouts/ThreeColumnsLayouts'
  import ListLayouts from '@/layouts/ListLayouts'
  import ThumbnailPreview from '@/components/WorkSpace/ThumbnailPreview'
  import EnhanceWorkspaceStream from '@/stream/EnhanceWorkspaceStream'
  import FileUpload from '@/components/FileUpload'
  import OutSetting from '@/components/WorkSpace/OutSetting'
  // import DesktopDownloadTip from '@/components/WorkSpace/DesktopDownloadTip'
  import ThumbUp from '@/components/matting/ThumbUp'
  import Dialog from '@/components/giveaway/Dialog'
  import CustomDialog from '@/components/CustomDialog'
  import DownloadLoading from '@/components/loading/Loading'
  import Fabulous from '@/components/Fabulous'
  import MyDialog from '@/components/matting/MyDialog'
  import RegisterAndSubscribeDialog from '@/components/RegisterAndSubscribeDialog'
  import FreeProcessTimesDialog from '@/components/FreeProcessTimesDialog'

  import MagicUpscaleWorks from '@/components/WorkSpace/MagicUpscaleWorks'
  import ImageCrop from '@/components/ImageCrop'
  import ImageCropEdit from '@/components/ImageCrop/components/ImageCropEdit'
  import WorkSpaceImgView from '@/components/WorkSpaceImgView'
  import WorkMiddleTop from './WorkMiddleTop.vue'
  // import EnlargeWorks from '@/components/WorkSpace/EnlargeWorks.vue'

  //mixins
  import WorkflowOperationsMixins from '@/mixins/WorkflowOperationsMixins'
  import UploadImgMixins from '@/mixins/components/UploadImgMixins'
  import OutSettingMixins from '@/mixins/components/OutSettingMixins'
  import ProcessMixins from '@/mixins/components/ProcessMixins'
  import ELKMixins from '@/mixins/ELKMixins'
  import imageEditCrop from '@/mixins/imageEditCrop'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'
  import getImageFileBySrc from '@/mixins/getImageFileBySrc.js'

  //js
  import { WorkFlowType } from '@/static/script/workflow_util'
  import { parseLocationQuery, handleShowImgSize, closeWorkspaceDialog } from '@/static/script/utils'
  import Work from '@/static/script/work.js'
  import { emailStr } from '@/static/script/rules.js'
  // import TrafficBanner from '@/components/TrafficBanner'

  import SingleQueueTip from '@/components/WorkSpace/SingleQueueTip.vue'
  import HistoryStatus from '@/components/HistoryStatus'
  import Drives from '@/components/Drives.vue'
  import RecommendDownloadDialog from '@/components/RecommendDownloadDialog.vue'
  import RecommendAppDialog from '@/components/RecommendAppDialog.vue'
  import MoreFeaturesDialog from './MoreFeaturesDialog.vue'
  import { getPreviewUrl, getPreviewUrlData } from '@/static/plugin/awsS3'

  export default {
    name: 'MagicUpscaleWorkspace',
    components: {
      RecommendDownloadDialog,
      Drives,
      SingleQueueTip,
      HistoryStatus,
      // TrafficBanner,
      WorkSpaceImgView,
      ThreeColumnsLayouts,
      ListLayouts,
      FileUpload,
      OutSetting,
      ThumbUp,
      Dialog,
      CustomDialog,
      ThumbnailPreview,
      DownloadLoading,
      Fabulous,
      MyDialog,
      RegisterAndSubscribeDialog,
      FreeProcessTimesDialog,
      MagicUpscaleWorks,
      ImageCrop,
      ImageCropEdit,
      // EnlargeWorks,
      // FreeDownloadA,
      RecommendAppDialog,
      //   MoreFeaturesDialog,
      //   EnlargeModels,
      //   SharpenModels,
      WorkMiddleTop,
    },
    mixins: [
      UploadImgMixins,
      WorkflowOperationsMixins,
      OutSettingMixins,
      ProcessMixins,
      ELKMixins,
      imageEditCrop,
      UserInfoMixins,
      DropBoxCallbackOfPageMixins,
      getImageFileBySrc,
    ],
    inject: ['leadStrokeVisible'],
    data() {
      return {
        queueImprove: true,
        hasFileId: false,
        isWatermarkPlanB: true,
        WorkFlowType,
        processeds: [],
        total: 0,
        uploadList: [],

        isDownload: false,
        work: {},
        time: null,
        previewImgLoading: false,
        showPreview: false,
        dragElk: false,
        previewInfo: {},
        feedBackDialogVisible: false,
        errorText: '',
        error: false,
        emailErrorText: '',
        emailError: false,
        btndisabled: true,
        savefeedback: false,
        delAllDialogVisible: false,
        formData: {
          email: '',
          message: '',
        },
        descript: '',
        processedLock: false,
        moveLock: false,
        rate: 1,
        maxw: 335,
        offset: {
          x: 0,
          y: 0,
        },
        previewSize: {
          w: 0,
          h: 0,
          imgw: 0,
          imgh: 0,
        },
        showImgH: 0,
        showImgW: 0,
        whellReduce: 0,
        uploadName: 'banner',
        beforeImageLoading: false,
        afterImageLoading: false,
        disabledBack: false,
        startTime: 0,
        hidecurrentWork: true,
        activeJob: '',
        elkJob: WorkFlowType.enlarge,
        showDownloadAppTip: false,
        recommendAppVisible: false,
        modalType: '',
        processedModels: {},
        isFirstProcess: false,
        clickStartTime: 0, // 点击开始处理按钮的时间戳
        uploading: false, // 提前上传图片正在处理
        lastUploadTime: 0, // 最后上传图片的时间戳
        waitTimes: 0, // 点击开始处理等待15秒图片提前上传
        prepareUid: null, // 图片提前上传成功后对应的uid
        // selectedEnlargeModel: WorkFlowType.enlarge3,

        // enhanceType: 'Enlarge',
        // workName: 'enlarge3',
        // selectedModelName: '',
        download_point: 0,
        handle_point: 0,

        //父应用传过来的
        dropBoxRedirectUrlProp: '',
        workspaceUrl: '',
        isDialog: false,
        selModel: '',
        fileList: [],
        workType: 'enlarge',
        needRecommendFeatures: false,
        pageUrl: '',
        popWin: false,
        orderMenu: '',
      }
    },
    provide() {
      return {
        imageSize: () => this.currentImage,
      }
    },
    computed: {
      showFreeUserProcessHint() {
        return (
          this.userType !== 'paying' &&
          this.$getCookie('token') &&
          this.currentImage &&
          !this.processLoading &&
          !this.processed
        )
      },
      initWorkType() {
        const map = {
          waifu: 'chainner',
        }
        return map[this.workType]
      },
      rateData() {
        return [
          {
            title: '100%',
            value: 1,
          },
          {
            title: '200%',
            value: 2,
          },
          {
            title: '300%',
            value: 3,
          },
          {
            title: '400%',
            value: 4,
          },
        ]
      },
      successLoading() {
        if (!this.beforeImageLoading && !this.afterImageLoading) {
          return true
        }
        return false
      },
      processed() {
        return this.processStep === this.processStepMap.processed
      },
      imageRate() {
        return (this.rate * 100).toFixed() + '%'
      },
      filterJobs() {
        return [WorkFlowType.enlarge]
      },
      currentImage() {
        if (this.uploadList.length) {
          return this.uploadList[0]
        } else {
          return null
        }
      },
    },
    watch: {
      currentImage: {
        async handler(val, oldVal) {
          if (val && (val.w !== (oldVal && oldVal.w) || val.h !== (oldVal && oldVal.h))) {
            const { showImgW, showImgH } = handleShowImgSize(
              val.w,
              val.h,
              this.$refs.mainCenter.clientWidth / 2 - 20,
              this.$refs.mainCenter.clientHeight - 20
            )
            this.showImgW = showImgW
            this.showImgH = showImgH
          }
          // 图片更新后立即上传, 减小处理时间
          if (val && val.file && !val.uid) {
            await this.setCurrentWork()
            this.work = this.initWork(this.work)
            const time = Date.now()
            this.lastUploadTime = time
            this.generateParams(this.work)
            this.waitTimes = 0
            this.uploading = true
            const uploadImgData = await this.uploadImgV2(this.work, 'magic_enlarge_clarity')
            // 可能中间上传的图片较大最后完成 根据开始上传的时间判断最后一张图
            if (this.lastUploadTime === time) {
              this.prepareUid = uploadImgData.uid
              this.uploading = false
            }
            // 正在处理时，上传了新图片，但是没有进行处理，判断还有正在处理的，也要更新历史记录
            let hasProcessing = false
            this.processeds.forEach((item) => {
              const { processStatus } = item
              if (processStatus === 'progress' || processStatus === 'busy') {
                hasProcessing = true
              }
            })
            if (hasProcessing) {
              this.getProcesseds()
            }
          }
        },
        deep: true,
      },
      successLoading(val) {
        if (val) {
          this.imgLoadedElk(((Date.now() - (this.work.previewStartTime || this.startTime)) / 1000).toFixed(2))
          delete this.work.previewStartTime
          // 此逻辑只针对 图片处理后的展示 如果有新增图片加载状态 需要另外处理
          this.isComparedImgLoaded = true
        }
      },
      logged() {
        this.getProcesseds()
      },
    },
    async mounted() {
      this.initData()
      //弹窗模式
      if (this.isDialog) {
        this.lockWinFun(true)
      }
      this.$nextTick(() => {
        window.addEventListener('resize', () => {
          if (this.successLoading && this.$refs.half && this.$refs.preview) {
            this.previewSize = {
              w: Number(this.$refs.half.clientWidth),
              h: Number(this.$refs.half.clientHeight),
              imgw: Number(this.$refs.preview.clientWidth) * this.rate,
              imgh: Number(this.$refs.preview.clientHeight) * this.rate,
            }
          }
        })
      })

      this.getWorkNamePoint('magic_enlarge_clarity')

      this.descript = this.$t('workspace.photo_descript')
      this.getProcesseds()
      if (this.fileList && this.fileList.length) {
        this.uploadList = [this.fileList[this.fileList.length - 1]]
        setTimeout(() => {
          this.firstVisit()
        }, 1000)
      }
      // if (this.$getCookie('token')) {
      //   this.getProcessWebNum()
      // }
      if (this.uploadList.length) {
        return
      }
      try {
        const query = parseLocationQuery()
        if (query.fileId) {
          this.hasFileId = true
          this.beforeImageLoading = true

          // this.workspaceVisible = true
          // this.beforeImageLoading = false
          let file = null
          if (query.scale) {
            file = await this.getFileByAfterSrc(query.fileId)
          } else {
            file = await this.getFileByPreviewSrc(query.fileId)
          }
          this.uploadList = [file]
          this.$nextTick(() => {
            this.onBeforeStartProcess()
          })
        }
      } catch (err) {
        console.log('error---', err)
      }
    },
    beforeDestroy() {
      window.microApp.removeDataListener(this.dataListener)
    },
    methods: {
      initData() {
        if (window && window.__MICRO_APP_ENVIRONMENT__) {
          const data = window.microApp.getData()
          console.log('主应用下发的data数据:', data)
          this.isDialog = data.isDialog
          // if (data.fileList) {
          //   this.fileList = data.fileList
          // }
          if (data.workType) {
            this.workType = data.workType
          }
          if (data.selModel) {
            this.selModel = data.selModel
          }
          if (data.workspaceUrl) {
            this.workspaceUrl = data.workspaceUrl
          }
          if (data.needRecommendFeatures) {
            this.needRecommendFeatures = data.needRecommendFeatures
          }
          if (data.pageUrl) {
            this.pageUrl = data.pageUrl
          }
          if (data.popWin) {
            this.popWin = data.popWin
          }
          if (data.orderMenu) {
            this.orderMenu = data.orderMenu
          }
          if (data.userAgent) {
            this.userAgent = data.userAgent
          }
          if (data.dropBoxRedirectUrlProp) {
            this.dropBoxRedirectUrlProp = data.dropBoxRedirectUrlProp
          }
          window.microApp.addDataListener(this.dataListener)
        }
      },
      dataListener(data) {
        if (data.fileList && data.fileList.length) {
          this.uploadList = [].concat(data.fileList[0])
          this.lockWinFun(true)
        }
      },
      showAppDownload() {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'popup',
          event_value: 'reffer_client_table',
          event_info: {
            source_type: 'workspace_header',
          },
        })

        this.recommendAppVisible = true
      },
      afterImageLoad(e) {
        this.afterImageLoading = false
        const work = this.work
        this.setLoadEnd(work.transId)

        // this.previewInfo.afterW = e.target.naturalWidth
        // this.previewInfo.afterH = e.target.naturalHeight
      },
      closeTip() {
        this.showDownloadAppTip = false
        this.setAppDownloadTipClose()

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'popup',
          event_value: 'reffer_client_table',
          event_label: 'close',
        })
      },
      clickDownloadApp() {
        this.showDownloadAppTip = false
        this.setAppDownloadTipClose()

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'activities',
          event_value: 'reffer_download',
          event_label: 'single',
        })
        window.open(
          `${this.$store.state.ll}/soft-downloading/?source=single&type=enhancer&date=20230322`,
          '_blank'
        )
      },
      setAppDownloadTipClose() {
        this.$setCookie('cloud_close_app_d_t', 1, 2)
      },
      selModelFun(req) {
        this.$refs['WorkSpaceImgView'].selOptionFun(req)
      },
      selEnlagerTypeFun(req) {
        this.enlagerType = req
      },
      /**
       * @lockWinFun 锁定滚动条
       */
      lockWinFun(req) {
        if (req && this.uploadList.length) {
          document.getElementsByTagName('body')[0].style.overflow = 'hidden'
        } else {
          document.getElementsByTagName('body')[0].style.overflow = 'auto'
        }
      },
      changeConfig(config, index, modalType) {
        this.modalType = modalType
        this.currentWork = config
        this.isNewEnlargeModel()
      },

      onHidecurrentWork(val) {
        console.log('onHidecurrentWork', val)
        this.hidecurrentWork = val
      },
      firstVisit() {
        if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
          this.uploading = true
          this.checkUploadThenStart()
        }
      },
      onClose() {
        this.lockWinFun(false)
        this.$emit('close')
        closeWorkspaceDialog()
        this.work.afterImg = null
        this.processStep = this.processStepMap.none
        this.isDownload = false
        this.processedLock = false
      },
      onPreviewImageWhell(e) {
        if (!this.work.transId) {
          return
        }
        if (e.metaKey || e.ctrlKey) {
          this.whellReduce += e.deltaY
          if (Math.abs(this.whellReduce) > 200) {
            if (this.whellReduce > 0) {
              this.onChangeRate(0.05)
            } else {
              this.onChangeRate(-0.05)
            }
            this.whellReduce = 0
          }
        }
      },
      onPreviewImageDrag(e) {
        if (!this.moveLock) {
          return
        }
        if (this.rate === 1) {
          return
        }
        if (!this.work.transId) {
          return
        }
        console.log('onPreviewImageDrag')
        const previewW = Number(this.$refs.half.clientWidth)
        const previewH = Number(this.$refs.half.clientHeight)
        const w = Number(this.$refs.preview.clientWidth) * this.rate
        const h = Number(this.$refs.preview.clientHeight) * this.rate
        if (previewW > w) {
          this.offset.x = 0
        } else {
          this.offset.x += e.movementX / this.rate
          if ((w - previewW) / 2 / this.rate < Math.abs(this.offset.x)) {
            if (this.offset.x > 0) {
              // 触发右边界
              this.offset.x = (w - previewW) / 2 / this.rate
            } else {
              // 触发左边界
              this.offset.x = (-1 * (w - previewW)) / 2 / this.rate
            }
          }
        }
        if (previewH > h) {
          this.offset.y = 0
        } else {
          this.offset.y += e.movementY / this.rate
          if ((h - previewH) / 2 / this.rate < Math.abs(this.offset.y)) {
            if (this.offset.y > 0) {
              // 触发上边界
              this.offset.y = (h - previewH) / 2 / this.rate
            } else {
              // 触发下边界
              this.offset.y = (-1 * (h - previewH)) / 2 / this.rate
            }
          }
        }
      },
      onThumbnailPreviewDrag({ x, y }) {
        this.offset = {
          x,
          y,
        }
      },
      onChangeRate(val, isSet = false) {
        if (isSet) {
          this.rate = val
        } else {
          if (this.rate + val >= 1 && this.rate + val <= 3) {
            this.rate += val
          }
          if (this.rate === 1) {
            this.offset = {
              x: 0,
              y: 0,
            }
          }
        }
        this.previewSize = {
          w: Number(this.$refs.half.clientWidth),
          h: Number(this.$refs.half.clientHeight),
          imgw: Number(this.$refs.preview.clientWidth) * this.rate,
          imgh: Number(this.$refs.preview.clientHeight) * this.rate,
        }
      },
      /**
       * @closeSizeWin 积分不足
       */
      closePointWin() {
        this.noPointsDialogVisible = false
        location.href =
          this.$store.state.mainWebsite +
          this.$store.state.specialLocaleLink +
          '/pricing?source=image_editor&popup_type=nocredits'
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
      async onApplyProcessedImage(item, type) {
        if (item.transId === this.work.transId) {
          return
        }
        if (type !== 'recommend') {
          this.isFirstProcess = false
        }

        this.initWorkSpace()
        this.work = {}
        this.work = this.initProcessedWork(item)
        this.processedLock = true
        const selectedImg = await this.initUploadImg(item)

        this.uploadList = []
        this.uploadList.unshift(selectedImg)

        this.isDownload = true
        this.disabledBack = true
        if (!this.handleHistoryItemClick(item)) {
          return
        }
        this.processStep = this.processStepMap.processed
        this.getCredit()

        // this.preImageOriginUid = ''
        // if (item.originImageUid) {
        // this.activeJob = item.workFlowType

        //   this.preImageOriginUid = item.originImageUid
        // }
        this.$nextTick(() => {
          this.onPreview(this.work)
        })
      },
      initProcessedWork(item) {
        const obj = { ...item, afterImg: item.afterImg || item.afterImg, transId: item.transId }
        return obj
      },
      initUploadImg(item) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            // originImg = await getPreviewUrl({ transId: item.transId, issrc: 1 })
            const previewUrlData = await getPreviewUrlData({ transId: item.transId, issrc: 1 })
            const originImg = previewUrlData.presignUrl
            resolve({
              originImg,
              w: previewUrlData.picWidth,
              h: previewUrlData.picHeight,
              thumbnail: item.thumbnail,
            })
          }, 0)
        })
      },
      onValidateMessage() {
        const messageV = /.{10,}/
        if (!messageV.test(this.formData.message)) {
          this.error = true
          this.errorText = this.$t('common.feed_back_dialog_tip')
          this.$refs.blur_message.style = 'border-color:red'
          this.btndisabled = true
        } else {
          this.error = false
          this.btndisabled = false
        }
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
        Work.addFeedBack({
          email: this.formData.email,
          content: `${this.formData.message}`,
          web: 'vanceai',
          trans_id: this.work.transId || this.work.trans_id,
        })
          .then((res) => {
            if (res.data.code == 200) {
              this.feedBackDialogVisible = false
              this.formData.message = ''
              this.formData.email = ''
              this.savefeedback = false
              this.$message.success(this.$t('common.feedback_success'))
            }
            this.savefeedback = false
          })
          .catch(() => {
            console.log('addFeedBack error')
          })
      },
      initWorkSpace() {
        this.beforeImageLoading = true
        this.afterImageLoading = true
        this.rate = 1
        this.offset = {
          x: 0,
          y: 0,
        }
        this.whellReduce = 0
        this.moveLock = false
        this.processStep = this.processStepMap.none
        this.processedLock = false
        this.work = {}
        this.isDownload = false
        this.processLoading = false
        this.previewInfo = {}
        this.showPreview = false
      },
      previewLoaded() {
        this.previewImgLoading = false
        this.thumb.width = this.$refs.previewImg ? this.$refs.previewImg.clientWidth : 0
        this.thumb.height = this.$refs.previewImg ? this.$refs.previewImg.clientHeight : 0
      },
      btnFileWinFun(req) {
        if (req) {
          if (this.$getCookie('token')) {
            this.deleteListImage()
          } else {
            this.processeds = []
            this.work = {}
            this.uploadList = []
            this.isDownload = false
            localStorage.removeItem('processeds')
          }
        }
        this.delAllDialogVisible = false
        this.initWorkSpace()
      },
      deleteListImage() {
        const delData = []
        this.processeds.forEach((data) => {
          delData.push(data.transId)
        })
        Work.deleteWork({ trans_ids: delData })
        this.processeds = []
        this.work = {}
        this.uploadList = []
        this.isDownload = false
      },
      onDrag(x, y) {
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
      computedMoverSize() {
        this.mover.width = this.halfPreview.width * (this.thumb.width / this.big.width)
        this.mover.height = this.halfPreview.height * (this.thumb.height / this.big.height)
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
        }
      },
      feedBackDialog() {
        if (this.$getCookie('email')) {
          this.formData.email = this.$getCookie('email')
        }
        this.feedBackDialogVisible = true
      },
      setHalfPreview(halfPreview) {
        this.halfPreview.width = halfPreview.width
        this.halfPreview.height = halfPreview.height
        this.zoomChangeHandle(this.zoom)
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
          this.big.left = -(this.big.width - this.wrap.width) > 0 ? 0 : -(this.big.width - this.wrap.width)
        } else {
          this.big.left = left
        }
        if (top > 0) {
          this.big.top = 0
        } else if (top < -this.big.height) {
          this.big.top = -this.big.height
        } else if (Math.abs(top - this.halfPreview.height) > this.big.height) {
          this.big.top =
            -(this.big.height - this.halfPreview.height) > 0
              ? 0
              : -(this.big.height - this.halfPreview.height)
        } else {
          this.big.top = top
        }
      },
      onSwitchTab(tabname) {
        if (tabname === 'back') {
          this.isDownload = false
        } else {
          if (!this.work.transId) {
            return
          }
          this.isDownload = true
        }
      },

      // 执行前检查图片是否上传完成
      checkUploadThenStart(isUserClick) {
        if (this.checkHideOnlineService()) {
          return
        }

        if (isUserClick) {
          this.clickStartTime = Date.now()
          this.requestTransform = true
        }
        if (this.uploading) {
          // 15秒以内还没有上传完, 则重新上传
          if (this.waitTimes < 50) {
            setTimeout(() => {
              this.waitTimes += 1
              this.checkUploadThenStart()
            }, 300)
          } else {
            this.uploading = false
            this.waitTimes = 0
            this.prepareUid = 0
            this.onBeforeStartProcess()
          }
        } else {
          this.waitTimes = 0
          this.onBeforeStartProcess()
        }
      },
      setCurrentWork() {
        // 推荐功能使用参数

        this.work = {
          ...this.currentImage,
          ...this.currentWork,
        }
      },
      async onBeforeStartProcess() {
        if (!this.currentImage && !(!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token'))) {
          this.$message.error(this.$t('common.select_tip'))
          return
        }
        if (this.processLoading) {
          return
        }
        this.setCurrentWork()

        this.isFirstProcess = true
        // this.onStartProcess()
        const options = this.$refs.upscalerWorksConfig.getWorkConfig()
        let prompt = ''
        if (options.prompt) {
          const translateRes = await Work.translateText(options.prompt)
          prompt = (translateRes.data.data && translateRes.data.data.text) || ''
        }
        this.onStartProcessV2(
          'magic_enlarge_clarity',
          {
            ...options,
            customize: true, // 此模型 固定传 尺寸自定义
            customImageWidth: options.customize ? options.customImageWidth : this.work.w * options.scale,
            customImageHeight: options.customize ? options.customImageHeight : this.work.h * options.scale,

            workName: 'magic_enlarge_clarity',
            prompt,
          },
          {
            denoising_strength: options.denoising_strength,
            prompt: prompt || '-',
            scale: options.scale,
            customize: options.customize,
            width: options.customImageWidth,
            height: options.customImageHeight,
          }
        )
      },
      async getProcesseds() {
        if (this.$getCookie('token')) {
          const { processeds, total } = await lastValueFrom(
            EnhanceWorkspaceStream.getProcesseds(1, 50, this.filterJobs.join(','), 1)
          )

          this.processeds = processeds.map((item) => ({
            ...item,
            elkJob: item.operation,
            beforeImg: 'null',
            afterImg: 'null',
          }))
          this.total = total
        } else {
          let processeds = localStorage.getItem('processeds')
          if (processeds) {
            //移除系统过期图片以及样图
            processeds = this.removeWorkData(JSON.parse(processeds))

            this.processeds = processeds.filter((val) => {
              if (this.filterJobs.indexOf(val.elkJob) != -1) {
                return true
              }
            })
          }
        }
        // this.checkDropBoxAccessToken()
      },
      likeNums(likesVal) {
        this.work.likes = likesVal
      },
      onUpload(list) {
        this.disabledBack = false
        // 正在处理时，重新上传图片，停止上次轮询
        if (this.processStep === this.processStepMap.processing) {
          this.processNext()
        }
        this.initWorkSpace()
        this.processedModels = {}
        this.isFirstProcess = false
        this.hasFileId = false
        // todo
        this.getProcesseds()

        if (!list.length) {
          return
        }
        const filters = list.filter((item) => {
          return this.uploadList.every((item2) => item.cid !== item2.cid)
        })
        this.selectedUploadFormList(list)
        filters.forEach((item) => {
          this.uploadList.unshift({ ...item, file: item.file })
        })
        this.selectPhotoFromWorkspace(this.uploadName)
        this.firstVisit()
      },
      //自动选中图片
      selectedUploadFormList(list) {
        this.uploadList.forEach((item) => {
          item.selected = false
        })
        for (let i = 0; i < list.length; i++) {
          list[i].selected = true
        }
      },
      getPreviewImageSize(work) {
        let scale = 1
        if (work && work.config && work.config.scale) {
          scale = work.config.scale
        }
        if (
          work &&
          work.params &&
          work.params.config &&
          Object.prototype.toString.call(work.params.config).slice(8, -1) === 'Object'
        ) {
          return work.params.config.module_params.customize
            ? {
                w: Math.round(work.params.config.module_params.width),
                h: Math.round(work.params.config.module_params.height),
                scale,
              }
            : {
                w: Math.round(work.w * scale),
                h: Math.round(work.h * scale),
                scale,
              }
        } else {
          return {
            w: Math.round(work.w * scale),
            h: Math.round(work.h * scale),
            scale,
          }
        }
      },

      async onPreview(work) {
        this.afterImageLoading = true
        this.startTime = Date.now()
        this.previewInfo.thumbnail = work.thumbnail
        this.getWorkNamePoint('magic_enlarge_clarity')
        const image = new Image()
        image.src = this.previewInfo.thumbnail
        this.previewInfo.filename = work.filename
        this.previewInfo.operation = work.operation
        const previewImageSize = this.getPreviewImageSize(work)
        this.previewInfo.scale = previewImageSize.scale
        this.previewInfo.w = previewImageSize.w
        this.previewInfo.h = previewImageSize.h
        this.showPreview = true
        //S3预览
        // work.afterImg = await getPreviewUrl({ transId: work.transId, issrc: 0 })
        const previewUrlData = await getPreviewUrlData({ transId: work.transId, issrc: 0 })
        work.afterImg = previewUrlData.presignUrl
        this.previewInfo.afterW = previewUrlData.picWidth
        this.previewInfo.afterH = previewUrlData.picHeight
        if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'process',
            event_info: {
              process_first_image: 'finish',
            },
          })
          this.$setCookie('cloud_isFirstVisit', true, 365)
          this.$setCookie('cloud_isFirstDrag', true, 365)
        }
      },
      isNewEnlargeModel() {
        const sourcePageUrls = ['image-sharpen', 'image-enlarger', 'image-enhancer', 'denoise-ai']
        if (
          this.modalType === 'STANDARD' &&
          sourcePageUrls.includes(this.pageUrl) &&
          this.isDialog &&
          this.userType !== 'paying'
        ) {
          this.$store.commit('SET_IS_NEW_ENLARGE_MODEL', true)
        } else {
          this.$store.commit('SET_IS_NEW_ENLARGE_MODEL', false)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .icon-s-enlarge,
  .icon-s-sharpen1,
  .icon-s-denoise {
    font-size: 28 / @base;
    color: #4d4d4d;
  }

  .icon-s-enlarge.icon_hover,
  .icon-s-sharpen1.icon_hover,
  .icon-s-denoise.icon_hover {
    color: #0374ff;
  }

  .icon-s-enlarge.icon_active,
  .icon-s-sharpen1.icon_active,
  .icon-s-denoise.icon_active {
    color: #fff;
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

  /deep/ .el-loading-mask {
    z-index: 0;
  }

  .tip-dialog {
    /deep/ .dialog-content {
      padding: 60px 30px 30px !important;
    }

    /deep/ .drives {
      text-align: center;

      .selector {
        background: #ffb048 !important;
      }
    }

    .download_btn {
      width: 270px;
    }
  }

  .fixed-dialog {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100vw;
    height: 100vh;

    .enhance-workspace-nav {
      display: flex;
      width: 100%;
      height: 64 / @base;
      border-bottom: 1px solid #ddd;

      .enhance-workspace-nav-l {
        display: flex;
        flex: 1;
        align-items: center;
        padding: 10 / @base 20 / @base;

        .workspace_tit {
          margin-bottom: 0 !important;
          font-size: 20 / @base;
          font-weight: bold;
          color: rgb(77, 77, 79);
        }
      }

      .enhance-workspace-nav-c {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: flex-end;
      }

      .enhance-workspace-nav-r {
        display: flex;
        justify-content: flex-end;
        width: 375 / @base;

        .close {
          margin: 10 / @base 20 / @base;
          cursor: pointer;

          .icon {
            font-size: 150%;
          }

          &:hover {
            .icon {
              color: #ff0909;
            }
          }
        }
      }
    }
  }
  .enhance-workspace {
    background-color: #fff;

    .layouts {
      background-color: #fff;

      .title {
        font-size: 14 / @base;
        font-weight: 400;
        color: #4d4d4f;
      }

      .l {
        display: flex;
        flex-direction: column;

        .l-title {
          height: 62px;
          font-size: 14 / @base;
          font-weight: 400;
          line-height: 62px;
          color: #4d4d4f;
          text-align: center;
        }
        .complete-tip {
          padding: 0 12px;
          height: 36px;
          line-height: 36px;
          background: #f2f2f2;
          border: 1px solid #ff9d1d;
          border-radius: 50px;
          opacity: 1;
          position: fixed;
          left: 50px;
          top: 80px;
          z-index: 10;
          display: none;
          &::before {
            content: '';
            position: absolute;
            top: 12px;
            left: -5px;
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-right: 5px solid #ff9d1d;
          }
        }
        .l-list {
          flex: 1;
          padding: 2 / @base 20 / @base;
          margin: 20 / @base 0;

          .l-list-item {
            margin-bottom: 10 / @base;
            cursor: pointer;
            width: 96 / @base;
            height: 96 / @base;
            position: relative;

            &:hover {
              box-shadow: 0 0 0 2px #016bfa;
            }

            img {
              width: 100%;
            }
          }

          .l-list-active-item {
            box-shadow: 0 0 0 2px #016bfa;
          }
        }

        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 20 / @base;

          .l-title {
            margin: 10 / @base 0 0;
          }
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 64 / @base;
          font-size: 14 / @base;
          cursor: pointer;

          span {
            margin-left: 10 / @base;
          }

          &:hover {
            color: #ff0909;
          }
        }
      }

      .enhance-main {
        height: 100%;

        .main-top {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 62px;
          padding: 0 20px;

          .upload-btn {
            width: 200 / @base;
          }
        }

        .free-user-hint {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 30 / @base;
          margin-top: 12 / @base;
          // height: 130 / @base;
          color: #9a9999;

          .icon-s-kongxinwenhao {
            margin-right: 5px;
          }

          .hint-number {
            margin-left: 5px;
            color: #1594f5;
          }
        }

        .main-center {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: calc(100% - 130px);

          .review {
            position: relative;
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 100%;

            .review-half {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: calc(50% - 1px);
              height: 100%;
              padding: 28 / @base;
              overflow: hidden;
              user-select: none;
              background-color: #ededed;

              * {
                pointer-events: none;
              }

              .review-tag {
                position: absolute;
                top: 28 / @base;
                left: 28 / @base;
                z-index: 9;
                display: flex;
                flex-direction: column;
                justify-content: center;
                min-width: 90 / @base;
                min-height: 27 / @base;
                padding: 0 5 / @base;
                font-size: 14 / @base;
                color: #fff;
                text-align: center;
                background-color: #2f2724;
              }
              /deep/.single-queue-tip {
                pointer-events: all;
              }

              .queue-upload {
                /deep/.el-upload-dragger {
                  background: none;
                }
                .btn-container {
                  width: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  pointer-events: all;
                  .next-btn {
                    margin-top: 32px;
                    height: 44px;
                    line-height: 40px;
                    padding: 0 16px;
                    background: #f7f7f7;
                    border: 2px solid #dddddd;
                    border-radius: 2px;
                    cursor: pointer;
                  }
                }
              }

              .target_btn {
                pointer-events: all;
              }

              // .wide-img {
              //   width: 100%;
              //   object-fit: scale-down;
              // }

              // .long-img {
              //   width: 100%;
              //   height: 100%;
              //   object-fit: scale-down;
              // }
            }

            .review-r {
              .ready-process {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;

                .status {
                  display: flex;
                  align-items: center;

                  .title {
                    margin-left: 10 / @base;
                  }
                }

                .status-column {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
              }
            }
          }
        }

        .dialog-main-center {
          height: calc(100% - 65px);
        }

        .main-bottom {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 64 / @base;

          .scale-btns {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100 / @base;
          }

          .feedback-btn {
            position: absolute;
            top: auto;
            right: 20 / @base;
          }
        }

        .main-bottom .traffic-banner-upload {
          margin-top: -48px;
        }
      }

      .r {
        .tab {
          display: flex;
          flex-direction: column;
          height: 100%;

          .tab-nav {
            display: flex;
            align-items: center;
            height: 45 / @base;
            margin: 10 / @base 20 / @base;

            .tab-nav-btn {
              cursor: pointer;
            }
          }

          .nav-right {
            justify-content: flex-end;
          }

          .tab-main {
            flex: 1;
            padding: 0 20 / @base 20 / @base;
            overflow: auto;

            .title {
              margin: 10 / @base 0 10 / @base;
            }
          }

          .tab-footer {
            width: 100%;
          }
        }

        .setting-tab {
          position: relative;

          .img-box {
            position: absolute;
            top: 100px;
            bottom: 0;
            left: -650px;
            height: 480px;
            z-index: 12;
            // margin: auto 0;
          }

          .tab-footer {
            height: 135 / @base;

            .process-setting {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20 / @base;
              background-color: #fff;

              .start-process-btn {
                width: 100%;
                position: relative;
                line-height: 1;
                height: 60 / @base;
                .process-credits {
                  font-size: 14px;
                  font-weight: 400;
                  color: #9b5800;
                  margin-top: 6px;
                  line-height: 1;
                }
              }

              .pic_out_btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 2.75rem;
                padding: 5px;
                margin-top: 5px;
                cursor: pointer;
                background: transparent;
                border: 0;

                .icon-s-setting {
                  margin-right: 5px;
                }
              }
            }
          }
        }

        .download-tab {
          .tab-main {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(100% - 45px);

            .preview-box {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
              margin-bottom: 10px;
              background: #ededed;

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
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              background: #fff;

              .credits-bottom {
                width: 100%;
                padding: 15px 0;
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

              .download-btn {
                width: 195px;
                height: 40px;
                margin-bottom: 5px;
                color: #fff;
                background: #ff9d1d;
                border: none;
                border-radius: 3px;

                &:hover {
                  background: #ffb048;
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

            .uploaded {
              /deep/ .el-upload {
                width: 100%;
              }
            }
          }

          .tab-footer {
            height: 64 / @base;
          }
        }
      }

      .divider {
        width: 100%;
        height: 1px;
        padding: 0 20 / @base;
        background-color: #ddd;
      }
    }

    .traffic-banner-preview {
      margin-top: 10 / @base;

      /deep/ .traffic-link {
        flex-direction: column;

        .traffic-l {
          flex-direction: column;
          align-items: center;

          .traffic-image {
            margin-right: 0;
          }

          .traffic-info {
            margin-bottom: 20 / @base;

            .title {
              text-align: center;
            }

            .desc {
              text-align: center;
            }
          }
        }
      }
    }

    .flip-arrow {
      transform: rotate(180deg);
    }

    .fa-box-height {
      width: 100%;
    }

    .skeleton-screen {
      width: 100%;
      height: 100%;

      .line-grade-box {
        height: 1px;
        background: #f1f2f2;
      }

      .child-mode {
        height: 20px;
        background: #f1f2f2;
      }

      .child-mode2 {
        width: 100%;
        height: 40px;
        background: #f1f2f2;
      }

      .child-mode3 {
        width: 80%;
        height: 40px;
        background: #f1f2f2;
      }
    }

    .arrow {
      display: inline-block;
      margin: 3 / @base;

      &::after {
        display: inline-block;
        width: 15 / @base;
        height: 15 / @base;
        content: '';
        border-bottom: 2px solid #4d4d4d;
        border-left: 2px solid #4d4d4d;
        transform: rotate(45deg);
      }
    }

    .arrow-disabled {
      &::after {
        border-color: #dedede !important;
      }
    }

    .dialog-container {
      justify-content: center;
    }
  }

  .batch-btn {
    // border: 1px solid #ddd;
    // background-color: #fff;
    // color: #4d4d4d;
    margin-left: 10 / @base;
    // &:hover {
    //   border-color: #4d4d4d;
    // }
  }

  .full-btn {
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
    }
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

  .disabled {
    color: #dedede !important;
    cursor: not-allowed !important;

    span {
      color: #dedede !important;
    }
  }

  .disabled-btn {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .loading {
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

  .upload-box {
    width: 100%;
  }

  .pic_out_setting {
    position: relative;
    z-index: 999;
    width: 100%;
  }

  .pic_out_setting_cont {
    // display: none;
    position: absolute;
    top: -430px;
    z-index: 100;
    width: 100%;
    height: 430px;
    padding: 10px;
    background: #f5f7fa;
    border: 1px solid #f0f0f0;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
  }

  .hide {
    visibility: hidden;
  }

  .pic_out_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 2.75rem;
    padding: 5px;
    margin-top: 5px;
    cursor: pointer;
    background: transparent;
    border: 0;

    .icon-s-setting {
      margin-right: 5px;
    }
  }

  .software-download-tip {
    display: flex;
    align-items: center;
    padding: 10 / @base 20 / @base;
    margin-bottom: 20 / @base;
    background: #efefef;

    a {
      margin-left: 10 / @base;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .preview-recommend {
    .preview-space {
      height: 200px;
    }

    .enlarge-model {
      padding-top: 20 / @base;
      padding-bottom: 20 / @base;
      background-color: #f5f7fa;
      border-radius: 3px;
    }
  }
</style>
<style lang="less">
  .enhance-workspace {
    .l {
      display: flex;
      flex-direction: column;
    }

    .c {
      border-right: 1px solid #ddd;
      border-left: 1px solid #ddd;
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
