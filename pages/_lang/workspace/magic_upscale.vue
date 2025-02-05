<template>
  <div class="magic-upscale-workspace-page">
    <magic-upscale-workspace
      workspace-url="magic-upscale"
      :work-type="'enlarge'"
      :drop-box-redirect-url-prop="dropBoxRedirectUrl"
    />
  </div>
</template>

<script>
  import MagicUpscaleWorkspace from '@/components/WorkSpace/MagicUpscaleWorkspace'
  import servers from '@/static/config/common/server.config'
  import { developedCountry } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'MagicUpscalerWorkspacePage',
    components: { MagicUpscaleWorkspace },
    mixins: [DropBoxCallbackOfPageMixins],
    asyncData(ctx) {
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
      return { leadStrokeVisible }
    },
    data() {
      return {
        currentPath: '/workspace/magic-upscaler/',
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
  }
</script>
