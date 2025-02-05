<template>
  <div class="out-setting">
    <div
      class="el-icon-close close-setting-out"
      @click="close"
      v-track-label="$commonTrackLabel('close_button')"
    ></div>
    <div class="out-setting-tit">{{ $t('workspace.pic_output_s_tit') }}</div>
    <div style="margin-bottom: 10px;" v-for="(item, index) in outputSetting" :key="index">
      <div v-if="item.type === 'selectBox'" class="workflow-element">
        <div v-if="item.detail" class="separation-detail">{{ item.detail }}</div>
        <el-select class="module-select" v-model="defaulfConfig[item.key]" popper-class="work-selection-down">
          <el-option
            v-for="(option, i) in item.childs"
            :key="i"
            :label="option.label"
            :value="option.value"
            v-track-label="$commonTrackLabel(item.key + '_' + option.value)"
          />
        </el-select>
        <el-input-number
          v-if="item.needInputNum && defaulfConfig[item.key] == item.showTime"
          v-model="defaulfConfig[item.showTime]"
          controls-position="right"
          :step="1"
          :min="1"
          :max="2000"
          step-strictly
        />
      </div>
      <div v-else-if="item.type === 'sliderInput'" class="workflow-element2">
        <span class="slider-label">{{ item.label }}</span>
        <div v-for="(s, i) in item.childs" :key="i">
          <div v-if="s.type === 'slider'">
            <div class="workflow-slider">
              <span>0</span>
              <el-slider
                label="slider"
                v-model="defaulfConfig[item.key][s.key]"
                :min="s.min"
                :max="s.max"
                v-track-label="$commonTrackLabel('change_' + item.key)"
              />
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-checkbox
      style="padding: 10px 0; display: block;"
      v-model="defaulfConfig.keep_origin_name"
      @change="setVal('keep_origin_name', $event)"
      v-track-label="$commonTrackLabel('keep_origin_name_' + !defaulfConfig.keep_origin_name)"
    >
      {{ $t('workspace.keep_origin_file_name') }}
    </el-checkbox>
    <el-checkbox
      v-if="remember"
      style="padding: 10px 0;"
      v-model="defaulfConfig.isRemerber"
      @change="setVal('isRemerber', $event)"
      v-track-label="$commonTrackLabel('remerber_choice_' + !defaulfConfig.isRemerber)"
    >
      {{ $t('workspace.pic_output_remember') }}
    </el-checkbox>
    <button
      class="btn-confirm primary-small-button"
      @click="confirm"
      v-track-label="$commonTrackLabel('confirm_btn')"
    >
      {{ $t('workspace.pic_output_confirm') }}
    </button>
  </div>
</template>

<script>
  export default {
    props: {
      config: {
        type: Object,
        default: () => {
          return {}
        },
      },
      remember: {
        type: [Object, String, Boolean],
        default: () => {
          return true
        },
      },
    },
    data() {
      return {
        outputSetting: [
          {
            type: 'selectBox',
            key: 'format',
            detail: this.$t('workspace.pic_output_s_tit_1'),
            value: 'default',
            childs: [
              {
                label: this.$t('workspace.pic_output_s_tit_1_check_1'),
                value: 'default',
                clickHandle: () => {},
              },
              {
                label: this.$t('workspace.pic_output_s_tit_1_check_2'),
                value: 'jpg',
                clickHandle: () => {},
              },
              {
                label: this.$t('workspace.pic_output_s_tit_1_check_3'),
                value: 'png',
                clickHandle: () => {},
              },
            ],
          },
          {
            type: 'sliderInput',
            key: 'compress',
            label: this.$t('workspace.pic_output_s_tit_2'),
            childs: [
              {
                type: 'slider',
                key: 'quality',
                min: 0,
                max: 100,
              },
            ],
          },
          {
            type: 'selectBox',
            key: 'dpi',
            detail: this.$t('workspace.pic_output_s_tit_3'),
            value: 'default',
            childs: [
              {
                label: this.$t('workspace.pic_output_s_tit_3_check_1'),
                value: 'default',
                clickHandle: () => {},
              },
              {
                label: this.$t('workspace.pic_output_s_tit_3_check_2'),
                value: 72,
                clickHandle: () => {},
              },
              {
                label: this.$t('workspace.pic_output_s_tit_3_check_3'),
                value: 300,
                clickHandle: () => {},
              },
              {
                label: this.$t('workspace.pic_output_s_tit_3_check_4'),
                value: 'custom',
                clickHandle: () => {},
              },
            ],
            needInputNum: true,
            showTime: 'custom',
          },
        ],
        defaulfConfig: {
          keep_origin_name: true,
          isRemerber: false,
        },
      }
    },
    watch: {
      config: {
        handler(val) {
          this.defaulfConfig = val
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      setVal(key, val) {
        this.defaulfConfig[key] = val
      },
      confirm() {
        this.$emit('confirm')
      },
      close() {
        this.$emit('close')
      },
    },
  }
</script>

<style scoped lang="less">
  .out-setting {
    padding-top: 20px;
  }

  .out-setting-tit {
    font-weight: bold;
  }

  .separation-detail {
    padding: 5px;
  }

  .close-setting-out {
    position: absolute;
    top: 3px;
    right: 3px;
    font-size: 25px;
    cursor: pointer;
  }

  .el-input-number {
    width: 100%;
    margin-top: 10px;
  }

  .workflow-element {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .workflow-element2,
  .workflow-secord-element {
    flex-direction: column;
    text-align: left;
  }

  .workflow-slider {
    display: flex;
    align-items: center;
    justify-content: space-between;

    span {
      font-size: 14px;
      color: #4f6785;
    }

    .el-slider {
      width: 100%;
      padding: 0 10px;
    }
  }

  .btn-confirm {
    width: 100%;
    border: 0;
    height: 2.67rem;
    line-height: 1;
  }
</style>
