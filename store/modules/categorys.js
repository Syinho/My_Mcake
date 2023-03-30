import { reqCategorys, reqGoods } from '../../utils/api'
export default {
	namespaced: true,
	state: () => ({
		categorys: [], // 标识当前的商品分类, 即navbar的分类
		curGoods: [], // 标识当前展示的商品数组
		bid: 0, // 标识当前正在展示的的商品
		page: 1, // 标识当前正在展示的商品的页数
		count: 0 //标识当前正在展示的商品的总数量
	}),
	mutations: {
		updateCategorys(state, arr) {
			state.categorys = arr
		},
		updateCurGoods(state, arr) {
			state.curGoods = arr
		},
		updateBid(state, value) {
			state.bid = value
		},
		updatePage(state, value) {
			state.page = value
		},
		updateCount(state, value) {
			state.count = value
		}
	},
	actions: {
		async getCategorys({ commit }, token) {
			// 1. 向服务器发起请求
			const resCategorys = await reqCategorys(token).catch(err => err)
			// 2.服务器返回数据成功, 保存数据到vuex中, 返回{code:1,data}
			console.log(resCategorys)
			if (resCategorys.code === 1) {
				const data = resCategorys.data
				commit('updateCategorys', data)
				return { code: 1, data }
			} else {
				// 3. 服务器获取数据失败, 返回{code:0}
				return { code: 0, msg: '向服务器获取种类失败' }
			}
		},

		async chkTokenAndGetCategorys({ commit, dispatch }) {
			// 1.检查并获取token
			const resToken = await dispatch('chkAndGetToken', null, { root: true })
			// 2.获取token成功, 根据获得的token向服务器发起请求
			if (resToken.code === 1) {
				const token = resToken.data['access-token']
				console.log('获取token成功:' + token)
				// 2.1. 向服务器发起请求
				// 根据获取的结果, 返回{ code: 0, msg: '向服务器获取种类失败' }或者{ code: 1, data }
				const resCategorys = await dispatch('getCategorys', token)
				console.log('get categorys')
				console.log(resCategorys)
				// 2.2获取categorys数据成功,
				if (resCategorys.code === 1) {
					// 2.2.1 储存数据到vuex
					commit('updateCategorys', resCategorys.data)
				}
				// 2.2.2 返回数据, { code: 1, data }
				// 2.3 获取categorys数据失败, 返回{ code: 0, msg: '向服务器获取种类失败' }
				// 以上合并
				return resCategorys
			} else {
				// 3.获取toekn失败, 返回{code:0,msg:'获取token失败'}
				return resToken
			}
		},
		async chkTokenAndGetGoodsByBidAndPage({ state, dispatch }) {
			// 1.检查token
			const resToken = await dispatch('chkAndGetToken', null, { root: true })
			if (resToken.code === 1) {
				// 1.2. 获取到token
				const token = resToken.data['access-token']
				// 1.3 获取bid,page数据
				const { bid, page } = state
				// 1.4 根据这些数据向服务器发送请求
				const resGoods = await reqGoods(bid, page, token).catch(err => err)
				// 1.5 根据获取到的数据做出判断
				if (resGoods.code === 1) {
					// 1.5.1 获取到数据, 返回数据 {count,list}
					return { code: 1, data: resGoods.data }
				} else {
					// 1.5.2 获取数据失败
					return { code: 0, msg: '向服务器请求商品列表失败' }
				}
			} else {
				// 3.获取token失败, 返回数据{ code: 0, msg: '从服务器获取token失败' }
				return resToken
			}
		}
	},
	getters: {}
}
