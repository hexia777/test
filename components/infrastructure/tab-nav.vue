<script>
  const noop = () => {}
  export default {
    name: 'VanceaiTabNav',
    inject: ['rootTabs'],
    props: {
      currentName: String,
      panes: Array,
      onTabClick: {
        type: Function,
        default: noop,
      },
    },
    data() {
      return {
        isFocus: false,
        focusable: true,
      }
    },
    methods: {
      setFocus() {
        if (this.focusable) {
          this.isFocus = true
        }
      },
      removeFocus() {
        this.isFocus = false
      },
    },
    render(h) {
      const { panes, onTabClick, setFocus, removeFocus } = this
      const tabs = this._l(panes, (pane, i) => {
        const tabName = pane.name || pane.index || i
        const tabLabelContent = pane.$slots.label || pane.label
        const tabIndex = pane.active ? 0 : -1
        return (
          <div
            v-track-label={`tab-${tabName}`}
            class={{
              'vanceai-tabs_item': true,
              'is-active': pane.active,
              'is-disabled': pane.disabled,
              'is-focus': this.isFocus,
            }}
            id={`tab-${tabName}`}
            key={`tab-${tabName}`}
            aria-controls={`pane-${tabName}`}
            role="tab"
            aria-selected={pane.active}
            ref="tabs"
            tabindex={tabIndex}
            refInFor
            on-focus={() => {
              setFocus()
            }}
            on-blur={() => {
              removeFocus()
            }}
            on-click={(e) => {
              removeFocus()
              onTabClick(pane, tabName, e)
            }}
          >
            {tabLabelContent}
          </div>
        )
      })
      return (
        <div class={{ 'vanceai-tabs_nav': true }} ref="nav" role="tablist">
          {tabs}
        </div>
      )
    },
  }
</script>

<style lang="less">
  .vanceai-tabs_nav {
    display: flex;
    align-items: center;
    .vanceai-tabs_item {
      margin: 3px 5px;
      font-size: 14px;
      cursor: pointer;
    }
  }
</style>
