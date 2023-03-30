import { $getStorage, $setStorage } from '../utils/index'
import { reqToken } from '../utils/api'
export default {
    async chkToken({ state, commit }) {
        // 1.检查本地token是否存在
        const resToken = await $getStorage('access_token').catch(err => err)
        // 2.token存在, 检查是否过期
        if (resToken.code === 1) {
            const { timeout } = resToken.data
            console.log('本地存在access-token')
            // 3.未过期,返回true
            if (timeout - Date.now() > 0) {
                // 4.检查vuex是否有这个值, 没有就保存进去
                let storeToken = state['access_token']
                if (storeToken !== resToken.data) {
                    commit('updateToken', resToken.data)
                }
                return { code: 1, data: resToken.data }
            }
            // 5.本地access-token过期, 需要重新请求token
            else {
                // 6.清空vuex中的access_token数据
                commit('updateToken', {})
                return { code: 0, msg: 'token过期' }
            }
        }
        // 7.本地不存在access-token
        else {
            console.log('本地不存在access-token')
            return { code: 0, msg: '本地不存在token' }
        }
    },

    /**
     * @description: 向服务器发起请求, 请求access-token, 处理数据后储存在本地
     * @param {*} commit
     */
    async getToken({ commit }) {
        // 1.向服务器发起请求
        const result = await reqToken().catch(err => err)
        // 2.如果得到access-token
        if (result.code === 1) {
            let localData = {
                'access-token': result.data['access_token'],
                timeout: Date.now() + result.data['expires_in'] * 1000,
            }
            // 3.处理数据后将数据保存在vuex中
            commit('updateToken', localData)
            // 4.将数据保存在本地, 成功返回{code:1,data}, 否则返回{code:0}
            const res_setStorage = await $setStorage(
                'access_token',
                localData
            ).catch(err => err)
            if (res_setStorage.code === 1) {
                return { code: 1, data: localData }
            } else {
                return { code: 0, message: '储存access-token出错' }
            }
        } else {
            // 3.从服务器获取token失败,返回{code:0}
            return { code: 0, msg: '从服务器获取token失败' }
        }
    },
    /**
     * @description: 1.检查本地token是否存在 2.存在, 检查过期?重新请求:返回数据; 不存在: 重新请求并返回数据
     * @param {*} state
     * @param {*} dispatch
     */
    async chkAndGetToken({ dispatch }) {
        // 1.检查是否需要重新请求token
        let resChkToken = await dispatch('chkToken').catch(err => err)
        // 2.不需要重新请求, 直接返回{code:1,data:token对象}
        if (resChkToken.code === 1) {
            return resChkToken
        } else {
            // 3.重新请求token
            const resToken = await dispatch('getToken').catch(err => err)
            return resToken
        }
    },

    
  
}
