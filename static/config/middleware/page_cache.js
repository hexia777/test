module.exports = {
  get_cache_uri: '/get-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=',
  clear_cache_uri: '/clear-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=',
  cache_keys_uri: '/cache-keys/?t=533079f8-a249-11ea-a575-02fcdc4e7412',
  reset_cache_uri: '/reset-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412',
  clear_all_cache_uri: '/clear-all-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=.',
  clear_request_cache_uri: `/clear-request-cache?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=`,
  get_request_cache_uri: `/get-request-cache?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=`,
  request_cache_keys_uri: `/request-cache-keys?t=533079f8-a249-11ea-a575-02fcdc4e7412`,
  cache_details_uri: '/cache-details/?t=533079f8-a249-11ea-a575-02fcdc4e7412',
  key_details_uri: '/key-details/?t=533079f8-a249-11ea-a575-02fcdc4e7412',

  bannerAd: `data-uuid="deb3b2de-101c-4933-a654-558b2ff1f3c2"`,
  mobileBannerAd: `data-uuid="b8c41987-1fc4-4217-8d76-8ffaa2a248fb"`,
  defaultPadding: `data-uuid="7a467a84-2068-4328-9880-9f07c7563f1c"`,
  CelebrationAd: `data-uuid="1b3e977b-7645-4a2f-a3a9-1e9848f36cac"`,
  CelebrationFlotAd: `data-uuid="2a7f9885-fd9c-4f09-9672-79e78a592ba4"`,

  ignorePaddingPage: [/.*\/workspace\/.*/, /.*\/image-editor\/.*/],

  celebrationIgnorePage: [/.*\/workspace\/.*/, /.*\/image-editor\/.*/],
  celebrationFloatIgnorePage: [/.*\/workspace\/.*/, /.*\/image-editor\/.*/],

  //不需要缓存的url
  ignore_cache_uris: [],

  //发版后也不清缓存的url
  keep_cache_uris: [],

  cache_domain: 'workspace.vanceai.com',
  // page_cache_ignore_query_params: ['source', 'medium'],
  page_cache_ignore_query_params: ['medium'],
  // page_cache_key_format: '$domain.$os.$device.$loginStatus',
  page_cache_key_format: '$domain.$os.$device',
}
