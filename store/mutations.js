export default {
	updateToken(state, tokenObj) {
		state['access_token'] = tokenObj
	},
	updatePrevPage(state, page) {
		state.prevPage = page
	}
}
