<template>
  <div class="drives">
    <div class="selector" :class="{ 'selector-disable': isNullTransId }">
      <div @click="handleSave" class="current-drives">
        <i :class="currentDrive.icon"></i>{{ currentDrive.label }}
      </div>
      <i class="arrow" @click="optionsVisible = !optionsVisible"></i>
    </div>

    <transition name="options" @enter="handleEnter" @leave="handleLeave">
      <ul class="options" v-if="optionsVisible">
        <li v-for="(item, i) in drivesOptions" :key="i" @click="handleSelected(item.value)">
          <i :class="[item.icon]"></i>{{ item.label }}
        </li>
      </ul>
    </transition>
    <custom-dialog class="tip-dialog" :visible.sync="tipDialogVisible" :show-header="false">
      <i class="iconfont-single icon-s-complete"></i>
      <p class="mag-b-10">{{ $t('workspace.save_tip') }}</p>
      <p>{{ $t('workspace.save_tip_2', { email: email }) }}</p>
      <template #footer>
        <div class="primary-small-button" @click="tipDialogVisible = false">
          {{ $t('workspace.upload_limit_5') }}
        </div>
      </template>
    </custom-dialog>
  </div>
</template>

<script>
  import { Dropbox } from 'dropbox'
  import gsap from 'gsap'
  import Work from 'static/script/work'
  import { isNull } from 'static/script/utils'
  import CustomDialog from '@/components/CustomDialog.vue'
  import UserInfoMixins from '@/mixins/UserInfoMixins'

  export default {
    name: 'Drives',
    components: { CustomDialog },
    mixins: [UserInfoMixins],
    props: {
      isDownload: Boolean,
      transIds: {
        type: Array,
        required: true,
      },
      dropBoxRedirectUrl: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        tokenClient: null,
        MSALObj: null,
        dbx: null,
        optionsVisible: false,
        tipDialogVisible: false,
        selectedDrive: 'dropbox',
        googleDriveClient: {
          CLIENT_ID: '995815978947-qn4oc4r3e1eksuvpvmt853gihifbclgp.apps.googleusercontent.com',
          API_KEY: 'AIzaSyBFeYr5s8SXU9Tn7-s9IGvPWoobdF6U7xY',
          SCOPES: 'https://www.googleapis.com/auth/drive',
          DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
        },
        dropboxClient: {
          CLIENT_ID: '11wrhmqgmu13k1i',
          REDIRECT_URL: this.dropBoxRedirectUrl,
        },
      }
    },
    computed: {
      oneDriveRedirectUrl() {
        if (process.browser) {
          return window.location.host.indexOf(':') !== -1
            ? `http://localhost:3000${this.$store.state.ll}/workspace/`
            : window.location.host.indexOf('test') !== -1
            ? `https://test.vanceai.com${this.$store.state.ll}/workspace/`
            : `https://vanceai.com${this.$store.state.ll}/workspace/`
        } else {
          return process.env.ENV === 'online'
            ? `https://vanceai.com${this.$store.state.ll}/workspace/`
            : process.env.ENV === 'test'
            ? `https://test.vanceai.com${this.$store.state.ll}/workspace/`
            : `http://localhost:3000${this.$store.state.ll}/workspace/`
        }
      },
      oneDriveClient() {
        return {
          auth: {
            clientId: '1d5b5a1b-4a50-4d1d-9909-83fb5b0e0f9a',
            authority: 'https://login.microsoftonline.com/common',
            redirectUri: this.oneDriveRedirectUrl,
          },
          cache: {
            cacheLocation: 'sessionStorage',
            storeAuthStateInCookie: false,
          },
          system: {
            loggerOptions: {
              loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                  return
                }
                switch (level) {
                  // eslint-disable-next-line no-undef
                  case msal.LogLevel.Error:
                    console.error(message)
                    return
                  // eslint-disable-next-line no-undef
                  case msal.LogLevel.Info:
                    console.info(message)
                    return
                  // eslint-disable-next-line no-undef
                  case msal.LogLevel.Verbose:
                    console.debug(message)
                    return
                  // eslint-disable-next-line no-undef
                  case msal.LogLevel.Warning:
                    console.warn(message)
                    return
                }
              },
            },
          },
          tokenRequest: {
            scopes: ['User.Read', 'Files.ReadWrite'],
          },
        }
      },
      isNullTransId() {
        return isNull(this.transIds)
      },
      currentDrive() {
        return this.drives.filter((item) => item.value === this.selectedDrive)[0]
      },
      drivesOptions() {
        return this.drives.filter((item) => item.value !== this.selectedDrive)
      },
      drives() {
        return [
          {
            icon: 'iconfont icon-googledrive',
            label: this.$t('workspace.googleDrive'),
            value: 'googledrive',
          },
          {
            icon: 'iconfont-single icon-s-onedrive',
            label: this.$t('workspace.oneDrive'),
            value: 'onedrive',
          },
          {
            icon: 'iconfont-single icon-s-dropbox',
            label: this.$t('workspace.dropbox'),
            value: 'dropbox',
          },
        ]
      },
    },
    mounted() {
      this.checkDropBoxCallBack()
      this.selectedDrive = localStorage.getItem('defaultDrive') || this.selectedDrive
      //this.initSDK()
    },
    methods: {
      handleSelected(val) {
        this.selectedDrive = val
        this.handleSave()
      },
      handleEnter(el, done) {
        gsap.from(el, { y: -20, scaleY: 0.5, onComplete: done, duration: 0.2 })
      },
      handleLeave(el, done) {
        gsap.to(el, { y: -20, scaleY: 0.5, onComplete: done, duration: 0.2 })
      },
      initSDK() {
        this.initGoogleDriveSDK()
        if (typeof Msal === 'undefined') {
          this.initOneDriveSDK()
        }
        this.initDropboxSDK()
      },
      initOneDriveSDK() {
        const oneDriveSDKFragment = document.createDocumentFragment()
        const msal = document.createElement('script')
        msal.async = true
        msal.defer = true
        msal.src = 'https://alcdn.msauth.net/browser/2.26.0/js/msal-browser.js'
        msal.addEventListener('load', this.handleOneDriveLSDKLoaded)
        oneDriveSDKFragment.appendChild(msal)
        document.head.appendChild(oneDriveSDKFragment)
      },
      handleOneDriveLSDKLoaded() {
        // eslint-disable-next-line no-undef
        this.MSALObj = new msal.PublicClientApplication(this.oneDriveClient)
      },
      initDropboxSDK() {
        this.dbx = new Dropbox({ clientId: this.dropboxClient.CLIENT_ID })
      },
      initGoogleDriveSDK() {
        const googleDriveSDKFragment = document.createDocumentFragment()
        if (typeof gapi === 'undefined') {
          const gapi = document.createElement('script')
          gapi.async = true
          gapi.defer = true
          gapi.src = 'https://apis.google.com/js/api.js'
          gapi.addEventListener('load', this.handleGapiLoaded)
          googleDriveSDKFragment.appendChild(gapi)
        }
        const gis = document.createElement('script')
        gis.async = true
        gis.defer = true
        gis.src = 'https://accounts.google.com/gsi/client'
        gis.addEventListener('load', this.handleGisLoaded)
        googleDriveSDKFragment.appendChild(gis)
        document.head.appendChild(googleDriveSDKFragment)
      },
      handleGapiLoaded() {
        const initializeGapiClient = async () => {
          // eslint-disable-next-line no-undef
          await gapi.client.init({
            apiKey: this.googleDriveClient.API_KEY,
            discoveryDocs: [this.googleDriveClient.DISCOVERY_DOC],
          })
        }
        // eslint-disable-next-line no-undef
        gapi.load('client', initializeGapiClient)
      },
      handleGisLoaded() {
        // eslint-disable-next-line no-undef
        // if (google) {
        //   this.tokenClient = google.accounts.oauth2.initTokenClient({
        //     client_id: this.googleDriveClient.CLIENT_ID,
        //     scope: this.googleDriveClient.SCOPES,
        //     callback: '',
        //   })
        // }
      },
      handleSave() {
        this.optionsVisible = false
        if (this.isNullTransId) {
          this.$message({
            message: this.$t('common.select_tip'),
            type: 'warning',
          })
          return
        }

        this.$trace.traceCustomEvent({
          event: 'click',
          xargs_event_category: 'other',
          event_value: 'save_to_drive',
          event_label: this.selectedDrive,
        })
        localStorage.setItem('defaultDrive', this.selectedDrive)
        switch (this.selectedDrive) {
          case 'googledrive':
            this.hendleGoogleDriveSave()
            break
          case 'onedrive':
            this.hendleOneDriveSave()
            break
          default:
            this.hendleDropBoxSave()
        }
        this.$emit('onSave', this.selectedDrive)
      },
      hendleGoogleDriveSave() {
        if (isNull(this.tokenClient)) {
          return
        }
        const token = this.$getCookie('google-drive-token')
        if (isNull(token)) {
          // eslint-disable-next-line no-undef
          if (gapi.client.getToken() === null) {
            this.tokenClient.requestAccessToken({ prompt: 'consent' })
          } else {
            this.tokenClient.requestAccessToken({ prompt: '' })
          }
          this.tokenClient.callback = (resp) => {
            if (resp.error !== undefined) {
              throw resp
            }
            this.$setCookie('google-drive-token', resp.access_token, 1 / 24 / 2)
            this.saveToDrive(resp.access_token, this.transIds, 'googledrive')
          }
        } else {
          this.saveToDrive(token, this.transIds, 'googledrive')
        }
      },
      async hendleOneDriveSave() {
        if (isNull(this.MSALObj)) {
          return
        }
        try {
          const token = this.$getCookie('onedrive-token')
          if (isNull(token)) {
            const loginRes = await this.MSALObj.loginPopup(this.oneDriveClient.tokenRequest)
            this.$setCookie('onedrive-token', loginRes.accessToken, 1 / 24 / 2)
            this.saveToDrive(loginRes.accessToken, this.transIds, 'onedrive')
          } else {
            this.saveToDrive(token, this.transIds, 'onedrive')
          }
        } catch (e) {
          console.error(e)
        }
      },
      hendleDropBoxSave() {
        if (isNull(this.dbx)) {
          return
        }
        const token = this.$getCookie('dropbox-token')
        if (isNull(token)) {
          localStorage.setItem('transIds', JSON.stringify(this.transIds))
          this.dbx.auth.getAuthenticationUrl(this.dropboxClient.REDIRECT_URL).then((authUrl) => {
            this.$setCookie('begin_dropbox_redirect', location.href)
            location.href = authUrl
          })
        } else {
          this.saveToDrive(token, this.transIds, 'dropbox')
        }
      },
      checkDropBoxCallBack() {
        if (this.isDownload) {
          return
        }
        const hash = this.$route.hash.replace('#', '')
        if (hash) {
          const [key, value] = hash.split('&')[0].split('=')
          if (key === 'access_token') {
            this.handleDropBoxSaveCallBack(value)
            this.$setCookie('dropbox-token', value, 1 / 24 / 2)
          }
        }
      },
      handleDropBoxSaveCallBack(token) {
        let transIds = localStorage.getItem('transIds')
        if (!isNull(transIds)) {
          try {
            transIds = JSON.parse(transIds)
            this.saveToDrive(token, transIds, 'dropbox')
          } catch (e) {
            console.error(e)
          }
        }
      },
      saveToDrive(token, transIds, tag) {
        const map = {
          onedrive: Work.saveToOneDrive,
          googledrive: Work.saveToGoogleDrive,
          dropbox: Work.saveToDropbox,
        }
        if (map[tag]) {
          map[tag]({ access_token: token, trans_ids: transIds }).then((res) => {
            if (res.code === 200) {
              this.tipDialogVisible = true
            } else {
              this.$message.error(this.$t('workspace.error_message'))
            }
          })
        }
      },
    },
  }
