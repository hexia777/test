<script>
  export default {
    name: 'ThumbnailBlock',
    props: {
      index: [Number, String],
      thumbnail: String,
      background: String,
      backgroundImage: Boolean,
      isIcon: Boolean,
      width: {
        type: [Number, String],
        default: 84,
      },
      height: {
        type: [Number, String],
        default: 84,
      },
    },
    computed: {
      w() {
        let w = this.width
        if (!w) {
          w = 84
        }
        return Number.isFinite(w) ? `${w}px` : w
      },
      _h() {
        let h = this.height
        if (!h) {
          h = 84
        }
        return Number.isFinite(h) ? `${h}px` : h
      },
      bg() {
        if (this.backgroundImage) {
          return `url(${this.background})`
        } else {
          if (this.background === 'transparent') {
            return `url(${this.$imgPath('/common/visiable_bg.png')})`
          } else {
            return this.background
          }
        }
      },
    },
    methods: {
      handleClick(bg, isImage, index) {
        this.$emit('click', bg, isImage, index)
      },
    },
    render(h) {
      const { w, _h, thumbnail, background, bg, isIcon, handleClick, backgroundImage, index } = this
      const img = isIcon ? (
        <i class={{ thumbnail: true, [thumbnail]: true }}></i>
      ) : (
        <div class="thumbnail" style={{ background: `url(${thumbnail}) 50%/cover no-repeat` }}></div>
      )

      return (
        <div
          class="thumbnail-block"
          on-click={() => {
            handleClick(background, backgroundImage, index)
          }}
          style={{ width: w, height: _h, background: bg }}
        >
          {img}
        </div>
      )
    },
  }
</script>

<style lang="less">
  .thumbnail-block {
    box-shadow: 0 0 0 1px #fff inset;

    .thumbnail {
      width: 100%;
      height: 100%;
    }
  }
</style>
