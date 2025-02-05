<template>
  <div>
    <!-- 引导点赞弹窗 -->
    <my-dialog :visible.sync="assemblyType" :z-index="zIndex" @close="closeWin">
      <!-- <my-dialog @close="closeWin"> -->
      <div class="fabulous_dialog">
        <div class="tip">{{ $t('workspace.output_evaluate') }}</div>
        <div>
          <thumb-up
            v-if="currentWork && !currentWork.sample"
            :item="{
              transId: currentWork.transId || currentWork.trans_id,
              operation: currentWork.operation,
              likes: currentWork.likes,
              config: currentWork.config,
            }"
            :vertical="true"
            @likeNums="likeNums"
          />
        </div>
      </div>
    </my-dialog>
  </div>
</template>

<script>
  import ThumbUp from '@/components/matting/ThumbUp'
  import myDialog from '@/components/matting/MyDialog'

  export default {
    name: 'Fabulous',
    components: {
      myDialog,
      ThumbUp,
    },
    props: {
      currentWork: {
        type: Object,
        default: () => {
          return {}
        },
      },
      fabulousWin: {
        type: Boolean,
        default: false,
      },
      //弹窗层级
      zIndex: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        assemblyType: true, //弹窗组件状态
      }
    },
    watch: {
      fabulousWin: {
        handler(val) {
          this.assemblyType = val
        },
      },
    },

    methods: {
      /**
       * @likeNums 用户点赞
       */
      likeNums() {
        this.$setCookie('cloud_ratedialog', '1', 365)
        //数据兼容
        if (this.currentWork.thumbsup) {
          this.currentWork.thumbsup++
        } else {
          this.currentWork.thumbsup = 1
        }

        if (this.currentWork.likes) {
          this.currentWork.likes++
        } else {
          this.currentWork.likes = 1
        }
      },
      /**
       * @closeWin 关闭弹窗
       */
      closeWin() {
        this.$emit('update:fabulousWin', false)
      },
    },
  }
</script>

<style lang="less" scoped>
  .fabulous_dialog {
    width: 500px;
    padding: 20px;
    padding-bottom: 30px;

    .tip {
      margin-top: 10px;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
    }
  }
</style>
