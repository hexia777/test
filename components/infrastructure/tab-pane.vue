<script>
  export default {
    name: 'VanceaiTabPane',
    props: {
      label: String,
      labelContent: Function,
      name: String,
      disabled: Boolean,
    },
    data() {
      return {
        index: null,
        loaded: false,
      }
    },
    computed: {
      active() {
        const active = this.$parent.currentName === this.paneName
        if (active) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.loaded = true
        }
        return active
      },
      paneName() {
        return this.name || this.index
      },
    },
    render(h) {
      const { active, loaded, paneName } = this
      if (active) {
        return (
          <div
            class={{
              'vanceai-tabs_pane': true,
            }}
            role="tabpanel"
            aria-hidden={!active}
            id={`pane-${paneName}`}
            aria-labelledby={`tab-${paneName}`}
          >
            {this.$slots.default}
          </div>
        )
      }
      return null
    },
  }
</script>

<style lang="less" scoped></style>
