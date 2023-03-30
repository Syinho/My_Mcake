export default {
	namespaced: true,
	state: () => ({
		isShowLoginSuccessToast: false, // 标识profile页面是否显示登录成功提示, 这个标识只有在login.vue中登录成功后跳转profile.vue页面时才允许修改为true, 且一旦toast后立刻修改为false
		isShowRegisterSuccessToast:false // 标识profile是否显示注册成功提示
	}),
	mutations: {
		toggleLoginSuccessToast(state, valid) {
			state.isShowLoginSuccessToast = valid
		},
		toggleRegisterSuccessToast(state,valid){
			state.isShowRegisterSuccessToast=valid
		}
	},
	actions: {},
	getters: {}
}
