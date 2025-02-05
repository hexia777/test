<script>
  import TabNav from '@/components/infrastructure/tab-nav.vue'
  export default {
    name: 'VanceaiTabs',
    components: { TabNav },
    props: {
      beforeSwitch: Function,
      value: {},
      acviveName: String,
    },
    provide() {
      return {
        rootTabs: this,
      }
    },
    data() {
      return {
        currentName: this.value || this.acviveName,
        panes: [],
      }
    },
    watch: {
      value(value) {
        this.setCurrentName(value)
      },
      activeName(value) {
        this.setCurrentName(value)
      },
    },
    created() {
      if (!this.currentName) {
        this.setCurrentName('0')
      }

      this.$on('tab-nav-update', this.calculatePaneInstance.bind(null, true))
    },
    mounted() {
      this.calculatePaneInstance()
    },
    update() {
      this.calculatePaneInstance()
    },
    methods: {
      calculatePaneInstance() {
        if (this.$slots.default) {
          const paneSlots = this.$slots.default.filter(
            (vnode) =>
              vnode.tag &&
              vnode.componentOptions &&
              vnode.componentOptions.Ctor.options.name === 'VanceaiTabPane'
          )
          this.panes = paneSlots.map(({ componentInstance }) => componentInstance)
        } else if (!this.panes.length) {
          this.panes = []
        }
      },
      onTabClick(tab, tabName, event) {
        if (tab.disabled) {
          return
        }
        this.setCurrentName(tabName)
        this.$emit('tab-click', tab, event)
      },
      setCurrentName(val) {
        const changeCurrentName = () => {
          this.currentName = val
          this.$emit('input', val)
        }
        if (this.currentName !== val && this.beforeSwitch) {
          const before = this.beforeSwitch(val, this.currentName)
          if (before && before.then) {
            before.then(
              () => {
                changeCurrentName()
                this.$refs.nav && this.refs.nav.removeFocus()
              },
              () => {
                // ignore promise rejection in before-switch hook
              }
            )
          } else if (before !== false) {
            changeCurrentName()
          }
        } else {
          changeCurrentName()
        }
      },
    },
    render(h) {
      const { currentName, panes, onTabClick } = this
      const navDatas = {
        props: {
          currentName,
          onTabClick,
          panes,
        },
      }
      const header = (
        <div class={{ 'vanceai-tabs_header': true }}>
          <tab-nav {...navDatas} />
        </div>
      )
      const panels = <div class={{ 'vanceai-tabs_content': true }}>{this.$slots.default}</div>
      return (
        <div
          class={{
            'vanceai-tabs': true,
          }}
        >
          {[header, panels]}
        </div>
      )
    },
  }
</script>

<style lang="less"></style>
