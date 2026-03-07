// apps/docs/.vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css' // 引入自定义样式

export default {
  extends: DefaultTheme, // 继承默认主题的所有 UI
  enhanceApp({ app }) {
    // 这里可以注册全局组件，目前留空即可
  }
}