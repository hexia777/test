<template>
  <div>
    <div class="uploadimagelist uploaded-box" v-show="uploadList.length > 0">
      <div class="process-tit">
        <!--  -->
        <div class="lt">
          <el-checkbox
            class="btn"
            v-model="checkedAll"
            @change="onCheckAllChange"
            v-track-label="$commonTrackLabel('select_all_button')"
          >
            {{ $t('workspace.upload_5') }}
          </el-checkbox>
          <div
            class="btn btn_del iconfont-ctr"
            @click="onDelAllProcessed"
            v-track-label="$commonTrackLabel('batch_delete_button')"
          >
            <i class="iconfont-single icon-s-delete"></i>
            {{ $t('workspace.del') }}
          </div>
        </div>
        <div class="rt">
          <div class="btns">
            <div
              class="btn btn_list"
              :class="[activeMode === 'list' && 'active-btn']"
              @click="switchMode('list')"
              v-track-label="$commonTrackLabel('switch_mode_list')"
            >
              <i class="iconfont-single icon-s-batch-list"></i>
            </div>
            <div
              class="btn btn_meau"
              :class="[activeMode === 'grid' && 'active-btn']"
              @click="switchMode('grid')"
              v-track-label="$commonTrackLabel('switch_mode_grid')"
            >
              <i class="iconfont-single icon-s-batch-meau"></i>
            </div>
          </div>
          <file-upload
            v-bind="$attrs"
            v-on="$listeners"
            :job-type="jobType"
            @beforeUpload="beforeUpload"
            v-track-label="$commonTrackLabel('upload_image_button')"
          >
            <button class="primary-small-button add-image-btn" @click="onBeforeUpload">
              {{ $t('workspace.upload_2') }}
            </button>
          </file-upload>
        </div>
      </div>
      <div class="process-cont" :class="[isCurrentPageProcess && 'process-cont-dialog']">
        <div
          class="processed-box scroll-bar"
          :class="[isCurrentPageProcess && 'processed-box-dialog']"
          v-if="activeMode === 'grid'"
        >
          <grid-list
            class="grid-list"
            v-slot:default="{ item }"
            :select-limit="imageSelectLimit"
            :list="uploadList"
          >
            <span
              :class="[
                item.status !== 'ready' ? 'checkbox-box-disable' : 'checkbox-box',
                item.selected && 'checkbox-box-selected',
              ]"
            >
              <i v-show="item.selected" class="icon_input_checked"></i>
            </span>
            <img class="sample-img" v-lazy="item.thumbnail" alt="" width="79" height="79" />
          </grid-list>
        </div>
        <div
          class="processed-box scroll-bar"
          :class="[isCurrentPageProcess && 'processed-box-dialog']"
          v-else
        >
          <div v-for="(item, idx) in uploadList" :key="idx">
            <template>
              <div class="works worksprocess">
                <el-card shadow="never">
                  <div class="card-lt" :id="`cart-it-${idx}`">
                    <div class="checked" @click="onSampleSelected(item)">
                      <el-checkbox
                        v-model="item.selected"
                        @change="onCheckOneChange"
                        v-track-label="$commonTrackLabel('select_image_' + item.cid)"
                      />
                    </div>
                    <div class="img">
                      <img :src="item.thumbnail" class="thumb" width="80" height="80" />
                    </div>
                    <div style="padding: 14px;">
                      <div class="bottom clearfix">
                        <div>
                          <span class="filename">{{ item.filename | fileNameFormat }}</span>
                          <div class="img-info">
                            <span>
                              <span v-html="$t('workspace.upload_3') + ':'"></span>
                              <span>{{ item.w }} x {{ item.h }} px</span>
                            </span>
                          </div>
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
                      <div class="text" v-else-if="item.status === 'ready'">
                        <i class="iconfont-single icon-s-ready"></i>
                        <span v-html="$t('workspace.upload_status_2')"></span>
                      </div>
                      <div class="text" v-else-if="item.status === 'waiting'">
                        <i class="iconfont-single icon-s-wait"></i>
                        <span v-html="$t('workspace.upload_status_12')"></span>
                      </div>
                      <div class="text" v-else>
                        <i class="iconfont-single icon-s-fail"></i>
                        <span v-html="$t('workspace.upload_status_5')"></span>
                      </div>
                    </div>
                    <div class="image-operator">
                      <el-tooltip
                        class="tooltip"
                        popper-class="icon-tip"
                        effect="dark"
                        :content="$t('workspace.del')"
                        placement="top"
                        :disabled="$store.state.mobile"
                      >
                        <div
                          class="del-box"
                          @click="onDelWorks(item)"
                          v-track-label="$commonTrackLabel('delete_image_' + item.cid)"
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
          <span>
            <span v-if="imageSelectLimit === 1">{{ selectedNumber }}/{{ imageSelectLimit }}</span>
            <span v-else>{{ selectedNumber }}</span>
          </span>
          <span>{{ $t('workspace.upload_select') }}</span>
        </div>

        <div v-show="showFreeUserProcessHint" class="free-user-hint">
          <el-tooltip effect="dark" :content="$t('workspace.free_process_hint_hover')" placement="top">
            <i class="iconfont-single icon-s-kongxinwenhao"></i>
          </el-tooltip>
          <span> {{ $t('workspace.free_process_hint') }}</span>
          <span class="hint-number">{{ freeProcessWebNum }}</span>
        </div>
      </div>
    </div>
    <div class="upload-empty" v-show="uploadList.length <= 0">
      <img width="222" height="95" :src="$imgPath('/batch/upload_to_start.png')" alt />
      <p v-html="$t('workspace.upload_14')"></p>
    </div>
  </div>
</template>

