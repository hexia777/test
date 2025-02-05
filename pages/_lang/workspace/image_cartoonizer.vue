<template>
  <div class="image-cartoonizer-page">
    <image-cartoonizer-workspace />
  </div>
</template>

<script>
  import ImageCartoonizerWorkspace from '@/components/WorkSpace/ImageCartoonizerWorkspace'
  import servers from '@/static/config/common/server.config'
  import { developedCountry } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'ImageCartoonizerWorkspacePage',
    components: { ImageCartoonizerWorkspace },
    mixins: [DropBoxCallbackOfPageMixins],
    asyncData(ctx) {
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      const userAgent = ctx.req.headers['user-agent']
      const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
      return { leadStrokeVisible, userAgent }
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
