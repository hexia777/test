import ImageCrop from '@/components/ImageCrop'
import ImageCropEdit from '@/components/ImageCrop/components/ImageCropEdit'

export default {
  components: {
    ImageCrop,
    ImageCropEdit,
  },
  data() {
    return {
      editorImageBtn: false,
      editorImageParams: {
        targetImg: '',
        filename: '',
        w: '',
        h: '',
        type: '',
      },
      editorEditorCrop: false,
    }
  },
  computed: {
    cropBtnType() {
      return !this.disabledBack
    },
    cropBtnType2() {
      return !this.disabledBack
    },
  },
  methods: {
    /**
     * @closeCropFun
     */
    closeCropFun() {
      this.editorEditorCrop = false
    },
    updateEditorCropVisible(visible) {
      this.editorEditorCrop = visible
    },
    /**
     * @imageEnterFun
     */
    imageEnterFun() {
      this.editorImageBtn = true
    },
    /**
     * @cropFun 图片裁剪
     */
    async cropFun() {
      this.editorEditorCrop = true
      this.editorImageParams = await this.initImageParams()
      this.reportWorkFun(this.workspaceUrl)
    },
    /**
     * @reportWorkElk 上报elk
     */
    reportWorkFun(workspaceUrl) {
      this.$trace.traceCustomEvent({
        event: 'online_work',
        xargs_event_category: 'editor',
        event_value: 'crop_img',
        event_info: {
          source: workspaceUrl,
        },
      })
    },
    /**
     * @initImageParams 处理裁剪组件所需要的参数
     */
    initImageParams() {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = this.currentImage.originImg
        const dataJson = {
          filename: this.currentImage.filename,
          w: this.currentImage.w,
          h: this.currentImage.h,
          type: this.currentImage.filename.split('.')[1],
        }
        img.onload = () => {
          dataJson.image = img
          resolve(dataJson)
        }
      })
    },
    /**
     * @imageOutFun
     */
    imageOutFun() {
      this.moveLock = false
      this.editorImageBtn = false
    },
    /**
     * @cropImgSrc
     */
    cropImgSrc(reqObj) {
      // this.currentImage.originImg = reqObj.href
      // this.currentImage.file = reqObj.file
      // this.currentImage.thumbnail = reqObj.thumbnail
      // this.currentImage.w = reqObj.w
      // this.currentImage.h = reqObj.h
      // this.currentImage.uid = ''
      // this.currentImage.crop_img = true
      this.uploadList.unshift({
        ...this.currentImage,
        originImg: reqObj.href,
        file: reqObj.file,
        thumbnail: reqObj.thumbnail,
        w: reqObj.w,
        h: reqObj.h,
        uid: '',
        crop_img: true,
      })
      this.editorEditorCrop = false
    },
    /**
     * @processingFun 处理成功
     */
    processingFun() {},
  },
}
