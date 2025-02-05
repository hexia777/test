<template>
  <el-upload
    :drag="true"
    action=""
    :multiple="true"
    :http-request="uploadFile"
    :show-file-list="false"
    :accept="accept"
    v-track-label="$commonTrackLabel('upload_img')"
  >
    <slot></slot>
  </el-upload>
</template>

<script>
  export default {
    name: 'UploadToLocal',
    data() {
      return {
        accept: '.jpg,.png,.jpeg',
      }
    },
    methods: {
      uploadFile(file) {
        this.$emit('uploadFile', file.file)
      },
    },
  }
</script>
