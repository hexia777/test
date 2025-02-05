<template>
  <div class="enhance-workspace-page">
    <enhance-workspace
      workspace-url="enhance"
      :work-type="'enlarge'"
      :drop-box-redirect-url-prop="dropBoxRedirectUrl"
    />
  </div>
</template>

<script>
  import EnhanceWorkspace from '@/components/WorkSpace/EnhanceWorkspace'
  import servers from '@/static/config/common/server.config'
  import { developedCountry } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'EnhanceWorkspacePage',
    components: { EnhanceWorkspace },
    mixins: [DropBoxCallbackOfPageMixins],
    asyncData(ctx) {
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
      return { leadStrokeVisible }
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
  }
</script>
