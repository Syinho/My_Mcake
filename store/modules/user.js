/**
 * @description: 保存用户登录信息
 */
import { $getStorage, $removeStorage } from 'utils'
import { reqAutoLogin } from 'utils/api'
import Vue from 'vue'
export default {
    namespaced: true,
    state: () => ({
        isLogin: false, // 标识是否登录,默认false
        message: '', // 如果登录出错, 那么这里保存登录错误信息
        loginWay: '', // 登录方式
        avatar: '', // 头像数据
        userName: '', // 用户名
        userId: '', // 用户id
        phone: '', // 手机号
        address: [], // 用户地址
        beUsedAddress: {}, // 被使用的地址, 只有在添加地址的页面里, 点击"添加并使用按钮"后, 才存在这个地址. 在存在这个值时, 优先在订单页显示这个值, 不存在则在订单页显示默认值
        modifiedAddress: {}, // 被修改的地址,只有点击addressCard.vue页面的修改按钮才允许对这个数据进行改写
        filterAddresses: [], // 搜索过滤后的地址
    }),
    mutations: {
        updatePhone(state, phoneNum) {
            state.phone = phoneNum
        },
        updateIsLogin(state, valid) {
            state.isLogin = valid
        },
        updateUserId(state, id) {
            state.userId = id
        },
        updateMessage(state, msg) {
            state.message = msg
        },
        updateLoginWay(state, way) {
            state.loginWay = way
        },
        updateAvatar(state, src) {
            state.avatar = src
        },
        updateUserName(state, uname) {
            state.userName = uname
        },
        reWriteAddress(state, addressArr) {
            state.address = addressArr
        },
        modifyAddressItem(state, props) {
            const { index, payload } = props
            for (const prop in payload) {
                Vue.set(state.address[Number(index)], prop, payload[prop])
                console.log(
                    '%c vuex:/moudle/user.js:触发modifyAddressItem函数' +
                        `给address.${index}修改属性${prop}, 修改后的数据如下`,
                    'color:white;background-color:black;padding:2px 4px;'
                )
                console.log(payload[prop])
            }
        },
        delAddressItem(state, address) {
            let index = state.address.indexOf(address)
            state.address.splice(index, 1)
        },
        reWriteBeUsedAddress(state, value) {
            state.beUsedAddress = value
        },
        reWriteModifiedAddress(state, address) {
            state.modifiedAddress = address
        },
        rewriteFilterAddress(state, arr) {
            state.filterAddresses = arr
        },
    },
    actions: {
        //  登录失败,清空登录信息,并保存来自服务器的登录错误信息
        clearLoginInfo({ commit }, msg) {
            commit('updatePhone', '')
            // commit('updateToken', '')
            commit('updateUserId', '')
            commit('updateLoginWay', '')
            commit('updateAvatar', '')
            commit('updateUserName', '')
            commit('updateIsLogin', false)
            commit('updateMessage', msg)
        },
        loginAndStorageUserData({ commit }, obj) {
            const { phone, id, avatar, username, type } = obj
            commit('updatePhone', phone)
            commit('updateUserId', id)
            commit('updateLoginWay', type)
            commit('updateAvatar', avatar ? avatar : '')
            commit('updateUserName', username ? username : '')
            commit('updateIsLogin', true)
            commit('updateMessage', '')
        },
        // 自动登录
        async autoLogin({ dispatch }) {
            // 1.检查本地是有token这个值
            const res_token = await $getStorage('token').catch(err => err)
            console.log(
                '%c vuex:modules/user:执行autoLogin逻辑:查找本地token值,找到如下值:',
                'padding:5px 2px;color:white;background-color:black;'
            )
            console.log(res_token)
            // 2.本地存在token并获取成功
            if (res_token.code === 1) {
                // 3.向服务器发起登录请求
                const token = res_token.data
                const res_autoLogin = await reqAutoLogin(token).catch(err => err)
                // 4.判断登录结果, 登录成功
                if (res_autoLogin.code === 1) {
                    // 5.保存登录结果到本地
                    const { id, phone, username, token, avatar } = res_autoLogin.data
                    dispatch('loginAndStorageUserData', {
                        id,
                        phone,
                        username,
                        token,
                        avatar,
                        type: 'auto',
                    })
                    return { code: 1 }
                }
                // 6.登录失败
                else if (res_autoLogin.code === 0) {
                    // 7.清空vuex的所有登录信息, 并保存登录错误信息, 删除本地token
                    dispatch(
                        'clearLoginInfo',
                        res_autoLogin.msg ? res_autoLogin.msg : '自动登录失败'
                    )
                    const res_remove = await $removeStorage('token').catch(err => err)
                    if (res_remove.code === 1) {
                        // 不做处理
                    } else {
                        console.error('user.js:删除本地token出现错误')
                    }
                    return { code: 0, msg: res_autoLogin.msg ? res_autoLogin.msg : '自动登录失败' }
                }
                // 8.程序错误
                else {
                    // 9.返回登录错误信息
                    return {
                        code: 0,
                        msg: res_autoLogin.msg ? res_autoLogin.msg : 'autoLogin函数出现程序性错误',
                    }
                }
            }
            // 10.不存在token
            else if (res_token.code === 0) {
                return { code: 0 }
            }
            // 11.获取本地token失败
            else {
                return { code: 0, msg: '获取本地token失败' }
            }
        },
        // 过滤地址
        searchAddress({ state,commit }, keyWord) {
            // 通过用户名, 地址,手机号进行查找
            let arr = []
            state.address.forEach((item, index) => {
                if (
                    item.uname.indexOf(keyWord) !== -1 ||
                    item.address.indexOf(keyWord) !== -1 ||
                    item.phone.indexOf(keyWord) !== -1
                ) {
                    arr.push(item)
                }
            })
            commit('rewriteFilterAddress', arr)
        },
    },
    getters: {},
}

//
