<template>
  <div class="right-utils" :style="{ height: utilsHeight }">
    <div class="ai-powered">
      <div class="title">
        <i class="iconfont-single icon-s-ai-powered title-icon"></i>
        <span>{{ $t('workspace.ai_powered') }}</span>
      </div>
      <div>
        <div
          v-for="util in aiUtils"
          :class="['util', { 'util-active': activeUtil === util.id }]"
          @click="() => clickUtil('AI', util.id)"
          :key="util.id"
          v-track-label="$commonTrackLabel('select_ai_tool_' + util.id)"
        >
          <i class="iconfont-single" :class="util.icon"></i>
          <span>{{ util.name }}</span>
        </div>
      </div>
    </div>

    <div>
      <div class="title">
        <i class="iconfont-single icon-s-basic-editor title-icon"></i>
        <span>{{ $t('workspace.base_editor') }}</span>
      </div>

      <div>
        <div
          :class="['util', { 'util-active': activeUtil === 'crop' }]"
          @click="() => clickUtil('BASIC', 'crop')"
          v-track-label="$commonTrackLabel('select_basic_tool_crop')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g stroke-width=".125em" stroke="currentColor" fill="none">
                <path d="M23 17H9a2 2 0 0 1-2-2v-5m0-3V1 M1 7h14a2 2 0 0 1 2 2v7m0 4v3" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_1') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'finetune' }]"
          @click="() => clickUtil('BASIC', 'finetune')"
          v-track-label="$commonTrackLabel('select_basic_tool_finetune')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g stroke-width=".125em" stroke="currentColor" fill="none">
                <path d="M4 1v5.5m0 3.503V23M12 1v10.5m0 3.5v8M20 1v15.5m0 3.5v3M2 7h4M10 12h4M18 17h4" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_2') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'filter' }]"
          @click="() => clickUtil('BASIC', 'filter')"
          v-track-label="$commonTrackLabel('select_basic_tool_filter')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g stroke-width=".125em" stroke="currentColor" fill="none">
                <path
                  d="M18.347 9.907a6.5 6.5 0 1 0-1.872 3.306M3.26 11.574a6.5 6.5 0 1 0 2.815-1.417 M10.15 17.897A6.503 6.503 0 0 0 16.5 23a6.5 6.5 0 1 0-6.183-8.51"
                />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_3') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'annotate' }]"
          @click="() => clickUtil('BASIC', 'annotate')"
          v-track-label="$commonTrackLabel('select_basic_tool_annotate')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g stroke-width=".125em" stroke="currentColor" fill="none">
                <path d="M17.086 2.914a2.828 2.828 0 1 1 4 4l-14.5 14.5-5.5 1.5 1.5-5.5 14.5-14.5z" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_4') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'sticker' }]"
          @click="() => clickUtil('BASIC', 'sticker')"
          v-track-label="$commonTrackLabel('select_basic_tool_sticker')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="currentColor"
                stroke-width=".125em"
              >
                <path
                  d="M12 22c2.773 0 1.189-5.177 3-7 1.796-1.808 7-.25 7-3 0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10z"
                />
                <path d="M20 17c-3 3-5 5-8 5" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_5') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'redact' }]"
          @click="() => clickUtil('BASIC', 'redact')"
          v-track-label="$commonTrackLabel('select_basic_tool_redact')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="currentColor"
                stroke-width=".125em"
              >
                <path d="M 4 5 l 1 -1" />
                <path d="M 4 10 l 6 -6" />
                <path d="M 4 15 l 11 -11" />
                <path d="M 4 20 l 16 -16" />
                <path d="M 9 20 l 11 -11" />
                <path d="M 14 20 l 6 -6" />
                <path d="M 19 20 l 1 -1" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_7') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'frame' }]"
          @click="() => clickUtil('BASIC', 'frame')"
          v-track-label="$commonTrackLabel('select_basic_tool_frame')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="currentColor"
                stroke-width=".125em"
              >
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_8') }}</span>
        </div>

        <div
          :class="['util', { 'util-active': activeUtil === 'resize' }]"
          @click="() => clickUtil('BASIC', 'resize')"
          v-track-label="$commonTrackLabel('select_basic_tool_resize')"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <g>
              <g stroke-width=".125em" stroke="currentColor" fill="none">
                <rect x="2" y="12" width="10" height="10" rx="2" />
                <path d="M4 11.5V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5" />
                <path d="M14 10l3.365-3.365M14 6h4v4" />
              </g>
            </g>
          </svg>
          <span>{{ this.$t('workspace.base_editor_9') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RightUtils',
    props: {
      activeUtil: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        utilsHeight: '100%',
        aiUtils: [
          {
            icon: 'icon-s-sharpen-2',
            name: this.$t('workspace.ai_powered_1'),
            id: 'sharpen',
          },
          {
            icon: 'icon-s-cutout',
            name: this.$t('workspace.ai_powered_2'),
            id: 'cutout',
          },
          {
            icon: 'icon-s-erase',
            name: this.$t('workspace.ai_powered_3'),
            id: 'erase',
          },
        ],
      }
    },
    mounted() {
      this.resize()
      window.addEventListener('resize', this.resize)
    },
    methods: {
      resize() {
        if (document.body.clientHeight < 820) {
          const computedHeight = document.body.clientHeight - 65 - 60
          this.utilsHeight = computedHeight > 400 ? `${computedHeight}px` : '400px'
        } else {
          this.utilsHeight = '100%'
        }
      },
      clickUtil(type, util) {
        this.$emit('clickUtil', type, util)
      },
    },
  }
</script>

<style lang="less" scoped>
  .right-utils {
    min-width: 120 / @base;
    // height: 400px;
    padding: 20 / @base 16 / @base 0 16 / @base;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #fff;

    .ai-powered {
      margin-bottom: 20 / @base;
    }

    .title {
      margin-bottom: 10 / @base;
      font-size: 12px;
      font-weight: 400;
      line-height: 22 / @base;
      color: #4d4d4f;
    }

    .util {
      display: flex;
      align-items: center;
      min-width: 110 / @base;
      max-width: 140 / @base;
      height: 44 / @base;
      // justify-content: space-around;
      padding: 10 / @base 8 / @base 10 / @base 0;
      margin-bottom: 10 / @base;
      font-size: 12px;
      font-weight: 400;
      line-height: 22 / @base;
      color: #4d4d4f;
      cursor: pointer;
      border: 1px solid #d7d7d7;
      border-radius: 10 / @base;
      // box-shadow: inset 0 0 0 1px;

      svg {
        width: 16 / @base;
        height: 16 / @base;
        margin: 0 8 / @base 0 10 / @base;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .util-icon {
        margin-right: 16 / @base;
      }
      // &:hover {
      //   background-color: rgba(0, 0, 0, 0.15);
      // }
    }

    .util-active {
      background-color: rgba(0, 0, 0, 0.15);
    }
  }

  .iconfont-single {
    margin: 0 8 / @base 0 10 / @base;
    font-size: 16 / @base;
  }

  .title-icon {
    margin: 0 8 / @base 0 0;
  }
</style>
