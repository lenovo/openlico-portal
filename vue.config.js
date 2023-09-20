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

const path = require('path')
const Config = require('./config')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  publicPath: './',

  outputDir: 'dist',
  assetsDir: 'static',
  indexPath: 'index.html',
  filenameHashing: true,

  css: {
    extract: !Config.isDev,
    sourceMap: Config.isDev,
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },

  configureWebpack: {
    // cheap-module-eval-source-map is faster for development
    devtool: !Config.isDev ? false : 'eval-cheap-module-source-map',

    resolve: {
      alias: {
        vue$: 'vue/dist/vue.common.js',
        jquery: 'jquery/src/jquery',
        src: path.join(__dirname, 'src'),
        static: path.join(__dirname, 'public/static'),
        assets: path.join(__dirname, 'src/assets'),
        components: path.join(__dirname, 'src/components'),
      },
    },
    plugins: [],
    optimization: {
      minimize: !Config.isDev,
      minimizer: [
        new TerserPlugin({
          cache: '.cache',
          parallel: true,
          sourceMap: true,
          terserOptions: {
            warnings: false,
            output: {
              comments: false,
            },
          },
        }),
      ],
    },
  },

  chainWebpack: config => {
    // image output config
    config.module
      .rule('images')
      .test(/\.(png|jpg|gif|svg|ico)(\?.*)?$/)
      .use('url-loader')
      .loader('file-loader')
      .loader('img-loader')
      .end()
  },

  devServer: {
    host: '0.0.0.0',
    port: Config.DEV_PORT,
    proxy: Config.proxy,
    compress: true,
    open: true,
  },
}
