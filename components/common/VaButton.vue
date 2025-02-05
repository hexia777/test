<template>
  <button
    class="va-button"
    @click="handleClick"
    :class="[
      type ? 'va-button--' + type : '',
      size ? 'va-button--' + size : '',
      // {
      //   'is-disabled': buttonDisabled,
      //   'is-loading': loading,
      // },
    ]"
  >
    <span v-if="icon" :class="icon" class="va-button-icon"></span>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script>
  export default {
    name: 'VaButton',
    props: {
      // 暂时使用的是精灵图图标 记得引入对应的css
      icon: {
        required: false,
        type: String,
        default: '',
      },
      type: {
        required: false,
        type: String,
        default: 'primary',
      },
      size: {
        required: false,
        type: String,
        default: '',
      },
      disabled: {
        required: false,
        type: Boolean,
        default: false,
      },
    },
    methods: {
      handleClick(evt) {
        this.$emit('click', evt)
      },
    },
  }
</script>

<style scoped lang="less">
  .button-base {
    display: inline-block;
    min-width: 200 / @base;
    height: 60 / @base;
    padding: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 60 / @base;
    color: #351e01;
    text-align: center;
    cursor: pointer;
    // margin: 0;
    border: none;
    // padding: 10/@base 8/@base;
    border-radius: 3px;
  }

  .va-button--medium {
    min-height: 60 / @base;
    line-height: 60 / @base;
    // padding: 10/@base 8/@base;
  }

  .va-button--primary {
    .button-base();

    background-color: #ff9d1d;

    &:hover {
      color: #351e01;
      background-color: #ffb048;
    }
  }

  .va-button--small {
    height: 40 / @base;
    line-height: 40 / @base;
    // padding: 8/@base 6/@base;
  }

  // .primary-button-disabled {
  //   .button-base();
  //   background-color: #ff9d1d;
  //   color: #b46601;
  // }

  .va-button--minor {
    .button-base();

    color: #232323;
    background-color: #f7f7f7;
    border: 2px solid #ddd;

    &:hover {
      color: #232323;
      background-color: #fff;
      border: 2px solid #4d4d4f;
    }
  }

  // .minor-button-disabled {
  //   .button-base();
  //   background-color: #f7f7f7;
  //   color: #c0c0c0;
  //   border: 2px solid #dddddd;
  // }

  .va-button--info {
    .button-base();

    color: #0071ff;
    background-color: #fff;
    border: 2px solid #0071ff;

    &:hover {
      color: #fff;
      background-color: #0071ff;
      border: 2px solid #0071ff;
    }
  }

  // .info-button-disabled {
  //   .button-base();
  //   background-color: #f7f7f7;
  //   color: #c0c0c0;
  //   border: 2px solid #dddddd;
  // }

  .va-button--warning {
    .button-base();

    color: #fff;
    background-color: #fd4158;

    &:hover {
      color: #fff;
      background-color: #f76e7c;
    }
  }

  // .warning-button-disabled {
  //   .button-base();
  //   background-color: #f7f7f7;
  //   color: #c0c0c0;
  //   border: 2px solid #dddddd;
  // }

  .va-button {
    display: flex;
    align-items: center;
    justify-content: center;

    .va-button-icon {
      margin-right: 15px;
    }
  }
</style>
