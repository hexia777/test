<template>
  <div class="slider-ctr">
    <span v-if="label" class="slider-label">{{ label }}</span>
    <div class="slider-wrap">
      <span>{{ min || 0 }}</span>
      <el-slider
        label="slider"
        :value="value"
        :min="min"
        :max="max"
        :step="step || 1"
        @input="changeSliderHandle"
        :disabled="disabled"
        v-track-label="$commonTrackLabel(value)"
      />
      <span v-if="type === 1">{{ max || 100 }}</span>
      <span v-else-if="type === 2">{{ sliderValue }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SliderV2',
    props: {
      label: { type: String, default: '' },
      attr: { type: String, default: '' },
      value: { type: Number, default: 0 },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      step: { type: Number, default: 1 },
      disabled: { type: Boolean, default: true },
      type: { type: Number, default: 1 },
    },
    methods: {
      changeSliderHandle(value) {
        this.$emit('changeSliderHandle', value, this.attr)
      },
    },
  }
</script>

<style scoped lang="less">
  .slider-ctr {
    .slider-label {
      display: block;
      font-size: 14 / @base;
      color: #717e8f;
    }
    .slider-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      span {
        font-size: 14 / @base;
        color: #4f6785;
      }
      .el-slider {
        width: 100%;
        padding: 0 10px;
      }
      /deep/ .el-slider__runway {
        cursor: pointer;
      }
    }
  }
</style>
