import { $get, $post, $delete } from './index'
// 1.请求access-token
export const reqToken = () => $get('/getToken')
// 2.请求categorys商品种类, 用于显示商品页nav导航与商品分类
export const reqCategorys = token => {
    return $get('/categorys', {
        data: {
            cityId: 110,
        },
        header: {
            'access-token': token,
        },
    })
}
// 3.根据商品分类bid与page请求具体的商品数据
export const reqGoods = (bid, page, token, cityId = 110) =>
    $get('/foods', {
        data: {
            bid,
            page: page ? page : 1,
            cityId: cityId ? cityId : 110,
        },
        header: {
            'access-token': token,
        },
    })
// 4.请求图片验证码
export const reqImgCaptcha = () => $get('/captcha')

// 5.向服务器请求短信验证码
export const reqTextCode = (phone, captcha) =>
    $get('/smsverification', { data: { phone, captcha } })

// 6.注册
export const reqRegister = (phone, password, code) =>
    $post('/register', { data: { phone, password, code } })

// 7.通过手机号与密码登录
export const reqLoginByPassword = (phone, password) =>
    $post('/loginByPassword', { data: { phone, password } })

export const reqLoginBySMS = (phone, SMS) => {
    return $post('/loginByPhoneAndCapture', { data: { phone, SMS } })
}

// 8.自动登录
export const reqAutoLogin = token =>
    $get('/autologin', {
        header: {
            authorization: token,
        },
    })

// 9.前往购物车
export const reqDetail = (id, token) =>
    $get('/detail', {
        data: { id },
        header: {
            'access-token': token,
        },
    })

// 10.获取评论
export const reqComment = (twoId, page, token) =>
    $get('/comment', {
        data: { twoId, page },
        header: {
            'access-token': token,
        },
    })

// 11.获取推荐
export const reqRecommand = (token, cityId) =>
    $get('/recommand', {
        data: { cityId },
        header: {
            'access-token': token,
        },
    })
export const reqAddShopCart = (userId, goodId, count, accessToken) => {
    let date = getNow()
    return $post('/addshopcart', {
        data: {
            userId,
            goodId,
            count,
            date,
        },
        header: {
            'access-token': accessToken,
        },
    })
}

export const reqGetShopCartData = (userId, accessToken) =>
    $get('/getshopcartdata', {
        data: { userId },
        header: { 'access-token': accessToken },
    })

export const reqModifyShopCart = (type, userId, goodId, count) => {
    let date = getNow()
    return $get('/modifyshopcart', {
        data: { type, userId, goodId, count, date },
    })
}

export const reqDelShopCartItem = (userId, goodId) =>
    $get('/deleteshopcart', { data: { userId, goodId } })

// 请求购物车页面的加购数据列表
export const reqAddMore = accessToken =>
    $get('/shopcartmore', { header: { 'access-token': accessToken } })
// 修改购物车页面的指定商品
export const reqModifyShopCartGoods = (userId, oldGoodsId, newGoodsId, count, accessToken) => {
    let date = getNow()
    return $post('/modifyshopcart', {
        data: { userId, oldGoodsId, newGoodsId, count, date },
        header: { 'access-token': accessToken },
    })
}
export const reqModifyShopCartGoodsCandleOrMsg = data => {
    return $post('/modifyshopcartgoodscandleormsg', data)
}

export const reqModifyShopCartOther = ({ userId, goodsId, ...rest }) => {
    console.log(
        '%c 服务器请求:向/modifyshopcartother发起请求,请求参数如下:',
        'color:white;background-color:black;padding:2px 4px'
    )
    console.log({ userId, goodsId, ...rest })

    return $post('/modifyshopcartother', { data: { userId, goodsId, ...rest } })
}

export const reqSearchAddress = obj => {
    return $get('/addressSearch', { data: obj })
}

export const reqStoreAddress = obj => {
    return $post('/storeAddress', { data: obj })
}

export const reqGetAllAddress = userId => {
    return $get('/getAllAddress', { data: { userId } })
}

export const reqGetAllPayWay = accessToken => {
    return $get('/getAllPayWay', { header: { 'access-token': accessToken } })
}

export const reqModifyAddress = obj => {
    return $post('/modifyAddress', { data: { ...obj } })
}

export const delAddress = val => {
    return $delete(`/deleteAddress/${val}`)
}

// 获取当前的时间
function getNow() {
    const d = new Date()
    let date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
        2,
        '0'
    )}:${String(d.getSeconds()).padStart(2, '0')}`
    return date
}
