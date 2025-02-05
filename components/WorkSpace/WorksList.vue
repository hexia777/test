<template>
  <div>
    <div class="uploadimagelist uploaded-box" v-show="showList.length || offlineLength > 0">
      <div class="process-tit">
        <div class="lt">
          <el-checkbox
            class="btn"
            v-model="checkedAll"
            @change="onCheckAllChange"
            v-track-label="$commonTrackLabel('select_all')"
          >
            {{ $t('workspace.upload_5') }}
          </el-checkbox>
          <div
            class="btn dropbox"
            :class="selectFinished.length > 0 ? 'dropbox-check' : ''"
            v-if="worksType === 'processed' && $store.state.token"
          >
            <i class="iconfont-single icon-s-dropbox" v-if="dropboxType == 'dropbox'"></i>
            <i class="iconfont-single icon-s-info" v-if="dropboxType == 'dropbox_error'"></i>
            <i class="iconfont-single icon-s-complete" v-if="dropboxType == 'dropbox_success'"></i>
            <i class="iconfont-single icon-s-refresh icon-rotate" v-if="dropboxType == 'dropbox_loading'"></i>
            <button
              :class="selectFinished.length > 0 ? 'finished_select' : ''"
              @click="onSaveDropbox"
              v-track-label="$commonTrackLabel('save_to_dropbox')"
            >
              {{ $t('workspace.dropbox_save') }}
            </button>
          </div>
          <drives
            v-if="worksType === 'processed' && false"
            :trans-ids="selectedList"
            :drop-box-redirect-url="dropBoxRedirectUrl"
          />
          <div
            class="btn btn_down"
            v-if="worksType === 'processed'"
            @click="onDownloadAllBefore"
            v-track-label="$commonTrackLabel('download_all')"
          >
            <i class="iconfont-single icon-s-download"></i>
            {{ $t('common.download') }}
          </div>
          <div
            class="btn btn_del iconfont-ctr"
            @click="onDelAllProcessed"
            v-track-label="$commonTrackLabel('delete_all')"
          >
            <i class="iconfont-single icon-s-delete"></i>
            {{ $t('workspace.del') }}
          </div>
        </div>
        <div class="rt"></div>
      </div>
      <div>
        <!-- <ul v-show="imageAllType.length > 0 && worksType === 'processed'" class="sel-type-box cf">
          <li :class="{ 'tag-sel': selTagType === '' }" @click="selTypeFun('')">{{ $t('common.All') }}</li>
          <li
            @click="selTypeFun(v)"
            v-for="(v, k) in imageAllType"
            :key="k"
            :class="{ 'tag-sel': selTagType === v }"
          >
            {{ $t(`common.${v}`) }}
          </li>
        </ul> -->
      </div>

      <div class="process-cont" :class="[isCurrentPageProcess && 'process-cont-dialog']">
        <div class="processed-box scroll-bar" :class="[isCurrentPageProcess && 'processed-box-dialog']">
          <div class="offline-tip" v-show="worksType === 'processing' && offlineLength === 1">
            {{ $t('workspace.offline_queue_single', { num: offlineLength }) }}
          </div>
          <div class="offline-tip" v-show="worksType === 'processing' && offlineLength > 1">
            {{ $t('workspace.offline_queue', { num: offlineLength }) }}
          </div>
          <div class="offline-tip" v-show="worksType === 'processed' && loadingProcessed">
            <i class="iconfont-single icon-s-loading"></i>
            <span>{{ $t('workspace.offline_loading') }}</span>
          </div>
          <div class="busy-tip offline-tip" v-show="showWaiteTime">
            <div class="tip">
              <div>
                <p class="flex">
                  <i class="iconfont-single icon-s-queue"></i>
                  <span v-html="text1"></span>
                </p>
              </div>
              <!-- 付费用户 -->
              <div v-if="queryQueueParams ? queryQueueParams.isPay : isPaied">
                <p class="m-t-8 m-f-24" v-html="text2"></p>
              </div>
              <!-- 免费用户 -->
              <div v-if="queryQueueParams ? !queryQueueParams.isPay : !isPaied">
                <p class="m-t-8 m-f-24" v-html="text2Free"></p>
                <p class="m-t-8 m-f-24" v-html="text3Free"></p>
              </div>
            </div>
            <div class="btns" v-show="queryQueueParams ? !queryQueueParams.isPay : !isPaied">
              <a
                target="_blank"
                class="btn-main upgrade-btn"
                :href="`${$t('common.common_nav_link_2')}?source=workspace&medium=job_queue`"
              >
                {{ $t('workspace.free_wait_job_btn') }}
              </a>
            </div>
          </div>
          <div v-for="(item, idx) in showList" :key="idx">
            <template>
              <div class="works worksprocess">
                <el-card shadow="never">
                  <div class="card-lt">
                    <div class="checked">
                      <el-checkbox
                        v-model="item.selected"
                        @change="onCheckOneChange"
                        v-track-label="$commonTrackLabel('select_image_' + item.uid)"
                      />
                    </div>
                    <div class="img">
                      <img :src="item.thumbnail" class="thumb" width="80" height="80" />
                    </div>
                    <div style="padding: 14px;">
                      <div class="bottom clearfix">
                        <div>
                          <el-tooltip
                            v-if="item.operation === 'workflow'"
                            class="item"
                            effect="dark"
                            :content="item.workflow || $t('workspace.workflow_unnamed')"
                            placement="top"
                            :open-delay="1500"
                          >
                            <span
                              @mouseover.prevent="getWorkflowName(item)"
                              class="operation-type"
                              :class="'my-' + item.operation"
                            >
                              {{ $t(`common.${item.operation}`) }}
                            </span>
                          </el-tooltip>
                          <span v-else class="operation-type" :class="'my-' + item.operation">
                            {{ $t(`common.${item.operation}`) }}
                          </span>
                        </div>
                        <span class="filename">{{ item.filename | fileNameFormat }}</span>
                        <div class="img-info">
                          <span>
                            <span v-html="$t('workspace.upload_3') + ':'"></span>
                            <span>{{ item.w }} x {{ item.h }} px</span>
                          </span>
                          <span>
                            <span v-html="$t('workspace.upload_4') + ':'"></span>
                            <span>
                              {{ item.customWidth || (item.w * item.config.scale).toFixed(0) }} x
                              {{ item.customHeight || (item.h * item.config.scale).toFixed(0) }} px
                            </span>
                          </span>
                          <span v-if="worksType === 'processed'">
                            <span v-html="$t('workspace.text_32')"></span>
                            <span>
                              {{ getFileSize(item) }}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-rt">
                    <div class="loadtxt">
                      <div class="text" v-if="item.status === 'uploading'">
                        <i class="iconfont-single icon-s-loading"></i>
                        <span v-html="$t('workspace.upload_status_1')"></span>
                      </div>
                      <div class="text" v-if="item.status === 'processing'">
                        <i class="iconfont-single icon-s-loading"></i>
                        <span v-html="$t('workspace.upload_status_3')"></span>
                      </div>
                      <div class="text" v-else-if="item.status === 'processFailed'">
                        <i class="iconfont-single icon-s-fail"></i>
                        <span v-html="$t('workspace.upload_status_6')"></span>
                      </div>
                      <div class="text" v-else-if="item.status === 'imageTooLarge'">
                        <i class="iconfont-single icon-s-fail"></i>
                        <span v-html="$t('workspace.upload_status_4')"></span>
                      </div>
                      <div class="text" v-else-if="item.status === 'waiting'">
                        <i class="iconfont-single icon-s-wait"></i>
                        <span v-html="$t('workspace.upload_status_13')"></span>
                      </div>
                      <!--                      <div class="text" v-else>-->
                      <!--                        <span v-html="$t('workspace.upload_status_7')"></span>-->
                      <!--                      </div>-->
                    </div>
                    <div class="image-operator">
                      <el-tooltip
                        v-if="item.status === 'finished'"
                        class="tooltip"
                        popper-class="icon-tip"
                        effect="dark"
                        :content="$t('workspace.preview')"
                        placement="top"
                        :disabled="$store.state.mobile"
                      >
                        <span
                          class="preview-icon-box"
                          @click="onPreview(item)"
                          v-track-label="$commonTrackLabel('preview_image_' + item.uid)"
                        >
                          <i class="iconfont-single icon-s-preview"></i>
                        </span>
                      </el-tooltip>
                      <el-tooltip
                        v-if="item.status === 'finished' && !item.sample"
                        class="tooltip"
                        popper-class="icon-tip"
                        effect="dark"
                        :content="$t('workspace.edit')"
                        placement="top"
                        :disabled="$store.state.mobile"
                      >
                        <span
                          class="edit-icon-box"
                          @click="onEdit(item, idx)"
                          v-loading="idx === currentIndex && toEditorPageLoading"
                          v-track-label="$commonTrackLabel('edit_image_' + item.uid)"
                        >
                          <i class="iconfont-single icon-s-edit"></i>
                        </span>
                      </el-tooltip>
                      <el-tooltip
                        v-if="item.status === 'finished'"
                        class="tooltip"
                        popper-class="icon-tip"
                        effect="dark"
                        :content="$t('workspace.download')"
                        placement="top"
                        :disabled="$store.state.mobile"
                      >
                        <span
                          class="down-box"
                          @click="onDownloadBefore(item)"
                          v-track-label="$commonTrackLabel('download_image_' + item.uid)"
                        >
                          <i class="iconfont-single icon-s-download active"></i>
                        </span>
                      </el-tooltip>
                      <el-tooltip
                        class="tooltip"
                        popper-class="icon-tip"
                        effect="dark"
                        :content="$t('workspace.del')"
                        placement="top"
                        :disabled="$store.state.mobile"
                        v-if="item.status !== 'processing' && item.status !== 'uploading'"
                      >
                        <div
                          class="del-box"
                          @click="onDelWorks(item)"
                          v-track-label="$commonTrackLabel('delete_image_' + item.uid)"
                        >
                          <i class="iconfont-single icon-s-delete"></i>
                        </div>
                      </el-tooltip>
                    </div>
                  </div>
                </el-card>
              </div>
            </template>
          </div>
        </div>
        <div class="selected-number">
          <span>{{ selectedNumber }}</span>
          <span>{{ $t('workspace.upload_select') }}</span>
        </div>
        <div class="feedback-btn" v-if="worksType === 'processed'">
          <div
            class="minor-small-button"
            @click="feedBackDialog"
            v-track-label="$commonTrackLabel('feed_back')"
          >
            <i class="iconfont-single icon-s-feedback_black"></i> {{ $t('common.feed_back_btn') }}
          </div>
        </div>
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
                v-track-label="$commonTrackLabel('feed_back_publish')"
              >
                {{ $t('common.feed_back_dialog_btn') }}
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
    <div class="upload-empty" v-show="showEmpty">
      <img width="222" height="95" :src="$imgPath('/batch/upload_to_start.png')" alt />
      <p v-if="worksType === 'processing'" v-html="$t('workspace.processing_empty')"></p>
      <p v-else v-html="$t('workspace.processed_empty')"></p>
    </div>
    <base-dailog
      :show="showDel"
      @confirm="confirmDel"
      @cancel="showDel = false"
      :title-text="$t('workspace.delete_selected')"
      :cancel-text="$t('workspace.upload_18')"
      :yes-text="$t('workspace.upload_19')"
    />
    <!-- onPreview -->
    <downloadLoading v-show="minLoading" />
    <downloadLoadingAll v-show="maxLoading" :current="currentDownload" :total="totalDownload" />

    <custom-dialog class="offline-dialog" :visible.sync="offlineVisible">
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
            <button @click="offlineVisible = false" class="btn cancal-btn">
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

    <my-dialog :visible.sync="cantDownload" @close="closeDialog">
      <div class="limit_size_dialog">
        <div class="tip">{{ $t('workspace.waiting_tittle') }}</div>
      </div>
      <div class="dialog-btn-box">
        <div class="btn-main btn" @click="closeDialog">
          {{ $t('workspace.upload_limit_5') }}
        </div>
      </div>
    </my-dialog>
    <feture-dialog
      :visible.sync="showNewFeature"
      :feature-title="$t('workspace.offline_newfeature_title')"
      :feature-text="$t('workspace.offline_newfeature_content')"
      :confirm-callback="closeFeature"
      :close-callback="closeFeature"
    />
    <my-dialog :visible.sync="editDownloadDialog" :exitshow="false">
      <div class="edit_download_dialog">
        <div class="tip">{{ $t('workspace.edit_before_tip') }}</div>
        <div style="margin-top: 15px;">
          <input v-model="editDownloadDialogDontShow" type="checkbox" />
          <label>{{ $t('workspace.repair_limit_dialog_check') }}</label>
        </div>
      </div>
      <div class="edit_download_dialog_btns">
        <div class="btn-sub btn" @click="editDownloadCancelHandle">
          {{ $t('workspace.repair_limit_dialog_cancel') }}
        </div>
        <div class="primary-small-button btn" @click="editDownloadContinueHandle">
          {{ $t('workspace.repair_limit_dialog_continue') }}
        </div>
      </div>
    </my-dialog>
    <register-and-subscribe-dialog
      v-if="worksType === 'processed' && registerAndSubscribeVisible"
      :visible.sync="registerAndSubscribeVisible"
      :not-point="notPoint"
      :is-paied="isPaied"
      :token="$store.state.token"
      @onTryAgainDownload="onDownload(currentWork)"
      @onSubscribe="onSubscribe"
      :work="currentWork"
    />
    <recommend-download-dialog
      v-if="worksType === 'processed' && recommendDownloadVisible"
      :visible.sync="recommendDownloadVisible"
      track="?source=single&type=enhancer&date=20230601"
    />
    <!-- 引导点赞弹窗 -->
    <fabulous :fabulous-win.sync="fabulousWin" v-if="fabulousWin" :current-work="currentWork" />
    <custom-dialog
      v-if="worksType === 'processed'"
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
          :trans-ids="waitDownload ? [waitDownload.transId] : selectedList"
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
  import Fabulous from '@/components/Fabulous'
  import Work from '@/static/script/work'
  import BaseDailog from '@/components/BaseDailog'
  import { readLocalStorageDict, setLoginDialogShow } from '@/static/script/utils'
  import downloadLoading from '@/components/loading/Loading'
  import downloadLoadingAll from '@/components/loading/LoadingAll'
  import CustomDialog from '@/components/CustomDialog'
  import servers from '@/static/config/common/server.config'
  import FetureDialog from '@/components/FetureDialog'
  import myDialog from '@/components/matting/MyDialog'
  import RegisterAndSubscribeDialog from '@/components/RegisterAndSubscribeDialog'
  import Dialog from '@/components/giveaway/Dialog'
  import { emailStr } from '@/static/script/rules.js'
  import UploadImgMixins from '@/mixins/components/UploadImgMixins'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import { TRANSID_MODAL, TRANS_MPDAL_BTN } from '@/static/config/common/localstorage_constants'
  import Drives from '@/components/Drives.vue'
  import RecommendDownloadDialog from '@/components/RecommendDownloadDialog.vue'
  import { getDownloadUrlFromS3, getPreviewUrlData, getPreviewUrl } from '@/static/plugin/awsS3'
  import { browserDownload } from '@/static/script/util/imageUtil'

  export default {
    name: 'WorksList',
    components: {
      RecommendDownloadDialog,
      Drives,
      FetureDialog,
      CustomDialog,
      downloadLoading,
      downloadLoadingAll,
      BaseDailog,
      myDialog,
      RegisterAndSubscribeDialog,
      Fabulous,
      Dialog,
    },
    filters: {
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
    mixins: [UploadImgMixins, UserInfoMixins],
    props: {
      works: {
        type: Array,
        default: () => {
          return []
        },
      },
      deletedIds: {
        type: Array,
        default: () => {
          return []
        },
      },
      tabShow: {
        type: Number,
        default: 0,
      },
      processTime: {
        type: Number,
        default: 0,
      },
      busyJobs: {
        type: Number,
        default: 0,
      },
      isWorkflow: {
        type: Boolean,
        default: false,
      },
      worksType: {
        type: String,
        default: 'processing',
      },
      isCurrentPageProcess: {
        type: Boolean,
        default: false,
      },
      queryQueueParams: {
        type: Object,
        default: () => null,
      },
      allSampleList: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      const text2 = `${this.$t('workspace.new_wait_job_text_2', {
        pre: '<b class="orange">',
        suf: '</b>',
      })} ${this.$t('workspace.batch_wait_job_text_3', { page: `<b>${this.$t('workspace.processed')}</b>` })}`
      const text2Free = this.$t('workspace.batch_free_wait_job_text_2', {
        pre: '<b>',
        suf: '</b>',
        page: `<b>${this.$t('workspace.processed')}</b>`,
      })
      const text3Free = `<b>${this.$t('workspace.free_wait_job_text_3')}</b>`
      return {
        text2,
        text2Free,
        text3Free,
        recommendDownloadVisible: false,
        selTagType: '',
        imageAllType: [], //用户的所处理的图片类型
        showList: [],
        fabulousWin: false, //点赞弹窗
        checkedAll: false,
        maxLoading: false,
        minLoading: false,
        processLoading: false,
        workInfo: {},
        deletedTransIds: [],
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
        showPreview: false,
        showNewPreview: false,
        activeMode: 'grid',
        offlineWork: false,
        offlineVisible: false,
        offlineLength: 0,
        dontShowAgain: false,
        showDontshowAgain: true,
        loadingProcessed: false,
        processedList: [],
        showNewFeature: false,
        tabTimer: null,
        currentPage: 1,
        cantDownload: false,
        dropboxType: 'dropbox',
        windowOpen: null,
        editDownloadDialog: false,
        editDownloadDialogDontShow: false,
        windowClose: true,
        toEditorPageLoading: false,
        currentIndex: null,
        work: null,
        registerAndSubscribeVisible: false,
        subscribeDialogVisible: false,
        notPoint: false,
        currentWork: null,
        currentDownload: 0,
        totalDownload: 0,
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
        downloadDialogVisible: false,
        waitDownload: null,
        workerCount: 1,
      }
    },
    computed: {
      deletedAllIds() {
        return [...new Set([...this.deletedIds, ...this.deletedTransIds])]
      },
      text1() {
        const count = `<b>${this.busyJobs}</b>`
        const time = `<b>${this.getTime}</b>`
        return this.busyJobs > 1
          ? this.$t('workspace.new_wait_job_text_1', { count, time })
          : this.$t('workspace.new_wait_job_text_1_single', { count, time })
      },
      dropBoxRedirectUrl() {
        return process.env.ENV === 'online'
          ? `https://vanceai.com${this.$store.state.ll}/workspace/`
          : process.env.ENV === 'test'
          ? `https://test.vanceai.com${this.$store.state.ll}/workspace/`
          : `http://localhost:3000${this.$store.state.ll}/workspace/`
      },
      isDevelopedCountryFlag() {
        if (this.$getCookie('developed_country')) {
          return this.$getCookie('developed_country') === '1'
        }
        return this.$store.state.isDevelopedCountry
      },
      showWaiteTime() {
        const matchProgressCount = this.isDevelopedCountryFlag
          ? this.processTime >= 60
          : this.processTime >= 15
        return this.worksType === 'processing' && this.busyJobs > 0 && matchProgressCount
      },
      showEmpty() {
        return (
          (this.worksType === 'processed' && !this.currentWorks.length) ||
          (this.worksType === 'processing' && !this.currentWorks.length && this.offlineLength === 0)
        )
      },
      selectedNumber() {
        return this.currentWorks.filter((item) => item.selected).length
      },
      selectedList() {
        return this.currentWorks.filter((item) => item.selected).map((item) => item.transId)
      },
      currentWorks() {
        if (this.worksType === 'processing') {
          return this.works.filter(
            (item) =>
              item.status !== Work.statusFinished &&
              item.status !== Work.statusProcessFailed &&
              item.status !== Work.statusReady &&
              item.status !== Work.statusImageTooLarge
          )
        } else if (this.worksType === 'processed') {
          const processeds = this.works.filter(
            (item) => item.status === Work.statusProcessFailed || item.status === Work.statusImageTooLarge
          )
          const finishedProcesseds = this.works.filter((item) => {
            return item.status === Work.statusFinished
          })
          const arr = [...this.processedList]
          const failedProcess = []
          const finishedProces = []
          processeds.forEach((item) => {
            if (!this.processedList.find((it) => item.transId === it.transId)) {
              failedProcess.push(item)
            }
          })
          finishedProcesseds.forEach((item) => {
            if (!this.processedList.find((it) => item.transId === it.transId)) {
              finishedProces.push(item)
            }
          })
          let finalFinishData = [...failedProcess, ...arr, ...finishedProces]
          finalFinishData = finalFinishData.filter((item) => {
            return !this.deletedAllIds.includes(item.transId)
          })
          return finalFinishData
        } else if (this.worksType === 'uploaded') {
          return this.works.filter(
            (item) =>
              item.status === Work.statusReady ||
              item.status === Work.statusUploading ||
              item.status === Work.statusUploadFailed
          )
        } else {
          return this.works
        }
      },
      getTime() {
        let time = this.busyTime
        if (typeof s !== 'number') {
          time = Number(time) || 0
        }
        if (time < 0) {
          return
        }
        const m = 60 // 1分钟的毫秒数
        const h = m * 60 // 1小时的毫秒数
        const hours = Math.floor(time / h)
        const minutes = Math.floor((time % h) / m)
        const seconds = (time % h) % m
        const filter = (item) => {
          return item > 9 ? '' + item : '0' + item
        }
        return `${filter(hours)}:${filter(minutes)}:${filter(seconds)}`
      },
      busyTime() {
        return Math.ceil((this.busyJobs * 25) / this.workerCount)
      },
      selectFinished() {
        return this.currentWorks.filter((work) => work.status === Work.statusFinished && work.selected)
      },
    },
    watch: {
      busyJobs: {
        handler(val) {
          if (val) {
            this.$trace.traceCustomEvent({
              event: 'submit',
              xargs_event_category: 'upgrade_account',
              event_label: 'single_job_queue',
            })
          }
        },
        deep: true,
      },
      tabShow(val) {
        if (val === 1) {
          if (this.worksType === 'processing') {
            this.getProcessing()
          }

          if (this.tabTimer) {
            clearTimeout(this.tabTimer)
          }
          if (!this.$getCookie('cloud_newfeature_offline') && !this.offlineVisible) {
            this.tabTimer = setTimeout(() => {
              //关闭新特性弹窗
              // this.showNewFeature = true
              this.$setCookie('cloud_newfeature_offline', '1')
            }, 3000)
          }
        } else if (val === 2) {
          if (this.worksType === 'processed') {
            this.getProcessed()
          }
          this.showNewFeature = false
          if (this.tabTimer) {
            clearTimeout(this.tabTimer)
          }
        } else {
          this.showNewFeature = false
          if (this.tabTimer) {
            clearTimeout(this.tabTimer)
          }
        }
      },
      currentWorks: {
        handler(val) {
          this.checkedAll = val.every((item) => item.selected)
          this.getImageType()
          this.selTypeFun(this.selTagType)
        },
        deep: true,
        immediate: true,
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
    mounted() {
      if (this.$getCookie('cloud_editDownloadDialogDontShow')) {
        this.editDownloadDialogDontShow = true
      }
      this.getWorkerCount()
    },
    created() {
      if (process.browser) {
        this.getDontShowAgain()
        if (this.worksType === 'processed') {
          this.getProcessed()
        } else if (this.worksType === 'processing') {
          //todo
          this.getProcessing()
        }
      }
    },
    methods: {
      getWorkerCount() {
        this.$axios.post(servers.service + '/api/v2/worker/count').then((res) => {
          if (res.code == 200) {
            this.workerCount = res.data.workerCount || 1
          }
        })
      },
      handleDownloadTipClose() {
        this.downloadDialogVisible = false
        this.waitDownload = null
      },
      //用户切换分类
      selTypeFun(req) {
        this.selTagType = req
        if (!req) {
          this.showList = this.currentWorks
        } else {
          this.showList = this.currentWorks.filter((val) => {
            if (req == 'brightness' || req == 'perfect') {
              return val.operation == 'brightness' || val.operation == 'perfect'
            }
            if (req == 'animegan' || req == 'sketch') {
              return val.operation == 'animegan' || val.operation == 'sketch'
            }
            return val.operation == req
          })
        }
      },
      //收集所有用户处理图片类型
      getImageType() {
        const allOperation = new Set()
        if (Array.isArray(this.currentWorks)) {
          this.currentWorks.forEach((val) => {
            if (val.operation == 'brightness' || val.operation == 'perfect') {
              if (!allOperation.has('brightness') && !allOperation.has('perfect')) {
                allOperation.add(val.operation)
                return
              }
            }
            if (val.operation == 'animegan' || val.operation == 'sketch') {
              if (!allOperation.has('animegan') && !allOperation.has('sketch')) {
                allOperation.add(val.operation)
                return
              }
            }
            if (
              !allOperation.has('animegan') &&
              !allOperation.has('sketch') &&
              !allOperation.has('brightness') &&
              !allOperation.has('perfect')
            ) {
              allOperation.add(val.operation)
            }
          })
        }
        this.imageAllType = Array.from(allOperation)
      },
      getFileSize(item) {
        if (item && item.filesize) {
          if (item.filesize / Math.pow(1024, 2) > 1) {
            return (item.filesize / Math.pow(1024, 2)).toFixed(2) + 'MB'
          } else {
            return (item.filesize / 1024).toFixed(2) + 'KB'
          }
        }
        return '0KB'
      },
      feedBackDialog() {
        if (this.$getCookie('email')) {
          this.formData.email = this.$getCookie('email')
        }
        this.showDialog = true
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
        const work = this.logged ? this.currentWorks[0] : this.currentWorks[this.currentWorks.length - 1]

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          email: this.formData.email,
          xargs_user_level: this.userType,
          event_info: {
            process_type: work.operation,
          },
        })
        // fetch
        console.info(work)
        this.$axios
          .post(servers.service + '/api/feedback/add', {
            email: this.formData.email,
            content: `${this.formData.message}`,
            web: 'vanceai',
            trans_id: work.transId || work.trans_id,
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
      onSubscribe() {
        window.location.href =
          this.$store.state.mainWebsite +
          this.$store.state.specialLocaleLink +
          '/pricing?source=downloading_popup&location=download_subscribe&automaticprice=1'
      },
      async toImageEditor() {
        this.getProcessed()
        const { imageUrl, downloadFileName } = await getDownloadUrlFromS3(this.imgInfo.transId)
        this.imgInfo.originImg = imageUrl
        this.imgInfo.filename = downloadFileName
        localStorage.setItem('imgInfo', JSON.stringify(this.imgInfo))
        if (this.windowOpen && !this.windowOpen.closed) {
          this.windowOpen.focus()
        } else {
          this.windowClose = false
          let url =
            window.location.origin + this.$t('common.common_nav_link_19') + '?' + window.location.search
          if (window.__MICRO_APP_ENVIRONMENT__) {
            url =
              window.rawWindow.__mainAppOrigin__ +
              this.$t('common.common_nav_link_19') +
              '?' +
              window.location.search
          }
          this.windowOpen = window.open(url, '_blank')
        }
      },
      async checkPoint() {
        if (!this.imgInfo.sample) {
          //免费用户
          if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'register') {
            if (this.imgInfo.used_num >= 5) {
              // 余额不足
              this.notEnoughPOints()
              this.editDownloadDialog = false
            } else {
              this.imgInfo.originImg = await getPreviewUrl({ transId: this.imgInfo.transId, issrc: 0 })
              this.work.finish = 2
              const res = await this.$axios.get(this.imgInfo.originImg)
              if (res.code === 30004) {
                this.notEnoughPOints()
                this.editDownloadDialog = false
              } else {
                this.getPoint(() => {
                  this.toImageEditor()
                  this.editDownloadDialog = false
                })
              }
            }
            this.toEditorPageLoading = false
          } else {
            if (this.$getCookie('token')) {
              Work.pointCheck({ trans_ids: [this.imgInfo.transId] })
                .then(async (res) => {
                  if (res.code === 200) {
                    const { imageUrl, downloadFileName } = await getDownloadUrlFromS3(this.imgInfo.transId)
                    this.imgInfo.originImg = imageUrl
                    this.work.finish = 2
                    this.getPoint(() => {
                      this.toImageEditor()
                    })
                    this.toEditorPageLoading = false
                    this.editDownloadDialog = false
                    // todo 暂时此方法解决，未完善
                  } else if (res.code === 30004) {
                    this.notEnoughPOints()
                    this.editDownloadDialog = false
                  }
                })
                .finally(() => {
                  this.toEditorPageLoading = false
                  this.editDownloadDialog = false
                })
            } else {
              setLoginDialogShow()
              this.toEditorPageLoading = false
              this.editDownloadDialog = false
              return
            }
          }
        } else {
          this.toImageEditor()
          this.toEditorPageLoading = false
        }
      },
      editDownloadContinueHandle() {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: 'edit_image_continue',
        })
        if (this.editDownloadDialogDontShow) {
          this.$setCookie('cloud_editDownloadDialogDontShow', '1')
        }
        this.checkPoint()
      },
      editDownloadCancelHandle() {
        this.editDownloadDialog = false
      },
      getWorkflowName(item) {
        if (!item.workflow && item.workflowId) {
          if (Number(item.workflowId).toString() === 'NaN') {
            item.operator = item.workflowId
          } else {
            if (Number(item.workflowId)) {
              Work.getWorkflow({
                id: Number(item.workflowId),
              }).then((res) => {
                if (res.code === 200) {
                  item.workflow = res.data.name
                }
              })
            }
          }
        }
      },
      closeFeature() {
        this.showNewFeature = false
      },
      closeDialog() {
        this.cantDownload = false
      },
      getProcessed(val) {
        this.loadingProcessed = true
        this.currentPage = val || 1
        Work.record(this.currentPage, 50)
          .then((res) => {
            res = res.data

            if (res.code === 200) {
              this.processedList = []
              this.total = res.data.total
              const data = res.data.datas
              data.forEach((item) => {
                const { ojson } = item
                let ojsonObj, customWidth, customHeight
                if (ojson) {
                  ojsonObj = JSON.parse(ojson)
                  ojsonObj.config.forEach((configItem) => {
                    const { module_params } = configItem.config
                    const { width, height, customize } = module_params
                    if (customize) {
                      customWidth = width
                      customHeight = height
                    }
                  })
                }

                const thumbnail = servers.cloudS3BucketPath + item.thumbnail
                const obj = {
                  thumbnail,
                  originImg: item.targetSrc,
                  filename: item.name,
                  customWidth,
                  customHeight,
                  operation: Number(item.workflow_id).toString() === 'NaN' ? item.workflow_id : item.job,
                  transId: item.trans_id,
                  workflowId: item.workflow_id,
                  workflow: '',
                  uid: item.uid,
                  status: item.success == 0 ? Work.statusProcessFailed : Work.statusFinished,
                  likes: item.thumbsup,
                  w: item.w,
                  h: item.h,
                  filesize: item.dst_file_size,
                  config: {
                    scale: item.scale,
                  },
                  selected: false,
                  finish: item.finish,
                  uploadLocation: item.targetSrc.indexOf('/mnt/') > -1 ? 'nfs' : 's3',
                }
                //自定义产品名称
                if (obj.operation === 'animegan_toon') {
                  obj.operation = 'cartoonize'
                }
                this.processedList.push(obj)
              })
            } else {
              // eslint-disable-next-line no-console
              console.log('err')
            }
          })
          .catch(() => {
            // eslint-disable-next-line no-console
            console.log('err')
          })
          .finally(() => {
            this.loadingProcessed = false
          })
      },
      getProcessing() {
        // Work.batchTransformStatus().then((res) => {
        //   if (res.code === 200) {
        //     this.offlineLength = res.data.count
        //   }
        // })
      },
      enableOffline() {
        this.showNewFeature = false
        this.offlineWork = true
        this.offlineVisible = false
        this.startOfflineProcess()
      },
      async startOfflineProcess() {
        const params = {
          uids: [],
          jconfig: '',
          workflow_id: '',
        }
        const cids = []
        const works = this.works.filter((item) => item.status === Work.statusWaiting)
        const filters = works.filter((item) => !item.uid)
        if (filters && filters.length) {
          for (let i = 0; i < filters.length; i++) {
            const data = await this.uploadImg(filters[i])
            if (data && data.uid) {
              filters[i].uid = data.uid
            }
          }
        }
        works.forEach((item) => {
          cids.push(item.cid)
          params.uids.push(item.uid)
          item.offline = true
        })
        if (works && works.length) {
          params.jconfig = JSON.stringify(works[0].params)
          params.workflow_id = works[0].workflowId || ''
        }

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
              this.getProcessing()
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
      switchMode(mode) {
        this.activeMode = mode
      },
      // 全选/反选
      onCheckAllChange(val) {
        this.currentWorks.forEach((item) => {
          item.selected = val
        })
      },
      onCheckOneChange() {
        this.checkedAll = this.currentWorks.every((item) => item.selected)
      },
      onSaveDropbox() {
        if (this.dropboxType == 'dropbox_loading') {
          return false
        }
        if (this.$getCookie('token')) {
          const worksFinished = this.currentWorks.filter(
            (work) => work.status === Work.statusFinished && work.selected
          )
          if (worksFinished.length <= 0) {
            this.$message({
              message: this.$t('common.select_tip'),
              type: 'warning',
            })
            return
          }

          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'other',
            event_value: 'save_to_dropbox',
          })
          const trans_ids = []
          worksFinished.forEach((work) => {
            if (String(work.uid).length > 2) {
              trans_ids.push(work.transId)
            }
          })
          Work.pointCheck({ trans_ids, need_download_temp_id: 1 })
            .then(async (res) => {
              if (res.code === 200) {
                // Dropbox Save
                const files = await this.getFiles(worksFinished)
                const options = {
                  files,
                  success: this.dropBoxSucess,
                  progress: this.dropBoxProgress,
                  cancel: this.dropBoxCalcel,
                  error: this.dropBoxError,
                }
                try {
                  // eslint-disable-next-line no-undef
                  Dropbox.save(options)
                } catch (err) {
                  // this.dropBoxError()
                }
              } else if (res.code === 30004) {
                this.notEnoughPOints()
              }
            })
            .catch(() => {
              this.$message.error(this.$t('common.check_network'))
            })
            .finally(() => {
              this.maxLoading = false
            })
        }
      },
      async getFiles(works) {
        const files = []
        const getFilesPromises = []
        const getFile = (item) => {
          return new Promise((resolve, reject) => {
            getDownloadUrlFromS3(item.transId).then((res) => {
              files.push({
                url: res.imageUrl,
                filename: res.downloadFileName,
              })
              resolve()
            })
          })
        }
        works.forEach((item) => {
          const filePromise = getFile(item)
          getFilesPromises.push(filePromise)
        })
        await Promise.all(getFilesPromises)

        return files
      },
      dropBoxSucess() {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          xargs_save_status: 'success',
        })
        this.dropboxType = 'dropbox_success'
        setTimeout(() => {
          this.dropboxType = 'dropbox'
        }, 1000)
        this.$message.success(this.$t('workspace.save_success'))
        this.getPoint()
      },
      dropBoxError() {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          xargs_save_status: 'error',
        })
        this.dropboxType = 'dropbox_error'
        setTimeout(() => {
          this.dropboxType = 'dropbox'
        }, 1000)
        this.$message.error(this.$t('workspace.save_failed'))
        this.getPoint()
      },
      dropBoxProgress() {
        this.dropboxType = 'dropbox_loading'
      },
      dropBoxCalcel() {
        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'operation',
          event_value: 'cancel_dropbox',
        })

        this.dropboxType = 'dropbox'
      },
      handleDriveSave(drive) {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: 'save_to_drive',
          event_label: drive,
        })
        this.downloadDialogVisible = false
      },
      continueDownload() {
        if (this.waitDownload) {
          this.onDownload(this.waitDownload)
        } else {
          this.onDownloadAll()
        }

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'download',
          event_value: 'download_img',
        })
        this.downloadDialogVisible = false
      },
      onDownloadBefore(item) {
        // if (item.file / 1024 / 1024 > 20) {
        //   this.waitDownload = item
        //   this.downloadDialogVisible = true
        // } else {
        this.onDownload(item)
        // }
      },
      onDownloadAllBefore() {
        // const sumOfAllFilesize = this.currentWorks
        //   .filter((item) => item.selected)
        //   .reduce((prev, curr) => {
        //     return prev + curr.filesize
        //   }, 0)
        // if (sumOfAllFilesize / 1024 / 1024 > 20) {
        //   this.downloadDialogVisible = true
        // } else {
        this.onDownloadAll()
        // }
      },
      onDownloadAll() {
        const download = async (list) => {
          if (!list.length) {
            this.maxLoading = false
            return
          }
          const work = list.pop()
          //S3下载
          const { imageUrl, downloadFileName } = await getDownloadUrlFromS3(work.transId)
          await browserDownload(imageUrl, downloadFileName)
          this.currentDownload++
          this.getPoint()
          download(list)
        }
        this.currentDownload = 1
        if (this.$getCookie('token')) {
          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'download',
            event_value: 'download_all',
          })
          const worksFinished = this.currentWorks.filter(
            (work) => work.status === Work.statusFinished && work.selected
          )
          if (worksFinished.length <= 0) {
            this.$message({
              message: this.$t('common.select_tip'),
              type: 'warning',
            })
            return
          }
          this.totalDownload = worksFinished.length
          this.maxLoading = true
          Work.pointCheck({
            trans_ids: worksFinished
              .filter((item) => String(item.uid).length > 2)
              .map((item) => item.transId),
            need_download_temp_id: 1,
          })
            .then((res) => {
              if (res.code === 200) {
                download(worksFinished)
                // eslint-disable-next-line no-console
              } else if (res.code === 30004) {
                this.maxLoading = false
                this.notEnoughPOints()
              }
            })
            .catch(() => {
              this.maxLoading = false
              this.$message.error(this.$t('common.check_network'))
            })
        } else {
          this.maxLoading = false

          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'download',
            event_value: 'download_first_image',
          })
          setLoginDialogShow()

          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'register',
            event_value: 'show_register_popup',
            xargs_register_popup_panel: 'register',
          })
        }
      },
      // VanceAI 积分不足弹窗
      notEnoughPOints() {
        this.$confirm(this.$t('common.process_limit_2'), this.$t('common.process_limit_1'), {
          confirmButtonText: this.$t('common.upload_4'),
          showCancelButton: false,
          showConfirmButton: true,
          dangerouslyUseHTMLString: true,
          lockScroll: false,
          showClose: false,
          type: 'warning',
        })
          .then(() => {
            this.$trace.traceCustomEvent({
              event: 'click',
              xargs_event_category: 'popup',
              event_value: 'add_credits_popup',
            })
            location.href =
              this.$store.state.mainWebsite +
              this.$store.state.specialLocaleLink +
              '/pricing/?source=add_credits_popup'
          })
          .catch(() => {
            this.processLoading = false
          })
        setTimeout(() => {
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
        }, 3000)
      },
      onDelAllProcessed() {
        this.processedList = this.currentWorks
        if (this.processedList.filter((item) => item.selected).length) {
          this.showDel = true
        } else {
          this.$message.error(this.$t('common.select_tip'))
        }
      },
      downloadFile(blob) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a') // 创建a标签
        link.href = url
        link.download = 'fileDown' + Date.now() + '.zip' // 重命名文件
        link.click()
        window.URL.revokeObjectURL(url) // 释放内存
      },
      getRouteUrl() {
        return this.$store.state.website !== 'vanceai.com' ? 'https://vanceai.com' : ''
      },
      generateDownloadURL(jconfig, work) {
        work.downloadName = work.filename
        const replaceSuffix = (target, suffix) => {
          return target.replace(/\.(png|jpg|jpeg|webp|gif)$/, `.${suffix}`)
        }
        if (jconfig) {
          if (Array.isArray(jconfig)) {
            const lastConfig = jconfig.pop()
            if (lastConfig) {
              const outParams = lastConfig['config']['out_params']
              work.downloadName = (outParams.keep_origin_name ? '' : work.operation + '_') + work.filename
              if (outParams.format) {
                work.downloadName = replaceSuffix(work.downloadName, outParams.format)
              }
            }
          } else {
            const outParams = jconfig.config.out_params
            work.downloadName = (outParams.keep_origin_name ? '' : work.operation + '_') + work.filename
            if (outParams.format) {
              work.downloadName = replaceSuffix(work.downloadName, outParams.format)
            }
          }
        }
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
                    if (this.isPaied && isDownloaded) {
                      if (!work.likes && !this.$getCookie('cloud_ratedialog')) {
                        this.fabulousWin = true //引导点赞弹窗
                      }
                    }
                    this.minLoading = false
                  })
                } else {
                  this.$message.error(this.$t('下载失败了'))
                  this.minLoading = false
                }
              }, time)
              // todo 暂时此方法解决，未完善
            } else if (res.code === 30004) {
              this.minLoading = false
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
        if (this.minLoading) {
          return
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
          return
        }
        if (this.$getCookie('token')) {
          if (this.isPaied) {
            this.minLoading = true
          }
          this.onDownloadImage(work)
        } else {
          //游客下载elk上报

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
          this.$emit('downloadImage', { work })
        }
      },
      /**
       * onDownloadImage 图片下载
       */
      onDownloadImage(work) {
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

        this.onDownloadUrl(work)
      },
      /**
       * @onPreview
       */
      onPreview(work) {
        if (work.sample) {
          // MyUploadDialog.initSampleList 设置的 targetImg 可能不再试用，
          // 因为选择的 operation 变化后 targetImg 需要作相应的变化
          if (Object.keys(this.allSampleList).length > 0) {
            const samples = this.allSampleList[work.operation]
            if (samples && samples.length >= work.uid) {
              work.targetImg = samples[parseInt(work.uid) - 1].targetImg
            }
          }

          if (work.operation === Work.typeEnlarge) {
            work.targetImg = work.targetImg.replace(/XXX/g, work.config.scale)
          }
          if (work.operation === Work.typePortrait) {
            const rate = work.singleFace === 'face' ? 1 : 2
            work.targetImg = work.targetImg.replace(/XXX/, rate)
          }
          this.previewInfo = {
            info: work,
            beforeLoading: false,
            afterLoading: false,
            beforeImg: work.originImg,
            afterImg: work.targetImg,
            userInfo: this.userInfo,
            resolutionFlag: true,
            width: work.w,
            height: work.h,
            operation: work.operation,
            filesize: work.filesize,
          }
          this.showNewPreview = true
          this.workInfo = work
          this.$emit('showNewPreview', this.previewInfo, this.workInfo)
          return
        }

        const resolutionFlag = work.w * work.config.scale > 8000 || work.h * work.config.scale > 8000
        const startpreTime = Date.now()
        this.previewInfo.info = work
        this.previewInfo.beforeLoading = true
        this.previewInfo.afterLoading = true
        this.previewInfo.beforeImg = ''
        this.previewInfo.afterImg = ''
        this.previewInfo.afterW = 0
        this.previewInfo.afterH = 0
        this.previewInfo.beforeW = 0
        this.previewInfo.beforeH = 0
        this.previewInfo.userInfo = this.userInfo
        // if测试 不提交elk 用vanceai-test
        setTimeout(async () => {
          //S3预览
          // this.previewInfo.beforeImg = await getPreviewUrl({ transId: work.transId, issrc: 1 })
          const previewUrlData = await getPreviewUrlData({ transId: work.transId, issrc: 1 })
          this.previewInfo.beforeImg = previewUrlData.presignUrl
          this.previewInfo.beforeW = previewUrlData.picWidth
          this.previewInfo.beforeH = previewUrlData.picHeight
          this.previewInfo.beforeLoading = false
        }, 200)

        if (!resolutionFlag) {
          // !大分辨率
          this.previewInfo.resolutionFlag = true
          setTimeout(async () => {
            const endTime = Date.now()
            //S3预览
            // work.targetImg = await getPreviewUrl({ transId: work.transId, issrc: 0 })
            const previewUrlData = await getPreviewUrlData({ transId: work.transId, issrc: 0 })
            work.targetImg = previewUrlData.presignUrl
            this.previewInfo.afterW = previewUrlData.picWidth
            this.previewInfo.afterH = previewUrlData.picHeight

            this.previewInfo.afterLoading = false
            this.previewInfo.afterImg = work.targetImg
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
              this.$trace.traceCustomEvent({
                event: 'online_work',
                xargs_event_category: 'preview',
                event_value: 'preview',
                event_info: {
                  preview_type: 'auto',
                  transfer_time: parseInt((endTime - startpreTime) / 1000),
                },
              })
            } else {
              this.$trace.traceCustomEvent({
                event: 'online_work',
                xargs_event_category: 'preview',
                event_value: 'preview',
                event_info: {
                  preview_type: 'manual',
                  transfer_time: parseInt((endTime - startpreTime) / 1000),
                },
              })
            }
          }, 500)
        } else {
          this.previewInfo.resolutionFlag = false
          this.previewInfo.afterLoading = false
          this.previewInfo.afterImg = ''
        }
        this.previewInfo.width = work.w
        this.previewInfo.height = work.h
        this.previewInfo.filesize = work.filesize
        this.showNewPreview = true
        this.workInfo = work
        if (this.$getCookie('userType') === 'register') {
          this.$store.commit(
            'SET_REGISTER_TRIAL',
            JSON.stringify({
              ...this.$store.state.registerTrial,
              preview: this.$store.state.registerTrial.preview + 1,
            })
          )

          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'preview',
            event_value: 'preview',
            event_info: {
              free_user_trial_new: this.$store.state.registerTrial.preview,
            },
          })
        } else if (this.$getCookie('userType') === 'guest' || this.$getCookie('userType') === 'undefined') {
          this.$store.commit(
            'SET_GUEST_TRIAL',
            JSON.stringify({
              ...this.$store.state.guestTrial,
              preview: this.$store.state.guestTrial.preview + 1,
            })
          )

          this.$trace.traceCustomEvent({
            event: 'online_work',
            xargs_event_category: 'preview',
            event_value: 'preview',
            event_info: {
              guest_trial_new: this.$store.state.guestTrial.preview,
            },
          })
        }
        this.$emit('showNewPreview', this.previewInfo, this.workInfo)
      },
      hidePreview() {
        this.showPreview = false
      },
      onDelWorks(work) {
        // this.works = this.works.filter((item) => item.cid !== work.cid)
        // const flag = this.works.some(
        //   (item) => item.status === Work.statusWaiting || item.status === Work.statusProcessing
        // )
        // if (!flag) {
        //   this.processLoading = false
        // }
        this.processedList = this.processedList.filter((item) => item.transId !== work.transId)
        if (work.transId) {
          this.deletedTransIds = [...new Set([work.transId, ...this.deletedTransIds])]
        }
        this.$emit('delProcessedWorks', work)
      },
      originImgInfo(work) {
        return {
          finish: 1,
          ...work,
          // originImg: Work.targetImgUrl(work.transId),
          originImg: '',
        }
      },
      onEdit(work, index) {
        this.currentIndex = index
        this.toEditorPageLoading = true

        this.$trace.traceCustomEvent({
          event: 'online_work',
          xargs_event_category: 'editor',
          event_value: 'edit_image',
        })
        // item.status = Work.statusReady
        this.imgInfo = this.originImgInfo(work)
        this.work = work
        if (work.sample) {
          this.imgInfo.sample = true
        } else {
          this.imgInfo.sizeNum = 'large'
        }
        //未登录
        if (!this.$getCookie('token')) {
          setLoginDialogShow()
          this.toEditorPageLoading = false
          return
        }
        //已下载
        if (this.imgInfo.finish === 2) {
          this.toEditorPageLoading = false
          this.toImageEditor()
          return
        }
        // 没勾选不展示
        if (!this.editDownloadDialogDontShow) {
          this.editDownloadDialog = true

          this.$trace.traceCustomEvent({
            event: 'click',
            xargs_event_category: 'other',
            event_value: 'edit_image_popup',
          })
          this.toEditorPageLoading = false
          return
        }
        this.checkPoint(work)
      },
      delWork(params) {
        return Work.deleteWork(params)
      },
      async confirmDel() {
        const ids = this.currentWorks.filter((item) => item.selected).map((item) => item.transId)
        const params = {
          trans_ids: ids,
        }
        await this.delWork(params)
        if (this.worksType === 'processed') {
          this.processedList = this.processedList.filter((item) => {
            return !ids.includes(item.transId)
          })
        }
        this.deletedTransIds = [...new Set([...ids, ...this.deletedTransIds])]
        this.$emit('delProcessedWorks', this.worksType, ids)
        this.showDel = false
      },
      addImage() {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: 'add_image',
        })
      },
    },
  }