<script>
  import GridList from '@/components/WorkSpace/GridList'
  import FileUpload from '@/components/FileUpload'
  import UserInfoMixins from '@/mixins/UserInfoMixins'
  import { USED_UPLOAD_PROMPT } from '@/static/config/common/constants'
  import { readLocalStorageArray } from '@/static/script/utils'

  export default {
    name: 'UploadImageList',
    components: { GridList, FileUpload },
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
    mixins: [UserInfoMixins],
    inheritAttrs: false,
    props: {
      uploadList: {
        type: Array,
        default: () => {
          return []
        },
      },
      imageSelectLimit: {
        type: Number,
        default: 1,
      },
      isCurrentPageProcess: {
        type: Boolean,
        default: false,
      },
      jobType: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        checkedAll: false,
        processLoading: false,
        showDel: false,
        activeMode: 'grid',
      }
    },
    computed: {
      showFreeUserProcessHint() {
        return (
          this.userType !== 'paying' &&
          this.$getCookie('token') &&
          this.jobType &&
          !['jpeg_artifact', 'perfect', 'se-dehazing', 'brightness'].includes(this.jobType)
        )
      },
      disableSelected() {
        return this.uploadList.filter((item) => item.selected).length >= this.imageSelectLimit
      },
      selectedNumber() {
        return this.uploadList.filter((item) => item.selected).length
      },
    },
    watch: {
      activeMode(val) {
        this.$setCookie('cloud_activeMode', val)
      },
      uploadList: {
        handler(val) {
          this.checkedAll = val.every((item) => item.selected)
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.activeMode = this.$getCookie('cloud_activeMode') || 'grid'
    },
    methods: {
      onSampleSelected(val) {
        if (this.imageSelectLimit === 1) {
          if (val.selected) {
            val.selected = false
          } else {
            const filter = this.uploadList.filter((item) => item.selected)
            if (filter && filter.length) {
              filter[0].selected = false
            }
            setTimeout(() => {
              val.selected = true
            }, 500)
          }
        }
      },
      switchMode(mode) {
        this.activeMode = mode
      },
      // 全选/反选
      onCheckAllChange(val) {
        if (this.imageSelectLimit === 1) {
          for (let i = 0; i < this.uploadList.length; i++) {
            if (i === 0) {
              this.uploadList[i].selected = val
              return
            }
          }
        } else {
          this.uploadList.forEach((item) => {
            item.selected = val
          })
        }
      },
      onCheckOneChange() {
        this.checkedAll = this.uploadList.every((item) => item.selected)
      },
      onDelAllProcessed() {
        this.$emit('delUploadList')
      },
      onDelWorks(work) {
        // this.works = this.works.filter((item) => item.cid !== work.cid)
        // const flag = this.works.some(
        //   (item) => item.status === Work.statusWaiting || item.status === Work.statusProcessing
        // )
        // if (!flag) {
        //   this.processLoading = false
        // }
        this.$emit('delUploadList', work)
      },
      addImage() {
        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: 'add_image',
        })
      },
      beforeUpload(flag) {
        this.$emit('beforeUpload', flag)
      },
      onBeforeUpload(e) {
        if (this.checkUploadPrompt()) {
          e.stopPropagation()
          this.$emit('beforeUpload', true)
        }
      },
      checkUploadPrompt() {
        const usedUploadPromptArr = readLocalStorageArray(USED_UPLOAD_PROMPT)
        const jobList = ['sketch', 'repair']
        if (this.jobType && jobList.includes(this.jobType) && !usedUploadPromptArr.includes(this.jobType)) {
          return true
        }
        return false
      },
    },
  }
</script>

<style scoped lang="less">
  .icon-s-ready {
    font-weight: 900;
    color: #3ec52a;
  }

  .icon-s-batch-list,
  .icon-s-batch-meau {
    font-size: 16 / @base;
  }

  .btn_del:hover {
    color: #ca0000;
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
        border: 1px solid #f2f2f2;
        border-radius: 3px;

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 41 / @base;
          height: 38 / @base;
          padding: 0 0.3rem;
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
        min-width: 170 / @base;
      }
    }
  }

  .process-cont {
    position: relative;
    height: calc(100vh - 17rem);
    min-height: 28rem;

    .free-user-hint {
      position: absolute;
      right: 20px;
      bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
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
  }

  .process-cont-dialog {
    position: relative;
    height: calc(100vh - 18rem);
    min-height: 27rem;
  }

  .processed-box {
    height: calc(100% - 54px);
    min-height: 21rem;
    overflow: auto;
    border-bottom: 1px solid #efefef;

    .grid-list {
      padding: 10px 20px 20px;
    }

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

  .processed-box-dialog {
    height: calc(100% - 54px);
    min-height: 27rem;
    overflow: auto;
  }

  .uploaded-box .upload-empty,
  .process-images .upload-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
  }

  @keyframes around {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
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
        &:last-child {
          padding-left: 20 / @base;
        }

        &:first-child {
          padding-left: 0;
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

    .checked {
      margin-right: 15px;
    }
  }

  .card-rt {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .tooltip {
      display: inline-block;
      padding: 0 0.5rem;
      cursor: pointer;
      background: #f2f2f2;

      &:hover {
        background: #f9e8e4;

        .icon-s-delete {
          color: #ca0000;
        }
      }
    }

    .image-operator {
      min-width: 6rem;
      text-align: right;
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

  @media screen and (max-width: 414px) {
    .uploadimagelist.uploaded-box .process-tit {
      padding-right: 5px;
      padding-left: 5px;
    }

    .uploadimagelist.uploaded-box .process-tit .rt .add-image-btn {
      min-width: 9rem;
    }
  }
</style>
<style lang="less">
  .uploadimagelist .el-card__body {
    padding: 0 20px;
  }
</style>
