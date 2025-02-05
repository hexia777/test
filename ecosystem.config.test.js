// https://github.com/JkmAS/nuxt-pm2-cluster
// https://github.com/nuxt/nuxt.js/issues/3778
// https://github.com/nuxt/nuxt.js/issues/2630
// https://github.com/Unitech/pm2/issues/4082
// https://www.npmjs.com/package/nuxt-start
// https://github.com/nuxt/nuxt.js
module.exports = {
  apps: [
    {
      name: 'web_front',
      script: './node_modules/nuxt-start/bin/nuxt-start.js',
      cwd: './',
      args: `-c '/usr/src/app/nuxt.config.js'`,
      node_args: '--max-old-space-size=30720',
      instances: 6,
      exec_mode: 'cluster',
      autorestart: true,
      watch: ['.nuxt', 'nuxt.config.js'],
      watch_delay: 5000,
      ignore_watch: ['node_modules', 'static'],
      watch_options: {
        followSymlinks: false,
        usePolling: true,
      },
      max_memory_restart: '500M',
      env: {
        ENV: 'company',
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=30720',
        BASE_URL: 'https://pre1-workspace.vanceai.com',
      },
    },
    {
      name: 'page_cache_reset_version',
      script: 'page_cache_reset_version.js',
      node_args: '--max-old-space-size=30720',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: ['.nuxt', 'nuxt.config.js'],
      //watch_delay: 300000, // delay 300s to avoid cache problem
      ignore_watch: ['node_modules', 'static'],
      watch_options: {
        followSymlinks: false,
        usePolling: true,
      },
      max_memory_restart: '200M',
      env: {
        ENV: 'online',
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=30720',
      },
    },
  ],
}
