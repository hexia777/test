<template>
  <div class="enhance-workspace workspace-drag-ctr" :class="[isDialog && 'fixed-dialog']">
    <div class="enhance-workspace-nav" v-if="isDialog">
      <div class="enhance-workspace-nav-l">
        <h1 class="workspace_tit pad-space">
          {{ $t('common.common_solution_6') }}
        </h1>
      </div>
      <div class="enhance-workspace-nav-c">
        <div class="main-top-l">
          <div class="preview-type">
            <div
              class="icons l_icons"
              :class="[previewType === 'dbcolumn' && 'active']"
              @click="previewType = 'dbcolumn'"
              v-track-label="$commonTrackLabel('previewtype_dbcolumn')"
            >
              <i class="icon iconfont-single icon-s-db-column"></i>
              <i class="icon_hover iconfont-single icon-s-db-column"></i>
              <i class="icon_select iconfont-single icon-s-db-column"></i>
            </div>
            <div
              class="icons r_icons"
              :class="[previewType === 'column' && 'active']"
              @click="previewType = 'column'"
              v-track-label="$commonTrackLabel('previewtype_column')"
            >
              <i class="icon iconfont-single icon-s-column"></i>
              <i class="icon_hover iconfont-single icon-s-column"></i>
              <i class="icon_select iconfont-single icon-s-column"></i>
            </div>
          </div>
          <div v-show="processed" class="scale-btns mag-l-10">
            <span class="mag-r-10">{{ $t('workspace.zoom') }}</span>
            <el-select class="scale-btn f-14" v-model="rate" @change="onChangeRate(rate, true)">
              <el-option
                v-for="(item, index) in rateData"
                :key="index"
                :label="item.title"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="btns">
          <div
            @click="onUploadClick('workdesk_top')"
            v-track-label="$commonTrackLabel('upload_workdesk_top')"
          >
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
          <a v-else class="batch-btn minor-small-button" :href="workspaceLink">
            {{ $t('workspace.batch_process') }}
          </a>
        </div>
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
        <div class="main-top" v-if="!isDialog">
          <div class="main-top-l">
            <div class="preview-type">
              <div
                class="icons l_icons"
                :class="[previewType === 'dbcolumn' && 'active']"
                @click="previewType = 'dbcolumn'"
                v-track-label="$commonTrackLabel('previewtype_dbcolumn')"
              >
                <i class="icon iconfont-single icon-s-db-column"></i>
                <i class="icon_hover iconfont-single icon-s-db-column"></i>
                <i class="icon_select iconfont-single icon-s-db-column"></i>
              </div>
              <div
                class="icons r_icons"
                :class="[previewType === 'column' && 'active']"
                @click="previewType = 'column'"
                v-track-label="$commonTrackLabel('previewtype_column')"
              >
                <i class="icon iconfont-single icon-s-column"></i>
                <i class="icon_hover iconfont-single icon-s-column"></i>
                <i class="icon_select iconfont-single icon-s-column"></i>
              </div>
            </div>
            <div v-show="processed" class="scale-btns mag-l-10">
              <span class="mag-r-10">{{ $t('workspace.zoom') }}</span>
              <el-select class="scale-btn f-14" v-model="rate" @change="onChangeRate(rate, true)">
                <el-option
                  v-for="(item, index) in rateData"
                  :key="index"
                  :label="item.title"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="btns">
            <div
              @click="onUploadClick('workdesk_top')"
              v-track-label="$commonTrackLabel('top_upload_button')"
            >
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
            <a v-else class="batch-btn minor-small-button" :href="workspaceLink">
              {{ $t('workspace.batch_process') }}
            </a>
          </div>
        </div>
        <div class="divider" v-if="!isDialog"></div>
        <div class="main-center" :class="[isDialog && 'dialog-main-center']">
          <div v-if="currentImage" class="review" :class="[previewType === 'column' && 'review-center']">
            <template v-if="previewType === 'dbcolumn'">
              <div
                class="review-half review-l"
                @mousedown="moveLock = true"
                @mousemove="onPreviewImageDrag"
                @mouseleave="imageOutFun"
                @mouseenter="imageEnterFun"
                v-loading="beforeImageLoading"
              >
                <p class="review-tag">{{ $t('common.remove_27') }}</p>
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
                  :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                  :style="{
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
                  <p class="review-tag" v-if="!showRecommendModels">{{ $t('common.remove_28') }}</p>
                  <div class="review-tag-des" v-else>
                    <div class="after-tag">{{ $t('common.remove_28') }}</div>
                    <div class="recommend-upscaler" v-show="!afterImageLoading">
                      <div class="upscaler-tag">
                        <i class="iconfont-single icon-s-icon_upscaler upscaler-label"></i>
                        <span class="upscaler-title">{{ $t('workspace.upscaler') }}</span>
                      </div>
                      <div
                        class="upscaler-item"
                        @click="recommendUpscaler(2)"
                        v-track-label="$commonTrackLabel('recommend_upscaler_2')"
                      >
                        <span class="upscaler-label">2x</span>
                        <span>{{
                          `${Math.round(currentImage.w * 2)}x${Math.round(currentImage.h * 2)}`
                        }}</span>
                      </div>
                      <div
                        class="upscaler-item"
                        @click="recommendUpscaler(4)"
                        v-track-label="$commonTrackLabel('recommend_upscaler_4')"
                      >
                        <span class="upscaler-label">4x</span>
                        <span>{{
                          `${Math.round(currentImage.w * 4)}x${Math.round(currentImage.h * 4)}`
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <img
                    @load="afterImageLoad"
                    ref="preview"
                    :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                    :style="{
                      opacity: afterImageLoading ? 0 : 1,
                      transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                    }"
                    :src="work.afterImg == 'null' ? '' : work.afterImg"
                  />
                </template>
                <template v-else>
                  <div class="ready-process" v-if="!processed">
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
                        :source="`image-cartoonizer`"
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
            </template>
            <template v-else>
              <div
                class="review-full"
                ref="half"
                @mousedown="moveLock = true"
                @mousemove="onPreviewImageDrag"
                @mouseup="moveLock = false"
                @mouseleave="moveLock = false"
              >
                <!-- 图片裁剪 -->
                <div
                  class="image-crop-btn target_btn"
                  v-show="cropBtnType2"
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
                  ref="preview"
                  :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                  :style="{
                    transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                  }"
                  :src="work.afterImg ? work.afterImg : currentImage.originImg"
                  @load="uploadImageFun"
                />
                <div class="ready-process" v-if="!processed">
                  <p class="title" v-if="processStep === processStepMap.none && !uploading">
                    {{ $t('workspace.ready_process') }}
                  </p>
                  <div class="status" v-if="processStep === processStepMap.upload || uploading">
                    <i class="iconfont-single icon-s-loading"></i>
                    <span class="title" v-html="$t('workspace.upload_status_1')"></span>
                  </div>
                  <div class="status" v-if="processStep === processStepMap.processing">
                    <i class="iconfont-single icon-s-loading"></i>
                    <span class="title" v-html="$t('workspace.upload_status_3')"></span>
                  </div>
                  <div class="status" v-else-if="processStep === processStepMap.error">
                    <i class="iconfont-single icon-s-fail"></i>
                    <span class="title" v-html="$t('workspace.upload_status_6')"></span>
                  </div>
                </div>
              </div>
            </template>
          </div>
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

          <more-features-dialog
            v-if="showMoreFeaturesDialog"
            :features="recommendFeatures"
            :file-id="work.transId || work.trans_id"
          />
        </div>

        <div v-if="showFreeUserProcessHint" class="free-user-hint">
          <el-tooltip effect="dark" :content="$t('workspace.free_process_hint_hover')" placement="top">
            <i class="iconfont-single icon-s-kongxinwenhao"></i>
          </el-tooltip>
          <span> {{ $t('workspace.free_process_hint') }}</span>
          <span class="hint-number">{{ freeProcessWebNum }}</span>
        </div>

        <div class="main-bottom" v-if="processed">
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
            <div class="fa-box-height">
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
                      <a :href="pricingLink" class="credits-tip">
                        {{ $t('workspace.credits_preview_get') }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div class="skeleton-screen" v-if="!processed">
                <div class="child-mode2 mag-t-10"></div>
                <div class="child-mode mag-t-10"></div>
                <div class="child-mode2 mag-t-10"></div>
              </div>
              <div v-else>
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
                      <span :class="{ 'v-hide': !processed }" v-if="download_point">
                        {{ download_point }} {{ $t('workspace.credits_preview_m_Credits') }}
                      </span>
                      <span v-show="download_point && processStep === processStepMap.processed">
                        |
                      </span>
                      <span v-if="processed"> {{ $t('workspace.text_32') }}{{ sizeFun(work.filesize) }}</span>
                    </div>
                  </div>
                  <drives
                    v-if="false"
                    :trans-ids="selectedList"
                    :drop-box-redirect-url="dropBoxRedirectUrlProp || dropBoxRedirectUrl"
                  />
                </div>

                <div class="tc download-btn btn-box-w" v-else>
                  <button
                    class="primary-small-button block"
                    v-loading="downloadLoading"
                    @click="onDownloadBefore"
                    v-track-label="$commonTrackLabel('download_button')"
                  >
                    <!-- <i class="iconfont-single icon-s-download2"></i> -->
                    {{ $t('workspace.upload_13') }}
                  </button>
                  <drives
                    v-if="false"
                    :trans-ids="selectedList"
                    :drop-box-redirect-url="dropBoxRedirectUrlProp || dropBoxRedirectUrl"
                  />
                </div>
                <div class="f-14 tc cA2A mag-ve-20" v-if="!isWatermarkPlanB">
                  <span :class="{ 'v-hide': !processed }">
                    {{ deductionCredit }} {{ $t('workspace.credits_preview_m_Credits') }}
                  </span>
                  <span v-if="processed"> | {{ $t('workspace.text_32') }}{{ sizeFun(work.filesize) }}</span>
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
          <div
            class="tab-nav nav-right"
            @click="onSwitchTab('download')"
            v-track-label="$commonTrackLabel('download_button')"
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
          <cartoonizer-works @updateWorkConfig="updateWorkConfig" />
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
      track="?source=single&type=cartoonizer&date=20230601"
      type="cartoonizer"
    />
    <custom-dialog
      class="tip-dialog"
      :visible.sync="downloadDialogVisible"
      :show-header="false"
      @close="handleDownloadTipClose"
    >
      <p class="mag-b-10 tc f-20 f-b">{{ $t('workspace.recommend_save_tip') }}</p>
      <p>{{ $t('workspace.recommend_save_tip_2') }}</p>
      <div class="tc flex flex-col align-center mag-t-20">
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
          <el-checkbox>{{ $t('workspace.dont_show_again') }}</el-checkbox>
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
  import EnhanceWorkspaceStream from '@/stream/EnhanceWorkspaceStream'
  import FileUpload from '@/components/FileUpload'
  import ThumbUp from '@/components/matting/ThumbUp'
  import Dialog from '@/components/giveaway/Dialog'
  import CustomDialog from '@/components/CustomDialog'
  import DownloadLoading from '@/components/loading/Loading'
  import Fabulous from '@/components/Fabulous'
  import MyDialog from '@/components/matting/MyDialog'
  import RegisterAndSubscribeDialog from '@/components/RegisterAndSubscribeDialog'
  import FreeProcessTimesDialog from '@/components/FreeProcessTimesDialog'
  import CartoonizerWorks from './CartoonizerWorks.vue'
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
  import { parseLocationQuery, isNull, closeWorkspaceDialog } from '@/static/script/utils'
  import Work from '@/static/script/work.js'
  import { emailStr } from '@/static/script/rules.js'
  //config
  import servers from '@/static/config/common/server.config'
  import OutSetting from '@/components/WorkSpace/OutSetting'
  // import TrafficBanner from '@/components/TrafficBanner'
  import SingleQueueTip from '@/components/WorkSpace/SingleQueueTip.vue'
  import HistoryStatus from '@/components/HistoryStatus'
  import Drives from '@/components/Drives.vue'
  import RecommendDownloadDialog from '@/components/RecommendDownloadDialog.vue'
  import RecommendAppDialog from '@/components/RecommendAppDialog.vue'
  import MoreFeaturesDialog from './MoreFeaturesDialog.vue'
  import { getPreviewUrl } from '@/static/plugin/awsS3'

  export default {
    name: 'ImageCartoonizerWorkspace',
    components: {
      RecommendDownloadDialog,
      Drives,
      SingleQueueTip,
      HistoryStatus,
      // TrafficBanner,
      ThreeColumnsLayouts,
      ListLayouts,
      FileUpload,
      OutSetting,
      // WorkflowOperations,
      ThumbUp,
      Dialog,
      CustomDialog,
      DownloadLoading,
      Fabulous,
      MyDialog,
      RegisterAndSubscribeDialog,
      FreeProcessTimesDialog,
      // FreeDownloadA,
      RecommendAppDialog,
      MoreFeaturesDialog,
      CartoonizerWorks,
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
      const today = new Date()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const formattedDate = month + day
      // 卡通及素描工作台导航到pricing页面修改参数
      const pricingSuffix = `?source=cartoon&date=${formattedDate}&type=workspace`
      return {
        queueImprove: true,
        pricingSuffix,
        smallSize: {
          w: 0,
          h: 0,
        },
        isWatermarkPlanB: true,
        radio: '1',
        modelData: {}, //模型数据
        testData: 1,
        processeds: [],
        total: 0,
        uploadList: [],
        currentResult: null,
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
        currentWork: {
          elkJob: '',
          activeName: '',
          name: '',
          config: null,
        },
        whellReduce: 0,
        uploadName: 'banner',
        beforeImageLoading: false,
        afterImageLoading: false,
        disabledBack: false,
        startTime: 0,
        previewType: 'dbcolumn',
        editorEditor: false,
        showDownloadAppTip: false,
        recommendAppVisible: false,
        workName: '',
        workOptions: {},
        elkParams: {},
        clickStartTime: 0, // 点击开始处理按钮的时间戳
        uploading: false, // 提前上传图片正在处理
        lastUploadTime: 0, // 最后上传图片的时间戳
        waitTimes: 0, // 点击开始处理等待15秒图片提前上传
        prepareUid: null, // 图片提前上传成功后对应的uid
        download_point: 0,
        handle_point: 0,

        //父应用传过来的
        dropBoxRedirectUrlProp: '',
        workspaceUrl: '',
        isDialog: false,
        selModel: '5',
        fileList: [],
        workType: '',
        needRecommendFeatures: false,
        pageUrl: '',
        popWin: false,
        //菜单的展示顺序
        orderMenu: '1',
        userAgent: '',
      }
    },
    computed: {
      showRecommendModels() {
        return false
        // const sourcePageUrls = ['toongineer-cartoonizer']
        // return (
        //   sourcePageUrls.includes(this.pageUrl) &&
        //   !this.$store.state.mobile &&
        //   // this.$store.state.locale === 'en' &&
        //   this.userType !== 'paying' &&
        //   this.$getCookie('common_ab_test') === 'b_0804'
        // )

        // return true
      },
      recommendFeatures() {
        if (!this.needRecommendFeatures) {
          return []
        }
        if (this.workType === 'animegan') {
          return ['upscaler', 'enhancer', 'sharpen']
        }
        return []
      },
      showMoreFeaturesDialog() {
        return false
        // return (
        //   this.needRecommendFeatures &&
        //   this.isDialog &&
        //   this.work.afterImg &&
        //   !this.afterImageLoading &&
        //   !this.$store.state.mobile &&
        //   this.$store.state.locale === 'en' &&
        //   this.userType !== 'paying' &&
        //   this.$getCookie('common_ab_test') === 'b_0804'
        // )
      },
      showFreeUserProcessHint() {
        return (
          this.userType !== 'paying' &&
          this.$getCookie('token') &&
          this.currentImage &&
          !this.processLoading &&
          !this.processed
        )
      },
      pricingLink() {
        return (
          this.$store.state.mainWebsite +
          this.$store.state.specialLocaleLink +
          `/pricing/?source=${this.linkParam}&medium=get_credits`
        )
      },
      workspaceLink() {
        return this.$store.state.ll + `/workspace?source=workdesk&type=${this.workspaceUrl}`
      },
      linkParam() {
        let linkParam = 'image-cartoonizer'
        if (this.popWin) {
          linkParam = 'toongineer-cartoonizer'
        }
        if (this.orderMenu == 1 && this.popWin) {
          linkParam = 'photo-to-sketch'
        }
        return linkParam
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
        return [WorkFlowType.sketch, 'animegan_toon', WorkFlowType.cartoonize]
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
        async handler(val) {
          // 图片更新后立即上传, 减小处理时间
          if (val && val.file && !val.uid) {
            await this.setCurrentWork()
            this.work = this.initWork(this.work)
            const time = Date.now()
            this.lastUploadTime = time
            this.generateParams(this.work)
            this.waitTimes = 0
            this.uploading = true
            // let uploadImgData = {}
            const uploadImgData = await this.uploadImgV2(this.work, 'img2anime')
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

      loggeg() {
        this.getProcesseds()
      },
    },
    async mounted() {
      this.initData()

      const regX = /workspace-image_cartoonizer|abc/g
      //弹窗模式
      if (this.popWin) {
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

      this.descript = this.$t('workspace.photo_descript')
      this.getProcesseds()
      if (this.fileList && this.fileList.length) {
        this.uploadList = [this.fileList[this.fileList.length - 1]]
      }

      if (this.uploadList.length) {
        return
      }
      try {
        const query = parseLocationQuery()
        if (query.fileId) {
          this.hasFileId = true
          this.beforeImageLoading = true
          const file = await this.getFileByPreviewSrc(query.fileId)
          this.uploadList = [file]
          // this.workspaceVisible = true
          // this.beforeImageLoading = false
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
      updateWorkConfig(workName, workOptions, elkParams) {
        this.workName = workName
        this.workOptions = workOptions
        this.elkParams = elkParams
        this.getWorkNamePoint(workName)
      },

      recommendUpscaler(scale) {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'general_click',
          event_value: 'extra_process_enlarge',
        })

        window.open(
          `${this.$store.state.ll}/workspace/enhance/?fileId=${
            this.work.transId || this.work.trans_id
          }&scale=${scale}`,
          '_blank'
        )
      },
      afterImageLoad(e) {
        this.afterImageLoading = false
        const work = this.work
        this.setLoadEnd(work.transId)
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
      checkDropBoxCallBack() {
        const hash = this.$route.hash.replace('#', '')
        if (hash) {
          const [key, value] = hash.split('&')[0].split('=')
          if (key === 'access_token') {
            //todo
            let transIds = localStorage.getItem('transIds')
            if (!isNull(transIds)) {
              try {
                transIds = JSON.parse(transIds)
                if (!isNull(transIds)) {
                  const filter = this.processeds.filter((item) => item.transId === transIds[0])
                  if (filter && filter.length) {
                    this.onApplyProcessedImage(filter[0])
                  }
                }
              } catch (e) {
                console.error(e)
              }
            }
          }
        }
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
          `${this.$store.state.ll}/soft-downloading/?source=single&type=cartoonizer&date=20230322`,
          '_blank'
        )
      },
      setAppDownloadTipClose() {
        this.$setCookie('cloud_close_app_d_t', 1, 2)
      },

      uploadImageFun() {
        this.afterImageLoading = false
        this.beforeImageLoading = false
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
      onEditor() {
        this.editorEditor = true
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
      async onApplyProcessedImage(item) {
        if (item.transId === this.work.transId) {
          return
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
        this.$nextTick(() => {
          this.onPreview(this.work, 1)
        })
      },

      initProcessedWork(item) {
        const obj = { ...item, afterImg: item.afterImg || item.afterImg, transId: item.transId }
        return obj
      },
      initUploadImg(item) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const originImg = await getPreviewUrl({ transId: item.transId, issrc: 1 })
            const obj = { originImg, w: 1, h: 1, thumbnail: item.thumbnail }
            const image = new Image()
            image.src = obj.originImg
            image.onload = () => {
              obj.w = image.width
              obj.h = image.height
            }
            resolve(obj)
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
        }).then((res) => {
          if (res.data.code == 200) {
            this.feedBackDialogVisible = false
            this.formData.message = ''
            this.formData.email = ''
            this.savefeedback = false
            this.$message.success(this.$t('common.feedback_success'))
          }
          this.savefeedback = false
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
        if (req) {
          this.initWorkSpace()
        }
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
        this.work = {
          ...this.work,
          ...this.currentImage,
        }
      },
      /**
       * @onBeforeStartProcess
       */
      async onBeforeStartProcess() {
        if (!this.currentImage && !(!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token'))) {
          this.$message.error(this.$t('common.select_tip'))
          return
        }
        if (this.processLoading) {
          return
        }
        this.setCurrentWork()
        this.work.afterImg = null

        if (this.hasFileId) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'process',
            event_info: {
              process_recommend_type: 'cartoonizer',
              recommend_name: 'recommend',
            },
          })
        }

        let prompt = ''
        if (this.workOptions.prompt) {
          const translateRes = await Work.translateText(this.workOptions.prompt)
          prompt = (translateRes.data.data && translateRes.data.data.text) || ''
        }

        this.onStartProcessV2(
          this.workName,
          {
            ...this.workOptions,
            prompt,
            workName: this.workName,
          },
          this.elkParams
        )

        // this.onStartProcess()
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

        //开始处理
        // this.onBeforeStartProcess()
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
      onPreview(work, scale) {
        this.afterImageLoading = true
        this.startTime = Date.now()
        this.previewInfo.thumbnail = work.thumbnail
        const image = new Image()
        image.src = this.previewInfo.thumbnail

        image.onload = async () => {
          this.previewInfo.scale = scale
          this.previewInfo.filename = work.filename
          this.previewInfo.operation = work.operation
          this.previewInfo.w = image.width * scale
          this.previewInfo.h = image.height * scale
          this.rate = 1
          this.showPreview = true
          //S3预览
          work.afterImg = await getPreviewUrl({ transId: work.transId, issrc: 0 })
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
        }
      },
    },
  }
</script>

<style lang="less" scoped>
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

  .icon-s-db-column,
  .icon-s-column {
    font-size: 26 / @base;
    color: #575757;
  }

  .icon-s-db-column.icon_select,
  .icon-s-column.icon_select {
    color: #fff;
  }

  .icon-s-db-column.icon_hover,
  .icon-s-column.icon_hover {
    color: #0374ff;
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
      flex: 0.3;
      width: 100%;
      height: 64 / @base;
      border-bottom: 1px solid #ddd;

      .enhance-workspace-nav-l {
        display: flex;
        flex: 0.3;
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
        flex: 0.7;
        align-items: center;
        justify-content: space-between;
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
    .main-top-l {
      display: flex;
      align-items: center;

      .scale-btns {
        display: flex;
        align-items: center;
        justify-content: center;

        .scale-btn {
          width: 100 / @base;

          /deep/ .el-input__inner {
            height: 38 / @base;
            line-height: 38 / @base;
          }
        }
      }
    }

    .preview-type,
    .btns {
      display: flex;
      align-items: center;
    }

    .preview-type {
      .icons {
        padding: 5 / @base;
        background-color: #ededed;
      }

      .active {
        background-color: #0374ff;
      }

      .l_icons {
        display: flex;
        align-items: center;
        height: 38 / @base;
        border-radius: 3 / @base 0 0 3 / @base;
      }

      .r_icons {
        display: flex;
        align-items: center;
        height: 38 / @base;
        border-radius: 0 3 / @base 3 / @base 0;
      }
    }

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
          position: fixed;
          top: 80px;
          left: 50px;
          z-index: 10;
          display: none;
          height: 36px;
          padding: 0 12px;
          line-height: 36px;
          background: #f2f2f2;
          border: 1px solid #ff9d1d;
          border-radius: 50px;
          opacity: 1;

          &::before {
            position: absolute;
            top: 12px;
            left: -5px;
            width: 0;
            height: 0;
            content: '';
            border-top: 5px solid transparent;
            border-right: 5px solid #ff9d1d;
            border-bottom: 5px solid transparent;
          }
        }

        .l-list {
          flex: 1;
          padding: 2 / @base 20 / @base;
          margin: 20 / @base 0;

          .l-list-item {
            position: relative;
            width: 96 / @base;
            height: 96 / @base;
            margin-bottom: 10 / @base;
            cursor: pointer;

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
          justify-content: space-between;
          height: 62px;
          padding: 0 20px;

          .preview-type,
          .btns {
            display: flex;
            align-items: center;
          }

          .preview-type {
            .icons {
              padding: 5 / @base;
              background-color: #ededed;
            }

            .active {
              background-color: #0374ff;
            }

            .l_icons {
              display: flex;
              align-items: center;
              height: 38 / @base;
              border-radius: 3 / @base 0 0 3 / @base;
            }

            .r_icons {
              display: flex;
              align-items: center;
              height: 38 / @base;
              border-radius: 0 3 / @base 3 / @base 0;
            }
          }

          .btns {
            .upload-btn {
              width: 200 / @base;
            }
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

            .review-half,
            .review-full {
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

              /deep/.single-queue-tip {
                pointer-events: all;
              }

              .queue-upload {
                /deep/.el-upload-dragger {
                  background: none;
                }

                .btn-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  pointer-events: all;

                  .next-btn {
                    height: 44px;
                    padding: 0 16px;
                    margin-top: 32px;
                    line-height: 40px;
                    cursor: pointer;
                    background: #f7f7f7;
                    border: 2px solid #ddd;
                    border-radius: 2px;
                  }
                }
              }

              .target_btn {
                pointer-events: all;
              }

              .review-tag {
                position: absolute;
                top: 28 / @base;
                left: 28 / @base;
                z-index: 9;
                width: 90 / @base;
                height: 27 / @base;
                font-size: 14 / @base;
                line-height: 27 / @base;
                color: #fff;
                text-align: center;
                background-color: #2f2724;
              }

              .no-watermark-tag {
                position: absolute;
                bottom: 35 / @base;
                left: 50%;
                z-index: 9;
                width: 100%;
                height: 40px;
                font-size: 18 / @base;
                font-weight: bold;
                line-height: 40px;
                color: #fff;
                text-align: center;
                background-color: rgba(0, 0, 0, 0.5);
                transform: translate(-50%, 0);

                &.full {
                  bottom: 28 / @base;
                }
              }

              .review-tag-des {
                position: absolute;
                top: 28 / @base;
                z-index: 99;
                display: flex;
                justify-content: space-between;
                width: 100%;
                padding: 0 28 / @base;

                .after-tag {
                  width: 90 / @base;
                  height: 27 / @base;
                  font-size: 14 / @base;
                  line-height: 27 / @base;
                  color: #fff;
                  text-align: center;
                  background-color: #2f2724;
                  border: 1px solid transparent;
                }

                .recommend-upscaler {
                  display: none;
                  background: #fff;
                  border: 1px solid #cecece;
                  border-radius: 3px;
                  box-shadow: 0 20px 40px 0 rgba(0, 0, 0, 0.15);
                }

                .upscaler-tag {
                  height: 36 / @base;
                  padding-right: 20 / @base;
                  font-size: 18px;
                  font-weight: bold;
                  line-height: 36 / @base;
                  color: #4d4d4f;
                }

                .upscaler-item {
                  width: 100%;
                  height: 36 / @base;
                  padding-right: 20 / @base;
                  font-size: 14px;
                  line-height: 36 / @base;
                  color: #4d4d4f;
                  pointer-events: all;
                  cursor: pointer;

                  &:hover {
                    background: #f5f7fa;
                  }
                }

                .upscaler-label {
                  display: inline-block;
                  width: 40 / @base;
                  margin-right: 20 / @base;
                  text-align: right;
                }
              }

              .wide-img {
                width: 100%;
                object-fit: scale-down;
              }

              .long-img {
                width: 100%;
                height: 100%;
                object-fit: scale-down;
              }
            }

            .review-r {
              &:hover {
                .recommend-upscaler {
                  display: block;
                }
              }

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

          .review-center {
            position: relative;
            justify-content: center;

            .review-full {
              width: 100%;
            }

            .ready-process {
              position: absolute;
              bottom: 40 / @base;
              left: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 160 / @base;
              min-height: 50 / @base;
              margin-left: -80px;
              background-color: #fff;
              border-radius: 3 / @base;

              .status {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
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
          justify-content: space-between;
          width: 100%;
          height: 64 / @base;
          padding: 0 20px;

          .feedback-btn {
            position: absolute;
            top: auto;
            right: 20 / @base;
          }

          .bottom-btn {
            position: absolute;
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
            display: flex;
            flex: 1;
            padding: 0 20 / @base 20 / @base;
            // overflow: auto;

            .title {
              margin: 10 / @base 0 10 / @base;
            }
          }

          .tab-footer {
            width: 100%;
          }
        }

        .setting-tab {
          .setting-dashboard {
            margin-top: 10 / @base;
            background-color: #f5f7fa;

            .title {
              margin: 10 / @base 10 / @base 0 10 / @base;
              border-bottom: 1px solid #ddd;
            }
          }

          .ai-group {
            display: flex;
            flex-direction: column;

            .ai-items {
              display: flex;
              flex-wrap: wrap;

              .ai-item {
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 33.33%;
                height: 68px;
                padding: 8 / @base;
                margin-right: 1 / @base;
                background-color: #eaeaea;

                .title {
                  margin: 0;
                  user-select: none;
                }

                &:hover {
                  .title {
                    color: #0374ff;
                  }
                }
              }

              .active {
                background-color: #0374ff;

                .title {
                  color: #fff;
                }

                &:hover {
                  .title {
                    color: #fff;
                  }
                }
              }
            }
          }

          .tab-footer {
            height: 135 / @base;

            .process-setting {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20 / @base;

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

                .icon-s-setting_setting {
                  margin-right: 5px;
                }
              }
            }
          }
        }

        .download-tab {
          .tab-main {
            display: flex;
            flex-direction: column-reverse;
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
            margin-bottom: 10 / @base;

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

    .icons {
      cursor: pointer;

      .icon {
        display: block;
      }

      .icon_hover {
        display: none;
      }

      .icon_select {
        display: none;
      }

      &:hover {
        .icon {
          display: none;
        }

        .icon_hover {
          display: block;
        }

        .icon_select {
          display: none;
        }
      }
    }

    .active {
      .icon {
        display: none;
      }

      .icon_hover {
        display: none;
      }

      .icon_select {
        display: block;
      }

      &:hover {
        .icon {
          display: none;
        }

        .icon_hover {
          display: none;
        }

        .icon_select {
          display: block;
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
  }

  .config-box {
    padding: 10px 5px;
    margin-top: 10px;
    background: #f7f7f7;
  }

  .portrait-options {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;

    .portrait-option {
      position: relative;
      width: 100px;
      height: 100px;
      margin-right: 5px;
      margin-bottom: 5px;
      cursor: pointer;
      box-shadow: 0 0 0 1px #e8eaed;

      img {
        z-index: 0;
      }

      .icon {
        position: absolute;
        top: 0;
        left: 0;
        display: none;
      }

      &:hover {
        box-shadow: 0 0 0 2px #3887fe;
      }
    }

    & > :nth-child(3n) {
      margin-right: 0;
      margin-bottom: 0;
    }

    .portrait-option-active {
      box-shadow: 0 0 0 2px #3887fe;

      .icon {
        display: block;
      }
    }
  }

  .slider-label {
    font-size: 14px;
    color: #717e8f;
  }

  .slider-num {
    font-size: 14px;
    color: #717e8f;
  }

  .workflow-slider {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-slider {
    width: 100%;
    padding: 0 10px;
  }

  .img-list-box {
    .img-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      .sample-img-cont {
        margin-top: 8px;
        border: 1px dashed #3699ff;
      }
    }
  }
  @media (max-width: 1024px) {
    .main-top {
      flex-direction: column;
      justify-content: center;
      height: auto !important;

      .main-top-l {
        margin-top: 10 / @base;
      }

      .btns {
        margin: 10 / @base 0;
      }
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

  .el-radio__inner::after {
    width: 8px;
    height: 8px;
    background-color: #409eff;
  }

  .el-radio__input.is-checked .el-radio__inner {
    background: #fff;
  }

  .el-slider__button {
    width: 10px;
    height: 10px;
    background-color: #3887fe;
  }

  .win-free-download {
    .credits-size {
      font-size: 14px;
      font-weight: normal;
      color: #9a9999;
      text-align: center;
    }

    .block {
      display: block;
      display: flex;
      align-items: center;
      height: 60px;
      padding: 6px 10px 6px 0;
      margin-bottom: 15px;
      font-size: 16px;
      line-height: 48px;
      color: #351e01;

      &.minor-small-button {
        line-height: 25px;
      }

      i {
        flex: 0 0 30px;
        width: 30px;
        padding-left: 12px;
        color: #000;
      }

      .text {
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        font-weight: normal;

        .size {
          font-size: 14px;
          font-weight: 400;
          text-align: center;
        }

        .download-text {
          font-weight: bold;
        }

        .hd-text {
          line-height: 24px;
        }

        .desktop-text {
          font-weight: bold;
          line-height: 24px;
        }
      }
    }
  }
</style>
