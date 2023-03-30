export default {
	namespaced: true,
	state: () => ({
		goodData: {}, // 商品数据目录
		cmtCounts: 0, // 指定商品评论数量
		cmts: [{}, {}, {}, {}, {}, {}] // 指定商品评论数组, 初始值为6个空对象
	}),
	mutations: {
		updateGoodData(state, dataObj) {
			state.goodData = dataObj
		},
		updateId(state, id) {
			state.goodData.id && (state.goodData.id = id)
		},
		updatePrice(state, price) {
			state.goodData.price && (state.goodData.price = price)
		},
		updateSize(state, size) {
			state.goodData.size && (state.goodData.size = size)
		},
		updateFittings(state, fittings) {
			state.goodData.fittings && (state.goodData.fittings = fittings)
		},
		updateComments(state, cmts) {
			state.cmts = cmts
		},
		updateCmtsCounts(state, num) {
			state.cmtCounts = num
		},
		pushComments(state, list) {
			state.cmts.push(list)
		}
	}
}
