<template>
  <div class="enhance-workspace workspace-drag-ctr" :class="[isDialog && 'fixed-dialog']">
    <div class="enhance-workspace-nav" v-if="isDialog">
      <div class="enhance-workspace-nav-l">
        <h1 class="workspace_tit pad-space">
          {{ $t(`common.common_solution_5`) }}
        </h1>
      </div>
      <div class="enhance-workspace-nav-c">
        <div class="main-top-l">
          <div class="preview-type">
            <div
              class="icons l_icons"
              :class="[previewType === 'dbcolumn' && 'active']"
              @click="previewType = 'dbcolumn'"
            >
              <i class="icon iconfont-single icon-s-db-column"></i>
              <i class="icon_hover iconfont-single icon-s-db-column"></i>
              <i class="icon_active iconfont-single icon-s-db-column"></i>
            </div>
            <div
              class="icons r_icons"
              :class="[previewType === 'column' && 'active']"
              @click="previewType = 'column'"
            >
              <i class="icon iconfont-single icon-s-column"></i>
              <i class="icon_hover iconfont-single icon-s-column"></i>
              <i class="icon_active iconfont-single icon-s-column"></i>
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
          <div @click="onUploadClick('workdesk_top')">
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

          <!-- <free-download-a
            class="batch-btn"
            label="single_workspace"
            event-label="source_workspace"
            workspace-type="single"
            :need-elk="true"
            size="small"
            type="primary"
          /> -->
        </div>
      </div>
      <div class="enhance-workspace-nav-r">
        <div class="close" @click="onClose">
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
              >
                <i class="icon iconfont-single icon-s-db-column"></i>
                <i class="icon_hover iconfont-single icon-s-db-column"></i>
                <i class="icon_active iconfont-single icon-s-db-column"></i>
              </div>
              <div
                class="icons r_icons"
                :class="[previewType === 'column' && 'active']"
                @click="previewType = 'column'"
              >
                <i class="icon iconfont-single icon-s-column"></i>
                <i class="icon_hover iconfont-single icon-s-column"></i>
                <i class="icon_active iconfont-single icon-s-column"></i>
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
            <div @click="onUploadClick('workdesk_top')">
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
            <a v-else class="batch-btn btn-main" :href="workspaceLink">
              {{ $t('workspace.batch_process') }}
            </a>
            <!-- <free-download-a
              class="batch-btn"
              label="single_workspace"
              event-label="source_workspace"
              workspace-type="single"
              :need-elk="true"
              size="small"
              type="primary"
            /> -->
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
                >
                  <span>
                    <i class="el-icon-crop"></i>
                    {{ $t('common.crop') }}
                  </span>
                </div>
                <div
                  class="review-bg"
                  :style="{
                    opacity: beforeImageLoading ? 0 : 1,
                    transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                  }"
                  :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                >
                  <img
                    @load="beforeImageLoading = false"
                    :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                    :src="currentImage.originImg"
                  />
                </div>
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
                  <p class="review-tag quicksand-blod">{{ $t('common.remove_28') }}</p>
                  <div
                    class="review-bg"
                    :style="{
                      opacity: afterImageLoading ? 0 : 1,
                      transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                    }"
                    :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                  >
                    <img
                      @load="afterImageLoad"
                      ref="preview"
                      :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                      :src="work.afterImg == 'null' ? '' : work.afterImg"
                    />
                  </div>
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
                        :source="`colorize-photo`"
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
                v-loading="work.afterImg && afterImageLoading"
              >
                <!-- 图片裁剪 -->
                <div
                  class="image-crop-btn target_btn"
                  v-show="cropBtnType2"
                  @click="cropFun"
                  @mouseenter="imageEnterFun"
                >
                  <span>
                    <i class="el-icon-crop"></i>
                    {{ $t('common.crop') }}
                  </span>
                </div>
                <div
                  class="review-bg"
                  :style="{
                    transform: `scale(${rate}) translate(${offset.x}px, ${offset.y}px)`,
                  }"
                  :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                >
                  <img
                    ref="preview"
                    @load="afterImageLoading = false"
                    :class="[currentImage.w <= currentImage.h ? 'long-img' : 'wide-img']"
                    :src="work.afterImg ? work.afterImg : currentImage.originImg"
                  />
                </div>
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
          <div class="upload-box" v-else @click="onUploadClick('banner')">
            <file-upload
              ref="fileUpload"
              class="uploaded"
              :multiple="false"
              :upload-list="uploadList"
              :disabled="requestTransform"
              @onUpload="onUpload"
            />
            <div class="sample-list">
              <p v-if="sampleList && sampleList.length" class="sample-tip quicksand-bold">
                {{ $t('workspace.sample_image_tip') }}
              </p>
              <grid-list class="grid-list" v-slot:default="{ item }" :list="sampleList" :disable-all="false">
                <span class="checkbox-box" :class="[item.selected && 'checkbox-box-selected']">
                  <i v-show="item.selected" class="icon_input_checked"></i>
                </span>
                <img class="sample-img" :src="item.thumbnail" alt="" width="79" height="79" />
              </grid-list>
            </div>
          </div>
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
            <div class="btn-sub" @click="feedBackDialog">
              {{ $t('common.feed_back_btn') }}
            </div>
          </div>
        </div>
        <!-- <div class="main-bottom" v-else>
          <traffic-banner
            v-if="leadStrokeVisible && leadStrokeVisible() && !uploadList.length"
            class="traffic-banner-upload"
            :width="`100%`"
            :content-width="`750px`"
            :btn-w="218"
            :btn-h="44"
            :icon-size="62"
            :padding="`25px 10px`"
            :type="`upload`"
            track="/downloading/?label=workspace"
          />
        </div> -->
      </div>
      <template #r>
        <div v-show="isDownload" class="tab download-tab">
          <div class="tab-nav nav-left">
            <div class="tab-nav-btn" :class="[disabledBack && 'hide']" @click="onSwitchTab('back')">
              <i class="arrow"></i>
              <span>{{ $t('workspace.back') }}</span>
            </div>
          </div>
          <div class="tab-main">
            <div>
              <thumbnail-preview
                v-if="showPreview"
                :preview-info="previewInfo"
                :preview-size="previewSize"
                :rate="rate"
                :maxw="maxw"
                :offset="offset"
                @onDrag="onThumbnailPreviewDrag"
              />
              <!-- <traffic-banner
                v-if="leadStrokeVisible && leadStrokeVisible()"
                class="traffic-banner-preview"
                :width="`100%`"
                :btn-w="208"
                :btn-h="44"
                :icon-size="72"
                :padding="`25px`"
                :type="`preview`"
                track="?source=workspace&type=single&medium=banner&date=20221123&time=preview"
              /> -->
            </div>

            <div class="fa-box-height">
              <div class="skeleton-screen" v-if="!processed">
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
                        <a :href="pricingLink" class="credits-tip">
                          {{ $t('workspace.credits_preview_get') }}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="tc download-btn btn-box-w" v-if="isWatermarkPlanB">
                  <div class="primary-none-button" v-loading="downloadLoading" @click="onDownloadBefore">
                    <!-- <i class="iconfont-single icon-s-download2"></i> -->
                    <span>{{
                      $getCookie('userType') !== 'paying'
                        ? $t('workspace.download_watermark_free')
                        : $t('workspace.upload_13')
                    }}</span>
                    <div class="credits-size">
                      <span :class="{ 'v-hide': !processed }">
                        1{{ $t('workspace.credits_preview_m_Credits') }}
                      </span>
                      <span v-if="processed">
                        | {{ $t('workspace.text_32') }}{{ sizeFun(work.filesize) }}</span
                      >
                    </div>
                  </div>
                  <drives
                    v-if="false"
                    :trans-ids="selectedList"
                    :drop-box-redirect-url="dropBoxRedirectUrl"
                  />
                </div>

                <div class="tc download-btn btn-box-w" v-else>
                  <div
                    class="primary-small-button block"
                    v-loading="downloadFlag && downloadLoading"
                    @click="onDownloadBefore"
                  >
                    <!-- <i class="iconfont-single icon-s-download2"></i> -->
                    {{ $t('workspace.upload_13') }}
                  </div>
                  <drives
                    v-if="false"
                    :trans-ids="selectedList"
                    :drop-box-redirect-url="dropBoxRedirectUrl"
                  />
                </div>
                <div class="f-14 tc cA2A mag-ve-20" v-if="!isWatermarkPlanB">
                  <span :class="{ 'v-hide': !processed }">
                    1{{ $t('workspace.credits_preview_m_Credits') }}
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
          <div class="tab-nav nav-right">
            <div class="tab-nav-btn" :class="[!processed && 'disabled']" @click="onSwitchTab('download')">
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
          <div class="tab-main scroll-bar">
            <div v-for="(item, i) in workSettingData" class="ai" :key="i">
              <p class="title">
                {{ item.title }}
              </p>
              <div class="ai-group" v-if="Array.isArray(item.ai)">
                <div class="ai-items">
                  <div
                    class="ai-item icons"
                    v-for="(item2, ii) in item.ai"
                    :key="ii"
                    @click="onAIClick(item2, item)"
                    :class="[activeName === item2.activeName && 'active']"
                  >
                    <div class="icons">
                      <i :class="['icon iconfont-single', item2.icon]"></i>
                      <i :class="['icon_hover iconfont-single', item2.icon]"></i>
                      <i
                        :class="[
                          'icon_active iconfont-single',
                          item2.iconSelect ? item2.iconSelect : item2.icon,
                        ]"
                      ></i>
                    </div>
                    <p class="title">{{ item2.title }}</p>
                  </div>
                </div>
                <div class="setting-dashboard">
                  <p
                    class="title"
                    :class="[item.hideWorkConfig || (hideWorkConfig && 'none-border')]"
                    v-if="descript"
                  >
                    {{ descript }}
                  </p>
                  <workflow-operations
                    v-show="!item.hideWorkConfig && !hideWorkConfig"
                    class="work-setting"
                    :work="item.onlyJob ? item.job : item.work.name"
                    :config="item.work.config"
                    @changeCustomParams="changeCustomParams"
                    @changeModuleFun="changeModuleFun"
                    @hideWorkConfig="onHideWorkConfig"
                  />
                </div>
              </div>
              <div class="ai-group" v-else @click="onAIClick(item.ai, item)">
                <workflow-operations
                  v-show="!hideWorkConfig"
                  ref="workflowOperations"
                  :work="item.work.name"
                  :config="item.work.config"
                  @changeCustomParams="changeCustomParams"
                  @changeModuleFun="changeModuleFun"
                  @hideWorkConfig="onHideWorkConfig"
                />
              </div>
            </div>
          </div>
          <div class="tab-footer">
            <div class="process-setting">
              <button
                class="start-process-btn btn-main"
                :class="[processedLock && 'disabled-btn']"
                v-loading="processLoading || waitTimes > 0"
                :disabled="processedLock"
                @click="checkUploadThenStart(true)"
                v-track-label="'workspace_process'"
              >
                {{ $t('workspace.config_7') }}
              </button>
              <div class="pic_out_setting">
                <div class="pic_out_setting_cont" v-if="outSettingVisible">
                  <out-setting
                    @confirm="confirmOutSet"
                    @close="closeOutSetDialog"
                    :config="outSettingConfig"
                  />
                </div>
                <button class="pic_out_btn" @click="onOutSettingsDialog">
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
            <div class="btn-main cancel btn mag-t-30" @click="btnFileWinFun(false)">
              {{ $t('workspace.workflow_btn_cancel') }}
            </div>

            <div class="flex1"></div>
            <div class="btn-main btn mag-t-30 mag-l-20" @click="btnFileWinFun(true)">
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
            <div class="btn-main btn mag-t-30" @click="closePointWin">
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
      :is-paied="isPaied"
      :is-process="isProcess"
      :user-level="userInfo.level"
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
        <div class="btn-main btn" @click="guideWin = false">
          {{ $t('common.get_it') }}
        </div>
      </div>
    </my-dialog>
    <fabulous v-if="fabulousWin" :fabulous-win.sync="fabulousWin" :current-work="work" />
    <custom-dialog
      v-if="editorEditor"
      class="editor-dialog"
      :visible.sync="editorEditor"
      :show-header="false"
      :show-footer="false"
      :width="'calc(100vw - 80px)'"
      :is-set-width="true"
    >
      <bg-remover-image-editor-dialog :image-params="editorImageParams" :ai-image-params="aiImagePrams" />
    </custom-dialog>
    <custom-dialog class="offline-dialog" :visible.sync="editTipVisible" @close="editTipVisible = false">
      <template #title>
        <p class="dialog-title">{{ $t('workspace.manual_tip_title') }}</p>
      </template>
      <div class="offline-content">
        <p class="offline-text" v-html="$t('workspace.edit_tip_desc')"></p>
        <label class="offline-label">
          <el-checkbox v-model="dontShowAgain" @change="dontShowAgainChange" />
          {{ $t('workspace.offline_processing_not_again') }}
        </label>
      </div>
      <template #footer>
        <div class="offline-dialog-footer">
          <div class="offline-dialog-row-btns">
            <button @click="cancelEditTip" class="btn cancal-btn">
              {{ $t('workspace.offline_newfeature_cancel') }}
            </button>
            <button @click="confirmEditTip" class="btn confirm-btn">
              {{ $t('workspace.help_tips_5') }}
            </button>
          </div>
        </div>
      </template>
    </custom-dialog>
    <recommend-app-dialog
      v-if="recommendAppVisible"
      :visible.sync="recommendAppVisible"
      :title="$t('workspace.recommend_download_batch')"
      track="?source=single&type=table&date=0706"
    />
    <recommend-download-dialog
      v-if="recommendDownloadVisible"
      :visible.sync="recommendDownloadVisible"
      track="?source=single&type=restore&date=20230601"
      type="restore"
    />
    <!-- 图片裁剪 -->
    <ImageCrop :width="'calc(100vw - 80px)'" :visible="editorEditorCrop">
      <ImageCropEdit
        v-if="editorEditorCrop && currentImage.file"
        :current-image="currentImage"
        @updateEditorCropVisible="updateEditorCropVisible"
        @cropImgSrc="cropImgSrc"
      />
    </ImageCrop>
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
          :drop-box-redirect-url="dropBoxRedirectUrl"
          @onSave="handleDriveSave"
        />
        <div class="download_btn minor-small-button" @click="continueDownload">
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
  import ThumbnailPreview from '@/components/WorkSpace/ThumbnailPreview'
  import EnhanceWorkspaceStream from '@/stream/EnhanceWorkspaceStream'
  import FileUpload from '@/components/FileUpload'
  // import DesktopDownloadTip from '@/components/WorkSpace/DesktopDownloadTip'
  import WorkflowOperations from '@/components/MyAccount/WorkflowOperations'
  import OutSetting from '@/components/WorkSpace/OutSetting'
  import ThumbUp from '@/components/matting/ThumbUp'
  import Dialog from '@/components/giveaway/Dialog'
  import CustomDialog from '@/components/CustomDialog'
  import DownloadLoading from '@/components/loading/Loading'
  import Fabulous from '@/components/Fabulous'
  import MyDialog from '@/components/matting/MyDialog'
  import RegisterAndSubscribeDialog from '@/components/RegisterAndSubscribeDialog'
  import FreeProcessTimesDialog from '@/components/FreeProcessTimesDialog'
  import BgRemoverImageEditorDialog from '@/components/BgRemoverImageEditorDialog'
  import GridList from '@/components/WorkSpace/GridList'
  // import FreeDownloadA from '@/components/common/FreeDownloadA.vue'
  //mixins
  import WorkflowOperationsMixins from '@/mixins/WorkflowOperationsMixins'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import UploadImgMixins from '@/mixins/components/UploadImgMixins'
  import OutSettingMixins from '@/mixins/components/OutSettingMixins'
  import ProcessMixins from '@/mixins/components/ProcessMixins'
  import ELKMixins from '@/mixins/ELKMixins'
  import imageEditCrop from '@/mixins/imageEditCrop'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  //js
  import { WorkFlowConfig, WorkFlowType } from '@/static/script/workflow_util'
  import Work from '@/static/script/work.js'
  import { emailStr } from '@/static/script/rules.js'
  import servers from '@/static/config/common/server.config'
  import { readLocalStorageDict, closeWorkspaceDialog } from '@/static/script/utils'
  // import TrafficBanner from '@/components/TrafficBanner'
  import SingleQueueTip from '@/components/WorkSpace/SingleQueueTip.vue'
  import HistoryStatus from '@/components/HistoryStatus'
  import Drives from '@/components/Drives.vue'
  import RecommendDownloadDialog from '@/components/RecommendDownloadDialog.vue'
  import RecommendAppDialog from '@/components/RecommendAppDialog.vue'
  import { getPreviewUrl } from '@/static/plugin/awsS3'

  export default {
    name: 'ColorizePhotoWorkspace',
    components: {
      RecommendDownloadDialog,
      Drives,
      SingleQueueTip,
      HistoryStatus,
      // TrafficBanner,
      ThreeColumnsLayouts,
      ListLayouts,
      FileUpload,
      WorkflowOperations,
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
      BgRemoverImageEditorDialog,
      GridList,
      // FreeDownloadA,
      RecommendAppDialog,
    },
    mixins: [
      UserInfoMixins,
      UploadImgMixins,
      WorkflowOperationsMixins,
      OutSettingMixins,
      ProcessMixins,
      ELKMixins,
      imageEditCrop,
      DropBoxCallbackOfPageMixins,
    ],
    inject: ['leadStrokeVisible'],
    props: {
      sampleImageData: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        queueImprove: true,
        isWatermarkPlanB: true,
        isComparedImgLoaded: false,
        processeds: [],
        total: 0,
        uploadList: [],
        sampleList: [],
        currentResult: null,
        activeName: '1',
        currentWork: {
          elkJob: '',
          activeName: '',
          name: '',
          config: null,
        },
        defaultFlows: [
          {
            name: WorkFlowType.colorize,
            config: WorkFlowConfig(WorkFlowType.colorize),
          },
        ],
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
        whellReduce: 0,
        uploadName: 'banner',
        beforeImageLoading: false,
        afterImageLoading: false,
        disabledBack: false,
        startTime: 0,
        previewType: 'dbcolumn',
        editorEditor: false,
        editorImageParams: {
          targetImg: '',
          filename: '',
          w: '',
          h: '',
          type: '',
        },
        aiImagePrams: {
          image: '',
          filename: '',
          w: '',
          h: '',
          type: '',
          operater: '',
          transId: '',
        },
        showDontshowAgain: true,
        dontShowAgain: false,
        editTipVisible: false,
        sampType: 'colorize',
        hideWorkConfig: false,
        showDownloadAppTip: false,
        recommendAppVisible: false,
        clickStartTime: 0, // 点击开始处理按钮的时间戳
        uploading: false, // 提前上传图片正在处理
        lastUploadTime: 0, // 最后上传图片的时间戳
        waitTimes: 0, // 点击开始处理等待15秒图片提前上传
        prepareUid: null, // 图片提前上传成功后对应的uid

        //父应用传过来的
        dropBoxRedirectUrlProp: '',
        workspaceUrl: 'colorize-photo',
        isDialog: true,
        selModel: '',
        fileList: [],
        workType: 'enlarge',
        needRecommendFeatures: false,
        pageUrl: '',
        popWin: false,
        orderMenu: '',
        allSampleList: {},
      }
    },
    computed: {
      showFreeUserProcessHint() {
        return (
          this.$getCookie('userType') !== 'paying' &&
          this.$getCookie('token') &&
          this.currentImage &&
          !this.processLoading &&
          !this.processed
        )
      },
      curUserType() {
        return this.$getCookie('userType')
      },
      pricingLink() {
        return (
          this.$store.state.mainWebsite +
          this.$store.state.specialLocaleLink +
          '/pricing/?source=bgremover&medium=get_credits'
        )
      },
      workspaceLink() {
        return this.linkDomain + this.$store.state.ll + `/workspace?source=workdesk&type=colorize-photo`
      },
      linkDomain() {
        return this.$store.state.website !== 'vanceai.com' ? 'https://vanceai.com' : ''
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
        return [WorkFlowType.colorize]
      },
      currentImage() {
        if (this.uploadList.length) {
          return this.uploadList[0]
        } else {
          return null
        }
      },
      workSettingData() {
        return [
          {
            title: this.$t('workspace.coloring_types'),
            work: this.currentWork,
            reverseSynchronize: false,
            hideWorkConfig: true,
            ai: [
              {
                activeName: '1',
                onlyJob: true,
                icon: 'icon-s-retouch',
                title: this.$t('workspace.human'),
                descript: this.$t('workspace.human_desc'),
                job: WorkFlowType.colorize,
                elkJob: WorkFlowType.colorize,
              },
              {
                activeName: '2',
                onlyJob: true,
                icon: 'icon-s-landscape',
                title: this.$t('workspace.landspace'),
                descript: this.$t('workspace.landspace_desc'),
                job: WorkFlowType.colorize,
                elkJob: WorkFlowType.colorize,
              },
            ],
          },
        ]
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
            const uploadImgData = await this.uploadImg(this.work)
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
    mounted() {
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

      this.initSampleList()
      this.onAIClick(
        this.workSettingData[0].ai.filter((item) => item.activeName === this.activeName)[0],
        this.workSettingData[0]
      )
      this.defaultFlows = [
        {
          name: this.workType,
          config: WorkFlowConfig(this.workType),
        },
      ]
      this.setTime('start', 'start')
      this.descript = this.$t('workspace.cutout_human_descript')
      this.getProcesseds()
      if (this.fileList && this.fileList.length) {
        this.uploadList = [this.fileList[this.fileList.length - 1]]
        setTimeout(() => {
          this.firstVisit()
        }, 1000)
      }
      this.getDontShowAgain()
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
      lockWinFun(req) {
        if (req && this.uploadList.length) {
          document.getElementsByTagName('body')[0].style.overflow = 'hidden'
        } else {
          document.getElementsByTagName('body')[0].style.overflow = 'auto'
        }
      },
      afterImageLoad() {
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
          `${this.$store.state.ll}/soft-downloading/?source=single&type=colorize-photo&date=20230322`,
          '_blank'
        )
      },
      setAppDownloadTipClose() {
        this.$setCookie('cloud_close_app_d_t', 1, 2)
      },
      onHideWorkConfig(val) {
        this.hideWorkConfig = val
      },
      emptyAllSampleList() {
        const res = {}
        for (let i = 0; i < Work.workTypes.length; i++) {
          res[Work.workTypes[i]] = []
        }
        return res
      },
      initSampleList() {
        this.allSampleList = this.emptyAllSampleList()
        for (let i = 0; i < Work.workTypes.length; i++) {
          const workType = Work.workTypes[i]
          this.allSampleList[workType] = []
          if (this.sampleImageData[workType]) {
            for (let j = 0; j < this.sampleImageData[workType].length; j++) {
              const sample = this.sampleImageData[workType][j]
              this.allSampleList[workType].push({
                uid: parseInt(j) + 1,
                filename: sample.name,
                filesize: '',
                thumbnail: servers.cloudS3BucketPath + 'web/assets/images' + sample.thumbnail,
                w: sample.w,
                h: sample.h,
                zoomW: sample.w,
                zoomH: sample.h,
                status: 'ready',
                //
                selected: false,
                sample: true,
                //
                originImg: servers.cloudS3BucketPath + 'web/assets/images' + sample.original,
                targetImg: servers.cloudS3BucketPath + 'web/assets/images' + sample.processed,
                // only for matting zoom
                fileId: '',
                zoomId: '',
                zoomFileId: '',
                zoomTargetImg: servers.cloudS3BucketPath + 'web/assets/images' + sample.processed,
              })
            }
          }
        }
        this.sampleList = this.allSampleList[this.sampType] || []
      },
      cancelEditTip() {
        this.$setCookie('cloud_removeBgWorksapceImageEditorDontshowagain', '0', 1)
        this.showDontshowAgain = true
        this.editTipVisible = false
      },
      async confirmEditTip() {
        this.editTipVisible = false
        const url = await this.onDownloadBefore(false)
        if (url) {
          this.work.downloadImg = url
          this.onEditor()
        }
      },
      getDontShowAgain() {
        const dontShowAgain = this.$getCookie('cloud_removeBgWorksapceImageEditorDontshowagain')
        if (dontShowAgain && dontShowAgain === '1') {
          this.showDontshowAgain = false
        } else {
          this.showDontshowAgain = true
        }
      },
      dontShowAgainChange(val) {
        if (val) {
          this.$setCookie('cloud_removeBgWorksapceImageEditorDontshowagain', '1', 1)
          this.showDontshowAgain = false
        } else {
          this.$setCookie('cloud_removeBgWorksapceImageEditorDontshowagain', '0', 1)
          this.showDontshowAgain = true
        }
      },
      async onEditorBefore() {
        this.clickImageEditorBtnELK()
        console.log('onEditorBefore')
        if (this.showDontshowAgain) {
          this.editTipVisible = true
        } else {
          const url = await this.onDownloadBefore(false)
          if (url) {
            this.work.downloadImg = url
            this.onEditor()
          }
        }
      },
      onEditor() {
        const img = new Image()
        img.src = this.work.originImg
        this.editorImageParams = {
          imageurl: this.work.originImg,
          image: null,
          filename: this.work.filename,
          w: this.work.w,
          h: this.work.h,
          type: this.work.filename.substr(this.work.filename.lastIndexOf('.') + 1),
        }
        img.crossOrigin || img.setAttribute('crossOrigin', 'anonymous')
        img.onload = () => {
          this.editorImageParams.image = img
        }
        const aiimg = new Image()
        aiimg.src = this.work.downloadImg
        this.aiImagePrams = {
          imageurl: this.work.downloadImg,
          image: null,
          filename: this.work.filename,
          transId: this.work.transId,
          operater: this.work.operater,
          w: this.work.w,
          h: this.work.h,
          type: 'png',
        }
        aiimg.crossOrigin || aiimg.setAttribute('crossOrigin', 'anonymous')
        aiimg.onload = () => {
          this.aiImagePrams.image = aiimg
        }
        this.editorEditor = true
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
      async getUserType() {
        if (this.isPaied) {
          return await Work.license().then((res) => {
            res = res.data
            if (res.code == 200) {
              if (res.data.pid === '654199') {
                return 'onetime'
              } else {
                return 'subscribe'
              }
            }
          })
        } else {
          return this.$store.state.userlevel
        }
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
        const filters = this.sampleList.filter((item) => item.selected)
        const curr = this.currentImage || (filters.length && filters[0])
        this.work = {
          ...curr,
          ...this.currentWork,
          params: JSON.parse(JSON.stringify([{ ...this.currentWork, disabledPreprocessing: true }])),
        }
      },
      onBeforeStartProcess() {
        console.log('onBeforeStartProcess')
        const filters = this.sampleList.filter((item) => item.selected)
        if (
          !this.currentImage &&
          filters.length === 0 &&
          !(!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token'))
        ) {
          this.$message.error(this.$t('common.select_tip'))
          return
        }
        if (this.processLoading) {
          return
        }
        this.setCurrentWork()
        this.onStartProcess()
      },
      async getProcesseds() {
        if (this.$getCookie('token')) {
          const { processeds, total } = await lastValueFrom(
            EnhanceWorkspaceStream.getProcesseds(1, 50, this.filterJobs.join(','), 1)
          )
          this.processeds = processeds.map((item) => ({
            ...item,
            elkJob: item.operation,
            originImg: 'null',
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
      onAIClick(item, ai) {
        this.activeName = item.activeName
        if (ai.reverseSynchronize) {
          Object.assign(ai.work, { ...this.defaultFlows[0] })
        } else {
          ai.work.activeName = item.activeName
          ai.work.elkJob = item.elkJob
          ai.work.name = item.job
          ai.work.config = WorkFlowConfig(item.defaultConfig ? item.defaultConfig : item.job)
        }
        this.descript = item.descript
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
      async onPreview(work) {
        if (work.sample) {
          // MyUploadDialog.initSampleList 设置的 targetImg 可能不再试用，
          // 因为选择的 operation 变化后 targetImg 需要作相应的变化
          if (Object.keys(this.allSampleList).length > 0) {
            const samples = this.allSampleList[work.operation]
            if (samples && samples.length >= work.uid) {
              work.targetImg = samples[parseInt(work.uid) - 1].targetImg
            }
          }

          let scale = 1
          if (work && work.config && work.config.scale) {
            scale = work.config.scale
          }
          this.previewInfo.thumbnail = work.afterImg
          this.previewInfo.scale = scale
          this.previewInfo.filename = work.filename
          this.previewInfo.operation = work.operation
          this.previewInfo.w = work.w * scale
          this.previewInfo.h = work.h * scale
          this.rate = 1
          this.showPreview = true
          return
        }
        this.afterImageLoading = true
        this.startTime = Date.now()
        this.previewInfo.thumbnail = work.thumbnail
        let scale = 1
        if (work && work.config && work.config.scale) {
          scale = work.config.scale
        }
        this.previewInfo.scale = scale
        this.previewInfo.filename = work.filename
        this.previewInfo.operation = work.operation
        this.previewInfo.w = work.w * scale
        this.previewInfo.h = work.h * scale
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
      },
    },
    head() {
      const imageList = [
        this.$imgPath('/sample/colorize/thumbnail/1.jpg'),
        this.$imgPath('/sample/colorize/thumbnail/2.jpg'),
        this.$imgPath('/sample/colorize/thumbnail/3.jpg'),
        this.$imgPath('/sample/colorize/thumbnail/4.jpg'),
        this.$imgPath('/sample/colorize/thumbnail/5.jpg'),
        this.$imgPath('/sample/colorize/thumbnail/6.jpg'),
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

  .icon-s-db-column.icon_active,
  .icon-s-column.icon_active {
    color: #fff;
  }

  .icon-s-db-column.icon_hover,
  .icon-s-column.icon_hover {
    color: #0374ff;
  }

  .icon-s-retouch {
    font-size: 22 / @base;
    font-weight: 700;
  }

  .icon-s-landscape {
    font-size: 19 / @base;
    font-weight: 700;
  }

  .icon-s-retouch.icon_active,
  .icon-s-landscape.icon_active {
    color: #fff !important;
  }

  .ai-item:hover {
    .icon-s-retouch,
    .icon-s-landscape {
      color: #0374ff;
    }
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

  .editor-dialog {
    z-index: 2000 !important;
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
            width: 96 / @base;
            height: 96 / @base;
            margin-bottom: 10 / @base;
            overflow: hidden;
            cursor: pointer;
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
            position: relative;
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
          .setting-dashboard {
            margin-top: 10 / @base;
            background-color: #f5f7fa;

            .title {
              margin: 10 / @base 10 / @base 0 10 / @base;
              //border-bottom: 1px solid #dddddd;
            }

            .none-border {
              margin: 10 / @base;
              border: none;
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
                min-height: 68px;
                padding: 8 / @base;
                margin-right: 1 / @base;
                background-color: #eaeaea;

                .title {
                  margin: 0;
                  line-height: 1.25;
                  text-align: center;
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

    .enhance-main {
      height: 100%;

      .main-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 62px;
        padding: 0 20px;
      }

      .main-center {
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

          .review-bg {
            background: url('@{assetsImgPath}/common/visiable_bg.png');
          }

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
        justify-content: center;
        width: 100%;
        height: 64 / @base;

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

    .btns {
      .btn-main {
        height: 38 / @base;
        line-height: 38 / @base;
      }

      .upload-btn {
        width: 200 / @base;
      }
    }

    .sample-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .grid-list {
        justify-content: center;
      }

      .disable-tip {
        font-size: 12px;
        color: #9a9999;
      }

      .sample-tip {
        margin: 20 / @base 0 15 / @base 0;
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

      .icon_active {
        display: none;
      }

      &:hover {
        .icon {
          display: none;
        }

        .icon_hover {
          display: block;
        }

        .icon_active {
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

      .icon_active {
        display: block;
      }

      &:hover {
        .icon {
          display: none;
        }

        .icon_hover {
          display: none;
        }

        .icon_active {
          display: block;
        }
      }
    }

    .flip-arrow {
      transform: rotate(180deg);
    }

    .offline-dialog {
      .offline-content {
        padding: 15 / @base;
        margin-bottom: 40 / @base;
        font-size: 16 / @base;
        color: #4d4d4f;

        .offline-text {
          margin: 20 / @base 0;
        }

        .offline-label {
          cursor: pointer;
        }
      }

      .offline-dialog-footer {
        width: 100%;
        padding: 15 / @base;
        background: #f2f4f7;

        .offline-footer-tip {
          margin: 10px 0;
          font-size: 16 / @base;
          color: #4d4d4f;
        }

        .offline-dialog-row-btns {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;

          button {
            margin-left: 20 / @base;
          }
        }

        .offline-dialog-btns {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;

          .confirm-btn.btn {
            min-width: 268px;
            text-align: center;
            border-radius: 3px;
          }

          .no_thanks {
            position: absolute;
            right: 10px;
            font-size: 14 / @base;
            color: #717e8f;
            text-decoration: none;
            cursor: pointer;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    .fa-box-height {
      position: sticky;
      bottom: 0;
      left: auto;
      width: 100%;
      background-color: #fff;
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

  /deep/ .el-loading-mask {
    z-index: 0;
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