</script>

<style scoped lang="less">
  .icon-s-onedrive,
  .icon-s-dropbox {
    color: #2049ac;
  }
  .drives {
    position: relative;
    display: flex;
    justify-content: center;

    .options {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 99;
      width: 100%;

      li {
        display: flex;
        align-items: center;
        min-height: 40px;
        padding: 0 10px;
        cursor: pointer;
        background: #fff;
        border: 1px solid #b3c8d4;

        > i {
          width: 32px;
        }

        &:hover {
          background: #f1f1f1;
        }
      }
    }

    .current-drives {
      display: flex;
      align-items: center;
      min-width: 230px;
      min-height: 40px;
      padding: 0 10px;
      border: 1px solid #b3c8d4;
      border-radius: 3px 0 0 3px;

      > i {
        width: 32px;
      }
    }
  }

  .selector {
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      background: #f1f1f1;
    }

    .arrow {
      position: relative;
      width: 40px;
      height: 40px;
      padding: 10px;
      cursor: pointer;
      border: 1px solid #b3c8d4;
      border-radius: 0 3px 3px 0;
    }

    .arrow::after {
      position: absolute;
      top: 50%;
      left: 50%;
      display: block;
      width: 10px;
      height: 10px;
      content: '';
      border: 6px solid transparent;
      border-top-color: #4d4d50;
      transform: translate(-50%, -25%);
    }
  }

  .selector-disable {
    pointer-events: none;
    filter: grayscale(0.95);
  }

  .tip-dialog {
    /deep/ .dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>
