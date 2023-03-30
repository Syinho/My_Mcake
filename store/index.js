import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import state from './state' // 根级别的state
import mutations from './mutations' // 根级别的mutations
import actions from './actions'
import getters from './getters'

// 模块化
import index from './modules/index'
import categorys from './modules/categorys'
import user from './modules/user'
import detail from './modules/detail'
import shopCart from './modules/shopCart'
import profile from './modules/profile'

export default new Vuex.Store({
	state,
	mutations,
	actions,
	getters,
	modules: {
		index,
		categorys,
		user,
		detail,
		shopCart,
		profile
	}
})
