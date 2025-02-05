<template>
  <div class="enhance-workspace-page">
    <colorize-photo-workspace
      :file-list="[]"
      :is-dialog="true"
      :work-type="'enlarge'"
      @close="onClose"
      workspace-url="enhancer"
      :drop-box-redirect-url-prop="dropBoxRedirectUrl"
      :sample-image-data="sampleImageData"
    />
  </div>
</template>

<script>
  import ColorizePhotoWorkspace from '@/components/WorkSpace/ColorizePhotoWorkspace.vue'
  import servers from '@/static/config/common/server.config'
  import { developedCountry } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'EnhanceWorkspacePage',
    components: { ColorizePhotoWorkspace },
    mixins: [DropBoxCallbackOfPageMixins],
    async asyncData(ctx) {
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
      let sampleImageData = {}
      const res = await ctx.$axios.get(servers.service + '/api/v2/sample/info')
      if (res.code == 200) {
        sampleImageData = res.data
      }
      return { leadStrokeVisible, sampleImageData }
    },
    data() {
      return {
        currentPath: '/workspace/enhance/',
      }
    },
    watch: {
      hideOnlineService: {
        handler(val) {
          if (val) {
            this.toTerminate()
          }
        },
        deep: true,
      },
    },
    provide() {
      return {
        leadStrokeVisible: () => this.leadStrokeVisible,
      }
    },
    // head() {
    //   return {
    //     title: this.$t('workspace.enhance_workspace_page_title'),
    //     meta: [
    //       {
    //         hid: 'description',
    //         name: 'description',
    //         content: this.$t('workspace.enhance_workspace_page_meta_desc'),
    //       },
    //       {
    //         hid: 'keywords',
    //         name: 'keywords',
    //         content: this.$t('workspace.enhance_workspace_page_meta_keys'),
    //       },
    //       {
    //         hid: 'og:title',
    //         name: 'og:title',
    //         content: this.$t('workspace.enhance_workspace_page_title'),
    //       },
    //       {
    //         hid: 'og:description',
    //         name: 'og:description',
    //         content: this.$t('workspace.enhance_workspace_page_meta_desc'),
    //       },
    //     ],
    //   }
    // },
  }
</script>
