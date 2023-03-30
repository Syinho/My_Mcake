// const baseUrl='http://127.0.0.1:3055'
let baseUrl=''
if (process.env.NODE_ENV === 'development') {
	console.log('开发环境');
	baseUrl=location.origin + '/api'
} else {
	console.log('生产环境');
	baseUrl='http://127.0.0.1:3055'
}
export function $get(url, data) {
    return new Promise((resolve, reject) => {
        console.log('$get', baseUrl + url)
        uni.request({
            method: 'get',
            url: baseUrl + url,
            ...data,
            success(res) {
                resolve(res.data)
            },
            fail(err) {
                reject(err)
            },
        })
    })
}

export function $post(url, data) {
    return new Promise((resolve, reject) => {
        uni.request({
            method: 'post',
            url: baseUrl + url,
            ...data,
            success(res) {
                resolve(res.data)
            },
            fail(err) {
                reject(err)
            },
        })
    })
}

export function $delete(url) {
    return new Promise((resolve, reject) => {
        uni.request({
            method: 'delete',
            url: baseUrl + url,
            success(res) {
                resolve(res.data)
            },
            fail(err) {
                reject(err)
            },
        })
    })
}

export function $asyncImgToBase64(imgUrl) {
    let cvs = document.createElement('canvas')
    if (cvs.getContext) {
        let ctx = cvs.getContext('2d')
        // 将图像绘制到ctx上
        let oImg = document.createElement('img')
        oImg.src = imgUrl
        return new Promise((resolve, reject) => {
            oImg.onload = function () {
                let { w, h } = { w: this.width, h: this.height }
                cvs.width = w
                cvs.height = h
                /* 绘制图像 */
                ctx.drawImage(this, 0, 0, w, h)
                /* 获取图像url */
                let url = cvs.toDataURL('image/png')
                resolve(url)
            }
        })
    }
}

// 对于本地储存里没有的键值, 返回{code:0}
export function $getStorage(key) {
    return new Promise((resolve, reject) => {
        let outerResolve = resolve,
            outerReject = reject
        uni.getStorage({
            key,
            success: res => {
                console.log(
                    '%c 从index.js调用$getStorage方法获取' + key + '的值',
                    'padding:5px 2px;color:white;background-color:black;'
                )
                if (res.data === undefined) {
                    console.error('$getStorage查询到的值是undefined')
                    return outerReject({ code: 0 })
                }
                outerResolve({ code: 1, data: JSON.parse(res.data) })
            },
            fail: () => {
                outerReject({ code: 0 })
            },
        })
    })
}

export function $setStorage(key, value) {
    return new Promise((resolve, reject) => {
        let outerResolve = resolve,
            outerReject = reject
        uni.setStorage({
            key,
            data: JSON.stringify(value),
            success() {
                outerResolve({ code: 1 })
            },
            fail(err) {
                outerReject({ code: 0 })
            },
        })
    })
}

export function $removeStorage(key) {
    return new Promise((resolve, reject) => {
        uni.removeStorage({
            key,
            success() {
                resolve({ code: 1 })
            },
            fail() {
                reject({ code: 0 })
            },
        })
    })
}

export function $throttle(fn, toast) {
    console.log('throttle')
    let canRun = true // 通过闭包保存一个标记
    return function () {
        // 在函数开头判断标记是否为true，不为true则return
        if (!canRun) {
            toast.show({
                type: 'error',
                message: '调用过于频繁',
            })
            return
        }
        // 立即设置为false
        canRun = false
        // 将外部传入的函数的执行放在setTimeout中
        setTimeout(() => {
            // 最后在setTimeout执行完毕后再把标记设置为true(关键)表示可以执行下一次循环了。
            // 当定时器没有执行的时候标记永远是false，在开头被return掉
            fn.apply(this, arguments)
            canRun = true
        }, 500)
    }
}

export function $toast(type, message, fn) {
    type = type === 'error' ? 'error' : type
    this.$refs.uToast.show({
        type,
        message,
        complete() {
            fn && fn.call(this)
        },
    })
}

export function $notify(type, message, rest) {
    this.$refs.uNotify.show({
        type: type ? type : 'success',
        message,
        duration: 1000 * 3,
        fontSize: '30rpx',
        safeAreaInsetTop: true,
        top: '120rpx',
        ...rest,
    })
}

export function $deepClone(obj) {
    if (obj === null) return null
    if (obj.constructor !== 'object') return obj
    if (obj.constructor === Date) return new Date(obj)
    if (obj.constructor === RegExp) return new RegExp(obj)
    var newObj = new obj.constructor() //保持继承的原型
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var val = obj[key]
            newObj[key] = typeof val === 'object' ? arguments.callee(val) : val
        }
    }
    return newObj
}
// 获取当前的路由地址
export function $getCurPath() {
    let routes = getCurrentPages() // 获取当前路由数组
    let curRoute = String(routes[routes.length - 1].route)
    let path = curRoute.slice(curRoute.lastIndexOf('/') + 1)
    return path
}

// 跳转页面, 并记录上一个页面
export function $switchPage(payload) {
    let { pageName, options, callback } = payload
    console.log(pageName)
    let curPath = $getCurPath()
    console.log('curPath:' + curPath)
    this.updatePrevPage(curPath)

    let tabBar = ['Index', 'Profile', 'Categorys', 'ShopCart']
    if (tabBar.indexOf(pageName) === -1) {
        console.log(`/pages/${pageName}/${pageName}` + (options ? '?' + options : ''))
        uni.navigateTo({
            url: `/pages/${pageName}/${pageName}` + (options ? '?' + options : ''),
            complete: callback ? callback : null,
        })
    } else {
        // options格式应该是key1=val1&key2=val2
        uni.switchTab({
            url: `/pages/${pageName}/${pageName}`,
            complete: callback ? callback : null,
        })
    }
}

export function $debounce(fn, delay) {
    let timer = null
    return function (...args) {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        timer = setTimeout(function () {
            fn.call(this, ...args)
            clearTimeout(timer)
            timer = null
        }, delay)
    }
}
