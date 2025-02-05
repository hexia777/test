<template>
  <div
    class="batch-process workspace-drag-ctr"
    :class="{
      'batch-process-dialog': isCurrentPageProcess,
      'batch-exec': !isCurrentPageProcess,
      'dialog-ctr': refType === 'dialog',
    }"
  >
    <div class="con-box" :class="refType === 'dialog' ? 'con-box-dialog' : ''">
      <div class="container">
        <div class="process-container">
          <template v-if="refType === 'dialog'">
            <div class="close icon_cursor" @click="hide">
              <i class="iconfont-single icon-s-exit"></i>
            </div>
            <div class="top">
              <p v-html="$t('workspace.popup_title')"></p>
            </div>
          </template>
          <div class="linear-cont clearfix">
            <div class="tit-box">
              <div class="tit">
                <div class="title-tab">
                  <h2
                    class="title-text"
                    v-for="(item, index) of tabsList"
                    :key="index"
                    :class="index === tabShow ? 'text-active' : ''"
                    @click="onTabChanged(index)"
                    v-track-label="$commonTrackLabel('tab_change_' + index)"
                  >
                    <i
                      :class="[
                        'iconfont-single',
                        index === tabShow || (item.tab === 'processing' && unprocessedWorks.length)
                          ? item.activeIcon
                          : item.icon,
                        item.tab === 'processing' && unprocessedWorks.length && item.carryActiveIcon,
                      ]"
                    ></i>
                    {{ item.title }}
                    <i class="upload-number" v-show="item.successCount">
                      {{ item.successCount }}
                    </i>
                  </h2>
                </div>

                <div class="title-r">
                  <div class="free-download user-info-type" v-if="!$store.state.mobile">
                    <free-download-a
                      label="multiple_workspace"
                      event-label="source_workspace"
                      workspace-type="multiple"
                      :need-elk="true"
                      size="small"
                      type="primary"
                    />
                  </div>

                  <ul class="user-info">
                    <li class="user-item" v-if="!isPaied">
                      <span
                        class="title"
                        v-show="userPid !== 654199 && userPid !== 682484"
                        v-html="$t('common.upload_2') + ':'"
                      ></span>
                      <span class="block-placeholder" v-show="pointLoading">
                        <i class="icon_my_loading"></i>
                      </span>
                      <span class="my_loding block-placeholder" v-show="!pointLoading">
                        {{ 'Free' }}
                      </span>
                    </li>
                    <li class="user-item">
                      <span class="title" v-html="$t('common.upload_5') + ':'"></span>
                      <span class="block-placeholder-small" v-show="pointLoading">
                        <i class="icon_my_loading"></i>
                      </span>
                      <a
                        class="quicksand-bold my_loding block-placeholder-small credict-top"
                        :href="
                          $store.state.mainWebsite +
                          $store.state.specialLocaleLink +
                          '/pricing/?source=popup&location=credits_top'
                        "
                        v-show="!pointLoading"
                      >
                        {{ $store.state.credits }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="process--body-container">
              <div
                class="left-process-container col-lg-8 col-sm-12 col-xs-12"
                :class="[
                  tabShow === 1 || tabShow === 2 ? 'tab-show' : null,
                  refType === 'dialog' ? null : ' left-process-container-page',
                ]"
              >
                <!-- uploaded-->
                <div class="uploaded-box" v-show="tabShow === 0">
                  <upload-image-list
                    v-show="uploadList.length"
                    :upload-list="uploadList"
                    :is-workflow="isWorkflow"
                    :image-select-limit="$store.state.selectLimit"
                    works-type="uploaded"
                    :is-current-page-process="isCurrentPageProcess"
                    @delUploadList="delUploadList"
                    @onUpload="onUpload"
                    :job-type="jobType"
                    @beforeUpload="beforeUpload"
                  />
                  <div v-show="uploadList.length === 0">
                    <!-- <uploaded class="uploaded" /> -->
                    <file-upload
                      ref="fileUpload"
                      class="uploaded"
                      :upload-list="uploadList"
                      @onUpload="onUpload"
                      :job-type="jobType"
                      @beforeUpload="beforeUpload"
                    />
                    <div class="sample-list" v-show="activeName === 'feature' && defaultFlows.length < 2">
                      <p v-if="sampleList && sampleList.length" class="sample-tip quicksand-bold">
                        {{ $t('workspace.sample_image_tip') }}
                      </p>
                      <grid-list
                        class="grid-list"
                        v-slot:default="{ item }"
                        :list="sampleList"
                        :disable-all="isWorkflow"
                      >
                        <span class="checkbox-box" :class="[item.selected && 'checkbox-box-selected']">
                          <i v-show="item.selected" class="icon_input_checked"></i>
                        </span>
                        <img class="sample-img" :src="item.thumbnail" alt="" width="79" height="79" />
                      </grid-list>
                      <p v-show="isWorkflow" class="disable-tip">
                        {{ $t('workspace.disable_workflow') }}
                      </p>
                    </div>
                  </div>
                </div>
                <!-- processing -->
                <div class="uploaded-box" v-show="tabShow === 1">
                  <works-list
                    class="process-images"
                    :tab-show="tabShow"
                    :works="works"
                    :process-time="process_time"
                    :busy-jobs="busyJobs"
                    :query-queue-params="queryQueueParams"
                    works-type="processing"
                    :deleted-ids="deletedTransIds"
                    @filterWorks="filterWorks"
                    :is-current-page-process="isCurrentPageProcess"
                    :user-info="userInfo"
                    :is-paied="isPaied"
                    @delProcessedWorks="delProcessedWorks"
                    @setIs_queuedFun="setIs_queuedFun"
                  />
                </div>
                <!-- processed -->
                <div class="process-images" v-show="tabShow === 2">
                  <works-list
                    @showNewPreview="showNewPreviewHandle"
                    :works="works"
                    :tab-show="tabShow"
                    works-type="processed"
                    :deleted-ids="deletedTransIds"
                    ref="processed"
                    :is-current-page-process="isCurrentPageProcess"
                    :user-info="userInfo"
                    :is-paied="isPaied"
                    @delProcessedWorks="delProcessedWorks"
                    @downloadImage="downloadImage"
                    :all-sample-list="allSampleList"
                  />
                </div>
              </div>

              <!-- config -->
              <div class="right-process-container col-lg-4 col-sm-12 col-xs-12" v-show="tabShow === 0">
                <div class="img-box">
                  <WorkSpaceImgView ref="WorkSpaceImgView" />
                </div>
                <div class="right-config-box">
                  <div class="config-con scroll-bar">
                    <!-- feature tab workflow -->
                    <div class="workflow-tab-container scroll-bar">
                      <batch-ws-select
                        :default-flows="defaultFlows"
                        :work-options="workOptions"
                        :disable-add-workflow-btn="disableAddWorkflowBtn"
                        @showConfirmHandle="showConfirmHandle"
                        @checkFlow="checkFlow"
                        @dontAddFun="dontAddFun"
                        @showDialogHandle="showDialogHandle"
                        @changeCustomParams="changeCustomParams"
                        @changeModuleFun="changeModuleFun"
                        @showSaveWorkflowDialow="showSaveWorkflowDialow"
                        @selModelFun="selModelFun"
                        @selEnlagerTypeFun="selEnlagerTypeFun"
                      />
                    </div>

                    <!-- start process-->
                    <div class="start-process">
                      <div class="start-process-btns hover">
                        <div class="start-processing">
                          <button
                            class="primary-small-button"
                            v-loading="processLoading"
                            @click="onStartProcess"
                            :disabled="$store.state.batchProcessBtnDisable"
                            v-track-label="$commonTrackLabel('start_process_button')"
                          >
                            {{ $t('workspace.config_7') }}
                          </button>
                          <!-- <button class="primary-small-button off-btn" @click="showStartOfflineBtn">
                            <i class="el-icon-caret-bottom"></i>
                          </button> -->
                        </div>
                        <div class="start-process-offline" v-show="offlineBtnShow" @click="offlineWorkClick">
                          <button
                            class="offline-btn"
                            v-track-label="$commonTrackLabel('offline_process_button')"
                          >
                            {{ $t('workspace.offline_processing_btn') }}
                          </button>
                        </div>
                      </div>
                      <div class="pic_out_setting">
                        <div class="pic_out_setting_cont" v-if="outSettingShow">
                          <out-setting
                            @confirm="confirmOutSet"
                            @close="closeOutSet"
                            :config="outSettingConfig"
                          />
                        </div>
                        <button
                          class="pic_out_btn"
                          @click="outSetShow"
                          v-track-label="$commonTrackLabel('out_setting_button')"
                        >
                          <i class="iconfont-single icon-s-setting"></i
                          >{{ $t('workspace.pic_output_setting_btn') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- onPreview -->
      </div>
    </div>
    <!--  -->
    <confirm-dialog
      :show="showConfirm"
      @confirm="confirmHandle"
      @cancel="showConfirm = false"
      :show-cancel="showConfirmCancelBtn"
      :title-text="showConfirmTitle"
      :cancel-text="showConfirmCancel"
      :yes-text="showConfirmYes"
    />
    <new-preview-dialog
      v-if="showNewPreview && !$store.state.mobile"
      :visible.sync="showNewPreview"
      :is-paied="isPaied"
      :work="workInfo"
      :preview-info="previewInfo"
      :is-watermark-plan-b="isWatermarkPlanB"
      @download="onDownload"
    />
    <mobile-preview-dialog
      v-if="showNewPreview && $store.state.mobile"
      :visible.sync="showNewPreview"
      :work="workInfo"
      :preview-info="previewInfo"
      @download="onDownload"
    />
    <save-workflow-dialog
      v-if="showSaveWorkflowDialog"
      :visible.sync="showSaveWorkflowDialog"
      @saveWorkflow="saveWorkflowHandle"
    />
    <!-- compareDialog -->
    <compare-dialog :visible.sync="showCompareDialog" @close="onHideCompareDialog" />
    <my-dialog :visible.sync="limitDialog" :title="'Note:'" @close="sizeLimitCancel">
      <div class="limit_size_dialog">
        <div class="tip">{{ $t('workspace.repair_limit_dialog_tip') }}</div>
        <div style="margin-top: 15px;">
          <input ref="limit_check" type="checkbox" checked="checked" />
          <label>{{ $t('workspace.repair_limit_dialog_check') }}</label>
        </div>
      </div>
      <div class="dialog-btn-box">
        <div class="btn-sub btn" @click="sizeLimitCancel">
          {{ $t('workspace.repair_limit_dialog_cancel') }}
        </div>
        <div class="primary-small-button btn" @click="sizeLimitContinue">
          {{ $t('workspace.repair_limit_dialog_continue') }}
        </div>
      </div>
    </my-dialog>
    <custom-dialog class="offline-dialog" :visible.sync="offlineVisible" @close="cancelOffline">
      <template #title>
        <p class="dialog-title">{{ $t('workspace.offline_processing_title') }}</p>
      </template>
      <div class="offline-content">
        <p class="offline-text" v-html="$t('workspace.offline_processing_content')"></p>
        <label v-if="isPaied">
          <el-checkbox v-model="dontShowAgain" @change="dontShowAgainChange" />
          {{ $t('workspace.offline_processing_not_again') }}
        </label>
      </div>
      <template #footer v-if="isPaied">
        <div class="offline-dialog-footer">
          <div class="offline-dialog-row-btns">
            <button @click="cancelOffline" class="btn cancal-btn">
              {{ $t('workspace.offline_newfeature_cancel') }}
            </button>
            <button @click="enableOffline" class="btn confirm-btn">
              {{ $t('workspace.offline_newfeature_enable') }}
            </button>
          </div>
        </div>
      </template>
      <template #footer v-else>
        <div class="offline-dialog-footer">
          <p class="offline-footer-tip">
            {{ $t('workspace.offline_processing_tip') }}
          </p>
          <div class="offline-dialog-btns">
            <a class="btn confirm-btn" :href="$t('workspace.offline_processing_upgrade_link_href')">{{
              $t('workspace.offline_processing_upgrade_btn')
            }}</a>
            <span class="no_thanks" @click="offlineVisible = false">{{
              $t('workspace.offline_processing_cancel_btn')
            }}</span>
          </div>
        </div>
      </template>
    </custom-dialog>
    <custom-dialog class="out-set-dialog" :visible.sync="outSetVisible" @close="cancelOutSet">
      <template #footer>
        <div class="offline-dialog-footer">
          <p class="offline-footer-tip">
            {{ $t('workspace.offline_processing_tip') }}
          </p>
          <div class="offline-dialog-btns">
            <a class="btn confirm-btn" :href="$t('workspace.pic_output_confirm_upgrade_link_href')">{{
              $t('workspace.offline_processing_upgrade_btn')
            }}</a>
            <span class="no_thanks" @click="outSetVisible = false">{{
              $t('workspace.offline_processing_cancel_btn')
            }}</span>
          </div>
        </div>
      </template>
    </custom-dialog>
    <downloadLoading v-show="minLoading" />

    <free-process-times-dialog
      v-if="freeTimesVisible"
      :visible.sync="freeTimesVisible"
      @onSubscribe="onSubscribe"
    />

    <register-and-subscribe-dialog
      v-if="registerAndSubscribeVisible"
      :visible.sync="registerAndSubscribeVisible"
      :not-point="notPoint"
      :is-process="isProcess"
      :is-paied="isPaied"
      :token="$store.state.token"
      :work="currentWork"
      @onSubscribe="onSubscribe"
      @onTryAgainDownload="onDownload(currentWork)"
    />
    <recommend-download-dialog
      v-if="recommendDownloadVisible"
      :visible.sync="recommendDownloadVisible"
      track="?source=single&type=enhancer&date=20230601"
      type="multiple"
    />
    <!-- 引导弹窗 -->
    <my-dialog
      :visible.sync="guideWin"
      :txt-center="true"
      :title="$t('common.guide_title')"
      @close="colseGuide"
    >
      <div class="f-14 mag-t-20">{{ $t('common.guide_describe') }}</div>
      <div class="flex guide_box pad-20">
        <div class="flex1 mag-r-10">
          <div class="f-b f-16 quicksand guid_txt">{{ $t('common.guide_step1') }}</div>
          <div class="guide_img mag-t-10">
            <img :src="$imgPath('/common/guide2.jpg')" v-if="guideWin" />
          </div>
        </div>
        <div class="flex1">
          <div class="f-b f-16 quicksand guid_txt">{{ $t('common.guide_step2') }}</div>
          <div class="guide_img mag-t-10">
            <img :src="$imgPath('/common/guide1.jpg')" v-if="guideWin" />
          </div>
        </div>
      </div>
      <div class="tc guide_btn_box mag-b-20">
        <div class="primary-small-button btn" @click="colseGuide">
          {{ $t('common.get_it') }}
        </div>
      </div>
    </my-dialog>
    <offline-worker-uploading-dialog
      v-if="offlineWorkerUploadVisible"
      :visible.sync="offlineWorkerUploadVisible"
      :cancel.sync="breakOfflineWorkUpload"
      :works="offlineWorks"
    />
    <fabulous
      z-index="2000"
      :fabulous-win.sync="fabulousWin"
      v-if="fabulousWin"
      :current-work="currentWork"
    />

    <!-- 上传提示 -->
    <custom-dialog
      :visible.sync="enableUploadPrompt"
      :show-header="false"
      :show-footer="false"
      :show-close="false"
      width="640"
    >
      <template slot="title">
        <span></span>
      </template>
      <upload-prompt @close="enableUploadPrompt = false" :type="jobType" v-if="enableUploadPrompt" />
    </custom-dialog>
  </div>
</template>

<script>
  import Fabulous from '@/components/Fabulous'
  import confirmDialog from '@/components/ConfirmDailog'
  import userLevel from '@/static/json/user_level.js'
  import Work from '@/static/script/work.js'
  import { COUNTRY } from '@/static/config/common/localstorage_constants'
  import {
    readLocalStorageDict,
    getUrlParam,
    setLoginDialogShow,
    closeWorkspaceDialog,
  } from '@/static/script/utils'
  import { WorkFlowConfig, WorkFlowModuleMap, WorkFlowType } from '@/static/script/workflow_util'
  import SaveWorkflowDialog from '@/components/MyAccount/SaveWorkflowDialog'
  import CompareDialog from '@/components/matting/CompareDialog'
  import UploadImageList from '@/components/WorkSpace/UploadImageList'
  import WorksList from '@/components/WorkSpace/WorksList'
  import outSetting from '@/components/WorkSpace/OutSetting'
  import servers from '@/static/config/common/server.config'
  import GridList from '@/components/WorkSpace/GridList'
  import workflow_data from '@/mixins/workflow_data'
  import MobilePreviewDialog from '@/components/preview/MobilePreviewDialog'
  import NewPreviewDialog from '@/components/preview/NewPreviewDialog'
  import MyDialog from '@/components/matting/MyDialog.vue'
  import CustomDialog from '@/components/CustomDialog'
  import FreeDownloadA from '@/components/common/FreeDownloadA.vue'
  import downloadLoading from '@/components/loading/Loading'
  import WorkflowOperationsMixins from '@/mixins/WorkflowOperationsMixins'
  import RegisterAndSubscribeDialog from '@/components/RegisterAndSubscribeDialog'
  import FreeProcessTimesDialog from '@/components/FreeProcessTimesDialog'
  import FileUpload from '@/components/FileUpload'
  import UploadImgMixins from '@/mixins/components/UploadImgMixins'
  import OfflineWorkerUploadingDialog from '@/components/OfflineWorkerUploadingDialog'
  import BatchWsSelect from '@/components/WorkSpace/BatchWsSelect'
  //import IndexedDBMixins from '@/mixins/IndexedDBMixins'
  import UploadPrompt from '@/components/dialog/UploadPrompt'
  import { browserDownload } from '@/static/script/util/imageUtil'
  import { getDownloadUrlFromS3 } from '@/static/plugin/awsS3'

  import { TRANSID_MODAL, TRANS_MPDAL_BTN } from '@/static/config/common/localstorage_constants'
  import { cutoutCityList } from '@/static/json/city_list'

  // components
  import WorkSpaceImgView from '@/components/WorkSpaceImgView'
  // import TrafficBanner from '@/components/TrafficBanner'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import RecommendDownloadDialog from '@/components/RecommendDownloadDialog.vue'
  import WorkConfigurationPreprocessingMixins from '@/mixins/components/WorkConfigurationPreprocessingMixins'

  export default {
    name: 'BatchProcessFile',
    components: {
      RecommendDownloadDialog,
      // TrafficBanner,
      WorkSpaceImgView,
      BatchWsSelect,
      MobilePreviewDialog,
      NewPreviewDialog,
      GridList,
      WorksList,
      FileUpload,
      UploadImageList,
      SaveWorkflowDialog,
      confirmDialog,
      CompareDialog,
      MyDialog,
      CustomDialog,
      downloadLoading,
      // discountLine,
      outSetting,
      // WorkflowAdBanner,
      RegisterAndSubscribeDialog,
      FreeProcessTimesDialog,
      OfflineWorkerUploadingDialog,
      Fabulous,
      FreeDownloadA,
      UploadPrompt,
    },
    directives: {
      remote: {
        bind(el, binding) {
          const selectDom = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
          selectDom.addEventListener('scroll', function () {
            const condition = this.scrollHeight - this.scrollTop <= this.clientHeight
            if (condition) {
              binding.value()
            }
          })
        },
      },
    },
    inject: ['leadStrokeVisible', 'getPoint'],
    filters: {
      textFormat(val) {
        if (!val) {
          return ''
        }
        return val.substring(0, 1).toUpperCase() + val.substr(1)
      },
      fileNameFormat(val) {
        if (!val) {
          return ''
        }
        const fileName = val.substr(0, val.lastIndexOf('.'))
        const suffix = val.substr(val.lastIndexOf('.'))
        let startN = 0
        let endN = 0
        let sIndex = 0
        let eIndex = fileName.length - 1
        while ((startN < 10 || endN < 10) && sIndex < eIndex) {
          if (startN < 10) {
            if (fileName.charCodeAt(sIndex) >= 128) {
              startN += 2
            } else {
              startN++
            }
            sIndex++
          }
          if (endN < 10) {
            if (fileName.charCodeAt(eIndex) >= 128) {
              endN += 2
            } else {
              endN++
            }
            eIndex--
          }
        }
        if (startN + endN < 20) {
          return val
        }
        if (sIndex > eIndex) {
          return val
        }
        return fileName.substr(0, sIndex) + ' ... ' + fileName.substr(eIndex) + suffix
      },
    },
    mixins: [
      workflow_data,
      WorkflowOperationsMixins,
      UploadImgMixins,
      UserInfoMixins,
      WorkConfigurationPreprocessingMixins,
      //IndexedDBMixins,
    ],
    inheritAttrs: false,
    props: {
      show: { type: Boolean, default: false },
      visible: { type: Boolean, default: false },
      activeWorkflowData: {
        type: Object,
        default: () => {
          return {
            single: [],
            workflow: [],
            subject: [],
          }
        },
      },
      sampleImageData: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      const processData = (idx) => {
        return {
          imgUrl: 'index_0' + idx,
          processTitle: this.$t('index.process_title_' + idx),
          processDesc: this.$t('index.process_desc_' + idx),
          learnMoreUrl: this.$t('common.common_solution_link_' + idx),
          showUploadBtn: false,
        }
      }
      const workTypeEnlarge = Work.typeEnlarge
      const workTypeDenoise = Work.typeDenoise
      const workTypeSharpen = Work.typeSharpen

      const operationTypes = {}
      operationTypes[workTypeEnlarge] = this.$t('workspace.config_1')
      operationTypes[workTypeDenoise] = this.$t('workspace.config_2')
      operationTypes[workTypeSharpen] = this.$t('workspace.config_3')

      return {
        isWatermarkPlanB: true,
        freeProcessTimesVisible: false,
        freeTimesVisible: false,
        deletedTransIds: [],
        recommendDownloadVisible: false,
        enlagerType: '',
        is_queued: '0', //是否排过队
        selImage: null, //从workList组件中选择的图片
        guideWin: false, //引导弹窗
        fabulousWin: false, //点赞弹窗
        works: [
          /* {
   "uid": "53760c9fe1353834a5fd38cb7ff47b0e",
   "fileId": "L21udC9zbWIvaW4vdmFuY2VhaS8yMDIwLTExLTIwLzUz",
   "filename": "vanceai.com_.png.png",
   "filesize": 1000000,
   "w": 1148,
   "h": 2000,
   "thumbnail": "/thumbnail/vanceai/2020-11-20/03e70cd3/vanceai.com_.png.png",
   "status": "ready",
   "zoomId": "",
   "zoomFileId": "",
   "zoomW": 574,
   "zoomH": 1000,
   // 以下字段在任务完成时赋值
   "operation": "",
   "config": {
"scale": 2
 },
   "transId": "",
   "zoomTransId": "",
   //
   "startTime": 0,
   "endTime": 0,
 } */
        ],
        processList: [
          // processData(9),
          processData(1),
          processData(3),
          processData(4),
          processData(2),
          processData(5),
          processData(7),
          processData(6),
          processData(8),
        ],
        config: {
          operation: Work.typeEnlarge,
          // enlarge
          initScale: 2,
          scale: 2,
          scaleList: [2, 4, 6, 8],
          suppressNoise: true,
          removeBlur: false,
          // denoise
          denoiseValue: 75,
          // sharpen
          sharpenValue: 75,
          sharpenBeta: 'manual', //auto manual
          // matting
          zoomType: 1, //1 代表大图
          // colorize
          isPsd: false,
          quality: 'high', //best
          // portrait
          singleFace: 'face', //entire
        },
        processLoading: false,

        timeout: 300 * 1000,

        // onPreview
        showPreview: false,
        previewInfo: {
          info: {},
          beforeImg: '',
          afterImg: '',
          width: '',
          height: '',
          afterW: 0,
          afterH: 0,
          beforeW: 0,
          beforeH: 0,
          beforeLoading: false,
          afterLoading: false,
          resolutionFlag: true,
          operation: '',
        },

        showDel: false,
        // tab
        tabsList: [
          {
            title: this.$t('workspace.tab_1'),
            icon: 'icon-s-upload',
            activeIcon: 'icon-s-upload active',
            tab: 'uploaded',
          },
          {
            title: this.$t('workspace.tab_2'),
            icon: 'icon-s-refresh',
            activeIcon: 'icon-s-refresh active',
            carryActiveIcon: 'icon-rotate',
            tab: 'processing',
          },
          {
            title: this.$t('workspace.tab_3'),
            icon: 'icon-s-complete',
            activeIcon: 'icon-s-complete active',
            tab: 'processed',
            successCount: 0,
          },
        ],
        tabShow: 0,
        //
        minLoading: false,
        maxLoading: false,
        checkedAll: false,
        //
        operationTypes,
        //
        workTypeEnlarge,
        workTypeDenoise,
        workTypeSharpen,
        workInfo: {},
        workTypes: Work.workTypes,
        uploadList: [],
        sampleList: [],
        accept: '.jpg,.png,.jpeg',
        allSampleList: this.emptyAllSampleList(),
        source: '',
        firstFlag: true,
        //workflow start
        showCompareDialog: false,
        requestParams: {
          web: 'vanceai',
        },
        loading: false,
        defaultFlows: [],
        workOptions: [],
        presetOptions: [],
        workflowList: [],
        // workflowgroup: [this.presetworkflow],
        // workflowgroup: [],
        pageParams: {
          page: 1,
          limit: 10,
          total: 0,
          lastPage: 0,
        },
        activeName: 'feature',
        workflow: '',
        selectWorkName: '',
        showSaveWorkflowDialog: false,
        workName: '',
        isEdit: false,
        activeModule: '',
        workFlows: [],
        initUnprocessWorks: true,
        showConfirm: false,
        showConfirmTitle: '',
        showConfirmCancel: '',
        showConfirmCancelBtn: false,
        showConfirmYes: '',
        confirmHandle: () => {},
        imgSrc: '',
        //workflow end
        taskList: {},
        showNewPreview: false,
        // AdboxShow: true,
        // bottomAdBannerShow: true,
        limitDialog: false,
        repairProcess: '',
        newAddWorkLength: 0,
        getProgressAndStartNextlcked: false,
        convert: false,
        process_time: 0,
        busyJobs: 0,
        userPid: 0,
        queryQueueParams: null,
        offlineVisible: false,
        offlineBtnShow: false,
        showDontshowAgain: true,
        dontShowAgain: false,
        workState: 'online',
        newWorkLength: 0,
        oldWorkLength: 0,
        currentPage: 1,
        workStartlocked: false,
        licenseLocked: false,
        currentPlanActive: false,
        outSettingConfig: {
          compress: {
            quality: 80,
          },
          dpi: 'default',
          format: 'default',
          isRemerber: false,
          keep_origin_name: true,
        },
        outSettingShow: false,
        outSetVisible: false,
        discountDialogVisible: false,
        timer: {
          hours: '24',
          minutes: '00',
          seconds: '00',
        },
        subtime: 0,
        upgradeBtnLoading: false,
        upgradeSmallDialogVisible: false,
        upgradeStatus: 'init',
        registerAndSubscribeVisible: false,
        notPoint: false,
        isProcess: false,
        offlineWorkerUploadVisible: false,
        breakOfflineWorkUpload: false,
        offlineWorks: [],
        jobType: '',
        enableUploadPrompt: false,

        //父组件传过来的数据
        renderData: null,
        isCurrentPageProcess: false,
        refType: '',
        fileList: [],
        firstVisitFlag: true,
      }
    },
    computed: {
      intervalTime() {
        let interval = 2 * 1000
        // 处理进度  轮询间隔
        // 0-1min 2s
        // 1-3min 5s
        // 3min-5min 10s
        // 5-10min 30s
        // 10min+ 60s
        if (this.process_time > 59 && this.process_time < 180) {
          interval = 5 * 1000
        } else if (this.process_time > 179 && this.process_time < 300) {
          interval = 10 * 1000
        } else if (this.process_time > 299 && this.process_time < 600) {
          interval = 30 * 1000
        } else if (this.process_time > 599) {
          interval = 60 * 1000
        }
        return interval
      },
      jobs() {
        return WorkFlowType
      },
      disableProcessBtn() {
        return (
          this.sampleList &&
          !this.sampleList.some((item) => item.selected) &&
          !this.uploadList.some((item) => item.selected)
        )
      },
      disableAddWorkflowBtn() {
        return (
          this.uploadList.length === 0 && this.sampleList && this.sampleList.some((item) => item.selected)
        )
      },
      isWorkflow() {
        return this.activeName === 'workflow' || this.defaultFlows.length > 1
      },
      unprocessedWorks() {
        return this.works.filter(
          (item) =>
            item.status !== Work.statusFinished &&
            item.status !== Work.statusProcessFailed &&
            item.status !== Work.statusReady &&
            item.status !== Work.statusImageTooLarge
        )
      },
      processedWorks() {
        return this.works.filter(
          (item) => item.status === Work.statusFinished || item.status === Work.statusProcessFailed
        )
      },
      readyWorks() {
        return this.works.filter((item) => item.status === Work.statusReady)
      },
      uploadWorks() {
        return this.works.filter(
          (item) =>
            item.status === Work.statusReady ||
            item.status === Work.statusUploading ||
            item.status === Work.statusUploadFailed
        )
      },
      showActive() {
        return this.works.some(
          (item) =>
            item.status === Work.statusUploading ||
            item.status === Work.statusProcessing ||
            item.status === Work.statusWaiting
        )
      },
      logged() {
        return this.$store.state.logged
      },
      guestTokenV2() {
        return this.$store.state.guestTokenV2
      },
      workType() {
        return this.$store.state.my_upload_dialog_work_type
      },
      storeUploadList() {
        try {
          return JSON.parse(this.$store.state.uploadList)
        } catch (e) {
          return []
        }
      },
    },
    watch: {
      fileList: {
        handler(val) {
          if (val.length && val.every((item) => item.uploadStatus === 'success')) {
            this.onUpload(val)
          }
        },
        deep: true,
      },
      timer: {
        handler(val) {
          if (val) {
            if (val.hours === 0 && val.minutes === 0 && val.seconds === 0) {
              this.$setCookie('cloud_small-dialog-visible', '0')
            }
          }
        },
        deep: true,
      },
      isWorkflow(val) {
        if (val) {
          this.sampleList.forEach((item) => {
            item.selected = false
          })
        }
      },
      workType(val) {
        if (val) {
          this.sampleList = this.allSampleList[val] || []
        }
      },
      defaultFlows: {
        handler(val) {
          this.changeFileOutSize(val)
          this.setWorkType()
          this.changeCurrentActiveWorkflow()
          // this.saveFlowsConfigToLocal()
        },
        deep: true,
      },
      // workFlows: {
      //   handler(val) {
      //     this.changeFileOutSize(val)
      //   },
      //   deep: true,
      // },
      activeName(val) {
        if (val === 'feature') {
          const flows = this.defaultFlows
          this.changeFileOutSize(flows)
        }
        // else if (val === 'workflow') {
        //   const flows = this.workFlows
        //   this.changeFileOutSize(flows)
        // }
      },
      // works: {
      //   handler(val) {
      //     this.setDbData('worksNew', JSON.stringify(val))
      //   },
      //   deep: true,
      // },
      userLogin(val) {
        // if (val) {
        //   this.getWorkflowList()
        //   this.activeName = 'workflow'
        // }
      },
      unprocessedWorks: {
        handler(val) {
          if (
            this.unprocessedWorks &&
            this.unprocessedWorks.length &&
            this.defaultFlows &&
            this.defaultFlows.length &&
            this.initUnprocessWorks
          ) {
            this.initUnprocessWorks = false
            if (
              this.unprocessedWorks[0].operation !== 'workflow' &&
              !localStorage.getItem('workflowconfig') &&
              this.presetOptions.includes[this.unprocessedWorks[0].operation]
            ) {
              this.defaultFlows.splice(0, 1, {
                name: this.unprocessedWorks[0].operation,
                config: WorkFlowConfig(this.unprocessedWorks[0].operation),
              })
            }
          }
          if (this.activeName === 'feature') {
            const flows = this.defaultFlows
            this.changeFileOutSize(flows)
          }
          // else if (this.activeName === 'workflow') {
          //   const flows = this.workFlows
          //   this.changeFileOutSize(flows)
          // }
          //处理中任务全部完成并且处在processing标签中
          if (this.works.length && val.length === 0 && this.tabShow === 1) {
            this.tabShow = 2
          }
        },
        deep: true,
      },
      renderData: {
        handler() {
          this.init()
          this.componentRenderData()
        },
        deep: true,
      },
      // workflowList: {
      //   handler(val) {
      //     if (val.length > 0) {
      //       this.workflowgroup[1]
      //         ? (this.workflowgroup[1].options = this.workflowList)
      //         : this.workflowgroup.push({
      //             label: this.$t('workspace.select_label_2'),
      //             options: this.workflowList,
      //           })
      //     } else {
      //       this.workflowgroup.splice(1)
      //     }
      //   },
      //   deep: true,
      // },
      repairProcess(val) {
        if (val === 'cancel') {
          this.works.splice(0, this.newAddWorkLength)
          this.tabShow = 0
          this.repairProcess = ''
          this.processLoading = false
        } else if (val === 'continuedialog') {
          const r_works = this.works.filter((item) => {
            return item.status === 'waiting' || item.status === 'processing'
          })
          this.startProcess(r_works)
          this.processLoading = false
        } else if (val === 'execdialog') {
          const r_works = this.works.filter((item) => {
            return item.status === 'waiting' || item.status === 'processing'
          })
          this.startProcess(r_works)
          this.processLoading = false
        }
      },
      userInfo: {
        handler(val) {
          this.$store.commit('SET_WORKSPACE_USER_INFO', JSON.parse(JSON.stringify(val)))
        },
        deep: true,
      },
      guestTokenV2: {
        handler(val) {
          //用户登录以后自动执行之前的下载操作
          this.beginDownloadImage()
        },
      },
    },
    async mounted() {
      //获取从小站跳转的对应的工作台模型
      const workSelType = getUrlParam('work_sel_type')
      if (workSelType) {
        localStorage.setItem('type', workSelType)
      }

      this.getOutSetting()
      this.init()
      //样图获取
      this.initSampleList()

      await this.getWrokflowOptions()

      // this.getWorkflowList()

      this.checkFlow()
      this.onUpload(this.fileList.filter((item) => item.uploadStatus === 'success'))
      this.checkDropBoxCallBack()
    },
    beforeDestroy() {
      window.microApp.removeDataListener(this.dataListener)
    },
    destroyed() {
      if (process.browser && localStorage.getItem('worksUpdateTime')) {
        // 移除超过 24 小时的任务
        const nowTime = Date.now
        const intervals = nowTime - Number(localStorage.getItem('worksUpdateTime'))
        if (intervals >= 24 * 60 * 60 * 1000) {
          localStorage.clear()
        }
      }
    },
    methods: {
      initData() {
        if (window && window.__MICRO_APP_ENVIRONMENT__) {
          const data = window.microApp.getData()
          console.log('主应用下发的data数据:', data)
          this.refType = data.isDialog
          if (data.fileList) {
            this.fileList = data.fileList
          }
          if (data.renderData) {
            this.renderData = data.renderData
          }
          if (data.isCurrentPageProcess) {
            this.isCurrentPageProcess = data.isCurrentPageProcess
          }
          window.microApp.addDataListener(this.dataListener)
        }
      },
      dataListener(data) {
        if (data.CLEAR_FILE_LIST == true) {
          this.uploadList = []
          return
        }
        if (data.fileList && data.fileList.length) {
          this.uploadList = [].concat(data.fileList[0])
          this.uploadList[0].selected = true
          this.lockWinFun(true)
        }
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
      checkDropBoxCallBack() {
        const hash = this.$route.hash.replace('#', '')
        if (hash) {
          const [key, value] = hash.split('&')[0].split('=')
          if (key === 'access_token') {
            this.tabShow = 2
          }
        }
      },
      selEnlagerTypeFun(req) {
        this.enlagerType = req
      },
      selModelFun(req) {
        this.$refs['WorkSpaceImgView'].selOptionFun(req)
      },
      setIs_queuedFun(req) {
        this.is_queued = req
      },
      changeConfig(config, index) {
        if (index !== undefined) {
          this.defaultFlows[index].config.module = config[0].config.module
          this.defaultFlows[index].config.module_params = config[0].config.module_params
          if (config[0].config.cn_configs) {
            this.defaultFlows[index].config.cn_configs = config[0].config.cn_configs
          }
          // 默认关闭追加模型
          this.defaultFlows[index].config.module_params.custom_auto_mode = 0

          const filters = config.filter(
            (item) => item.config.module_params.model_name === 'SharpenGeneralStable'
          )
          if (filters && filters.length > 0) {
            //sharpen标准模型开启追加模型
            this.defaultFlows[index].config.module_params.custom_auto_mode = 1
          }
        }
      },
      handleAppendConfig(conf, index) {
        this.defaultFlows[index].config = conf
      },
      /**
       * @automaticProp 自动唤起弹窗
       */
      automaticProp() {
        const openupload = getUrlParam('openupload')
        if (openupload == 'open') {
          const inp = document.createElement('input')
          inp.type = 'file'
          inp.accept = 'image/png,image/jpeg,image/jpg'
          inp.click()
          //防止重复绑定
          inp.removeEventListener('change', () => {})
          inp.addEventListener('change', () => {
            inp.files[0].uid = Date.now()
            this.$refs['fileUpload'].automaticUpLoad(inp.files[0])
          })
        }
      },
      /**
       * @downloadImage 用户登录以后自动下载相关图片流程
       * @param reqData 处理的图片相关数据
       */
      downloadImage(reqData) {
        //标记唤起登录弹窗位置(登录后下载会使用)
        this.$store.commit('SET_VUX_DATA', { loginPopup: 'workspace' })
        //唤起登录弹窗
        setLoginDialogShow()
        //记录用户选择的图片数据
        this.selImage = reqData.work
      },
      /**
       * @beginDownloadImage 开始自动下载图片
       * @param reqData 处理的图片相关数据
       */
      beginDownloadImage() {
        if (this.$store.state.loginPopup === 'workspace') {
          this.$refs['processed'].onDownload(this.selImage)
        }
      },
      colseGuide() {
        this.guideWin = false
      },
      onUpload(list) {
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
        this.$emit('onClearUploadLisrt')
        this.firstVisit()
      },
      //自动选中图片
      selectedUploadFormList(list) {
        if (this.$getCookie('token')) {
          for (let i = 0; i < list.length; i++) {
            list[i].selected = true
          }
        } else {
          this.uploadList.forEach((item) => {
            item.selected = false
          })
          for (let i = 0; i < list.length; i++) {
            list[i].selected = true
          }
        }
      },
      onSubscribe() {
        window.location.href =
          this.$store.state.mainWebsite +
          this.$store.state.specialLocaleLink +
          '/pricing?source=downloading_popup&location=download_subscribe&automaticprice=1'
      },
      injectPaddle() {
        window.paddleS = document.createElement('script')
        window.paddleS.type = 'text/javascript'
        window.paddleS.async = true
        window.paddleS.setAttribute('data-paddle', '1')
        window.paddleS.src = 'https://cdn.paddle.com/paddle/paddle.js'
        window.s = document.getElementsByTagName('script')[0]
        window.s.parentNode.insertBefore(window.paddleS, window.s)
      },
      changePlan() {
        const formData = {}
        formData.sid = this.subscriptionId
        //立即支付?
        formData.immediately = 0
        Work.billingImmediately({
          subscription_id: formData.sid,
          new_plan_id: formData.pid,
        })
      },
      // 固定workType 不进行积分判断
      freeWorkType(workType) {
        if (workType === 'repair') {
          return true
        }
      },
      getOutSetting() {
        if (this.$getCookie('cloud_outSeting')) {
          this.outSettingConfig = JSON.parse(this.$getCookie('cloud_outSeting'))
        } else {
          this.outSettingConfig = {
            compress: {
              quality: 80,
            },
            dpi: 'default',
            format: 'default',
            keep_origin_name: true,
            isRemerber: false,
          }
        }
      },
      showNewPreviewHandle(previewInfo, workInfo) {
        this.previewInfo = previewInfo
        this.workInfo = workInfo
        this.showNewPreview = true
      },
      filterWorks(cids) {
        this.works = this.works.filter((item) => {
          return !cids.includes(item.cid)
        })
      },
      notEnoughPOints() {
        this.$confirm(this.$t('common.process_limit_2'), this.$t('common.process_limit_1'), {
          confirmButtonText: this.$t('common.upload_4'),
          showCancelButton: false,
          showConfirmButton: true,
          dangerouslyUseHTMLString: true,
          lockScroll: false,
          showClose: true,
          type: 'warning',
        })
          .then(() => {
            this.$trace.traceCustomEvent({
              event: 'click',
              xargs_event_category: 'popup',
              event_value: 'add_credits_popup',
            })
            const closeBtn = document.body.getElementsByClassName('v-modal')[0]
            closeBtn.click()
            location.href =
              this.$store.state.mainWebsite +
              this.$store.state.specialLocaleLink +
              '/pricing/?source=add_credits_popup'
          })
          .catch(() => {
            this.processLoading = false
          })
      },
      onDownloadUrl(work) {
        Work.pointCheck({ trans_ids: [work.transId] })
          .then((res) => {
            if (res.code === 200) {
              // 初始化点数判断
              this.notPoint = false
              if (!this.isPaied && this.$store.state.client === 'win') {
                this.$trace.traceCustomEvent({
                  event: 'online_work',
                  xargs_event_category: 'download',
                  event_value: 'downloading_popup',
                })
                //未购买用户推荐客户端下载
                this.recommendDownloadVisible = true
                // this.registerAndSubscribeVisible = true
              }
              const time = this.isPaied || this.$store.state.client !== 'win' ? 0 : 3000
              setTimeout(async () => {
                //S3下载
                const { imageUrl, downloadFileName } = await getDownloadUrlFromS3(work.transId)
                const isDownloaded = await browserDownload(imageUrl, downloadFileName)
                if (isDownloaded) {
                  work.finish = 2
                  this.getPoint(() => {
                    if (this.isPaied) {
                      if (!work.likes && !this.$getCookie('cloud_ratedialog')) {
                        this.fabulousWin = true //引导点赞弹窗
                      }
                    }
                    this.minLoading = false
                  })
                } else {
                  this.$message.error(this.$t('下载失败了'))
                }
              }, time)
              // todo 暂时此方法解决，未完善
            } else if (res.code === 30004) {
              this.minLoading = false
              this.isProcess = false
              this.notPoint = true
              this.$trace.traceCustomEvent({
                event: 'click',
                xargs_event_category: 'popup',
                event_value: 'no_credits_popup',
              })
              this.registerAndSubscribeVisible = true
              // this.notEnoughPOints()
            }
          })
          .catch(() => {
            this.minLoading = false
          })
      },
      onDownload(work) {
        //获取transId与模型对应关系
        let tansId_modelJson = localStorage.getItem(TRANSID_MODAL)
        if (!tansId_modelJson) {
          tansId_modelJson = {}
        } else {
          tansId_modelJson = JSON.parse(tansId_modelJson)
        }

        let tansId_model_btn = localStorage.getItem(TRANS_MPDAL_BTN)
        if (!tansId_model_btn) {
          tansId_model_btn = {}
        } else {
          tansId_model_btn = JSON.parse(tansId_model_btn)
        }

        this.currentWork = work
        if (work.sample) {
          const _link = document.createElement('a')
          _link.href = Work.downloadSampleUrl(work.operation, work.uid, 'processed', work.config.scale)
          _link.click()
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'download',
            event_value: 'download_img',
            event_info: {
              download_type: work.operation,
              model_name: tansId_modelJson[work.transId],
              enlager_type: tansId_model_btn[work.transId],
            },
          })

          if (this.$getCookie('userType') === 'register') {
            this.$store.commit(
              'SET_REGISTER_TRIAL',
              JSON.stringify({
                ...this.$store.state.registerTrial,
                download_img: this.$store.state.registerTrial.download_img + 1,
              })
            )
            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'download',
              event_value: 'download_img',
              event_info: {
                free_user_trial_new: this.$store.state.registerTrial.download_img,
              },
            })
          }
          return
        }

        if (this.$getCookie('token')) {
          if (this.isPaied) {
            this.minLoading = true
          }
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'download',
            event_value: 'download_img',
            event_info: {
              download_type: work.operation,
              model_name: tansId_modelJson[work.transId],
              enlager_type: tansId_model_btn[work.transId],
            },
          })
          this.$store.commit(
            'SET_REGISTER_TRIAL',
            JSON.stringify({
              ...this.$store.state.registerTrial,
              download_img: this.$store.state.registerTrial.download_img + 1,
            })
          )
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'download',
            event_value: 'download_img',
            event_info: {
              free_user_trial_new: this.$store.state.registerTrial.download_img,
            },
          })
          this.onDownloadUrl(work)
        } else {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'download',
            event_value: 'download_popup',
            xargs_process_type: work.operation,
          })

          if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
            this.$store.commit(
              'SET_GUEST_TRIAL',
              JSON.stringify({
                ...this.$store.state.guestTrial,
                download_popup: this.$store.state.guestTrial.download_popup + 1,
              })
            )
            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'download',
              event_value: 'download_popup',
              event_info: {
                guest_trial_new: this.$store.state.guestTrial.download_popup,
              },
            })
          }
          this.downloadImage({ work })
        }
      },
      changeCurrentActiveWorkflow() {
        if (this.defaultFlows && this.defaultFlows.length) {
          const flag = this.defaultFlows.some((item) => item.hide === false)
          if (!flag) {
            this.defaultFlows[this.defaultFlows.length - 1].hide = false
          }
        }
      },
      delUploadList(work) {
        if (work) {
          if (work.uploadStatus === 'success') {
            this.uploadList = this.uploadList.filter((item) => item !== work)
          } else {
            if (this.source) {
              this.source.cancel()
              this.source = ''
            }
            this.uploadList = this.uploadList.filter((item) => item !== work)
          }
        } else {
          const uids = this.uploadList.filter((item) => item.selected).map((item) => item.uid)
          if (uids.length === 0) {
            return
          }
          const params = {
            ...this.requestParams,
            uids,
          }
          this.uploadImageDelete(params, () => {
            this.uploadList = this.uploadList.filter((item) => !item.selected)
            this.source = ''
          })
        }
      },
      uploadImageDelete(params, callback) {
        this.source = this.$axios.CancelToken.source()
        Work.deleteUploadImage(params, this.source.token).then((res) => {
          if (res.code === 200) {
            callback()
          } else if (res.code === 10001) {
            console.error(this.$t('common.common_code_1'))
          }
        })
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
        if (this.workType) {
          this.sampleList = this.allSampleList[this.workType] || []
        }
      },
      emptyAllSampleList() {
        const res = {}
        for (let i = 0; i < Work.workTypes.length; i++) {
          res[Work.workTypes[i]] = []
        }
        return res
      },
      setWorkType() {
        if (this.defaultFlows && this.defaultFlows.length === 1) {
          this.$store.commit('SET_WORK_TYPE', this.defaultFlows[0].name)
        }
      },
      delWork(params) {
        return Work.deleteWork(params)
      },
      delProcessedWorks(work) {
        if (typeof work === 'string') {
          let deleteHasProcessing = false
          let transId = ''
          this.works.forEach((item) => {
            if (item.selected && item.status === Work.statusProcessing) {
              deleteHasProcessing = true
              if (item.transId) {
                transId = item.transId
              }
            }
          })
          this.works = this.works.filter((item) => {
            return !item.selected
          })
          this.workStartlocked = false
          this.getProgressAndStartNextlcked = false
          if (work === 'processing') {
            if (transId) {
              this.deletedTransIds.push(transId)
            }
            this.processLoading = false
            const firstUnprocessed = this.unprocessedWorks[0]
            if (firstUnprocessed && deleteHasProcessing) {
              this.startProcess([firstUnprocessed])
            }
          }
        } else {
          work.del = true
          this.works = this.works.filter((item) => item.cid !== work.cid)
          const flag = this.works.some(
            (item) => item.status === Work.statusWaiting || item.status === Work.statusProcessing
          )
          if (!flag) {
            this.processLoading = false
          }
          if (!this.works.some((item) => item.status === Work.statusProcessing)) {
            const work = this.unprocessedWorks[0]
            if (work) {
              this.startProcess([work])
            }
          }
          if (work.transId) {
            const params = {
              trans_ids: [work.transId],
            }
            this.works = this.works.filter((item) => item.transId !== work.transId)
            Work.deleteWork(params).then((res) => {
              if (res.code === 200) {
                this.works = this.works.filter((item) => item !== work)
              }
            })
          }
        }
      },
      showDialogHandle() {
        this.showCompareDialog = true
      },
      showLoginDialog() {
        setLoginDialogShow()
      },
      changeFileOutSize(val) {
        if (val && val.length) {
          const filter = val.filter(
            (item) => item.name === WorkFlowType.enlarge || item.name === WorkFlowType.waifu
          )
          if (filter && filter.length) {
            this.uploadWorks.forEach((item) => {
              item.config.scale = parseInt(filter[0].config.module_params.scale)
            })
          } else {
            this.uploadWorks.forEach((item) => {
              item.config.scale = 1
            })
          }
        }
      },
      saveWorkflowHandle(val) {
        this.workName = val
        this.saveHandle()
      },
      saveWorkflow(params) {
        return Work.addWorkflow(params)
      },
      editWorkflow(params) {
        params = { ...params, id: this.work.id }
        return Work.updateWorkflow(params)
      },
      saveHandle() {
        const filterFlow = this.defaultFlows.filter((item) => Object.keys(item.config).length !== 0)
        if (filterFlow.length === 0) {
          this.$message.warning(this.$t('workspace.workflow_empty'))
          return
        }
        this.loading = true
        const params = {
          name: this.workName || 'workflow_' + Date.now(),
          flows: filterFlow.map((item) => {
            return {
              config: JSON.stringify(item.config),
              name: WorkFlowModuleMap[item.name],
            }
          }),
          ...this.requestParams,
        }
        const fn = this.isEdit ? this.editWorkflow : this.saveWorkflow
        fn(params)
          .then((res) => {
            if (res.code === 200) {
              this.$trace.traceCustomEvent({
                event: 'online_work',
                xargs_event_category: 'operation',
                event_value: 'create_workflow',
                event_info: {
                  workflow_steps: filterFlow.length,
                },
              })
              setTimeout(() => {
                this.dialogVisible = false
              }, 200)
            } else {
              this.$message.error(this.$t('common.common_code_1'))
            }
          })
          .catch(() => {
            this.$message.error(this.$t('common.check_network'))
          })
          .finally(() => {
            this.pageParams.page = 1
            // this.getWorkflowList()
            this.loading = false
            this.showSaveWorkflowDialog = false
          })
      },
      showSaveWorkflowDialow() {
        this.showSaveWorkflowDialog = true
      },
      // workflowSelectChangeHandle(val) {
      //   const filter = this.workflowList.filter((item) => item.id === val)
      //   // const filter2 =
      //   //   this.presetworkflow.options && this.presetworkflow.options.filter((item) => item === val)
      //   // if (filter2 && filter2.length) {
      //   //   this.workFlows = WorkFlowConfig(val)
      //   //   this.selectWorkName = val
      //   //   return
      //   // }
      //   if (filter && filter.length) {
      //     this.workFlows = filter[0].flows
      //     this.selectWorkName = filter[0].name
      //   }
      // },
      initDefaultFlows() {
        this.defaultFlows = [
          {
            name: WorkFlowType.denoise,
            config: this.getConfigToLocal(WorkFlowType.denoise),
          },
        ]
        this.config.scale = 1
      },
      // getUrlSet() {
      //   const list = [
      //     'ai_super_hd',
      //     'ai_portrait_enhancement',
      //     'ai_night_scene',
      //     'ai_old_photo_repire_colorize',
      //   ]
      //   const scene = getUrlParam('feature')
      //   const filter = list.filter((item) => {
      //     return item === scene
      //   })
      //   if (filter.length > 0) {
      //     this.activeName = 'workflow'
      //     this.workflow = WorkFlowType[filter[0].replace(/^ai_/, '')]
      //     this.workflowSelectChangeHandle(this.workflow)
      //   }
      // },

      /**
       * @dontAddFun 不允许添加
       */
      dontAddFun(obj) {
        this.showConfirmHandle(obj.contentTxt, this.$t('workspace.workflow_first_use_confirm'), () => {
          this.showConfirm = false
        })
      },
      // TODO暂时去掉用户使用记录
      getConfigToLocal(type) {
        // const c = this.$getCookie('cloud_config_' + type)
        // if (c) {
        //   return JSON.parse(c)
        // } else {
        //   this.$setCookie('cloud_config_' + type, JSON.stringify(WorkFlowConfig(type)))
        if (type === WorkFlowType.waifu) {
          return WorkFlowConfig(WorkFlowType.real_esrgan)
        }
        if (type === WorkFlowType.sketch) {
          return WorkFlowConfig(WorkFlowType.sketch)
        }
        if (type === WorkFlowType.cartoonize) {
          return WorkFlowConfig(WorkFlowType.img2anime)
        }
        if (type === WorkFlowType.sharpen) {
          return WorkFlowConfig(WorkFlowType.sharpen)
        }
        return WorkFlowConfig(type)
        // }
      },
      // saveFlowsConfigToLocal() {
      //   if (this.defaultFlows.length === 1) {
      //     this.saveConfigToLocal(this.defaultFlows[0].name, this.defaultFlows[0].config)
      //   }
      // },
      // saveConfigToLocal(type, config) {
      //   this.$setCookie('cloud_config_' + type, JSON.stringify(config))
      // },
      showConfirmHandle(title = '', yes = '', confirmHandle = null, cancel = '', showCancel = false) {
        this.showConfirmTitle = title
        this.showConfirmCancel = cancel
        this.showConfirmYes = yes
        this.showConfirmCancelBtn = showCancel
        this.confirmHandle = () => {
          this.showConfirm = false
        }
        this.showConfirm = true
      },
      settingHandle(index) {
        const hide = this.defaultFlows[index].hide
        this.defaultFlows.forEach((item) => {
          this.$set(item, 'hide', true)
        })
        this.defaultFlows[index].hide = !hide
      },
      delHandle(index) {
        this.defaultFlows.splice(index, 1)
      },
      checkFlow(val, index) {
        if (val) {
          this.jobType = val
          delete this.defaultFlows[index].elkJob
          delete this.defaultFlows[index].elkName
          delete this.defaultFlows[index].index
          delete this.defaultFlows[index].modelExtendFlag
          delete this.defaultFlows[index].modelExtend
          delete this.defaultFlows[index].newSketchName

          this.defaultFlows[index].config = WorkFlowConfig(val)
          if (val === WorkFlowType.waifu) {
            this.defaultFlows[index].config = WorkFlowConfig(WorkFlowType.real_esrgan)
          }
          if (val === WorkFlowType.cartoonize) {
            this.defaultFlows[index].config = WorkFlowConfig(WorkFlowType.animegan)
          }
          if (val === WorkFlowType.sharpen) {
            this.defaultFlows[index].config = WorkFlowConfig(WorkFlowType.sharpen)
          }
          if (val !== WorkFlowType.enlarge) {
            this.enlagerType = ''
          }
        }
        if (index === 0) {
          this.config.operation = val
          if (this.defaultFlows.length === 1) {
            this.defaultFlows[index].config = this.getConfigToLocal(val)
          }
        }
        let flag = false
        if (this.defaultFlows && this.defaultFlows.length && this.defaultFlows.length !== 1) {
          this.defaultFlows.forEach((item) => {
            if (flag) {
              item.flag = true
            } else {
              if (item.name === WorkFlowType.enlarge) {
                this.$set(item, 'disable', true)
                this.$set(item, 'hide', false)
                flag = true
              } else if (item.name === WorkFlowType.waifu) {
                this.$set(item, 'disable', true)
                this.$set(item, 'hide', false)
                flag = true
              } else if (item.name === WorkFlowType.matting) {
                this.$set(item, 'disable', true)
                this.$set(item, 'hide', false)
                flag = true
              } else {
                this.$set(item, 'disable', false)
              }
            }
          })
          const waifuLimit = this.defaultFlows.find((item) => {
            return item.name === WorkFlowType.waifu
          })
          if (waifuLimit) {
            this.defaultFlows = this.defaultFlows.filter((item) => {
              return item.name === WorkFlowType.waifu
            })
          }
          this.defaultFlows = this.defaultFlows.filter((item) => !item.flag)
          if (this.defaultFlows && this.defaultFlows.length) {
            if (
              this.defaultFlows[this.defaultFlows.length - 1].name === WorkFlowType.enlarge ||
              this.defaultFlows[this.defaultFlows.length - 1].name === WorkFlowType.matting
            ) {
              this.$set(this.defaultFlows[this.defaultFlows.length - 1], 'disable', true)
            }
            if (this.isPaied && this.defaultFlows.length === 5) {
              this.$set(this.defaultFlows[this.defaultFlows.length - 1], 'disable', true)
            } else if (!this.isPaied && this.defaultFlows.length === 3) {
              this.$set(this.defaultFlows[this.defaultFlows.length - 1], 'disable', true)
            }
          }
        }
      },
      /**
       * @getWrokflowOptions 初始化工作台下拉选择的数据
       */
      getWrokflowOptions() {
        //从其他页面跳转到工作目标选择工作流就不要初始化工作台
        if (getUrlParam('sel_tab') !== 'workflow') {
          this.componentRenderData()
        }
        this.workOptions = this.activeWorkflowData.workflow.filter((item) => {
          const disabledWorks = ['sharpen_auto', 'colorize_pro', 'perfect', 'jpeg_artifact', 'se-dehazing']
          return !disabledWorks.includes(item)
        })
        this.presetOptions = this.activeWorkflowData.subject
        // this.presetworkflow.options = res.data.subject
        // this.getUrlSet()
        if (this.defaultFlows && this.defaultFlows.length === 0) {
          this.defaultFlows = [
            {
              name: WorkFlowType.denoise,
              config: this.getConfigToLocal(WorkFlowType.denoise),
            },
          ]
          this.config.scale = 1
        }
      },

      firstVisit() {
        if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token') && this.firstVisitFlag) {
          this.firstVisitFlag = false
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'process',
            event_info: {
              process_first_image: 'start',
            },
          })
          //等待初始化完成
          // const timer = setInterval(() => {
          //   if (this.loading) {
          //     return
          //   }
          //   clearInterval(timer)
          //   this.onStartProcess()
          // }, 1000)

          setTimeout(() => {
            this.onStartProcess()
          }, 1000)
        }
      },
      // getWorkflowList() {
      //   if (!this.pageParams.total || this.pageParams.page <= this.pageParams.lastPage) {
      //     this.loading = true
      //     const params = { ...this.pageParams, ...this.requestParams }
      //     Work.getWorkflowList(params)
      //       .then((res) => {
      //         if (res.code === 200) {
      //           const data = res.data
      //           if (this.pageParams.page === 1) {
      //             this.workflowList = data.datas
      //           } else {
      //             this.workflowList = [...this.workflowList, ...data.datas]
      //           }

      //           if (this.workflowList && this.workflowList.length) {
      //             if (this.workflow === '') {
      //               this.workflow = this.workflowList[0].id
      //             }
      //             this.workflow && this.workflowSelectChangeHandle(this.workflow)
      //           }
      //           if (this.$getCookie('cloud_firstUseWorkflow')) {
      //             this.firstUse = this.$getCookie('cloud_firstUseWorkflow')
      //           } else {
      //             this.$setCookie('cloud_firstUseWorkflow', true)
      //             this.firstUse = this.workflowList.length === 0
      //           }
      //           this.pageParams = { page: data.current_page + 1, total: data.total, lastPage: data.last_page }
      //         } else if (res.code === 10001) {
      //           console.error(this.$t('common.common_code_1'))
      //         }
      //       })
      //       .catch(() => {
      //         this.$message.error(this.$t('common.check_network'))
      //       })
      //       .finally(() => {
      //         this.loading = false
      //       })
      //   }
      // },
      /**
       * @componentRenderData 初始化工作台数据
       */
      componentRenderData() {
        this.jobType = localStorage.getItem('type')
        if (localStorage.getItem('type') !== 'compress') {
          this.config.operation = localStorage.getItem('type') || this.config.operation
          if (this.presetOptions.includes(this.config.operation)) {
            this.defaultFlows = [
              {
                name: WorkFlowType.denoise,
                config: this.getConfigToLocal(WorkFlowType.denoise),
              },
            ]
          } else {
            this.defaultFlows = [
              {
                name: this.config.operation,
                config: this.getConfigToLocal(this.config.operation),
              },
            ]
          }
        } else {
          localStorage.setItem('type', this.config.operation)
        }
        this.defaultFlows.forEach((item, index) => {
          if (index === this.defaultFlows.length - 1) {
            item.hide = false
          } else {
            item.hide = true
          }
        })
        const filter = this.tabsList.filter((item) => item.tab === 'processed')
        if (filter && filter.length) {
          filter[0].successCount = localStorage.getItem('successCount') || 0
        }
        // const worksNew = await this.getDbData('worksNew')
        // if (worksNew) {
        //   this.works = this.removeWorkData(JSON.parse(worksNew))
        //   this.works.forEach((item) => {
        //     if (
        //       item.status !== Work.statusReady &&
        //       item.status !== Work.statusFinished &&
        //       item.status !== Work.statusProcessFailed
        //     ) {
        //       item.status = Work.statusReady
        //     }
        //   })
        // }
        this.initData()
      },
      /**
       * @removeWorkData 移除本地过期的图片
       */
      removeWorkData(reqData) {
        const currentData = new Date().valueOf()
        const maxData = 24 * 60 * 60 * 1000 //24h
        //读取缓存
        if (reqData && typeof reqData === 'object') {
          reqData = reqData.filter((val) => {
            if (currentData - val.endTime > maxData) {
              return false
            }
            return true
          })
          //重新写入缓存
          // this.setDbData('worksNew', JSON.stringify(reqData))
        }
        return reqData
      },
      initWork(work) {
        return {
          ...work,
          file: work.file,
          u_uid: work.cid,
          cid: Date.now() + Math.random().toString(16),
          operation: this.config.operation,
          status: Work.statusReady,
          //
          startTime: 0,
          endTime: 0,
          checked: false,
          config: {
            isPsd: false,
            scale: this.config.operation === Work.typeEnlarge ? 2 : 1, // TODO: 此处只是临时 Fix
            sharpenBeta: this.config.sharpenBeta,
            quality: this.config.quality,
            singleFace: this.config.singleFace,
          },
          //
          selected: false,
          // isProcessed: false,
          transId: '',
          jobId: '',
          targetName: '', // targetName 需要符合后端定义的规则
          dstFileId: '',
          likes: '',
          // only for matting zoom
          zoomTransId: '',
          zoomJobId: '',
          zoomTargetName: '',
          zoomDstFileId: '',
          isPreset: this.activeName === 'workflow',
        }
      },
      limitSize(limit) {
        return parseInt(limit.filesize / userLevel.mb) + 'MB'
      },
      limitResolution(limit) {
        // return limit.resolution.width + 'X' + limit.resolution.height + 'px'
        return limit.resolution.megapixels / 1000000 + ' ' + this.$t('common.upload_mp')
      },
      onHideCompareDialog() {
        this.$emit('update:visible', false)
        this.showCompareDialog = false
      },
      confirmDel() {
        this.works = this.works.filter(
          (item) => item.status != Work.statusFinished && item.status != Work.statusProcessFailed
        )
        this.showDel = false
      },
      setWorkflows(workflows, outParams) {
        if (workflows.length <= 0) {
          return
        }
        workflows.forEach((item, index) => {
          if (item.name === 'colorize' || item.name === 'deoldify') {
            if (item.config.module_params.convert === undefined) {
              item.config.module_params.convert = this.convert
            } else {
              this.convert = item.config.module_params.convert
            }
            if (item.config.module_params.convert) {
              item.config.convert = {
                source: 'gray',
              }
              delete item.config.module_params.convert
            } else {
              delete item.config.convert
              delete item.config.module_params.convert
            }
          }
        })
        // const len = workflows.length
        // if (Array.isArray(workflows[len - 1]['config'])) {
        //   const length = workflows[len - 1]['config'].length
        //   workflows[len - 1]['config'][length - 1]['config']['out_params'] = outParams
        // } else {
        //   workflows[len - 1]['config']['out_params'] = outParams
        // }
      },
      limitsRepair(work) {
        const megapixels = userLevel.limits.guest.resolution.megapixels
        if (
          work.params.name === 'repair' ||
          (work.params.config instanceof Array &&
            work.params.config.find((item) => {
              return item.name === 'repair'
            }))
        ) {
          if (work.w * work.h > megapixels) {
            work.status = Work.statusImageTooLarge
          }
        }
      },
      // start
      /**
       * @onStartProcess
       */
      onStartProcess(workState = 'online') {
        if (this.checkHideOnlineService()) {
          return
        }
        //未选择图片给提示
        if (this.disableProcessBtn) {
          this.$message.error(this.$t('common.select_tip'))
          return
        }

        const country = localStorage.getItem(COUNTRY)
        // IN 印度
        if (country === 'IN' && !this.$getCookie('token')) {
          setLoginDialogShow()
          return
        }
        //已登录用户web端批量处理工作台首次使用时开启引导添加快捷方式弹窗
        if (
          this.$getCookie('token') &&
          !this.$getCookie('cloud_guideWin') &&
          !this.$store.state.mobile &&
          this.$route.name.indexOf('workspace') !== -1
        ) {
          this.$setCookie('cloud_guideWin', 1, 3650)
          this.guideWin = true
          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'other',
            event_value: 'add_desktop',
          })
        }

        //登录后token和guestTokenV2同时正常过期，需要弹出登录框
        if (!this.$getCookie('token') && !this.$getCookie('guestTokenV2')) {
          console.log('token and guestTokenV2 is expired')

          this.$store.commit('SET_TOKEN', '')
          //提示用户登录
          setLoginDialogShow()

          this.$store.commit('SET_USER_INFO_LEVEL', 'free')
          this.$store.commit('SET_USER_LOGINED', false)

          return
        }

        if (
          this.$getCookie('token') &&
          this.$getCookie('userType') !== 'paying' &&
          this.freeProcessWebNum <= 0 &&
          !['jpeg_artifact', 'perfect', 'se-dehazing', 'brightness'].includes(this.jobType)
        ) {
          this.freeTimesVisible = true
          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'general_click',
            event_value: 'process_insufficient',
          })
          return
        }

        this.workState = workState
        let filters = this.uploadList.filter((item) => item.selected)
        if (filters.length === 0) {
          filters = this.sampleList.filter((item) => item.selected)
          filters = filters.map((item) => {
            return {
              ...item,
              sample: true,
            }
          })
        }
        this.newAddWorkLength = filters.length
        const works = [...filters.map((item) => this.initWork(item))]
        this.uploadList.forEach((item) => {
          item.selected = false
        })
        this.sampleList.forEach((item) => {
          item.selected = false
        })
        if (works.length <= 0) {
          return
        }
        // show process loading
        this.processLoading = true

        const logged = this.$getCookie('token')
        // const workflows = this.activeName === 'feature' ? this.defaultFlows : this.workFlows
        const workflows = this.defaultFlows
        this.newWorkLength = works.length
        this.oldWorkLength = this.works.length
        works.forEach((work) => {
          const outParams = this.getOutParams()
          work.out_params = outParams
          let params
          //单任务
          if (workflows.length === 1 && this.activeName === 'feature') {
            // <
            // enlarger使用waifu模型会应用此逻辑
            work.operation = workflows[0].elkJob || workflows[0].name
            const name = workflows[0].elkName || work.operation
            // >

            work.config.scale = 1
            if (work.operation === WorkFlowType.sharpen) {
              work.config.sharpenBeta = 'manual'
            } else if (work.operation === WorkFlowType.sharpen_auto) {
              work.config.sharpenBeta = 'auto'
            } else if (
              work.operation === WorkFlowType.colorize ||
              work.operation === WorkFlowType.colorize_pro
            ) {
              work.config.quality = work.operation === WorkFlowType.colorize ? 'high' : 'best'
              work.config.isPsd = workflows[0].config.module_params.psd
              if (workflows[0].config.module_params.convert === undefined) {
                workflows[0].config.module_params.convert = this.convert
              } else {
                this.convert = workflows[0].config.module_params.convert
              }
              if (workflows[0].config.module_params.convert) {
                workflows[0].config.convert = {
                  source: 'gray',
                }
                delete workflows[0].config.module_params.convert
              } else {
                delete workflows[0].config.convert
                delete workflows[0].config.module_params.convert
              }
            } else if (work.operation === WorkFlowType.portrait) {
              work.config.singleFace = workflows[0].config.module_params.single_face ? 'face' : 'entire'
            } else if (work.operation === WorkFlowType.sketch) {
              work.config.singleFace = workflows[0].config.module_params.single_face ? 'face' : 'entire'
              work.config.sigma = workflows[0].config.module_params.sigma
              work.config.alpha = workflows[0].config.module_params.alpha
            } else if (work.operation === WorkFlowType.enlarge) {
              //todo 需要根据config list叠加计算 注意兼容自定义放大
              work.config.scale = parseInt(workflows[0].config.module_params.scale)
            } else if (work.operation === WorkFlowType.waifu) {
              work.config.scale = parseInt(workflows[0].config.module_params.scale)
            }
            params = {
              config:
                work.operation === 'old_photo_restorer2'
                  ? this.repairConfigFunV2WithConfig(workflows[0])
                  : [JSON.parse(JSON.stringify({ ...workflows[0], name }))],
              name,
              job: work.operation,
            }

            if (work.operation === WorkFlowType.matting) {
              params.zoomType = 1
            }
          }

          work.params = params
          work.dst_file_name = this.setFileName(work.filename, this.outSettingConfig.format)
        })
        this.getOutSetting()
        this.works = [...this.works, ...works]
        if (this.repairProcess === 'continuedialog') {
          this.repairProcess = ''
        }
        if (logged) {
          // 强制将该批任务标记为 waiting，确保界面显示进度条
          this.readyWorks.forEach((work) => {
            work.status = Work.statusWaiting
          })
          if (
            !this.readyWorks.find((item) => {
              return !this.repairStatus(item)
            })
          ) {
            const r_works = this.works.filter((item) => {
              return item.status === 'waiting' || item.status === 'processing'
            })
            this.startProcess(r_works)
            this.processLoading = false
          }
        } else {
          const work = this.readyWorks[0]
          if (work && this.repairStatus(work)) {
            this.startProcess([work])
          }
        }
        if (this.workState !== 'offline') {
          setTimeout(() => {
            if (!this.registerAndSubscribeVisible) {
              this.tabShow = 1
            }
          }, 1000)
        }
      },
      /**
       * @startProcess
       */
      async startProcess(works) {
        console.log('startProcess', works)
        if (this.workState === 'offline') {
          this.workState = 'online'
          this.startOfflineProcess()
          return
        }
        if (works.length === 0) {
          this.processLoading = false
          return
        }
        const work = works[0]
        if (work.status === Work.statusImageTooLarge) {
          this.processLoading = false
          this.errorInfoReport('image too large')
          this.failedToContinueProcess(works)
          return
        }
        //未付费用户记录处理的内容 (未登录 | free用户)
        const notPaying = !this.isPaied
        if (!this.$getCookie('token') || notPaying) {
          const workConfig = work.params.config
          //工作流
          if (workConfig.job === 'workflow') {
            this.$setCookie('cloud_workflow_elk', '1', '365') //功能名称
          } else {
            this.$setCookie('cloud_workflow_elk', '0', '365') //功能名称
            this.$setCookie('cloud_process_type_final', localStorage.getItem('type'), '365') //功能名称
            //不是工作流
            if (Array.isArray(workConfig)) {
              //工作流
              this.$setCookie(
                'model_name_final',
                workConfig[0].config.module === 'animegan2c'
                  ? workConfig[0].config.module
                  : workConfig[0].config.module_params.model_name,
                '365'
              ) //功能名称
            } else {
              this.$setCookie('cloud_model_name_final', workConfig.module_params.model_name, '365') //模型名称
            }
          }
        }
        //未付费用户记录处理的内容 (未登录 | free用户)end
        if (work.sample) {
          this.getProgressAndStartNextForSample(works)
          return
        }
        if (!this.$getCookie('token')) {
          if (!this.freeWorkType(work.operation) && this.$getCookie('leftCredits') <= 0) {
            this.works = this.works.filter((item) => item !== work)
            //游客积分不足
            this.notPoint = true
            this.isProcess = true
            this.registerAndSubscribeVisible = true
            this.$trace.traceCustomEvent({
              event: 'click',
              xargs_event_category: 'popup',
              event_value: 'no_credits_popup',
            })
            this.processLoading = false
            return
          }
        }
        if (work.offline) {
          setTimeout(() => {
            this.startProcess(works.slice(1, works.length))
          }, 2000)
        } else {
          if (this.workStartlocked) {
            return
          }
          this.workStartlocked = true
          //上传逻辑
          if (work.isLocal) {
            this.processLoading = false
            try {
              if (!work.uid) {
                const uploadImgData = await this.uploadImg(work)
                if (!uploadImgData || !uploadImgData.uid) {
                  this.handleError(works, work)
                }
                work.uid = uploadImgData.uid
              }
            } catch (error) {
              this.handleError(works, work, true)
              return
            }
          }
          work.startTime = Date.now()
          if (work.transId) {
            this.getProgressAndStartNext(works)
            return
          }
          work.status = Work.statusProcessing
          //临时对于sketch功能做处理
          this.addNewParams(work)
          this.workConfigurationPreprocessing(work, work.isPreset)
          //输出参数设置
          this.setOutParams(work)
          if (this.$getCookie('userType') === 'register') {
            this.$store.commit(
              'SET_REGISTER_TRIAL',
              JSON.stringify({
                ...this.$store.state.registerTrial,
                process: this.$store.state.registerTrial.process + 1,
              })
            )
            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'process',
              event_value: 'process',
              event_info: {
                free_user_trial_new: this.$store.state.registerTrial.process,
              },
            })
          } else if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
            this.$store.commit(
              'SET_GUEST_TRIAL',
              JSON.stringify({
                ...this.$store.state.guestTrial,
                process: this.$store.state.guestTrial.process + 1,
              })
            )
            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'process',
              event_value: 'process',
              event_info: {
                guest_trial_new: this.$store.state.guestTrial.process,
              },
            })
          }
          this.delWebKey(work)
          this.calulateSacle(work)

          let ext_params = {}
          if (work.params && work.params.config && work.params.config[0].ext_params) {
            ext_params = work.params.config[0].ext_params
          }
          let config = this.processExtendParams(work.uid, { ...work.new_params })
          config = this.formatEnlargeParams(config, work)
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'process',
            event_info: {
              process_status: 'start',
            },
          })

          //针对tp的enlarge、sharpen和denoise功能的自动选参数做上报
          if (
            (work.new_params.job == 'enlarge' && work.new_params.name == 'enlarge3') ||
            (work.new_params.job == 'sharpen' && work.new_params.name == 'va_sharpen_standard') ||
            work.new_params.job == 'denoise'
          ) {
            let autoparams = ''
            let model_name = ''
            if (work.new_params.config.length == 1) {
              if (work.new_params.config[0].config.module_params.autoparams) {
                autoparams = 'true'
              } else {
                autoparams = 'false'
              }
              model_name = work.new_params.config[0].config.module_params.model_name
            }
            if (work.new_params.config.length == 2) {
              if (work.new_params.config[0].name == 'CodeFormer') {
                if (work.new_params.config[1].config.module_params.autoparams) {
                  autoparams = 'true'
                } else {
                  autoparams = 'false'
                }
                model_name = work.new_params.config[1].config.module_params.model_name
              } else {
                if (work.new_params.config[0].config.module_params.autoparams) {
                  autoparams = 'true'
                } else {
                  autoparams = 'false'
                }
                model_name = work.new_params.config[0].config.module_params.model_name
              }
            }
            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'process',
              event_value: 'autoparams',
              event_info: {
                autoparams,
                model_name,
              },
            })
          }

          try {
            Work.start(
              work.operation,
              work.uid,
              config,
              work.workflowId,
              work.config.scale,
              work.dst_file_name
            ).then((res) => {
              res = res.data
              if (!res) {
                this.processLoading = false
                this.workStartlocked = false
                work.status = Work.statusProcessFailed
                this.failedToContinueProcess(works)
                return
              }
              let process_type = this.presetOptions.includes(work.operation) ? 'workflow' : work.operation
              let process_params = '',
                model_name = ''
              const configs = work.new_params.config
              const firstConfig = configs[0].config
              const workflow = configs.length > 1
              model_name = firstConfig.module_params.model_name

              if (process_type === Work.typeWorkflow) {
                process_type = this.presetOptions.includes(work.operation) ? 'workflow' : work.params.job
              } else {
                process_type = work.params.job
                const config = work.params.config[0].config
                process_params = config.module_params
                if (process_type === Work.typeWaifu) {
                  if (config.module === 'real_esrgan') {
                    process_type = Work.typeRealesrgan
                  }
                } else if (process_type === Work.typeChainnerTxt) {
                  process_type = Work.typeChainner
                } else if (process_type === Work.typeEnlarge2) {
                  process_type = Work.typeEnlarge
                }

                //Cutout.pro 的API测试1.3
                // if (
                //   process_type === Work.typeSharpen &&
                //   cutoutCityList.includes(localStorage.getItem(COUNTRY))
                // ) {
                //   process_type = Work.typeSharpenCop
                // }
                if (config.module === Work.typeSketch) {
                  if (config.module_params.auto_mode) {
                    model_name = 'workflow_sketch'
                  } else {
                    model_name = 'SketchStable'
                  }
                }
                if (config.module === Work.typeRepair) {
                  if (config.module_params.convert) {
                    model_name = 'workflow_repair_colorize'
                  } else {
                    if (config.module_params.auto_mode) {
                      model_name = 'workflow_repair'
                    } else {
                      model_name = 'RepairStable'
                    }
                  }
                }
                if (config.module === Work.typeSharpen) {
                  if (config.module_params.auto_mode) {
                    model_name = 'workflow_sharpen'
                  } else {
                    model_name = 'SharpenStable'
                  }
                }
                if (work.params.name === Work.typeSharpen) {
                  if (config.module === Work.typeWaifu) {
                    model_name = 'sharpen_anime'
                  }
                }
                if (config.module === WorkFlowType.animegan2c) {
                  model_name = 'animegan2c'
                }
              }
              const sceneObj = {
                'se-night': 'ai_night_scene',
                'se-hd': 'ai_super_hd',
                'se-portrait-enhancement': 'ai_portrait_enhancement',
                'se-old-repair': 'ai_old_photo_repire_colorize',
              }

              work.elk = {
                process_type,
                process_id: work.transId,
                process_method:
                  work.operation === Work.typeWorkflow || this.presetOptions.includes(work.operation)
                    ? 'workflow'
                    : 'single',
                process_steps: work.params.config ? work.params.config.length : 0,
                model_name,
                workflow: !!workflow,
                process_params: JSON.stringify(process_params),
                elkweb_enlager_type: this.enlagerType,
                workflow_name:
                  sceneObj[
                    this.presetOptions.filter((item) => {
                      return work.operation === item
                    })
                  ],
              }

              const elkParam2 = {
                event_info: {
                  process_id: work.transId,
                  process_method:
                    work.operation === Work.typeWorkflow || this.presetOptions.includes(work.operation)
                      ? 'workflow'
                      : 'single',
                  process_steps: work.params.config ? work.params.config.length : 0,
                  process_type,
                  model_name,
                  workflow: !!workflow,
                  process_params: JSON.stringify(process_params),
                  workflow_name:
                    sceneObj[
                      this.presetOptions.filter((item) => {
                        return work.operation === item
                      })
                    ],
                },
              }
              if (this.enlagerType && process_type !== 'workflow') {
                elkParam2['event_info']['enlager_type'] = this.enlagerType
              }

              //新卡通模型
              if (process_type === 'cartoonize' || process_type === 'animegan_toon') {
                if (
                  [
                    'style1',
                    'style2',
                    'style3',
                    'style4',
                    'style5',
                    'style6',
                    'Ghibli_girl',
                    'Ghibli_boy',
                    'shinkai_girl',
                    'shinkai_boy',
                    'disney_girl',
                    'disney_boy',
                    'us_comic_girl',
                    'us_comic_boy',
                  ].includes(model_name)
                ) {
                  elkParam2.event_info.model_type = 'sd'
                  elkParam2.event_info.style_strength = process_params.style_strength
                  elkParam2.event_info.prompt_value = process_params.description || 'false'

                  if (ext_params) {
                    elkParam2.event_info.cartoon_model_type = ext_params.cartoon_model_type
                    elkParam2.event_info.process_style_type = ext_params.process_style_type
                  }
                } else {
                  elkParam2.event_info.model_type = 'traditional'
                }
              }

              //TO DO：后续考虑做成配置化
              if (config.name === 'repair_sd') {
                delete elkParam2['event_info']['process_steps']
              }

              //放大模型的人脸增强进行上报
              const lastConfig = work.new_params.config[0]
              if (work.new_params.job === WorkFlowType.enlarge) {
                if (lastConfig.name === WorkFlowType.CodeFormer) {
                  elkParam2['event_info']['enlarge_codeformer'] = 'true'
                } else {
                  elkParam2['event_info']['enlarge_codeformer'] = 'false'
                }
              }

              //黑白照片新上色模式 start
              //1.上色功能中
              if (process_type === WorkFlowType.colorize) {
                if (model_name === WorkFlowType.sd_recolor) {
                  elkParam2.event_info.color_type = 'delicate'
                } else {
                  elkParam2.event_info.color_type = 'Classic'
                }
              }
              //2.老照片修复功能中
              if (process_type === 'old_photo_restorer2') {
                const lastConfig = work.new_params.config[work.new_params.config.length - 1]
                if (lastConfig.name === WorkFlowType.recolor) {
                  elkParam2.event_info.color_type = 'delicate'
                } else if (lastConfig.name === WorkFlowType.colorize) {
                  elkParam2.event_info.color_type = 'Classic'
                }
              }
              //黑白照片新上色模式 end

              this.$trace.traceCustomEvent({
                event: 'online_work',
                xargs_event_category: 'process',
                event_value: 'process',
                ...elkParam2,
              })
              //Cutout.pro 的API测试1.3
              if (
                work.operation === WorkFlowType.sharpen &&
                cutoutCityList.includes(localStorage.getItem(COUNTRY))
              ) {
                this.$setCookie('cloud_process_cop', 'sharpen_cop')
              }
              if (res.code === 10012) {
                this.works = this.works.filter((item) => item !== work)
                // 用户余额不足
                this.processLoading = false
                this.notPoint = true
                this.isProcess = true
                this.registerAndSubscribeVisible = true
                this.$trace.traceCustomEvent({
                  event: 'click',
                  xargs_event_category: 'popup',
                  event_value: 'no_credits_popup',
                })
              } else if (res.code === 200) {
                if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
                  this.$trace.traceCustomEvent({
                    event: 'online_work',
                    xargs_event_category: 'process',
                    event_value: 'process',
                    event_info: {
                      process_id: res.data.trans_id,
                      process_first_image: 'processing',
                    },
                  })
                }
                work.status = Work.statusProcessing
                //TODO 待验证
                // work.filename = work.filename
                if (work.operation === 'workflow') {
                  work.targetName = work.operation + '-' + work.filename
                } else if (Work.operation === Work.typeEnlarge) {
                  work.targetName = work.operation + '-' + work.config.scale + 'x-' + work.filename
                } else {
                  work.targetName = work.operation + '-' + work.filename
                }
                work.targetName = work.operation + '-' + work.filename

                work.transId = res.data.trans_id

                work.config.initScale = work.config.scale

                const usedWorkNum = parseInt(this.$getCookie('cloud_usedWorkNum'))
                if (usedWorkNum) {
                  if (usedWorkNum > 0) {
                    this.$setCookie('cloud_usedWorkNum', usedWorkNum + 1)
                  } else {
                    this.$setCookie('cloud_usedWorkNum', 1)
                  }
                } else {
                  this.$setCookie('cloud_usedWorkNum', 1)
                }

                this.getProgressAndStartNext(works)
              } else {
                work.status = Work.statusProcessFailed
                work.targetName = work.operation + '-' + work.filename
                if (work.operation === Work.typeEnlarge) {
                  work.targetName = work.operation + '-' + work.config.scale + 'x-' + work.filename
                }

                work.transId = ''
                work.config.initScale = work.config.scale
                this.workStartlocked = false
                this.startProcess(works.slice(1, works.length))
              }
              //存储处理功能的模型名称 下载图片上报elk的时候要使用
              this.tansIdModel({ transId: work.transId, model_name })
            })
          } catch (error) {
            this.handleError(works, work, true)
          }
        }
      },
      handleError(works, work, error) {
        this.processLoading = false
        this.workStartlocked = false
        this.getProgressAndStartNextlcked = false
        if (error) {
          this.$message.error(this.$t('common.check_network'))
          this.errorInfoReport(error.message)
        }
        if (work) {
          work.status = Work.statusProcessFailed
        }
        this.failedToContinueProcess(works)
      },
      //处理失败继续处理下一张
      failedToContinueProcess(works) {
        works.splice(0, 1)
        this.startProcess(works)
      },
      //图片处理错误信息上报
      errorInfoReport(errorInfo) {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'process',
          event_value: 'process_error',
          event_info: {
            error_info: errorInfo || {},
          },
        })
      },

      /**
       * @tansIdModel 建立tansID 与 模型的关系 (下载图片的时候要使用)
       * @param {Object} req  transId | model_name
       */
      tansIdModel(req) {
        let tansId_modelJson = localStorage.getItem(TRANSID_MODAL)
        if (tansId_modelJson) {
          tansId_modelJson = JSON.parse(tansId_modelJson)
        } else {
          tansId_modelJson = {}
        }
        tansId_modelJson[req.transId] = req.model_name
        try {
          localStorage.setItem(TRANSID_MODAL, JSON.stringify(tansId_modelJson))
        } catch (e) {
          localStorage.removeItem(TRANSID_MODAL)
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'cloud',
            event_value: 'localstorage_quota_exceeded',
            event_info: {
              token: this.$getCookie('token'),
              guestTokenV2: this.$getCookie('guestTokenV2'),
              email: this.$getCookie('email'),
              key: TRANSID_MODAL,
            },
          })
        }

        let tansId_model_btn = localStorage.getItem(TRANS_MPDAL_BTN)
        if (tansId_model_btn) {
          tansId_model_btn = JSON.parse(tansId_model_btn)
        } else {
          tansId_model_btn = {}
        }
        tansId_model_btn[req.transId] = this.enlagerType
        try {
          localStorage.setItem(TRANS_MPDAL_BTN, JSON.stringify(tansId_model_btn))
        } catch (e) {
          localStorage.removeItem(TRANS_MPDAL_BTN)
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'cloud',
            event_value: 'localstorage_quota_exceeded',
            event_info: {
              token: this.$getCookie('token'),
              guestTokenV2: this.$getCookie('guestTokenV2'),
              email: this.$getCookie('email'),
              key: TRANS_MPDAL_BTN,
            },
          })
        }
      },
      getProgressAndStartNext(works) {
        if (this.getProgressAndStartNextlcked) {
          return
        }
        works = this.unprocessedWorks
        if (works.length <= 0) {
          return
        }
        const work = works[0]

        if (!work.transId) {
          this.startProcess(works)
          return
        }
        // // Timeout
        // if (work.operation !== 'workflow') {
        //   if (Date.now() - work.startTime >= this.timeout) {
        //     work.status = Work.statusProcessFailed
        //     this.workStartlocked = false
        //     this.getProgressAndStartNextlcked = false

        //     this.$trace.traceCustomEvent({
        //       event: 'online_work',
        //       xargs_event_category: 'process',
        //       event_value: 'process',
        //       event_info: {
        //         process_id: work.transId,
        //         uid: work.uid,
        //         process_failed_reason: 'Timeout 180s',
        //         process_status: 'timeout',
        //         image_resolution: work.image_resolution,
        //       },
        //     })
        //     this.startProcess(works.slice(1, works.length))
        //     return
        //   }
        // }
        this.getProgressAndStartNextlcked = true
        Work.getProgress(work.transId)
          .then((res) => {
            res = res.data
            this.getProgressAndStartNextlcked = false
            this.busyJobs = 0
            if (res.code === 200) {
              this.process_time = res.data.process_time
              if (res.data.status === 'busy') {
                this.busyJobs = Number(JSON.parse(res.data.content).data) || 0
              }
              // 测试参数
              const { count, isPay } = this.$route.query
              if (count) {
                this.queryQueueParams = {
                  count,
                  isPay: isPay === 'true',
                }
                this.busyJobs = parseInt(count)
                this.process_time = 100
              }

              if (res.data.status === 'finish') {
                work.status = Work.statusFinished
                //记录处理后的文件大小
                work.filesize = res.data.filesize
                // 递归，开始本批的下一个任务
                this.workStartlocked = false
                this.startProcess(works.slice(1, works.length))

                const filter = this.tabsList.filter((item) => item.tab === 'processed')
                if (filter && filter.length) {
                  if (!work.offline && !work.del) {
                    filter[0].successCount++
                    localStorage.setItem('successCount', filter[0].successCount)
                  }
                }
                work.endTime = Date.now()
                const configs = work.params.config
                const workflow = configs && configs.length > 1
                const firstModelName = configs && configs[0].config.module_params.model_name
                const send_model_name = firstModelName || work.elk.model_name
                const [width, height] = (work.image_resolution || '').split('X')
                const image_megapixels = (width || 0) * (height || 0)

                this.$trace.traceCustomEvent({
                  event: 'online_work',
                  xargs_event_category: 'process',
                  event_value: 'process',
                  event_info: {
                    is_queued: this.is_queued,
                    process_id: work.transId,
                    process_type: work.elk.process_type,
                    model_name: send_model_name,
                    workflow: !!workflow,
                    process_status: 'success',
                    process_time: parseFloat((work.endTime - work.startTime) / 1000),
                    image_resolution: work.image_resolution,
                    image_megapixels,
                  },
                })
                this.getPoint()

                // 只在第一次完成时维护 leftCredits
                if (work.status !== Work.statusFinished) {
                  if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
                    setTimeout(() => {
                      const filter = this.tabsList.filter((item) => item.tab === 'processed')
                      if (filter && filter.length) {
                        filter[0].successCount = 0
                        localStorage.removeItem('successCount')
                      }
                      this.tabShow = 2
                      this.$refs['processed'].onPreview(work)
                    }, 1000)
                  }
                  this.getPoint()
                  if (this.$getCookie('userType') === 'guest') {
                    const usedWorkNum = parseInt(this.$getCookie('cloud_usedWorkNum'))
                    if (usedWorkNum) {
                      if (usedWorkNum > 0) {
                        this.$trace.traceCustomEvent({
                          event: 'click',
                          xargs_event_category: 'other',
                          event_info: {
                            guest_trial: usedWorkNum > 6 ? 6 : usedWorkNum + 1,
                          },
                        })
                      } else {
                        this.$trace.traceCustomEvent({
                          event: 'click',
                          xargs_event_category: 'other',
                          event_info: {
                            guest_trial: 1,
                          },
                        })
                      }
                    } else {
                      this.$trace.traceCustomEvent({
                        event: 'click',
                        xargs_event_category: 'other',
                        event_info: {
                          guest_trial: 1,
                        },
                      })
                    }
                  } else if (this.$getCookie('userType') === 'register') {
                    this.$trace.traceCustomEvent({
                      event: 'click',
                      xargs_event_category: 'other',
                      event_info: {
                        free_user_trial: 6 - this.userInfo.leftCredits,
                      },
                    })
                    this.$trace.traceCustomEvent({
                      event: 'click',
                      xargs_event_category: 'other',
                      event_info: {
                        free_user_trial: 6 - this.userInfo.leftCredits,
                      },
                    })
                    this.$trace.traceCustomEvent({
                      event: 'click',
                      xargs_event_category: 'other',
                      event_info: {
                        free_user_trial: 6 - this.userInfo.leftCredits,
                      },
                    })
                  }
                }
              } else if (res.data.status === 'fatal') {
                const filter = this.tabsList.filter((item) => item.tab === 'processed')
                if (!work.del && filter && filter.length) {
                  filter[0].successCount++
                  localStorage.setItem('successCount', filter[0].successCount)
                }

                work.endTime = Date.now()
                const [width, height] = (work.image_resolution || '').split('X')
                const image_megapixels = (width || 0) * (height || 0)

                this.$trace.traceCustomEvent({
                  event: 'online_work',
                  xargs_event_category: 'process',
                  event_value: 'process',
                  event_info: {
                    process_id: work.transId,
                    process_status: 'failed',
                    processing_time: parseFloat((work.endTime - work.startTime) / 1000),
                    image_resolution: work.image_resolution,
                    image_megapixels,
                  },
                })

                work.status = Work.statusProcessFailed
                // 递归，开始本批的下一个任务
                this.workStartlocked = false
                this.startProcess(works.slice(1, works.length))
              } else if (res.data.status === 'progress') {
                if (work.del) {
                  const params = {
                    trans_ids: [work.transId],
                  }
                  this.delWork(params).then((res) => {
                    if (res.code === 200) {
                      this.works = this.works.filter((item) => item !== work)
                    }
                  })
                } else {
                  work.status = Work.statusProcessing
                }
                const that = this
                setTimeout(() => {
                  that.getProgressAndStartNext(works)
                }, this.intervalTime)
              } else {
                if (work.del) {
                  const params = {
                    trans_ids: [work.transId],
                  }
                  this.delWork(params).then((res) => {
                    if (res.code === 200) {
                      this.works = this.works.filter((item) => item !== work)
                    }
                  })
                  setTimeout(() => {
                    this.workStartlocked = false
                    this.startProcess(works.slice(1, works.length))
                  }, 2000)
                } else {
                  work.status = Work.statusProcessing
                  const that = this
                  setTimeout(() => {
                    that.getProgressAndStartNext(works)
                  }, this.intervalTime)
                }
              }

              if (res.data.status !== 'busy') {
                this.is_queued = '0'
              }
            } else {
              this.handleError(works, work)
              this.is_queued = '0'
              const [width, height] = (work.image_resolution || '').split('X')
              const image_megapixels = (width || 0) * (height || 0)

              this.$trace.traceCustomEvent({
                event: 'online_work',
                xargs_event_category: 'process',
                event_value: 'process',
                event_info: {
                  process_id: work.transId,
                  process_failed_reason: res.content,
                  processing_time: parseFloat((Date.now() - work.startTime) / 1000),
                  image_resolution: work.image_resolution,
                },
              })
            }
          })
          .catch((err) => {
            console.log('err', err)
            this.$message.error(this.$t('common.check_network'))
            this.handleError(works, work)
          })
      },
      getProgressAndStartNextForSample(works) {
        if (works.length <= 0) {
          return
        }
        const work = works[0]
        work.status = Work.statusProcessing
        const that = this
        setTimeout(() => {
          work.endTime = Date.now()
          work.status = Work.statusFinished
          if (!this.$getCookie('cloud_isFirstVisit') && !this.$getCookie('token')) {
            setTimeout(() => {
              const filter = this.tabsList.filter((item) => item.tab === 'processed')
              if (filter && filter.length) {
                filter[0].successCount = 0
                localStorage.removeItem('successCount')
              }
              this.tabShow = 2
              this.$refs['processed'].onPreview(work)
            }, 1000)
          }
          const configs = work.params.config
          const workflow = configs && configs.length > 1
          const firstModelName = configs && configs[0].config.module_params.model_name
          const send_model_name = firstModelName
          const [width, height] = (work.image_resolution || '').split('X')
          const image_megapixels = (width || 0) * (height || 0)

          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'process',
            event_value: 'process',
            event_info: {
              process_photo: 'sample',
              sample_position: work.selIndex,
              process_id: work.transId,
              model_name: send_model_name,
              workflow: !!workflow,
              process_status: 'success',
              process_time: parseFloat((work.endTime - work.startTime) / 1000),
              image_resolution: work.image_resolution,
            },
          })
          if (this.$getCookie('userType') === 'register') {
            this.$store.commit(
              'SET_REGISTER_TRIAL',
              JSON.stringify({
                ...this.$store.state.registerTrial,
                process: this.$store.state.registerTrial.process + 1,
              })
            )
            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'process',
              event_value: 'process',
              event_info: {
                free_user_trial_new: this.$store.state.registerTrial.process,
              },
            })
          } else if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
            this.$store.commit(
              'SET_GUEST_TRIAL',
              JSON.stringify({
                ...this.$store.state.guestTrial,
                process: this.$store.state.guestTrial.process + 1,
              })
            )

            this.$trace.traceCustomEvent({
              event: 'online_work',
              xargs_event_category: 'process',
              event_value: 'process',
              event_info: {
                guest_trial_new: this.$store.state.guestTrial.process,
              },
            })
          }

          // 递归，开始本批的下一个任务
          that.startProcess(works.slice(1, works.length))
        }, 4000)
      },
      async init() {
        // const works = await this.getDbData('worksNew')
        // if (works) {
        //   const val = JSON.parse(works).filter((item) => {
        //     return item.status === Work.statusFinished || item.status === Work.statusProcessFailed
        //   })
        //   this.setDbData('worksNew', JSON.stringify(val))
        // }
      },
      //
      onTabChanged(idx) {
        this.tabShow = idx
        if (idx === 2) {
          const filter = this.tabsList.filter((item) => item.tab === 'processed')
          if (filter && filter.length) {
            filter[0].successCount = 0
            localStorage.removeItem('successCount')
          }
        }
      },
      // 隐藏弹窗
      hide() {
        this.lockWinFun(false)
        this.$emit('update:show', false)
        setTimeout(() => {
          closeWorkspaceDialog()
        }, 100)
      },

      // 编辑图片弹窗
      onImgEdit(item) {
        this.imgEditDialog.show = true
        this.imgEditDialog.data = item
      },
      closeBottomAdBanner() {
        sessionStorage.setItem('bottomAdBannerShow', false)
        this.bottomAdBannerShow = false
      },
      closeAdBox() {
        sessionStorage.setItem('AdboxShow', false)
        this.AdboxShow = false
      },
      getAdShowType() {
        this.bottomAdBannerShow = sessionStorage.getItem('bottomAdBannerShow') !== 'false'
        this.AdboxShow = sessionStorage.getItem('AdboxShow') !== 'false'
      },
      checkRepair(work) {
        if (
          (work.params.name === 'repair' ||
            (work.params.config instanceof Array &&
              work.params.config.find((item) => {
                return item.name === 'repair'
              }))) &&
          (work.w >= 2000 || work.h >= 2000)
        ) {
          return true
        }
        return false
      },
      repairStatus(work) {
        if (this.repairProcess !== 'execdialog' && this.repairProcess !== 'continuedialog') {
          if (!this.$getCookie('cloud_repair_limit_dialog_show') && this.checkRepair(work)) {
            this.limitDialog = true
            return false
          }
        }
        return true
      },
      sizeLimitCancel() {
        this.repairProcess = 'cancel'
        this.limitDialog = false
      },
      sizeLimitContinue() {
        if (this.$refs['limit_check'].checked) {
          this.$setCookie('cloud_repair_limit_dialog_show', '1', 365)
          this.repairProcess = 'execdialog'
        } else {
          this.repairProcess = 'continuedialog'
        }
        this.limitDialog = false
      },
      showStartOfflineBtn() {
        this.offlineBtnShow = !this.offlineBtnShow
      },
      cancelOffline() {
        this.offlineVisible = false
      },
      cancelOutSet() {
        this.outSetVisible = false
      },
      // 离线
      enableOffline() {
        this.showNewFeature = false
        this.offlineWork = true
        this.offlineVisible = false
        this.onStartProcess('offline')
      },
      async startOfflineProcess() {
        this.breakOfflineWorkUpload = false
        const params = {
          uids: [],
          jconfig: '',
          workflow_id: '',
        }
        const cids = []
        // let works = this.works.filter((item) => item.status === Work.statusWaiting)
        const works = this.works.splice(this.oldWorkLength, this.oldWorkLength + this.newWorkLength)
        const filters = works.filter((item) => !item.uid)
        if (filters && filters.length) {
          this.offlineWorks = filters
          this.offlineWorkerUploadVisible = true
          for (let i = 0; i < filters.length; i++) {
            if (this.breakOfflineWorkUpload) {
              return
            }
            const data = await this.uploadImg(filters[i])
            if (data && data.uid) {
              filters[i].uid = data.uid
            }
          }
          this.offlineWorkerUploadVisible = false
        }
        if (this.breakOfflineWorkUpload) {
          return
        }
        this.$message.success(this.$t('workspace.offline_process_tip'))
        works.forEach((item) => {
          cids.push(item.cid)
          params.uids.push(item.uid)
          item.offline = true
        })
        if (works && works.length) {
          console.log('')
          // params.jconfig = JSON.stringify(works[0].params)
          const targetWork = works[0]
          this.addNewParams(targetWork)
          this.workConfigurationPreprocessing(targetWork, targetWork.isPreset)
          this.setOutParams(targetWork)
          this.delWebKey(targetWork)
          // this.processExtendParams
          const jconfig = targetWork.new_params
          // let scale = 4
          // 临时处理jsconfig scale传参问题 4x -> 4
          if (jconfig.config && jconfig.config.length > 0) {
            jconfig.config.forEach((item) => {
              // if (item.config && item.config.module_params && item.config.module_params.scale) {
              //   if (item.config.module_params.scale.includes('x')) {
              //     const noXScale = item.config.module_params.scale.replace('x', '')
              //     item.config.module_params.scale = Number(noXScale)
              //   }
              //   // scale = item.config.module_params.scale
              // }

              if (item.config && item.config.module_params && item.config.module_params.p) {
                const p = item.config.module_params.p
                const r = p / targetWork.h
                item.config.module_params.height = p
                item.config.module_params.width = Math.ceil(targetWork.w * r)
                delete item.config.module_params.p
              }
            })
          }
          // 临时处理
          if (jconfig.name === 'old_photo_restorer2') {
            jconfig.name = 'repair_sd'
          }
          // delete jconfig.job
          params.jconfig = JSON.stringify(jconfig)
          // params.scale = scale
          params.workflow_id = targetWork.workflowId || ''
        }
        if (params) {
          return
        }
        const that = this
        Work.batchTransform(params)
          .then((res) => {
            if (res.code === 200) {
              this.$message({
                type: 'success',
                message: this.$t('workspace.offline_process_success'),
                duration: 3000,
              })
              this.$emit('filterWorks', cids)
              this.offlineWork = false
              this.$trace.traceCustomEvent({
                event: 'click',
                xargs_event_category: 'other',
                event_value: 'offline_enabled',
              })
            } else {
              this.$message({
                type: 'error',
                message: this.$t('workspace.offline_process_fail'),
                duration: 3000,
              })
              this.offlineWork = false
              works.forEach((item) => {
                item.offline = false
              })
            }
            that.tabShow = 1
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: this.$t('workspace.offline_process_fail'),
              duration: 3000,
            })
            this.offlineWork = false
            works.forEach((item) => {
              item.offline = false
            })
          })
      },
      offlineWorkClick(val) {
        //如果选中不再显示弹窗
        if (this.showDontshowAgain) {
          if (val) {
            this.offlineVisible = true
          }
          this.offlineWork = false
        } else {
          this.enableOffline()
        }
      },
      getDontShowAgain() {
        const dontShowAgain = this.$getCookie('cloud_dontshowagain')
        if (dontShowAgain && dontShowAgain === '1') {
          this.showDontshowAgain = false
        } else {
          this.showDontshowAgain = true
        }
      },
      dontShowAgainChange(val) {
        if (val) {
          this.$setCookie('cloud_dontshowagain', '1', 1)
          this.showDontshowAgain = false
        } else {
          this.$setCookie('cloud_dontshowagain', '0', 1)
          this.showDontshowAgain = true
        }
      },
      outSetShow() {
        if (!this.isPaied) {
          // show upgrate dialog
          this.outSetVisible = true
          return
        }
        this.outSettingShow = !this.outSettingShow
      },
      confirmOutSet() {
        this.outSettingShow = false
        if (this.outSettingConfig.isRemerber) {
          this.$setCookie('cloud_outSeting', JSON.stringify(this.outSettingConfig), 365)
        } else {
          this.$setCookie('cloud_outSeting', '', -1)
        }
      },
      closeOutSet() {
        this.outSettingShow = false
        // 未修改使用默认值或本地记录cookie值
        this.getOutSetting()
      },
      setOutParams(work) {
        const config = work.new_params.config.pop()
        config.config.out_params = work.out_params
        work.new_params.config.push(config)
      },
      getOutParams() {
        const result = {}
        if (!Object.prototype.hasOwnProperty.call(this.outSettingConfig, 'keep_origin_name')) {
          this.outSettingConfig.keep_origin_name = !!this.outSettingConfig.keep_origin_name
        }
        for (const key in this.outSettingConfig) {
          if (this.outSettingConfig[key] !== 'default') {
            if (this.outSettingConfig[key] === 'custom') {
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
      setFileName(filename, type) {
        // eslint-disable-next-line no-console
        if (type && type !== 'default') {
          return filename.replace(/\.(jpg|png|jpeg|gif)$/, '.' + type).toLowerCase()
        }
        return filename.toLowerCase()
      },
      beforeUpload(flag) {
        this.enableUploadPrompt = flag
      },
    },
    // head() {
    //   return {
    //     script: [
    //       {
    //         // async: true,
    //         defer: true,
    //         src: 'https://www.dropbox.com/static/api/2/dropins.js',
    //         id: 'dropboxjs',
    //         'data-app-key': '11wrhmqgmu13k1i',
    //       },
    //     ],
    //   }
    // },
  }
</script>

<style lang="less" scoped>
  .icon-s-upload,
  .icon-s-refresh,
  .icon-s-complete {
    font-size: 16 / @base;
    color: #4d4d4d;
  }

  .icon-s-upload.active,
  .icon-s-refresh.active,
  .icon-s-complete.active {
    color: #0374ff;
  }

  /deep/ .el-loading-spinner {
    margin-top: -10px !important;
  }

  .dialog-ctr {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
    background: rgba(0, 0, 0, 0.6);
  }

  .title-text:hover {
    .icon-s-upload,
    .icon-s-refresh,
    .icon-s-complete {
      color: #0374ff;
    }
  }

  .img-box {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -650px;
    height: 480px;
    margin: auto 0;
  }

  .free-download {
    display: flex;
    align-items: center;
  }

  .guide_box {
    padding-top: 27 / @base;
  }

  .guide_img {
    img {
      width: 420px;
      height: 390px;
    }
  }

  .guid_txt {
    height: 40px;
  }

  .block-placeholder {
    min-width: 4rem;
    margin-right: 1rem;
    text-align: left;
  }

  /deep/ .discount-line {
    padding-bottom: 20 / @base;
  }

  .block-placeholder-small {
    min-width: 4rem;
    margin-right: 1rem;
    text-align: left;
  }

  .credict-top {
    font-weight: 700;
    color: #0374ff !important;
  }

  .batch-process-dialog {
    .title-r {
      display: flex;
    }
  }

  .batch-exec {
    .workflow-operator {
      padding: 10px 20px;
    }
    // padding-top: 2.7rem !important;
    // margin-bottom: 20 / @base !important;
    .container {
      width: 100%;
      max-width: 100%;
      height: 100%;
      min-height: 100%;
      max-height: 100%;
      padding: 0;
    }

    .title-r {
      display: none;
    }

    .workflow-tab-container {
      flex: 1;
      min-height: 18rem;
      max-height: calc(100vh - 20rem);
    }

    // .work-tab {
    //   display: flex;
    //   flex-direction: column;

    //   .workflow-works {
    //     // max-height: calc(100vh - 28rem);
    //     // min-height: 18rem;
    //     overflow: auto;
    //   }
    // }

    .config-con {
      .work-tabs {
        .work-tab-workflow {
          min-height: 18rem;
          max-height: calc(100vh - 28rem);
        }
      }
    }
  }

  .batch-process {
    min-height: calc(100vh - 64px);
  }

  .batch-process.batch-process-dialog {
    .workspace-nav {
      display: none;
    }

    .con-box {
      .container {
        box-sizing: border-box;
        width: 100vw;
        min-width: 100vw;
        max-width: 100vw;
        height: 100vh;
        min-height: 620px;
        // padding: 40px;
        padding: 0;
        margin: 0;

        .process-container {
          height: 100%;
          min-height: 100%;
          max-height: 100%;
          .top {
            position: absolute;
            width: 100%;
          }
        }
      }
    }
  }

  .process--body-container {
    position: relative;
    display: flex;
    width: 100%;
    // overflow: hidden;
  }

  .process-container {
    display: flex;
    flex-direction: column;

    /deep/ .col-lg-4 {
      width: 30%;
      max-width: 360px;
    }

    /deep/ .col-lg-8 {
      flex: 1;
      min-width: 70%;
    }

    .linear-cont {
      display: flex;
      flex: 1;
      flex-direction: column;
    }

    .process--body-container {
      flex: 1;
    }
  }

  .batch-process {
    // margin: 60px auto;

    .process-container {
      background: #fff;

      .linear-cont {
        background: #fff;
      }
    }

    .upload-linear.over {
      overflow: auto;
    }

    .upload-linear {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 10 / @base;

      .linear-cont {
        position: relative;
        width: calc(100% - 1rem);
        min-height: 384 / @base;
        margin: 10 / @base 0.5rem;
        overflow: hidden;
        background: #f9fafc;
        border-radius: 6px;
      }

      .icon-upload-box {
        margin-left: 18 / @base;

        em {
          font-size: 16px;
          font-weight: bold;
          color: #2579f7;
          text-decoration: underline;

          &:hover {
            color: #2271e6;
          }
        }

        .icon_upload {
          width: 15px;
          height: 15px;
          background-position: -178 / @base -53 / @base;
        }
      }
    }

    .tit-box {
      height: 70px;
      border-bottom: 1px solid #efefef;

      .tit {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;

        .title-r {
          // display: flex;

          .user-info {
            display: flex;
            align-items: center;

            .user-item {
              display: flex;
              align-items: center;
              margin-left: 1rem;
              border-right: 1px solid #efefef;

              .link {
                margin-right: 1rem;
                color: #ff9d1d;
                white-space: nowrap;
              }

              .link:hover {
                text-decoration-line: underline;
                text-decoration-color: #ff9d1d;
              }

              .title {
                margin-right: 5px;
                font-weight: 500;
                white-space: nowrap;
              }

              .my_loding {
                margin-right: 1rem;
                font-size: 18px;
              }
            }

            > :last-child {
              border-right: 1px solid transparent;
            }
          }
        }
      }

      .primary-small-button {
        min-width: 170px;
        height: 38px;
        min-height: 38px;
        line-height: 38px;
      }

      .fill-btn {
        display: flex;
        align-items: baseline;
        color: @btnMainBg;
        cursor: pointer;
      }
    }

    .left-process-container {
      position: relative;
      min-height: calc(100vh - 11.5rem);
      background: #fff;
      border-right: 1px solid #efefef;

      .traffic-banner-upload {
        position: absolute;
        bottom: 0;
        left: 0;
      }

      .header-bn {
        position: absolute;
        bottom: 51px;
        z-index: 50;
      }

      // /deep/.processed-box {
      //   padding-bottom: 70px;
      // }
      .card-lt {
        display: flex;
        align-items: center;
        width: 75%;

        .filename {
          display: block;
          width: 400px;
          margin: 10 / @base 0;
          overflow: hidden;
          color: #4d4d4f;
          text-overflow: ellipsis;
          white-space: nowrap;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .img-info {
          font-size: 14px;
          color: #919191;

          & > span {
            &:last-child {
              padding-left: 20 / @base;
            }
          }
        }

        .img {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          overflow: hidden;
          border-radius: 5px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .operation-type {
          padding: 4px 6px;
          margin-right: 10px;
          font-size: 12px;
          color: #fff;
          background-color: #e27e1c;
          border-radius: 2px;
        }

        .my-sharpen {
          background-color: #e27e1c;
        }

        .my-denoise {
          background-color: #f5424f;
        }

        .my-enlarge {
          background-color: #1c71e5;
        }

        .my-colorize {
          background-color: #1c9be5;
        }

        .my-portrait {
          background-color: #1aaeae;
        }

        .my-cartoonize {
          background-color: #751094;
        }

        .my-perfect,
        .my-brightness {
          background-color: #12a568;
        }
      }

      .card-rt {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        span {
          display: inline-block;
          padding: 0 0.3rem;
          cursor: pointer;
        }

        .loadtxt {
          div {
            text-align: center;
          }
        }
      }
    }

    .tab-show {
      width: 100%;
    }

    .right-process-container {
      position: relative;
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 12.5rem);
      // min-height: 37rem;
      font-size: 14 / @base;
      text-align: left;

      .right-config-box {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding-top: 19px;

        .config-con {
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: space-between;

          .work-tabs {
            display: flex;
            flex: 1;
            flex-direction: column;

            .el-tabs__conten {
              flex: 1;
            }
          }
        }
      }

      .config-tit-box {
        h5 {
          display: flex;
          align-items: center;
          height: 50px;
        }

        .config-tit {
          padding: 0 20px;
        }
      }

      .config-con {
        //padding: 0 0 20px 0;
        overflow-y: auto;

        .workflow-tab-container {
          flex: 1;
          min-height: 18rem;
          max-height: calc(100vh - 20rem);
          overflow: auto;

          .workflow {
            margin-bottom: 10 / @base;
          }
        }

        // .work-tabs {
        //   width: 100%;

        //   .work-tab {
        //     height: 100%;
        //     min-height: 20rem;
        //   }

        //   .work-tab-workflow {
        //     min-height: 18rem;
        //     max-height: calc(100vh - 28rem);
        //     overflow-y: scroll;
        //   }

        //   /deep/ .el-tabs__item {
        //     height: 50 / @base;
        //     padding: 0;
        //     font-weight: bold;
        //     line-height: 50 / @base;
        //   }

        //   /deep/ .el-tabs__item.is-active {
        //     color: #0374ff;
        //   }

        // }

        .workflow-operation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-bottom: 10 / @base;

          .disable-tip {
            font-size: 12px;
            color: #9a9999;
          }

          .workflow-add-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 268 / @base;
            height: 34 / @base;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 3px;

            i {
              margin-right: 1rem;
            }

            &:hover {
              color: #0374ff;
              border: 1px solid #0374ff;
            }
          }

          .workflow-save {
            width: 100%;
            padding: 10px 0;
            font-size: 12px;
            color: #0374ff;
            text-align: center;
            cursor: pointer;

            &:hover {
              text-decoration: underline;
              text-decoration-color: #0374ff;
            }
          }
        }

        .work-select-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;

          .workflow-works {
            // max-height: calc(100vh - 28rem);
            // min-height: 18rem;
            overflow: auto;
          }

          .workflow-select-title {
            width: 100%;
            padding: 0 20px;
            margin-bottom: 5px;
          }

          .workflow-select {
            width: 100%;
            padding: 0 20px;
            margin-bottom: 10px;

            /deep/ .work-selection-down {
              max-height: 15rem;
              overflow: auto;

              .el-select-dropdown__item.selected {
                color: #fff;
                background: #409eff;
              }
            }
          }

          .empty-message {
            padding: 0 20px;
            margin: 50px 0;
            font-size: 14px;
          }

          .create-btn2 {
            width: 130px;
            padding: 0.5rem 1rem;
            font-size: 14px;
            color: #fff;
            cursor: pointer;
            background: #ff9d1d;
            border: none;
            border-radius: 3px;
          }

          .create-btn {
            width: 130px;
            cursor: pointer;
            background: #ff9d1d;
            border-radius: 3px;

            a {
              display: inline-block;
              width: 100%;
              height: 100%;
              padding: 0.5rem 1rem;
              font-size: 14px;
              color: #fff;
              text-align: center;
            }
          }
        }
      }

      div.upscale {
        font-size: 16 / @base;
        font-weight: bold;
        line-height: 44 / @base;
        color: #4f6785;
        text-align: left;
        cursor: pointer;
      }

      .cont1 {
        margin-top: 1rem;
      }

      .denoise {
        margin-top: 1rem;

        .block {
          display: flex;
          align-items: center;
          width: 100%;
        }
      }

      .denoise.sharpen1 {
        margin-top: 0.5rem;
        line-height: 1.4;
      }

      .scale {
        display: flex;
        justify-content: space-between;

        li {
          width: 54 / @base;
          height: 29 / @base;

          .el-button {
            width: 100%;
            height: 100%;
            text-align: center;

            &:hover {
              background-color: #fff;
            }
          }

          .el-button.disable {
            color: #ddd;
            cursor: auto;
            border-color: #ddd;
          }
        }

        li:hover {
          padding: 1px;
          background: #3887fe;
          border-radius: 3px;

          .el-button {
            color: #3887fe;
            background: #fff;
            border: none;
          }
        }

        li.active {
          .el-button {
            color: #fff;
            background: #3887fe;
            border: none;
          }
        }
      }

      .noise {
        display: flex;
        justify-content: space-between;
        margin-top: 20 / @base;

        &:last-of-type {
          margin-bottom: 10 / @base;
        }
      }

      .primary-small-button {
        width: 100%;
      }

      .note {
        padding: 10px;
        margin-top: 10px;
        font-size: 12px;
        color: #9a9999;
        background-color: #f8f8f8;
        border: 1px solid #d8e0e7;
      }

      .psd1 {
        position: relative;
        cursor: pointer;
        opacity: 0.7;

        &::after {
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 100%;
          content: '';
          background: rgba(255, 255, 255, 0.01);
        }
      }
    }

    .start-process {
      // flex: 1;
      // position: absolute;
      // bottom: 20px;
      width: 100%;
      padding: 20px 20px 0;
      border-top: 1px solid #efefef;

      .primary-small-button[disabled='disabled'] {
        cursor: not-allowed;
        background: #ffb467;
      }

      .el-btn {
        width: 100%;
        height: 45 / @base;
        font-size: 16px;
        color: #fff;
        background: -webkit-linear-gradient(0deg, rgb(255, 116, 109) 0%, rgb(255, 173, 162) 100%);
        background: linear-gradient(to right, rgb(255, 116, 109) 0%, rgb(255, 173, 162) 100%);
        border: none;
        box-shadow: 4px 6.928px 20px 0 rgb(255, 130, 143);
      }

      &.active {
        opacity: 0.5;
      }
    }

    .reduce {
      width: 100%;
      padding: 53 / @base 0 13 / @base;
      margin-top: 64 / @base;
      background: url('@{assetsImgPath}/batch/reduce.jpg') no-repeat;
      background-size: cover;

      .reduce_left {
        position: relative;
        float: left;
        width: 40%;

        img {
          width: 100%;
        }

        .tab_change {
          position: absolute;
          bottom: 15%;
          width: 100%;
          margin: 0 auto;
          text-align: center;

          .before {
            display: inline-block;
            width: 106 / @base;
            height: 26 / @base;
            margin-right: -5 / @base;
            line-height: 26 / @base;
            color: #000;
            text-align: center;
            cursor: pointer;
            background: #fff;
            border: 2px solid #fff;
            border-radius: 13 / @base 0 0 13 / @base;
          }

          .after {
            display: inline-block;
            width: 106 / @base;
            height: 26 / @base;
            line-height: 26 / @base;
            color: #000;
            text-align: center;
            cursor: pointer;
            background: #fff;
            border: 2px solid #fff;
            border-radius: 0 13 / @base 13 / @base 0;
          }

          .active {
            color: #fff;
            background: #1c1b1a;
          }
        }
      }

      .reduce_right {
        float: left;
        width: 60%;
        padding-left: 30 / @base;
        color: #fff;

        h2 {
          padding-top: 120 / @base;
          margin-bottom: 20 / @base;
          font-size: 42 / @base;
          line-height: 54 / @base;
        }

        p {
          line-height: 1.7;
        }
      }
    }

    .uploaded-box .upload-empty,
    .process-images .upload-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 0;
    }

    .uploaded-box {
      .uploaded {
        margin-top: 45 / @base;
      }
    }

    img {
      -webkit-user-drag: none;
      user-select: none;
    }

    .start-process {
      .el-btn {
        position: relative;
      }

      /deep/ .el-loading-mask {
        z-index: 20;
        height: 100%;
        background: @btnMainBg;
        border-radius: 2px;
      }

      /deep/ .el-loading-spinner .circular {
        width: 24px;
        height: 24px;
      }

      /deep/ .el-loading-spinner .path {
        stroke: rgba(255, 255, 255, 0.5);
        stroke-width: 8px;
        -webkit-animation: loading-dash 1.5s ease-in-out infinite;
        animation: loading-dash 1.5s ease-in-out infinite;
      }
    }

    .tit-box {
      justify-content: space-between;

      .title-tab {
        display: flex;

        .title-text {
          position: relative;
          display: flex;
          align-items: center;
          padding: 13.5px 35px;
          font-size: 1.125rem;
          cursor: pointer;

          i {
            margin-right: 10 / @base;
          }

          &:hover {
            color: #0374ff;
          }

          .upload-number {
            position: absolute;
            top: 15px;
            right: 0;
            min-width: 20px;
            height: 20px;
            padding: 0 3px;
            margin: 0;
            font-size: 14px;
            font-style: normal;
            line-height: 20px;
            color: #fff;
            text-align: center;
            background: #f93e3f;
            border-radius: 10px;
          }
        }

        .title-text.text-active {
          color: #0374ff;
          border-bottom: 2px solid #0374ff;
        }
      }
    }

    .process-images .process-tit {
      display: flex;
      justify-content: space-between;
      padding: 0 25px;
    }

    .upload-box .worksprocess {
      border: 0;
    }

    .checked {
      margin-right: 15px;
    }
  }

  .batch-process-dialog {
    .right-process-container {
      .config-con {
        .work-tabs .work-tab-workflow {
          height: auto;
        }
      }
    }

    .discount-line {
      display: none;
    }
  }

  .btn-sub {
    min-width: 169px;
    height: 36px;
    margin-left: 6px;
    line-height: 32px;
  }

  .finished {
    span {
      display: inline-block;
    }
  }

  .start-process-btns {
    position: relative;
  }

  .start-processing {
    display: flex;
    align-items: center;
    // display: none;
    .off-btn {
      // height: 2.75rem;
      // background: #ff9d1d;
      // color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem !important;
      min-width: 2.75rem !important;
      margin-left: 2 / @base;
      // border: none;

      // &:hover,
      // &:active,
      // &:focus {
      //   color: #fff;
      //   background: #ffb048;
      //   border-color: #ffb048;
      // }
    }

    .off-btn[disabled='disabled'] {
      cursor: not-allowed;
      background: #ffb467;
    }
  }

  .start-process-offline {
    position: absolute;
    top: 3rem;
    z-index: 30;
    width: 100%;
    text-align: center;
    background: #fff;
    border: 1px solid #ccc;

    .offline-btn {
      width: 100%;
      height: 2.75rem;
      font-size: 16px;
      font-weight: bold;
      color: rgb(77, 77, 79);
      background: #fff;
      border: none;

      &:hover {
        color: #364255;
        background: #f5f5f5;
      }
    }
  }

  .pic_out_setting {
    position: relative;
  }

  .pic_out_setting_cont {
    // display: none;
    position: absolute;
    top: -426px;
    z-index: 100;
    width: 100%;
    height: 426px;
    padding: 10px;
    background: #f5f7fa;
    border: 1px solid #f0f0f0;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
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

  button:disabled {
    cursor: not-allowed;
  }

  .del-box {
    padding-left: 0.6rem;
    cursor: pointer;
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

  /deep/ .dialog-container {
    .box {
      padding: 0;

      .text {
        padding: 10px 20px;
        margin-bottom: 0;
      }
    }
  }

  .dialog-mask {
    .limit_size_dialog {
      width: 500px;
      padding: 15 / @base;
      text-align: left;
      border: 1px solid #ccc;
    }
  }

  .dialog-btn-box {
    .btn {
      width: auto;
      min-width: 100px;
      height: 36px;
      margin: 0 10px 10px;
      line-height: 32px;
    }
  }

  // 图片编辑弹窗
  .img-edit-dialog {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);

    .close {
      position: absolute;
      top: 20 / @base;
      right: 20 / @base;
      z-index: 100;
      font-size: 22px;
      cursor: pointer;
    }

    .img-edit-dg-con {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;

      .container {
        width: 100%;
      }
    }
  }

  .con-box-dialog {
    /deep/ .process-cont-dialog {
      height: calc(100vh - 16rem);
    }
  }

  .work-selection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 19px;

    /deep/ .work-selection-down {
      max-height: 15rem;
      overflow: auto;

      .el-select-dropdown__item.selected {
        color: #fff;
        background: #409eff;
      }
    }

    .work-operator {
      display: flex;
      align-items: center;

      .work-operator-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 5px;
        margin-left: 10px;
        text-align: center;
        cursor: pointer;
        background: #f2f2f2;
        border-radius: 3px;
      }

      .work-operator-icon.active {
        background: #e5f1ff;
      }
    }
  }

  .icon_my_loading {
    animation: around 1s ease infinite;
  }

  .icon-rotate {
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

  .offline-dialog {
    .offline-content {
      padding: 15 / @base;
      margin-bottom: 40 / @base;
      font-size: 16 / @base;
      color: #4d4d4f;

      .offline-text {
        margin: 20 / @base 0;
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

  .out-set-dialog {
    .offline-content {
      padding: 15 / @base;
      margin-bottom: 40 / @base;
      font-size: 16 / @base;
      color: #4d4d4f;

      .offline-text {
        margin: 20 / @base 0;
      }
    }

    /deep/ .dialog-container {
      .dialog-header {
        border: 0 !important;

        .dialog-close {
          position: absolute !important;
          top: 5px !important;
          right: 5px !important;
        }
      }
    }

    .offline-dialog-footer {
      width: 100%;
      padding: 15 / @base;

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

  .batch-process {
    .discount-user-dialog.mask {
      /deep/ .dialog-container {
        justify-content: space-around;
        width: 850px;
        height: 476px;
        background: url('@{assetsImgPath}/batch/discount_back.png') no-repeat;

        .dialog-header {
          justify-content: space-between;
          width: 85%;
          padding-top: 80px;
          border: 0;

          .header-title {
            width: 100%;
            font-size: 34px;
            font-weight: bold;
            color: rgb(255, 255, 255);
            text-align: center;
          }

          .dialog-close {
            position: absolute;
            top: 60px;
            right: 160px;
          }
        }

        .dialog-content {
          padding: 0 80px;

          .discount-text {
            color: #fff;
            text-align: center;

            .red-bold {
              font-size: 22px;
              font-weight: bold;
              color: #ff2703;
            }
          }
        }

        .discount-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 530px;
          min-height: 150px;
          //.timecountdown {
          //  width: 300px;
          //  margin-top: 30px;
          //  .time-count-down {
          //    .time-num {
          //      span {
          //        color: rgb(59, 59, 59);
          //      }
          //    }
          //  }
          //}
        }

        .header-success-title,
        .header-fail-title {
          font-size: 22px;
          font-weight: bold;
        }

        .discount-success-content,
        .discount-fail-content {
          .discount-text {
            font-size: 14px;
            color: #999;
          }
        }

        .discount-dialog-btns {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 500px;

          .discount-timedown {
            display: flex;
            align-items: center;
            justify-content: center;
            padding-top: 15px;

            .discount-timedown-label {
              margin-right: 10px;
              font-size: 12px;
              color: #afafaf;
            }
          }

          .primary-small-button {
            // width: 310px;
            // height: 65px;
            // background-color: #ff9d1d;
            // border-radius: 2rem;
            // line-height: 24px;
            // padding: 15px 10px 5px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // span {
            //   font-size: 18px;
            // }

            .small-span {
              font-size: 12px;
            }
          }

          .dont_need_offer {
            display: inline-block;
            width: 100%;
            padding: 10 / @base 0 15 / @base;
            font-size: 12px;
            color: rgb(147, 147, 147);
            text-align: right;
            cursor: pointer;
          }
        }
      }
    }

    .discount-success-dialog.mask,
    .discount-fail-dialog.mask {
      /deep/ .dialog-container {
        display: flex;
        justify-content: flex-start;
        width: 570px;
        min-height: 444px;

        .dialog-header {
          padding: 10px 0;
          border: none;

          .dialog-close {
            margin-right: 20px;
          }
        }

        .dialog-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 500px;

          .header-title {
            margin: 32px 0;
            font-size: 30 / @base;
            line-height: 38 / @base;
            color: #4d5b66;
            text-align: center;
          }

          .discount-content {
            width: 360px;
          }

          .discount-text {
            margin-bottom: 40px;
            font-size: 14 / @base;
            color: #646f78;
          }
        }

        .discount-dialog-btns {
          display: flex;
          flex-direction: column;
          align-items: center;

          .primary-small-button {
            width: 360px;
          }

          .dont_need_offer {
            font-size: 14 / @base;
            line-height: 60 / @base;
            color: #4d4d4f;
            text-decoration: underline;
          }
        }
      }
    }
  }

  @media (max-width: 1366px) and (min-width: 1025px) and (min-height: 480px) and(max-height: 800px) {
    .batch-process {
      .con-box-dialog {
        .left-process-container {
          min-height: 28rem;

          .uploaded-box {
            .uploaded {
              margin-top: 20 / @base;
            }
          }
        }

        .right-process-container {
          min-height: 28rem;

          .config-con {
            max-height: 30rem;
            // display: block;
            .work-tab {
              height: 14rem;
              min-height: 0;
              overflow-y: auto;
            }

            .workflow-tab-container {
              height: calc(100vh - 20rem);
            }

            .work-tab-workflow {
              height: 14rem;
              min-height: 0;
              overflow-y: auto;
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .batch-process .tit-box .tit .title-r .user-info .user-item {
      height: 40px;

      .block-placeholder {
        display: flex;
        align-items: center;
      }
    }

    .process--body-container {
      flex-wrap: wrap;
    }

    .batch-process.batch-process-dialog {
      .con-box {
        padding: 0;

        .container {
          padding: 5%;
        }
      }
    }

    .batch-exec {
      .title-r {
        display: block;
      }
    }

    .batch-process {
      .right-process-container {
        .config-con {
          .work-tabs {
            .work-tab-workflow {
              height: 18rem;
              min-height: 0;
              overflow-y: auto;
            }
          }
        }
      }
    }

    .dialog-mask {
      .limit_size_dialog {
        width: 100%;
      }
    }

    .process-container {
      /deep/ .col-lg-4 {
        width: 100%;
        max-width: 100%;
      }

      /deep/ .col-lg-8 {
        width: 100%;
      }
    }

    .batch-process {
      margin-top: 0;

      .process-container {
        overflow: auto;
      }

      .con-box {
        align-items: start;
        padding: 0;
        // padding-top: 40 / @base; // promotion顶部促销图 下架之后 需要还原为 0
        & > .container {
          overflow: visible;
        }

        .upload-box {
          width: 100%;
          padding: 20px;
        }

        .feature {
          padding-top: 30px;

          .h1 {
            margin-bottom: 20px;
            font-size: 22 / @base;
          }

          .process {
            padding: 0;
          }
        }
      }

      .checked {
        margin-right: 10px;
      }

      .tit-box {
        .tit {
          min-width: 375 / @base;
          padding-right: 0;
        }

        .fill-btn {
          padding: 20 / @base 0 20 / @base 10 / @base;
        }

        .title-tab .title-text {
          &:last-child {
            padding-right: 0;
          }
        }
      }

      .left-process-container {
        padding: 0 10 / @base;
        // min-height: 20rem;
        border-right: 0;

        .card-lt {
          justify-content: start;

          .filename {
            width: 370px;
          }

          .img {
            width: 60px;
            min-width: 60px;
            height: 60px;
          }

          .img-info {
            & > span {
              display: block;
              font-size: 13px;

              &:last-child {
                padding-left: 0;
              }
            }
          }
        }

        .btn-sub {
          min-width: 120px;
          padding: 0 15px;
        }

        .process-images .process-tit {
          flex-direction: column;
          align-items: start;
          padding: 0;

          .rt {
            width: 100%;
            text-align: right;
          }
        }
      }

      .right-process-container {
        padding: 0 1rem;

        .config-tit-box .config-tit {
          padding: 0;
        }

        .config-con {
          padding: 0;
        }

        .start-process {
          left: 50%;
          // transform: translateX(-50%);
        }
      }
    }

    /deep/ .el-card__body {
      flex-wrap: wrap;
      padding-right: 0;
      padding-left: 0;

      & > div {
        flex-basis: 100%;
        justify-content: space-between;
        padding-bottom: 20 / @base;
      }
    }

    .btn-sub + .btn-sub {
      margin-top: 10 / @base;
    }

    .batch-process {
      .discount-user-dialog.mask {
        /deep/ .dialog-container {
          width: 90% !important;
          background-position: center;
          background-size: cover;

          .dialog-header .dialog-close {
            right: 80px;
          }
        }
      }
    }
  }

  @media (max-width: 668px) {
    .batch-process {
      .discount-user-dialog.mask {
        /deep/ .dialog-container {
          width: 90% !important;
          background-position: center;
          background-size: cover;

          .dialog-header {
            .dialog-close {
              top: 40px;
              right: 10px;
            }
          }
        }
      }
    }
  }

  @media (max-width: 414px) {
    .batch-process .tit-box {
      .title-tab {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;

        .title-text {
          padding: 5px;
        }
      }
    }

    .batch-process .tit-box .tit .title-r .user-info {
      flex-direction: column;
      align-items: flex-start;
    }

    .batch-process .left-process-container .card-lt .filename {
      width: 190px;
      overflow: unset;
      text-overflow: unset;
      word-break: break-all;
      white-space: pre-wrap;
    }

    .batch-process .discount-user-dialog.mask .dialog-container .dialog-header .header-title {
      font-size: 26px;
    }

    .batch-process {
      .discount-user-dialog.mask {
        /deep/ .dialog-container {
          width: 90%;
          background-position: center;
          background-size: cover;

          .dialog-content {
            padding: 0 20px;
          }

          .discount-content {
            width: 100%;
          }

          .dialog-header .dialog-close {
            top: 50px;
            right: 20px;
          }

          .discount-dialog-btns {
            width: 100%;

            .primary-small-button {
              width: 100%;
            }
          }
        }
      }

      .discount-success-dialog.mask,
      .discount-fail-dialog.mask {
        /deep/ .dialog-container {
          width: 90%;

          .dialog-content {
            width: 90%;

            .discount-content {
              width: 100%;
            }
          }

          .discount-dialog-btns {
            width: 90%;

            .primary-small-button {
              width: 100%;
            }
          }
        }
      }
    }
  }

  @import '../../assets/less/common/batch_process_dialog.less';
</style>
<style lang="less">
  .offline-dialog {
    .offline-content {
      .offline-text {
        a {
          color: #0374ff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
            text-decoration-color: #0374ff;
          }
        }
      }
    }
  }

  .batch-process {
    .mask {
      .top h3 {
        font-weight: normal;
      }

      .bot {
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
      }
    }
  }

  .batch-process .el-tabs__item {
    font-size: 16px;
  }

  .step-select .el-input .el-input__inner,
  .step-select .input_box .el-input__inner,
  .step-select .el-input__inner {
    height: 36px;
    line-height: 36px;
  }

  .batch-process .el-slider__bar,
  .batch-process .el-slider__runway {
    height: 2px;
  }

  .batch-process .el-slider__button {
    width: 10px;
    height: 10px;
    background-color: #3887fe;
  }

  .batch-process .el-slider__button-wrapper {
    top: -17px;
  }

  .right-process-container {
    .config-con {
      display: flex;
      justify-content: space-between;

      .work-selection .el-select {
        width: 100%;
      }
    }
  }

  .el-radio__label {
    padding-left: 4px;
  }

  .process-images .process-cont {
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
      background: #eee;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);

      /* 滚动条里面小方块 */
      border-radius: 4px;
    }
  }

  .batch-process .el-tabs__nav-wrap::after {
    height: 1px;
    background: #efefef;
  }

  .batch-process .el-tabs__active-bar {
    background-color: #0374ff;
  }

  .scale-tip {
    z-index: 20;
    width: 160 / @base;
    line-height: 20px;
    border-radius: 6px;
  }

  .right-process-container {
    .el-radio__inner::after {
      width: 8px;
      height: 8px;
      background-color: #409eff;
    }

    .el-radio__input.is-checked .el-radio__inner {
      background: #fff;
    }
  }

  .product_latest_articles .articles_title {
    font-weight: 900;
  }

  .el-card__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-card {
    border: none;
    border-bottom: 1px solid #efefef;
  }

  .el-checkbox__label {
    font-size: 16px;
  }

  @keyframes progress {
    from {
      width: 0;
    }

    to {
      width: 100%;
    }
  }

  @keyframes progress-process {
    from {
      background-position: 0 0;
    }

    to {
      background-position: 20px 0;
    }
  }

  @media (max-width: 640px) {
    .el-message-box {
      width: auto;
    }

    .mask .con-login .container .box {
      top: -48px;
      width: 90%;
      height: 40rem;
      margin: auto;

      .box1 {
        border-right: 0;
        border-bottom: 1px solid #fff;
      }
    }

    .product_latest_articles {
      padding-top: 2.75rem;
    }

    .left-process-container {
      padding: 0 1rem;
    }

    .right-process-container {
      padding: 1rem;
    }

    .upload-box .works .el-card .el-card__body .card-rt .finished {
      i {
        margin-right: 1.5rem;
        margin-left: 0;
      }
    }

    .upload-box .upload-img-btn {
      .el-button.upload-img-btn1,
      .el-button.upload-img-btn2 {
        height: auto;
      }
    }

    .upload-box .works .el-card .el-card__body .card-rt div.loading {
      padding-top: 0;
    }
  }
</style>

<style lang="less" scoped>
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);

    .my_loding {
      // loading 待优化
      .icon_my_loading {
        display: none;
      }
    }

    .con-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;

      .box {
        position: relative;
        width: 830 / @base;
        max-width: 830 / @base;
        height: 521 / @base;
        overflow: hidden;
        background: #fff;
        border-radius: 2px;
        box-shadow: 0 30px 70px 0 rgba(6, 7, 50, 0.24);
      }
    }

    .close {
      position: absolute;
      top: 19 / @base;
      right: 31 / @base;
      z-index: 2;
      cursor: pointer;

      .hover {
        display: none;
      }

      &:hover {
        .default {
          display: none;
        }

        .hover {
          display: inline-block;
        }
      }
    }
  }

  /deep/ .sharpen-job {
    padding: 0 10 / @base;
  }

  .my-upload {
    z-index: 1100;

    a {
      text-decoration: underline;
    }

    .top {
      position: relative;
      padding: 0 31 / @base;
      border-bottom: 2px solid rgb(242, 242, 242);

      p {
        font-size: 24px;
        line-height: 2.25;
        color: rgb(54, 66, 85);
      }
    }

    .operate-container {
      display: flex;
      padding: 20 / @base 31 / @base;

      .left-show-container {
        width: 64%;

        .tabs-box {
          position: relative;
          min-height: 360px;

          .tab-title {
            display: flex;

            li {
              padding: 8 / @base 40 / @base;
              font-weight: bold;
              cursor: pointer;
              background: #fff;
              border: 1px solid rgb(141, 142, 144);

              &.active {
                color: #fff;
                background-color: rgb(141, 142, 144);
              }
            }
          }

          .tab-con {
            height: 353 / @base;
            min-height: 353 / @base;
            padding: 12 / @base;
            overflow-y: auto;
            border: 1px solid rgb(255, 230, 197);

            .upload-box {
              display: flex;

              .upload-btn {
                width: 81 / @base;
                height: 81 / @base;
                margin: 5px;
                background-color: rgb(244, 239, 239);

                .upload-img {
                  width: 100%;
                  height: 100%;
                }
              }
            }

            .upload-box-empty {
              display: block;
            }
          }

          .tab-con:hover {
            .drag-img-box {
              .drag-img {
                display: none;
              }

              .drag-img-hover {
                display: inline-block;
              }
            }

            .el-upload__text {
              /deep/ em {
                color: #2271e6;
                text-decoration: underline;
              }

              .icon_upload_black {
                display: none;
              }

              .icon_upload {
                display: inline-block;
              }
            }
          }

          .sample {
            display: flex;
            flex-wrap: wrap;
            width: 100%;

            li {
              position: relative;
              width: 81px;
              height: 81px;
              margin: 5px;

              .checkbox {
                display: none;

                &:checked + label span {
                  background: #000;
                  border-color: #000;

                  i {
                    display: inline-block;
                  }
                }
              }

              label {
                span {
                  position: absolute;
                  top: 5 / @base;
                  right: 5 / @base;
                  width: 14 / @base;
                  height: 14 / @base;
                  text-align: center;
                  cursor: pointer;
                  background: rgba(0, 0, 0, 0.4);
                  border: 1px solid #fff;
                  border-radius: 2px;

                  i {
                    position: relative;
                    top: -7 / @base;
                    display: none;
                    vertical-align: middle;
                  }
                }
              }

              img {
                width: 100%;
                height: 100%;
                cursor: pointer;
                border: 1px solid #eee;
              }
            }

            .upload-speed {
              position: absolute;
              top: 0;
              width: 100%;
              height: 100%;
              background: rgba(144, 144, 144, 0.4);

              .wait-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                cursor: pointer;
                transform: translate(-50%, -50%);
              }

              .wait-icon.el-icon-close {
                padding: 4px;
                font-size: 20px;
                color: #fff;
                background: rgba(222, 65, 81, 0.9);
                border-radius: 50%;
              }

              @keyframes loading-rotate {
                from {
                  transform: rotate(0deg);
                }

                to {
                  transform: rotate(360deg);
                }
              }

              .progress-bg {
                width: 80%;
                height: 8px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #1e1e1e;
                border-radius: 4px;

                .icon_progress {
                  position: absolute;
                  display: inline-block;
                  height: 100%;
                  background-image: linear-gradient(90deg, rgb(255, 199, 66) 0%, rgb(255, 72, 72) 100%);
                  border-radius: 4px;
                }
              }
            }

            li.selected-li {
              user-select: none;
            }
          }

          .sample-list {
            li {
              width: 80px;
              height: 80px;
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
                cursor: pointer;
                object-fit: cover;
              }
            }
          }
        }

        .clear-selected {
          a {
            font-size: 12px;
            color: @linkColor2;
            cursor: pointer;
          }
        }

        .upload-text {
          font-size: 14px;
          color: #c3c3c3;

          /deep/ span {
            display: inline-block;
            width: 100%;
            font-size: 12px;
            text-align: center;
            word-break: keep-all;
          }

          p {
            color: #c3c3c3;
          }
        }
      }

      .right-show-container {
        position: relative;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;
        padding-top: 25px;
        padding-bottom: 2rem;
        padding-left: 38px;

        ul.user-info {
          li {
            margin-top: 20px;
            border-bottom: 1px solid #f2f2f2;

            .title {
              color: rgb(79, 103, 133);
            }

            p {
              display: flex;
              line-height: 2;
              color: rgb(79, 103, 133);
              text-align: right;

              b {
                flex: 1;
                font-size: 20px;
                text-align: center;
                text-transform: capitalize;
              }

              a.link {
                font-size: 16px;
                color: @linkColor;
              }
            }
          }
        }

        .select-more {
          text-align: center;

          a {
            font-size: 12px;
            line-height: 2.1;
            color: #4f6785;
          }

          .selected-num {
            p {
              margin-bottom: 0;
            }

            b {
              font-size: 40px;
              color: #4f6785;

              &:first-child {
                color: rgb(34, 243, 34);
              }
            }

            span,
            a {
              display: inline-block;
              margin-bottom: 0.4rem;
              color: #4f6785;
            }
          }

          .selected-more {
            margin-bottom: 10px;
          }

          .orange-btn {
            margin-top: 10px;
          }
        }
      }

      .full-size {
        p {
          padding-top: 20px;
          font-size: 18px;
          color: #4f6785;
        }
      }
    }

    input {
      width: 15px;
      height: 15px;
      background-color: rgba(0, 0, 0, 0.4);
      border-color: rgb(255, 255, 255);
      border-style: solid;
      // -webkit-appearance: none;
      border-width: 1px;
      border-radius: 2px;
    }

    input[checked='true'] {
      -webkit-appearance: auto;
      background-color: rgba(0, 0, 0, 1);
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

  .upgrade-small-content {
    display: flex;
    flex-direction: column;

    p {
      font-size: 1rem;
    }

    .upgrade-small-timecountdown {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      margin-top: 10px;

      .upgrade-btn {
        padding: 8px 25px;
        font-size: 14 / @base;
        color: #fff;
        background-color: #ff9d1d;
        border: none;
        border-radius: 5px;
      }
    }
  }

  @media (max-width: 1024px) {
    .my-upload .operate-container {
      flex-direction: column;

      .left-show-container {
        width: 100%;

        .tabs-box {
          margin-bottom: 20 / @base;
        }
      }

      .right-show-container ul {
        align-items: center;

        &.user-info li p b {
          padding-right: 20 / @base;
        }
      }
    }

    .mask .con-login {
      padding-top: 0;

      .box {
        padding: 0;
      }
    }

    .mask {
      .con-box {
        .box {
          height: auto;
          margin: 0 15px;

          .right-show-container {
            display: flex;
            flex-direction: column;
            padding: 0;

            ul {
              display: flex;
              justify-content: inherit;
            }
          }
        }
      }
    }
  }

  @media (max-width: 1240px) {
    .user-info-type {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .my-upload {
      a {
        text-decoration: initial;
      }

      .top {
        position: relative;
        padding: 0 31 / @base;
        border-bottom: 2px solid rgb(242, 242, 242);

        p {
          font-size: 24px;
          line-height: 2.25;
          color: rgb(54, 66, 85);
        }
      }

      .operate-container {
        display: flex;
        flex-direction: column;
        padding: 20 / @base 31 / @base;

        .left-show-container {
          width: 100%;
          border: 1px solid #e7e7e7;

          .tabs-box {
            position: relative;
            min-height: 240px;

            .tab-title {
              display: flex;

              li {
                width: 50%;
                padding: 8 / @base 10 / @base;
                font-weight: bold;
                text-align: center;
                cursor: pointer;
                background: #fff;
                border: 1px solid rgb(141, 142, 144);

                &.active {
                  color: #fff;
                  background-color: rgb(141, 142, 144);
                }
              }
            }

            .tab-con {
              padding: 10 / @base;
              overflow-y: auto;
              border: 0;

              .upload-box {
                display: flex;

                .upload-btn {
                  width: 81px;
                  height: 81px;
                  margin: 5px;
                  background-color: rgb(244, 239, 239);

                  .upload-img {
                    width: 100%;
                    height: 100%;
                  }
                }
              }

              .upload-box-empty {
                display: block;
                padding: 10px 0;
              }
            }

            .tab-con:hover {
              .drag-img-box {
                .drag-img {
                  display: inline-block;
                }

                .drag-img-hover {
                  display: none;
                }
              }
            }

            .sample {
              display: flex;
              flex-wrap: wrap;
              width: 100%;

              li {
                position: relative;
                margin: 5px;

                .checkbox {
                  position: absolute;
                  top: 10px;
                  left: 10px;
                  cursor: pointer;
                }

                img {
                  cursor: pointer;
                }
              }

              li.selected-li {
                user-select: none;
              }
            }
          }

          .clear-selected {
            margin-bottom: 20 / @base;
            text-align: center;

            a {
              display: inline-block;
              min-width: 230 / @base;
              font-size: 12px;
              // height: 55 / @base;
              line-height: 35 / @base;
              color: #0e79ff;
              text-align: center;
              text-decoration: underline;
              cursor: pointer;
              // cursor: pointer;
              // background: @btnSubBg;
              // border: 1px solid #a9a9a9;
              // border-radius: 2px;
            }
          }

          .upload-text {
            font-size: 14px;
            color: #c3c3c3;

            /deep/ span {
              transform: scale(0.8);
            }

            p {
              color: #c3c3c3;
            }
          }
        }

        .right-show-container {
          position: relative;
          flex: 1;
          padding-top: 25px;
          padding-left: 34px;

          ul.user-info {
            li {
              margin-top: 20px;
              border-bottom: 1px solid #f2f2f2;

              .title {
                color: rgb(79, 103, 133);
              }

              p {
                display: flex;
                align-items: center;
                line-height: 2;
                color: rgb(79, 103, 133);
                text-align: right;

                b {
                  flex: 1;
                  padding-right: 20 / @base;
                  font-size: 20px;
                  text-align: center;
                }

                a.link {
                  font-size: 12px;
                  color: @linkColor2;
                }
              }
            }
          }

          .select-more {
            text-align: center;

            a {
              font-size: 11px;
              line-height: 1.1;
            }

            .selected-num {
              margin: 30px 0;

              b {
                font-size: 40px;

                &:first-child {
                  color: rgb(34, 243, 34);
                }
              }

              span,
              a {
                color: #4f6785;
              }
            }

            .orange-btn {
              margin-top: 10px;
            }
          }
        }

        .full-size {
          p {
            padding-top: 20px;
            font-size: 18px;
            color: #4f6785;
          }
        }
      }
    }

    .mask {
      .con-box {
        .box {
          max-height: 520 / @base;
          overflow-y: auto;
        }
      }
    }
  }

  @media (max-width: 640px) {
    .mask .con-login .container .box {
      width: 100vw;

      .right-show-container ul {
        flex-direction: column;
      }
    }

    .my-upload .operate-container .right-show-container {
      ul {
        flex-direction: column;
        text-align: center;
      }

      .select-more {
        flex-direction: column;
      }
    }

    .my-upload .operate-container .left-show-container .upload-text {
      /deep/ span {
        transform: scale(0.7);
      }
    }
  }

  @media (max-width: 640px) {
    .my-upload .top p {
      font-size: 20px;
    }

    .my-upload .operate-container {
      padding: 10 / @base 10 / @base 0;

      .left-show-container {
        .clear-selected {
          margin-bottom: 10px;
        }

        .tabs-box {
          margin-bottom: 0.5rem;

          .tab-con {
            height: 19.3rem;
            min-height: initial;
            padding: 10 / @base;
            padding-right: 0;

            .upload-box .upload-btn {
              position: relative;
              width: calc(25% - 8px);
              height: auto;
              padding-bottom: 23%;
              margin: 0;
              margin-right: 8px;
              margin-bottom: 10px;

              .upload-img {
                position: absolute;
              }
            }
          }

          .sample {
            align-items: flex-end;
            width: 100%;

            li {
              position: relative;
              width: 25%;
              height: auto;
              padding-bottom: 23%;
              margin: 0;
              margin-bottom: 10px;
              overflow: hidden;

              img {
                position: absolute;
                width: calc(100% - 5px);
              }

              label span {
                right: 12px;
                z-index: 2;
              }
            }
          }
        }
      }
    }

    .mask .con-box .box {
      position: absolute;
      top: 5%;
      width: 93%;
      max-height: 43rem;
      margin: 0 auto;

      .right-show-container {
        ul {
          flex-direction: row;

          li {
            width: 50%;
            text-align: left;
            border-bottom: 0;

            p {
              line-height: 1;

              b {
                flex: initial;
              }

              a.link {
                text-decoration: underline;
              }
            }

            .primary-small-button {
              width: 100%;
              min-width: initial;
              height: 100%;
              border-radius: 0;
            }
          }

          .selected-num {
            margin: 0;
            text-align: center;
            border-top: 1px solid rgba(229, 229, 229, 0.5);

            b {
              font-size: 24px;
            }
          }
        }

        ul.user-info li {
          margin-top: 10px;
          margin-bottom: 10px;

          .title {
            line-height: 2.5;
          }
        }

        .select-more {
          margin: 0 -10px;
          margin-top: 10px;

          li {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 70px;
          }

          .selected-more {
            margin-bottom: 0;
            text-decoration: underline;
          }

          .continue-btn {
            border-top: 1px solid @btnMainBg;
          }
        }
      }
    }
  }
</style>

<style lang="less">
  .upload-box .upload-img .el-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #4f6785;

    .my-plus {
      font-size: 20px;
    }

    .upload-text {
      margin-top: 10px;
    }
  }

  .el-upload-dragger {
    height: auto;
    padding-bottom: 0;
    margin-top: 0;
    border: none;
  }

  .el-upload-dragger.is-dragover {
    border: none;
  }

  .el-upload__input {
    position: absolute;
    top: 0;
    display: none;
    width: 100%;
    height: 81px;
  }

  .upload-img {
    .drag-img-box {
      width: 229px;
      height: 97px;
      margin: auto;

      .drag-img-hover {
        display: none;
      }

      .drag-img-box {
        width: 100%;
        height: 100%;
      }

      img {
        width: 100%;
      }
    }
  }

  .el-loading-mask {
    background-color: rgba(200, 200, 200, 0.9);
  }

  .user-info,
  .select-more {
    .el-loading-mask {
      background-color: #fff;
    }
  }

  .continue-btn {
    .primary-small-button {
      border: 0;
    }

    button[disabled] {
      opacity: 0.5;
    }

    .el-loading-mask {
      background-color: rgba(249, 201, 138, 1);

      .el-loading-spinner {
        .circular {
          width: 38px;
          height: 38px;
        }

        .path {
          stroke: #fff;
          stroke-width: 3px;
        }
      }
    }
  }

  .upload-box-empty {
    .el-loading-mask {
      background-color: rgba(255, 255, 255, 0.7);
    }
  }

  .el-upload-dragger {
    .el-upload__text {
      padding: 18 / @base 0;
      color: #4d4d4f;
      border-bottom: 1px solid #f2f2f2;

      .icon_upload {
        display: none;
      }

      /deep/ em {
        color: #4d4d4f;
        text-decoration: underline;
      }
    }
  }

  .discount-user-dialog {
    .primary-small-button .el-loading-mask {
      border-radius: 2rem;
    }
  }

  .ctrlv {
    display: none;
    font-size: 12px;
    line-height: 4;
    text-align: center;

    b {
      display: inline-block;
      width: 28px;
      height: 28px;
      font-weight: normal;
      line-height: 28px;
      text-align: center;
      background-color: rgb(235, 235, 235);
      border-color: rgb(218, 218, 218);
      border-style: solid;
      border-width: 1px;
      border-radius: 2px;
    }
  }

  .sample {
    .el-upload-dragger {
      width: 100%;
      height: 100%;
      background-color: #f4efef;
    }

    .el-upload-dragger.is-dragover {
      border: none;
    }
  }

  @media (max-width: 768px) {
    .upload-box .upload-img .el-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #4f6785;

      .my-plus {
        font-size: 20px;
      }

      .upload-text {
        margin-top: 10px;
      }
    }

    .el-upload-dragger {
      width: 100%;
      height: auto;
      padding-bottom: 14px;
      border: none;
    }

    .el-upload__input {
      position: absolute;
      top: 0;
      display: none;
      width: 100%;
      height: 81px;
    }

    .upload-img {
      .drag-img-box {
        margin: auto;

        .drag-img-hover {
          display: none;
        }

        .drag-img-box {
          width: 100%;
          height: 100%;
        }

        img {
          width: 100%;
        }
      }
    }

    .el-upload__text {
      padding: 18 / @base 0;
      border-bottom: 1px solid #f2f2f2;
    }

    .ctrlv {
      display: none;
      font-size: 12px;
      line-height: 4;
      text-align: center;

      b {
        display: inline-block;
        width: 28px;
        height: 28px;
        font-weight: normal;
        line-height: 28px;
        text-align: center;
        background-color: rgb(235, 235, 235);
        border-color: rgb(218, 218, 218);
        border-style: solid;
        border-width: 1px;
        border-radius: 2px;
      }
    }

    .mask .con-box .box .right-show-container .select-more .selected-more span {
      display: inline-block;
      transform: scale(0.8);
    }
  }
</style>
