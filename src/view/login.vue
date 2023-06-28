<template>
  <div class="login-wrapper">
    <div class="login-action-wrapper">
      <div class="login-logo-input">
        <div class="login-logo">
          <img src="static/img/brand/login_logo.png" :alt="$t('Login.Lico.Logo')" />
        </div>
      </div>
      <div class="login-container" @keyup.enter="login('loginForm')">
        <a-form-model ref="loginForm" :model="loginForm" :rules="loginRules" layout="vertical" auto-complete="off">
          <a-form-model-item
            :label="$t('Login.Username')"
            prop="username"
            class="login-input"
            style="text-align: center">
            <a-input
              id="Login_Username"
              ref="username"
              v-model="loginForm.username"
              v-focus
              type="text"
              auto-complete="off"
              :disabled="loading"
              :placeholder="$t('Login.Username.Placeholder')"
              :title="$t('Login.Username')" />
          </a-form-model-item>
          <a-form-model-item
            :label="$t('Login.Password')"
            prop="password"
            class="login-input"
            style="text-align: center">
            <a-input
              id="Login_Password"
              v-model="loginForm.password"
              type="password"
              auto-complete="off"
              :disabled="loading"
              :placeholder="$t('Login.Password.Placeholder')"
              :title="$t('Login.Password')" />
          </a-form-model-item>
          <a-form-model-item style="text-align: center; margin-bottom: 0px">
            <a-button
              id="Login_Submit"
              class="login-submit"
              type="primary"
              :loading="loading"
              style="background-color: #3c5093; border-color: #3c5093"
              @click="login('loginForm')">
              {{ $t('Login.Submit') }}
            </a-button>
          </a-form-model-item>
        </a-form-model>
      </div>
      <div class="login-footer">
        <a-dropdown overlay-class-name="lang-menu">
          <a-menu slot="overlay" @click="setLangCode">
            <a-menu-item v-for="langType of langTypes" :id="'Lang_' + langType.code" :key="langType.code">
              {{ langType.type }}
            </a-menu-item>
          </a-menu>
          <a-button class="lang-menu-button">
            {{ getLangType }}
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import AuthService from '../service/auth'
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
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('Login.Username.Valid.Null')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('Login.Password.Valid.Null')))
      } else {
        callback()
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
      langTypes: [
        { type: 'English', code: 'en' },
        { type: '中文', code: 'zh' },
      ],
      logo: 'logo_login.png',
    }
  },
  computed: {
    getLangType() {
      for (const i in this.langTypes) {
        if (this.$i18n.locale === this.langTypes[i].code) {
          return this.langTypes[i].type
        }
      }
      return 'en'
    },
  },
  mounted() {
    this.checkLogin()
    // AuthService.checkRegisterType().then(res => {
    //     this.allow_registration = res.allow_registration;
    // });
  },
  methods: {
    setLangCode(e) {
      this.$store.dispatch('settings/setLangCode', e.key)
      window.gApp.$i18n.locale = e.key
      this.$refs.loginForm.validate(valid => {})
    },
    login(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
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
        } else {
          return false
        }
      })
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
    toRegister() {
      this.$router.push('/register')
    },
  },
}
</script>
<style lang="less" scoped>
.login-wrapper {
  width: 100%;
  height: 100%;
  background-color: #1b1f4f;
  display: flex;
  color: #fff;
  justify-content: center;
  .login-action-wrapper {
    min-width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    .login-logo-input {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      .login-logo {
        margin-top: 61px;
        display: flex;
        align-items: center;
      }
    }
    .login-container {
      flex-grow: 2;
      /deep/ label {
        color: #fff !important;
      }
      /deep/ input {
        height: 40px;
        background-color: #1b1f4f !important;
        color: #fff !important;
      }
      /deep/ input:-webkit-autofill {
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
    }
    .login-footer {
      text-align: center;
      padding-bottom: 10px;
      .lang-menu-button {
        width: 130px;
        height: 40px;
        margin-bottom: 50px;
        background-color: #1b1f4f !important;
        color: #fff !important;
      }
      /deep/ .ant-dropdown-menu,
      .ant-dropdown-menu-item {
        color: #fff !important;
        background-color: #222763 !important;
      }
      /deep/ .ant-btn > i,
      .ant-btn > span {
        font-size: 14px;
      }
    }
  }
}
</style>
