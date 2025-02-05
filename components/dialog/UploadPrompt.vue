<template>
  <div class="upload-prompt-ctr">
    <div class="right-ctr">
      <div class="title">
        <i class="iconfont-single icon-s-complete"></i
        ><span class="text">{{ $t('workspace.upload_prompt_right_title') }}</span>
      </div>
      <p class="desc">{{ $t(`workspace.upload_prompt_${type}_right_desc`) }}</p>
      <div class="image-list">
        <div class="image-item" v-for="item in imageList['right']" :key="item">
          <img :src="item" /><i class="iconfont-single icon-s-complete"></i>
        </div>
      </div>
    </div>
    <div class="error-ctr">
      <div class="title">
        <i class="iconfont-single icon-s-close"></i
        ><span class="text">{{ $t('workspace.upload_prompt_error_title') }}</span>
      </div>
      <p class="desc">{{ $t(`workspace.upload_prompt_${type}_error_desc`) }}</p>
      <div class="image-list">
        <div class="image-item" v-for="item in imageList['error']" :key="item">
          <img :src="item" />
          <i class="iconfont-single icon-s-close"></i>
        </div>
      </div>
    </div>
    <div class="footer">
      <button class="primary-button" @click="confirm">
        {{ $t('common.alert_ok') }}
      </button>
    </div>
  </div>
</template>

<script>
  import { USED_UPLOAD_PROMPT } from '@/static/config/common/constants'
  import { readLocalStorageArray } from '@/static/script/utils'
  export default {
    name: 'UploadPrompt',
    props: {
      type: {
        type: String,
        default: '',
      },
    },
    data() {
      const sampleImageMap = {
        sketch: {
          right: [
            this.$imgPath('/photo_to_sketch/sample_image_sketch_right_1.jpg'),
            this.$imgPath('/photo_to_sketch/sample_image_sketch_right_2.jpg'),
            this.$imgPath('/photo_to_sketch/sample_image_sketch_right_3.jpg'),
            this.$imgPath('/photo_to_sketch/sample_image_sketch_right_4.jpg'),
          ],
          error: [
            this.$imgPath('/photo_to_sketch/sample_image_sketch_error_1.jpg'),
            this.$imgPath('/photo_to_sketch/sample_image_sketch_error_2.jpg'),
            this.$imgPath('/photo_to_sketch/sample_image_sketch_error_3.jpg'),
            this.$imgPath('/photo_to_sketch/sample_image_sketch_error_4.jpg'),
          ],
        },
        repair: {
          right: [
            this.$imgPath('/photo_restorer/sample_image_repair_right_1.jpg'),
            this.$imgPath('/photo_restorer/sample_image_repair_right_2.jpg'),
            this.$imgPath('/photo_restorer/sample_image_repair_right_3.jpg'),
            this.$imgPath('/photo_restorer/sample_image_repair_right_4.jpg'),
          ],
          error: [
            this.$imgPath('/photo_restorer/sample_image_repair_error_1.jpg'),
            this.$imgPath('/photo_restorer/sample_image_repair_error_2.jpg'),
            this.$imgPath('/photo_restorer/sample_image_repair_error_3.jpg'),
            this.$imgPath('/photo_restorer/sample_image_repair_error_4.jpg'),
          ],
        },
      }
      return {
        sampleImageMap,
      }
    },
    computed: {
      imageList() {
        return this.sampleImageMap[this.type] || { right: [], error: [] }
      },
    },
    methods: {
      confirm() {
        const usedUploadPromptArr = readLocalStorageArray(USED_UPLOAD_PROMPT)
        usedUploadPromptArr.push(this.type)
        localStorage.setItem(USED_UPLOAD_PROMPT, JSON.stringify(usedUploadPromptArr))

        this.$emit('close')
      },
    },
  }
</script>

<style lang="less" scoped>
  .upload-prompt-ctr {
    margin: 10 / @base 10 / @base 0 10 / @base;
    .right-ctr {
      margin-bottom: 20 / @base;
    }
    .icon-s-complete {
      font-size: 20 / @base;
      margin-right: 10 / @base;
    }
    .icon-s-close {
      font-size: 20 / @base;
      margin-right: 10 / @base;
      color: #eb4831;
    }
    .title {
      margin-bottom: 10 / @base;
      display: flex;
      align-items: center;
      .text {
        font-size: 16 / @base;
        font-weight: bold;
        color: #232323;
        line-height: 24 / @base;
      }
    }
    .desc {
      margin-bottom: 10 / @base;
      font-size: 14 / @base;
      color: #8f8f8f;
      line-height: 22 / @base;
    }
    .image-list {
      display: flex;
      justify-content: space-between;
      .image-item {
        position: relative;
        img {
          width: 140 / @base;
          height: 140 / @base;
          object-fit: cover;
        }
        .icon-s-complete {
          position: absolute;
          right: 0;
          bottom: 6 / @base;
          font-size: 12 / @base;
          &::before {
            color: #5fbe61;
            background-color: #fff !important;
            border-radius: 100% !important;
          }
        }
        .icon-s-close {
          position: absolute;
          right: 0;
          bottom: 6 / @base;
          font-size: 12 / @base;
          &::before {
            color: #eb4831;
            background-color: #fff !important;
            border-radius: 100% !important;
          }
        }
      }
    }
    .footer {
      padding: 15 / @base 0 5 / @base;
      display: flex;
      justify-content: center;
      align-items: center;
      .primary-button {
        height: 40 / @base !important;
        line-height: 40 / @base !important;
        cursor: pointer;
      }
    }
  }
</style>
