<template>
  <div class="image-editor">
    <image-editor-workspace-new @upPointData="upPointData" @updateCredits="updateCredits" />
  </div>
</template>

<script>
  import ImageEditorWorkspaceNew from '@/components/imageEditor/ImageEditorWorkspaceNew.vue'

  import UserInfoMixins from '@/mixins/UserInfoMixins'

  export default {
    name: 'ImageEditor',
    components: {
      ImageEditorWorkspaceNew,
    },
    mixins: [UserInfoMixins],
    data() {
      return {
        isAsync: false,
        show: false,
      }
    },
    mounted() {
      window.addEventListener('unload', this.onUnload)
      if (!window.__MICRO_APP_ENVIRONMENT__) {
        const script = document.createElement('script')
        script.src = '/script/d3.js'
        script.type = 'text/javascript'
        script.defer = true
        script.onload = () => {
          console.log('Script loaded successfully')
        }
        document.head.appendChild(script)
      }
    },
    destroyed() {
      window.name = ''
      window.removeEventListener('unload', this.onUnload)
    },
    beforeRouteEnter(to, from, next) {
      next()
    },
    beforeRouteLeave(to, from, next) {
      window.name = ''
      next()
    },
    methods: {
      /**
       * @upPointData 更新点数
       */
      upPointData(num) {
        console.log('num', num)
        this.userInfo.leftCredits = num
      },
      onUnload() {
        window.name = ''
      },
      updateCredits(val) {
        this.userInfo.leftCredits = val
      },
      showLang() {
        this.show = !this.show
      },
    },
    head() {
      return {
        title: this.$t('workspace.edit_page_title'),
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.$t('workspace.edit_page_meta_desc'),
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: this.$t('workspace.edit_page_meta_keys'),
          },
          { charset: 'utf-8' },
          {
            name: 'viewport',
            content: 'width=1200',
          },
        ],
        link: [
          {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
          {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true,
          },
        ],
      }
    },
  }
</script>

<style scoped lang="less">
  .image-editor {
    padding-top: 0;
  }
</style>
