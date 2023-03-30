// index.vue页面的数据
import { $get } from '../../utils/index'
export default {
	namespaced: true,
	state: () => ({
		indexData: [],
		autoLoginToast:{}, // 自动登录的信息, 在index.vue页面通过toast显示, 自动登录成功示例:{code:1,msg:'自动登录成功'}, 失败示例:{code:0,msg:res_autologin.msg}
	}),
	mutations: {
		updateIndexData(state, data) {
			state.indexData = data
		},
		reWriteAutoLoginToast(state,obj){
			state.autoLoginToast=obj
		}
	},
	actions: {
		/**
		 * @description: 1.检查本地存储的indexData数据是否存在,2.若存在,返回这个数据 3.若不存在,向服务器发起请求
		 * @param {*} commit
		 */
		async getIndexData({ commit,dispatch }) {
			// 1.获取
			// 1.检查并获取access-token
			const accessTokenObj=await dispatch('chkAndGetToken','',{root:true}).catch(err=>err)
			let accessToken=''
			if(accessTokenObj.code===1){
				accessToken=accessTokenObj.data['access-token']
			}else{
				return {code:0,msg:'获取access-token失败'}
			}

			// 2.向服务器发起请求获取最新的indexData数据
			const res_indexData=await $get('/indexdata',{header:{'access-token':accessToken}}).catch(err=>err)
			if(res_indexData.code===1){
				commit('updateIndexData',res_indexData.data)
				return {code:1}
			}else{
				return {code:0,msg:'向服务器获取indexData数据失败'}
			}
		}
	},
	getters: {}
}
