/*
 * Copyright 2015-present Lenovo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'
// import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import topLevelAwait from 'vite-plugin-top-level-await'

import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

/* eslint-env node */
const Config = require('./config')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    publicDir: 'public',
    plugins: [
      vue(),
      Components({
        dts: false,
        resolvers: [
          AntDesignVueResolver({
            resolveIcons: true,
            importStyle: '',
          }),
        ],
      }),
      visualizer({
        emitFile: false,
        gzipSize: true,
        filename: `build.report_${new Date().getTime()}.html`,
        open: true,
      }),
      topLevelAwait(),
      // viteCompression({
      //   disable: false,
      //   threshold: 10240,
      //   // minRatio: 0.8,
      //   algorithm: 'gzip', // ['gzip'，' brotliccompress '，'deflate '，'deflateRaw']
      //   deleteOriginFile: true,
      // }),
    ],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'static/': fileURLToPath(new URL('./public/static/', import.meta.url)),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-browser.prod.js',
      },
    },
    build: {
      sourcemap: Config.DEV,
      assetsDir: 'static',
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          compact: true,
          chunkFileNames: 'js/[hash].js',
          entryFileNames: 'js/[hash].js',
          assetFileNames: 'assets/[ext]/[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('echarts')) {
                return id.toString().split('echarts/')[1].split('/')[0].toString()
              }
              if (id.includes('@ant-design')) {
                return id.toString().split('@ant-design/')[1].split('/')[0].toString()
              }
            }
            return false
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: loadEnv(mode, './').VITE_DEV_PORT,
      proxy: Config.proxy,
      open: true,
    },
  }
})
