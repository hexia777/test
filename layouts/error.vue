<template>
  <div
    :data-vars-http-code="error.statusCode"
    :data-warden-g-parm="$base64Encode({ xargs_http_code: error.statusCode })"
  >
    <page-error v-if="error.statusCode === 404" />
    <h2 v-else class="post-500">{{ error.message }}</h2>
  </div>
</template>

<script>
  import pageError from '@/components/PageError'

  export default {
    name: 'Error',
    components: { pageError },
    // eslint-disable-next-line vue/require-prop-types
    props: ['error'],
    created() {
      //this.$store.commit('SET_STATUS_CODE', this.error.statusCode)
    },
  }
</script>
<style lang="less">
  .post-500 {
    padding: 200px 0;
    text-align: center;
  }
</style>
