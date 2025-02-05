<template>
  <div class="switch-ctr mag-b-10">
    <slot name="label">
      <span class="switch-label">{{ label || $t('workspace.parameters') }}</span>
    </slot>

    <div class="switch-wrap">
      <span class="switch-sub-label">{{ subLabel || $t('workspace.auto') }}</span>
      <el-switch
        v-model="defaultValue"
        @change="changeSwitchHandle"
        v-track-label="$commonTrackLabel('change_' + bindedAttribute + '_' + defaultValue)"
      />
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VaSwitch',
    props: {
      label: { type: String, default: '' },
      subLabel: { type: String, default: '' },
      value: { type: Boolean, default: false },
      bindedAttribute: { type: String, default: '' },
    },
    data() {
      return {
        defaultValue: this.value,
      }
    },
    watch: {
      value(val) {
        this.defaultValue = val
      },
    },
    methods: {
      changeSwitchHandle(val) {
        this.defaultValue = val
        this.$emit('changeSwitchHandle', val, this.bindedAttribute)
      },
    },
  }
</script>

<style scoped lang="less">
  .switch-ctr {
    display: flex;
    justify-content: space-between;

    .switch-label,
    .switch-sub-label {
      margin-right: 6 / @base;
      font-size: 14 / @base;
      line-height: 1.7;
      color: #232323;
    }
  }

  .tp-title {
    .switch-label,
    .switch-sub-label {
      font-size: 16 / @base;
    }
  }
</style>
