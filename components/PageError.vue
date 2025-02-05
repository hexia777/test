<template>
  <div class="whiteBg con-page-error">
    <div class="container">
      <img class="img-responsive" :src="$imgPath('/404/404.png')" alt="" />
      <h1 v-html="$t('workspace.404_title')"></h1>
      <p class="desc" v-html="$t('workspace.404_desc')"></p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PageError',
    head() {
      return {
        title: this.$t('workspace.404_page_title'),
        htmlAttrs: {
          lang: this.$store.state.locale,
        },
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.$t('workspace.404_page_meta_desc'),
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: this.$t('workspace.404_page_meta_keys'),
          },
        ],
      }
    },
  }
</script>

<style lang="less" scoped>
  .con-page-error {
    padding: 70px 0 90px;
    text-align: center;

    h1 {
      padding-bottom: 10px;
      font-size: 36px;
      font-weight: bold;
    }

    .desc {
      width: 60%;
      margin: 0 auto;
      color: #4f6785;

      a {
        font-weight: bold;
        color: #4f6785;
      }
    }
  }
</style>
<style lang="less">
  .con-page-error {
    .desc {
      width: 60%;
      margin: 0 auto;
      color: #4f6785;

      a {
        font-weight: bold;
        color: #4f6785;
      }
    }
  }
</style>
