const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 项目部署的基本路径
  publicPath: './',
})
