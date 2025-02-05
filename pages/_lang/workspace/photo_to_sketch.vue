<template>
  <div class="sketch-workspace-page">
    <photo-to-sketch-workspace
      workspace-url="photo-to-sketch"
      :user-agent="userAgent"
      :drop-box-redirect-url="dropBoxRedirectUrl"
    />
  </div>
</template>

<script>
  import PhotoToSketchWorkspace from '@/components/WorkSpace/PhotoToSketchWorkspace'
  import servers from '@/static/config/common/server.config'
  import { developedCountry } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'PhotoToSketchWorkspacePage',
    components: { PhotoToSketchWorkspace },
    mixins: [DropBoxCallbackOfPageMixins],
    asyncData(ctx) {
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      const userAgent = ctx.req.headers['user-agent']
      const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
      return { leadStrokeVisible, userAgent }
    },
    provide() {
      return {
        leadStrokeVisible: () => this.leadStrokeVisible,
      }
    },
    computed: {
      dropBoxRedirectUrl() {
        return process.env.ENV === 'online'
          ? `https://vanceai.com${this.$store.state.ll}/workspace/photo-to-sketch/`
          : process.env.ENV === 'test'
          ? `https://test.vanceai.com${this.$store.state.ll}/workspace/photo-to-sketch/`
          : `http://localhost:3000${this.$store.state.ll}/workspace/photo-to-sketch/`
      },
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
  }
</script>
