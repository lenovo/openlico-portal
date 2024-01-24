<template lang="">
  <div class="login-wrapper">
    <div class="login-action-wrapper">
      <div class="login-logo-input">
        <div class="login-logo">
          <img src="/static/img/brand/login_logo.png" :alt="$t('Login.Lico.Logo')" />
        </div>
      </div>
      <div class="login-container" @keyup.enter="login('loginForm')">
        <a-form ref="loginForm" :model="loginForm" :rules="loginRules" layout="vertical" auto-complete="off">
          <a-form-item :label="$t('Login.Username')" name="username" class="login-input">
            <a-input
              ref="username"
              v-model:value="loginForm.username"
              v-focus
              type="text"
              auto-complete="off"
              :title="$t('Login.Username')"
              autocomplete="new-username"
              :disabled="loading" />
          </a-form-item>
          <a-form-item :label="$t('Login.Password')" name="password" class="login-input">
            <a-input
              v-model:value="loginForm.password"
              type="password"
              auto-complete="off"
              autocomplete="new-password"
              :title="$t('Login.Password')"
              :disabled="loading" />
          </a-form-item>
          <a-form-item style="text-align: center; margin-bottom: 0px">
            <a-button
              id="Login_Submit"
              class="login-submit"
              type="primary"
              :loading="loading"
              style="background-color: #3c5093; border-color: #3c5093"
              @click="login('loginForm')">
              {{ $t('Login.Submit') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="login-footer">
        <a-dropdown overlay-class-name="lang-menu">
          <template #overlay>
            <a-menu @click="setLangCode">
              <a-menu-item v-for="langType of langTypes" :id="'Lang_' + langType.code" :key="langType.code">
                {{ langType.type }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button class="lang-menu-button">
            {{ getLangType }}
            <down-outlined />
          </a-button>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import AuthService from '@/service/auth'
import AboutService from '@/service/about'
import AccessService from '../service/access'

export default {
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      },
    },
  },
  data() {
    const validateUsername = (rule, value) => {
      if (!value) {
        return Promise.reject(new Error(this.$t('Login.Username.Valid.Null')))
      } else {
        return Promise.resolve()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        return Promise.reject(new Error(this.$t('Login.Password.Valid.Null')))
      } else {
        return Promise.resolve()
      }
    }
    return {
      loginForm: {
        password: '',
        username: '',
      },
      allow_registration: false,
      loginRules: {
        password: [{ validator: validatePassword, trigger: 'blur' }],
        username: [{ validator: validateUsername, trigger: 'blur' }],
      },
      loading: false,
      about: {},
      langTypes: [
        { type: 'English', code: 'en' },
        { type: '中文', code: 'zh' },
      ],
      logo: 'logo_login.png',
      test_1: 'Hello',
      test_2: 'World',
    }
  },
  computed: {
    getLangType() {
      for (const { type, code } of this.langTypes) {
        if (this.$i18n.locale === code) {
          return type
        }
      }
      return 'English'
    },
    license() {
      return this.$store.getters['settings/getLicense']
    },
  },
  mounted() {
    this.$store.dispatch('auth/init')
    this.checkLogin()
  },
  methods: {
    setLangCode(e) {
      this.$store.dispatch('settings/setLangCode', e.key)
      window.gApp.$i18n.locale = e.key
      // this.$refs.loginForm.validate().catch(_ => {})
    },
    login(formName) {
      this.$refs[formName].validate().then(
        () => {
          this.loading = true
          AuthService.login(this.loginForm.username, this.loginForm.password).then(
            () => {
              this.checkConfig()
            },
            errMsg => {
              this.loading = false
              this.$message.error(errMsg)
            },
          )
        },
        err => {},
      )
    },
    checkConfig() {
      AuthService.checkConfig().then(
        () => {
          this.loading = false
          AccessService.getSchedulerArch() === 'host' &&
            window.startAsync(window.asyncCallback.bind({ username: 'demouser' }))
          if (this.$route.query.redirect) {
            this.$router.push({ path: this.$route.query.redirect })
          } else {
            this.$router.push({ path: '/main' })
          }
        },
        errMsg => {
          this.loading = false
          this.$message.error(errMsg)
        },
      )
    },
    checkLogin() {
      if (AuthService.isLogin()) {
        this.$router.push({ path: '/main' })
      }
    },
    initLogoUrl() {
      this.logo = 'logo_login.png'
    },
  },
}
</script>
<style scoped>
.login-wrapper {
  width: 100%;
  height: 100%;
  background-color: #1b1f4f;
  display: flex;
  color: #fff;
  justify-content: center;
}
.login-action-wrapper {
  min-width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.login-logo-input {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-logo {
  margin-top: 61px;
  display: flex;
  align-items: center;
}
.login-container {
  flex-grow: 2;
}
.login-container :deep(label) {
  color: #fff !important;
}
.login-container :dee0(input) {
  height: 40px;
  background-color: #1b1f4f !important;
  color: #fff !important;
}
.login-container :deep(input:-webkit-autofill) {
  box-shadow: 0 0 0px 1000px #1b1f4f inset !important;
  caret-color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}
.login-submit {
  width: 100%;
  height: 50px;
  margin-top: 10px;
  font-size: 18px !important;
}
.login-footer {
  text-align: center;
  padding-bottom: 10px;
}
.lang-menu-button {
  width: 130px;
  height: 40px;
  margin-bottom: 50px;
  background-color: #1b1f4f !important;
  color: #fff !important;
}
.login-footer :deep(.ant-dropdown-menu),
.login-footer :deep(.ant-dropdown-menu-item) {
  color: #fff !important;
  background-color: #222763 !important;
}
.login-footer :deep(.ant-btn > i),
.login-footer .ant-btn > span {
  font-size: 14px;
}
</style>
