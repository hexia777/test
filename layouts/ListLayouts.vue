<template>
  <div class="list-layouts scroll-bar">
    <ul
      v-if="datas && datas.length"
      :class="[isHorizontal ? 'horizontal-layouts' : 'vertcal-layouts']"
      :style="{ width: !isHorizontal && width, height: isHorizontal && height }"
    >
      <li v-for="(item, i) in datas" :key="i">
        <slot :item="item">
          {{ item }}
        </slot>
      </li>
    </ul>
    <slot v-else name="empty"></slot>
  </div>
</template>

<script>
  export default {
    name: 'ListLayouts',
    props: {
      isHorizontal: {
        type: Boolean,
        default: false,
      },
      // There is only one effect based on the isHorizontal of width and height
      width: {
        type: Number,
        default: 100,
      },
      // There is only one effect based on the isHorizontal of width and height
      height: {
        type: Number,
        default: 100,
      },
      datas: {
        type: Array,
        default: () => [],
      },
    },
  }
</script>

<style lang="less">
  .list-layouts {
    overflow-y: auto;

    .horizontal-layouts {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .vertcal-layouts {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
  }
</style>
