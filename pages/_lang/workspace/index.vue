<template>
  <div class="workspace-container">
    <BatchProcessFile
      ref="batchprocess"
      :is-current-page-process="false"
      :ref-type="'page'"
      :show.sync="show"
      :active-workflow-data="activeWorkflowData"
      :sample-image-data="sampleImageData"
    />
  </div>
</template>

<script>
  import BatchProcessFile from '@/components/WorkSpace/BatchProcessFile'
  import servers from '@/static/config/common/server.config'
  import { getOperatingSystemInfo, getUrlParamServer } from '@/static/script/utils'
  export default {
    name: 'BatchProcess',
    components: {
      BatchProcessFile,
    },
    asyncData(ctx) {
      const visitor = getUrlParamServer('visitor', ctx) === 'vanceai'
      let activeWorkflowData = { single: [], workflow: [], subject: [] }
      let sampleImageData = {}
      const params = { web: 'vanceai', category: 'single,workflow,subject' }
      return Promise.all([
        ctx.$axios.post(servers.service + '/api/work_flow/active_flows', params),
        ctx.$axios.get(servers.service + '/api/v2/sample/info'),
      ])
        .then(([res, res2]) => {
          if (res.code == 200) {
            activeWorkflowData = res.data
          }
          if (res2.code == 200) {
            sampleImageData = res2.data
          }
          const leadStrokeVisible = visitor || getOperatingSystemInfo(ctx.req.headers['user-agent']) === 'win'
          return {
            leadStrokeVisible,
            activeWorkflowData,
            sampleImageData,
          }
        })
        .catch((e) => {
          console.log(e)
          return {
            leadStrokeVisible: false,
            activeWorkflowData,
            sampleImageData,
          }
        })
    },
    provide() {
      return {
        leadStrokeVisible: () => this.leadStrokeVisible,
      }
    },
    data() {
      return {
        logoImg:
          // eslint-disable-next-line max-len
          'data:image/png;base64,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 AElFTkSuQmCC',
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
  }
</script>
<style scoped lang="less">
  .workspace-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-top: 0 !important;
  }

  .copyright {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .select-lang {
    position: relative;
    display: inline-block;
    margin-left: 20 / @base;
    cursor: pointer;

    .vance-select {
      position: relative;
      z-index: 2;
      padding: 0 20 / @base;
      font-size: 14 / @base;
      line-height: 40 / @base;
      color: #4d4d4f;
      background: #e4e4e4;
      border: 1 / @base solid #e4e4e4;
      border-radius: 2 / @base;

      &:hover {
        border-color: #b8b8b9;

        .vance-option {
          display: block !important;
        }
      }

      span {
        display: inline-block;
        width: 58px;
        margin-right: 20 / @base;
        text-align: center;
        cursor: pointer;
        background: none;
        border: 0;
        caret-color: transparent;
      }
    }

    .vance-option {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      box-sizing: border-box;
      border: 1px solid #b8b8b9;
      transform: translateY(-100%);

      a {
        display: block;
        padding: 0 20px;
        line-height: 40 / @base;
        color: #4d4d4f;
        text-align: center;
        cursor: pointer;
        background: #f6f6f6;

        &:hover {
          color: #4d4d4f;
          background: #e5e5e5;
          border-color: #e5e5e5;
        }
      }
    }

    .icon_langs {
      position: absolute;
      top: 50%;
      left: 0;
      cursor: pointer;
      transform: translateY(-50%);
    }
  }

  .workspace-footer {
    display: flex;
    align-items: center;
    min-height: 48 / @base;
    padding: 0 30 / @base;
    background: #fff;
    border-top: 2px solid #ff9d1d;
  }
  @media (max-width: 1240px) {
    .copyright {
      flex: initial;
      order: 2;
      width: 100%;

      .select-box {
        flex-shrink: 0;
      }
    }
  }
</style>
