<template>
  <div class="slider-ctr">
    <!-- <span v-if="label" class="slider-label">{{ label }}</span> -->
    <div class="slider-wrap">
      <i class="iconfont-single icon-s-slider"></i>
      <el-slider
        label="slider"
        :value="value"
        :min="min"
        :max="max"
        :step="step || 1"
        @input="changeSliderHandle"
        :disabled="disabled"
      />
      <span>{{ value }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'VSlider',
    props: {
      label: { type: String, default: '' },
      value: { type: Number, default: 0 },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      step: { type: Number, default: 1 },
      disabled: { type: Boolean, default: false },
    },
    data() {
      return {
        sliderValue: this.value,
      }
    },
    methods: {
      changeSliderHandle(value) {
        this.$emit('changeSliderHandle', value)
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
      // justify-content: space-between;
      // .icon-s-slider {

      // }

      span {
        font-size: 14 / @base;
        color: #4f6785;
      }

      .el-slider {
        flex: 1;
        padding: 0 10px;
      }
    }
  }
</style>
