
module.exports = {
  title: '汪涵的博客',
  head: [ // 注入到当前页面的 HTML <head> 中的标签
    ['link'], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  themeConfig: {
    sidebarDepth:1,
    sidebar: [
    {
      title:'js',
      children:['/jsDoc/','/jsDoc/es6','/jsDoc/promise','/jsDoc/copy','/jsDoc/evenloop','/jsDoc/extend','/jsDoc/scope','/jsDoc/this','/jsDoc/v8Collection']
    },
    {
      title:'计算机网络',
      children:['/networkDoc/','/networkDoc/browserCache','/networkDoc/dns','/networkDoc/http','/networkDoc/https','/networkDoc/iframe','/networkDoc/origin','/networkDoc/tcp','/networkDoc/urlDesc']
    },
    {
      title:'Vue',
      children:['/vueDoc/route','/vueDoc/vue','/vueDoc/vueRouter']
    },
    {
      title:'webpack',
      children:['/webpack/devServer','/webpack/import','/webpack/loader','/webpack/package','/webpack/splitCode']
    },
    ]
  }
};