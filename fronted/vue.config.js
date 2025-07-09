const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,  // 生产环境不生成 source map
  publicPath: './',  // 使用相对路径
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
      }
    }
  },
  css: {
    extract: true,  // 是否提取 CSS 到单独的文件
    sourceMap: false,  // 生产环境不生成 CSS source map
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/variables.scss";`  // 全局 SASS 变量
      }
    }
  }
})
