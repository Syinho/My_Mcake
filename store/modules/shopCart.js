import { reqGetShopCartData, reqAddMore, reqRecommand } from '../../utils/api'
import Vue from 'vue'
export default {
    namespaced: true,
    state: () => ({
        recommand: [], // 推荐商品
        cartList: [], // 购物车内的商品信息
        addMoreList: [], // 加购商品列表
        isShowLoginToast:true // 标识shopCart页面是否提示登录, 每个程序周期指提醒一次
    }),
    getters:{
        orderList(state){
            let arr=[]
            for(let i=0;i<state.cartList.length;i++){
                let goods=state.cartList[i]
                if(goods.isChecked===1){
                    arr.push(goods)
                }
            }
            return arr
        }
    },
    mutations: {
        updateRecommand(state, arr) {
            state.recommand = arr
        },
        reWriteCartList(state, arr) {
            state.cartList = arr ? arr : []
        },
        // 更新cartlist数组内的指定某个对象
        updateCartListItem(state, props) {
            const { index, payload } = props
            for (const prop in { ...payload }) {
                // 检测cartList对象不存在该属性, 或存在但值与传入对象的值不同, 且该属性是传入对象的自有属性, 那么将该属性与属性值赋值给对应的cartList对象
                if (Object.prototype.hasOwnProperty.call(payload, prop)) {
                    Vue.set(state.cartList[Number(index)], prop, payload[prop])
                    console.log('%c vuex:/moudle/shopcart.js:触发updateCartListItem函数'+`给cartList.${index}添加修改属性${prop}, 修改后的数据如下`,"color:white;background-color:black;padding:2px 4px;")
                    console.log(state.cartList[Number(index)])
                }
            }
            Vue.set(state.cartList, index, {
                ...state.cartList[index],
                ...payload,
            })
           
        },
        // 删除cartlist数组内的某个指定对象
        deleteCartListItem(state, index) {
            state.cartList.splice(Number(index), 1)
        },
        reWriteAddMore(state, arr) {
            state.addMoreList = arr
        },
        reWriteIsShowLoginToast(state,val){
            state.isShowLoginToast=val
        }
    },
    actions: {
        // 向服务器获取购物车数据, 并保存到cartList中
        async getShopCart({ commit, dispatch, rootState }) {
            // 1.获取access-token
            const res_accessToken = await dispatch('chkAndGetToken', null, {
                root: true,
            }).catch(err => err)
            let accessToken = ''
            if (res_accessToken.code === 1) {
                accessToken = res_accessToken.data['access-token']
            } else {
                return { code: 0, msg: '获取access-token失败' }
            }
            // 2.获取id
            const userId = rootState['user'].userId
            // 3.通过access-token与id发起请求购物车
            const res_shopCart = await reqGetShopCartData(userId, accessToken).catch(err => err)
            // 4.获取购物车数据成功
            console.log('%c vuex:modules/shopCart:调用getShopCart向服务器发起请求, 获取到购物车数据如下:','padding:5px 2px;color:white;background-color:black;')
            console.log(res_shopCart)
            if (res_shopCart.code === 1) {
                const { data } = res_shopCart
                commit('shopCart/reWriteCartList', data, { root: true })
                return res_shopCart
            }
            // 5.获取购物车数据失败
            else {
                return res_shopCart
            }
        },
        // 向服务器获取加购商品
        async getAddMore({ commit, dispatch, rootState }) {
            // 检查vuex中的加购数据长度是否为0
            const addMoreList = rootState['shopCart'].addMoreList
            if (addMoreList.length === 0) {
                // 向服务器发起请求获取accessToken
                const res_accessToken = await dispatch('chkAndGetToken', null, {
                    root: true,
                }).catch(err => err)
                // 获取accessToken成功
                if (res_accessToken.code === 1) {
                    let { data } = res_accessToken
                    const accessToken = data['access-token']
                    // 向服务器发起请求获取加购商品
                    const res_addMore = await reqAddMore(accessToken).catch(err => err)
                    // 获取加购商品成功
                    if (res_addMore.code === 1) {
                        const { list } = res_addMore.data
                        commit('reWriteAddMore', list)
                        return { code: 1 }
                    }
                    // 获取加购商品失败
                    else {
                        return { code: 0, msg: '获取加购商品失败' }
                    }
                }
                // 获取accessToken失败
                else {
                    return { code: 0, msg: '获取access-token失败' }
                }
            } else {
                return { code: 1 }
            }
        },
        // 向服务器请求推荐商品(当购物车数据长度为0时)
        async getRecommand({ commit, dispatch, rootState }) {
            // 检查vuex中推荐数据列表是否为0
            const recommandList = rootState['shopCart'].recommand
            if (recommandList.length === 0) {
                // 向服务器发起请求获取accessToken
                const res_accessToken = await dispatch('chkAndGetToken', null, {
                    root: true,
                }).catch(err => err)
                // 获取accessToken成功
                if (res_accessToken.code === 1) {
                    const accessToken = res_accessToken.data['access-token']

                    // 向服务器发起请求推荐数据
                    const recommandObj = await reqRecommand(accessToken, 110).catch(err => err)
                    // 响应成功, 保存数据
                    if (recommandObj.code === 1) {
                        commit('updateRecommand', recommandObj.data)
                        return { code: 1 }
                    } else {
                        return {
                            code: 0,
                            msg: recommandObj.msg || '服务器响应推荐数据失败',
                        }
                    }
                }
                // 获取accessToken失败
                else {
                    return { code: 0, msg: '服务器获取accessToken失败' }
                }
            } else {
                return { code: 1 }
            }
        },
        // 初始化购物车
        async initShopCart({state, dispatch, rootState }) {
            // 1.判断是否登录
            const { isLogin } = rootState['user']
            // 2.登录成功, 向服务器请求cartList数据
            if (isLogin) {
                // 4.不检查cartlist数据, 直接向服务器请求最新的数据
                const res_cartList = await dispatch('getShopCart').catch(err => err)
                // 5.cartList数据请求成功
                if (res_cartList.code === 1) {
                    // 7.检查cartList数据长度, 大于0请求加购数据, 等于0请求推荐数据
                    if (res_cartList.data.length > 0) {
                        // 检查加购数据是否为空数组
                        if (state.addMoreList.length === 0) {
                            const res_addMore = await dispatch('getAddMore').catch(err => err)
                            if (res_addMore.code === 1) {
                                console.log('加购数据请求成功')
                                return { code: 1 }
                            } else {
                                console.log('加购数据请求失败')
                                return {
                                    code: 0,
                                    msg: res_addMore.msg || '请求加购数据失败',
                                }
                            }
                        } else {
                            return { code: 1 }
                        }
                    }
                    // 8.等于0, 请求推荐数据
                    else {
                        // 检查推荐数据是否为0
                        if (state.recommand.length === 0) {
                            const res_recommand = await dispatch('getRecommand').catch(err => err)
                            if (res_recommand.code === 1) {
                                console.log('推荐数据请求成功')
                                return { code: 1 }
                            } else {
                                return {
                                    code: 0,
                                    msg: res_recommand.msg || '请求推荐商品数据失败',
                                }
                            }
                        } else {
                            return { code: 1 }
                        }
                    }
                }
                // 6.请求cartList数据失败, 请求推荐数据
                else {
                    // 检查推荐数据是否为0
                    if (state.recommand.length === 0) {
                        const res_recommand = await dispatch('getRecommand').catch(err => err)
                        if (res_recommand.code === 1) {
                            console.log('推荐数据请求成功')
                            return { code: 0, msg: '请求购物车数据失败' }
                        } else {
                            return {
                                code: 0,
                                msg: res_recommand.msg || '请求推荐商品数据失败',
                            }
                        }
                    } else {
                        return { code: 1 }
                    }
                }
            }
            // 3.未登录
            else {
                console.log('未登录')
                // 请求推荐数据
                if (state.recommand.length === 0) {
                    const res_recommand = await dispatch('getRecommand').catch(err => err)
                    if (res_recommand.code === 0) {
                        return { code: 0, msg: '未登录, 且向服务器请求推荐商品列表失败' }
                    }
                }
                return { code: 0, msg: '未登录' }
            }
        },
    },
}
