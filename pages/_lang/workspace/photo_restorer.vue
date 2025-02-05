<template>
  <div class="removebg-workspace-page">
    <PhotoRestorerWorkspace
      workspace-url="photo-restorer"
      :drop-box-redirect-url-prop="dropBoxRedirectUrl"
      :sample-image-data="sampleImageData"
    />
  </div>
</template>

<script>
  import PhotoRestorerWorkspace from '@/components/WorkSpace/PhotoRestorerWorkspace'
  import servers from '@/static/config/common/server.config'
  import { developedCountry } from '@/static/json/country'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  import DropBoxCallbackOfPageMixins from '@/mixins/pages/DropBoxCallbackOfPageMixins'

  export default {
    name: 'PhotoRestorerWorkspacePage',
    components: { PhotoRestorerWorkspace },
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
        currentPath: '/workspace/photo-restorer/',
      }
    },
    computed: {
      dropBoxRedirectUrl() {
        return process.env.ENV === 'online'
          ? `https://vanceai.com${this.$store.state.ll}/workspace/photo-restorer/`
          : process.env.ENV === 'test'
          ? `https://test.vanceai.com${this.$store.state.ll}/workspace/photo-restorer/`
          : `http://localhost:3000${this.$store.state.ll}/workspace/photo-restorer/`
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
    provide() {
      return {
        leadStrokeVisible: () => this.leadStrokeVisible,
      }
    },
  }
</script>
