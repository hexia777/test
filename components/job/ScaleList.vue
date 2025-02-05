<template>
  <div class="scale-list">
    <template v-for="(item, i) in scaleList">
      <div
        class="list_item pointer icons view-tag"
        :key="item.value"
        @click="handleScaleChange(item)"
        v-track-label="$commonTrackLabel('change_scale_' + item.value)"
      >
        <span
          v-if="item.value !== 'custom'"
          :class="[{ 'is-active': scale === item.value }]"
          class="job_config_item_label view-tag"
          >{{ item.label }}</span
        >
        <div class="flex align-center" v-else>
          <span :class="[{ 'is-active': scale === item.value }]" class="job_config_item_label view-tag">{{
            item.label
          }}</span>
          <template v-if="scale === 'custom' && item.type === 'setting'">
            <el-input-number
              @input.native="changeInputNumber('width')"
              class="input-number"
              :controls="false"
              size="small"
              :min="0"
              :max="image ? image.w * 8 : null"
              :step="1"
              ref="width"
              v-model="customSize['w']"
              :placeholder="$t('workspace.width')"
            />
            x
            <el-input-number
              @input.native="changeInputNumber('height')"
              class="input-number"
              :controls="false"
              size="small"
              :min="0"
              :max="image ? image.h * 8 : null"
              :step="1"
              ref="height"
              v-model="customSize['h']"
              :placeholder="$t('workspace.height')"
            />
            px
            <i
              class="iconfont-single icon-s-info"
              @click="$emit('showTip')"
              v-track-label="$commonTrackLabel('show_tip')"
            ></i>
          </template>
        </div>
      </div>
      <br :key="i" v-if="item.afterBr" />
    </template>
  </div>
</template>

<script>
  export default {
    name: 'ScaleList',
    props: {
      scales: Array,
      image: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        scale: 2,
        customSize: {
          w: 0,
          h: 0,
        },
      }
    },
    computed: {
      scaleList() {
        return this.scales.filter((item) => !item.disabled)
      },
    },
    watch: {
      image: {
        handler(val) {
          if (val) {
            this.customSize.w = val.w
            this.customSize.h = val.h
          }
        },
        deep: true,
      },
    },
    mounted() {
      if (this.image) {
        this.customSize.w = this.image.w
        this.customSize.h = this.image.h
      }
      this.handleScaleChange({ value: this.scale })
    },
    methods: {
      changeInputNumber(key) {
        console.log('changeInputNumber')
        if (this.image) {
          const imageSize = this.image
          const r = imageSize.w / imageSize.h
          if (key === 'width') {
            if (this.$refs.width[0].displayValue > imageSize.w * 8) {
              this.customSize.width = Math.round(imageSize.w * 8)
              this.customSize.h = Math.round(imageSize.h * 8)
            } else if (this.customSize.w === 0) {
              this.customSize.w = 0
              this.customSize.h = 0
            } else {
              this.customSize.w = Number(this.$refs.width[0].displayValue)
              this.customSize.h = Math.round(this.customSize.w / r)
            }
          } else {
            if (this.$refs.height[0].displayValue > imageSize.h * 8) {
              this.customSize.w = Math.round(imageSize.w * 8)
              this.customSize.h = Math.round(imageSize.h * 8)
            } else if (this.customSize.h === 0) {
              this.customSize.w = 0
              this.customSize.h = 0
            } else {
              this.customSize.h = Number(this.$refs.height[0].displayValue)
              this.customSize.w = Math.round(r * this.customSize.h)
            }
          }
        }
        this.$emit('handleScaleChange', this.scale, this.customSize.w, this.customSize.h)
      },
      changeOutPutSize(item) {
        // const w = this.image.w
        // const h = this.image.h
        const r = 1
        let p = 720
        if (item.value === '720p') {
          p = 720
          // r = p / h
        } else if (item.value === '1080p') {
          p = 1080
          // r = p / h
        } else if (item.value === '4k') {
          p = 2160
          // r = p / h
        }
        // this.customSize.h = p
        // this.customSize.w = Math.ceil(w * r)
        this.$emit('handleScaleChange', 'p', p)
      },
      handleScaleChange(item) {
        this.scale = item.value
        if (this.scale !== 'custom' && item.type === 'setting') {
          this.changeOutPutSize(item)
        } else {
          this.$emit('handleScaleChange', item.value, this.customSize.w, this.customSize.h)
        }
      },
    },
  }
</script>

<style scoped lang="less">
  .scale-list {
    //display: flex;
    //flex-wrap: wrap;
    padding: 20 / @base 10 / @base 0;
    background: #f5f7fa;

    .list_item {
      display: inline-block;
      margin-right: 16 / @base;
      margin-bottom: 10 / @base;
      text-align: center;

      .icons {
        margin-right: 10 / @base;
      }

      .job_config_item_label {
        display: -webkit-box;
        min-width: 50px;
        padding: 0 8px;
        overflow: hidden;
        font-size: 14 / @base;
        text-align: center;
        text-overflow: ellipsis;
        word-break: break-all;
        border: 1px solid #cecece;
        border-radius: 3px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;

        &:hover {
          color: #0374ff;
        }
      }

      .job_config_item_label.is-active {
        color: #fff;
        background-color: #0374ff;
        border-color: #0374ff;
      }
    }

    .icon-s-info {
      margin-left: 5px;
      font-size: 14px;
      color: #232323;
      cursor: pointer;
    }
  }

  /deep/ .input-number.el-input-number--small {
    width: 60 / @base;
  }

  /deep/ .input-number.el-input-number--small,
  /deep/ .input-number .el-input .el-input__inner {
    height: 28px;
    padding: 0 5px !important;
    line-height: 28px;
  }
</style>