</script>

<style scoped lang="less">
  .loadtxt .icon-s-fail {
    font-size: 24 / @base;
    color: red;
  }

  .loadtxt .icon-s-wait {
    font-size: 24 / @base;
    color: #ff9d1d;
  }

  .icon-s-preview,
  .icon-s-edit {
    font-size: 34 / @base;
  }

  .preview-icon-box,
  .edit-icon-box {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }

  .preview-icon-box,
  .edit-icon-box,
  .down-box,
  .del-box {
    width: 35 / @base;
    height: 35 / @base;
    margin-left: 15 / @base;
    text-align: center;
    background: #f2f2f2;
    border-radius: 3 / @base;

    &:hover {
      background: #e6f1fe;

      .icon-s-preview,
      .icon-s-edit {
        color: #0374ff !important;
      }
    }
  }

  .icon-s-delete {
    font-size: 20px;
  }
  .del-box {
    &:hover {
      background: #fae8e4 !important;

      .icon-s-delete {
        color: #ca0000;
      }
    }
  }

  .down-box {
    background-color: #e6f1fe !important;
  }

  .icon-s-download {
    font-size: 20px;
    .active {
      color: #0374ff;
    }
  }

  .icon-s-complete {
    color: #5dbd4d;
  }

  .icon-s-info {
    color: red;
  }

  .icon-s-refresh {
    color: #0374ff;
  }

  .sel-type-box {
    padding: 15px 20px 10px;
    border-bottom: 1px solid #efefef;

    li {
      float: left;
      padding: 5px 20px;
      margin-right: 20px;
      margin-bottom: 10px;
      font-size: 12px;
      color: #fff;
      cursor: pointer;
      background-color: #919191;
      border-radius: 3px;

      &.tag-sel {
        background-color: #e27e1c;
      }
    }
  }

  .btn_del:hover {
    color: #ca0000 !important;
  }

  .uploadimagelist.uploaded-box .process-tit {
    display: flex;
    justify-content: space-between;
    padding: 17.5 / @base 22.5 / @base;
    border-bottom: 1px solid #efefef;

    .btn {
      padding: 0 20px;
    }

    .lt {
      display: flex;
      align-items: center;

      i {
        margin-right: 0.5rem;
      }

      > * {
        border-left: 1px solid #efefef;
      }

      > :first-child {
        padding-left: 0;
        border-left: 1px solid transparent;
      }

      .btn_del,
      .btn_down {
        display: flex;
        align-items: center;
        cursor: pointer;
        background: #fff;

        &:hover {
          color: rgb(3, 116, 255);

          .icon-s-download {
            color: rgb(3, 116, 255) !important;
          }
        }
      }

      .dropbox {
        display: flex;
        align-items: center;
        justify-content: space-around;
        cursor: pointer;

        button {
          color: rgb(168, 168, 168);
          cursor: pointer;
          background: #fff;
          border: none;
        }

        .finished_select {
          color: rgb(77, 77, 79);
        }
      }

      .dropbox-check {
        .icon-s-dropbox {
          color: rgb(3, 116, 255);
        }

        &:hover {
          button,
          .icon-s-dropbox {
            color: rgb(3, 116, 255);
          }
        }
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
    }

    .rt {
      display: flex;
      align-items: center;
      text-align: right;

      .btns {
        display: flex;
        align-items: center;
        margin-right: 1rem;
        overflow: hidden;
        border: 1px solid #f2f2f2;
        border-radius: 3px;

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          padding: 0.3rem;
          cursor: pointer;

          &:hover {
            background: #ece9e9;
          }
        }

        .active-btn {
          background: #ece9e9;
        }
      }

      .add-image-btn {
        padding: 0.5rem 20px;
        background: #f7f7f7;
        border: 1px solid #ddd;
        border-radius: 3px;
      }

      .add-image-btn:hover {
        color: #fff;
        background: #ff9d1d;
        border: 1px solid #ff9d1d;
      }
    }
  }

  .limit_size_dialog {
    width: 500px;
    padding: 20px;

    .tip {
      text-align: left;
    }
  }

  .dialog-btn-box {
    padding: 20px;
  }

  .process-cont {
    position: relative;
    height: calc(100vh - 17rem);

    .selected-number {
      position: absolute;
      bottom: 14px;
      padding-left: 20px;

      span {
        margin-right: 5px;
        font-size: 14px;
        color: #4d4d4f;
      }
    }

    .feedback-btn {
      position: absolute;
      bottom: 4px;
      left: calc(50% - 110px);
      display: flex;
      justify-content: center;
      padding-left: 20px;

      .icon-s-feedback_black {
        margin-right: 15 / @base;
        font-size: 18px;
        color: #322005;
      }

      .btn-main,
      .primary-small-button {
        display: flex;
        align-items: center;
        justify-content: center;
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
  }

  .process-cont-dialog {
    position: relative;
  }

  .processed-box {
    height: calc(100% - 54px);
    overflow: auto;
    border-bottom: 1px solid #efefef;

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

  .offline-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 46 / @base;
    margin-bottom: 2px;
    color: #615637;
    text-align: center;
    background: #f7e3ad;
  }

  .processed-box-dialog {
    height: calc(100% - 54px);
    overflow: auto;
  }

  .uploaded-box .upload-empty,
  .process-images .upload-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 0;
  }

  .card-lt {
    display: flex;
    align-items: center;
    width: 75%;

    .thumb {
      border: 1px solid #efefef;
      border-radius: 3px;
    }

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
        margin-right: 20 / @base;
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

    .my-enlarge2 {
      background-color: #1c71e5;
    }

    .my-chainner_txt {
      background-color: #1c71e5;
    }

    .my-chainner {
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

    .checked {
      margin-right: 15px;
    }
  }

  .card-rt {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .image-operator {
      display: flex;
      justify-content: flex-end;
      min-width: 15rem;
      text-align: right;
    }

    .tooltip {
      display: inline-block;
      padding: 0 0.3rem;
      cursor: pointer;
    }

    .loadtxt {
      display: flex;
      align-items: center;
      justify-content: center;

      .text {
        display: flex;
        align-items: center;
        min-width: 10rem;
        text-align: center;

        span {
          margin-left: 1rem;
          font-size: 14px;
          white-space: nowrap;
        }
      }
    }
  }

  .rotate {
    margin-right: 1rem;
    animation: around 1s ease infinite;
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

  @keyframes around {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .offline {
    position: relative;

    .tip {
      position: absolute;
      top: 0;
      left: -7px;
      width: 7px;
      height: 7px;
      background: #ff1414;
      border-radius: 50%;
      animation: color-flash 1s infinite alternate;
    }
  }
  @keyframes color-flash {
    to {
      box-shadow: 0 0 4px 1px #ff1414;
    }

    from {
      box-shadow: 0 0 1px 1px #ff1414;
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

  .edit_download_dialog {
    padding: 30px 20px;
    text-align: left;
  }

  .edit_download_dialog_btns {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    margin-bottom: 20px;

    .btn-sub {
      margin-right: 10px;
      border-radius: 3px;
    }
  }

  .busy-tip {
    display: flex;
    height: auto;
    padding: 10px 24px;

    .tip {
      flex: 1 1 auto;
      margin-right: 30px;
      text-align: left;

      i {
        color: #0374ff;
      }
    }

    p {
      line-height: 24px;
    }

    .flex {
      display: flex;
    }

    .m-t-8 {
      margin-top: 8px;
    }

    .m-f-24 {
      margin-left: 24px;
    }

    /deep/.orange {
      font-weight: bold;
      color: #ff9d1d;
    }

    .btns {
      display: flex;
      flex: 0 0 300px;
      justify-content: flex-end;
      width: 300px;

      .upgrade-btn {
        min-width: 176px;
        height: 44px;
        padding: 0 32px;
        line-height: 44px;
      }
    }
  }
  @media (max-width: 768px) {
    /deep/.my_a-dialog-container {
      width: 90%;
    }

    .sel-type-box {
      li {
        margin-bottom: 10px;
      }
    }
  }
  @media (max-width: 768px) {
    .limit_size_dialog {
      width: 100%;
      padding: 15px;
    }

    .dialog-btn-box {
      padding: 15px;
    }

    .uploadimagelist.uploaded-box .process-tit {
      .lt {
        flex-wrap: wrap;
      }
    }
  }
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
</style>
