import App from './App'
console.log('%c '+process.env.NODE_ENV,"color:red;")
// #ifndef VUE3
import Vue from 'vue'
// 引入vuex
import store from './store/index'
// 引入全局reset.scss
// import './scss/reset.scss'

// 创建全局事件总线
Vue.prototype.$bus = new Vue()

// 全局挂载uView
import uView from '@/uni_modules/uview-ui'
Vue.use(uView)

// 全局组件
import NavCustom from 'components/NavCustom/NavCustom.vue'
import HomeTitle from 'components/HomeTitle/HomeTitle.vue'
import GoodItem from 'components/GoodItem/GoodItem.vue'
import FooterTab from 'components/FooterTab/FooterTab.vue'
Vue.component('nav-custom', NavCustom)
Vue.component('home-title', HomeTitle)
Vue.component('good-item', GoodItem)
Vue.component('footer-tab', FooterTab)

// 全局挂载工具函数
import * as utils from 'utils/index.js'
for (const prop in utils) {
    Vue.prototype[prop] = utils[prop]
}

console.log('main.js 已将全部工具函数挂载到全局对象上')

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App,
    store,
})
app.$mount()

// 全局挂载根目录下的mutations的updatePrevPage函数
Vue.prototype.updatePrevPage = function (page) {
    this.$store.commit('updatePrevPage', page)
}

// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
    const app = createSSRApp(App)
    return {
        app,
    }
}
// #endif
