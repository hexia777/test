<template>
  <ul class="grid-list">
    <li
      class="grid-item"
      :class="[disableCLick && !item.selected && 'disable-item']"
      v-for="(item, index) in list"
      :key="index"
      @click="onSampleSelected(item, index)"
    >
      <div v-loading="item.status === 'uploading'" class="grid-item-container">
        <slot :item="item"></slot>
      </div>
    </li>
  </ul>
</template>

<script>
  export default {
    name: 'GridList',
    props: {
      list: {
        type: Array,
        default: () => {
          return []
        },
      },
      selectLimit: {
        type: Number,
        default: 1,
      },
      disableAll: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      disableCLick() {
        if (this.selectLimit === 1) {
          return this.list.filter((item) => item.selected).length >= this.selectLimit
        } else {
          return false
        }
      },
    },
    watch: {
      list: {
        handler(val, old) {
          if (this.selectLimit === 1) {
            if (this.list.filter((item) => item.selected).length > 1) {
              this.list.map((item, i) => {
                item.selected = i === 0
              })
            }
          }
        },
        deep: true,
      },
    },
    methods: {
      onSampleSelected(val, index) {
        if (this.selectLimit === 1) {
          if (val.selected) {
            val.selected = false
          } else {
            const filter = this.list.filter((item) => item.selected)
            if (filter && filter.length) {
              filter[0].selected = false
            }
            val.selected = true
            val.selIndex = index + 1 //记录选择的第几张样片
          }
        } else {
          val.selected = !val.selected
          //   const filter = this.list.filter((item) => item.selected)
          //   if (val.status === 'ready' && !this.disableAll) {
          //     if (val.selected) {
          //       val.selected = !val.selected
          //     } else {
          //       if (filter && filter.length < this.selectLimit) {
          //         val.selected = !val.selected
          //       }
          //     }
          //   } else {
          //     val.selected = false
          //   }
          // }
        }
      },
    },
  }
</script>

<style scoped lang="less">
  .grid-list {
    display: flex;
    flex-wrap: wrap;

    .grid-item {
      position: relative;
      width: calc(100% / 8 - 10px);
      min-width: 85px;
      max-width: 180px;
      min-height: 95px;
      margin: 10px 10px 0 0;
      cursor: pointer;

      .grid-item-container {
        width: 100%;
        height: 100%;
      }

      .checkbox {
        display: none;
      }

      .checkbox-box {
        position: absolute;
        top: 5 / @base;
        right: 5 / @base;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid #fff;
        border-radius: 3px;
      }

      .checkbox-box-selected {
        background: #fff;
      }

      .checkbox-box-disable {
        position: absolute;
        top: 5 / @base;
        right: 5 / @base;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 14 / @base;
        height: 14 / @base;
        background: rgba(176, 163, 163, 0.9);
        border: 1px solid #e7e7e7;
        border-radius: 3px;
      }

      .sample-img {
        width: 100%;
        height: 100%;
        border: 1px solid #efefef;
        border-radius: 3px;
        object-fit: cover;
      }
    }

    :last-child {
      margin-right: 0;
    }

    .disable-item {
      cursor: not-allowed;

      .checkbox-box {
        background: rgba(176, 163, 163, 0.9);
      }
    }
  }
  @media screen and (max-width: 1024px) {
    .grid-list {
      .grid-item {
        width: calc(100% / 6 - 10px);
      }
    }
  }
</style>
