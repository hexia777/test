<template>
  <div class="removebg-workspace-page">
    <remove-background-workspace
      :drop-box-redirect-url="dropBoxRedirectUrl"
      :sample-image-data="sampleImageData"
    />
  </div>
</template>

<script>
  import RemoveBackgroundWorkspace from '@/components/WorkSpace/RemoveBackgroundWorkspace'
  import servers from 'static/config/common/server.config'
  import { developedCountry, IPData } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'RemoveBackgroundWorkspacePage',
    components: { RemoveBackgroundWorkspace },
    mixins: [DropBoxCallbackOfPageMixins],
    async asyncData(ctx) {
      console.log('asyncData')
      console.log('enter asyncData start:', new Date().getTime())
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
      let sampleImageData = {}
      const res = await ctx.$axios.get(servers.service + '/api/v2/sample/info')
      if (res.code == 200) {
        sampleImageData = res.data
      }
      return { leadStrokeVisible, sampleImageData }
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
    mounted() {
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
  }
</script>
