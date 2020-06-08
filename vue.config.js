module.exports = {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://api.fanyi.baidu.com/api/trans/vip/translate', //对应自己的接口
          changeOrigin: true,
          ws: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      }
    }
  };