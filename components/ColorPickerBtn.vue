<template>
  <button class="color-picker-btn">
    <div class="color-block" v-for="(item, i) in colors" :key="i" :style="{ backgroundColor: item }"></div>
  </button>
</template>

<script>
  export default {
    name: 'ColorPickerBtn',
    computed: {
      colors() {
        return [
          'rgb(255, 255, 255)',
          'rgb(244, 67, 54)',
          'rgb(233, 30, 99)',
          'rgb(156, 39, 176)',
          'rgb(103, 58, 183)',
          'rgb(63, 81, 181)',
          'rgb(33, 150, 243)',
          'rgb(3, 169, 244)',
          'rgb(0, 188, 212)',
          'rgb(0, 150, 136)',
          'rgb(76, 175, 80)',
          'rgb(139, 195, 74)',
          'rgb(205, 220, 57)',
          'rgb(255, 235, 59)',
          'rgb(255, 193, 7)',
          'rgb(255, 152, 0)',
          'rgb(255, 87, 34)',
          'rgb(121, 85, 72)',
          'rgb(158, 158, 158)',
          'rgb(96, 125, 139)',
          'rgb(0, 0, 0)',
        ]
      },
    },
  }
</script>

<style lang="less" scoped>
  .color-picker-btn {
    display: flex;
    flex-wrap: wrap;
    width: 84 / @base;
    height: 84 / @base;
    padding: 0;
    overflow: hidden;

    .color-block {
      width: 20 / @base;
      height: 20 / @base;
    }
  }
</style>
