<script>
  export default {
    name: 'IconJobList',
    props: {
      jobs: Array,
      activeJob: String,
    },
    methods: {
      handleJobSwitch(item) {
        this.$emit('handleJobSwitch', item)
      },
    },
    render(h) {
      const { jobs, activeJob, handleJobSwitch } = this
      return (
        <div class="icon-job-list">
          {jobs.map((item) => (
            <div
              class={{
                'job-item': true,
                'job-item-selected': activeJob === item.job,
                icons: true,
                'is-active': activeJob === item.job,
              }}
              on-click={() => handleJobSwitch(item.job)}
              v-track-label={`${item.job}`}
            >
              <div class="icons">
                <i class={['icon', `${item.icon}`]}></i>
                <i class={['icon_hover', `${item.icon}`]}></i>
                <i class={['icon_active', `${item.icon}`]}></i>
              </div>
              <div class="label mag-t-5">{item.label}</div>
              {item.isNew && <span class="new">New</span>}
            </div>
          ))}
        </div>
      )
    },
  }
</script>

<style scoped lang="less">
  .icon-job-list {
    display: flex;
    .job-item {
      cursor: pointer;
      padding: 9px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #eaeaea;
      &:hover {
        color: #0374ff;
      }
    }
    .job-item.job-item-selected {
      color: #fff;
      background: #0374ff;
    }
  }

  .icon-s-palette,
  .icon-s-brightness {
    font-size: 22 / @base;
    font-weight: 700;
  }
  .job-item:hover {
    .icon-s-palette,
    .icon-s-brightness {
      color: #0374ff;
    }
  }
  .icon-s-palette.icon_active,
  .icon-s-brightness.icon_active {
    color: #fff !important;
  }
</style>
