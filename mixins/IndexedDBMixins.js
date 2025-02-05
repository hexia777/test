import { isNull } from '@/static/script/utils'

export default {
  data() {
    return {
      storeData: null,
      getData: null,
    }
  },
  mounted() {
    if (process.client) {
      import('@/static/script/indexedDB').then((module) => {
        const { storeData, getData } = module
        this.storeData = storeData
        this.getData = getData
      })
    }
  },
  methods: {
    setDbData(key, value) {
      if (isNull(this.storeData)) {
        return
      }
      this.storeData(key, value)
    },
    async getDbData(key) {
      if (isNull(this.getData)) {
        return
      }
      try {
        return await this.getData(key)
      } catch (e) {
        console.error(e)
        return null
      }
    },
  },
}
