const API_CACHE_HOST = 'https://ai-backend.vanceai.com'
module.exports = {
  api_cache_host: API_CACHE_HOST,
  api_cache_list: [
    API_CACHE_HOST + '/faq/detail',
    API_CACHE_HOST + '/article/latest',
    API_CACHE_HOST + '/article/detail',
  ],
  request_cache_keys_uri: `/request-cache-keys/?t=533079f8-a249-11ea-a575-02fcdc4e7412`,
  request_clear_cache_uri: `/request-clear-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=`,
  request_reset_cache_uri: `/request-reset-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412`,
  request_get_cache_uri: `/request-get-cache/?t=533079f8-a249-11ea-a575-02fcdc4e7412&q=`,
  request_cache_details_uri: `/request-cache-details/?t=533079f8-a249-11ea-a575-02fcdc4e7412`,
  request_key_details_uri: `/request-key-details/?t=533079f8-a249-11ea-a575-02fcdc4e7412`,
  request_clear_expires_uri: `/request-clear-expires/?t=533079f8-a249-11ea-a575-02fcdc4e7412`,
}
