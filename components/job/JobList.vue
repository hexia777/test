<template>
  <div class="job_configs" @mouseleave="leaveHandle()">
    <div v-if="pictureMode" class="job_configs_wrap">
      <div
        class="pointer job_item"
        :style="{ backgroundImage: `url(${encodeURI(item.img)})` }"
        v-for="(item, i) in jobs"
        :class="[
          { 'is-active': activeJob === item.job },
          { flex2: item.flex2 },
          item.iconfont_icon ? 'icon-tag' : '',
        ]"
        :key="i"
        @click="handleJobSwitch(item)"
        @mouseover="selModelFun(item)"
        v-track-label="$commonTrackLabel('select_model_' + item.job)"
      >
        <span class="labe">{{ item.label }}</span>
        <el-tooltip
          v-if="!!item.desc"
          class="job_config_item_desc"
          effect="dark"
          :content="item.desc"
          placement="top-start"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
    </div>
    <div
      v-else
      class="job_configs_item pointer icons view-tag"
      v-for="(item, i) in jobs"
      :class="[
        { 'is-active': activeJob === item.job },
        { flex2: item.flex2 },
        item.iconfont_icon ? 'icon-tag' : '',
      ]"
      :key="i"
      @click="handleJobSwitch(item)"
      @mouseover="selModelFun(item)"
      v-track-label="$commonTrackLabel('select_model_' + item.job)"
    >
      <span class="job_config_item_label view-tag">{{ item.label }}</span>
      <!-- <i :class="['iconfont-single', item.iconfont_icon]" v-if="item.iconfont_icon"></i
      ><span class="icon-text" v-if="item.iconfont_icon">NEW</span> -->
      <el-tooltip
        v-if="!!item.desc"
        class="job_config_item_desc"
        effect="dark"
        :content="item.desc"
        placement="top-start"
      >
        <i class="el-icon-question"></i>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'JobList',
    components: {},
    props: {
      jobs: Array,
      activeJob: {
        type: String,
        required: false,
      },
      pictureMode: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        hoverHandel: null,
      }
    },
    computed: {
      currentJob() {
        const filter = this.jobs.filter((item) => this.activeJob === item.job)
        if (filter && filter.length) {
          return filter[0]
        }
        return null
      },
      imgSrc() {
        return this.$imgPath('/workspace/enlarge_clarity.jpg')
      },
    },
    mounted() {
      this.handleJobSwitch(this.currentJob)
    },
    methods: {
      leaveHandle() {
        if (this.hoverHandel) {
          clearTimeout(this.hoverHandel)
          this.hoverHandel = null
        }
        this.$emit('selModelFun', { model: '', handle: 'hover' })
      },
      selModelFun(item, handle = 'hover') {
        if (handle === 'hover') {
          if (this.hoverHandel) {
            clearTimeout(this.hoverHandel)
            this.hoverHandel = null
          }
          this.hoverHandel = setTimeout(() => {
            this.$emit('selModelFun', { model: item, handle })
          }, 100)
        }
      },
      handleJobSwitch(item) {
        console.log('item', item)
        this.$emit('handleJobSwitch', item)
        this.selModelFun(item, 'click')
      },
    },
  }
</script>

<style scoped lang="less">
  .job_configs_wrap {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    margin: 0 0 -10px 0 !important;

    .job_item {
      position: relative;
      width: calc(50% - 4px);
      height: 64px;
      margin-bottom: 10 / @base;
      background-size: cover;
      border-radius: 4px;

      .labe {
        position: absolute;
        bottom: 6px;
        left: 50%;
        z-index: 999;
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        color: #fff;
        text-align: center;
        transform: translateX(-50%);
      }
    }

    .job_item::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      background-image: linear-gradient(to top, rgba(77, 77, 77, 1) 0%, rgba(255, 255, 255, 0) 80%);
      border-radius: 4px;
    }

    .job_item:hover::before {
      border: 2px solid #1074ff;
    }

    .job_item.is-active::before {
      background-image: linear-gradient(to top, rgba(16, 116, 255, 1) 0%, rgba(77, 77, 77, 0) 80%) !important;
    }
  }

  .job_configs {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10 / @base;

    .job_configs_item {
      position: relative;
      display: flex;
      align-items: center;
      width: calc(50% - 5px);
      padding: 5 / @base;
      margin-bottom: 10 / @base;
      font-size: 14 / @base;
      background-color: #ededed;
      border-radius: 3px;

      &.flex2 {
        width: 100%;
        margin-right: 0;
      }

      &:hover {
        color: #0374ff;
      }

      .icons {
        margin-right: 10 / @base;
      }

      .job_config_item_label {
        display: -webkit-box;
        width: 100%;
        overflow: hidden;
        text-align: center;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }

    .icon-tag {
      position: relative;

      .iconfont-single {
        position: absolute;
        top: -10px;
        right: 0;
        font-size: 16px;
        color: #fd4158;
      }

      .icon-text {
        position: absolute;
        top: -6px;
        right: 7px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
    }

    .job_configs_item.is-active {
      color: #fff;
      background-color: #0374ff;
    }

    > :nth-child(odd) {
      margin-right: 10 / @base;
    }
  }

  .blurry-dialog {
    /deep/ .dialog-content {
      padding: 0 !important;
    }

    img {
      width: 100%;
      object-fit: cover;
    }

    .tip1 {
      display: flex;
      align-items: center;
      height: 52 / @base;
      padding-left: 20 / @base;
      margin: 10 / @base 20 / @base 20 / @base 20 / @base;
      font-size: 14 / @base;
      line-height: 22 / @base;
      color: #4d4d4f;
      background: #fceeed;
      border: 1px solid #f2a3a1;
      border-radius: 4px;
    }

    .tip2 {
      margin: 15 / @base 20 / @base 15 / @base 20 / @base;
      font-size: 14 / @base;
      line-height: 22 / @base;
      color: #393939;
    }

    .tip3 {
      margin: 0 20 / @base 15 / @base 20 / @base;
      font-size: 14 / @base;
      line-height: 22 / @base;
      color: #393939;
    }

    /deep/ .dialog-footer {
      display: flex;
      justify-content: flex-end !important;
      padding: 15 / @base 20 / @base;

      .still-use {
        font-size: 14 / @base;
        line-height: 22 / @base;
        color: #3777f6;
        text-decoration: underline;
        background: #fff;
        border: none;
      }

      .to-default {
        margin-left: 20 / @base;
      }
    }

    /deep/ .el-icon-close {
      color: #fbfcfc;

      &:hover {
        color: #e44343;
      }
    }
  }
</style>
