module.exports = {
  head: {
    title: '众筹DApp',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '基于以太坊智能合约开发的众筹DApp' }
    ]
  },
  css: ['~/assets/style/reset.css', '~/assets/style/base.css', 'element-ui/lib/theme-chalk/index.css'],
  plugins: [
    {
      src: '~plugins/element-ui',
      ssr: false
    }
  ],
  loading: {
    color: '#409eff'
  },
  build: {
    extractCSS: true,
    vendor: ['element-ui']
  }
}